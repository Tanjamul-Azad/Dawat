'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Copy, MapPin, Plus } from 'lucide-react';
import { download, type Invitation } from '@/features/workspace/model';
import {
  calendarContent,
  countdown,
  eventInstant,
  eventText,
  formatDate,
  formatTime,
  mapUrl,
  number,
  words,
  type Locale,
} from '@/features/invitation/content';
import { copyText, Modal } from './ui';
import { Botanical } from './artwork';
import s from './jamdani.module.css';
import { PhotoReel } from './photo-reel';

export function Flourish() {
  return (
    <div className={s.flourish} aria-hidden="true">
      <span />✧<span />
    </div>
  );
}
export function DateKeepsake({ event, locale }: { event: Invitation['events'][number]; locale: Locale }) {
  const [unfolded, setUnfolded] = useState(false);
  const t = words[locale];
  const date = new Date(`${event.date}T12:00:00+06:00`);
  if (!Number.isFinite(date.getTime())) return null;
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
      ...options,
      timeZone: 'Asia/Dhaka',
    }).format(date);
  return (
    <section className={s.dateKeepsake} aria-labelledby="keepsake-title" data-reveal>
      <span className={s.chapterNumber} aria-hidden="true">
        02 / {locale === 'bn' ? 'আমাদের দিন' : 'SAVE OUR DATE'}
      </span>
      <h2 id="keepsake-title" className={s.kicker}>
        {t.dateChapter}
      </h2>
      <div className={s.dateMedallion} data-unfolded={unfolded}>
        <div className={s.datePrint} id="keepsake-date" aria-hidden={!unfolded}>
          <span>{format({ weekday: 'long' })}</span>
          <strong>{format({ day: 'numeric' })}</strong>
          <span>{format({ month: 'long', year: 'numeric' })}</span>
          <Flourish />
        </div>
        <button
          className={s.dateRibbon}
          onClick={() => setUnfolded(!unfolded)}
          aria-expanded={unfolded}
          aria-controls="keepsake-date"
          aria-label={unfolded ? t.foldDate : t.untieDate}
        >
          <span aria-hidden="true">✧</span>
          {unfolded ? t.foldDate : t.untieDate}
          <span aria-hidden="true">✧</span>
        </button>
      </div>
      <p className={s.dateCaption} aria-live="polite">
        {unfolded ? t.dateUnfolded : eventText(event, locale).title}
      </p>
      <time dateTime={event.date}>{formatDate(event.date, locale)}</time>
    </section>
  );
}
export function Countdown({ events, locale }: { events: Invitation['events']; locale: Locale }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    let timer: number | undefined;
    const schedule = () => {
      if (timer !== undefined) window.clearInterval(timer);
      tick();
      if (!document.hidden) timer = window.setInterval(tick, 1000);
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, []);
  const valid = events
    .map((event) => ({ event, instant: eventInstant(event) }))
    .filter((item): item is { event: Invitation['events'][number]; instant: number } => item.instant !== null)
    .sort((a, b) => a.instant - b.instant);
  const next = valid.find((item) => now === null || item.instant > now) ?? valid.at(-1);
  if (!next) return null;
  const remaining = countdown(next.instant, now ?? next.instant - 1000);
  const t = words[locale];
  return (
    <section className={s.countdown} aria-labelledby="countdown-title">
      <span className={s.kicker}>{t.anticipation}</span>
      <h2 id="countdown-title">{t.countdown}</h2>
      {now !== null && remaining.past ? (
        <p className={s.past}>{t.past}</p>
      ) : (
        <div
          className={s.clock}
          aria-label={`${formatDate(next.event.date, locale)} ${formatTime(next.event, locale)}`}
        >
          {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
            <div key={unit}>
              <strong suppressHydrationWarning data-wide={remaining[unit] > 999}>
                {now === null ? '—' : number(remaining[unit], locale, 2)}
              </strong>
              <span>{t[unit]}</span>
            </div>
          ))}
        </div>
      )}
      <p>
        {eventText(next.event, locale).title} · {formatDate(next.event.date, locale)}
      </p>
      <small>{t.dateNote}</small>
    </section>
  );
}

