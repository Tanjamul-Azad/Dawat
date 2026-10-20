import { z } from 'zod';
import { uuid, draftContent } from '@/features/production/contracts';
import { body, dbError, endpoint } from '@/server/http';
import { session } from '@/server/auth';
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const { db } = await session();
    const id = uuid.parse((await ctx.params).id);
    const input = await body(
      request,
      z.object({ expectedRevision: z.number().int().nonnegative(), content: draftContent }).strict(),
    );
    const r = await db.rpc('save_draft', {
      p_wedding_id: id,
      p_revision: input.expectedRevision,
      p_content: input.content,
    });
    dbError(r.error);
    return r.data;
  });
}
