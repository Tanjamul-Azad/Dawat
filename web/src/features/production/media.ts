import { z } from 'zod';
export const MAX_PHOTOS = 5;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 20_000_000;
export const mediaPhoto = z
  .object({
    id: z.uuid(),
    src: z.string(),
    alt: z.string().max(300),
    altBn: z.string().max(300).optional(),
    position: z.enum(['top', 'center', 'bottom']).optional(),
  })
  .strict()
  .refine((p) => p.src === `/media/${p.id}/960/`, 'Use a processed photo from this wedding.');
export type MediaAsset = {
  id: string;
  state: 'reserved' | 'processing' | 'ready' | 'rejected';
  width: number | null;
  height: number | null;
  bytes: number | null;
  error_code: string | null;
  expires_at: string;
  created_at: string;
};
export function renderPhotos<T extends { photos?: { id: string; src: string }[] }>(
  content: T,
  base: string,
): T {
  return {
    ...content,
    photos: content.photos?.map((p) => ({
      ...p,
      src: `${base}/${p.id}/960/`,
      thumbnailSrc: `${base}/${p.id}/480/`,
      fullSrc: `${base}/${p.id}/1600/`,
      responsiveSrcSet: `${base}/${p.id}/480/ 480w, ${base}/${p.id}/960/ 960w, ${base}/${p.id}/1600/ 1600w`,
    })),
  };
}
