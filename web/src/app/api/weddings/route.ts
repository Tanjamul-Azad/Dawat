import { endpoint } from '@/server/http';
import { listWeddings } from '@/server/weddings';
export async function GET(request: Request) {
  return endpoint(request, listWeddings);
}
