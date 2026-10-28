// Shared product contact; customer authentication always uses their own email.
export const DAWAT_CONTACT_EMAIL = 'valtube101@gmail.com';
export const DAWAT_CONTACT_HREF = `mailto:${DAWAT_CONTACT_EMAIL}`;
export const paymentReviewPromise = {
  bn: process.env.NEXT_PUBLIC_PAYMENT_REVIEW_PROMISE_BN ?? '',
  en: process.env.NEXT_PUBLIC_PAYMENT_REVIEW_PROMISE_EN ?? '',
};
export const customerReviews: { name: string; quoteBn: string; quoteEn: string }[] = [];
export const founder: { name: string; photo: string; messageBn: string; messageEn: string } | null = null;
export const facebookUrl = '';
