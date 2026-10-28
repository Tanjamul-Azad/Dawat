'use client';
import { ChevronDown, HeartHandshake, ShieldCheck, Wallet } from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import { reviews, founder, type Review, type Founder } from '@/features/production/brand';
import type { PaymentReviewPromise } from '@/features/production/public-config';
import s from './storefront.module.css';
import x from './storefront-sections.module.css';

/** What we promise, in three short lines. The payment line comes from owner config and is hidden when empty. */
export function PromiseBlock({ paymentPromise }: { paymentPromise?: PaymentReviewPromise }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const payment = paymentPromise?.[locale] ?? '';
  const items = [
    {
      icon: <Wallet size={22} aria-hidden="true" />,
      title: t('টাকা দেওয়ার আগে সব লেখা থাকে', 'Everything is written down before you pay'),
      body: t(
        'দাম, মেয়াদ আর কাজের শর্ত আগে দেখে সম্মতি দেবেন। তারপরই পেমেন্ট।',
        'You see the price, term and scope and agree to them first. Only then do you pay.',
      ),
    },
    {
      icon: <ShieldCheck size={22} aria-hidden="true" />,
      title: t('অতিথির তথ্য আপনার', 'Your guests’ details stay yours'),
      body: t(
        'অতিথির তথ্য বিক্রি হয় না, বিজ্ঞাপনেও ব্যবহার হয় না।',
        'Guest details are never sold and never used for advertising.',
      ),
    },
    {
      icon: <HeartHandshake size={22} aria-hidden="true" />,
      title: t('পাঠানো আপনার হাতে', 'Sending stays in your hands'),
      body: t(
        'আমন্ত্রণ যায় আপনার নিজের WhatsApp থেকে। আমরা অতিথিকে নিজে থেকে মেসেজ করি না।',
        'Invitations go from your own WhatsApp. We never message your guests on our own.',
      ),
    },
  ];
  return (
    <section className={x.promise} aria-labelledby="promise-title">
      <h2 id="promise-title">{t('আমাদের কথা দেওয়া', 'What we promise')}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.title}>
            {item.icon}
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
      {payment && (
        <p className={x.promiseLine}>
          <ShieldCheck size={18} aria-hidden="true" /> {payment}
        </p>
      )}
    </section>
  );
}

