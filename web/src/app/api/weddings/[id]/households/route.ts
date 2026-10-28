import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { householdInput } from '@/features/production/guests';
import { session } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
import { report } from '@/server/guests';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const wid = uuid.parse((await ctx.params).id);
    const p = new URL(request.url).searchParams;
    return report(
      wid,
      z.enum(['nikah', 'reception']).parse(p.get('event') ?? 'reception'),
      p.get('after') ? uuid.parse(p.get('after')) : null,
      z
        .string()
        .max(120)
        .parse(p.get('search') ?? ''),
      z.enum(['all', 'accepted', 'declined', 'pending', 'hidden']).parse(p.get('status') ?? 'all'),
      undefined,
      z.enum(['all', 'unsent', 'sent_unreplied']).parse(p.get('delivery') ?? 'all'),
      z.enum(['all', 'host', 'open']).parse(p.get('source') ?? 'all'),
    );
  });
}
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const wid = uuid.parse((await ctx.params).id);
    const { db } = await session();
    const input = await body(
      request,
      z
        .object({ id: uuid, expectedRevision: z.number().int().nonnegative(), household: householdInput })
        .strict(),
    );
    const key = uuid.parse(request.headers.get('Idempotency-Key'));
    const r = await db.rpc('save_household', {
      p_wedding_id: wid,
      p_household_id: input.id,
      p_revision: input.expectedRevision,
      p_key: key,
      p_body: input.household,
    });
    dbError(r.error);
    return r.data;
  });
}
