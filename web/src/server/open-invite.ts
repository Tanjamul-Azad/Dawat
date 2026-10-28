import 'server-only';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { openInvitationPayload, type OpenInviteSettings, type openInviteInput, type joinOpenInput } from '@/features/production/open-invite';
import { database } from './supabase';
import { session } from './auth';
import { config } from './config';
import { dbError } from './http';
import { decryptLink, derivedSecret, digest, encryptLink, secret } from './guest-crypto';
import { guestPath } from './guests';
const stored = z.object({ wedding_id: z.uuid(), enabled: z.boolean(), ciphertext: z.string(), key_id: z.string(), revision: z.number(), event_ids: z.array(z.enum(['nikah', 'reception'])), max_people: z.number(), greeting_bn: z.string(), greeting_en: z.string(), ask_phone: z.boolean() });
function settings(data: unknown, slug: string): OpenInviteSettings {
  const o = stored.parse(data);
  const token = decryptLink(o.ciphertext, o.key_id, o.wedding_id, o.wedding_id, 'open-invite');
  return { enabled: o.enabled, revision: o.revision, url: `${config().origin}/i/${slug}/o/${token}/`, eventIds: o.event_ids, maxPeople: o.max_people, greetingBn: o.greeting_bn, greetingEn: o.greeting_en, askPhone: o.ask_phone };
}
export async function getOpenInvite(wid: string): Promise<OpenInviteSettings> {
  const { db } = await session();
  const r = await db.rpc('open_invite_link', { p_wedding_id: wid });
  dbError(r.error);
  if (!r.data) return { enabled: false, revision: 0, url: null, eventIds: [], maxPeople: 5, greetingBn: 'প্রিয় অতিথি', greetingEn: 'Dear guest', askPhone: true };
  const w = await db.from('weddings').select('slug').eq('id', wid).single();
  dbError(w.error);
  return settings(r.data, w.data!.slug);
}
export async function setOpenInvite(wid: string, input: z.infer<typeof openInviteInput>, key: string) {
  const { db } = await session();
  const token = secret();
  const encrypted = encryptLink(token, wid, wid, 'open-invite');
  const r = await db.rpc('set_open_invite', { p_key: key, p_wedding_id: wid, p_body: input, p_digest: digest(token), p_ciphertext: encrypted.ciphertext, p_key_id: encrypted.keyId });
  dbError(r.error);
  return getOpenInvite(wid);
}
export async function resolveOpenInvitation(slug: string, token: string) {
  const raw = (await cookies()).get('dawat_open_device')?.value;
  const db = await database();
  const r = await db.rpc('resolve_open_invitation', { p_slug: slug, p_open_digest: digest(token), p_device_digest: raw && /^[A-Za-z0-9_-]{43}$/.test(raw) ? digest(raw) : undefined });
  dbError(r.error);
  return openInvitationPayload.parse(r.data);
}
export async function joinOpenInvitation(slug: string, token: string, input: z.infer<typeof joinOpenInput>, headers: Headers) {
  const jar = await cookies();
  const existing = jar.get('dawat_open_device')?.value;
  const device = existing && /^[A-Za-z0-9_-]{43}$/.test(existing) ? existing : secret();
  const secure = config().origin.startsWith('https://');
  const ip = headers.get('x-nf-client-connection-ip')?.trim() || headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const salt = process.env.OPEN_INVITE_IP_SALT || derivedSecret('open-invite-ip-salt');
  const rawSession = secret();
  const linkToken = secret();
  const hid = crypto.randomUUID();
  // SQL needs the proposed household id so the normal personal-link AAD can bind to it.
  const db = await database();
  const resolved = await db.rpc('resolve_open_invitation', { p_slug: slug, p_open_digest: digest(token), p_device_digest: digest(device) });
  dbError(resolved.error);
  const preview = openInvitationPayload.parse(resolved.data);
  const wid = preview.weddingId;
  const encrypted = encryptLink(linkToken, wid, hid);
  const r = await db.rpc('join_open_invitation', { p_slug: slug, p_open_digest: digest(token), p_device_digest: digest(device), p_ip_digest: digest(salt + ip), p_name: input.name, p_phone: preview.askPhone ? input.phone ?? '' : '', p_session_digest: digest(rawSession), p_link_digest: digest(linkToken), p_link_ciphertext: encrypted.ciphertext, p_link_key_id: encrypted.keyId, p_household_id: hid });
  dbError(r.error);
  const value = z.object({ householdId: z.uuid(), expiresIn: z.number().int().positive() }).parse(r.data);
  const path = guestPath(slug, value.householdId);
  jar.set('dawat_open_device', device, { httpOnly: true, secure, sameSite: 'lax', path: `/i/${slug}/`, maxAge: 365 * 86400 });
  jar.set('dawat_guest', rawSession, { httpOnly: true, secure, sameSite: 'lax', path, maxAge: value.expiresIn });
  return path;
}
