import { salesCommand } from '@/features/production/sales';
import { uuid } from '@/features/production/contracts';
import { session, staffSession } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
import { listSales } from '@/server/sales';
export async function GET(request: Request) {
  return endpoint(request, () =>
    listSales(false, new URL(request.url).searchParams.get('cursor') ?? undefined),
  );
}
export async function POST(request: Request) {
  return endpoint(request, async () => {
    const input = await body(request, salesCommand);
    const { db } = await (['quote', 'convert'].includes(input.kind) ? staffSession() : session());
    const result = await db.rpc('sales_command', {
      p_key: uuid.parse(request.headers.get('Idempotency-Key')),
      p_body: input,
    });
    dbError(result.error);
    return result.data;
  });
}
