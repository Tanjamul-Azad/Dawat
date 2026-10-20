import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const status = JSON.parse(
  execFileSync(process.execPath, ['node_modules/supabase/dist/supabase.js', 'status', '--output', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }),
);
const url = status.API_URL;
const key = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
const processorKey=status.SECRET_KEY??status.SERVICE_ROLE_KEY;
if (!url?.startsWith('http://127.0.0.1:') || !key || !processorKey)
  throw new Error('A running local Supabase stack is required.');
if (existsSync('.env.local'))
  throw new Error('.env.local already exists. Review it manually instead of overwriting it.');
writeFileSync(
  '.env.local',
  `NEXT_PUBLIC_APP_MODE=backend\nAPP_ORIGIN=http://127.0.0.1:3000\nNEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\nAUTH_EMAIL_ENABLED=true\nGUEST_LINK_KEY_ID=v1\nGUEST_LINK_KEYS=${JSON.stringify({v1:randomBytes(32).toString('base64')})}\nSUPABASE_MEDIA_SECRET_KEY=${processorKey}\n`,
  { flag: 'wx' },
);
console.log(
  'Offline public configuration, independent guest encryption keys and a server-only local media processor key written to ignored .env.local. Hosted projects are never targeted by this helper.',
);
