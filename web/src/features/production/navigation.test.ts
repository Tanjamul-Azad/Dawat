import { expect, it } from 'vitest';
import { safeReturnPath } from './navigation';
it('keeps an admin order link through sign-in and MFA, and drops anything else', () => {
  const id = '20000000-0000-4000-8000-000000000009';
  expect(safeReturnPath(`/admin/orders/?order=${id}`)).toBe(`/admin/orders/?order=${id}`);
  expect(safeReturnPath('/admin/requests/')).toBe('/admin/requests/');
  expect(safeReturnPath('/admin/orders/?order=../../x')).toBe('/dashboard/');
  expect(safeReturnPath('https://example.com/admin/orders/')).toBe('/dashboard/');
});
