import { SellerOrders } from '@/components/production/seller-orders';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { listOrders } from '@/server/weddings';
import { uuid } from '@/features/production/contracts';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const order = uuid.safeParse((await searchParams).order);
  const s = await pageSession(`/admin/orders/${order.success ? `?order=${order.data}` : ''}`, true);
  if (!s) return <SetupRequired />;
  // A link from payment review opens that order directly instead of the first page.
  const focus = order.success ? (await listOrders(undefined, '', 'name', order.data)).orders[0] : undefined;
  return <SellerOrders initial={await listOrders()} email={s.user.email ?? ''} focus={focus} />;
}
