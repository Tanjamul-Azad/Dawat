// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { HouseholdRow } from '@/features/production/guests';
import { SendMenu, SendQueue, DeliveryStatus } from './guest-send';
vi.mock('./product-locale', () => ({ useProductLocale: () => ({ locale: 'en' }) }));
vi.mock('../ui', () => ({ Modal: ({ children }: { children: React.ReactNode }) => <section>{children}</section>, copyText: (text: string) => navigator.clipboard.writeText(text) }));
const wid = '20000000-0000-4000-8000-000000000001';
const row = (id: string): HouseholdRow => ({ id, name: `Family ${id}`, nameBn: '', greeting: '', greetingEn: '', message: '', messageEn: '', privateNote: '', contactPhone: '+8801700000001', events: [{ eventId: 'reception', maxPeople: 2 }], revision: 1, responseRevision: 0, linkRevision: 1, linkState: 'active', source: 'host', responses: {} });
const settings = { revision: 0, hostWhatsapp: null, showHostWhatsapp: false, messageBn: '', messageEn: '', couple: 'A & B' };
const json = (data: unknown) => new Response(JSON.stringify({ data }));
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it('prefetches the current link and confirms delivery before advancing, without recording on open', async () => {
  let resolveLink!: (r: Response) => void;
  const saved = vi.fn();
  const fetcher = vi.fn(async (path: string) => {
    if (path.endsWith('/invite-settings/')) return json(settings);
    if (path.includes('/households/?')) return json({ rows: [row('first'), row('second'), { ...row('open'), source: 'open' }], nextCursor: null });
    if (path.includes('/first/link/')) return new Promise<Response>(resolve => { resolveLink = resolve; });
    if (path.endsWith('/link/')) return json({ url: 'https://example.test/second', revision: 1 });
    return json({});
  });
  vi.stubGlobal('fetch', fetcher);
  render(<SendQueue wid={wid} eventId="reception" onClose={() => {}} onSaved={saved} />);
  await waitFor(() => expect((screen.getByRole('button', { name: 'Start sending' }) as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(screen.getByRole('button', { name: 'Start sending' }));
  await waitFor(() => expect(resolveLink).toBeTypeOf('function'));
  expect(screen.queryByRole('link', { name: 'Send on WhatsApp' })).toBeNull();
  await act(async () => resolveLink(json({ url: 'https://example.test/first', revision: 1 })));
  const anchor = await screen.findByRole('link', { name: 'Send on WhatsApp' });
  expect(anchor.getAttribute('target')).toBe('_blank'); expect(new URL(anchor.getAttribute('href')!).searchParams.get('text')).toContain('https://example.test/first');
  fireEvent.click(anchor); fireEvent(document, new Event('visibilitychange'));
  expect(fetcher.mock.calls.some(([path]) => path.includes('/deliveries/'))).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Yes, next' }));
  await waitFor(() => expect(saved).toHaveBeenCalledOnce());
  await screen.findByText(/2 \/ 2 · Family second/);
  expect(JSON.parse(localStorage.getItem(`dawat:send-queue:${wid}`)!)).toMatchObject({ ids: ['first', 'second'], index: 1 });
});
it('resumes the persisted queue and tolerates unavailable storage', async () => {
  localStorage.setItem(`dawat:send-queue:${wid}`, JSON.stringify({ filter: 'all', ids: ['first', 'second'], index: 1 }));
  vi.stubGlobal('fetch', vi.fn(async (path: string) => path.endsWith('/invite-settings/') ? json(settings) : path.includes('/households/?') ? json({ rows: [row('first'), row('second')], nextCursor: null }) : json({ url: 'https://example.test/second', revision: 1 })));
  render(<SendQueue wid={wid} eventId="reception" onClose={() => {}} onSaved={() => {}} />);
  const resume = await screen.findByRole('button', { name: 'Resume where you stopped' });
  await waitFor(() => expect((resume as HTMLButtonElement).disabled).toBe(false)); fireEvent.click(resume);
  await screen.findByText(/Family second/);
  expect(screen.queryByText(/Family first/)).toBeNull();
});
it('prepares the row send menu and keeps copy and opening separate from sent confirmation', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn(async () => {}) } });
  const fetcher = vi.fn(async (path: string) => path.endsWith('/invite-settings/') ? json(settings) : json({ url: 'https://example.test/personal', revision: 1 })); vi.stubGlobal('fetch', fetcher);
  render(<SendMenu wid={wid} row={row('first')} onSaved={() => {}} />);
  const details = screen.getByText('Send').closest('details')!;
  await act(async () => { details.open = true; fireEvent(details, new Event('toggle')); });
  await screen.findByRole('link', { name: 'Send on WhatsApp' });
  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
  await screen.findByText('Copied');
  expect(fetcher.mock.calls.some(([path]) => path.includes('/deliveries/'))).toBe(false);
});
it('shows a rotated delivery as needing the new link', () => {
  render(<DeliveryStatus row={{ ...row('first'), linkRevision: 2, lastDelivery: { channel: 'whatsapp', at: '2026-10-28T00:00:00Z', linkRevision: 1 } }} eventId="reception" />);
  expect(screen.getByText('New link not sent')).toBeTruthy();
});
