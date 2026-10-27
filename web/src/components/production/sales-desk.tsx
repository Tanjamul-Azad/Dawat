'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Clock3, FileText, MessageCircle, Plus, RefreshCw, Info } from 'lucide-react';
import { api } from '@/features/production/client';
import { findTemplate, templates, whatsappLink, type TemplateId } from '@/features/production/catalog';
import type { SalesPage, SalesRequest, SalesCommand, PaymentCommand } from '@/features/production/sales';
import { useProductLocale } from './product-locale';
import { WorkspaceFrame } from './frame';
import { NotifyCustomer } from './notify-customer';
import { displayPhone, whatsappChatUrl } from '@/features/production/phone';
import s from './workspace.module.css';
import c from './sales-desk.module.css';
import { ManualPayment } from '../manual-payment';
import { manualPayment, orderPaymentReference } from '@/features/production/payment';
import { taka, takaFromPaisa } from '@/features/production/money';
import { choiceLabel, packageName, packagePrice, quotePackageName } from '@/features/production/packages';

export function SalesDesk({
  initial,
  email,
  seller = false,
  templateId,
  names,
}: {
  initial: SalesPage;
  email: string;
  seller?: boolean;
  templateId?: string;
  /** Couple names carried over from the public site's name preview (`?names=`). */
  names?: string;
}) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [page, setPage] = useState(initial);
  const [selected, setSelected] = useState<string | null>(initial.requests[0]?.id ?? null);
  // An existing open request is shown first, so a reload never looks like a lost submission.
  const namesNote = names
    ? `${locale === 'bn' ? 'বর-কনের নাম' : 'Couple names'}: ${names}
`
    : '';
  const [creating, setCreating] = useState(
    !seller && (!!names || !initial.requests.some((r) => r.state !== 'cancelled')),
  );
  const [errorAt, setErrorAt] = useState<string | null>(null);
  const [reviewDecision, setReviewDecision] = useState('');
  // Needed to write the customer's page address; known only in the browser.
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);
  const [dirty, setDirty] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [draft, setDraft] = useState<{
    name: string;
    date: string;
    brief: string;
    phone: string;
    template: TemplateId | 'custom';
  } | null>(names ? { name: '', date: '', brief: namesNote, phone: '', template: 'jamdani' } : null);
  const draftKey = `dawat:request-draft:${email}`;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('all');
  const initialTemplate = templateId === 'custom' ? 'custom' : findTemplate(templateId).id;
  const [chosen, setChosen] = useState<TemplateId | 'custom'>(initialTemplate);
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
  useEffect(() => {
    if (seller) return;
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) ?? 'null');
      if (
        saved &&
        typeof saved.name === 'string' &&
        typeof saved.date === 'string' &&
        typeof saved.brief === 'string'
      ) {
        const template =
          saved.template === 'custom' || templates.some((d) => d.id === saved.template)
            ? saved.template
            : initialTemplate;
        setDraft({
          name: saved.name,
          date: saved.date,
          // The names the visitor just typed on the public site win over an older, empty draft.
          brief: saved.brief || namesNote,
          phone: typeof saved.phone === 'string' ? saved.phone : '',
          template,
        });
        setChosen(template);
        setDirty(true);
        setRestoredDraft(true);
        // An unfinished request would otherwise sit hidden behind "New request".
        if (saved.name || saved.date || saved.brief) setCreating(true);
      }
    } catch {
      /* Storage can be unavailable; the form still works without a draft. */
    }
  }, [seller, draftKey, initialTemplate]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function saveDraft(form: HTMLFormElement, template = chosen) {
    const f = new FormData(form);
    const value = {
      name: String(f.get('name') ?? ''),
      date: String(f.get('date') ?? ''),
      brief: String(f.get('brief') ?? ''),
      phone: String(f.get('phone') ?? ''),
      template,
    };
    setDraft(value);
    setDirty(!!(value.name.trim() || value.date || value.brief.trim() || template !== initialTemplate));
    try {
      localStorage.setItem(draftKey, JSON.stringify(value));
    } catch {
      /* Ignore storage failures. */
    }
  }
  function clearDraft() {
    setDirty(false);
    setRestoredDraft(false);
    setDraft(null);
    try {
      localStorage.removeItem(draftKey);
    } catch {
      /* Ignore storage failures. */
    }
  }
  const filtered = page.requests.filter(
    (r) =>
      filter === 'all' ||
      (filter === 'payments'
        ? page.payments.some((p) => p.request_id === r.id && p.state === 'pending')
        : r.state === filter),
  );
  // Details always belong to a row the current filter shows.
  const current = filtered.find((r) => r.id === selected) ?? filtered[0];
  const progress = page.progress.find((p) => p.requestId === current?.id);
  useEffect(() => setReviewDecision(''), [current?.id]);
  const payments = page.payments.filter((p) => p.request_id === current?.id);
  const paymentPending = payments.some((p) => p.state === 'pending');
  const paymentRejected =
    progress?.paymentStatus === 'pending' &&
    progress.status === 'reviewing' &&
    progress.access !== 'active' &&
    !paymentPending &&
    !payments.some((p) => p.state === 'verified') &&
    payments.some((p) => p.state === 'rejected');
  function nextStep(r: SalesRequest) {
    const ours = t('এখন আমাদের পালা', 'Our turn');
    const yours = t('এখন আপনার পালা', 'Your turn');
    const [who, what, more] =
      r.state === 'cancelled'
        ? [t('বাতিল', 'Cancelled'), t('এই অনুরোধ বাতিল হয়েছে।', 'This request was cancelled.'), '']
        : r.state === 'requested'
          ? [
              ours,
              t('আমরা দাম ও শর্ত পাঠাব', 'We will send the price and terms'),
              t(
                'পাঠালে এই পেজেই দেখাবে। জমা দেওয়া হয়ে গেছে, আবার অনুরোধ করার দরকার নেই।',
                'They will appear on this page. Your request is saved; no need to send it again.',
              ),
            ]
          : r.state === 'quoted'
            ? [yours, t('নিচে দাম ও শর্ত পড়ে সম্মতি দিন', 'Review the price and terms below and accept'), '']
            : r.state === 'accepted'
              ? [
                  ours,
                  t('আমরা অর্ডার তৈরি করছি', 'We are creating your order'),
                  t('তারপর পেমেন্টের ধাপ খুলবে।', 'Payment opens next.'),
                ]
              : progress?.access === 'active'
                ? [
                    yours,
                    t('আমার আয়োজন খুলে কার্ড সাজান', 'Open your wedding page and set up your card'),
                    '',
                  ]
                : progress?.paymentStatus === 'manually_verified'
                  ? [ours, t('আমরা আপনার আয়োজনের পাতা চালু করছি', 'We are opening your wedding page'), '']
                  : paymentPending
                    ? [
                        ours,
                        t('আমরা আপনার লেনদেন যাচাই করছি', 'We are checking your transfer'),
                        t('আর টাকা পাঠাবেন না।', 'Do not send money again.'),
                      ]
                    : paymentRejected
                      ? [yours, t('সঠিক Transaction ID দিন', 'Enter the correct Transaction ID'), '']
                      : [
                          yours,
                          t(
                            'bKash-এ টাকা পাঠিয়ে Transaction ID দিন',
                            'Pay through bKash and enter the Transaction ID',
                          ),
                          '',
                        ];
    return (
      <div className={c.nextStep}>
        <span>{who}</span>
        <strong>{what}</strong>
        {more && <p>{more}</p>}
      </div>
    );
  }
  const amount = (n: number) => takaFromPaisa(n, locale);
  const state = (value: string) =>
    ({
      requested: t('দাম ও শর্তের অপেক্ষায়', 'Awaiting price & terms'),
      quoted: t('দাম ও শর্ত এসেছে', 'Price & terms ready'),
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
  async function command(body: SalesCommand | PaymentCommand, payment = false, origin: string | null = null) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setErrorAt(null);
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
      if (body.kind === 'request') clearDraft();
      setFilter('all');
      setReviewDecision('');
      setNotice(
        body.kind === 'request' && result.state === 'quoted'
          ? t(
              'অনুরোধ জমা হয়েছে, আর আপনার দাম ও শর্ত তৈরি। নিচে পড়ে সম্মতি দিন।',
              'Request sent, and your price and terms are ready. Read them below and accept.',
            )
          : body.kind === 'request'
            ? t(
                'অনুরোধ জমা হয়েছে। নিচে এর অবস্থা ও পরের ধাপ দেখুন—এই পেজে যেকোনো সময় ফিরে আসতে পারবেন।',
                'Request sent. Its status and next step are below—you can come back to this page any time.',
              )
            : body.kind === 'accept'
              ? t(
                  'সম্মতি পেয়েছি। এখন নিচের নির্দেশনা মেনে পেমেন্ট করুন।',
                  'Agreed. Now pay using the steps below.',
                )
              : body.kind === 'submit'
                ? t(
                    'লেনদেনের তথ্য জমা হয়েছে। আমরা যাচাই করছি।',
                    'Transaction details sent. We are verifying them.',
                  )
                : t('সংরক্ষিত হয়েছে।', 'Saved.'),
      );
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
      setErrorAt(origin);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  // Errors show beside the button that caused them, so they are seen on a phone.
  const inlineError = (origin: string) =>
    error && errorAt === origin ? (
      <p className={s.error} role="alert">
        {error}
      </p>
    ) : null;
  function formValues(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    return (key: string) => String(f.get(key) ?? '').trim();
  }
  const basic = (r: SalesRequest) => ({ id: r.id, expectedRevision: r.revision });
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
                ? 'দাম ও শর্ত পাঠান, লেনদেন মিলিয়ে দেখুন, তারপর গ্রাহকের আয়োজনের পাতা চালু করুন।'
                : 'নকশা, দাম, পেমেন্ট আর আমার আয়োজন—প্রতিটি ধাপের খবর এখানে।',
              seller
                ? 'Send the price and terms, check the actual transfer, then open the customer’s page.'
                : 'Your design, price, payment and your wedding page—follow every step here.',
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
              {t('অর্ডার ও অ্যাক্সেস চালু', 'Orders & access')}
              <ArrowRight size={15} />
            </a>
          )}
        </div>
      </div>
      {error && !errorAt && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className={s.notice} role="status">
          {notice}
        </p>
      )}
      {!seller && !creating && !notice && templateId && page.requests.length > 0 && (
        <p className={s.notice} role="status">
          {t(
            'আপনার আগের অনুরোধ নিচে আছে। আরেকটি আলাদা অর্ডার চাইলে "নতুন অর্ডার" চাপুন।',
            'Your existing request is below. For a separate order, choose "New request".',
          )}
        </p>
      )}
      {creating && (
        <section className={`${s.panel} ${c.create}`}>
          <div>
            <span className={s.eyebrow}>{t('প্রথম ধাপ', 'STEP ONE')}</span>
            <h2>{t('আয়োজনের কথা জানান', 'Tell us about your celebration')}</h2>
            <p className={s.muted}>
              {t(
                'যে ইমেইলে লগইন করেছেন, সেটাই এই অর্ডারের মালিক হবে। এই ধাপে পেমেন্ট নেওয়া হচ্ছে না।',
                'The email you signed in with owns this order. No payment is taken at this step.',
              )}
            </p>
          </div>
          <form
            className={s.form}
            onSubmit={(e) => {
              const v = formValues(e);
              void command(
                {
                  kind: 'request',
                  name: v('name'),
                  templateId: chosen,
                  eventDate: v('date'),
                  brief: v('brief'),
                  phone: v('phone'),
                },
                false,
                'request',
              );
            }}
          >
            <fieldset className={s.form} disabled={busy}>
              <label>
                {t('আপনার নাম', 'Your name')}
                <input
                  name="name"
                  maxLength={120}
                  required
                  autoComplete="name"
                  value={draft?.name ?? ''}
                  onChange={(e) => saveDraft(e.currentTarget.form!)}
                />
              </label>
              <label>
                {t('WhatsApp নম্বর · ঐচ্ছিক', 'WhatsApp number · optional')}
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={40}
                  placeholder="01XXXXXXXXX"
                  value={draft?.phone ?? ''}
                  onChange={(e) => saveDraft(e.currentTarget.form!)}
                />
                <small className={s.muted}>
                  {t(
                    'পেমেন্ট মিললে বা আপনার পাতা চালু হলে এই নম্বরে WhatsApp-এ জানাব। না দিলেও চলবে।',
                    'We will message this number on WhatsApp when your payment is confirmed or your page opens. You can leave it empty.',
                  )}
                </small>
              </label>
              <label>
                {t('পছন্দের নকশা', 'Selected design')}
                <select
                  value={chosen}
                  onChange={(e) => {
                    const template = e.target.value as typeof chosen;
                    setChosen(template);
                    saveDraft(e.currentTarget.form!, template);
                  }}
                >
                  {templates.map((d) => (
                    <option value={d.id} key={d.id}>
                      {locale === 'bn' ? d.name : d.en} · {packageName(d.id, locale)} ·{' '}
                      {taka(packagePrice(d.id), locale)}
                    </option>
                  ))}
                  <option value="custom">
                    {packageName('custom', locale)} · {taka(packagePrice('custom'), locale)}
                  </option>
                </select>
              </label>
              <label>
                {t('আয়োজনের তারিখ · জানা থাকলে', 'Event date · if known')}
                <input
                  type="date"
                  name="date"
                  value={draft?.date ?? ''}
                  onChange={(e) => saveDraft(e.currentTarget.form!)}
                />
              </label>
              <label>
                {t('আয়োজন ও প্রয়োজনের কথা', 'About your celebration')}
                <textarea
                  name="brief"
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  required
                  value={draft?.brief ?? ''}
                  onChange={(e) => saveDraft(e.currentTarget.form!)}
                  placeholder={t(
                    'অনুষ্ঠান, কতদিন লিংক প্রয়োজন, বিশেষ কোনো ভাবনা…',
                    'Events, how long you need the link, anything special…',
                  )}
                />
              </label>
              {restoredDraft && (
                <p className={s.muted}>
                  {t('আগের অসম্পূর্ণ লেখা ফিরিয়ে আনা হয়েছে।', 'Your unfinished text was restored.')}
                </p>
              )}
              <p className={s.muted}>{email}</p>
              {inlineError('request')}
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
          ['quoted', t('দাম ও শর্ত', 'Price & terms')],
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
                ? 'গ্রাহকের নতুন অনুরোধ এখানে দেখা যাবে।'
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
                aria-pressed={r.id === current?.id}
              >
                <span className={c.reference}>DW-{r.id.slice(-8).toUpperCase()}</span>
                <strong>{r.customer_name}</strong>
                <span>{choiceLabel(r.template_id, locale)}</span>
                <small>{state(r.state)}</small>
                {seller && page.payments.some((p) => p.request_id === r.id && p.state === 'pending') && (
                  <em>{t('পেমেন্ট যাচাই বাকি', 'Payment to check')}</em>
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
                  <p>
                    {current.customer_email}
                    {seller && current.customer_phone && (
                      <>
                        {' · '}
                        <a
                          href={whatsappChatUrl(current.customer_phone, '')}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp {displayPhone(current.customer_phone)}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <span className={c.badge}>{state(current.state)}</span>
              </div>
              <ol className={c.progress}>
                {[
                  t('অনুরোধ', 'Request'),
                  t('সম্মতি', 'Agreement'),
                  t('পেমেন্ট', 'Payment'),
                  t('আমার আয়োজন', 'Your page'),
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
              {!seller && nextStep(current)}
              <div className={c.brief} hidden={current.state === 'ordered'}>
                <strong>
                  {choiceLabel(current.template_id, locale)}
                  {current.event_date && ` · ${current.event_date}`}
                </strong>
                <p>{current.brief}</p>
              </div>
              {current.package_name && current.state === 'ordered' && (
                <details className={c.quoteSummary}>
                  <summary>
                    {t('সম্মত দাম ও শর্ত', 'Agreed price & terms')} · {current.package_name} ·{' '}
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
                  <span className={s.eyebrow}>{t('আপনার দাম ও শর্ত', 'YOUR PRICE & TERMS')}</span>
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
                      key={current.revision}
                      onSubmit={(e) => {
                        e.preventDefault();
                        void command({ kind: 'accept', ...basic(current) }, false, 'accept');
                      }}
                    >
                      <label className={c.consent}>
                        <input type="checkbox" required disabled={busy} />
                        {t(
                          'মূল্য, মেয়াদ ও উপরের শর্ত পড়ে সম্মতি দিচ্ছি।',
                          'I have reviewed and accept the price, term and terms above.',
                        )}
                      </label>
                      {inlineError('accept')}
                      <button className={s.button} disabled={busy}>
                        <Check size={16} />
                        {t('সম্মতি দিন ও পেমেন্টে যান', 'Accept & continue to payment')}
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
                    const price = packagePrice(current.template_id);
                    void command(
                      {
                        kind: 'quote',
                        ...basic(current),
                        packageName: v('package'),
                        amountMinor: price * 100,
                        termDays: Number(v('term')),
                        notes: v('notes'),
                      },
                      false,
                      'quote',
                    );
                  }}
                >
                  <h3>{t('দাম, শর্ত ও নির্দেশনা', 'Price, terms & instructions')}</h3>
                  <fieldset className={s.form} disabled={busy}>
                    <label>
                      {t('প্যাকেজের নাম', 'Package name')}
                      <input
                        name="package"
                        required
                        maxLength={160}
                        defaultValue={current.package_name ?? quotePackageName(current.template_id)}
                      />
                    </label>
                    <div className={s.row}>
                      <label>
                        {t('প্রকাশিত দাম', 'Published price')}
                        <input readOnly value={amount(packagePrice(current.template_id) * 100)} />
                      </label>
                      <label>
                        {t('মেয়াদ · দিন', 'Term · days')}
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
                        'কাজের পরিধি, ডেলিভারি, সংশোধন এবং বাতিল ও টাকা ফেরতের শর্ত',
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
                    {inlineError('quote')}
                    <button className={s.button} disabled={busy}>
                      {t('দাম ও শর্ত পাঠান', 'Send price & terms')}
                    </button>
                  </fieldset>
                </form>
              )}
              {seller && current.state === 'accepted' && (
                <div className={c.quote}>
                  <p>
                    {t(
                      'গ্রাহক এই দাম ও শর্তে রাজি হয়েছেন। একই তথ্য দিয়ে অর্ডার তৈরি হবে। এখনো পেমেন্ট বা অ্যাক্সেস চালু হবে না।',
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
              {current.state === 'ordered' && seller && (
                <div className={c.paymentPaper}>
                  <span className={c.paymentEyebrow}>{t('পেমেন্ট যাচাই', 'PAYMENT REVIEW')}</span>
                  <h3 className={c.paymentTitle}>
                    {progress?.paymentStatus === 'manually_verified' ||
                    payments.some((p) => p.state === 'verified')
                      ? t('পেমেন্ট যাচাই হয়েছে', 'Payment verified')
                      : paymentPending
                        ? t('গ্রাহকের লেনদেন মিলিয়ে দেখুন', "Check the customer's transfer")
                        : t(
                            'গ্রাহকের লেনদেনের তথ্যের অপেক্ষা',
                            "Waiting for the customer's transfer details",
                          )}
                  </h3>
                  <p className={c.paymentIntro}>
                    {t(
                      `bKash অ্যাপে ${amount(current.amount_minor!)}, নিচের TrxID ও প্রেরকের নম্বর মিলিয়ে দেখুন। শুধু আসল লেনদেন দেখলে যাচাই করুন।`,
                      `In the bKash app, match ${amount(current.amount_minor!)}, the TrxID and the sender below. Verify only when you see the actual transfer.`,
                    )}
                  </p>
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
                      {p.state === 'pending' && (
                        <form
                          className={s.form}
                          onSubmit={(e) => {
                            const v = formValues(e);
                            void command(
                              {
                                kind: v('decision') as 'verify' | 'reject',
                                id: p.id,
                                reason: v('reason'),
                                ...(v('decision') === 'verify' && v('activate') === 'on'
                                  ? { activate: true }
                                  : {}),
                              },
                              true,
                              'review',
                            );
                          }}
                        >
                          <fieldset className={s.form} disabled={busy}>
                            <label>
                              {t('সিদ্ধান্ত', 'Decision')}
                              <select
                                name="decision"
                                required
                                value={reviewDecision}
                                onChange={(e) => setReviewDecision(e.target.value)}
                              >
                                <option value="" disabled>
                                  {t('বেছে নিন…', 'Choose…')}
                                </option>
                                <option value="verify">
                                  {t('আসল লেনদেন মিলেছে — যাচাই করুন', 'Actual transfer matched — Verify')}
                                </option>
                                <option value="reject">
                                  {t('মেলেনি — বাতিল করুন', 'Not matched — Reject')}
                                </option>
                              </select>
                            </label>
                            <label>
                              {t(
                                'যাচাইয়ের বিবরণ / গ্রাহককে জানানোর কারণ',
                                'Verification evidence / reason visible to customer',
                              )}
                              <textarea name="reason" minLength={10} maxLength={1000} required rows={2} />
                            </label>
                            {reviewDecision === 'verify' && progress?.status === 'reviewing' && (
                              <label className={c.consent}>
                                <input type="checkbox" name="activate" defaultChecked />
                                {t(
                                  'সঙ্গে সঙ্গে অর্ডার নিশ্চিত করে আয়োজনের পাতা চালু করুন',
                                  'Also confirm the order and open the customer’s page right now',
                                )}
                              </label>
                            )}
                            <label className={c.consent}>
                              <input type="checkbox" required />
                              {t(
                                'bKash অ্যাপে আসল লেনদেন দেখে সিদ্ধান্ত নিচ্ছি।',
                                'I checked the actual transfer in the bKash app.',
                              )}
                            </label>
                            {inlineError('review')}
                            <button className={s.button} disabled={busy}>
                              {t('সিদ্ধান্ত সংরক্ষণ করুন', 'Save review decision')}
                            </button>
                          </fieldset>
                        </form>
                      )}
                    </div>
                  ))}
                  {current.order_id && (
                    <a className={s.button} href={`/admin/orders/?order=${current.order_id}`}>
                      {t(
                        'এই অর্ডার নিশ্চিত করে আয়োজনের পাতা চালু করুন',
                        'Confirm this order & open the wedding page',
                      )}
                      <ArrowRight size={16} />
                    </a>
                  )}
                </div>
              )}
              {current.state === 'ordered' &&
                seller &&
                origin &&
                progress?.access === 'active' &&
                progress.weddingId && (
                  <NotifyCustomer
                    name={current.customer_name}
                    email={current.customer_email}
                    phone={current.customer_phone}
                    url={`${origin}/weddings/${progress.weddingId}/`}
                  />
                )}
              {current.state === 'ordered' && !seller && (
                <div className={c.paymentPaper}>
                  <span className={c.paymentEyebrow}>{t('পেমেন্ট', 'PAYMENT')}</span>
                  <h3 className={c.paymentTitle}>
                    {progress?.paymentStatus === 'manually_verified'
                      ? t('পেমেন্ট ও আমার আয়োজন', 'Payment & your wedding page')
                      : paymentPending
                        ? t('আপনার লেনদেন যাচাই হচ্ছে', 'Your transfer is being checked')
                        : paymentRejected
                          ? t('লেনদেনের তথ্য মেলেনি', 'Transfer details did not match')
                          : t('পেমেন্টের নির্দেশনা', 'Payment instructions')}
                  </h3>
                  {paymentPending && (
                    <p className={s.notice}>
                      <Clock3 size={16} />
                      {t(
                        'লেনদেনের তথ্য পেয়েছি—যাচাই চলছে। আর টাকা পাঠাবেন না; যাচাই হলে এখানেই জানতে পারবেন।',
                        'Your transaction details are received and being checked. Do not send money again; the result will show here.',
                      )}
                    </p>
                  )}
                  {paymentRejected && (
                    <p className={s.error}>
                      {t(
                        'আগে টাকা পাঠিয়ে থাকলে আবার পাঠাবেন না। bKash SMS থেকে সঠিক Transaction ID ও প্রেরকের নম্বর আবার দিন। সমস্যা হলে নিচের পেমেন্ট সহায়তায় যোগাযোগ করুন।',
                        'If you already sent the money, do not send it again. Enter the correct Transaction ID and sender number from your bKash SMS. Contact payment help below if unsure.',
                      )}
                    </p>
                  )}
                  {progress?.status === 'reviewing' &&
                    progress.paymentStatus === 'pending' &&
                    !paymentPending &&
                    (paymentRejected ? (
                      <details>
                        <summary>
                          {t('এখনো টাকা পাঠাননি? নির্দেশনা দেখুন', 'Not sent yet? See how to pay')}
                        </summary>
                        <ManualPayment embedded requestId={current.id} amountMinor={current.amount_minor!} />
                      </details>
                    ) : (
                      <>
                        <p className={c.paymentIntro}>
                          {t(
                            'নিচের নির্দেশনা অনুযায়ী বিকাশে Send Money করুন, তারপর লেনদেনের তথ্য দিন।',
                            'Send Money through bKash as shown below, then enter the transfer details.',
                          )}
                        </p>
                        <ManualPayment embedded requestId={current.id} amountMinor={current.amount_minor!} />
                      </>
                    ))}
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
                    </div>
                  ))}
                  {!seller &&
                    progress?.paymentStatus === 'pending' &&
                    progress.status === 'reviewing' &&
                    !paymentPending && (
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
                            'payment',
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
                              'তথ্য জমা দিলেই পেমেন্ট নিশ্চিত হয় না। আমরা আসল লেনদেন মিলিয়ে দেখব।',
                              'Submission is not payment confirmation. We will verify the actual transfer.',
                            )}
                          </p>
                          {inlineError('payment')}
                          <button className={s.button} disabled={busy}>
                            {t('যাচাইয়ের জন্য জমা দিন', 'Submit for verification')}
                            <ArrowRight size={17} />
                          </button>
                          <div className={c.paymentReassurance}>
                            <Info size={23} />
                            <div>
                              <strong>
                                {t(
                                  'যাচাইয়ের পর আপনার আয়োজনের পাতা চালু হবে',
                                  'Your wedding page opens after we check the payment',
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
                  {progress?.paymentStatus === 'manually_verified' && (
                    <p className={s.notice}>
                      {t('পেমেন্ট যাচাই হয়েছে।', 'Payment verified.')}{' '}
                      {progress.access !== 'active' &&
                        t(
                          'আমরা এখন আপনার আয়োজনের পাতা চালু করছি। চালু হলে এখানে বোতাম আসবে।',
                          'We are now opening your wedding page; a button will appear here.',
                        )}
                    </p>
                  )}
                  {progress?.access === 'active' && progress.weddingId && (
                    <a className={s.button} href={`/weddings/${progress.weddingId}/`}>
                      {t('আমার আয়োজন খুলুন', 'Open your wedding page')}
                      <ArrowRight size={16} />
                    </a>
                  )}
                  <a
                    className={c.paymentHelp}
                    href={whatsappLink(`অর্ডার ${orderPaymentReference(current.id)} নিয়ে সাহায্য চাই।`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={15} />
                    {t('পেমেন্ট সহায়তা', 'Payment help')}
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
