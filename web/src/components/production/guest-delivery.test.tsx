// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { createWorkspace, type Guest, type Workspace } from '@/features/workspace/model';
import type { GuestPayload } from '@/features/production/guests';
import { GuestLive } from './guest-live';
import { InvitationResponse, type ResponseTransport } from '../invitation-response';
import { words } from '@/features/invitation/content';
vi.mock('../guest-invitation', () => ({
  GuestInvitation: ({
    workspace,
    responseTransport,
  }: {
    workspace: Workspace;
    responseTransport?: ResponseTransport;
  }) => (
    <>
      <output data-testid="confirmed-adults">{workspace.guests[0].responses.reception?.adults ?? 0}</output>
      <button onClick={() => void responseTransport!.refresh()}>Refresh scoped invitation</button>
      <button
        onClick={() =>
          void responseTransport!.submitResponse('reception', {
            attendance: 'accepted',
            adults: 3,
            children: 0,
            note: '',
            updatedAt: '',
          })
        }
      >
        Send scoped answer
      </button>
    </>
  ),
}));
beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Guest invitation concurrent refresh and write receipts', () => {
  const initial = (): GuestPayload => ({
    content: { ...createWorkspace().published!, theme: 'jamdani', photos: [], generalEventIds: [] },
    guest: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Rahman family',
      nameBn: '',
      greeting: '',
      greetingEn: '',
      message: '',
      messageEn: '',
      responses: {},
    },
    scopes: [{ eventId: 'reception', maxPeople: 7 }],
    policies: [{ eventId: 'reception', isOpen: true, deadline: null }],
    policyRevision: 1,
    householdRevision: 1,
    responseRevision: 0,
  });
  const result = (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 });
  it('keeps an acknowledged answer when an earlier background snapshot arrives late', async () => {
    let finishRead!: (value: Response) => void;
    const read = new Promise<Response>((r) => {
      finishRead = r;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn((_path, options) =>
        options.method === 'POST'
          ? Promise.resolve(result({ responseRevision: 1, confirmedAt: '2026-10-20T08:00:00Z' }))
          : read,
      ),
    );
    const payload = initial();
    render(<GuestLive initial={payload} slug="test-wedding" />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh scoped invitation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Send scoped answer' }));
    await waitFor(() => expect(screen.getByTestId('confirmed-adults').textContent).toBe('3'));
    await act(async () => {
      finishRead(result(payload));
      await read;
    });
    expect(screen.getByTestId('confirmed-adults').textContent).toBe('3');
  });
  it('keeps a newer server answer when an earlier successful write receipt arrives late', async () => {
    let finishWrite!: (value: Response) => void;
    const write = new Promise<Response>((r) => {
      finishWrite = r;
    });
    const payload = initial();
    const newer = {
      ...payload,
      responseRevision: 2,
      guest: {
        ...payload.guest,
        responses: {
          reception: {
            attendance: 'accepted',
            adults: 5,
            children: 0,
            note: '',
            updatedAt: '2026-10-20T08:01:00Z',
          },
        },
      },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn((_path, options) => (options.method === 'POST' ? write : Promise.resolve(result(newer)))),
    );
    render(<GuestLive initial={payload} slug="test-wedding" />);
    fireEvent.click(screen.getByRole('button', { name: 'Send scoped answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh scoped invitation' }));
    await waitFor(() => expect(screen.getByTestId('confirmed-adults').textContent).toBe('5'));
    await act(async () => {
      finishWrite(result({ responseRevision: 1, confirmedAt: '2026-10-20T08:00:00Z' }));
      await write;
    });
    expect(screen.getByTestId('confirmed-adults').textContent).toBe('5');
  });
});
const guest: Guest = {
  id: 'household-proof',
  name: 'Rahman Family',
  allowance: 2,
  events: ['reception'],
  responses: {},
  greeting: '',
  message: '',
};
function setup(overrides: Partial<ResponseTransport> = {}) {
  const workspace = createWorkspace();
  const update = vi.fn(() => true);
  const remote: ResponseTransport = {
    allowances: { reception: 7 },
    policies: { reception: { isOpen: true, deadline: null } },
    submitResponse: vi.fn(async () => {}),
    submitWish: vi.fn(async () => {}),
    refresh: vi.fn(async () => {}),
    ...overrides,
  };
  const props = {
    workspace,
    guest,
    invitation: workspace.published!,
    events: workspace.published!.events.filter((e) => e.id === 'reception'),
    locale: 'en' as const,
    update,
    remote,
  };
  return { ...render(<InvitationResponse {...props} />), remote, update, props };
}
describe('Shared invitation response with a real server transport', () => {
  it('shows a receipt only after server acknowledgement and uses the event allowance', async () => {
    let finish!: () => void;
    const promise = new Promise<void>((r) => {
      finish = r;
    });
    const submit = vi.fn<ResponseTransport['submitResponse']>(() => promise);
    const { update } = setup({ submitResponse: submit });
    fireEvent.change(screen.getByLabelText(words.en.adults), { target: { value: '৩' } });
    fireEvent.change(screen.getByLabelText(words.en.children), { target: { value: '1' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.submit }).closest('form')!);
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    expect(submit.mock.calls[0][1]).toMatchObject({ adults: 3, children: 1 });
    expect(screen.queryByText('Your reply is confirmed on the server.')).toBeNull();
    expect(update).not.toHaveBeenCalled();
    finish();
    expect(await screen.findByText('Your reply is confirmed on the server.')).toBeTruthy();
  });
  it('retains unsent text across a conflict and a refreshed server receipt', async () => {
    const { props, rerender } = setup({
      submitResponse: vi.fn(async () => {
        throw new Error('Reply changed in another tab.');
      }),
    });
    const field = screen.getByLabelText(/Anything we should know/);
    fireEvent.change(field, { target: { value: 'Please retain this unsent note' } });
    fireEvent.submit(screen.getByRole('button', { name: words.en.submit }).closest('form')!);
    await screen.findByText('Reply changed in another tab.');
    rerender(
      <InvitationResponse
        {...props}
        guest={{
          ...guest,
          responses: {
            reception: {
              attendance: 'accepted',
              adults: 2,
              children: 0,
              note: 'Server note',
              updatedAt: '2026-10-20T07:00:00Z',
            },
          },
        }}
      />,
    );
    expect((field as HTMLTextAreaElement).value).toBe('Please retain this unsent note');
    expect(screen.queryByText('Your reply is confirmed on the server.')).toBeNull();
  });
  it('does not clear or acknowledge a wish whose server write failed', async () => {
    const submit = vi.fn(async () => {
      throw new Error('Network interrupted. Please retry.');
    });
    const { update } = setup({ submitWish: submit });
    const field = screen.getByLabelText(words.en.wish);
    fireEvent.change(field, { target: { value: 'A private wish for the couple' } });
    const form = screen.getByRole('button', { name: words.en.wishSend }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    await screen.findByText('Network interrupted. Please retry.');
    expect(submit).toHaveBeenCalledOnce();
    expect((field as HTMLTextAreaElement).value).toBe('A private wish for the couple');
    expect(update).not.toHaveBeenCalled();
    expect(screen.queryByText(words.en.wishThanks)).toBeNull();
  });
  it('does not permit response writes when the server policy closes the event', () => {
    const { remote } = setup({ policies: { reception: { isOpen: false, deadline: null } } });
    expect(screen.getByRole('button', { name: words.en.submit }).matches(':disabled')).toBe(true);
    expect(remote.submitResponse).not.toHaveBeenCalled();
  });
});
