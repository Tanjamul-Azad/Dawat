import 'server-only';
import { session, staffSession } from './auth';
import { dbError } from './http';
import type { SalesPage, SalesRequest, SalesProgress, PaymentSubmission } from '@/features/production/sales';
import { z } from 'zod';

export async function listSales(staff = false, cursor?: string): Promise<SalesPage> {
  const { db } = await (staff ? staffSession() : session());
  let query = db
    .from('sales_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(26);
  if (cursor) {
    const [at, id] = z.tuple([z.iso.datetime({ offset: true }), z.uuid()]).parse(cursor.split('|'));
    query = query.or(`created_at.lt.${at},and(created_at.eq.${at},id.lt.${id})`);
  }
  const result = await query;
  dbError(result.error);
  const rows = (result.data ?? []) as SalesRequest[];
  const progress = staff ? { data: [], error: null } : await db.rpc('my_sales_progress');
  dbError(progress.error);
  const visible = rows.slice(0, 25);
  let progressRows = progress.data as unknown as SalesProgress[];
  if (staff) {
    const orderIds = visible.flatMap((r) => (r.order_id ? [r.order_id] : []));
    const orders = orderIds.length
      ? await db
          .from('orders')
          .select('id,status,payment_status,weddings(id,dashboard_grants(state))')
          .in('id', orderIds)
      : { data: [], error: null };
    dbError(orders.error);
    progressRows = visible.flatMap((r) => {
      const o = orders.data?.find((o) => o.id === r.order_id);
      if (!o) return [];
      const w = o.weddings;
      return [
        {
          requestId: r.id,
          status: o.status,
          paymentStatus: o.payment_status,
          access: w?.dashboard_grants?.state ?? null,
          weddingId: w?.id ?? null,
        },
      ];
    });
  }
  const payments = visible.length
    ? await db
        .from('payment_submissions')
        .select('*')
        .in(
          'request_id',
          visible.map((r) => r.id),
        )
        .order('created_at', { ascending: false })
        .limit(250)
    : { data: [], error: null };
  dbError(payments.error);
  return {
    requests: visible,
    progress: progressRows,
    payments: payments.data as PaymentSubmission[],
    nextCursor: rows.length > 25 ? `${rows[24].created_at}|${rows[24].id}` : null,
  };
}
