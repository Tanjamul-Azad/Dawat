// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { WeddingDesk } from './wedding-desk';
import { WorkspaceFrame } from './frame';
import { ResponseEditor } from './response-editor';
import { GuestHub } from './guest-hub';
import { ProductLocale } from './product-locale';
import { emptyDraft, type WeddingDetail } from '@/features/production/contracts';
import type { HouseholdRow } from '@/features/production/guests';
import { templateWording } from '@/features/production/template-wording';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
const wid = '20000000-0000-4000-8000-000000000001';
const initial: WeddingDetail = {
  wedding: {
    id: wid,
    title: 'রহমান পরিবার',
    slug: wid,
    visibility: 'private',
    state: 'active',
    publication_revision: 0,
  },
  content: emptyDraft(),
  revision: 0,
  updatedAt: '2026-10-20T10:00:00Z',
  expiresAt: null,
  termDays: 90,
  publishedDraftRevision: null,
};
const json = (data: unknown) => new Response(JSON.stringify({ data }));
const pause = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.cookie = 'dawat_ui=; Path=/; Max-Age=0';
});
function editor() {
  render(
    <ProductLocale>
      <WeddingDesk initial={initial} email="test@example.test" />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'নাম ও আমন্ত্রণ' }));
  return screen.getByLabelText('প্রথম জনের নাম') as HTMLInputElement;
}

it('provides ready wording behind an edit action while leaving personal details empty', () => {
  const input = editor();
  expect(input.value).toBe('');
  expect(screen.getByText(templateWording.message)).toBeTruthy();
  expect(screen.queryByLabelText('আমন্ত্রণের লেখা')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'লেখা সম্পাদনা করুন' }));
  expect((screen.getByLabelText('আমন্ত্রণের লেখা') as HTMLTextAreaElement).value).toBe(
    templateWording.message,
  );
  expect(initial.content.events.every((event) => !event.venue && !event.date && !event.time)).toBe(true);
});

it('keeps a saved personal message and does not save simply for opening the editor', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  render(
    <ProductLocale>
      <WeddingDesk
        initial={{
          ...initial,
          content: { ...initial.content, hosts: 'আমাদের পরিবারের পক্ষ থেকে', message: 'আমাদের নিজের লেখা' },
        }}
        email="test@example.test"
        initialSection="names"
      />
    </ProductLocale>,
  );
  expect(screen.getByText('আমাদের নিজের লেখা')).toBeTruthy();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(4000);
  });
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'লেখা সম্পাদনা করুন' }));
  expect((screen.getByLabelText('আমন্ত্রণের লেখা') as HTMLTextAreaElement).value).toBe('আমাদের নিজের লেখা');
});

it('opens the displayed default as editable text for a legacy blank draft', () => {
  render(
    <ProductLocale>
      <WeddingDesk
        initial={{
          ...initial,
          content: { ...initial.content, hosts: '', message: '', messageEn: undefined },
        }}
        email="test@example.test"
        initialSection="names"
      />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'লেখা সম্পাদনা করুন' }));
  expect((screen.getByLabelText('আমন্ত্রণের লেখা') as HTMLTextAreaElement).value).toBe(
    templateWording.message,
  );
});

