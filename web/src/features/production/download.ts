'use client';
import { errorText } from './copy';
export async function downloadCsv(path: string) {
  const locale = document.documentElement.lang === 'en' ? 'en' : 'bn';
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      errorText(body?.message ?? 'Could not complete this request. Please retry.', locale, body?.code),
    );
  }
  if (!response.headers.get('content-type')?.startsWith('text/csv'))
    throw new Error(errorText('Could not complete this request. Please retry.', locale));
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dawat-households.csv';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
