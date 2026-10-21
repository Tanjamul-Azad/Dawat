'use client';
import { useEffect, useRef, useState } from 'react';
import { Upload, ArrowUp, ArrowDown, Plus, X, RefreshCw, ImageIcon } from 'lucide-react';
import { api } from '@/features/production/client';
import { MAX_PHOTOS, MAX_UPLOAD_BYTES, type MediaAsset } from '@/features/production/media';
import type { DraftContent } from '@/features/production/contracts';
import s from './workspace.module.css';
import { errorText, productText } from '@/features/production/copy';
import { preparePhoto } from '@/features/production/prepare-photo';
export function PhotoLibrary({
  wid,
  photos,
  onChange,
  onWorking,
  disabled,
  locale,
  available = true,
}: {
  wid: string;
  photos: DraftContent['photos'];
  onChange: (p: DraftContent['photos']) => void;
  onWorking: (busy: boolean) => void;
  disabled: boolean;
  locale: 'en' | 'bn';
  available?: boolean;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const pending = useRef<{ file: File; key: string; id?: string } | null>(null);
  const sending = useRef(false);
  const latest = useRef(photos);
  latest.current = photos;
  const root = `/api/weddings/${wid}/media`;
  const t = (en: string, bn: string) => (locale === 'bn' ? bn : en);
  async function refresh() {
    const rows = await api<MediaAsset[]>(`${root}/`);
    setAssets(rows);
    setLoaded(true);
  }
  useEffect(() => {
    void refresh().catch((e) => setError((e as Error).message));
  }, [wid]);
  function update(id: string, changes: Partial<DraftContent['photos'][number]>) {
    onChange(photos.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }
  function move(index: number, delta: number) {
    const next = [...photos];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    onChange(next);
  }
  function add(id: string) {
    if (latest.current.length >= MAX_PHOTOS) {
      setError(t('Choose at most five photos.', 'সর্বোচ্চ পাঁচটি ছবি বেছে নিন।'));
      return;
    }
    if (!latest.current.some((p) => p.id === id))
      onChange([...latest.current, { id, src: `/media/${id}/960/`, alt: '', position: 'center' }]);
  }
  async function upload() {
    if (sending.current || !pending.current) return;
    const attempt = pending.current;
    sending.current = true;
    setBusy(true);
    onWorking(true);
    setError('');
    try {
      setStage(t('Preparing your photo…', 'ছবি প্রস্তুত হচ্ছে…'));
      try {
        attempt.file = await preparePhoto(attempt.file);
      } catch (e) {
        // Preparation failed before reserving a slot; retry requires choosing a valid input.
        pending.current = null;
        throw e;
      }
      setStage(t('Reserving your photo…', 'ছবির জায়গা প্রস্তুত হচ্ছে…'));
      if (!attempt.id) {
        const row = await api<MediaAsset>(`${root}/`, { method: 'POST', key: attempt.key });
        attempt.id = row.id;
      }
      setStage(t('Uploading & preparing your photo…', 'ছবি আপলোড ও প্রস্তুত হচ্ছে…'));
      const response = await fetch(`${root}/${attempt.id}/`, {
        signal: AbortSignal.timeout(150_000),
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': attempt.file.type },
        body: attempt.file,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if ([413, 422].includes(response.status)) pending.current = null;
        throw new Error(result?.message ?? 'Photo upload interrupted. Retry the same file.');
      }
      if (result?.data?.id !== attempt.id || result?.data?.state !== 'ready')
        throw new Error('Photo upload interrupted. Retry the same file.');
      add(attempt.id);
      pending.current = null;
      await refresh();
      setStage(
        t(
          'Photo prepared. Add a description, then save your draft.',
          'ছবি প্রস্তুত। বিবরণ লিখে খসড়া সংরক্ষণ করুন।',
        ),
      );
    } catch (e) {
      setError(
        (e as Error).name === 'TimeoutError'
          ? t(
              'Photo upload timed out. Retry the same file.',
              'আপলোডের সময়সীমা শেষ। একই ছবি দিয়ে আবার চেষ্টা করুন।',
            )
          : errorText((e as Error).message, locale),
      );
      setStage('');
      void refresh().catch(() => {});
    } finally {
      sending.current = false;
      setBusy(false);
      onWorking(false);
    }
  }
  async function removeAsset(id: string) {
    if (sending.current) return;
    setBusy(true);
    onWorking(true);
    setError('');
    try {
      await api(`${root}/${id}/`, { method: 'DELETE' });
      if (pending.current?.id === id) pending.current = null;
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      onWorking(false);
    }
  }
  return (
    <section className={`${s.panel} ${s.form}`}>
      <p className={s.eyebrow}>{t('A little of your story', 'আপনাদের গল্পের কিছু মুহূর্ত')}</p>
      <h2>
        {t('Your photographs', 'আপনাদের ছবি')}{' '}
        <small>
          {new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(photos.length)}/
          {locale === 'bn' ? '৫' : '5'}
        </small>
      </h2>
      {!available && (
        <p role="status" className={s.notice}>
          {t(
            'Photo uploads are not available yet. You can still edit and save the other invitation details.',
            'ছবি আপলোড সেবা এখনও চালু হয়নি। অন্য তথ্য সম্পাদনা ও সংরক্ষণ করতে পারবেন।',
          )}
        </p>
      )}
      <p className={s.muted}>
        {t(
          'Up to five JPEG, PNG or WebP photos. Maximum 10 MB and 20 megapixels each. For HEIC, export a JPEG first.',
          'সর্বোচ্চ পাঁচটি JPEG, PNG বা WebP ছবি। প্রতিটি সর্বোচ্চ ১০ MB ও ২০ মেগাপিক্সেল। HEIC হলে আগে JPEG করুন।',
        )}
      </p>
      <label className={s.photoUpload}>
        <Upload size={20} />
        <span>{busy ? stage : t('Choose a photograph', 'ছবি বেছে নিন')}</span>
        <input
          aria-label={t('Upload a photograph', 'ছবি আপলোড')}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={!available || disabled || busy || !loaded || photos.length >= 5}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
              setError(
                t(
                  'Choose JPEG, PNG or WebP. Convert HEIC to JPEG first.',
                  'JPEG, PNG বা WebP দিন। HEIC আগে JPEG করুন।',
                ),
              );
              return;
            }
            if (!file.size || file.size > MAX_UPLOAD_BYTES) {
              setError(t('Choose a photo up to 10 MB.', 'সর্বোচ্চ ১০ MB-এর ছবি দিন।'));
              return;
            }
            pending.current = { file, key: crypto.randomUUID() };
            void upload();
          }}
        />
      </label>
      {stage && !busy && (
        <p className={s.notice} role="status">
          {stage}
        </p>
      )}
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      {error && pending.current && (
        <button className={s.secondary} disabled={busy || disabled} onClick={upload}>
          <RefreshCw size={14} />
          {t('Retry same photo', 'একই ছবি আবার চেষ্টা করুন')}
        </button>
      )}
      {!loaded && (
        <button
          className={s.secondary}
          disabled={busy}
          onClick={() => void refresh().catch((e) => setError((e as Error).message))}
        >
          {t('Load photo library', 'ছবির তালিকা দেখুন')}
        </button>
      )}
      <div className={s.photoList}>
        {photos.map((p, index) => (
          <div className={s.photoRow} key={p.id}>
            <img
              src={`${root}/${p.id}/480/`}
              alt={p.alt || t('Selected photo', 'নির্বাচিত ছবি')}
              width={96}
              height={120}
              style={{ objectPosition: p.position || 'center' }}
            />
            <div className={s.photoDetails}>
              <label>
                {t('Photo description', 'ছবির বিবরণ')}
                <input
                  disabled={disabled || busy}
                  maxLength={300}
                  value={p.alt}
                  onChange={(e) => update(p.id, { alt: e.target.value })}
                />
              </label>
              <label>
                বাংলা বিবরণ
                <input
                  disabled={disabled || busy}
                  maxLength={300}
                  value={p.altBn ?? ''}
                  onChange={(e) => update(p.id, { altBn: e.target.value })}
                />
              </label>
              <label>
                {t('Frame focus', 'ফ্রেমের ফোকাস')}
                <select
                  disabled={disabled || busy}
                  value={p.position ?? 'center'}
                  onChange={(e) => update(p.id, { position: e.target.value as 'top' | 'center' | 'bottom' })}
                >
                  <option value="top">{t('Top', 'উপরে')}</option>
                  <option value="center">{t('Center', 'মাঝে')}</option>
                  <option value="bottom">{t('Bottom', 'নিচে')}</option>
                </select>
              </label>
              <div className={s.actions}>
                <button
                  className={s.secondary}
                  aria-label={t(
                    `Move photo ${index + 1} earlier`,
                    `ছবি ${new Intl.NumberFormat('bn-BD').format(index + 1)} আগে নিন`,
                  )}
                  disabled={disabled || busy || index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  className={s.secondary}
                  aria-label={t(
                    `Move photo ${index + 1} later`,
                    `ছবি ${new Intl.NumberFormat('bn-BD').format(index + 1)} পরে নিন`,
                  )}
                  disabled={disabled || busy || index === photos.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  className={s.secondary}
                  disabled={disabled || busy}
                  onClick={() => onChange(photos.filter((item) => item.id !== p.id))}
                >
                  <X size={14} />
                  {t('Remove from gallery', 'গ্যালারি থেকে সরান')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!photos.length && (
        <p className={s.muted}>
          <ImageIcon size={16} />{' '}
          {t('A photo-free invitation is beautiful too.', 'ছবি ছাড়াও আমন্ত্রণ সুন্দর থাকবে।')}
        </p>
      )}
      {assets.filter((a) => !photos.some((p) => p.id === a.id)).length > 0 && (
        <details>
          <summary>{t('Unused photos & unfinished uploads', 'অব্যবহৃত ছবি ও অসমাপ্ত আপলোড')}</summary>
          {assets
            .filter((a) => !photos.some((p) => p.id === a.id))
            .map((a) => (
              <div key={a.id} className={s.householdRow}>
                <span>
                  {a.state === 'ready'
                    ? t('Ready photograph', 'প্রস্তুত ছবি')
                    : productText(a.error_code || a.state, locale)}
                </span>
                <div className={s.actions}>
                  {a.state === 'ready' && (
                    <button
                      className={s.secondary}
                      disabled={disabled || busy || photos.length >= 5}
                      onClick={() => add(a.id)}
                    >
                      <Plus size={14} />
                      {t('Add', 'যোগ করুন')}
                    </button>
                  )}
                  <button
                    className={s.secondary}
                    disabled={disabled || busy}
                    onClick={() => removeAsset(a.id)}
                  >
                    {t('Remove unused', 'অব্যবহৃতটি সরান')}
                  </button>
                </div>
              </div>
            ))}
          <p className={s.muted}>
            {t(
              'Save gallery removals first. Earlier published invitations retain the photos they use.',
              'আগে গ্যালারির পরিবর্তন সংরক্ষণ করুন। আগের প্রকাশিত আমন্ত্রণে ব্যবহৃত ছবি অক্ষত থাকবে।',
            )}
          </p>
        </details>
      )}
      <p className={s.muted}>
        {t(
          'Save prepares the gallery. Publish makes changes visible to your guests.',
          'সংরক্ষণে খসড়া প্রস্তুত হবে। প্রকাশ করলে অতিথিরা পরিবর্তন দেখবেন।',
        )}
      </p>
    </section>
  );
}
