import { uuid } from '@/features/production/contracts';
import { guestPayload } from '@/features/production/guests';
import { session } from '@/server/auth';
import { dbError, endpoint } from '@/server/http';
export async function GET(request: Request, ctx: { params: Promise<{ id: string; hid: string }> }) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const { db } = await session();
    const r = await db.rpc('household_preview', {
      p_wedding_id: uuid.parse(p.id),
      p_household_id: uuid.parse(p.hid),
    });
    dbError(r.error);
    return guestPayload.parse(r.data);
  });
}
