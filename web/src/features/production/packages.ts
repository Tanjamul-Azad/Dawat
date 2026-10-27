import { findTemplate, prices } from './catalog';

// Customer-facing package names (owner decision B). The catalog keeps its own tier ids;
// this file only maps a design, or "custom", to the name and price the app shows.
export type PackageId = 'classic' | 'premium' | 'custom';
const names = {
  classic: { bn: 'ক্লাসিক', en: 'Classic' },
  premium: { bn: 'প্রিমিয়াম', en: 'Premium' },
  custom: { bn: 'নিজের মতো', en: 'Custom' },
} as const;

export function packageOf(templateId: string): PackageId {
  if (templateId === 'custom') return 'custom';
  return findTemplate(templateId).tier === 'premium' ? 'premium' : 'classic';
}
export function packageName(templateId: string, locale: 'bn' | 'en') {
  return names[packageOf(templateId)][locale];
}
/** Published price in taka for a design, or for "custom". */
export function packagePrice(templateId: string) {
  const id = packageOf(templateId);
  return id === 'custom' ? prices.custom : id === 'premium' ? prices.premium : prices.normal;
}
/** What a request lists as its choice: the design, or "Custom" when there is none. */
export function choiceLabel(templateId: string, locale: 'bn' | 'en') {
  if (templateId === 'custom') return packageName('custom', locale);
  const design = findTemplate(templateId);
  return locale === 'bn' ? design.name : design.en;
}
/** Package name stored on a quote, in Bangla: "ক্লাসিক · জামদানি". */
export function quotePackageName(templateId: string) {
  return templateId === 'custom'
    ? packageName('custom', 'bn')
    : `${packageName(templateId, 'bn')} · ${findTemplate(templateId).name}`;
}
