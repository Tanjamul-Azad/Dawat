import { expect, it } from 'vitest';
import { packageName, packageNames, prices, templates } from './catalog';

it('shows Classic, Premium and Custom to people while ids and prices stay the same', () => {
  expect(packageName('normal', 'bn')).toBe('ক্লাসিক');
  expect(packageName('premium', 'bn')).toBe('প্রিমিয়াম');
  expect(packageName('custom', 'bn')).toBe('নিজের মতো');
  expect(packageName('normal', 'en')).toBe('Classic');
  expect(packageName('premium', 'en')).toBe('Premium');
  expect(packageName('custom', 'en')).toBe('Custom');
  expect(prices).toEqual({ normal: 500, premium: 750, custom: 1500 });
  expect(Object.keys(packageNames)).toEqual(['normal', 'premium', 'custom']);
  expect(new Set(templates.map((template) => template.tier))).toEqual(new Set(['normal', 'premium']));
});
