import { sellerCommand, uuid } from '@/features/production/contracts';
import { z } from 'zod';
import { body, dbError, endpoint } from '@/server/http';
import { staffSession } from '@/server/auth';
import { listOrders } from '@/server/weddings';
export async function GET(request: Request) {
  return endpoint(request, () => {
    const params = new URL(request.url).searchParams;
    const cursor = params.get('cursor');
    return listOrders(
      cursor ? uuid.parse(cursor) : undefined,
      z
        .string()
        .trim()
        .max(120)
        .parse(params.get('search') ?? ''),
      z.enum(['name', 'email']).parse(params.get('field') ?? 'name'),
    );
  });
}
export async function POST(request: Request) {
  return endpoint(request, async () => {
    const { db } = await staffSession();
    const input = await body(request, sellerCommand);
    const key = uuid.parse(request.headers.get('Idempotency-Key'));
    const r = await db.rpc('seller_command', { p_key: key, p_body: input });
    dbError(r.error);
    return r.data;
  });
}
