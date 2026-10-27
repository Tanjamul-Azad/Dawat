// Built by hand rather than with Intl: Node and browsers ship different CLDR
// Bangla month spellings (জানুয়ারী vs জানুয়ারি), which breaks hydration.
const bnMonths = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];
const enMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
// Asia/Dhaka has kept a fixed UTC+06:00 offset since 2009.
const dhakaOffset = 6 * 60 * 60 * 1000;
const banglaDigits = (value: string) => value.replace(/\d/g, (d) => String.fromCharCode(0x09e6 + Number(d)));
const pad = (n: number) => String(n).padStart(2, '0');

export type DhakaFormat = { date?: 'long' | 'medium'; time?: 'short' | 'medium' };

/** Formats an instant in Asia/Dhaka identically on server and client. */
export function formatDhaka(value: string | number | Date, locale: 'bn' | 'en', { date, time }: DhakaFormat) {
  const instant = new Date(value).getTime();
  if (!Number.isFinite(instant)) return '';
  const d = new Date(instant + dhakaOffset);
  const [year, month, day] = [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
  const [hour, minute, second] = [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()];
  const seconds = time === 'medium' ? `:${pad(second)}` : '';
  if (locale === 'bn') {
    // Bangla readers get the full month name; abbreviations vary between CLDR releases.
    const datePart = date && `${day} ${bnMonths[month]}, ${year}`;
    const timePart = time && `${hour % 12 || 12}:${pad(minute)}${seconds} ${hour < 12 ? 'AM' : 'PM'}`;
    return banglaDigits([datePart, timePart].filter(Boolean).join(', '));
  }
  const name = date === 'medium' ? enMonths[month].slice(0, 3) : enMonths[month];
  const datePart = date && `${day} ${name} ${year}`;
  const timePart = time && `${pad(hour)}:${pad(minute)}${seconds}`;
  return [datePart, timePart].filter(Boolean).join(', ');
}
