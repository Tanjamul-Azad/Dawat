// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ManualPayment } from './manual-payment';
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('copies the owner-confirmed receiving number and offers selection on clipboard failure', async () => {
  const copy = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Denied'));
  vi.stubGlobal('navigator', { clipboard: { writeText: copy } });
  render(<ManualPayment requestId="20000000-0000-4000-8000-000000000123" amountMinor={75000} />);
  fireEvent.click(screen.getByRole('button', { name: 'বিকাশ personal নম্বর কপি করুন' }));
  await screen.findByText('কপি হয়েছে।');
  expect(copy).toHaveBeenLastCalledWith('01606092143');
  fireEvent.click(screen.getByRole('button', { name: 'Reference-এ লিখুন কপি করুন' }));
  await screen.findByText('নিচের নির্বাচিত লেখাটি নিজে কপি করুন।');
  const field = screen.getByDisplayValue('DW-00000123') as HTMLInputElement;
  expect(document.activeElement).toBe(field);
  expect(field.selectionStart).toBe(0);
  expect(field.selectionEnd).toBe(field.value.length);
});
