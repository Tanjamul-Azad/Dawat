import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { body, dbError, endpoint } from '@/server/http';
import { session } from '@/server/auth';
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const { db } = await session();
    const id = uuid.parse((await ctx.params).id);
    const input = await body(
      request,
      z.object({ expectedRevision: z.number().int().nonnegative() }).strict(),
    );
    const key = uuid.parse(request.headers.get('Idempotency-Key'));
    const r = await db.rpc('publish_invitation', {
      p_wedding_id: id,
      p_revision: input.expectedRevision,
      p_key: key,
    });
    dbError(r.error);
    return r.data;
  });
}
