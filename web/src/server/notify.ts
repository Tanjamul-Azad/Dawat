import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { noticeEmail, type Notice } from '@/features/production/notifications';
import { quotePackageName } from '@/features/production/packages';
import type { PaymentCommand, SalesCommand, SalesRequest } from '@/features/production/sales';
import { config } from './config';
import { adminRecipients, mailEnabled, sendMail } from './mail';

// Emails that follow a successful order action. They read only what the acting user may already
// read, run after the action has committed, and never turn a completed action into an error.
async function deliver(to: string[], notice: Notice) {
  const { subject, text, html } = noticeEmail(notice, config().origin);
  await Promise.all(to.map((address) => sendMail({ to: address, subject, text, html })));
}
async function quietly(work: () => Promise<void>) {
  if (!mailEnabled()) return;
  try {
    await work();
  } catch {
    console.error('Notification email skipped: details unavailable.');
  }
}

type Db = SupabaseClient;
const requestRow = async (db: Db, id: string) =>
  (await db.from('sales_requests').select('*').eq('id', id).maybeSingle()).data as SalesRequest | null;

export function afterSalesCommand(input: SalesCommand, result: unknown) {
  return quietly(async () => {
    const r = result as SalesRequest;
    if (!r?.id) return;
    if (input.kind === 'request')
      await deliver(adminRecipients(), {
        kind: 'admin-request',
        requestId: r.id,
        name: r.customer_name,
        email: r.customer_email,
        choice: quotePackageName(r.template_id),
      });
    if (input.kind === 'quote' && r.state === 'quoted' && r.amount_minor !== null && r.term_days !== null)
      await deliver([r.customer_email], {
        kind: 'customer-quote',
        requestId: r.id,
        name: r.customer_name,
        amountMinor: r.amount_minor,
        termDays: r.term_days,
      });
  });
}

export function afterPaymentCommand(db: Db, input: PaymentCommand, result: unknown) {
  return quietly(async () => {
    const p = result as { request_id?: string; reference?: string; amount_minor?: number; review_note?: string };
    if (!p?.request_id) return;
    const r = await requestRow(db, p.request_id);
    if (!r) return;
    if (input.kind === 'submit')
      return deliver(adminRecipients(), {
        kind: 'admin-payment',
        requestId: r.id,
        name: r.customer_name,
        reference: p.reference ?? '',
        amountMinor: p.amount_minor ?? 0,
      });
    if (input.kind === 'reject')
      return deliver([r.customer_email], {
        kind: 'customer-rejected',
        requestId: r.id,
        name: r.customer_name,
        reason: p.review_note ?? input.reason,
      });
    const wedding = r.order_id
      ? (await db.from('weddings').select('id,grant:dashboard_grants!dashboard_grants_wedding_id_fkey(state)').eq('order_id', r.order_id).maybeSingle())
          .data
      : null;
    const grant = wedding?.grant as { state?: string } | { state?: string }[] | null | undefined;
    const active = (Array.isArray(grant) ? grant[0]?.state : grant?.state) === 'active';
    await deliver(
      [r.customer_email],
      active && wedding
        ? { kind: 'customer-active', requestId: r.id, name: r.customer_name, email: r.customer_email, weddingId: wedding.id }
        : { kind: 'customer-verified', requestId: r.id, name: r.customer_name },
    );
  });
}

/** Activation from the order screen (not through payment review) also tells the customer. */
export function afterSellerCommand(db: Db, input: { kind: string; orderId?: string }, result: unknown) {
  return quietly(async () => {
    const out = result as { weddingId?: string; orderId?: string };
    if (input.kind !== 'activate' || !out?.weddingId || !out.orderId) return;
    const r = (await db.from('sales_requests').select('*').eq('order_id', out.orderId).maybeSingle())
      .data as SalesRequest | null;
    const order = r
      ? null
      : (await db.from('orders').select('customer_email,customer_name').eq('id', out.orderId).maybeSingle()).data;
    const email = r?.customer_email ?? order?.customer_email;
    const name = r?.customer_name ?? order?.customer_name;
    if (!email || !name) return;
    await deliver([email], {
      kind: 'customer-active',
      requestId: r?.id ?? out.orderId,
      name,
      email,
      weddingId: out.weddingId,
    });
  });
}
