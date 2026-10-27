import { Pricing } from '@/components/storefront';
import { StorefrontFrame } from '@/components/storefront-chrome';
import { FAQ, PromiseBlock } from '@/components/storefront-trust';
import { storefrontMetadata } from '@/features/production/share';
import { paymentReviewPromise } from '@/features/production/public-config';
export const dynamic = 'force-dynamic';
export const metadata = {
  ...storefrontMetadata({
    title: 'প্যাকেজ ও দাম — Dawat',
    description: 'ক্লাসিক, প্রিমিয়াম আর নিজের মতো: ডিজিটাল বিয়ের আমন্ত্রণের প্যাকেজ ও দাম।',
    path: '/pricing/',
  }),
  robots: { index: true, follow: true },
};
export default function Page() {
  const promise = paymentReviewPromise();
  return (
    <StorefrontFrame>
      <Pricing standalone />
      <PromiseBlock paymentPromise={promise} />
      <FAQ paymentPromise={promise} />
    </StorefrontFrame>
  );
}
