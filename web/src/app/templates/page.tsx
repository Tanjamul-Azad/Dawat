import { TemplateCollection } from '@/components/storefront';
import { StorefrontFrame } from '@/components/storefront-chrome';
import { notFound } from 'next/navigation';
import { storefrontMetadata } from '@/features/production/share';
import { deploymentSurface } from '@/features/production/surface';
export const metadata = {
  ...storefrontMetadata({
    title: 'বিয়ের আমন্ত্রণের নকশা — Dawat',
    description: 'জামদানি থেকে চাঁদের আলো: ছয়টি নিজস্ব নকশা। নিজেদের নাম লিখে দেখুন, লাইভ নমুনা খুলুন।',
    path: '/templates/',
  }),
  robots: { index: true, follow: true },
};
export default function Page() {
  // Static and outside the proxy, so the pilot surface is enforced here at build time.
  if (deploymentSurface() === 'pilot') notFound();
  return (
    <StorefrontFrame>
      <TemplateCollection full />
    </StorefrontFrame>
  );
}
