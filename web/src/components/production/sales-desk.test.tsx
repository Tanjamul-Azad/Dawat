// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SalesDesk } from './sales-desk';
import { ProductLocale } from './product-locale';
import type { PaymentSubmission, SalesPage, SalesRequest } from '@/features/production/sales';
import { paymentCommand } from '@/features/production/sales';
import { orderPaymentReference } from '@/features/production/payment';
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
  localStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function show(initial = page) {
  return render(
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
  fireEvent.click(screen.getByRole('button', { name: 'সম্মতি দিন ও পেমেন্টে যান' }));
  await screen.findByRole('alert');
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'সম্মতি দিন ও পেমেন্টে যান' }));
  await screen.findByRole('status');
  expect(fetcher.mock.calls[0][1].headers['Idempotency-Key']).toBe(
    fetcher.mock.calls[1][1].headers['Idempotency-Key'],
  );
  await waitFor(() => expect(screen.queryByRole('button', { name: 'সম্মতি দিন ও পেমেন্টে যান' })).toBeNull());
});

it('requires fresh consent after a quote revision changes, but keeps consent for an unchanged refresh', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: page })))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            ...page,
            requests: [{ ...row, revision: 2, quote_notes: 'Revised scope to review again.' }],
          },
        }),
      ),
    );
  vi.stubGlobal('fetch', fetcher);
  show();
  fireEvent.click(screen.getByRole('checkbox'));
  await act(async () => {
    window.dispatchEvent(new Event('focus'));
  });
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  await act(async () => {
    window.dispatchEvent(new Event('focus'));
  });
  await screen.findByText('Revised scope to review again.');
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
  expect(screen.getByRole('checkbox').hasAttribute('required')).toBe(true);
});

it('keeps the complete unfinished request across hiding, reopening, and a fresh mount', () => {
  const empty = { requests: [], payments: [], progress: [], nextCursor: null };
  const view = show(empty);
  fireEvent.change(screen.getByLabelText('আপনার নাম'), { target: { value: 'Draft buyer' } });
  fireEvent.change(screen.getByLabelText('আয়োজনের তারিখ · জানা থাকলে'), { target: { value: '2027-02-12' } });
  fireEvent.change(screen.getByLabelText('আয়োজন ও প্রয়োজনের কথা'), {
    target: { value: 'A meaningful unfinished celebration.' },
  });
  fireEvent.change(screen.getByLabelText('পছন্দের নকশা'), { target: { value: 'midnight' } });
  expect(screen.queryByText('আগের অসম্পূর্ণ লেখা ফিরিয়ে আনা হয়েছে।')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'নতুন অর্ডার' }));
  fireEvent.click(screen.getByRole('button', { name: 'নতুন অর্ডার' }));
  expect((screen.getByLabelText('আপনার নাম') as HTMLInputElement).value).toBe('Draft buyer');
  expect((screen.getByLabelText('পছন্দের নকশা') as HTMLSelectElement).value).toBe('midnight');
  view.unmount();
  show(empty);
  expect((screen.getByLabelText('আপনার নাম') as HTMLInputElement).value).toBe('Draft buyer');
  expect((screen.getByLabelText('আয়োজনের তারিখ · জানা থাকলে') as HTMLInputElement).value).toBe('2027-02-12');
  expect((screen.getByLabelText('আয়োজন ও প্রয়োজনের কথা') as HTMLTextAreaElement).value).toBe(
    'A meaningful unfinished celebration.',
  );
  expect((screen.getByLabelText('পছন্দের নকশা') as HTMLSelectElement).value).toBe('midnight');
  expect(screen.getByText('আগের অসম্পূর্ণ লেখা ফিরিয়ে আনা হয়েছে।')).toBeTruthy();
});

it('reopens an unfinished request draft even when earlier requests exist', () => {
  localStorage.setItem(
    'dawat:request-draft:buyer@example.test',
    JSON.stringify({ name: 'Second wedding', date: '', brief: '', template: 'garden' }),
  );
  show(page);
  expect((screen.getByLabelText('আপনার নাম') as HTMLInputElement).value).toBe('Second wedding');
  expect(screen.getByText('আগের অসম্পূর্ণ লেখা ফিরিয়ে আনা হয়েছে।')).toBeTruthy();
});

