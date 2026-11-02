'use client';

import { Check, Clock3, Link2, ListPlus, PencilLine, RefreshCw, Send, UsersRound, X } from 'lucide-react';
import type { Invitation } from '@/features/workspace/model';
import type { HouseholdReport } from '@/features/production/guests';
import { formatDhaka } from '@/features/production/dates';
import { WorkspaceLink } from './frame';
import { useProductLocale } from './product-locale';
import w from './workspace.module.css';
import s from './host-dashboard-overview.module.css';

type Celebration = Invitation['events'][number];

export function WeddingIdentityBanner({ title, event }: { title: string; event?: Celebration }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <section className={s.weddingBanner} aria-label={t('আপনার বিয়ের আয়োজন', 'Your wedding celebration')}>
      <div className={s.bannerCopy}>
        <h2>{title}</h2>
        {event && (
          <p>
            <time dateTime={event.date}>
              {formatDhaka(`${event.date}T12:00:00+06:00`, locale, { date: 'long' })}
            </time>
            {(locale === 'bn' ? event.addressBn || event.address : event.address) && (
              <>
                <span aria-hidden="true"> · </span>
                {locale === 'bn' ? event.addressBn || event.address : event.address}
              </>
            )}
          </p>
        )}
        <div className={s.bannerFlourish} aria-hidden="true">
          <span />❋<span />
        </div>
      </div>
    </section>
  );
}

/** Presentation only. The host hub still owns authorization, requests and mutations. */
export function HostDashboardHeader({
  title,
  event,
  editHref,
  busy,
  disabled,
  onRefresh,
  onBulk,
  onAdd,
  onSend,
  onShared,
}: {
  title: string;
  event?: Celebration;
  editHref: string;
  busy: boolean;
  disabled: boolean;
  onRefresh: () => void;
  onBulk: () => void;
  onAdd: () => void;
  onSend: () => void;
  onShared: () => void;
}) {
  const { locale, tr } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <>
      <header className={s.intro}>
        <div>
          <h1>{t('আপনার আয়োজন', 'Your celebration')}</h1>
          <p>
            {t(
              'নিমন্ত্রণ থেকে প্রিয়জনের উত্তর—সব এক জায়গায়।',
              'Your invitations, your people, every little detail. Together.',
            )}
          </p>
        </div>
        <div className={s.utilities}>
          <a className={s.listJump} href="#host-guest-list">
            {t('অতিথি তালিকা', 'Guest list')}
          </a>
          <button className={w.quiet} disabled={busy} onClick={onRefresh}>
            <RefreshCw size={15} />
            {busy ? tr('Please wait…') : tr('Refresh')}
          </button>
          <button
            className={w.secondary}
            disabled={busy || disabled}
            onClick={onBulk}
            aria-label={t('একসঙ্গে অনেক পরিবার', 'Add many at once')}
            title={t('একসঙ্গে অনেক পরিবার', 'Add many at once')}
          >
            <ListPlus size={16} />
            <span>{t('একসঙ্গে অনেক পরিবার', 'Add many at once')}</span>
          </button>
        </div>
      </header>
      <WeddingIdentityBanner title={title} event={event} />
      <nav className={s.quickActions} aria-label={t('আয়োজনের দ্রুত কাজ', 'Wedding quick actions')}>
        <button
          onClick={onAdd}
          disabled={busy || disabled}
          aria-label={tr('Add household')}
          aria-describedby="host-add-description"
        >
          <UsersRound size={25} />
          <span>
            <strong>{tr('Add household')}</strong>
            <small id="host-add-description">
              {t('নাম ধরে অতিথি যোগ করুন', 'A personal invitation for each family')}
            </small>
          </span>
        </button>
        <button
          onClick={onSend}
          disabled={busy || disabled}
          aria-label={t('আমন্ত্রণ পাঠান', 'Send invitations')}
          aria-describedby="host-send-description"
        >
          <Send size={25} />
          <span>
            <strong>{t('আমন্ত্রণ পাঠান', 'Send invitations')}</strong>
            <small id="host-send-description">
              {t('WhatsApp-এ যত্নের নিমন্ত্রণ', 'Prepare and share on WhatsApp')}
            </small>
          </span>
        </button>
        <a
          href="#shared-invitation-link"
          aria-disabled={disabled}
          onClick={(e) => {
            if (disabled) e.preventDefault();
            else onShared();
          }}
        >
          <Link2 size={25} />
          <span>
            <strong>{t('সবার জন্য একটি লিংক', 'Shared invitation link')}</strong>
            <small>{t('এক লিংকে সবার উত্তর', 'One link for everyone')}</small>
          </span>
        </a>
        <WorkspaceLink href={editHref}>
          <PencilLine size={25} />
          <span>
            <strong>{t('আমন্ত্রণ এডিট করুন', 'Edit invitation')}</strong>
            <small>{t('আপনার গল্প, আপনার মতো', 'Make every detail your own')}</small>
          </span>
        </WorkspaceLink>
      </nav>
    </>
  );
}