it('lists households with event-specific replies and keeps controls usable during quiet refresh', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn((_input: unknown) => new Promise<Response>(() => {}));
  vi.stubGlobal('fetch', fetcher);
  const row: HouseholdRow = {
    id: wid,
    name: 'কাল্পনিক পরিবার',
    nameBn: '',
    greeting: '',
    greetingEn: '',
    message: '',
    messageEn: '',
    privateNote: '',
    events: [
      { eventId: 'reception', maxPeople: 4 },
      { eventId: 'nikah', maxPeople: 2 },
    ],
    revision: 1,
    responseRevision: 1,
    linkRevision: 1,
    linkState: 'active',
    responses: {
      reception: {
        attendance: 'accepted',
        adults: 2,
        children: 1,
        note: '',
        updatedAt: '2026-10-21T00:00:00Z',
      },
      nikah: { attendance: 'declined', adults: 0, children: 0, note: '', updatedAt: '2026-10-21T00:00:00Z' },
    },
  };
  render(
    <ProductLocale>
      <GuestHub
        wid={wid}
        slug={wid}
        title="টেস্ট"
        email="test@example.test"
        events={[
          {
            id: 'reception',
            title: 'বিয়ের ভোজ',
            date: '2026-12-12',
            time: '19:00',
            venue: 'ঢাকা',
            address: '',
          },
        ]}
        initialEvent="reception"
        initial={{
          rows: [row],
          nextCursor: null,
          summary: { invited: 1, accepted: 1, declined: 0, pending: 0, adults: 2, children: 1 },
          policies: [],
          policyRevision: 0,
          asOf: '2026-10-21T00:00:00Z',
        }}
      />
    </ProductLocale>,
  );
  const table = screen.getByRole('table');
  expect(within(table).getByRole('columnheader', { name: 'অতিথি / দল' })).toBeTruthy();
  expect(within(table).queryByText('বিয়ের ভোজ · ৪ জন / আকদ · ২ জন')).toBeNull();
  fireEvent.click(within(table).getByRole('button', { name: 'কাল্পনিক পরিবার' }));
  expect(within(table).getByText('বিয়ের ভোজ · ৪ জন / আকদ · ২ জন')).toBeTruthy();
  expect(within(table).getAllByText(/আসবেন/).length).toBeGreaterThan(0);
  expect(within(table).queryByText('আসবেন না')).toBeNull();
  const copy = within(table).getByRole('button', {
    name: 'লিংক কপি করুন · কাল্পনিক পরিবার',
  }) as HTMLButtonElement;
  fireEvent.change(screen.getByRole('textbox', { name: 'নাম দিয়ে খুঁজুন' }), {
    target: { value: 'এখনও জমা দিইনি' },
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(String(fetcher.mock.calls[0][0])).toContain('search=&');
  expect(copy.disabled).toBe(false);
});

it('switches between the three workspace destinations without dropping unsaved editor text', () => {
  const input = editor();
  fireEvent.change(input, { target: { value: 'অক্ষত নাম' } });
  fireEvent.click(screen.getByRole('link', { name: 'সারসংক্ষেপ' }));
  fireEvent.click(screen.getByRole('link', { name: 'আমন্ত্রণ সম্পাদনা' }));
  expect((screen.getByLabelText('প্রথম জনের নাম') as HTMLInputElement).value).toBe('অক্ষত নাম');
});

it('saves a reception-only setup, clears its removed general scope and restores stashed event details', async () => {
  const fetcher = vi.fn().mockResolvedValue(json({ revision: 1, updatedAt: '2026-10-21T10:00:00Z' }));
  vi.stubGlobal('fetch', fetcher);
  render(
    <ProductLocale>
      <WeddingDesk
        initial={{ ...initial, content: { ...initial.content, generalEventIds: ['nikah'] } }}
        email="owner@example.test"
      />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'অনুষ্ঠান' }));
  fireEvent.change(screen.getAllByLabelText('অনুষ্ঠানের স্থান')[0], { target: { value: 'ঢাকা বাগান' } });
  fireEvent.click(screen.getByLabelText('আকদ রাখুন'));
  expect((screen.getByLabelText('সংবর্ধনা রাখুন') as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'খসড়া সংরক্ষণ' }));
  await pause();
  const sent = JSON.parse(fetcher.mock.calls[0][1].body).content;
  expect(sent.events.map((event: { id: string }) => event.id)).toEqual(['reception']);
  expect(sent.generalEventIds).toEqual([]);
  fireEvent.click(screen.getByLabelText('আকদ রাখুন'));
  expect(
    screen
      .getAllByLabelText('অনুষ্ঠানের স্থান')
      .some((input) => (input as HTMLInputElement).value === 'ঢাকা বাগান'),
  ).toBe(true);
});
it('does not allow removing a celebration with saved replies', () => {
  render(
    <ProductLocale>
      <WeddingDesk initial={{ ...initial, protectedEventIds: ['nikah'] }} email="owner@example.test" />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'অনুষ্ঠান' }));
  expect((screen.getByLabelText('আকদ রাখুন') as HTMLInputElement).disabled).toBe(true);
});
it('shows the current published general link even when the saved draft has no general events', () => {
  render(
    <ProductLocale>
      <WeddingDesk
        initial={{
          ...initial,
          wedding: { ...initial.wedding, visibility: 'live' },
          publishedDraftRevision: 1,
          revision: 2,
          publishedGeneralEventIds: ['reception'],
        }}
        email="owner@example.test"
      />
    </ProductLocale>,
  );
  expect(screen.getByRole('link', { name: 'সাধারণ আমন্ত্রণ দেখুন · উত্তর দেওয়া যাবে না' })).toBeTruthy();
});
it('gives an unpublished guest workspace a direct editing action without live report controls', () => {
  render(
    <ProductLocale>
      <GuestHub
        wid={wid}
        slug={wid}
        title="টেস্ট আয়োজন"
        email="owner@example.test"
        events={[]}
        initialEvent="reception"
        initial={{
          rows: [],
          nextCursor: null,
          summary: { invited: 0, accepted: 0, declined: 0, pending: 0, adults: 0, children: 0 },
          policies: [],
          policyRevision: 0,
          asOf: '2026-10-21T00:00:00Z',
        }}
      />
    </ProductLocale>,
  );
  expect(screen.getByRole('link', { name: 'আমন্ত্রণ সম্পাদনায় যান' })).toBeTruthy();
  expect(screen.queryByRole('combobox', { name: 'অনুষ্ঠান' })).toBeNull();
  expect(screen.queryByText('উত্তর নেওয়া চালু')).toBeNull();
  expect(screen.queryByRole('button', { name: 'CSV নামান' })).toBeNull();
});

