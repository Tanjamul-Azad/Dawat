import { expect, it } from 'vitest';
import { couplePrefill, safeReturnPath } from './navigation';
it('keeps an admin order link through sign-in and MFA, and drops anything else', () => {
  const id = '20000000-0000-4000-8000-000000000009';
  expect(safeReturnPath(`/admin/orders/?order=${id}`)).toBe(`/admin/orders/?order=${id}`);
  expect(safeReturnPath('/admin/requests/')).toBe('/admin/requests/');
  expect(safeReturnPath('/admin/orders/?order=../../x')).toBe('/dashboard/');
  expect(safeReturnPath('https://example.com/admin/orders/')).toBe('/dashboard/');
});
it('keeps the design and typed couple names through sign-in, and nothing else in that query', () => {
  const names = encodeURIComponent('রাইহান ও নাবিলা');
  expect(safeReturnPath(`/order/requests/?template=garden&names=${names}`)).toBe(
    `/order/requests/?template=garden&names=${names}`,
  );
  expect(safeReturnPath(`/order/requests/?names=${names}`)).toBe(`/order/requests/?names=${names}`);
  expect(safeReturnPath('/order/requests/?template=garden&next=https://example.com')).toBe('/dashboard/');
  expect(safeReturnPath('/order/requests/?template=garden&names=a&names=b')).toBe('/dashboard/');
});
it('cleans couple names for prefill', () => {
  expect(couplePrefill('  রাইহান   ও\nনাবিলা <b>')).toBe('রাইহান ও নাবিলা b');
  expect(couplePrefill('x'.repeat(300))).toHaveLength(120);
  expect(couplePrefill(['a'])).toBe('');
  expect(couplePrefill(undefined)).toBe('');
});
