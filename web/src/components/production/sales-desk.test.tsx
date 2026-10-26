// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SalesDesk } from './sales-desk';
import { ProductLocale } from './product-locale';
import type { SalesPage, SalesRequest } from '@/features/production/sales';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
const row: SalesRequest = {
  id: '20000000-0000-4000-8000-000000000001',
  user_id: '20000000-0000-4000-8000-000000000002',
  customer_email: 'buyer@example.test',
  customer_name: 'Test buyer',
  template_id: 'garden',
  event_date: null,
  brief: 'A fictional wedding',
  state: 'quoted',
  package_name: 'Garden Vows',
  amount_minor: 75000,
  term_days: 90,
  quote_notes: 'Agreed terms and instructions.',
  order_id: null,
  revision: 1,
  created_at: '2026-10-26T00:00:00Z',
  updated_at: '2026-10-26T00:00:00Z',
};
const page: SalesPage = { requests: [row], payments: [], progress: [], nextCursor: null };
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function show(initial = page) {
  render(
    <ProductLocale>
      <SalesDesk initial={initial} email="buyer@example.test" />
    </ProductLocale>,
  );
}
it('keeps retry identity after ambiguous failure and never claims success until server acknowledgement', async () => {
  const fetcher = vi
    .fn()
    .mockRejectedValueOnce(new Error('Connection lost'))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { ...row, state: 'accepted' } })))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { ...page, requests: [{ ...row, state: 'accepted' }] } })),
    );
  vi.stubGlobal('fetch', fetcher);
  show();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'কোটেশন গ্রহণ করুন' }));
  await screen.findByRole('alert');
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'কোটেশন গ্রহণ করুন' }));
  await screen.findByRole('status');
  expect(fetcher.mock.calls[0][1].headers['Idempotency-Key']).toBe(
    fetcher.mock.calls[1][1].headers['Idempotency-Key'],
  );
  await waitFor(() => expect(screen.queryByRole('button', { name: 'কোটেশন গ্রহণ করুন' })).toBeNull());
});
it('shows verified server progress without offering customer verification controls', async () => {
  const ordered = { ...row, state: 'ordered' as const, order_id: row.id };
  const data = {
    ...page,
    requests: [ordered],
    progress: [
      {
        requestId: row.id,
        status: 'confirmed',
        paymentStatus: 'manually_verified',
        access: 'active',
        weddingId: row.id,
      },
    ],
  };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data }))));
  show({ ...page, requests: [ordered] });
  await act(async () => {
    window.dispatchEvent(new Event('focus'));
  });
  expect((await screen.findByRole('link', { name: 'আপনার পোর্টাল খুলুন' })).getAttribute('href')).toBe(
    `/weddings/${row.id}/`,
  );
  expect(screen.queryByRole('button', { name: 'সিদ্ধান্ত সংরক্ষণ করুন' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'যাচাইয়ের জন্য জমা দিন' })).toBeNull();
});
