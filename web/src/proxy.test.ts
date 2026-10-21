import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const { getClaims } = vi.hoisted(() => ({ getClaims: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth: { getClaims } }) }));
import { proxy } from './proxy';
afterEach(() => vi.unstubAllEnvs());
function setup() {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-key-only');
}
it('preserves the protected page on transient Auth outage for its verified retry/error boundary', async () => {
  setup();
  getClaims.mockResolvedValue({ data: null, error: { name: 'AuthRetryableFetchError', status: 0 } });
  const response = await proxy(new NextRequest('http://127.0.0.1:3100/dashboard/'));
  expect(response.status).toBe(200);
  expect(response.headers.get('location')).toBeNull();
  expect(response.headers.get('cache-control')).toContain('no-store');
});
it('redirects genuinely missing identity with its safe return path', async () => {
  setup();
  getClaims.mockResolvedValue({ data: null, error: { name: 'AuthSessionMissingError', status: 400 } });
  const response = await proxy(
    new NextRequest('http://127.0.0.1:3100/weddings/11111111-1111-4111-8111-111111111111/guests/'),
  );
  expect(response.status).toBe(307);
  expect(new URL(response.headers.get('location')!).searchParams.get('next')).toBe(
    '/weddings/11111111-1111-4111-8111-111111111111/guests/',
  );
});
it('preserves an explicit editor section during sign-in', async () => {
  setup();
  getClaims.mockResolvedValue({ data: null, error: { name: 'AuthSessionMissingError', status: 400 } });
  const path = '/weddings/11111111-1111-4111-8111-111111111111/?section=events';
  const r = await proxy(new NextRequest('http://127.0.0.1:3100' + path));
  expect(new URL(r.headers.get('location')!).searchParams.get('next')).toBe(path);
});
it('blocks the pilot operator API before refreshing an identity', async () => {
  setup();
  vi.stubEnv('DAWAT_SURFACE', 'pilot');
  getClaims.mockClear();
  const r = await proxy(new NextRequest('http://127.0.0.1:3100/api/admin/orders/'));
  expect(r.status).toBe(404);
  expect(getClaims).not.toHaveBeenCalled();
  expect(r.headers.get('cache-control')).toContain('no-store');
});
