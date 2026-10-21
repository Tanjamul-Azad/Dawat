import { expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('./supabase', () => ({ database: vi.fn() }));
import { database } from './supabase';
import { session } from './auth';
it('distinguishes provider outage from a logged-out account', async () => {
  vi.mocked(database).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: null }, error: { status: 503, name: 'AuthError' } }) },
  } as never);
  await expect(session()).rejects.toMatchObject({ status: 503, code: 'AUTH_UNAVAILABLE' });
});
it('requires verification for missing/expired identity', async () => {
  vi.mocked(database).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: null }, error: { status: 401, name: 'AuthError' } }) },
  } as never);
  await expect(session()).rejects.toMatchObject({ status: 401, code: 'AUTH_REQUIRED' });
});
it('accepts the provider-verified customer identity', async () => {
  vi.mocked(database).mockResolvedValue({
    auth: {
      getUser: async () => ({
        data: { user: { id: 'synthetic', email_confirmed_at: '2026-10-21T00:00:00Z' } },
        error: null,
      }),
    },
  } as never);
  await expect(session()).resolves.toMatchObject({ user: { id: 'synthetic' } });
});
