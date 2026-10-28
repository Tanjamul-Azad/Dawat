import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest';
const ids = {
  staff: '20000000-0000-4000-8000-000000000001',
  alice: '20000000-0000-4000-8000-000000000002',
  bob: '20000000-0000-4000-8000-000000000003',
};
let db: PGlite;
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const content = {
  partnerOne: 'Mehrin',
  partnerTwo: 'Arib',
  hosts: '',
  message: '',
  theme: 'jamdani',
  photos: [],
  generalEventIds: ['nikah'],
  events: [
    { id: 'nikah', title: 'Nikah', date: '2026-12-11', time: '16:30', venue: 'RESTRICTED', address: '' },
    { id: 'reception', title: 'Reception', date: '2026-12-12', time: '19:00', venue: 'Garden', address: '' },
  ],
};
const household = {
  name: 'রহমান পরিবার',
  nameBn: 'রহমান পরিবার',
  greeting: 'প্রিয় রহমান পরিবার',
  greetingEn: 'Dear Rahman Family',
  message: 'A personal welcome',
  messageEn: 'A personal welcome',
  privateNote: 'PRIVATE HOST NOTE',
  events: [{ eventId: 'reception', maxPeople: 5 }],
};
async function actor(id = ids.alice, aal = 'aal1', role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: id, aal })]);
  await db.exec(`set role ${role}`);
}
async function rpc<T = Record<string, unknown>>(name: string, args: unknown[]) {
  const r = await db.query<{ result: T }>(
    `select public.${name}(${args.map((_, i) => '$' + (i + 1)).join(',')}) as result`,
    args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : a)),
  );
  return r.rows[0].result;
}
async function fixture(owner = ids.alice) {
  await actor(ids.staff, 'aal2');
  const email = owner === ids.alice ? 'alice@example.test' : 'bob@example.test';
  const o = await rpc<{ orderId: string }>('seller_command', [
    crypto.randomUUID(),
    {
      kind: 'create',
      email,
      name: 'Synthetic wedding',
      packageName: 'Synthetic',
      amountMinor: 0,
      termDays: 90,
    },
  ]);
  const c = await rpc<{ weddingId: string }>('seller_command', [
    crypto.randomUUID(),
    {
      kind: 'confirm',
      orderId: o.orderId,
      expectedRevision: 0,
      exception: 'approved',
      reason: 'Synthetic complimentary wedding',
    },
  ]);
  await rpc('seller_command', [
    crypto.randomUUID(),
    {
      kind: 'activate',
      orderId: o.orderId,
      expectedRevision: 1,
      reason: 'Verified synthetic intended owner',
    },
  ]);
  await actor(owner);
  await rpc('save_draft', [c.weddingId, 0, content]);
  await rpc('publish_invitation', [c.weddingId, 1, crypto.randomUUID()]);
  const wid = c.weddingId;
  const slug = (await db.query<{ slug: string }>('select slug from public.weddings where id=$1', [wid]))
    .rows[0].slug;
  const hid = crypto.randomUUID();
  await rpc('save_household', [wid, hid, 0, crypto.randomUUID(), household]);
  const token = crypto.randomUUID();
  await rpc('household_link', [wid, hid, 'copy', 0, crypto.randomUUID(), hash(token), 'c'.repeat(90), 'v1']);
  const session = hash(crypto.randomUUID());
  await actor(ids.alice, 'aal1', 'anon');
  await rpc('exchange_guest_link', [slug, hash(token), session]);
  return { wid, hid, slug, token, session, orderId: o.orderId, owner };
}
const read = (f: Awaited<ReturnType<typeof fixture>>) =>
  rpc<{
    householdRevision: number;
    responseRevision: number;
    policyRevision: number;
    content: typeof content;
    guest: { name: string; responses: Record<string, { adults: number; children: number }> };
    scopes: unknown[];
  }>('guest_invitation', [f.slug, f.hid, f.session]);
const command = (f: Awaited<ReturnType<typeof fixture>>, body: unknown, key = crypto.randomUUID()) =>
  rpc('guest_command', [f.slug, f.hid, f.session, key, body]);
