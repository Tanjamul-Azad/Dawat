import { Login } from '@/components/production/login';
import { SetupRequired } from '@/components/production/frame';
import { backendConfigured, emailSignInReady } from '@/server/config';
import { safeReturnPath } from '@/features/production/navigation';
import { session } from '@/server/auth';
import { HttpError } from '@/server/http';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!backendConfigured()) return <SetupRequired />;
  const next = safeReturnPath((await searchParams).next);
  let signedIn = false;
  try {
    await session();
    signedIn = true;
  } catch (error) {
    if (!(error instanceof HttpError && error.status === 401)) throw error;
  }
  if (signedIn) redirect(next);
  return <Login next={next} available={emailSignInReady()} />;
}
