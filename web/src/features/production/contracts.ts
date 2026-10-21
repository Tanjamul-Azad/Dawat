import { z } from 'zod';
import { mediaPhoto } from './media';
import { meaningfulText } from './text';

export const uuid = z.uuid();
const text = (max: number) => z.string().max(max);
export const productionEvent = z
  .object({
    id: z.enum(['nikah', 'reception']),
    title: text(160),
    titleBn: text(160).optional(),
    date: text(10),
    time: text(5),
    venue: text(200),
    venueBn: text(200).optional(),
    address: text(500),
    addressBn: text(500).optional(),
  })
  .strict();
export const draftContent = z
  .object({
    partnerOne: text(120),
    partnerTwo: text(120),
    partnerOneBn: text(120).optional(),
    partnerTwoBn: text(120).optional(),
    hosts: text(300),
    hostsBn: text(300).optional(),
    message: text(2000),
    messageEn: text(2000).optional(),
    theme: z.literal('jamdani'),
    photos: z
      .array(mediaPhoto)
      .max(5)
      .refine((ps) => new Set(ps.map((p) => p.id)).size === ps.length, 'Choose distinct photos.'),
    generalEventIds: z
      .array(z.enum(['nikah', 'reception']))
      .max(2)
      .default([]),
    events: z
      .array(productionEvent)
      .min(1)
      .max(2)
      .refine((es) => new Set(es.map((e) => e.id)).size === es.length, 'Celebrations must be unique.'),
    rsvpClosesAt: z.iso.datetime().optional(),
  })
  .strict();
export type DraftContent = z.infer<typeof draftContent>;
export function emptyDraft(): DraftContent {
  return {
    partnerOne: '',
    partnerTwo: '',
    hosts: '',
    message: '',
    theme: 'jamdani',
    photos: [],
    generalEventIds: [],
    events: [
      { id: 'nikah', title: 'আকদ', titleBn: 'আকদ', date: '', time: '', venue: '', address: '' },
      {
        id: 'reception',
        title: 'বিবাহোত্তর সংবর্ধনা',
        titleBn: 'বিবাহোত্তর সংবর্ধনা',
        date: '',
        time: '',
        venue: '',
        address: '',
      },
    ],
  };
}
export function publicationIssues(c: DraftContent): string[] {
  const errors: string[] = [];
  if (!meaningfulText(c.partnerOne) || !meaningfulText(c.partnerTwo)) errors.push('Add both names.');
  for (const e of c.events) {
    const date = new Date(`${e.date}T00:00:00Z`);
    if (
      !meaningfulText(e.title) ||
      !meaningfulText(e.venue) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== e.date ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)
    ) {
      errors.push(`Complete ${e.id}: title, date, time and venue.`);
    }
  }
  return errors;
}
const reason = z.string().trim().min(10).max(1000);
const updateOrder = { orderId: uuid, expectedRevision: z.number().int().nonnegative(), reason };
export const sellerCommand = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('create'),
      email: z
        .email()
        .max(254)
        .transform((e) => e.trim().toLowerCase()),
      name: z.string().trim().min(1).max(120),
      packageName: z.string().trim().min(1).max(160),
      amountMinor: z.number().int().min(0).max(1000000000),
      termDays: z.number().int().min(1).max(3650),
    })
    .strict(),
  z
    .object({
      kind: z.literal('verify-payment'),
      ...updateOrder,
      method: z.string().trim().min(1).max(80),
      reference: z.string().trim().min(3).max(160),
      amountMinor: z.number().int().min(0).max(1000000000),
    })
    .strict(),
  z
    .object({ kind: z.literal('confirm'), ...updateOrder, exception: z.literal('approved').optional() })
    .strict(),
  z.object({ kind: z.literal('activate'), ...updateOrder }).strict(),
  z.object({ kind: z.literal('suspend'), ...updateOrder }).strict(),
  z.object({ kind: z.literal('revoke'), ...updateOrder }).strict(),
]);
export type SellerCommand = z.infer<typeof sellerCommand>;
export type WeddingSummary = {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  state: string;
  publication_revision: number;
};
export type WeddingDetail = {
  workspaceUrl?: string;
  generalInvitationUrl?: string | null;
  publishedGeneralEventIds?: ('nikah' | 'reception')[];
  protectedEventIds?: ('nikah' | 'reception')[];
  mediaAvailable?: boolean;
  wedding: WeddingSummary;
  content: DraftContent;
  revision: number;
  updatedAt: string;
  expiresAt: string | null;
  termDays: number;
  publishedDraftRevision: number | null;
};
export type SellerOrder = {
  id: string;
  customer_email: string;
  customer_name: string;
  package_name: string;
  amount_minor: number;
  currency: string;
  term_days: number;
  status: string;
  payment_status: string;
  exception_reason: string | null;
  revision: number;
  created_at: string;
  weddingId: string | null;
  access: string;
};
