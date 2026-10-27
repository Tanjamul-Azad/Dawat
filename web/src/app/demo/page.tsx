import type { Metadata } from 'next';
import { DemoInvitation } from '@/components/storefront-demo';
import { findTemplate } from '@/features/production/catalog';
import { storefrontMetadata } from '@/features/production/share';

export const metadata: Metadata = {
  ...storefrontMetadata({
    title: 'লাইভ নমুনা আমন্ত্রণ — Dawat',
    description: 'পুরো একটি আমন্ত্রণ খুলে দেখুন, উত্তরও দিয়ে দেখুন। সবই কাল্পনিক নমুনা।',
    path: '/demo/',
  }),
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  return <DemoInvitation templateId={findTemplate((await searchParams).template).id} />;
}
