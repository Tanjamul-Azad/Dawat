// Public deployment identities, never credentials. One hosted production backend;
// development and recovery use distinct loopback Supabase instances.
export const productionBackend = 'https://zztiestaqjbsbjuzmbqp.supabase.co';
export const productionOrigin = 'https://dawatcard.netlify.app';
export function assertEnvironment(input: {
  environment?: string;
  backend?: string;
  origin?: string;
  context?: string;
  surface?: string;
}) {
  const environment = input.environment ?? 'development';
  if (!['development', 'staging', 'recovery', 'production'].includes(environment))
    throw new Error('Unknown deployment environment.');
  if (input.backend === productionBackend) {
    if (
      environment !== 'production' ||
      input.origin !== productionOrigin ||
      !['pilot', 'all'].includes(input.surface ?? '')
    )
      throw new Error('Production backend requires its dedicated production deployment.');
    if (input.context && input.context !== 'production')
      throw new Error('Production credentials are forbidden in preview and development contexts.');
  } else if (environment === 'production') {
    throw new Error('Production project identity does not match the approved backend.');
  }
  if (
    environment === 'recovery' &&
    (input.backend !== 'http://127.0.0.1:55321' || input.origin !== 'http://127.0.0.1:3104')
  )
    throw new Error('Recovery must use the isolated loopback services.');
}
