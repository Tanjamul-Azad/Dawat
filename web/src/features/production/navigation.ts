export const editorSections = ['overview', 'names', 'events', 'photos', 'review'] as const;
export type EditorSection = (typeof editorSections)[number];
export function editorSection(value: unknown): EditorSection {
  return editorSections.includes(value as EditorSection) ? (value as EditorSection) : 'overview';
}
export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string') return '/dashboard/';
  const [pathname, query, extra] = value.split('?');
  if (
    extra !== undefined ||
    !/^\/(dashboard\/?|admin\/orders\/?|weddings\/[0-9a-f-]{36}(?:\/guests)?\/?|auth\/mfa\/?)$/.test(pathname)
  )
    return '/dashboard/';
  if (!query) return pathname;
  if (/^\/dashboard\/?$/.test(pathname) && query === 'all=1') return `${pathname}?all=1`;
  if (
    /^\/weddings\/[0-9a-f-]{36}\/?$/.test(pathname) &&
    /^section=(names|events|photos|review|overview)$/.test(query)
  )
    return `${pathname}?${query}`;
  return '/dashboard/';
}
