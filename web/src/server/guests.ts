import 'server-only';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  guestPayload,
  type GuestPayload,
  type HouseholdReport,
  type WishRow,
} from '@/features/production/guests';
import { database } from './supabase';
import { session } from './auth';
import { dbError, HttpError } from './http';
import { decryptLink, digest, encryptLink, secret } from './guest-crypto';
import { config } from './config';
export const guestPath = (slug: string, hid: string) => `/i/${slug}/h/${hid}/`;
export async function guestSession(slug: string, hid: string) {
  const raw = (await cookies()).get('dawat_guest')?.value;
  if (!raw || !/^[A-Za-z0-9_-]{43}$/.test(raw))
    throw new HttpError(404, 'GUEST_UNAVAILABLE', 'Open the current personal link from your hosts.');
  return { db: await database(), slug, hid, digest: digest(raw) };
}
export async function getGuest(slug: string, hid: string): Promise<GuestPayload> {
  const s = await guestSession(slug, hid);
  const r = await s.db.rpc('guest_invitation', {
    p_slug: slug,
    p_household_id: hid,
    p_session_digest: s.digest,
  });
  dbError(r.error);
  return guestPayload.parse(r.data);
}
export async function exchangeLink(slug: string, token: string) {
  const db = await database();
  const raw = secret();
  const r = await db.rpc('exchange_guest_link', {
    p_slug: slug,
    p_link_digest: digest(token),
    p_session_digest: digest(raw),
  });
  dbError(r.error);
  const value = z.object({ householdId: z.uuid(), expiresIn: z.number().int().positive() }).parse(r.data);
  const path = guestPath(slug, value.householdId);
  (await cookies()).set('dawat_guest', raw, {
    httpOnly: true,
    secure: config().origin.startsWith('https://'),
    sameSite: 'lax',
    path,
    maxAge: value.expiresIn,
  });
  return { path };
}
export async function personalLink(
  wid: string,
  hid: string,
  kind: 'copy' | 'rotate' | 'revoke',
  revision: number,
  key: string,
) {
  const { db } = await session();
  const token = secret();
  const encrypted = kind === 'revoke' ? { ciphertext: '', keyId: '' } : encryptLink(token, wid, hid);
  const r = await db.rpc('household_link', {
    p_wedding_id: wid,
    p_household_id: hid,
    p_kind: kind,
    p_revision: revision,
    p_key: key,
    p_digest: digest(token),
    p_ciphertext: encrypted.ciphertext,
    p_key_id: encrypted.keyId,
  });
  dbError(r.error);
  const result = z
    .object({
      revision: z.number().int(),
      active: z.boolean(),
      ciphertext: z.string().nullable(),
      keyId: z.string().nullable(),
    })
    .parse(r.data);
  if (!result.active) return { revision: result.revision, active: false, url: null };
  const recovered = decryptLink(result.ciphertext!, result.keyId!, wid, hid);
  const wedding = await db.from('weddings').select('slug').eq('id', wid).maybeSingle();
  dbError(wedding.error);
  if (!wedding.data) throw new HttpError(404, 'UNAVAILABLE', 'Workspace unavailable.');
  return {
    revision: result.revision,
    active: true,
    url: `${config().origin}/i/${wedding.data.slug}/g/${recovered}/`,
  };
}
export async function report(
  wid: string,
  eventId: string,
  after: string | null,
  search: string,
  status: string,
): Promise<HouseholdReport> {
  const { db } = await session();
  const r = await db.rpc('household_report', {
    p_wedding_id: wid,
    p_event_id: eventId,
    p_after: after ?? undefined,
    p_search: search,
    p_status: status,
  });
  dbError(r.error);
  return r.data as unknown as HouseholdReport;
}
export async function wishes(
  wid: string,
  after?: string,
): Promise<{ rows: WishRow[]; nextCursor: string | null }> {
  const { db } = await session();
  // Gate explicitly even for an empty page; RLS alone would turn a forbidden query into an empty success.
  const gate = await db.from('invitation_drafts').select('wedding_id').eq('wedding_id', wid).maybeSingle();
  dbError(gate.error);
  if (!gate.data) throw new HttpError(404, 'UNAVAILABLE', 'Workspace unavailable.');
  let q = db
    .from('wishes')
    .select('id,household_id,body,created_at')
    .eq('wedding_id', wid)
    .order('id')
    .limit(26);
  if (after) q = q.gt('id', after);
  const r = await q;
  dbError(r.error);
  const rows = r.data!.slice(0, 25);
  const names = rows.length
    ? await db
        .from('households')
        .select('id,name')
        .eq('wedding_id', wid)
        .in(
          'id',
          rows.map((w) => w.household_id),
        )
    : { data: [], error: null };
  dbError(names.error);
  return {
    rows: rows.map((w) => ({
      id: w.id,
      name: names.data!.find((h) => h.id === w.household_id)?.name ?? 'Invited household',
      body: w.body,
      createdAt: w.created_at,
    })),
    nextCursor: r.data!.length > 25 ? rows.at(-1)!.id : null,
  };
}
