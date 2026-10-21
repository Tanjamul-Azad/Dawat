import { afterEach, expect, it, vi } from 'vitest';
const { session, configured, emailReady, redirect } = vi.hoisted(() => ({
  session: vi.fn(),
  configured: vi.fn(() => true),
  emailReady: vi.fn(() => true),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
vi.mock('server-only', () => ({}));
vi.mock('@/server/auth', () => ({ session }));
vi.mock('@/server/config', () => ({ backendConfigured: configured, emailSignInReady: emailReady }));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('@/components/production/login', () => ({ Login: () => null }));
vi.mock('@/components/production/frame', () => ({ SetupRequired: () => null }));
import Page from './page';
import { HttpError } from '@/server/http';
afterEach(() => {
  vi.clearAllMocks();
  configured.mockReturnValue(true);
  emailReady.mockReturnValue(true);
});
const next = '/weddings/11111111-1111-4111-8111-111111111111/?section=photos';
it('skips the OTP form for an existing provider-verified identity and preserves the editor destination', async () => {
  session.mockResolvedValue({ user: { id: 'fictional' } });
  await expect(Page({ searchParams: Promise.resolve({ next }) })).rejects.toThrow(`redirect:${next}`);
  expect(redirect).toHaveBeenCalledWith(next);
});
it('does not allow an existing identity to redirect outside the app', async () => {
  session.mockResolvedValue({ user: { id: 'fictional' } });
  await expect(Page({ searchParams: Promise.resolve({ next: 'https://foreign.example' }) })).rejects.toThrow(
    'redirect:/dashboard/',
  );
});
it('offers OTP for a missing or expired verified identity', async () => {
  session.mockRejectedValue(new HttpError(401, 'AUTH_REQUIRED', 'Sign in'));
  const page = await Page({ searchParams: Promise.resolve({ next }) });
  expect(page.props).toMatchObject({ next, available: true });
  expect(redirect).not.toHaveBeenCalled();
});
it('does not mistake an auth outage for sign-out and ask for another code', async () => {
  const error = new HttpError(503, 'AUTH_UNAVAILABLE', 'Retry');
  session.mockRejectedValue(error);
  await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toBe(error);
  expect(redirect).not.toHaveBeenCalled();
});
it('does not contact auth before backend configuration exists', async () => {
  configured.mockReturnValue(false);
  await Page({ searchParams: Promise.resolve({}) });
  expect(session).not.toHaveBeenCalled();
});