export function HostReportSummary({
  data,
  events,
  eventId,
  reportEventId,
  filterLabel,
  busy,
  stale,
  onEventChange,
  onReplySettings,
}: {
  data: HouseholdReport;
  events: Celebration[];
  eventId: string;
  reportEventId: string;
  filterLabel: string;
  busy: boolean;
  stale: boolean;
  onEventChange: (id: string) => void;
  onReplySettings: () => void;
}) {
  const { locale, tr } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const count = (n: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(n);
  const policy = data.policies.find((p) => p.eventId === eventId);
  const selected = events.find((e) => e.id === reportEventId);
  const metrics = [
    { label: tr('Invited households'), value: data.summary.invited, Icon: UsersRound, tone: 'invited' },
    { label: tr('Accepted'), value: data.summary.accepted, Icon: Check, tone: 'accepted' },
    { label: tr('Declined'), value: data.summary.declined, Icon: X, tone: 'declined' },
    { label: tr('Pending'), value: data.summary.pending, Icon: Clock3, tone: 'pending' },
  ];
  return (
    <section className={s.report} aria-label={t('আয়োজনের হিসাব', 'Celebration report')} aria-busy={busy}>
      <div className={s.reportTop}>
        <div className={s.eventPicker}>
          <label>
            <span>{tr('Celebration')}</span>
            <select value={eventId} onChange={(e) => onEventChange(e.target.value)}>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {locale === 'bn' ? e.titleBn || e.title : e.title}
                </option>
              ))}
            </select>
          </label>
          <span className={s.replyBadge} data-open={Boolean(policy?.isOpen)}>
            {policy?.isOpen ? tr('Replies open') : tr('Replies closed')}
          </span>
        </div>
        <p className={s.confirmed}>
          <UsersRound size={18} />
          <span>
            <strong>{count(data.summary.adults + data.summary.children)}</strong> {tr('confirmed people')}
            <small>
              {count(data.summary.adults)} {tr('adults +')} {count(data.summary.children)} {tr('children')}
            </small>
          </span>
        </p>
        <button className={w.quiet} disabled={busy} onClick={onReplySettings}>
          {tr('Reply settings')}
        </button>
      </div>
      <p className={s.scope}>{tr('All invited households \u00B7 selected event')}</p>
      <div className={s.metrics}>
        {metrics.map(({ label, value, Icon, tone }) => (
          <div key={tone} data-tone={tone}>
            <span>{label}</span>
            <div>
              <strong>{count(value)}</strong>
              <span className={s.metricIcon} data-tone={tone}>
                <Icon size={19} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className={s.reportFoot}>
        <span>
          {t('দেখানো রিপোর্ট', 'Displayed report')}:{' '}
          {selected ? (locale === 'bn' ? selected.titleBn || selected.title : selected.title) : reportEventId}{' '}
          · {filterLabel}
        </span>
        <span>
          {stale ? tr('Stale \u00B7 ') : ''}
          {tr('As of')} {formatDhaka(data.asOf, locale, { time: 'medium' })}{' '}
          {tr('\u00B7 Asia/Dhaka. Totals refer to this event, not unique people across celebrations.')}
        </span>
      </div>
    </section>
  );
}
