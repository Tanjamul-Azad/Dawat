// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { createWorkspace, type Workspace } from '@/features/workspace/model';
import { words } from '@/features/invitation/content';
import { GuestInvitation } from './guest-invitation';
import type { ResponseTransport } from './invitation-response';

function seedIvory() {
  const state = createWorkspace();
  state.draft.templateId = 'ivory';
  state.published = structuredClone(state.draft);
  return state;
}
function Invitation({ seed = seedIvory(), remote }: { seed?: Workspace; remote?: ResponseTransport }) {
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
      authority={{ mode: 'liveHousehold', scope: 'ivory-test', guestId: 'demo-sabbir' }}
      responseTransport={remote}
    />
  );
}
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/i/test/?lang=en');
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
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

it('opens the orchid invitation without motion and preserves the language switch', () => {
  const { container } = render(<Invitation />);
  expect(container.querySelector('#events, #rsvp, form')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
  expect(container.querySelector('[data-template="ivory"] [data-phase="open"]')).toBeTruthy();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Mehrin');
  expect(screen.getByRole('region', { name: 'The details' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'বাংলা' }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('মেহরিন');
  expect(screen.getByRole('heading', { name: 'আপনার উত্তর' })).toBeTruthy();
});

it('uses only invited ceremonies in the cover, details and reply form', () => {
  const seed = seedIvory();
  seed.guests.find((g) => g.id === 'demo-sabbir')!.events = ['nikah'];
  seed.published!.photos = [];
  const { container } = render(<Invitation seed={seed} />);
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
  expect(container.querySelector('[data-phase="open"] time')?.getAttribute('dateTime')).toBe('2026-12-11');
  expect(container.querySelectorAll('#events article')).toHaveLength(1);
  expect(screen.queryByText('The Reception')).toBeNull();
  expect(container.querySelector('#rsvp select')).toBeNull();
  expect(screen.getByRole('heading', { name: words.en.photoFree })).toBeTruthy();
});

it('opens the orchid photograph layout in the existing accessible viewer', () => {
  render(<Invitation />);
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
  fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
  expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('src')).toContain('garden-couple-v2');
  fireEvent.click(screen.getByRole('button', { name: words.en.next }));
  expect(screen.getByRole('dialog').querySelector('img')?.getAttribute('src')).toContain('hands');
  fireEvent.click(screen.getByRole('button', { name: words.en.close }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('saves and edits an RSVP and sends a wish through the existing transport', async () => {
  const remote = {
    allowances: { nikah: 4, reception: 4 },
    policies: {},
    submitResponse: vi.fn().mockResolvedValue(undefined),
    submitWish: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
  };
  render(<Invitation remote={remote} />);
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
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
  fireEvent.change(screen.getByLabelText(words.en.wish), { target: { value: 'ভালোবাসা ও শুভকামনা রইল।' } });
  fireEvent.submit(screen.getByRole('button', { name: words.en.wishSend }).closest('form')!);
  await waitFor(() => expect(remote.submitWish).toHaveBeenCalledWith('ভালোবাসা ও শুভকামনা রইল।'));
});
