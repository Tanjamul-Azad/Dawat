'use client';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { TemplateCard } from './storefront';
import { StorefrontFrame } from './storefront-chrome';
import { taka } from '@/features/production/money';
import { findTemplate, packageName, prices, whatsappLink } from '@/features/production/catalog';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF } from '@/features/production/brand';
import { useProductLocale } from './production/product-locale';
import s from './storefront.module.css';
import { ManualPayment } from './manual-payment';
import { withNames, type CoupleNames } from './storefront-names';

export function ContactPage() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <StorefrontFrame>
      <section className={s.simple}>
        <span className={s.eyebrow}>{t('চলুন, কথা বলি', 'LET’S TALK')}</span>
        <h1>{t('আপনার আয়োজনের কথা বলুন।', 'Tell us about your celebration.')}</h1>
        <p>
          {t(
            'নকশা বাছা, নিজের মতো নকশা, অর্ডার বা পেমেন্ট নিয়ে যা জানার আছে, WhatsApp-এ লিখুন।',
            'About choosing a design, a custom design, your order or a payment: write to us on WhatsApp.',
          )}
        </p>
        <a className={s.primary} href={whatsappLink()} target="_blank" rel="noreferrer">
          <MessageCircle size={18} />
          01606 092143
        </a>
        <a className={s.textLink} href={DAWAT_CONTACT_HREF}>
          {DAWAT_CONTACT_EMAIL}
        </a>
        <h2>{t('আগেই অর্ডার করেছেন?', 'Already placed an order?')}</h2>
        <p>
          {t(
            'যে ইমেইলে অর্ডার করেছেন, সেটা দিয়ে লগইন করুন। অনুরোধ, দাম ও শর্ত আর পেমেন্টের অবস্থা সেখানেই দেখবেন।',
            'Log in with the email you ordered with. Your request, price and terms, and payment status are all there.',
          )}
        </p>
        <a className={s.textLink} href="/order/requests/">
          {t('আমার অর্ডার দেখুন', 'View my orders')}
          <ArrowRight size={16} />
        </a>
        <ManualPayment />
      </section>
    </StorefrontFrame>
  );
}

