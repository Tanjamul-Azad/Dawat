import { z } from 'zod';
import { normalizePhone } from './phone';
export const phoneInput = z.string().max(80).nullable().optional().transform((value, ctx) => {
  if (value === undefined) return undefined;
  try { return normalizePhone(value); }
  catch (error) { ctx.addIssue({ code: 'custom', message: (error as Error).message }); return z.NEVER; }
}).optional();
export const inviteSettingsInput = z.object({
  expectedRevision: z.number().int().nonnegative(),
  hostWhatsapp: phoneInput,
  showHostWhatsapp: z.boolean(),
  messageBn: z.string().max(600),
  messageEn: z.string().max(600),
}).strict();
export type InviteSettings = { revision: number; hostWhatsapp: string | null; showHostWhatsapp: boolean; messageBn: string; messageEn: string; couple: string };
export const deliveryInput = z.object({ channel: z.enum(['whatsapp', 'share', 'copy']), linkRevision: z.number().int().positive() }).strict();
