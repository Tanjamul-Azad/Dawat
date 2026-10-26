import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftContent, uuid } from '@/features/production/contracts';
import { InvitationPreview } from '@/components/production/invitation-preview';
import { invitationMetadata } from '@/features/production/share';
import { backendConfigured } from '@/server/config';
import { publishedShare, resolveGeneralInvitation } from '@/server/share';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return invitationMetadata(slug, await publishedShare(slug), 'general');
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!backendConfigured() || !uuid.safeParse(slug).success) notFound();
  const r = await resolveGeneralInvitation(slug);
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
