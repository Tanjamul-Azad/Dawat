import 'server-only';
import { z } from 'zod';
import { config, backendConfigured } from './config';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function dbError(error: { code: string; message: string } | null) {
  if (!error) return;
  if (/^PT(401|403|404|409|422|429)$/.test(error.code))
    throw new HttpError(Number(error.code.slice(2)), error.code, error.message);
  if (error.code === '23505')
    throw new HttpError(
      409,
      'DUPLICATE',
      'This record or payment reference already exists. Refresh and review.',
    );
  throw new HttpError(
    503,
    'DATABASE_UNAVAILABLE',
    'The server could not complete this request. Please retry.',
  );
}
export function sameOrigin(request: Request) {
  if (request.headers.get('origin') !== config().origin)
    throw new HttpError(403, 'ORIGIN', 'Please use the application to perform this action.');
}
export async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new HttpError(400, 'CONTENT_TYPE', 'Send JSON content.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'BODY', 'Missing request.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 80000) {
      await reader.cancel();
      throw new HttpError(413, 'BODY_TOO_LARGE', 'This request is too large.');
    }
    chunks.push(value);
  }
  let json: unknown;
  try {
    json = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'JSON', 'Invalid JSON content.');
  }
  return schema.parse(json);
}
export const privateHeaders = {
  'Cache-Control': 'private, no-store',
  Vary: 'Cookie',
  'X-Robots-Tag': 'noindex, nofollow',
};
export async function endpoint(request: Request, run: () => Promise<unknown>) {
  const requestId = crypto.randomUUID();
  try {
    if (!backendConfigured())
      throw new HttpError(503, 'SETUP_REQUIRED', 'The backend has not been configured.');
    if (request.method !== 'GET') sameOrigin(request);
    const data = await run();
    if (data instanceof Response) return data;
    return Response.json({ data, requestId }, { headers: privateHeaders });
  } catch (e) {
    const error =
      e instanceof HttpError
        ? e
        : e instanceof z.ZodError
          ? new HttpError(422, 'VALIDATION', e.issues[0]?.message ?? 'Check the form.')
          : new HttpError(503, 'UNAVAILABLE', 'This request could not be completed. Please retry.');
    // Never log cookies, OTPs, email addresses, content or request bodies.
    if (error.status >= 500) console.error('request_failed', { requestId, code: error.code });
    return Response.json(
      { code: error.code, message: error.message, requestId },
      {
        status: error.status,
        headers: { ...privateHeaders, ...(error.status === 429 ? { 'Retry-After': '60' } : {}) },
      },
    );
  }
}
