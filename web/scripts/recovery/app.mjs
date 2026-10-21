import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
const env = parseEnv(readFileSync('../.artifacts/recovery-sandbox/.env.restored.local', 'utf8'));
if (
  env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:55321' ||
  env.APP_ORIGIN !== 'http://127.0.0.1:3104' ||
  env.DAWAT_RECOVERY_QA !== '1'
)
  throw new Error('Recovery app accepts only its isolated loopback configuration.');
const mode = process.argv[2];
if (!['build', 'start', 'verify'].includes(mode)) throw new Error('Use build, start or verify.');
const args =
  mode === 'verify'
    ? ['scripts/verify-local.mjs']
    : [
        'node_modules/next/dist/bin/next',
        mode,
        ...(mode === 'start' ? ['--hostname', '127.0.0.1', '--port', '3104'] : []),
      ];
const child = spawn(process.execPath, args, {
  env: { ...process.env, ...env, DAWAT_LOCAL_QA: '' },
  stdio: 'inherit',
  windowsHide: true,
});
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
