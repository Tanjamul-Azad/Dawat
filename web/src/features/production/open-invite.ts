import { z } from 'zod';
import { phoneInput } from './delivery';
import { draftContent } from './contracts';
export const openInviteInput = z.object({
  expectedRevision: z.number().int().nonnegative(), enabled: z.boolean(), rotate: z.boolean(),
  eventIds: z.array(z.enum(['nikah', 'reception'])).min(1).max(2).refine(ids => new Set(ids).size === ids.length),
  maxPeople: z.number().int().min(1).max(20), greetingBn: z.string().trim().min(1).max(300), greetingEn: z.string().trim().min(1).max(300), askPhone: z.boolean(),
}).strict();
export type OpenInviteSettings = Omit<z.infer<typeof openInviteInput>, 'expectedRevision' | 'rotate'> & { revision: number; url: string | null };
export const joinOpenInput = z.object({ name: z.string().trim().max(120).refine(s => !/[\u0000-\u001f\u007f]/.test(s), 'Enter your name without control characters.'), phone: phoneInput, website: z.string().max(0, 'Leave the website field empty.') }).strict();
export const openInvitationPayload = z.object({ weddingId: z.uuid(), content: draftContent, greetingBn: z.string(), greetingEn: z.string(), askPhone: z.boolean(), householdId: z.uuid().nullable() });
export type OpenInvitationPayload = z.infer<typeof openInvitationPayload>;
