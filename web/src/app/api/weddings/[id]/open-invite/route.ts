import { uuid } from '@/features/production/contracts';
import { openInviteInput } from '@/features/production/open-invite';
import { body, endpoint } from '@/server/http';
import { getOpenInvite, setOpenInvite } from '@/server/open-invite';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => getOpenInvite(uuid.parse((await ctx.params).id)));
}
export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => setOpenInvite(uuid.parse((await ctx.params).id), await body(request, openInviteInput), uuid.parse(request.headers.get('Idempotency-Key'))));
}