it('explains missing household scope in Bangla before any server write', () => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  render(
    <ProductLocale>
      <GuestHub
        wid={wid}
        slug={wid}
        title="কাল্পনিক আয়োজন"
        email="owner@example.test"
        events={[
          {
            id: 'reception',
            title: 'সংবর্ধনা',
            date: '2026-12-12',
            time: '19:00',
            venue: 'ঢাকা',
            address: '',
          },
        ]}
        initialEvent="reception"
        initial={{
          rows: [],
          nextCursor: null,
          summary: { invited: 0, accepted: 0, declined: 0, pending: 0, adults: 0, children: 0 },
          policies: [],
          policyRevision: 0,
          asOf: '2026-10-21T00:00:00Z',
        }}
      />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'অতিথি যোগ করুন' }));
  fireEvent.change(screen.getByLabelText('অতিথি বা দলের নাম'), { target: { value: 'কাল্পনিক পরিবার' } });
  fireEvent.submit(screen.getByRole('dialog').querySelector('form')!);
  expect(screen.getByRole('alert').textContent).toContain('অন্তত একটি অনুষ্ঠান');
  expect(fetcher).not.toHaveBeenCalled();
});

it('does not describe a pending wishes request as an empty result', async () => {
  let finish!: (value: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    ),
  );
  render(
    <ProductLocale>
      <GuestHub
        wid={wid}
        slug={wid}
        title="কাল্পনিক আয়োজন"
        email="owner@example.test"
        events={[
          {
            id: 'reception',
            title: 'সংবর্ধনা',
            date: '2026-12-12',
            time: '19:00',
            venue: 'ঢাকা',
            address: '',
          },
        ]}
        initialEvent="reception"
        initial={{
          rows: [],
          nextCursor: null,
          summary: { invited: 0, accepted: 0, declined: 0, pending: 0, adults: 0, children: 0 },
          policies: [],
          policyRevision: 0,
          asOf: '2026-10-21T00:00:00Z',
        }}
      />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'ব্যক্তিগত শুভেচ্ছা' }));
  expect(screen.getByRole('status').textContent).toContain('লোড হচ্ছে');
  expect(screen.queryByText('এই পাতায় এখনও কোনো শুভেচ্ছা নেই।')).toBeNull();
  await act(async () => finish(json({ rows: [], nextCursor: null })));
  expect(screen.getByText('এই পাতায় এখনও কোনো শুভেচ্ছা নেই।')).toBeTruthy();
});

