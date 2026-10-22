// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { WorkspaceFrame, WorkspaceLink } from './frame';
const navigation = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onNavigate,
    prefetch,
    ...props
  }: ComponentProps<typeof import('next/link').default>) => (
    <a
      {...props}
      href={String(href)}
      data-prefetch={String(prefetch)}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.({ preventDefault: vi.fn() });
      }}
    >
      {children}
    </a>
  ),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const path = '/weddings/20000000-0000-4000-8000-000000000001/guests/';

it('keeps a prepared destination in client navigation after the dirty draft is acknowledged', async () => {
  let finish!: (saved: boolean) => void;
  const save = vi.fn(
    () =>
      new Promise<boolean>((r) => {
        finish = r;
      }),
  );
  render(
    <WorkspaceFrame navigationGuard={{ pending: true, save }}>
      <WorkspaceLink href={path}>Open guests</WorkspaceLink>
    </WorkspaceFrame>,
  );
  const link = screen.getByRole('link', { name: 'Open guests' });
  expect(link.getAttribute('data-prefetch')).toBe('true');
  fireEvent.click(link);
  expect(navigation.push).not.toHaveBeenCalled();
  await act(async () => finish(true));
  expect(navigation.push).toHaveBeenCalledWith(path);
});
it('does not navigate away from an unconfirmed save', async () => {
  render(
    <WorkspaceFrame navigationGuard={{ pending: true, save: async () => false }}>
      <WorkspaceLink href={path}>Open guests</WorkspaceLink>
      <WorkspaceLink href="/dashboard/">Other workspace</WorkspaceLink>
    </WorkspaceFrame>,
  );
  expect(screen.getByRole('link', { name: 'Other workspace' }).getAttribute('data-prefetch')).toBe('false');
  await act(async () => fireEvent.click(screen.getByRole('link', { name: 'Open guests' })));
  expect(navigation.push).not.toHaveBeenCalled();
});
