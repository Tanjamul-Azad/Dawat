// Also bounds reading response bodies: AbortSignal stays active after headers arrive.
export const serverFetch: typeof fetch = (input, init) => {
  const existing = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const timeout = AbortSignal.timeout(20_000);
  return fetch(input, { ...init, signal: existing ? AbortSignal.any([existing, timeout]) : timeout });
};
