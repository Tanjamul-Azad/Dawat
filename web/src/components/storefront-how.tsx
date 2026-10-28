'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, X } from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import x from './storefront-sections.module.css';
import s from './storefront.module.css';

/** A phone-shaped frame around a real screenshot of the app, taken from the local demo with made-up data. */
export function PhoneFrame({
  step,
  width,
  height,
  alt,
  priority = false,
}: {
  step: number;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
}) {
  const base = `/brand/steps/step-${step}`;
  return (
    <div className={x.phone}>
      <img
        src={`${base}-400.webp`}
        srcSet={`${base}-400.webp 400w, ${base}-800.webp 800w`}
        sizes="(min-width: 1024px) 220px, 200px"
        width={width}
        height={height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

const stepShots = [
  { alt: ['নকশার সংগ্রহের পাতা', 'The design collection page'], size: [400, 866] },
  { alt: ['অর্ডার শুরুর পাতা', 'The order page'], size: [400, 866] },
  { alt: ['নমুনা আমন্ত্রণের প্রথম পাতা', 'The first page of a sample invitation'], size: [400, 866] },
  { alt: ['অতিথির উত্তর দেওয়ার পাতা', 'The page where a guest replies'], size: [400, 866] },
] as const;

/** Fills the step line as the visitor scrolls. With reduced motion the line is simply full. */
function useStepProgress(count: number) {
  const list = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(0);
  useEffect(() => {
    const node = list.current;
    if (!node) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      node.style.setProperty('--progress', '1');
      setReached(count);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.62 - box.top) / box.height));
      node.style.setProperty('--progress', progress.toFixed(3));
      setReached(Math.min(count, Math.ceil(progress * count - 0.2)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);
  return { list, reached };
}

export function HowItWorks() {
  const { locale } = useProductLocale();
  const i = locale === 'bn' ? 0 : 1;
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const steps = [
    {
      title: t('নকশা বেছে নিন', 'Pick a design'),
      body: t(
        'ছয়টি নকশা থেকে পছন্দেরটা বাছুন। নিজেদের নাম লিখে দেখে নিন কেমন লাগে।',
        'Choose from six designs. Type your own names to see how it looks.',
      ),
    },
    {
      title: t('অর্ডার করে পেমেন্ট দিন', 'Order and pay'),
      body: t(
        'ইমেইলে লগইন করে আয়োজনের তথ্য দিন। দাম আর শর্ত দেখে bKash-এ পেমেন্ট করুন।',
        'Log in with your email and add your event details. Check the price and terms, then pay by bKash.',
      ),
    },
    {
      title: t('আমন্ত্রণ সাজান', 'Set up your invitation'),
      body: t(
        'নাম, অনুষ্ঠান আর ছবি দিন। আপনার আমন্ত্রণ দেখতে এমন হবে। সব ঠিক থাকলে অতিথিদের জন্য চালু করুন।',
        'Add names, events and photos. This is how your invitation will look. When it looks right, open it to your guests.',
      ),
    },
    {
      title: t('অতিথিদের পাঠান', 'Send it to your guests'),
      body: t(
        'নাম ধরে আলাদা লিংক, নয়তো সবার জন্য একটি লিংক। দুটোই আপনার নিজের WhatsApp থেকে যায়। অতিথি ছবির এই পাতায় উত্তর দেন, আপনি সব উত্তর এক জায়গায় দেখেন।',
        'Either a personal link for each family, or one link for everyone. Both go out from your own WhatsApp. Guests reply on the page shown here, and you see every reply in one place.',
      ),
    },
  ];
  const { list, reached } = useStepProgress(steps.length);
  return (
    <section id="how-it-works" className={x.how} aria-labelledby="how-title">
      <div className={x.howHead}>
        <span className={s.eyebrow}>{t('কীভাবে কাজ করে', 'HOW IT WORKS')}</span>
        <h2 id="how-title">{t('চার ধাপে আপনার আমন্ত্রণ তৈরি', 'Your invitation in four steps')}</h2>
        <p>
          {t(
            'ছবিগুলো আসল সাইট থেকে নেওয়া। নাম আর তথ্য কাল্পনিক।',
            'These are real screens from the site. Names and details are made up.',
          )}
        </p>
      </div>
      <ol ref={list} className={x.stepList}>
        {steps.map((step, index) => (
          <li key={step.title} data-reached={index < reached || undefined}>
            <b aria-hidden="true">{locale === 'bn' ? ['১', '২', '৩', '৪'][index] : index + 1}</b>
            <div className={x.stepText}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
            <PhoneFrame
              step={index + 1}
              width={stepShots[index].size[0]}
              height={stepShots[index].size[1]}
              alt={stepShots[index].alt[i]}
            />
          </li>
        ))}
      </ol>
      <div className={x.howCta}>
        <a className={s.primary} href="/demo/">
          {t('লাইভ নমুনা আমন্ত্রণ খুলুন', 'Open a live sample invitation')} <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}

type Reply = 'yes' | 'no' | null;
const bnDigits = (n: number) => String(n).replace(/[0-9]/g, (d) => String.fromCharCode(0x09e6 + Number(d)));

/** A tiny, made-up RSVP: the guest answers on the left and the host's list updates on the right. Nothing is saved. */
export function RsvpDemo() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [reply, setReply] = useState<Reply>(null);
  const others = [
    { name: t('চৌধুরী পরিবার', 'Chowdhury family'), state: 'yes' as const },
    { name: t('সালমা খালা', 'Aunt Salma'), state: 'wait' as const },
  ];
  const yes = others.filter((o) => o.state === 'yes').length + (reply === 'yes' ? 1 : 0);
  const no = reply === 'no' ? 1 : 0;
  const waiting = others.filter((o) => o.state === 'wait').length + (reply === null ? 1 : 0);
  const label = (state: 'yes' | 'no' | 'wait') =>
    state === 'yes'
      ? t('আসবেন', 'Coming')
      : state === 'no'
        ? t('আসবেন না', 'Not coming')
        : t('উত্তর বাকি', 'No reply yet');
  return (
    <section className={x.rsvp} aria-labelledby="rsvp-title">
      <div className={x.rsvpIntro}>
        <span className={s.eyebrow}>{t('উত্তরের হিসাব', 'REPLIES')}</span>
        <h2 id="rsvp-title">
          {t('অতিথি উত্তর দিলেই আপনার তালিকায় চলে আসে', 'A guest replies, your list updates')}
        </h2>
        <p>
          {t(
            'নিচের নমুনায় বাঁ দিকে উত্তর দিয়ে দেখুন। এটা শুধু নমুনা, কিছু সেভ হয় না।',
            'Reply on the left in this sample and watch the list. It is only a demo; nothing is saved.',
          )}
        </p>
      </div>
      <div className={x.rsvpBoard}>
        <div className={x.rsvpCard}>
          <small>{t('অতিথির ফোনে', 'On the guest’s phone')}</small>
          <h3>{t('রহমান পরিবার, আপনারা আসবেন তো?', 'Rahman family, will you join us?')}</h3>
          <div className={x.rsvpButtons} role="group" aria-label={t('উত্তর বেছে নিন', 'Choose a reply')}>
            <button aria-pressed={reply === 'yes'} onClick={() => setReply('yes')}>
              <Check size={16} aria-hidden="true" /> {t('আসব', 'We’ll come')}
            </button>
            <button aria-pressed={reply === 'no'} onClick={() => setReply('no')}>
              <X size={16} aria-hidden="true" /> {t('আসব না', 'We can’t')}
            </button>
          </div>
          {reply && (
            <button className={x.rsvpReset} onClick={() => setReply(null)}>
              {t('আবার চেষ্টা করুন', 'Try again')}
            </button>
          )}
        </div>
        <ArrowRight className={x.rsvpArrow} size={22} aria-hidden="true" />
        <div className={x.rsvpList} aria-live="polite">
          <small>{t('আপনার অতিথি তালিকায়', 'In your guest list')}</small>
          <ul>
            {others.map((o) => (
              <li key={o.name} data-state={o.state}>
                <span>{o.name}</span>
                <em>{label(o.state)}</em>
              </li>
            ))}
            <li key={reply ?? 'wait'} data-state={reply ?? 'wait'} data-fresh={reply ? '' : undefined}>
              <span>{t('রহমান পরিবার', 'Rahman family')}</span>
              <em>{label(reply ?? 'wait')}</em>
            </li>
          </ul>
          <p className={x.rsvpTotals}>
            {t(
              `আসবেন ${bnDigits(yes)} · আসবেন না ${bnDigits(no)} · উত্তর বাকি ${bnDigits(waiting)}`,
              `Coming ${yes} · Not coming ${no} · Waiting ${waiting}`,
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
