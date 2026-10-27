import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { uuid } from '@/features/production/contracts';
import { invitationMetadata } from '@/features/production/share';
import { publishedShare } from '@/server/share';
import { GuestLive } from '@/components/production/guest-live';
import { getGuest } from '@/server/guests';
import { HttpError } from '@/server/http';
export const dynamic = 'force-dynamic';
// Slug-only preview: the hid and household never reach metadata.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return invitationMetadata(slug, await publishedShare(slug), 'personal');
}
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
