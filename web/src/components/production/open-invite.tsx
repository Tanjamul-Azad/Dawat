'use client';
import { useEffect, useRef, useState } from 'react';
import type { Invitation } from '@/features/workspace/model';
import type { OpenInviteSettings } from '@/features/production/open-invite';
import { api } from '@/features/production/client';
import { errorText } from '@/features/production/copy';
import { defaultInviteBn, defaultInviteEn, renderInvite, waUrl } from '@/features/production/whatsapp';
import type { InviteSettings } from '@/features/production/delivery';
import { normalizePhone } from '@/features/production/phone';
import { useProductLocale } from './product-locale';
import { copyText } from '../ui';
import s from './workspace.module.css';
export function OpenInviteCard({ wid, events }: { wid: string; events: Invitation['events'] }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => locale === 'bn' ? bn : en;
  const [saved, setSaved] = useState<OpenInviteSettings | null>(null);
  const [draft, setDraft] = useState<OpenInviteSettings | null>(null);
  const [invite, setInvite] = useState<InviteSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const attempt = useRef<{ signature: string; key: string } | null>(null);
  useEffect(() => {
    let active = true;
    void Promise.all([api<OpenInviteSettings>(`/api/weddings/${wid}/open-invite/`), api<InviteSettings>(`/api/weddings/${wid}/invite-settings/`)]).then(([o, i]) => { if (active) { setSaved(o); setDraft({ ...o, eventIds: o.eventIds.length ? o.eventIds : events.map(e => e.id) }); setInvite(i); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [wid]);
  async function save(rotate = false) {
    if (!draft || !saved || busy) return;
    if (rotate && !window.confirm(t('নতুন লিংক বানালে পুরোনো লিংক দিয়ে নতুন অতিথি যোগ দিতে পারবেন না। আগে যোগ দেওয়া অতিথিরা উত্তর দিতে পারবেন। নতুন লিংক বানাবেন?', 'A new link stops new guests joining through the old URL. Guests who already joined can still reply. Create a new link?'))) return;
    setBusy(true); setError(''); setNotice('');
    const body = { expectedRevision: saved.revision, enabled: draft.enabled, eventIds: draft.eventIds, maxPeople: draft.maxPeople, greetingBn: draft.greetingBn, greetingEn: draft.greetingEn, askPhone: draft.askPhone, rotate };
    const signature = JSON.stringify(body);
    if (attempt.current?.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() };
    try {
      const o = await api<OpenInviteSettings>(`/api/weddings/${wid}/open-invite/`, { method: 'PUT', key: attempt.current.key, body });
      setSaved(o); setDraft(o); attempt.current = null; setNotice(t('লিংকের সেটিংস সেভ হয়েছে।', 'Link settings saved.'));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  const message = saved?.url && invite ? renderInvite(locale === 'bn' ? invite.messageBn || defaultInviteBn : invite.messageEn || defaultInviteEn, { name: locale === 'bn' ? saved.greetingBn : saved.greetingEn, link: saved.url, couple: invite.couple }) : '';
  return <section className={s.panel}>
    <h2>{t('সবার জন্য একটি লিংক', 'One link for everyone')}</h2>
    <p>{t('এক লিংক সবার জন্য। অতিথি নিজের নাম লিখে উত্তর দেবেন। কে খুলেছেন তা জানা যাবে না, শুধু যাঁরা উত্তর দিয়েছেন তাঁরা তালিকায় আসবেন।', 'One link for everyone. Guests enter their name to reply. Anonymous opens are not tracked; named guests appear in your list.')}</p>
    {error && <p role="alert" className={s.error}>{errorText(error, locale)}</p>}
    {notice && <p role="status">{notice}</p>}
    {draft && <form className={s.form} onSubmit={e => { e.preventDefault(); void save(); }}>
      <label className={s.checkbox}><input type="checkbox" checked={draft.enabled} onChange={e => setDraft({ ...draft, enabled: e.target.checked })} />{t('সবার জন্য লিংক থেকে উত্তর নেওয়া চালু করুন', 'Enable replies through the shared link')}</label>
      <details><summary>{t('লিংকের সেটিংস', 'Link settings')}</summary><div className={s.form}>
        <fieldset><legend>{t('কোন অনুষ্ঠানে দাওয়াত', 'Invited celebrations')}</legend>{events.map(event => <label className={s.checkbox} key={event.id}><input type="checkbox" checked={draft.eventIds.includes(event.id)} onChange={e => setDraft({ ...draft, eventIds: e.target.checked ? [...draft.eventIds, event.id] : draft.eventIds.filter(id => id !== event.id) })} />{locale === 'bn' ? event.titleBn || event.title : event.title}</label>)}</fieldset>
        <label>{t('এক উত্তরে সর্বোচ্চ কতজন (১–২০)', 'People per reply (1–20)')}<input type="number" min={1} max={20} required value={draft.maxPeople} onChange={e => setDraft({ ...draft, maxPeople: Number(e.target.value) })} /></label>
        <label>{t('সম্বোধন · বাংলা', 'Greeting · Bangla')}<input required maxLength={300} value={draft.greetingBn} onChange={e => setDraft({ ...draft, greetingBn: e.target.value })} /></label>
        <label>{t('সম্বোধন · ইংরেজি', 'Greeting · English')}<input required maxLength={300} value={draft.greetingEn} onChange={e => setDraft({ ...draft, greetingEn: e.target.value })} /></label>
        <label className={s.checkbox}><input type="checkbox" checked={draft.askPhone} onChange={e => setDraft({ ...draft, askPhone: e.target.checked })} />{t('ঐচ্ছিক WhatsApp নম্বর চাইবেন', 'Ask for an optional WhatsApp number')}</label>
      </div></details>
      <button className={s.button} disabled={busy || !draft.eventIds.length}>{t('সেটিংস সেভ করুন', 'Save settings')}</button>
      {saved?.url && <div className={s.actions}>
        <button type="button" className={s.secondary} disabled={!saved.enabled} onClick={() => void copyText(saved.url!).then(() => setNotice(t('লিংক কপি হয়েছে।', 'Link copied.'))).catch(() => setNotice(saved.url!))}>{t('লিংক কপি', 'Copy link')}</button>
        {saved.enabled && message && <a className={s.secondary} href={waUrl(null, message)} target="_blank" rel="noopener noreferrer">{t('WhatsApp-এ শেয়ার', 'Share on WhatsApp')}</a>}
        <button type="button" className={s.secondary} disabled={busy} onClick={() => void save(true)}>{t('নতুন লিংক বানান', 'Create new link')}</button>
      </div>}
    </form>}
  </section>;
}
export function HostWhatsappSettings({ wid }: { wid: string }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => locale === 'bn' ? bn : en;
  const [settings, setSettings] = useState<InviteSettings | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { void api<InviteSettings>(`/api/weddings/${wid}/invite-settings/`).then(setSettings).catch(e => setError(e.message)); }, [wid]);
  return <section className={s.panel}>
    <h2>{t('WhatsApp-এ যোগাযোগ', 'WhatsApp contact')}</h2>
    <p>{t('বার্তা যাবে আপনার ফোনে যে WhatsApp খোলা আছে সেখান থেকে।', 'Messages go from the WhatsApp account open on your phone.')}</p>
    {error && <p role="alert" className={s.error}>{errorText(error, locale)}</p>}{notice && <p role="status">{notice}</p>}
    {settings && <form className={s.form} onSubmit={async e => {
      e.preventDefault(); if (busy) return; setBusy(true); setError('');
      try {
        const phone = normalizePhone(settings.hostWhatsapp);
        const r = await api<{ revision: number }>(`/api/weddings/${wid}/invite-settings/`, { method: 'PUT', key: crypto.randomUUID(), body: { expectedRevision: settings.revision, hostWhatsapp: phone, showHostWhatsapp: settings.showHostWhatsapp, messageBn: settings.messageBn, messageEn: settings.messageEn } });
        setSettings({ ...settings, revision: r.revision, hostWhatsapp: phone }); setNotice(t('সেভ হয়েছে।', 'Saved.'));
      } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    }}>
      <label>{t('আপনার WhatsApp নম্বর', 'Your WhatsApp number')}<input inputMode="tel" value={settings.hostWhatsapp ?? ''} onChange={e => setSettings({ ...settings, hostWhatsapp: e.target.value })} /></label>
      <label className={s.checkbox}><input type="checkbox" checked={settings.showHostWhatsapp} onChange={e => setSettings({ ...settings, showHostWhatsapp: e.target.checked })} />{t("অতিথির কার্ডে 'প্রশ্ন থাকলে WhatsApp করুন' দেখান", "Show 'Questions? WhatsApp us' on the guest card")}</label>
      <button className={s.button} disabled={busy}>{t('সেভ করুন', 'Save')}</button>
    </form>}
  </section>;
}
