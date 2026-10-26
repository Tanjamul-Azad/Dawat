import { z } from 'zod';
import { templateIds } from '../production/catalog';

const eventSchema = z.object({
  id: z.enum(['nikah', 'reception']),
  title: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(`${value}T00:00:00Z`);
      return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, 'Choose a valid event date.'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  venue: z.string().trim().min(1).max(200),
  address: z.string().max(500),
  titleBn: z.string().max(160).optional(),
  venueBn: z.string().max(200).optional(),
  addressBn: z.string().max(500).optional(),
});
export const photoSchema = z.object({
  id: z.string().min(1),
  src: z
    .string()
    .refine(
      (value) =>
        /^\/artwork\/[a-zA-Z0-9._-]+$/.test(value) ||
        /^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
      'Choose a supported local photo.',
    )
    .max(900000),
  alt: z.string().max(300),
  thumbnailSrc: z.string().optional(),
  fullSrc: z.string().optional(),
  responsiveSrcSet: z.string().optional(),
  altBn: z.string().max(300).optional(),
  position: z.enum(['center', 'top', 'bottom']).optional(),
});
export const invitationSchema = z.object({
  partnerOne: z.string().trim().min(1, 'Add the first name').max(120),
  partnerTwo: z.string().trim().min(1, 'Add the second name').max(120),
  hosts: z.string().max(300),
  message: z.string().max(2000),
  partnerOneBn: z.string().max(120).optional(),
  partnerTwoBn: z.string().max(120).optional(),
  hostsBn: z.string().max(300).optional(),
  messageEn: z.string().max(2000).optional(),
  photos: z.array(photoSchema).max(5).optional(),
  rsvpClosesAt: z.iso.datetime().optional(),
  theme: z.enum(['jamdani', 'garden', 'holud']),
  templateId: z.enum(templateIds).optional(),
  events: z.array(eventSchema).length(2),
});
const answerSchema = z.object({
  attendance: z.enum(['accepted', 'declined']),
  adults: z.number().int().min(0),
  children: z.number().int().min(0),
  note: z.string().max(1000),
  updatedAt: z.string(),
});
export const guestSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(120),
  nameBn: z.string().trim().max(120).optional(),
  greeting: z.string().max(300),
  greetingEn: z.string().trim().max(300).optional(),
  message: z.string().max(500),
  messageEn: z.string().trim().max(500).optional(),
  allowance: z.number().int().min(1).max(20),
  events: z.array(z.enum(['nikah', 'reception'])).min(1),
  responses: z.record(z.string(), answerSchema),
});
const orderSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  submittedAt: z.string(),
  confirmedAt: z.string().nullable(),
  activatedAt: z.string().nullable(),
  revokedAt: z.string().nullable().default(null),
  invitation: invitationSchema,
});
export const workspaceSchema = z.object({
  version: z.literal(1),
  draft: invitationSchema,
  published: invitationSchema.nullable(),
  order: orderSchema.nullable().default(null),
  guests: z.array(guestSchema).max(1000),
  wishes: z.array(
    z.object({ id: z.string(), name: z.string(), body: z.string().min(1).max(1000), createdAt: z.string() }),
  ),
});
export type Invitation = z.infer<typeof invitationSchema>;
export type Guest = z.infer<typeof guestSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type Attendance = 'accepted' | 'declined' | 'pending';
export type Theme = Invitation['theme'];

export const themes: { id: Theme; title: string; subtitle: string; category: string }[] = [
  {
    id: 'jamdani',
    title: 'Jamdani Ivory',
    subtitle: 'Woven with a little nostalgia.',
    category: 'Heritage · Paper & wine',
  },
  {
    id: 'garden',
    title: 'Sage & Rose',
    subtitle: 'A love story, in full bloom.',
    category: 'Botanical · Sage & rose',
  },
  {
    id: 'holud',
    title: 'Marigold & Brass',
    subtitle: 'For the brightest kind of joy.',
    category: 'Celebration · Marigold',
  },
];

