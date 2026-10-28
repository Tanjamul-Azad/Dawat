import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { uuid } from '@/features/production/contracts';
import { invitationMetadata } from '@/features/production/share';
import { publishedShare } from '@/server/share';
import { resolveOpenInvitation } from '@/server/open-invite';
import { HttpError } from '@/server/http';
import { OpenGuestInvitation } from '@/components/production/open-guest-invitation';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { ...invitationMetadata(slug, await publishedShare(slug), 'general'), robots: { index: false, follow: false } };
}
export default async function Page({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const { slug, token } = await params;
  if (!uuid.safeParse(slug).success || !/^[A-Za-z0-9_-]{43}$/.test(token)) notFound();
  try {
    const invitation = await resolveOpenInvitation(slug, token);
    return <OpenGuestInvitation initial={invitation} />;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  }
}
