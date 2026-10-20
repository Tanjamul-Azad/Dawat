import { z } from 'zod';
import { body, endpoint, HttpError } from '@/server/http';
import { database } from '@/server/supabase';
import { session } from '@/server/auth';
import { emailSignInReady } from '@/server/config';

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  return endpoint(request, async () => {
    const { action } = await context.params;
    const db = await database();
    if (action === 'login') {
      if (!emailSignInReady())
        throw new HttpError(
          503,
          'EMAIL_SETUP_PENDING',
          'Email sign-in is being prepared. Please contact your seller.',
        );
      const input = await body(request, z.object({ email: z.email().max(254) }).strict());
      const { error } = await db.auth.signInWithOtp({
        email: input.email.toLowerCase(),
        options: { shouldCreateUser: true },
      });
      if (error)
        throw new HttpError(
          error.status === 429 ? 429 : 503,
          'OTP_UNAVAILABLE',
          'Unable to send a code. Please wait and try again.',
        );
      return { sent: true };
    }
    if (action === 'verify') {
      const input = await body(
        request,
        z.object({ email: z.email().max(254), token: z.string().regex(/^\d{6,10}$/) }).strict(),
      );
      const { error } = await db.auth.verifyOtp({
        email: input.email.toLowerCase(),
        token: input.token,
        type: 'email',
      });
      if (error)
        throw new HttpError(
          error.status === 429 ? 429 : 401,
          'OTP_INVALID',
          'This code is invalid or expired. Request a new code.',
        );
      return { verified: true };
    }
    const s = await session();
    if (action === 'logout') {
      const { error } = await s.db.auth.signOut();
      if (error) throw new HttpError(503, 'SIGNOUT_FAILED', 'Could not sign out. Please retry.');
      return { signedOut: true };
    }
    if (action === 'mfa-enroll') {
      const factors = await s.db.auth.mfa.listFactors();
      if (factors.error) throw new HttpError(503, 'MFA_FAILED', 'Could not load authenticator settings.');
      // Clean abandoned enrollment; never remove a verified factor.
      for (const f of factors.data.all.filter((f) => f.factor_type === 'totp' && f.status === 'unverified'))
        await s.db.auth.mfa.unenroll({ factorId: f.id });
      const { data, error } = await s.db.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Dawat seller',
      });
      if (error)
        throw new HttpError(
          422,
          'MFA_ENROLL_FAILED',
          'Could not set up authenticator. Try verifying an existing authenticator.',
        );
      return { factorId: data.id, qrCode: data.totp.qr_code };
    }
    if (action === 'mfa-verify') {
      const input = await body(
        request,
        z.object({ factorId: z.uuid(), code: z.string().regex(/^\d{6}$/) }).strict(),
      );
      const { error } = await s.db.auth.mfa.challengeAndVerify({
        factorId: input.factorId,
        code: input.code,
      });
      if (error)
        throw new HttpError(
          error.status === 429 ? 429 : 401,
          'MFA_INVALID',
          'Invalid authenticator code. Please retry.',
        );
      return { verified: true };
    }
    throw new HttpError(404, 'NOT_FOUND', 'Action unavailable.');
  });
}
