import { readFileSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { resolve, delimiter } from 'node:path';
import { existsSync } from 'node:fs';
import { command, verifyDrillBindings } from './core.mjs';
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
let phase = 'prepare-local-adapter';
try {
  const runtimeEnv = {};
  if (process.platform === 'win32') {
    const executable = (await command('where.exe', ['docker.exe'])).toString().trim().split(/\r?\n/)[0];
    const compiler = 'C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe';
    if (!existsSync(executable) || !existsSync(compiler))
      throw Error('Local recovery Docker adapter prerequisites unavailable.');
    const bin = resolve(directory, 'docker-loopback-bin');
    mkdirSync(bin, { recursive: true });
    await command(compiler, [
      '/nologo',
      '/target:exe',
      '/out:' + resolve(bin, 'docker.exe'),
      resolve('scripts/recovery/docker-loopback.cs'),
    ]);
    const pathKey = Object.keys(process.env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH';
    runtimeEnv[pathKey] = bin + delimiter + process.env[pathKey];
    runtimeEnv.DAWAT_DOCKER_REAL = executable;
  }
  phase = 'prepare-private-network';
  const network = 'dawat-recovery-loopback';
  try {
    const saved = JSON.parse((await command('docker', ['network', 'inspect', network])).toString())[0];
    if (
      saved.Driver !== 'bridge' ||
      saved.Options?.['com.docker.network.bridge.host_binding_ipv4'] !== '127.0.0.1'
    )
      throw Error('Existing recovery network is not loopback-bound.');
  } catch (e) {
    if (!e.diagnostic?.includes('not found')) throw e;
    await command('docker', [
      'network',
      'create',
      '--driver',
      'bridge',
      '--opt',
      'com.docker.network.bridge.host_binding_ipv4=127.0.0.1',
      network,
    ]);
  }
  phase = 'start-services';
  await command(
    process.execPath,
    [
      'node_modules/supabase/dist/supabase.js',
      'start',
      '--workdir',
      directory,
      '--network-id',
      network,
      '--exclude',
      'studio,imgproxy,logflare,vector,realtime',
    ],
    { timeout: 240000, env: runtimeEnv },
  );
  phase = 'verify-port-bindings';
  // A localhost status URL is insufficient: verify actual Docker port bindings.
  await verifyDrillBindings();
  console.log(
    JSON.stringify({ recoveryStarted: true, api: 'http://127.0.0.1:55321', smtp: 'local inbox only' }),
  );
} catch (e) {
  if (['start-services', 'verify-port-bindings'].includes(phase))
    await command(process.execPath, [
      'node_modules/supabase/dist/supabase.js',
      'stop',
      '--workdir',
      directory,
      '--project-id',
      'dawat-recovery',
    ]).catch(() => {});
  writeFileSync(directory + '/start-error.log', e.diagnostic ?? e.message, { mode: 0o600 });
  throw Error(`Recovery stack start failed (${phase}). Inspect the private local diagnostic.`);
}
