import { uuid } from '@/features/production/contracts';
import { guestCommand } from '@/features/production/guests';
import { body, dbError, endpoint } from '@/server/http';
import { getGuest, guestSession } from '@/server/guests';
type Context = { params: Promise<{ slug: string; hid: string }> };
export async function GET(request: Request, ctx: Context) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    return getGuest(uuid.parse(p.slug), uuid.parse(p.hid));
  });
}
export async function POST(request: Request, ctx: Context) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const s = await guestSession(uuid.parse(p.slug), uuid.parse(p.hid));
    const input = await body(request, guestCommand);
    const r = await s.db.rpc('guest_command', {
      p_slug: s.slug,
      p_household_id: s.hid,
      p_session_digest: s.digest,
      p_key: uuid.parse(request.headers.get('Idempotency-Key')),
      p_body: input,
    });
    dbError(r.error);
    return r.data;
  });
}
