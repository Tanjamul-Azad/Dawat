'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Heart, Send } from 'lucide-react';
import { type Guest, type Invitation, type Workspace } from '@/features/workspace/model';
import { localId } from '@/features/workspace/local-id';
import {
  eventText,
  guestText,
  localNames,
  number,
  parseCount,
  responseError,
  saveResponse,
  words,
  type Locale,
} from '@/features/invitation/content';
import { Flourish } from './invitation-sections';
import { useRsvpDeadline } from './use-rsvp-deadline';
import s from './jamdani.module.css';

type Props = {
  workspace: Workspace;
  invitation: Invitation;
  guest: Guest;
  events: Invitation['events'];
  locale: Locale;
  update: (fn: (state: Workspace) => Workspace) => boolean;
};

export function InvitationResponse({ invitation, guest, events, locale, update }: Props) {
  const [eventId, setEventId] = useState(
    events.find((event) => event.id === 'reception')?.id ?? events[0]?.id,
  );
  const active = events.find((e) => e.id === eventId) ?? events[0];
  const [choice, setChoice] = useState<'accepted' | 'declined'>('accepted');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const receiptRef = useRef<HTMLHeadingElement>(null);
  const focusReceipt = useRef(false);
  const drafts = useRef<
    Record<
      string,
      {
        choice: 'accepted' | 'declined';
        adults: string;
        children: string;
        note: string;
        confirmed: boolean;
      }
    >
  >({});
  const identity = guest.id;
  const draftKey = `${identity}:${active?.id}`;
  const [error, setError] = useState<keyof typeof words.en | null>(null);
  const answer = guest?.responses[active?.id ?? ''];
  useEffect(() => {
    const draft = drafts.current[draftKey];
    setChoice(draft?.choice ?? answer?.attendance ?? 'accepted');
    setAdults(draft?.adults ?? String(answer?.adults ?? 1));
    setChildren(draft?.children ?? String(answer?.children ?? 0));
    setNote(draft?.note ?? answer?.note ?? '');
    setConfirmed(draft?.confirmed ?? !!answer);
    setError(null);
  }, [draftKey, answer?.updatedAt]);
  const t = words[locale];
  const recipient = guestText(guest, locale);
  useEffect(() => {
    if (error) {
      errorRef.current?.focus({ preventScroll: true });
      errorRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
    }
  }, [error]);
  useEffect(() => {
    if (confirmed && focusReceipt.current) {
      receiptRef.current?.focus({ preventScroll: true });
      receiptRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      focusReceipt.current = false;
    }
  }, [confirmed]);
  function reportError(key: keyof typeof words.en) {
    setError(key);
    if (error === key) errorRef.current?.focus();
  }
  const closed = useRsvpDeadline(invitation.rsvpClosesAt);
  async function submit(form: FormData) {
    if (savingRef.current || !active) return;
    const respondent = guest;
    const a = choice === 'declined' ? 0 : parseCount(adults);
    const c = choice === 'declined' ? 0 : parseCount(children);
    if (a === null || c === null) {
      reportError('countsInvalid');
      return;
    }
    const next = {
      attendance: choice,
      adults: a,
      children: c,
      note: String(form.get('note') ?? '').trim(),
      updatedAt: new Date().toISOString(),
    };
    const failure = responseError(respondent, active.id, next, invitation);
    if (failure) {
      reportError(failure);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const saved = update((current) => {
        if (!current.published) throw new Error('invalidScope');
        return saveResponse(current, respondent, active.id, next, current.published);
      });
      if (!saved) {
        reportError('saveFailed');
        return;
      }
      delete drafts.current[draftKey];
      focusReceipt.current = true;
      setConfirmed(true);
      setError(null);
    } catch (failure) {
      const key = failure instanceof Error ? failure.message : '';
      reportError(
        key === 'closed' || key === 'invalidScope' || key === 'allowanceInvalid' || key === 'countsInvalid'
          ? key
          : 'saveFailed',
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }
  return (
    <>
      <section id="rsvp" className={s.rsvp} aria-labelledby="rsvp-title" tabIndex={-1}>
        <div className={s.rsvpIntro} data-reveal>
          <span className={s.chapterNumber} aria-hidden="true">
            05 / {locale === 'bn' ? 'আপনার উত্তর' : 'A REPLY, WITH LOVE'}
          </span>
          <span className={s.kicker}>{t.rsvpLabel}</span>
          <h2 id="rsvp-title">
            {t.rsvpTitle}
            <br />
            <em>{t.rsvpEm}</em>
          </h2>
          <p>{t.rsvpNote}</p>
          <Flourish />
          <div className={s.replyIdentity}>
            <span className={s.kicker}>{t.replyAs}</span>
            <strong>{recipient.name}</strong>
            <small>
              {t.allowance}: {number(guest.allowance, locale)}
            </small>
          </div>
        </div>
        <div className={s.formPaper}>
          {events.length > 1 ? (
            <label>
              {t.forEvent}
              <select
                value={active?.id}
                onChange={(e) => {
                  drafts.current[draftKey] = { choice, adults, children, note, confirmed };
                  setEventId(e.target.value as 'nikah' | 'reception');
                }}
              >
                {events.map((event) => (
                  <option value={event.id} key={event.id}>
                    {eventText(event, locale).title}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className={s.singleEvent}>
              <span>{t.forEvent}</span>
              <strong>{active ? eventText(active, locale).title : ''}</strong>
            </div>
          )}
          {closed && (
            <p className={s.feedback} role="status">
              {t.closed}
            </p>
          )}
          {confirmed ? (
            <div className={s.receipt} role="status">
              <span>
                <Check size={27} />
              </span>
              <h3 ref={receiptRef} tabIndex={-1}>
                {t.saved}
              </h3>
              <p>{choice === 'accepted' ? t.accepted : t.declined}</p>
              {choice === 'accepted' && (
                <strong>
                  {number((parseCount(adults) ?? 0) + (parseCount(children) ?? 0), locale)} {t.people}
                </strong>
              )}
              <small>{t.localSaved}</small>
              {!closed && (
                <button className={s.textButton} onClick={() => setConfirmed(false)}>
                  {t.edit}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <form action={submit} className={s.form}>
              <fieldset disabled={closed || saving} aria-describedby={error ? 'rsvp-error' : undefined}>
                <fieldset className={s.choices}>
                  <legend>{t.attend}</legend>
                  <label className={choice === 'accepted' ? s.chosen : ''}>
                    <input
                      type="radio"
                      name="attendance"
                      checked={choice === 'accepted'}
                      onChange={() => setChoice('accepted')}
                    />
                    <Check size={16} />
                    {t.yes}
                  </label>
                  <label className={choice === 'declined' ? s.chosen : ''}>
                    <input
                      type="radio"
                      name="attendance"
                      checked={choice === 'declined'}
                      onChange={() => setChoice('declined')}
                    />
                    <Heart size={16} />
                    {t.no}
                  </label>
                </fieldset>
                {choice === 'accepted' && (
                  <div className={s.countFields}>
                    <label>
                      {t.adults}
                      <input
                        inputMode="numeric"
                        value={adults}
                        onChange={(e) => setAdults(e.target.value)}
                        maxLength={3}
                        required
                      />
                    </label>
                    <label>
                      {t.children}
                      <input
                        inputMode="numeric"
                        value={children}
                        onChange={(e) => setChildren(e.target.value)}
                        maxLength={3}
                        required
                      />
                    </label>
                  </div>
                )}
                <label>
                  {t.note} <small>{t.optional}</small>
                  <textarea
                    name="note"
                    maxLength={1000}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                {error && (
                  <p ref={errorRef} id="rsvp-error" className={s.error} role="alert" tabIndex={-1}>
                    {t[error]}
                  </p>
                )}
                <button type="submit" className={s.primary}>
                  {saving ? t.saving : t.submit}
                  <Send size={16} />
                </button>
                <small>{t.privacy}</small>
              </fieldset>
            </form>
          )}
        </div>
      </section>
      <PrivateWish invitation={invitation} guest={guest} locale={locale} update={update} />
    </>
  );
}

function PrivateWish({
  invitation,
  guest,
  locale,
  update,
}: Pick<Props, 'invitation' | 'guest' | 'locale' | 'update'>) {
  const [sent, setSent] = useState(false);
  const [body, setBody] = useState('');
  const [error, setError] = useState<'requiredWish' | 'wishFailed' | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const submitting = useRef(false);
  const t = words[locale];
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function submit() {
    if (submitting.current) return;
    const author = guest.name;
    if (!body.trim()) {
      const key = 'requiredWish';
      setError(key);
      if (error === key) errorRef.current?.focus();
      return;
    }
    submitting.current = true;
    let committed = false;
    try {
      const saved = update((current) => {
        if (!current.published || !current.guests.some((item) => item.id === guest.id))
          throw new Error('invalidScope');
        return {
          ...current,
          wishes: [
            ...current.wishes,
            { id: localId(), name: author, body: body.trim(), createdAt: new Date().toISOString() },
          ],
        };
      });
      if (saved) {
        committed = true;
        setSent(true);
        setError(null);
        setBody('');
      } else setError('wishFailed');
    } catch {
      setError('wishFailed');
    } finally {
      if (!committed) submitting.current = false;
    }
  }
  return (
    <section className={s.wish} aria-labelledby="wish-title">
      <Heart size={26} strokeWidth={1} />
      <span className={s.kicker}>{t.wishLabel}</span>
      <h2 id="wish-title">{t.wishTitle}</h2>
      <p className={s.wishDedication}>
        <span>{t.wishFor}</span>
        <strong>{localNames(invitation, locale).join(locale === 'bn' ? ' ও ' : ' & ')}</strong>
      </p>
      <p>{t.wishNote}</p>
      {sent ? (
        <div className={s.wishThanks} role="status">
          <p>{t.wishThanks}</p>
          <button
            className={s.textButton}
            onClick={() => {
              submitting.current = false;
              setSent(false);
            }}
          >
            {t.wishAgain}
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <form action={submit} className={s.form}>
          <label>
            {t.wish}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1000}
              rows={4}
              required
            />
          </label>
          {error && (
            <p ref={errorRef} className={s.error} role="alert" tabIndex={-1}>
              {t[error]}
            </p>
          )}
          <button type="submit" className={s.outline}>
            {t.wishSend}
            <Heart size={16} />
          </button>
        </form>
      )}
    </section>
  );
}
