import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { processImage } from './image-processing';
import { MAX_UPLOAD_BYTES } from '@/features/production/media';
describe('Real image decode and private responsive output', () => {
  it('rotates EXIF orientation, strips metadata and bounds responsive dimensions', async () => {
    const input = await sharp({ create: { width: 800, height: 1200, channels: 3, background: '#ac6f55' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const outputs = await processImage(input);
    expect(outputs.map((o) => o.size)).toEqual([480, 960, 1600]);
    expect(outputs[0].width).toBe(480);
    expect(outputs[0].height).toBe(320);
    const meta = await sharp(outputs.at(-1)!.data).metadata();
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(800);
    expect(meta.format).toBe('webp');
    expect(meta.exif).toBeUndefined();
    expect(meta.xmp).toBeUndefined();
    expect(meta.orientation).toBeUndefined();
  });
  it('does not upscale tiny images', async () => {
    const input = await sharp({ create: { width: 32, height: 24, channels: 4, background: '#ffffff80' } })
      .png()
      .toBuffer();
    for (const out of await processImage(input)) {
      expect(out.width).toBe(32);
      expect(out.height).toBe(24);
    }
  });
  it('rejects spoofed HTML, SVG and corrupt images without producing any output', async () => {
    for (const input of [
      Buffer.from('<html>bad</html>'),
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>'),
      Buffer.from([255, 216, 255, 224, 1, 2]),
    ])
      await expect(processImage(input)).rejects.toThrow(/decode|JPEG/);
  });
  it('rejects byte and pixel bombs before allocating decoded images', async () => {
    await expect(processImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1))).rejects.toThrow(/10 MB/);
    const big = await sharp({ create: { width: 5000, height: 4001, channels: 3, background: 'white' } })
      .png()
      .toBuffer();
    await expect(processImage(big)).rejects.toThrow(/20 megapixels|decode/);
  });
  it('rejects multi-frame images', async () => {
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    await expect(processImage(gif)).rejects.toThrow(/still JPEG/);
  });
  it('bounds native decode memory within each server process and permits retry afterwards',async()=>{
    const input=await sharp({create:{width:800,height:1200,channels:3,background:'white'}}).jpeg().toBuffer();
    const first=processImage(input);
    await expect(processImage(input)).rejects.toThrow(/processing is busy/);
    await first;
    expect(await processImage(input)).toHaveLength(3);
  });
});
