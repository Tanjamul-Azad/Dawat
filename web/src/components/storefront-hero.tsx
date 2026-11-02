'use client';
import { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import s from './storefront-home.module.css';
import st from './storefront.module.css';

// গাঁটছড়া: two threads, one from each family, come in from either edge and tie a knot.
// They are soft strings — a pointer or finger can pluck them — and the knot tightens as the page
// scrolls on. An alpana drawn around the knot shows more strongly wherever the pointer goes.

type Point = { x: number; y: number; px: number; py: number; pinned: boolean };
type Rope = { points: Point[]; colour: string; shine: string; rest: number; tail: boolean };

// The storefront's own wine and gold.
const RED = '#741126';
const RED_SHINE = '#c4566a';
const GOLD = '#a2742c';
const GOLD_SHINE = '#e3c48e';
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function rope(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  count: number,
  colour: string,
  shine: string,
  tail = false,
): Rope {
  const points = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    return { x, y, px: x, py: y, pinned: i === 0 || (!tail && i === count - 1) };
  });
  return { points, colour, shine, rest: Math.hypot(bx - ax, by - ay) / (count - 1), tail };
}

function Alpana({ lit = false }: { lit?: boolean }) {
  const ring = (count: number, d: string, className: string) =>
    Array.from({ length: count }, (_, i) => (
      <path key={i} d={d} transform={`rotate(${(i * 360) / count})`} pathLength={1} className={className} />
    ));
  return (
    <svg className={s.alpana} viewBox="-500 -500 1000 1000" aria-hidden="true" data-lit={lit || undefined}>
      <g>{ring(24, 'M0-360C34-392 34-432 0-470-34-432-34-392 0-360Z', s.alpanaOuter)}</g>
      <circle r="350" pathLength={1} className={s.alpanaRing} />
      <g className={s.alpanaDots}>
        {Array.from({ length: 48 }, (_, i) => (
          <circle key={i} r="4.5" cx="0" cy="-326" transform={`rotate(${i * 7.5})`} />
        ))}
      </g>
      <g>{ring(12, 'M0-170C70-210 70-270 0-320-70-270-70-210 0-170Z', s.alpanaLotus)}</g>
      <circle r="150" pathLength={1} className={s.alpanaRing} />
      <g>{ring(16, 'M0-62C18-80 18-100 0-126-18-100-18-80 0-62Z', s.alpanaInner)}</g>
      <circle r="48" pathLength={1} className={s.alpanaRing} />
    </svg>
  );
}

