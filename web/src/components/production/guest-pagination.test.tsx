// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { GuestHub } from './guest-hub';
import type { HouseholdReport, HouseholdRow } from '@/features/production/guests';
import { downloadCsv } from '@/features/production/download';
vi.mock('./open-invite', () => ({ OpenInviteCard: () => null, HostWhatsappSettings: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('@/features/production/download', () => ({ downloadCsv: vi.fn(async () => {}) }));
const wid = '20000000-0000-4000-8000-000000000001';
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
const makeRow = (n: number): HouseholdRow => ({
  id: `20000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  name: `অতিথি ${n}`,
  nameBn: '',
  greeting: '',
  greetingEn: '',
  message: '',
  messageEn: '',
  privateNote: '',
  events: [{ eventId: 'reception', maxPeople: 1 }],
  revision: 1,
  responseRevision: 0,
  linkRevision: 0,
  linkState: 'missing',
  responses: {},
});
const report = (start: number, size: number, nextCursor: string | null): HouseholdReport => ({
  rows: Array.from({ length: size }, (_, n) => makeRow(start + n)),
  nextCursor,
  summary: { invited: 51, accepted: 0, declined: 0, pending: 51, adults: 0, children: 0 },
  policies: [],
  policyRevision: 0,
  asOf: '2026-10-26T00:00:00Z',
});
const first = report(1, 25, 'cursor-a');
const json = (data: unknown) => new Response(JSON.stringify({ data }));
const mount = (initial = first) =>
  render(
    <GuestHub
      wid={wid}
      slug={wid}
      title="নমুনা"
      email="test@example.test"
      events={[
        { id: 'reception', title: 'সংবর্ধনা', date: '2026-12-12', time: '19:00', venue: 'ঢাকা', address: '' },
      ]}
      initial={initial}
      initialEvent="reception"
    />,
  );
const query = (fetcher: ReturnType<typeof vi.fn>, i: number) =>
  new URL(String(fetcher.mock.calls[i][0]), 'http://localhost').searchParams;
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('navigates forward/back with applied filters, resets search pagination and exports the displayed filters', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(json(report(26, 25, 'cursor-b')))
    .mockResolvedValueOnce(json(report(51, 1, null)))
    .mockResolvedValueOnce(json(report(26, 25, 'cursor-b')))
    .mockResolvedValueOnce(json(report(9, 1, null)));
  vi.stubGlobal('fetch', fetcher);
  mount();
  fireEvent.change(screen.getByRole('textbox', { name: 'নাম দিয়ে খুঁজুন' }), {
    target: { value: 'নতুন খোঁজ' },
  });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'CSV নামান' })));
  expect(
    new URL(String(vi.mocked(downloadCsv).mock.calls[0][0]), 'http://localhost').searchParams.get('search'),
  ).toBe('');
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'পরের পাতা' })));
  expect(query(fetcher, 0).get('search')).toBe('');
  expect(query(fetcher, 0).get('after')).toBe('cursor-a');
  expect(screen.getByText('পাতা ২ · এই পাতায় ২৫টি')).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'পরের পাতা' })));
  expect(screen.getByText('পাতা ৩ · এই পাতায় ১টি')).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'আগের পাতা' })));
  expect(query(fetcher, 2).get('after')).toBe('cursor-a');
  expect(screen.getByText('পাতা ২ · এই পাতায় ২৫টি')).toBeTruthy();
  await act(async () => fireEvent.submit(screen.getByRole('button', { name: 'খুঁজুন' }).closest('form')!));
  expect(query(fetcher, 3).has('after')).toBe(false);
  expect(query(fetcher, 3).get('search')).toBe('নতুন খোঁজ');
  expect(screen.getByText('পাতা ১ · এই পাতায় ১টি')).toBeTruthy();
});

it('retains the current page on failure instead of inventing a new page or empty result', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
  mount();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'পরের পাতা' })));
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'অতিথি 1' })).toBeTruthy();
  expect(screen.getByText('পাতা ১ · এই পাতায় ২৫টি')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'আগের পাতা' }) as HTMLButtonElement).disabled).toBe(true);
});

it('creates a single-person invitation with Bangla digits and leaves unchecked events out', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(json({ revision: 1 }))
    .mockResolvedValueOnce(json(first));
  vi.stubGlobal('fetch', fetcher);
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'অতিথি যোগ করুন' }));
  fireEvent.change(screen.getByLabelText('অতিথি বা দলের নাম'), { target: { value: 'সাবিহা রহমান' } });
  expect((screen.getByRole('checkbox', { name: 'সংবর্ধনা' }) as HTMLInputElement).checked).toBe(true);
  fireEvent.change(screen.getByLabelText('মোট অনুমোদিত লোকসংখ্যা'), { target: { value: '১' } });
  await act(async () => fireEvent.submit(screen.getByRole('dialog').querySelector('form')!));
  const sent = JSON.parse(fetcher.mock.calls[0][1].body).household;
  expect(sent.name).toBe('সাবিহা রহমান');
  expect(sent.events).toEqual([{ eventId: 'reception', maxPeople: 1 }]);
  expect(sent.greeting).toBe('');
});

it('retains an answered event when its protected checkbox is disabled during editing', async () => {
  const answered = {
    ...makeRow(1),
    responses: {
      reception: {
        attendance: 'accepted' as const,
        adults: 1,
        children: 0,
        note: '',
        updatedAt: '2026-10-26T00:00:00Z',
      },
    },
  };
  const data = { ...first, rows: [answered] };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(json({ revision: 2 }))
    .mockResolvedValueOnce(json(data));
  vi.stubGlobal('fetch', fetcher);
  mount(data);
  fireEvent.click(screen.getByRole('button', { name: 'অতিথি 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'আমন্ত্রণ বদলান' }));
  expect((screen.getByRole('checkbox', { name: 'সংবর্ধনা' }) as HTMLInputElement).disabled).toBe(true);
  await act(async () => fireEvent.submit(screen.getByRole('dialog').querySelector('form')!));
  expect(JSON.parse(fetcher.mock.calls[0][1].body).household.events).toEqual([
    { eventId: 'reception', maxPeople: 1 },
  ]);
});

it('copies a personal link without opening a dialog when the clipboard works', async () => {
  const writeText = vi.fn(async () => {});
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(json({ url: 'https://example.test/i/x/h/1' }))
    .mockResolvedValueOnce(json(first));
  vi.stubGlobal('fetch', fetcher);
  mount();
  await act(async () =>
    fireEvent.click(screen.getAllByRole('button', { name: /তৈরি করে কপি করুন · অতিথি 1/ })[0]),
  );
  expect(writeText).toHaveBeenCalledWith('https://example.test/i/x/h/1');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getAllByRole('status').some((n) => n.textContent?.includes('অতিথি 1-এর লিংক কপি'))).toBe(
    true,
  );
  // The page notice can be off-screen on a phone; the row's own button confirms the copy.
  expect(screen.getAllByRole('button', { name: /কপি করুন · অতিথি 1$/ })[0].textContent).toContain('কপি হয়েছে');
});

it('adds pasted families one by one with the event preselected', async () => {
  const fetcher = vi.fn(async (_url: string, init?: RequestInit) =>
    init?.method === 'POST' ? json({ revision: 1 }) : json(first),
  );
  vi.stubGlobal('fetch', fetcher);
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'একসঙ্গে অনেক পরিবার' }));
  fireEvent.change(screen.getByLabelText('পরিবারের তালিকা'), {
    target: { value: 'রহমান পরিবার, ৪\nসাবিহা আপা\n\nঅনেক বড় দল, 99' },
  });
  expect(screen.getByText(/২টি প্রস্তুত|2টি প্রস্তুত/)).toBeTruthy();
  expect((screen.getByRole('button', { name: /টি পরিবার যোগ করুন/ }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('পরিবারের তালিকা'), {
    target: { value: 'রহমান পরিবার, ৪\nসাবিহা আপা' },
  });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /টি পরিবার যোগ করুন/ })));
  const posts = fetcher.mock.calls.filter((c) => (c[1] as RequestInit | undefined)?.method === 'POST');
  expect(posts).toHaveLength(2);
  expect(JSON.parse(String((posts[0][1] as RequestInit).body)).household).toMatchObject({
    name: 'রহমান পরিবার',
    events: [{ eventId: 'reception', maxPeople: 4 }],
  });
  expect(JSON.parse(String((posts[1][1] as RequestInit).body)).household.events).toEqual([
    { eventId: 'reception', maxPeople: 1 },
  ]);
});

it('retries an uncertain batch row with the same ID and idempotency key without replaying saved rows', async () => {
  let posts = 0;
  const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method !== 'POST') return json(first);
    posts++;
    if (posts === 2) throw new TypeError('connection lost after server commit');
    return json({ revision: 1 });
  });
  vi.stubGlobal('fetch', fetcher);
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'একসঙ্গে অনেক পরিবার' }));
  fireEvent.change(screen.getByLabelText('পরিবারের তালিকা'), {
    target: { value: 'প্রথম পরিবার, 4\nদ্বিতীয় পরিবার, 2\nতৃতীয় পরিবার, 3' },
  });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /টি পরিবার যোগ করুন/ })));
  expect(screen.getByRole('alert').textContent).toContain('1টি নিশ্চিতভাবে');
  expect((screen.getByLabelText('পরিবারের তালিকা') as HTMLTextAreaElement).disabled).toBe(true);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'বাকিগুলো আবার চেষ্টা করুন' })));
  const requests = fetcher.mock.calls.filter((call) => call[1]?.method === 'POST');
  expect(requests).toHaveLength(4);
  expect(requests[2][1]?.body).toBe(requests[1][1]?.body);
  expect(requests[2][1]?.headers).toEqual(requests[1][1]?.headers);
  expect(requests[0][1]?.body).not.toBe(requests[2][1]?.body);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('rejects over 100 pasted families without silently truncating the list', () => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'একসঙ্গে অনেক পরিবার' }));
  fireEvent.change(screen.getByLabelText('পরিবারের তালিকা'), {
    target: { value: Array.from({ length: 101 }, (_, i) => `পরিবার ${i}, 2`).join('\n') },
  });
  expect(screen.getByRole('alert').textContent).toContain('১০০টির বেশি');
  expect((screen.getByRole('button', { name: /টি পরিবার যোগ করুন/ }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect(fetcher).not.toHaveBeenCalled();
});

it.each(['100', '-1', '1.5', 'abc'])(
  'rejects malformed bulk allowance %s instead of treating it as part of the name',
  (count) => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'একসঙ্গে অনেক পরিবার' }));
    fireEvent.change(screen.getByLabelText('পরিবারের তালিকা'), { target: { value: `পরিবার, ${count}` } });
    expect((screen.getByRole('button', { name: /টি পরিবার যোগ করুন/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(fetcher).not.toHaveBeenCalled();
  },
);

it('checks duplicate names beyond the first search page', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(json(report(1, 25, 'cursor-a')))
    .mockResolvedValueOnce(
      json({ ...report(26, 1, null), rows: [{ ...makeRow(26), name: 'রহমান পরিবার' }] }),
    );
  vi.stubGlobal('fetch', fetcher);
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'অতিথি যোগ করুন' }));
  const input = screen.getByLabelText('অতিথি বা দলের নাম');
  fireEvent.change(input, { target: { value: 'রহমান পরিবার' } });
  await act(async () => fireEvent.blur(input));
  expect(query(fetcher, 1).get('after')).toBe('cursor-a');
  expect(screen.getByText(/নামে আগেই একটি পরিবার আছে/)).toBeTruthy();
});

it('retains an unsaved bulk list when closing is cancelled and warns before leaving', () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'একসঙ্গে অনেক পরিবার' }));
  fireEvent.change(screen.getByLabelText('পরিবারের তালিকা'), { target: { value: 'রহমান পরিবার, 4' } });
  fireEvent.click(screen.getByRole('button', { name: 'বন্ধ করুন' }));
  expect(confirm).toHaveBeenCalledOnce();
  expect((screen.getByLabelText('পরিবারের তালিকা') as HTMLTextAreaElement).value).toBe('রহমান পরিবার, 4');
  const leaving = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(leaving);
  expect(leaving.defaultPrevented).toBe(true);
});

it('keeps the editor open for the next family after "save & add another"', async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(json({ revision: 1 }))
    .mockResolvedValueOnce(json(first));
  vi.stubGlobal('fetch', fetcher);
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'অতিথি যোগ করুন' }));
  fireEvent.change(screen.getByLabelText('অতিথি বা দলের নাম'), { target: { value: 'প্রথম পরিবার' } });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'সংরক্ষণ করে পরেরটি যোগ করুন' })));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect((screen.getByLabelText('অতিথি বা দলের নাম') as HTMLInputElement).value).toBe('');
});

it('normalizes the optional third bulk column and blocks all rows when one phone is invalid', async () => {
  const fetcher = vi.fn(async () => json(first)); vi.stubGlobal('fetch', fetcher); mount();
  fireEvent.click(screen.getByRole('button', { name: 'একসঙ্গে অনেক পরিবার' }));
  const input = screen.getByRole('textbox', { name: 'পরিবারের তালিকা' });
  fireEvent.change(input, { target: { value: 'পরিবার এক, ২, ০১৭০০০০০০০১\nপরিবার দুই, ১, 0171234' } });
  expect(screen.getByRole('button', { name: /পরিবার যোগ করুন/ }).hasAttribute('disabled')).toBe(true);
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: 'পরিবার এক, ২, ০১৭০০০০০০০১' } });
  await act(async () => fireEvent.click(screen.getByRole('button', { name: /পরিবার যোগ করুন/ })));
  const writes = fetcher.mock.calls.filter((call: any[]) => call[1]?.method === 'POST');
  expect(JSON.parse((writes[0] as any)[1].body).household.contactPhone).toBe('+8801700000001');
});
