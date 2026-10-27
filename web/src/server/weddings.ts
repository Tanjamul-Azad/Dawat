import 'server-only';
import {
  draftContent,
  emptyDraft,
  type WeddingDetail,
  type WeddingSummary,
} from '@/features/production/contracts';
import { session, staffSession } from './auth';
import { dbError, HttpError } from './http';
import { config } from './config';

export async function listWeddings(): Promise<WeddingSummary[]> {
  const { db } = await session();
  const result = await db.rpc('workspace_overview');
  dbError(result.error);
  return result.data as unknown as WeddingSummary[];
}
export async function getWedding(
  id: string,
  verified?: Awaited<ReturnType<typeof session>>,
): Promise<WeddingDetail> {
  const { db } = verified ?? (await session());
  const eventIds = ['nikah', 'reception'] as const;
  // Embed through the existing same-wedding FKs. Every joined row still uses the caller's RLS.
  const [w, replyChecks] = await Promise.all([
    db
      .from('weddings')
      .select(
        '*,draft:invitation_drafts!invitation_drafts_wedding_id_fkey(*),grant:dashboard_grants!dashboard_grants_wedding_id_fkey(state),entitlement:entitlements!entitlements_wedding_id_fkey(*),live:invitation_versions!live_version_same_wedding(draft_revision,content)',
      )
      .eq('id', id)
      .maybeSingle(),
    Promise.all(
      eventIds.map((eventId) =>
        db.from('household_events').select('event_id').eq('wedding_id', id).eq('event_id', eventId).limit(1),
      ),
    ),
  ]);
  dbError(w.error);
  if (!w.data || !w.data.draft || !w.data.entitlement)
    throw new HttpError(
      404,
      'WORKSPACE_UNAVAILABLE',
      'This workspace is unavailable or its management access is inactive.',
    );
  const { draft, grant, entitlement, live, ...wedding } = w.data;
  const publishedDraftRevision = live?.draft_revision ?? null;
  const publishedGeneralEventIds = live ? draftContent.parse(live.content).generalEventIds : [];
  const protectedEventIds: ('nikah' | 'reception')[] = [];
  for (const [index, replies] of replyChecks.entries()) {
    dbError(replies.error);
    if (replies.data?.length) protectedEventIds.push(eventIds[index]);
  }
  return {
    workspaceUrl: `${config().origin}/weddings/${id}/`,
    generalInvitationUrl:
      w.data.visibility === 'live' && publishedGeneralEventIds.length
        ? `${config().origin}/i/${w.data.slug}/`
        : null,
    publishedGeneralEventIds,
    protectedEventIds,
    mediaAvailable: Boolean(process.env.SUPABASE_MEDIA_SECRET_KEY?.trim()),
    wedding: { ...wedding, state: grant?.state ?? 'inactive' },
    content: Object.keys(draft.content ?? {}).length
      ? draftContent.parse(draft.content)
      : { ...emptyDraft(), templateId: w.data.template_id as ReturnType<typeof emptyDraft>['templateId'] },
    revision: draft.revision,
    updatedAt: draft.updated_at,
    expiresAt: entitlement.expires_at,
    termDays: entitlement.term_days,
    publishedDraftRevision,
  };
}
export async function listOrders(
  cursor?: string,
  search = '',
  field: 'name' | 'email' = 'name',
  id?: string,
) {
  const { db } = await staffSession();
  let query = db.from('orders').select('*').order('id').limit(26);
  if (cursor) query = query.gt('id', cursor);
  if (id) query = query.eq('id', id);
  if (search)
    query = query.ilike(
      field === 'email' ? 'customer_email' : 'customer_name',
      `%${search.replace(/[\\%_]/g, '\\$&')}%`,
    );
  const orders = await query;
  dbError(orders.error);
  const rows = orders.data!.slice(0, 25);
  const weddings = rows.length
    ? await db
        .from('weddings')
        .select('id,order_id')
        .in(
          'order_id',
          rows.map((o) => o.id),
        )
    : { data: [], error: null };
  dbError(weddings.error);
  const grants = weddings.data!.length
    ? await db
        .from('dashboard_grants')
        .select('wedding_id,state')
        .in(
          'wedding_id',
          weddings.data!.map((w) => w.id),
        )
    : { data: [], error: null };
  dbError(grants.error);
  return {
    orders: rows.map((o) => {
      const w = weddings.data!.find((w) => w.order_id === o.id);
      return {
        ...o,
        weddingId: w?.id ?? null,
        access: grants.data!.find((g) => g.wedding_id === w?.id)?.state ?? 'inactive',
      };
    }),
    nextCursor: orders.data!.length > 25 ? rows.at(-1)!.id : null,
  };
}
