import 'server-only';
import { z } from 'zod';
import { assertEnvironment } from '@/features/production/environment';

export function deploymentEnvironment() {
  assertEnvironment({
    environment: process.env.DAWAT_ENVIRONMENT,
    backend: process.env.NEXT_PUBLIC_SUPABASE_URL,
    origin: process.env.APP_ORIGIN,
    context: process.env.CONTEXT,
    surface: process.env.DAWAT_SURFACE,
  });
}

export const isDemo = () =>
  process.env.NEXT_PUBLIC_APP_MODE === 'demo' && process.env.NODE_ENV !== 'production';
export const emailSignInReady = () => process.env.AUTH_EMAIL_ENABLED !== 'false';
export function backendConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.APP_ORIGIN,
  );
}
export function config() {
  deploymentEnvironment();
  const c = z.object({ url: z.url(), key: z.string().min(10), origin: z.url() }).parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    origin: process.env.APP_ORIGIN,
  });
  const origin = new URL(c.origin);
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname);
  if (
    origin.origin !== c.origin ||
    (process.env.NODE_ENV === 'production' && origin.protocol !== 'https:' && !local)
  ) {
    throw new Error('APP_ORIGIN must be a canonical HTTPS origin in production.');
  }
  return c;
}
