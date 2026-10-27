import { salesCommand } from '@/features/production/sales';
import { uuid } from '@/features/production/contracts';
import { session, staffSession } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
import { listSales } from '@/server/sales';
import { standardTermDays } from '@/server/config';
import { quotePackageName } from '@/features/production/packages';
export async function GET(request: Request) {
  return endpoint(request, () =>
    listSales(false, new URL(request.url).searchParams.get('cursor') ?? undefined),
  );
}
export async function POST(request: Request) {
  return endpoint(request, async () => {
    const input = await body(request, salesCommand);
    const { db } = await (['quote', 'convert'].includes(input.kind) ? staffSession() : session());
    // Fixed-price packages are quoted on the spot. The price is fixed inside the
    // database; only the term and the display name travel with the request.
    const rpcBody =
      input.kind === 'request' && input.templateId !== 'custom'
        ? {
            ...input,
            termDays: standardTermDays(),
            packageName: quotePackageName(input.templateId),
          }
        : input;
    const result = await db.rpc('sales_command', {
      p_key: uuid.parse(request.headers.get('Idempotency-Key')),
      p_body: rpcBody,
    });
    dbError(result.error);
    return result.data;
  });
}
