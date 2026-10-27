'use client';
import { useProductLocale } from './product-locale';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Copy, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import type { SellerOrder, SellerCommand } from '@/features/production/contracts';
import { api } from '@/features/production/client';
import { parseBDT, takaFromPaisa } from '@/features/production/money';
import { formatDhaka } from '@/features/production/dates';
import { latinDigits } from '@/features/production/copy';
import { WorkspaceFrame } from './frame';
import { Modal } from '../ui';
import s from './workspace.module.css';
type Page = {
  orders: SellerOrder[];
  nextCursor: string | null;
};
type Timeline = {
  action: string;
  reason: string;
  created_at: string;
  actor_id: string;
}[];
export function SellerOrders({
  initial,
  email,
  focus,
}: {
  initial: Page;
  email: string;
  focus?: SellerOrder;
}) {
  const { tr, locale } = useProductLocale();
  const [page, setPage] = useState(initial);
  const [selected, setSelected] = useState<SellerOrder | null>(null);
  const [creating, setCreating] = useState(false);
  const [action, setAction] = useState<SellerCommand['kind'] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // After activation: the customer's own portal address, ready to copy and send.
  const [handoff, setHandoff] = useState<{ url: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [timeline, setTimeline] = useState<Timeline>([]);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'email'>('name');
  const appliedSearch = useRef({ search: '', field: 'name' });
  const timelineSerial = useRef(0);
  const attempt = useRef<{
    body: string;
    key: string;
  } | null>(null);
  const money = (minor: number) => takaFromPaisa(minor, locale);
  async function refresh(cursor?: string) {
    if (search !== appliedSearch.current.search || searchField !== appliedSearch.current.field)
      cursor = undefined;
    const params = new URLSearchParams({ search, field: searchField });
    if (cursor) params.set('cursor', cursor);
    const p = await api<Page>(`/api/admin/orders/?${params}`);
    appliedSearch.current = { search, field: searchField };
    setPage(p);
    if (selected) setSelected(p.orders.find((o) => o.id === selected.id) ?? null);
  }
  async function reload() {
    setBusy(true);
    setError('');
    try {
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function open(order: SellerOrder) {
    const generation = ++timelineSerial.current;
    setSelected(order);
    setTimeline([]);
    setError('');
    try {
      const result = await api<Timeline>(`/api/admin/orders/${order.id}/`);
      if (generation === timelineSerial.current) setTimeline(result);
    } catch (e) {
      if (generation === timelineSerial.current) setError((e as Error).message);
    }
  }
  useEffect(() => {
    // Search-parameter navigation can reuse this component for another order.
    // Never carry an open action or its retry key into that new selection.
    setAction(null);
    setCreating(false);
    setNotice('');
    setHandoff(null);
    setCopied(false);
    attempt.current = null;
    if (focus) void open(focus);
    else {
      ++timelineSerial.current;
      setSelected(null);
      setTimeline([]);
    }
  }, [focus?.id]);
  async function copyHandoff() {
    if (!handoff) return;
    try {
      await navigator.clipboard.writeText(handoff.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const f = new FormData(event.currentTarget);
    const value = (key: string) => String(f.get(key) ?? '').trim();
    const amount = parseBDT(value('amountTaka'));
    if ((creating || action === 'verify-payment') && amount === null) {
      setError(
        locale === 'bn'
          ? 'টাকায় সঠিক মূল্য লিখুন; দশমিকের পরে সর্বোচ্চ দুই অঙ্ক।'
          : 'Enter a valid BDT amount with up to two decimal places.',
      );
      return;
    }
    let command: SellerCommand;
    if (creating)
      command = {
        kind: 'create',
        email: value('email'),
        name: value('name'),
        packageName: value('packageName'),
        amountMinor: amount!,
        termDays: Number(latinDigits(value('termDays'))),
      };
    else if (selected && action && action !== 'create') {
      const base = { orderId: selected.id, expectedRevision: selected.revision, reason: value('reason') };
      command =
        action === 'verify-payment'
          ? {
              kind: action,
              ...base,
              amountMinor: amount!,
              method: value('method'),
              reference: value('reference'),
            }
          : action === 'confirm'
            ? { kind: action, ...base, ...(f.get('exception') ? { exception: 'approved' as const } : {}) }
            : { kind: action, ...base };
    } else return;
    const serialized = JSON.stringify(command);
    if (attempt.current?.body !== serialized)
      attempt.current = { body: serialized, key: crypto.randomUUID() };
    setBusy(true);
    setError('');
    setNotice('');
    setHandoff(null);
    setCopied(false);
    try {
      const result = await api<{ weddingId: string | null }>('/api/admin/orders/', {
        method: 'POST',
        body: command,
        key: attempt.current.key,
      });
      const weddingId = result?.weddingId ?? (selected?.weddingId || null);
      if (command.kind === 'activate' && weddingId && selected)
        setHandoff({
          url: `${window.location.origin}/weddings/${weddingId}/`,
          email: selected.customer_email,
        });
      attempt.current = null;
      setAction(null);
      setCreating(false);
      setSelected(null);
      setNotice(
        command.kind === 'activate'
          ? tr(
              'Access activated for the intended verified customer. Copy their dashboard entry below; no message has been sent.',
            )
          : tr('Action saved and recorded in the audit timeline.'),
      );
      try {
        await refresh();
      } catch {
        setError(
          tr('The action was saved, but the list could not refresh. Refresh before taking another action.'),
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceFrame email={email} seller>
      <div className={s.intro}>
        <div>
          <p className={s.eyebrow}>{tr('Seller operations')}</p>
          <h1>{tr('Every order, a clear next step.')}</h1>
          <p>{tr('Verify the agreement. Confirm the wedding. Activate the intended customer.')}</p>
        </div>
        <div className={s.actions}>
          <button className={s.secondary} onClick={reload} disabled={busy}>
            <RefreshCw size={15} />
            {tr('Refresh')}
          </button>
          <button
            className={s.button}
            onClick={() => {
              setCreating(true);
              setError('');
            }}
            disabled={busy}
          >
            <Plus size={16} />
            {tr('New order')}
          </button>
        </div>
      </div>
      {error && !creating && !action && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className={s.notice} role="status">
          {notice}
        </p>
      )}
      {handoff && (
        <section
          className={s.panel}
          aria-label={locale === 'bn' ? 'গ্রাহকের আয়োজনের পাতার লিংক' : 'Customer’s wedding page link'}
        >
          <h2>{locale === 'bn' ? 'গ্রাহকের আয়োজনের পাতার লিংক' : 'Customer’s wedding page link'}</h2>
          <p className={s.muted}>
            {locale === 'bn'
              ? `এই লিংক ${handoff.email}-কে পাঠান। তিনি এই ইমেইলের কোড দিয়ে লগইন করলেই সরাসরি তাঁর আমন্ত্রণ খুলবে। কোনো বার্তা স্বয়ংক্রিয়ভাবে পাঠানো হয়নি।`
              : `Send this link to ${handoff.email}. Signing in with that email opens their invitation directly. No message has been sent automatically.`}
          </p>
          <p className={s.code}>{handoff.url}</p>
          <button className={s.button} onClick={() => void copyHandoff()}>
            <Copy size={15} />
            {copied
              ? locale === 'bn'
                ? 'কপি হয়েছে'
                : 'Copied'
              : locale === 'bn'
                ? 'লিংক কপি করুন'
                : 'Copy link'}
          </button>
        </section>
      )}
      <section className={s.panel}>
        <form
          className={`${s.form} ${s.filters}`}
          onSubmit={(e) => {
            e.preventDefault();
            void reload();
          }}
        >
          <label>
            {locale === 'bn' ? 'অর্ডার খুঁজুন' : 'Find an order'}
            <input
              value={search}
              maxLength={120}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === 'bn' ? 'গ্রাহকের নাম বা ইমেইল' : 'Customer name or email'}
            />
          </label>
          <label>
            {locale === 'bn' ? 'খোঁজার ধরন' : 'Search by'}
            <select value={searchField} onChange={(e) => setSearchField(e.target.value as 'name' | 'email')}>
              <option value="name">{locale === 'bn' ? 'নাম' : 'Name'}</option>
              <option value="email">{locale === 'bn' ? 'ইমেইল' : 'Email'}</option>
            </select>
          </label>
          <button className={s.secondary} disabled={busy}>
            {locale === 'bn' ? 'খুঁজুন' : 'Search'}
          </button>
        </form>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>{tr('Order / customer')}</th>
                <th>{tr('Agreement')}</th>
                <th>{tr('Payment')}</th>
                <th>{tr('Management')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {page.orders.map((o) => (
                <tr key={o.id}>
                  <td data-label={tr('Order / customer')}>
                    <strong>{o.customer_name}</strong>
                    <small>{o.customer_email}</small>
                    <small>{o.id.slice(0, 8)}</small>
                  </td>
                  <td data-label={tr('Agreement')}>
                    {o.package_name}
                    <small>
                      {money(o.amount_minor)} · {o.term_days}
                      {tr('days')}
                    </small>
                  </td>
                  <td data-label={tr('Payment')}>
                    {o.payment_status === 'manually_verified'
                      ? tr('Manually verified')
                      : tr('Payment pending')}
                    {o.exception_reason && <small>{tr('Approved exception')}</small>}
                  </td>
                  <td data-label={tr('Management')}>
                    <span className={s.badge}>{tr(o.access)}</span>
                    <small>
                      {tr('Order')}
                      {tr(o.status)}
                    </small>
                  </td>
                  <td>
                    <button className={s.quiet} onClick={() => open(o)}>
                      {tr('Review')}
                      <ArrowRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!page.orders.length && (
          <div className={s.empty}>
            <ShieldCheck size={28} />
            <h2>
              {search
                ? locale === 'bn'
                  ? 'এই ফিল্টারে কোনো অর্ডার নেই।'
                  : 'No orders match these filters.'
                : tr('A clean order book.')}
            </h2>
            <p>
              {search
                ? locale === 'bn'
                  ? 'খোঁজার নাম বা ইমেইল বদলে আবার চেষ্টা করুন।'
                  : 'Try another name or email.'
                : tr('Add a manually reviewed order to begin. Nothing is automatically paid or activated.')}
            </p>
          </div>
        )}
        {page.nextCursor && (
          <button
            className={s.secondary}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await refresh(page.nextCursor!);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {tr('Next 25 orders')}
            <ArrowRight size={15} />
          </button>
        )}
        <button className={s.quiet} disabled={busy} onClick={() => void reload()}>
          {locale === 'bn' ? 'প্রথম পেজে ফিরুন' : 'Back to first page'}
        </button>
      </section>
      {selected && !action && (
        <Modal title={`${tr('Order')} · ${selected.customer_name}`} onClose={() => setSelected(null)}>
          <div className={s.order}>
            <p className={s.code}>{selected.id}</p>
            <dl className={s.facts}>
              <div>
                <dt>{tr('Intended owner')}</dt>
                <dd>{selected.customer_email}</dd>
              </div>
              <div>
                <dt>{tr('Package / term')}</dt>
                <dd>
                  {selected.package_name} · {selected.term_days}
                  {tr('days')}
                </dd>
              </div>
              <div>
                <dt>{tr('Payment')}</dt>
                <dd>
                  {selected.payment_status === 'pending'
                    ? tr('Payment pending')
                    : tr(selected.payment_status)}{' '}
                  · {money(selected.amount_minor)}
                </dd>
              </div>
              <div>
                <dt>{tr('Order / access')}</dt>
                <dd>
                  {tr(selected.status)} / {tr(selected.access)}
                </dd>
              </div>
            </dl>
            {selected.access === 'active' && selected.weddingId && (
              <div className={s.detail}>
                <p className={s.muted}>
                  {locale === 'bn' ? 'গ্রাহকের আয়োজনের পাতার লিংক' : 'Customer’s wedding page link'}
                </p>
                <p
                  className={s.code}
                >{`${typeof window === 'undefined' ? '' : window.location.origin}/weddings/${selected.weddingId}/`}</p>
                <button
                  className={s.secondary}
                  onClick={() => {
                    setHandoff({
                      url: `${window.location.origin}/weddings/${selected.weddingId}/`,
                      email: selected.customer_email,
                    });
                    void navigator.clipboard
                      .writeText(`${window.location.origin}/weddings/${selected.weddingId}/`)
                      .then(() => setCopied(true))
                      .catch(() => setCopied(false));
                  }}
                >
                  <Copy size={15} />
                  {locale === 'bn' ? 'লিংক কপি করুন' : 'Copy link'}
                </button>
              </div>
            )}
            <div className={s.actions}>
              {selected.payment_status === 'pending' && (
                <button className={s.secondary} onClick={() => setAction('verify-payment')}>
                  {tr('Verify payment')}
                </button>
              )}
              {selected.status === 'reviewing' && (
                <button className={s.button} onClick={() => setAction('confirm')}>
                  {tr('Confirm & provision')}
                </button>
              )}
              {selected.status === 'confirmed' && (
                <>
                  {selected.access !== 'active' && (
                    <button className={s.button} onClick={() => setAction('activate')}>
                      {tr('Activate customer access')}
                    </button>
                  )}
                  {selected.access === 'active' && (
                    <button className={s.secondary} onClick={() => setAction('suspend')}>
                      {tr('Suspend management')}
                    </button>
                  )}
                  {selected.access !== 'revoked' && (
                    <button className={s.secondary} onClick={() => setAction('revoke')}>
                      {tr('Revoke management')}
                    </button>
                  )}
                </>
              )}
            </div>
            <p className={s.muted}>
              {tr(
                'Confirmation and access activation are separate. Suspending or revoking management keeps the existing guest publication unchanged.',
              )}
            </p>
            <div className={s.detail}>
              <h3>{tr('Audit timeline')}</h3>
              {timeline.length ? (
                <ul className={s.list}>
                  {timeline.map((e, i) => (
                    <li key={i}>
                      <div>
                        <strong>{tr(e.action)}</strong>
                        <small>
                          {e.reason}
                          <br />
                          {formatDhaka(e.created_at, locale, { date: 'medium', time: 'short' })}{' '}
                          {tr('\u00B7 actor')}
                          {e.actor_id.slice(0, 8)}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={s.muted}>{tr('No timeline loaded yet.')}</p>
              )}
            </div>
          </div>
        </Modal>
      )}
      {(creating || action) && (
        <Modal
          title={
            creating ? tr('Record a reviewed order') : `${tr(action ?? '')} · ${selected?.customer_name}`
          }
          onClose={() => {
            if (!busy) {
              setCreating(false);
              setAction(null);
            }
          }}
        >
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <form className={s.form} onSubmit={submit}>
            <fieldset disabled={busy} className={s.form}>
              {creating ? (
                <>
                  <label>
                    {tr('Customer name')}
                    <input name="name" required maxLength={120} />
                  </label>
                  <label>
                    {tr('Intended customer email')}
                    <input name="email" type="email" required maxLength={254} />
                  </label>
                  <label>
                    {tr('Agreed package name')}
                    <input name="packageName" required maxLength={160} />
                  </label>
                  <div className={s.row}>
                    <label>
                      {locale === 'bn' ? 'সম্মত মূল্য · টাকা' : 'Agreed amount · BDT'}
                      <input
                        name="amountTaka"
                        inputMode="decimal"
                        maxLength={12}
                        required
                        placeholder="2500.00"
                      />
                    </label>
                    <label>
                      {tr('Agreed hosting term \u00B7 days')}
                      <input name="termDays" type="number" min={1} max={3650} step={1} required />
                    </label>
                  </div>
                  <p className={s.muted}>
                    {tr('Use the actual agreed price and term. Recording an order does not mark it paid.')}
                  </p>
                </>
              ) : (
                <>
                  <p className={s.muted}>
                    {tr('Customer:')}
                    <strong>{selected?.customer_email}</strong>
                    <br />
                    {tr('Order:')}
                    {selected?.id}
                  </p>
                  {action === 'verify-payment' && (
                    <>
                      <label>
                        {tr('Reviewed payment method')}
                        <input
                          name="method"
                          required
                          maxLength={80}
                          placeholder={tr('Bank transfer / bKash')}
                        />
                      </label>
                      <label>
                        {tr('Unique transaction reference')}
                        <input name="reference" required minLength={3} maxLength={160} />
                      </label>
                      <label>
                        {locale === 'bn' ? 'যাচাই করা মূল্য · টাকা' : 'Verified amount · BDT'}
                        <input
                          name="amountTaka"
                          inputMode="decimal"
                          maxLength={12}
                          required
                          defaultValue={selected ? (selected.amount_minor / 100).toFixed(2) : ''}
                        />
                      </label>
                      <p className={s.muted}>
                        {tr(
                          'Confirm against the actual bank/provider record. Uploaded proof alone is insufficient.',
                        )}
                      </p>
                    </>
                  )}
                  {action === 'confirm' && selected?.payment_status === 'pending' && (
                    <label className={s.checkbox}>
                      <input type="checkbox" name="exception" required />
                      {tr(
                        'I explicitly approve a complimentary/test exception. Payment will remain pending.',
                      )}
                    </label>
                  )}
                  {action === 'activate' && (
                    <p className={s.notice}>
                      {tr(
                        'Only the verified account matching this order\u2019s email receives management access. Ask the customer to sign in first. No external message will be sent.',
                      )}
                    </p>
                  )}
                  {(action === 'suspend' || action === 'revoke') && (
                    <p className={s.error}>
                      {tr(
                        'This customer will lose access to drafts and dashboard commands immediately. Guest publication and existing records remain.',
                      )}
                    </p>
                  )}
                  <label>
                    {tr('Reason / evidence reviewed')}
                    <textarea name="reason" minLength={10} maxLength={1000} required rows={3} />
                  </label>
                </>
              )}
              <button className={`${s.button} ${action === 'revoke' ? s.wine : ''}`} disabled={busy}>
                {busy
                  ? tr('Please wait…')
                  : creating
                    ? tr('Record order')
                    : `${tr('Save')} · ${tr(action ?? '')}`}
              </button>
            </fieldset>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
