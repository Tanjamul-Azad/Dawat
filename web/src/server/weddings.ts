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
export async function getWedding(id: string): Promise<WeddingDetail> {
  const { db } = await session();
  const [w, d, g, e] = await Promise.all([
    db.from('weddings').select('*').eq('id', id).maybeSingle(),
    db.from('invitation_drafts').select('*').eq('wedding_id', id).maybeSingle(),
    db.from('dashboard_grants').select('state').eq('wedding_id', id).maybeSingle(),
    db.from('entitlements').select('*').eq('wedding_id', id).maybeSingle(),
  ]);
  for (const r of [w, d, g, e]) dbError(r.error);
  if (!w.data || !d.data || !e.data)
    throw new HttpError(
      404,
      'WORKSPACE_UNAVAILABLE',
      'This workspace is unavailable or its management access is inactive.',
    );
  let publishedDraftRevision: number | null = null;
  let publishedGeneralEventIds: ('nikah' | 'reception')[] = [];
  if (w.data.live_version_id) {
    const v = await db
      .from('invitation_versions')
      .select('draft_revision,content')
      .eq('wedding_id', id)
      .eq('id', w.data.live_version_id)
      .maybeSingle();
    dbError(v.error);
    publishedDraftRevision = v.data?.draft_revision ?? null;
    if (v.data) publishedGeneralEventIds = draftContent.parse(v.data.content).generalEventIds;
  }
  const protectedEventIds: ('nikah' | 'reception')[] = [];
  const eventIds = ['nikah', 'reception'] as const;
  const replyChecks = await Promise.all(
    eventIds.map((eventId) =>
      db.from('household_events').select('event_id').eq('wedding_id', id).eq('event_id', eventId).limit(1),
    ),
  );
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
    wedding: { ...w.data, state: g.data?.state ?? 'inactive' },
    content: Object.keys(d.data.content ?? {}).length ? draftContent.parse(d.data.content) : emptyDraft(),
    revision: d.data.revision,
    updatedAt: d.data.updated_at,
    expiresAt: e.data.expires_at,
    termDays: e.data.term_days,
    publishedDraftRevision,
  };
}
export async function listOrders(cursor?: string, search = '', field: 'name' | 'email' = 'name') {
  const { db } = await staffSession();
  let query = db.from('orders').select('*').order('id').limit(26);
  if (cursor) query = query.gt('id', cursor);
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
