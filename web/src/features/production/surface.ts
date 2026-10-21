// Deployment exposure only. Every page, API and database command still authorizes its actor.
export type DeploymentSurface = 'all' | 'pilot';
export function deploymentSurface(value = process.env.DAWAT_SURFACE): DeploymentSurface {
  if (!value || value === 'all') return 'all';
  if (value === 'pilot') return 'pilot';
  throw new Error('Unsupported DAWAT_SURFACE configuration.');
}
export function routeAllowed(surface: DeploymentSurface, pathname: string): boolean {
  if (surface === 'all') return true;
  return (
    !/^\/(?:admin|operator|studio|templates|order)(?:\/|$)/.test(pathname) &&
    !/^\/api\/admin(?:\/|$)/.test(pathname) &&
    !/^\/auth\/mfa(?:\/|$)/.test(pathname) &&
    !/^\/api\/auth\/mfa-/.test(pathname)
  );
}
