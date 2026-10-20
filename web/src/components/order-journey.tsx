'use client';
import { useState } from 'react';
import { ArrowRight, Check, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import {
  activateDashboard,
  confirmOrder,
  hasDashboardAccess,
  type Workspace,
} from '@/features/workspace/model';
import { InvitationCover } from './artwork';
import styles from './order-journey.module.css';

type Props = {
  workspace: Workspace;
  update: (fn: (state: Workspace) => Workspace) => boolean;
  notify: (message: string) => void;
  operator: boolean;
};

export function AccessGate() {
  return (
    <section className={styles.gate}>
      <LockKeyhole size={26} strokeWidth={1.3} />
      <span className="eyebrow">A SPACE RESERVED FOR YOUR CELEBRATION</span>
      <h1>
        Good things
        <br />
        <em>are taking shape.</em>
      </h1>
      <p>
        Your dedicated dashboard opens after we confirm your order and activate your access. Until then, your
        design and order details are right here.
      </p>
      <a href="/order/" className="button">
        View your order <ArrowRight size={16} />
      </a>
      <a href="/templates/" className="underlined">
        Return to the collection
      </a>
    </section>
  );
}

export function OrderJourney({ workspace, update, notify, operator }: Props) {
  const [error, setError] = useState('');
  const order = workspace.order;
  const active = hasDashboardAccess(workspace);
  const invitation = order?.invitation ?? workspace.draft;
  function submit(form: FormData) {
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    if (!name || !email) return;
    const saved = update((current) => {
      // A repeat submit must never overwrite an existing order or its grant.
      if (current.order) return current;
      return {
        ...current,
        order: {
          id: `DW-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          name,
          email,
          submittedAt: new Date().toISOString(),
          confirmedAt: null,
          activatedAt: null,
          revokedAt: null,
          invitation: structuredClone(current.draft),
        },
      };
    });
    if (saved) notify('Sample order received in this browser. No payment has been collected.');
  }
  function advance(action: 'confirm' | 'activate' | 'revoke') {
    try {
      const saved = update((current) =>
        action === 'confirm'
          ? confirmOrder(current, new Date().toISOString())
          : action === 'activate'
            ? activateDashboard(current, new Date().toISOString())
            : {
                ...current,
                order: current.order ? { ...current.order, revokedAt: new Date().toISOString() } : null,
              },
      );
      if (saved) {
        setError('');
        notify(
          action === 'revoke'
            ? 'Demo dashboard access revoked.'
            : `Demo ${action === 'confirm' ? 'order confirmed' : 'dashboard activated'}.`,
        );
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Please retry.');
    }
  }
  return (
    <section className={styles.shell}>
      <header className={styles.heading}>
        <span className="eyebrow">
          {operator ? 'SEPARATE OPERATOR SIMULATION' : 'YOUR INVITATION, ONE STEP CLOSER'}
        </span>
        <h1>
          {operator ? 'Behind the' : order ? 'A little closer to' : 'Your story.'}
          <br />
          <em>{operator ? 'celebration.' : order ? 'your big day.' : 'Made official.'}</em>
        </h1>
        <p>
          {operator
            ? 'Internal workflow demo. In production, only authenticated staff can verify payment, confirm orders and activate client access.'
            : 'One considered design. A welcome that feels like home. Your own space to bring everyone together, once your order is confirmed.'}
        </p>
      </header>
      <div className={styles.grid}>
        <aside className={styles.paper}>
          <div className={styles.cover}>
            <InvitationCover invitation={invitation} compact />
          </div>
          <span className="eyebrow">JAMDANI IVORY / THE FIRST EDITION</span>
          <p>
            {invitation.partnerOne} & {invitation.partnerTwo}
          </p>
          <small>Two celebrations · Personal guest greetings · RSVP & wishes</small>
          {!order && (
            <a href="/studio/" className="underlined">
              Refine your preview
            </a>
          )}
        </aside>
        <div className={styles.details}>
          {operator && (
            <div className={styles.notice}>
              <ShieldCheck size={22} />
              <p>
                This is an openly accessible prototype control, with browser data only. It is not the
                production admin portal.
              </p>
            </div>
          )}
          {!order && !operator && (
            <>
              <span className="eyebrow">01 / REVIEW & REQUEST</span>
              <h2>A thoughtful start.</h2>
              <p>
                Your saved design will be attached to this request. We’ll agree the package and price before
                any payment. No price or payment service is live in this preview.
              </p>
              <form action={submit} className={styles.form}>
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="How should we address you?"
                  />
                </label>
                <label>
                  Email for your order
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>
                <button className="button" type="submit">
                  Request this invitation <ArrowRight size={17} />
                </button>
                <small>Demo request only. Nothing is sent and no money is collected.</small>
              </form>
            </>
          )}
          {!order && operator && (
            <>
              <h2>No sample order yet.</h2>
              <p>
                Complete the public journey first. Staff cannot activate a dashboard without a confirmed
                order.
              </p>
              <a className="button" href="/studio/">
                Start a sample design <ArrowRight size={16} />
              </a>
            </>
          )}
          {order && (
            <>
              <span className="eyebrow">{order.id}</span>
              <h2>
                {active
                  ? 'Your space is ready.'
                  : order.confirmedAt
                    ? 'Confirmed, with love.'
                    : 'We have your request.'}
              </h2>
              <p>
                {active
                  ? `Welcome, ${order.name}. Your dedicated celebration dashboard is now available.`
                  : order.confirmedAt
                    ? 'Your order is confirmed. The next step is a separate dashboard activation by our team.'
                    : `Thank you, ${order.name}. Your request is waiting for our team’s review. Dashboard access is reserved until confirmation and activation.`}
              </p>
              <ol className={styles.timeline}>
                {[
                  {
                    label: 'Design request received',
                    detail: 'Your chosen design and details are attached.',
                    done: true,
                  },
                  {
                    label: 'Order confirmed',
                    detail: 'Our team verifies the agreed order and payment.',
                    done: !!order.confirmedAt,
                  },
                  {
                    label: 'Dashboard activated',
                    detail: 'You receive your dedicated, verified client entry.',
                    done: active,
                  },
                ].map((item, i) => (
                  <li key={item.label} className={item.done ? styles.done : ''}>
                    <span>{item.done ? <Check size={15} /> : `0${i + 1}`}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.detail}</small>
                    </div>
                  </li>
                ))}
              </ol>
              <div className={styles.receipt}>
                <Mail size={18} />
                <span>
                  {order.email}
                  <small>No email has been sent by this prototype.</small>
                </span>
              </div>
              {active && (
                <a href="/dashboard/" className="button">
                  Open your celebration <ArrowRight size={17} />
                </a>
              )}
              {operator && (
                <div className={styles.actions}>
                  <button
                    className="button secondary"
                    disabled={!!order.confirmedAt}
                    onClick={() => advance('confirm')}
                  >
                    1. Confirm sample order
                  </button>
                  <button
                    className="button"
                    disabled={!order.confirmedAt || active}
                    onClick={() => advance('activate')}
                  >
                    2. Activate dashboard
                  </button>
                  {active && (
                    <button className="text-link" onClick={() => advance('revoke')}>
                      Revoke demo access
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </div>
      </div>
      <p className={styles.footnote}>
        Browser-only design preview. A real dedicated link will require a scoped account and server-side
        access checks.
      </p>
    </section>
  );
}
