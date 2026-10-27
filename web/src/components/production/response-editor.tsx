'use client';
import { useEffect, useRef, useState } from 'react';
import type { HouseholdRow, ResponseHistory } from '@/features/production/guests';
import { correctionInput } from '@/features/production/guests';
import { api } from '@/features/production/client';
import { latinDigits } from '@/features/production/copy';
import { formatDhaka } from '@/features/production/dates';
import { Modal } from '../ui';
import { useProductLocale } from './product-locale';
import s from './workspace.module.css';

export function ResponseEditor({
  wid,
  row,
  eventId,
  policyRevision,
  onClose,
  onSaved,
}: {
  wid: string;
  row: HouseholdRow;
  eventId: string;
  policyRevision: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const initial = row.responses[eventId];
  const [attendance, setAttendance] = useState<'accepted' | 'declined'>(initial?.attendance ?? 'accepted');
  const [adults, setAdults] = useState(String(initial?.adults ?? 1));
  const [children, setChildren] = useState(String(initial?.children ?? 0));
  const [note, setNote] = useState(initial?.note ?? '');
  const [reason, setReason] = useState('');
  const [overrideClosed, setOverrideClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ResponseHistory[]>([]);
  const [historyError, setHistoryError] = useState(false);
  const attempt = useRef<{ body: string; key: string } | null>(null);
  const root = `/api/weddings/${wid}/households/${row.id}/responses/`;
  const allowance = row.events.find((e) => e.eventId === eventId)?.maxPeople ?? 0;
  function describeAnswer(value: unknown) {
    if (!value || typeof value !== 'object') return t('উত্তর ছিল না', 'No reply');
    const a = value as Record<string, unknown>;
    return (
      (a.attendance === 'declined' ? t('আসবেন না', 'Not attending') : t('আসবেন', 'Attending')) +
      ' · ' +
      new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(
        Number(a.adults ?? 0) + Number(a.children ?? 0),
      )
    );
  }
  useEffect(() => {
    let active = true;
    api<{ rows: ResponseHistory[] }>(root)
      .then((r) => {
        if (active) setHistory(r.rows);
      })
      .catch(() => {
        if (active) setHistoryError(true);
      });
    return () => {
      active = false;
    };
  }, [root]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (attendance === 'accepted' && (!/^\d+$/.test(adults) || !/^\d+$/.test(children))) {
      setError(t('প্রাপ্তবয়স্ক ও শিশুর পূর্ণ সংখ্যা লিখুন।', 'Enter whole adult and child counts.'));
      return;
    }
    const input = correctionInput.safeParse({
      expectedResponseRevision: row.responseRevision,
      expectedHouseholdRevision: row.revision,
      expectedPolicyRevision: policyRevision,
      answer: {
        eventId,
        attendance,
        adults: attendance === 'declined' ? 0 : Number(adults),
        children: attendance === 'declined' ? 0 : Number(children),
        note,
      },
      reason,
      overrideClosed,
    });
    if (!input.success) {
      setError(
        t(
          'সংখ্যা যাচাই করুন এবং সংশোধনের কারণ অন্তত ১০ অক্ষরে লিখুন।',
          'Check the counts and write a reason of at least 10 characters.',
        ),
      );
      return;
    }
    const total = input.data.answer.adults + input.data.answer.children;
    if (attendance === 'accepted' && (total < 1 || total > allowance)) {
      setError(
        t(`মোট লোকসংখ্যা ১ থেকে ${allowance}-এর মধ্যে রাখুন।`, `Keep the total between 1 and ${allowance}.`),
      );
      return;
    }
    const signature = JSON.stringify(input.data);
    if (attempt.current?.body !== signature) attempt.current = { body: signature, key: crypto.randomUUID() };
    setBusy(true);
    try {
      await api(root, { method: 'POST', body: input.data, key: attempt.current.key });
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={t('উত্তর সংশোধন', 'Correct response') + ' · ' + row.name}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <p>
        {t(
          'অতিথির সঙ্গে কথা বলে পাওয়া উত্তর লিখুন। আগের উত্তর, আপনার পরিচয় ও কারণ ইতিহাসে থাকবে।',
          'Record a reply confirmed with the guest. Previous answers, your identity and the reason remain in history.',
        )}
      </p>
      <form className={s.form} onSubmit={submit}>
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        <fieldset disabled={busy} className={s.form}>
          <p className={s.badge}>
            {t(
              eventId === 'nikah' ? 'আকদ' : 'বিবাহোত্তর সংবর্ধনা',
              eventId === 'nikah' ? 'Nikah' : 'Reception',
            )}{' '}
            · {t('সর্বোচ্চ', 'Maximum')}{' '}
            {new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(allowance)}
          </p>
          <label>
            {t('উত্তর', 'Response')}
            <select
              value={attendance}
              onChange={(e) => setAttendance(e.target.value as 'accepted' | 'declined')}
            >
              <option value="accepted">{t('আসবেন', 'Attending')}</option>
              <option value="declined">{t('আসবেন না', 'Not attending')}</option>
            </select>
          </label>
          {attendance === 'accepted' && (
            <div className={s.row}>
              <label>
                {t('প্রাপ্তবয়স্ক', 'Adults')}
                <input
                  inputMode="numeric"
                  pattern="[0-9]+"
                  required
                  value={adults}
                  onChange={(e) => setAdults(latinDigits(e.target.value))}
                />
              </label>
              <label>
                {t('শিশু', 'Children')}
                <input
                  inputMode="numeric"
                  pattern="[0-9]+"
                  required
                  value={children}
                  onChange={(e) => setChildren(latinDigits(e.target.value))}
                />
              </label>
            </div>
          )}
          <label>
            {t('অতিথির নোট', 'Guest note')}
            <textarea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
          </label>
          <label>
            {t('সংশোধনের কারণ', 'Reason for correction')}
            <textarea
              required
              minLength={10}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label className={s.checkbox}>
            <input
              type="checkbox"
              checked={overrideClosed}
              onChange={(e) => setOverrideClosed(e.target.checked)}
            />
            {t(
              'উত্তর নেওয়া বন্ধ থাকলেও এই সংশোধন অনুমোদন করছি। লোকসংখ্যার সীমা অপরিবর্তিত থাকবে।',
              'I authorize this correction even if replies are closed. The people allowance still applies.',
            )}
          </label>
        </fieldset>
        <div className={s.actions}>
          <button className={s.button} disabled={busy}>
            {busy ? t('সংরক্ষণ হচ্ছে…', 'Saving…') : t('সংশোধন সংরক্ষণ', 'Save correction')}
          </button>
          <button type="button" className={s.secondary} disabled={busy} onClick={onClose}>
            {t('বাতিল', 'Cancel')}
          </button>
        </div>
      </form>
      <details className={s.detail}>
        <summary>{t('সাম্প্রতিক উত্তর ও সংশোধন', 'Recent reply history')}</summary>
        {historyError && (
          <p>
            {t(
              'ইতিহাস লোড করা যায়নি। বন্ধ করে আবার খুলুন।',
              'History could not load. Close and reopen to retry.',
            )}
          </p>
        )}
        {!historyError && !history.length && (
          <p>{t('এখনও কোনো উত্তর নেই, অথবা ইতিহাস লোড হচ্ছে।', 'No replies yet, or history is loading.')}</p>
        )}
        <ol className={s.historyList}>
          {history
            .filter((h) => h.event_id === eventId)
            .map((h) => (
              <li key={h.id}>
                <strong>
                  {h.source === 'host'
                    ? t('আয়োজকের সংশোধন', 'Host correction')
                    : t('অতিথির উত্তর', 'Guest response')}
                </strong>
                <small>{formatDhaka(h.created_at, locale, { date: 'medium', time: 'short' })}</small>
                <p>
                  {t('আগে', 'Before')}: {describeAnswer(h.previous)} → {t('এখন', 'After')}:{' '}
                  {describeAnswer(h.current_value)}
                </p>
                {h.reason && <p>{h.reason}</p>}
                {h.override_closed && (
                  <p>{t('বন্ধ সময়সীমার ব্যতিক্রম অনুমোদিত', 'Closed-policy override authorized')}</p>
                )}
              </li>
            ))}
        </ol>
      </details>
    </Modal>
  );
}
