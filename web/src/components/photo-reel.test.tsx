// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PhotoMoments } from './invitation-sections';
import { createWorkspace } from '@/features/workspace/model';

const photos = Array.from({ length: 5 }, (_, index) => ({
  ...createWorkspace().draft.photos![index % 2],
  id: `photo-${index}`,
}));
let intersect: IntersectionObserverCallback;
let reduced = false;
beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return reduced;
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
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
});
function visibility(value: boolean) {
  act(() => intersect([{ isIntersecting: value } as IntersectionObserverEntry], {} as IntersectionObserver));
}
function advance() {
  act(() => vi.advanceTimersByTime(5100));
}
const active = () => screen.getByRole('button', { name: /Open photograph/ }).getAttribute('aria-label');

it('rotates only while visible, wraps five photographs and pauses after manual navigation', () => {
  render(<PhotoMoments photos={photos} locale="en" />);
  advance();
  expect(active()).toBe('Open photograph 1');
  visibility(true);
  advance();
  expect(active()).toBe('Open photograph 2');
  visibility(false);
  advance();
  expect(active()).toBe('Open photograph 2');
  visibility(true);
  advance();
  expect(active()).toBe('Open photograph 3');
  fireEvent.click(screen.getByRole('button', { name: 'Show photograph 5' }));
  advance();
  expect(active()).toBe('Open photograph 5');
  fireEvent.click(screen.getByRole('button', { name: 'Next photograph' }));
  expect(active()).toBe('Open photograph 1');
  expect(screen.getAllByRole('button', { name: /Show photograph/ })).toHaveLength(5);
});
it('honors reduced motion and a single photograph without autoplay controls', () => {
  reduced = true;
  const { rerender } = render(<PhotoMoments photos={photos} locale="en" />);
  visibility(true);
  advance();
  expect(active()).toBe('Open photograph 1');
  expect((screen.getByRole('button', { name: 'Play slideshow' }) as HTMLButtonElement).disabled).toBe(true);
  rerender(<PhotoMoments photos={[photos[0]]} locale="en" />);
  expect(screen.queryByRole('button', { name: /slideshow/ })).toBe(null);
  expect(screen.queryByRole('button', { name: 'Next photograph' })).toBe(null);
});
it('pauses for keyboard focus and supports arrows and deliberate resume', () => {
  render(<PhotoMoments photos={photos} locale="en" />);
  visibility(true);
  const open = screen.getByRole('button', { name: 'Open photograph 1' });
  fireEvent.focus(open);
  advance();
  expect(active()).toBe('Open photograph 1');
  fireEvent.keyDown(open, { key: 'ArrowRight' });
  expect(active()).toBe('Open photograph 2');
  fireEvent.blur(open, { relatedTarget: document.body });
  fireEvent.click(screen.getByRole('button', { name: 'Play slideshow' }));
  advance();
  expect(active()).toBe('Open photograph 3');
});
it('preserves photo identity on reorder and resets to a real remaining photo on removal', () => {
  const { rerender } = render(<PhotoMoments photos={photos} locale="en" />);
  fireEvent.click(screen.getByRole('button', { name: 'Show photograph 5' }));
  rerender(<PhotoMoments photos={[...photos].reverse()} locale="en" />);
  expect(active()).toBe('Open photograph 1');
  rerender(<PhotoMoments photos={[photos[0], photos[1]]} locale="en" />);
  expect(active()).toBe('Open photograph 1');
});
it('distinguishes horizontal swipe from vertical page scrolling', () => {
  render(<PhotoMoments photos={photos} locale="en" />);
  const open = screen.getByRole('button', { name: 'Open photograph 1' });
  fireEvent.touchStart(open, { touches: [{ clientX: 240, clientY: 80 }] });
  fireEvent.touchEnd(open, { touches: [], changedTouches: [{ clientX: 100, clientY: 90 }] });
  expect(active()).toBe('Open photograph 2');
  fireEvent.touchStart(open, { touches: [{ clientX: 100, clientY: 280 }] });
  fireEvent.touchEnd(open, { touches: [], changedTouches: [{ clientX: 140, clientY: 80 }] });
  expect(active()).toBe('Open photograph 2');
});
it('stops while the page is hidden or a dialog is open and cleans up pending timers', () => {
  const { unmount } = render(<PhotoMoments photos={photos} locale="en" />);
  visibility(true);
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  advance();
  expect(active()).toBe('Open photograph 1');
  hidden.mockReturnValue(false);
  fireEvent(document, new Event('visibilitychange'));
  advance();
  expect(active()).toBe('Open photograph 2');
  fireEvent.click(screen.getByRole('button', { name: 'Open photograph 2' }));
  advance();
  expect(active()).toBe('Open photograph 2');
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  advance();
  expect(active()).toBe('Open photograph 2');
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  hidden.mockRestore();
});
it('obeys the invitation-wide pause and stops on mouse interaction', async () => {
  const { container } = render(
    <div data-motion="quiet">
      <PhotoMoments photos={photos} locale="en" />
    </div>,
  );
  visibility(true);
  advance();
  expect(active()).toBe('Open photograph 1');
  await act(async () => {
    container.firstElementChild!.setAttribute('data-motion', 'full');
  });
  advance();
  expect(active()).toBe('Open photograph 2');
  fireEvent.mouseEnter(container.querySelector('[aria-roledescription="slideshow"]')!);
  advance();
  expect(active()).toBe('Open photograph 2');
  fireEvent.mouseLeave(container.querySelector('[aria-roledescription="slideshow"]')!);
  advance();
  expect(active()).toBe('Open photograph 3');
});
