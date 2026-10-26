'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Clock3, FileText, MessageCircle, Plus, RefreshCw, Info } from 'lucide-react';
import { api } from '@/features/production/client';
import {
  findTemplate,
  templates,
  prices,
  whatsappLink,
  type TemplateId,
} from '@/features/production/catalog';
import type { SalesPage, SalesRequest, SalesCommand, PaymentCommand } from '@/features/production/sales';
import { useProductLocale } from './product-locale';
import { WorkspaceFrame } from './frame';
import s from './workspace.module.css';
import c from './sales-desk.module.css';
import { ManualPayment } from '../manual-payment';
import { manualPayment, orderPaymentReference } from '@/features/production/payment';

export function SalesDesk({
  initial,
  email,
  seller = false,
  templateId,
}: {
  initial: SalesPage;
  email: string;
  seller?: boolean;
  templateId?: string;
}) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [page, setPage] = useState(initial);
  const [selected, setSelected] = useState<string | null>(initial.requests[0]?.id ?? null);
  const [creating, setCreating] = useState(!seller && (!!templateId || !initial.requests.length));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const [chosen, setChosen] = useState<TemplateId | 'custom'>(
    templateId === 'custom' ? 'custom' : findTemplate(templateId).id,
  );
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const attempt = useRef<{ signature: string; key: string } | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    let disposed = false;
    let pending = false;
    const sync = async () => {
      if (disposed || pending || lock.current || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const cursor = cursors.at(-1);
        const data = await api<SalesPage>(
          `${seller ? '/api/admin/requests/' : '/api/sales/'}${cursor ? '?cursor=' + encodeURIComponent(cursor) : ''}`,
        );
        if (!disposed && !lock.current) setPage(data);
      } catch {
        /* Keep the last confirmed state; explicit refresh reports errors. */
      } finally {
        pending = false;
      }
    };
    const timer = setInterval(() => void sync(), 20000);
    const focus = () => void sync();
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', focus);
    return () => {
      disposed = true;
      clearInterval(timer);
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', focus);
    };
  }, [seller, cursors, busy]);
  const current = page.requests.find((r) => r.id === selected);
  const progress = page.progress.find((p) => p.requestId === selected);
  const payments = page.payments.filter((p) => p.request_id === selected);
  const amount = (n: number) =>
    new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 2,
    }).format(n / 100);
  const state = (value: string) =>
    ({
      requested: t('কোটেশনের অপেক্ষায়', 'Awaiting quote'),
      quoted: t('কোটেশন এসেছে', 'Quote ready'),
      accepted: t('সম্মতি দেওয়া হয়েছে', 'Accepted'),
      ordered: t('অর্ডার তৈরি', 'Order placed'),
      cancelled: t('বাতিল', 'Cancelled'),
      pending: t('যাচাইয়ের অপেক্ষায়', 'Awaiting verification'),
      verified: t('যাচাই হয়েছে', 'Verified'),
      rejected: t('আবার দেখুন', 'Needs attention'),
    })[value] ?? value;
  async function refresh(cursor?: string) {
    const data = await api<SalesPage>(
      `${seller ? '/api/admin/requests/' : '/api/sales/'}${cursor ? '?cursor=' + encodeURIComponent(cursor) : ''}`,
    );
    setPage(data);
    setSelected((id) => (data.requests.some((r) => r.id === id) ? id : (data.requests[0]?.id ?? null)));
  }
  async function reload(cursor?: string, trail: (string | undefined)[] = [undefined]) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await refresh(cursor);
      setCursors(trail);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  async function command(body: SalesCommand | PaymentCommand, payment = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    const signature = JSON.stringify({ body, payment });
    if (attempt.current?.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() };
    try {
      const result = await api<SalesRequest>(payment ? '/api/sales/payments/' : '/api/sales/', {
        method: 'POST',
        body,
        key: attempt.current.key,
      });
      attempt.current = null;
      setCreating(false);
      if (!payment) setSelected(result.id);
      setNotice(t('সফলভাবে সংরক্ষিত হয়েছে।', 'Saved successfully.'));
      try {
        await refresh();
        setCursors([undefined]);
      } catch {
        setError(
          t(
            'পরিবর্তন সংরক্ষিত হয়েছে, তবে তালিকা লোড হয়নি। আবার জমা না দিয়ে রিফ্রেশ করুন।',
            'Saved, but the list could not refresh. Refresh rather than submitting again.',
          ),
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  function formValues(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    return (key: string) => String(f.get(key) ?? '').trim();
  }
  const basic = (r: SalesRequest) => ({ id: r.id, expectedRevision: r.revision });
  const filtered = page.requests.filter(
    (r) =>
      filter === 'all' ||
      (filter === 'payments'
        ? page.payments.some((p) => p.request_id === r.id && p.state === 'pending')
        : r.state === filter),
  );
  return (
    <WorkspaceFrame email={email} seller={seller} section="requests">
      <div className={s.intro}>
        <div>
          <p className={s.eyebrow}>
            {t(
              seller ? 'দাওয়াত · বিক্রয় ও সেবা' : 'আপনার আয়োজনের শুরু',
              seller ? 'DAWAT · SALES & SERVICE' : 'YOUR CELEBRATION STARTS HERE',
            )}
          </p>
          <h1>
            {t(
              seller ? 'অনুরোধ থেকে আমন্ত্রণ।' : 'আপনার অর্ডার, এক জায়গায়।',
              seller ? 'From enquiry to invitation.' : 'Your order, all together.',
            )}
          </h1>
          <p>
            {t(
              seller
                ? 'কোটেশন দিন, লেনদেন মিলিয়ে দেখুন, তারপর গ্রাহকের পোর্টাল চালু করুন।'
                : 'নকশা, সম্মত মূল্য, পেমেন্ট ও পোর্টাল—প্রতিটি ধাপের খবর এখানে।',
              seller
                ? 'Quote, check the actual transfer, then activate the customer portal.'
                : 'Your design, agreed price, payment and portal—follow every step here.',
            )}
          </p>
        </div>
        <div className={s.actions}>
          <button className={s.secondary} disabled={busy} onClick={() => void reload()}>
            <RefreshCw size={15} />
            {t('রিফ্রেশ', 'Refresh')}
          </button>
          {!seller && (
            <button className={s.button} disabled={busy} onClick={() => setCreating(!creating)}>
              <Plus size={16} />
              {t('নতুন অর্ডার', 'New request')}
            </button>
          )}
          {seller && (
            <a className={s.button} href="/admin/orders/">
              {t('অর্ডার ও activation', 'Orders & activation')}
              <ArrowRight size={15} />
            </a>
          )}
        </div>
      </div>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className={s.notice} role="status">
          {notice}
        </p>
      )}
      {creating && (
        <section className={`${s.panel} ${c.create}`}>
          <div>
            <span className={s.eyebrow}>{t('প্রথম ধাপ', 'STEP ONE')}</span>
            <h2>{t('আয়োজনের কথা জানান', 'Tell us about your celebration')}</h2>
            <p className={s.muted}>
              {t(
                'আপনার verified ইমেইল এই অর্ডারের মালিক থাকবে। এই ধাপে পেমেন্ট নেওয়া হচ্ছে না।',
                'Your verified email owns this order. No payment is taken at this step.',
              )}
            </p>
          </div>
          <form
            className={s.form}
            onSubmit={(e) => {
              const v = formValues(e);
              void command({
                kind: 'request',
                name: v('name'),
                templateId: chosen,
                eventDate: v('date'),
                brief: v('brief'),
              });
            }}
          >
            <fieldset className={s.form} disabled={busy}>
              <label>
                {t('আপনার নাম', 'Your name')}
                <input name="name" maxLength={120} required autoComplete="name" />
              </label>
              <label>
                {t('পছন্দের নকশা', 'Selected design')}
                <select value={chosen} onChange={(e) => setChosen(e.target.value as typeof chosen)}>
                  {templates.map((d) => (
                    <option value={d.id} key={d.id}>
                      {locale === 'bn' ? d.name : d.en} · ৳{prices[d.tier]}
                    </option>
                  ))}
                  <option value="custom">Customized · ৳1500</option>
                </select>
              </label>
              <label>
                {t('আয়োজনের তারিখ · জানা থাকলে', 'Event date · if known')}
                <input type="date" name="date" />
              </label>
              <label>
                {t('আয়োজন ও প্রয়োজনের কথা', 'About your celebration')}
                <textarea
                  name="brief"
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  required
                  placeholder={t(
                    'অনুষ্ঠান, কতদিন লিংক প্রয়োজন, বিশেষ কোনো ভাবনা…',
                    'Events, how long you need the link, anything special…',
                  )}
                />
              </label>
              <p className={s.muted}>{email}</p>
              <button className={s.button} disabled={busy}>
                {busy ? t('সংরক্ষণ হচ্ছে…', 'Saving…') : t('অর্ডারের অনুরোধ পাঠান', 'Send your request')}
                <ArrowRight size={16} />
              </button>
            </fieldset>
          </form>
        </section>
      )}
      <div className={c.tabs} role="group" aria-label={t('অনুরোধ ফিল্টার', 'Filter requests')}>
        {[
          ['all', t('সব', 'All')],
          ['requested', t('নতুন', 'New')],
          ['quoted', t('কোটেশন', 'Quoted')],
          ['accepted', t('গ্রহণ করা', 'Accepted')],
          ['payments', t('পেমেন্ট যাচাই', 'Payment review')],
          ['ordered', t('অর্ডার', 'Ordered')],
        ].map(([id, title]) => (
          <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {title}
          </button>
        ))}
      </div>
      {!page.requests.length ? (
        <section className={s.panel}>
          <FileText size={30} />
          <h2>{t('এখনো কোনো অনুরোধ নেই', 'No requests yet')}</h2>
          <p className={s.muted}>
            {t(
              seller
                ? 'নতুন customer request এখানে দেখা যাবে।'
                : 'পছন্দের নকশা বেছে প্রথম অনুরোধটি তৈরি করুন।',
              seller
                ? 'New customer requests will appear here.'
                : 'Choose your design and send your first request.',
            )}
          </p>
        </section>
      ) : (
        <div className={c.layout}>
          <aside className={c.list} aria-label={t('অনুরোধসমূহ', 'Requests')}>
            {!filtered.length && <p>{t('এই পৃষ্ঠায় কোনো মিল নেই।', 'No matches on this page.')}</p>}
            {filtered.map((r) => (
              <button
                key={r.id}
                disabled={busy}
                onClick={() => {
                  setSelected(r.id);
                  setCreating(false);
                  setError('');
                  setNotice('');
                }}
                aria-pressed={r.id === selected}
              >
                <span className={c.reference}>DW-{r.id.slice(-8).toUpperCase()}</span>
                <strong>{r.customer_name}</strong>
                <span>
                  {r.template_id === 'custom'
                    ? 'Customized'
                    : locale === 'bn'
                      ? findTemplate(r.template_id).name
                      : findTemplate(r.template_id).en}
                </span>
                <small>{state(r.state)}</small>
                {seller && page.payments.some((p) => p.request_id === r.id && p.state === 'pending') && (
                  <em>{t('পেমেন্ট অপেক্ষমাণ', 'Payment pending')}</em>
                )}
              </button>
            ))}
            {(page.nextCursor || cursors.length > 1) && (
              <div className={s.actions}>
                <button
                  className={s.secondary}
                  disabled={busy || cursors.length < 2}
                  onClick={() => void reload(cursors[cursors.length - 2], cursors.slice(0, -1))}
                >
                  {t('আগের', 'Previous')}
                </button>
                <button
                  className={s.secondary}
                  disabled={busy || !page.nextCursor}
                  onClick={() => void reload(page.nextCursor!, [...cursors, page.nextCursor!])}
                >
                  {t('পরের', 'Next')}
                </button>
              </div>
            )}
          </aside>
          {current && (
            <section key={current.id} className={`${s.panel} ${c.detail}`}>
              <div className={c.detailHeader}>
                <div>
                  <span className={s.eyebrow}>DW-{current.id.slice(-8).toUpperCase()}</span>
                  <h2>{current.customer_name}</h2>
                  <p>{current.customer_email}</p>
                </div>
                <span className={c.badge}>{state(current.state)}</span>
              </div>
              <ol className={c.progress}>
                {[
                  t('অনুরোধ', 'Request'),
                  t('সম্মতি', 'Agreement'),
                  t('পেমেন্ট', 'Payment'),
                  t('পোর্টাল', 'Portal'),
                ].map((label, i) => (
                  <li
                    key={label}
                    data-done={
                      i === 0 ||
                      (i === 1 && ['accepted', 'ordered'].includes(current.state)) ||
                      (i === 2 && progress?.paymentStatus === 'manually_verified') ||
                      (i === 3 && progress?.access === 'active')
                    }
                  >
                    <span>{i + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>
              <div className={c.brief} hidden={current.state === 'ordered'}>
                <strong>
                  {current.template_id === 'custom'
                    ? 'Customized'
                    : locale === 'bn'
                      ? findTemplate(current.template_id).name
                      : findTemplate(current.template_id).en}
                  {current.event_date && ` · ${current.event_date}`}
                </strong>
                <p>{current.brief}</p>
              </div>
              {current.package_name && current.state === 'ordered' && (
                <details className={c.quoteSummary}>
                  <summary>
                    {t('সম্মত কোটেশন', 'Agreed quote')} · {current.package_name} ·{' '}
                    {amount(current.amount_minor!)}
                  </summary>
                  <p>
                    {current.term_days} {t('দিন · প্রথম প্রকাশ থেকে', 'days · from first publication')}
                  </p>
                  <p className={c.prewrap}>{current.quote_notes}</p>
                  <p>{current.brief}</p>
                </details>
              )}
              {current.package_name && current.state !== 'ordered' && (
                <div className={c.quote}>
                  <span className={s.eyebrow}>{t('আপনার কোটেশন', 'YOUR QUOTE')}</span>
                  <h3>{current.package_name}</h3>
                  <div className={c.quotePrice}>
                    <strong>{amount(current.amount_minor!)}</strong>
                    <span>
                      {current.term_days} {t('দিন · প্রথম প্রকাশ থেকে', 'days · from first publication')}
                    </span>
                  </div>
                  <p className={c.prewrap}>{current.quote_notes}</p>
                  {!seller && current.state === 'quoted' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void command({ kind: 'accept', ...basic(current) });
                      }}
                    >
                      <label className={c.consent}>
                        <input type="checkbox" required disabled={busy} />
                        {t(
                          'মূল্য, মেয়াদ ও উপরের শর্ত পড়ে সম্মতি দিচ্ছি।',
                          'I have reviewed and accept the price, term and terms above.',
                        )}
                      </label>
                      <button className={s.button} disabled={busy}>
                        <Check size={16} />
                        {t('কোটেশন গ্রহণ করুন', 'Accept quote')}
                      </button>
                    </form>
                  )}
                </div>
              )}
              {seller && ['requested', 'quoted'].includes(current.state) && (
                <form
                  className={s.form}
                  onSubmit={(e) => {
                    const v = formValues(e);
                    const price =
                      current.template_id === 'custom'
                        ? 1500
                        : prices[findTemplate(current.template_id).tier];
                    void command({
                      kind: 'quote',
                      ...basic(current),
                      packageName: v('package'),
                      amountMinor: price * 100,
                      termDays: Number(v('term')),
                      notes: v('notes'),
                    });
                  }}
                >
                  <h3>{t('কোটেশন ও নির্দেশনা', 'Quote & instructions')}</h3>
                  <fieldset className={s.form} disabled={busy}>
                    <label>
                      {t('প্যাকেজের নাম', 'Package name')}
                      <input
                        name="package"
                        required
                        maxLength={160}
                        defaultValue={
                          current.package_name ??
                          `${current.template_id === 'custom' ? 'Customized' : findTemplate(current.template_id).en} · Dawat`
                        }
                      />
                    </label>
                    <div className={s.row}>
                      <label>
                        {t('নির্ধারিত মূল্য', 'Published price')}
                        <input
                          readOnly
                          value={amount(
                            (current.template_id === 'custom'
                              ? 1500
                              : prices[findTemplate(current.template_id).tier]) * 100,
                          )}
                        />
                      </label>
                      <label>
                        {t('সম্মত hosting মেয়াদ · দিন', 'Agreed hosting term · days')}
                        <input
                          name="term"
                          type="number"
                          min={1}
                          max={3650}
                          required
                          defaultValue={current.term_days ?? ''}
                        />
                      </label>
                    </div>
                    <label>
                      {t(
                        'কাজের পরিধি, delivery, সংশোধন ও cancellation/refund শর্ত',
                        'Scope, delivery, revisions & cancellation/refund terms',
                      )}
                      <textarea
                        name="notes"
                        minLength={10}
                        maxLength={3000}
                        rows={6}
                        required
                        defaultValue={current.quote_notes ?? ''}
                        placeholder={t(
                          'সম্মত কাজ ও শর্ত স্পষ্ট লিখুন। bKash নম্বর ও payment reference গ্রাহক স্বয়ংক্রিয়ভাবে দেখতে পাবেন।',
                          'State the agreed scope and terms clearly. The customer will see the bKash number and payment reference automatically.',
                        )}
                      />
                    </label>
                    <button className={s.button} disabled={busy}>
                      {t('কোটেশন সংরক্ষণ করুন', 'Save quote')}
                    </button>
                  </fieldset>
                </form>
              )}
              {seller && current.state === 'accepted' && (
                <div className={c.quote}>
                  <p>
                    {t(
                      'গ্রাহক এই মূল্য ও শর্ত গ্রহণ করেছেন। একই তথ্য দিয়ে অর্ডার তৈরি হবে; এখনো paid বা active হবে না।',
                      'The customer accepted these terms. The order will retain them; it will not be marked paid or active.',
                    )}
                  </p>
                  <button
                    className={s.button}
                    disabled={busy}
                    onClick={() => void command({ kind: 'convert', ...basic(current) })}
                  >
                    {t('অর্ডার তৈরি করুন', 'Create order')}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
              {!seller && current.state === 'accepted' && (
                <p className={s.notice}>
                  <Clock3 size={16} />
                  {t(
                    'আপনার সম্মতি পাওয়া গেছে। টিম অর্ডার তৈরি করলে পেমেন্টের ধাপ এখানে খুলবে।',
                    'Your agreement is saved. Payment submission opens here when the team creates the order.',
                  )}
                </p>
              )}
              {current.state === 'ordered' && (
                <div className={c.paymentPaper}>
                  <span className={c.paymentEyebrow}>ORDER DETAILS</span>
                  <h3 className={c.paymentTitle}>
                    {progress?.paymentStatus === 'manually_verified'
                      ? t('পেমেন্ট ও পোর্টাল', 'Payment & portal')
                      : t('পেমেন্টের নির্দেশনা', 'Payment instructions')}
                  </h3>
                  {progress?.paymentStatus !== 'manually_verified' && (
                    <p className={c.paymentIntro}>
                      {t(
                        'আপনার অর্ডারের জন্য নিচের নির্দেশনা অনুযায়ী বিকাশে ম্যানুয়াল পেমেন্ট করুন।',
                        'Follow the instructions below to pay for your order through bKash.',
                      )}
                    </p>
                  )}
                  {progress?.status === 'reviewing' &&
                    progress.paymentStatus === 'pending' &&
                    !payments.some((p) => p.state === 'pending') && (
                      <ManualPayment embedded requestId={current.id} amountMinor={current.amount_minor!} />
                    )}
                  {!seller && payments.some((p) => p.state === 'pending') && (
                    <p className={s.notice}>
                      {t(
                        'লেনদেনের তথ্য পেয়েছি—যাচাই চলছে। একই পেমেন্টের জন্য আবার টাকা পাঠাবেন না।',
                        'Your transaction details are received and awaiting review. Do not send the same payment again.',
                      )}
                    </p>
                  )}
                  {payments.map((p) => (
                    <div className={c.payment} key={p.id}>
                      <div>
                        <strong>
                          {p.method} · {p.reference}
                        </strong>
                        <span>
                          {state(p.state)} · {amount(p.amount_minor)}
                        </span>
                      </div>
                      <p>
                        {t('প্রেরক:', 'Sender:')} {p.sender}
                      </p>
                      {p.review_note && <p className={c.prewrap}>{p.review_note}</p>}
                      {seller && p.state === 'pending' && (
                        <form
                          className={s.form}
                          onSubmit={(e) => {
                            const v = formValues(e);
                            void command(
                              { kind: v('decision') as 'verify' | 'reject', id: p.id, reason: v('reason') },
                              true,
                            );
                          }}
                        >
                          <fieldset className={s.form} disabled={busy}>
                            <label>
                              {t('সিদ্ধান্ত', 'Decision')}
                              <select name="decision">
                                <option value="verify">
                                  {t('আসল লেনদেন মিলেছে — Verify', 'Actual transfer matched — Verify')}
                                </option>
                                <option value="reject">{t('মেলেনি — Reject', 'Not matched — Reject')}</option>
                              </select>
                            </label>
                            <label>
                              {t(
                                'যাচাইয়ের বিবরণ / গ্রাহককে জানানোর কারণ',
                                'Verification evidence / reason visible to customer',
                              )}
                              <textarea name="reason" minLength={10} maxLength={1000} required rows={2} />
                            </label>
                            <label className={c.consent}>
                              <input type="checkbox" required />
                              {t(
                                'প্রদানকারীর আসল transaction record দেখে সিদ্ধান্ত নিচ্ছি।',
                                'I checked the actual provider transaction record.',
                              )}
                            </label>
                            <button className={s.button} disabled={busy}>
                              {t('সিদ্ধান্ত সংরক্ষণ করুন', 'Save review decision')}
                            </button>
                          </fieldset>
                        </form>
                      )}
                    </div>
                  ))}
                  {!seller &&
                    progress?.paymentStatus === 'pending' &&
                    progress.status === 'reviewing' &&
                    !payments.some((p) => p.state === 'pending') && (
                      <form
                        className={`${s.form} ${c.paymentForm}`}
                        onSubmit={(e) => {
                          const v = formValues(e);
                          void command(
                            {
                              kind: 'submit',
                              requestId: current.id,
                              method: manualPayment.method,
                              reference: v('reference'),
                              sender: v('sender'),
                            },
                            true,
                          );
                        }}
                      >
                        <fieldset className={`${s.form} ${c.paymentFields}`} disabled={busy}>
                          <h3>{t('পেমেন্টের তথ্য দিন', 'Your payment details')}</h3>
                          <label>
                            {t('যে বিকাশ নম্বর থেকে পাঠিয়েছেন', 'Sender bKash number')}
                            <input
                              name="sender"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              minLength={11}
                              maxLength={20}
                              placeholder="01XXXXXXXXX"
                              required
                            />
                          </label>
                          <label>
                            Transaction ID
                            <input
                              name="reference"
                              minLength={3}
                              maxLength={80}
                              required
                              autoCapitalize="characters"
                              autoComplete="off"
                              spellCheck={false}
                              dir="ltr"
                              placeholder={t('সফল লেনদেনের TrxID', 'TrxID from the successful transfer')}
                            />
                          </label>
                          <p className={s.muted}>
                            {t(
                              `সফল বিকাশ লেনদেনের TrxID লিখুন। ${orderPaymentReference(current.id)} অর্ডারের reference; এটি Transaction ID নয়।`,
                              `Use the successful bKash transfer’s TrxID. ${orderPaymentReference(current.id)} is your order reference, not the transaction ID.`,
                            )}
                          </p>
                          <p className={s.muted}>
                            {t(
                              'জমা দেওয়া মানে paid হওয়া নয়। আমরা আসল লেনদেন মিলিয়ে দেখব।',
                              'Submission is not payment confirmation. We will verify the actual transfer.',
                            )}
                          </p>
                          <button className={s.button} disabled={busy}>
                            {t('যাচাইয়ের জন্য জমা দিন', 'Submit for verification')}
                            <ArrowRight size={17} />
                          </button>
                          <div className={c.paymentReassurance}>
                            <Info size={23} />
                            <div>
                              <strong>
                                {t(
                                  'ম্যানুয়াল যাচাইয়ের পর আপনার পোর্টাল অ্যাক্টিভ করা হবে',
                                  'Your portal opens after manual verification',
                                )}
                              </strong>
                              <p>
                                {t(
                                  'আমাদের টিম লেনদেন মিলিয়ে যাচাই করবে। অর্ডারের অবস্থা এখান থেকেই দেখতে পারবেন।',
                                  'Our team will match the actual transfer. Follow the order status here.',
                                )}
                              </p>
                            </div>
                          </div>
                        </fieldset>
                      </form>
                    )}
                  {!seller && progress?.paymentStatus === 'manually_verified' && (
                    <p className={s.notice}>
                      {t('পেমেন্ট যাচাই হয়েছে।', 'Payment verified.')}{' '}
                      {progress.access !== 'active' &&
                        t('পোর্টাল activation-এর খবর এখানেই পাবেন।', 'Portal activation will appear here.')}
                    </p>
                  )}
                  {progress?.access === 'active' && progress.weddingId && (
                    <a className={s.button} href={`/weddings/${progress.weddingId}/`}>
                      {t('আপনার পোর্টাল খুলুন', 'Open your portal')}
                      <ArrowRight size={16} />
                    </a>
                  )}
                  {seller && (
                    <a className={s.button} href="/admin/orders/">
                      {t('অর্ডার confirm ও portal activate করুন', 'Confirm order & activate portal')}
                      <ArrowRight size={16} />
                    </a>
                  )}
                  <a
                    className={c.paymentHelp}
                    href={whatsappLink(`অর্ডার ${orderPaymentReference(current.id)} নিয়ে সাহায্য চাই।`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={15} />
                    {t('পেমেন্ট সহায়তা', 'Payment help')}
                  </a>
                </div>
              )}
              {!seller && ['requested', 'quoted'].includes(current.state) && (
                <details className={c.cancel}>
                  <summary>{t('অনুরোধ বাতিল করতে চান?', 'Cancel this request?')}</summary>
                  <p>
                    {t(
                      'এই অনুরোধ আর এগোবে না। পরে নতুন অনুরোধ করা যাবে।',
                      'This request will be closed. You can create a new one later.',
                    )}
                  </p>
                  <button
                    className={s.secondary}
                    disabled={busy}
                    onClick={() => void command({ kind: 'cancel', ...basic(current) })}
                  >
                    {t('হ্যাঁ, বাতিল করুন', 'Yes, cancel request')}
                  </button>
                </details>
              )}
            </section>
          )}
        </div>
      )}
    </WorkspaceFrame>
  );
}
