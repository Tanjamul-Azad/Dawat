import 'server-only';
import { redirect } from 'next/navigation';
import { database } from './supabase';
import { dbError, HttpError } from './http';
import { backendConfigured } from './config';
import { safeReturnPath } from '@/features/production/navigation';

export async function session() {
  const db = await database();
  const { data, error } = await db.auth.getUser();
  if (error && ((error.status ?? 0) >= 500 || error.name === 'AuthRetryableFetchError'))
    throw new HttpError(
      503,
      'AUTH_UNAVAILABLE',
      'Sign-in verification is temporarily unavailable. Your edits are still here. Please retry.',
    );
  if (error || !data.user?.email_confirmed_at)
    throw new HttpError(401, 'AUTH_REQUIRED', 'Sign in with your verified email to continue.');
  return { db, user: data.user };
}
export async function staffSession() {
  const s = await session();
  const { data, error } = await s.db
    .from('staff_roles')
    .select('active')
    .eq('user_id', s.user.id)
    .maybeSingle();
  dbError(error);
  if (!data?.active) throw new HttpError(403, 'STAFF_REQUIRED', 'This account has no seller access.');
  const aal = await s.db.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.error || aal.data?.currentLevel !== 'aal2')
    throw new HttpError(403, 'MFA_REQUIRED', 'Verify your authenticator before opening seller controls.');
  return s;
}
export async function pageSession(path: string, staff = false) {
  if (!backendConfigured()) return null;
  try {
    return await (staff ? staffSession() : session());
  } catch (e) {
    if (e instanceof HttpError && e.status === 401)
      redirect(`/auth/login/?next=${encodeURIComponent(safeReturnPath(path))}`);
    if (e instanceof HttpError && e.code === 'MFA_REQUIRED')
      redirect(`/auth/mfa/?next=${encodeURIComponent(safeReturnPath(path))}`);
    if (e instanceof HttpError && e.status === 403) redirect('/dashboard/');
    throw e;
  }
}
