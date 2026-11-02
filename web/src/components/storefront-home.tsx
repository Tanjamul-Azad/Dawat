'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import Lenis from 'lenis';
import { ArrowRight, Flower2, MessageCircle, ShieldCheck, UsersRound } from 'lucide-react';
import { whatsappLink } from '@/features/production/catalog';
import type { PaymentReviewPromise } from '@/features/production/public-config';
import { useProductLocale } from './production/product-locale';
import { StorefrontFrame, StickyCta } from './storefront-chrome';
import { Pricing, TemplateCollection } from './storefront';
import { FAQ, FounderNote, PromiseBlock, Reviews } from './storefront-trust';
import { HowItWorks, JourneyStrip, RsvpDemo } from './storefront-how';
import { NAME_LIMIT, type CoupleNames } from './storefront-names';
import { BondHero } from './storefront-hero';
import s from './storefront-home.module.css';
import st from './storefront.module.css';
import x from './storefront-sections.module.css';

// The public homepage: designs, the guest's journey, how it works, our promise, pricing and questions,
// opened by a two-thread মিলবন্ধন hero, a story that fills in as you read and an envelope that opens with the scroll.
// Scenes publish their scroll progress as `--p`; CSS turns that into each stage.

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -72 } });
    return () => lenis.destroy();
  }, []);
}

// Writes each `[data-scene]` element's progress through its own scroll length as `--p`.
function useSceneProgress() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      for (const scene of document.querySelectorAll<HTMLElement>('[data-scene]')) {
        const box = scene.getBoundingClientRect();
        const view = scene.dataset.scene === 'view';
        const span = view ? box.height + innerHeight : box.height - innerHeight;
        const p = clamp(span > 0 ? (view ? innerHeight - box.top : -box.top) / span : 0);
        scene.style.setProperty('--p', p.toFixed(4));
        if (scene.dataset.stages) scene.dataset.stage = String(p < 0.15 ? 0 : p < 0.4 ? 1 : p < 0.7 ? 2 : 3);
        if (scene.dataset.stages) scene.dataset.flap = p > 0.27 ? 'open' : 'closed';
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', request);
      removeEventListener('resize', request);
    };
  }, []);
}

