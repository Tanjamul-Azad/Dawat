export const templateIds = ['jamdani', 'ivory', 'holud', 'garden', 'midnight', 'rose'] as const;
export type TemplateId = (typeof templateIds)[number];
export const templates = [
  {
    id: 'jamdani',
    name: 'জামদানি',
    en: 'Jamdani',
    tier: 'normal',
    mood: 'ঐতিহ্যের মায়া',
    moodEn: 'Woven in tradition',
    color: '#587d98',
    paper: '#faf7ef',
    art: '/brand/template-jamdani-reference.webp',
  },
  {
    id: 'ivory',
    name: 'শুভ্র',
    en: 'Ivory',
    tier: 'normal',
    mood: 'সাদামাটা, চিরসুন্দর',
    moodEn: 'Quietly timeless',
    color: '#48443b',
    paper: '#faf8ef',
    art: '/brand/template-ivory-match.webp',
  },
  {
    id: 'holud',
    name: 'হলুদ সন্ধ্যা',
    en: 'Golden Hour',
    tier: 'normal',
    mood: 'উৎসবের উষ্ণতায়',
    moodEn: 'A warm celebration',
    color: '#e7c48e',
    paper: '#360d11',
    art: '/brand/template-holud-reference.webp',
  },
  {
    id: 'garden',
    name: 'মায়াবন',
    en: 'Garden Vows',
    tier: 'premium',
    mood: 'সবুজে লেখা ভালোবাসা',
    moodEn: 'Love in full bloom',
    color: '#345344',
    paper: '#f5f3e9',
    art: '/brand/template-garden.webp',
  },
  {
    id: 'midnight',
    name: 'চাঁদের আলো',
    en: 'Moonlit',
    tier: 'premium',
    mood: 'রাজকীয় এক সন্ধ্যা',
    moodEn: 'An evening to remember',
    color: '#f3eee1',
    paper: '#071e30',
    art: '/brand/template-midnight-reference.webp',
  },
  {
    id: 'rose',
    name: 'গোলাপের চিঠি',
    en: 'Rose Letter',
    tier: 'premium',
    mood: 'কোমলতায় আপনার গল্প',
    moodEn: 'A softer kind of romance',
    color: '#7d1d36',
    paper: '#faf6ef',
    art: '/brand/template-rose-reference.webp',
  },
] as const;
export function findTemplate(value: unknown) {
  return templates.find((t) => t.id === value) ?? templates[0];
}
export const prices = { normal: 500, premium: 750, custom: 1500 } as const;
/** Package names (owner decision B). Ids and prices above stay the same; only the labels people see change. */
export const packageNames = {
  normal: { bn: 'ক্লাসিক', en: 'Classic' },
  premium: { bn: 'প্রিমিয়াম', en: 'Premium' },
  custom: { bn: 'নিজের মতো', en: 'Custom' },
} as const;
export type PackageTier = keyof typeof packageNames;
export function packageName(tier: PackageTier, locale: 'bn' | 'en') {
  return packageNames[tier][locale];
}
export const whatsappNumber = '8801606092143';
export function whatsappLink(message = 'দাওয়াত সম্পর্কে জানতে চাই।') {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
