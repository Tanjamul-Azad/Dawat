import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { session } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
export async function POST(request: Request, ctx: { params: Promise<{ id: string; hid: string }> }) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const input = await body(request, z.object({ hidden: z.boolean() }).strict());
    const { db } = await session();
    const r = await db.rpc('hide_household', { p_key: uuid.parse(request.headers.get('Idempotency-Key')), p_wedding_id: uuid.parse(p.id), p_household_id: uuid.parse(p.hid), p_hidden: input.hidden });
    dbError(r.error);
    return r.data;
  });
}
