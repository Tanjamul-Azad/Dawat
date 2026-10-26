import { StorefrontFrame, Pricing } from '@/components/storefront';
import { storefrontMetadata } from '@/features/production/share';
export const metadata = {
  ...storefrontMetadata({
    title: 'প্যাকেজ ও মূল্য — Dawat',
    description: 'ডিজিটাল বিয়ের আমন্ত্রণের প্যাকেজ ও মূল্য—নাম ধরে আমন্ত্রণ ও অতিথিদের উত্তরসহ।',
    path: '/pricing/',
  }),
  robots: { index: true, follow: true },
};
export default function Page() {
  return (
    <StorefrontFrame>
      <Pricing standalone />
    </StorefrontFrame>
  );
}
