import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { templates, prices } from './catalog';
it('keeps every database auto-quote price and hosting term aligned with the public catalog', () => {
  const sql = readFileSync('supabase/migrations/20261028120000_access_simplify.sql', 'utf8');
  const entries = [...sql.matchAll(/\('([^']+)','([^']+)',(\d+),(\d+),(true|false)\)/g)];
  expect(entries).toHaveLength(templates.length + 1);
  for (const template of templates) {
    const entry = entries.find(row => row[1] === template.id)!;
    expect(Number(entry[3])).toBe(prices[template.tier] * 100);
    expect(Number(entry[4])).toBe(90);
    expect(entry[5]).toBe('true');
  }
  const custom = entries.find(row => row[1] === 'custom')!;
  expect(Number(custom[3])).toBe(prices.custom * 100);
  expect(custom[5]).toBe('false');
});
