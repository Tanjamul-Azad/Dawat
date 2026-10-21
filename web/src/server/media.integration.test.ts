import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
let db: PGlite;
const staff = '10000000-0000-4000-8000-000000000001',
  alice = '10000000-0000-4000-8000-000000000002',
  bob = '10000000-0000-4000-8000-000000000003';
const content = {
  partnerOne: 'মেহরিন',
  partnerTwo: 'আরিব',
  hosts: '',
  message: '',
  theme: 'jamdani',
  photos: [],
  generalEventIds: ['reception'],
  events: [
    {
      id: 'reception',
      title: 'বিবাহোত্তর সংবর্ধনা',
      date: '2026-12-12',
      time: '19:00',
      venue: 'ঢাকা',
      address: '',
    },
  ],
};
async function actor(id = alice, role = 'authenticated', aal = 'aal1') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claims',$1,false)", [
    JSON.stringify({ sub: id, aal, role }),
  ]);
  await db.exec(`set role ${role}`);
}
async function rpc<T = Record<string, unknown>>(name: string, args: unknown[]) {
  const placeholders = args.map((_, i) => `$${i + 1}`).join(',');
  const r = await db.query<{ r: T }>(
    `select public.${name}(${placeholders}) as r`,
    args.map((a) => (a !== null && typeof a === 'object' ? JSON.stringify(a) : a)),
  );
  return r.rows[0].r;
}
async function fixture(owner = alice) {
  await actor(staff, 'authenticated', 'aal2');
  const email = owner === alice ? 'alice@example.test' : 'bob@example.test';
  const o = await rpc<{ orderId: string }>('seller_command', [
    crypto.randomUUID(),
    { kind: 'create', email, name: 'Test', packageName: 'Synthetic', amountMinor: 0, termDays: 90 },
  ]);
  const c = await rpc<{ weddingId: string; revision: number }>('seller_command', [
    crypto.randomUUID(),
    {
      kind: 'confirm',
      orderId: o.orderId,
      expectedRevision: 0,
      exception: 'approved',
      reason: 'Synthetic media test order',
    },
  ]);
  await rpc('seller_command', [
    crypto.randomUUID(),
    {
      kind: 'activate',
      orderId: o.orderId,
      expectedRevision: c.revision,
      reason: 'Synthetic verified owner activation',
    },
  ]);
  await actor(owner);
  return { wid: c.weddingId, owner };
}
async function reserve(f: Awaited<ReturnType<typeof fixture>>, key = crypto.randomUUID()) {
  await actor(f.owner);
  return rpc<{ id: string; state: string }>('reserve_media', [f.wid, key]);
}
async function begin(
  f: Awaited<ReturnType<typeof fixture>>,
  id: string,
  lease = crypto.randomUUID(),
  hash = 'a'.repeat(64),
) {
  await actor(f.owner, 'service_role');
  const r = await rpc<{ prefix: string; ready: boolean }>('process_media', [
    f.wid,
    id,
    f.owner,
    lease,
    'begin',
    { hash },
  ]);
  return { ...r, lease };
}
async function ready(f: Awaited<ReturnType<typeof fixture>>, id: string) {
  const job = await begin(f, id);
  const objects: Record<string, unknown> = {};
  await db.exec('reset role');
  for (const size of [480, 960, 1600]) {
    const path = `${job.prefix}/${size}.webp`;
    await db.query('insert into storage.objects(bucket_id,name) values($1,$2)', ['wedding-media', path]);
    objects[size] = { path, bytes: 100, hash: 'a'.repeat(64) };
  }
  await actor(f.owner, 'service_role');
  await rpc('process_media', [
    f.wid,
    id,
    f.owner,
    job.lease,
    'complete',
    { width: 800, height: 600, bytes: 300, objects },
  ]);
  return job;
}
const photo = (id: string) => ({ id, src: `/media/${id}/960/`, alt: 'আমাদের ছবি', position: 'center' });
async function save(f: Awaited<ReturnType<typeof fixture>>, photos: unknown[], revision = 0) {
  await actor(f.owner);
  return rpc('save_draft', [f.wid, revision, { ...content, photos }]);
}
describe('Media tenancy, trusted processing and publication references', () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;
    grant select,insert,update,delete on storage.objects to anon,authenticated;
    create policy accidental_broad_storage_policy on storage.objects for all to authenticated using(true) with check(true);
    grant usage on schema storage to authenticated,anon,service_role;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,banned_until timestamptz,deleted_at timestamptz);
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
    grant usage on schema auth to anon,authenticated,service_role;grant execute on all functions in schema auth to anon,authenticated,service_role;
    insert into auth.users(id,email,email_confirmed_at) values('${staff}','staff@example.test',now()),('${alice}','alice@example.test',now()),('${bob}','bob@example.test',now());`);
    for (const name of ['foundation', 'guest_delivery', 'media']) {
      const i = ['foundation', 'guest_delivery', 'media'].indexOf(name) + 1;
      await db.exec(readFileSync(`supabase/migrations/20261020000${i}_${name}.sql`, 'utf8'));
    }
    await db.exec(readFileSync('supabase/migrations/20261020204524_client_readiness_fixes.sql', 'utf8'));
    await db.exec(
      readFileSync('supabase/migrations/20261021054738_preserve_household_event_scope.sql', 'utf8'),
    );
    await db.query('insert into public.staff_roles(user_id) values($1)', [staff]);
  }, 30000);
  beforeEach(async () => {
    await db.exec('reset role');
    await db.exec('truncate private.rate_limits');
    await db.exec('update private.media_processing set lease_until=null');
  });
  afterAll(async () => db?.close());
  it('reserves a slot once for a retry key', async () => {
    const f = await fixture();
    const key = crypto.randomUUID();
    const a = await reserve(f, key);
    expect(await reserve(f, key)).toEqual(a);
  });
  it('rejects the sixth reservation and releases cancelled slots', async () => {
    const f = await fixture();
    const first = await reserve(f);
    for (let i = 0; i < 4; i++) await reserve(f);
    await expect(reserve(f)).rejects.toThrow(/Five photo/);
    await rpc('remove_media', [f.wid, first.id]);
    expect((await reserve(f)).state).toBe('reserved');
  });
  it('does not count expired unfinished uploads against active slots', async () => {
    const f = await fixture();
    for (let i = 0; i < 5; i++) await reserve(f);
    await db.exec('reset role');
    await db.query("update public.media_assets set expires_at=now()-interval '1 hour' where wedding_id=$1", [
      f.wid,
    ]);
    expect((await reserve(f)).id).toBeTruthy();
  });
  it('denies foreign owner reads and reservation/remove commands', async () => {
    const x = await fixture();
    const y = await fixture(bob);
    const a = await reserve(x);
    await actor(bob);
    expect(
      (await db.query('select * from public.media_assets where wedding_id=$1', [x.wid])).rows,
    ).toHaveLength(0);
    await expect(rpc('reserve_media', [x.wid, crypto.randomUUID()])).rejects.toThrow(/unavailable/);
    await expect(rpc('remove_media', [y.wid, a.id])).rejects.toThrow(/unavailable/);
  });
  it('denies direct readiness forgery and trusted processor calls', async () => {
    const f = await fixture();
    const a = await reserve(f);
    await expect(
      db.query("update public.media_assets set state='ready' where id=$1", [a.id]),
    ).rejects.toThrow(/permission denied/);
    await expect(
      rpc('process_media', [f.wid, a.id, alice, crypto.randomUUID(), 'begin', {}]),
    ).rejects.toThrow(/permission denied/);
  });
  it('keeps bucket private and denies direct Storage even under a broad unrelated policy', async () => {
    await fixture();
    await actor(alice);
    await expect(
      db.query("insert into storage.objects(bucket_id,name) values('wedding-media','guessed')"),
    ).rejects.toThrow(/row-level security/);
    await db.exec('reset role');
    expect(
      (await db.query<{ public: boolean }>("select public from storage.buckets where id='wedding-media'"))
        .rows[0].public,
    ).toBe(false);
  });
  it('rejects foreign, pending, duplicate and external photo references', async () => {
    const x = await fixture();
    const y = await fixture(bob);
    const foreign = await reserve(y);
    await ready(y, foreign.id);
    const pending = await reserve(x);
    await expect(save(x, [photo(foreign.id)])).rejects.toThrow(/another wedding/);
    await expect(save(x, [photo(pending.id)])).rejects.toThrow(/unprocessed/);
    await ready(x, pending.id);
    await expect(save(x, [photo(pending.id), photo(pending.id)])).rejects.toThrow(/distinct/);
    await expect(save(x, [{ ...photo(pending.id), src: 'https://unsafe.example/x' }])).rejects.toThrow(
      /external/,
    );
  });
  it('requires matching lease and actual objects before readiness', async () => {
    const f = await fixture();
    const a = await reserve(f);
    const j = await begin(f, a.id);
    await expect(begin(f, a.id)).rejects.toThrow(/still processing/);
    await actor(alice, 'service_role');
    await expect(
      rpc('process_media', [f.wid, a.id, alice, crypto.randomUUID(), 'complete', {}]),
    ).rejects.toThrow(/lease/);
    await expect(
      rpc('process_media', [
        f.wid,
        a.id,
        alice,
        j.lease,
        'complete',
        {
          width: 1,
          height: 1,
          bytes: 3,
          objects: { '480': { path: `${j.prefix}/480.webp`, bytes: 1, hash: 'a'.repeat(64) } },
        },
      ]),
    ).rejects.toThrow(/missing processed/);
  });
  it('retries the same fingerprint with a new lease after a transient failure', async () => {
    const f = await fixture();
    const a = await reserve(f);
    const j = await begin(f, a.id);
    await rpc('process_media', [f.wid, a.id, alice, j.lease, 'fail', { retryable: true }]);
    await expect(begin(f, a.id, crypto.randomUUID(), 'b'.repeat(64))).rejects.toThrow(/same file/);
    expect((await begin(f, a.id)).lease).not.toBe(j.lease);
  });
  it('leases before buffering and binds the complete upload fingerprint before decode', async () => {
    const f = await fixture();
    const a = await reserve(f);
    const lease = crypto.randomUUID();
    await actor(alice, 'service_role');
    expect(await rpc('process_media', [f.wid, a.id, alice, lease, 'begin', {}])).toHaveProperty('prefix');
    await rpc('process_media', [f.wid, a.id, alice, lease, 'fingerprint', { hash: 'a'.repeat(64) }]);
    await expect(
      rpc('process_media', [f.wid, a.id, alice, lease, 'fingerprint', { hash: 'b'.repeat(64) }]),
    ).rejects.toThrow(/same file/);
  });
  it('limits shared in-flight bodies/decodes across all weddings', async () => {
    const f = await fixture();
    const ids = [];
    for (let i = 0; i < 5; i++) ids.push((await reserve(f)).id);
    for (const id of ids.slice(0, 4)) await begin(f, id);
    await expect(begin(f, ids[4])).rejects.toThrow(/processing is busy/);
  });
  it('never permits rejected files to be retried as ready', async () => {
    const f = await fixture();
    const a = await reserve(f);
    const j = await begin(f, a.id);
    await rpc('process_media', [f.wid, a.id, alice, j.lease, 'fail', { retryable: false }]);
    await expect(begin(f, a.id)).rejects.toThrow(/rejected/);
  });
  it('pins immutable publication media and preserves live photos after library removal', async () => {
    const f = await fixture();
    const a = await reserve(f);
    await ready(f, a.id);
    await save(f, [photo(a.id)]);
    await rpc('publish_invitation', [f.wid, 1, crypto.randomUUID()]);
    await expect(rpc('remove_media', [f.wid, a.id])).rejects.toThrow(/draft and save/);
    await save(f, [], 1);
    await rpc('remove_media', [f.wid, a.id]);
    const w = await db.query<{ slug: string }>('select slug from public.weddings where id=$1', [f.wid]);
    await actor(alice, 'anon');
    expect(await rpc('resolve_media', [a.id, '960', null, w.rows[0].slug, null, null])).toHaveProperty(
      'path',
    );
    await actor(alice);
    expect(
      (await db.query('select * from public.publication_media where wedding_id=$1', [f.wid])).rows,
    ).toHaveLength(1);
    await expect(save(f, [photo(a.id)], 2)).rejects.toThrow(/unavailable/);
  });
  it('does not expose an unpublished asset on a general invitation', async () => {
    const f = await fixture();
    const a = await reserve(f);
    await ready(f, a.id);
    await save(f, []);
    await rpc('publish_invitation', [f.wid, 1, crypto.randomUUID()]);
    const w = await db.query<{ slug: string }>('select slug from public.weddings where id=$1', [f.wid]);
    await actor(alice, 'anon');
    await expect(rpc('resolve_media', [a.id, '960', null, w.rows[0].slug, null, null])).rejects.toThrow(
      /unavailable/,
    );
  });
  it('denies completion after management suspension', async () => {
    const f = await fixture();
    const a = await reserve(f);
    const j = await begin(f, a.id);
    await db.exec('reset role');
    await db.query("update public.dashboard_grants set state='suspended' where wedding_id=$1", [f.wid]);
    await actor(alice, 'service_role');
    await expect(
      rpc('process_media', [f.wid, a.id, alice, j.lease, 'fail', { retryable: true }]),
    ).rejects.toThrow(/unavailable/);
  });
  it('collects abandoned attempts but never a retained publication', async () => {
    const f = await fixture();
    const a = await reserve(f);
    const retained = await ready(f, a.id);
    await save(f, [photo(a.id)]);
    await rpc('publish_invitation', [f.wid, 1, crypto.randomUUID()]);
    await save(f, [], 1);
    await rpc('remove_media', [f.wid, a.id]);
    const b = await reserve(f);
    const dead = await begin(f, b.id);
    await db.exec('reset role');
    await db.query("update private.media_attempts set created_at=now()-interval '2 days'");
    await db.query("update public.media_assets set expires_at=now()-interval '2 days' where id=$1", [b.id]);
    await db.query(
      "update private.media_processing set lease_until=now()-interval '1 day' where asset_id=$1",
      [b.id],
    );
    await actor(alice, 'service_role');
    const batch = await rpc<{ lease: string }[]>('media_cleanup_batch', [null]);
    expect(batch.some((x) => x.lease === dead.lease)).toBe(true);
    expect(batch.some((x) => x.lease === retained.lease)).toBe(false);
    await rpc('media_cleanup_batch', [dead.lease]);
    expect(
      (await rpc<{ lease: string }[]>('media_cleanup_batch', [null])).some((x) => x.lease === dead.lease),
    ).toBe(false);
  });
});
