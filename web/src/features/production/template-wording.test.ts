import { expect, it } from 'vitest';
import { templateWording, withTemplateWording } from './template-wording';

it('uses the same complete wording for a legacy blank draft and a published card', () => {
  const original = { hosts: ' ', message: '', messageEn: undefined, partnerOne: 'দুজনের নাম', venue: '' };
  const rendered = withTemplateWording(original);
  expect(rendered.hosts).toBe(templateWording.hosts);
  expect(rendered.message).toBe(templateWording.message);
  expect(rendered.messageEn).toBe(templateWording.messageEn);
  expect(rendered.partnerOne).toBe(original.partnerOne);
  expect(rendered.venue).toBe('');
  expect(original.message).toBe('');
});
it('preserves personal wording without inventing an unrelated English translation', () => {
  const original = { hosts: 'আমাদের পরিবার', message: 'নিজের বিশেষ আমন্ত্রণ', messageEn: '' };
  expect(withTemplateWording(original)).toEqual(original);
});
it('retains an explicitly supplied English translation when only Bangla wording is missing', () => {
  expect(
    withTemplateWording({ hosts: '', message: '', messageEn: 'Our personal invitation' }).messageEn,
  ).toBe('Our personal invitation');
});
