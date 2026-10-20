'use client';
import { useEffect, useRef, useState } from 'react';

/** Progressive enhancement: content stays visible without observers or motion. */
export function useInvitationMotion(enabled: boolean) {
  const page = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState('events');
  const [navigationVisible, setNavigationVisible] = useState(false);
  useEffect(() => {
    const root = page.current;
    if (!enabled || !root) return;
    const visibility = () => root.setAttribute('data-page-hidden', String(document.hidden));
    visibility();
    document.addEventListener('visibilitychange', visibility);
    if (!('IntersectionObserver' in window)) {
      setNavigationVisible(true);
      return () => document.removeEventListener('visibilitychange', visibility);
    }
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target.hasAttribute('data-phase')) {
            root.setAttribute('data-cover-visible', String(entry.isIntersecting));
            continue;
          }
          if (!entry.isIntersecting) continue;
          if (!media?.matches) entry.target.setAttribute('data-entered', 'true');
          reveals.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );
    root.querySelectorAll('[data-reveal]').forEach((element) => reveals.observe(element));
    const cover = root.querySelector('[data-phase]');
    if (cover) reveals.observe(cover);
    const chapters = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
        if (current) {
          setNavigationVisible(true);
          if (current.target.id !== 'welcome') setChapter(current.target.id);
        }
      },
      { rootMargin: '-15% 0px -55% 0px' },
    );
    root
      .querySelectorAll('#welcome, #events, #moments, #rsvp')
      .forEach((element) => chapters.observe(element));
    return () => {
      reveals.disconnect();
      chapters.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [enabled]);
  return { page, chapter, navigationVisible };
}
