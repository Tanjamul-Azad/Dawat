import { afterEach, expect, it, vi } from 'vitest';
import { api } from './client';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('stops a stalled mutation after 30 seconds without automatically replaying it', async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn(
    (_path, options: RequestInit) =>
      new Promise((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }),
  );
  vi.stubGlobal('fetch', fetcher);
  const outcome = api('/api/auth/login/', { method: 'POST', body: { email: 'test@example.test' } }).catch(
    (error) => error,
  );
  await vi.advanceTimersByTimeAsync(30_000);
  const error = await outcome;
  expect(error).toMatchObject({ code: 'TIMEOUT', message: expect.stringContaining('অপেক্ষার সময় শেষ') });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});

it('also bounds waiting for a stalled response body', async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_path, options: RequestInit) => ({
      ok: true,
      json: () =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    })),
  );
  const outcome = api('/api/weddings/').catch((error) => error);
  await vi.advanceTimersByTimeAsync(30_000);
  expect(await outcome).toMatchObject({ code: 'TIMEOUT' });
});

it('reports invalid successful payloads and preserves actionable server errors', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(new Response('<html>Error</html>'))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'OTP_UNAVAILABLE', message: 'Unable to send a code.' }), {
          status: 503,
        }),
      ),
  );
  await expect(api('/api/auth/login/')).rejects.toMatchObject({ status: 502, code: 'INVALID_RESPONSE' });
  await expect(api('/api/auth/login/')).rejects.toMatchObject({ status: 503, code: 'OTP_UNAVAILABLE' });
});
