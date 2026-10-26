import type { Metadata } from 'next';
import { InvitationEntry } from '@/components/invitation-entry';
import { InvitationPreview } from '@/components/production/invitation-preview';
import { createWorkspace } from '@/features/workspace/model';
import { isDemo } from '@/server/config';
import { findTemplate } from '@/features/production/catalog';

export const metadata: Metadata = {
  title: 'বিয়ের আমন্ত্রণ, শুধু আপনার জন্য',
  description: 'নবদম্পতি ও তাঁদের পরিবারের ভালোবাসার আমন্ত্রণ। আয়োজনের কথা জানতে আমন্ত্রণটি খুলুন।',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const template = findTemplate((await searchParams).template);
  if (!isDemo())
    return (
      <main>
        <InvitationPreview
          content={{ ...createWorkspace().draft, templateId: template.id }}
          scope="public-sample"
        />
      </main>
    );
  return (
    <>
      <link rel="preload" as="image" href="/artwork/jamdani-vine-v5.webp" fetchPriority="high" />
      <InvitationEntry />
    </>
  );
}