const initial: Invitation = {
  partnerOne: 'Mehrin',
  partnerTwo: 'Arib',
  partnerOneBn: 'মেহরিন',
  partnerTwoBn: 'আরিব',
  hosts: 'Together with our families',
  hostsBn: 'দুই পরিবারের ভালোবাসায়',
  messageEn:
    'With full hearts, we invite you to share the joy of our new beginning. Your presence will be our most cherished gift.',
  photos: [
    {
      id: 'portrait',
      src: '/artwork/jamdani-couple-v1.webp',
      alt: 'Fictional Bengali couple together in a sunlit courtyard',
      altBn: 'রোদছায়া উঠানে কাল্পনিক এক বাঙালি যুগল',
      position: 'center',
    },
    {
      id: 'detail',
      src: '/artwork/jamdani-hands-v1.webp',
      alt: 'Joined hands, jasmine and woven wedding textiles',
      altBn: 'হাতে হাত, জুঁই ফুল আর জামদানি বুনন',
      position: 'center',
    },
  ],
  message: 'আমাদের নতুন পথচলার আনন্দে আপনাদের সাদর আমন্ত্রণ। আপনাদের উপস্থিতিই আমাদের সবচেয়ে সুন্দর উপহার।',
  theme: 'jamdani',
  events: [
    {
      id: 'nikah',
      title: 'The Nikah',
      titleBn: 'আকদ',
      date: '2026-12-11',
      time: '16:30',
      venue: 'The Garden Pavilion',
      address: 'Gulshan, Dhaka',
      venueBn: 'দ্য গার্ডেন প্যাভিলিয়ন',
      addressBn: 'গুলশান, ঢাকা',
    },
    {
      id: 'reception',
      title: 'The Reception',
      titleBn: 'বিবাহোত্তর সংবর্ধনা',
      date: '2026-12-12',
      time: '19:00',
      venue: 'The Grand Courtyard',
      address: 'Banani, Dhaka',
      venueBn: 'দ্য গ্র্যান্ড কোর্টইয়ার্ড',
      addressBn: 'বনানী, ঢাকা',
    },
  ],
};
const accepted = (adults: number, children = 0) => ({
  attendance: 'accepted' as const,
  adults,
  children,
  note: '',
  updatedAt: '2026-10-19T06:00:00Z',
});
export function createWorkspace(): Workspace {
  const guest = (id: string, name: string, allowance: number, responses: Guest['responses'] = {}): Guest => ({
    id,
    name,
    allowance,
    responses,
    greeting: `প্রিয় ${name}`,
    message: '',
    events: ['nikah', 'reception'],
  });
  return {
    version: 1,
    draft: structuredClone(initial),
    published: structuredClone(initial),
    order: null,
    guests: [
      guest('demo-rahman', 'Rahman Family', 5, { reception: accepted(4, 1) }),
      guest('demo-nabila', 'Nabila & Family', 4, { reception: accepted(2, 1) }),
      guest('demo-sadia', 'Sadia Ahmed', 2, {
        reception: {
          attendance: 'declined',
          adults: 0,
          children: 0,
          note: 'Wishing you both so much happiness! We will be out of town.',
          updatedAt: '2026-10-18T12:00:00Z',
        },
      }),
      {
        ...guest('demo-sabbir', 'Sabbir & Family', 4),
        nameBn: 'সাব্বির ও পরিবার',
        greeting: 'প্রিয় সাব্বির ও পরিবার',
        greetingEn: 'Dear Sabbir & Family',
      },
      guest('demo-isha', 'Isha & Tanvir', 2, { reception: accepted(2) }),
      guest('demo-maliha', 'Maliha Rahman', 1),
      guest('demo-rifat', 'Rifat & Family', 4, { reception: accepted(3, 1) }),
      guest('demo-anika', 'Anika & Family', 3),
    ],
    wishes: [
      {
        id: 'wish-demo',
        name: 'Nabila & Family',
        body: 'তোমাদের নতুন জীবন ভরে উঠুক ভালোবাসা আর আনন্দে। অনেক শুভকামনা! 🤍',
        createdAt: '2026-10-19T06:00:00Z',
      },
    ],
  };
}

export function attendance(guest: Guest, event: string): Attendance {
  return guest.responses[event]?.attendance ?? 'pending';
}
// UX simulation only. Production must enforce grants on the server and database.
export function hasDashboardAccess(workspace: Workspace) {
  return Boolean(workspace.order?.confirmedAt && workspace.order?.activatedAt && !workspace.order?.revokedAt);
}
export function confirmOrder(workspace: Workspace, now: string): Workspace {
  if (!workspace.order) throw new Error('Submit an order before confirmation.');
  return { ...workspace, order: { ...workspace.order, confirmedAt: workspace.order.confirmedAt ?? now } };
}
export function activateDashboard(workspace: Workspace, now: string): Workspace {
  if (!workspace.order?.confirmedAt) throw new Error('Confirm the order before activating access.');
  if (workspace.order.activatedAt) return { ...workspace, order: { ...workspace.order, revokedAt: null } };
  return {
    ...workspace,
    draft: structuredClone(workspace.order.invitation),
    published: null,
    guests: [],
    wishes: [],
    order: { ...workspace.order, activatedAt: now, revokedAt: null },
  };
}
export function summarize(guests: Guest[], event: string) {
  return guests
    .filter((g) => g.events.includes(event as 'nikah' | 'reception'))
    .reduce(
      (s, g) => {
        const response = g.responses[event];
        if (!response) s.pending++;
        else if (response.attendance === 'declined') s.declined++;
        else {
          s.accepted++;
          s.adults += response.adults;
          s.children += response.children;
        }
        s.invited++;
        return s;
      },
      { accepted: 0, declined: 0, pending: 0, adults: 0, children: 0, invited: 0 },
    );
}
export function validateResponse(
  guest: Guest,
  event: string,
  answer: { attendance: 'accepted' | 'declined'; adults: number; children: number },
) {
  if (!guest.events.includes(event as 'nikah' | 'reception'))
    throw new Error('This event is not included in your invitation.');
  const { adults, children } = answer;
  if (![adults, children].every((n) => Number.isInteger(n) && n >= 0))
    throw new Error('Please enter whole numbers of guests.');
  if (answer.attendance === 'declined' && adults + children !== 0)
    throw new Error('A declined response must have zero guests.');
  if (answer.attendance === 'accepted' && (adults + children < 1 || adults + children > guest.allowance))
    throw new Error(`Please confirm between 1 and ${guest.allowance} people, including yourself.`);
}
export function dateLabel(date: string, options?: Intl.DateTimeFormatOptions) {
  const value = new Date(`${date}T12:00:00+06:00`);
  return Number.isNaN(value.getTime())
    ? 'Date to be announced'
    : new Intl.DateTimeFormat('en-GB', options ?? { day: 'numeric', month: 'long', year: 'numeric' }).format(
        value,
      );
}
export function timeLabel(time: string) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
export function csvCell(value: string | number) {
  const text = String(value);
  return `"${(/^[=+@\-\t\r\n]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`;
}
export function download(name: string, data: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