it('preserves text entered during an autosave and acknowledges each exact snapshot', async () => {
  vi.useFakeTimers();
  let acknowledge!: (r: Response) => void;
  const fetcher = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<Response>((r) => {
          acknowledge = r;
        }),
    )
    .mockResolvedValue(json({ revision: 2, updatedAt: '2026-10-20T10:01:00Z' }));
  vi.stubGlobal('fetch', fetcher);
  const input = editor();
  fireEvent.change(input, { target: { value: 'প্রথম লেখা' } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(input.disabled).toBe(false);
  fireEvent.change(input, { target: { value: 'নতুন লেখা' } });
  await act(async () => {
    acknowledge(json({ revision: 1, updatedAt: '2026-10-20T10:00:30Z' }));
  });
  expect(input.value).toBe('নতুন লেখা');
  expect(screen.getByText(/অসংরক্ষিত পরিবর্তন/)).toBeTruthy();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
  const second = JSON.parse(fetcher.mock.calls[1][1].body);
  expect(second.expectedRevision).toBe(1);
  expect(second.content.partnerOne).toBe('নতুন লেখা');
  expect(screen.getByText(/সার্ভারে সংরক্ষিত/)).toBeTruthy();
});
it('does not mark local edits saved when a successful response lacks a matching revision receipt', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn().mockResolvedValue(json({ revision: 99, updatedAt: 'not-a-date' }));
  vi.stubGlobal('fetch', fetcher);
  const input = editor();
  fireEvent.change(input, { target: { value: 'অক্ষত লেখা' } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(input.value).toBe('অক্ষত লেখা');
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByText(/স্বয়ংক্রিয় সংরক্ষণ বন্ধ/)).toBeTruthy();
});
it('pauses autosave after an uncertain failure and supports deliberate retry without discarding text', async () => {
  vi.useFakeTimers();
  const fetcher = vi
    .fn()
    .mockRejectedValueOnce(new TypeError('offline'))
    .mockResolvedValue(json({ revision: 1, updatedAt: '2026-10-20T10:01:00Z' }));
  vi.stubGlobal('fetch', fetcher);
  const input = editor();
  fireEvent.change(input, { target: { value: 'আমার লেখা' } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(screen.getByRole('alert')).toBeTruthy();
  fireEvent.change(input, { target: { value: 'আরও লেখা' } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(input.value).toBe('আরও লেখা');
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'খসড়া সংরক্ষণ' })));
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(screen.getByText(/সার্ভারে সংরক্ষিত/)).toBeTruthy();
});
it('requires deliberate save after keeping local edits over a conflicting remote version', async () => {
  vi.useFakeTimers();
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 'PT409', message: 'The draft changed.' }), { status: 409 }),
    )
    .mockResolvedValueOnce(
      json({ ...initial, revision: 7, content: { ...initial.content, partnerOne: 'অন্য সংস্করণ' } }),
    )
    .mockResolvedValue(json({ revision: 8, updatedAt: '2026-10-20T10:01:00Z' }));
  vi.stubGlobal('fetch', fetcher);
  const input = editor();
  fireEvent.change(input, { target: { value: 'আমার সংস্করণ' } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  fireEvent.click(screen.getByRole('button', { name: 'আমার লেখা রেখে পর্যালোচনা করুন' }));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(input.value).toBe('আমার সংস্করণ');
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'খসড়া সংরক্ষণ' })));
  expect(JSON.parse(fetcher.mock.calls[2][1].body).expectedRevision).toBe(7);
});
it('marks the current contextual navigation instead of falsely selecting the wedding list', () => {
  render(
    <WorkspaceFrame wedding={{ id: wid, title: 'দীর্ঘ বাংলা আয়োজন', view: 'guests' }}>
      <p>Content</p>
    </WorkspaceFrame>,
  );
  expect(screen.getByRole('link', { name: 'অতিথি ও উত্তর' }).getAttribute('aria-current')).toBe('page');
  expect(screen.getByRole('link', { name: 'আমার আয়োজন' }).hasAttribute('aria-current')).toBe(false);
});
it('requires confirmation before pausing and keeps the dialog open while the command is pending', async () => {
  let finish!: (r: Response) => void;
  const live = {
    ...initial,
    publishedDraftRevision: 0,
    wedding: { ...initial.wedding, visibility: 'live', publication_revision: 1 },
  };
  const fetcher = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<Response>((r) => {
          finish = r;
        }),
    )
    .mockResolvedValue(
      json({ ...live, wedding: { ...live.wedding, visibility: 'paused', publication_revision: 2 } }),
    );
  vi.stubGlobal('fetch', fetcher);
  render(
    <ProductLocale>
      <WeddingDesk initial={live} email="test@example.test" />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'আমন্ত্রণ সাময়িক বন্ধ করুন' }));
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'সাময়িক বন্ধ করুন' }));
  await pause();
  expect(fetcher).toHaveBeenCalledTimes(1);
  const dialog = screen.getByRole('dialog');
  const cancel = new Event('cancel', { bubbles: false, cancelable: true });
  fireEvent(dialog, cancel);
  expect(cancel.defaultPrevented).toBe(true);
  expect(dialog.hasAttribute('open')).toBe(true);
  await act(async () => {
    finish(json({ visibility: 'paused', publicationRevision: 2 }));
  });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('button', { name: 'আবার চালু করুন' })).toBeTruthy();
});
it('does not submit a host correction until reason and allowance are valid, normalizes Bangla counts', async () => {
  const row: HouseholdRow = {
    id: wid,
    name: 'রহমান পরিবার',
    nameBn: '',
    greeting: '',
    greetingEn: '',
    message: '',
    messageEn: '',
    privateNote: '',
    events: [{ eventId: 'reception', maxPeople: 4 }],
    revision: 1,
    responseRevision: 0,
    linkRevision: 0,
    linkState: 'missing',
    responses: {},
  };
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(json({ rows: [] }))
    .mockResolvedValue(json({ responseRevision: 1 }));
  vi.stubGlobal('fetch', fetcher);
  const saved = vi.fn(async () => {});
  render(
    <ResponseEditor
      wid={wid}
      row={row}
      eventId="reception"
      policyRevision={1}
      onClose={() => {}}
      onSaved={saved}
    />,
  );
  await pause();
  fireEvent.change(screen.getByLabelText('প্রাপ্তবয়স্ক'), { target: { value: '৫' } });
  fireEvent.change(screen.getByLabelText('সংশোধনের কারণ'), {
    target: { value: 'ফোনে কথা বলে নিশ্চিত করা হয়েছে' },
  });
  fireEvent.submit(screen.getByRole('button', { name: 'সংশোধন সংরক্ষণ' }).closest('form')!);
  await pause();
  expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByLabelText('প্রাপ্তবয়স্ক'), { target: { value: '৩' } });
  fireEvent.submit(screen.getByRole('button', { name: 'সংশোধন সংরক্ষণ' }).closest('form')!);
  await pause();
  expect(saved).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetcher.mock.calls[1][1].body).answer.adults).toBe(3);
});
