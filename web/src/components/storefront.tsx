'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  Flower2,
  Menu,
  MessageCircle,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import { templates, prices, packageNames, whatsappLink } from '@/features/production/catalog';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF, paymentReviewPromise, customerReviews, facebookUrl, founder } from '@/features/production/brand';
import { taka } from '@/features/production/money';
import s from './storefront.module.css';
import { ManualPayment } from './manual-payment';
import { BrandLockup, LotusMark } from './brand-mark';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';

export function StorefrontFrame({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useProductLocale();
  const pathname = usePathname() ?? '/';
  const [menu, setMenu] = useState(false);
  const [solid, setSolid] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const onScroll = () => setSolid(window.scrollY > 24); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  useEffect(() => {
    if (!menu) { dialog.current?.close(); return; }
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [menu]);
  const links: [string, string][] = [
    ['/templates/', t('নকশা', 'Designs')],
    ['/#how-it-works', t('কীভাবে কাজ করে', 'How it works')],
    ['/pricing/', t('দাম', 'Pricing')],
    ['/#faq', t('প্রশ্নোত্তর', 'FAQ')],
  ];
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
      <div className={s.site} lang={locale}>
        <a className="skip-link" href="#public-main">
          {t('মূল বিষয়বস্তু', 'Skip to content')}
        </a>
        <header className={s.header} data-overlay={pathname === '/'} data-solid={solid || pathname !== '/'}>
          <div className={s.headerInner}>
            <a className={s.brand} href="/" aria-label={t('Dawat — প্রথম পাতা', 'Dawat — home')}>
              <BrandLockup locale={locale} size={34} wordClassName={s.brandWord} />
            </a>
            <nav
              id="public-navigation"
              className={s.nav}
              aria-label={t('মূল মেনু', 'Main navigation')}
              onClick={() => setMenu(false)}
            >
              {links.map(([href, label]) => (
                <a key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
                  {label}
                </a>
              ))}
              <a className={s.navPortal} href="/dashboard/">
                {t('লগইন', 'Log in')} <ArrowUpRight size={16} />
              </a>
            </nav>
            <div className={s.headerActions}>
              <button
                className={s.language}
                lang={locale === 'bn' ? 'en' : 'bn'}
                aria-label={t('Switch to English', 'বাংলায় দেখুন')}
                onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}
              >
                {locale === 'bn' ? 'EN' : 'বাং'}
              </button>
              <a className={s.signin} href="/dashboard/">
                {t('লগইন', 'Log in')}
              </a>
              <a className={s.headerCta} href="/templates/">{t('নকশা বেছে নিন', 'Choose a design')}</a>
              <button
                className={s.menu}
                aria-label={menu ? t('মেনু বন্ধ করুন', 'Close menu') : t('মেনু খুলুন', 'Open menu')}
                aria-expanded={menu}
                aria-controls="public-mobile-menu"
                onClick={() => setMenu(!menu)}
              >
                {menu ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </header>
        <dialog ref={dialog} id="public-mobile-menu" className={s.mobileSheet} aria-label={t('মূল মেনু', 'Main menu')} onCancel={() => setMenu(false)} onClick={event => { if (event.target === event.currentTarget) setMenu(false); }}>
          <div><button className={s.sheetClose} onClick={() => setMenu(false)}>{t('বন্ধ করুন', 'Close')} <X size={20} /></button>
          <nav onClick={() => setMenu(false)}>{links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}<a href="/auth/login/">{t('লগইন', 'Log in')}</a><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp</a><a className={s.primary} href="/templates/">{t('নকশা বেছে নিন', 'Choose a design')}</a></nav></div>
        </dialog>
        <main id="public-main">{children}</main>
        <footer className={s.footer}>
          <div className={s.footerInner}>
            <div className={s.footerBrand}>
              <a className={s.brand} href="/">
                <LotusMark size={28} />
                <span className={s.brandWord}>Dawat.</span>
              </a>
              <p>
                {t('আমাদের উৎসব, আমাদের মতো।', 'Made for the way we celebrate.')}{' '}
                {t('বাংলাদেশ থেকে, ভালোবাসায়।', 'From Bangladesh, with love.')}
              </p>
            </div>
            <nav aria-label={t('আপনার আয়োজন', 'Your celebration')}>
              <strong>{t('আপনার আয়োজন', 'Your celebration')}</strong>
              <a href="/templates/">{t('নকশা দেখুন', 'Explore designs')}</a>
              <a href="/order/requests/">{t('অর্ডারের অবস্থা', 'Order status')}</a>
              <a href="/pricing/">{t('দাম', 'Pricing')}</a>
            </nav>
            <nav aria-label={t('পাশে আছি', 'Here to help')}>
              <strong>{t('পাশে আছি', 'Here to help')}</strong>
              <a href={whatsappLink()} target="_blank" rel="noreferrer">
                WhatsApp · 01606 092143
              </a>
              <a href={DAWAT_CONTACT_HREF}>{DAWAT_CONTACT_EMAIL}</a>
              <a href="/#how-it-works">{t('কীভাবে কাজ করে', 'How it works')}</a><a href="/#faq">{t('প্রশ্নোত্তর', 'FAQ')}</a><a href="/contact/">{t('যোগাযোগ', 'Contact')}</a>
            </nav><nav aria-label={t('নিয়ম', 'Policies')}><strong>{t('নিয়ম', 'Policies')}</strong>
              <a href="/policies/">{t('সেবার শর্ত', 'Service terms')}</a><a href="/policies/#privacy">{t('গোপনীয়তা', 'Privacy')}</a><a href="/policies/#refund">{t('টাকা ফেরতের নিয়ম', 'Refund policy')}</a>
              {facebookUrl && <a href={facebookUrl}>Facebook</a>}
            </nav>
          </div>
          <p className={s.paymentRow}>{t('bKash-এ পেমেন্ট · প্রতিটি পেমেন্ট মানুষ দিয়ে মিলিয়ে দেখা হয়', 'Pay with bKash · Every payment is checked by our team')}</p>
          <div className={s.footerBottom}>
            <span>© {new Date().getFullYear()} Dawat</span>
            <span>
              {t('বাংলাদেশে তৈরি', 'Made in Bangladesh')}
            </span>
          </div>
        </footer>
        <a
          className={s.whatsapp}
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          aria-label={t('WhatsApp-এ যোগাযোগ করুন', 'Contact us on WhatsApp')}
        >
          <MessageCircle size={24} strokeWidth={1.75} />
        </a>
      </div>
    </MotionConfig>
  );
}
export function TemplateCard({
  template,
  selected = false,
}: {
  template: (typeof templates)[number];
  /** Already chosen (order page): only offer the live preview. */
  selected?: boolean;
}) {
  const { locale } = useProductLocale();
  const bn = locale === 'bn';
  const reduceMotion = useReducedMotion();
  const [one, setOne] = useState('');
  const [two, setTwo] = useState('');
  const names = [one.trim(), two.trim()].filter(Boolean).join(' ও ');
  return (
    <motion.article
      className={s.templateCard}
      layout="position"
      initial={false}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
    >
      <a
        href={`/demo/?template=${template.id}`}
        className={`${s.templateArt} ${s[template.id] ?? ''}`}
        style={
          {
            '--card-ink': template.color,
            '--card-paper': template.paper,

          } as CSSProperties
        }
        aria-label={`${bn ? 'নমুনা খুলুন' : 'Preview'} · ${bn ? template.name : template.en}`}
      >
        <img className={s.cardArtImage} src={template.art.replace('.webp', '-480.webp')} srcSet={`${template.art.replace('.webp', '-480.webp')} 480w, ${template.art} 960w`} sizes="(max-width: 767px) 80vw, (max-width: 1199px) 25vw, 200px" alt="" loading="lazy" width={480} height={720} />
        {template.tier === 'premium' && <span className={s.tierBadge}>{packageNames.premium[locale]}</span>}
        <div className={s.cardFrame}>
          <span>بِسْمِ اللَّهِ</span>
          <Flower2 size={24} />
          <small>{bn ? 'শুভ বিবাহ' : 'THE WEDDING OF'}</small>
          <strong>
            {one || (bn ? 'মেহরিন' : 'Mehrin')}
            <i>&</i>
            {two || (bn ? 'আরিব' : 'Arib')}
          </strong>
          <span>{bn ? '১২ . ১২ . ২০২৬' : '12 . 12 . 2026'}</span>
          <small>{bn ? 'ভালোবাসার আমন্ত্রণ' : 'WITH LOVE, ALWAYS'}</small>
        </div>
      </a>
      <div className={s.cardTitle}>
        <h3>{bn ? template.name : template.en}</h3>
        <strong>{taka(prices[template.tier], locale)}</strong>
      </div>
      <p className={s.cardMeta}>
        {bn ? template.mood : template.moodEn} · {packageNames[template.tier][locale]}
      </p>
      <details className={s.nameTry}><summary>{bn ? 'নিজেদের নাম লিখে দেখুন' : 'Try your names'}</summary><label>{bn ? 'বরের নাম' : 'First name'}<input maxLength={120} value={one} onChange={e => setOne(e.target.value)} /></label><label>{bn ? 'কনের নাম' : 'Second name'}<input maxLength={120} value={two} onChange={e => setTwo(e.target.value)} /></label></details>
      <div className={selected ? s.cardButtonsSingle : s.cardButtons}>
        <a href={`/demo/?template=${template.id}`}>
          {bn ? 'নমুনা খুলুন' : 'Live preview'} <ArrowUpRight size={14} />
        </a>
        {!selected && (
          <a href={`/order/requests/?template=${template.id}${names ? `&names=${encodeURIComponent(names)}` : ''}`}>
            {bn ? 'এটি বেছে নিন' : 'Choose design'} <ArrowRight size={14} />
          </a>
        )}
      </div>
    </motion.article>
  );
}
export function TemplateCollection({ full = false }: { full?: boolean }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [filter, setFilter] = useState('all');
  const rail = useRef<HTMLDivElement>(null);
  const collectionOrder = ['jamdani', 'garden', 'midnight', 'holud', 'rose', 'ivory'];
  const list = [...templates]
    .sort((a, b) => collectionOrder.indexOf(a.id) - collectionOrder.indexOf(b.id))
    .filter((x) => filter === 'all' || x.tier === filter);
  return (
    <section className={`${s.collection} ${full ? s.fullCollection : ''}`} id="collection">
      <div className={s.sectionHeading}>
        <div>
          <span className={s.eyebrow}>
            {full
              ? t('চিরায়ত ঐতিহ্য, একান্ত আপনার', 'TIMELESS TRADITIONS, BEAUTIFULLY YOURS')
              : t('আমাদের নকশার সংগ্রহ', 'THE DAWAT COLLECTION')}
          </span>
          {full ? (
            <h1>
              {t(
                'আপনার বিশেষ দিনের ডিজিটাল আমন্ত্রণ, একেবারে আপনাদের মতো',
                'For your special day, an invitation that feels like you.',
              )}
            </h1>
          ) : (
            <h2>{t('আপনার গল্পের সঙ্গে মানানসই।', 'Find the one that feels like you.')}</h2>
          )}
          <p>
            {t(
              'প্রতিটি নকশা খুলে দেখুন। পছন্দের আমন্ত্রণে জুড়ে দিন আপনাদের গল্প।',
              'Open a design, explore the details, and make it your own.',
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
      <div className={s.filters} role="group" aria-label={t('নকশার ধরন', 'Design category')}>
        {[
          ['all', t('সব নকশা', 'All designs')],
          ['normal', packageNames.normal[locale], taka(prices.normal, locale)],
          ['premium', packageNames.premium[locale], taka(prices.premium, locale)],
        ].map(([id, title, price]) => (
          <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}>
            {title}
            {price && <span className={s.filterPrice}> · {price}</span>}
          </button>
        ))}
      </div>
      <div ref={rail} className={full ? s.templateGrid : s.templateRail}>
        {list.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
      {!full && (
        <a className={`${s.textLink} ${s.collectionLink}`} href="/templates/">
          {t('পুরো সংগ্রহ দেখুন', 'Explore the collection')} <ArrowRight size={16} />
        </a>
      )}
      {full && (
        <div className={s.bespoke}>
          <LotusMark size={40} />
          <div>
            <h3>{t('একেবারে আপনাদের মতো কিছু?', 'Something entirely yours?')}</h3>
            <p>
              {t(
                'নিজের মতো · ৳১,৫০০। আপনার ভাবনা, রং ও আয়োজন নিয়ে আমাদের সঙ্গে কথা বলুন।',
                'Custom · ৳1,500. Tell us about your colours, your story, your celebration.',
              )}
            </p>
          </div>
          <a
            className={s.secondary}
            href={whatsappLink('৳১,৫০০ নিজের মতো আমন্ত্রণ নিয়ে আলোচনা করতে চাই।')}
            target="_blank"
            rel="noreferrer"
          >
            {t('কাস্টম নকশা নিয়ে কথা বলুন', 'Discuss your custom design')} <ArrowUpRight size={16} />
          </a>
        </div>
      )}
    </section>
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
  return (
    <section className={s.pricing} id="pricing">
      <div className={s.sectionHeading}>
        <div>
          <span className={s.eyebrow}>{t('প্যাকেজ ও মূল্য', 'THOUGHTFULLY PRICED')}</span>
          <Heading>
            {t('ছোট্ট খরচে, মনে রাখার মতো আমন্ত্রণ।', 'A thoughtful invitation. A simple price.')}
          </Heading>
          <p>
            {t(
              'এককালীন মূল্য। মেয়াদ ও কাজের বিস্তারিত অর্ডারে সম্মত হওয়ার পরেই টাকা পাঠাবেন।',
              'One-time pricing. Agree the hosting term and scope in your order before paying.',
            )}
          </p>
        </div>
      </div>
      <div className={s.priceGrid}>
        {[
          [
            packageNames.normal[locale],
            taka(prices.normal, locale),
            t('চেনা ঐতিহ্য, নিজের মতো।', 'Beautiful essentials, made personal.'),
            t('৩টি নকশা থেকে নির্বাচন', 'Choose from 3 designs'),
            '/templates/',
          ],
          [
            packageNames.premium[locale],
            taka(prices.premium, locale),
            t('বিশেষ দিনের বিশেষ নকশা।', 'A little more extraordinary.'),
            t('মৌলিক শিল্পকর্মে সাজানো ৩টি নকশা', '3 designs with rich original artwork'),
            '/templates/',
          ],
          [
            packageNames.custom[locale],
            taka(prices.custom, locale),
            t('আপনার ভাবনা থেকে শুরু।', 'Beginning with your vision.'),
            t('আলোচনা করে নির্ধারিত কাস্টম নকশা', 'A custom design with agreed scope'),
            whatsappLink('নিজের মতো ৳১,৫০০ প্যাকেজটি সম্পর্কে জানতে চাই।'),
          ],
        ].map(([name, price, note, feature, href]) => (
          <article key={name} className={name === packageNames.premium[locale] ? s.featuredPrice : undefined}>
            <span>{name}</span>
            <h3>
              {price}
              <small>{t('/ আয়োজন', '/ celebration')}</small>
            </h3>
            <p>{note}</p>
            <p className={s.priceFeature}>
              <Check size={16} aria-hidden="true" />
              {feature}
            </p>
            <a
              className={name === packageNames.premium[locale] ? s.primary : s.secondary}
              href={href}
              {...(name === packageNames.custom[locale] ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {name === packageNames.custom[locale]
                ? t('WhatsApp-এ আলোচনা করুন', 'Discuss on WhatsApp')
                : t('নকশা বেছে নিন', 'Choose your design')}
              <ArrowRight size={16} />
            </a>
          </article>
        ))}
      </div>
      <div className={s.included}>
        <h3>{t('প্রতিটি প্যাকেজে থাকছে', 'Included in every package')}</h3>
        <ul>
          {[
            t('বাংলা ও ইংরেজি আমন্ত্রণ', 'Bengali & English invitation'),
            t('নিজের নাম, অনুষ্ঠান ও সর্বোচ্চ ৫টি ছবি', 'Your names, events & up to 5 photos'),
            t('নাম ধরে ব্যক্তিগত লিংক ও অতিথির উত্তর', 'Named links & guest replies'),
            t('নিজস্ব আয়োজনের পাতা', 'Your own customer portal'),
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
            'দাম ও শর্তে সম্মতি দিয়ে বিকাশে পেমেন্ট করুন। নম্বর ও নির্দেশনা আপনার অর্ডারের পেমেন্ট ধাপে পাবেন।',
            'Pay by bKash after accepting your price and terms. The number and instructions appear in your order’s payment step.',
          )}{' '}
          <a href="/pricing/#payment">{t('পেমেন্টের বিস্তারিত', 'Payment details')}</a>
        </p>
      )}
      {standalone && <FAQ />}
    </section>
  );
}
export function FAQ() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <section id="faq" className={s.faq}>
      <div>
        <h2>{t('কিছু প্রশ্ন, সহজ উত্তর।', 'A few questions, answered.')}</h2>
      </div>
      <div>
        {[
          [
            t('কীভাবে অর্ডার করব?', 'How do I order?'),
            t(
              'নকশা বেছে নিজের ইমেইল দিয়ে লগইন করুন। আয়োজনের তথ্য দিন। মূল্য, কাজের পরিধি ও মেয়াদ নিশ্চিত করে পেমেন্টের নির্দেশনা অনুসরণ করুন।',
              'Choose a design and sign in with your own email. Share your event details, agree the scope and term, then follow the payment instructions.',
            ),
          ],
          [
            t('পেমেন্টের পরই কি আয়োজনের পাতা খুলবে?', 'Does payment immediately unlock my portal?'),
            t(
              'Transaction ID জমা দেওয়ার পর আমাদের টিম আসল লেনদেন মিলিয়ে দেখবে। যাচাই শেষে আয়োজনের পাতা চালু হলে আপনার অ্যাকাউন্টে তা খুলবে।',
              'After you submit the transaction ID, our team checks the actual transfer. Your portal opens after verification and activation.',
            ),
          ],
          [
            t('অতিথিদের কীভাবে পাঠাব?', 'How do I share invitations?'),
            t(
              'নাম ধরে আলাদা লিংক আপনার WhatsApp থেকে একে একে পাঠান। কে খুলেছেন ও উত্তর দিয়েছেন দেখুন। অথবা এক লিংক গ্রুপে বা সম্প্রচার তালিকায় পাঠান। অতিথি নিজের নাম লিখে উত্তর দেবেন।',
              'Send named links one by one from your own WhatsApp and see who opened and replied. Or share one link in a group or broadcast list; guests enter their own names to reply.',
            ),
          ],
          [
            t('নকশা ও তথ্য কি বদলানো যাবে?', 'Can I edit my invitation?'),
            t(
              'আয়োজনের পাতা থেকে নাম, অনুষ্ঠান, ছবি ও বক্তব্য সম্পাদনা করে প্রিভিউ দেখতে পারবেন। প্রকাশ করার পরেই পরিবর্তন অতিথিদের কাছে যাবে। কাস্টম শিল্পকর্মের পরিবর্তন আলোচনা করে নির্ধারিত হবে।',
              'Edit names, events, photographs and wording in your portal, then preview. Guests see changes only after publication. Custom artwork revisions follow the agreed scope.',
            ),
          ],
          [
            t('কতদিন লিংক চালু থাকবে?', 'How long does the invitation stay live?'),
            t(
              'আপনার অর্ডারে মেয়াদ স্পষ্ট করে দেওয়া হবে। প্রথমবার প্রকাশের দিন থেকে সেই মেয়াদ শুরু হবে। পরে আবার প্রকাশ করলে মেয়াদ নতুন করে শুরু হবে না।',
              'Your order states the hosting term. It starts on first publication; publishing changes does not restart it.',
            ),
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
export function StorefrontHome() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <StorefrontFrame>
      <section className={s.hero}>
        <div className={s.heroCopy}>
          <h1>
            {t('একটি নিমন্ত্রণপত্র।', 'An invitation.')}
            <br />
            <em>{t('আরও একটু ব্যক্তিগত।', 'A little more personal.')}</em>
          </h1>
          <p>
            {t(
              'আপনাদের গল্প, আমাদের নকশা। ঐতিহ্যবাহী বাঙালি নান্দনিকতায় তৈরি ডিজিটাল আমন্ত্রণ—বিশেষ দিনকে আরও অর্থপূর্ণ করে তুলুন।',
              'Your story, their name, and a little piece of home. Digital wedding invitations made for the way you celebrate.',
            )}
          </p>
          <div className={s.heroActions}>
            <a className={s.primary} href="/templates/">
              {t('আপনার নকশা খুঁজুন', 'Find your invitation')} <ArrowRight size={16} />
            </a>
            <a className={s.secondary} href="/demo/">
              {t('নমুনা দেখুন', 'View a sample')} <ArrowUpRight size={16} />
            </a>
          </div>
          <ul className={s.heroFacts}>
            <li>{t('৳৫০০ থেকে', 'From ৳500')}</li>
            <li>{t('বাংলা ও ইংরেজি', 'Bengali & English')}</li>
            <li>{t('নিজস্ব আয়োজনের পাতা', 'Your own portal')}</li>
          </ul>
        </div>
        <figure className={s.heroArt}>
          <img
            src="/brand/storefront-hero-match-900.webp"
            srcSet="/brand/storefront-hero-match-900.webp 900w, /brand/storefront-hero-match.webp 1600w"
            sizes="100vw"
            alt={t(
              'জামদানি-অনুপ্রাণিত ডিজিটাল আমন্ত্রণের শিল্পিত উপস্থাপনা',
              'An artistic presentation of a Jamdani-inspired digital invitation',
            )}
            width="1600"
            height="900"
            fetchPriority="high"
          />
        </figure>
      </section>
      <ul className={s.values}>
        <li>
          <Flower2 size={20} aria-hidden="true" />
          {t('বাংলার নকশা, আধুনিক আয়োজনে', 'Bengali craft, a modern celebration')}
        </li>
        <li>
          <UsersRound size={20} aria-hidden="true" />
          {t('প্রতিটি অতিথির নামে আমন্ত্রণ', 'Every guest, personally invited')}
        </li>
        <li>
          <ShieldCheck size={20} aria-hidden="true" />
          {t('উত্তর ও শুভেচ্ছা আপনার কাছে', 'Replies & wishes, just for you')}
        </li>
      </ul>
      <TemplateCollection />
      <section className={s.featureStories}>
        <article>
          <img src="/brand/storefront-hero-match.webp" alt="" width="300" height="300" loading="lazy" />
          <div>
            <h2>{t('নামে নিমন্ত্রণপত্র', 'A personal invitation')}</h2>
            <p>
              {t(
                'আপনার অতিথিদের নামসহ ব্যক্তিগত আমন্ত্রণ, যত্ন এবং ঐতিহ্যের সৌন্দর্যে।',
                'Every invitation, addressed by name—with care and the beauty of tradition.',
              )}
            </p>
            <a className={s.textLink} href="/demo/">
              {t('নমুনা দেখুন', 'See a sample')}
              <ArrowRight size={16} />
            </a>
          </div>
        </article>
        <article>
          <img src="/brand/feature-rsvp.webp" alt="" width="300" height="300" loading="lazy" />
          <div>
            <h2>{t('ব্যক্তিগত উত্তর', 'Replies, beautifully arranged')}</h2>
            <p>
              {t(
                'সহজ এবং সুন্দরভাবে আপনার অতিথিদের উপস্থিতি নিশ্চিত করুন। উত্তর ও শুভেচ্ছা রাখুন এক জায়গায়।',
                'Make it easy for your guests to reply. Keep attendance and wishes together in one place.',
              )}
            </p>
            <a className={s.textLink} href="/#how-it-works">
              {t('যেভাবে কাজ করে', 'See how it works')}
              <ArrowRight size={16} />
            </a>
          </div>
        </article>
      </section>
      <section id="how-it-works" className={s.steps}>
        <h2>{t('চার ধাপে নিজের আমন্ত্রণ।', 'Your invitation in four steps.')}</h2>
        <ol>{[
          [t('নকশা বেছে নিন', 'Choose a design'), t('নমুনা দেখুন। নাম লিখে নিজের কার্ড কেমন হবে দেখে নিন।', 'Open a sample and try your names on the card.'), 'design'],
          [t('দাম ও শর্ত দেখে পেমেন্ট করুন', 'Review the terms and pay'), t('দাম ও মেয়াদ দেখে সম্মতি দিন। নির্দেশনা মেনে বিকাশে টাকা পাঠান।', 'Accept the price and term, then pay using the bKash instructions.'), 'payment'],
          [t('আমন্ত্রণ সাজিয়ে চালু করুন', 'Prepare and publish'), t('নিজের তথ্য ও ছবি দিন। প্রিভিউ দেখে অতিথিদের জন্য চালু করুন।', 'Add your details and photos, preview, then publish for guests.'), 'workspace'],
          [t('পাঠান ও উত্তর দেখুন', 'Share and see replies'), t('নাম ধরে অথবা সবার জন্য এক লিংক WhatsApp-এ পাঠান। উত্তর এক তালিকায় দেখুন।', 'Send named links or one shared link through WhatsApp. See replies together.'), 'replies'],
        ].map(([title, body, screen], i) => <li key={screen}><b aria-hidden="true">{new Intl.NumberFormat(locale).format(i + 1)}</b><h3>{title}</h3><p>{body}</p><img src={`/brand/screens/${screen}.webp`} width={375} height={812} sizes="(max-width: 767px) 200px, 220px" loading="lazy" alt={t(`${title} — দাওয়াতের নমুনা পাতা`, `${title} — Dawat sample screen`)} /></li>)}</ol>
      </section>
      <Pricing paymentDetails={false} />
      <section className={s.trust}><h2>{t('দাম ও শর্ত আগে জানুন', 'Know the price and terms first')}</h2><p>{t('টাকা দেওয়ার আগে দাম ও শর্ত লেখা থাকবে। অতিথির তথ্য বিক্রি বা বিজ্ঞাপনে ব্যবহার হয় না।', 'Your price and terms are written before payment. Guest information is never sold or used for advertising.')}</p>{paymentReviewPromise[locale] && <p>{paymentReviewPromise[locale]}</p>}{customerReviews.map(review => <blockquote key={review.name}><p>{locale === 'bn' ? review.quoteBn : review.quoteEn}</p><cite>{review.name}</cite></blockquote>)}</section>
      <FounderNote person={founder} />
      <FAQ />
      <section className={s.finalCta}>
        <LotusMark size={36} />
        <h2>{t('আপনাদের গল্পটা শুরু হোক।', 'Let your story begin.')}</h2>
        <div className={s.heroActions}>
          <a className={s.primary} href="/templates/">
            {t('নকশার সংগ্রহ দেখুন', 'Explore the collection')} <ArrowRight size={16} />
          </a>
          <a className={s.secondary} href={whatsappLink()} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> {t('WhatsApp-এ কথা বলুন', 'Chat on WhatsApp')}
          </a>
        </div>
      </section>
    </StorefrontFrame>
  );
}

function FounderNote({ person }: { person: { name: string; photo: string; messageBn: string; messageEn: string } | null }) {
  const { locale } = useProductLocale();
  if (!person) return null;
  return <section className={s.trust}><img src={person.photo} alt={person.name} width={96} height={96} loading="lazy" /><h2>{person.name}</h2><p>{locale === 'bn' ? person.messageBn : person.messageEn}</p></section>;
}
