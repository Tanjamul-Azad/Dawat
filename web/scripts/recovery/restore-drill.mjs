import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { createDecipheriv } from 'node:crypto';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import {
  assertDrillTarget,
  command,
  hash,
  loadPrivate,
  quote,
  policyRoles,
  tableInventory,
  verifyBackup,
} from './core.mjs';

const target = {
  container: 'supabase_db_dawat-recovery',
  url: 'http://127.0.0.1:55321',
  databaseHost: '127.0.0.1',
  databasePort: 55322,
};
assertDrillTarget(target);
const directory = process.argv[2];
if (!directory) throw Error('Provide the encrypted backup directory.');
const env = loadPrivate('.env.recovery.local');
// Authenticate every encrypted file before making any target mutation.
const archive = verifyBackup(resolve(directory), env.DAWAT_BACKUP_KEY_FILE);
const { manifest, read } = archive;
const started = Date.now();
const status = parseEnv(
  (
    await command(process.execPath, [
      'node_modules/supabase/dist/supabase.js',
      'status',
      '--workdir',
      resolve('../.artifacts/recovery-sandbox'),
      '--output',
      'env',
    ])
  ).toString(),
);
if (status.API_URL !== target.url) throw Error('Recovery API mismatch.');
const connection = new URL(status.DB_URL);
if (connection.hostname !== target.databaseHost || Number(connection.port) !== target.databasePort)
  throw Error('Recovery database mismatch.');
