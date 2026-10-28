import { SalesDesk } from '@/components/production/sales-desk';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { listSales } from '@/server/sales';
import { couplePrefill } from '@/features/production/navigation';
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; names?: string }>;
}) {
  const { template, names: rawNames } = await searchParams;
  const names = couplePrefill(rawNames);
  // Keep the visitor's design and typed names through sign-in.
  const query = [template && `template=${template}`, names && `names=${encodeURIComponent(names)}`]
    .filter(Boolean)
    .join('&');
  const session = await pageSession(`/order/requests/${query ? '?' + query : ''}`);
  if (!session) return <SetupRequired />;
  return (
    <SalesDesk
      initial={await listSales()}
      email={session.user.email ?? ''}
      templateId={template}
      names={names || undefined}
    />
  );
}
