import { uuid } from '@/features/production/contracts';
import { endpoint, dbError, HttpError } from '@/server/http';
import { session } from '@/server/auth';
import { listMedia } from '@/server/media';
import { mediaProcessor } from '@/server/media-admin';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => listMedia(uuid.parse((await ctx.params).id)));
}
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const { db } = await session();
    const wid = uuid.parse((await ctx.params).id);
    const key = uuid.parse(request.headers.get('idempotency-key'));
    const gate = await db.from('invitation_drafts').select('wedding_id').eq('wedding_id', wid).maybeSingle();
    dbError(gate.error);
    if (!gate.data) throw new HttpError(404, 'UNAVAILABLE', 'Workspace unavailable.');
    mediaProcessor();
    const r = await db.rpc('reserve_media', { p_wedding_id: wid, p_key: key });
    dbError(r.error);
    return r.data;
  });
}
