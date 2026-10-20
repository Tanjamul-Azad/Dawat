import { Login } from '@/components/production/login';
import { SetupRequired } from '@/components/production/frame';
import { backendConfigured, emailSignInReady } from '@/server/config';
import { safeReturnPath } from '@/features/production/navigation';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!backendConfigured()) return <SetupRequired />;
  return <Login next={safeReturnPath((await searchParams).next)} available={emailSignInReady()} />;
}
