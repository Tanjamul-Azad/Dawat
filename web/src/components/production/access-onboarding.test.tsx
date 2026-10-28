// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SalesDesk } from './sales-desk';
import { NotifyCustomer, customerReadyMessage } from './notify-customer';
import { ProductLocale } from './product-locale';
import type { PaymentSubmission, SalesPage, SalesRequest } from '@/features/production/sales';
import { salesCommand } from '@/features/production/sales';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const row: SalesRequest = {
  id: '20000000-0000-4000-8000-000000000001',
  user_id: '20000000-0000-4000-8000-000000000002',
  customer_email: 'buyer@example.test',
  customer_phone: '+8801712345678',
  customer_name: 'রাইহান',
  template_id: 'garden',
  event_date: null,
  brief: 'A fictional wedding',
  state: 'ordered',
  package_name: 'প্রিমিয়াম',
  amount_minor: 75000,
  term_days: 90,
  quote_notes: 'Agreed terms.',
  order_id: '20000000-0000-4000-8000-000000000003',
  revision: 2,
  created_at: '2026-10-26T00:00:00Z',
  updated_at: '2026-10-26T00:00:00Z',
};
const pending: PaymentSubmission = {
  id: '20000000-0000-4000-8000-000000000004',
  request_id: row.id,
  method: 'bKash',
  reference: 'LOCALTX12345',
  sender: '01700000000',
  amount_minor: 75000,
  state: 'pending',
  review_note: '',
  created_at: row.created_at,
};
const empty: SalesPage = { requests: [], payments: [], progress: [], nextCursor: null };
// Bangla য়/ড়/ঢ় exist in two encodings; compare them as one.
const same = (expected: string) => (content: string) =>
  content.normalize('NFC') === expected.normalize('NFC');
// The admin frame also polls /api/admin/summary/, so answer by method instead of by call order.
function answers({ post, get }: { post: unknown; get: unknown }) {
  return vi.fn(
    async (url: string, init?: RequestInit) =>
      new Response(
        JSON.stringify({
          data:
            init?.method === 'POST'
              ? post
              : String(url).includes('/summary/')
                ? { newRequests: 0, pendingPayments: 1 }
                : get,
        }),
      ),
  );
}
const posted = (fetcher: ReturnType<typeof answers>) =>
  JSON.parse(fetcher.mock.calls.find(([, init]) => init?.method === 'POST')![1]!.body as string);
const wrap = (node: React.ReactNode) => render(<ProductLocale>{node}</ProductLocale>);

it('builds the "tell the customer" message from live data, with a ready WhatsApp chat and copy', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  const url = 'https://dawat.example/weddings/abc/';
  wrap(<NotifyCustomer name="রাইহান" email="buyer@example.test" phone="+8801712345678" url={url} />);
  const link = screen.getByRole('link', { name: 'WhatsApp-এ জানান' });
  const href = link.getAttribute('href')!;
  expect(href.startsWith('https://wa.me/8801712345678?text=')).toBe(true);
  const text = new URL(href).searchParams.get('text')!;
  expect(text).toBe(customerReadyMessage({ name: 'রাইহান', email: 'buyer@example.test', url }, 'bn'));
  expect(text).toContain(url);
  expect(text).toContain('buyer@example.test');
  expect(link.getAttribute('rel')).toContain('noreferrer');
  expect(screen.getByText(/01712-345678/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'বার্তা কপি করুন' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(text));
  expect((await screen.findByRole('status')).textContent).toContain('কপি হয়েছে');
});

it('falls back to choosing the contact when the customer gave no number', () => {
  wrap(
    <NotifyCustomer name="X" email="x@example.test" phone={null} url="https://dawat.example/weddings/a/" />,
  );
  const link = screen.getByRole('link', { name: 'WhatsApp খুলুন' });
  expect(link.getAttribute('href')!.startsWith('https://wa.me/?text=')).toBe(true);
  expect(screen.getByText(/নম্বর দেননি/)).toBeTruthy();
});

it('shows the persistent card for the team once the customer’s page is open, and the number beside the email', () => {
  const data: SalesPage = {
    ...empty,
    requests: [row],
    payments: [{ ...pending, state: 'verified' }],
    progress: [
      {
        requestId: row.id,
        status: 'confirmed',
        paymentStatus: 'manually_verified',
        access: 'active',
        weddingId: row.order_id,
      },
    ],
  };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data }))));
  wrap(<SalesDesk initial={data} email="seller@example.test" seller />);
  expect(screen.getByRole('region', { name: 'গ্রাহককে জানান' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'WhatsApp 01712-345678' })).toBeTruthy();
});

