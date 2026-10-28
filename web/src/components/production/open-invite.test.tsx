// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { OpenInviteCard } from './open-invite';
vi.mock('./product-locale', () => ({ useProductLocale: () => ({ locale: 'en' }) }));
const json = (data: unknown) => new Response(JSON.stringify({ data }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('saves shared settings and prepares a popup-safe WhatsApp anchor, with explicit rotation consent', async () => {
  const initial = {
    enabled: false,
    revision: 0,
    url: null,
    eventIds: [],
    maxPeople: 5,
    greetingBn: 'প্রিয় অতিথি',
    greetingEn: 'Dear guest',
    askPhone: true,
  };
  const fetcher = vi.fn(async (path: string, options?: RequestInit) =>
    path.endsWith('invite-settings/')
      ? json({ couple: 'A & B', messageBn: '', messageEn: '' })
      : options?.method === 'PUT'
        ? json({
            ...initial,
            ...JSON.parse(options.body as string),
            enabled: true,
            revision: 1,
            url: 'https://example.test/shared',
          })
        : json(initial),
  );
  vi.stubGlobal('fetch', fetcher);
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  render(
    <OpenInviteCard
      wid="wedding"
      events={[
        {
          id: 'reception',
          title: 'Reception',
          date: '2026-12-12',
          time: '18:00',
          venue: 'Garden',
          address: '',
        },
      ]}
    />,
  );
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Enable replies through the shared link' }));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save settings' })));
  const anchor = await screen.findByRole('link', { name: 'Share on WhatsApp' });
  expect(anchor.getAttribute('href')).toContain('https://wa.me/?text=');
  expect(anchor.getAttribute('target')).toBe('_blank');
  const before = fetcher.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Create new link' }));
  expect(window.confirm).toHaveBeenCalled();
  expect(fetcher).toHaveBeenCalledTimes(before);
  await waitFor(() => expect(screen.getByText('Link settings saved.')).toBeTruthy());
});
