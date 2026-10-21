import { notFound } from 'next/navigation';
import { uuid, draftContent } from '@/features/production/contracts';
import { pageSession } from '@/server/auth';
import { report } from '@/server/guests';
import { SetupRequired } from '@/components/production/frame';
import { GuestHub } from '@/components/production/guest-hub';
import { HttpError, dbError } from '@/server/http';
export const dynamic = 'force-dynamic';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const s = await pageSession(`/weddings/${id}/guests/`);
  if (!s) return <SetupRequired />;
  try {
    const w = await s.db.from('weddings').select('id,slug,title,live_version_id').eq('id', id).maybeSingle();
    dbError(w.error);
    if (!w.data) notFound();
    const version = w.data?.live_version_id
      ? await s.db
          .from('invitation_versions')
          .select('content')
          .eq('wedding_id', id)
          .eq('id', w.data.live_version_id)
          .maybeSingle()
      : { data: null, error: null };
    dbError(version.error);
    const events = version.data ? draftContent.parse(version.data.content).events : [];
    const event = events.find((e) => e.id === 'reception')?.id ?? events[0]?.id ?? 'reception';
    return (
      <GuestHub
        wid={id}
        slug={w.data.slug}
        title={w.data.title}
        email={s.user.email ?? ''}
        events={events}
        initial={await report(id, event, null, '', 'all', s)}
        initialEvent={event}
      />
    );
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
}
