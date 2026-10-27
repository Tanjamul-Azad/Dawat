import { describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
vi.mock('server-only', () => ({}));
import { renderShareImage } from './share-image';
import { invitationCard, shareVariants, storefrontCard } from '@/features/production/share';

// Set OG_PREVIEW_DIR to write the rendered previews for visual review.
const keep = (name: string, data: Buffer) => {
  const dir = process.env.OG_PREVIEW_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), data);
};

describe('link preview images', () => {
  it.each(shareVariants)('renders %s as a 1200×630 JPEG small enough for WhatsApp', async (variant) => {
    const data = await renderShareImage(storefrontCard(variant));
    keep(`${variant}.jpg`, data);
    const meta = await sharp(data).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(['jpeg', 1200, 630]);
    expect(data.length).toBeLessThan(300 * 1024);
  });

  it('draws a published invitation and ignores markup in names', async () => {
    const data = await renderShareImage(
      invitationCard({
        names: 'মেহরিন ও আরিফ',
        imageNames: 'মেহরিন <span size="900">ও</span> আরিফ & পরিবার',
        date: '১৪ ফেব্রুয়ারী ২০২৭',
        templateId: 'midnight',
      }),
    );
    keep('invitation.jpg', data);
    expect((await sharp(data).metadata()).width).toBe(1200);
  });
});