/** Renders nothing until `reviews` holds real, permitted reviews. */
export function Reviews({ items = reviews }: { items?: readonly Review[] }) {
  const { locale } = useProductLocale();
  if (!items.length) return null;
  return (
    <section className={x.reviews} aria-labelledby="reviews-title">
      <h2 id="reviews-title">{locale === 'bn' ? 'যাঁরা ব্যবহার করেছেন' : 'From people who used it'}</h2>
      <ul>
        {items.map((review) => (
          <li key={review.name}>
            <blockquote>{review.quote[locale]}</blockquote>
            <p>
              {review.name}
              {review.place ? ` · ${review.place}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Renders nothing until `founder` is filled in. */
export function FounderNote({ person = founder }: { person?: Founder | null }) {
  const { locale } = useProductLocale();
  if (!person) return null;
  return (
    <section className={x.founder} aria-labelledby="founder-title">
      {person.photo && (
        <img
          src={person.photo.src}
          alt={person.name}
          width={person.photo.width}
          height={person.photo.height}
          loading="lazy"
          decoding="async"
        />
      )}
      <div>
        <h2 id="founder-title">{locale === 'bn' ? 'কেন দাওয়াত বানালাম' : 'Why I built Dawat'}</h2>
        <p>{person.note[locale]}</p>
        <strong>{person.name}</strong>
      </div>
    </section>
  );
}

export function faqItems(
  locale: 'bn' | 'en',
  paymentPromise?: PaymentReviewPromise,
): { q: string; a: string[] }[] {
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const promise = paymentPromise?.[locale] ?? '';
  return [
    {
      q: t('কীভাবে অর্ডার করব?', 'How do I order?'),
      a: [
        t(
          'পছন্দের নকশা বেছে নিন। নিজের ইমেইলে লগইন করে আয়োজনের তথ্য দিন। দাম আর শর্ত দেখে সম্মতি দিন, তারপর bKash-এ পেমেন্ট করুন।',
          'Pick a design and log in with your own email. Add your event details, agree to the price and terms, then pay by bKash.',
        ),
      ],
    },
    {
      q: t('পেমেন্টের পরই কি আমার আয়োজনের পাতা খুলবে?', 'Does my page open as soon as I pay?'),
      a: [
        t(
          'সঙ্গে সঙ্গে নয়। Transaction ID জমা দেওয়ার পর আমরা আসল পেমেন্টটা মিলিয়ে দেখি। মিললে আপনার আয়োজনের পাতা চালু হয়।',
          'Not instantly. After you submit the transaction ID, we check the real payment. Once it matches, your page opens.',
        ),
        ...(promise ? [promise] : []),
      ],
    },
    {
      q: t('অতিথিদের কীভাবে পাঠাব?', 'How do I send invitations to guests?'),
      a: [
        t(
          'দুইভাবে পাঠাতে পারবেন। দুটোই আপনার নিজের WhatsApp থেকে যায়।',
          'You can send in two ways. Both go out from your own WhatsApp.',
        ),
        t(
          'নাম ধরে আলাদা আমন্ত্রণ: প্রতিটি পরিবারের জন্য আলাদা লিংক পাবেন। পরিবারের WhatsApp নম্বর দিয়ে “WhatsApp-এ পাঠান” চাপুন। আপনার নিজের WhatsApp খুলবে, বার্তা আর লিংক লেখা থাকবে। আপনি শুধু Send চাপবেন। কে খুলেছেন আর কে উত্তর দিয়েছেন, তা আপনার তালিকায় দেখা যায়।',
          'Personal invitations: each family gets its own link. Add the family’s WhatsApp number and tap “Send on WhatsApp”. Your own WhatsApp opens with the message and link already written. You only press Send. Your list shows who has opened it and who has replied.',
        ),
        t(
          'সবার জন্য একটি লিংক: একটি লিংক আর একটি কার্ড, সবার জন্য। একবার WhatsApp গ্রুপে বা ব্রডকাস্ট লিস্টে পাঠালেই হয়। অতিথি নিজেই নিজের নাম আর কতজন আসবেন লিখে উত্তর দেন। সবার কাছে পৌঁছানোর সবচেয়ে দ্রুত উপায় এটাই।',
          'One link for everyone: one link and one card for all. Send it once to a WhatsApp group or broadcast list. Each guest writes their own name and how many are coming. It is the quickest way to reach everyone.',
        ),
        t(
          'আমরা WhatsApp-এ নিজে থেকে কিছু পাঠাই না, তাই আপনার নম্বর বন্ধ হওয়ার ভয় নেই।',
          'We never send WhatsApp messages on our own, so your number is never at risk.',
        ),
      ],
    },
    {
      q: t('নকশা আর তথ্য কি বদলানো যাবে?', 'Can I change my invitation later?'),
      a: [
        t(
          'হ্যাঁ। আয়োজনের পাতা থেকে নাম, অনুষ্ঠান, ছবি আর লেখা এডিট করে আগে প্রিভিউ দেখুন। “প্রকাশ করুন” চাপলে তবেই অতিথিরা বদল দেখবেন। নিজের মতো নকশার বদল কতটা হবে, তা অর্ডারে ঠিক করা থাকে।',
          'Yes. Edit names, events, photos and wording on your page and preview first. Guests see changes only after you press publish. How many changes a custom design includes is agreed in your order.',
        ),
      ],
    },
    {
      q: t('কতদিন লিংক চালু থাকবে?', 'How long does the invitation stay online?'),
      a: [
        t(
          'মেয়াদ আপনার অর্ডারে লেখা থাকে। প্রথমবার অতিথিদের জন্য চালু করার দিন থেকে মেয়াদ শুরু হয়। পরে আবার প্রকাশ করলে মেয়াদ নতুন করে শুরু হয় না।',
          'The term is written in your order. It starts the day you first open the invitation to guests. Publishing changes later does not restart it.',
        ),
      ],
    },
    {
      q: t('অতিথির ফোন নম্বর কি নিরাপদ?', 'Are my guests’ phone numbers safe?'),
      a: [
        t(
          'ফোন নম্বর শুধু আমন্ত্রণ পাঠানোর জন্য রাখা হয়। অতিথির পাতায় দেখানো হয় না। আমন্ত্রণের মেয়াদ শেষের ৩০ দিন পরে মুছে ফেলা হয়।',
          'Phone numbers are kept only to send invitations and are never shown on a guest’s page. They are deleted 30 days after the invitation expires.',
        ),
      ],
    },
    {
      q: t('টাকা ফেরত পাওয়া যাবে?', 'Can I get a refund?'),
      a: [
        t(
          'অর্ডার নম্বর দিয়ে আমাদের জানান। টাকা নিজে থেকে ফেরত হয় না। পেমেন্টের আগে দাম ও শর্তের লেখায় যে নিয়ম মেনেছেন, সেই অনুযায়ী আমরা দেখে জানাই।',
          'Contact us with your order number. Refunds are not automatic. We review them under the terms you agreed to in the price and terms before paying.',
        ),
      ],
    },
  ];
}

export function FAQ({ paymentPromise }: { paymentPromise?: PaymentReviewPromise }) {
  const { locale } = useProductLocale();
  const items = faqItems(locale, paymentPromise);
  return (
    <section className={s.faq} id="faq" aria-labelledby="faq-title">
      <div>
        <h2 id="faq-title">{locale === 'bn' ? 'যা জানতে চান' : 'Questions, answered'}</h2>
        <p>
          {locale === 'bn'
            ? 'আর কিছু জানার থাকলে WhatsApp-এ লিখুন।'
            : 'Anything else? Message us on WhatsApp.'}
        </p>
      </div>
      <div>
        {items.map(({ q, a }) => (
          <details key={q} name="faq">
            <summary>
              {q}
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            {a.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </details>
        ))}
      </div>
    </section>
  );
}
