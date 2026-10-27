'use client';
import { useState } from 'react';
import { Copy, MessageCircle } from 'lucide-react';
import { copyText } from '../ui';
import { displayPhone, whatsappChatUrl } from '@/features/production/phone';
import { useProductLocale } from './product-locale';
import s from './workspace.module.css';

/** The words the team sends once a customer's page is open. Always built from live data, never stored. */
export function customerReadyMessage(
  { name, email, url }: { name: string; email: string; url: string },
  locale: 'bn' | 'en',
) {
  return locale === 'bn'
    ? [
        `আসসালামু আলাইকুম ${name}। আপনার পেমেন্ট মিলেছে, আপনার আয়োজনের পাতা চালু হয়েছে।`,
        `খুলুন: ${url}`,
        `লগইন করতে ${email} ইমেইলটি দিন, তারপর ইমেইলে আসা কোডটি লিখুন।`,
        'এরপর বর-কনের নাম আর অনুষ্ঠানের তথ্য দিয়ে কার্ড সাজান। কিছু জানার থাকলে এই চ্যাটেই লিখুন। — দাওয়াত',
      ].join('\n')
    : [
        `Assalamu alaikum ${name}. Your payment is confirmed and your wedding page is open.`,
        `Open it: ${url}`,
        `To log in, enter ${email}, then type the code that arrives in your email.`,
        'Then add the couple’s names and the event details to set up your card. Ask here if you need anything. — Dawat',
      ].join('\n');
}

/** Persistent "tell the customer" card: derived from the order, so it is there every time the order opens. */
export function NotifyCustomer({
  name,
  email,
  phone,
  url,
}: {
  name: string;
  email: string;
  phone: string | null;
  url: string;
}) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [status, setStatus] = useState('');
  const message = customerReadyMessage({ name, email, url }, locale);
  async function copy() {
    try {
      await copyText(message);
      setStatus(
        t('বার্তা কপি হয়েছে। এখনো কিছু পাঠানো হয়নি।', 'Message copied. Nothing has been sent yet.'),
      );
    } catch {
      setStatus(
        t(
          'কপি করা যায়নি। বার্তাটি নির্বাচন করে কপি করুন।',
          'Could not copy. Select the message and copy it.',
        ),
      );
    }
  }
  return (
    <section className={s.panel} aria-label={t('গ্রাহককে জানান', 'Tell the customer')}>
      <h3>{t('গ্রাহককে জানান', 'Tell the customer')}</h3>
      <p className={s.muted}>
        {phone
          ? t(
              `WhatsApp নম্বর: ${displayPhone(phone)}। বোতাম চাপলে বার্তা তৈরি অবস্থায় WhatsApp খুলবে; আপনি শুধু Send চাপবেন।`,
              `WhatsApp number: ${displayPhone(phone)}. The button opens WhatsApp with the message ready; you only press Send.`,
            )
          : t(
              'গ্রাহক নম্বর দেননি। WhatsApp খুলে নিজে কনট্যাক্ট বেছে নিন, অথবা বার্তাটি কপি করে অন্যভাবে পাঠান।',
              'The customer gave no number. Open WhatsApp and pick the contact, or copy the message and send it another way.',
            )}
      </p>
      <label>
        {t('বার্তা', 'Message')}
        <textarea readOnly rows={6} value={message} onFocus={(e) => e.target.select()} />
      </label>
      <div className={s.actions}>
        <a className={s.button} href={whatsappChatUrl(phone, message)} target="_blank" rel="noreferrer">
          <MessageCircle size={16} />
          {phone ? t('WhatsApp-এ জানান', 'Tell on WhatsApp') : t('WhatsApp খুলুন', 'Open WhatsApp')}
        </a>
        <button className={s.secondary} type="button" onClick={() => void copy()}>
          <Copy size={15} />
          {t('বার্তা কপি করুন', 'Copy message')}
        </button>
      </div>
      {status && <p role="status">{status}</p>}
    </section>
  );
}
