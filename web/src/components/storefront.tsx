'use client';
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Flower2,
  MessageCircle,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import { templates, prices, whatsappLink, packageName } from '@/features/production/catalog';
import type { PaymentReviewPromise } from '@/features/production/public-config';
import { taka } from '@/features/production/money';
import s from './storefront.module.css';
import x from './storefront-sections.module.css';
import { ManualPayment } from './manual-payment';
import { LotusMark } from './brand-mark';
import { motion, useReducedMotion } from 'motion/react';
import { StorefrontFrame, StickyCta } from './storefront-chrome';
import { CornerOrnaments, JamdaniDivider } from './storefront-ornaments';
import { FAQ, FounderNote, PromiseBlock, Reviews } from './storefront-trust';
import { HowItWorks, JourneyStrip, RsvpDemo } from './storefront-how';
import { NAME_LIMIT, withNames, type CoupleNames } from './storefront-names';

export { StorefrontFrame, FAQ };

const noNames: CoupleNames = { first: '', second: '' };

export function TemplateCard({
  template,
  selected = false,
  names = noNames,
}: {
  template: (typeof templates)[number];
  /** Already chosen (order page): only offer the live sample. */
  selected?: boolean;
  /** Names typed on the templates page; shown on the card and carried to the order link. */
  names?: CoupleNames;
}) {
  const { locale } = useProductLocale();
  const bn = locale === 'bn';
  const reduceMotion = useReducedMotion();
  const demoHref = `/demo/?template=${template.id}`;
  const tilt = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    event.currentTarget.style.setProperty('--ry', `${((px - 0.5) * 9).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--rx', `${((0.5 - py) * 9).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  };
  const level = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--ry', '0deg');
    event.currentTarget.style.setProperty('--rx', '0deg');
  };
  const label = bn ? template.name : template.en;
  return (
    <motion.article
      className={s.templateCard}
      layout="position"
      initial={false}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
    >
      <a
        href={demoHref}
        onPointerMove={tilt}
        onPointerLeave={level}
        className={`${s.templateArt} ${s[template.id] ?? ''}`}
        style={{ '--card-ink': template.color, '--card-paper': template.paper } as CSSProperties}
        aria-label={`${bn ? 'লাইভ নমুনা খুলুন' : 'Open live sample'} · ${label}`}
      >
        {template.art && (
          <img
            className={s.artBg}
            src={template.art.replace('.webp', '-480.webp')}
            srcSet={`${template.art.replace('.webp', '-480.webp')} 480w, ${template.art} 960w`}
            sizes="(min-width: 1200px) 200px, (min-width: 768px) 30vw, 46vw"
            width={960}
            height={1440}
            alt=""
            loading={selected ? 'eager' : 'lazy'}
            decoding="async"
          />
        )}
        {template.tier === 'premium' && <span className={s.tierBadge}>{packageName('premium', locale)}</span>}
        <div className={s.cardFrame}>
          <span>بِسْمِ اللَّهِ</span>
          <Flower2 size={24} />
          <small>{bn ? 'শুভ বিবাহ' : 'THE WEDDING OF'}</small>
          <strong>
            {names.first || (bn ? 'মেহরিন' : 'Mehrin')}
            <i>&</i>
            {names.second || (bn ? 'আরিব' : 'Arib')}
          </strong>
          <span>{bn ? '১২ . ১২ . ২০২৬' : '12 . 12 . 2026'}</span>
          <small>{bn ? 'ভালোবাসার আমন্ত্রণ' : 'WITH LOVE, ALWAYS'}</small>
        </div>
      </a>
      <div className={s.cardTitle}>
        <h3>{label}</h3>
        <strong>{taka(prices[template.tier], locale)}</strong>
      </div>
      <p className={s.cardMeta}>
        {bn ? template.mood : template.moodEn} · {packageName(template.tier, locale)}
        <span className={s.swatches} aria-hidden="true">
          <i style={{ background: template.paper }} />
          <i style={{ background: template.color }} />
        </span>
      </p>
      <div className={selected ? s.cardButtonsSingle : s.cardButtons}>
        <a href={demoHref}>
          {bn ? 'লাইভ নমুনা' : 'Live sample'} <ArrowUpRight size={14} />
        </a>
        {!selected && (
          <a href={withNames(`/order/requests/?template=${template.id}`, names)}>
            {bn ? 'এটা বেছে নিন' : 'Choose this'} <ArrowRight size={14} />
          </a>
        )}
      </div>
    </motion.article>
  );
}

