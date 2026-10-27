import { afterEach, expect, it, vi } from 'vitest';
import Page from './page';
import { database } from '@/server/supabase';

vi.mock('server-only', () => ({}));
vi.mock('@/server/config', () => ({ backendConfigured: () => true }));
vi.mock('@/server/supabase', () => ({ database: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
vi.mock('@/components/production/login', () => ({ Mfa: () => null }));
vi.mock('@/components/production/frame', () => ({ SetupRequired: () => null }));
afterEach(() => {
  vi.clearAllMocks();
});

it.each(['/admin/orders/?order=20000000-0000-4000-8000-000000000009', '/admin/requests/'])(
  'preserves %s through fresh sign-in if the MFA session expired',
  async (next) => {
    vi.mocked(database).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    } as unknown as Awaited<ReturnType<typeof database>>);
    await expect(Page({ searchParams: Promise.resolve({ next }) })).rejects.toThrow(
      `REDIRECT:/auth/login/?next=${encodeURIComponent(next)}`,
    );
  },
);

it('does not preserve an external destination through expired-session sign-in', async () => {
  vi.mocked(database).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  } as unknown as Awaited<ReturnType<typeof database>>);
  await expect(
    Page({ searchParams: Promise.resolve({ next: 'https://example.com/admin/orders/' }) }),
  ).rejects.toThrow('REDIRECT:/auth/login/?next=%2Fadmin%2Forders%2F');
});
