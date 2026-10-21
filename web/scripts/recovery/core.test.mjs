import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  assertDrillTarget,
  hash,
  seal,
  sourceConnection,
  unseal,
  verifyBackup,
  policyRoles,
  command,
} from './core.mjs';
const temporary = [];
it('does not mark a killed database subprocess as successful', async () => {
  await expect(
    command(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { timeout: 100 }),
  ).rejects.toThrow('Recovery subprocess failed');
});
it('preserves restrictive Storage policy roles returned as PostgreSQL name arrays', () => {
  expect(policyRoles('{anon,authenticated}')).toBe('"anon","authenticated"');
  expect(policyRoles(['anon', 'authenticated'])).toBe('"anon","authenticated"');
  expect(() => policyRoles('{}')).toThrow();
});
afterEach(() => temporary.splice(0).forEach((path) => rmSync(path, { recursive: true, force: true })));
it('rejects wrong keys, changed ciphertext, swapped entry names and truncation', () => {
  const key = randomBytes(32),
    bytes = Buffer.from('fictional private data');
  const encrypted = seal(bytes, key, '00000.bin');
  expect(unseal(encrypted, key, '00000.bin')).toEqual(bytes);
  expect(() => unseal(encrypted, randomBytes(32), '00000.bin')).toThrow();
  expect(() => unseal(encrypted, key, '00001.bin')).toThrow();
  const changed = Buffer.from(encrypted);
  changed[changed.length - 1] ^= 1;
  expect(() => unseal(changed, key, '00000.bin')).toThrow();
  expect(() => unseal(encrypted.subarray(0, 20), key, '00000.bin')).toThrow();
});
it('refuses remote, ordinary development and mismatched recovery targets', () => {
  const valid = {
    container: 'supabase_db_dawat-recovery',
    url: 'http://127.0.0.1:55321',
    databaseHost: '127.0.0.1',
    databasePort: 55322,
  };
  expect(() => assertDrillTarget(valid)).not.toThrow();
  for (const changed of [
    { url: 'https://zztiestaqjbsbjuzmbqp.supabase.co' },
    { databaseHost: 'localhost.evil.test' },
    { container: 'supabase_db_dawat-local' },
    { databasePort: 54322 },
  ]) {
    expect(() => assertDrillTarget({ ...valid, ...changed })).toThrow();
  }
  expect(() => sourceConnection({ DAWAT_DB_HOST: 'unreviewed.example' })).toThrow();
});
it('authenticates every entry and rejects missing or substituted files before restore', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dawat-recovery-test-'));
  temporary.push(dir);
  const key = randomBytes(32),
    keyPath = join(dir, 'key');
  writeFileSync(keyPath, key);
  const bytes = Buffer.from('fictional snapshot');
  const entry = { name: 'data.sql', filename: '00000.bin', bytes: bytes.length, sha256: hash(bytes) };
  const manifest = { version: 1, source: 'zztiestaqjbsbjuzmbqp', entries: [entry] };
  writeFileSync(join(dir, 'manifest.bin'), seal(Buffer.from(JSON.stringify(manifest)), key, 'manifest.bin'));
  expect(() => verifyBackup(dir, keyPath)).toThrow();
  writeFileSync(join(dir, entry.filename), seal(bytes, key, entry.filename));
  expect(verifyBackup(dir, keyPath).manifest.entries.length).toBe(1);
  writeFileSync(join(dir, entry.filename), seal(Buffer.from('different data'), key, entry.filename));
  expect(() => verifyBackup(dir, keyPath)).toThrow('Backup integrity');
});
