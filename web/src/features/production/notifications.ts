import { orderPaymentReference } from './payment';
import { takaFromPaisa } from './money';

// Plain-Bangla order emails. Each has one clear action and a plain link that works without HTML.
export type Notice =
  | { kind: 'admin-request'; requestId: string; name: string; email: string; choice: string }
  | { kind: 'admin-payment'; requestId: string; name: string; reference: string; amountMinor: number }
  | { kind: 'customer-quote'; requestId: string; name: string; amountMinor: number; termDays: number }
  | { kind: 'customer-active'; requestId: string; name: string; email: string; weddingId: string }
  | { kind: 'customer-verified'; requestId: string; name: string }
  | { kind: 'customer-rejected'; requestId: string; name: string; reason: string };

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function content(n: Notice, origin: string) {
  const ref = orderPaymentReference(n.requestId);
  const orders = `${origin}/order/requests/`;
  const admin = `${origin}/admin/requests/`;
  switch (n.kind) {
    case 'admin-request':
      return {
        subject: `নতুন অর্ডারের অনুরোধ · ${ref}`,
        lines: [`${n.name} (${n.email}) একটি অনুরোধ পাঠিয়েছেন।`, `পছন্দ: ${n.choice}`],
        action: 'অনুরোধ দেখুন',
        link: admin,
      };
    case 'admin-payment':
      return {
        subject: `নতুন পেমেন্ট যাচাই বাকি · ${ref}`,
        lines: [
          `${n.name} পেমেন্টের তথ্য জমা দিয়েছেন।`,
          `Transaction ID: ${n.reference} · ${takaFromPaisa(n.amountMinor, 'bn')}`,
          'bKash-এ আসল লেনদেন মিলিয়ে তারপর যাচাই করুন।',
        ],
        action: 'পেমেন্ট যাচাই করুন',
        link: admin,
      };
    case 'customer-quote':
      return {
        subject: `আপনার অর্ডারের দাম ও শর্ত তৈরি · ${ref}`,
        lines: [
          `${n.name}, আপনার অর্ডারের দাম ও শর্ত পাঠানো হয়েছে।`,
          `মূল্য: ${takaFromPaisa(n.amountMinor, 'bn')} · মেয়াদ: প্রথম প্রকাশ থেকে ${n.termDays.toLocaleString('bn-BD')} দিন`,
          'দেখে সম্মতি দিলেই পেমেন্টের ধাপ খুলবে।',
        ],
        action: 'দাম ও শর্ত দেখুন',
        link: orders,
      };
    case 'customer-active':
      return {
        subject: 'আপনার আয়োজনের পাতা চালু হয়েছে',
        lines: [
          `${n.name}, আপনার পেমেন্ট মিলেছে। আপনার আয়োজনের পাতা এখন চালু।`,
          `খুলতে এই ইমেইল দিয়ে লগইন করুন: ${n.email}`,
          'এরপর নাম, অনুষ্ঠান আর ছবি সাজিয়ে অতিথিদের আমন্ত্রণ পাঠান।',
        ],
        action: 'আমার আয়োজন খুলুন',
        link: `${origin}/weddings/${n.weddingId}/`,
      };
    case 'customer-verified':
      return {
        subject: `আপনার পেমেন্ট মিলেছে · ${ref}`,
        lines: [`${n.name}, আপনার পেমেন্ট মিলেছে।`, 'আয়োজনের পাতা চালু হলেই আরেকটি ইমেইল পাবেন।'],
        action: 'অর্ডার দেখুন',
        link: orders,
      };
    case 'customer-rejected':
      return {
        subject: `পেমেন্টের তথ্য মেলেনি · ${ref}`,
        lines: [
          `${n.name}, আপনার দেওয়া পেমেন্টের তথ্য আমরা মেলাতে পারিনি।`,
          `কারণ: ${n.reason}`,
          'আগে টাকা পাঠিয়ে থাকলে আবার পাঠাবেন না। সঠিক Transaction ID আর প্রেরকের নম্বর দিন।',
        ],
        action: 'সঠিক তথ্য দিন',
        link: orders,
      };
  }
}

export function noticeEmail(n: Notice, origin: string) {
  const c = content(n, origin);
  const ref = orderPaymentReference(n.requestId);
  const text = [...c.lines, '', `${c.action}: ${c.link}`, '', `অর্ডার নম্বর: ${ref}`, '— দাওয়াত'].join('\n');
  const html = `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f4ebde;font-family:'Hind Siliguri','Noto Sans Bengali',Arial,sans-serif;color:#2d231c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;max-width:520px;background:#fffaf2;border:1px solid #e6d6bf;border-radius:16px">
<tr><td style="padding:24px 28px 8px;font-size:22px;font-weight:700;color:#7a1c20">দাওয়াত</td></tr>
<tr><td style="padding:0 28px;font-size:16px;line-height:1.7;overflow-wrap:anywhere;word-break:break-word">${c.lines.map((l) => `<p style="margin:10px 0">${escape(l)}</p>`).join('')}</td></tr>
<tr><td style="padding:16px 28px 8px"><a href="${escape(c.link)}" style="display:inline-block;background:#7a1c20;color:#fffaf2;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${escape(c.action)}</a></td></tr>
<tr><td style="padding:8px 28px 24px;font-size:13px;color:#7a6a58;line-height:1.6;word-break:break-all">বোতাম কাজ না করলে এই লিংক খুলুন: <a href="${escape(c.link)}" style="color:#7a1c20">${escape(c.link)}</a><br>অর্ডার নম্বর: ${ref}</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: c.subject, text, html };
}
