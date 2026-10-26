import { expect, it } from 'vitest';
import { safeReturnPath, editorSection } from './navigation';
import { singleWeddingDestination } from './entry';
import { deploymentSurface, routeAllowed } from './surface';
const id = '11111111-1111-4111-8111-111111111111';
const wedding = {
  id,
  title: 'কাল্পনিক',
  state: 'active',
  visibility: 'unpublished',
  slug: id,
  publication_revision: 0,
};
it('takes only an unambiguous active single-wedding account straight to its workspace', () => {
  expect(singleWeddingDestination([wedding], false)).toBe(`/weddings/${id}/`);
  expect(singleWeddingDestination([wedding], true)).toBeNull();
  expect(singleWeddingDestination([], false)).toBeNull();
  expect(singleWeddingDestination([wedding, { ...wedding, id: 'other' }], false)).toBeNull();
  for (const state of ['inactive', 'suspended', 'revoked', 'expired'])
    expect(singleWeddingDestination([{ ...wedding, state }], false)).toBeNull();
});
it('retains only explicit internal editor/list state through login', () => {
  expect(safeReturnPath('/order/requests/?template=rose')).toBe('/order/requests/?template=rose');
  expect(safeReturnPath('/admin/requests/')).toBe('/admin/requests/');
  expect(safeReturnPath('/order/requests/?template=rose&next=//evil.test')).toBe('/dashboard/');
  expect(safeReturnPath(`/weddings/${id}/?section=photos`)).toBe(`/weddings/${id}/?section=photos`);
  expect(safeReturnPath('/dashboard/?all=1')).toBe('/dashboard/?all=1');
  for (const value of [
    `/weddings/${id}/?section=photos&next=https://evil.test`,
    `/weddings/${id}/?section=%2F%2Fevil.test`,
    '//evil.test',
    '/dashboard/?all=1?next=evil',
    '/dashboard/#evil',
  ])
    expect(safeReturnPath(value)).toBe('/dashboard/');
  expect(editorSection(['photos', 'events'])).toBe('overview');
  expect(editorSection('photos')).toBe('photos');
});
it.each([
  '/admin/orders/',
  '/api/admin/orders/',
  '/operator/',
  '/templates/',
  '/order/',
  '/studio/',
  '/auth/mfa/',
  '/api/auth/mfa-enroll/',
])('does not expose %s in the dedicated pilot', (path) => {
  expect(routeAllowed('pilot', path)).toBe(false);
});
it('preserves the client/guest flow and fails closed on misspelled deployment configuration', () => {
  for (const path of [
    '/dashboard/',
    '/weddings/' + id + '/',
    '/api/weddings/' + id + '/publish/',
    '/auth/login/',
    '/api/auth/verify/',
    '/i/' + id + '/',
    '/i/' + id + '/h/' + id + '/api/',
  ])
    expect(routeAllowed('pilot', path)).toBe(true);
  expect(routeAllowed('all', '/admin/orders/')).toBe(true);
  expect(() => deploymentSurface('piolt')).toThrow();
});
