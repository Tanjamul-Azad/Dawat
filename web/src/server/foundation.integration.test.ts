import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';

const seller = '10000000-0000-4000-8000-000000000001';
const alice = '10000000-0000-4000-8000-000000000002';
const bob = '10000000-0000-4000-8000-000000000003';
const unverified = '10000000-0000-4000-8000-000000000004';
let db: PGlite;
const valid = {
  partnerOne: 'মেহরিন',
  partnerTwo: 'আরিব',
  hosts: '',
  message: '',
  theme: 'jamdani',
  photos: [],
  events: [
    { id: 'reception', title: 'Reception', date: '2026-12-12', time: '19:00', venue: 'Dhaka', address: '' },
  ],
};
async function actor(id: string, aal = 'aal1', role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: id, aal })]);
  await db.exec(`set role ${role}`);
}
async function command(body: Record<string, unknown>, key = crypto.randomUUID()) {
  const r = await db.query<{ result: { orderId: string; weddingId: string; revision: number } }>(
    'select public.seller_command($1,$2::jsonb) as result',
    [key, JSON.stringify(body)],
  );
  return r.rows[0].result;
}
async function fixture(email = 'alice@example.test') {
  await actor(seller, 'aal2');
  const o = await command({
    kind: 'create',
    email,
    name: 'Test couple',
    packageName: 'Synthetic pilot',
    amountMinor: 150000,
    termDays: 90,
  });
  const c = await command({
    kind: 'confirm',
    orderId: o.orderId,
    expectedRevision: 0,
    exception: 'approved',
    reason: 'Synthetic complimentary test order',
  });
  await command({
    kind: 'activate',
    orderId: o.orderId,
    expectedRevision: c.revision,
    reason: 'Intended verified owner confirmed',
  });
  return c;
}
async function save(wid: string, rev = 0, content = valid) {
  return db.query('select public.save_draft($1,$2,$3::jsonb) as result', [wid, rev, JSON.stringify(content)]);
}
async function publish(wid: string, rev: number, key = crypto.randomUUID()) {
  return db.query('select public.publish_invitation($1,$2,$3) as result', [wid, rev, key]);
}
describe('PostgreSQL foundation: real roles, RLS and transactions', () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon nologin; create role authenticated nologin;
      create schema auth;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,banned_until timestamptz,deleted_at timestamptz);
      create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
      create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
      grant usage on schema auth to authenticated,anon;
      grant execute on all functions in schema auth to authenticated,anon;
      insert into auth.users(id,email,email_confirmed_at,banned_until) values
        ('${seller}','seller@example.test',now(),null),('${alice}','alice@example.test',now(),null),
        ('${bob}','bob@example.test',now(),null),('${unverified}','unverified@example.test',null,null);
    `);
    await db.exec(readFileSync('supabase/migrations/202610200001_foundation.sql', 'utf8'));
    await db.exec(readFileSync('supabase/migrations/20261020204524_client_readiness_fixes.sql', 'utf8'));
    await db.query('insert into public.staff_roles(user_id) values($1)', [seller]);
  }, 30000);
  afterAll(async () => {
    await db?.close();
  });
  beforeEach(async () => {
    await actor(seller, 'aal2');
  });

  it('rejects anonymous commands', async () => {
    await actor(alice, 'aal1', 'anon');
    await expect(command({ kind: 'create' })).rejects.toThrow(/permission denied/);
  });
  it('allows incomplete drafts but blocks invisible required names and venues on publication', async () => {
    const f = await fixture();
    await actor(alice);
    const invisible = { ...valid, partnerOne: '\u200b' };
    await save(f.weddingId, 0, invisible);
    await expect(publish(f.weddingId, 1)).rejects.toThrow(/both names/);
    const venue = { ...valid, events: [{ ...valid.events[0], venue: '\u200d' }] };
    await save(f.weddingId, 1, venue);
    await expect(publish(f.weddingId, 2)).rejects.toThrow(/celebration/);
    await save(f.weddingId, 2, valid);
    await expect(publish(f.weddingId, 3)).resolves.toBeDefined();
  });
  it('rejects customer escalation and seller without MFA', async () => {
    await actor(alice, 'aal2');
    await expect(command({ kind: 'create' })).rejects.toThrow(/seller MFA/);
    await expect(db.query('insert into public.staff_roles(user_id) values($1)', [alice])).rejects.toThrow(
      /permission denied/,
    );
    await actor(seller);
    await expect(command({ kind: 'create' })).rejects.toThrow(/seller MFA/);
  });
  it('replays create once and rejects changed payload with same key', async () => {
    const key = crypto.randomUUID();
    const body = {
      kind: 'create',
      email: 'alice@example.test',
      name: 'Alice',
      packageName: 'Test',
      amountMinor: 0,
      termDays: 30,
    };
    const a = await command(body, key);
    expect(await command(body, key)).toEqual(a);
    await expect(command({ ...body, termDays: 60 }, key)).rejects.toThrow(/another action/);
  });
  it('requires real financial evidence or an explicit exception', async () => {
    const o = await command({
      kind: 'create',
      email: 'alice@example.test',
      name: 'Alice',
      packageName: 'Test',
      amountMinor: 100,
      termDays: 30,
    });
    await expect(
      command({
        kind: 'confirm',
        orderId: o.orderId,
        expectedRevision: null,
        reason: 'Review expected revision protection',
        exception: 'approved',
      }),
    ).rejects.toThrow(/Order changed/);
    await expect(
      command({
        kind: 'confirm',
        orderId: o.orderId,
        expectedRevision: 0,
        reason: 'Confirm after payment review',
      }),
    ).rejects.toThrow(/Verify payment/);
    await expect(
      command({
        kind: 'verify-payment',
        orderId: o.orderId,
        expectedRevision: 0,
        amountMinor: 99,
        method: 'Bank',
        reference: crypto.randomUUID(),
        reason: 'Reviewed transaction in bank statement',
      }),
    ).rejects.toThrow(/match/);
    await command({
      kind: 'verify-payment',
      orderId: o.orderId,
      expectedRevision: 0,
      amountMinor: 100,
      method: 'Bank',
      reference: crypto.randomUUID(),
      reason: 'Reviewed transaction in bank statement',
    });
    await command({
      kind: 'confirm',
      orderId: o.orderId,
      expectedRevision: 1,
      reason: 'Payment confirmed and order reviewed',
    });
  });
  it('does not activate an unverified intended account', async () => {
    const o = await command({
      kind: 'create',
      email: 'unverified@example.test',
      name: 'Unverified',
      packageName: 'Test',
      amountMinor: 0,
      termDays: 30,
    });
    await expect(
      command({
        kind: 'activate',
        orderId: o.orderId,
        expectedRevision: 0,
        reason: 'Customer account reviewed by seller',
      }),
    ).rejects.toThrow(/Confirm/);
    const c = await command({
      kind: 'confirm',
      orderId: o.orderId,
      expectedRevision: 0,
      exception: 'approved',
      reason: 'Complimentary synthetic pilot test',
    });
    await expect(
      command({
        kind: 'activate',
        orderId: o.orderId,
        expectedRevision: c.revision,
        reason: 'Customer account reviewed by seller',
      }),
    ).rejects.toThrow(/verify their email/);
  });
  it('confirmation retry provisions exactly one wedding without activation', async () => {
    const o = await command({
      kind: 'create',
      email: 'alice@example.test',
      name: 'Alice',
      packageName: 'Test',
      amountMinor: 0,
      termDays: 30,
    });
    const key = crypto.randomUUID();
    const body = {
      kind: 'confirm',
      orderId: o.orderId,
      expectedRevision: 0,
      exception: 'approved',
      reason: 'Complimentary synthetic pilot test',
    };
    const c = await command(body, key);
    expect(await command(body, key)).toEqual(c);
    expect(
      (await db.query('select * from public.weddings where order_id=$1', [o.orderId])).rows,
    ).toHaveLength(1);
    expect(
      (
        await db.query<{ state: string }>('select state from public.dashboard_grants where wedding_id=$1', [
          c.weddingId,
        ])
      ).rows[0].state,
    ).toBe('inactive');
  });
  it('isolates two customers across reads, writes, publication and direct IDs', async () => {
    const x = await fixture();
    const y = await fixture('bob@example.test');
    await actor(alice);
    expect((await db.query('select * from public.weddings where id=$1', [y.weddingId])).rows).toHaveLength(0);
    expect(
      (await db.query('select * from public.invitation_drafts where wedding_id=$1', [y.weddingId])).rows,
    ).toHaveLength(0);
    await expect(save(y.weddingId)).rejects.toThrow(/unavailable/);
    await expect(publish(y.weddingId, 0)).rejects.toThrow(/unavailable/);
    await expect(
      db.query("update public.dashboard_grants set state='active' where wedding_id=$1", [y.weddingId]),
    ).rejects.toThrow(/permission denied/);
    await save(x.weddingId);
    await actor(bob);
    expect(
      (await db.query('select * from public.invitation_drafts where wedding_id=$1', [x.weddingId])).rows,
    ).toHaveLength(0);
    await expect(save(x.weddingId)).rejects.toThrow(/unavailable/);
  });
  it('suspension denies all content and commands without unpublishing', async () => {
    const x = await fixture();
    await actor(alice);
    await save(x.weddingId);
    await publish(x.weddingId, 1);
    await actor(seller, 'aal2');
    await command({
      kind: 'suspend',
      orderId: x.orderId,
      expectedRevision: 2,
      reason: 'Synthetic account access suspension',
    });
    expect(
      (
        await db.query<{ visibility: string }>('select visibility from public.weddings where id=$1', [
          x.weddingId,
        ])
      ).rows[0].visibility,
    ).toBe('live');
    await actor(alice);
    expect(
      (await db.query('select * from public.invitation_drafts where wedding_id=$1', [x.weddingId])).rows,
    ).toHaveLength(0);
    expect(
      (await db.query('select * from public.invitation_versions where wedding_id=$1', [x.weddingId])).rows,
    ).toHaveLength(0);
    await expect(save(x.weddingId, 1)).rejects.toThrow(/unavailable/);
    await expect(publish(x.weddingId, 1)).rejects.toThrow(/unavailable/);
  });
  it('saves incomplete drafts, rejects invalid publish and stale saves', async () => {
    const x = await fixture();
    await actor(alice);
    await save(x.weddingId, 0, { ...valid, partnerOne: '' });
    await expect(publish(x.weddingId, 1)).rejects.toThrow(/Complete/);
    await expect(save(x.weddingId, 0)).rejects.toThrow(/another tab/);
    await save(x.weddingId, 1);
    await expect(publish(x.weddingId, 1)).rejects.toThrow(/Draft changed/);
  });
  it('rejects foreign fields, duplicate IDs, unsupported theme and unprocessed media', async () => {
    const x = await fixture();
    await actor(alice);
    await expect(save(x.weddingId, 0, { ...valid, role: 'staff' } as typeof valid)).rejects.toThrow(
      /Unsupported/,
    );
    await expect(
      save(x.weddingId, 0, { ...valid, events: [valid.events[0], valid.events[0]] }),
    ).rejects.toThrow(/identity/);
    await expect(save(x.weddingId, 0, { ...valid, theme: 'garden' })).rejects.toThrow(/Jamdani/);
    await expect(
      save(x.weddingId, 0, { ...valid, photos: [{ src: 'https://unsafe.test' }] } as unknown as typeof valid),
    ).rejects.toThrow(/uploads/);
    await expect(
      save(x.weddingId, 0, { theme: 'jamdani', events: valid.events } as typeof valid),
    ).rejects.toThrow(/Missing invitation/);
    await expect(
      save(x.weddingId, 0, { ...valid, events: [{ ...valid.events[0], title: 'x'.repeat(161) }] }),
    ).rejects.toThrow(/Invalid celebration field/);
  });
  it('publish retry is stable, versions immutable and term cannot restart', async () => {
    const x = await fixture();
    await actor(alice);
    await save(x.weddingId);
    const key = crypto.randomUUID();
    const first = await publish(x.weddingId, 1, key);
    expect((await publish(x.weddingId, 1, key)).rows).toEqual(first.rows);
    const e = (await db.query('select * from public.entitlements where wedding_id=$1', [x.weddingId])).rows;
    await save(x.weddingId, 1, { ...valid, partnerOne: 'Changed' });
    await publish(x.weddingId, 2);
    expect(
      (await db.query('select * from public.entitlements where wedding_id=$1', [x.weddingId])).rows,
    ).toEqual(e);
    await expect(
      db.query("update public.invitation_versions set content='{}' where wedding_id=$1", [x.weddingId]),
    ).rejects.toThrow(/permission denied/);
    expect(
      (await db.query('select * from public.invitation_versions where wedding_id=$1', [x.weddingId])).rows,
    ).toHaveLength(2);
  });
  it('anonymous users cannot read even published or private records', async () => {
    await actor(alice, 'aal1', 'anon');
    for (const t of [
      'orders',
      'staff_roles',
      'wedding_memberships',
      'dashboard_grants',
      'invitation_drafts',
      'invitation_versions',
      'audit_events',
    ]) {
      await expect(db.query(`select * from public.${t}`)).rejects.toThrow(/permission denied/);
    }
  });
  it('filters restricted events before returning public JSON and remains view-only', async () => {
    const x = await fixture();
    const slug = (
      await db.query<{ slug: string }>('select slug from public.weddings where id=$1', [x.weddingId])
    ).rows[0].slug;
    await actor(alice);
    await save(x.weddingId, 0, {
      ...valid,
      generalEventIds: ['reception'],
      events: [{ ...valid.events[0], id: 'nikah', venue: 'RESTRICTED_VENUE' }, valid.events[0]],
    } as typeof valid);
    await publish(x.weddingId, 1);
    await actor(bob, 'aal1', 'anon');
    const r = await db.query<{ result: { events: { id: string }[] } }>(
      'select public.resolve_general_invitation($1) as result',
      [slug],
    );
    expect(r.rows[0].result.events.map((e) => e.id)).toEqual(['reception']);
    expect(JSON.stringify(r.rows)).not.toContain('RESTRICTED_VENUE');
    expect(JSON.stringify(r.rows)).not.toContain('customer_email');
    await expect(save(x.weddingId, 1)).rejects.toThrow(/permission denied/);
  });
  it('does not broaden a general link with no explicitly selected events', async () => {
    const x = await fixture();
    const slug = (
      await db.query<{ slug: string }>('select slug from public.weddings where id=$1', [x.weddingId])
    ).rows[0].slug;
    await actor(alice);
    await save(x.weddingId);
    await publish(x.weddingId, 1);
    await actor(bob, 'aal1', 'anon');
    await expect(db.query('select public.resolve_general_invitation($1)', [slug])).rejects.toThrow(
      /unavailable/,
    );
  });
  it('denies expired entitlements for both management and public resolution', async () => {
    const x = await fixture();
    const slug = (
      await db.query<{ slug: string }>('select slug from public.weddings where id=$1', [x.weddingId])
    ).rows[0].slug;
    await actor(alice);
    await save(x.weddingId, 0, { ...valid, generalEventIds: ['reception'] } as typeof valid);
    await publish(x.weddingId, 1);
    await db.exec('reset role');
    await db.query(
      "update public.entitlements set starts_at=now()-interval '2 days',expires_at=now()-interval '1 day' where wedding_id=$1",
      [x.weddingId],
    );
    await actor(alice);
    await expect(save(x.weddingId, 1)).rejects.toThrow(/unavailable/);
    expect(
      (await db.query('select * from public.invitation_drafts where wedding_id=$1', [x.weddingId])).rows,
    ).toHaveLength(0);
    await actor(bob, 'aal1', 'anon');
    await expect(db.query('select public.resolve_general_invitation($1)', [slug])).rejects.toThrow(
      /unavailable/,
    );
  });
  it('returns the existing confirmation on retry after activation without another tenant', async () => {
    const o = await command({
      kind: 'create',
      email: 'alice@example.test',
      name: 'Alice',
      packageName: 'Synthetic',
      amountMinor: 0,
      termDays: 30,
    });
    const key = crypto.randomUUID();
    const c = {
      kind: 'confirm',
      orderId: o.orderId,
      expectedRevision: 0,
      exception: 'approved',
      reason: 'Synthetic test complimentary order',
    };
    const confirmed = await command(c, key);
    await command({
      kind: 'activate',
      orderId: o.orderId,
      expectedRevision: 1,
      reason: 'Verified intended owner account',
    });
    expect(await command(c, key)).toEqual(confirmed);
    expect(
      (await db.query('select * from public.weddings where order_id=$1', [o.orderId])).rows,
    ).toHaveLength(1);
  });
  it('blocks unverified identities even with forged membership metadata', async () => {
    const x = await fixture();
    await db.exec('reset role');
    await db.query('update auth.users set email_confirmed_at=null where id=$1', [alice]);
    await actor(alice, 'aal2');
    await expect(save(x.weddingId)).rejects.toThrow(/unavailable/);
    await db.exec('reset role');
    await db.query('update auth.users set email_confirmed_at=now() where id=$1', [alice]);
  });
  it('immediately rejects banned and soft-deleted accounts with a still-valid JWT', async () => {
    const x = await fixture();
    for (const column of ['banned_until', 'deleted_at']) {
      await db.exec('reset role');
      await db.query(`update auth.users set ${column}=now()+interval '1 day' where id=$1`, [alice]);
      await actor(alice);
      await expect(save(x.weddingId)).rejects.toThrow(/unavailable/);
      await db.exec('reset role');
      await db.query(`update auth.users set ${column}=null where id=$1`, [alice]);
    }
  });
});
