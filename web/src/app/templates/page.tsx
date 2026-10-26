import { StorefrontFrame, TemplateCollection } from '@/components/storefront';
export const metadata = { title: 'বিয়ের আমন্ত্রণের নকশা — Dawat', robots: { index: true, follow: true } };
export default function Page() {
  return (
    <StorefrontFrame>
      <TemplateCollection full />
    </StorefrontFrame>
  );
}
