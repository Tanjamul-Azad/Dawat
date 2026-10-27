import { StorefrontHome } from '@/components/storefront';
import { redirect } from 'next/navigation';
import { deploymentSurface } from '@/features/production/surface';
import { brandShare, storefrontMetadata } from '@/features/production/share';
import { paymentReviewPromise } from '@/features/production/public-config';
export const dynamic = 'force-dynamic';
export const metadata = {
  ...storefrontMetadata({ ...brandShare, path: '/' }),
  robots: { index: true, follow: true },
};
export default function Page() {
  if (deploymentSurface() === 'pilot') redirect('/dashboard/');
  return <StorefrontHome paymentPromise={paymentReviewPromise()} />;
}
