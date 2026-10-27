'use client';
import { useProductLocale } from './product-locale';
import { useState, useEffect } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { api, RequestError } from '@/features/production/client';
import { safeReturnPath } from '@/features/production/navigation';
import s from './workspace.module.css';
import { latinDigits } from '@/features/production/copy';
import { BrandLockup } from '../brand-mark';
import { findTemplate, prices } from '@/features/production/catalog';
import { taka } from '@/features/production/money';
function LoginStory() {
  const { locale } = useProductLocale();
  return (
    <div className={s.loginStory} aria-hidden="true">
      <h2>
        {locale === 'bn' ? (
          <>
            আপনার আমন্ত্রণ
            <br />
            সবসময় আপনার সঙ্গে
          </>
        ) : (
          <>
            Your invitation.
            <br />
            Always with you.
          </>
        )}
      </h2>
      <p>{locale === 'bn' ? 'ভালোবাসার আয়োজন, যত্নে সাজানো।' : 'A celebration arranged with care.'}</p>
    </div>
  );
}
// When sign-in starts from an order, say what is being ordered and why the email is checked.
function OrderContext({ next }: { next: string }) {
  const { locale } = useProductLocale();
  const id = /^\/order\/requests\/?\?template=([a-z]+)$/.exec(next)?.[1];
  if (!id) return null;
  const custom = id === 'custom';
  const design = findTemplate(id);
  const name = custom ? 'Customized' : locale === 'bn' ? design.name : design.en;
  const price = taka(custom ? 1500 : prices[design.tier], locale);
  return (
    <div className={s.panel} role="note" style={{ display: 'grid', gap: 6 }}>
      <p className={s.eyebrow}>{locale === 'bn' ? 'আপনার অর্ডার' : 'YOUR ORDER'}</p>
      <p>
        <strong>
          {name} · {price}
        </strong>
      </p>
      <p className={s.muted}>
        {locale === 'bn'
          ? 'অর্ডারটি আপনার ইমেইলে থাকবে, তাই একবার ইমেইল যাচাই করছি। কোড দেওয়ার পর সরাসরি অর্ডারের পেজে যাবেন।'
          : 'Your order belongs to your email, so we check it once. After the code you go straight to your order.'}
      </p>
    </div>
  );
}
export function Login({ next, available = true }: { next: string; available?: boolean }) {
  const { tr, locale, setLocale } = useProductLocale();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const tick = () => setSeconds(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    tick();
    if (retryAt <= Date.now()) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || (!sent && retryAt > Date.now())) return;
    setBusy(true);
    setError('');
    try {
      if (!sent) {
        await api('/api/auth/login/', { method: 'POST', body: { email: email.trim() } });
        setSent(true);
        setRetryAt(Date.now() + 60_000);
      } else {
        await api('/api/auth/verify/', { method: 'POST', body: { email: email.trim(), token } });
        window.location.assign(safeReturnPath(next));
      }
    } catch (e) {
      if (e instanceof RequestError && e.status === 429) setRetryAt(Date.now() + (e.retryAfter || 60) * 1000);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.shell}>
      <main className={s.login}>
        <LoginStory />
        <div className={s.loginHeader}>
          <a href="/" className={s.brand}>
            <BrandLockup locale={locale} size={37} />
          </a>
          <button className={s.quiet} onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}>
            {locale === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
        <p className={s.eyebrow}>{tr('A place for your celebration')}</p>
        <h1>
          {tr('Welcome to your')}
          <br />
          {tr('wedding workspace.')}
        </h1>
        <p>
          {locale === 'bn'
            ? 'ইমেইল যাচাই করে আপনার আমন্ত্রণের কাজ শুরু করুন।'
            : 'Verify your email to start working on your invitation.'}
        </p>
        <OrderContext next={next} />
        <div className={s.panel}>
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          {!available ? (
            <p role="status">
              {tr(
                'Email sign-in is being prepared. Please contact your seller before trying to access a customer workspace. \u0987\u09AE\u09C7\u0987\u09B2 \u09B8\u09BE\u0987\u09A8-\u0987\u09A8 \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4 \u09B9\u09B2\u09C7 \u098F\u0996\u09BE\u09A8\u09C7 \u09AA\u09CD\u09B0\u09AC\u09C7\u09B6 \u0995\u09B0\u09BE \u09AF\u09BE\u09AC\u09C7\u0964',
              )}
            </p>
          ) : (
            <form className={s.form} onSubmit={submit} aria-busy={busy}>
              <label>
                {tr('Email address')}
                <input
                  autoComplete="email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  value={email}
                  readOnly={sent}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {sent && (
                <>
                  <p role="status">
                    {tr('Enter the code sent to')} <strong>{email}</strong>
                    {tr('. Check your spam folder too.')}
                  </p>
                  <label>
                    {tr('Verification code')}
                    <input
                      autoFocus
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6,10}"
                      required
                      minLength={6}
                      maxLength={10}
                      value={token}
                      onChange={(e) => setToken(latinDigits(e.target.value))}
                    />
                  </label>
                </>
              )}
              <button className={s.button} disabled={busy || (!sent && seconds > 0)}>
                {busy ? tr('Please wait\u2026') : sent ? tr('Verify & continue') : tr('Email me a code')}
                <ArrowRight size={16} />
              </button>
              {seconds > 0 && (
                <p role="status">
                  {locale === 'bn'
                    ? `${new Intl.NumberFormat('bn-BD').format(seconds)} সেকেন্ড পর নতুন কোড চাইতে পারবেন।`
                    : `You can request another code in ${seconds} seconds.`}
                </p>
              )}
              {sent && (
                <button
                  type="button"
                  className={s.quiet}
                  disabled={busy}
                  onClick={() => {
                    setSent(false);
                    setToken('');
                  }}
                >
                  {tr('Change email or request a new code')}
                </button>
              )}
            </form>
          )}
        </div>
        <p>
          <LockKeyhole size={13} />
          {tr('Signing in does not activate an order. Your seller confirms and activates access separately.')}
        </p>
      </main>
    </div>
  );
}
export function Mfa({
  existingFactor,
  next = '/admin/orders/',
}: {
  existingFactor: string | null;
  next?: string;
}) {
  const { tr, locale } = useProductLocale();
  const [factorId, setFactorId] = useState(existingFactor);
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function enroll() {
    setBusy(true);
    setError('');
    try {
      const r = await api<{
        factorId: string;
        qrCode: string;
      }>('/api/auth/mfa-enroll/', {
        method: 'POST',
        body: {},
      });
      setFactorId(r.factorId);
      setQr(r.qrCode);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/auth/mfa-verify/', { method: 'POST', body: { factorId, code } });
      window.location.assign(safeReturnPath(next));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.shell}>
      <main className={s.login}>
        <LoginStory />
        <a href="/dashboard/" className={s.brand}>
          <BrandLockup locale={locale} size={37} />
        </a>
        <h1>{tr('One more check.')}</h1>
        <p>{tr('Seller controls require an authenticator code.')}</p>
        <div className={s.panel}>
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          {!factorId ? (
            <button className={s.button} onClick={enroll} disabled={busy}>
              {tr('Set up authenticator')}
            </button>
          ) : (
            <form className={s.form} onSubmit={verify}>
              {qr && (
                <>
                  <p>{tr('Scan this code with your authenticator app, then enter its six-digit code.')}</p>
                  <img
                    className={s.qr}
                    src={qr.startsWith('data:') ? qr : `data:image/svg+xml,${encodeURIComponent(qr)}`}
                    alt={tr('Authenticator enrollment QR code')}
                  />
                </>
              )}
              <label>
                {tr('Authenticator code')}
                <input
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(latinDigits(e.target.value))}
                />
              </label>
              <button className={s.button} disabled={busy}>
                {busy ? tr('Verifying\u2026') : tr('Verify seller access')}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
