'use client';
import { errorText } from './copy';
export class RequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options?: { method?: string; body?: unknown; key?: string },
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 30_000);
  const locale = () =>
    typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'bn';
  try {
    const response = await fetch(path, {
      signal: controller.signal,
      method: options?.method ?? 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        ...(options?.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options?.key ? { 'Idempotency-Key': options.key } : {}),
      },
      ...(options?.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });
    const result = await response.json().catch((error) => {
      if (controller.signal.aborted) throw error;
      return null;
    });
    if (!response.ok)
      throw new RequestError(
        response.status,
        result?.code ?? 'REQUEST_FAILED',
        errorText(
          result?.message ?? 'Could not complete this request. Please retry.',
          locale(),
          result?.code,
        ),
      );
    if (!result || !Object.hasOwn(result, 'data'))
      throw new RequestError(
        502,
        'INVALID_RESPONSE',
        errorText('Could not complete this request. Please retry.', locale()),
      );
    return result.data as T;
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(
      0,
      timedOut ? 'TIMEOUT' : 'NETWORK',
      errorText(
        timedOut
          ? 'The request timed out. Your changes may have reached the server. Refresh and review before retrying.'
          : 'The connection was interrupted. Your edits are still here. Please retry.',
        locale(),
      ),
    );
  } finally {
    clearTimeout(timer);
  }
}