async function replyBody(f: Awaited<ReturnType<typeof fixture>>, override = {}) {
  const d = await read(f);
  return {
    kind: 'response',
    expectedHouseholdRevision: d.householdRevision,
    expectedResponseRevision: d.responseRevision,
    expectedPolicyRevision: d.policyRevision,
    answers: [
      { eventId: 'reception', attendance: 'accepted', adults: 2, children: 1, note: 'See you there' },
    ],
    ...override,
  };
}
describe('Named guest credentials, isolation and real transactional replies', () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`create role anon;create role authenticated;create schema auth;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,banned_until timestamptz,deleted_at timestamptz);
      create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
      create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
      grant usage on schema auth to anon,authenticated;grant execute on all functions in schema auth to anon,authenticated;
      insert into auth.users(id,email,email_confirmed_at) values('${ids.staff}','seller@example.test',now()),('${ids.alice}','alice@example.test',now()),('${ids.bob}','bob@example.test',now());`);
    await db.exec(readFileSync('supabase/migrations/202610200001_foundation.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/202610200002_guest_delivery.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/20261020094118_host_response_tools.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/20261020094619_publication_visibility.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/20261020204524_client_readiness_fixes.sql', 'utf8'));
    await db.exec(
      readFileSync('supabase/migrations/20261021054738_preserve_household_event_scope.sql', 'utf8'),
    );
    await db.exec(readFileSync('supabase/migrations/20261028100000_whatsapp_delivery.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/20261028110000_open_invitation.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/20261028140000_household_duplicate_indexes.sql', 'utf8'));
    await db.query('insert into public.staff_roles(user_id) values($1)', [ids.staff]);
  }, 30000);
  afterAll(async () => db?.close());
  beforeEach(async () => {
    await db.exec('reset role');
    await db.exec('truncate private.rate_limits');
  });

  async function openFixture() {
    const f = await fixture(); await actor();
    const token = crypto.randomUUID();
    await rpc('set_open_invite', [crypto.randomUUID(), f.wid, { expectedRevision: 0, enabled: true, eventIds: ['reception'], maxPeople: 2, greetingBn: 'প্রিয় অতিথি', greetingEn: 'Dear guest', askPhone: true, rotate: false }, hash(token), 'x'.repeat(90), 'v1']);
    return { ...f, openToken: token };
  }
  async function join(f: Awaited<ReturnType<typeof openFixture>>, device = hash(crypto.randomUUID()), ip = hash(crypto.randomUUID()), name = 'Shared guest', phone: string | null = '+8801700000001') {
    await actor(ids.alice, 'aal1', 'anon');
    const session = hash(crypto.randomUUID());
    const proposed = crypto.randomUUID();
    const value = await rpc<{ householdId: string; expiresIn: number }>('join_open_invitation', [f.slug, hash(f.openToken), device, ip, name, phone, session, hash(crypto.randomUUID()), 'y'.repeat(90), 'v1', proposed]);
    return { ...value, session, device };
  }
  it('normalizes the contract at the database boundary, records revision-bound delivery exactly once and isolates contacts', async () => {
    const f = await fixture(); await actor();
    await expect(rpc('save_household', [f.wid, f.hid, 1, crypto.randomUUID(), { ...household, contactPhone: '0171234' }])).rejects.toThrow(/WhatsApp/);
    await rpc('save_household', [f.wid, f.hid, 1, crypto.randomUUID(), { ...household, contactPhone: '+8801700000001' }]);
    const key = crypto.randomUUID();
    const sent = await rpc('record_delivery', [key, f.wid, f.hid, 'whatsapp', 1]);
    expect(await rpc('record_delivery', [key, f.wid, f.hid, 'whatsapp', 1])).toEqual(sent);
    await expect(rpc('record_delivery', [crypto.randomUUID(), f.wid, f.hid, 'whatsapp', 2])).rejects.toThrow(/link changed/);
    let report = await rpc<any>('household_report', [f.wid, 'reception']);
    expect(report.rows[0]).toMatchObject({ contactPhone: '+8801700000001', lastDelivery: { channel: 'whatsapp', linkRevision: 1 } });
    expect(report.rows[0].firstOpenedAt).toBeTruthy(); expect(report.summary.sent).toBe(1);
    expect((await rpc<any>('household_report', [f.wid, 'reception', null, '', 'all', 'unsent'])).rows).toHaveLength(0);
    expect(JSON.stringify(await rpc('export_households', [f.wid, 'reception']))).not.toContain('contact_phone');
    expect(JSON.stringify(await rpc('export_households', [f.wid, 'reception', '', 'all', true]))).toContain('+8801700000001');
    await actor(ids.bob); await expect(rpc('record_delivery', [crypto.randomUUID(), f.wid, f.hid, 'whatsapp', 1])).rejects.toThrow(/unavailable/);
    await actor(ids.alice, 'aal1', 'anon'); expect(JSON.stringify(await read(f))).not.toMatch(/contactPhone|contact_phone|1700000001/);
    await actor(); await rpc('household_link', [f.wid, f.hid, 'rotate', 1, crypto.randomUUID(), hash(crypto.randomUUID()), 'z'.repeat(90), 'v1']);
    report = await rpc<any>('household_report', [f.wid, 'reception']); expect(report.rows[0].firstOpenedAt).toBeNull(); expect(report.summary.sent).toBe(0); expect(report.summary.opened).toBe(0);
    expect(report.rows[0].lastDelivery.linkRevision).toBe(1);
  });
  it('exposes only the opted-in host number, with idempotent revision-checked settings', async () => {
    const f = await fixture(); await actor(); const key = crypto.randomUUID();
    const body = { expectedRevision: 0, hostWhatsapp: '+8801700000002', showHostWhatsapp: false, messageBn: '', messageEn: '' };
    await rpc('set_invite_settings', [key, f.wid, body]); await rpc('set_invite_settings', [key, f.wid, body]);
    await expect(rpc('set_invite_settings', [crypto.randomUUID(), f.wid, body])).rejects.toThrow(/changed/);
    await actor(ids.alice, 'aal1', 'anon'); expect(await read(f)).not.toHaveProperty('hostWhatsapp');
    await actor(); await rpc('set_invite_settings', [crypto.randomUUID(), f.wid, { ...body, expectedRevision: 1, showHostWhatsapp: true }]);
    await actor(ids.alice, 'aal1', 'anon'); expect(await read(f)).toHaveProperty('hostWhatsapp', '+8801700000002');
  });
  it('joins one ordinary scoped household per device, reuses it and supports the existing allowance and RSVP command', async () => {
    const f = await openFixture(); const g = await join(f);
    expect((await join(f, g.device)).householdId).toBe(g.householdId);
    const gf = { ...f, hid: g.householdId, session: g.session };
    const payload = await read(gf); expect(payload.scopes).toEqual([{ eventId: 'reception', maxPeople: 2 }]);
    await expect(command(gf, { ...(await replyBody(gf)), answers: [{ eventId: 'reception', attendance: 'accepted', adults: 3, children: 0, note: '' }] })).rejects.toThrow(/allowance/);
    await command(gf, { ...(await replyBody(gf)), answers: [{ eventId: 'reception', attendance: 'accepted', adults: 2, children: 0, note: '' }] });
    await expect(rpc('guest_invitation', [f.slug, f.hid, g.session])).rejects.toThrow(/unavailable/);
    await expect(db.query('select * from public.households')).rejects.toThrow(/permission denied/);
    await actor(); const report = await rpc<any>('household_report', [f.wid, 'reception', null, '', 'all', 'all', 'open']);
    expect(report.rows).toHaveLength(1); expect(report.rows[0]).toMatchObject({ source: 'open', name: 'Shared guest', contactPhone: '+8801700000001' }); expect(report.summary.openCount).toBe(1);
  });
  it('denies disabled, wrong, paused and expired shared links', async () => {
    const f = await openFixture(); await actor(ids.alice, 'aal1', 'anon');
    await expect(rpc('resolve_open_invitation', [f.slug, hash('wrong')])).rejects.toThrow(/unavailable/);
    await db.exec('reset role'); await db.query('update private.open_invites set enabled=false where wedding_id=$1', [f.wid]);
    await expect(join(f)).rejects.toThrow(/unavailable/);
    await db.exec('reset role'); await db.query('update private.open_invites set enabled=true where wedding_id=$1', [f.wid]); await db.query("update public.weddings set visibility='paused' where id=$1", [f.wid]);
    await expect(join(f)).rejects.toThrow(/unavailable/);
    await db.exec('reset role'); await db.query("update public.weddings set visibility='live' where id=$1", [f.wid]); await db.query("update public.entitlements set starts_at=now()-interval '2 days',expires_at=now()-interval '1 second' where wedding_id=$1", [f.wid]);
    await expect(join(f)).rejects.toThrow(/unavailable/);
  });
  it('validates names and phones, enforces shared-link capacity and the IP limit', async () => {
    const f = await openFixture();
    for (const name of ['', ' '.repeat(3), 'a'.repeat(121), 'guest\nname']) await expect(join(f, undefined, undefined, name)).rejects.toThrow(/name/);
    await expect(join(f, undefined, undefined, 'Guest', '0171234')).rejects.toThrow(/WhatsApp/);
    const ip = hash('synthetic-ip-' + f.wid);
    for (let i = 0; i < 10; i++) await join(f, undefined, ip);
    await expect(join(f, undefined, ip)).rejects.toThrow(/Too many/);
    await db.exec('reset role'); await db.query('update private.open_invites set cap=10 where wedding_id=$1', [f.wid]);
    await expect(join(f)).rejects.toThrow(/full/);
  });
  it('stops old shared URLs after rotation while retaining joined personal sessions and detects duplicates', async () => {
    const f = await openFixture(); const g = await join(f, undefined, undefined, household.name, null);
    await actor();
    const old = await rpc<any>('open_invite_link', [f.wid]);
    await rpc('set_open_invite', [crypto.randomUUID(), f.wid, { expectedRevision: old.revision, enabled: true, eventIds: ['reception'], maxPeople: 2, greetingBn: 'প্রিয় অতিথি', greetingEn: 'Dear guest', askPhone: true, rotate: true }, hash('new-' + f.openToken), 'n'.repeat(90), 'v1']);
    await expect(join(f)).rejects.toThrow(/unavailable/);
    await actor(ids.alice, 'aal1', 'anon'); expect((await read({ ...f, hid: g.householdId, session: g.session })).guest.name).toBe(household.name);
    await actor(); const r = await rpc<any>('household_report', [f.wid, 'reception']); expect(r.rows.find((h: any) => h.id === g.householdId).duplicateOf).toBe(f.hid);
    await rpc('hide_household', [crypto.randomUUID(), f.wid, g.householdId, true]);
    expect((await rpc<any>('household_report', [f.wid, 'reception'])).summary.invited).toBe(1);
    expect((await rpc<any>('household_report', [f.wid, 'reception', null, '', 'hidden'])).rows.map((h: any) => h.id)).toEqual([g.householdId]);
    expect((await rpc<any>('export_households', [f.wid, 'reception'])).rows.map((h: any) => h.id)).toEqual([f.hid]);
    await rpc('hide_household', [crypto.randomUUID(), f.wid, g.householdId, false]); expect((await rpc<any>('household_report', [f.wid, 'reception'])).summary.invited).toBe(2);
  });
  it('pages through 1000 individual/group invitations without duplicates or unbounded result sets', async () => {
    const f = await fixture();
    const added = Array.from({ length: 999 }, (_, index) => ({
      id: crypto.randomUUID(),
      name: `Scale guest ${String(index).padStart(4, '0')}`,
    }));
    await db.exec('reset role');
    await db.query(
      'insert into public.households(id,wedding_id,name) select id,$1,name from jsonb_to_recordset($2::jsonb) as x(id uuid,name text)',
      [f.wid, JSON.stringify(added)],
    );
    await db.query(
      "insert into public.household_events(wedding_id,household_id,event_id,max_people) select wedding_id,id,'reception',1 from public.households where wedding_id=$1 and id<>$2",
      [f.wid, f.hid],
    );
    await actor();
    const seen = new Set<string>();
    let cursor: string | null = null;
    let pages = 0;
    do {
      const report: { rows: { id: string }[]; nextCursor: string | null; summary: { invited: number } } =
        await rpc<{
          rows: { id: string }[];
          nextCursor: string | null;
          summary: { invited: number };
        }>('household_report', [f.wid, 'reception', cursor, '', 'all']);
      expect(report.summary.invited).toBe(1000);
      expect(report.rows).toHaveLength(25);
      for (const row of report.rows) {
        expect(seen.has(row.id)).toBe(false);
        seen.add(row.id);
      }
      cursor = report.nextCursor;
      pages++;
      if (pages > 40) throw Error('Pagination did not terminate');
    } while (cursor);
    expect(pages).toBe(40);
    expect(seen.size).toBe(1000);
    const match = await rpc<{ rows: { name: string }[] }>('household_report', [
      f.wid,
      'reception',
      null,
      'Scale guest 0998',
      'pending',
    ]);
    expect(match.rows.map((row) => row.name)).toEqual(['Scale guest 0998']);
  }, 30000);

  it('supports an individual invitation with one person and rejects an extra guest', async () => {
    const f = await fixture();
    await actor();
    await rpc('save_household', [
      f.wid,
      f.hid,
      1,
      crypto.randomUUID(),
      { ...household, name: 'সাবিহা রহমান', events: [{ eventId: 'reception', maxPeople: 1 }] },
    ]);
    await actor(ids.alice, 'aal1', 'anon');
    const body = await replyBody(f);
    body.answers[0].adults = 1;
    body.answers[0].children = 1;
    await expect(command(f, body)).rejects.toThrow(/allowance|party|people/i);
    body.answers[0].children = 0;
    await command(f, body);
    expect((await read(f)).guest.responses.reception.adults).toBe(1);
  });
  it('keeps pending households reachable when an event is removed, until their scope is reconciled', async () => {
    const f = await fixture();
    await actor();
    const removed = { ...content, events: content.events.filter((e) => e.id === 'nikah') };
    await rpc('save_draft', [f.wid, 1, removed]);
    await expect(rpc('publish_invitation', [f.wid, 2, crypto.randomUUID()])).rejects.toThrow(
      /invited households/,
    );
    await rpc('save_household', [
      f.wid,
      f.hid,
      1,
      crypto.randomUUID(),
      { ...household, events: [{ eventId: 'nikah', maxPeople: 5 }] },
    ]);
    await rpc('publish_invitation', [f.wid, 2, crypto.randomUUID()]);
    await actor(ids.alice, 'aal1', 'anon');
    expect((await read(f)).content.events.map((e) => e.id)).toEqual(['nikah']);
  });
  it('pauses and resumes guest access without resetting replies, links or hosting term', async () => {
    const f = await fixture();
    await command(f, await replyBody(f));
    const stale = await replyBody(f);
    await actor();
    const before = (
      await db.query('select starts_at,expires_at from public.entitlements where wedding_id=$1', [f.wid])
    ).rows[0];
    const key = crypto.randomUUID();
    const pause = await rpc('set_invitation_visibility', [f.wid, 1, false, key]);
    expect(await rpc('set_invitation_visibility', [f.wid, 1, false, key])).toEqual(pause);
    await actor(ids.alice, 'aal1', 'anon');
    await expect(read(f)).rejects.toThrow(/unavailable/);
    await actor();
    await rpc('set_invitation_visibility', [f.wid, 2, true, crypto.randomUUID()]);
    const after = (
      await db.query('select starts_at,expires_at from public.entitlements where wedding_id=$1', [f.wid])
    ).rows[0];
    expect(after).toEqual(before);
    const report = await rpc<{ summary: { accepted: number } }>('household_report', [
      f.wid,
      'reception',
      null,
      '',
      'all',
    ]);
    expect(report.summary.accepted).toBe(1);
    await actor(ids.alice, 'aal1', 'anon');
    expect((await read(f)).guest.name).toBe(household.name);
    await expect(command(f, stale)).rejects.toThrow(/changed/);
  });
  it('rejects foreign, anonymous and stale publication visibility commands', async () => {
    const f = await fixture();
    await actor(ids.bob);
    await expect(rpc('set_invitation_visibility', [f.wid, 1, false, crypto.randomUUID()])).rejects.toThrow(
      /unavailable/,
    );
    await actor(ids.alice, 'aal1', 'anon');
    await expect(rpc('set_invitation_visibility', [f.wid, 1, false, crypto.randomUUID()])).rejects.toThrow(
      /permission denied/,
    );
    await actor();
    await expect(rpc('set_invitation_visibility', [f.wid, 0, false, crypto.randomUUID()])).rejects.toThrow(
      /changed/,
    );
  });
  it('records attributed host corrections once, retains previous reply and rejects stale guest writes', async () => {
    const f = await fixture();
    const guestBody = await replyBody(f);
    await command(f, guestBody);
    const staleGuest = await replyBody(f);
    await actor();
    const correction = {
      expectedResponseRevision: 1,
      expectedHouseholdRevision: 1,
      expectedPolicyRevision: staleGuest.expectedPolicyRevision,
      answer: {
        eventId: 'reception',
        attendance: 'accepted',
        adults: 4,
        children: 1,
        note: 'Confirmed by phone',
      },
      reason: 'Family confirmed five people by phone',
      overrideClosed: false,
    };
    const key = crypto.randomUUID();
    const result = await rpc('correct_response', [f.wid, f.hid, key, correction]);
    expect(await rpc('correct_response', [f.wid, f.hid, key, correction])).toEqual(result);
    await expect(
      rpc('correct_response', [f.wid, f.hid, key, { ...correction, reason: 'Different correction reason' }]),
    ).rejects.toThrow(/retry key/);
    const history = await db.query<{ source: string; actor_id: string; previous: { adults: number } }>(
      "select source,actor_id,previous from public.response_changes where wedding_id=$1 and source='host'",
      [f.wid],
    );
    expect(history.rows).toHaveLength(1);
    expect(history.rows[0]).toMatchObject({ source: 'host', actor_id: ids.alice, previous: { adults: 2 } });
    await actor(ids.alice, 'aal1', 'anon');
    await expect(command(f, staleGuest)).rejects.toThrow(/changed/);
  });
  it('requires explicit closed-policy override and never overrides the invited allowance', async () => {
    const f = await fixture();
    const d = await read(f);
    await actor();
    const policy = await rpc<{ revision: number }>('set_rsvp_policy', [
      f.wid,
      'reception',
      d.policyRevision,
      false,
      null,
    ]);
    const input = {
      expectedResponseRevision: 0,
      expectedHouseholdRevision: 1,
      expectedPolicyRevision: policy.revision,
      answer: { eventId: 'reception', attendance: 'accepted', adults: 6, children: 0, note: '' },
      reason: 'Family confirmed attendance by phone',
      overrideClosed: false,
    };
    await expect(rpc('correct_response', [f.wid, f.hid, crypto.randomUUID(), input])).rejects.toThrow(
      /override/,
    );
    await expect(
      rpc('correct_response', [f.wid, f.hid, crypto.randomUUID(), { ...input, overrideClosed: true }]),
    ).rejects.toThrow(/allowance/);
    await rpc('correct_response', [
      f.wid,
      f.hid,
      crypto.randomUUID(),
      { ...input, overrideClosed: true, answer: { ...input.answer, adults: 3 } },
    ]);
    const history = await db.query<{ override_closed: boolean }>(
      'select override_closed from public.response_changes where wedding_id=$1',
      [f.wid],
    );
    expect(history.rows[0].override_closed).toBe(true);
  });
  it('denies foreign and anonymous corrections, exports and direct audit mutation', async () => {
    const f = await fixture();
    await actor(ids.bob);
    await expect(rpc('correct_response', [f.wid, f.hid, crypto.randomUUID(), {}])).rejects.toThrow(
      /unavailable/,
    );
    await expect(rpc('export_households', [f.wid, 'reception', '', 'all'])).rejects.toThrow(/unavailable/);
    await expect(db.query("update public.response_changes set reason='forged'")).rejects.toThrow(
      /permission denied/,
    );
    await actor(ids.alice, 'aal1', 'anon');
    await expect(rpc('export_households', [f.wid, 'reception', '', 'all'])).rejects.toThrow(
      /permission denied/,
    );
    await expect(rpc('correct_response', [f.wid, f.hid, crypto.randomUUID(), {}])).rejects.toThrow(
      /permission denied/,
    );
  });
  it('exports every matching row beyond UI pagination without credentials or private host notes', async () => {
    const f = await fixture();
    await actor();
    for (let i = 0; i < 27; i++)
      await rpc('save_household', [
        f.wid,
        crypto.randomUUID(),
        0,
        crypto.randomUUID(),
        { ...household, name: `Export household ${i}` },
      ]);
    const output = await rpc<{ rows: unknown[]; eventId: string; asOf: string }>('export_households', [
      f.wid,
      'reception',
      '',
      'all',
    ]);
    expect(output.rows).toHaveLength(28);
    expect(output.eventId).toBe('reception');
    expect(JSON.stringify(output)).not.toMatch(/PRIVATE HOST NOTE|ciphertext|session_digest|link_digest/);
    const filtered = await rpc<{ rows: unknown[] }>('export_households', [
      f.wid,
      'reception',
      'Export household',
      'pending',
    ]);
    expect(filtered.rows).toHaveLength(27);
    const empty = await rpc<{ rows: unknown[] }>('export_households', [f.wid, 'reception', '', 'accepted']);
    expect(empty.rows).toHaveLength(0);
  });
  it('returns only named identity, scoped events and no private notes/credentials', async () => {
    const f = await fixture();
    const d = await read(f);
    expect(d.content.events.map((e) => e.id)).toEqual(['reception']);
    expect(d.guest.name).toBe(household.name);
    const raw = JSON.stringify(d);
    expect(raw).not.toContain('RESTRICTED');
    expect(raw).not.toContain('PRIVATE HOST NOTE');
    expect(raw).not.toContain(f.session);
    expect(raw).not.toContain(f.token);
    await expect(rpc('guest_invitation', [f.slug, f.hid, hash('invalid')])).rejects.toThrow(/unavailable/);
  });
  it('denies direct anonymous tables and private credentials', async () => {
    await actor(ids.alice, 'aal1', 'anon');
    for (const table of ['households', 'household_events', 'responses', 'response_changes', 'wishes'])
      await expect(db.query(`select * from public.${table}`)).rejects.toThrow(/permission denied/);
    await expect(db.query('select * from private.guest_links')).rejects.toThrow(/permission denied/);
  });
  it('isolates owner report, save, preview, copy and policy by wedding', async () => {
    const f = await fixture();
    await actor(ids.bob);
    expect(
      (await db.query('select * from public.households where wedding_id=$1', [f.wid])).rows,
    ).toHaveLength(0);
    for (const [fn, args] of [
      ['household_report', [f.wid, 'reception', null, '', 'all']],
      ['household_preview', [f.wid, f.hid]],
      ['save_household', [f.wid, f.hid, 1, crypto.randomUUID(), household]],
      ['household_link', [f.wid, f.hid, 'copy', 1, crypto.randomUUID(), hash('x'), 'c'.repeat(90), 'v1']],
      ['set_rsvp_policy', [f.wid, 'reception', 1, false, null]],
    ] as [string, unknown[]][])
      await expect(rpc(fn, args)).rejects.toThrow(/unavailable/);
  });
  it('cannot substitute another household, wedding or event even with a valid session', async () => {
    const a = await fixture();
    const b = await fixture(ids.bob);
    await expect(rpc('guest_invitation', [b.slug, b.hid, a.session])).rejects.toThrow(/unavailable/);
    await expect(rpc('guest_invitation', [a.slug, b.hid, a.session])).rejects.toThrow(/unavailable/);
    const body = await replyBody(a, {
      answers: [{ eventId: 'nikah', attendance: 'accepted', adults: 1, children: 0, note: '' }],
    });
    await expect(command(a, body)).rejects.toThrow(/not included/);
    await expect(command(a, { ...(await replyBody(a)), householdId: b.hid })).rejects.toThrow(
      /Invalid response fields/,
    );
  });
  it('copies the same URL material without rotation and handles duplicate household names independently', async () => {
    const f = await fixture();
    await actor(ids.alice);
    const a = await rpc('household_link', [
      f.wid,
      f.hid,
      'copy',
      1,
      crypto.randomUUID(),
      hash('ignored'),
      'x'.repeat(90),
      'v1',
    ]);
    const b = await rpc('household_link', [
      f.wid,
      f.hid,
      'copy',
      1,
      crypto.randomUUID(),
      hash('alsoignored'),
      'y'.repeat(90),
      'v1',
    ]);
    expect(a).toEqual(b);
    const second = crypto.randomUUID();
    await rpc('save_household', [f.wid, second, 0, crypto.randomUUID(), household]);
    expect(
      (await db.query('select id from public.households where wedding_id=$1', [f.wid])).rows,
    ).toHaveLength(2);
  });
  it('persists one response per event and replays an acknowledged result exactly once', async () => {
    const f = await fixture();
    const b = await replyBody(f);
    const key = crypto.randomUUID();
    const receipt = await command(f, b, key);
    expect(await command(f, b, key)).toEqual(receipt);
    await expect(command(f, { ...b, answers: [{ ...b.answers[0], adults: 3 }] }, key)).rejects.toThrow(
      /retry key/,
    );
    expect((await read(f)).responseRevision).toBe(1);
    await actor(ids.alice);
    expect(
      (await db.query('select * from public.responses where household_id=$1', [f.hid])).rows,
    ).toHaveLength(1);
    expect(
      (await db.query('select * from public.response_changes where household_id=$1', [f.hid])).rows,
    ).toHaveLength(1);
  });
  it('conflicts stale aggregate reply revisions and preserves the winning reply', async () => {
    const f = await fixture();
    const b = await replyBody(f);
    await command(f, b);
    await expect(command(f, b)).rejects.toThrow(/changed/);
    await command(
      f,
      await replyBody(f, {
        answers: [{ eventId: 'reception', attendance: 'declined', adults: 0, children: 0, note: '' }],
      }),
    );
    expect((await read(f)).responseRevision).toBe(2);
  });
  it.each([
    { attendance: 'accepted', adults: 0, children: 0 },
    { attendance: 'accepted', adults: 5, children: 1 },
    { attendance: 'declined', adults: 1, children: 0 },
    { attendance: 'accepted', adults: -1, children: 0 },
    { attendance: 'accepted', adults: 1.5, children: 0 },
    { attendance: 'accepted', adults: '2', children: 0 },
    { attendance: 'accepted', adults: 100000000000, children: 0 },
  ])('rejects invalid or contradictory party counts %j', async (counts) => {
    const f = await fixture();
    await expect(
      command(f, await replyBody(f, { answers: [{ eventId: 'reception', note: '', ...counts }] })),
    ).rejects.toThrow();
    expect((await read(f)).responseRevision).toBe(0);
  });
  it('atomically rejects multi-event sets when one answer is unauthorized', async () => {
    const f = await fixture();
    await expect(
      command(
        f,
        await replyBody(f, {
          answers: [
            { eventId: 'reception', attendance: 'accepted', adults: 2, children: 0, note: '' },
            { eventId: 'nikah', attendance: 'accepted', adults: 1, children: 0, note: '' },
          ],
        }),
      ),
    ).rejects.toThrow(/not included/);
    expect((await read(f)).responseRevision).toBe(0);
    await actor(ids.alice);
    expect(
      (await db.query('select * from public.responses where household_id=$1', [f.hid])).rows,
    ).toHaveLength(0);
  });
  it('enforces current deadline/open state and stale policy revision', async () => {
    const f = await fixture();
    const b = await replyBody(f);
    await actor(ids.alice);
    await rpc('set_rsvp_policy', [
      f.wid,
      'reception',
      b.expectedPolicyRevision,
      true,
      '2020-01-01T00:00:00Z',
    ]);
    await actor(ids.alice, 'aal1', 'anon');
    await expect(command(f, b)).rejects.toThrow(/changed/);
    await expect(command(f, await replyBody(f))).rejects.toThrow(/closed/);
  });
  it('rechecks overlay revisions and prevents lowering allowance/removing responded scopes', async () => {
    const f = await fixture();
    const b = await replyBody(f);
    await actor(ids.alice);
    await rpc('save_household', [
      f.wid,
      f.hid,
      1,
      crypto.randomUUID(),
      { ...household, name: 'Updated host name' },
    ]);
    await actor(ids.alice, 'aal1', 'anon');
    await expect(command(f, b)).rejects.toThrow(/changed/);
    await command(f, await replyBody(f));
    await actor(ids.alice);
    await expect(
      rpc('save_household', [
        f.wid,
        f.hid,
        2,
        crypto.randomUUID(),
        { ...household, events: [{ eventId: 'reception', maxPeople: 2 }] },
      ]),
    ).rejects.toThrow(/saved reply/);
  });
  it.each(['rotate', 'revoke'])(
    'invalidates already exchanged sessions after %s while retaining replies',
    async (kind) => {
      const f = await fixture();
      await command(f, await replyBody(f));
      await actor(ids.alice);
      const key = crypto.randomUUID();
      const args = [f.wid, f.hid, kind, 1, key, hash('newtoken'), 'z'.repeat(90), 'v1'];
      const r = await rpc('household_link', args);
      expect(await rpc('household_link', args)).toEqual(r);
      await actor(ids.alice, 'aal1', 'anon');
      await expect(read(f)).rejects.toThrow(/unavailable/);
      await expect(command(f, { kind: 'wish', body: 'Old session' })).rejects.toThrow(/unavailable/);
      await expect(
        rpc('exchange_guest_link', [f.slug, hash(f.token), hash(crypto.randomUUID())]),
      ).rejects.toThrow(/unavailable/);
      await actor(ids.alice);
      expect(
        (await db.query('select * from public.responses where household_id=$1', [f.hid])).rows,
      ).toHaveLength(1);
      if (kind === 'revoke')
        await expect(
          rpc('household_link', [
            f.wid,
            f.hid,
            'copy',
            2,
            crypto.randomUUID(),
            hash('x'),
            'x'.repeat(90),
            'v1',
          ]),
        ).rejects.toThrow(/revoked/);
    },
  );
  it('deduplicates private wishes, derives identity and never changes attendance', async () => {
    const f = await fixture();
    const key = crypto.randomUUID();
    const b = { kind: 'wish', body: 'তোমাদের জন্য অনেক শুভকামনা!' };
    expect(await command(f, b, key)).toEqual(await command(f, b, key));
    await expect(command(f, { ...b, name: 'Injected author' })).rejects.toThrow(/wish/);
    await expect(command(f, { kind: 'wish', body: '\u200b  ' })).rejects.toThrow(/wish/);
    expect((await read(f)).responseRevision).toBe(0);
    await actor(ids.alice);
    expect((await db.query('select * from public.wishes where household_id=$1', [f.hid])).rows).toHaveLength(
      1,
    );
    const r = await rpc<{ summary: { pending: number; accepted: number } }>('household_report', [
      f.wid,
      'reception',
      null,
      '',
      'all',
    ]);
    expect(r.summary.pending).toBe(1);
    expect(r.summary.accepted).toBe(0);
  });
  it('management suspension denies owner access without interrupting guest replies', async () => {
    const f = await fixture();
    await actor(ids.staff, 'aal2');
    await rpc('seller_command', [
      crypto.randomUUID(),
      {
        kind: 'suspend',
        orderId: f.orderId,
        expectedRevision: 2,
        reason: 'Synthetic suspension verification',
      },
    ]);
    await actor(ids.alice);
    await expect(rpc('household_report', [f.wid, 'reception', null, '', 'all'])).rejects.toThrow(
      /unavailable/,
    );
    await actor(ids.alice, 'aal1', 'anon');
    await command(f, await replyBody(f));
    expect((await read(f)).responseRevision).toBe(1);
  });
  it('blocks expired sessions and expired or paused publications', async () => {
    const f = await fixture();
    await db.exec('reset role');
    await db.query("update private.guest_sessions set expires_at=now()-interval '1 second' where digest=$1", [
      f.session,
    ]);
    await actor(ids.alice, 'aal1', 'anon');
    await expect(read(f)).rejects.toThrow(/unavailable/);
  });
});
