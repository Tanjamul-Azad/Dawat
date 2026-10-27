import { invitationCard } from '@/features/production/share';
import { renderShareImage } from '@/server/share-image';
import { publishedShare } from '@/server/share';
export const dynamic = 'force-dynamic';
// Slug-only preview of the live general publication; publication is rechecked on every
// fetch, so a paused or revoked invitation immediately serves the generic Dawat image.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const image = await renderShareImage(invitationCard(await publishedShare(slug)));
  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
