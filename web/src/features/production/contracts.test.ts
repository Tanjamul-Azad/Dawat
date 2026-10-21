import { expect, it } from 'vitest';
import { emptyDraft, publicationIssues } from './contracts';
const complete = () => ({
  ...emptyDraft(),
  partnerOne: 'মেহরিন',
  partnerTwo: 'আরিব',
  events: [
    {
      id: 'reception' as const,
      title: 'সংবর্ধনা',
      venue: 'ঢাকা',
      date: '2026-12-12',
      time: '19:00',
      address: '',
    },
  ],
});
it.each(['\u200b', '\u200d', '  ', '---', '\u0301', 'নাম\nপরের লাইন'])(
  'rejects meaningless or control-bearing required name %s',
  (name) => {
    expect(publicationIssues({ ...complete(), partnerOne: name })).toContain('Add both names.');
  },
);
it('supports one celebration and meaningful Bangla shaping without changing authored text', () => {
  const value = { ...complete(), partnerOne: 'শ্রেয়া', partnerTwo: 'সঞ্জয়' };
  expect(publicationIssues(value)).toEqual([]);
  expect(value.partnerOne).toBe('শ্রেয়া');
});
it('rejects invisible venues while allowing incomplete drafts to remain editable', () => {
  const value = complete();
  value.events[0].venue = '\u200b';
  expect(publicationIssues(value)).toHaveLength(1);
  expect(emptyDraft().partnerOne).toBe('');
});
