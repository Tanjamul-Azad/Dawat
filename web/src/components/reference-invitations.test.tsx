// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { createWorkspace, type Workspace } from '@/features/workspace/model';
import * as model from '@/features/workspace/model';
import { words } from '@/features/invitation/content';
import { GuestInvitation } from './guest-invitation';
import { ReferenceFolio, type ReferenceTemplate } from './reference-invitations';
import type { ResponseTransport } from './invitation-response';

const variants: ReferenceTemplate[] = ['rose', 'jamdani', 'holud', 'midnight'];
function seedFor(variant: ReferenceTemplate) {
  const seed = createWorkspace();
  seed.draft.templateId = variant;
  seed.published = structuredClone(seed.draft);
  return seed;
}
function Harness({ seed, remote }: { seed: Workspace; remote?: ResponseTransport }) {
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
      authority={{ mode: 'liveHousehold', scope: 'reference-test', guestId: 'demo-sabbir' }}
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
    matches: true,
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

for (const variant of variants) {
  it(`${variant}: preserves deliberate opening, guest scope and directly visible venue controls`, () => {
    const seed = seedFor(variant);
    seed.guests.find((g) => g.id === 'demo-sabbir')!.events = ['reception'];
    const download = vi.spyOn(model, 'download').mockImplementation(() => {});
    const { container } = render(<Harness seed={seed} />);
    expect(container.querySelector('#events,#rsvp,form,footer')).toBeNull();
    if (variant !== 'midnight') expect(container.querySelector('picture img')).toBeNull();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: words.en.open }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Mehrin');
    expect(container.querySelectorAll('#events article')).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'The Nikah' })).toBeNull();
    for (const link of container.querySelectorAll('a[href*="google.com/maps"]'))
      expect(link.getAttribute('href')).toContain('Grand%20Courtyard');
    const event = container.querySelector('#events article')! as HTMLElement;
    expect(within(event).getByRole('button', { name: words.en.address })).toBeTruthy();
    fireEvent.click(within(event).getByRole('button', { name: words.en.calendar }));
    expect(download).toHaveBeenCalledWith(
      'reception.ics',
      expect.stringContaining('SUMMARY:Mehrin & Arib — The Reception'),
      'text/calendar;charset=utf-8',
    );
    fireEvent.click(within(event).getByRole('button', { name: words.en.showMap }));
    expect(event.querySelector('iframe')?.getAttribute('src')).toContain('Grand%20Courtyard');
    fireEvent.click(within(event).getByRole('button', { name: words.en.hideMap }));
    expect(event.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: words.en.untieDate }));
    fireEvent.click(screen.getByRole('button', { name: 'বাংলা' }));
    expect(screen.getByRole('button', { name: words.bn.foldDate }).getAttribute('aria-expanded')).toBe(
      'true',
    );
  });
  it(`${variant}: retains the full photograph viewer and its navigation`, () => {
    render(<Harness seed={seedFor(variant)} />);
    fireEvent.click(screen.getByRole('button', { name: words.en.open }));
    fireEvent.click(screen.getByRole('button', { name: 'Open photograph 1' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: words.en.next }));
    expect(dialog.querySelector('img')?.getAttribute('src')).toContain('hands');
    fireEvent.click(within(dialog).getByRole('button', { name: words.en.close }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it(`${variant}: preserves RSVP editing and private-wish transport`, async () => {
    const remote = {
      allowances: { nikah: 4, reception: 4 },
      policies: {},
      submitResponse: vi.fn().mockResolvedValue(undefined),
      submitWish: vi.fn().mockResolvedValue(undefined),
      refresh: vi.fn().mockResolvedValue(undefined),
    };
    render(<Harness seed={seedFor(variant)} remote={remote} />);
    fireEvent.click(screen.getByRole('button', { name: words.en.open }));
    fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(words.en.children), { target: { value: '1' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.submit }).closest('form')!);
    await waitFor(() =>
      expect(remote.submitResponse).toHaveBeenCalledWith(
        'reception',
        expect.objectContaining({ adults: 2, children: 1, attendance: 'accepted' }),
      ),
    );
    await waitFor(() => expect(screen.getByText(words.en.saved)).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: words.en.edit }));
    expect(screen.getByLabelText(words.en.adults).getAttribute('value')).toBe('2');
    fireEvent.change(screen.getByLabelText(words.en.wish), { target: { value: 'ভালোবাসা রইল।' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.wishSend }).closest('form')!);
    await waitFor(() => expect(remote.submitWish).toHaveBeenCalledWith('ভালোবাসা রইল।'));
  });
  it(`${variant}: remains usable without photographs and with long couple names`, () => {
    const seed = seedFor(variant);
    seed.published!.photos = [];
    seed.published!.partnerOne = 'Alexandra Catherine Montgomery';
    seed.published!.partnerTwo = 'Sebastian Alexander Fitzgerald';
    render(<Harness seed={seed} />);
    fireEvent.click(screen.getByRole('button', { name: words.en.open }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Alexandra Catherine Montgomery');
    expect(screen.getByRole('heading', { name: words.en.photoFree })).toBeTruthy();
    expect(screen.getByRole('button', { name: words.en.submit })).toBeTruthy();
  });
}
it('the boarding-pass calendar marks the real invited date', () => {
  const seed = seedFor('midnight');
  seed.guests.find((g) => g.id === 'demo-sabbir')!.events = ['nikah'];
  const { container } = render(<Harness seed={seed} />);
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
  expect(container.querySelector('[data-selected="true"]')?.textContent).toBe('11');
  expect(container.querySelector('[aria-label="Save our date"] time')?.getAttribute('dateTime')).toBe(
    '2026-12-11',
  );
});
it('keeps sample previews isolated when another template tab changes its sample', () => {
  const rose = seedFor('rose');
  const blue = seedFor('jamdani');
  localStorage.setItem('dawat-guest-sample-v1-rose', JSON.stringify(rose));
  localStorage.setItem('dawat-guest-sample-v1-jamdani', JSON.stringify(blue));
  const { container } = render(
    <GuestInvitation workspace={rose} ready update={() => true} notify={() => {}} sampleTemplateId="rose" />,
  );
  expect(container.querySelector('[data-template="rose"]')).toBeTruthy();
  fireEvent(
    window,
    new StorageEvent('storage', { key: 'dawat-guest-sample-v1-jamdani', newValue: JSON.stringify(blue) }),
  );
  expect(container.querySelector('[data-template="rose"]')).toBeTruthy();
  expect(container.querySelector('[data-template="jamdani"]')).toBeNull();
});
it('the boarding-pass calendar handles a leap-year February', () => {
  const seed = seedFor('midnight');
  seed.published!.events.find((e) => e.id === 'reception')!.date = '2028-02-29';
  const { container } = render(<Harness seed={seed} />);
  fireEvent.click(screen.getByRole('button', { name: words.en.open }));
  const selected = container.querySelector('[data-selected="true"]')!;
  expect(selected.textContent).toBe('29');
  expect(
    Array.from(selected.parentElement!.querySelectorAll('span')).filter((e) => e.textContent?.trim()),
  ).toHaveLength(29);
});
it('keeps a host photograph and crop, using its full-size source with a safe fallback', () => {
  const seed = seedFor('jamdani');
  const { container } = render(
    <ReferenceFolio
      variant="jamdani"
      phase="open"
      names={['A', 'B']}
      hosts="Our families"
      recipient={null}
      event={seed.published!.events[0]}
      locale="en"
      open={() => {}}
      sealRef={null}
      photo={{
        id: 'host',
        src: '/host/photo.webp',
        fullSrc: '/host/photo-large.webp',
        position: 'top',
        alt: 'Our photograph',
      }}
    />,
  );
  const image = container.querySelector('picture img')! as HTMLImageElement;
  expect(image.getAttribute('src')).toBe('/host/photo-large.webp');
  expect(image.style.objectPosition).toBe('top');
  fireEvent.error(image);
  expect(image.getAttribute('src')).toBe('/host/photo.webp');
  fireEvent.error(image);
  expect(image.style.visibility).toBe('hidden');
});