it('clears the saved request draft only after the server accepts the request', async () => {
  const empty = { requests: [], payments: [], progress: [], nextCursor: null };
  const requested = { ...row, state: 'requested' as const };
  const fetcher = vi
    .fn()
    .mockRejectedValueOnce(new Error('Connection lost'))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: requested })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { ...page, requests: [requested] } })));
  vi.stubGlobal('fetch', fetcher);
  show(empty);
  fireEvent.change(screen.getByLabelText('আপনার নাম'), { target: { value: 'Draft buyer' } });
  fireEvent.change(screen.getByLabelText('আয়োজন ও প্রয়োজনের কথা'), {
    target: { value: 'A meaningful unfinished celebration.' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'অর্ডারের অনুরোধ পাঠান' }));
  await screen.findByRole('alert');
  expect(localStorage.getItem('dawat:request-draft:buyer@example.test')).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'অর্ডারের অনুরোধ পাঠান' }));
  await screen.findByRole('status');
  expect(localStorage.getItem('dawat:request-draft:buyer@example.test')).toBeNull();
});

it.each([null, 'active'])(
  'keeps rejected evidence as history without correction instructions after verification (access %s)',
  (access) => {
    const payment: PaymentSubmission = {
      id: row.id,
      request_id: row.id,
      method: 'bKash',
      reference: 'OLDREJECTED',
      sender: '01700000000',
      amount_minor: 75000,
      state: 'rejected',
      review_note: 'Old rejected evidence.',
      created_at: row.created_at,
    };
    show({
      ...page,
      requests: [{ ...row, state: 'ordered', order_id: row.id }],
      payments: [
        payment,
        {
          ...payment,
          id: '20000000-0000-4000-8000-000000000003',
          reference: 'FINALVERIFIED',
          state: 'verified',
        },
      ],
      progress: [
        {
          requestId: row.id,
          status: 'confirmed',
          paymentStatus: 'manually_verified',
          access,
          weddingId: access ? row.id : null,
        },
      ],
    });
    expect(screen.getByText('bKash · OLDREJECTED')).toBeTruthy();
    expect(screen.getByText('bKash · FINALVERIFIED')).toBeTruthy();
    expect(screen.queryByText(/আগে টাকা পাঠিয়ে থাকলে আবার পাঠাবেন না/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'যাচাইয়ের জন্য জমা দিন' })).toBeNull();
    if (access) expect(screen.getByRole('link', { name: 'আপনার পোর্টাল খুলুন' })).toBeTruthy();
  },
);
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
it('submits actual bKash evidence and hides transfer instructions while review is pending', async () => {
  const ordered = { ...row, state: 'ordered' as const, order_id: row.id };
  const progress = [
    { requestId: row.id, status: 'reviewing', paymentStatus: 'pending', access: null, weddingId: null },
  ];
  const initial = { ...page, requests: [ordered], progress };
  const payment = {
    id: row.id,
    request_id: row.id,
    method: 'bKash',
    reference: 'LOCALTX12345',
    sender: '01700000000',
    amount_minor: 75000,
    state: 'pending',
    review_note: '',
    created_at: row.created_at,
  };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: payment })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { ...initial, payments: [payment] } })));
  vi.stubGlobal('fetch', fetcher);
  show(initial);
  expect(screen.getByDisplayValue('01606092143')).toBeTruthy();
  expect(screen.getByDisplayValue(orderPaymentReference(row.id))).toBeTruthy();
  expect(screen.queryByRole('combobox', { name: 'পেমেন্টের মাধ্যম' })).toBeNull();
  fireEvent.change(screen.getByLabelText('যে বিকাশ নম্বর থেকে পাঠিয়েছেন'), {
    target: { value: '01700000000' },
  });
  fireEvent.change(screen.getByLabelText('Transaction ID'), { target: { value: 'LOCALTX12345' } });
  fireEvent.click(screen.getByRole('button', { name: 'যাচাইয়ের জন্য জমা দিন' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'যাচাইয়ের জন্য জমা দিন' })).toBeNull());
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({
    kind: 'submit',
    requestId: row.id,
    method: 'bKash',
    reference: 'LOCALTX12345',
    sender: '01700000000',
  });
  expect(screen.queryByDisplayValue('01606092143')).toBeNull();
  expect(screen.queryByRole('link', { name: 'আপনার পোর্টাল খুলুন' })).toBeNull();
});
it('rejects an order reference used as a transaction ID and unconfigured payment methods', () => {
  const input = {
    kind: 'submit',
    requestId: row.id,
    method: 'bKash',
    reference: 'LOCALTX12345',
    sender: '01700000000',
  };
  expect(paymentCommand.safeParse(input).success).toBe(true);
  expect(
    paymentCommand.safeParse({ ...input, reference: orderPaymentReference(row.id).toLowerCase() }).success,
  ).toBe(false);
  expect(paymentCommand.safeParse({ ...input, method: 'Nagad' }).success).toBe(false);
});
it('shows an existing request after reload instead of a blank order form', () => {
  render(
    <ProductLocale>
      <SalesDesk
        initial={{ ...page, requests: [{ ...row, state: 'requested' }] }}
        email="buyer@example.test"
        templateId="garden"
      />
    </ProductLocale>,
  );
  expect(screen.queryByRole('button', { name: /অর্ডারের অনুরোধ পাঠান/ })).toBeNull();
  expect(screen.getByText('আমরা দাম ও শর্ত পাঠাব')).toBeTruthy();
});
it('hides details when the selected filter has no matching request', () => {
  render(
    <ProductLocale>
      <SalesDesk
        initial={{ ...page, requests: [{ ...row, state: 'ordered', order_id: row.id }] }}
        email="seller@example.test"
        seller
      />
    </ProductLocale>,
  );
  expect(screen.getByText('Test buyer', { selector: 'h2' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'দাম ও শর্ত' }));
  expect(screen.queryByText('Test buyer', { selector: 'h2' })).toBeNull();
});
it('makes the seller choose a payment decision and links to that exact order', () => {
  const ordered = { ...row, state: 'ordered' as const, order_id: '20000000-0000-4000-8000-000000000009' };
  render(
    <ProductLocale>
      <SalesDesk
        initial={{
          ...page,
          requests: [ordered],
          payments: [
            {
              id: '20000000-0000-4000-8000-000000000003',
              request_id: row.id,
              method: 'bKash',
              reference: 'LOCALTX12345',
              sender: '01700000000',
              amount_minor: 75000,
              state: 'pending',
              review_note: '',
              created_at: '2026-10-26T00:00:00Z',
            },
          ],
        }}
        email="seller@example.test"
        seller
      />
    </ProductLocale>,
  );
  expect((screen.getByLabelText('সিদ্ধান্ত') as HTMLSelectElement).value).toBe('');
  expect(screen.queryByText(/Send Money করুন/)).toBeNull();
  expect(screen.getByRole('link', { name: /এই অর্ডার নিশ্চিত/ }).getAttribute('href')).toBe(
    '/admin/orders/?order=20000000-0000-4000-8000-000000000009',
  );
});

it('prefills names only when no request draft exists and preserves an existing draft', async () => {
  const empty = { requests: [], payments: [], progress: [], nextCursor: null };
  const view = render(<SalesDesk initial={empty} email="new@example.test" names="মেহরিন ও আরিব" />);
  expect((screen.getByLabelText('আয়োজন ও প্রয়োজনের কথা') as HTMLTextAreaElement).value).toBe('বর ও কনে: মেহরিন ও আরিব');
  view.unmount();
  localStorage.setItem('dawat:request-draft:new@example.test', JSON.stringify({ name: 'Test', date: '', brief: 'Existing draft stays here.', template: 'jamdani' }));
  render(<SalesDesk initial={empty} email="new@example.test" names="Other names" />);
  await waitFor(() => expect((screen.getByLabelText('আয়োজন ও প্রয়োজনের কথা') as HTMLTextAreaElement).value).toBe('Existing draft stays here.'));
});
