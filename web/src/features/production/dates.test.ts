import { expect, it } from 'vitest';
import { formatDhaka } from './dates';

it('formats dates in Asia/Dhaka with fixed Bangla month names and digits', () => {
  expect(formatDhaka('2026-01-05T08:07:09Z', 'bn', { date: 'long' })).toBe('৫ জানুয়ারি, ২০২৬');
  expect(formatDhaka('2026-02-28T20:30:00Z', 'bn', { date: 'long' })).toBe('১ মার্চ, ২০২৬');
  expect(formatDhaka('2026-01-05T08:07:09Z', 'bn', { date: 'medium', time: 'short' })).toBe(
    '৫ জানুয়ারি, ২০২৬, ২:০৭ PM',
  );
  expect(formatDhaka('2026-01-04T18:05:09Z', 'bn', { time: 'medium' })).toBe('১২:০৫:০৯ AM');
});

it('keeps the en-GB layout with a fixed three-letter month (ICU varies between Sep and Sept)', () => {
  const instant = '2026-09-15T08:07:09Z';
  expect(formatDhaka(instant, 'en', { date: 'long' })).toBe('15 September 2026');
  expect(formatDhaka(instant, 'en', { date: 'medium', time: 'short' })).toBe('15 Sep 2026, 14:07');
  expect(formatDhaka(instant, 'en', { time: 'medium' })).toBe('14:07:09');
  expect(formatDhaka(new Date('2026-12-31T18:30:00Z'), 'en', { date: 'long' })).toBe('1 January 2027');
});

it('returns an empty string for an unparseable instant', () => {
  expect(formatDhaka('not a date', 'bn', { date: 'long' })).toBe('');
});
