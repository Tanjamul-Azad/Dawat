import { uuid } from '@/features/production/contracts';
import { endpoint } from '@/server/http';
import { serveMedia } from '@/server/media';
export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string; assetId: string; size: string }> },
) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    return serveMedia({ slug: uuid.parse(p.slug), assetId: uuid.parse(p.assetId), size: p.size });
  });
}
