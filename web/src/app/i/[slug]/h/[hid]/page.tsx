import { notFound } from 'next/navigation';
import { uuid } from '@/features/production/contracts';
import { GuestLive } from '@/components/production/guest-live';
import { getGuest } from '@/server/guests';
import { HttpError } from '@/server/http';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'আপনার ব্যক্তিগত বিয়ের আমন্ত্রণ',
  description: 'নবদম্পতি ও তাঁদের পরিবারের ভালোবাসার আমন্ত্রণ।',
  robots: { index: false, follow: false },
};
export default async function Page({ params }: { params: Promise<{ slug: string; hid: string }> }) {
  const p = await params;
  if (!uuid.safeParse(p.slug).success || !uuid.safeParse(p.hid).success) notFound();
  try {
    return (
      <main>
        <GuestLive initial={await getGuest(p.slug, p.hid)} slug={p.slug} />
      </main>
    );
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
}
