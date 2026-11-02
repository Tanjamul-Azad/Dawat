'use client';

import { useState, type ReactNode, type Ref } from 'react';
import { Heart, Images, MapPin, ArrowRight, BookOpen } from 'lucide-react';
import {
  eventText,
  formatDate,
  formatTime,
  mapUrl,
  number,
  words,
  type Locale,
} from '@/features/invitation/content';
import type { Invitation } from '@/features/workspace/model';
import r from './reference-invitations.module.css';

export type ReferenceTemplate = 'rose' | 'jamdani' | 'holud' | 'midnight';
export function isReferenceTemplate(id: string): id is ReferenceTemplate {
  return ['rose', 'jamdani', 'holud', 'midnight'].includes(id);
}
type Photo = NonNullable<Invitation['photos']>[number];
type FolioProps = {
  variant: ReferenceTemplate;
  phase: 'closed' | 'opening' | 'open';
  names: string[];
  hosts: string;
  recipient: { name: string; greeting: string } | null;
  event: Invitation['events'][number];
  locale: Locale;
  open: (quiet?: boolean) => void;
  sealRef: Ref<HTMLButtonElement>;
  photo?: Photo;
};
function FontHints() {
  return (
    <>
      {['ivory-cormorant-latin', 'garden-pinyon-latin', 'garden-galada-bengali'].map((font) => (
        <link
          key={font}
          rel="preload"
          href={`/fonts/${font}.woff2`}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}
function Flowers({ variant, className = '' }: { variant: 'blue' | 'rose'; className?: string }) {
  return (
    <img
      src={`/artwork/reference-${variant}-640.webp`}
      width={640}
      height={427}
      className={`${r.flowers} ${className}`}
      alt=""
      aria-hidden="true"
    />
  );
}
function Names({
  names,
  opened,
  className = '',
  conjunction = '&',
}: {
  names: string[];
  opened: boolean;
  className?: string;
  conjunction?: string;
}) {
  const Title = opened ? 'h1' : 'h2';
  return (
    <Title
      id={opened ? 'couple-names' : undefined}
      tabIndex={opened ? -1 : undefined}
      className={`${r.names} ${className}`}
      data-long={names.some((n) => n.length > 18)}
    >
      <span>{names[0]}</span>
      <i>{conjunction}</i>
      <span>{names[1]}</span>
    </Title>
  );
}
function Monogram({ names }: { names: string[] }) {
  return (
    <span className={r.monogram} aria-hidden="true">
      {Array.from(names[0] ?? '')[0]}
      <i>|</i>
      {Array.from(names[1] ?? '')[0]}
    </span>
  );
}
function OpenAction({
  opened,
  open,
  sealRef,
  locale,
}: {
  opened: boolean;
  open: FolioProps['open'];
  sealRef: FolioProps['sealRef'];
  locale: Locale;
}) {
  const t = words[locale];
  return opened ? (
    <a className={r.primary} href="#rsvp">
      {locale === 'bn' ? 'আপনার উত্তর' : 'KINDLY RSVP'}
      <ArrowRight size={15} />
    </a>
  ) : (
    <div className={r.openActions}>
      <button ref={sealRef} className={r.primary} onClick={() => open()} aria-label={t.open}>
        {t.open}
        <ArrowRight size={15} />
      </button>
      <button className={r.quiet} onClick={() => open(true)}>
        {t.openQuietly}
      </button>
    </div>
  );
}
function Shortcuts({ locale, tiles = false }: { locale: Locale; tiles?: boolean }) {
  return (
    <nav
      className={`${r.shortcuts} ${tiles ? r.tiles : ''}`}
      aria-label={locale === 'bn' ? 'আমন্ত্রণের দ্রুত লিংক' : 'Quick invitation links'}
    >
      <a href="#welcome">
        <BookOpen size={21} strokeWidth={1} />
        <span>{locale === 'bn' ? 'আমন্ত্রণ' : 'OUR INVITATION'}</span>
      </a>
      <a href="#events">
        <MapPin size={21} strokeWidth={1} />
        <span>{locale === 'bn' ? 'দিন ও স্থান' : 'THE VENUE'}</span>
      </a>
      <a href="#moments">
        <Images size={21} strokeWidth={1} />
        <span>{locale === 'bn' ? 'ছবির পাতা' : 'OUR MOMENTS'}</span>
      </a>
      <a href="#rsvp">
        <Heart size={21} strokeWidth={1} />
        <span>{locale === 'bn' ? 'আপনার উত্তর' : 'RSVP'}</span>
      </a>
    </nav>
  );
}
function Portrait({ photo, className = '' }: { photo?: Photo; className?: string }) {
  if (!photo) return null;
  return (
    <picture className={`${r.portrait} ${className}`}>
      <img
        src={photo.fullSrc || photo.src}
        sizes="(max-width:760px) 100vw,760px"
        width={1024}
        height={1536}
        alt=""
        aria-hidden="true"
        style={{
          objectPosition:
            photo.src === '/artwork/garden-couple-v2-1024.webp' ? 'center 16%' : photo.position || 'center',
        }}
        onError={(e) => {
          if (photo.fullSrc && e.currentTarget.getAttribute('src') !== photo.src) {
            e.currentTarget.src = photo.src;
            return;
          }
          e.currentTarget.style.visibility = 'hidden';
        }}
      />
    </picture>
  );
}
function dateParts(date: string, locale: Locale) {
  const value = new Date(`${date}T12:00:00+06:00`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    Number.isFinite(value.getTime())
      ? new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
          ...options,
          timeZone: 'Asia/Dhaka',
        }).format(value)
      : '—';
  return {
    day: format({ day: '2-digit' }),
    month: format({ month: 'long' }),
    year: format({ year: 'numeric' }),
    weekday: format({ weekday: 'long' }),
  };
}

export function ReferenceFolio(props: FolioProps) {
  const { variant, phase, names, hosts, recipient, event, locale, photo, open, sealRef } = props;
  const opened = phase !== 'closed';
  const date = dateParts(event.date, locale);
  const text = eventText(event, locale);
  return (
    <section
      className={`${r.folio} ${r[variant]}`}
      data-phase={phase}
      aria-label={!opened ? words[locale].personal : undefined}
      aria-labelledby={opened ? 'couple-names' : undefined}
    >
      <FontHints />
      {variant === 'rose' && (
        <>
          <Flowers variant="rose" className={r.roseTop} />
          <Monogram names={names} />
          <p className={r.hosts}>{hosts}</p>
          <p className={r.recipient}>
            {(opened ? recipient?.greeting : recipient?.name) ?? words[locale].forYou}
          </p>
          <Names names={names} opened={opened} />
          <p className={r.inviteLine}>
            {locale === 'bn'
              ? 'আমাদের নতুন পথচলায় আপনাদের সাদর আমন্ত্রণ'
              : 'INVITE YOU TO CELEBRATE THEIR WEDDING'}
          </p>
          <div className={r.roseDate}>
            <strong>{date.day}</strong>
            <em>{date.month}</em>
            <span>{date.year}</span>
          </div>
          <p className={r.timeLine}>
            {date.weekday} · {formatTime(event, locale)}
          </p>
          <OpenAction {...{ opened, open, sealRef, locale }} />
          <Flowers variant="rose" className={r.roseBottom} />
        </>
      )}
      {variant === 'jamdani' && (
        <>
          <div className={r.bluePortrait}>
            {opened && photo ? (
              <Portrait photo={photo} />
            ) : (
              <span className={r.blueIntro}>{locale === 'bn' ? 'শুভ পরিণয়' : 'Save the Date'}</span>
            )}
            <Flowers variant="blue" className={r.blueTop} />
            <Flowers variant="blue" className={r.blueLower} />
          </div>
          <div className={r.blueSeal}>
            <Monogram names={names} />
          </div>
          <div className={r.blueLetter}>
            <p className={r.hosts}>{hosts}</p>
            <Names names={names} opened={opened} conjunction={locale === 'bn' ? 'ও' : 'and'} />
            <p className={r.inviteLine}>
              {locale === 'bn'
                ? 'আমাদের বিয়ের আনন্দে আপনাদের নিমন্ত্রণ'
                : 'INVITE YOU TO CELEBRATE THEIR WEDDING DAY'}
            </p>
            <p className={r.recipient}>{opened ? recipient?.greeting : recipient?.name}</p>
            <time className={r.blueDate} dateTime={event.date}>
              <span className={r.srOnly}>{formatDate(event.date, locale)}</span>
              <span aria-hidden="true">{date.month}</span>
              <strong aria-hidden="true">{date.day}</strong>
              <span aria-hidden="true">{date.year}</span>
            </time>
            <p className={r.timeLine}>{formatTime(event, locale)}</p>
            <p className={r.scriptVenue}>{text.venue}</p>
            <address>{text.address}</address>
            <OpenAction {...{ opened, open, sealRef, locale }} />
            {opened && <Shortcuts locale={locale} />}
          </div>
          <Flowers variant="blue" className={r.blueFoot} />
        </>
      )}
      {variant === 'holud' &&
        (!opened ? (
          <div className={r.royalCover}>
            <Flowers variant="rose" className={r.royalTop} />
            <h2 className={r.saveDate}>{locale === 'bn' ? 'দিনটি মনে রাখবেন' : 'Save the Date'}</h2>
            <p className={r.coverCaption}>
              {locale === 'bn' ? 'ভালোবাসায় নতুন পথচলা' : 'A BEAUTIFUL BEGINNING AWAITS'}
            </p>
            <button
              ref={sealRef}
              className={r.envelope}
              onClick={() => open()}
              aria-label={words[locale].open}
            >
              <img src="/artwork/reference-royal-envelope-960.webp" width={960} height={640} alt="" />
              <Heart className={r.sealHeart} size={27} strokeWidth={1.2} />
            </button>
            <p className={r.recipient}>{recipient?.name ?? words[locale].forYou}</p>
            <p className={r.coverNames}>{names.join(' & ')}</p>
            <p className={r.openHint}>{words[locale].open}</p>
            <button className={r.quiet} onClick={() => open(true)}>
              {words[locale].openQuietly}
            </button>
          </div>
        ) : (
          <div className={r.royalHome}>
            <Flowers variant="rose" className={r.royalTop} />
            <Portrait photo={photo} className={r.royalPortrait} />
            <div className={r.royalNotes}>
              <div className={r.note}>
                <p className={r.hosts}>{hosts}</p>
                <Names names={names} opened={opened} />
              </div>
              <div className={r.note}>
                <span>{date.day}</span>
                <strong>
                  {date.month}
                  <br />
                  {date.year}
                </strong>
                <small>{formatTime(event, locale)}</small>
                <p>{text.venue}</p>
              </div>
            </div>
            <Shortcuts locale={locale} tiles />
            <a className={r.royalReply} href="#rsvp">
              <i>{locale === 'bn' ? 'অনুগ্রহ করে' : 'Kindly'}</i>
              <strong>RSVP</strong>
              <span>{locale === 'bn' ? 'আপনার উত্তর জানান' : 'LET US KNOW YOU WILL JOIN US'}</span>
            </a>
            <Flowers variant="rose" className={r.royalBottom} />
          </div>
        ))}
      {variant === 'midnight' && (
        <div className={r.ticket}>
          <div className={r.moonPortrait} data-photo={Boolean(photo)}>
            <Portrait photo={photo} className={r.moonPhoto} />
            <div className={r.moonTitle}>
              <p className={r.ticketLabel}>{locale === 'bn' ? 'শুভ বিবাহের নিমন্ত্রণ' : 'THE WEDDING OF'}</p>
              <Names names={names} opened={opened} />
            </div>
            <Flowers variant="blue" className={r.moonFlowersLeft} />
            <Flowers variant="blue" className={r.moonFlowersRight} />
          </div>
          <div className={r.moonPaper}>
            <p className={r.moonInvitation}>
              {locale === 'bn'
                ? 'আমাদের আনন্দে আপনিও আমন্ত্রিত'
                : 'Together with our families, we invite you to celebrate'}
            </p>
            <div className={r.moonDate}>
              <span>
                {date.weekday}
                <br />
                {date.year}
              </span>
              <time dateTime={event.date}>
                <strong>{date.day}</strong>
                <span>{date.month}</span>
              </time>
              <span>
                {formatTime(event, locale)}
                <br />
                {locale === 'bn' ? 'সঙ্গে থাকুন' : 'JOIN US'}
              </span>
            </div>
            <div className={r.moonVenue}>
              <p>{text.title}</p>
              <strong>{text.venue}</strong>
              <span>{text.address}</span>
            </div>
            <div className={r.moonOrnament} aria-hidden="true">
              <span />
              <Heart size={16} />
              <span />
            </div>
            <p className={r.recipient}>{recipient?.name ?? hosts}</p>
            <OpenAction {...{ opened, open, sealRef, locale }} />
            <p className={r.boarding}>
              {locale === 'bn' ? 'ভালোবাসায় নতুন যাত্রা' : 'A new journey, together'}
            </p>
          </div>
        </div>
      )}
      {opened && (
        <a className={r.heroMap} href={mapUrl(event)} target="_blank" rel="noopener noreferrer">
          <MapPin size={16} />
          {locale === 'bn' ? 'ম্যাপে দেখুন' : 'VIEW MAP'}
          <ArrowRight size={14} />
        </a>
      )}
      {phase === 'opening' && (
        <button className={r.quiet} onClick={() => open(true)}>
          {words[locale].finishOpening}
        </button>
      )}
    </section>
  );
}

export function ReferenceWelcome({
  variant,
  locale,
  names,
  message,
  messageLang,
  greeting,
  personalNote,
}: {
  variant: ReferenceTemplate;
  locale: Locale;
  names: string[];
  message: string;
  messageLang: Locale;
  greeting?: string;
  personalNote?: string;
  photo?: Photo;
}) {
  return (
    <section id="welcome" className={`${r.welcome} ${r[variant]}`} tabIndex={-1}>
      {(variant === 'rose' || variant === 'holud') && <Flowers variant="rose" className={r.letterFlowers} />}
      <span className={r.eyebrow}>
        {locale === 'bn' ? 'ভালোবাসার নিমন্ত্রণ' : 'WITH LOVE, FROM OUR FAMILIES'}
      </span>
      <h2>{locale === 'bn' ? 'প্রিয় আপনজন' : 'Dear friends\nand family'}</h2>
      {greeting && <p className={r.greeting}>{greeting}</p>}
      <p className={r.message} lang={messageLang}>
        {message}
      </p>
      {personalNote && <blockquote>{personalNote}</blockquote>}
      <p className={r.signature}>{names.join(locale === 'bn' ? ' ও ' : ' & ')}</p>
      {variant === 'midnight' && (
        <div className={r.moonOrnament} aria-hidden="true">
          <span />
          <Heart size={18} />
          <span />
        </div>
      )}
    </section>
  );
}

export function ReferenceDate({
  variant,
  event,
  locale,
  children,
}: {
  variant: ReferenceTemplate;
  event: Invitation['events'][number];
  locale: Locale;
  children: ReactNode;
}) {
  const date = dateParts(event.date, locale);
  const value = new Date(`${event.date}T12:00:00Z`);
  const [unfolded, setUnfolded] = useState(false);
  const valid = Number.isFinite(value.getTime());
  const offset = valid
    ? (new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1)).getUTCDay() + 6) % 7
    : 0;
  const days = valid
    ? new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate()
    : 0;
  return (
    <section
      className={`${r.dateChapter} ${r[variant]}`}
      aria-label={locale === 'bn' ? 'আমাদের দিন' : 'Save our date'}
    >
      <h2 className={r.dateHeading}>{locale === 'bn' ? 'দিনটি মনে রাখবেন' : 'Save our date'}</h2>
      {variant === 'midnight' ? (
        <div className={r.calendar}>
          <h3>
            {date.month} {date.year}
          </h3>
          <div className={r.calendarGrid} aria-hidden="true">
            {(locale === 'bn'
              ? ['সো', 'ম', 'বু', 'বৃ', 'শু', 'শ', 'র']
              : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
            ).map((d, i) => (
              <b key={`w${i}`}>{d}</b>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`blank${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => (
              <span key={i} data-selected={i + 1 === value.getUTCDate()}>
                {number(i + 1, locale)}
              </span>
            ))}
          </div>
          <span className={r.eyebrow}>{locale === 'bn' ? 'আমাদের বিশেষ দিন' : 'SAVE THE DATE'}</span>
          <time dateTime={event.date}>{formatDate(event.date, locale)}</time>
          <Heart size={15} fill="currentColor" />
        </div>
      ) : (
        <div className={r.dateCard}>
          <span>{date.weekday}</span>
          <time dateTime={event.date}>
            <strong>{date.day}</strong>
            <i>{date.month}</i>
            <span>{date.year}</span>
          </time>
          <small>{formatTime(event, locale)}</small>
        </div>
      )}
      <button
        className={r.dateToggle}
        aria-expanded={unfolded}
        aria-controls="reference-date-reveal"
        onClick={() => setUnfolded(!unfolded)}
      >
        {unfolded ? words[locale].foldDate : words[locale].untieDate}
      </button>
      <p id="reference-date-reveal" hidden={!unfolded} className={r.dateReveal}>
        <time dateTime={event.date}>{formatDate(event.date, locale)}</time>
      </p>
      {children}
    </section>
  );
}

export function ReferenceClosing({ variant }: { variant: ReferenceTemplate }) {
  return (
    <Flowers
      variant={variant === 'jamdani' || variant === 'midnight' ? 'blue' : 'rose'}
      className={r.closingFlowers}
    />
  );
}
