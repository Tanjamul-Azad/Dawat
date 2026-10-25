// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { GuestHub } from './guest-hub';
import type { HouseholdReport, HouseholdRow } from '@/features/production/guests';
import { downloadCsv } from '@/features/production/download';
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
  fireEvent.click(screen.getByRole('checkbox', { name: 'সংবর্ধনা' }));
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
