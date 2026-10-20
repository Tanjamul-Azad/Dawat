import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { body, endpoint } from '@/server/http';
import { personalLink } from '@/server/guests';
export async function POST(request: Request, ctx: { params: Promise<{ id: string; hid: string }> }) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const wid = uuid.parse(p.id),
      hid = uuid.parse(p.hid);
    const input = await body(
      request,
      z
        .object({
          kind: z.enum(['copy', 'rotate', 'revoke']),
          expectedRevision: z.number().int().nonnegative(),
        })
        .strict(),
    );
    return personalLink(
      wid,
      hid,
      input.kind,
      input.expectedRevision,
      uuid.parse(request.headers.get('Idempotency-Key')),
    );
  });
}
