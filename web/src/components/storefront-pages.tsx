'use client';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { StorefrontFrame, TemplateCard } from './storefront';
import { findTemplate, prices, whatsappLink } from '@/features/production/catalog';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF } from '@/features/production/brand';
import { useProductLocale } from './production/product-locale';
import s from './storefront.module.css';
export function ContactPage() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <StorefrontFrame>
      <section className={s.simple}>
        <span className={s.eyebrow}>LET’S MAKE SOMETHING PERSONAL</span>
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
            'আপনার verified ইমেইল দিয়ে অর্ডারের পৃষ্ঠায় প্রবেশ করুন। অনুরোধ, কোটেশন ও পেমেন্টের অবস্থা সেখানেই পাবেন।',
            'Sign in with your verified email to see your request, quote and payment progress.',
          )}
        </p>
        <a className={s.textLink} href="/order/requests/">
          {t('আমার অর্ডার দেখুন', 'View my orders')}
          <ArrowRight size={16} />
        </a>
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
        <span className={s.eyebrow}>CLEAR EXPECTATIONS</span>
        <h1>{t('সেবার শর্ত ও গোপনীয়তা', 'Service & privacy')}</h1>
        <p>
          {t(
            'প্রযোজ্য: ২৬ অক্টোবর ২০২৬। অর্ডারের লিখিত সম্মতিতে আপনার নির্দিষ্ট কাজের পরিধি, মূল্য ও মেয়াদ দেওয়া থাকবে।',
            'Effective 26 October 2026. Your written order agreement specifies your scope, price and hosting term.',
          )}
        </p>
        {[
          [
            t('কী পাবেন', 'What you receive'),
            t(
              'এটি ডিজিটাল বিয়ের আমন্ত্রণের সেবা। প্যাকেজে নির্বাচিত নকশা, নিজের তথ্য সম্পাদনা, সর্বোচ্চ পাঁচটি ছবি, ব্যক্তিগত অতিথি লিংক ও উত্তর ব্যবস্থাপনা থাকে। ছাপানো কার্ড, স্বয়ংক্রিয় মেসেজ পাঠানো ও custom domain অন্তর্ভুক্ত নয়। কাস্টম নকশার কাজ ও সংশোধনের পরিধি অর্ডারে নির্ধারিত হবে।',
              'This is a digital wedding invitation service with your selected design, editable details, up to five photos, personal guest links and reply management. Printed cards, automated messaging and custom domains are not included. Custom design scope and revisions are agreed in your order.',
            ),
          ],
          [
            t('মূল্য, পেমেন্ট ও activation', 'Pricing, payment & activation'),
            t(
              'Normal ৳৫০০, Premium ৳৭৫০, Customized ৳১,৫০০। অর্ডারের মূল্য, মেয়াদ ও নির্দেশনা নিশ্চিত হওয়ার আগে টাকা পাঠাবেন না। Transaction ID জমা দেওয়া পেমেন্ট যাচাইয়ের সমান নয়। বিক্রেতা আসল লেনদেন মিলিয়ে দেখার পরে order confirmation এবং portal activation করবেন।',
              'Normal ৳500, Premium ৳750, Customized ৳1,500. Confirm the order amount, term and payment instructions before transferring. A submitted transaction ID does not verify payment. The seller checks the actual transfer before order confirmation and portal activation.',
            ),
          ],
          [
            t('মেয়াদ, পরিবর্তন ও বাতিল', 'Term, changes & cancellation'),
            t(
              'মেয়াদ প্রথম প্রকাশ থেকে শুরু হয়; republish করলে বাড়ে না। অগ্রহণ করা অনুরোধ নিজে বাতিল করতে পারবেন। গ্রহণ করা বা paid অর্ডারের পরিবর্তন, বাতিল ও refund বিষয়ে অর্ডার reference-সহ আমাদের সঙ্গে যোগাযোগ করুন। প্রযোজ্য শর্ত payment-এর আগে লিখিত quote-এ সম্মত হবে; স্বয়ংক্রিয় refund নেই।',
              'The term begins on first publication and does not restart on republishing. You can cancel an unaccepted request. For changes, cancellation or refund of accepted or paid orders, contact us with your reference. Applicable terms must be agreed in the written quote before payment; refunds are not automatic.',
            ),
          ],
          [
            t('আপনার তথ্য', 'Your information'),
            t(
              'সেবা দিতে আপনার ইমেইল, অর্ডারের তথ্য, আমন্ত্রণের লেখা ও ছবি, অতিথির নাম এবং তাঁদের উত্তর সংরক্ষিত হয়। অতিথির উত্তর, ব্যক্তিগত নোট ও শুভেচ্ছা public collection-এ দেখানো হয় না। লগইন ও ভাষা পছন্দের জন্য প্রয়োজনীয় cookies ব্যবহার হয়। এই site-এ বিজ্ঞাপন tracking যোগ করা হয়নি।',
              'We store your email, order details, invitation content and photos, guest names and replies to provide the service. Guest replies, private notes and wishes do not appear in the public collection. Essential cookies support login and language preference. No advertising tracking has been added.',
            ),
          ],
          [
            t('লিংক শেয়ার ও তথ্য অপসারণ', 'Sharing & data removal'),
            t(
              'ব্যক্তিগত invitation link যার কাছে থাকবে তিনি সেই আমন্ত্রণের উত্তর দিতে পারবেন, তাই সতর্কভাবে শেয়ার করুন। পোর্টাল থেকে লিংক বাতিল করা যায়। তথ্য দেখা, সংশোধন বা অপসারণের অনুরোধে verified ইমেইল থেকে যোগাযোগ করুন। প্রয়োজনীয় order/audit records-এর retention ও অপসারণের সময়সীমা support-এর সঙ্গে নিশ্চিত করুন।',
              'Anyone holding a personal invitation link can reply for that invitation, so share it carefully. Links can be revoked from your portal. Contact us from your verified email to request access, correction or removal of data. Confirm retention of necessary order/audit records and removal timing with support.',
            ),
          ],
        ].map(([heading, body]) => (
          <div key={heading}>
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
        <span className={s.eyebrow}>YOUR INVITATION, ONE STEP CLOSER</span>
        <h1>{t('আপনার আয়োজন শুরু হোক।', 'Let’s make it yours.')}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 45 }}>
          <div style={{ maxWidth: 310 }}>
            <TemplateCard template={template} />
          </div>
          <div>
            <h2>
              {locale === 'bn' ? template.name : template.en} · ৳{prices[template.tier]}
            </h2>
            <p>
              {t(
                'নিজের ইমেইল যাচাই করে আয়োজনের তথ্য দিন। মূল্য, hosting মেয়াদ ও কাজের শর্ত দেখেই অর্ডারে সম্মতি দেবেন। এরপর পেমেন্টের নির্দেশনা ও transaction ID জমা দেওয়ার সুযোগ পাবেন।',
                'Verify your own email and share your event details. Review the price, hosting term and scope before accepting. Then follow the payment instructions and submit your transaction ID.',
              )}
            </p>
            <a className={s.primary} href={`/order/requests/?template=${template.id}`}>
              {t('অর্ডার শুরু করুন', 'Start your order')}
              <ArrowRight size={16} />
            </a>
            <p>
              {t(
                'অ্যাকাউন্ট খুললেই payment নেওয়া হয় না। আপনার ইমেইলেই আপনার অর্ডার ও পোর্টাল থাকবে।',
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
