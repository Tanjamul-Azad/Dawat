import { describe, expect, it } from 'vitest';
import { createWorkspace, invitationSchema, photoSchema, summarize } from '@/features/workspace/model';
import {
  bilingualIssues,
  calendarContent,
  countdown,
  eventInstant,
  eventText,
  formatDate,
  localNames,
  mapUrl,
  parseCount,
  resolveLocale,
  responseError,
  saveResponse,
  words,
} from './content';

describe('Bangla/English invitation contract', () => {
  it('requires reviewed bilingual content and photo descriptions before publication', () => {
    const invitation = createWorkspace().draft;
    expect(bilingualIssues(invitation)).toEqual([]);
    invitation.partnerOneBn = '';
    invitation.photos![0].altBn = '';
    expect(bilingualIssues(invitation)).toContain('partner names in Bangla');
    expect(bilingualIssues(invitation)).toContain('photo descriptions in both languages');
  });
  it('restricts locale resolution and has matching complete dictionary keys', () => {
    expect(resolveLocale('bn', 'en')).toBe('bn');
    expect(resolveLocale('it', 'en')).toBe('en');
    expect(resolveLocale('ar')).toBe('bn');
    expect(Object.keys(words.bn).sort()).toEqual(Object.keys(words.en).sort());
  });
  it('uses explicit local names/events without translating or changing originals', () => {
    const invitation = createWorkspace().draft;
    expect(localNames(invitation, 'bn')).toEqual(['মেহরিন', 'আরিব']);
    expect(localNames(invitation, 'en')).toEqual(['Mehrin', 'Arib']);
    expect(eventText(invitation.events[0], 'bn').title).toBe('আকদ');
    invitation.partnerOneBn = '';
    expect(localNames(invitation, 'bn')[0]).toBe('Mehrin');
  });
  it('parses local and mixed digits but rejects empty, fractional and signed counts', () => {
    for (const raw of ['২', ' 2 ', '০২', '0২']) expect(parseCount(raw)).toBe(2);
    for (const raw of ['', ' ', '-1', '+2', '1.5', '1e2', 'NaN', '২জন']) expect(parseCount(raw)).toBe(null);
    expect(parseCount('০')).toBe(0);
  });
});
describe('time, countdown, maps and calendars', () => {
  it('uses the actual event instant in Bangladesh timezone', () => {
    expect(eventInstant({ date: '2026-12-12', time: '19:00' })).toBe(Date.parse('2026-12-12T13:00:00Z'));
    expect(eventInstant({ date: '2026-02-30', time: '19:00' })).toBe(null);
    expect(eventInstant({ date: '2026-12-12', time: '24:00' })).toBe(null);
    expect(formatDate('', 'en')).toBe(words.en.dateTba);
  });
  it('does not roll impossible dates through the content schema', () => {
    const invitation = createWorkspace().draft;
    invitation.events[0].date = '2026-02-30';
    expect(invitationSchema.safeParse(invitation).success).toBe(false);
  });
  it('clamps past countdown values and computes each unit from one target', () => {
    expect(countdown(0, 1000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
    expect(countdown(93784000, 0)).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4, past: false });
  });
  it('encodes untrusted venue content inside a fixed Google Maps destination', () => {
    const event = createWorkspace().draft.events[0];
    event.venue = 'A & B # Hall';
    event.address = 'ঢাকা / ১২';
    const url = new URL(mapUrl(event));
    expect(url.hostname).toBe('www.google.com');
    expect(url.searchParams.get('query')).toBe('A & B # Hall, ঢাকা / ১২');
    expect(new URL(mapUrl(event, true)).searchParams.get('output')).toBe('embed');
  });
  it('generates event-specific localized ICS with stable identity and UTF-8 line folding', () => {
    const invitation = createWorkspace().draft;
    const event = invitation.events[1];
    event.venueBn = 'অতিথিদের জন্য সুন্দর একটি অনুষ্ঠানস্থল, '.repeat(6);
    event.addressBn = 'ঢাকা; বাংলাদেশ\nনতুন ঠিকানা';
    const en = calendarContent(event, invitation, 'en'),
      bn = calendarContent(event, invitation, 'bn');
    expect(en).toContain('DTSTART:20261212T130000Z');
    expect(en).toContain('DTEND:20261212T150000Z');
    expect(en.match(/UID:.+/)?.[0]).toBe(bn.match(/UID:.+/)?.[0]);
    expect(bn.replace(/\r\n /g, '')).toContain('ঢাকা\\; বাংলাদেশ\\nনতুন ঠিকানা');
    for (const line of bn.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
describe('response integrity and photo boundaries', () => {
  it('rechecks the latest household scope and limit on every write', () => {
    const state = createWorkspace();
    const stale = structuredClone(state.guests[0]);
    state.guests[0].allowance = 1;
    const answer = { attendance: 'accepted' as const, adults: 2, children: 0, note: '', updatedAt: 'now' };
    expect(() => saveResponse(state, stale, 'reception', answer, state.draft)).toThrow('allowanceInvalid');
    state.guests[0].events = ['nikah'];
    expect(() => saveResponse(state, stale, 'reception', { ...answer, adults: 1 }, state.draft)).toThrow(
      'invalidScope',
    );
  });
  it('requires zero declined counts and enforces deadline at write time', () => {
    const state = createWorkspace(),
      guest = state.guests[0];
    expect(
      responseError(guest, 'reception', { attendance: 'declined', adults: 1, children: 0 }, state.draft),
    ).toBe('allowanceInvalid');
    state.draft.rsvpClosesAt = '2026-10-01T00:00:00Z';
    expect(
      responseError(
        guest,
        'reception',
        { attendance: 'declined', adults: 0, children: 0 },
        state.draft,
        Date.parse('2026-10-19'),
      ),
    ).toBe('closed');
  });
  it('updates one response identity and preserves the independently saved wish count', () => {
    const state = createWorkspace();
    const guest = state.guests[0];
    const next = saveResponse(
      state,
      guest,
      'reception',
      { attendance: 'declined', adults: 0, children: 0, note: 'Best wishes', updatedAt: 'now' },
      state.draft,
    );
    expect(next.guests.length).toBe(state.guests.length);
    expect(summarize(next.guests, 'reception').declined).toBe(2);
    expect(next.wishes).toBe(state.wishes);
  });
  it('accepts approved local photos but rejects scripts, external URLs and SVG data', () => {
    const photo = { id: '1', src: '/artwork/jamdani-couple-v1.webp', alt: 'Couple' };
    expect(photoSchema.safeParse(photo).success).toBe(true);
    for (const src of [
      'javascript:alert(1)',
      'https://unknown.example/photo.jpg',
      'data:image/svg+xml;base64,AAAA',
      '/artwork/../../private',
    ])
      expect(photoSchema.safeParse({ ...photo, src }).success).toBe(false);
  });
});