export function PoliciesPage() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const price = (tier: 'normal' | 'premium' | 'custom') =>
    `${packageName(tier, locale)} ${taka(prices[tier], locale)}`;
  return (
    <StorefrontFrame>
      <section className={s.simple}>
        <span className={s.eyebrow}>{t('স্পষ্ট শর্ত', 'CLEAR EXPECTATIONS')}</span>
        <h1>{t('সেবার শর্ত ও গোপনীয়তা', 'Terms of service and privacy')}</h1>
        <p>
          {t(
            'শেষ বদল: ২৮ অক্টোবর ২০২৬। আপনার অর্ডারে লেখা সম্মতিতে কাজের পরিধি, দাম আর মেয়াদ আলাদা করে দেওয়া থাকে।',
            'Last changed: 28 October 2026. The agreement you accept in your order states your scope, price and term.',
          )}
        </p>
        {[
          [
            'terms',
            t('কী পাবেন', 'What you receive'),
            t(
              'এটা ডিজিটাল বিয়ের আমন্ত্রণের সেবা। প্যাকেজে থাকে বেছে নেওয়া নকশা, নিজের তথ্য এডিট করার সুযোগ, সর্বোচ্চ পাঁচটি ছবি, অতিথির ব্যক্তিগত লিংক আর উত্তরের হিসাব। ছাপানো কার্ড আর নিজের ডোমেইন এতে নেই। WhatsApp-এ সম্পূর্ণ স্বয়ংক্রিয় বার্তাও নেই: আপনি নিজের WhatsApp থেকে এক ট্যাপে পাঠান। নিজের মতো নকশার কাজ আর কতবার বদলানো যাবে, তা অর্ডারে ঠিক করা হয়।',
              'This is a digital wedding invitation service. A package includes your chosen design, editing your own details, up to five photos, personal guest links and reply tracking. Printed cards and custom domains are not included. Fully automatic WhatsApp messages are not included either: you send from your own WhatsApp in one tap. The scope and number of changes for a custom design are agreed in your order.',
            ),
          ],
          [
            'pricing',
            t('দাম, পেমেন্ট আর আয়োজনের পাতা চালু হওয়া', 'Price, payment and opening your page'),
            t(
              `${price('normal')}, ${price('premium')}, ${price('custom')}। অর্ডারে দাম, মেয়াদ আর পেমেন্টের নির্দেশনা দেখে নেওয়ার আগে টাকা পাঠাবেন না। Transaction ID জমা দিলেই পেমেন্ট যাচাই হয়ে যায় না। দাওয়াত টিম আসল লেনদেন মিলিয়ে দেখার পরে অর্ডার নিশ্চিত করে আর আপনার আয়োজনের পাতা চালু করে।`,
              `${price('normal')}, ${price('premium')}, ${price('custom')}. Check the price, term and payment instructions in your order before you send any money. Submitting a transaction ID does not verify a payment. The Dawat team checks the actual transfer, then confirms your order and opens your page.`,
            ),
          ],
          [
            'refund',
            t('মেয়াদ, বদল, বাতিল আর টাকা ফেরত', 'Term, changes, cancellation and refunds'),
            t(
              'মেয়াদ শুরু হয় প্রথমবার চালু করার দিন থেকে। আবার প্রকাশ করলে মেয়াদ বাড়ে না। যে অনুরোধে এখনো সম্মতি দেননি, সেটা নিজেই বাতিল করতে পারবেন। সম্মতি দেওয়া বা পেমেন্ট করা অর্ডারের বদল, বাতিল বা টাকা ফেরতের জন্য অর্ডার নম্বর দিয়ে আমাদের জানান। পেমেন্টের আগে দাম ও শর্তের লেখায় এসব নিয়ম মেনে নিতে হয়। টাকা নিজে থেকে ফেরত হয় না।',
              'The term starts the day you first open the invitation to guests, and publishing again does not extend it. You can cancel a request you have not yet accepted. For changes, cancellation or a refund on an accepted or paid order, contact us with your order number. These rules are agreed in the written price and terms before you pay. Refunds are not automatic.',
            ),
          ],
          [
            'privacy',
            t('আপনার তথ্য', 'Your information'),
            t(
              'সেবা দেওয়ার জন্য আমরা আপনার ইমেইল, অর্ডারের তথ্য, আমন্ত্রণের লেখা ও ছবি, অতিথির নাম আর তাঁদের উত্তর রাখি। অতিথির উত্তর, ব্যক্তিগত নোট আর শুভেচ্ছা সবার জন্য খোলা কোথাও দেখানো হয় না। অতিথির ফোন নম্বর বা ইমেইল শুধু আমন্ত্রণ পাঠানোর জন্য রাখা হয় আর অতিথির পাতায় দেখানো হয় না। বিয়ের মেয়াদ শেষের ৩০ দিন পরে এই যোগাযোগের তথ্য মুছে ফেলা হয়। লগইন আর ভাষা মনে রাখার জন্য শুধু দরকারি কুকি ব্যবহার হয়। এই সাইটে বিজ্ঞাপনের ট্র্যাকিং নেই।',
              'To provide the service we keep your email, order details, invitation text and photos, guest names and their replies. Guest replies, private notes and wishes are never shown publicly. A guest’s phone number or email is kept only to send the invitation and is never shown on the guest’s page. This contact information is deleted 30 days after the wedding term ends. Only essential cookies are used, for login and language. There is no advertising tracking on this site.',
            ),
          ],
          [
            'sharing',
            t('লিংক শেয়ার আর তথ্য মোছা', 'Sharing links and removing data'),
            t(
              'ব্যক্তিগত লিংক যাঁর কাছে থাকবে, তিনিই সেই আমন্ত্রণের উত্তর দিতে পারবেন। তাই লিংক সাবধানে পাঠান। আপনার আয়োজনের পাতা থেকে লিংক বন্ধ করা যায়। আপনার তথ্য দেখতে, ঠিক করতে বা মুছতে চাইলে যাচাই করা ইমেইল থেকে আমাদের লিখুন। অর্ডার আর হিসাবের যেসব রেকর্ড রাখা জরুরি, সেগুলো কতদিন রাখা হবে আর কবে মোছা হবে, তা আমাদের কাছ থেকে জেনে নিন।',
              'Anyone who holds a personal link can reply to that invitation, so share it carefully. You can turn a link off from your page. To see, correct or delete your data, write to us from your verified email. For the order and accounting records we must keep, ask us how long they are kept and when they are deleted.',
            ),
          ],
        ].map(([id, heading, body]) => (
          <div key={id} id={id}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </div>
        ))}
        <a className={s.textLink} href={DAWAT_CONTACT_HREF}>
          {DAWAT_CONTACT_EMAIL}
        </a>
      </section>
    </StorefrontFrame>
  );
}

export function OrderIntro({ templateId, names }: { templateId?: string; names?: CoupleNames }) {
  const template = findTemplate(templateId);
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <StorefrontFrame>
      <section className={s.simple}>
        <span className={s.eyebrow}>{t('আর এক ধাপ বাকি', 'ONE STEP LEFT')}</span>
        <h1>{t('আপনার আয়োজন শুরু করি।', 'Let’s start your celebration.')}</h1>
        <div className={s.orderIntro}>
          <div className={s.orderPreview}>
            <TemplateCard template={template} selected names={names} />
          </div>
          <div className={s.orderDetails}>
            <h2>
              {locale === 'bn' ? template.name : template.en} · {taka(prices[template.tier], locale)}
            </h2>
            <p>
              {t(
                'নিজের ইমেইল দিয়ে লগইন করুন আর আয়োজনের তথ্য দিন। দাম, মেয়াদ আর কাজের শর্ত দেখে সম্মতি দিন। তারপর পেমেন্টের নির্দেশনা পাবেন, সেখানে Transaction ID জমা দেবেন।',
                'Log in with your own email and add your event details. Check the price, term and scope, then agree. You will then get the payment steps and submit your transaction ID there.',
              )}
            </p>
            <a
              className={s.primary}
              href={withNames(`/order/requests/?template=${template.id}`, names ?? { first: '', second: '' })}
            >
              {t('অর্ডার শুরু করুন', 'Start your order')}
              <ArrowRight size={16} />
            </a>
            <p>
              {t(
                'লগইন করলেই টাকা কাটা হয় না। আপনার অর্ডার আর আয়োজনের পাতা আপনার ইমেইলেই থাকবে।',
                'Logging in does not charge you. Your order and your page stay under your own email.',
              )}
            </p>
            <a
              className={s.textLink}
              href={whatsappLink(
                `${template.name} (${taka(prices[template.tier], 'bn')}) নকশাটি নিয়ে জানতে চাই।`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              {t('আগে একটু কথা বলি', 'Talk to us first')}
            </a>
          </div>
        </div>
      </section>
    </StorefrontFrame>
  );
}
