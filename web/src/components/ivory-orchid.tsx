'use client';

import type { ReactNode, Ref } from 'react';
import { ArrowDown, CalendarDays, Heart, MapPin } from 'lucide-react';
import { eventText, formatDate, mapUrl, number, words, type Locale } from '@/features/invitation/content';
import type { Invitation } from '@/features/workspace/model';
import q from './ivory-orchid.module.css';

export function Orchid({ className = '' }: { className?: string }) {
  return (
    <img
      className={`${q.orchid} ${className}`}
      src="/artwork/ivory-orchid-640.webp"
      width={640}
      height={960}
      alt=""
      aria-hidden="true"
      loading="eager"
    />
  );
}

export function IvoryFolio({
  phase,
  names,
  hosts,
  recipient,
  date,
  place,
  locale,
  open,
  sealRef,
}: {
  phase: 'closed' | 'opening' | 'open';
  names: string[];
  hosts: string;
  recipient: { name: string; greeting: string } | null;
  date: string;
  place: string;
  locale: Locale;
  open: (quiet?: boolean) => void;
  sealRef: Ref<HTMLButtonElement>;
}) {
  const opened = phase !== 'closed';
  const Title = opened ? 'h1' : 'h2';
  const t = words[locale];
  return (
    <section
      className={q.folio}
      data-phase={phase}
      aria-label={!opened ? t.personal : undefined}
      aria-labelledby={opened ? 'couple-names' : undefined}
    >
      <link
        rel="preload"
        href="/fonts/ivory-cormorant-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/garden-pinyon-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/garden-galada-bengali.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <Orchid className={q.heroLeft} />
      <Orchid className={q.heroRight} />
      {opened && (
        <nav className={q.index} aria-label={locale === 'bn' ? 'আমন্ত্রণের বিভাগ' : 'Invitation sections'}>
          <a href="#events">{locale === 'bn' ? 'আয়োজন' : 'THE DETAILS'}</a>
          <a href="#moments">{locale === 'bn' ? 'মুহূর্ত' : 'OUR MOMENTS'}</a>
          <a href="#rsvp">{locale === 'bn' ? 'আপনার উত্তর' : 'RSVP'}</a>
        </nav>
      )}
      <div className={q.heroCopy}>
        <span className={q.eyebrow}>{locale === 'bn' ? 'শুভ পরিণয়' : 'SAVE THE DATE'}</span>
        <Title
          id={opened ? 'couple-names' : undefined}
          tabIndex={opened ? -1 : undefined}
          className={q.names}
          data-long={names.some((name) => name.length > 18)}
        >
          <span>{names[0]}</span>
          <i>&</i>
          <span>{names[1]}</span>
        </Title>
        <span className={q.hairline} aria-hidden="true" />
        <time className={q.heroDate} dateTime={date}>
          {formatDate(date, locale)}
        </time>
        <p className={q.place}>{place}</p>
        <p className={q.hosts}>{hosts}</p>
        {opened ? (
          <a href="#rsvp" className={q.inviteButton}>
            {locale === 'bn' ? 'আপনার উত্তর' : 'KINDLY RSVP'} <ArrowDown size={15} />
          </a>
        ) : (
          <>
            <p className={q.recipient}>{recipient?.name ?? t.forYou}</p>
            <button ref={sealRef} className={q.inviteButton} onClick={() => open()} aria-label={t.open}>
              {t.open}
              <ArrowDown size={15} />
            </button>
          </>
        )}
      </div>
      <div className={q.scenery} aria-hidden="true">
        <img
          src="/artwork/ivory-lake-1536.webp"
          srcSet="/artwork/ivory-lake-768.webp 768w, /artwork/ivory-lake-1536.webp 1536w"
          sizes="(max-width: 900px) 100vw, 900px"
          width={1536}
          height={1024}
          alt=""
          fetchPriority="high"
        />
      </div>
      <span className={q.sideNote} aria-hidden="true">
        {locale === 'bn' ? 'একসঙ্গে,\nনতুন পথে' : 'A beautiful\nnew beginning'}
      </span>
    </section>
  );
}

export function IvoryWelcome({
  locale,
  names,
  message,
  messageLang,
  personalNote,
  greeting,
}: {
  locale: Locale;
  names: string[];
  message: string;
  messageLang: Locale;
  personalNote?: string;
  greeting?: string;
}) {
  return (
    <section id="welcome" className={q.welcome} tabIndex={-1}>
      <span className={q.eyebrow}>{locale === 'bn' ? 'ভালোবাসার নিমন্ত্রণ' : 'WITH OUR FAMILIES'}</span>
      <h2>{locale === 'bn' ? 'সাদর আমন্ত্রণ' : 'Together is a beautiful place to be'}</h2>
      {greeting && <p className={q.greeting}>{greeting}</p>}
      <p className={q.message} lang={messageLang}>
        {message}
      </p>
      {personalNote && <blockquote>{personalNote}</blockquote>}
      <p className={q.signoff}>{names.join(locale === 'bn' ? ' ও ' : ' & ')}</p>
      <span className={q.hairline} aria-hidden="true" />
    </section>
  );
}

export function IvoryDate({
  event,
  locale,
  children,
}: {
  event: Invitation['events'][number];
  locale: Locale;
  children: ReactNode;
}) {
  const text = eventText(event, locale);
  return (
    <section className={q.details} aria-label={locale === 'bn' ? 'দিন ও স্থান' : 'The details'}>
      <h2 className={q.eyebrow}>{locale === 'bn' ? 'আমাদের আয়োজন' : 'THE DETAILS'}</h2>
      <div className={q.detailGrid}>
        <div>
          <CalendarDays size={27} strokeWidth={1} />
          <h3>{locale === 'bn' ? 'তারিখ' : 'DATE'}</h3>
          <time dateTime={event.date}>{formatDate(event.date, locale)}</time>
        </div>
        <div>
          <MapPin size={27} strokeWidth={1} />
          <h3>{locale === 'bn' ? 'স্থান' : 'VENUE'}</h3>
          <p>{text.venue}</p>
          <small>{text.address}</small>
          <a href={mapUrl(event)} target="_blank" rel="noopener noreferrer">
            {locale === 'bn' ? 'ম্যাপে দেখুন' : 'View map'} ↗
          </a>
        </div>
        <div>
          <Heart size={27} strokeWidth={1} />
          <h3>{locale === 'bn' ? 'অনুষ্ঠান' : 'CELEBRATION'}</h3>
          <p>{text.title}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function IvoryPhotographs({
  photos,
  locale,
  failed,
  onFailure,
  onOpen,
}: {
  photos: NonNullable<Invitation['photos']>;
  locale: Locale;
  failed: string[];
  onFailure: (src: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className={q.photographs}>
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          className={q.photograph}
          onClick={() => onOpen(photo.id)}
          aria-label={`${words[locale].photoOpen} ${index + 1}`}
        >
          {failed.includes(photo.src) ? (
            <span className={q.photoMissing}>{words[locale].photoMissing}</span>
          ) : (
            <img
              src={photo.src}
              srcSet={photo.responsiveSrcSet}
              sizes="(max-width: 480px) 43vw, 340px"
              width={640}
              height={800}
              loading="lazy"
              alt={locale === 'bn' ? photo.altBn || photo.alt : photo.alt}
              style={{ objectPosition: photo.position || 'center' }}
              onError={() => onFailure(photo.src)}
            />
          )}
          <span className={q.photoNumber}>
            {number(index + 1, locale, 2)} <i>↗</i>
          </span>
        </button>
      ))}
    </div>
  );
}
