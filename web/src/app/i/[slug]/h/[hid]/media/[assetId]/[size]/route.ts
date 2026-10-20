import { uuid } from '@/features/production/contracts';
import { endpoint } from '@/server/http';
import { serveMedia } from '@/server/media';
import { guestSession } from '@/server/guests';
export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string; hid: string; assetId: string; size: string }> },
) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const scoped = await guestSession(uuid.parse(p.slug), uuid.parse(p.hid));
    return serveMedia({
      slug: scoped.slug,
      hid: scoped.hid,
      sessionDigest: scoped.digest,
      assetId: uuid.parse(p.assetId),
      size: p.size,
    });
  });
}
