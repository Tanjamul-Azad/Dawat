import { latinDigits } from './copy';

/**
 * Turns what a person types into E.164. Empty is allowed and gives null.
 * Bangladesh mobiles are accepted as 01XXXXXXXXX (Bangla digits too), 8801XXXXXXXXX
 * or +8801XXXXXXXXX. Any other country needs its +country code.
 * Throws on anything that is not a usable number.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  let phone = latinDigits((input ?? '').normalize('NFKC')).trim();
  if (!phone) return null;
  phone = phone.replace(/[\s\-().]/g, '');
  if (/^01[3-9][0-9]{8}$/.test(phone)) phone = '+88' + phone;
  else if (/^8801[3-9][0-9]{8}$/.test(phone)) phone = '+' + phone;
  if (
    !/^\+[1-9][0-9]{7,14}$/.test(phone) ||
    (phone.startsWith('+880') && !/^\+8801[3-9][0-9]{8}$/.test(phone))
  )
    throw new Error('Enter a valid WhatsApp number, including the country code for international numbers.');
  return phone;
}
/** Same rules, but a number that is not usable gives null instead of throwing. */
export function parsePhone(input: string | null | undefined): string | null {
  try {
    return normalizePhone(input);
  } catch {
    return null;
  }
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
