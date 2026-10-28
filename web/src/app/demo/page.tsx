import { DemoInvitation } from '@/components/production/demo-invitation';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'দাওয়াত · নমুনা আমন্ত্রণ', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  return <DemoInvitation templateId={(await searchParams).template} />;
}
