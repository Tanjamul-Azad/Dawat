import { uuid } from '@/features/production/contracts';
import { inviteSettingsInput } from '@/features/production/delivery';
import { session } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
import { getInviteSettings } from '@/server/invite-settings';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => getInviteSettings(uuid.parse((await ctx.params).id)));
}
export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const wid = uuid.parse((await ctx.params).id);
    const input = await body(request, inviteSettingsInput);
    const { db } = await session();
    const r = await db.rpc('set_invite_settings', { p_key: uuid.parse(request.headers.get('Idempotency-Key')), p_wedding_id: wid, p_body: input });
    dbError(r.error);
    return r.data;
  });
}
