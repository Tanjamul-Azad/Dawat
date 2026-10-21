import { execFileSync } from 'node:child_process';
const email = process.argv[2]?.trim().toLowerCase();
const recovery = process.argv[3] === '--recovery';
if (process.argv[3] && !recovery) throw new Error('Unknown local target.');
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
  throw new Error('Usage: npm run backend:seller -- verified-email@example.com');
const literal = email.replaceAll("'", "''");
const sql = `do $$ declare uid uuid; begin
  select id into uid from auth.users where lower(email)='${literal}' and email_confirmed_at is not null;
  if uid is null then raise exception 'Sign in and verify this email first.'; end if;
  insert into public.staff_roles(user_id) values(uid) on conflict(user_id) do update set active=true;
  insert into public.audit_events(actor_id,action,reason) values(uid,'staff.bootstrap','Local development seller provisioning');
end $$;`;
// Fixed local container only. Never accepts a hosted DB URL or service-role key.
execFileSync(
  'docker',
  [
    'exec',
    '-i',
    recovery ? 'supabase_db_dawat-recovery' : 'supabase_db_dawat-local',
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '--set=ON_ERROR_STOP=1',
  ],
  { input: sql, stdio: ['pipe', 'pipe', 'pipe'] },
);
console.log(
  'Local seller role provisioned and audited. Complete authenticator verification to open seller controls.',
);
