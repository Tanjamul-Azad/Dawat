'use client';
import { useProductLocale } from './product-locale';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Eye,
  Plus,
  RefreshCw,
  Send,
  Link2,
  RotateCcw,
  ShieldOff,
  Heart,
  Download,
  PencilLine,
} from 'lucide-react';
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
import { errorText } from '@/features/production/copy';
import { WorkspaceFrame } from './frame';
import { Modal, copyText } from '../ui';
import { GuestLive } from './guest-live';
import { ResponseEditor } from './response-editor';
import s from './workspace.module.css';
type Props = {
  wid: string;
  slug: string;
  title: string;
  email: string;
  events: Invitation['events'];
  initial: HouseholdReport;
  initialEvent: string;
};
export function GuestHub({ wid, slug, title, email, events, initial, initialEvent }: Props) {
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
  async function refresh(after: string | null = cursor.current, filters = { eventId, search, status }) {
    if (JSON.stringify(appliedFilters.current) !== JSON.stringify(filters)) after = null;
    const generation = ++serial.current;
    setBusy(true);
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
      if (generation === serial.current) setBusy(false);
    }
  }
  async function loadWishes(after: string | null = wishCursor.current) {
    const generation = ++wishSerial.current;
    setBusy(true);
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
      if (mounted.current && generation === wishSerial.current) setBusy(false);
    }
  }
  useEffect(() => {
    mounted.current = true;
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
        if (panel === 'wishes') void loadWishes();
        else void refresh();
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
  }, [eventId, status, search, editing, danger, preview, panel, policyOpen, correcting]);
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
        setShared({ name: row.name, url: r.url });
        try {
          await copyText(r.url);
          setNotice(tr('Personal link copied. No message has been sent.'));
        } catch {
          setNotice(tr('The link is ready. Copy it from the selectable field below.'));
        }
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
          <a href={`/weddings/${wid}/`} className={s.eyebrow}>
            <ArrowLeft size={12} /> {title}
          </a>
          <h1>{tr('People make the celebration.')}</h1>
          <p>নাম ধরে আমন্ত্রণ। প্রতিটি পরিবারের জন্য নিজস্ব লিংক, অনুষ্ঠান ও মোট লোকসংখ্যার অনুমতি।</p>
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
          <button className={s.button} disabled={busy || !events.length} onClick={() => setEditing(null)}>
            <Plus size={16} />
            {tr('Add household')}
          </button>
        </div>
      </div>
      {error && editing === undefined && !danger && (
        <p className={s.error} role="alert">
          {error}
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
            void loadWishes();
          }}
        >
          {tr('Private wishes')}
        </button>
      </nav>
      {panel === 'guests' ? (
        <>
          <div className={s.panel}>
            <div className={s.actions} style={{ justifyContent: 'space-between', marginBottom: 20 }}>
              <label>
                {tr('Celebration')}{' '}
                <select
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    void refresh(null, { eventId: e.target.value, search, status });
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
              <button className={s.quiet} onClick={() => setPolicyOpen(true)}>
                {tr('Reply settings')}
              </button>
            </div>
            <p className={s.eyebrow}>{tr('All invited households \u00B7 selected event')}</p>
            <p className={s.muted}>
              {locale === 'bn' ? 'দেখানো রিপোর্ট' : 'Displayed report'}: {tr(reportEventId)} ·{' '}
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
                {count(data.summary.adults)}
                {tr('adults +')}
                {count(data.summary.children)}
                {tr('children')}
              </span>
            </p>
            <p className={s.muted}>
              {stale ? tr('Stale \u00B7 ') : ''}
              {tr('As of')}{' '}
              {new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
                timeStyle: 'medium',
                timeZone: 'Asia/Dhaka',
              }).format(new Date(data.asOf))}{' '}
              {tr('\u00B7 Asia/Dhaka. Totals refer to this event, not unique people across celebrations.')}
            </p>
          </div>
          <section className={s.panel}>
            <div className={s.sectionHeader}>
              <h2>{locale === 'bn' ? 'অতিথি তালিকা' : 'Guest list'}</h2>
              <button
                className={s.secondary}
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  setError('');
                  try {
                    await downloadCsv(
                      `${root}/export/?${new URLSearchParams({ event: eventId, search, status })}`,
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
                ? 'CSV-তে নির্বাচিত অনুষ্ঠান, নাম ও অবস্থার ফিল্টার অনুযায়ী সব পরিবার থাকবে; শুধু এই পেজ নয়। ব্যক্তিগত লিংক ও আয়োজকের নোট থাকবে না।'
                : 'CSV includes every household matching the selected event, name and status, across all pages. Private links and host notes are excluded.'}
            </p>
            <form
              className={`${s.form} ${s.filters}`}
              onSubmit={(e) => {
                e.preventDefault();
                void refresh(null);
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
                    void refresh(null, { eventId, search, status: e.target.value });
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
            </form>
            <ul className={s.list}>
              {rows.map((row) => {
                const answer = row.responses[reportEventId];
                const allowance = row.events.find((e) => e.eventId === reportEventId)?.maxPeople;
                return (
                  <li key={row.id} className={s.householdRow}>
                    <div style={{ minWidth: 0 }}>
                      <strong>{row.name}</strong>
                      <small>
                        {row.nameBn && row.nameBn !== row.name ? row.nameBn + ' · ' : ''}
                        {row.events.map((e) => `${tr(e.eventId)} (${count(e.maxPeople)})`).join(' · ')}
                        <br />
                        {tr('Link')}
                        {tr(row.linkState)} · {allowance === undefined ? '—' : count(allowance)}
                        {tr('people maximum')}
                      </small>
                      <p className={s.muted}>
                        {answer
                          ? `${tr(answer.attendance)} · ${count(answer.adults)} ${tr('adults +')} ${count(answer.children)} ${tr('children')}`
                          : tr('Pending \u00B7 no reply yet')}
                      </p>
                      {answer?.note && (
                        <p className={s.muted}>
                          {tr('Guest note:')}
                          {answer.note}
                        </p>
                      )}
                      <details>
                        <summary>{tr('Personal details & link actions')}</summary>
                        <p className={s.muted}>
                          {tr('Private host note:')}
                          {row.privateNote || '—'}
                        </p>
                        <div className={s.actions}>
                          <button className={s.secondary} disabled={busy} onClick={() => setCorrecting(row)}>
                            <PencilLine size={14} />
                            {locale === 'bn' ? 'উত্তর সংশোধন ও ইতিহাস' : 'Correct reply & history'}
                          </button>
                          <button className={s.secondary} disabled={busy} onClick={() => setEditing(row)}>
                            {tr('Edit household')}
                          </button>
                          {row.linkState !== 'missing' && (
                            <>
                              <button
                                className={s.secondary}
                                disabled={busy}
                                onClick={() => setDanger({ row, kind: 'rotate' })}
                              >
                                <RotateCcw size={14} />
                                {tr('Replace link')}
                              </button>
                              {row.linkState === 'active' && (
                                <button
                                  className={s.secondary}
                                  disabled={busy}
                                  onClick={() => setDanger({ row, kind: 'revoke' })}
                                >
                                  <ShieldOff size={14} />
                                  {tr('Revoke link')}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </details>
                    </div>
                    <div className={s.actions}>
                      <button className={s.secondary} disabled={busy} onClick={() => openPreview(row)}>
                        <Eye size={14} />
                        {tr('Preview')}
                      </button>
                      <button
                        className={s.secondary}
                        disabled={busy || row.linkState === 'revoked'}
                        onClick={() => link(row, 'copy')}
                      >
                        <Copy size={14} />
                        {row.linkState === 'missing' ? tr('Create & copy') : tr('Copy link')}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!rows.length && (
              <div className={s.empty}>
                <Send size={25} />
                <h2>
                  {search || status !== 'all'
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
            <div className={s.actions}>
              {data.nextCursor && (
                <button className={s.secondary} disabled={busy} onClick={() => refresh(data.nextCursor!)}>
                  {tr('Next 25 households')}
                </button>
              )}
              <button className={s.quiet} disabled={busy} onClick={() => refresh(null)}>
                {tr('Back to first page')}
              </button>
            </div>
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
                  <small>
                    {new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Asia/Dhaka',
                    }).format(new Date(w.createdAt))}
                  </small>
                </div>
              </li>
            ))}
          </ul>
          {!wishesLoaded && <p className={s.muted}>{tr('Private wishes have not loaded yet.')}</p>}
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
          row={editing}
          wid={wid}
          events={events}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setEditing(undefined);
            setNotice(
              tr(
                'Household saved. Personal name, scope and allowance are live immediately; base invitation remains unchanged.',
              ),
            );
            await refresh();
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
              {error}
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
                {error}
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
  onClose,
  onSaved,
}: {
  row: HouseholdRow | null;
  wid: string;
  events: Invitation['events'];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { tr, locale } = useProductLocale();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const id = useRef(row?.id ?? crypto.randomUUID());
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
        .filter((ev) => f.has(`event-${ev.id}`))
        .map((ev) => ({ eventId: ev.id, maxPeople: Number(text(`allowance-${ev.id}`)) })),
    };
    const valid = householdInput.safeParse(value);
    if (!valid.success) {
      setError(valid.error.issues[0].message);
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
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={row ? tr('Edit personal invitation') : tr('A welcome, just for them.')}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
      <p>
        {tr(
          'Guests see the host-supplied name. They never enter their own name. Changes here update this personal invitation immediately.',
        )}
      </p>
      <form className={s.form} onSubmit={submit}>
        <fieldset disabled={busy} className={s.form}>
          <label>
            {tr('Guest or family name')}
            <input
              name="name"
              required
              maxLength={120}
              defaultValue={row?.name}
              placeholder={tr(
                'Rahman Family / \u09B0\u09B9\u09AE\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09BE\u09B0',
              )}
            />
          </label>
          <label>
            {tr('\u09A8\u09BE\u09AE \u00B7 \u09AC\u09BE\u0982\u09B2\u09BE (optional)')}
            <input name="nameBn" maxLength={120} defaultValue={row?.nameBn} />
          </label>
          {(
            [
              ['greeting', 'সম্বোধন · বাংলা', 300],
              ['greetingEn', tr('Greeting \u00B7 English'), 300],
              ['message', 'ব্যক্তিগত বার্তা · বাংলা', 500],
              ['messageEn', tr('Personal message \u00B7 English'), 500],
            ] as const
          ).map(([key, label, max]) => (
            <label key={key}>
              {label}
              <textarea name={key} rows={2} maxLength={max} defaultValue={row?.[key]} />
            </label>
          ))}
          <fieldset>
            <legend>{tr('Celebrations & total people')}</legend>
            {events.map((ev) => (
              <div className={s.scopeRow} key={ev.id}>
                <label className={s.checkbox}>
                  <input
                    type="checkbox"
                    name={`event-${ev.id}`}
                    defaultChecked={!!row?.events.some((e) => e.eventId === ev.id)}
                  />
                  {locale === 'bn' ? ev.titleBn || ev.title : ev.title}
                </label>
                <label>
                  {tr('Total allowance')}
                  <input
                    type="number"
                    name={`allowance-${ev.id}`}
                    min={1}
                    max={50}
                    step={1}
                    defaultValue={row?.events.find((e) => e.eventId === ev.id)?.maxPeople ?? 1}
                  />
                </label>
              </div>
            ))}
          </fieldset>
          <label>
            {tr('Private host note \u00B7 never shown to guests')}
            <textarea name="privateNote" rows={2} maxLength={1000} defaultValue={row?.privateNote} />
          </label>
          <p className={s.muted}>
            {tr(
              'Allowances include all adults and children. A responded event cannot be removed, or its allowance lowered below a saved party, without reconciliation. Duplicate names remain separate households.',
            )}
          </p>
          <button className={s.button} disabled={busy}>
            {busy ? 'Saving…' : row ? tr('Save household') : tr('Create household')}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
}
