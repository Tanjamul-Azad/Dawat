'use client';
import { useEffect } from 'react';

// Public-site motion: sections rise in as they scroll into view (card groups one after another),
// the hero art drifts with the pointer and cards marked `data-glow` follow it with a soft light.
// Content already on screen is never hidden, and nothing runs for reduced motion.
const STAGGER = 70;
const MAX_STAGGER = 6;

function isGroup(el: Element) {
  if (el.children.length < 3) return false;
  const display = getComputedStyle(el).display;
  return display.includes('grid') || display.includes('flex');
}

export function usePageMotion() {
  useEffect(() => {
    const main = document.getElementById('public-main');
    if (!main || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cleanups: (() => void)[] = [];

    if ('IntersectionObserver' in window) {
      const fold = innerHeight * 0.92;
      const hide = (el: HTMLElement, delay = 0) => {
        if (el.getBoundingClientRect().top < fold || el.dataset.motion) return;
        el.dataset.motion = 'hidden';
        if (delay) el.style.setProperty('--motion-delay', `${delay}ms`);
        observer.observe(el);
      };
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            observer.unobserve(el);
            el.dataset.motion = 'shown';
            // Hand transforms back to the element's own hover and tilt styles once settled.
            const delay = parseFloat(el.style.getPropertyValue('--motion-delay')) || 0;
            window.setTimeout(() => {
              delete el.dataset.motion;
              el.style.removeProperty('--motion-delay');
            }, 900 + delay);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
      );
      for (const section of main.querySelectorAll(':scope > section, :scope > * > section')) {
        for (const child of Array.from(section.children) as HTMLElement[]) {
          if (isGroup(child) && getComputedStyle(child).overflowX !== 'auto') {
            Array.from(child.children).forEach((item, i) => hide(item as HTMLElement, Math.min(i, MAX_STAGGER) * STAGGER));
          } else hide(child);
        }
      }
      cleanups.push(() => observer.disconnect());
    }

    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const hero = main.querySelector<HTMLElement>('[data-parallax]');
      let frame = 0;
      const move = (event: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (hero) {
            const box = hero.getBoundingClientRect();
            if (event.clientY >= box.top && event.clientY <= box.bottom) {
              hero.style.setProperty('--px', ((event.clientX - box.left) / box.width - 0.5).toFixed(3));
              hero.style.setProperty('--py', ((event.clientY - box.top) / box.height - 0.5).toFixed(3));
            }
          }
          const card = (event.target as Element | null)?.closest<HTMLElement>('[data-glow]');
          if (card) {
            const box = card.getBoundingClientRect();
            card.style.setProperty('--gx', `${event.clientX - box.left}px`);
            card.style.setProperty('--gy', `${event.clientY - box.top}px`);
          }
        });
      };
      main.addEventListener('pointermove', move, { passive: true });
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        main.removeEventListener('pointermove', move);
      });
    }
    return () => cleanups.forEach((done) => done());
  }, []);
}
