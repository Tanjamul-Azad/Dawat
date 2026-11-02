import { describe, expect, it } from 'vitest';
import { noticeEmail } from './notifications';

const requestId = '20000000-0000-4000-8000-00000000abcd';
const origin = 'https://dawatcard.netlify.app';

describe('order notification emails', () => {
  it('sends the customer straight to their own wedding page when access opens', () => {
    const mail = noticeEmail(
      { kind: 'customer-active', requestId, name: 'Nabila', email: 'nabila@example.test', weddingId: 'w-1' },
      origin,
    );
    expect(mail.subject).toBe('আপনার আয়োজনের পাতা চালু হয়েছে');
    expect(mail.text).toContain(`${origin}/weddings/w-1/`);
    expect(mail.text).toContain('nabila@example.test');
    expect(mail.text).toContain('DW-0000ABCD');
    expect(mail.html).toContain(`href="${origin}/weddings/w-1/"`);
  });

  it('tells a rejected customer not to pay twice and gives the reason', () => {
    const mail = noticeEmail(
      { kind: 'customer-rejected', requestId, name: 'Nabila', reason: 'TrxID did not match <b>' },
      origin,
    );
    expect(mail.text).toContain('আবার পাঠাবেন না');
    expect(mail.text).toContain(`${origin}/order/requests/`);
    // Customer- and admin-written text is escaped in HTML.
    expect(mail.html).toContain('&lt;b&gt;');
    expect(mail.html).not.toContain('<b>');
  });

  it('points the admin to the review queue with the amount and transaction ID', () => {
    const mail = noticeEmail(
      { kind: 'admin-payment', requestId, name: 'Nabila', reference: 'TRX123', amountMinor: 75000 },
      origin,
    );
    expect(mail.subject).toContain('DW-0000ABCD');
    expect(mail.text).toContain('TRX123');
    expect(mail.text).toContain('৳৭৫০');
    expect(mail.text).toContain(`${origin}/admin/requests/`);
  });
});
