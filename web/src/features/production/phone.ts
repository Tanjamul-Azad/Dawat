/** Empty is optional; all stored values use E.164. */
export function normalizePhone(input: string | null | undefined): string | null {
  let phone = (input ?? '').replace(/[০-৯]/g, digit => String(digit.charCodeAt(0) - 0x09e6)).trim();
  if (!phone) return null;
  phone = phone.replace(/[\s-]/g, '');
  if (/^01[3-9][0-9]{8}$/.test(phone)) phone = '+88' + phone;
  else if (/^8801[3-9][0-9]{8}$/.test(phone)) phone = '+' + phone;
  if (!/^\+[1-9][0-9]{7,14}$/.test(phone) || (phone.startsWith('+880') && !/^\+8801[3-9][0-9]{8}$/.test(phone)))
    throw new Error('Enter a valid WhatsApp number, including the country code for international numbers.');
  return phone;
}
