import { uuid } from '@/features/production/contracts';
import { deliveryInput } from '@/features/production/delivery';
import { session } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
export async function POST(request: Request, ctx: { params: Promise<{ id: string; hid: string }> }) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const input = await body(request, deliveryInput);
    const { db } = await session();
    const r = await db.rpc('record_delivery', { p_key: uuid.parse(request.headers.get('Idempotency-Key')), p_wedding_id: uuid.parse(p.id), p_household_id: uuid.parse(p.hid), p_channel: input.channel, p_link_revision: input.linkRevision });
    dbError(r.error);
    return r.data;
  });
}
