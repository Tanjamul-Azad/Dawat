'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Heart, Pause, Play, Volume2, VolumeX, LoaderCircle } from 'lucide-react';
import { type Workspace } from '@/features/workspace/model';
import { useWorkspace } from '@/features/workspace/use-workspace';
import {
  eventText,
  guestText,
  formatDate,
  localNames,
  resolveLocale,
  words,
  type Locale,
} from '@/features/invitation/content';
import { CelebrationEvents, Countdown, DateKeepsake, Flourish, PhotoMoments } from './invitation-sections';
import { InvitationResponse, type ResponseTransport } from './invitation-response';
import { useInvitationMotion } from './use-invitation-motion';
import { useInvitationMusic } from './use-invitation-music';
import { WaxSeal, WovenPattern } from './stationery-art';
import s from './jamdani.module.css';

type Props = {
  workspace: Workspace;
  ready: boolean;
  update: (fn: (state: Workspace) => Workspace) => boolean;
  notify: (message: string) => void;
  storageError?: string;
  authority?: {
    mode: 'draftPreview' | 'liveGeneral' | 'liveHousehold' | 'householdPreview';
    scope: string;
    guestId?: string;
  };
  responseTransport?: ResponseTransport;
  onLocaleChange?: (locale: Locale) => void;
};

