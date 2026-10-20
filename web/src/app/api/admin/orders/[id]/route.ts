import { uuid } from '@/features/production/contracts';
import { staffSession } from '@/server/auth';
import { dbError, endpoint, HttpError } from '@/server/http';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const { db } = await staffSession();
    const id = uuid.parse((await ctx.params).id);
    const order = await db.from('orders').select('id').eq('id', id).maybeSingle();
    dbError(order.error);
    if (!order.data) throw new HttpError(404, 'NOT_FOUND', 'Order unavailable.');
    const r = await db
      .from('audit_events')
      .select('action,reason,created_at,actor_id')
      .eq('order_id', id)
      .order('created_at', { ascending: false })
      .limit(100);
    dbError(r.error);
    return r.data;
  });
}
