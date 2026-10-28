// Names typed into "নিজেদের নাম লিখে দেখুন" travel to the order page as one `?names=` value. Client-side only.
export const NAME_LIMIT = 30;
export type CoupleNames = { first: string; second: string };

const clean = (value: string) =>
  value
    .replace(/[&\s]+/g, ' ')
    .trim()
    .slice(0, NAME_LIMIT);

/** "A & B" for the URL. Empty when neither name was typed. */
export function namesParam(names: CoupleNames) {
  const first = clean(names.first);
  const second = clean(names.second);
  if (!first && !second) return '';
  return [first, second].filter(Boolean).join(' & ');
}

export function parseNamesParam(value: unknown): CoupleNames {
  if (typeof value !== 'string') return { first: '', second: '' };
  const [first = '', second = ''] = value.slice(0, 2 * NAME_LIMIT + 5).split(' & ');
  return { first: clean(first), second: clean(second) };
}

/** Appends the typed names to an order link; other query values are kept as they are. */
export function withNames(href: string, names: CoupleNames) {
  const param = namesParam(names);
  if (!param) return href;
  return `${href}${href.includes('?') ? '&' : '?'}names=${encodeURIComponent(param)}`;
}
