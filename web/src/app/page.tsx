import { StorefrontHome } from '@/components/storefront-home';
import { redirect } from 'next/navigation';
import { deploymentSurface } from '@/features/production/surface';
import { brandShare, storefrontMetadata } from '@/features/production/share';
import { paymentReviewPromise } from '@/features/production/public-config';
// Built once per deploy and served from the CDN: nothing here depends on the visitor.
export const metadata = {
  ...storefrontMetadata({ ...brandShare, path: '/' }),
  robots: { index: true, follow: true },
};
export default function Page() {
  if (deploymentSurface() === 'pilot') redirect('/dashboard/');
  return <StorefrontHome paymentPromise={paymentReviewPromise()} />;
}
