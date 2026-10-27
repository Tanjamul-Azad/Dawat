import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';

// Plan 4.3: the retired Bangla words must not come back inside the app.
test('app wording uses none of the retired glossary terms', () => {
  const run = () =>
    execFileSync(process.execPath, ['scripts/bn-copy-inventory.mjs', '--check'], { encoding: 'utf8' });
  expect(run()).toContain('0 retired term(s)');
});
