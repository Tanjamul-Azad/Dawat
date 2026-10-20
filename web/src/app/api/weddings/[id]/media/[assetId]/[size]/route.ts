import { uuid } from '@/features/production/contracts';
import { endpoint } from '@/server/http';
import { serveMedia } from '@/server/media';
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string; assetId: string; size: string }> },
) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    return serveMedia({ wid: uuid.parse(p.id), assetId: uuid.parse(p.assetId), size: p.size });
  });
}
