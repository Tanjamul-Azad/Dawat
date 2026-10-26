import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const { rpc, getGuest, render } = vi.hoisted(() => ({
  rpc: vi.fn(),
  getGuest: vi.fn(),
  render: vi.fn(async () => Buffer.from('jpeg')),
}));
vi.mock('server-only', () => ({}));
vi.mock('@/server/supabase', () => ({ database: async () => ({ rpc }) }));
vi.mock('@/server/guests', () => ({ getGuest }));
vi.mock('@/server/share-image', () => ({ renderShareImage: render }));
import { generateMetadata as generalMetadata } from './page';
import { generateMetadata as householdMetadata } from './h/[hid]/page';
import { generateMetadata as tokenMetadata } from './g/[token]/page';
import { GET as invitationImage } from './og.jpg/route';
import { invitationCard, storefrontCard } from '@/features/production/share';

const slug = '11111111-1111-4111-8111-111111111111';
const hid = '22222222-2222-4222-8222-222222222222';
const token = 'SECRETtokenSECRETtokenSECRETtokenSECRETtok';
const household = 'Rahman Family';
// Published general DTO shape returned by resolve_general_invitation (restricted events removed).
const published = {
  partnerOne: 'Mehrin',
  partnerTwo: 'Arif',
  partnerOneBn: 'মেহরিন',
  partnerTwoBn: 'আরিফ',
  hosts: 'Hosts',
  message: 'Message',
  theme: 'jamdani',
  templateId: 'garden',
  photos: [],
  events: [{ id: 'reception', title: 'Reception', date: '2027-02-14', time: '19:00', venue: 'Garden', address: '' }],
};
const params = <T>(p: T) => ({ params: Promise.resolve(p) });

beforeEach(() => {
  vi.stubEnv('APP_ORIGIN', 'https://dawat.example');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'synthetic-key-only');
  getGuest.mockResolvedValue({ household: { name: household } });
});
afterEach(() => vi.unstubAllEnvs());

it('previews a published invitation with couple names, date and its template art', async () => {
  rpc.mockResolvedValue({ data: published, error: null });
  const meta = await generalMetadata(params({ slug }));
  expect(rpc).toHaveBeenCalledWith('resolve_general_invitation', { p_slug: slug });
  expect(meta.openGraph).toMatchObject({
    title: 'মেহরিন ও আরিফ — বিয়ের আমন্ত্রণ',
    locale: 'bn_BD',
    siteName: 'দাওয়াত',
    url: `/i/${slug}/`,
    images: [{ url: `/i/${slug}/og.jpg`, width: 1200, height: 630 }],
  });
  expect(String(meta.openGraph?.description)).toContain('১৪');
  expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  expect(meta.robots).toEqual({ index: false, follow: false });
});

it('never puts household names, household ids or guest tokens into personal-link metadata', async () => {
  rpc.mockResolvedValue({ data: published, error: null });
  for (const meta of [
    await householdMetadata(params({ slug, hid })),
    await tokenMetadata(params({ slug, token })),
  ]) {
    const serialized = JSON.stringify(meta);
    expect(serialized).toContain('মেহরিন ও আরিফ');
    for (const secret of [token, hid, household, '/g/', '/h/']) expect(serialized).not.toContain(secret);
    expect(meta.openGraph).not.toHaveProperty('url');
    expect(meta.title).toBe('আপনার ব্যক্তিগত বিয়ের আমন্ত্রণ');
  }
  // Metadata reads only the slug's general publication, never the household record.
  expect(getGuest).not.toHaveBeenCalled();
  expect(rpc.mock.calls.every(([fn]) => fn === 'resolve_general_invitation')).toBe(true);
});

it.each([
  ['paused, revoked, expired or unpublished', { data: null, error: { code: 'PT404' } }],
  ['without general-visible events', { data: null, error: { code: 'PT404' } }],
  ['when the service fails', { data: null, error: { code: '500' } }],
])('falls back to generic Dawat metadata %s', async (_label, result) => {
  rpc.mockResolvedValue(result);
  for (const meta of [
    await generalMetadata(params({ slug })),
    await householdMetadata(params({ slug, hid })),
    await tokenMetadata(params({ slug, token })),
  ]) {
    const serialized = JSON.stringify(meta);
    for (const couple of ['মেহরিন', 'Mehrin', 'আরিফ', 'Arif', slug, token, hid])
      expect(serialized).not.toContain(couple);
    expect(meta.openGraph).toMatchObject({ title: 'বিয়ের আমন্ত্রণ', images: [{ url: '/og/dawat.jpg' }] });
  }
});

it('falls back to generic metadata when the database throws or the slug is not a uuid', async () => {
  rpc.mockRejectedValue(new Error('network'));
  expect((await tokenMetadata(params({ slug, token }))).openGraph).toMatchObject({ title: 'বিয়ের আমন্ত্রণ' });
  rpc.mockClear();
  await generalMetadata(params({ slug: 'not-a-uuid' }));
  expect(rpc).not.toHaveBeenCalled();
});

it('rejects draft-only or malformed content instead of previewing it', async () => {
  rpc.mockResolvedValue({ data: { ...published, households: [household] }, error: null });
  expect(JSON.stringify(await generalMetadata(params({ slug })))).not.toContain(household);
});

it('serves the generic image for an unpublished invitation and never caches personal data', async () => {
  rpc.mockResolvedValue({ data: null, error: { code: 'PT404' } });
  const response = await invitationImage(new Request(`https://dawat.example/i/${slug}/og.jpg`), params({ slug }));
  expect(render).toHaveBeenLastCalledWith(storefrontCard('dawat'));
  expect(response.headers.get('content-type')).toBe('image/jpeg');
  expect(response.headers.get('cache-control')).toContain('no-store');

  rpc.mockResolvedValue({ data: published, error: null });
  await invitationImage(new Request(`https://dawat.example/i/${slug}/og.jpg`), params({ slug }));
  expect(render).toHaveBeenLastCalledWith({
    variant: 'garden',
    kicker: 'শুভ বিবাহ',
    title: 'মেহরিন ও আরিফ',
    subtitle: expect.stringContaining('২০২৭'),
  });
  expect(invitationCard(null)).toEqual(storefrontCard('dawat'));
});
