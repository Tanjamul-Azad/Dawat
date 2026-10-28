import { uuid } from '@/features/production/contracts';
import { joinOpenInput } from '@/features/production/open-invite';
import { body, endpoint, privateHeaders } from '@/server/http';
import { joinOpenInvitation } from '@/server/open-invite';
import { z } from 'zod';
export async function POST(request: Request, ctx: { params: Promise<{ slug: string; token: string }> }) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const path = await joinOpenInvitation(uuid.parse(p.slug), z.string().regex(/^[A-Za-z0-9_-]{43}$/).parse(p.token), await body(request, joinOpenInput), request.headers);
    return new Response(null, { status: 303, headers: { ...privateHeaders, Location: path } });
  });
}
