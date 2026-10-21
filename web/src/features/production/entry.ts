import type { WeddingSummary } from './contracts';
export function singleWeddingDestination(weddings: WeddingSummary[], listRequested: boolean): string | null {
  if (listRequested || weddings.length !== 1 || weddings[0].state !== 'active') return null;
  return `/weddings/${weddings[0].id}/`;
}
