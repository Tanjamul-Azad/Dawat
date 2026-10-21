import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { MAX_UPLOAD_BYTES, MAX_IMAGE_PIXELS } from '@/features/production/media';
export class InvalidImage extends Error {}
export class ImageProcessorBusy extends Error {}
let decoding=false;
sharp.cache({ memory: 32, files: 0, items: 16 });
sharp.concurrency(1);
export async function processImage(input: Buffer) {
  if (!input.length || input.length > MAX_UPLOAD_BYTES) throw new InvalidImage('Choose a photo up to 10 MB.');
  if(decoding)throw new ImageProcessorBusy('Photo processing is busy. Retry the same photo shortly.');
  decoding=true;
  try {
    const options = { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'warning' as const, animated: false };
    const metadata = await sharp(input, options).metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) !== 1)
      throw new InvalidImage('Use a still JPEG, PNG or WebP photo. Convert HEIC/HEIF to JPEG first.');
    if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS)
      throw new InvalidImage('Choose a photo up to 20 megapixels.');
    const outputs = [];
    // Sequential bounded decode/encode; rotation follows EXIF, output strips EXIF/GPS/XMP by default.
    for (const size of [480, 960, 1600] as const) {
      const { data, info } = await sharp(input, options)
        .autoOrient()
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .timeout({ seconds: 15 })
        .toBuffer({ resolveWithObject: true });
      if (!data.length || data.length > 3 * 1024 * 1024)
        throw new InvalidImage('This image could not be reduced safely. Choose another photo.');
      outputs.push({
        size,
        data,
        width: info.width,
        height: info.height,
        hash: createHash('sha256').update(data).digest('hex'),
      });
    }
    return outputs;
  } catch (e) {
    if (e instanceof InvalidImage) throw e;
    throw new InvalidImage(
      'This file could not be decoded safely. Use a valid JPEG, PNG or WebP photo up to 20 megapixels.',
    );
  } finally {
    decoding=false;
  }
}
