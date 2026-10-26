import { endpoint } from '@/server/http';
import { listSales } from '@/server/sales';
export async function GET(request: Request) {
  return endpoint(request, () =>
    listSales(true, new URL(request.url).searchParams.get('cursor') ?? undefined),
  );
}
