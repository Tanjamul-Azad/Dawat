// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { INVITATION_MUSIC, useInvitationMusic } from './use-invitation-music';

function Harness({ scope = 'sample', available = true }: { scope?: string; available?: boolean }) {
  const music = useInvitationMusic(scope, available);
  return (
    <>
      {available && <audio ref={music.audio} preload="none" loop />}
      <button onClick={music.onOpen}>Open</button>
      <button onClick={music.toggle}>Toggle</button>
      <output>{music.status}</output>
    </>
  );
}
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
async function click(name: string) {
  await act(async () => fireEvent.click(screen.getByRole('button', { name })));
}

it('does not fetch or play before a gesture and starts softly on opening only once', async () => {
  const { container } = render(<Harness />);
  const audio = container.querySelector('audio')!;
  expect(audio.getAttribute('src')).toBe(null);
  expect(audio.preload).toBe('none');
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  await click('Open');
  expect(audio.getAttribute('src')).toBe(INVITATION_MUSIC);
  expect(audio.volume).toBe(0.18);
  expect(screen.getByRole('status').textContent).toBe('playing');
  await click('Open');
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
});
it('remembers a manual pause and does not start on opening after remount', async () => {
  const { unmount } = render(<Harness />);
  await click('Open');
  await click('Toggle');
  expect(localStorage.getItem('dawat-music-sample')).toBe('off');
  unmount();
  vi.mocked(HTMLMediaElement.prototype.play).mockClear();
  render(<Harness />);
  await click('Open');
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  await click('Toggle');
  expect(screen.getByRole('status').textContent).toBe('playing');
});
it('offers manual retry after a blocked play and leaves the invitation independent of audio failure', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
    new DOMException('Gesture required', 'NotAllowedError'),
  );
  const { container } = render(<Harness />);
  await click('Open');
  expect(screen.getByRole('status').textContent).toBe('blocked');
  await click('Toggle');
  expect(screen.getByRole('status').textContent).toBe('playing');
  fireEvent.error(container.querySelector('audio')!);
  expect(screen.getByRole('status').textContent).toBe('error');
});
it('does not let a delayed play promise restore playing after cancellation', async () => {
  let resolve!: () => void;
  vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(
    new Promise<void>((done) => {
      resolve = done;
    }),
  );
  render(<Harness />);
  await click('Open');
  expect(screen.getByRole('status').textContent).toBe('loading');
  await click('Toggle');
  await act(async () => resolve());
  expect(screen.getByRole('status').textContent).toBe('paused');
});
it('attaches after loading, pauses on background and requires a new gesture on return', async () => {
  const { rerender, unmount } = render(<Harness available={false} />);
  rerender(<Harness />);
  await click('Open');
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(screen.getByRole('status').textContent).toBe('paused');
  hidden.mockReturnValue(false);
  fireEvent(document, new Event('visibilitychange'));
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  unmount();
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
});
