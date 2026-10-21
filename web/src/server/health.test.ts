import { afterEach, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { GET } from '@/app/health/route';
afterEach(() => vi.unstubAllEnvs());
it('health fails closed without configuration and exposes no key material', async () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
  const result = await GET();
  expect(result.status).toBe(503);
  expect(await result.json()).toEqual({ status: 'unavailable' });
  expect(result.headers.get('cache-control')).toContain('no-store');
});
it('health confirms configuration without claiming a database or mail delivery check', async () => {
  vi.stubEnv('APP_ORIGIN', 'https://dawat.example');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-public-key');
  vi.stubEnv('SUPABASE_MEDIA_SECRET_KEY', 'synthetic-server-secret');
  vi.stubEnv('GUEST_LINK_KEY_ID', 'v1');
  vi.stubEnv('GUEST_LINK_KEYS', JSON.stringify({ v1: Buffer.alloc(32, 1).toString('base64') }));
  vi.stubEnv('AUTH_EMAIL_ENABLED', 'true');
  const result = await GET();
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({ status: 'ok' });
});
