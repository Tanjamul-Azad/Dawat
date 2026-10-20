'use client';
import { useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import type { Invitation } from '@/features/workspace/model';
import s from './studio-photos.module.css';

type Photos = NonNullable<Invitation['photos']>;
async function preparePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type))
    throw new Error('Use a JPEG, PNG, WebP or AVIF photo. Convert HEIC photos first.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose a photo smaller than 12 MB.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight)
      throw new Error('This photo could not be read. Try another file.');
    const ratio = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * ratio);
    canvas.height = Math.round(image.naturalHeight * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Photo processing is unavailable in this browser.');
    ctx.fillStyle = '#f8f3e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    let src = canvas.toDataURL('image/jpeg', 0.8);
    if (src.length > 600000) src = canvas.toDataURL('image/jpeg', 0.6);
    if (src.length > 880000)
      throw new Error('This photo is too detailed for the local preview. Try a smaller file.');
    return src;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export function StudioPhotos({ photos, onChange }: { photos: Photos; onChange: (photos: Photos) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function add(files: FileList | null) {
    if (!files?.length || busy) return;
    setBusy(true);
    setError('');
    const next = [...photos];
    try {
      for (const file of Array.from(files)) {
        if (next.length >= 5) break;
        next.push({
          id: crypto.randomUUID(),
          src: await preparePhoto(file),
          alt: '',
          altBn: '',
          position: 'center',
        });
      }
      onChange(next);
    } catch (failure) {
      if (next.length > photos.length) onChange(next);
      setError(failure instanceof Error ? failure.message : 'This photo could not be processed.');
    } finally {
      setBusy(false);
    }
  }
  function change(index: number, patch: Partial<Photos[number]>) {
    onChange(photos.map((photo, i) => (i === index ? { ...photo, ...patch } : photo)));
  }
  function move(index: number, offset: number) {
    const next = [...photos];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  return (
    <>
      <div className="field-section-title">
        <span>03 / LITTLE MOMENTS</span>
        <h2>
          Your photographs.
          <br />
          Your kind of story.
        </h2>
        <p>
          Up to five photos, or a beautifully composed photo-free edition. Sample photographs are original
          AI-created fictional imagery.
        </p>
      </div>
      <div className={s.list}>
        {photos.map((photo, index) => (
          <article key={photo.id} className={s.photo}>
            <img src={photo.src} alt={photo.alt} style={{ objectPosition: photo.position || 'center' }} />
            <div>
              <label>
                Photo description · English
                <input
                  maxLength={300}
                  value={photo.alt}
                  onChange={(e) => change(index, { alt: e.target.value })}
                />
              </label>
              <label>
                ছবির বর্ণনা · বাংলা
                <input
                  lang="bn"
                  maxLength={300}
                  value={photo.altBn || ''}
                  onChange={(e) => change(index, { altBn: e.target.value })}
                />
              </label>
              <label>
                Photo framing
                <select
                  value={photo.position || 'center'}
                  onChange={(e) => change(index, { position: e.target.value as 'top' | 'center' | 'bottom' })}
                >
                  <option value="top">Keep the top</option>
                  <option value="center">Keep the centre</option>
                  <option value="bottom">Keep the bottom</option>
                </select>
              </label>
              <div className={s.actions}>
                <button
                  type="button"
                  disabled={index === 0 || busy}
                  onClick={() => move(index, -1)}
                  aria-label={`Move photo ${index + 1} earlier`}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  disabled={index === photos.length - 1 || busy}
                  onClick={() => move(index, 1)}
                  aria-label={`Move photo ${index + 1} later`}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onChange(photos.filter((_, i) => i !== index))}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {photos.length < 5 && (
        <label className={s.upload}>
          <ImagePlus size={22} />
          <span>
            {busy ? 'Preparing your photograph…' : 'Choose photographs'}
            <small>JPEG, PNG, WebP or AVIF · up to 12 MB each</small>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={busy}
            onChange={(e) => {
              add(e.target.files);
              e.currentTarget.value = '';
            }}
          />
        </label>
      )}
      {!photos.length && (
        <p className={s.note}>
          Photo-free edition selected. The guest page uses an original botanical/typographic composition
          instead of empty photo frames.
        </p>
      )}
      <p className={s.note}>
        Photos are resized on this device and saved with your draft in browser storage. No server upload is
        connected. If storage fills up, your unsaved photos remain in the editor so you can remove one and
        retry. Add descriptions in both languages for accessible photographs.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
