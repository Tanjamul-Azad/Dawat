import { uuid } from '@/features/production/contracts';
import { endpoint, dbError } from '@/server/http';
import { session } from '@/server/auth';
import { uploadMedia } from '@/server/media';
type Ctx = { params: Promise<{ id: string; assetId: string }> };
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function PUT(request: Request, ctx: Ctx) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    return uploadMedia(request, uuid.parse(p.id), uuid.parse(p.assetId));
  });
}
export async function DELETE(request: Request, ctx: Ctx) {
  return endpoint(request, async () => {
    const { db } = await session();
    const p = await ctx.params;
    const r = await db.rpc('remove_media', {
      p_wedding_id: uuid.parse(p.id),
      p_asset_id: uuid.parse(p.assetId),
    });
    dbError(r.error);
    return { removed: true };
  });
}
