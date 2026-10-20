import { uuid } from '@/features/production/contracts';
import { endpoint } from '@/server/http';
import { getWedding } from '@/server/weddings';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => getWedding(uuid.parse((await ctx.params).id)));
}
