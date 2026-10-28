import 'server-only';
import type { InviteSettings } from '@/features/production/delivery';
import { session } from './auth';
import { dbError, HttpError } from './http';
export async function getInviteSettings(wid: string): Promise<InviteSettings> {
  const { db } = await session();
  const r = await db.from('weddings').select('host_whatsapp,show_host_whatsapp,invite_message_bn,invite_message_en,invite_settings_revision,invitation_drafts(content)').eq('id', wid).maybeSingle();
  dbError(r.error);
  if (!r.data) throw new HttpError(404, 'UNAVAILABLE', 'Workspace unavailable.');
  const c = r.data.invitation_drafts?.content as Record<string, unknown> | undefined;
  return { revision: r.data.invite_settings_revision, hostWhatsapp: r.data.host_whatsapp, showHostWhatsapp: r.data.show_host_whatsapp, messageBn: r.data.invite_message_bn, messageEn: r.data.invite_message_en, couple: [c?.partnerOne, c?.partnerTwo].filter(Boolean).join(' & ') };
}
