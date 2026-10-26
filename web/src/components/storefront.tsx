'use client';
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Flower2,
  Menu,
  MessageCircle,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import { templates, prices, whatsappLink } from '@/features/production/catalog';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF } from '@/features/production/brand';
import s from './storefront.module.css';
import { ManualPayment } from './manual-payment';
import { LotusMark } from './brand-mark';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';

export function StorefrontFrame({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useProductLocale();
  const [menu, setMenu] = useState(false);
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
      <div className={s.site} lang={locale}>
        <a className="skip-link" href="#public-main">
          {t('মূল বিষয়বস্তু', 'Skip to content')}
        </a>
        <header className={s.header}>
          <a className={s.brand} href="/">
            <LotusMark size={38} />
            <span className={s.brandWord}>
              dawat.<small>DIGITAL BENGALI INVITATIONS</small>
            </span>
          </a>
          <nav
            id="public-navigation"
            className={menu ? s.openNav : s.nav}
            aria-label={t('মূল মেনু', 'Main navigation')}
            onClick={() => setMenu(false)}
          >
            <a href="/templates/">{t('নকশার সংগ্রহ', 'The collection')}</a>
            <a href="/#how-it-works">{t('যেভাবে কাজ করে', 'How it works')}</a>
            <a href="/pricing/">{t('প্যাকেজ ও মূল্য', 'Pricing')}</a>
            <a href="/contact/">{t('যোগাযোগ', 'Contact')}</a>
          </nav>
          <div className={s.headerActions}>
            <button className={s.language} onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}>
              {locale === 'bn' ? 'EN' : 'বাংলা'}
            </button>
            <a className={s.signin} href="/dashboard/">
              {t('আমার পোর্টাল', 'My portal')} <ArrowUpRight size={14} />
            </a>
            <button
              className={s.menu}
              aria-label={t('মেনু', 'Menu')}
              aria-expanded={menu}
              aria-controls="public-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </header>
        <main id="public-main">{children}</main>
        <footer className={s.footer}>
          <div>
            <a className={s.brand} href="/">
              dawat.
            </a>
            <p>
              {t('আমাদের উৎসব, আমাদের মতো।', 'Made for the way we celebrate.')}
              <br />
              {t('বাংলাদেশ থেকে, ভালোবাসায়।', 'From Bangladesh, with love.')}
            </p>
          </div>
          <div>
            <strong>{t('আপনার আয়োজন', 'Your celebration')}</strong>
            <a href="/templates/">{t('নকশা দেখুন', 'Explore designs')}</a>
            <a href="/order/requests/">{t('অর্ডারের অবস্থা', 'Order status')}</a>
            <a href="/pricing/">{t('প্যাকেজ ও মূল্য', 'Packages')}</a>
          </div>
          <div>
            <strong>{t('পাশে আছি', 'Here to help')}</strong>
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              WhatsApp · 01606 092143
            </a>
            <a href={DAWAT_CONTACT_HREF}>{DAWAT_CONTACT_EMAIL}</a>
            <a href="/policies/">{t('সেবার শর্ত ও গোপনীয়তা', 'Service & privacy')}</a>
          </div>
          <div className={s.footerBottom}>
            <span>© {new Date().getFullYear()} Dawat</span>
            <span>
              {t('একটি সুন্দর আমন্ত্রণ থেকেই শুরু।', 'Every celebration begins with an invitation.')}
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
          <MessageCircle size={25} />
          <span>{t('কথা বলুন', 'Let’s talk')}</span>
        </a>
      </div>
    </MotionConfig>
  );
}
export function TemplateCard({ template }: { template: (typeof templates)[number] }) {
  const { locale } = useProductLocale();
  const bn = locale === 'bn';
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      className={s.templateCard}
      layout="position"
      initial={false}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
    >
      <a
        href={`/invite/?template=${template.id}`}
        className={`${s.templateArt} ${s[template.id] ?? ''}`}
        style={
          {
            '--card-ink': template.color,
            '--card-paper': template.paper,
            backgroundImage: template.art ? `url('${template.art}')` : undefined,
          } as CSSProperties
        }
        aria-label={`${bn ? 'নমুনা খুলুন' : 'Preview'} · ${bn ? template.name : template.en}`}
      >
        <div className={s.cardFrame}>
          <span>بِسْمِ اللَّهِ</span>
          <Flower2 size={24} />
          <small>{bn ? 'শুভ বিবাহ' : 'THE WEDDING OF'}</small>
          <strong>
            {bn ? 'মেহরিন' : 'Mehrin'}
            <i>&</i>
            {bn ? 'আরিব' : 'Arib'}
          </strong>
          <span>১২ . ১২ . ২০২৬</span>
          <small>{bn ? 'ভালোবাসার আমন্ত্রণ' : 'WITH LOVE, ALWAYS'}</small>
        </div>
      </a>
      <div className={s.cardTitle}>
        <h3>{bn ? template.name : template.en}</h3>
        <strong>৳{prices[template.tier]}</strong>
      </div>
      <p>
        {bn ? template.mood : template.moodEn}{' '}
        <span>· {template.tier === 'premium' ? 'Premium' : 'Normal'}</span>
      </p>
      <div className={s.cardButtons}>
        <a href={`/invite/?template=${template.id}`}>
          {bn ? 'নমুনা খুলুন' : 'Live preview'} <ArrowUpRight size={14} />
        </a>
        <a href={`/order/?template=${template.id}`}>
          {bn ? 'এটি বেছে নিন' : 'Choose design'} <ArrowRight size={14} />
        </a>
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
              ? 'TIMELESS TRADITIONS, BEAUTIFULLY YOURS'
              : t('আমাদের নকশার সংগ্রহ', 'THE DAWAT COLLECTION')}
          </span>
          <h2>
            {full ? (
              <>
                {t('আপনার বিশেষ দিনের', 'For your special day,')}
                <br />
                {t('ডিজিটাল আমন্ত্রণ, একেবারে আপনাদের মতো', 'an invitation that feels like you.')}
              </>
            ) : (
              t('আপনার গল্পের সঙ্গে মানানসই।', 'Find the one that feels like you.')
            )}
          </h2>
          {full && (
            <span className={s.headingOrnament} aria-hidden="true">
              <Flower2 size={16} />
            </span>
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
              <ChevronLeft />
            </button>
            <button
              aria-label={t('পরের নকশা', 'Next designs')}
              onClick={() => rail.current?.scrollBy({ left: 360, behavior: 'smooth' })}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
      <div className={s.filters} role="group" aria-label={t('নকশার ধরন', 'Design category')}>
        {[
          ['all', t('সব নকশা', 'All designs')],
          ['normal', 'Normal · ৳500'],
          ['premium', 'Premium · ৳750'],
        ].map(([id, title]) => (
          <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}>
            {title}
          </button>
        ))}
      </div>
      <div ref={rail} className={full ? s.templateGrid : s.templateRail}>
        {list.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
      {!full && (
        <a className={s.textLink} href="/templates/">
          {t('পুরো সংগ্রহ দেখুন', 'Explore the collection')} <ArrowRight size={16} />
        </a>
      )}
      <div className={s.bespoke}>
        <Flower2 size={36} />
        <div>
          <h3>{t('একেবারে আপনাদের মতো কিছু?', 'Something entirely yours?')}</h3>
          <p>
            {t(
              'Customized · ৳১,৫০০। আপনার ভাবনা, রং ও আয়োজন নিয়ে আমাদের সঙ্গে কথা বলুন।',
              'Customized · ৳1,500. Tell us about your colours, your story, your celebration.',
            )}
          </p>
        </div>
        <a
          href={whatsappLink('৳১,৫০০ Customized invitation নিয়ে আলোচনা করতে চাই।')}
          target="_blank"
          rel="noreferrer"
        >
          {t('কাস্টম নকশা নিয়ে কথা বলুন', 'Discuss your custom design')} <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
export function Pricing({ standalone = false }: { standalone?: boolean }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <section className={s.pricing} id="pricing">
      <div className={s.sectionHeading}>
        <div>
          <span className={s.eyebrow}>{t('প্যাকেজ ও মূল্য', 'THOUGHTFULLY PRICED')}</span>
          <h2>{t('ছোট্ট খরচে, মনে রাখার মতো আমন্ত্রণ।', 'A thoughtful invitation. A simple price.')}</h2>
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
            'Normal',
            '500',
            t('চেনা ঐতিহ্য, নিজের মতো।', 'Beautiful essentials, made personal.'),
            t('৩টি নকশা থেকে নির্বাচন', 'Choose from 3 designs'),
            '/templates/',
          ],
          [
            'Premium',
            '750',
            t('বিশেষ দিনের বিশেষ নকশা।', 'A little more extraordinary.'),
            t('৩টি সমৃদ্ধ artwork-এর নকশা', '3 designs with rich original artwork'),
            '/templates/',
          ],
          [
            'Customized',
            '1500',
            t('আপনার ভাবনা থেকে শুরু।', 'Beginning with your vision.'),
            t('আলোচনা করে নির্ধারিত custom design', 'A custom design with agreed scope'),
            whatsappLink('Customized ৳১,৫০০ প্যাকেজটি সম্পর্কে জানতে চাই।'),
          ],
        ].map(([name, price, note, feature, href]) => (
          <article key={name} className={name === 'Premium' ? s.featuredPrice : undefined}>
            <span>{name}</span>
            <h3>
              ৳{price}
              <small>{t('/ আয়োজন', '/ celebration')}</small>
            </h3>
            <p>{note}</p>
            <ul>
              {[
                feature,
                t('বাংলা ও ইংরেজি আমন্ত্রণ', 'Bengali & English invitation'),
                t('নিজের নাম, অনুষ্ঠান ও সর্বোচ্চ ৫টি ছবি', 'Your names, events & up to 5 photos'),
                t('নাম ধরে ব্যক্তিগত লিংক ও অতিথির উত্তর', 'Named links & guest replies'),
                t('নিজস্ব customer portal', 'Your own customer portal'),
              ].map((item) => (
                <li key={item}>
                  <Check size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <a
              className={s.primary}
              href={href}
              {...(name === 'Customized' ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {name === 'Customized'
                ? t('WhatsApp-এ আলোচনা করুন', 'Discuss on WhatsApp')
                : t('নকশা বেছে নিন', 'Choose your design')}
              <ArrowRight size={16} />
            </a>
          </article>
        ))}
      </div>
      <ManualPayment />
      {standalone && <FAQ />}
    </section>
  );
}
export function FAQ() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <section className={s.faq}>
      <div>
        <span className={s.eyebrow}>A LITTLE CLARITY</span>
        <h2>{t('কিছু প্রশ্ন, সহজ উত্তর।', 'A few questions, answered.')}</h2>
      </div>
      <div>
        {[
          [
            t('কীভাবে অর্ডার করব?', 'How do I order?'),
            t(
              'নকশা বেছে নিজের ইমেইল দিয়ে প্রবেশ করুন। আয়োজনের তথ্য দিন। মূল্য, কাজের পরিধি ও মেয়াদ নিশ্চিত করে পেমেন্টের নির্দেশনা অনুসরণ করুন।',
              'Choose a design and sign in with your own email. Share your event details, agree the scope and term, then follow the payment instructions.',
            ),
          ],
          [
            t('পেমেন্টের পরই কি পোর্টাল খুলবে?', 'Does payment immediately unlock my portal?'),
            t(
              'Transaction ID জমা দেওয়ার পর আমাদের টিম আসল লেনদেন মিলিয়ে দেখবে। যাচাই ও activation সম্পন্ন হলে আপনার অ্যাকাউন্টে পোর্টাল খুলবে।',
              'After you submit the transaction ID, our team checks the actual transfer. Your portal opens after verification and activation.',
            ),
          ],
          [
            t('অতিথিদের কীভাবে পাঠাব?', 'How do I share invitations?'),
            t(
              'অতিথির নামে লিংক তৈরি করে WhatsApp, Messenger বা ইমেইলে নিজে পাঠাতে পারবেন। স্বয়ংক্রিয় মেসেজ পাঠানো এখন এই প্যাকেজে নেই।',
              'Create a named link and share it yourself through WhatsApp, Messenger or email. Automated sending is not included.',
            ),
          ],
          [
            t('নকশা ও তথ্য কি বদলানো যাবে?', 'Can I edit my invitation?'),
            t(
              'পোর্টাল থেকে নাম, অনুষ্ঠান, ছবি ও বক্তব্য সম্পাদনা করে প্রিভিউ দেখতে পারবেন। প্রকাশ করার পরেই পরিবর্তন অতিথিদের কাছে যাবে। কাস্টম artwork-এর পরিবর্তন আলোচনা করে নির্ধারিত হবে।',
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
              <span>+</span>
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
          <span className={s.eyebrow}>
            {t('শিকড়ে ঐতিহ্য · আমন্ত্রণে ভালোবাসা', 'ROOTED IN TRADITION. SENT WITH LOVE.')}
          </span>
          <h1>
            {t('একটি নিমন্ত্রণপত্র।', 'An invitation.')}
            <br />
            <em>{t('আরও একটু ব্যক্তিগত।', 'A little more personal.')}</em>
          </h1>
          <p>
            {t(
              'আপনাদের গল্প, আমাদের নকশা। ঐতিহ্যবাহী বাঙালি নান্দনিকতায় তৈরি ডিজিটাল আমন্ত্রণ—বিশেষ দিনকে আরও অর্থপূর্ণ করে তুলুন।',
              'Your story, their name, and a little piece of home. Digital wedding invitations made for the way you celebrate.',
            )}
          </p>
          <div className={s.heroActions}>
            <a className={s.primary} href="/templates/">
              {t('আপনার নকশা খুঁজুন', 'Find your invitation')} <ArrowRight size={17} />
            </a>
            <a className={s.textLink} href="/invite/">
              {t('নমুনা দেখুন', 'View a sample')} <ArrowUpRight size={16} />
            </a>
          </div>
          <small>
            {t(
              '৳৫০০ থেকে · বাংলা ও ইংরেজি · নিজস্ব পোর্টাল',
              'From ৳500 · Bengali & English · Your own portal',
            )}
          </small>
        </div>
        <figure className={s.heroArt}>
          <img
            src="/brand/storefront-hero-match.webp"
            alt={t(
              'জামদানি-অনুপ্রাণিত ডিজিটাল আমন্ত্রণের শিল্পিত উপস্থাপনা',
              'An artistic presentation of a Jamdani-inspired digital invitation',
            )}
            width="1600"
            height="900"
            fetchPriority="high"
          />
          <figcaption>
            {t('ঐতিহ্যের অনুভব। ডিজিটালের সহজতা।', 'The feeling of tradition. The ease of digital.')}
          </figcaption>
        </figure>
      </section>
      <div className={s.values}>
        <span>
          <Flower2 size={20} />
          {t('বাংলার নকশা, আধুনিক আয়োজনে', 'Bengali craft, a modern celebration')}
        </span>
        <span>
          <UsersRound size={20} />
          {t('প্রতিটি অতিথির নামে আমন্ত্রণ', 'Every guest, personally invited')}
        </span>
        <span>
          <ShieldCheck size={20} />
          {t('উত্তর ও শুভেচ্ছা আপনার কাছে', 'Replies & wishes, just for you')}
        </span>
      </div>
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
            <a className={s.textLink} href="/invite/">
              {t('আরও জানুন', 'Discover more')}
              <ArrowRight size={15} />
            </a>
          </div>
        </article>
        <article>
          <img src="/brand/feature-rsvp.webp" alt="" width="300" height="300" loading="lazy" />
          <div>
            <h2>{t('ব্যক্তিগত উত্তর', 'Replies, beautifully arranged')}</h2>
            <p>
              {t(
                'সহজ এবং সুন্দরভাবে আপনার অতিথিদের উপস্থিতি নিশ্চিত করুন। উত্তর ও শুভেচ্ছা রাখুন এক জায়গায়।',
                'Make it easy for your guests to reply. Keep attendance and wishes together in one place.',
              )}
            </p>
            <a className={s.textLink} href="/#how-it-works">
              {t('আরও জানুন', 'See how it works')}
              <ArrowRight size={15} />
            </a>
          </div>
        </article>
      </section>
      <TemplateCollection />
      <section id="how-it-works" className={s.steps}>
        <span className={s.eyebrow}>{t('শুরু থেকে শুভক্ষণ', 'FROM FIRST LOOK TO YOUR BIG DAY')}</span>
        <h2>{t('তিন ধাপে সুন্দর শুরু।', 'Three steps to something lovely.')}</h2>
        <div>
          {[
            [
              t('নকশা বেছে নিন', 'Find your design'),
              t(
                'সংগ্রহ ঘুরে দেখুন, নমুনা খুলুন, আপনার আয়োজনের তথ্য দিন।',
                'Browse the collection, open the samples, share your event details.',
              ),
            ],
            [
              t('অর্ডার নিশ্চিত করুন', 'Make it yours'),
              t(
                'মূল্য ও মেয়াদ দেখে পেমেন্ট করুন। যাচাইয়ের পর নিজের পোর্টাল পান।',
                'Agree the price and term, make your transfer, and receive portal access after verification.',
              ),
            ],
            [
              t('প্রিয়জনকে আমন্ত্রণ জানান', 'Invite your people'),
              t(
                'তথ্য ও ছবি সাজিয়ে প্রকাশ করুন। ব্যক্তিগত লিংক পাঠিয়ে উত্তর দেখুন।',
                'Add your details and photos, publish, share personal links, and follow the replies.',
              ),
            ],
          ].map(([title, body], i) => (
            <article key={title}>
              <b>0{i + 1}</b>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={s.specialPackage}>
        <img src="/brand/feature-weave.webp" alt="" width="600" height="400" loading="lazy" />
        <div>
          <h2>{t('একটি বিশেষ প্যাকেজ', 'Something especially yours')}</h2>
          <p>
            {t(
              'নকশা, নাম ধরে আমন্ত্রণ, অতিথিদের উত্তর এবং নিজের পোর্টাল—আপনাদের জন্য একটি সম্পূর্ণ আয়োজন। কাস্টম নকশার ভাবনাও জানান আমাদের।',
              'A considered design, named invitations, guest replies and your own portal. Tell us about your custom design ideas, too.',
            )}
          </p>
          <a
            className={s.primary}
            href={whatsappLink('Customized ৳১,৫০০ invitation নিয়ে আলোচনা করতে চাই।')}
            target="_blank"
            rel="noreferrer"
          >
            {t('কাস্টম অর্ডার করুন', 'Start a custom order')}
            <ArrowRight size={16} />
          </a>
        </div>
        <LotusMark size={105} />
      </section>
      <Pricing />
      <FAQ />
      <section className={s.finalCta}>
        <span>WITH LOVE, DAWAT.</span>
        <h2>{t('আপনাদের গল্পটা শুরু হোক।', 'Let your story begin.')}</h2>
        <a className={s.primary} href="/templates/">
          {t('নকশার সংগ্রহ দেখুন', 'Explore the collection')} <ArrowRight size={16} />
        </a>
      </section>
    </StorefrontFrame>
  );
}
