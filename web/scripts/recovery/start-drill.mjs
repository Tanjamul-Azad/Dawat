import { readFileSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { command } from './core.mjs';
const directory = resolve('../.artifacts/recovery-sandbox');
mkdirSync(directory + '/supabase', { recursive: true });
const source = readFileSync('supabase/config.toml', 'utf8');
const config = source
  .replace('project_id = "dawat-local"', 'project_id = "dawat-recovery"')
  .replace(/\b543(\d\d)\b/g, '553$1');
if (!config.includes('project_id = "dawat-recovery"') || config.includes('\n[auth.email.smtp]'))
  throw Error('Recovery requires its own project and local-only email.');
writeFileSync(directory + '/supabase/config.toml', config);
cpSync('supabase/templates', directory + '/supabase/templates', { recursive: true });
try {
  await command(
    process.execPath,
    [
      'node_modules/supabase/dist/supabase.js',
      'start',
      '--workdir',
      directory,
      '--exclude',
      'studio,imgproxy,logflare,vector,realtime',
    ],
    { timeout: 240000 },
  );
  console.log(
    JSON.stringify({ recoveryStarted: true, api: 'http://127.0.0.1:55321', smtp: 'local inbox only' }),
  );
} catch (e) {
  writeFileSync(directory + '/start-error.log', e.diagnostic ?? e.message, { mode: 0o600 });
  throw Error('Recovery stack start failed. Inspect the private local diagnostic.');
}
