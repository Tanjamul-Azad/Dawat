import { Experience } from '@/components/experience';
import { ClientDashboard } from '@/components/production/client-dashboard';
import { SetupRequired } from '@/components/production/frame';
import { isDemo } from '@/server/config';
import { pageSession } from '@/server/auth';
import { listWeddings } from '@/server/weddings';
import { redirect } from 'next/navigation';
import { singleWeddingDestination } from '@/features/production/entry';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ all?: string }> }) {
  if (isDemo()) return <Experience view="dashboard" />;
  const listRequested = (await searchParams).all === '1';
  const s = await pageSession(`/dashboard/${listRequested ? '?all=1' : ''}`);
  if (!s) return <SetupRequired />;
  const weddings = await listWeddings();
  const destination = singleWeddingDestination(weddings, listRequested);
  if (destination) redirect(destination);
  return <ClientDashboard initial={weddings} email={s.user.email ?? ''} />;
}
