'use client';

import { useState, type Ref, type ReactNode } from 'react';
import { ArrowDown, Plus } from 'lucide-react';
import { formatDate, number, words, type Locale } from '@/features/invitation/content';
import type { Invitation } from '@/features/workspace/model';
import { WaxSeal } from './stationery-art';
import g from './garden-royal.module.css';

export function GardenOrnament() {
  return (
    <span className={g.ornament} aria-hidden="true">
      <i />❋<i />
    </span>
  );
}

function GardenBlooms({ className = '' }: { className?: string }) {
  return (
    <img
      className={className}
      src="/artwork/garden-editorial-blooms-480.webp"
      width={480}
      height={320}
      alt=""
      aria-hidden="true"
      loading="lazy"
    />
  );
}

/** Garden's own folio. Opening, music and guest authority stay in GuestInvitation. */
export function GardenFolio({
  phase,
  names,
  hosts,
  recipient,
  date,
  place,
  locale,
  open,
  sealRef,
  photo,
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
  photo?: NonNullable<Invitation['photos']>[number];
}) {
  const t = words[locale];
  const opened = phase !== 'closed';
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const longNames = names.some((name) => name.length > 20);
  return (
    <section
      className={g.folio}
      data-phase={phase}
      aria-label={opened ? undefined : t.personal}
      aria-labelledby={opened ? 'couple-names' : undefined}
    >
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
      {opened && (
        <div className={g.revealed}>
          <div className={g.portraitScene} aria-hidden="true">
            {photo && failedPhoto !== photo.src && (
              <img
                src={photo.src}
                srcSet={
                  photo.src === '/artwork/garden-couple-v2-1024.webp' ? undefined : photo.responsiveSrcSet
                }
                sizes="(max-width: 480px) 540px, 760px"
                width={640}
                height={800}
                alt=""
                fetchPriority="high"
                decoding="async"
                style={{
                  objectPosition:
                    photo.src === '/artwork/garden-couple-v2-1024.webp'
                      ? 'center 25%'
                      : photo.position || 'center',
                }}
                onError={() => setFailedPhoto(photo.src)}
              />
            )}
          </div>
          <div className={g.invitation}>
            <span className={g.eyebrow}>{hosts}</span>
            <h1
              id="couple-names"
              tabIndex={-1}
              className={g.names}
              data-long={Math.max(...names.map((n) => n.length)) > 18}
            >
              <span>{names[0]}</span>
              <i>&</i>
              <span>{names[1]}</span>
            </h1>
            <time className={g.invitationDate} dateTime={date}>
              {formatDate(date, locale)}
            </time>
            {place.length <= 80 && <span className={g.place}>{place}</span>}
          </div>
          <a className={g.discover} href="#welcome">
            {t.scroll}
            <ArrowDown size={16} />
          </a>
          <GardenBlooms className={g.folioBlooms} />
        </div>
      )}
      {phase !== 'open' && (
        <div className={g.cover}>
          <div className={g.coverContent}>
            <span className={g.coverLabel}>{t.addressedTo}</span>
            <span className={g.addressee}>{recipient?.name ?? t.forYou}</span>
            <h2>{locale === 'bn' ? 'শুভ পরিণয়' : 'Save the date'}</h2>
            <div className={g.envelope}>
              <img
                src="/artwork/garden-editorial-envelope-960.webp"
                srcSet="/artwork/garden-editorial-envelope-480.webp 480w, /artwork/garden-editorial-envelope-960.webp 960w"
                sizes="(max-width: 480px) 94vw, 460px"
                width={960}
                height={960}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
              />
              <div className={g.insetLetter}>
                <span>{locale === 'bn' ? 'শুভ বিবাহ' : 'THE WEDDING OF'}</span>
                <strong>
                  {longNames ? Array.from(names[0])[0] : names[0]}
                  <i>&</i>
                  {longNames ? Array.from(names[1])[0] : names[1]}
                </strong>
                <time dateTime={date}>{formatDate(date, locale)}</time>
              </div>
              <button
                ref={sealRef}
                className={g.seal}
                onClick={() => open()}
                aria-label={t.open}
                aria-disabled={phase === 'opening'}
              >
                <WaxSeal />
                <span className={g.sealInitials} aria-hidden="true">
                  {Array.from(names[0])[0]}
                  <i>&</i>
                  {Array.from(names[1])[0]}
                </span>
              </button>
            </div>
            {longNames && (
              <p className={g.coverLongNames}>
                {names[0]} &amp; {names[1]}
              </p>
            )}
            <span className={g.openHint} aria-live="polite">
              {phase === 'opening' ? t.opening : t.open}
            </span>
            <button className={g.quietOpen} onClick={() => open(true)}>
              {phase === 'opening' ? t.finishOpening : t.openQuietly}
            </button>
          </div>
          <GardenBlooms className={g.coverBlooms} />
        </div>
      )}
    </section>
  );
}