/** The live storefront's three values, introduced by a line that fills in word by word. */
function Story() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const words = t(
    'বিয়ে শুধু দুটি মানুষের নয়, দুটি পরিবারের মিলবন্ধন। সেই বাঁধনের প্রথম খবর পৌঁছায় দাওয়াতে — তাই প্রতিটি দাওয়াত আমরা বুনি যত্ন করে।',
    'A wedding ties together two families, not just two people. The first news of that bond travels in an invitation — so we weave every one with care.',
  ).split(' ');
  const values = [
    [
      <Flower2 key="i" size={20} aria-hidden="true" />,
      t('বাংলার নকশা, আধুনিক আয়োজনে', 'Bengali craft for a modern celebration'),
    ],
    [
      <UsersRound key="i" size={20} aria-hidden="true" />,
      t('প্রতিটি পরিবারের নামে আলাদা লিংক', 'A separate link for every family'),
    ],
    [
      <ShieldCheck key="i" size={20} aria-hidden="true" />,
      t('উত্তর আর শুভেচ্ছা শুধু আপনার কাছে', 'Replies and wishes reach only you'),
    ],
  ] as const;
  return (
    <section className={s.story} data-scene="view" aria-labelledby="story-title">
      <svg
        data-motion="static"
        className={s.storyThreads}
        viewBox="0 0 200 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path pathLength={1} d="M70 0C70 160 150 200 130 340S40 520 70 660 150 860 110 1000" />
        <path pathLength={1} d="M130 0C130 160 50 200 70 340S160 520 130 660 50 860 90 1000" />
      </svg>
      <h2 id="story-title" className={s.statement} style={{ '--n': words.length } as CSSProperties}>
        {words.map((word, i) => (
          <span key={i} style={{ '--i': i } as CSSProperties}>
            {word}{' '}
          </span>
        ))}
      </h2>
      <ul className={s.values}>
        {values.map(([icon, text]) => (
          <li key={text}>
            {icon}
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What the guest sees: the seal breaks, the flap lifts and the letter rises with their names. */
function EnvelopeMoment() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [names, setNames] = useState<CoupleNames>({ first: '', second: '' });
  const couple = [names.first || t('মেহরিন', 'Mehrin'), names.second || t('আরিব', 'Arib')];
  return (
    <section className={s.envelopeScene} data-scene="pin" data-stages aria-labelledby="envelope-title">
      <div className={s.sticky} data-motion="static">
        <div className={s.steps}>
          <span className={st.eyebrow}>{t('অতিথি যা দেখেন', 'WHAT YOUR GUESTS SEE')}</span>
          <h2 id="envelope-title">{t('খাম খুললেই উৎসব', 'The celebration begins with the envelope')}</h2>
          <ol>
            <li>{t('সিলমোহর ভাঙে', 'The seal breaks')}</li>
            <li>{t('খাম খোলে', 'The flap lifts')}</li>
            <li>{t('চিঠি উঠে আসে', 'The letter rises')}</li>
            <li>{t('আপনাদের নাম, আপনাদের দিন', 'Your names, your day')}</li>
          </ol>
          <fieldset className={s.nameFields}>
            <legend>{t('নিজেদের নাম লিখে দেখুন', 'Try your own names')}</legend>
            <label>
              <span>{t('প্রথম নাম', 'First name')}</span>
              <input
                value={names.first}
                placeholder={t('মেহরিন', 'Mehrin')}
                maxLength={NAME_LIMIT}
                onChange={(e) => setNames({ ...names, first: e.target.value })}
              />
            </label>
            <label>
              <span>{t('দ্বিতীয় নাম', 'Second name')}</span>
              <input
                value={names.second}
                placeholder={t('আরিব', 'Arib')}
                maxLength={NAME_LIMIT}
                onChange={(e) => setNames({ ...names, second: e.target.value })}
              />
            </label>
          </fieldset>
        </div>
        <div className={s.stage}>
          <div className={s.envelope}>
            <div className={s.back} aria-hidden="true" />
            <article className={s.letter} aria-label={t('নমুনা দাওয়াত', 'Sample invitation')}>
              <div className={s.letterInner}>
                <span>{t('শুভ বিবাহ', 'THE WEDDING OF')}</span>
                <strong>{couple[0]}</strong>
                <i>{t('ও', '&')}</i>
                <strong>{couple[1]}</strong>
                <small>
                  {t(
                    'শনিবার · ১২ ডিসেম্বর ২০২৬ · বনানী, ঢাকা',
                    'Saturday · 12 December 2026 · Banani, Dhaka',
                  )}
                </small>
              </div>
            </article>
            <div className={s.pocket} aria-hidden="true" />
            <div className={s.flap} aria-hidden="true" />
            <div className={s.seal} aria-hidden="true">
              <span>{t('দ', 'D')}</span>
              <span>{t('দ', 'D')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <section className={s.closing} aria-labelledby="closing-title">
      <svg className={s.closingKnot} viewBox="-60 -30 120 60" aria-hidden="true">
        <path d="M-60 -18C-30 -18 -24 0 -8 0" />
        <path d="M60 -12C30 -12 24 0 8 0" />
        <ellipse cx="-8" cy="0" rx="14" ry="8" transform="rotate(-30 -8 0)" />
        <ellipse cx="8" cy="0" rx="14" ry="8" transform="rotate(30 8 0)" />
      </svg>
      <h2 id="closing-title">
        {t('আপনাদের মিলবন্ধনের খবর', 'Let the news of your union')}
        <br />
        <em>{t('সুন্দর করে পৌঁছে যাক', 'arrive beautifully')}</em>
      </h2>
      <div className={s.closingActions}>
        <a className={s.closeCta} href="#collection">
          {t('নকশা বেছে নিন', 'Choose a design')} <ArrowRight size={16} aria-hidden="true" />
        </a>
        <a className={s.closeGhost} href={whatsappLink()} target="_blank" rel="noreferrer">
          <MessageCircle size={16} aria-hidden="true" /> {t('WhatsApp-এ কথা বলুন', 'Chat on WhatsApp')}
        </a>
      </div>
    </section>
  );
}

export function StorefrontHome({ paymentPromise }: { paymentPromise?: PaymentReviewPromise }) {
  useSmoothScroll();
  useSceneProgress();
  return (
    <StorefrontFrame overlay>
      <div className={s.root}>
        <BondHero />
        <Story />
        <TemplateCollection />
        <EnvelopeMoment />
        <JourneyStrip />
        <div className={x.bandIvory}>
          <HowItWorks />
          <RsvpDemo />
        </div>
        <div className={x.bandWine}>
          <PromiseBlock paymentPromise={paymentPromise} />
        </div>
        <Pricing paymentDetails={false} />
        <Reviews />
        <FounderNote />
        <div className={x.bandIvory}>
          <FAQ paymentPromise={paymentPromise} />
        </div>
        <Closing />
      </div>
      <StickyCta />
    </StorefrontFrame>
  );
}
