export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string') return '/dashboard/';
  return /^\/(dashboard\/?|admin\/orders\/?|weddings\/[0-9a-f-]{36}(?:\/guests)?\/?|auth\/mfa\/?)$/.test(value)
    ? value
    : '/dashboard/';
}