export function GardenWelcome({
  locale,
  message,
  messageLang,
  personalNote,
  names,
  greeting,
}: {
  locale: Locale;
  message: string;
  messageLang: Locale;
  personalNote?: string;
  names: string[];
  greeting?: string;
}) {
  return (
    <>
      <section id="welcome" className={g.letter} tabIndex={-1} data-reveal>
        <span className={g.chapter}>
          {locale === 'bn' ? '০১ / ভালোবাসার নিমন্ত্রণ' : '01 / A LETTER TO YOU'}
        </span>
        <GardenOrnament />
        <h2>{locale === 'bn' ? 'সাদর আমন্ত্রণ' : 'With love,\nwe invite you'}</h2>
        {greeting && <p className={g.greeting}>{greeting}</p>}
        <p className={g.letterMessage} lang={messageLang}>
          {message}
        </p>
        {personalNote && <blockquote className={g.personalNote}>{personalNote}</blockquote>}
        <p className={g.letterSignoff}>
          {locale === 'bn' ? 'আপনাদের অপেক্ষায়,' : 'With love, and in anticipation,'}
          <strong>
            {names[0]} <i>&</i> {names[1]}
          </strong>
        </p>
        <span className={g.letterMark} aria-hidden="true">
          ❋
        </span>
        <GardenBlooms className={g.letterBlooms} />
      </section>
      <figure className={g.gardenScene}>
        <img
          src="/artwork/garden-royal-palace-1200.webp"
          srcSet="/artwork/garden-royal-palace-640.webp 640w, /artwork/garden-royal-palace-1200.webp 1200w"
          sizes="(max-width: 760px) 100vw, 760px"
          width={1536}
          height={1024}
          loading="lazy"
          alt={
            locale === 'bn'
              ? 'ফুলে সাজানো রাজকীয় বাগান ও আলোকিত প্রাসাদের কল্পচিত্র'
              : 'An illustrated royal garden and softly lit pavilion'
          }
        />
        <figcaption>
          <span aria-hidden="true">✧</span>
          {locale === 'bn'
            ? 'ভালোবাসা ফুটুক, নতুন গল্পের বাগানে।'
            : 'And so, a beautiful new chapter blooms.'}
          <span aria-hidden="true">✧</span>
        </figcaption>
      </figure>
    </>
  );
}

export function GardenDate({
  date,
  locale,
  children,
}: {
  date: string;
  locale: Locale;
  children: ReactNode;
}) {
  const value = new Date(`${date}T12:00:00+06:00`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
      ...options,
      timeZone: 'Asia/Dhaka',
    }).format(value);
  return (
    <section className={g.dateChapter} aria-label={locale === 'bn' ? 'আমাদের দিন' : 'Save our date'}>
      <span className={g.chapter}>{locale === 'bn' ? '০২ / দিনটি মনে রাখবেন' : '02 / SAVE OUR DATE'}</span>
      <h2 className={g.saveDateTitle}>{locale === 'bn' ? 'আমাদের দিন' : 'Save the date'}</h2>
      <div className={g.datePrint}>
        <span>{format({ weekday: 'long' })}</span>
        <time dateTime={date}>
          <strong>{format({ day: '2-digit' })}</strong>
          <span>
            {format({ month: 'long' })}
            <small>{format({ year: 'numeric' })}</small>
          </span>
        </time>
        <span>{locale === 'bn' ? 'ভালোবাসার\nনতুন অধ্যায়' : 'A NEW\nBEGINNING'}</span>
      </div>
      {children}
      <img
        className={g.silk}
        src="/artwork/garden-editorial-silk-1200.webp"
        width={1200}
        height={800}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
    </section>
  );
}

export function GardenPhotoCollage({
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
  const t = words[locale];
  return (
    <div className={g.photoCollage}>
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          className={g.collageShot}
          onClick={() => onOpen(photo.id)}
          aria-label={`${t.photoOpen} ${number(index + 1, locale)}`}
        >
          {failed.includes(photo.src) ? (
            <span className={g.photoMissing}>{t.photoMissing}</span>
          ) : (
            <img
              src={photo.src}
              srcSet={photo.responsiveSrcSet}
              sizes="(max-width: 480px) 48vw, 310px"
              width={640}
              height={800}
              alt={locale === 'bn' ? photo.altBn || photo.alt : photo.alt}
              loading="lazy"
              style={{ objectPosition: photo.position || 'center' }}
              onError={() => onFailure(photo.src)}
            />
          )}
          <span className={g.collageCaption}>
            {number(index + 1, locale, 2)} <Plus size={15} />
          </span>
        </button>
      ))}
      <GardenBlooms className={g.collageBlooms} />
    </div>
  );
}
