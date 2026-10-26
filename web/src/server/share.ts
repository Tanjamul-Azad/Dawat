import 'server-only';
import { cache } from 'react';
import { uuid } from '@/features/production/contracts';
import { invitationShare, type InvitationShare } from '@/features/production/share';
import { backendConfigured } from './config';
import { database } from './supabase';

/** Live, entitled general publication with general-visible events only (PT404 otherwise). */
export const resolveGeneralInvitation = cache(async (slug: string) => {
  const db = await database();
  return db.rpc('resolve_general_invitation', { p_slug: slug });
});

/**
 * Link-preview data for a slug, from the published general invitation only. Unpublished,
 * paused, expired, household-only or unavailable invitations return null (generic preview).
 * Never reads household or guest-credential data.
 */
export async function publishedShare(slug: string): Promise<InvitationShare | null> {
  if (!backendConfigured() || !uuid.safeParse(slug).success) return null;
  try {
    const r = await resolveGeneralInvitation(slug);
    return r.error ? null : invitationShare(r.data);
  } catch {
    return null;
  }
}
