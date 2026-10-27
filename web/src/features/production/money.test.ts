import { expect, it } from 'vitest';
import { parseBDT, taka, takaFromPaisa } from './money';
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
it('renders taka with the symbol first in both locales', () => {
  expect(takaFromPaisa(50000, 'bn')).toBe('৳৫০০');
  expect(takaFromPaisa(150000, 'en')).toBe('৳1,500');
  expect(takaFromPaisa(50050, 'bn')).toBe('৳৫০০.৫');
  expect(taka(750, 'en')).toBe('৳750');
});