export function GuestInvitation({
  workspace,
  ready,
  update,
  storageError = '',
  authority,
  responseTransport,
  onLocaleChange,
}: Props) {
  // Public sample replies never mutate an order, customer draft or the host workspace.
  const sample = useWorkspace('dawat-guest-sample-v1', !authority);
  const [query, setQuery] = useState<{
    guest: string | null;
    design: boolean;
    sampleGuest: string | null;
    live: boolean;
  } | null>(null);
  const [locale, setLocale] = useState<Locale>('bn');
  useEffect(() => {
    if (query) onLocaleChange?.(locale);
  }, [locale, onLocaleChange, query]);
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed');
  const hasOpened = phase !== 'closed';
  const [coverHeight, setCoverHeight] = useState<number>();
  const [motionOff, setMotionOff] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seal = useRef<HTMLButtonElement>(null);
  const scope =
    authority?.scope ??
    (query?.guest ? `guest-${query.guest}` : query?.design ? 'design' : query?.live ? 'live' : 'sample');
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const next = {
      guest: authority ? (authority.guestId ?? null) : search.get('guest'),
      design: authority
        ? ['draftPreview', 'householdPreview'].includes(authority.mode)
        : search.get('preview') === 'design',
      sampleGuest: authority ? null : search.get('sampleGuest'),
      live: authority
        ? ['liveGeneral', 'liveHousehold'].includes(authority.mode)
        : search.get('live') === '1',
    };
    setQuery(next);
    let saved: null | string = null;
    try {
      saved = localStorage.getItem(
        `dawat-language-${next.guest ? `guest-${next.guest}` : next.design ? 'design' : next.live ? 'live' : 'sample'}`,
      );
    } catch {
      /* Viewing does not require storage. */
    }
    setLocale(resolveLocale(search.get('lang'), saved));
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      const reduced = media?.matches ?? true;
      setMotionOff(reduced);
      if (reduced) {
        if (timer.current) clearTimeout(timer.current);
        setPhase((current) => (current === 'opening' ? 'open' : current));
      }
    };
    onMotion();
    media?.addEventListener?.('change', onMotion);
    return () => {
      media?.removeEventListener?.('change', onMotion);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [authority?.mode]);
  const sampleMode = !authority && !!query && !query.design && query.guest === null && !query.live;
  const state = sampleMode ? sample.workspace : workspace;
  const mutate = sampleMode ? sample.update : update;
  const invitation = query?.design ? state.draft : state.published;
  const guestId = sampleMode ? (query?.sampleGuest ?? 'demo-sabbir') : query?.guest;
  const guest = state.guests.find((item) => item.id === guestId);
  const events = invitation?.events.filter((event) => !guest || guest.events.includes(event.id)) ?? [];
  const music = useInvitationMusic(
    scope,
    ready && !!query && sample.ready && !!invitation && events.length > 0,
  );
  const { page, chapter, navigationVisible } = useInvitationMotion(hasOpened);
  const [sampleRevision, setSampleRevision] = useState(0);
  useEffect(() => {
    if (!hasOpened) return;
    const hash = window.location.hash.slice(1);
    const target = ['welcome', 'events', 'moments', 'rsvp'].includes(hash) ? hash : 'couple-names';
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(target);
      if (target !== 'couple-names') section?.scrollIntoView({ behavior: 'instant', block: 'start' });
      section?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hasOpened]);
  const t = words[locale];
  function language(next: Locale) {
    setLocale(next);
    try {
      localStorage.setItem(`dawat-language-${scope}`, next);
    } catch {
      /* Preference is optional. */
    }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
  }
  function open(quiet = false) {
    if (!quiet && phase !== 'closed') return;
    if (!hasOpened) {
      setCoverHeight(seal.current?.closest('section')?.getBoundingClientRect().height);
      music.onOpen();
    }
    if (timer.current) clearTimeout(timer.current);
    if (quiet || motionOff || motionPaused) {
      setPhase('open');
      return;
    }
    setPhase('opening');
    timer.current = setTimeout(() => {
      setPhase('open');
    }, 800);
  }
  const languageControl = (
    <div className={s.languages} role="group" aria-label={locale === 'bn' ? 'ভাষা' : 'Language'}>
      <button onClick={() => language('bn')} lang="bn" aria-pressed={locale === 'bn'}>
        বাংলা
      </button>
      <button onClick={() => language('en')} lang="en" aria-pressed={locale === 'en'}>
        English
      </button>
    </div>
  );
  const musicControl = (
    <span className={s.musicSlot}>
      <button
        className={`${s.motionControl} ${navigationVisible ? s.musicDock : ''}`}
        onClick={music.toggle}
        aria-label={
          music.status === 'loading'
            ? t.loadingMusic
            : music.status === 'playing'
              ? t.pauseMusic
              : t.playMusic
        }
        aria-pressed={music.status === 'playing' || music.status === 'loading'}
        title={music.status === 'playing' ? t.pauseMusic : t.playMusic}
      >
        {music.status === 'loading' ? (
          <LoaderCircle size={16} />
        ) : music.status === 'playing' ? (
          <Volume2 size={16} />
        ) : (
          <VolumeX size={16} />
        )}
      </button>
    </span>
  );
  if (!ready || !query || !sample.ready)
    return (
      <div className={s.page} lang={locale} data-motion="quiet">
        {!authority && <div className={s.demoNote}>{t.demo}</div>}
        <header key="reader" className={s.topbar}>
          <span>{t.edition}</span>
          <div className={s.readerControls}>
            <button className={s.motionControl} disabled aria-label={t.pauseMotion}>
              <Pause size={15} />
            </button>
            {languageControl}
          </div>
        </header>
        <section key="folio" className={s.hero} data-phase="closed" aria-label={t.personal}>
          <div key="jacket" className={s.jacket}>
            <div className={s.gateLeft} aria-hidden="true">
              <WovenPattern />
            </div>
            <div className={s.gateRight} aria-hidden="true">
              <WovenPattern />
            </div>
            <div key="preparing" className={s.openingScene}>
              <span className={s.openingHint} role="status">
                {t.loading}
              </span>
              <span className={s.seal} aria-hidden="true">
                <WaxSeal />
              </span>
            </div>
          </div>
        </section>
      </div>
    );
  if (
    !invitation ||
    (guestId != null && !guest) ||
    (!authority && query.design && (query.guest !== null || query.live)) ||
    (query.live && query.sampleGuest !== null) ||
    !events.length
  )
    return (
      <div className={s.page} lang={locale}>
        <header className={s.topbar}>
          <a href="/">dawat.</a>
          {languageControl}
        </header>
        <section className={s.unavailable}>
          <Heart size={28} />
          <h1>{t.unavailable}</h1>
          <p>{t.unavailableNote}</p>
          <a href="/templates/">
            {t.collection}
            <ArrowRight size={16} />
          </a>
        </section>
      </div>
    );
  const names = localNames(invitation, locale);
  const recipient = guest ? guestText(guest, locale) : null;
  const hosts =
    locale === 'bn' ? invitation.hostsBn || invitation.hosts || t.hosts : invitation.hosts || t.hosts;
  const message = locale === 'bn' ? invitation.message : invitation.messageEn || invitation.message;
  const primaryEvent = events.find((event) => event.id === 'reception') ?? events[0];
  const primaryDate = primaryEvent.date;
  const place = eventText(primaryEvent, locale).address;
  return (
    <div
      ref={page}
      className={`${s.page} ${s[invitation.theme] ?? ''}`}
      lang={locale}
      data-motion={motionOff || motionPaused ? 'quiet' : 'full'}
    >
      {(query.design || !authority) && <div className={s.demoNote}>{query.design ? t.preview : t.demo}</div>}
      {(sampleMode ? sample.storageError : storageError) && (
        <p className={s.feedback} role="alert">
          {t.storageProblem}
        </p>
      )}
      {hasOpened && (
        <a className={s.skipLink} href="#events">
          {t.skip}
        </a>
      )}
      <header key="reader" className={s.topbar}>
        <span>{t.edition}</span>
        <div className={s.readerControls}>
          {musicControl}
          <button
            className={s.motionControl}
            aria-label={motionOff ? t.quietMotion : motionPaused ? t.resumeMotion : t.pauseMotion}
            aria-pressed={motionPaused || motionOff}
            disabled={motionOff}
            onClick={() => {
              setMotionPaused(!motionPaused);
              if (!motionPaused && phase === 'opening') {
                if (timer.current) clearTimeout(timer.current);
                setPhase('open');
              }
            }}
          >
            {motionPaused || motionOff ? <Play size={15} /> : <Pause size={15} />}
          </button>
          {languageControl}
        </div>
      </header>
      <audio ref={music.audio} preload="none" loop aria-hidden="true" />
      {(music.status === 'blocked' || music.status === 'error') && (
        <p className={s.musicNotice} role="status">
          {music.status === 'blocked' ? t.blockedMusic : t.failedMusic}
        </p>
      )}
      <section
        key="folio"
        className={s.hero}
        data-phase={phase}
        style={hasOpened && coverHeight ? { minHeight: coverHeight } : undefined}
        aria-label={!hasOpened ? t.personal : undefined}
        aria-labelledby={hasOpened ? 'couple-names' : undefined}
      >
        {phase !== 'closed' && (
          <picture className={s.heroBackdrop} aria-hidden="true">
            <source
              srcSet="/artwork/jamdani-garden-v5-640.webp 640w, /artwork/jamdani-garden-v5-1024.webp 1024w"
              sizes="(max-width: 680px) 100vw, 680px"
              type="image/webp"
            />
            <img
              src="/artwork/jamdani-garden-v5-1024.webp"
              alt=""
              width={1024}
              height={1536}
              fetchPriority="high"
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden';
              }}
            />
          </picture>
        )}
        <div className={s.petals} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={s.cardContent} aria-hidden={!hasOpened} inert={!hasOpened}>
          <span className={s.kicker}>{hosts}</span>
          <div className={s.monogram} aria-hidden="true">
            <WaxSeal />
          </div>
          <h1
            id="couple-names"
            tabIndex={-1}
            className={s.names}
            data-long={Math.max(...names.map((n) => n.length)) > 22}
          >
            <span>{names[0]}</span>
            <i>&</i>
            <span>{names[1]}</span>
          </h1>
          <p className={s.wedding}>{t.wedding}</p>
          {recipient && <p className={s.personalGreeting}>{recipient.greeting}</p>}
          <Flourish />
          <p className={s.heroDate}>{formatDate(primaryDate, locale)}</p>
          {place.length <= 80 && <span className={s.heroLocation}>{place}</span>}
        </div>
        {phase !== 'open' && (
          <div key="jacket" className={s.jacket} aria-label={t.personal}>
            <div className={s.gateLeft} aria-hidden="true">
              <WovenPattern />
            </div>
            <div className={s.gateRight} aria-hidden="true">
              <WovenPattern />
            </div>
            <div key="addressed" className={s.openingScene}>
              <span className={s.recipientLabel}>{t.addressedTo}</span>
              <span className={s.recipientName}>{recipient?.name ?? t.forYou}</span>
              <h2 className={s.openingHeading}>{t.letter}</h2>
              <button
                ref={seal}
                className={s.seal}
                onClick={() => open()}
                aria-disabled={phase === 'opening'}
                aria-label={t.open}
              >
                <span aria-hidden="true">
                  <WaxSeal />
                </span>
              </button>
              <p className={s.openingHint} aria-live="polite">
                {phase === 'opening' ? t.opening : t.open}
              </p>
              <button className={s.quietOpen} onClick={() => open(true)}>
                {phase === 'opening' ? t.finishOpening : t.openQuietly}
              </button>
              <p className={s.fromCouple}>
                {t.fromCouple}
                <span>
                  {names[0]} &amp; {names[1]}
                </span>
              </p>
            </div>
          </div>
        )}
        {hasOpened && (
          <div className={s.heroBottom}>
            <a href="#welcome">
              {t.scroll}
              <ArrowDown size={17} />
            </a>
          </div>
        )}
      </section>
      {hasOpened && (
        <>
          <nav
            className={s.chapterNav}
            hidden={!navigationVisible}
            aria-label={locale === 'bn' ? 'আমন্ত্রণের বিভাগ' : 'Invitation sections'}
          >
            <a href="#events" aria-current={chapter === 'events' ? 'location' : undefined}>
              {t.details}
            </a>
            <span aria-hidden="true">✧</span>
            <a href="#moments" aria-current={chapter === 'moments' ? 'location' : undefined}>
              {t.pictures}
            </a>
            <span aria-hidden="true">✧</span>
            <a href="#rsvp" aria-current={chapter === 'rsvp' ? 'location' : undefined}>
              {t.reply}
            </a>
          </nav>
          <section id="welcome" className={s.welcome} data-reveal tabIndex={-1}>
            <span className={s.chapterNumber} aria-hidden="true">
              01 / {locale === 'bn' ? 'আমাদের আমন্ত্রণ' : 'THE INVITATION'}
            </span>
            <span className={s.kicker}>{t.welcomeLabel}</span>
            <h2>
              {t.welcome}
              <br />
              <em>{t.welcomeEm}</em>
            </h2>
            <p
              className={s.invitationMessage}
              lang={locale === 'en' && !invitation.messageEn ? 'bn' : locale}
            >
              {message}
            </p>
            {recipient?.message && <p className={s.personalNote}>{recipient.message}</p>}
            <span className={s.welcomeFoot}>{t.welcomeNote}</span>
            <Flourish />
          </section>
          <DateKeepsake event={primaryEvent} locale={locale} />
          <Countdown events={events} locale={locale} />
          <CelebrationEvents invitation={invitation} events={events} locale={locale} />
          <PhotoMoments photos={invitation.photos} locale={locale} />
          {query.design ? (
            <section id="rsvp" className={s.previewPanel} tabIndex={-1}>
              <Heart size={25} />
              <h2>{t.previewTitle}</h2>
              <p>{t.previewNote}</p>
              <a href="/studio/" className={s.primary}>
                {t.customize}
                <ArrowRight size={16} />
              </a>
            </section>
          ) : (
            <>
              {sampleMode && (
                <div className={s.sampleNote}>
                  <p>{t.sampleReply}</p>
                  <button
                    onClick={() => {
                      if (!sample.reset()) return;
                      setSampleRevision((current) => current + 1);
                      setQuery((current) => (current ? { ...current, sampleGuest: null } : current));
                      const url = new URL(window.location.href);
                      url.searchParams.delete('sampleGuest');
                      window.history.replaceState(null, '', url);
                    }}
                  >
                    {locale === 'bn' ? 'নমুনা উত্তর রিসেট করুন' : 'Reset sample replies'}
                  </button>
                </div>
              )}
              {guest ? (
                <InvitationResponse
                  key={`${guest.id}:${sampleRevision}`}
                  workspace={state}
                  invitation={invitation}
                  guest={guest}
                  events={events}
                  locale={locale}
                  update={mutate}
                  remote={responseTransport}
                />
              ) : (
                <section id="rsvp" className={s.previewPanel} tabIndex={-1}>
                  <Heart size={25} />
                  <h2>{t.personalLinkTitle}</h2>
                  <p>{t.personalLinkNote}</p>
                </section>
              )}
            </>
          )}
          <footer className={s.closing}>
            <WovenPattern className={s.closingPattern} />
            <span className={s.kicker}>{t.closing}</span>
            <h2>
              <span>{names[0]}</span>
              <i>&</i>
              <span>{names[1]}</span>
            </h2>
            <p className={s.familySignature}>{t.signature}</p>
            <Flourish />
            <p>{t.closingBn}</p>
            <details className={s.musicCredit}>
              <summary>{t.musicCredit}</summary>
              <p lang="en">
                “Canon in D Major” —{' '}
                <a
                  href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100301"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kevin MacLeod (incompetech.com)
                </a>
                .{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY 4.0
                </a>
                . Two-minute excerpt; compressed with fades.
              </p>
            </details>
          </footer>
        </>
      )}
    </div>
  );
}
