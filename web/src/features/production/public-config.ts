// Owner-set public copy. Read on the server and passed down as props, so an empty value hides the line.
export type PaymentReviewPromise = { bn: string; en: string };

/** `PAYMENT_REVIEW_PROMISE_BN/EN`: for example "সাধারণত একই দিনে যাচাই করি". Empty means nothing is promised. */
export function paymentReviewPromise(): PaymentReviewPromise {
  return {
    bn: process.env.PAYMENT_REVIEW_PROMISE_BN?.trim() ?? '',
    en: process.env.PAYMENT_REVIEW_PROMISE_EN?.trim() ?? '',
  };
}
