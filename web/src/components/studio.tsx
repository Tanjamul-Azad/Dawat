'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Check, Eye, Save, ChevronDown, ExternalLink, Sparkles } from 'lucide-react';
import {
  invitationSchema,
  hasDashboardAccess,
  themes,
  type Invitation,
  type Workspace,
  type Theme,
} from '@/features/workspace/model';
import { InvitationCover } from './artwork';
import { Modal } from './ui';
import { StudioPhotos } from './studio-photos';
import { bilingualIssues } from '@/features/invitation/content';

type Props = {
  workspace: Workspace;
  ready: boolean;
  update: (fn: (state: Workspace) => Workspace) => boolean;
  notify: (message: string) => void;
};
const steps = [
  { id: 'names', label: 'Names & wording', number: '01' },
  { id: 'events', label: 'Celebrations', number: '02' },
  { id: 'photos', label: 'Photographs', number: '03' },
  { id: 'design', label: 'Style', number: '04' },
];

export function Studio({ workspace, ready, update, notify }: Props) {
  const activated = hasDashboardAccess(workspace);
  const [step, setStep] = useState('names');
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<Invitation>({ defaultValues: workspace.draft });
  useEffect(() => {
    if (!ready) return;
    const theme = new URLSearchParams(window.location.search).get('theme');
    reset({ ...workspace.draft, ...(themes.some((t) => t.id === theme) ? { theme: theme as Theme } : {}) });
  }, [ready, reset]); // Reset only on hydration, preserving edits during preview and save.
  const values = watch();
  function save(values: Invitation, action: 'draft' | 'finish' = 'draft') {
    const result = invitationSchema.safeParse(values);
    if (!result.success) {
      setError('root', { message: result.error.issues[0].message });
      return;
    }
    if (action === 'finish' && activated) {
      const missing = bilingualIssues(result.data);
      if (missing.length) {
        setError('root', {
          message: `Before publishing this bilingual invitation, complete: ${missing.join('; ')}.`,
        });
        return;
      }
    }
    const saved = update((current) => ({
      ...current,
      draft: result.data,
      ...(action === 'finish' && hasDashboardAccess(current)
        ? { published: structuredClone(result.data) }
        : {}),
    }));
    if (!saved) {
      notify('Could not save. Your draft is still here; please check the browser storage notice.');
      return;
    }
    reset(result.data);
    notify(
      action === 'finish' && activated
        ? 'Demo invitation updated. Open the guest preview to try it.'
        : 'Draft saved. Your read-only design preview is updated; the published invitation is unchanged.',
    );
    if (action === 'finish' && !activated) window.location.assign('/order/');
  }
  return (
    <div className="studio-shell">
      <div className="workspace-topline">
        <a href="/templates/">
          <ArrowLeft size={15} /> The collection
        </a>
        <span>
          YOUR INVITATION STUDIO <i /> BROWSER SANDBOX
        </span>
        <a href={activated ? '/dashboard/' : '/order/'}>
          {activated ? 'Guest workspace' : 'Your order'} <ArrowUpRightIcon />
        </a>
      </div>
      <div className="studio-intro">
        <div>
          <span className="eyebrow">LET’S MAKE IT PERSONAL</span>
          <h1>
            Your story.<em> Your invitation.</em>
          </h1>
        </div>
        <span className={`save-status ${isDirty ? 'dirty' : ''}`}>
          <i />
          {isDirty ? 'Unsaved changes' : 'Draft ready to edit'}
        </span>
      </div>
      <div className="studio-view-toggle" role="group" aria-label="Mobile studio view">
        <button type="button" aria-pressed={!previewOpen} onClick={() => setPreviewOpen(false)}>
          Edit details
        </button>
        <button type="button" aria-pressed={previewOpen} onClick={() => setPreviewOpen(true)}>
          <Eye size={16} /> Preview invitation
        </button>
      </div>
      <div className="studio-grid">
        <form className="editor-panel" onSubmit={handleSubmit((values) => save(values))}>
          <nav className="editor-steps" aria-label="Invitation editing steps">
            {steps.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-current={step === item.id ? 'step' : undefined}
                className={step === item.id ? 'active' : ''}
                onClick={() => setStep(item.id)}
              >
                <span>{item.number}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="editor-fields">
            {step === 'names' && (
              <>
                <div className="field-section-title">
                  <span>01 / THE TWO OF YOU</span>
                  <h2>
                    Every story starts
                    <br />
                    with a name.
                  </h2>
                  <p>Short names look lovely on the cover. Bangla names are welcome, too.</p>
                </div>
                <div className="field-row">
                  <label>
                    First partner’s name · English
                    <input {...register('partnerOne')} maxLength={120} required placeholder="Mehrin" />
                  </label>
                  <label>
                    Second partner’s name · English
                    <input {...register('partnerTwo')} maxLength={120} required placeholder="Arib" />
                  </label>
                </div>
                <div className="field-row">
                  <label>
                    প্রথম নাম · বাংলা
                    <input {...register('partnerOneBn')} lang="bn" maxLength={120} />
                  </label>
                  <label>
                    দ্বিতীয় নাম · বাংলা
                    <input {...register('partnerTwoBn')} lang="bn" maxLength={120} />
                  </label>
                </div>
                <label>
                  Hosted with love by
                  <input {...register('hosts')} maxLength={300} placeholder="Together with our families" />
                  <small>Optional. Parents, families, or a greeting of your own.</small>
                </label>
                <label>
                  আমন্ত্রণ জানাচ্ছেন · বাংলা
                  <input {...register('hostsBn')} lang="bn" maxLength={300} />
                </label>
                <label>
                  আমন্ত্রণের বার্তা · বাংলা
                  <textarea {...register('message')} lang="bn" maxLength={2000} rows={4} />
                  <small>A warm welcome in your own words. This appears inside the invitation.</small>
                </label>
                <label>
                  Invitation message · English
                  <textarea {...register('messageEn')} lang="en" rows={4} maxLength={2000} />
                  <small>Write both versions deliberately. Names are never translated automatically.</small>
                </label>
                <div className="field-note">
                  <Sparkles size={17} />
                  <p>
                    After order confirmation and dashboard activation, add a personal greeting for every
                    family. Design your main invitation just once.
                  </p>
                </div>
              </>
            )}
            {step === 'events' && (
              <>
                <div className="field-section-title">
                  <span>02 / MAKE A DATE</span>
                  <h2>
                    For every part
                    <br />
                    of the celebration.
                  </h2>
                  <p>All times in this preview use Bangladesh time (Asia/Dhaka).</p>
                </div>
                {values.events.map((event, index) => (
                  <fieldset className="event-fields" key={event.id}>
                    <legend>{index === 0 ? 'The Nikah' : 'The Reception'}</legend>
                    <div className="field-row">
                      <label>
                        Date
                        <input type="date" {...register(`events.${index}.date`)} required />
                      </label>
                      <label>
                        Time
                        <input type="time" {...register(`events.${index}.time`)} required />
                      </label>
                    </div>
                    <div className="field-row">
                      <label>
                        Event title · English
                        <input {...register(`events.${index}.title`)} required maxLength={160} />
                      </label>
                      <label>
                        অনুষ্ঠানের নাম · বাংলা
                        <input {...register(`events.${index}.titleBn`)} lang="bn" maxLength={160} />
                      </label>
                    </div>
                    <label>
                      Venue
                      <input {...register(`events.${index}.venue`)} required maxLength={200} />
                    </label>
                    <label>
                      স্থানের নাম · বাংলা
                      <input {...register(`events.${index}.venueBn`)} lang="bn" maxLength={200} />
                    </label>
                    <label>
                      Address
                      <input {...register(`events.${index}.address`)} maxLength={500} />
                    </label>
                    <label>
                      ঠিকানা · বাংলা
                      <input {...register(`events.${index}.addressBn`)} lang="bn" maxLength={500} />
                    </label>
                  </fieldset>
                ))}
              </>
            )}
            {step === 'design' && (
              <>
                <div className="field-section-title">
                  <span>04 / A LITTLE PAPER MAGIC</span>
                  <h2>
                    Find your
                    <br />
                    kind of beautiful.
                  </h2>
                  <p>One original composition, with three palette explorations in this first preview.</p>
                </div>
                <div className="palette-list">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`palette-option palette-${theme.id} ${values.theme === theme.id ? 'selected' : ''}`}
                      onClick={() => setValue('theme', theme.id, { shouldDirty: true })}
                    >
                      <span className="palette-swatches">
                        <i />
                        <i />
                        <i />
                      </span>
                      <span>
                        <strong>{theme.title}</strong>
                        <small>{theme.category}</small>
                      </span>
                      {values.theme === theme.id && <Check size={17} />}
                    </button>
                  ))}
                </div>
                <div className="design-promise">
                  <span>✧</span>
                  <h3>Designed to feel personal.</h3>
                  <p>
                    Your invitation keeps the same design across guest links. Names, messages and permitted
                    celebrations change for each family.
                  </p>
                </div>
              </>
            )}
            {step === 'photos' && (
              <StudioPhotos
                photos={values.photos ?? []}
                onChange={(photos) => setValue('photos', photos, { shouldDirty: true })}
              />
            )}
            {errors.root && (
              <p role="alert" className="form-error">
                {errors.root.message}
              </p>
            )}
            <div className="editor-bottom">
              <span>Changes are saved when you choose Save draft.</span>
              <button className="button secondary" type="submit">
                <Save size={15} /> Save draft
              </button>
            </div>
          </div>
          <div className="editor-pagination">
            <button
              type="button"
              className="text-link"
              onClick={() => setStep(steps[Math.max(0, steps.findIndex((s) => s.id === step) - 1)].id)}
              disabled={step === 'names'}
            >
              <ArrowLeft size={16} /> Previous
            </button>
            {step !== 'design' ? (
              <button
                type="button"
                className="button button-small"
                onClick={() => setStep(steps[steps.findIndex((s) => s.id === step) + 1].id)}
              >
                Next chapter <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="button button-small"
                onClick={handleSubmit((values) => save(values, 'finish'))}
              >
                {activated ? 'Update demo invitation' : 'Review your order'} <Check size={16} />
              </button>
            )}
          </div>
        </form>
        <aside className="editor-preview">
          <div className="preview-toolbar">
            <span>
              <Eye size={15} /> YOUR LIVE DESIGN PREVIEW
            </span>
            <span>
              Cover <ChevronDown size={12} />
            </span>
          </div>
          <div className="preview-stage">
            <InvitationCover invitation={values} />
          </div>
          <div className="preview-caption">
            <span>Made to look lovely on every screen.</span>
            <a href="/invite/?preview=design" target="_blank" rel="noopener">
              Open saved design preview <ExternalLink size={14} />
            </a>
          </div>
          <div className="preview-hint">
            The cover reflects unsaved edits. Save your draft to see it in the full read-only design preview.
            Dashboard access follows order confirmation and activation.
          </div>
        </aside>
      </div>
      {previewOpen && (
        <Modal title="Your live design" onClose={() => setPreviewOpen(false)}>
          <div className="studio-dialog-cover">
            <InvitationCover invitation={values} />
          </div>
          <p>
            Reflects your current edits. Save your draft before opening the full design preview or reviewing
            your order.
          </p>
        </Modal>
      )}
    </div>
  );
}

function ArrowUpRightIcon() {
  return <ExternalLink size={14} />;
}
