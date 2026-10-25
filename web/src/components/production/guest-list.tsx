'use client';
import { Fragment, useState } from 'react';
import { ChevronDown, Copy, Eye, PencilLine, RotateCcw, ShieldOff } from 'lucide-react';
import type { HouseholdRow } from '@/features/production/guests';
import { useProductLocale } from './product-locale';
import s from './workspace.module.css';

type Action = (row: HouseholdRow) => void;
export function GuestList({
  rows,
  eventId,
  busy,
  eventTitle,
  onCopy,
  onPreview,
  onEdit,
  onCorrect,
  onRotate,
  onRevoke,
}: {
  rows: HouseholdRow[];
  eventId: string;
  busy: boolean;
  eventTitle: (id: string) => string;
  onCopy: Action;
  onPreview: Action;
  onEdit: Action;
  onCorrect: Action;
  onRotate: Action;
  onRevoke: Action;
}) {
  const { tr, locale } = useProductLocale();
  const [expanded, setExpanded] = useState<string | null>(null);
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const count = (n: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(n);
  const names = new Map<string, number>();
  for (const row of rows) {
    const key = row.name.trim().toLocaleLowerCase();
    names.set(key, (names.get(key) ?? 0) + 1);
  }
  return (
    <div className={s.tableWrap} aria-busy={busy}>
      <table className={`${s.table} ${s.compactGuests}`}>
        <caption>
          {t(
            'প্রতি পাতায় সর্বোচ্চ ২৫টি আমন্ত্রণ · বিস্তারিত দেখতে নামের পাশের তীর চাপুন',
            'Up to 25 invitations per page · expand a row for details',
          )}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t('অতিথি / দল', 'Guest / group')}</th>
            <th scope="col">{tr('Reply status')}</th>
            <th scope="col">
              {t('লোকসংখ্যা', 'People')}
              <small>{t('নিশ্চিত / অনুমতি', 'Confirmed / allowed')}</small>
            </th>
            <th scope="col">{tr('Link')}</th>
            <th scope="col">{t('কাজ', 'Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const answer = row.responses[eventId];
            const allowance = row.events.find((e) => e.eventId === eventId)?.maxPeople;
            const open = expanded === row.id;
            const detailId = `invitation-detail-${row.id}`;
            return (
              <Fragment key={row.id}>
                <tr className={s.compactGuestRow} data-expanded={open}>
                  <td>
                    <button
                      className={s.guestNameButton}
                      onClick={() => setExpanded(open ? null : row.id)}
                      aria-expanded={open}
                      aria-label={row.name}
                      aria-controls={open ? detailId : undefined}
                      title={row.name}
                    >
                      <ChevronDown size={16} aria-hidden="true" />
                      <span className={s.guestName}>
                        {row.name}
                        {(names.get(row.name.trim().toLocaleLowerCase()) ?? 0) > 1 && (
                          <small>
                            {row.privateNote ||
                              t('একই নাম · বিস্তারিত মিলিয়ে নিন', 'Same name · check details')}
                          </small>
                        )}
                      </span>
                    </button>
                  </td>
                  <td data-label={tr('Reply status')}>
                    <span
                      className={`${s.replyStatus} ${answer?.attendance === 'accepted' ? s.acceptedStatus : answer?.attendance === 'declined' ? s.declinedStatus : s.pendingStatus}`}
                    >
                      {tr(answer?.attendance ?? 'pending')}
                    </span>
                  </td>
                  <td data-label={t('লোকসংখ্যা', 'People')}>
                    <span className={s.guestCount}>
                      {answer ? count(answer.adults + answer.children) : '—'}{' '}
                      <small>/ {allowance === undefined ? '—' : count(allowance)}</small>
                    </span>
                  </td>
                  <td data-label={tr('Link')}>
                    <span className={s.linkStatus}>{tr(row.linkState)}</span>
                  </td>
                  <td>
                    <button
                      className={s.guestCopy}
                      disabled={busy || row.linkState === 'revoked'}
                      onClick={() => onCopy(row)}
                      aria-label={`${row.linkState === 'missing' ? tr('Create & copy') : tr('Copy link')} · ${row.name}`}
                      title={
                        row.linkState === 'revoked'
                          ? t(
                              'লিংক বন্ধ আছে; বিস্তারিত থেকে নতুন লিংক তৈরি করুন',
                              'Link revoked; expand to replace it',
                            )
                          : tr('Copy link')
                      }
                    >
                      <Copy size={14} />
                      <span>{row.linkState === 'missing' ? t('তৈরি করুন', 'Create') : t('কপি', 'Copy')}</span>
                    </button>
                  </td>
                </tr>
                {open && (
                  <tr className={s.guestDetailRow}>
                    <td colSpan={5}>
                      <section
                        id={detailId}
                        aria-label={`${t('আমন্ত্রণের বিস্তারিত', 'Invitation details')} · ${row.name}`}
                        className={s.guestDetail}
                      >
                        <strong>{row.name}</strong>
                        <dl>
                          {row.nameBn && row.nameBn !== row.name && (
                            <div>
                              <dt>{t('বাংলা নাম', 'Bangla name')}</dt>
                              <dd>{row.nameBn}</dd>
                            </div>
                          )}
                          <div>
                            <dt>{t('অনুষ্ঠান ও অনুমতি', 'Celebrations & allowance')}</dt>
                            <dd>
                              {row.events
                                .map(
                                  (e) =>
                                    `${eventTitle(e.eventId)} · ${count(e.maxPeople)} ${t('জন', 'people')}`,
                                )
                                .join(' / ')}
                            </dd>
                          </div>
                          <div>
                            <dt>{t('নির্বাচিত অনুষ্ঠানের উত্তর', 'Selected celebration reply')}</dt>
                            <dd>
                              {tr(answer?.attendance ?? 'pending')}
                              {answer &&
                                ` · ${count(answer.adults)} ${t('প্রাপ্তবয়স্ক', 'adults')} + ${count(answer.children)} ${tr('children')}`}
                            </dd>
                          </div>
                          <div>
                            <dt>{tr('Guest note:')}</dt>
                            <dd>{answer?.note || '—'}</dd>
                          </div>
                          <div>
                            <dt>{tr('Private host note:')}</dt>
                            <dd>{row.privateNote || '—'}</dd>
                          </div>
                          {(row.greeting || row.greetingEn) && (
                            <div>
                              <dt>{t('সম্বোধন', 'Greeting')}</dt>
                              <dd>
                                {locale === 'en'
                                  ? row.greetingEn || row.greeting
                                  : row.greeting || row.greetingEn}
                              </dd>
                            </div>
                          )}
                          {(row.message || row.messageEn) && (
                            <div>
                              <dt>{t('ব্যক্তিগত বার্তা', 'Personal message')}</dt>
                              <dd>
                                {locale === 'en'
                                  ? row.messageEn || row.message
                                  : row.message || row.messageEn}
                              </dd>
                            </div>
                          )}
                        </dl>
                        <div className={s.actions}>
                          <button className={s.secondary} disabled={busy} onClick={() => onPreview(row)}>
                            <Eye size={14} />
                            {tr('Preview')}
                          </button>
                          <button className={s.secondary} disabled={busy} onClick={() => onEdit(row)}>
                            {tr('Edit household')}
                          </button>
                          <button className={s.secondary} disabled={busy} onClick={() => onCorrect(row)}>
                            <PencilLine size={14} />
                            {t('উত্তর ও ইতিহাস', 'Reply & history')}
                          </button>
                          {row.linkState !== 'missing' && (
                            <button className={s.secondary} disabled={busy} onClick={() => onRotate(row)}>
                              <RotateCcw size={14} />
                              {tr('Replace link')}
                            </button>
                          )}
                          {row.linkState === 'active' && (
                            <button className={s.secondary} disabled={busy} onClick={() => onRevoke(row)}>
                              <ShieldOff size={14} />
                              {tr('Revoke link')}
                            </button>
                          )}
                        </div>
                      </section>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
