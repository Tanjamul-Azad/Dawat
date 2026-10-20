import { Experience } from '@/components/experience';
import { ClientDashboard } from '@/components/production/client-dashboard';
import { SetupRequired } from '@/components/production/frame';
import { isDemo } from '@/server/config';
import { pageSession } from '@/server/auth';
import { listWeddings } from '@/server/weddings';
export const dynamic = 'force-dynamic';
export default async function Page() {
  if (isDemo()) return <Experience view="dashboard" />;
  const s = await pageSession('/dashboard/');
  if (!s) return <SetupRequired />;
  return <ClientDashboard initial={await listWeddings()} email={s.user.email ?? ''} />;
}
