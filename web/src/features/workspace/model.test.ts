import { describe, expect, it } from 'vitest';
import {
  activateDashboard,
  confirmOrder,
  createWorkspace,
  csvCell,
  dateLabel,
  hasDashboardAccess,
  summarize,
  validateResponse,
  workspaceSchema,
} from './model';

describe('household response accounting', () => {
  it('separates response groups, people, decline and unanswered invitations', () => {
    const summary = summarize(createWorkspace().guests, 'reception');
    expect(summary).toEqual({ accepted: 4, declined: 1, pending: 3, adults: 11, children: 3, invited: 8 });
  });
  it('does not count an event the household was not invited to', () => {
    const state = createWorkspace();
    state.guests[0].events = ['nikah'];
    expect(summarize(state.guests, 'reception').invited).toBe(7);
    expect(() =>
      validateResponse(state.guests[0], 'reception', { attendance: 'accepted', adults: 1, children: 0 }),
    ).toThrow('not included');
  });
  it('rejects excess, fractional, empty accepted and nonzero declined answers', () => {
    const guest = createWorkspace().guests[0];
    for (const [adults, children] of [
      [6, 0],
      [1.5, 0],
      [0, 0],
      [-1, 1],
    ])
      expect(() =>
        validateResponse(guest, 'reception', { attendance: 'accepted', adults, children }),
      ).toThrow();
    expect(() =>
      validateResponse(guest, 'reception', { attendance: 'declined', adults: 1, children: 0 }),
    ).toThrow();
  });
  it('updates the current household answer without counting response history', () => {
    const state = createWorkspace();
    state.guests[0].responses.reception = {
      attendance: 'declined',
      adults: 0,
      children: 0,
      note: '',
      updatedAt: new Date().toISOString(),
    };
    const summary = summarize(state.guests, 'reception');
    expect(summary.accepted).toBe(3);
    expect(summary.declined).toBe(2);
    expect(summary.adults + summary.children).toBe(9);
  });
  it('returns independent fixture copies and keeps base and draft separate', () => {
    const state = createWorkspace();
    state.draft.partnerOne = 'Changed';
    expect(state.published?.partnerOne).toBe('Mehrin');
    expect(createWorkspace().draft.partnerOne).toBe('Mehrin');
  });
});
describe('safe display and exports', () => {
  it('handles an incomplete draft date without crashing the preview', () =>
    expect(dateLabel('')).toBe('Date to be announced'));
  it('quotes CSV and defuses common spreadsheet formula prefixes', () => {
    expect(csvCell('=HYPERLINK("example")')).toBe('"\'=HYPERLINK(""example"")"');
    expect(csvCell('A, B')).toBe('"A, B"');
    expect(csvCell(4)).toBe('"4"');
  });
});
describe('order confirmation and dashboard activation', () => {
  const requested = () => {
    const state = createWorkspace();
    state.order = {
      id: 'order-1',
      name: 'Sample Buyer',
      email: 'buyer@example.com',
      submittedAt: '2026-10-19',
      confirmedAt: null,
      activatedAt: null,
      revokedAt: null,
      invitation: structuredClone(state.draft),
    };
    return state;
  };
  it('denies new, legacy, pending, and unconfirmed activated states', () => {
    const state = createWorkspace();
    expect(hasDashboardAccess(state)).toBe(false);
    const { order: _order, ...legacy } = state;
    expect(workspaceSchema.parse(legacy).order).toBe(null);
    const pending = requested();
    expect(hasDashboardAccess(pending)).toBe(false);
    pending.order!.activatedAt = '2026-10-19';
    expect(hasDashboardAccess(pending)).toBe(false);
  });
  it('requires confirmation before activation and keeps confirmation distinct', () => {
    expect(() => confirmOrder(createWorkspace(), 'now')).toThrow();
    expect(() => activateDashboard(requested(), 'now')).toThrow();
    const confirmed = confirmOrder(requested(), 'first');
    expect(hasDashboardAccess(confirmed)).toBe(false);
    expect(confirmOrder(confirmed, 'second').order?.confirmedAt).toBe('first');
    const active = activateDashboard(confirmed, 'activation');
    expect(hasDashboardAccess(active)).toBe(true);
    expect(active.published).toBe(null);
    expect(active.guests).toEqual([]);
    active.draft.partnerOne = 'Later edit';
    active.order!.revokedAt = 'revoked';
    expect(hasDashboardAccess(active)).toBe(false);
    const reactivated = activateDashboard(active, 'again');
    expect(hasDashboardAccess(reactivated)).toBe(true);
    expect(reactivated.draft.partnerOne).toBe('Later edit');
  });
  it('activates the ordered snapshot, preserving its independence from later previews', () => {
    const state = requested();
    state.draft.partnerOne = 'Unordered edit';
    const active = activateDashboard(confirmOrder(state, 'confirmed'), 'activated');
    expect(active.draft.partnerOne).toBe('Mehrin');
    active.draft.partnerOne = 'Editable draft';
    expect(active.order?.invitation.partnerOne).toBe('Mehrin');
  });
});
