import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, readdirSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

export const SOURCE_REF = 'zztiestaqjbsbjuzmbqp';
export const SOURCE_URL = `https://${SOURCE_REF}.supabase.co`;
const MAGIC = Buffer.from('DAWATBK1');
const CAP = 256 * 1024 * 1024;
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const quote = (name) => '"' + name.replaceAll('"', '""') + '"';
export function policyRoles(value) {
  const roles = Array.isArray(value) ? value : pg.types.getTypeParser(1009)(value);
  if (!Array.isArray(roles) || !roles.length || roles.some((r) => typeof r !== 'string' || !r))
    throw Error('Invalid Storage policy roles.');
  return roles.map(quote).join(',');
}
export function seal(bytes, key, name) {
  if (key.length !== 32) throw Error('Invalid recovery key.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(name));
  const content = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), content]);
}
export function unseal(bytes, key, name) {
  if (bytes.length < 36 || !bytes.subarray(0, 8).equals(MAGIC)) throw Error('Invalid backup format.');
  const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(8, 20));
  decipher.setAAD(Buffer.from(name));
  decipher.setAuthTag(bytes.subarray(20, 36));
  return Buffer.concat([decipher.update(bytes.subarray(36)), decipher.final()]);
}
export function loadPrivate(path) {
  return parseEnv(readFileSync(resolve(path), 'utf8').replace(/^\uFEFF/, ''));
}
export function sourceConnection(env) {
  if (
    env.DAWAT_DB_HOST !== 'aws-0-ap-south-1.pooler.supabase.com' ||
    env.DAWAT_DB_USER !== `postgres.${SOURCE_REF}` ||
    env.DAWAT_DB_PORT !== '5432' ||
    env.DAWAT_DB_NAME !== 'postgres' ||
    !env.DAWAT_DB_PASSWORD
  )
    throw Error('Backup source configuration unavailable.');
  return {
    host: env.DAWAT_DB_HOST,
    port: 5432,
    user: env.DAWAT_DB_USER,
    password: env.DAWAT_DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: true, ca: readFileSync('recovery/supabase-ca.crt', 'utf8') },
    connectionTimeoutMillis: 15000,
    query_timeout: 60000,
  };
}
export function assertDrillTarget(config) {
  if (
    config.container !== 'supabase_db_dawat-recovery' ||
    config.url !== 'http://127.0.0.1:55321' ||
    config.databaseHost !== '127.0.0.1' ||
    config.databasePort !== 55322
  )
    throw Error('Restore only accepts the isolated loopback recovery target.');
}
export function assertChild(root, child) {
  const rel = relative(resolve(root), resolve(child));
  if (!rel || rel.startsWith('..') || resolve(child) === resolve(root)) throw Error('Unsafe backup path.');
}
export function command(file, args, { env = {}, input, timeout = 180000 } = {}) {
  return new Promise((yes, no) => {
    const child = spawn(file, args, {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const chunks = [];
    let size = 0;
    let stderr = '';
    const timer = setTimeout(() => child.kill(), timeout);
    child.stdout.on('data', (b) => {
      size += b.length;
      if (size > CAP) child.kill();
      else chunks.push(b);
    });
    child.stderr.on('data', (b) => {
      if (stderr.length < 20000) stderr += b;
    });
    child.on('error', () => {
      clearTimeout(timer);
      no(Error('Recovery subprocess unavailable.'));
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      // Never forward pg_dump/psql output: it can contain table contents or credentials.
      if (code !== 0 || size > CAP)
        no(
          Object.assign(Error('Recovery subprocess failed; no backup marked complete.'), {
            diagnostic: stderr,
          }),
        );
      else yes(Buffer.concat(chunks));
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
export async function tableInventory(client) {
  const { rows } = await client.query(`select n.nspname as schema,c.relname as name from pg_class c
    join pg_namespace n on n.oid=c.relnamespace where c.relkind='r'
    and n.nspname in ('public','private','auth','supabase_migrations')
    and not (n.nspname='auth' and c.relname='schema_migrations') order by 1,2`);
  const tables = [];
  for (const row of rows) {
    const table = `${quote(row.schema)}.${quote(row.name)}`;
    const result = await client.query(
      `select count(*)::text count, coalesce(sum(hashtextextended(to_jsonb(t)::text,0)::numeric),0)::text checksum from ${table} t`,
    );
    tables.push({ ...row, ...result.rows[0] });
  }
  return tables;
}
export async function backup({ recoveryEnv, deploymentEnv }) {
  const started = Date.now();
  const env = loadPrivate(recoveryEnv);
  const deployment = loadPrivate(deploymentEnv);
  if (deployment.NEXT_PUBLIC_SUPABASE_URL !== SOURCE_URL || !deployment.SUPABASE_MEDIA_SECRET_KEY)
    throw Error('Wrong deployment configuration.');
  const ring = JSON.parse(deployment.GUEST_LINK_KEYS ?? '{}');
  if (
    !ring[deployment.GUEST_LINK_KEY_ID] ||
    Object.values(ring).some((k) => Buffer.from(k, 'base64').length !== 32)
  )
    throw Error('Incomplete guest key ring.');
  const root = resolve(env.DAWAT_BACKUP_DIRECTORY ?? '');
  const keyPath = resolve(env.DAWAT_BACKUP_KEY_FILE ?? '');
  if (!env.DAWAT_BACKUP_DIRECTORY || !env.DAWAT_BACKUP_KEY_FILE || keyPath.startsWith(root))
    throw Error('Separate backup and key locations required.');
  mkdirSync(root, { recursive: true, mode: 0o700 });
  mkdirSync(resolve(keyPath, '..'), { recursive: true, mode: 0o700 });
  if (!existsSync(keyPath)) writeFileSync(keyPath, randomBytes(32), { flag: 'wx', mode: 0o600 });
  const key = readFileSync(keyPath);
  if (key.length !== 32) throw Error('Recovery key must contain32 bytes.');
  const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomBytes(4).toString('hex');
  const pending = join(root, id + '.partial');
  mkdirSync(pending, { mode: 0o700 });
  const entries = [];
  function add(name, bytes, detail = {}) {
    const filename = `${String(entries.length).padStart(5, '0')}.bin`;
    writeFileSync(join(pending, filename), seal(bytes, key, filename), { flag: 'wx', mode: 0o600 });
    entries.push({ name, filename, bytes: bytes.length, sha256: hash(bytes), ...detail });
  }
  const client = new pg.Client(sourceConnection(env));
  try {
    await client.connect();
    await client.query('begin isolation level repeatable read read only');
    const snapshot = (await client.query('select pg_export_snapshot() snapshot')).rows[0].snapshot;
    const inventory = await tableInventory(client);
    const vault = await client.query('select count(*)::int n from vault.secrets');
    const mfa = await client.query('select count(*)::int n from auth.mfa_factors');
    if (vault.rows[0].n || mfa.rows[0].n)
      throw Error('Encrypted platform secrets/MFA require an additional root-key recovery procedure.');
    const columns = (
      await client.query(`select table_schema,table_name,column_name,data_type from information_schema.columns
      where table_schema='auth' order by table_name,ordinal_position`)
    ).rows;
    const storage = (
      await client.query(`select bucket_id,name,metadata from storage.objects order by bucket_id,name`)
    ).rows;
    const buckets = (
      await client.query(
        'select id,name,public,file_size_limit,allowed_mime_types from storage.buckets order by id',
      )
    ).rows;
    if (buckets.some((b) => b.id !== 'wedding-media' || b.public))
      throw Error('Unexpected/public Storage bucket; review recovery scope.');
    const policies = (
      await client.query(`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
      from pg_policies where schemaname='storage' and policyname like 'dawat_%' order by policyname`)
    ).rows;
    const references = (
      await client.query('select objects from private.media_processing where objects is not null')
    ).rows.flatMap((r) => Object.values(r.objects));
    const roles = (
      await client.query(`select rolname,rolsuper,rolbypassrls,rolcanlogin from pg_roles order by rolname`)
    ).rows;
    add('deployment.env', readFileSync(deploymentEnv));
    add(
      'migrations.json',
      Buffer.from(
        JSON.stringify(
          readdirSync('supabase/migrations')
            .sort()
            .map((name) => ({ name, sql: readFileSync(join('supabase/migrations', name), 'utf8') })),
        ),
      ),
    );
    add('roles.json', Buffer.from(JSON.stringify(roles)));
    await command('docker', [
      'cp',
      resolve('recovery/supabase-ca.crt'),
      'supabase_db_dawat-local:/tmp/dawat-backup-ca.crt',
    ]);
    const pgEnv = {
      PGHOST: env.DAWAT_DB_HOST,
      PGPORT: '5432',
      PGUSER: env.DAWAT_DB_USER,
      PGDATABASE: 'postgres',
      PGPASSWORD: env.DAWAT_DB_PASSWORD,
      PGSSLMODE: 'verify-full',
      PGSSLROOTCERT: '/tmp/dawat-backup-ca.crt',
    };
    const docker = [
      'exec',
      ...Object.keys(pgEnv).flatMap((k) => ['--env', k]),
      'supabase_db_dawat-local',
      'pg_dump',
      '--no-owner',
      '--quote-all-identifiers',
      `--snapshot=${snapshot}`,
    ];
    const schemas = ['public', 'private', 'supabase_migrations'].flatMap((s) => ['--schema', s]);
    add('schema.sql', await command('docker', [...docker, '--schema-only', ...schemas], { env: pgEnv }));
    add(
      'data.sql',
      await command(
        'docker',
        [
          ...docker,
          '--data-only',
          ...schemas,
          '--schema',
          'auth',
          '--exclude-table',
          'auth.schema_migrations',
        ],
        { env: pgEnv },
      ),
    );
    const admin = createClient(SOURCE_URL, deployment.SUPABASE_MEDIA_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(30000) }) },
    });
    let objectBytes = 0;
    const downloaded = new Map();
    if (storage.length > 20000) throw Error('Object budget exceeded.');
    for (const object of storage) {
      const result = await admin.storage.from(object.bucket_id).download(object.name);
      if (result.error) throw Error('Snapshot object could not be downloaded; backup incomplete.');
      const bytes = Buffer.from(await result.data.arrayBuffer());
      objectBytes += bytes.length;
      if (objectBytes > 1024 * 1024 * 1024) throw Error('Backup transfer budget exceeded.');
      const digest = hash(bytes);
      downloaded.set(object.name, { hash: digest, bytes: bytes.length });
      add('storage-object', bytes, {
        bucket: object.bucket_id,
        path: object.name,
        contentType: object.metadata?.mimetype ?? 'image/webp',
      });
    }
    for (const ref of references) {
      const saved = downloaded.get(ref.path);
      if (!saved || saved.hash !== ref.hash || saved.bytes !== ref.bytes)
        throw Error('Referenced photo integrity failed.');
    }
    const version = (await client.query('show server_version')).rows[0].server_version;
    const sourceRevision = (await command('git', ['rev-parse', 'HEAD'])).toString().trim();
    const manifest = {
      version: 1,
      id,
      source: SOURCE_REF,
      capturedAt: new Date(started).toISOString(),
      postgresVersion: version,
      sourceRevision,
      nodeVersion: process.version,
      entries,
      tables: inventory,
      authColumns: columns,
      buckets,
      policies,
      objectBytes,
    };
    writeFileSync(
      join(pending, 'manifest.bin'),
      seal(Buffer.from(JSON.stringify(manifest)), key, 'manifest.bin'),
      { flag: 'wx', mode: 0o600 },
    );
    verifyBackup(pending, keyPath);
    await client.query('rollback');
    const destination = join(root, id);
    renameSync(pending, destination);
    const proof = {
      id,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      tables: inventory.length,
      objects: storage.length,
      objectBytes,
      entries: entries.length,
      encrypted: true,
    };
    writeFileSync(join(destination, 'receipt.json'), JSON.stringify(proof, null, 2), { mode: 0o600 });
    return { destination, proof };
  } finally {
    await client.end().catch(() => {});
  }
}
export function verifyBackup(directory, keyPath) {
  const key = readFileSync(keyPath);
  const manifest = JSON.parse(unseal(readFileSync(join(directory, 'manifest.bin')), key, 'manifest.bin'));
  if (manifest.version !== 1 || manifest.source !== SOURCE_REF || !Array.isArray(manifest.entries))
    throw Error('Unsupported backup.');
  const seen = new Set();
  for (const entry of manifest.entries) {
    if (!/^\d{5}\.bin$/.test(entry.filename) || seen.has(entry.filename)) throw Error('Unsafe backup entry.');
    seen.add(entry.filename);
    const bytes = unseal(readFileSync(join(directory, entry.filename)), key, entry.filename);
    if (bytes.length !== entry.bytes || hash(bytes) !== entry.sha256) throw Error('Backup integrity failed.');
  }
  return {
    manifest,
    read: (entry) => unseal(readFileSync(join(directory, entry.filename)), key, entry.filename),
  };
}