const client = new pg.Client({ connectionString: status.DB_URL, connectionTimeoutMillis: 10000 });
await client.connect();
try {
  const occupied = await client.query(`select (select count(*) from auth.users)::int users,
    (select count(*) from pg_tables where schemaname in ('public','private'))::int tables`);
  if (occupied.rows[0].users || occupied.rows[0].tables)
    throw Error('Restore target is not empty. Refusing overwrite.');
  const columns = (
    await client.query(
      `select table_schema,table_name,column_name,data_type from information_schema.columns where table_schema='auth'`,
    )
  ).rows;
  for (const old of manifest.authColumns) {
    if (
      !columns.some(
        (c) =>
          c.table_name === old.table_name &&
          c.column_name === old.column_name &&
          c.data_type === old.data_type,
      )
    )
      throw Error('Recovery Auth version is incompatible with backup.');
  }
  const entry = (name) => {
    const found = manifest.entries.find((e) => e.name === name);
    if (!found) throw Error('Incomplete backup.');
    return read(found);
  };
  const sourceRoles = JSON.parse(entry('roles.json').toString());
  for (const role of sourceRoles.filter((r) =>
    ['anon', 'authenticated', 'service_role'].includes(r.rolname),
  )) {
    const r = (
      await client.query('select rolname,rolsuper,rolbypassrls,rolcanlogin from pg_roles where rolname=$1', [
        role.rolname,
      ])
    ).rows[0];
    if (!r || JSON.stringify(r) !== JSON.stringify(role))
      throw Error('Recovery API role permissions differ.');
  }
  const policies = manifest.policies
    .map((p) => {
      if (
        !['objects', 'buckets'].includes(p.tablename) ||
        !['PERMISSIVE', 'RESTRICTIVE'].includes(p.permissive) ||
        !['ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(p.cmd)
      )
        throw Error('Unsupported Storage policy.');
      return `CREATE POLICY ${quote(p.policyname)} ON storage.${quote(p.tablename)} AS ${p.permissive} FOR ${p.cmd} TO ${policyRoles(p.roles)}${p.qual ? ` USING (${p.qual})` : ''}${p.with_check ? ` WITH CHECK (${p.with_check})` : ''};`;
    })
    .join('\n');
  // Platform-owned default ACLs cannot be changed by the normal postgres restore role.
  // Keep every application/table/function grant and all postgres defaults.
  const schema = Buffer.from(
    entry('schema.sql')
      .toString()
      .split('\n')
      .filter((line) => !line.startsWith('ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" '))
      .join('\n'),
  );
  const sql = Buffer.concat([
    Buffer.from('DROP SCHEMA public CASCADE; DROP SCHEMA IF EXISTS supabase_migrations CASCADE;\n'),
    schema,
    Buffer.from('\nSET session_replication_role = replica;\n'),
    entry('data.sql'),
    Buffer.from('\nSET session_replication_role = origin;\n' + policies),
  ]);
  await command(
    'docker',
    [
      'exec',
      '-i',
      target.container,
      'psql',
      '--username',
      'postgres',
      '--dbname',
      'postgres',
      '--single-transaction',
      '--set',
      'ON_ERROR_STOP=1',
      '--quiet',
    ],
    { input: sql },
  );
  const restored = await tableInventory(client);
  if (JSON.stringify(restored) !== JSON.stringify(manifest.tables))
    throw Error('Restored database inventory/checksums differ.');
  const service = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
  const publicKey = status.ANON_KEY ?? status.PUBLISHABLE_KEY;
  if (!service || !publicKey) throw Error('Recovery API keys missing.');
  const admin = createClient(target.url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (const bucket of manifest.buckets) {
    const result = await admin.storage.createBucket(bucket.id, {
      public: false,
      fileSizeLimit: bucket.file_size_limit,
      allowedMimeTypes: bucket.allowed_mime_types,
    });
    if (result.error) throw Error('Recovery bucket creation failed.');
  }
  let objects = 0;
  for (const object of manifest.entries.filter((e) => e.name === 'storage-object')) {
    const bytes = read(object);
    const upload = await admin.storage
      .from(object.bucket)
      .upload(object.path, bytes, { contentType: object.contentType, upsert: false });
    if (upload.error) throw Error('Recovery object upload failed.');
    const result = await admin.storage.from(object.bucket).download(object.path);
    if (result.error || hash(Buffer.from(await result.data.arrayBuffer())) !== object.sha256)
      throw Error('Restored photo hash mismatch.');
    objects++;
  }
  const deployment = parseEnv(entry('deployment.env').toString());
  const ring = JSON.parse(deployment.GUEST_LINK_KEYS);
  const links = (
    await client.query('select wedding_id,household_id,digest,ciphertext,key_id from private.guest_links')
  ).rows;
  for (const link of links) {
    const parts = link.ciphertext.split('.').map((s) => Buffer.from(s, 'base64url'));
    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(ring[link.key_id], 'base64'), parts[0]);
    decipher.setAuthTag(parts[1]);
    decipher.setAAD(
      Buffer.from(`dawat:guest-link:v1:${link.wedding_id}:${link.household_id}:${link.key_id}`),
    );
    const token = Buffer.concat([decipher.update(parts[2]), decipher.final()]);
    if (hash(token) !== link.digest) throw Error('Restored guest credential cannot be recovered.');
  }
  const localConfig = {
    NEXT_PUBLIC_APP_MODE: 'backend',
    DAWAT_SURFACE: 'all',
    DAWAT_ENVIRONMENT: 'recovery',
    DAWAT_RECOVERY_QA: '1',
    APP_ORIGIN: 'http://127.0.0.1:3104',
    NEXT_PUBLIC_SUPABASE_URL: target.url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
    SUPABASE_MEDIA_SECRET_KEY: service,
    AUTH_EMAIL_ENABLED: 'true',
    GUEST_LINK_KEY_ID: deployment.GUEST_LINK_KEY_ID,
    GUEST_LINK_KEYS: deployment.GUEST_LINK_KEYS,
  };
  writeFileSync(
    '../.artifacts/recovery-sandbox/.env.restored.local',
    Object.entries(localConfig)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n'),
    { mode: 0o600 },
  );
  const proof = {
    backupId: manifest.id,
    restoredAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    tables: restored.length,
    tableCountsAndChecksumsMatch: true,
    objects,
    objectHashesMatch: true,
    recoveredLinks: links.length,
    target: target.url,
    sourceUntouched: true,
    email: 'local inbox only',
  };
  writeFileSync('../.artifacts/recovery-sandbox/restore-proof.json', JSON.stringify(proof, null, 2));
  console.log(JSON.stringify(proof));
} catch (e) {
  if (e.diagnostic)
    writeFileSync('../.artifacts/recovery-sandbox/restore-error.log', e.diagnostic, { mode: 0o600 });
  console.error(e.code ? `Restore unavailable (${e.code}).` : e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
