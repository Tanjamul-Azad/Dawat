'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Check,
  ArrowLeft,
  Eye,
  Save,
  ArrowUpRight,
  Circle,
  RefreshCw,
  Pause,
  Play,
  PencilLine,
} from 'lucide-react';
import {
  type DraftContent,
  type WeddingDetail,
  emptyDraft,
  publicationIssues,
} from '@/features/production/contracts';
import { meaningfulText } from '@/features/production/text';
import { api, RequestError } from '@/features/production/client';
import { WorkspaceFrame, WorkspaceLink } from './frame';
import { withTemplateWording } from '@/features/production/template-wording';
import { Modal } from '../ui';
import { PhotoLibrary } from './photo-library';
import { useProductLocale } from './product-locale';
import { errorText } from '@/features/production/copy';
import { type EditorSection } from '@/features/production/navigation';
import { HandoffLinks } from './handoff-links';
import s from './workspace.module.css';
const InvitationPreview = dynamic(() => import('./invitation-preview').then((m) => m.InvitationPreview), {
  loading: () => <p role="status">প্রিভিউ তৈরি হচ্ছে…</p>,
});

export function WeddingDesk({
  initial,
  email,
  initialSection = 'overview',
}: {
  initial: WeddingDetail;
  email: string;
  initialSection?: EditorSection;
}) {
  const [detail, setDetail] = useState(initial);
  const [content, setContent] = useState(initial.content);
  const wording = withTemplateWording(content);
  const [wordingEditing, setWordingEditing] = useState(false);
  const contentRef = useRef(content);
  const detailRef = useRef(detail);
  contentRef.current = content;
  detailRef.current = detail;
  const saveTask = useRef<Promise<boolean> | null>(null);
  const allowLeave = useRef(false);
  const [step, setStep] = useState<EditorSection>(initialSection);
  const [preview, setPreview] = useState(false);
  const [visibilityConfirm, setVisibilityConfirm] = useState<boolean | null>(null);
  const visibilityAttempt = useRef<{ signature: string; key: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const savingLock = useRef(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [error, setError] = useState('');
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const eventStash = useRef(new Map(initial.content.events.map((event) => [event.id, event])));
  const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState<WeddingDetail | null>(null);
  const { locale } = useProductLocale();
  const publishAttempt = useRef<{ revision: number; key: string } | null>(null);
  const dirty = JSON.stringify(content) !== JSON.stringify(detail.content);
  const root = `/api/weddings/${initial.wedding.id}`;
  const issues = publicationIssues(content);
  const t = (en: string, bn: string) => (locale === 'bn' ? bn : en);
  useEffect(() => {
    if (!dirty || busy || saving || mediaBusy || conflict || autoPaused) return;
    const timer = setTimeout(() => void save(true), 2000);
    return () => clearTimeout(timer);
  }, [content, detail.revision, dirty, busy, saving, mediaBusy, conflict, autoPaused]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!allowLeave.current && (dirty || mediaBusy || saving)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty, mediaBusy, saving]);
  function field<K extends keyof DraftContent>(key: K, value: DraftContent[K]) {
    setContent((c) => ({ ...withTemplateWording(c), [key]: value }));
    setNotice('');
  }
  function toggleEvent(id: 'nikah' | 'reception', include: boolean) {
    const current = content.events.find((event) => event.id === id);
    if (!include && (content.events.length === 1 || detail.protectedEventIds?.includes(id))) return;
    if (current) eventStash.current.set(id, current);
    setContent((draft) => ({
      ...draft,
      events: include
        ? draft.events.some((event) => event.id === id)
          ? draft.events
          : [
              ...draft.events,
              eventStash.current.get(id) ?? emptyDraft().events.find((event) => event.id === id)!,
            ]
        : draft.events.length > 1
          ? draft.events.filter((event) => event.id !== id)
          : draft.events,
      generalEventIds: include
        ? draft.generalEventIds
        : draft.generalEventIds.filter((eventId) => eventId !== id),
    }));
    setNotice('');
  }
  async function loadServer() {
    return api<WeddingDetail>(`${root}/`);
  }
  function save(automatic = false): Promise<boolean> {
    if (saveTask.current) return saveTask.current;
    const task = saveSnapshot(automatic);
    saveTask.current = task;
    void task.finally(() => {
      if (saveTask.current === task) saveTask.current = null;
    });
    return task;
  }
  async function saveSnapshot(automatic: boolean): Promise<boolean> {
    if (busy || mediaBusy || savingLock.current || conflict) return false;
    savingLock.current = true;
    setSaving(true);
    if (!automatic) setBusy(true);
    setError('');
    setNotice('');
    // The acknowledgement covers this snapshot; edits typed during autosave stay dirty.
    const snapshot = contentRef.current;
    const revision = detailRef.current.revision;
    try {
      const result = await api<{ revision: number; updatedAt: string }>(`${root}/draft/`, {
        method: 'PATCH',
        body: { expectedRevision: revision, content: snapshot },
      });
      if (result?.revision !== revision + 1 || !Number.isFinite(Date.parse(result?.updatedAt)))
        throw new RequestError(
          502,
          'INVALID_RESPONSE',
          t(
            'Save confirmation was incomplete. Refresh and review before retrying.',
            'সংরক্ষণের নিশ্চিত তথ্য পাওয়া যায়নি। রিফ্রেশ করে সংস্করণ দেখে আবার চেষ্টা করুন।',
          ),
        );
      const acknowledged = {
        ...detailRef.current,
        content: snapshot,
        revision: result.revision,
        updatedAt: result.updatedAt,
      };
      detailRef.current = acknowledged;
      setDetail(acknowledged);
      setConflict(null);
      setAutoPaused(false);
      setNeedsSignIn(false);
      return true;
    } catch (e) {
      setAutoPaused(true);
      if (e instanceof RequestError && e.status === 401) setNeedsSignIn(true);
      setError((e as Error).message);
      if (e instanceof RequestError && e.status === 409) {
        try {
          setConflict(await loadServer());
        } catch {
          /* Keep the original conflict and local draft. */
        }
      }
      return false;
    } finally {
      savingLock.current = false;
      setSaving(false);
      if (!automatic) setBusy(false);
    }
  }
  async function saveBeforeLeaving() {
    if (busy || mediaBusy || conflict || autoPaused) return false;
    setBusy(true);
    if (saveTask.current && !(await saveTask.current)) {
      setBusy(false);
      return false;
    }
    if (
      JSON.stringify(contentRef.current) !== JSON.stringify(detailRef.current.content) &&
      !(await save(true))
    ) {
      setBusy(false);
      return false;
    }
    allowLeave.current = true;
    return true;
  }
  async function publish() {
    if (busy || mediaBusy || savingLock.current || dirty || issues.length) return;
    setBusy(true);
    setError('');
    setNotice('');
    if (publishAttempt.current?.revision !== detail.revision)
      publishAttempt.current = { revision: detail.revision, key: crypto.randomUUID() };
    try {
      await api(`${root}/publish/`, {
        method: 'POST',
        body: { expectedRevision: detail.revision },
        key: publishAttempt.current.key,
      });
      const fresh = await loadServer();
      setNeedsSignIn(false);
      setDetail(fresh);
      setContent(fresh.content);
      publishAttempt.current = null;
      setNotice(t('Your invitation is published.', 'আপনার আমন্ত্রণ প্রকাশিত হয়েছে।'));
      setStep('overview');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    if (mediaBusy || busy || savingLock.current) return;
    setBusy(true);
    setError('');
    try {
      const fresh = await loadServer();
      setNeedsSignIn(false);
      if (dirty) setConflict(fresh);
      else {
        setDetail(fresh);
        setContent(fresh.content);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function changeVisibility(live: boolean) {
    if (busy || savingLock.current || mediaBusy || dirty) return;
    setBusy(true);
    setError('');
    const body = { live, expectedPublicationRevision: detail.wedding.publication_revision };
    const signature = JSON.stringify(body);
    if (visibilityAttempt.current?.signature !== signature)
      visibilityAttempt.current = { signature, key: crypto.randomUUID() };
    try {
      await api(`${root}/visibility/`, { method: 'POST', body, key: visibilityAttempt.current.key });
      const fresh = await loadServer();
      setDetail(fresh);
      setContent(fresh.content);
      setVisibilityConfirm(null);
      visibilityAttempt.current = null;
      setNotice(
        live
          ? t(
              'Invitation resumed. Existing personal links work again.',
              'আমন্ত্রণ আবার চালু হয়েছে। আগের ব্যক্তিগত লিংকগুলো কাজ করবে।',
            )
          : t(
              'Invitation paused. Replies and wishes are retained.',
              'আমন্ত্রণ সাময়িক বন্ধ। উত্তর ও শুভেচ্ছা অক্ষত আছে।',
            ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const textInput = (
    key: 'partnerOne' | 'partnerTwo' | 'partnerOneBn' | 'partnerTwoBn' | 'hosts' | 'hostsBn',
    label: string,
  ) => (
    <label>
      {label}
      <input
        value={content[key] ?? ''}
        maxLength={key.startsWith('hosts') ? 300 : 120}
        onChange={(e) => field(key, e.target.value)}
      />
    </label>
  );
  const isPublished = detail.wedding.visibility === 'live';
  const isPaused = detail.wedding.visibility === 'paused';
  const publishedCurrent = detail.publishedDraftRevision === detail.revision && !dirty;
  return (
    <WorkspaceFrame
      email={email}
      wedding={{
        id: detail.wedding.id,
        title: detail.wedding.title,
        view: step === 'overview' ? 'overview' : 'editor',
      }}
      onOverview={() => setStep('overview')}
      onEdit={() => setStep('names')}
      navigationGuard={{ pending: dirty || saving || mediaBusy, save: saveBeforeLeaving }}
    >
      <div className={s.intro}>
        <div>
          <WorkspaceLink className={s.eyebrow} href="/dashboard/?all=1">
            <ArrowLeft size={12} /> {t('My weddings', 'আমার আয়োজন')}
          </WorkspaceLink>
          <h1>
            {content.partnerOne && content.partnerTwo
              ? locale === 'bn'
                ? `${content.partnerOneBn || content.partnerOne} ও ${content.partnerTwoBn || content.partnerTwo}`
                : `${content.partnerOne} & ${content.partnerTwo}`
              : detail.wedding.title}
          </h1>
          <p>
            {t(
              'A thoughtful invitation starts with the details.',
              'যত্নে সাজানো আমন্ত্রণের শুরু ছোট ছোট বিবরণে।',
            )}
          </p>
        </div>
        <div className={s.actions}>
          <WorkspaceLink className={s.secondary} href={`/weddings/${detail.wedding.id}/guests/`}>
            {t('Guests & replies', 'অতিথি ও উত্তর')}
          </WorkspaceLink>
          <span className={s.badge}>
            {isPaused
              ? t('Paused', 'সাময়িক বন্ধ')
              : isPublished
                ? t('Published', 'প্রকাশিত')
                : t('Private draft', 'ব্যক্তিগত খসড়া')}
            {isPublished && !publishedCurrent ? ' · ' + t('Draft changes', 'খসড়ায় পরিবর্তন') : ''}
          </span>
        </div>
      </div>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      {needsSignIn && (
        <section className={s.panel} role="status">
          <h2>{t('Sign in again to save.', 'সংরক্ষণ করতে আবার প্রবেশ করুন।')}</h2>
          <p>
            {t(
              'Your edits remain in this tab. Sign in with the same account in a new tab, then return and refresh to review before saving.',
              'আপনার লেখা এই ট্যাবেই আছে। নতুন ট্যাবে একই ইমেইলে প্রবেশ করে ফিরে আসুন; রিফ্রেশ চেপে সংস্করণ দেখে সংরক্ষণ করুন।',
            )}
          </p>
          <WorkspaceLink
            className={s.secondary}
            href={`/auth/login/?next=${encodeURIComponent(`/weddings/${detail.wedding.id}/`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Sign in in a new tab', 'নতুন ট্যাবে প্রবেশ করুন')}
          </WorkspaceLink>
          <button className={s.secondary} disabled={busy || saving} onClick={refresh}>
            {t('Review saved version', 'সংরক্ষিত সংস্করণ যাচাই করুন')}
          </button>
        </section>
      )}
      {notice && (
        <p className={s.notice} role="status">
          {notice}
        </p>
      )}
      {conflict && (
        <section className={s.panel} style={{ marginBottom: 20 }}>
          <h2>{t('Two versions need your attention.', 'দুটি সংস্করণ পর্যালোচনা করুন।')}</h2>
          <p>
            {t(
              'Your local edits are still in the form. The server version is shown below. Copy any details you need before replacing either version.',
              'আপনার পরিবর্তন ফর্মেই আছে। সার্ভারের সংস্করণ নিচে দেখুন।',
            )}
          </p>
          <details>
            <summary>{t('View saved draft', 'সার্ভারে থাকা খসড়া দেখুন')}</summary>
            <div className={s.conflictSummary}>
              <strong>
                {conflict.content.partnerOneBn || conflict.content.partnerOne} ও{' '}
                {conflict.content.partnerTwoBn || conflict.content.partnerTwo}
              </strong>
              <p>{conflict.content.hostsBn || conflict.content.hosts}</p>
              <p>{conflict.content.message}</p>
              {conflict.content.events.map((e) => (
                <p key={e.id}>
                  <strong>{locale === 'bn' ? e.titleBn || e.title : e.title}</strong>
                  <br />
                  {e.date} · {e.time}
                  <br />
                  {locale === 'bn' ? e.venueBn || e.venue : e.venue}
                  <br />
                  {locale === 'bn' ? e.addressBn || e.address : e.address}
                </p>
              ))}
              <p>
                {t('Photos', 'ছবি')}: {conflict.content.photos.length}
              </p>
            </div>
          </details>
          <div className={s.actions}>
            <button
              className={s.secondary}
              disabled={busy}
              onClick={() => {
                setContent(conflict.content);
                setDetail(conflict);
                setConflict(null);
                setAutoPaused(false);
                setError('');
              }}
            >
              {t('Use saved version', 'সংরক্ষিত সংস্করণ নিন')}
            </button>
            <button
              className={s.secondary}
              disabled={busy}
              onClick={() => {
                setDetail(conflict);
                setConflict(null);
                setAutoPaused(true);
                setError('');
                setNotice(
                  t(
                    'Local edits retained. Review, then save to replace the server draft.',
                    'আপনার লেখা অক্ষত আছে। দেখে সংরক্ষণ করলে আগের খসড়া বদলাবে।',
                  ),
                );
              }}
            >
              {t('Keep my edits for review', 'আমার লেখা রেখে পর্যালোচনা করুন')}
            </button>
          </div>
        </section>
      )}
      <nav className={s.steps} aria-label={t('Invitation sections', 'আমন্ত্রণের বিভাগ')}>
        {[
          ['overview', t('Overview', 'সারসংক্ষেপ')],
          ['names', t('Names & wording', 'নাম ও আমন্ত্রণ')],
          ['events', t('Celebrations', 'অনুষ্ঠান')],
          ['photos', t('Photographs', 'ছবি')],
          ['review', t('Review & publish', 'পর্যালোচনা ও প্রকাশ')],
        ].map(([id, label]) => (
          <button
            key={id}
            disabled={busy || mediaBusy}
            onClick={() => setStep(id as EditorSection)}
            aria-current={step === id ? 'step' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className={s.split}>
        <div>
          {step === 'photos' && (
            <PhotoLibrary
              available={detail.mediaAvailable ?? true}
              wid={detail.wedding.id}
              photos={content.photos}
              onChange={(photos) => field('photos', photos)}
              onWorking={setMediaBusy}
              disabled={busy || saving}
              locale={locale}
            />
          )}
          {step === 'overview' && (
            <>
              <section className={s.panel}>
                <p className={s.eyebrow}>{t('Your next step', 'পরবর্তী ধাপ')}</p>
                <h2>
                  {isPaused
                    ? t('Your invitation is paused.', 'আপনার আমন্ত্রণ সাময়িক বন্ধ।')
                    : publishedCurrent
                      ? t('Your invitation is ready to open.', 'আপনার আমন্ত্রণ প্রস্তুত।')
                      : t('Bring the details together.', 'বিবরণগুলো একসঙ্গে সাজান।')}
                </h2>
                <ul className={s.checklist}>
                  <li>
                    {meaningfulText(content.partnerOne) && meaningfulText(content.partnerTwo) ? (
                      <Check size={16} />
                    ) : (
                      <Circle size={16} />
                    )}{' '}
                    <button className={s.quiet} onClick={() => setStep('names')}>
                      {t('Couple & families', 'বর-কনে ও পরিবার')}
                    </button>
                  </li>
                  <li>
                    {!issues.some((issue) => issue.startsWith('Complete ')) ? (
                      <Check size={16} />
                    ) : (
                      <Circle size={16} />
                    )}{' '}
                    <button className={s.quiet} onClick={() => setStep('events')}>
                      {t('Dates, times & venues', 'তারিখ, সময় ও স্থান')}
                    </button>
                  </li>
                  <li>
                    {publishedCurrent ? <Check size={16} /> : <Circle size={16} />}{' '}
                    <button className={s.quiet} onClick={() => setStep('review')}>
                      {t('Review publication', 'প্রকাশের আগে যাচাই')}
                    </button>
                  </li>
                </ul>
                <div className={s.actions} style={{ marginTop: 20 }}>
                  {isPublished && publishedCurrent && (
                    <WorkspaceLink className={s.button} href={`/weddings/${detail.wedding.id}/guests/`}>
                      {t('Invite your guests', 'অতিথিদের আমন্ত্রণ দিন')}
                    </WorkspaceLink>
                  )}
                  <button
                    className={isPublished && publishedCurrent ? s.secondary : s.button}
                    onClick={() =>
                      setStep(
                        publishedCurrent
                          ? 'names'
                          : !meaningfulText(content.partnerOne) || !meaningfulText(content.partnerTwo)
                            ? 'names'
                            : issues.length
                              ? 'events'
                              : 'review',
                      )
                    }
                  >
                    {publishedCurrent
                      ? t('Edit invitation', 'আমন্ত্রণ সম্পাদনা')
                      : t('Continue setup', 'পরের ধাপে যান')}
                  </button>
                  <button className={s.secondary} disabled={busy} onClick={refresh}>
                    <RefreshCw size={14} />
                    {t('Refresh', 'রিফ্রেশ')}
                  </button>
                </div>
              </section>
              {detail.workspaceUrl && (
                <HandoffLinks
                  workspaceUrl={detail.workspaceUrl}
                  guestUrl={isPublished ? detail.generalInvitationUrl : null}
                  weddingId={detail.wedding.id}
                  live={isPublished}
                  paused={isPaused}
                />
              )}
              <section className={s.panel}>
                <h2>{t('Publication & sharing', 'প্রকাশনা ও শেয়ারিং')}</h2>
                {isPaused && (
                  <p className={s.notice}>
                    {t(
                      'Your invitation is paused. Guests cannot view it or send new replies until you resume.',
                      'আমন্ত্রণ সাময়িক বন্ধ। আবার চালু না করা পর্যন্ত অতিথিরা দেখতে বা নতুন উত্তর দিতে পারবেন না।',
                    )}
                  </p>
                )}
                <p>
                  {t(
                    `Hosting term: ${detail.termDays} days from first publication. Republish does not extend the term.`,
                    `প্রথম প্রকাশ থেকে ${new Intl.NumberFormat('bn-BD').format(detail.termDays)} দিনের মেয়াদ। পুনঃপ্রকাশে মেয়াদ বাড়বে না।`,
                  )}
                </p>
                {detail.expiresAt && (
                  <p>
                    {t('Expires', 'মেয়াদ শেষ')}:{' '}
                    {new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
                      dateStyle: 'long',
                      timeZone: 'Asia/Dhaka',
                    }).format(new Date(detail.expiresAt))}
                  </p>
                )}
                {isPublished &&
                  (detail.publishedGeneralEventIds ?? detail.content.generalEventIds).length > 0 && (
                    <WorkspaceLink
                      href={`/i/${detail.wedding.slug}/`}
                      className={s.secondary}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(
                        'Open general invitation · view-only',
                        'সাধারণ আমন্ত্রণ দেখুন · উত্তর দেওয়া যাবে না',
                      )}
                      <ArrowUpRight size={14} />
                    </WorkspaceLink>
                  )}
                {!(detail.publishedGeneralEventIds ?? detail.content.generalEventIds).length && (
                  <p>
                    {t(
                      'No events are selected for a general invitation. Select them in Celebrations before sharing a general link.',
                      'সাধারণ লিংকের জন্য কোনো অনুষ্ঠান নির্বাচন করা হয়নি।',
                    )}
                  </p>
                )}
                {detail.publishedDraftRevision !== null && (
                  <div className={s.actions}>
                    <button
                      className={s.secondary}
                      disabled={busy || saving || mediaBusy || dirty}
                      onClick={() => setVisibilityConfirm(!isPublished)}
                    >
                      {isPublished ? <Pause size={15} /> : <Play size={15} />}
                      {isPublished
                        ? t('Pause invitation', 'আমন্ত্রণ সাময়িক বন্ধ করুন')
                        : t('Resume invitation', 'আবার চালু করুন')}
                    </button>
                    {dirty && <small>{t('Save the draft first.', 'আগে খসড়া সংরক্ষণ করুন।')}</small>}
                  </div>
                )}
                <p>
                  {t(
                    'Create named households, share their personal links and view confirmed replies in Guests & replies.',
                    'অতিথি ও উত্তর বিভাগে পরিবারের আমন্ত্রণ, ব্যক্তিগত লিংক ও সংরক্ষিত উত্তর দেখুন।',
                  )}
                </p>
              </section>
            </>
          )}
          {step === 'names' && (
            <section className={s.panel}>
              <h2>{t('A celebration of you two.', 'আপনাদের দুজনের আয়োজন।')}</h2>
              <p>
                {t(
                  'Write names exactly as you want guests to see them. Bangla names are optional; they fall back to the original names.',
                  'দুজনের নাম লিখলেই শুরু। আমন্ত্রণের লেখা তৈরি আছে; চাইলে নিজের মতো বদলে নিন। পরিবর্তন নিজে থেকেই সংরক্ষিত হবে।',
                )}
              </p>
              <fieldset disabled={busy} className={s.form}>
                <div className={s.row}>
                  {textInput('partnerOne', t('First partner’s name', 'প্রথম জনের নাম'))}
                  {textInput('partnerTwo', t('Second partner’s name', 'দ্বিতীয় জনের নাম'))}
                </div>
                <div className={s.wordingCard}>
                  <div className={s.sectionHeader}>
                    <strong>{t('Your invitation wording', 'কার্ডে যে লেখা থাকবে')}</strong>
                    <button
                      type="button"
                      className={s.quiet}
                      aria-expanded={wordingEditing}
                      onClick={() => {
                        if (!wordingEditing) setContent((current) => withTemplateWording(current));
                        setWordingEditing(!wordingEditing);
                      }}
                    >
                      <PencilLine size={15} />{' '}
                      {wordingEditing ? t('Done', 'সম্পাদনা শেষ') : t('Edit wording', 'লেখা সম্পাদনা করুন')}
                    </button>
                  </div>
                  {!wordingEditing && (
                    <>
                      <small>{content.hostsBn || wording.hosts}</small>
                      <p>{locale === 'en' ? wording.messageEn || wording.message : wording.message}</p>
                    </>
                  )}
                  {wordingEditing && (
                    <>
                      {textInput('hosts', t('From the families', 'কার পক্ষ থেকে আমন্ত্রণ'))}
                      <label>
                        আমন্ত্রণের লেখা
                        <textarea
                          rows={5}
                          maxLength={2000}
                          value={content.message}
                          onChange={(e) => field('message', e.target.value)}
                        />
                      </label>
                    </>
                  )}
                </div>
                <details className={s.optionalFields}>
                  <summary>
                    {t(
                      'Optional translations & alternate Bangla spelling',
                      'ঐচ্ছিক অনুবাদ ও আলাদা বাংলা বানান',
                    )}
                  </summary>
                  <div className={s.form}>
                    <div className={s.row}>
                      {textInput('partnerOneBn', 'প্রথম জন · বাংলা')}
                      {textInput('partnerTwoBn', 'দ্বিতীয় জন · বাংলা')}
                    </div>
                    {textInput('hostsBn', 'আয়োজক · বাংলা')}
                    <label>
                      {t('Invitation message · English (optional)', 'আমন্ত্রণের বার্তা · ইংরেজি (ঐচ্ছিক)')}
                      <textarea
                        rows={5}
                        maxLength={2000}
                        value={content.messageEn ?? ''}
                        onChange={(e) => field('messageEn', e.target.value)}
                      />
                    </label>
                  </div>
                </details>
              </fieldset>
            </section>
          )}
          {step === 'events' && (
            <section className={s.panel}>
              <h2>{t('Where your story unfolds.', 'যেখানে নতুন অধ্যায়ের শুরু।')}</h2>
              <p>
                {t(
                  'All dates and times use Asia/Dhaka. Event identities remain stable when you edit their details.',
                  'সব তারিখ ও সময় Asia/Dhaka অনুযায়ী।',
                )}
              </p>
              <fieldset disabled={busy} className={s.form}>
                <div className={s.eventChoices}>
                  <strong>{t('Choose your celebrations', 'যে অনুষ্ঠানগুলো থাকবে')}</strong>
                  {(['nikah', 'reception'] as const).map((id) => (
                    <label key={id} className={s.checkbox}>
                      <input
                        type="checkbox"
                        checked={content.events.some((event) => event.id === id)}
                        disabled={
                          content.events.some((event) => event.id === id) &&
                          (content.events.length === 1 || detail.protectedEventIds?.includes(id))
                        }
                        onChange={(event) => toggleEvent(id, event.target.checked)}
                      />
                      {id === 'nikah'
                        ? t('Include Nikah', 'আকদ রাখুন')
                        : t('Include Reception', 'সংবর্ধনা রাখুন')}
                    </label>
                  ))}
                  <small>
                    {t(
                      'Keep at least one event. Reassign invited households before removing their event; contact support if they have already replied.',
                      'অন্তত একটি অনুষ্ঠান রাখুন। অতিথি যুক্ত থাকা অনুষ্ঠান বাদ দেওয়ার আগে তাঁদের অনুষ্ঠানের অনুমতি সমন্বয় করুন। উত্তর থাকলে সহায়তা নিন।',
                    )}
                  </small>
                </div>
                {content.events.map((event, index) => (
                  <fieldset key={event.id}>
                    <legend>
                      {String(index + 1).padStart(2, '0')} ·{' '}
                      {event.id === 'nikah' ? t('Nikah', 'আকদ') : t('Reception', 'বিবাহোত্তর সংবর্ধনা')}
                    </legend>
                    <div className={s.form}>
                      <div className={s.form}>
                        {(['title'] as const).map((key) => (
                          <label key={key}>
                            {t('Celebration name · original', 'অনুষ্ঠানের নাম')}
                            <input
                              value={event[key] ?? ''}
                              maxLength={160}
                              onChange={(e) =>
                                field(
                                  'events',
                                  content.events.map((v, i) =>
                                    i === index
                                      ? {
                                          ...v,
                                          [key]: e.target.value,
                                          ...(key === 'title' && v.titleBn === v.title
                                            ? { titleBn: e.target.value }
                                            : {}),
                                        }
                                      : v,
                                  ),
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>
                      <div className={s.row}>
                        {(['date', 'time'] as const).map((key) => (
                          <label key={key}>
                            {key === 'date' ? t('Date', 'তারিখ') : t('Time', 'সময়')}
                            <input
                              type={key}
                              value={event[key]}
                              onChange={(e) =>
                                field(
                                  'events',
                                  content.events.map((v, i) =>
                                    i === index ? { ...v, [key]: e.target.value } : v,
                                  ),
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>
                      {(['venue', 'address'] as const).map((key) => (
                        <label key={key}>
                          {
                            {
                              venue: t('Venue · original', 'অনুষ্ঠানের স্থান'),
                              venueBn: 'স্থান · বাংলা',
                              address: t('Address · original', 'ঠিকানা'),
                              addressBn: 'ঠিকানা · বাংলা',
                            }[key]
                          }
                          <input
                            value={event[key] ?? ''}
                            maxLength={key.startsWith('address') ? 500 : 200}
                            onChange={(e) =>
                              field(
                                'events',
                                content.events.map((v, i) =>
                                  i === index ? { ...v, [key]: e.target.value } : v,
                                ),
                              )
                            }
                          />
                        </label>
                      ))}
                      <details className={s.optionalFields}>
                        <summary>
                          {t('Alternate Bangla wording (optional)', 'আলাদা বাংলা বানান (ঐচ্ছিক)')}
                        </summary>
                        <div className={s.form}>
                          {(['titleBn', 'venueBn', 'addressBn'] as const).map((key) => (
                            <label key={key}>
                              {
                                {
                                  titleBn: 'অনুষ্ঠানের নাম · বাংলা',
                                  venueBn: 'স্থান · বাংলা',
                                  addressBn: 'ঠিকানা · বাংলা',
                                }[key]
                              }
                              <input
                                value={event[key] ?? ''}
                                maxLength={key === 'titleBn' ? 160 : key === 'venueBn' ? 200 : 500}
                                onChange={(e) =>
                                  field(
                                    'events',
                                    content.events.map((item, i) =>
                                      i === index ? { ...item, [key]: e.target.value } : item,
                                    ),
                                  )
                                }
                              />
                            </label>
                          ))}
                        </div>
                      </details>
                      <label className={s.checkbox}>
                        <input
                          type="checkbox"
                          checked={content.generalEventIds.includes(event.id)}
                          onChange={(e) =>
                            field(
                              'generalEventIds',
                              e.target.checked
                                ? [...content.generalEventIds, event.id]
                                : content.generalEventIds.filter((id) => id !== event.id),
                            )
                          }
                        />
                        {t(
                          'Include this event in the general view-only invitation. Anyone with that URL can see its venue and details.',
                          'সাধারণ আমন্ত্রণে এই অনুষ্ঠান দেখান। লিংকধারী সবাই এর স্থান ও বিবরণ দেখতে পারবেন।',
                        )}
                      </label>
                    </div>
                    {index < content.events.length - 1 && <div className={s.line} />}
                  </fieldset>
                ))}
              </fieldset>
            </section>
          )}
          {step === 'review' && (
            <section className={s.panel}>
              <h2>{t('One last look.', 'শেষবার দেখে নিন।')}</h2>
              {isPaused && (
                <p className={s.notice}>
                  {t(
                    'Publishing a new saved draft will also resume the invitation.',
                    'নতুন খসড়া প্রকাশ করলে আমন্ত্রণ আবার চালু হবে।',
                  )}
                </p>
              )}
              <p>
                {t(
                  'Guests see these changes only after you publish. Incomplete details can always be saved as a draft.',
                  'প্রকাশ করার পরই অতিথিরা পরিবর্তনগুলো দেখবেন। অসম্পূর্ণ বিবরণও খসড়া হিসেবে সংরক্ষণ করা যাবে।',
                )}
              </p>
              {issues.length > 0 ? (
                <ul className={s.checklist}>
                  {issues.map((issue) => (
                    <li key={issue}>
                      <Circle size={14} />
                      <button
                        className={s.quiet}
                        onClick={() => setStep(/names/i.test(issue) ? 'names' : 'events')}
                      >
                        {errorText(issue, locale)} →
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={s.notice}>
                  <Check size={15} />{' '}
                  {t('Names and celebration details are complete.', 'নাম ও অনুষ্ঠানের বিবরণ সম্পূর্ণ।')}
                </p>
              )}
              <p>
                {t(
                  `Hosting lasts ${detail.termDays} days from first publication. Republishing does not extend the term.`,
                  `প্রথম প্রকাশ থেকে ${new Intl.NumberFormat('bn-BD').format(detail.termDays)} দিনের মেয়াদ। পুনঃপ্রকাশে মেয়াদ বাড়বে না।`,
                )}
              </p>
              <p>
                {t(
                  'Your photographs use the original Jamdani gallery. Only processed photos can be published.',
                  'আপনার ছবি মূল জামদানি গ্যালারিতেই থাকবে। প্রস্তুত ছবিই প্রকাশ করা যাবে।',
                )}
              </p>
              {dirty && <p>{t('Save your draft before publishing.', 'প্রকাশের আগে খসড়া সংরক্ষণ করুন।')}</p>}
              <button
                className={`${s.button} ${s.wine}`}
                disabled={
                  busy || saving || mediaBusy || dirty || issues.length > 0 || publishedCurrent || !!conflict
                }
                onClick={publish}
              >
                {busy || saving
                  ? t('Please wait…', 'অপেক্ষা করুন…')
                  : publishedCurrent
                    ? isPaused
                      ? t('Paused', 'সাময়িক বন্ধ')
                      : t('Published', 'প্রকাশিত')
                    : t('Publish invitation', 'আমন্ত্রণ প্রকাশ করুন')}
              </button>
            </section>
          )}
          {(step !== 'overview' || dirty) && (
            <div className={s.savebar}>
              <small className={s.saveState}>
                <Check size={14} aria-hidden="true" />
                {saving
                  ? t('Saving automatically…', 'নিজে থেকেই সংরক্ষণ হচ্ছে…')
                  : busy
                    ? t('Working…', 'কাজ চলছে…')
                    : dirty
                      ? t('Changes queued for autosave', 'অসংরক্ষিত পরিবর্তন · নিজে থেকেই সংরক্ষিত হবে')
                      : t('Saved on server', 'সার্ভারে সংরক্ষিত')}{' '}
                {autoPaused && dirty && !conflict
                  ? ' · ' +
                    t('Autosave paused; save to retry', 'স্বয়ংক্রিয় সংরক্ষণ বন্ধ; সংরক্ষণ চেপে চেষ্টা করুন')
                  : ''}
              </small>
              <div className={s.actions}>
                <button
                  className={s.secondary}
                  disabled={issues.length > 0 || busy}
                  title={
                    issues.length
                      ? t(
                          'Complete the names, date, time and venue to preview.',
                          'প্রিভিউ দেখতে নাম, তারিখ, সময় ও স্থান পূরণ করুন।',
                        )
                      : undefined
                  }
                  onClick={() => setPreview(true)}
                >
                  <Eye size={15} />
                  {t('Preview', 'প্রিভিউ')}
                </button>
                <button
                  className={`${s.quiet} ${s.saveNow}`}
                  aria-label={t('Save draft', 'খসড়া সংরক্ষণ')}
                  title={t('Save now', 'এখনই সংরক্ষণ')}
                  onClick={() => void save()}
                  disabled={busy || saving || mediaBusy || !dirty || !!conflict}
                >
                  <Save size={15} />
                  <span>{t('Save now', 'এখনই সংরক্ষণ')}</span>
                </button>
                {step !== 'review' && (
                  <button
                    className={s.button}
                    disabled={busy || mediaBusy}
                    onClick={() =>
                      setStep(step === 'names' ? 'events' : step === 'events' ? 'photos' : 'review')
                    }
                  >
                    {t('Continue', 'পরের ধাপ')} <ArrowUpRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <aside className={`${s.preview} ${s.sticky}`}>
          <img
            className={s.previewImage}
            src="/artwork/jamdani-garden-v5-640.webp"
            alt="Original Jamdani botanical stationery"
            width={260}
            height={325}
          />
          <p className={s.eyebrow} style={{ marginTop: 24 }}>
            {t('Jamdani · The original collection', 'জামদানি · মূল সংগ্রহ')}
          </p>
          <h3>
            {content.partnerOneBn || content.partnerOne || t('Your name', 'আপনার নাম')}
            <br />
            <i>&</i>
            <br />
            {content.partnerTwoBn || content.partnerTwo || t('Their name', 'অপর জনের নাম')}
          </h3>
          <p>{t('Rooted in home. Shared with love.', 'শিকড়ের মায়া। ভালোবাসার আমন্ত্রণ।')}</p>
          <button
            className={s.secondary}
            disabled={issues.length > 0 || busy}
            onClick={() => setPreview(true)}
          >
            <Eye size={14} />
            {t('Open full preview', 'সম্পূর্ণ প্রিভিউ')}
          </button>
        </aside>
      </div>
      {preview && (
        <Modal
          title={t('Private draft preview · no replies', 'ব্যক্তিগত খসড়া প্রিভিউ · উত্তর দেওয়া যাবে না')}
          onClose={() => setPreview(false)}
        >
          <InvitationPreview
            content={content}
            scope={`draft-${detail.wedding.id}`}
            mediaBase={`/api/weddings/${detail.wedding.id}/media`}
          />
        </Modal>
      )}
      {visibilityConfirm !== null && (
        <Modal
          title={
            visibilityConfirm
              ? t('Resume invitation?', 'আমন্ত্রণ আবার চালু করবেন?')
              : t('Pause invitation?', 'আমন্ত্রণ সাময়িক বন্ধ করবেন?')
          }
          onClose={() => {
            if (!busy) setVisibilityConfirm(null);
          }}
        >
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <p>
            {visibilityConfirm
              ? t(
                  'The last published invitation and existing personal links will become available again. Your hosting expiry stays the same.',
                  'শেষ প্রকাশিত আমন্ত্রণ ও আগের ব্যক্তিগত লিংক আবার কাজ করবে। হোস্টিংয়ের মেয়াদ বাড়বে না।',
                )
              : t(
                  'General and personal invitations, protected photos and new guest replies will be unavailable. Saved replies, wishes and links are retained. Already downloaded copies cannot be recalled.',
                  'সাধারণ ও ব্যক্তিগত আমন্ত্রণ, সুরক্ষিত ছবি এবং নতুন উত্তর নেওয়া বন্ধ হবে। আগের উত্তর, শুভেচ্ছা ও লিংক অক্ষত থাকবে। আগে ডাউনলোড করা কপি ফিরিয়ে নেওয়া যাবে না।',
                )}
          </p>
          <div className={s.actions}>
            <button
              className={s.button}
              disabled={busy}
              onClick={() => void changeVisibility(visibilityConfirm)}
            >
              {busy
                ? t('Please wait…', 'অপেক্ষা করুন…')
                : visibilityConfirm
                  ? t('Resume invitation', 'আবার চালু করুন')
                  : t('Pause invitation', 'সাময়িক বন্ধ করুন')}
            </button>
            <button className={s.secondary} disabled={busy} onClick={() => setVisibilityConfirm(null)}>
              {t('Cancel', 'বাতিল')}
            </button>
          </div>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
