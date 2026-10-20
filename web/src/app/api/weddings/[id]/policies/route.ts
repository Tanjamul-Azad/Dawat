import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { session } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const { db } = await session();
    const wid = uuid.parse((await ctx.params).id);
    const input = await body(
      request,
      z
        .object({
          eventId: z.enum(['nikah', 'reception']),
          expectedRevision: z.number().int().nonnegative(),
          isOpen: z.boolean(),
          deadline: z.iso.datetime().nullable(),
        })
        .strict(),
    );
    const r = await db.rpc('set_rsvp_policy', {
      p_wedding_id: wid,
      p_event_id: input.eventId,
      p_revision: input.expectedRevision,
      p_open: input.isOpen,
      p_deadline: input.deadline ?? undefined,
    });
    dbError(r.error);
    return r.data;
  });
}
