// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { WeddingDesk } from './wedding-desk';
import { ProductLocale } from './product-locale';
import { emptyDraft, type WeddingDetail } from '@/features/production/contracts';

// Exercise the editor's real departure guard while keeping navigation inside the test.
const departure = vi.hoisted(() => ({ result: undefined as boolean | undefined }));
vi.mock('./frame', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./frame')>();
  return {
    ...actual,
    WorkspaceFrame: ({
      children,
      navigationGuard,
    }: {
      children: ReactNode;
      navigationGuard?: { save: () => Promise<boolean> };
    }) => (
      <>
        {children}
        <button
          onClick={async () => {
            departure.result = await navigationGuard!.save();
          }}
        >
          Leave workspace
        </button>
      </>
    ),
  };
});
const initial: WeddingDetail = {
  wedding: {
    id: '20000000-0000-4000-8000-000000000001',
    title: 'টেস্ট',
    slug: 'test',
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
const receipt = (revision: number) =>
  new Response(JSON.stringify({ data: { revision, updatedAt: '2026-10-20T10:01:00Z' } }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  departure.result = undefined;
});

it('waits for an in-flight autosave and flushes newer typing before allowing departure', async () => {
  vi.useFakeTimers();
  let finish!: (r: Response) => void;
  const fetcher = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<Response>((r) => {
          finish = r;
        }),
    )
    .mockResolvedValue(receipt(2));
  vi.stubGlobal('fetch', fetcher);
  render(
    <ProductLocale>
      <WeddingDesk initial={initial} email="test@example.test" initialSection="names" />
    </ProductLocale>,
  );
  const input = screen.getByLabelText('প্রথম জনের নাম') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'আগের লেখা' } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  fireEvent.change(input, { target: { value: 'শেষ লেখা' } });
  fireEvent.click(screen.getByRole('button', { name: 'Leave workspace' }));
  expect(departure.result).toBeUndefined();
  expect(input.closest('fieldset')?.disabled).toBe(true);
  await act(async () => {
    finish(receipt(1));
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
  const sent = JSON.parse(fetcher.mock.calls[1][1].body);
  expect(sent.expectedRevision).toBe(1);
  expect(sent.content.partnerOne).toBe('শেষ লেখা');
  expect(departure.result).toBe(true);
});

it('blocks departure on a failed save and retains the editable local text', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
  render(
    <ProductLocale>
      <WeddingDesk initial={initial} email="test@example.test" initialSection="names" />
    </ProductLocale>,
  );
  const input = screen.getByLabelText('প্রথম জনের নাম') as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'অক্ষত লেখা' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Leave workspace' }));
  });
  expect(departure.result).toBe(false);
  expect(input.value).toBe('অক্ষত লেখা');
  expect(input.disabled).toBe(false);
  expect(screen.getByRole('alert')).toBeTruthy();
});
