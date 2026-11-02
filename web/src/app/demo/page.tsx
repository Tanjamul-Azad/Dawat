import type { Metadata } from 'next';
import { DemoInvitation } from '@/components/storefront-demo';
import { findTemplate } from '@/features/production/catalog';
import { storefrontMetadata } from '@/features/production/share';

export const metadata: Metadata = {
  ...storefrontMetadata({
    title: 'লাইভ নমুনা আমন্ত্রণ — Dawat',
    description: 'পুরো একটি আমন্ত্রণ খুলে দেখুন, উত্তরও দিয়ে দেখুন। সবই কাল্পনিক নমুনা।',
    path: '/demo/',
  }),
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const template = findTemplate((await searchParams).template);
  return (
    <>
      {template.id === 'garden' ? (
        <link
          rel="preload"
          as="image"
          href="/artwork/garden-editorial-envelope-960.webp"
          imageSrcSet="/artwork/garden-editorial-envelope-480.webp 480w, /artwork/garden-editorial-envelope-960.webp 960w"
          imageSizes="(max-width: 480px) 94vw, 460px"
          fetchPriority="high"
        />
      ) : template.id === 'ivory' ? (
        <link
          rel="preload"
          as="image"
          href="/artwork/ivory-lake-1536.webp"
          imageSrcSet="/artwork/ivory-lake-768.webp 768w, /artwork/ivory-lake-1536.webp 1536w"
          imageSizes="(max-width: 900px) 100vw, 900px"
          fetchPriority="high"
        />
      ) : template.id === 'holud' ? (
        <link
          rel="preload"
          as="image"
          href="/artwork/reference-royal-envelope-960.webp"
          fetchPriority="high"
        />
      ) : template.id === 'jamdani' || template.id === 'rose' ? (
        <link
          rel="preload"
          as="image"
          href={`/artwork/reference-${template.id === 'jamdani' ? 'blue' : 'rose'}-640.webp`}
          fetchPriority="high"
        />
      ) : null}
      <DemoInvitation key={template.id} templateId={template.id} />
    </>
  );
}
