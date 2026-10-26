import { StorefrontHome } from '@/components/storefront';
import { redirect } from 'next/navigation';
import { deploymentSurface } from '@/features/production/surface';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: true, follow: true } };
export default function Page() {
  if (deploymentSurface() === 'pilot') redirect('/dashboard/');
  return <StorefrontHome />;
}
