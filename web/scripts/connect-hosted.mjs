import { readFileSync, existsSync, writeFileSync, copyFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const [url, key] = process.argv.slice(2);
if (
  !/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(url ?? '') ||
  !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key ?? '')
)
  throw new Error(
    'Usage: npm run backend:connect -- https://PROJECT.supabase.co sb_publishable_PUBLIC_KEY (never a secret key).',
  );
const old = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : '';
const localUrl = old.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1]?.trim();
if (localUrl?.startsWith('https://') && localUrl !== url)
  throw new Error(
    'An existing hosted target needs explicit environment review; it has not been overwritten.',
  );
const origin = old.match(/^APP_ORIGIN=(.*)$/m)?.[1]?.trim() ?? 'http://127.0.0.1:3100';
if (old && !existsSync('.env.local.offline-backup')) copyFileSync('.env.local', '.env.local.offline-backup');
const hostedFile = '.env.hosted.local';
let encryption = existsSync(hostedFile)
  ? readFileSync(hostedFile, 'utf8')
      .split('\n')
      .filter((l) => l.startsWith('GUEST_LINK_KEY') || l.startsWith('SUPABASE_MEDIA_SECRET_KEY='))
      .join('\n')
  : '';
if (!encryption)
  encryption = `GUEST_LINK_KEY_ID=v1\nGUEST_LINK_KEYS=${JSON.stringify({ v1: randomBytes(32).toString('base64') })}`;
const config = `NEXT_PUBLIC_APP_MODE=backend\nAPP_ORIGIN=${origin}\nNEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\nAUTH_EMAIL_ENABLED=false\n${encryption}\n`;
writeFileSync(hostedFile, config);
writeFileSync('.env.local', config);
console.log(
  'Hosted configuration selected. Offline backup and independent hosted encryption keys are preserved in ignored environment files. Rebuild/restart before hosting.',
);
