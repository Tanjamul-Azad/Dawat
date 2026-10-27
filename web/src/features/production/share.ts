import type { Metadata } from 'next';
import { findTemplate, templateIds, type TemplateId } from './catalog';
import { draftContent } from './contracts';

// Link previews (WhatsApp, Messenger, Facebook). Public, crawler-visible data only:
// never household names, guest tokens, household ids or unpublished draft content.
export const siteName = 'দাওয়াত';
export const shareImageSize = { width: 1200, height: 630 } as const;
export const shareVariants = ['dawat', ...templateIds] as const;
export type ShareVariant = (typeof shareVariants)[number];
export const shareImagePath = (variant: ShareVariant) => `/og/${variant}.jpg`;
export const invitationImagePath = (slug: string) => `/i/${slug}/og.jpg`;

export function appOrigin(value = process.env.APP_ORIGIN) {
  try {
    if (value) return new URL(new URL(value).origin);
  } catch {
    /* An invalid origin is reported by config(); previews fall back to loopback. */
  }
  return new URL('http://127.0.0.1:3000');
}

export function shareMetadata(input: {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  url?: string;
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  const image = { url: input.image, ...shareImageSize, alt: input.imageAlt, type: 'image/jpeg' };
  return {
    openGraph: {
      type: 'website',
      siteName,
      locale: 'bn_BD',
      title: input.title,
      description: input.description,
      images: [image],
      ...(input.url ? { url: input.url } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export const brandShare = {
  title: 'দাওয়াত — ভালোবাসার বিয়ের আমন্ত্রণ',
  description: 'আপনাদের গল্প, নাম ধরে আমন্ত্রণ ও অতিথিদের উত্তর—নিজস্ব জামদানি নকশায় বিয়ের আয়োজন।',
};

export function storefrontMetadata(input: { title: string; description: string; path: string }): Metadata {
  return {
    title: input.title,
    description: input.description,
    ...shareMetadata({
      ...input,
      url: input.path,
      image: shareImagePath('dawat'),
      imageAlt: 'দাওয়াত — ডিজিটাল বিয়ের আমন্ত্রণপত্র',
    }),
  };
}

export function templateSampleMetadata(value: unknown): Metadata {
  const t = findTemplate(value);
  const title = `${t.name} — নমুনা বিয়ের আমন্ত্রণ | ${siteName}`;
  const description = `${t.mood}। ${t.name} নকশায় আপনাদের ডিজিটাল বিয়ের আমন্ত্রণ কেমন দেখাবে, খুলে দেখুন।`;
  return {
    title,
    description,
    ...shareMetadata({
      title,
      description,
      url: `/invite/?template=${t.id}`,
      image: shareImagePath(t.id),
      imageAlt: `${t.name} নকশার বিয়ের আমন্ত্রণ`,
    }),
  };
}

export type InvitationShare = {
  names: string;
  /** Names restricted to glyphs the bundled Bengali preview font can draw; '' when not drawable. */
  imageNames: string;
  date: string;
  templateId: TemplateId;
};

// Bengali block, dandas, ZWNJ/ZWJ and space: what the Bengali-only preview font can draw.
const glyphs = '\u0980-\u09FF\u0964\u0965\u200C\u200D ';
const drawable = new RegExp(`^[${glyphs}]+$`);
/** Drops characters the preview font cannot draw (Latin, commas, emoji). */
export const drawableText = (s: string) =>
  s
    .replace(new RegExp(`[^${glyphs}]+`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim();
const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

export function bnDate(iso: string) {
  const date = new Date(`${iso}T12:00:00+06:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(iso) ||
    !Number.isFinite(date.getTime()) ||
    new Date(`${iso}T00:00:00Z`).toISOString().slice(0, 10) !== iso
  )
    return '';
  // Parts joined with spaces only: the preview font has no Latin comma.
  return new Intl.DateTimeFormat('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  })
    .formatToParts(date)
    .filter((p) => p.type !== 'literal')
    .map((p) => p.value)
    .join(' ');
}

/**
 * Allowlists couple names, the earliest general-visible date and template from the
 * general publication DTO (resolve_general_invitation). Anything else is dropped.
 */
export function invitationShare(published: unknown): InvitationShare | null {
  const parsed = draftContent.safeParse(published);
  if (!parsed.success) return null;
  const c = parsed.data;
  const one = clean(c.partnerOneBn) || clean(c.partnerOne);
  const two = clean(c.partnerTwoBn) || clean(c.partnerTwo);
  if (!one || !two) return null;
  const names = `${one} ও ${two}`;
  const dates = c.events
    .map((e) => e.date)
    .filter((d) => bnDate(d))
    .sort();
  return {
    names,
    imageNames: drawable.test(names) ? names : '',
    date: dates.length ? bnDate(dates[0]) : '',
    templateId: findTemplate(c.templateId).id,
  };
}

const generic = {
  title: 'বিয়ের আমন্ত্রণ',
  description: 'নবদম্পতি ও তাঁদের পরিবারের ভালোবাসার আমন্ত্রণ।',
};

/**
 * Guest-facing metadata. `share` must come only from the published general invitation;
 * paused, revoked, expired or unpublished invitations pass null and get generic Dawat data.
 * Personal routes never pass household data and never get an og:url (it would carry the token).
 */
export function invitationMetadata(
  slug: string,
  share: InvitationShare | null,
  route: 'general' | 'personal',
): Metadata {
  const pageTitle = route === 'personal' ? 'আপনার ব্যক্তিগত বিয়ের আমন্ত্রণ' : generic.title;
  const robots = { index: false, follow: false };
  if (!share)
    return {
      title: pageTitle,
      description: generic.description,
      robots,
      ...shareMetadata({
        ...generic,
        image: shareImagePath('dawat'),
        imageAlt: 'দাওয়াত — ডিজিটাল বিয়ের আমন্ত্রণপত্র',
      }),
    };
  const title = `${share.names} — বিয়ের আমন্ত্রণ`;
  const description = share.date
    ? `${share.date} — নবদম্পতি ও তাঁদের পরিবারের ভালোবাসার আমন্ত্রণ।`
    : generic.description;
  return {
    title: route === 'personal' ? pageTitle : title,
    description,
    robots,
    ...shareMetadata({
      title,
      description,
      image: invitationImagePath(slug),
      imageAlt: title,
      ...(route === 'general' ? { url: `/i/${slug}/` } : {}),
    }),
  };
}

/** Text drawn on a 1200×630 preview image over the variant's art. */
export type ShareCard = { variant: ShareVariant; kicker: string; title: string; subtitle?: string };

export function storefrontCard(variant: ShareVariant): ShareCard {
  if (variant === 'dawat')
    return { variant, kicker: 'শুভ বিবাহ', title: siteName, subtitle: 'ভালোবাসার ডিজিটাল বিয়ের আমন্ত্রণ' };
  const t = findTemplate(variant);
  return { variant, kicker: 'নমুনা আমন্ত্রণ', title: t.name, subtitle: t.mood };
}

export function invitationCard(share: InvitationShare | null): ShareCard {
  if (!share) return storefrontCard('dawat');
  return {
    variant: share.templateId,
    kicker: 'শুভ বিবাহ',
    title: share.imageNames || 'বিয়ের আমন্ত্রণ',
    subtitle: share.date,
  };
}