export function CelebrationEvents({
  invitation,
  events,
  locale,
}: {
  invitation: Invitation;
  events: Invitation['events'];
  locale: Locale;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const t = words[locale];
  async function copy(event: Invitation['events'][number]) {
    try {
      const text = eventText(event, locale);
      await copyText(`${text.venue}\n${text.address}`);
      setCopied(event.id);
      setFailed(null);
    } catch {
      setFailed(event.id);
      setCopied(null);
    }
  }
  return (
    <section id="events" className={s.events} aria-labelledby="events-title" tabIndex={-1}>
      <header className={s.sectionHead} data-reveal>
        <span className={s.chapterNumber} aria-hidden="true">
          03 / {locale === 'bn' ? 'আয়োজন' : 'THE CELEBRATIONS'}
        </span>
        <span className={s.kicker}>{t.programmeLabel}</span>
        <h2 id="events-title">{t.programme}</h2>
        <Flourish />
      </header>
      <div className={s.eventList}>
        {events.map((event, index) => {
          const text = eventText(event, locale);
          return (
            <article key={event.id} className={s.event} data-reveal>
              <div className={s.eventDate}>
                <span>{number(index + 1, locale, 2)}</span>
                <div aria-hidden="true">{event.id === 'nikah' ? '❋' : '✧'}</div>
                <p>{formatDate(event.date, locale)}</p>
              </div>
              <div className={s.eventBody}>
                <span className={s.kicker}>
                  {formatTime(event, locale)} · {locale === 'bn' ? 'বাংলাদেশ সময়' : 'BANGLADESH TIME'}
                </span>
                <h3>{text.title}</h3>
                <p className={s.venue}>{text.venue}</p>
                <address>{text.address}</address>
                <div className={s.eventActions}>
                  <a href={mapUrl(event)} target="_blank" rel="noopener noreferrer">
                    <MapPin size={16} />
                    {t.directions}
                    <ArrowRight size={14} />
                  </a>
                  <button
                    onClick={() =>
                      download(
                        `${event.id}.ics`,
                        calendarContent(event, invitation, locale),
                        'text/calendar;charset=utf-8',
                      )
                    }
                  >
                    <CalendarDays size={16} />
                    {t.calendar}
                  </button>
                </div>
                <div className={s.secondaryActions}>
                  <button onClick={() => copy(event)}>
                    {copied === event.id ? <Check size={14} /> : <Copy size={14} />}{' '}
                    {copied === event.id ? t.copied : t.address}
                  </button>
                  <button
                    aria-expanded={expanded === event.id}
                    aria-controls={`map-${event.id}`}
                    onClick={() => setExpanded(expanded === event.id ? null : event.id)}
                  >
                    {expanded === event.id ? t.hideMap : t.showMap}
                    <Plus size={14} />
                  </button>
                </div>
                {failed === event.id && (
                  <p role="status" className={s.feedback}>
                    {t.copyFailed}
                    <br />
                    <span className={s.selectable}>
                      {text.venue}, {text.address}
                    </span>
                  </p>
                )}
                {expanded === event.id && (
                  <div id={`map-${event.id}`} className={s.map}>
                    <iframe
                      title={`${t.mapLabel} ${text.venue}`}
                      src={mapUrl(event, true)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <small>{t.mapNote}</small>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function PhotoMoments({ photos = [], locale }: { photos?: Invitation['photos']; locale: Locale }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [failed, setFailed] = useState<string[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const t = words[locale];
  const selected = photos.findIndex((photo) => photo.id === selectedId);
  const selectedPhoto = selected < 0 ? null : photos[selected];
  function move(offset: number) {
    setSelectedId((id) => {
      const index = photos.findIndex((photo) => photo.id === id);
      return index < 0 ? null : (photos[(index + photos.length + offset) % photos.length]?.id ?? null);
    });
  }
  useEffect(() => {
    if (selectedId && !photos.some((photo) => photo.id === selectedId)) setSelectedId(null);
  }, [photos, selectedId]);
  if (!photos.length)
    return (
      <section id="moments" className={s.noPhoto} tabIndex={-1} data-reveal>
        <Botanical />
        <span className={s.kicker}>{t.photoLabel}</span>
        <h2>{t.photoFree}</h2>
        <p>{t.photoFreeNote}</p>
        <Flourish />
      </section>
    );
  return (
    <section id="moments" className={s.moments} aria-labelledby="moments-title" tabIndex={-1}>
      <header className={s.sectionHead} data-reveal>
        <span className={s.chapterNumber} aria-hidden="true">
          04 / {locale === 'bn' ? 'স্মৃতির পাতা' : 'OUR MOMENTS'}
        </span>
        <span className={s.kicker}>{t.photoLabel}</span>
        <h2 id="moments-title">{t.photoTitle}</h2>
        <p>{t.photoNote}</p>
      </header>
      <PhotoReel
        photos={photos}
        locale={locale}
        failed={failed}
        onFailure={(src) => setFailed((current) => (current.includes(src) ? current : [...current, src]))}
        onOpen={setSelectedId}
        dialogOpen={!!selectedPhoto}
      />
      {selectedPhoto && (
        <Modal
          title={t.photoTitle}
          closeLabel={t.close}
          className={s.photoDialog}
          onClose={() => setSelectedId(null)}
        >
          <div
            className={s.lightbox}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              move(event.key === 'ArrowRight' ? 1 : -1);
            }}
            onTouchStart={(event) => {
              const point = event.touches[0];
              touch.current =
                event.touches.length === 1 && point ? { x: point.clientX, y: point.clientY } : null;
            }}
            onTouchCancel={() => {
              touch.current = null;
            }}
            onTouchEnd={(event) => {
              const start = touch.current;
              touch.current = null;
              const end = event.changedTouches[0];
              if (!start || !end || event.touches.length) return;
              const delta = end.clientX - start.x;
              if (Math.abs(delta) < 60 || Math.abs(delta) < Math.abs(end.clientY - start.y) * 1.5) return;
              move(delta < 0 ? 1 : -1);
            }}
          >
            {failed.includes(selectedPhoto.src) ? (
              <div className={s.photoFallback}>
                <Botanical />
                {t.photoMissing}
              </div>
            ) : (
              <img
                src={selectedPhoto.src}
                alt={locale === 'bn' ? selectedPhoto.altBn || selectedPhoto.alt : selectedPhoto.alt}
                style={{ objectPosition: selectedPhoto.position || 'center' }}
                onError={() =>
                  setFailed((current) =>
                    current.includes(selectedPhoto.src) ? current : [...current, selectedPhoto.src],
                  )
                }
              />
            )}
            {photos.length > 1 && (
              <div>
                <button aria-label={t.previous} onClick={() => move(-1)}>
                  <ArrowLeft size={20} />
                </button>
                <span>
                  {number(selected + 1, locale)} / {number(photos.length, locale)}
                </span>
                <button aria-label={t.next} onClick={() => move(1)}>
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