it('offers one-click activation only when the transfer matched and the order is still unconfirmed', async () => {
  const data: SalesPage = {
    ...empty,
    requests: [row],
    payments: [pending],
    progress: [
      { requestId: row.id, status: 'reviewing', paymentStatus: 'pending', access: null, weddingId: null },
    ],
  };
  const fetcher = answers({ post: { ...pending, state: 'verified' }, get: data });
  vi.stubGlobal('fetch', fetcher);
  wrap(<SalesDesk initial={data} email="seller@example.test" seller />);
  const form = screen.getByRole('button', { name: 'সিদ্ধান্ত সংরক্ষণ করুন' }).closest('form')!;
  const label = same('সঙ্গে সঙ্গে অর্ডার নিশ্চিত করে আয়োজনের পাতা চালু করুন');
  expect(within(form).queryByLabelText(label)).toBeNull();
  fireEvent.change(within(form).getByLabelText('সিদ্ধান্ত'), { target: { value: 'reject' } });
  expect(within(form).queryByLabelText(label)).toBeNull();
  fireEvent.change(within(form).getByLabelText('সিদ্ধান্ত'), { target: { value: 'verify' } });
  expect((within(form).getByLabelText(label) as HTMLInputElement).checked).toBe(true);
  fireEvent.change(within(form).getByLabelText(same('যাচাইয়ের বিবরণ / গ্রাহককে জানানোর কারণ')), {
    target: { value: 'Matched the bKash app record.' },
  });
  const [, consent] = within(form).getAllByRole('checkbox');
  fireEvent.click(consent);
  fireEvent.click(within(form).getByRole('button', { name: 'সিদ্ধান্ত সংরক্ষণ করুন' }));
  await waitFor(() => expect(fetcher.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true));
  expect(posted(fetcher)).toEqual({
    kind: 'verify',
    id: pending.id,
    reason: 'Matched the bKash app record.',
    activate: true,
  });
});

it('does not offer one-click activation when the order is already confirmed', () => {
  const data: SalesPage = {
    ...empty,
    requests: [row],
    payments: [pending],
    progress: [
      { requestId: row.id, status: 'confirmed', paymentStatus: 'pending', access: null, weddingId: null },
    ],
  };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data }))));
  wrap(<SalesDesk initial={data} email="seller@example.test" seller />);
  fireEvent.change(screen.getByLabelText('সিদ্ধান্ত'), { target: { value: 'verify' } });
  expect(screen.queryByLabelText(/সঙ্গে সঙ্গে অর্ডার নিশ্চিত/)).toBeNull();
});

it('sends the optional WhatsApp number typed on the request form and keeps it in the draft', async () => {
  const fetcher = answers({
    post: { ...row, state: 'quoted' },
    get: { ...empty, requests: [{ ...row, state: 'quoted' }] },
  });
  vi.stubGlobal('fetch', fetcher);
  wrap(<SalesDesk initial={empty} email="buyer@example.test" templateId="garden" />);
  fireEvent.change(screen.getByLabelText('আপনার নাম'), { target: { value: 'রাইহান' } });
  fireEvent.change(screen.getByLabelText(/WhatsApp নম্বর/), { target: { value: '০১৭১২৩৪৫৬৭৮' } });
  fireEvent.change(screen.getByLabelText(same('আয়োজন ও প্রয়োজনের কথা')), {
    target: { value: 'A fictional celebration.' },
  });
  expect(JSON.parse(localStorage.getItem('dawat:request-draft:buyer@example.test')!).phone).toBe(
    '০১৭১২৩৪৫৬৭৮',
  );
  fireEvent.click(screen.getByRole('button', { name: 'অর্ডারের অনুরোধ পাঠান' }));
  await waitFor(() => expect(fetcher.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true));
  expect(posted(fetcher)).toMatchObject({
    kind: 'request',
    templateId: 'garden',
    phone: '০১৭১২৩৪৫৬৭৮',
  });
  expect((await screen.findByRole('status')).textContent).toContain('দাম ও শর্ত তৈরি');
});

it('prefills the couple names from the public site and opens the form even with an earlier request', () => {
  wrap(
    <SalesDesk
      initial={{ ...empty, requests: [{ ...row, state: 'quoted' }] }}
      email="buyer@example.test"
      templateId="garden"
      names="রাইহান ও নাবিলা"
    />,
  );
  expect((screen.getByLabelText(same('আয়োজন ও প্রয়োজনের কথা')) as HTMLTextAreaElement).value).toBe(
    'বর ও কনে: রাইহান ও নাবিলা',
  );
});

it('normalises the number on the way in and refuses one that is not a number', () => {
  const base = {
    kind: 'request',
    templateId: 'garden',
    name: 'X',
    brief: 'A fictional celebration.',
    eventDate: '',
  };
  expect(salesCommand.parse({ ...base, phone: '০১৭১২৩৪৫৬৭৮' })).toMatchObject({ phone: '+8801712345678' });
  expect(salesCommand.parse({ ...base, phone: '' }).kind).toBe('request');
  expect(salesCommand.parse(base)).not.toHaveProperty('phone', expect.anything());
  const bad = salesCommand.safeParse({ ...base, phone: '12345' });
  expect(bad.success).toBe(false);
  expect(bad.error?.issues[0].message).toBe('Enter a valid WhatsApp number, or leave it empty.');
});

it('refreshes nothing on its own for the buyer when there is no admin frame', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: empty })));
  vi.stubGlobal('fetch', fetcher);
  wrap(<SalesDesk initial={empty} email="buyer@example.test" />);
  await act(async () => {});
  expect(fetcher.mock.calls.some(([url]) => String(url).includes('/api/admin/summary/'))).toBe(false);
});
