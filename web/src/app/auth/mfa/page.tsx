import { redirect } from 'next/navigation';
import { Mfa } from '@/components/production/login';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { dbError } from '@/server/http';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const s = await pageSession('/auth/mfa/');
  if (!s) return <SetupRequired />;
  const role = await s.db.from('staff_roles').select('active').eq('user_id', s.user.id).maybeSingle();
  dbError(role.error);
  if (!role.data?.active) redirect('/dashboard/');
  const factors = await s.db.auth.mfa.listFactors();
  if (factors.error) throw new Error('Authenticator settings unavailable.');
  return <Mfa existingFactor={factors.data.totp[0]?.id ?? null} />;
}
