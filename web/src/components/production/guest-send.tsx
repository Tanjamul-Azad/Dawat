'use client';
import { useEffect, useRef, useState } from 'react';
import type { HouseholdReport, HouseholdRow } from '@/features/production/guests';
import type { InviteSettings } from '@/features/production/delivery';
import { defaultInviteBn, defaultInviteEn, renderInvite, waUrl } from '@/features/production/whatsapp';
import { api } from '@/features/production/client';
import { errorText } from '@/features/production/copy';
import { formatDhaka } from '@/features/production/dates';
import { useProductLocale } from './product-locale';
import { Modal, copyText } from '../ui';
import s from './workspace.module.css';
type Link = { url: string; revision: number };
type Filter = 'unsent' | 'sent_unreplied' | 'all';
const templateFor = (settings: InviteSettings, locale: string) => locale === 'bn' ? settings.messageBn || defaultInviteBn : settings.messageEn || defaultInviteEn;
export function DeliveryStatus({ row, eventId }: { row: HouseholdRow; eventId: string }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => locale === 'bn' ? bn : en;
  const d = row.lastDelivery;
  return <small className={s.linkStatus}>{d && d.linkRevision !== row.linkRevision ? t('নতুন লিংক পাঠানো হয়নি', 'New link not sent') : row.responses[eventId] ? t('উত্তর দিয়েছেন', 'Replied') : row.firstOpenedAt ? t('খুলেছেন', 'Opened') : d ? `${d.channel === 'copy' ? t('কপি করা হয়েছে', 'Copied') : t('পাঠানো হয়েছে', 'Sent')} · ${d.channel === 'whatsapp' ? 'WhatsApp' : d.channel === 'share' ? t('শেয়ার', 'Share') : ''} · ${formatDhaka(d.at, locale, { date: 'medium' })}` : t('এখনো পাঠানো হয়নি', 'Not sent yet')}</small>;
}
function usePreparedLink(wid: string, row: HouseholdRow | undefined, enabled: boolean) {
  const [value, setValue] = useState<{ id: string; link: Link } | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!enabled || !row || row.linkState === 'revoked') return;
    let active = true;
    setValue(null); setError('');
    void api<Link>(`/api/weddings/${wid}/households/${row.id}/link/`, { method: 'POST', body: { kind: 'copy', expectedRevision: row.linkRevision }, key: crypto.randomUUID() }).then(link => { if (active) setValue({ id: row.id, link }); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [wid, row?.id, row?.linkRevision, enabled, retry]);
  return { link: value?.id === row?.id ? value?.link : undefined, error, retry: () => setRetry(n => n + 1) };
}
export function SendMenu({ wid, row, onSaved }: { wid: string; row: HouseholdRow; onSaved: () => void }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => locale === 'bn' ? bn : en;
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<InviteSettings | null>(null);
  const [confirm, setConfirm] = useState<'whatsapp' | 'share' | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const key = useRef<string | null>(null);
  const prepared = usePreparedLink(wid, row, open);
  useEffect(() => {
    if (!open) return;
    let active = true;
    void api<InviteSettings>(`/api/weddings/${wid}/invite-settings/`).then(r => { if (active) setSettings(r); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [open, wid]);
  const text = settings && prepared.link ? renderInvite(templateFor(settings, locale), { name: row.name, link: prepared.link.url, couple: settings.couple }) : '';
  async function record() {
    if (!prepared.link || !confirm || busy) return;
    setBusy(true); setError('');
    key.current ??= crypto.randomUUID();
    try {
      await api(`/api/weddings/${wid}/households/${row.id}/deliveries/`, { method: 'POST', body: { channel: confirm, linkRevision: prepared.link.revision }, key: key.current });
      key.current = null; setConfirm(null); setOpen(false); onSaved();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <details className={s.sendMenu} open={open} onToggle={e => setOpen(e.currentTarget.open)}>
    <summary>{t('পাঠান', 'Send')}</summary>
    <div className={s.sendOptions}>
      {text ? <a className={s.secondary} href={waUrl(row.contactPhone ?? null, text)} target="_blank" rel="noopener noreferrer" onClick={() => { key.current = null; setConfirm('whatsapp'); }}>{t('WhatsApp-এ পাঠান', 'Send on WhatsApp')}</a> : <button disabled>{t('লিংক তৈরি হচ্ছে…', 'Preparing link…')}</button>}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && <button disabled={!text} onClick={() => { if (!text) return; void navigator.share({ text }).then(() => { key.current = null; setConfirm('share'); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }); }}>{t('অন্য অ্যাপে শেয়ার', 'Share in another app')}</button>}
      <button disabled={!prepared.link} onClick={() => { if (prepared.link) void copyText(prepared.link.url).then(() => setNotice(t('কপি করা হয়েছে', 'Copied'))).catch(() => setError(t('লিংকটি বেছে কপি করুন।', 'Select and copy the link.'))); }}>{t('লিংক কপি', 'Copy link')}</button>
      {prepared.error && <><p role="alert">{errorText(prepared.error, locale)}</p><button onClick={prepared.retry}>{t('আবার চেষ্টা করুন', 'Retry')}</button></>}
      {error && <p role="alert">{errorText(error, locale)}</p>}
      {notice && <p role="status">{notice}</p>}
      {confirm && <div><p>{t('পাঠিয়েছেন?', 'Did you send it?')}</p><button disabled={busy} onClick={() => void record()}>{t('হ্যাঁ, পাঠিয়েছি', 'Yes, sent')}</button><button disabled={busy} onClick={() => setConfirm(null)}>{t('পরে পাঠাব', 'Send later')}</button></div>}
    </div>
  </details>;
}
type Progress = { filter: Filter; ids: string[]; index: number };
export function SendQueue({ wid, eventId, onClose, onSaved }: { wid: string; eventId: string; onClose: () => void; onSaved: () => void }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => locale === 'bn' ? bn : en;
  const storageKey = `dawat:send-queue:${wid}`;
  const [filter, setFilter] = useState<Filter>('unsent');
  const [rows, setRows] = useState<HouseholdRow[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [resume, setResume] = useState<Progress | null>(null);
  const [settings, setSettings] = useState<InviteSettings | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const key = useRef<string | null>(null);
  const row = rows.find(r => r.id === progress?.ids[progress.index]);
  const prepared = usePreparedLink(wid, row, !!progress);
  const text = row && prepared.link && settings ? renderInvite(message, { name: row.name, link: prepared.link.url, couple: settings.couple }) : '';
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
      if (saved && ['unsent', 'sent_unreplied', 'all'].includes(saved.filter) && Array.isArray(saved.ids) && saved.ids.length <= 10000 && saved.ids.every((id: unknown) => typeof id === 'string') && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < saved.ids.length) setResume(saved);
    } catch { /* Optional persistence. */ }
    void api<InviteSettings>(`/api/weddings/${wid}/invite-settings/`).then(r => { setSettings(r); setMessage(templateFor(r, locale)); }).catch(e => setError(e.message));
  }, [wid]);
  useEffect(() => {
    if (!progress) return;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* Optional persistence. */ }
  }, [progress, storageKey]);
  useEffect(() => {
    const visible = () => { if (document.visibilityState === 'visible' && confirm) setConfirm(true); };
    document.addEventListener('visibilitychange', visible);
    return () => document.removeEventListener('visibilitychange', visible);
  }, [confirm]);
  async function start(saved?: Progress) {
    setBusy(true); setError('');
    try {
      const all: HouseholdRow[] = [];
      let cursor: string | null = null;
      do {
        const query = new URLSearchParams({ event: eventId, source: 'host', delivery: saved ? 'all' : filter });
        if (cursor) query.set('after', cursor);
        const r: HouseholdReport = await api(`/api/weddings/${wid}/households/?${query}`);
        all.push(...r.rows.filter(row => row.source !== 'open' && row.linkState !== 'revoked' && !row.hidden)); cursor = r.nextCursor;
      } while (cursor && all.length < 10000);
      setRows(all);
      const remaining = saved ? saved.ids.slice(saved.index).filter(id => all.some(r => r.id === id)) : all.map(r => r.id);
      setProgress({ filter: saved?.filter ?? filter, ids: remaining, index: 0 }); setResume(null); setConfirm(false);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  function advance() { key.current = null; setConfirm(false); setProgress(p => p && ({ ...p, index: p.index + 1 })); }
  async function record() {
    if (!row || !prepared.link || busy) return;
    setBusy(true); setError(''); key.current ??= crypto.randomUUID();
    try {
      await api(`/api/weddings/${wid}/households/${row.id}/deliveries/`, { method: 'POST', key: key.current, body: { channel: 'whatsapp', linkRevision: prepared.link.revision } });
      onSaved(); advance();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function saveMessage() {
    if (!settings) return;
    setBusy(true); setError('');
    try {
      const r = await api<{ revision: number }>(`/api/weddings/${wid}/invite-settings/`, { method: 'PUT', key: crypto.randomUUID(), body: { expectedRevision: settings.revision, hostWhatsapp: settings.hostWhatsapp, showHostWhatsapp: settings.showHostWhatsapp, messageBn: locale === 'bn' ? message : settings.messageBn, messageEn: locale === 'en' ? message : settings.messageEn } });
      setSettings({ ...settings, revision: r.revision, ...(locale === 'bn' ? { messageBn: message } : { messageEn: message }) });
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <Modal title={t('একে একে পাঠান', 'Send one by one')} onClose={() => { if (!busy) onClose(); }}>
    <div className={s.form}>
      {error && <p role="alert" className={s.error}>{errorText(error, locale)}</p>}
      {!progress && <>
        <label>{t('কাদের পাঠাবেন', 'Who to invite')}<select value={filter} onChange={e => setFilter(e.target.value as Filter)}><option value="unsent">{t('এখনো পাঠানো হয়নি', 'Not sent yet')}</option><option value="sent_unreplied">{t('উত্তর বাকি', 'Awaiting reply')}</option><option value="all">{t('সবাই', 'Everyone')}</option></select></label>
        <button className={s.button} disabled={busy || !settings} onClick={() => void start()}>{t('পাঠানো শুরু করুন', 'Start sending')}</button>
        {resume && <button className={s.secondary} disabled={busy || !settings} onClick={() => void start(resume)}>{t('যেখানে থেমেছিলেন সেখান থেকে', 'Resume where you stopped')}</button>}
      </>}
      <label>{t('আমন্ত্রণের বার্তা', 'Invitation message')}<textarea rows={6} maxLength={600} value={message} onChange={e => setMessage(e.target.value)} /></label>
      <button className={s.secondary} disabled={busy || !settings} onClick={() => void saveMessage()}>{t('বার্তা সেভ করুন', 'Save message')}</button>
      {row && progress ? <>
        <h3>{new Intl.NumberFormat(locale).format(progress.index + 1)} / {new Intl.NumberFormat(locale).format(progress.ids.length)} · {row.name} · {row.contactPhone || t('নম্বর নেই', 'No number')}</h3>
        <pre className={s.messagePreview}>{text || t('লিংক তৈরি হচ্ছে…', 'Preparing link…')}</pre>
        {text ? <a className={s.button} href={waUrl(row.contactPhone ?? null, text)} target="_blank" rel="noopener noreferrer" onClick={() => setConfirm(true)}>{confirm ? t('আবার খুলুন', 'Open again') : t('WhatsApp-এ পাঠান', 'Send on WhatsApp')}</a> : <button disabled>{t('লিংক তৈরি হচ্ছে…', 'Preparing link…')}</button>}
        {prepared.error && <><p role="alert">{errorText(prepared.error, locale)}</p><button onClick={prepared.retry}>{t('আবার চেষ্টা করুন', 'Retry')}</button></>}
        {confirm && <><p>{t('পাঠিয়েছেন?', 'Did you send it?')}</p><button className={s.button} disabled={busy} onClick={() => void record()}>{t('হ্যাঁ, পরেরটি', 'Yes, next')}</button></>}
        <button className={s.secondary} disabled={busy} onClick={advance}>{t('পরে পাঠাব', 'Send later')}</button>
      </> : progress && <p role="status">{t('এই তালিকা শেষ।', 'This queue is complete.')}</p>}
    </div>
  </Modal>;
}
