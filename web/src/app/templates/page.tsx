import { TemplateCollection } from '@/components/storefront';
import { StorefrontFrame } from '@/components/storefront-chrome';
import { storefrontMetadata } from '@/features/production/share';
export const metadata = {
  ...storefrontMetadata({
    title: 'বিয়ের আমন্ত্রণের নকশা — Dawat',
    description: 'জামদানি থেকে চাঁদের আলো: ছয়টি নিজস্ব নকশা। নিজেদের নাম লিখে দেখুন, লাইভ নমুনা খুলুন।',
    path: '/templates/',
  }),
  robots: { index: true, follow: true },
};
export default function Page() {
  return (
    <StorefrontFrame>
      <TemplateCollection full />
    </StorefrontFrame>
  );
}
