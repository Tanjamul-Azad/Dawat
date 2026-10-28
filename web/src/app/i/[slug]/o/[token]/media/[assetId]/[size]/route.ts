import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { endpoint } from '@/server/http';
import { serveMedia } from '@/server/media';
import { digest } from '@/server/guest-crypto';
export async function GET(request: Request, ctx: { params: Promise<{ slug: string; token: string; assetId: string; size: string }> }) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    return serveMedia({ slug: uuid.parse(p.slug), assetId: uuid.parse(p.assetId), size: p.size, openDigest: digest(z.string().regex(/^[A-Za-z0-9_-]{43}$/).parse(p.token)) });
  });
}
