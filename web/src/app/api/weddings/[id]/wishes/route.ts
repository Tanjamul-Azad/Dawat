import { uuid } from '@/features/production/contracts';
import { endpoint } from '@/server/http';
import { wishes } from '@/server/guests';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    const wid = uuid.parse((await ctx.params).id);
    const after = new URL(request.url).searchParams.get('after');
    return wishes(wid, after ? uuid.parse(after) : undefined);
  });
}
