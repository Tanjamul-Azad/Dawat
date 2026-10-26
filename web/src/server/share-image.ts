import 'server-only';
import sharp, { type OverlayOptions } from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findTemplate } from '@/features/production/catalog';
import { drawableText, shareImageSize, type ShareCard, type ShareVariant } from '@/features/production/share';

// Bengali needs real shaping (reph, pre-base vowel signs, conjuncts). next/og (satori) draws
// them in logical order without shaping, so previews are composed with sharp's Pango/HarfBuzz.
// The bundled TTF is Bengali-only; callers pass only text it can draw.
const fontDir = join(process.cwd(), 'assets', 'og');
const fontFile = join(fontDir, 'noto-serif-bengali-500.ttf');
const family = 'Noto Serif Bengali';
const { width: W, height: H } = shareImageSize;

let fontconfigReady = false;
function useBundledFontconfig() {
  // Serverless images ship without /etc/fonts; point fontconfig at the bundled font only.
  if (fontconfigReady || process.env.FONTCONFIG_FILE) return;
  fontconfigReady = true;
  try {
    const dir = join(tmpdir(), 'dawat-fontconfig');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'fonts.conf');
    writeFileSync(
      file,
      `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fontDir}</dir><cachedir>${dir}</cachedir></fontconfig>`,
    );
    process.env.FONTCONFIG_FILE = file;
  } catch {
    /* fontfile below still registers the font with the default configuration. */
  }
}

const escapeMarkup = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!,
  );

async function text(value: string, size: number, color: string, maxWidth: number) {
  const render = (px: number) =>
    sharp({
      text: {
        text: `<span foreground="${color}">${escapeMarkup(value)}</span>`,
        font: `${family} ${px}`,
        fontfile: fontFile,
        rgba: true,
        dpi: 72,
      },
    })
      .png()
      .toBuffer({ resolveWithObject: true });
  let out = await render(size);
  if (out.info.width > maxWidth)
    out = await render(Math.max(12, Math.floor((size * maxWidth) / out.info.width)));
  return out;
}

const artFor = (variant: ShareVariant) =>
  join(
    process.cwd(),
    'public',
    variant === 'dawat' ? 'brand/storefront-hero-match.webp' : findTemplate(variant).art.replace(/^\//, ''),
  );

function background(variant: ShareVariant) {
  // Portrait template art centre-cropped to 1.91:1 keeps its side borders and plain paper centre.
  return sharp(artFor(variant), { failOn: 'error' }).resize(W, H, { fit: 'cover', position: 'centre' });
}

export async function renderShareImage(card: ShareCard): Promise<Buffer> {
  try {
    return await compose(card);
  } catch {
    // Text rendering is the fragile part; the template art alone is still a valid preview.
    return background(card.variant).jpeg({ quality: 82, mozjpeg: true }).timeout({ seconds: 10 }).toBuffer();
  }
}

async function compose({ variant, kicker, title, subtitle }: ShareCard) {
  useBundledFontconfig();
  const brand = variant === 'dawat';
  const color = brand ? '#720e1d' : findTemplate(variant).color;
  const maxWidth = brand ? 470 : 820;
  const lines = [];
  for (const [value, size] of [
    [kicker, 30],
    [title, brand ? 92 : 84],
    [subtitle ?? '', 38],
  ] as const) {
    const drawable = drawableText(value);
    if (drawable) lines.push(await text(drawable, size, color, maxWidth));
  }
  const gap = 26;
  const blockHeight = lines.reduce((sum, l) => sum + l.info.height, 0) + gap * (lines.length - 1);
  let top = Math.round((H - blockHeight) / 2) - (brand ? 0 : 14);
  const layers: OverlayOptions[] = lines.map((l) => {
    const left = brand ? 88 : Math.round((W - l.info.width) / 2);
    const layer = { input: l.data, top, left };
    top += l.info.height + gap;
    return layer;
  });
  if (!brand) {
    const mark = await text('দাওয়াত', 26, color, 300);
    layers.push({
      input: mark.data,
      top: H - 40 - mark.info.height,
      left: Math.round((W - mark.info.width) / 2),
    });
  }
  return background(variant)
    .composite(layers)
    .jpeg({ quality: 82, mozjpeg: true })
    .timeout({ seconds: 10 })
    .toBuffer();
}
