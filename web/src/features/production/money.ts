import { latinDigits } from './copy';
export function parseBDT(value: string): number | null {
  const normalized = latinDigits(value.trim());
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(amount) && amount <= 1_000_000_000 ? amount : null;
}
export const taka = (amount: number, locale: 'bn' | 'en') =>
  `৳${new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { maximumFractionDigits: 2 }).format(amount)}`;
export const takaFromPaisa = (minor: number, locale: 'bn' | 'en') => taka(minor / 100, locale);
