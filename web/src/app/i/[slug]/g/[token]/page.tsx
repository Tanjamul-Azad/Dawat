import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { uuid } from '@/features/production/contracts';
import { invitationMetadata } from '@/features/production/share';
import { publishedShare } from '@/server/share';
import { GuestExchange } from '@/components/production/guest-live';
export const dynamic = 'force-dynamic';
// Slug-only preview: the token and household never reach metadata.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return invitationMetadata(slug, await publishedShare(slug), 'personal');
}
export default async function Page({ params }: { params: Promise<{ slug: string; token: string }> }) {
  const p = await params;
  if (!uuid.safeParse(p.slug).success || !/^[A-Za-z0-9_-]{43}$/.test(p.token)) notFound();
  // No token in props, no personalized HTML before the credential exchange; GET never submits an answer.
  return <GuestExchange slug={p.slug} />;
}
