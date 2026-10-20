import { notFound } from 'next/navigation';
import { uuid } from '@/features/production/contracts';
import { GuestExchange } from '@/components/production/guest-live';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'আপনার ব্যক্তিগত বিয়ের আমন্ত্রণ',
  description: 'নবদম্পতি ও তাঁদের পরিবারের ভালোবাসার আমন্ত্রণ।',
  robots: { index: false, follow: false },
};
export default async function Page({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const p = await params;
  if (!uuid.safeParse(p.slug).success || !/^[A-Za-z0-9_-]{43}$/.test(p.token)) notFound();
  // No token in props, no personalized HTML before the credential exchange; GET never submits an answer.
  return <GuestExchange slug={p.slug} />;
}
