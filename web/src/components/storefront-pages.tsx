'use client';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { StorefrontFrame, TemplateCard } from './storefront';
import { taka } from '@/features/production/money';
import { findTemplate, prices, whatsappLink } from '@/features/production/catalog';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF } from '@/features/production/brand';
import { useProductLocale } from './production/product-locale';
import s from './storefront.module.css';
import { ManualPayment } from './manual-payment';
export function ContactPage() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <StorefrontFrame>
      <section className={s.simple}>
        <span className={s.eyebrow}>{t('চলুন, ব্যক্তিগত কিছু গড়ি', 'LET’S MAKE SOMETHING PERSONAL')}</span>
        <h1>{t('আপনার আয়োজনের কথা বলুন।', 'Tell us about your celebration.')}</h1>
        <p>
          {t(
            'নকশা পছন্দ করা থেকে কাস্টম আমন্ত্রণ, অর্ডার বা পেমেন্টের সহায়তা—WhatsApp-এ কথা বলুন।',
            'From choosing a design to a custom invitation, order or payment question, talk to us on WhatsApp.',
          )}
        </p>
        <a className={s.primary} href={whatsappLink()} target="_blank" rel="noreferrer">
          <MessageCircle size={18} />
          01606 092143
        </a>
        <a className={s.textLink} href={DAWAT_CONTACT_HREF}>
          {DAWAT_CONTACT_EMAIL}
        </a>
        <h2>{t('ইতোমধ্যে অর্ডার করেছেন?', 'Already have an order?')}</h2>
        <p>
          {t(
            'যাচাই করা ইমেইল দিয়ে অর্ডারের পৃষ্ঠায় লগইন করুন। অনুরোধ, দাম ও শর্ত ও পেমেন্টের অবস্থা সেখানেই পাবেন।',
            'Sign in with your verified email to see your request, quote and payment progress.',
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
  return (
    <StorefrontFrame>
      <section className={s.simple}>
        <span className={s.eyebrow}>{t('স্পষ্ট শর্ত', 'CLEAR EXPECTATIONS')}</span>
        <h1>{t('সেবার শর্ত ও গোপনীয়তা', 'Service & privacy')}</h1>
        <p>
          {t(
            'প্রযোজ্য: ২৮ অক্টোবর ২০২৬। অর্ডারের লিখিত সম্মতিতে আপনার নির্দিষ্ট কাজের পরিধি, মূল্য ও মেয়াদ দেওয়া থাকবে।',
            'Effective 28 October 2026. Your written order agreement specifies your scope, price and hosting term.',
          )}
        </p>
        {[
          [
            t('কী পাবেন', 'What you receive'),
            t(
              'এটি ডিজিটাল বিয়ের আমন্ত্রণের সেবা। নিজের তথ্য বদলাতে, পাঁচটি ছবি দিতে এবং অতিথির উত্তর দেখতে পারবেন। নাম ধরে বা সবার জন্য এক লিংক পাঠাতে পারবেন। ছাপানো কার্ড, নিজে থেকে বার্তা পাঠানো ও নিজের ডোমেইন প্যাকেজে নেই। কাস্টম নকশার কাজ ও পরিবর্তনের সীমা অর্ডারে ঠিক হবে।',
              'This is a digital wedding invitation service with your selected design, editable details, up to five photos, personal guest links and reply management. Printed cards, automated messaging and custom domains are not included. Custom design scope and revisions are agreed in your order.',
            ),
          ],
          [
            t('দাম, পেমেন্ট ও আয়োজন চালু করা', 'Pricing, payment & activation'),
            t(
              'ক্লাসিক ৳৫০০, প্রিমিয়াম ৳৭৫০, নিজের মতো ৳১,৫০০। দাম, মেয়াদ ও নির্দেশনা দেখে সম্মতি দেওয়ার পরে টাকা পাঠান। লেনদেন নম্বর জমা দিলেই পেমেন্ট যাচাই হয় না। দাওয়াত টিম আসল লেনদেন মিলিয়ে অর্ডার নিশ্চিত করবে এবং আয়োজনের পাতা চালু করবে।',
              'Classic ৳500, Premium ৳750, Custom ৳1,500. Confirm the order amount, term and payment instructions before transferring. A submitted transaction ID does not verify payment. The seller checks the actual transfer before order confirmation and portal activation.',
            ),
          ],
          [
            t('মেয়াদ, পরিবর্তন ও বাতিল', 'Term, changes & cancellation'),
            t(
              'মেয়াদ প্রথমবার প্রকাশ থেকে শুরু হয়। আবার প্রকাশ করলে মেয়াদ বাড়ে না। সাধারণ প্যাকেজের মেয়াদ ৯০ দিন। সম্মতি না দেওয়া অনুরোধ নিজে বাতিল করতে পারবেন। সম্মতি দেওয়া বা টাকা দেওয়া অর্ডার বদলাতে, বাতিল করতে বা টাকা ফেরত চাইতে অর্ডার নম্বরসহ যোগাযোগ করুন। পেমেন্টের আগে লিখিত দাম ও শর্তে সম্মতি দিতে হবে। টাকা নিজে থেকে ফেরত আসে না।',
              'The term begins on first publication and does not restart on republishing. You can cancel an unaccepted request. For changes, cancellation or refund of accepted or paid orders, contact us with your reference. Applicable terms must be agreed in the written quote before payment; refunds are not automatic.',
            ),
          ],
          [
            t('আপনার তথ্য', 'Your information'),
            t(
              'সেবা দিতে ইমেইল, অর্ডারের তথ্য, আমন্ত্রণের লেখা ও ছবি, অতিথির নাম, ঐচ্ছিক ফোন নম্বর এবং উত্তর রাখা হয়। অতিথির উত্তর, নিজের নোট ও শুভেচ্ছা সবার সামনে দেখানো হয় না। লগইন ও ভাষা মনে রাখতে প্রয়োজনীয় কুকি ব্যবহার হয়। বিজ্ঞাপনের জন্য কাউকে অনুসরণ করা হয় না। আমন্ত্রণের মেয়াদ শেষের ৩০ দিন পরে অতিথির ফোন নম্বর মুছে দেওয়া হয়।',
              'We store your email, order details, invitation content and photos, guest names and replies to provide the service. Guest replies, private notes and wishes do not appear in the public collection. Essential cookies support login and language preference. No advertising tracking has been added. Guest phone numbers are deleted 30 days after the invitation expires.',
            ),
          ],
          [
            t('লিংক শেয়ার ও তথ্য অপসারণ', 'Sharing & data removal'),
            t(
              'ব্যক্তিগত লিংক যাঁর কাছে থাকবে, তিনি সেই পরিবারের হয়ে উত্তর দিতে পারবেন। তাই বুঝে শেয়ার করুন। আমার আয়োজন থেকে লিংক বন্ধ করা যায়। তথ্য দেখতে, বদলাতে বা মুছতে নিজের যাচাই করা ইমেইল থেকে যোগাযোগ করুন। অর্ডার ও কাজের ইতিহাস কতদিন রাখা হবে, তা দাওয়াত টিমের সঙ্গে জেনে নিন।',
              'Anyone holding a personal invitation link can reply for that invitation, so share it carefully. Links can be revoked from your portal. Contact us from your verified email to request access, correction or removal of data. Confirm retention of necessary order/audit records and removal timing with support.',
            ),
          ],
        ].map(([heading, body]) => (
          <div key={heading} id={heading === t('আপনার তথ্য', 'Your information') ? 'privacy' : heading === t('মেয়াদ, পরিবর্তন ও বাতিল', 'Term, changes & cancellation') ? 'refund' : undefined}>
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
export function OrderIntro({ templateId }: { templateId?: string }) {
  const template = findTemplate(templateId);
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <StorefrontFrame>
      <section className={s.simple}>
        <span className={s.eyebrow}>
          {t('আপনার আমন্ত্রণ, আর এক ধাপ দূরে', 'YOUR INVITATION, ONE STEP CLOSER')}
        </span>
        <h1>{t('আপনার আয়োজন শুরু হোক।', 'Let’s make it yours.')}</h1>
        <div className={s.orderIntro}>
          <div className={s.orderPreview}>
            <TemplateCard template={template} selected />
          </div>
          <div className={s.orderDetails}>
            <h2>
              {locale === 'bn' ? template.name : template.en} · {taka(prices[template.tier], locale)}
            </h2>
            <p>
              {t(
                'নিজের ইমেইল যাচাই করে আয়োজনের তথ্য দিন। মূল্য, লিংক চালু থাকার মেয়াদ ও কাজের শর্ত দেখেই অর্ডারে সম্মতি দেবেন। এরপর পেমেন্টের নির্দেশনা ও Transaction ID জমা দেওয়ার সুযোগ পাবেন।',
                'Verify your own email and share your event details. Review the price, hosting term and scope before accepting. Then follow the payment instructions and submit your transaction ID.',
              )}
            </p>
            <a className={s.primary} href={`/order/requests/?template=${template.id}`}>
              {t('অর্ডার শুরু করুন', 'Start your order')}
              <ArrowRight size={16} />
            </a>
            <p>
              {t(
                'অ্যাকাউন্ট খুললেই পেমেন্ট নেওয়া হয় না। আপনার ইমেইলেই আপনার অর্ডার ও আয়োজনের পাতা থাকবে।',
                'Creating an account does not take payment. Your own email keeps your order and portal together.',
              )}
            </p>
            <a
              className={s.textLink}
              href={whatsappLink(`${template.en} (৳${prices[template.tier]}) নকশাটি নিয়ে জানতে চাই।`)}
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
