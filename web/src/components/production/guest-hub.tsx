'use client';
import { useProductLocale } from './product-locale';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Plus, RefreshCw, Send, Link2, Heart, Download, ListPlus } from 'lucide-react';
import type { Invitation } from '@/features/workspace/model';
import {
  householdInput,
  type HouseholdInput,
  type HouseholdRow,
  type HouseholdReport,
  type GuestPayload,
  type WishRow,
} from '@/features/production/guests';
import { api } from '@/features/production/client';
import { downloadCsv } from '@/features/production/download';
import { errorText, latinDigits } from '@/features/production/copy';
import { formatDhaka } from '@/features/production/dates';
import { GuestList } from './guest-list';
import { WorkspaceFrame, WorkspaceLink } from './frame';
import { Modal, copyText } from '../ui';
import { ResponseEditor } from './response-editor';
import s from './workspace.module.css';
const GuestLive = dynamic(() => import('./guest-live').then((m) => m.GuestLive), {
  loading: () => <p role="status">প্রিভিউ তৈরি হচ্ছে…</p>,
});
type Props = {
  wid: string;
  slug: string;
  title: string;
  email: string;
  events: Invitation['events'];
  initial: HouseholdReport;
  initialEvent: string;
  refreshOnMount?: boolean;
};
export function GuestHub({
  wid,
  slug,
  title,
  email,
  events,
  initial,
  initialEvent,
  refreshOnMount = false,
}: Props) {
  const { tr, locale } = useProductLocale();
  const root = `/api/weddings/${wid}`;
  const [data, setData] = useState(initial);
  const [eventId, setEventId] = useState(initialEvent);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState<'guests' | 'wishes'>('guests');
  const [wishRows, setWishRows] = useState<WishRow[]>([]);
  const [wishesLoaded, setWishesLoaded] = useState(false);
  const [wishNext, setWishNext] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stale, setStale] = useState(false);
  const [pageTrail, setPageTrail] = useState<(string | null)[]>([null]);
  const [editing, setEditing] = useState<HouseholdRow | null | undefined>(undefined);
  const [preview, setPreview] = useState<GuestPayload | null>(null);
  const [shared, setShared] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [danger, setDanger] = useState<{
    row: HouseholdRow;
    kind: 'rotate' | 'revoke';
  } | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editorRound, setEditorRound] = useState(0);
  // The page notice can be far off-screen on a phone, so the copied row says so too.
  const [copiedId, setCopiedId] = useState('');
  const [correcting, setCorrecting] = useState<HouseholdRow | null>(null);
  const serial = useRef(0);
  const wishSerial = useRef(0);
  const mounted = useRef(true);
  const actionAttempt = useRef<{
    body: string;
    key: string;
  } | null>(null);
  const cursor = useRef<string | null>(null);
  const appliedFilters = useRef({ eventId: initialEvent, search: '', status: 'all' });
  const wishCursor = useRef<string | null>(null);
  const retryAt = useRef(0);
  const failures = useRef(0);
  const policy = data.policies.find((p) => p.eventId === eventId);
  const count = (n: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(n);
  const eventTitle = (id: string) => {
    const event = events.find((e) => e.id === id);
    return event ? (locale === 'bn' ? event.titleBn || event.title : event.title) : tr(id);
  };
  async function refresh(
    after: string | null = cursor.current,
    filters = appliedFilters.current,
    quiet = false,
  ) {
    if (quiet && busy) return;
    if (JSON.stringify(appliedFilters.current) !== JSON.stringify(filters)) after = null;
    const generation = ++serial.current;
    if (!quiet) setBusy(true);
    setError('');
    const query = new URLSearchParams({
      event: filters.eventId,
      search: filters.search,
      status: filters.status,
    });
    if (after) query.set('after', after);
    try {
      const result = await api<HouseholdReport>(`${root}/households/?${query}`);
      if (!mounted.current || generation !== serial.current) return;
      setPageTrail((trail) => {
        if (!after) return [null];
        const known = trail.indexOf(after);
        return known < 0 ? [...trail, after] : trail.slice(0, known + 1);
      });
      appliedFilters.current = { ...filters };
      setData(result);
      cursor.current = after;
      failures.current = 0;
      retryAt.current = 0;
      setStale(false);
    } catch (e) {
      if (generation === serial.current) {
        setError((e as Error).message);
        setStale(true);
        failures.current++;
        retryAt.current = Date.now() + Math.min(300000, 30000 * 2 ** failures.current);
      }
    } finally {
      if (!quiet && generation === serial.current) setBusy(false);
    }
  }
  async function loadWishes(after: string | null = wishCursor.current, quiet = false) {
    if (quiet && busy) return;
    const generation = ++wishSerial.current;
    if (!quiet) setBusy(true);
    setError('');
    try {
      const r = await api<{
        rows: WishRow[];
        nextCursor: string | null;
      }>(`${root}/wishes/${after ? `?after=${after}` : ''}`);
      if (!mounted.current || generation !== wishSerial.current) return;
      setWishRows(r.rows);
      setWishesLoaded(true);
      setWishNext(r.nextCursor);
      wishCursor.current = after;
      failures.current = 0;
      retryAt.current = 0;
      setStale(false);
    } catch (e) {
      if (!mounted.current || generation !== wishSerial.current) return;
      setError((e as Error).message);
      setStale(true);
      failures.current++;
      retryAt.current = Date.now() + Math.min(300000, 30000 * 2 ** failures.current);
    } finally {
      if (!quiet && mounted.current && generation === wishSerial.current) setBusy(false);
    }
  }
  useEffect(() => {
    mounted.current = true;
    // Prefetched reports render immediately, then revalidate older counts without locking controls.
    if (refreshOnMount && events.length && Date.now() - Date.parse(initial.asOf) > 10_000) {
      setStale(true);
      void refresh(null, appliedFilters.current, true);
    }
    return () => {
      mounted.current = false;
      serial.current++;
      wishSerial.current++;
    };
  }, []);
  useEffect(() => {
    const check = () => {
      if (
        !document.hidden &&
        editing === undefined &&
        !danger &&
        !preview &&
        !policyOpen &&
        !correcting &&
        Date.now() >= retryAt.current
      ) {
        if (panel === 'wishes') void loadWishes(wishCursor.current, true);
        else void refresh(cursor.current, appliedFilters.current, true);
      }
    };
    const timer = setInterval(check, 30000);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [eventId, status, search, editing, danger, preview, panel, policyOpen, correcting, busy]);
  async function link(row: HouseholdRow, kind: 'copy' | 'rotate' | 'revoke') {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    const body = { kind, expectedRevision: row.linkRevision };
    const signature = JSON.stringify({ id: row.id, ...body });
    if (actionAttempt.current?.body !== signature)
      actionAttempt.current = { body: signature, key: crypto.randomUUID() };
    try {
      const r = await api<{
        url: string | null;
      }>(`${root}/households/${row.id}/link/`, {
        method: 'POST',
        body,
        key: actionAttempt.current.key,
      });
      actionAttempt.current = null;
      setDanger(null);
      if (r.url) {
        let copied = false;
        try {
          await copyText(r.url);
          copied = true;
        } catch {
          copied = false;
        }
        if (!copied || kind === 'rotate') setShared({ name: row.name, url: r.url });
        if (copied) {
          setCopiedId(row.id);
          window.setTimeout(() => setCopiedId((id) => (id === row.id ? '' : id)), 4000);
        }
        setNotice(
          copied
            ? locale === 'bn'
              ? `${row.name}-এর লিংক কপি হয়েছে। এখন WhatsApp-এ পেস্ট করে পাঠান; কোনো বার্তা নিজে থেকে যায়নি।`
              : `Link for ${row.name} copied. Paste it into WhatsApp; no message has been sent.`
            : tr('The link is ready. Copy it from the selectable field below.'),
        );
      } else setNotice(tr('Link revoked. Existing replies and wishes have been retained.'));
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function openPreview(row: HouseholdRow) {
    setBusy(true);
    setError('');
    try {
      setPreview(await api<GuestPayload>(`${root}/households/${row.id}/preview/`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const rows = data.rows;
  const reportEventId = appliedFilters.current.eventId;
  return (
    <WorkspaceFrame email={email} wedding={{ id: wid, title, view: 'guests' }}>
      <div className={s.intro}>
        <div>
          <WorkspaceLink href={`/weddings/${wid}/`} className={s.eyebrow}>
            <ArrowLeft size={12} /> {title}
          </WorkspaceLink>
          <h1>{tr('People make the celebration.')}</h1>
          <p>
            {locale === 'bn'
              ? 'একজন অতিথি, দম্পতি, পরিবার বা দল—নাম ধরে আমন্ত্রণ ও আলাদা লিংক।'
              : 'Invite a person, couple, family or group by name, each with a personal link.'}
          </p>
        </div>
        <div className={s.actions}>
          <button
            className={s.secondary}
            disabled={busy}
            onClick={() => (panel === 'wishes' ? loadWishes() : refresh())}
          >
            <RefreshCw size={15} />
            {busy ? tr('Please wait…') : tr('Refresh')}
          </button>
          <button className={s.secondary} disabled={busy || !events.length} onClick={() => setBulkOpen(true)}>
            <ListPlus size={16} />
            {locale === 'bn' ? 'একসঙ্গে অনেক পরিবার' : 'Add many at once'}
          </button>
          <button className={s.button} disabled={busy || !events.length} onClick={() => setEditing(null)}>
            <Plus size={16} />
            {tr('Add household')}
          </button>
        </div>
      </div>
      {error && editing === undefined && !danger && (
        <p className={s.error} role="alert">
          {errorText(error, locale)}
          {stale ? tr(' Last successful results remain below.') : ''}
        </p>
      )}
      {notice && (
        <p className={s.notice} role="status">
          {notice}
        </p>
      )}
      <nav className={s.steps} aria-label={tr('Guest management')}>
        <button aria-current={panel === 'guests' ? 'step' : undefined} onClick={() => setPanel('guests')}>
          {tr('Invitations & replies')}
        </button>
        <button
          aria-current={panel === 'wishes' ? 'step' : undefined}
          onClick={() => {
            setPanel('wishes');
            if (!wishesLoaded) void loadWishes();
          }}
        >
          {tr('Private wishes')}
        </button>
      </nav>
      {!events.length ? (
        <section className={s.panel}>
          <h2>
            {locale === 'bn' ? 'আগে আমন্ত্রণটি অতিথিদের জন্য চালু করুন।' : 'Publish your invitation first.'}
          </h2>
          <p>
            {locale === 'bn'
              ? 'নাম, অনুষ্ঠান ও স্থান পূরণ করে প্রিভিউ দেখুন। প্রকাশের পর অতিথি বা দল যোগ করে ব্যক্তিগত লিংক ও উত্তর নেওয়া চালু হবে।'
              : 'Complete names, celebrations and venues, then publish to add guests or groups and collect replies.'}
          </p>
          <WorkspaceLink className={s.button} href={`/weddings/${wid}/`}>
            {locale === 'bn' ? 'আমন্ত্রণ এডিট করতে যান' : 'Continue editing'}
          </WorkspaceLink>
        </section>
      ) : panel === 'guests' ? (
        <>
          <div className={s.panel}>
            <div className={s.actions} style={{ justifyContent: 'space-between', marginBottom: 20 }}>
              <label>
                {tr('Celebration')}{' '}
                <select
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    void refresh(null, { ...appliedFilters.current, eventId: e.target.value });
                  }}
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {locale === 'bn' ? e.titleBn || e.title : e.title}
                    </option>
                  ))}
                </select>
              </label>
              <span className={s.badge}>{policy?.isOpen ? tr('Replies open') : tr('Replies closed')}</span>
              <button className={s.quiet} disabled={busy} onClick={() => setPolicyOpen(true)}>
                {tr('Reply settings')}
              </button>
            </div>
            <p className={s.eyebrow}>{tr('All invited households \u00B7 selected event')}</p>
            <p className={s.muted}>
              {locale === 'bn' ? 'দেখানো রিপোর্ট' : 'Displayed report'}: {eventTitle(reportEventId)} ·{' '}
              {tr(appliedFilters.current.status)}
              {appliedFilters.current.search ? ' · ' + appliedFilters.current.search : ''}
            </p>
            <div className={s.metrics}>
              {[
                [tr('Invited households'), data.summary.invited],
                [tr('Accepted'), data.summary.accepted],
                [tr('Declined'), data.summary.declined],
                [tr('Pending'), data.summary.pending],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{count(Number(value))}</strong>
                </div>
              ))}
            </div>
            <p className={s.confirmed}>
              <strong>{count(data.summary.adults + data.summary.children)}</strong>
              {tr('confirmed people')}{' '}
              <span>
                {count(data.summary.adults)} {tr('adults +')} {count(data.summary.children)} {tr('children')}
              </span>
            </p>
            <p className={s.muted}>
              {stale ? tr('Stale \u00B7 ') : ''}
              {tr('As of')} {formatDhaka(data.asOf, locale, { time: 'medium' })}{' '}
              {tr('\u00B7 Asia/Dhaka. Totals refer to this event, not unique people across celebrations.')}
            </p>
          </div>
          <section className={s.panel}>
            <div className={s.sectionHeader}>
              <h2>{locale === 'bn' ? 'অতিথি তালিকা' : 'Guest list'}</h2>
              <button
                className={s.secondary}
                disabled={exporting || busy}
                onClick={async () => {
                  setExporting(true);
                  setError('');
                  try {
                    await downloadCsv(
                      `${root}/export/?${new URLSearchParams({ event: appliedFilters.current.eventId, search: appliedFilters.current.search, status: appliedFilters.current.status })}`,
                    );
                  } catch (e) {
                    setError(
                      (e as Error).name === 'TimeoutError'
                        ? locale === 'bn'
                          ? 'CSV নামাতে সময় বেশি লাগছে। আবার চেষ্টা করুন।'
                          : 'Export timed out. Please try again.'
                        : errorText((e as Error).message, locale),
                    );
                  } finally {
                    setExporting(false);
                  }
                }}
              >
                <Download size={15} />
                {exporting
                  ? locale === 'bn'
                    ? 'CSV তৈরি হচ্ছে…'
                    : 'Preparing CSV…'
                  : locale === 'bn'
                    ? 'CSV নামান'
                    : 'Download CSV'}
              </button>
            </div>
            <p className={s.muted}>
              {locale === 'bn'
                ? 'CSV-তে প্রয়োগ করা খোঁজ ও ফিল্টারের সব আমন্ত্রণ থাকবে; শুধু এই পাতা নয়। ব্যক্তিগত লিংক ও আপনার নোট থাকবে না।'
                : 'CSV includes all invitations matching the applied search and filters, across all pages. Private links and host notes are excluded.'}
            </p>
            <form
              className={`${s.form} ${s.filters}`}
              onSubmit={(e) => {
                e.preventDefault();
                void refresh(null, { eventId, search: search.trim(), status });
              }}
            >
              <label>
                {tr('Search households')}
                <input
                  maxLength={120}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tr('Name or family')}
                />
              </label>
              <label>
                {tr('Reply status')}
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    void refresh(null, { ...appliedFilters.current, status: e.target.value });
                  }}
                >
                  {['all', 'accepted', 'declined', 'pending'].map((v) => (
                    <option key={v} value={v}>
                      {tr(v)}
                    </option>
                  ))}
                </select>
              </label>
              <button className={s.secondary} disabled={busy}>
                {tr('Apply search')}
              </button>
              {(appliedFilters.current.search || appliedFilters.current.status !== 'all') && (
                <button
                  type="button"
                  className={s.quiet}
                  disabled={busy}
                  onClick={() => {
                    setSearch('');
                    setStatus('all');
                    void refresh(null, {
                      eventId: appliedFilters.current.eventId,
                      search: '',
                      status: 'all',
                    });
                  }}
                >
                  {locale === 'bn' ? 'বাছাই মুছুন' : 'Clear filters'}
                </button>
              )}
            </form>
            {search.trim() !== appliedFilters.current.search && (
              <p className={s.muted}>
                {locale === 'bn'
                  ? 'নতুন নাম খুঁজতে Enter বা “খুঁজুন” চাপুন।'
                  : 'Press Enter or Search to apply the new name.'}
              </p>
            )}
            <GuestList
              key={reportEventId + ':' + (cursor.current ?? 'first')}
              rows={rows}
              eventId={reportEventId}
              busy={busy}
              eventTitle={eventTitle}
              copiedId={copiedId}
              onCopy={(row) => void link(row, 'copy')}
              onPreview={(row) => void openPreview(row)}
              onEdit={setEditing}
              onCorrect={setCorrecting}
              onRotate={(row) => setDanger({ row, kind: 'rotate' })}
              onRevoke={(row) => setDanger({ row, kind: 'revoke' })}
            />
            {!rows.length && (
              <div className={s.empty}>
                <Send size={25} />
                <h2>
                  {pageTrail.length > 1
                    ? locale === 'bn'
                      ? 'এই পাতায় আর আমন্ত্রণ নেই।'
                      : 'No invitations remain on this page.'
                    : appliedFilters.current.search || appliedFilters.current.status !== 'all'
                      ? tr('No households match these filters.')
                      : tr('A personal welcome starts here.')}
                </h2>
                <p>
                  {events.length
                    ? tr(
                        'Create a named household and choose its celebrations and allowance. Copying a link never creates another household.',
                      )
                    : tr('Publish the invitation first, then add named households.')}
                </p>
              </div>
            )}
            <nav
              className={s.guestPagination}
              aria-label={locale === 'bn' ? 'আমন্ত্রণের পাতাগুলো' : 'Invitation pages'}
            >
              <small role="status">
                {locale === 'bn'
                  ? `পাতা ${count(pageTrail.length)} · এই পাতায় ${count(rows.length)}টি`
                  : `Page ${pageTrail.length} · ${rows.length} on this page`}
              </small>
              <div className={s.actions}>
                <button
                  className={s.secondary}
                  disabled={busy || pageTrail.length < 2}
                  onClick={() => refresh(pageTrail[pageTrail.length - 2])}
                >
                  {locale === 'bn' ? 'আগের পাতা' : 'Previous page'}
                </button>
                {data.nextCursor && (
                  <button className={s.secondary} disabled={busy} onClick={() => refresh(data.nextCursor!)}>
                    {tr('Next 25 households')}
                  </button>
                )}
                <button
                  className={s.quiet}
                  disabled={busy || pageTrail.length < 2}
                  onClick={() => refresh(null)}
                >
                  {tr('Back to first page')}
                </button>
              </div>
            </nav>
          </section>
        </>
      ) : (
        <section className={s.panel}>
          <h2>{tr('For the couple, with love.')}</h2>
          <p>{tr('Wishes are private and do not count as attendance.')}</p>
          <ul className={s.list}>
            {wishRows.map((w) => (
              <li key={w.id}>
                <div>
                  <strong>
                    <Heart size={14} /> {w.name}
                  </strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{w.body}</p>
                  <small>{formatDhaka(w.createdAt, locale, { date: 'medium', time: 'short' })}</small>
                </div>
              </li>
            ))}
          </ul>
          {!wishesLoaded && (
            <p role="status" className={s.muted}>
              {busy
                ? locale === 'bn'
                  ? 'শুভেচ্ছাগুলো লোড হচ্ছে…'
                  : 'Loading private wishes…'
                : tr('Private wishes have not loaded yet.')}
            </p>
          )}
          {wishesLoaded && !wishRows.length && <p className={s.muted}>{tr('No wishes on this page yet.')}</p>}
          {wishNext && (
            <button className={s.secondary} disabled={busy} onClick={() => loadWishes(wishNext)}>
              {tr('Next 25 wishes')}
            </button>
          )}
        </section>
      )}
      {editing !== undefined && (
        <HouseholdEditor
          key={editorRound}
          row={editing}
          wid={wid}
          events={events}
          defaultEvent={eventId}
          onClose={() => setEditing(undefined)}
          onSaved={async (another, name) => {
            if (another) {
              setEditorRound((n) => n + 1);
              setNotice(
                locale === 'bn'
                  ? `${name} সংরক্ষিত হয়েছে। এবার পরের পরিবারের নাম লিখুন।`
                  : `${name} saved. Enter the next family.`,
              );
            } else {
              setEditing(undefined);
              setNotice(
                tr(
                  'Household saved. Personal name, scope and allowance are live immediately; base invitation remains unchanged.',
                ),
              );
            }
            await refresh();
          }}
        />
      )}
      {bulkOpen && (
        <BulkHouseholds
          wid={wid}
          events={events}
          defaultEvent={eventId}
          onClose={async (created) => {
            setBulkOpen(false);
            if (created) {
              setNotice(
                locale === 'bn'
                  ? `${count(created)}টি পরিবার যোগ হয়েছে।`
                  : `${count(created)} families added.`,
              );
              await refresh();
            }
          }}
        />
      )}
      {correcting && (
        <ResponseEditor
          wid={wid}
          row={correcting}
          eventId={reportEventId}
          policyRevision={data.policyRevision}
          onClose={() => setCorrecting(null)}
          onSaved={async () => {
            setCorrecting(null);
            setNotice(
              locale === 'bn'
                ? 'সংশোধন সংরক্ষিত। আগের উত্তর ইতিহাসে রাখা হয়েছে।'
                : 'Correction saved. Previous answer retained in history.',
            );
            await refresh();
          }}
        />
      )}
      {preview && (
        <Modal
          title={`${locale === 'bn' ? 'ব্যক্তিগত প্রিভিউ · উত্তর দেওয়া যাবে না' : 'Read-only personal preview'} · ${preview.guest.name}`}
          onClose={() => setPreview(null)}
        >
          <GuestLive initial={preview} slug={slug} preview previewWeddingId={wid} />
        </Modal>
      )}
      {shared && (
        <Modal title={`${tr('Link')} · ${shared.name}`} onClose={() => setShared(null)}>
          <p>
            {tr(
              'This link grants bearer access to this household\u2019s invitation and replies. Anyone it is forwarded to can use that access. Keep the dashboard link private.',
            )}
          </p>
          <label className={s.form}>
            {tr('Selectable personal URL')}
            <input readOnly value={shared.url} onFocus={(e) => e.target.select()} />
          </label>
          <button
            className={s.secondary}
            onClick={async () => {
              try {
                await copyText(shared.url);
                setNotice(tr('Personal link copied.'));
              } catch {
                setNotice(tr('Clipboard unavailable. Select and copy the URL above.'));
              }
            }}
          >
            <Link2 size={14} />
            {tr('Copy again')}
          </button>
        </Modal>
      )}
      {danger && (
        <Modal
          title={`${danger.kind === 'rotate' ? tr('Replace link') : tr('Revoke link')} · ${danger.row.name}`}
          onClose={() => {
            if (!busy) setDanger(null);
          }}
        >
          {error && (
            <p role="alert" className={s.error}>
              {errorText(error, locale)}
            </p>
          )}
          <p>
            {danger.kind === 'rotate'
              ? tr(
                  'Replacing creates a new personal URL. Every previously shared URL and its existing guest sessions will stop working.',
                )
              : tr(
                  'Revoking stops the existing URL and all its guest sessions. You can explicitly replace the link later to share again.',
                )}{' '}
            {tr('Saved replies and wishes remain.')}
          </p>
          <button
            className={`${s.button} ${s.wine}`}
            disabled={busy}
            onClick={() => link(danger.row, danger.kind)}
          >
            {busy
              ? tr('Please wait…')
              : danger.kind === 'rotate'
                ? tr('Replace this link')
                : tr('Revoke this link')}
          </button>
        </Modal>
      )}
      {policyOpen && policy && (
        <Modal
          title={`${tr('Reply settings')} · ${tr(eventId)}`}
          onClose={() => {
            if (!busy) setPolicyOpen(false);
          }}
        >
          <form
            className={s.form}
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError('');
              const f = new FormData(e.currentTarget);
              const date = String(f.get('deadline') ?? '');
              try {
                await api(`${root}/policies/`, {
                  method: 'POST',
                  body: {
                    eventId,
                    expectedRevision: data.policyRevision,
                    isOpen: f.has('open'),
                    deadline: date ? new Date(`${date}+06:00`).toISOString() : null,
                  },
                });
                setPolicyOpen(false);
                await refresh();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {error && (
              <p className={s.error} role="alert">
                {errorText(error, locale)}
              </p>
            )}
            <label className={s.checkbox}>
              <input type="checkbox" name="open" defaultChecked={policy.isOpen} />
              {tr('Allow new replies and edits for this event')}
            </label>
            <label>
              {tr('Deadline \u00B7 Asia/Dhaka')}
              <input
                type="datetime-local"
                name="deadline"
                defaultValue={
                  policy.deadline
                    ? new Date(Date.parse(policy.deadline) + 6 * 3600000).toISOString().slice(0, 16)
                    : ''
                }
              />
            </label>
            <p>
              {tr(
                'These settings take effect immediately, including on invitations already open on another phone. Existing replies are retained.',
              )}
            </p>
            <button className={s.button} disabled={busy}>
              {tr('Save reply settings')}
            </button>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
function HouseholdEditor({
  row,
  wid,
  events,
  defaultEvent,
  onClose,
  onSaved,
}: {
  row: HouseholdRow | null;
  wid: string;
  events: Invitation['events'];
  defaultEvent: string;
  onClose: () => void;
  onSaved: (another: boolean, name: string) => Promise<void>;
}) {
  const { tr, locale } = useProductLocale();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [duplicate, setDuplicate] = useState('');
  const id = useRef(row?.id ?? crypto.randomUUID());
  const another = useRef(false);
  // A new family starts in the event the host is looking at (or the only event).
  const [included, setIncluded] = useState(
    () =>
      new Set(
        row
          ? row.events.map((event) => event.eventId)
          : events.length === 1
            ? [events[0].id]
            : events.some((ev) => ev.id === defaultEvent)
              ? [defaultEvent]
              : [],
      ),
  );
  function close() {
    if (busy) return;
    if (
      dirty &&
      !window.confirm(
        locale === 'bn'
          ? 'লেখা এখনো সংরক্ষণ হয়নি। তবুও বন্ধ করবেন?'
          : 'Your changes are not saved. Close anyway?',
      )
    )
      return;
    onClose();
  }
  // Names are checked across every family, not only the visible page.
  const duplicateCheck = useRef(0);
  async function checkDuplicate(name: string) {
    const check = ++duplicateCheck.current;
    const wanted = name.trim().toLowerCase();
    setDuplicate('');
    if (!wanted) return;
    try {
      for (const event of events) {
        let cursor: string | null = null;
        do {
          const query = new URLSearchParams({ event: event.id, search: name.trim(), status: 'all' });
          if (cursor) query.set('after', cursor);
          const r = await api<HouseholdReport>(`/api/weddings/${wid}/households/?${query}`);
          if (check !== duplicateCheck.current) return;
          const same = r.rows.find(
            (h) =>
              h.id !== row?.id &&
              (h.name.trim().toLowerCase() === wanted || h.nameBn?.trim().toLowerCase() === wanted),
          );
          if (same) {
            setDuplicate(
              locale === 'bn'
                ? `"${same.name}" নামে আগেই একটি পরিবার আছে। একই পরিবার হলে ওটাই এডিট করুন; আলাদা হলে নোটে পার্থক্য লিখে রাখুন।`
                : `A family named "${same.name}" already exists. Edit that one if it is the same family; otherwise add a note to tell them apart.`,
            );
            return;
          }
          cursor = r.nextCursor;
        } while (cursor);
      }
    } catch {
      /* The check is advisory; saving still works. */
    }
  }
  const attempt = useRef<{
    body: string;
    key: string;
  } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) ?? '').trim();
    const value: HouseholdInput = {
      name: text('name'),
      nameBn: text('nameBn'),
      greeting: text('greeting'),
      greetingEn: text('greetingEn'),
      message: text('message'),
      messageEn: text('messageEn'),
      privateNote: text('privateNote'),
      events: events
        .filter((ev) => included.has(ev.id))
        .map((ev) => ({ eventId: ev.id, maxPeople: Number(latinDigits(text(`allowance-${ev.id}`))) })),
    };
    const valid = householdInput.safeParse(value);
    if (!valid.success) {
      const issue = valid.error.issues[0];
      setError(
        locale === 'bn'
          ? issue.path[0] === 'events'
            ? 'অন্তত একটি অনুষ্ঠান বেছে নিন। নির্বাচিত অনুষ্ঠানে ১ থেকে ৫০ জনের অনুমতি দিন।'
            : issue.path[0] === 'name'
              ? 'অতিথি বা দলের নাম লিখুন; সর্বোচ্চ ১২০ অক্ষর। অদৃশ্য বা নিয়ন্ত্রণ অক্ষর দেওয়া যাবে না।'
              : 'লেখাটি বেশি বড় হয়েছে। সীমার মধ্যে লিখুন।'
          : issue.message,
      );
      return;
    }
    const body = { id: id.current, expectedRevision: row?.revision ?? 0, household: valid.data };
    const serialized = JSON.stringify(body);
    if (attempt.current?.body !== serialized)
      attempt.current = { body: serialized, key: crypto.randomUUID() };
    setBusy(true);
    setError('');
    try {
      await api(`/api/weddings/${wid}/households/`, { method: 'POST', body, key: attempt.current.key });
      setDirty(false);
      await onSaved(another.current, valid.data.name);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={row ? tr('Edit personal invitation') : tr('A welcome, just for them.')} onClose={close}>
      {error && (
        <p role="alert" className={s.error}>
          {errorText(error, locale)}
        </p>
      )}
      <p>
        {tr(
          'Guests see the host-supplied name. They never enter their own name. Changes here update this personal invitation immediately.',
        )}
      </p>
      <form className={s.form} onSubmit={submit} onInput={() => setDirty(true)}>
        <fieldset disabled={busy} className={s.form}>
          <label>
            {tr('Guest or family name')}
            <input
              name="name"
              required
              maxLength={120}
              autoFocus={!row}
              onBlur={(e) => void checkDuplicate(e.target.value)}
              defaultValue={row?.name}
              placeholder={
                locale === 'bn'
                  ? 'সাবিহা রহমান / রহমান পরিবার / অফিসের বন্ধু'
                  : 'Sabiha Rahman / Rahman family / Office friends'
              }
            />
          </label>
          {duplicate && (
            <p className={s.notice} role="status">
              {duplicate}
            </p>
          )}
          <details className={s.optionalFields}>
            <summary>
              {locale === 'bn'
                ? 'ব্যক্তিগত সম্বোধন ও বার্তা (ঐচ্ছিক)'
                : 'Personal greeting & message (optional)'}
            </summary>
            {(
              [
                ['greeting', 'সম্বোধন · বাংলা', 300],
                ['message', 'ব্যক্তিগত বার্তা · বাংলা', 500],
              ] as const
            ).map(([key, label, max]) => (
              <label key={key}>
                {label}
                <textarea name={key} rows={2} maxLength={max} defaultValue={row?.[key]} />
              </label>
            ))}
          </details>
          <details className={s.optionalFields}>
            <summary>
              {locale === 'bn'
                ? 'ঐচ্ছিক অনুবাদ ও আলাদা বাংলা বানান'
                : 'Optional translations & alternate Bangla spelling'}
            </summary>
            <div className={s.form}>
              <label>
                {tr('\u09A8\u09BE\u09AE \u00B7 \u09AC\u09BE\u0982\u09B2\u09BE (optional)')}
                <input name="nameBn" maxLength={120} defaultValue={row?.nameBn} />
              </label>
              {(
                [
                  ['greetingEn', tr('Greeting \u00B7 English'), 300],
                  ['messageEn', tr('Personal message \u00B7 English'), 500],
                ] as const
              ).map(([key, label, max]) => (
                <label key={key}>
                  {label}
                  <textarea name={key} rows={2} maxLength={max} defaultValue={row?.[key]} />
                </label>
              ))}
            </div>
          </details>
          <fieldset>
            <legend>{tr('Celebrations & total people')}</legend>
            {events.map((ev) => (
              <div className={s.scopeRow} key={ev.id}>
                <label className={s.checkbox}>
                  <input
                    type="checkbox"
                    name={`event-${ev.id}`}
                    checked={included.has(ev.id)}
                    disabled={!!row?.responses[ev.id]}
                    onChange={(e) =>
                      setIncluded((current) => {
                        const next = new Set(current);
                        if (e.target.checked) next.add(ev.id);
                        else next.delete(ev.id);
                        return next;
                      })
                    }
                  />
                  {locale === 'bn' ? ev.titleBn || ev.title : ev.title}
                </label>
                <label>
                  {tr('Total allowance')}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9০-৯]+"
                    required={included.has(ev.id)}
                    disabled={!included.has(ev.id)}
                    name={`allowance-${ev.id}`}
                    maxLength={2}
                    defaultValue={row?.events.find((e) => e.eventId === ev.id)?.maxPeople ?? 1}
                  />
                </label>
              </div>
            ))}
          </fieldset>
          <label>
            {tr('Private host note \u00B7 never shown to guests')}
            <textarea
              name="privateNote"
              rows={2}
              maxLength={1000}
              defaultValue={row?.privateNote}
              placeholder={
                locale === 'bn'
                  ? 'যেমন: অফিসের সাবিহা / খুলনার মামা—নিজের চেনার সুবিধায়'
                  : 'For example: Sabiha from work / Uncle from Khulna'
              }
            />
          </label>
          <p className={s.muted}>
            {tr(
              'Allowances include all adults and children. A responded event cannot be removed, or its allowance lowered below a saved party, without reconciliation. Duplicate names remain separate households.',
            )}
          </p>
          <div className={s.actions}>
            <button className={s.button} disabled={busy} onClick={() => (another.current = false)}>
              {busy ? tr('Please wait…') : row ? tr('Save household') : tr('Create household')}
            </button>
            {!row && (
              <button className={s.secondary} disabled={busy} onClick={() => (another.current = true)}>
                {locale === 'bn' ? 'সংরক্ষণ করে পরেরটি যোগ করুন' : 'Save & add another'}
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
// Paste many families at once: one per line, "name, people". Each line becomes an
// ordinary household through the same API, so validation and limits are unchanged.
function BulkHouseholds({
  wid,
  events,
  defaultEvent,
  onClose,
}: {
  wid: string;
  events: Invitation['events'];
  defaultEvent: string;
  onClose: (created: number) => Promise<void>;
}) {
  const { locale } = useProductLocale();
  const bn = locale === 'bn';
  const [text, setText] = useState('');
  const [included, setIncluded] = useState(
    () =>
      new Set(
        events.length === 1
          ? [events[0].id]
          : events.some((ev) => ev.id === defaultEvent)
            ? [defaultEvent]
            : [],
      ),
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState('');
  const batch = useRef<
    { body: { id: string; expectedRevision: number; household: HouseholdInput }; key: string }[] | null
  >(null);
  const completed = useRef(0);
  const running = useRef(false);
  const [started, setStarted] = useState(false);
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const tooMany = lines.length > 100;
  useEffect(() => {
    if (!text.trim()) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (completed.current >= lines.length) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [text, lines.length]);
  const parsed = lines.map((line) => {
    const match = /^(.*?)(?:[,،;|\t]\s*([^,،;|\t]+))?$/.exec(line);
    const name = (match?.[1] ?? line).trim();
    const people = Number(latinDigits(match?.[2] ?? '1'));
    const household: HouseholdInput = {
      name,
      nameBn: '',
      greeting: '',
      greetingEn: '',
      message: '',
      messageEn: '',
      privateNote: '',
      events: events.filter((ev) => included.has(ev.id)).map((ev) => ({ eventId: ev.id, maxPeople: people })),
    };
    return { line, name, people, valid: householdInput.safeParse(household), household };
  });
  const ready = parsed.filter((p) => p.valid.success);
  async function create() {
    if (running.current || !ready.length || tooMany || ready.length !== parsed.length) return;
    running.current = true;
    if (!batch.current)
      batch.current = ready.map((item) => ({
        body: { id: crypto.randomUUID(), expectedRevision: 0, household: item.household },
        key: crypto.randomUUID(),
      }));
    setStarted(true);
    setBusy(true);
    setError('');
    try {
      for (const item of batch.current.slice(completed.current)) {
        await api(`/api/weddings/${wid}/households/`, { method: 'POST', body: item.body, key: item.key });
        completed.current++;
        setDone(completed.current);
      }
      await onClose(completed.current);
    } catch (e) {
      setError(
        (bn
          ? `${completed.current}টি নিশ্চিতভাবে যোগ হয়েছে। একই তালিকা আবার জমা দেবেন না; এখান থেকেই বাকি অংশ চেষ্টা করুন: `
          : `${completed.current} confirmed added. Do not submit the list again; retry the remaining items here: `) +
          errorText((e as Error).message, locale),
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal
      title={bn ? 'একসঙ্গে অনেক পরিবার যোগ করুন' : 'Add many families at once'}
      onClose={() => {
        if (running.current) return;
        if (
          text.trim() &&
          completed.current < lines.length &&
          !window.confirm(
            bn
              ? 'তালিকার সব পরিবার সংরক্ষিত হয়নি। বন্ধ করলে বাকি কাজের অবস্থান হারাবে। বন্ধ করতে OK, এখান থেকে আবার চেষ্টা করতে Cancel চাপুন।'
              : 'Not all families are saved. Closing loses the remaining batch progress. Stay here to retry, or choose OK to close.',
          )
        )
          return;
        void onClose(completed.current);
      }}
    >
      <p>
        {bn
          ? 'প্রতি লাইনে একটি পরিবার: নাম, তারপর কমা দিয়ে মোট কতজন। সংখ্যা না দিলে ১ জন ধরা হবে। একবারে সর্বোচ্চ ১০০টি।'
          : 'One family per line: the name, then a comma and the total people. No number means 1. Up to 100 at a time.'}
      </p>
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
      {tooMany && (
        <p className={s.error} role="alert">
          {bn
            ? '১০০টির বেশি পরিবার দেওয়া হয়েছে। কোনো নাম বাদ দেওয়া হয়নি; সর্বোচ্চ ১০০টি রেখে আবার চেষ্টা করুন।'
            : 'More than 100 families supplied. No rows were discarded; keep at most 100 and try again.'}
        </p>
      )}
      <div className={s.form}>
        <label>
          {bn ? 'পরিবারের তালিকা' : 'Families'}
          <textarea
            rows={8}
            value={text}
            disabled={busy || started}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              bn
                ? 'রহমান পরিবার, 4\nসাবিহা আপা, 2\nঅফিসের বন্ধুরা, 6'
                : 'Rahman family, 4\nSabiha, 2\nOffice friends, 6'
            }
          />
        </label>
        <fieldset>
          <legend>{bn ? 'কোন অনুষ্ঠানে দাওয়াত' : 'Invited to'}</legend>
          {events.map((ev) => (
            <label className={s.checkbox} key={ev.id}>
              <input
                type="checkbox"
                checked={included.has(ev.id)}
                disabled={busy || started}
                onChange={(e) =>
                  setIncluded((current) => {
                    const next = new Set(current);
                    if (e.target.checked) next.add(ev.id);
                    else next.delete(ev.id);
                    return next;
                  })
                }
              />
              {bn ? ev.titleBn || ev.title : ev.title}
            </label>
          ))}
        </fieldset>
        {lines.length > 0 && (
          <p className={s.muted} role="status">
            {bn
              ? `${ready.length}টি প্রস্তুত${parsed.length > ready.length ? `, ${parsed.length - ready.length}টিতে সমস্যা` : ''}।`
              : `${ready.length} ready${parsed.length > ready.length ? `, ${parsed.length - ready.length} need fixing` : ''}.`}
          </p>
        )}
        {parsed.some((p) => !p.valid.success) && (
          <ul className={s.list}>
            {parsed
              .filter((p) => !p.valid.success)
              .slice(0, 5)
              .map((p, i) => (
                <li key={i}>
                  {p.line} —{' '}
                  {!included.size
                    ? bn
                      ? 'অন্তত একটি অনুষ্ঠান বেছে নিন'
                      : 'choose at least one event'
                    : !Number.isInteger(p.people) || p.people < 1 || p.people > 50
                      ? bn
                        ? 'সংখ্যা ১ থেকে ৫০ এর মধ্যে দিন'
                        : 'use 1 to 50 people'
                      : bn
                        ? 'নাম ঠিক করুন'
                        : 'fix the name'}
                </li>
              ))}
          </ul>
        )}
        <button
          className={s.button}
          disabled={busy || !ready.length || tooMany || ready.length !== parsed.length}
          onClick={() => void create()}
        >
          {busy
            ? bn
              ? `যোগ হচ্ছে… ${done}/${ready.length}`
              : `Adding… ${done}/${ready.length}`
            : started
              ? bn
                ? 'বাকিগুলো আবার চেষ্টা করুন'
                : 'Retry the rest'
              : bn
                ? `${ready.length}টি পরিবার যোগ করুন`
                : `Add ${ready.length} families`}
        </button>
      </div>
    </Modal>
  );
}
