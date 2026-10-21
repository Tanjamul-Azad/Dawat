import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
vi.mock('server-only', () => ({}));
import { body, endpoint } from './http';
import { safeReturnPath } from '@/features/production/navigation';
import { config } from './config';
it('returns to a scoped guest manager after login without accepting query redirects', () => {
  const path = '/weddings/10000000-0000-4000-8000-000000000001/guests/';
  expect(safeReturnPath(path)).toBe(path);
  expect(safeReturnPath(path + '?next=https://outside.example')).toBe('/dashboard/');
});
beforeEach(() => {
  vi.stubEnv('APP_ORIGIN', 'http://127.0.0.1:3000');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-publishable-key');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe('HTTP security boundaries', () => {
  it('cancels a stalled JSON body without waiting forever for its stream', async () => {
    vi.useFakeTimers();
    let cancelled = false;
    const stream = new ReadableStream({
      cancel() {
        cancelled = true;
      },
    });
    const req = new Request('http://127.0.0.1:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: stream,
      duplex: 'half',
    } as RequestInit);
    const pending = body(req, z.object({})).catch((error) => error);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await pending).toMatchObject({ status: 408, code: 'BODY_TIMEOUT' });
    expect(cancelled).toBe(true);
  });
  it('allows local production-build review but requires HTTPS for hosted origins', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(config().origin).toBe('http://127.0.0.1:3000');
    vi.stubEnv('APP_ORIGIN', 'http://dawat.example');
    expect(() => config()).toThrow(/HTTPS/);
    vi.stubEnv('APP_ORIGIN', 'https://dawat.example');
    expect(config().origin).toBe('https://dawat.example');
  });
  it.each([
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/dashboard/?next=https://evil.test',
    '/dashboard/%0aevil',
    '/weddings/not-a-uuid',
  ])('rejects unsafe return destination %s', (value) => {
    expect(safeReturnPath(value)).toBe('/dashboard/');
  });
  it('retains an allowed scoped destination', () =>
    expect(safeReturnPath('/weddings/10000000-0000-4000-8000-000000000001/')).toContain('/weddings/'));
  it('blocks cookie mutations without the exact configured origin', async () => {
    for (const origin of [undefined, 'https://evil.test', 'null', 'http://localhost:3000']) {
      const action = vi.fn();
      const r = await endpoint(
        new Request('http://127.0.0.1:3000/api/weddings/', {
          method: 'POST',
          headers: origin ? { origin } : {},
        }),
        action,
      );
      expect(r.status).toBe(403);
      expect(action).not.toHaveBeenCalled();
    }
  });
  it('never caches private successes or errors', async () => {
    const r = await endpoint(new Request('http://127.0.0.1:3000/api/weddings/'), async () => ({ ok: true }));
    expect(r.headers.get('cache-control')).toBe('private, no-store');
    expect(r.headers.get('vary')).toBe('Cookie');
  });
  it('bounds streamed JSON even without a content-length header', async () => {
    const request = new Request('http://127.0.0.1:3000/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'x'.repeat(80001) }),
    });
    await expect(body(request, z.object({ value: z.string() }))).rejects.toMatchObject({ status: 413 });
  });
  it('rejects invalid JSON and unexpected command fields', async () => {
    const request = (raw: string) =>
      new Request('http://127.0.0.1:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: raw,
      });
    await expect(body(request('{broken'), z.object({}))).rejects.toMatchObject({ status: 400 });
    await expect(body(request('{"admin":true}'), z.object({}).strict())).rejects.toBeInstanceOf(z.ZodError);
  });
});
