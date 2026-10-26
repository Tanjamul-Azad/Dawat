// Owner-confirmed receiving account, 26 October 2026. Public payment details only.
export const manualPayment = {
  method: 'bKash',
  accountType: 'Personal',
  number: '01606092143',
  action: 'Send Money',
} as const;
export function orderPaymentReference(requestId: string) {
  return `DW-${requestId.slice(-8).toUpperCase()}`;
}
