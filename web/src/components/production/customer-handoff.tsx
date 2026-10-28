'use client';
import { useEffect, useState } from 'react';
import { normalizePhone } from '@/features/production/phone';
import { waUrl } from '@/features/production/whatsapp';
import { useProductLocale } from './product-locale';
import { copyText } from '../ui';
import s from './workspace.module.css';
export function CustomerHandoff({ weddingId, name, email, phone, sender }: { weddingId: string; name: string; email: string; phone?: string | null; sender?: string | null }) {
  const { locale } = useProductLocale();
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}/weddings/${weddingId}/`;
  let contact = phone ?? null;
  if (!contact) { try { contact = normalizePhone(sender); } catch { /* An old payment sender can be free text. */ } }
  const text = locale === 'bn' ? `আসসালামু আলাইকুম ${name}, আপনার দাওয়াত আয়োজনের পাতা চালু হয়েছে। এই লিংকে যান: ${url}\nলগইন করবেন এই ইমেইল দিয়ে: ${email}` : `Hello ${name}, your Dawat celebration workspace is active. Open: ${url}\nSign in with this email: ${email}`;
  return <section className={s.detail}>
    <h3>{locale === 'bn' ? 'গ্রাহককে জানান' : 'Notify the customer'}</h3>
    <p className={s.code}>{url}</p><p>{email}</p>
    <div className={s.actions}>
      {origin && <a className={s.button} href={waUrl(contact, text)} target="_blank" rel="noopener noreferrer">{locale === 'bn' ? 'WhatsApp-এ জানান' : 'Notify on WhatsApp'}</a>}
      <button className={s.secondary} onClick={() => void copyText(url).then(() => setCopied(true)).catch(() => setCopied(false))}>{copied ? (locale === 'bn' ? 'কপি হয়েছে' : 'Copied') : (locale === 'bn' ? 'লিংক কপি করুন' : 'Copy link')}</button>
    </div>
  </section>;
}
