import { describe, expect, it } from 'vitest';
import { normalizePhone } from './phone';
import { defaultInviteBn, defaultInviteEn, renderInvite, waUrl } from './whatsapp';
describe('WhatsApp invitations', () => {
  it.each(['01712345678', '০১৭১২৩৪৫৬৭৮', '+880 1712-345678', '8801712345678'])('normalizes %s', value => expect(normalizePhone(value)).toBe('+8801712345678'));
  it('accepts international numbers and empty optional numbers', () => {
    expect(normalizePhone('+44 7911 123456')).toBe('+447911123456');
    expect(normalizePhone('')).toBeNull();
  });
  it.each(['0171234', '+8801712345', 'abc', '01712345678x', '+0123456789'])('rejects invalid %s', value => expect(() => normalizePhone(value)).toThrow());
  it('renders both languages once without treating replacement text as placeholders', () => {
    const values = { name: 'ক'.repeat(120) + '{link}', link: 'https://example.test/i/?a=1&b=2', couple: 'A & B' };
    for (const template of [defaultInviteBn, defaultInviteEn]) {
      const message = renderInvite(template, values);
      expect(message).toContain(values.name);
      expect(message).toContain(values.couple);
      expect(message.split(values.link)).toHaveLength(2);
      expect(new URL(waUrl('+8801712345678', message)).searchParams.get('text')).toBe(message);
    }
    expect(renderInvite('Hello {name}', values)).toBe(`Hello ${values.name}\n${values.link}`);
    expect(waUrl(null, 'A & B')).toBe('https://wa.me/?text=A%20%26%20B');
  });
});
