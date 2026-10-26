import { StorefrontFrame, Pricing } from '@/components/storefront';
export const metadata = { title: 'প্যাকেজ ও মূল্য — Dawat', robots: { index: true, follow: true } };
export default function Page() {
  return (
    <StorefrontFrame>
      <Pricing standalone />
    </StorefrontFrame>
  );
}
