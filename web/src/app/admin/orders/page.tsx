import { SellerOrders } from '@/components/production/seller-orders';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { listOrders } from '@/server/weddings';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const s = await pageSession('/admin/orders/', true);
  if (!s) return <SetupRequired />;
  return <SellerOrders initial={await listOrders()} email={s.user.email ?? ''} />;
}
