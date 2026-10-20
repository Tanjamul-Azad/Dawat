import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { session } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const input = await body(
      request,
      z.object({ live: z.boolean(), expectedPublicationRevision: z.number().int().nonnegative() }).strict(),
    );
    const { db } = await session();
    const result = await db.rpc('set_invitation_visibility', {
      p_wedding_id: uuid.parse((await ctx.params).id),
      p_revision: input.expectedPublicationRevision,
      p_live: input.live,
      p_key: uuid.parse(request.headers.get('Idempotency-Key')),
    });
    dbError(result.error);
    return result.data;
  });
}
