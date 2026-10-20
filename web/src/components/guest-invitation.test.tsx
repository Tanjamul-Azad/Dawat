// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { createWorkspace, type Workspace } from '@/features/workspace/model';
import { words } from '@/features/invitation/content';
import { GuestInvitation } from './guest-invitation';
import { CelebrationEvents, PhotoMoments } from './invitation-sections';
import { InvitationResponse } from './invitation-response';

function Harness({ seed = createWorkspace() }: { seed?: Workspace }) {
  const [workspace, setWorkspace] = useState(seed);
  return (
    <GuestInvitation
      workspace={workspace}
      ready
      update={(fn) => {
        setWorkspace(fn);
        return true;
      }}
      notify={() => {}}
    />
  );
}
function open(locale: 'bn' | 'en' = 'bn') {
  fireEvent.click(screen.getByRole('button', { name: words[locale].openQuietly }));
}
function submit(locale: 'bn' | 'en' = 'en') {
  fireEvent.submit(screen.getByRole('button', { name: words[locale].submit }).closest('form')!);
}
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  localStorage.clear();
  window.history.replaceState(null, '', '/invite/');
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
    fn(0);
    return 0;
  });
  Element.prototype.scrollIntoView = vi.fn();
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('personal invitation and explicit opening contract', () => {
  it('shows a sealed, non-interactive folio while personal details are loading', () => {
    const { container } = render(
      <GuestInvitation workspace={createWorkspace()} ready={false} update={() => true} notify={() => {}} />,
    );
    expect(screen.getByRole('status').textContent).toBe(words.bn.loading);
    expect(container.querySelector('[data-phase="closed"]')).toBeTruthy();
    expect(container.querySelector('form, #events, #rsvp, #couple-names')).toBe(null);
    expect(screen.queryByRole('button', { name: words.bn.open })).toBe(null);
  });
  it('signs the invitation with the couple and family and addresses wishes to the couple', () => {
    window.history.replaceState(null, '', '/invite/?lang=en');
    const { container } = render(<Harness />);
    open('en');
    const footer = container.querySelector('footer')!;
    expect(footer.textContent).toContain(words.en.signature);
    expect(footer.textContent).toContain('Mehrin');
    expect(footer.textContent).toContain('Arib');
    expect(footer.querySelector('a[href="/"]')).toBe(null);
    expect(footer.textContent).not.toMatch(/dawat/i);
    const wishes = screen.getByRole('heading', { name: words.en.wishTitle }).closest('section')!;
    expect(wishes.textContent).toContain('Mehrin & Arib');
    expect(screen.getByLabelText(words.en.wish)).toBeTruthy();
  });
  it('saves a couple message in a phone HTTP preview without secure-context randomUUID', async () => {
    const getRandomValues = crypto.getRandomValues.bind(crypto);
    vi.stubGlobal('crypto', { getRandomValues });
    window.history.replaceState(null, '', '/invite/?lang=en');
    render(<Harness />);
    open('en');
    fireEvent.change(screen.getByLabelText(words.en.wish), { target: { value: 'A beautiful beginning.' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.wishSend }).closest('form')!);
    await waitFor(() => expect(screen.getByText(words.en.wishThanks)).toBeTruthy());
  });
  it('renders no scrollable chapters, photos, navigation or forms before opening', () => {
    const { container } = render(<Harness />);
    expect(container.querySelector('#welcome, #events, #moments, #rsvp, form, nav, footer')).toBe(null);
    expect(container.querySelector('picture img')).toBe(null);
    expect(container.querySelector('h1')!.closest('[inert]')).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1 })).toBe(null);
    expect(screen.getByText('সাব্বির ও পরিবার')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBe(null);
    expect(screen.queryByRole('link', { name: words.bn.skip })).toBe(null);
  });
  it('unlocks scrollable content on the deliberate tap without waiting for the decorative animation', () => {
    vi.useFakeTimers();
    const { container } = render(<Harness />);
    const seal = screen.getByRole('button', { name: words.bn.open });
    seal.focus();
    fireEvent.click(seal);
    fireEvent.click(seal);
    expect(container.querySelector('[data-phase]')!.getAttribute('data-phase')).toBe('opening');
    expect(document.getElementById('rsvp')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    act(() => vi.advanceTimersByTime(20));
    expect(document.activeElement).toBe(document.getElementById('couple-names'));
    const names = document.getElementById('couple-names');
    const replyField = screen.getByLabelText(words.bn.adults);
    replyField.focus();
    act(() => vi.advanceTimersByTime(850));
    expect(container.querySelector('[data-phase]')!.getAttribute('data-phase')).toBe('open');
    expect(document.getElementById('couple-names')).toBe(names);
    expect(document.activeElement).toBe(replyField);
  });
  it('finishes an initiated opening without replay or stale timers', () => {
    vi.useFakeTimers();
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: words.bn.open }));
    fireEvent.click(screen.getByRole('button', { name: words.bn.finishOpening }));
    expect(document.getElementById('rsvp')).toBeTruthy();
    act(() => vi.advanceTimersByTime(2200));
    expect(document.activeElement).toBe(document.getElementById('couple-names'));
  });
  it('defers a direct RSVP fragment until the guest explicitly opens the invitation', () => {
    window.history.replaceState(null, '', '/invite/?lang=en#rsvp');
    render(<Harness />);
    expect(document.getElementById('rsvp')).toBe(null);
    open('en');
    expect(document.activeElement).toBe(document.getElementById('rsvp'));
  });
  for (const missing of [false, true])
    it('requires a deliberate opening with ' + (missing ? 'missing motion APIs' : 'reduced motion'), () => {
      vi.stubGlobal(
        'matchMedia',
        missing
          ? undefined
          : () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
      );
      const { container } = render(<Harness />);
      expect(container.querySelector('[data-phase]')!.getAttribute('data-phase')).toBe('closed');
      expect(container.querySelector('[data-motion]')!.getAttribute('data-motion')).toBe('quiet');
      fireEvent.click(screen.getByRole('button', { name: words.bn.open }));
      expect(document.getElementById('rsvp')).toBeTruthy();
    });
  it('pausing before opening does not reveal content; language switching never opens or replays it', () => {
    const { container } = render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: words.bn.pauseMotion }));
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(document.getElementById('rsvp')).toBe(null);
    fireEvent.click(screen.getByRole('button', { name: words.en.open }));
    fireEvent.click(screen.getByRole('button', { name: 'বাংলা' }));
    expect(container.querySelector('[data-phase]')!.getAttribute('data-phase')).toBe('open');
  });
  it('honors OS reduced motion changing during an already-initiated opening', () => {
    let change: (() => void) | undefined;
    const media = {
      matches: false,
      addEventListener: (_event: string, fn: () => void) => {
        change = fn;
      },
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', () => media);
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: words.bn.open }));
    act(() => {
      media.matches = true;
      change?.();
    });
    expect(document.getElementById('rsvp')).toBeTruthy();
  });
  it('never asks a named guest for a name and saves replies under the host-created identity', async () => {
    window.history.replaceState(null, '', '/invite/?lang=en');
    render(<Harness />);
    open('en');
    expect(screen.queryByRole('textbox', { name: words.en.name })).toBe(null);
    expect(document.getElementById('rsvp')!.textContent).toContain('Sabbir & Family');
    fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '২' } });
    fireEvent.change(screen.getByLabelText(words.en.children), { target: { value: '১' } });
    submit();
    await waitFor(() => expect(screen.getByText(words.en.saved, { exact: true })).toBeTruthy());
    const read = () => JSON.parse(localStorage.getItem('dawat-guest-sample-v1')!) as Workspace;
    expect(read().guests.length).toBe(createWorkspace().guests.length);
    const answer = () => read().guests.find((g) => g.id === 'demo-sabbir')!.responses.reception;
    expect(answer().adults + answer().children).toBe(3);
    const before = JSON.stringify(answer());
    fireEvent.change(screen.getByLabelText(words.en.wish), { target: { value: 'A wonderful new chapter.' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.wishSend }).closest('form')!);
    await waitFor(() => expect(screen.getByText(words.en.wishThanks)).toBeTruthy());
    expect(JSON.stringify(answer())).toBe(before);
    fireEvent.click(screen.getByRole('button', { name: words.en.edit }));
    fireEvent.click(screen.getByLabelText(words.en.no));
    submit();
    await waitFor(() => expect(answer().attendance).toBe('declined'));
    expect(answer().adults + answer().children).toBe(0);
    expect(localStorage.getItem('dawat-studio-sandbox-v1')).toBe(null);
  });
  it('shows host-controlled localized name and greeting without executing markup', () => {
    const seed = createWorkspace();
    seed.guests[3].name = '<script>family</script>';
    seed.guests[3].greetingEn = 'Welcome, our favourite cousins';
    window.history.replaceState(null, '', '/invite/?guest=demo-sabbir&lang=en');
    const { container } = render(<Harness seed={seed} />);
    expect(screen.getByText('<script>family</script>')).toBeTruthy();
    expect(container.querySelector('script')).toBe(null);
    open('en');
    expect(document.getElementById('couple-names')!.closest('section')!.textContent).toContain(
      'Welcome, our favourite cousins',
    );
  });
  it('keeps a general share link view-only and directs replies to personal links', () => {
    window.history.replaceState(null, '', '/invite/?live=1&lang=en');
    render(<Harness />);
    open('en');
    expect(screen.getByText(words.en.personalLinkNote)).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBe(null);
    expect(screen.queryByRole('button', { name: words.en.submit })).toBe(null);
  });
  for (const query of [
    'guest=missing',
    'guest=',
    'sampleGuest=missing',
    'guest=demo-sabbir&preview=design',
    'live=1&sampleGuest=demo-sabbir',
  ])
    it('rejects an invalid/ambiguous invitation scope: ' + query, () => {
      window.history.replaceState(null, '', '/invite/?lang=en&' + query);
      render(<Harness />);
      expect(screen.getByRole('heading', { name: words.en.unavailable })).toBeTruthy();
      expect(screen.queryByRole('button', { name: words.en.open })).toBe(null);
    });
  it('keeps read-only design previews free of response forms and management shortcuts', () => {
    window.history.replaceState(null, '', '/invite/?preview=design&lang=en');
    const { container } = render(<Harness />);
    open('en');
    expect(screen.getByText(words.en.previewNote)).toBeTruthy();
    expect(container.querySelector('form,a[href^="/dashboard"]')).toBe(null);
  });
  it('filters dates, events, maps and response options for a reception-only household', () => {
    const seed = createWorkspace();
    seed.guests[3].events = ['reception'];
    window.history.replaceState(null, '', '/invite/?guest=demo-sabbir&lang=en');
    const { container } = render(<Harness seed={seed} />);
    open('en');
    expect(screen.queryByRole('heading', { name: 'The Nikah' })).toBe(null);
    expect(screen.getByRole('heading', { name: 'The Reception' })).toBeTruthy();
    expect(container.querySelectorAll('a[href*="google.com/maps"]').length).toBe(1);
    expect(container.querySelector('a[href*="google.com/maps"]')!.getAttribute('href')).toContain(
      'Grand%20Courtyard',
    );
  });
  it('retains separate drafts and existing receipts while switching celebrations', async () => {
    window.history.replaceState(null, '', '/invite/?lang=en');
    render(<Harness />);
    open('en');
    fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '২' } });
    fireEvent.change(screen.getByLabelText(words.en.note, { exact: false }), {
      target: { value: 'Reception note' },
    });
    fireEvent.change(screen.getByLabelText(words.en.forEvent), { target: { value: 'nikah' } });
    fireEvent.change(screen.getByLabelText(words.en.note, { exact: false }), {
      target: { value: 'Nikah note' },
    });
    submit();
    await waitFor(() => expect(screen.getByText(words.en.saved, { exact: true })).toBeTruthy());
    fireEvent.change(screen.getByLabelText(words.en.forEvent), { target: { value: 'reception' } });
    expect((screen.getByLabelText(words.en.adults) as HTMLInputElement).value).toBe('২');
    expect((screen.getByLabelText(words.en.note, { exact: false }) as HTMLTextAreaElement).value).toBe(
      'Reception note',
    );
    fireEvent.change(screen.getByLabelText(words.en.forEvent), { target: { value: 'nikah' } });
    expect(screen.getByText(words.en.saved, { exact: true })).toBeTruthy();
  });
  it('keeps date reveal, entered counts and the open state across a language switch', () => {
    render(<Harness />);
    open();
    fireEvent.change(screen.getByLabelText(words.bn.adults), { target: { value: '২' } });
    fireEvent.click(screen.getByRole('button', { name: words.bn.untieDate }));
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByRole('button', { name: words.en.foldDate }).getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect((screen.getByLabelText(words.en.adults) as HTMLInputElement).value).toBe('২');
  });
  it('clears unsaved sample replies on reset while retaining the named example', () => {
    render(<Harness />);
    open();
    fireEvent.change(screen.getByLabelText(words.bn.adults), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'নমুনা উত্তর রিসেট করুন' }));
    expect((screen.getByLabelText(words.bn.adults) as HTMLInputElement).value).toBe('1');
    expect(document.getElementById('rsvp')!.textContent).toContain('সাব্বির ও পরিবার');
  });
  it('closes the visible form at its deadline and keeps entered counts', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
    const seed = createWorkspace();
    seed.published!.rsvpClosesAt = '2026-10-19T12:00:02Z';
    window.history.replaceState(null, '', '/invite/?guest=demo-sabbir&lang=en');
    render(<Harness seed={seed} />);
    open('en');
    const input = screen.getByLabelText(words.en.adults) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '3' } });
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText(words.en.closed)).toBeTruthy();
    expect(input.matches(':disabled')).toBe(true);
    expect(input.value).toBe('3');
  });
  it('refreshes closed policy after a sleeping page is restored', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
    const seed = createWorkspace();
    seed.published!.rsvpClosesAt = '2026-10-19T12:01:00Z';
    window.history.replaceState(null, '', '/invite/?guest=demo-sabbir&lang=en');
    render(<Harness seed={seed} />);
    open('en');
    vi.setSystemTime(new Date('2026-10-19T12:02:00Z'));
    fireEvent(window, new Event('pageshow'));
    expect(screen.getByText(words.en.closed)).toBeTruthy();
  });
  for (const removed of [false, true])
    it(
      'revalidates ' + (removed ? 'a removed household' : 'a changed publication deadline') + ' on submit',
      async () => {
        const state = createWorkspace(),
          changed = structuredClone(state),
          guest = state.guests[3];
        if (removed) changed.guests = changed.guests.filter((g) => g.id !== guest.id);
        else changed.published!.rsvpClosesAt = '2026-01-01T00:00:00Z';
        render(
          <InvitationResponse
            workspace={state}
            invitation={state.published!}
            guest={guest}
            events={state.published!.events}
            locale="en"
            update={(fn) => {
              fn(changed);
              return true;
            }}
          />,
        );
        submit();
        await waitFor(() =>
          expect(screen.getByText(removed ? words.en.invalidScope : words.en.closed)).toBeTruthy(),
        );
        expect(screen.queryByText(words.en.saved, { exact: true })).toBe(null);
      },
    );
  it('preserves answers and focuses a truthful save failure when storage is unavailable', async () => {
    window.history.replaceState(null, '', '/invite/?lang=en');
    render(<Harness />);
    open('en');
    fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '২' } });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    submit();
    await waitFor(() => expect(document.activeElement?.textContent).toBe(words.en.saveFailed));
    expect((screen.getByLabelText(words.en.adults) as HTMLInputElement).value).toBe('২');
    expect(screen.queryByText(words.en.saved, { exact: true })).toBe(null);
  });
  it('focuses count errors and the confirmed receipt after correction', async () => {
    window.history.replaceState(null, '', '/invite/?lang=en');
    render(<Harness />);
    open('en');
    fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '1.5' } });
    submit();
    await waitFor(() => expect(document.activeElement?.textContent).toBe(words.en.countsInvalid));
    fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '2' } });
    submit();
    await waitFor(() => expect(document.activeElement?.textContent).toBe(words.en.saved));
  });
  it('explains blank wishes while keeping text for correction and never requests another name', async () => {
    window.history.replaceState(null, '', '/invite/?lang=en');
    render(<Harness />);
    open('en');
    const input = screen.getByLabelText(words.en.wish);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.wishSend }).closest('form')!);
    await waitFor(() => expect(document.activeElement?.textContent).toBe(words.en.requiredWish));
    expect((input as HTMLTextAreaElement).value).toBe('   ');
    expect(screen.queryByRole('textbox', { name: words.en.name })).toBe(null);
  });
  it('records one wish for rapid repeated submits and permits another only after an explicit new wish', async () => {
    window.history.replaceState(null, '', '/invite/?lang=en');
    render(<Harness />);
    open('en');
    fireEvent.change(screen.getByLabelText(words.en.wish), { target: { value: 'Our warmest wishes' } });
    const form = screen.getByRole('button', { name: words.en.wishSend }).closest('form')!;
    const before = createWorkspace().wishes.length;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    const read = () => JSON.parse(localStorage.getItem('dawat-guest-sample-v1')!) as Workspace;
    await waitFor(() => expect(read().wishes.length).toBe(before + 1));
    fireEvent.click(screen.getByRole('button', { name: words.en.wishAgain }));
    fireEvent.change(screen.getByLabelText(words.en.wish), { target: { value: 'One more thought' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.wishSend }).closest('form')!);
    await waitFor(() => expect(read().wishes.length).toBe(before + 2));
  });
  it('keeps core content available after a failed cover image and explicit opening', () => {
    const { container } = render(<Harness />);
    open();
    const image = container.querySelector('picture img')!;
    fireEvent.error(image);
    expect((image as HTMLImageElement).style.visibility).toBe('hidden');
    expect(screen.getByRole('button', { name: words.bn.submit })).toBeTruthy();
  });
  it('starts section observers only after opening and introduces navigation after leaving the cover', () => {
    const observers: { callback: IntersectionObserverCallback; disconnect: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(callback: IntersectionObserverCallback) {
          observers.push({ callback, disconnect: this.disconnect });
        }
      },
    );
    const { unmount } = render(<Harness />);
    expect(observers.length).toBe(0);
    open();
    const nav = document.querySelector('nav')!;
    expect(nav.hidden).toBe(true);
    act(() =>
      observers.at(-1)!.callback(
        [
          {
            target: document.getElementById('welcome')!,
            isIntersecting: true,
            boundingClientRect: { top: 50 },
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      ),
    );
    expect(nav.hidden).toBe(false);
    unmount();
    expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });
  it('keeps the reception date and selected reply event stable when programme entries are reordered', () => {
    const seed = createWorkspace();
    seed.published!.events.reverse();
    window.history.replaceState(null, '', '/invite/?guest=demo-sabbir&lang=en');
    render(<Harness seed={seed} />);
    open('en');
    expect(document.getElementById('couple-names')!.closest('section')!.textContent).toContain(
      '12 December 2026',
    );
    expect((screen.getByLabelText(words.en.forEvent) as HTMLSelectElement).value).toBe('reception');
  });
  it('preserves the selected photograph through a reorder and closes if that photograph is removed', () => {
    const photos = createWorkspace().draft.photos!;
    const { rerender } = render(<PhotoMoments photos={photos} locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
    rerender(<PhotoMoments photos={[...photos].reverse()} locale="en" />);
    expect(screen.getByRole('dialog').querySelector('img')!.getAttribute('src')).toContain('couple');
    rerender(<PhotoMoments photos={[photos[1]]} locale="en" />);
    expect(screen.queryByRole('dialog')).toBe(null);
  });
  it('tries an updated photo source again instead of retaining a failure by photo ID', () => {
    const photo = createWorkspace().draft.photos![0];
    const { container, rerender } = render(<PhotoMoments photos={[photo]} locale="en" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('button[aria-label="Open photograph 1"] img')).toBe(null);
    rerender(<PhotoMoments photos={[{ ...photo, src: '/artwork/jamdani-hands-v1.webp' }]} locale="en" />);
    expect(container.querySelector('img')!.getAttribute('src')).toContain('hands');
  });
  it('opens the photograph lightbox, changes photographs and closes it', () => {
    render(<PhotoMoments photos={createWorkspace().draft.photos} locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('dialog').querySelector('button[aria-label="Next photograph"]')!);
    expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('src')).toContain('hands');
    fireEvent.click(screen.getByRole('button', { name: words.en.close }));
    expect(screen.queryByRole('dialog')).toBe(null);
  });
  it('supports photo arrow keys and horizontal swipes while preserving vertical scrolling', () => {
    render(<PhotoMoments photos={createWorkspace().draft.photos} locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
    const image = () => screen.getByRole('dialog').querySelector('img')!;
    fireEvent.keyDown(image(), { key: 'ArrowRight' });
    expect(image().getAttribute('src')).toContain('hands');
    fireEvent.keyDown(image(), { key: 'ArrowLeft' });
    expect(image().getAttribute('src')).toContain('couple');
    fireEvent.touchStart(image(), { touches: [{ clientX: 250, clientY: 100 }] });
    fireEvent.touchEnd(image(), { touches: [], changedTouches: [{ clientX: 150, clientY: 110 }] });
    expect(image().getAttribute('src')).toContain('hands');
    fireEvent.touchStart(image(), { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(image(), { touches: [], changedTouches: [{ clientX: 170, clientY: 50 }] });
    expect(image().getAttribute('src')).toContain('hands');
  });
  it('loads a Google map only after the guest requests it and removes it when hidden', () => {
    const invitation = createWorkspace().draft;
    const { container } = render(
      <CelebrationEvents invitation={invitation} events={[invitation.events[1]]} locale="en" />,
    );
    expect(container.querySelector('iframe')).toBe(null);
    fireEvent.click(screen.getByRole('button', { name: words.en.showMap }));
    expect(container.querySelector('iframe')?.getAttribute('src')).toContain('Grand%20Courtyard');
    fireEvent.click(screen.getByRole('button', { name: words.en.hideMap }));
    expect(container.querySelector('iframe')).toBe(null);
  });
  it('uses a composed fallback for failed photographs including the lightbox', () => {
    const photos = createWorkspace().draft.photos!;
    const { container } = render(<PhotoMoments photos={photos} locale="en" />);
    fireEvent.error(container.querySelector('img')!);
    fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
    expect(screen.getByRole('dialog').querySelector('img')).toBe(null);
    expect(screen.getByRole('dialog').textContent).toContain(words.en.photoMissing);
  });
});
