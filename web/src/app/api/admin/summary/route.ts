import { staffSession } from '@/server/auth';
import { dbError, endpoint } from '@/server/http';
export async function GET(request: Request) {
  return endpoint(request, async () => {
    const { db } = await staffSession();
    const r = await db.rpc('admin_summary');
    dbError(r.error);
    return r.data;
  });
}
