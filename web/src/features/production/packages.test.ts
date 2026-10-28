import { expect, test } from 'vitest';
import { choiceLabel, packageName, packagePrice, quotePackageName } from './packages';

test('maps designs and "custom" to the owner-approved package names and prices', () => {
  expect(packageName('jamdani', 'bn')).toBe('ক্লাসিক');
  expect(packageName('garden', 'bn')).toBe('প্রিমিয়াম');
  expect(packageName('custom', 'bn')).toBe('নিজের মতো');
  expect(packageName('jamdani', 'en')).toBe('Classic');
  expect(packageName('garden', 'en')).toBe('Premium');
  expect(packageName('custom', 'en')).toBe('Custom');
  expect([packagePrice('ivory'), packagePrice('rose'), packagePrice('custom')]).toEqual([500, 750, 1500]);
});

test('labels a request by its design, or by the custom package', () => {
  expect(choiceLabel('jamdani', 'bn')).toBe('জামদানি');
  expect(choiceLabel('jamdani', 'en')).toBe('Jamdani');
  expect(choiceLabel('custom', 'bn')).toBe('নিজের মতো');
  expect(quotePackageName('jamdani')).toBe('ক্লাসিক · জামদানি');
  expect(quotePackageName('custom')).toBe('নিজের মতো');
});
