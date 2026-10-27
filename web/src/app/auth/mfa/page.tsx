import { redirect } from 'next/navigation';
import { Mfa } from '@/components/production/login';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { dbError } from '@/server/http';
import { safeReturnPath } from '@/features/production/navigation';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeReturnPath((await searchParams).next);
  const destination = next.startsWith('/admin/') ? next : '/admin/orders/';
  // If the session expired here, sign-in must resume the original admin page.
  // That page will require MFA again while preserving its exact order identity.
  const s = await pageSession(destination);
  if (!s) return <SetupRequired />;
  const role = await s.db.from('staff_roles').select('active').eq('user_id', s.user.id).maybeSingle();
  dbError(role.error);
  if (!role.data?.active) redirect('/dashboard/');
  const factors = await s.db.auth.mfa.listFactors();
  if (factors.error) throw new Error('Authenticator settings unavailable.');
  return <Mfa existingFactor={factors.data.totp[0]?.id ?? null} next={destination} />;
}
