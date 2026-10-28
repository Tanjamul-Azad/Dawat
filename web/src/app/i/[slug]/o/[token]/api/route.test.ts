import { afterEach, expect, it, vi } from 'vitest';
import { POST } from './route';
const { join } = vi.hoisted(() => ({ join: vi.fn() }));
vi.mock('@/server/open-invite', () => ({ joinOpenInvitation: join }));
vi.mock('@/server/http', () => ({
  privateHeaders: { 'Cache-Control': 'private, no-store' },
  body: async (request: Request, schema: { parse: (input: unknown) => unknown }) => schema.parse(await request.json()),
  endpoint: async (_request: Request, run: () => Promise<Response>) => { try { return await run(); } catch { return new Response(null, { status: 422 }); } },
}));
const slug = '20000000-0000-4000-8000-000000000001';
const ctx = { params: Promise.resolve({ slug, token: 'a'.repeat(43) }) };
afterEach(() => vi.clearAllMocks());
it('rejects a filled honeypot before issuing any database or session work', async () => {
  const r = await POST(new Request('http://127.0.0.1/api', { method: 'POST', body: JSON.stringify({ name: 'Test', phone: '', website: 'spam' }) }), ctx);
  expect(r.status).toBe(422); expect(join).not.toHaveBeenCalled();
});
it('normalizes the phone, establishes the session and returns a private 303 household redirect', async () => {
  join.mockResolvedValue(`/i/${slug}/h/${slug}/`);
  const r = await POST(new Request('http://127.0.0.1/api', { method: 'POST', body: JSON.stringify({ name: 'Guest', phone: '০১৭০০০০০০০১', website: '' }) }), ctx);
  expect(join.mock.calls[0][2]).toMatchObject({ phone: '+8801700000001' });
  expect(r.status).toBe(303); expect(r.headers.get('location')).toBe(`/i/${slug}/h/${slug}/`);
  expect(r.headers.get('cache-control')).toBe('private, no-store');
});
