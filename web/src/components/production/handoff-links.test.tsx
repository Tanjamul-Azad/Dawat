// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, act } from '@testing-library/react';
import { ProductLocale } from './product-locale';
import { HandoffLinks } from './handoff-links';
const { copy } = vi.hoisted(() => ({ copy: vi.fn() }));
vi.mock('../ui', () => ({ copyText: copy }));
const workspaceUrl = 'https://pilot.example/weddings/11111111-1111-4111-8111-111111111111/';
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  document.cookie = 'dawat_ui=; Path=/; Max-Age=0';
});
it('keeps the private workspace distinct from guest links before publication', async () => {
  copy.mockResolvedValue(undefined);
  render(
    <ProductLocale>
      <HandoffLinks
        workspaceUrl={workspaceUrl}
        guestUrl="https://pilot.example/i/stale/"
        weddingId="fictional"
        live={false}
      />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByText('নিজের প্রবেশের লিংক রাখুন'));
  expect((screen.getByLabelText('কর্মপরিসরের লিংক') as HTMLInputElement).readOnly).toBe(true);
  expect(screen.getByText(/অতিথিদের পাঠাবেন না/)).toBeTruthy();
  expect(screen.queryByLabelText('সাধারণ আমন্ত্রণের লিংক')).toBeNull();
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'নিজের লিংক কপি করুন' })));
  expect(copy).toHaveBeenCalledWith(workspaceUrl);
  expect(screen.getByRole('status').textContent).toContain('কোনো বার্তা পাঠানো হয়নি');
});
it('offers manual selection when the clipboard fails and labels the general URL as view-only', async () => {
  copy.mockRejectedValue(new Error('clipboard denied'));
  render(
    <ProductLocale>
      <HandoffLinks
        workspaceUrl={workspaceUrl}
        guestUrl="https://pilot.example/i/example/"
        weddingId="fictional"
        live
      />
    </ProductLocale>,
  );
  fireEvent.click(screen.getByText('সাধারণ লিংক · শুধু দেখার জন্য'));
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'সাধারণ লিংক কপি করুন' })));
  expect(screen.getByRole('status').textContent).toContain('নির্বাচন করে নিজে কপি');
  expect(screen.getByText(/এই লিংকে উত্তর দেওয়া যায় না/)).toBeTruthy();
});
it('guides a paused invitation back to its existing links instead of starting publication again', () => {
  render(
    <ProductLocale>
      <HandoffLinks workspaceUrl={workspaceUrl} weddingId="fictional" live={false} paused />
    </ProductLocale>,
  );
  expect(screen.getByText(/আগের ব্যক্তিগত লিংকগুলো কাজ করবে/)).toBeTruthy();
  expect(screen.queryByText(/আগে আমন্ত্রণ প্রকাশ করুন/)).toBeNull();
  expect(screen.queryByLabelText('সাধারণ আমন্ত্রণের লিংক')).toBeNull();
});
