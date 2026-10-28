import { z } from 'zod';
import { draftContent, uuid } from './contracts';
import { phoneInput } from './delivery';
const plain = (max: number) => z.string().max(max);
const meaningful = (s: string) =>
  s.replace(/[\s\u0000-\u001f\u007f\u200b\u200c\u200d\ufeff]/g, '').length > 0;
export const householdInput = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .refine(meaningful, 'Enter a guest or family name.')
      .refine((s) => !/[\u0000-\u001f\u007f]/.test(s), 'Names cannot contain control characters.'),
    nameBn: plain(120),
    contactPhone: phoneInput,
    greeting: plain(300),
    greetingEn: plain(300),
    message: plain(500),
    messageEn: plain(500),
    privateNote: plain(1000),
    events: z
      .array(
        z
          .object({ eventId: z.enum(['nikah', 'reception']), maxPeople: z.number().int().min(1).max(50) })
          .strict(),
      )
      .min(1)
      .max(2)
      .refine((es) => new Set(es.map((e) => e.eventId)).size === es.length, 'Choose distinct celebrations.'),
  })
  .strict();
export type HouseholdInput = z.infer<typeof householdInput>;
export const answerInput = z
  .object({
    eventId: z.enum(['nikah', 'reception']),
    attendance: z.enum(['accepted', 'declined']),
    adults: z.number().int().min(0).max(50),
    children: z.number().int().min(0).max(50),
    note: plain(1000),
  })
  .strict();
export const guestCommand = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('response'),
      expectedPolicyRevision: z.number().int().nonnegative(),
      expectedHouseholdRevision: z.number().int().positive(),
      expectedResponseRevision: z.number().int().nonnegative(),
      answers: z
        .array(answerInput)
        .min(1)
        .max(2)
        .refine((es) => new Set(es.map((e) => e.eventId)).size === es.length),
    })
    .strict(),
  z
    .object({
      kind: z.literal('wish'),
      body: z.string().trim().min(1).max(1000).refine(meaningful, 'Write a wish before sending.'),
    })
    .strict(),
]);
const answer = z.object({
  attendance: z.enum(['accepted', 'declined']),
  adults: z.number().int(),
  children: z.number().int(),
  note: z.string(),
  updatedAt: z.string(),
});
export const guestPayload = z
  .object({
    content: draftContent,
    guest: z
      .object({
        id: uuid,
        name: z.string(),
        nameBn: z.string(),
        greeting: z.string(),
        greetingEn: z.string(),
        message: z.string(),
        messageEn: z.string(),
        responses: z.record(z.string(), answer),
      })
      .strict(),
    scopes: z.array(z.object({ eventId: z.enum(['nikah', 'reception']), maxPeople: z.number().int() })),
    policies: z.array(
      z.object({
        eventId: z.enum(['nikah', 'reception']),
        isOpen: z.boolean(),
        deadline: z.string().nullable(),
      }),
    ),
    householdRevision: z.number().int(),
    responseRevision: z.number().int(),
    policyRevision: z.number().int(),
    hostWhatsapp: z.string().optional(),
  })
  .strict();
export type GuestPayload = z.infer<typeof guestPayload>;
export type HouseholdRow = HouseholdInput & {
  id: string;
  revision: number;
  responseRevision: number;
  linkRevision: number;
  linkState: 'missing' | 'active' | 'revoked';
  lastDelivery?: { channel: 'whatsapp' | 'share' | 'copy'; at: string; linkRevision: number } | null;
  firstOpenedAt?: string | null;
  source?: 'host' | 'open';
  hidden?: boolean;
  duplicateOf?: string | null;
  responses: GuestPayload['guest']['responses'];
};
export type HouseholdReport = {
  rows: HouseholdRow[];
  nextCursor: string | null;
  summary: {
    invited: number;
    accepted: number;
    declined: number;
    pending: number;
    adults: number;
    children: number;
    sent?: number;
    opened?: number;
    replied?: number;
    openCount?: number;
    hostCount?: number;
  };
  asOf: string;
  policyRevision: number;
  policies: GuestPayload['policies'];
};
export type WishRow = { id: string; name: string; body: string; createdAt: string };
export const correctionInput = z
  .object({
    expectedResponseRevision: z.number().int().nonnegative(),
    expectedHouseholdRevision: z.number().int().positive(),
    expectedPolicyRevision: z.number().int().nonnegative(),
    answer: answerInput,
    reason: z.string().trim().min(10).max(1000).refine(meaningful),
    overrideClosed: z.boolean(),
  })
  .strict();
export type ResponseCorrection = z.infer<typeof correctionInput>;
export type ResponseHistory = {
  id: string;
  event_id: string;
  source: string;
  reason: string;
  override_closed: boolean;
  created_at: string;
  previous: unknown;
  current_value: unknown;
};
