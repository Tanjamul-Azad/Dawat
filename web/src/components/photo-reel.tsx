'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Plus } from 'lucide-react';
import type { Invitation } from '@/features/workspace/model';
import { number, words, type Locale } from '@/features/invitation/content';
import { Botanical } from './artwork';
import s from './jamdani.module.css';

export function PhotoReel({
  photos,
  locale,
  failed,
  onFailure,
  onOpen,
  dialogOpen,
}: {
  photos: NonNullable<Invitation['photos']>;
  locale: Locale;
  failed: string[];
  onFailure: (src: string) => void;
  onOpen: (id: string) => void;
  dialogOpen: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [activeId, setActiveId] = useState(photos[0]?.id);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const t = words[locale];
  const active = Math.max(
    0,
    photos.findIndex((photo) => photo.id === activeId),
  );
  const photo = photos[active];
  const playing =
    photos.length > 1 && motionAllowed && visible && pageVisible && !paused && !engaged && !dialogOpen;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const page = element.closest('[data-motion]');
    const motion = () =>
      setMotionAllowed(!!media && !media.matches && page?.getAttribute('data-motion') !== 'quiet');
    const visibility = () => setPageVisible(!document.hidden);
    motion();
    visibility();
    media?.addEventListener?.('change', motion);
    document.addEventListener('visibilitychange', visibility);
    const changes = new MutationObserver(motion);
    if (page) changes.observe(page, { attributes: true, attributeFilter: ['data-motion'] });
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 })
        : null;
    observer?.observe(element);
    return () => {
      observer?.disconnect();
      changes.disconnect();
      media?.removeEventListener?.('change', motion);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    if (!photos.some((item) => item.id === activeId)) setActiveId(photos[0]?.id);
  }, [photos, activeId]);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setActiveId(photos[(active + 1) % photos.length].id), 5000);
    return () => clearTimeout(timer);
  }, [playing, active, photos]);

  function choose(index: number) {
    setPaused(true);
    setActiveId(photos[(index + photos.length) % photos.length].id);
  }
  if (!photo) return null;
  return (
    <div
      ref={root}
      className={s.photoReel}
      role="region"
      aria-roledescription={t.carousel}
      aria-label={t.photoTitle}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false);
      }}
      onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        choose(active + (event.key === 'ArrowRight' ? 1 : -1));
      }}
    >
      <div
        className={s.reelStage}
        onTouchStart={(event) => {
          const point = event.touches[0];
          touch.current = event.touches.length === 1 && point ? { x: point.clientX, y: point.clientY } : null;
          setPaused(true);
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
          choose(active + (delta < 0 ? 1 : -1));
        }}
      >
        <button
          className={s.reelPhoto}
          onClick={() => {
            setPaused(true);
            onOpen(photo.id);
          }}
          aria-label={`${t.photoOpen} ${number(active + 1, locale)}`}
        >
          {failed.includes(photo.src) ? (
            <span className={s.photoFallback}>
              <Botanical />
              {t.photoMissing}
            </span>
          ) : (
            <img
              key={photo.src}
              src={photo.src}
              srcSet={photo.responsiveSrcSet}
              sizes="(max-width: 700px) 100vw, 640px"
              alt={locale === 'bn' ? photo.altBn || photo.alt : photo.alt}
              loading="lazy"
              decoding="async"
              width={640}
              height={800}
              style={{ objectPosition: photo.position || 'center' }}
              onError={() => onFailure(photo.src)}
            />
          )}
          <span className={s.photoExpand}>
            <Plus size={18} />
          </span>
        </button>
        {photos.length > 1 && (
          <>
            <button
              className={`${s.reelArrow} ${s.reelPrevious}`}
              aria-label={t.previous}
              onClick={() => choose(active - 1)}
            >
              <ArrowLeft size={19} />
            </button>
            <button
              className={`${s.reelArrow} ${s.reelNext}`}
              aria-label={t.next}
              onClick={() => choose(active + 1)}
            >
              <ArrowRight size={19} />
            </button>
          </>
        )}
        <span className={s.reelIndex} aria-hidden="true">
          {number(active + 1, locale, 2)} / {number(photos.length, locale, 2)}
        </span>
      </div>
      <div className={s.reelCaption}>
        <span>{t.photoCaption}</span>
        {photos.length > 1 && (
          <button aria-pressed={paused} disabled={!motionAllowed} onClick={() => setPaused(!paused)}>
            {paused || !motionAllowed ? <Play size={14} /> : <Pause size={14} />}
            {paused || !motionAllowed ? t.playPhotos : t.pausePhotos}
          </button>
        )}
      </div>
      {photos.length > 1 && (
        <div className={s.reelThumbnails} aria-label={t.choosePhoto}>
          {photos.map((item, index) => (
            <button
              key={item.id}
              aria-label={`${t.choosePhoto} ${number(index + 1, locale)}`}
              aria-pressed={index === active}
              onClick={() => choose(index)}
            >
              {failed.includes(item.src) ? (
                <span aria-hidden="true">✧</span>
              ) : (
                <img
                  src={item.thumbnailSrc || item.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={80}
                  height={80}
                  style={{ objectPosition: item.position || 'center' }}
                  onError={() => onFailure(item.src)}
                />
              )}
              <span>{number(index + 1, locale, 2)}</span>
            </button>
          ))}
        </div>
      )}
      <span className={s.srOnly} aria-live={playing ? 'off' : 'polite'}>
        {t.photoSlide} {number(active + 1, locale)} / {number(photos.length, locale)}
      </span>
    </div>
  );
}
