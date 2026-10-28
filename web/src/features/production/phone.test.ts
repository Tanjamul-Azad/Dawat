import { describe, expect, it } from 'vitest';
import { displayPhone, normalizePhone, parsePhone, whatsappChatUrl, whatsappDigits } from './phone';

describe('normalizePhone', () => {
  it.each([
    ['01712345678', '+8801712345678'],
    ['০১৭১২৩৪৫৬৭৮', '+8801712345678'],
    ['+8801712345678', '+8801712345678'],
    ['8801712345678', '+8801712345678'],
    ['+880 1712-345678', '+8801712345678'],
    ['(017) 1234 5678', '+8801712345678'],
    ['  01712 345 678 ', '+8801712345678'],
    ['+44 7700 900123', '+447700900123'],
  ])('accepts %s', (input, expected) => expect(normalizePhone(input)).toBe(expected));

  it.each([
    '',
    '12345',
    '01212345678',
    '0171234567',
    '017123456789',
    '+880171234567',
    'phone me',
    '0171234567a',
    '+0123456789',
    '00880171234567',
  ])('rejects %s', (input) => {
    expect(parsePhone(input)).toBeNull();
    if (input) expect(() => normalizePhone(input)).toThrow(/WhatsApp/);
  });
});

describe('wa.me links', () => {
  it('uses digits only and encodes the whole message', () => {
    const message = 'আসসালামু আলাইকুম & স্বাগতম?\nলিংক: https://x.test/a?b=1&c=2#d';
    const url = whatsappChatUrl('+8801712345678', message);
    expect(url.startsWith('https://wa.me/8801712345678?text=')).toBe(true);
    expect(new URL(url).searchParams.get('text')).toBe(message);
    expect(url).not.toMatch(/[\s&#]c=|\n/);
  });
  it('opens the contact picker when there is no number', () => {
    expect(whatsappChatUrl(null, 'hi')).toBe('https://wa.me/?text=hi');
  });
  it('formats for people', () => {
    expect(displayPhone('+8801712345678')).toBe('01712-345678');
    expect(displayPhone('+447700900123')).toBe('+447700900123');
    expect(whatsappDigits('+8801712345678')).toBe('8801712345678');
  });
});
