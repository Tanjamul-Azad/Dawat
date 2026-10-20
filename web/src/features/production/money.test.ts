import { expect, it } from 'vitest';
import { parseBDT } from './money';
it('converts visible BDT amounts and Bangla digits exactly to integer paisa', () => {
  expect(parseBDT('১২৩৪.৫৬')).toBe(123456);
  expect(parseBDT('0.29')).toBe(29);
  expect(parseBDT(' 2500 ')).toBe(250000);
  expect(parseBDT('0')).toBe(0);
});
it('rejects rounding, exponent notation, negative, missing and oversized amounts', () => {
  for (const value of ['', '-1', '1e3', '1.999', '12,000', '10000000.01', 'Infinity'])
    expect(parseBDT(value)).toBeNull();
  expect(parseBDT('10000000.00')).toBe(1000000000);
});
