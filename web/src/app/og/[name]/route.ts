import { shareVariants, storefrontCard } from '@/features/production/share';
import { renderShareImage } from '@/server/share-image';
// Storefront and template-sample previews: public, built once, no request data.
export const dynamic = 'force-static';
export const dynamicParams = false;
export function generateStaticParams() {
  return shareVariants.map((v) => ({ name: `${v}.jpg` }));
}
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const variant = shareVariants.find((v) => `${v}.jpg` === name);
  if (!variant) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(await renderShareImage(storefrontCard(variant))), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
  });
}
