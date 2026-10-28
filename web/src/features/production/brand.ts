// Shared product contact; customer authentication always uses their own email.
export const DAWAT_CONTACT_EMAIL = 'valtube101@gmail.com';
export const DAWAT_CONTACT_HREF = `mailto:${DAWAT_CONTACT_EMAIL}`;
// Real social proof only. Everything here ships empty; the components render nothing until it is filled.
// Never add invented reviews, counts or photos. A review needs the customer's permission first.
export type Review = {
  quote: { bn: string; en: string };
  name: string;
  place?: string;
  /** Written permission from the customer to show this review. */
  permission: true;
};
export type Founder = {
  name: string;
  photo?: { src: string; width: number; height: number };
  note: { bn: string; en: string };
};

export const reviews: readonly Review[] = [];
export const founder: Founder | null = null;
/** Owner decision E: shown only once a real Facebook page exists. */
export const socialLinks = { facebook: '' };
