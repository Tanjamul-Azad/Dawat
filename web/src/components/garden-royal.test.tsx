// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { createWorkspace, type Workspace } from '@/features/workspace/model';
import * as workspaceModel from '@/features/workspace/model';
import { words } from '@/features/invitation/content';
import { GuestInvitation } from './guest-invitation';
import type { ResponseTransport } from './invitation-response';

function gardenSeed() {
  const seed = createWorkspace();
  seed.draft.templateId = 'garden';
  seed.published = structuredClone(seed.draft);
  return seed;
}
function GardenHarness({ seed = gardenSeed(), remote }: { seed?: Workspace; remote?: ResponseTransport }) {
  const [state, setState] = useState(seed);
  return (
    <GuestInvitation
      workspace={state}
      ready
      update={(fn) => {
        setState(fn);
        return true;
      }}
      notify={() => {}}
      authority={{ mode: 'liveHousehold', scope: 'garden-test', guestId: 'demo-sabbir' }}
      responseTransport={remote}
    />
  );
}
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/i/test/?lang=en');
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('keeps the selected Garden design when sample replies are reset', () => {
  const seed = gardenSeed();
  localStorage.setItem('dawat-guest-sample-v1', JSON.stringify(seed));
  window.history.replaceState(null, '', '/demo/?template=garden&lang=en');
  const { container } = render(
    <GuestInvitation workspace={seed} ready update={() => true} notify={() => {}} />,
  );
  fireEvent.click(screen.getByRole('button', { name: words.en.openQuietly }));
  fireEvent.click(screen.getByRole('button', { name: 'Reset sample replies' }));
  expect(container.querySelector('[data-template="garden"]')).toBeTruthy();
  const saved = JSON.parse(localStorage.getItem('dawat-guest-sample-v1')!);
  expect(saved.published.templateId).toBe('garden');
  expect(saved.guests.find((guest: { id: string }) => guest.id === 'demo-sabbir').responses).toEqual({});
});

it('opens the Garden folio into every chapter and switches the whole story to Bangla', () => {
  const { container } = render(<GardenHarness />);
  expect(container.querySelector('#welcome, #events, #rsvp, form, footer')).toBeNull();
  expect(screen.getByText('Sabbir & Family')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
  for (const id of ['couple-names', 'welcome', 'events', 'moments', 'rsvp'])
    expect(container.querySelector(`#${id}`)).toBeTruthy();
  expect(container.querySelector('[data-phase="open"]')).toBeTruthy();
  expect(screen.getByText('With love, we invite you')).toBeTruthy();
  expect(container.querySelector('footer')?.textContent).toContain('Mehrin');
  fireEvent.click(screen.getByRole('button', { name: 'বাংলা' }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('মেহরিন');
  expect(screen.getByText('সাদর আমন্ত্রণ')).toBeTruthy();
  expect(container.querySelector('[data-template="garden"]')?.getAttribute('lang')).toBe('bn');
});

it('keeps the Garden date, event details and RSVP restricted to the guest’s invitations', () => {
  const seed = gardenSeed();
  seed.guests.find((g) => g.id === 'demo-sabbir')!.events = ['nikah'];
  seed.published!.photos = [];
  const { container } = render(<GardenHarness seed={seed} />);
  fireEvent.click(screen.getByRole('button', { name: words.en.openQuietly }));
  expect(container.querySelectorAll('#events article')).toHaveLength(1);
  expect(screen.queryByText('The Reception')).toBeNull();
  expect(container.querySelector('[aria-label="Save our date"] time')?.getAttribute('dateTime')).toBe(
    '2026-12-11',
  );
  expect(screen.getByRole('heading', { name: words.en.photoFree })).toBeTruthy();
  expect(container.querySelector('#rsvp select')).toBeNull();
});

it('opens Garden immediately even when the device allows animation', () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const { container } = render(<GardenHarness />);
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
  expect(container.querySelector('[data-phase="open"]')).toBeTruthy();
  expect(container.querySelector('[data-phase="opening"]')).toBeNull();
});

it('opens both collage photographs through the existing accessible photo viewer', () => {
  render(<GardenHarness />);
  fireEvent.click(screen.getByRole('button', { name: words.en.openQuietly }));
  expect(screen.getByRole('button', { name: 'Open photograph 1' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Open photograph 2' }));
  const dialog = screen.getByRole('dialog');
  expect(dialog.querySelector('img')?.getAttribute('src')).toContain('hands');
  fireEvent.keyDown(dialog.querySelector('img')!.parentElement!, { key: 'ArrowLeft' });
  expect(dialog.querySelector('img')?.getAttribute('src')).toContain('couple');
  fireEvent.click(screen.getByRole('button', { name: words.en.close }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('keeps calendar, address copy and venue map directly available on the invitation', () => {
  const download = vi.spyOn(workspaceModel, 'download').mockImplementation(() => {});
  const { container } = render(<GardenHarness />);
  fireEvent.click(screen.getByRole('button', { name: words.en.openQuietly }));
  const event = container.querySelector('#events article')! as HTMLElement;
  expect(within(event).getByRole('button', { name: words.en.address })).toBeTruthy();
  fireEvent.click(within(event).getByRole('button', { name: words.en.calendar }));
  expect(download).toHaveBeenCalledWith(
    'nikah.ics',
    expect.stringContaining('SUMMARY:Mehrin & Arib — The Nikah'),
    'text/calendar;charset=utf-8',
  );
  fireEvent.click(within(event).getByRole('button', { name: words.en.showMap }));
  expect(event.querySelector('iframe')?.getAttribute('src')).toContain('output=embed');
  fireEvent.click(within(event).getByRole('button', { name: words.en.hideMap }));
  expect(event.querySelector('iframe')).toBeNull();
});

it('retains the invitation when the optional cover photograph fails to load', () => {
  const { container } = render(<GardenHarness />);
  fireEvent.click(screen.getByRole('button', { name: words.en.openQuietly }));
  const hero = container.querySelector('[data-phase="open"]')!;
  fireEvent.error(hero.querySelector('img[src*="couple"]')!);
  expect(hero.querySelector('img[src*="couple"]')).toBeNull();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Mehrin');
  expect(container.querySelector('#rsvp form')).toBeTruthy();
});

it('uses the existing remote RSVP and wish transport, including the editable receipt', async () => {
  const remote = {
    allowances: { nikah: 4, reception: 4 },
    policies: {},
    submitResponse: vi.fn().mockResolvedValue(undefined),
    submitWish: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
  };
  render(<GardenHarness remote={remote} />);
  fireEvent.click(screen.getByRole('button', { name: words.en.openQuietly }));
  fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText(words.en.children), { target: { value: '1' } });
  fireEvent.submit(screen.getByRole('button', { name: words.en.submit }).closest('form')!);
  await waitFor(() => expect(screen.getByText(words.en.saved)).toBeTruthy());
  expect(remote.submitResponse).toHaveBeenCalledWith(
    'reception',
    expect.objectContaining({ attendance: 'accepted', adults: 3, children: 1 }),
  );
  fireEvent.click(screen.getByRole('button', { name: words.en.edit }));
  expect(screen.getByLabelText(words.en.adults).getAttribute('value')).toBe('3');
  fireEvent.change(screen.getByLabelText(words.en.wish), { target: { value: 'A wonderful new beginning.' } });
  fireEvent.submit(screen.getByRole('button', { name: words.en.wishSend }).closest('form')!);
  await waitFor(() => expect(screen.getByText(words.en.wishThanks)).toBeTruthy());
  expect(remote.submitWish).toHaveBeenCalledWith('A wonderful new beginning.');
});
