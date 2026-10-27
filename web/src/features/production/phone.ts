import { latinDigits } from './copy';

/**
 * Turns what a person types into E.164, or null when it is not a usable number.
 * Bangladesh mobiles are accepted as 01XXXXXXXXX (Bangla digits too), 8801XXXXXXXXX
 * or +8801XXXXXXXXX. Any other country needs its +country code.
 */
export function normalizePhone(input: string): string | null {
  const typed = latinDigits(input.normalize('NFKC'))
    .trim()
    .replace(/^\(?\+?\s*/, (m) => (m.includes('+') ? '+' : ''))
    .replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(typed)) return null;
  const international = typed.startsWith('+');
  const digits = typed.replace(/^\+/, '');
  if (!international) {
    if (/^01[3-9]\d{8}$/.test(digits)) return `+880${digits.slice(1)}`;
    if (/^8801[3-9]\d{8}$/.test(digits)) return `+${digits}`;
    return null;
  }
  if (digits.startsWith('880')) return /^8801[3-9]\d{8}$/.test(digits) ? `+${digits}` : null;
  return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
}
/** digits only, as wa.me expects: +8801712345678 → 8801712345678 */
export const whatsappDigits = (e164: string) => e164.replace(/\D/g, '');
/** 01712-345678 style for people; falls back to the E.164 form for other countries. */
export function displayPhone(e164: string) {
  const m = /^\+880(1[3-9]\d{2})(\d{6})$/.exec(e164);
  return m ? `0${m[1]}-${m[2]}` : e164;
}
/** wa.me link; opens WhatsApp (Desktop or Web) on that chat with the message ready. */
export function whatsappChatUrl(e164: string | null, message: string) {
  const text = encodeURIComponent(message);
  return e164 ? `https://wa.me/${whatsappDigits(e164)}?text=${text}` : `https://wa.me/?text=${text}`;
}
