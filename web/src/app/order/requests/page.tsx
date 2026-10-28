import { SalesDesk } from '@/components/production/sales-desk';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { listSales } from '@/server/sales';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string; names?: string }> }) {
  const { template, names } = await searchParams;
  const query = new URLSearchParams();
  if (template) query.set('template', template);
  if (names) query.set('names', names.slice(0, 240));
  const session = await pageSession(`/order/requests/${query.size ? '?' + query : ''}`);
  if (!session) return <SetupRequired />;
  return <SalesDesk initial={await listSales()} email={session.user.email ?? ''} templateId={template} names={names} />;
}
