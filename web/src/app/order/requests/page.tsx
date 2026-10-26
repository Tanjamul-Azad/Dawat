import { SalesDesk } from '@/components/production/sales-desk';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { listSales } from '@/server/sales';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const template = (await searchParams).template;
  const session = await pageSession(`/order/requests/${template ? '?template=' + template : ''}`);
  if (!session) return <SetupRequired />;
  return <SalesDesk initial={await listSales()} email={session.user.email ?? ''} templateId={template} />;
}
