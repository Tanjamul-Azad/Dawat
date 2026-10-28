// Apply reviewed migrations to the hosted Supabase database, one transaction each.
// Run `npm run backup:create` first. Usage: node scripts/release/apply-hosted-migrations.mjs --yes
// Uses the private recovery connection (TLS verified); never prints credentials or row data.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { loadPrivate, sourceConnection } from '../recovery/core.mjs';

const RELEASE = [
  '20261027120000_accept_opens_order.sql',
  '20261028090000_access_onboarding.sql',
  '20261028100000_whatsapp_delivery.sql',
  '20261028110000_open_invitation.sql',
  '20261028120000_access_simplify.sql',
  '20261028130000_guest_contact_retention.sql',
  '20261028140000_household_duplicate_indexes.sql',
];
const PREVIOUS = '20261026054200';

if (!process.argv.includes('--yes')) {
  console.log('Dry run. Re-run with --yes after a fresh `npm run backup:create`.');
}
const dir = 'supabase/migrations';
const present = new Set(readdirSync(dir));
for (const name of RELEASE) if (!present.has(name)) throw Error(`Missing migration file ${name}.`);

const client = new pg.Client(sourceConnection(loadPrivate('.env.recovery.local')));
await client.connect();
try {
  const history = (await client.query('select version, name from supabase_migrations.schema_migrations order by version'))
    .rows;
  console.log('Hosted history ends with:', history.slice(-4).map((r) => `${r.version} ${r.name ?? ''}`).join(' | '));
  const applied = new Set(history.map((r) => r.version));
  if (!applied.has(PREVIOUS)) throw Error(`Hosted history lacks ${PREVIOUS}; stopping so nothing is applied out of order.`);
  const pending = RELEASE.filter((name) => !applied.has(name.slice(0, 14)));
  console.log(pending.length ? `Pending: ${pending.join(', ')}` : 'Nothing pending.');
  if (!process.argv.includes('--yes')) process.exit(0);
  for (const name of pending) {
    // Each file wraps itself in begin/commit; unwrap so the history row lands in the same transaction.
    const sql = readFileSync(join(dir, name), 'utf8')
      .replace(/^\s*begin;\s*$/im, '')
      .replace(/^\s*commit;\s*$(?![\s\S]*^\s*commit;)/im, '');
    await client.query('begin');
    try {
      await client.query(sql);
      await client.query('insert into supabase_migrations.schema_migrations(version, name) values ($1, $2)', [
        name.slice(0, 14),
        name.slice(15, -4),
      ]);
      await client.query('commit');
      console.log(`Applied ${name}`);
    } catch (e) {
      await client.query('rollback');
      throw Object.assign(Error(`Failed on ${name}; it was rolled back and later files were not run.`), {
        detail: e.message,
      });
    }
  }
  const check = await client.query(`select
    to_regprocedure('public.record_delivery(uuid,uuid,uuid,text,integer)') is not null as delivery,
    exists(select 1 from pg_proc where proname='join_open_invitation') as open_invite,
    exists(select 1 from cron.job where jobname='dawat-guest-contact-retention') as retention`);
  console.log('Verified:', JSON.stringify(check.rows[0]));
} catch (e) {
  console.error(e.message, e.detail ? `(${e.detail})` : '');
  process.exitCode = 1;
} finally {
  await client.end();
}
