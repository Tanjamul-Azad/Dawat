import { notFound } from 'next/navigation';
import { uuid } from '@/features/production/contracts';
import { WeddingDesk } from '@/components/production/wedding-desk';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { getWedding } from '@/server/weddings';
import { HttpError } from '@/server/http';
import { editorSection } from '@/features/production/navigation';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const p = await params;
  if (!uuid.safeParse(p.id).success) notFound();
  const section = editorSection((await searchParams).section);
  const s = await pageSession(`/weddings/${p.id}/${section === 'overview' ? '' : `?section=${section}`}`);
  if (!s) return <SetupRequired />;
  try {
    return (
      <WeddingDesk initial={await getWedding(p.id, s)} email={s.user.email ?? ''} initialSection={section} />
    );
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
}
