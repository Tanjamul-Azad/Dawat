// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SellerOrder } from '@/features/production/contracts';
import { SellerOrders } from './seller-orders';

vi.mock('./product-locale', () => ({
  useProductLocale: () => ({ locale: 'en', tr: (text: string) => text }),
}));
vi.mock('./frame', () => ({ WorkspaceFrame: ({ children }: { children: React.ReactNode }) => children }));
vi.mock('../ui', () => ({
  copyText: (text: string) => navigator.clipboard.writeText(text),
  Modal: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section role="dialog" aria-label={title}>
      {children}
    </section>
  ),
}));

const order = (suffix: string): SellerOrder => ({
  id: `20000000-0000-4000-8000-00000000000${suffix}`,
  customer_email: `buyer-${suffix}@example.test`,
  customer_name: `Buyer ${suffix}`,
  package_name: 'Premium',
  amount_minor: 75000,
  currency: 'BDT',
  term_days: 90,
  status: 'reviewing',
  payment_status: 'pending',
  exception_reason: null,
  revision: 0,
  created_at: '2026-10-27T10:00:00Z',
  weddingId: null,
  access: 'closed',
});
const initial = { orders: [order('1'), order('2')], nextCursor: null };
const json = (data: unknown) => new Response(JSON.stringify({ data }));
const pause = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('opens a newly linked order on same-route navigation and discards the previous action', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => json([])),
  );
  const view = render(
    <SellerOrders initial={initial} email="seller@example.test" focus={initial.orders[0]} />,
  );
  await pause();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm & provision' }));
  expect(screen.getByRole('dialog', { name: 'confirm · Buyer 1' })).toBeTruthy();
  view.rerender(<SellerOrders initial={initial} email="seller@example.test" focus={initial.orders[1]} />);
  await pause();
  expect(screen.queryByRole('dialog', { name: 'confirm · Buyer 1' })).toBeNull();
  expect(screen.getByRole('dialog', { name: 'Order · Buyer 2' })).toBeTruthy();
  expect(screen.queryByRole('textbox', { name: 'Reason / evidence reviewed' })).toBeNull();
});

it('ignores the old order timeline after focus changes and clears detail when the link is removed', async () => {
  let finishOld!: (response: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn((path: string) =>
      path.includes(initial.orders[0].id)
        ? new Promise<Response>((resolve) => {
            finishOld = resolve;
          })
        : Promise.resolve(
            json([
              {
                action: 'new-order-event',
                reason: 'New order evidence',
                actor_id: initial.orders[1].id,
                created_at: initial.orders[1].created_at,
              },
            ]),
          ),
    ),
  );
  const view = render(
    <SellerOrders initial={initial} email="seller@example.test" focus={initial.orders[0]} />,
  );
  view.rerender(<SellerOrders initial={initial} email="seller@example.test" focus={initial.orders[1]} />);
  await pause();
  await act(async () => {
    finishOld(json([{ action: 'stale-event', reason: 'Wrong order evidence' }]));
  });
  expect(screen.getByText(/^New order evidence/)).toBeTruthy();
  expect(screen.queryByText(/Wrong order evidence/)).toBeNull();
  view.rerender(<SellerOrders initial={initial} email="seller@example.test" />);
  await pause();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('offers the persisted dedicated customer link when an active order is reopened', async () => {
  const active = {
    ...initial.orders[0],
    status: 'confirmed',
    access: 'active',
    weddingId: '30000000-0000-4000-8000-000000000001',
  };
  const clipboard = vi.fn(async () => {});
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => json([])),
  );
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: clipboard }, configurable: true });
  render(
    <SellerOrders
      initial={{ orders: [active], nextCursor: null }}
      email="seller@example.test"
      focus={active}
    />,
  );
  await pause();
  const expected = `${window.location.origin}/weddings/${active.weddingId}/`;
  expect(screen.getByText(expected)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
  await pause();
  expect(clipboard).toHaveBeenCalledWith(expected);
});
