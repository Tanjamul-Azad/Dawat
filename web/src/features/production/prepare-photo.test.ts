import { afterEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import { File } from 'node:buffer';
import { imageDimensions, MAX_TRANSPORT_BYTES, preparePhoto } from './prepare-photo';

afterEach(() => vi.unstubAllGlobals());
describe('bounded photo transport', () => {
  it('rejects animated PNG before browser flattening and reads lossless WebP', async () => {
    const png = await sharp({ create: { width: 2, height: 3, channels: 3, background: '#fff' } })
      .png()
      .toBuffer();
    const animation = Buffer.alloc(20);
    animation.writeUInt32BE(8);
    animation.write('acTL', 4);
    expect(() =>
      imageDimensions(
        Uint8Array.from(Buffer.concat([png.subarray(0, 33), animation, png.subarray(33)])).buffer,
      ),
    ).toThrow();
    const lossless = await sharp(png).webp({ lossless: true }).toBuffer();
    expect(imageDimensions(Uint8Array.from(lossless).buffer)).toEqual([2, 3]);
  });
  it.each(['jpeg', 'png', 'webp'] as const)('reads real %s dimensions before decoding', async (format) => {
    const bytes = await sharp({ create: { width: 400, height: 600, channels: 3, background: '#123456' } })
      [format]()
      .toBuffer();
    expect(imageDimensions(Uint8Array.from(bytes).buffer)).toEqual([400, 600]);
  });
  it('rejects corrupt, truncated and excessive-dimension input', async () => {
    const bytes = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } })
      .png()
      .toBuffer();
    bytes.writeUInt32BE(20_000_001, 16);
    expect(() => imageDimensions(Uint8Array.from(bytes).buffer)).toThrow(/20 megapixels/);
    expect(() => imageDimensions(new ArrayBuffer(0))).toThrow();
    expect(() => imageDimensions(Uint8Array.from([255, 216, 255, 192, 255, 255]).buffer)).toThrow();
  });
  it('retains small input and rejects empty/over-limit input without decoding', async () => {
    const small = new File(['small'], 'photo.jpg', { type: 'image/jpeg' });
    expect(await preparePhoto(small as unknown as globalThis.File)).toBe(small);
    await expect(preparePhoto(new File([], 'empty.jpg') as unknown as globalThis.File)).rejects.toThrow(
      /10 MB/,
    );
    await expect(
      preparePhoto(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'huge.jpg') as unknown as globalThis.File,
      ),
    ).rejects.toThrow(/10 MB/);
  });
  it('prepares an oriented large input below transport limit and releases decoded memory', async () => {
    const header = await sharp({ create: { width: 2000, height: 3000, channels: 3, background: '#eee' } })
      .jpeg()
      .toBuffer();
    const file = new File([header, new Uint8Array(MAX_TRANSPORT_BYTES)], 'large.jpg', { type: 'image/jpeg' });
    const close = vi.fn();
    const decode = vi.fn().mockResolvedValue({ width: 3000, height: 2000, close });
    const context = { drawImage: vi.fn() };
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => context,
      toBlob: (callback: (blob: Blob) => void) => callback(new Blob(['encoded'], { type: 'image/webp' })),
    };
    vi.stubGlobal('createImageBitmap', decode);
    vi.stubGlobal('HTMLImageElement', class {});
    vi.stubGlobal('File', File);
    vi.stubGlobal('document', { createElement: () => canvas });
    const result = await preparePhoto(file as unknown as globalThis.File);
    expect(result.size).toBeLessThan(MAX_TRANSPORT_BYTES);
    expect(result.type).toBe('image/webp');
    expect(decode).toHaveBeenCalledWith(file, { imageOrientation: 'from-image' });
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 1067);
    expect(close).toHaveBeenCalledOnce();
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  });
});
