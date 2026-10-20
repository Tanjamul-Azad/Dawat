// Uses a separate ignored configuration/build directory. Never starts QA against hosted data.
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
const env = parseEnv(readFileSync('.env.qa.local', 'utf8'));
if (
  env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54321' ||
  env.APP_ORIGIN !== 'http://127.0.0.1:3102' ||
  env.DAWAT_LOCAL_QA !== '1'
)
  throw new Error('Offline QA requires the isolated loopback configuration.');
const mode = process.argv[2];
if (!['build', 'start'].includes(mode)) throw new Error('Use build or start.');
const child = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    mode,
    ...(mode === 'start' ? ['--hostname', '127.0.0.1', '--port', '3102'] : []),
  ],
  {
    env: { ...process.env, ...env },
    stdio: 'inherit',
  },
);
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
