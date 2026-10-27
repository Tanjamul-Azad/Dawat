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
    !/^\/(dashboard\/?|admin\/(?:orders|requests)\/?|order\/requests\/?|weddings\/[0-9a-f-]{36}(?:\/guests)?\/?|auth\/mfa\/?)$/.test(
      pathname,
    )
  )
    return '/dashboard/';
  if (!query) return pathname;
  if (
    /^\/order\/requests\/?$/.test(pathname) &&
    /^(template=(jamdani|ivory|holud|garden|midnight|rose|custom))?(&?names=[^&#]{1,400})?$/.test(query)
  )
    return `${pathname}?${query}`;
  if (/^\/dashboard\/?$/.test(pathname) && query === 'all=1') return `${pathname}?all=1`;
  if (/^\/admin\/orders\/?$/.test(pathname) && /^order=[0-9a-f-]{36}$/i.test(query))
    return `${pathname}?${query}`;
  if (
    /^\/weddings\/[0-9a-f-]{36}\/?$/.test(pathname) &&
    /^section=(names|events|photos|review|overview)$/.test(query)
  )
    return `${pathname}?${query}`;
  return '/dashboard/';
}

/** Couple names handed over from the public site (`?names=`): short plain text, never markup. */
export function couplePrefill(value: unknown): string {
  if (typeof value !== 'string') return '';
  return (
    value
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120)
  );
}
