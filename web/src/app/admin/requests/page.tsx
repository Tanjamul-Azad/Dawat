import { SalesDesk } from '@/components/production/sales-desk';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { listSales } from '@/server/sales';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const session = await pageSession('/admin/requests/', true);
  if (!session) return <SetupRequired />;
  return <SalesDesk initial={await listSales(true)} email={session.user.email ?? ''} seller />;
}
