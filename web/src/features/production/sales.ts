import { z } from 'zod';
import { uuid } from './contracts';
import { templateIds } from './catalog';
import { manualPayment, orderPaymentReference } from './payment';

const identity = { id: uuid, expectedRevision: z.number().int().min(0) };
export const salesCommand = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('request'),
    templateId: z.enum([...templateIds, 'custom']),
    name: z.string().trim().min(1).max(120),
    brief: z.string().trim().min(10).max(2000),
    eventDate: z.union([z.literal(''), z.iso.date()]),
  }),
  z.object({
    kind: z.literal('quote'),
    ...identity,
    packageName: z.string().trim().min(1).max(160),
    amountMinor: z.number().int().min(0).max(1000000000),
    termDays: z.number().int().min(1).max(3650),
    notes: z.string().trim().min(10).max(3000),
  }),
  z.object({ kind: z.enum(['accept', 'cancel', 'convert']), ...identity }),
]);
export type SalesCommand = z.infer<typeof salesCommand>;
export type SalesRequest = {
  id: string;
  user_id: string;
  customer_email: string;
  customer_name: string;
  template_id: (typeof templateIds)[number] | 'custom';
  event_date: string | null;
  brief: string;
  state: 'requested' | 'quoted' | 'accepted' | 'ordered' | 'cancelled';
  package_name: string | null;
  amount_minor: number | null;
  term_days: number | null;
  quote_notes: string | null;
  order_id: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
};
export type SalesProgress = {
  requestId: string;
  status: string;
  paymentStatus: string;
  access: string | null;
  weddingId: string | null;
};
export type PaymentSubmission = {
  id: string;
  request_id: string;
  method: string;
  reference: string;
  sender: string;
  amount_minor: number;
  state: 'pending' | 'verified' | 'rejected';
  review_note: string;
  created_at: string;
};
export const paymentCommand = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('submit'),
      requestId: uuid,
      method: z.literal(manualPayment.method),
      reference: z.string().trim().min(3).max(80),
      sender: z.string().trim().min(5).max(80),
    })
    .refine((value) => value.reference.toUpperCase() !== orderPaymentReference(value.requestId), {
      path: ['reference'],
      message: 'Enter the bKash transaction ID from your successful transfer, not the order reference.',
    }),
  z.object({ kind: z.enum(['verify', 'reject']), id: uuid, reason: z.string().trim().min(10).max(1000) }),
]);
export type PaymentCommand = z.infer<typeof paymentCommand>;
export type SalesPage = {
  requests: SalesRequest[];
  progress: SalesProgress[];
  payments: PaymentSubmission[];
  nextCursor: string | null;
};