/** "নিজেদের নাম লিখে দেখুন": the names appear on every card straight away. Nothing leaves the browser. */
function NamePreview({ names, onChange }: { names: CoupleNames; onChange: (next: CoupleNames) => void }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <section className={x.namePreview} aria-labelledby="name-title">
      <div className={x.nameCard}>
        <div>
          <h2 id="name-title">{t('নিজেদের নাম লিখে দেখুন', 'See it with your own names')}</h2>
          <p>{t('নিচের সব নকশায় আপনাদের নাম বসে যাবে।', 'Your names appear on every design below.')}</p>
        </div>
        <div>
          <div className={x.nameFields}>
            <label>
              {t('বরের নাম', 'Groom’s name')}
              <input
                value={names.first}
                maxLength={NAME_LIMIT}
                autoComplete="off"
                placeholder={t('যেমন: আরিব', 'e.g. Arib')}
                onChange={(event) => onChange({ ...names, first: event.target.value })}
              />
            </label>
            <label>
              {t('কনের নাম', 'Bride’s name')}
              <input
                value={names.second}
                maxLength={NAME_LIMIT}
                autoComplete="off"
                placeholder={t('যেমন: মেহরিন', 'e.g. Mehrin')}
                onChange={(event) => onChange({ ...names, second: event.target.value })}
              />
            </label>
          </div>
          <p className={x.nameNote}>
            {t(
              'নামগুলো শুধু আপনার ফোনেই দেখা যায়, কোথাও সেভ হয় না। নকশা বেছে নিলে অর্ডারের ফর্মে এগুলো বসে যাবে।',
              'The names stay on your device and are not saved. If you choose a design, they carry over to your order form.',
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

export function TemplateCollection({ full = false }: { full?: boolean }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [filter, setFilter] = useState('all');
  const [names, setNames] = useState<CoupleNames>(noNames);
  const rail = useRef<HTMLDivElement>(null);
  const collectionOrder = ['jamdani', 'garden', 'midnight', 'holud', 'rose', 'ivory'];
  const list = [...templates]
    .sort((a, b) => collectionOrder.indexOf(a.id) - collectionOrder.indexOf(b.id))
    .filter((item) => filter === 'all' || item.tier === filter);
  return (
    <>
      <section className={`${s.collection} ${full ? s.fullCollection : ''}`} id="collection">
        <div className={s.sectionHeading}>
          <div>
            <span className={s.eyebrow}>
              {full
                ? t('ছয়টি নিজস্ব নকশা', 'SIX ORIGINAL DESIGNS')
                : t('আমাদের নকশা', 'THE DAWAT COLLECTION')}
            </span>
            {full ? (
              <h1>
                {t(
                  'আপনাদের বিয়ের ডিজিটাল আমন্ত্রণ, আপনাদের মতো করে',
                  'Your wedding invitation, made to feel like you.',
                )}
              </h1>
            ) : (
              <h2>{t('আপনার গল্পের সঙ্গে মানানসই নকশা', 'Find the one that feels like you')}</h2>
            )}
            <p>
              {t(
                'প্রতিটি নকশার লাইভ নমুনা খুলে দেখুন, পুরো আমন্ত্রণ কেমন হবে বুঝে যাবেন।',
                'Open the live sample of any design to see the whole invitation.',
              )}
            </p>
          </div>
          {!full && (
            <div className={s.railControls}>
              <button
                aria-label={t('আগের নকশা', 'Previous designs')}
                onClick={() => rail.current?.scrollBy({ left: -360, behavior: 'smooth' })}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label={t('পরের নকশা', 'Next designs')}
                onClick={() => rail.current?.scrollBy({ left: 360, behavior: 'smooth' })}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
        {full && <NamePreview names={names} onChange={setNames} />}
        <div className={s.filters} role="group" aria-label={t('নকশার ধরন', 'Design category')}>
          {[
            ['all', t('সব নকশা', 'All designs')],
            ['normal', packageName('normal', locale), taka(prices.normal, locale)],
            ['premium', packageName('premium', locale), taka(prices.premium, locale)],
          ].map(([id, title, price]) => (
            <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}>
              {title}
              {price && <span className={s.filterPrice}> · {price}</span>}
            </button>
          ))}
        </div>
        <div ref={rail} className={full ? s.templateGrid : s.templateRail}>
          {list.map((template) => (
            <TemplateCard key={template.id} template={template} names={names} />
          ))}
        </div>
        {!full && (
          <a className={`${s.textLink} ${s.collectionLink}`} href="/templates/">
            {t('সব নকশা দেখুন', 'See all designs')} <ArrowRight size={16} />
          </a>
        )}
        {full && (
          <div className={s.bespoke}>
            <LotusMark size={40} />
            <div>
              <h3>{t('একেবারে নিজের মতো কিছু চান?', 'Want something entirely your own?')}</h3>
              <p>
                {t(
                  `${packageName('custom', 'bn')} · ${taka(prices.custom, 'bn')}। আপনার ভাবনা, রং আর আয়োজনের কথা আমাদের বলুন।`,
                  `${packageName('custom', 'en')} · ${taka(prices.custom, 'en')}. Tell us about your colours, your story and your celebration.`,
                )}
              </p>
            </div>
            <a
              className={s.secondary}
              href={whatsappLink(
                `${packageName('custom', 'bn')} (${taka(prices.custom, 'bn')}) নকশা নিয়ে কথা বলতে চাই।`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              {t('নিজের মতো নকশা নিয়ে কথা বলুন', 'Talk about a custom design')} <ArrowUpRight size={16} />
            </a>
          </div>
        )}
      </section>
    </>
  );
}

export function Pricing({
  standalone = false,
  paymentDetails = true,
}: {
  standalone?: boolean;
  paymentDetails?: boolean;
}) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const Heading = standalone ? 'h1' : 'h2';
  const cards = [
    {
      tier: 'normal' as const,
      note: t('চেনা ঐতিহ্য, নিজের মতো।', 'Beautiful essentials, made personal.'),
      feature: t('৩টি নকশা থেকে বেছে নিন', 'Choose from 3 designs'),
      href: '/templates/',
    },
    {
      tier: 'premium' as const,
      note: t('বিশেষ দিনের বিশেষ নকশা।', 'A little more extraordinary.'),
      feature: t('আমাদের নিজের শিল্পকর্মে সাজানো ৩টি নকশা', '3 designs with rich original artwork'),
      href: '/templates/',
    },
    {
      tier: 'custom' as const,
      note: t('আপনার ভাবনা থেকে শুরু।', 'Beginning with your vision.'),
      feature: t('কথা বলে ঠিক করা আলাদা নকশা', 'A design agreed with you in a conversation'),
      href: whatsappLink(
        `${packageName('custom', 'bn')} (${taka(prices.custom, 'bn')}) প্যাকেজ সম্পর্কে জানতে চাই।`,
      ),
    },
  ];
  return (
    <section className={s.pricing} id="pricing">
      <div className={s.sectionHeading}>
        <div>
          <span className={s.eyebrow}>{t('প্যাকেজ ও দাম', 'THOUGHTFULLY PRICED')}</span>
          <Heading>
            {t('অল্প খরচে, মনে রাখার মতো আমন্ত্রণ', 'A thoughtful invitation. A simple price.')}
          </Heading>
          <p>
            {t(
              'এককালীন দাম। মেয়াদ আর কাজের কথা অর্ডারে লেখা থাকে। সেটা দেখে সম্মতি দেওয়ার পরেই টাকা পাঠাবেন।',
              'One-time pricing. The term and scope are written in your order. Pay only after you agree to them.',
            )}
          </p>
        </div>
      </div>
      <div className={s.priceGrid}>
        {cards.map(({ tier, note, feature, href }) => (
          <article key={tier} className={tier === 'premium' ? s.featuredPrice : undefined} data-glow>
            {tier === 'premium' && (
              <>
                <span className={s.pickBadge}>{t('সবচেয়ে পছন্দের', 'Recommended')}</span>
                <CornerOrnaments />
              </>
            )}
            <span>{packageName(tier, locale)}</span>
            <h3>
              {taka(prices[tier], locale)}
              <small>{t('/ আয়োজন', '/ celebration')}</small>
            </h3>
            <p>{note}</p>
            <p className={s.priceFeature}>
              <Check size={16} aria-hidden="true" />
              {feature}
            </p>
            <a
              className={tier === 'premium' ? s.primary : s.secondary}
              href={href}
              {...(tier === 'custom' ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {tier === 'custom'
                ? t('WhatsApp-এ কথা বলুন', 'Talk on WhatsApp')
                : t('নকশা বেছে নিন', 'Choose a design')}
              <ArrowRight size={16} />
            </a>
          </article>
        ))}
      </div>
      <div className={s.included}>
        <h3>{t('প্রতিটি প্যাকেজে যা থাকে', 'Included in every package')}</h3>
        <ul>
          {[
            t('বাংলা ও ইংরেজি আমন্ত্রণ', 'Bengali and English invitation'),
            t('নিজের নাম, অনুষ্ঠান আর সর্বোচ্চ ৫টি ছবি', 'Your names, events and up to 5 photos'),
            t('প্রতিটি পরিবারের নামে আলাদা লিংক আর উত্তর', 'A separate link and reply for each family'),
            t('আপনার নিজের আয়োজনের পাতা', 'Your own page to manage everything'),
            t('WhatsApp-এ এক ট্যাপে পাঠানো', 'One-tap sending on WhatsApp'),
          ].map((item) => (
            <li key={item}>
              <Check size={16} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {paymentDetails ? (
        <ManualPayment />
      ) : (
        <p className={s.paymentNote}>
          {t(
            'অর্ডার নিশ্চিত হলে bKash-এ নিজে পেমেন্ট করবেন। নম্বর আর নিয়ম অর্ডারের পেমেন্ট ধাপে পাবেন।',
            'Once your order is confirmed, pay by bKash yourself. The number and steps appear in the payment step of your order.',
          )}{' '}
          <a href="/pricing/#payment">{t('পেমেন্টের বিস্তারিত', 'Payment details')}</a>
        </p>
      )}
    </section>
  );
}

export function StorefrontHome({ paymentPromise }: { paymentPromise?: PaymentReviewPromise }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <StorefrontFrame overlay>
      <section className={`${s.hero} ${s.heroUnderHeader}`} data-parallax>
        <div className={s.heroCopy}>
          <h1>
            {t('একটি নিমন্ত্রণপত্র।', 'An invitation.')}
            <br />
            <em>{t('আরও একটু ব্যক্তিগত।', 'A little more personal.')}</em>
          </h1>
          <p>
            {t(
              'আপনাদের গল্প, আমাদের নকশা। বাংলার ঐতিহ্যে সাজানো ডিজিটাল আমন্ত্রণ, প্রতিটি পরিবারের নামে আলাদা লিংক।',
              'Your story, our design. A digital wedding invitation in the Bengali tradition, with a separate link for every family.',
            )}
          </p>
          <div className={s.heroActions}>
            <a className={s.primary} href="/templates/">
              {t('নকশা বেছে নিন', 'Choose a design')} <ArrowRight size={16} />
            </a>
            <a className={s.secondary} href="/demo/">
              {t('লাইভ নমুনা দেখুন', 'See a live sample')} <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <figure className={s.heroArt}>
          <img
            src="/brand/storefront-hero-match.webp"
            srcSet="/brand/storefront-hero-match-900.webp 900w, /brand/storefront-hero-match.webp 1600w"
            sizes="100vw"
            alt={t('জামদানি নকশার ডিজিটাল আমন্ত্রণের ছবি', 'A Jamdani-inspired digital invitation')}
            width="1600"
            height="900"
            fetchPriority="high"
          />
        </figure>
      </section>
      <ul className={s.values}>
        <li>
          <Flower2 size={20} aria-hidden="true" />
          {t('বাংলার নকশা, আধুনিক আয়োজনে', 'Bengali craft for a modern celebration')}
        </li>
        <li>
          <UsersRound size={20} aria-hidden="true" />
          {t('প্রতিটি পরিবারের নামে আলাদা লিংক', 'A separate link for every family')}
        </li>
        <li>
          <ShieldCheck size={20} aria-hidden="true" />
          {t('উত্তর আর শুভেচ্ছা শুধু আপনার কাছে', 'Replies and wishes reach only you')}
        </li>
      </ul>
      <TemplateCollection />
      <JamdaniDivider />
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
      <section className={s.finalCta}>
        <LotusMark size={36} />
        <h2>{t('আপনাদের গল্পটা শুরু হোক', 'Let your story begin')}</h2>
        <div className={s.heroActions}>
          <a className={s.primary} href="/templates/">
            {t('নকশা বেছে নিন', 'Choose a design')} <ArrowRight size={16} />
          </a>
          <a className={s.secondary} href={whatsappLink()} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> {t('WhatsApp-এ কথা বলুন', 'Chat on WhatsApp')}
          </a>
        </div>
      </section>
      <StickyCta />
    </StorefrontFrame>
  );
}
