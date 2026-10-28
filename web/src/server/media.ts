import 'server-only';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { MAX_UPLOAD_BYTES } from '@/features/production/media';
import { session } from './auth';
import { database } from './supabase';
import { dbError, HttpError, privateHeaders } from './http';
import { mediaProcessor } from './media-admin';
import { ImageProcessorBusy, InvalidImage, processImage } from './image-processing';
export async function listMedia(wid: string) {
  const { db } = await session();
  const gate = await db.from('invitation_drafts').select('wedding_id').eq('wedding_id', wid).maybeSingle();
  dbError(gate.error);
  if (!gate.data) throw new HttpError(404, 'UNAVAILABLE', 'Workspace unavailable.');
  const r = await db
    .from('media_assets')
    .select('id,state,width,height,bytes,error_code,expires_at,created_at')
    .eq('wedding_id', wid)
    .is('removed_at', null)
    .order('created_at')
    .limit(100);
  dbError(r.error);
  return r.data;
}
export async function uploadMedia(request: Request, wid: string, id: string) {
  const { db, user } = await session();
  const gate = await db
    .from('media_assets')
    .select('id')
    .eq('wedding_id', wid)
    .eq('id', id)
    .is('removed_at', null)
    .maybeSingle();
  dbError(gate.error);
  if (!gate.data) throw new HttpError(404, 'UNAVAILABLE', 'Photo unavailable.');
  const admin = mediaProcessor();
  if (
    !['image/jpeg', 'image/png', 'image/webp'].includes(
      request.headers.get('content-type')?.split(';')[0] ?? '',
    )
  )
    throw new HttpError(422, 'IMAGE_TYPE', 'Use JPEG, PNG or WebP. Convert HEIC to JPEG first.');
  const announced = request.headers.get('content-length');
  if (announced && Number(announced) > MAX_UPLOAD_BYTES)
    throw new HttpError(413, 'IMAGE_SIZE', 'Choose a photo up to 10 MB.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(422, 'EMPTY_IMAGE', 'Choose a photo.');
  const lease = crypto.randomUUID();
  const args = { p_wedding_id: wid, p_asset_id: id, p_actor: user.id, p_lease: lease };
  const begun = await admin.rpc('process_media', {
    ...args,
    p_kind: 'begin',
    p_data: {},
  });
  dbError(begun.error);
  const job = z.object({ ready: z.boolean(), prefix: z.string().optional() }).parse(begun.data);
  if (job.ready) return { id, state: 'ready' };
  const uploaded: string[] = [];
  let committed = false;
  try {
    // Acquire a shared lease before buffering bytes: at most four bodies/decodes across instances.
    const chunks: Uint8Array[] = [];
    let total = 0;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      void reader.cancel().catch(() => {});
    }, 30000);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_UPLOAD_BYTES) {
          await reader.cancel();
          throw new HttpError(413, 'IMAGE_SIZE', 'Choose a photo up to 10 MB.');
        }
        chunks.push(value);
      }
    } finally {
      clearTimeout(timeout);
    }
    if (timedOut) throw new HttpError(408, 'UPLOAD_TIMEOUT', 'The upload timed out. Retry the same photo.');
    if (!total) throw new HttpError(422, 'EMPTY_IMAGE', 'Choose a photo.');
    const bytes = Buffer.concat(chunks);
    const fingerprint = await admin.rpc('process_media', {
      ...args,
      p_kind: 'fingerprint',
      p_data: { hash: createHash('sha256').update(bytes).digest('hex') },
    });
    dbError(fingerprint.error);
    const outputs = await processImage(bytes);
    const objects: Record<string, { path: string; bytes: number; hash: string }> = {};
    for (const output of outputs) {
      const path = `${job.prefix}/${output.size}.webp`;
      const r = await admin.storage
        .from('wedding-media')
        .upload(path, output.data, { contentType: 'image/webp', cacheControl: '0', upsert: false });
      if (r.error)
        throw new HttpError(
          503,
          'STORAGE_UNAVAILABLE',
          'Photo storage is temporarily unavailable. Retry the same file.',
        );
      uploaded.push(path);
      objects[output.size] = { path, bytes: output.data.length, hash: output.hash };
    }
    const full = outputs.at(-1)!;
    const completed = await admin.rpc('process_media', {
      ...args,
      p_kind: 'complete',
      p_data: {
        width: full.width,
        height: full.height,
        bytes: outputs.reduce((n, o) => n + o.data.length, 0),
        objects,
      },
    });
    // A network failure may hide a successful commit. Do not delete objects on an uncertain acknowledgement.
    if (completed.error) {
      dbError(completed.error);
    }
    committed = true;
    return { id, state: 'ready' };
  } catch (e) {
    // Invalid inputs never reached Storage. Transient failures release the lease when possible.
    if (e instanceof InvalidImage || (e instanceof HttpError && [413, 422].includes(e.status))) {
      await admin.rpc('process_media', { ...args, p_kind: 'fail', p_data: { retryable: false } });
      throw e instanceof HttpError ? e : new HttpError(422, 'INVALID_IMAGE', e.message);
    }
    if (!committed) {
      const state = await db
        .from('media_assets')
        .select('state')
        .eq('id', id)
        .eq('wedding_id', wid)
        .maybeSingle();
      if (state.data?.state === 'ready') return { id, state: 'ready' };
      if (!state.error) {
        const failed = await admin.rpc('process_media', {
          ...args,
          p_kind: 'fail',
          p_data: { retryable: true },
        });
        if (!failed.error && uploaded.length) await admin.storage.from('wedding-media').remove(uploaded);
      }
    }
    if(e instanceof ImageProcessorBusy)throw new HttpError(503,'PROCESSING_BUSY',e.message);
    throw e;
  }
}
export async function serveMedia(args: {
  assetId: string;
  size: string;
  wid?: string;
  slug?: string;
  hid?: string;
  sessionDigest?: string;
  openDigest?: string;
}) {
  const db = await database();
  const r = args.openDigest ? await db.rpc('resolve_open_media', { p_slug: args.slug!, p_open_digest: args.openDigest, p_asset_id: args.assetId, p_size: args.size }) : await db.rpc('resolve_media', {
    p_asset_id: args.assetId,
    p_size: args.size,
    p_wedding_id: args.wid,
    p_slug: args.slug,
    p_household_id: args.hid,
    p_session_digest: args.sessionDigest,
  });
  dbError(r.error);
  const object = z
    .object({
      path: z.string(),
      bytes: z.number().int().positive(),
      hash: z.string().regex(/^[a-f0-9]{64}$/),
    })
    .parse(r.data);
  const downloaded = await mediaProcessor().storage.from('wedding-media').download(object.path);
  if (downloaded.error) throw new HttpError(503, 'MEDIA_UNAVAILABLE', 'Photo is temporarily unavailable.');
  if (downloaded.data.size !== object.bytes)
    throw new HttpError(503, 'MEDIA_UNAVAILABLE', 'Photo is temporarily unavailable.');
  return new Response(downloaded.data, {
    headers: {
      ...privateHeaders,
      'Content-Type': 'image/webp',
      'Content-Length': String(object.bytes),
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline; filename="photo.webp"',
    },
  });
}
