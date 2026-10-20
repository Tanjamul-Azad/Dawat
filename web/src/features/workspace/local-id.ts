// Local prototype records also work in a private-network HTTP phone preview.
// Production identifiers and guest authorization will come from the server.
export function localId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