export function GaathchhoraHero() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const hero = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = hero.current;
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!el || !cv || !ctx) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0;
    let H = 0;
    let knot = { x: 0, y: 0 };
    let ropes: Rope[] = [];
    let frame = 0;
    let visible = true;
    const pointer = { x: -1e4, y: -1e4, active: false };
    const started = performance.now();

    const layout = () => {
      const box = el.getBoundingClientRect();
      W = box.width;
      H = box.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Must match --ky in the stylesheet.
      const phone = W <= 760;
      knot = { x: W / 2, y: H * (phone ? 0.52 : 0.64) };
      const n = phone ? 30 : 46;
      const tailLength = H * (phone ? 0.1 : 0.14);
      ropes = [
        rope(-24, knot.y - H * 0.16, knot.x - 6, knot.y, n, RED, RED_SHINE),
        rope(W + 24, knot.y - H * 0.11, knot.x + 6, knot.y, n, GOLD, GOLD_SHINE),
        rope(knot.x - 4, knot.y + 6, knot.x - 26, knot.y + tailLength, 14, RED, RED_SHINE, true),
        rope(knot.x + 4, knot.y + 6, knot.x + 30, knot.y + tailLength * 0.9, 14, GOLD, GOLD_SHINE, true),
      ];
    };

    const step = (now: number, slack: number) => {
      const reach = W <= 760 ? 70 : 95;
      for (const r of ropes) {
        r.points.forEach((p, i) => {
          if (p.pinned) return;
          const vx = (p.x - p.px) * 0.982;
          const vy = (p.y - p.py) * 0.982;
          p.px = p.x;
          p.py = p.y;
          p.x += vx + (r.tail ? Math.sin(now / 900 + i * 0.4) * 0.03 : 0);
          p.y += vy + (r.tail ? 0.28 : 0.16);
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d > 0.1 && d < reach) {
              const push = ((reach - d) / reach) * 2.2;
              p.x += (dx / d) * push;
              p.y += (dy / d) * push;
            }
          }
        });
      }
      for (let k = 0; k < 14; k++) {
        for (const r of ropes) {
          const rest = r.rest * (r.tail ? 1 : slack);
          for (let i = 0; i < r.points.length - 1; i++) {
            const a = r.points[i];
            const b = r.points[i + 1];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.hypot(dx, dy) || 0.001;
            const diff = (d - rest) / d;
            const share = a.pinned || b.pinned ? 1 : 0.5;
            if (!a.pinned) {
              a.x += dx * diff * share;
              a.y += dy * diff * share;
            }
            if (!b.pinned) {
              b.x -= dx * diff * share;
              b.y -= dy * diff * share;
            }
          }
        }
      }
    };

    const trace = (points: Point[], upto: number) => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      const last = Math.max(1, Math.floor(upto));
      for (let i = 1; i < last; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2;
        const my = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }
      ctx.lineTo(points[last].x, points[last].y);
    };

    const draw = (intro: number) => {
      ctx.clearRect(0, 0, W, H);
      const thick = W <= 760 ? 3 : 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ropes.forEach((r, index) => {
        const amount = r.tail ? clamp((intro - 0.85) / 0.15) : clamp(intro / 0.85);
        if (amount <= 0) return;
        const upto = r.tail ? r.points.length - 1 : amount * (r.points.length - 1);
        ctx.globalAlpha = r.tail ? amount : 1;
        trace(r.points, upto);
        ctx.strokeStyle = r.colour;
        ctx.lineWidth = thick;
        ctx.setLineDash([]);
        ctx.stroke();
        // A light dashed line along the cord reads as twisted thread.
        ctx.strokeStyle = r.shine;
        ctx.lineWidth = thick * 0.38;
        ctx.setLineDash([5, 7]);
        ctx.lineDashOffset = index * 3;
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      const tie = clamp((intro - 0.8) / 0.2);
      if (tie > 0) {
        const pop = tie < 1 ? 0.6 + 0.55 * Math.sin(tie * Math.PI * 0.75) : 1;
        ctx.save();
        ctx.translate(knot.x, knot.y);
        ctx.scale(pop, pop);
        ctx.lineWidth = thick + 1;
        ctx.strokeStyle = RED;
        ctx.beginPath();
        ctx.ellipse(-9, 0, 15, 9, -0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = GOLD;
        ctx.beginPath();
        ctx.ellipse(9, 0, 15, 9, 0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#5a0c1c';
        ctx.beginPath();
        ctx.arc(0, 0, thick + 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const scrollSlack = () => {
      const box = el.getBoundingClientRect();
      return 1.12 - 0.09 * clamp(-box.top / Math.max(1, box.height));
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible) return;
      const elapsed = (now - started) / 1900;
      const intro = clamp(1 - Math.pow(1 - clamp(elapsed), 3));
      if (intro >= 1) el.dataset.tied = 'true';
      step(now, scrollSlack());
      draw(intro);
      frame = requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.active = true;
      el.style.setProperty('--mx', `${pointer.x.toFixed(0)}px`);
      el.style.setProperty('--my', `${pointer.y.toFixed(0)}px`);
      el.dataset.reveal = 'true';
    };
    const leave = () => {
      pointer.active = false;
      delete el.dataset.reveal;
    };

    layout();
    if (still) {
      for (let i = 0; i < 400; i++) step(0, 1.12);
      draw(1);
      el.dataset.tied = 'true';
      const redraw = () => {
        layout();
        for (let i = 0; i < 400; i++) step(0, 1.12);
        draw(1);
      };
      addEventListener('resize', redraw);
      return () => removeEventListener('resize', redraw);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerdown', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerup', (event) => event.pointerType !== 'mouse' && leave());
    addEventListener('resize', layout);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerdown', move);
      el.removeEventListener('pointerleave', leave);
      removeEventListener('resize', layout);
    };
  }, []);

  return (
    <section ref={hero} className={s.hero} aria-labelledby="hero-title">
      <div className={s.alpanaWrap} aria-hidden="true">
        <Alpana />
      </div>
      <div className={`${s.alpanaWrap} ${s.alpanaReveal}`} aria-hidden="true">
        <Alpana lit />
      </div>
      <canvas ref={canvas} className={s.threads} aria-hidden="true" />
      <span className={s.knotLabel} aria-hidden="true">
        {t('গাঁটছড়া', 'tied together')}
      </span>

      <div className={s.heroTop} data-motion="static">
        <p className={s.kicker}>
          <span>{t('বিয়ের ডিজিটাল দাওয়াত', 'Digital wedding invitations')}</span>
          <span>{t('হলুদ · আকদ · বিয়ে · বৌভাত', 'Holud · Akd · Wedding · Bou-bhat')}</span>
        </p>
        <h1 id="hero-title" className={s.title}>
          <span>{t('দুটি সুতো,', 'Two threads,')}</span>
          <span>
            {t('একটি ', 'one ')}
            <em>{t('বাঁধন', 'bond')}</em>
            {t('।', '.')}
          </span>
        </h1>
      </div>

      <div className={s.heroFoot} data-motion="static">
        <p>
          {t(
            'দুই পরিবারের মিলবন্ধনের খবর পৌঁছে দিন যত্ন করে। বাংলার ঐতিহ্যে সাজানো আমন্ত্রণ, প্রতিটি পরিবারের নামে আলাদা লিংক, আর সবার উত্তর এক জায়গায়।',
            'Share the news of two families becoming one, with care. Invitations in the Bengali tradition, a separate link for every family and every reply in one place.',
          )}
        </p>
        <div className={s.heroActions}>
          <a className={st.primary} href="#collection">
            {t('নকশা বেছে নিন', 'Choose a design')} <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className={st.secondary} href="/demo/">
            {t('লাইভ নমুনা দেখুন', 'See a live sample')} <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
      <p className={s.hint} aria-hidden="true">
        {t('সুতো ছুঁয়ে দেখুন', 'Touch the threads')}
      </p>
    </section>
  );
}
