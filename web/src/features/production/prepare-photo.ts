import { MAX_IMAGE_PIXELS, MAX_UPLOAD_BYTES } from './media';

// Keep binary requests and private image responses below serverless payload limits.
export const MAX_TRANSPORT_BYTES = 3 * 1024 * 1024;
const invalid = () => new Error('Use a valid JPEG, PNG or WebP photo up to 20 megapixels.');
export function imageDimensions(bytes: ArrayBuffer): [number, number] {
  const view = new DataView(bytes);
  const data = new Uint8Array(bytes);
  const ascii = (offset: number, length: number) =>
    String.fromCharCode(...data.subarray(offset, offset + length));
  let dimensions: [number, number] | undefined;
  if (data.length >= 24 && ascii(1, 3) === 'PNG' && data[0] === 137 && ascii(12, 4) === 'IHDR') {
    dimensions = [view.getUint32(16), view.getUint32(20)];
    // APNG animation control precedes image data. Do not silently flatten an animation.
    for (let offset = 8; offset + 12 <= data.length; ) {
      const size = view.getUint32(offset);
      const kind = ascii(offset + 4, 4);
      if (kind === 'acTL') throw invalid();
      if (kind === 'IDAT' || kind === 'IEND') break;
      if (size > data.length - offset - 12) throw invalid();
      offset += size + 12;
    }
  } else if (data[0] === 255 && data[1] === 216) {
    let offset = 2;
    while (offset + 3 < data.length) {
      if (data[offset++] !== 255) throw invalid();
      while (offset < data.length && data[offset] === 255) offset++;
      const marker = data[offset++];
      if (marker === 218 || marker === 217) break;
      if (marker === 216 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > data.length) throw invalid();
      const size = view.getUint16(offset);
      if (size < 2 || offset + size > data.length) throw invalid();
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) {
        if (size < 7) throw invalid();
        dimensions = [view.getUint16(offset + 5), view.getUint16(offset + 3)];
        break;
      }
      offset += size;
    }
  } else if (data.length >= 25 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    const kind = ascii(12, 4);
    if (kind === 'VP8X' && data.length >= 30) {
      if (data[20] & 2) throw invalid();
      dimensions = [
        1 + data[24] + (data[25] << 8) + (data[26] << 16),
        1 + data[27] + (data[28] << 8) + (data[29] << 16),
      ];
    } else if (kind === 'VP8 ' && data.length >= 30 && ascii(23, 3) === '\x9d\x01\x2a')
      dimensions = [view.getUint16(26, true) & 16383, view.getUint16(28, true) & 16383];
    else if (kind === 'VP8L' && data[20] === 47) {
      const bits = view.getUint32(21, true);
      dimensions = [(bits & 16383) + 1, ((bits >>> 14) & 16383) + 1];
    }
  }
  if (!dimensions || !dimensions[0] || !dimensions[1] || dimensions[0] * dimensions[1] > MAX_IMAGE_PIXELS)
    throw invalid();
  return dimensions;
}

export async function preparePhoto(file: File): Promise<File> {
  if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new Error('Choose a photo up to 10 MB.');
  if (file.size <= MAX_TRANSPORT_BYTES) return file;
  // Check dimensions before decoding a large input. Server still validates the actual encoded result.
  imageDimensions(await file.arrayBuffer());
  let image: ImageBitmap | HTMLImageElement;
  let url: string | undefined;
  if (typeof createImageBitmap === 'function') {
    try {
      image = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      throw invalid();
    }
  } else {
    url = URL.createObjectURL(file);
    const element = new Image();
    element.src = url;
    try {
      await element.decode();
    } catch {
      URL.revokeObjectURL(url);
      throw invalid();
    }
    image = element;
  }
  const canvas = document.createElement('canvas');
  try {
    const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
    const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
    if (!width || !height || width * height > MAX_IMAGE_PIXELS) throw invalid();
    const ratio = Math.min(1, 1600 / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw invalid();
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const encode = (type: string, quality: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
    for (const quality of [0.86, 0.72, 0.58]) {
      const result = await encode('image/webp', quality);
      if (
        result?.size &&
        result.size <= MAX_TRANSPORT_BYTES &&
        ['image/webp', 'image/png'].includes(result.type)
      )
        return new File([result], 'prepared-photo.' + (result.type === 'image/webp' ? 'webp' : 'png'), {
          type: result.type,
        });
    }
    // Canvas WebP encoding is not supported on every browser. Use a paper-colored JPEG fallback.
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#fffef9';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const fallback = await encode('image/jpeg', 0.8);
    if (fallback?.size && fallback.size <= MAX_TRANSPORT_BYTES && fallback.type === 'image/jpeg')
      return new File([fallback], 'prepared-photo.jpg', { type: 'image/jpeg' });
    throw invalid();
  } finally {
    if ('close' in image) image.close();
    if (url) URL.revokeObjectURL(url);
    canvas.width = 0;
    canvas.height = 0;
  }
}
