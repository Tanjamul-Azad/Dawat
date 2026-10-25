// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { GuestList } from './guest-list';
import type { HouseholdRow } from '@/features/production/guests';
const row: HouseholdRow = {
  id: '20000000-0000-4000-8000-000000000001',
  name: 'সাবিহা রহমান',
  nameBn: '',
  greeting: 'প্রিয় সাবিহা',
  greetingEn: '',
  message: 'বিশেষ আমন্ত্রণ',
  messageEn: '',
  privateNote: 'অফিসের বন্ধু',
  events: [{ eventId: 'reception', maxPeople: 1 }],
  revision: 1,
  responseRevision: 0,
  linkRevision: 0,
  linkState: 'missing',
  responses: {},
};
const actions = () => ({
  onCopy: vi.fn(),
  onPreview: vi.fn(),
  onEdit: vi.fn(),
  onCorrect: vi.fn(),
  onRotate: vi.fn(),
  onRevoke: vi.fn(),
});
afterEach(cleanup);
it('keeps notes and secondary actions collapsed, opening only the requested invitation', () => {
  render(
    <GuestList
      rows={[
        row,
        {
          ...row,
          id: '20000000-0000-4000-8000-000000000002',
          name: 'রহমান পরিবার',
          privateNote: 'অন্য আমন্ত্রণ',
        },
      ]}
      eventId="reception"
      busy={false}
      eventTitle={() => 'সংবর্ধনা'}
      {...actions()}
    />,
  );
  expect(screen.queryByText('অফিসের বন্ধু')).toBeNull();
  expect(screen.queryByRole('button', { name: 'প্রিভিউ' })).toBeNull();
  const first = screen.getByRole('button', { name: 'সাবিহা রহমান' });
  fireEvent.click(first);
  expect(first.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByText('অফিসের বন্ধু')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'রহমান পরিবার' }));
  expect(screen.queryByText('অফিসের বন্ধু')).toBeNull();
  expect(screen.getByText('অন্য আমন্ত্রণ')).toBeTruthy();
  expect(first.getAttribute('aria-expanded')).toBe('false');
});
it('keeps a pending individual distinct from a declined group and targets duplicate names by ID', () => {
  const second = {
    ...row,
    id: '20000000-0000-4000-8000-000000000002',
    linkState: 'revoked' as const,
    responses: {
      reception: {
        attendance: 'declined' as const,
        adults: 0,
        children: 0,
        note: '',
        updatedAt: '2026-10-26T00:00:00Z',
      },
    },
  };
  const callbacks = actions();
  render(
    <GuestList
      rows={[row, second]}
      eventId="reception"
      busy={false}
      eventTitle={() => 'সংবর্ধনা'}
      {...callbacks}
    />,
  );
  const rows = within(screen.getByRole('table')).getAllByRole('row');
  expect(within(rows[1]).getByText('অপেক্ষমাণ')).toBeTruthy();
  expect(within(rows[2]).getByText('আসবেন না')).toBeTruthy();
  fireEvent.click(within(rows[1]).getByRole('button', { name: /তৈরি করে কপি/ }));
  expect(callbacks.onCopy).toHaveBeenCalledWith(row);
  expect((within(rows[2]).getByRole('button', { name: /লিংক কপি/ }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  fireEvent.click(within(rows[2]).getByRole('button', { name: 'সাবিহা রহমান' }));
  fireEvent.click(screen.getByRole('button', { name: 'নতুন লিংক তৈরি করুন' }));
  expect(callbacks.onRotate).toHaveBeenCalledWith(second);
});
