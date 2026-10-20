import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftContent, uuid } from '@/features/production/contracts';
import { InvitationPreview } from '@/components/production/invitation-preview';
import { backendConfigured } from '@/server/config';
import { database } from '@/server/supabase';
export const metadata: Metadata = {
  title: 'বিয়ের আমন্ত্রণ',
  description: 'নবদম্পতি ও তাঁদের পরিবারের ভালোবাসার আমন্ত্রণ।',
  robots: { index: false, follow: false },
};
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!backendConfigured() || !uuid.safeParse(slug).success) notFound();
  const db = await database();
  const r = await db.rpc('resolve_general_invitation', { p_slug: slug });
  if (r.error?.code === 'PT404') notFound();
  if (r.error) throw new Error('Invitation service unavailable.');
  return (
    <main>
      <link rel="preload" as="image" href="/artwork/jamdani-vine-v5.webp" fetchPriority="high" />
      <InvitationPreview
        content={draftContent.parse(r.data)}
        scope={`general-${slug}`}
        mediaBase={`/i/${slug}/media`}
        live
      />
    </main>
  );
}
