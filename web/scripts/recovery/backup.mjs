import { openSync, closeSync, unlinkSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { backup, loadPrivate } from './core.mjs';

// Crashes leave the lock in place. Inspect the recorded PID before removing it.
let lock;
let root;
function status(value) {
  const temporary = join(root, 'status.json.tmp');
  writeFileSync(temporary, JSON.stringify(value, null, 2), { mode: 0o600 });
  renameSync(temporary, join(root, 'status.json'));
}
try {
  const env = loadPrivate('.env.recovery.local');
  if (!env.DAWAT_BACKUP_DIRECTORY) throw Error('Backup directory unavailable.');
  root = resolve(env.DAWAT_BACKUP_DIRECTORY);
  mkdirSync(root, { recursive: true, mode: 0o700 });
  lock = openSync(join(root, 'backup.lock'), 'wx', 0o600);
  writeFileSync(lock, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
  status({ state: 'running', startedAt: new Date().toISOString() });
  const result = await backup({
    recoveryEnv: '.env.recovery.local',
    deploymentEnv: '.env.netlify.pilot.local',
  });
  status({ state: 'complete', ...result.proof });
  console.log(JSON.stringify(result));
} catch (e) {
  // Never forward database diagnostics or credentials to Task Scheduler.
  if (lock !== undefined && root)
    status({ state: 'failed', failedAt: new Date().toISOString(), code: e.code ?? 'BACKUP_FAILED' });
  console.error(
    e.code === 'EEXIST'
      ? 'Backup already locked. Inspect backup.lock before retrying.'
      : 'Backup unavailable. Check configuration, Docker and the private database connection; the last complete backup is retained.',
  );
  process.exitCode = 1;
} finally {
  if (lock !== undefined) {
    closeSync(lock);
    unlinkSync(join(root, 'backup.lock'));
  }
}
