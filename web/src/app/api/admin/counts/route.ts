import { endpoint } from '@/server/http';
import { adminCounts } from '@/server/sales';
export async function GET(request: Request) {
  return endpoint(request, () => adminCounts());
}
