'use client';
import { useEffect, useRef, useState } from 'react';
import type { OpenInvitationPayload } from '@/features/production/open-invite';
import { normalizePhone } from '@/features/production/phone';
import { errorText } from '@/features/production/copy';
import { useProductLocale } from './product-locale';
import { InvitationPreview } from './invitation-preview';
import s from './workspace.module.css';
export function OpenGuestInvitation({ initial }: { initial: OpenInvitationPayload }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => locale === 'bn' ? bn : en;
  const [error, setError] = useState('');
  const [mediaBase, setMediaBase] = useState('');
  useEffect(() => setMediaBase(window.location.pathname.replace(/\/$/, '') + '/media'), []);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  async function join(name: string, phone: string, website: string) {
    setBusy(true); setError('');
    try {
      const r = await fetch(`${window.location.pathname.replace(/\/$/, '')}/api/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone: normalizePhone(phone), website }) });
      if (r.redirected && r.ok && new URL(r.url).origin === window.location.origin) {
        window.location.replace(r.url);
        return;
      }
      const data = await r.json();
      throw new Error(data.message ?? 'Could not complete this request. Please retry.');
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  useEffect(() => {
    if (initial.householdId && !started.current) {
      started.current = true;
      // Existing guest cookies survive shared-link rotation. Reuse this device's family.
      void join('', '', '');
    }
  }, [initial.householdId]);
  return <main>
    <section className={s.panel} style={{ maxWidth: 560, margin: '32px auto', padding: 24 }}>
      <h1>{locale === 'bn' ? initial.greetingBn : initial.greetingEn}</h1>
      <p>{t('নিজের নাম লিখে আমন্ত্রণ খুলুন। তারপর আসবেন কি না জানিয়ে দিন।', 'Enter your name to open the invitation and let us know if you can come.')}</p>
      {error && <p className={s.error} role="alert">{errorText(error, locale)}</p>}
      <form className={s.form} onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void join(String(f.get('name') ?? ''), String(f.get('phone') ?? ''), String(f.get('website') ?? '')); }}>
        <label>{t('আপনার নাম', 'Your name')}<input name="name" required maxLength={120} autoComplete="name" /></label>
        {initial.askPhone && <label>{t('WhatsApp নম্বর (ঐচ্ছিক)', 'WhatsApp number (optional)')}<input name="phone" inputMode="tel" autoComplete="tel" maxLength={80} /></label>}
        <label style={{ display: 'none' }} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <button className={s.button} disabled={busy}>{busy ? t('আমন্ত্রণ খুলছে…', 'Opening invitation…') : t('আমন্ত্রণ খুলুন ও উত্তর দিন', 'Open invitation and reply')}</button>
      </form>
    </section>
    <InvitationPreview content={initial.content} scope="open-invitation" mediaBase={mediaBase || undefined} live />
  </main>;
}
