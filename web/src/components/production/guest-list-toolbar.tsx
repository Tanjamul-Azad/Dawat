'use client';

import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useProductLocale } from './product-locale';
import w from './workspace.module.css';
import s from './guest-list-toolbar.module.css';

/** Shared working controls; the parent retains applied filters, exports and API calls. */
export function GuestListToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onApply,
  onAdd,
  exportAction,
  options,
  clearAction,
  busy,
  includeHidden = true,
  shown,
}: {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onApply: () => void;
  onAdd: () => void;
  exportAction: ReactNode;
  options?: ReactNode;
  clearAction?: ReactNode;
  busy: boolean;
  includeHidden?: boolean;
  shown: number;
}) {
  const { locale, tr } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const statuses = [
    ['all', t('সব আমন্ত্রণ', 'All invitations')],
    ['pending', tr('Pending')],
    ['accepted', tr('Accepted')],
    ['declined', tr('Declined')],
    ...(includeHidden ? [['hidden', t('লুকানো', 'Hidden')]] : []),
  ];
  return (
    <>
      <div className={s.heading}>
        <div>
          <h2>
            {t('অতিথি তালিকা', 'Guest list')}
            <span>{new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(shown)}</span>
          </h2>
          <p>
            {t(
              'এই পাতার আমন্ত্রণ · নাম চাপলে বিস্তারিত দেখবেন',
              'Invitations on this page · select a name for details',
            )}
          </p>
        </div>
        <div className={s.headingActions}>
          {exportAction}
          <button
            className={w.button}
            aria-label={t('তালিকায় অতিথি যোগ করুন', 'Add guest to list')}
            onClick={onAdd}
            disabled={busy}
          >
            <Plus size={17} />
            <span>{tr('Add household')}</span>
          </button>
        </div>
      </div>
      <div className={s.tools}>
        <form
          className={s.searchRow}
          onSubmit={(e) => {
            e.preventDefault();
            onApply();
          }}
        >
          <label className={s.search}>
            <Search size={18} aria-hidden="true" />
            <input
              aria-label={tr('Search households')}
              maxLength={120}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={tr('Name or family')}
            />
          </label>
          <button className={s.searchSubmit} disabled={busy}>
            {tr('Apply search')}
          </button>
          {clearAction && <span className={s.clearAction}>{clearAction}</span>}
        </form>
        <div className={s.filterRow}>
          <div className={s.statuses} role="group" aria-label={tr('Reply status')}>
            {statuses.map(([value, label]) => (
              <button
                type="button"
                key={value}
                disabled={busy}
                aria-pressed={status === value}
                onClick={() => onStatusChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {options && (
            <details className={s.options}>
              <summary aria-label={t('আরও ফিল্টার', 'More filters')} title={t('আরও ফিল্টার', 'More filters')}>
                <SlidersHorizontal size={16} />
                <span>{t('আরও ফিল্টার', 'More filters')}</span>
              </summary>
              <div>{options}</div>
            </details>
          )}
        </div>
      </div>
    </>
  );
}
