import { notFound } from 'next/navigation';
import { uuid } from '@/features/production/contracts';
import { WeddingDesk } from '@/components/production/wedding-desk';
import { SetupRequired } from '@/components/production/frame';
import { pageSession } from '@/server/auth';
import { getWedding } from '@/server/weddings';
import { HttpError } from '@/server/http';
export const dynamic = 'force-dynamic';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  if (!uuid.safeParse(p.id).success) notFound();
  const s = await pageSession(`/weddings/${p.id}/`);
  if (!s) return <SetupRequired />;
  try {
    return <WeddingDesk initial={await getWedding(p.id)} email={s.user.email ?? ''} />;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
}
