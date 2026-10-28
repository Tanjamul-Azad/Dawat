import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';
let db: PGlite;
const seller = '20000000-0000-4000-8000-000000000001',
  alice = '20000000-0000-4000-8000-000000000002',
  bob = '20000000-0000-4000-8000-000000000003',
  unverified = '20000000-0000-4000-8000-000000000004';
async function actor(id: string, aal = 'aal1', role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: id, aal })]);
  await db.exec(`set role ${role}`);
}
async function command(body: Record<string, unknown>, key = crypto.randomUUID(), fn = 'sales_command') {
  const r = await db.query<{ r: any }>(`select public.${fn}($1,$2::jsonb) r`, [key, JSON.stringify(body)]);
  return r.rows[0].r;
}
async function resetQuota() {
  await db.exec('reset role');
  await db.exec(
    "update public.sales_requests set created_at=now()-interval '2 days'; delete from private.rate_limits",
  );
}
async function request(template = 'garden') {
  await resetQuota();
  await actor(alice);
  return command({
    kind: 'request',
    templateId: template,
    name: 'Test customer',
    brief: 'A fictional wedding for automated verification.',
    eventDate: '2027-02-14',
  });
}
async function order() {
  let r = await request();
  await actor(seller, 'aal2');
  r = await command({
    kind: 'quote',
    id: r.id,
    expectedRevision: r.revision,
    packageName: 'Garden Vows',
    amountMinor: 75000,
    termDays: 90,
    notes: 'Synthetic terms and payment instructions for verification only.',
  });
  await actor(alice);
  return command({ kind: 'accept', id: r.id, expectedRevision: r.revision });
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,banned_until timestamptz,deleted_at timestamptz);
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
grant usage on schema auth to authenticated,anon;grant execute on all functions in schema auth to authenticated,anon;
insert into auth.users(id,email,email_confirmed_at) values('${seller}','seller@example.test',now()),('${alice}','alice@example.test',now()),('${bob}','bob@example.test',now()),('${unverified}','unverified@example.test',null);`);
  for (const file of [
    '202610200001_foundation.sql',
    '20261020204524_client_readiness_fixes.sql',
    '20261026054154_sales_requests.sql',
    '20261026054200_manual_payment_submissions.sql',
    '20261027120000_accept_opens_order.sql',
    '20261028090000_access_onboarding.sql',
    '20261028120000_access_simplify.sql',
  ]) {
    try {
      await db.exec(readFileSync('supabase/migrations/' + file, 'utf8'));
    } catch (e) {
      console.error(file, e);
      throw e;
    }
  }
  await db.query('insert into public.staff_roles(user_id) values($1)', [seller]);
}, 30000);
afterAll(async () => {
  await db?.close();
});
it('rejects anonymous and unverified intake', async () => {
  await actor(alice, 'aal1', 'anon');
  await expect(command({ kind: 'request' })).rejects.toThrow(/permission denied/);
  await actor(unverified);
  await expect(command({ kind: 'request' })).rejects.toThrow(/Verify your email/);
});
it('binds email to verified identity, isolates rows and rejects direct writes', async () => {
  const r = await request();
  expect(r.customer_email).toBe('alice@example.test');
  await actor(bob);
  expect((await db.query('select * from public.sales_requests where id=$1', [r.id])).rows).toHaveLength(0);
  await expect(command({ kind: 'cancel', id: r.id, expectedRevision: 0 })).rejects.toThrow(/unavailable/);
  await expect(
    db.query('update public.sales_requests set state=$1 where id=$2', ['accepted', r.id]),
  ).rejects.toThrow(/permission denied/);
});
it('replays intake exactly once and rejects a reused key with a different payload', async () => {
  await resetQuota();
  await actor(alice);
  const body = {
    kind: 'request',
    templateId: 'ivory',
    name: 'Alice',
    brief: 'A fictional celebration',
    eventDate: '',
  };
  const key = crypto.randomUUID();
  const first = await command(body, key);
  expect((await command(body, key)).id).toBe(first.id);
  await expect(command({ ...body, name: 'Changed' }, key)).rejects.toThrow(/retry key/);
});
it('limits a verified customer to three new requests daily', async () => {
  await resetQuota();
  await actor(bob);
  const body = {
    kind: 'request',
    templateId: 'ivory',
    name: 'Bob',
    brief: 'A fictional celebration',
    eventDate: '',
  };
  for (let i = 0; i < 3; i++) await command(body);
  await expect(command(body)).rejects.toThrow(/three requests/);
});
it('requires staff AAL2 and published package price', async () => {
  const r = await request();
  const q = {
    kind: 'quote',
    id: r.id,
    expectedRevision: 0,
    packageName: 'Garden',
    amountMinor: 1,
    termDays: 90,
    notes: 'A valid description of agreed terms.',
  };
  await expect(command(q)).rejects.toThrow(/seller MFA/);
  await actor(seller);
  await expect(command(q)).rejects.toThrow(/seller MFA/);
  await actor(seller, 'aal2');
  await expect(command(q)).rejects.toThrow(/published package price/);
});
it('rejects stale agreement and seller acceptance on customer behalf', async () => {
  let r = await request();
  await actor(seller, 'aal2');
  r = await command({
    kind: 'quote',
    id: r.id,
    expectedRevision: 0,
    packageName: 'Garden',
    amountMinor: 75000,
    termDays: 90,
    notes: 'A valid description of agreed terms.',
  });
  await expect(command({ kind: 'accept', id: r.id, expectedRevision: r.revision })).rejects.toThrow(
    /Only the customer/,
  );
  await actor(alice);
  await expect(command({ kind: 'accept', id: r.id, expectedRevision: 0 })).rejects.toThrow(/changed/);
});
it('opens the unpaid order on acceptance once, without fabricating payment or access', async () => {
  const r = await order();
  expect(r.state).toBe('ordered');
  await actor(seller, 'aal2');
  const rows = await db.query<any>('select * from public.orders where id=$1', [r.order_id]);
  expect(rows.rows[0]).toMatchObject({
    amount_minor: 75000,
    payment_status: 'pending',
    template_id: 'garden',
    status: 'reviewing',
  });
  expect((await db.query('select * from public.weddings where order_id=$1', [r.order_id])).rows).toHaveLength(
    0,
  );
  await actor(alice);
  await expect(command({ kind: 'accept', id: r.id, expectedRevision: r.revision })).rejects.toThrow(
    /no quote/,
  );
  await actor(seller, 'aal2');
  await expect(command({ kind: 'convert', id: r.id, expectedRevision: r.revision })).rejects.toThrow(
    /accept/,
  );
  await db.exec('reset role');
  expect(
    (
      await db.query('select count(*)::int n from public.orders where customer_email=$1 and id=$2', [
        'alice@example.test',
        r.order_id,
      ])
    ).rows[0],
  ).toEqual({ n: 1 });
});
it('submits evidence without granting paid state; staff verifies then confirms and activates separately', async () => {
  const r = await order();
  await actor(alice);
  const key = crypto.randomUUID();
  const body = {
    kind: 'submit',
    requestId: r.id,
    method: 'bKash',
    reference: 'TEST-VALID-' + r.id,
    sender: '01700000000',
  };
  const p = await command(body, key, 'payment_submission_command');
  expect((await command(body, key, 'payment_submission_command')).id).toBe(p.id);
  expect(p.state).toBe('pending');
  await expect(
    command({ ...body, reference: 'another' }, crypto.randomUUID(), 'payment_submission_command'),
  ).rejects.toThrow(/being reviewed/);
  await expect(
    command(
      { kind: 'verify', id: p.id, reason: 'Matched actual provider ledger.' },
      crypto.randomUUID(),
      'payment_submission_command',
    ),
  ).rejects.toThrow(/seller MFA/);
  await actor(bob);
  expect((await db.query('select * from public.payment_submissions where id=$1', [p.id])).rows).toHaveLength(
    0,
  );
  await actor(seller, 'aal2');
  const verified = await command(
    { kind: 'verify', id: p.id, reason: 'Matched actual provider ledger.' },
    crypto.randomUUID(),
    'payment_submission_command',
  );
  expect(verified.state).toBe('verified');
  const o = (await db.query<any>('select * from public.orders where id=$1', [r.order_id])).rows[0];
  expect(o.payment_status).toBe('manually_verified');
  expect(o.status).toBe('reviewing');
  const confirmed = await command(
    { kind: 'confirm', orderId: o.id, expectedRevision: o.revision, reason: 'Confirmed the accepted order.' },
    crypto.randomUUID(),
    'seller_command',
  );
  await command(
    {
      kind: 'activate',
      orderId: o.id,
      expectedRevision: confirmed.revision,
      reason: 'Verified intended customer identity.',
    },
    crypto.randomUUID(),
    'seller_command',
  );
  await actor(alice);
  const progress = (await db.query<any>('select public.my_sales_progress() p')).rows[0].p.find(
    (x: any) => x.requestId === r.id,
  );
  expect(progress.access).toBe('active');
  expect(progress.weddingId).toBe(confirmed.weddingId);
  expect(
    (await db.query<any>('select template_id from public.weddings where id=$1', [confirmed.weddingId]))
      .rows[0].template_id,
  ).toBe('garden');
});
it('rejects mismatched evidence and allows a corrected unique transaction without marking paid', async () => {
  const r = await order();
  await actor(alice);
  const p = await command(
    {
      kind: 'submit',
      requestId: r.id,
      method: 'Nagad',
      reference: 'TEST-REJECT-' + r.id,
      sender: '01800000000',
    },
    crypto.randomUUID(),
    'payment_submission_command',
  );
  await actor(seller, 'aal2');
  await command(
    { kind: 'reject', id: p.id, reason: 'Transaction was not found in provider ledger.' },
    crypto.randomUUID(),
    'payment_submission_command',
  );
  await actor(alice);
  const next = await command(
    {
      kind: 'submit',
      requestId: r.id,
      method: 'Nagad',
      reference: 'TEST-FIX-' + r.id,
      sender: '01800000000',
    },
    crypto.randomUUID(),
    'payment_submission_command',
  );
  expect(next.state).toBe('pending');
});
it('accepts known catalog content and rejects fabricated templates', async () => {
  await actor(seller, 'aal2');
  const base = {
    partnerOne: 'A',
    partnerTwo: 'B',
    hosts: '',
    message: '',
    theme: 'jamdani',
    photos: [],
    events: [
      { id: 'reception', title: 'Reception', date: '2027-01-01', time: '19:00', venue: 'Dhaka', address: '' },
    ],
  };
  await db.exec('reset role');
  for (const templateId of ['jamdani', 'ivory', 'holud', 'garden', 'midnight', 'rose'])
    await db.query('select private.validate_content($1::jsonb,true)', [
      JSON.stringify({ ...base, templateId }),
    ]);
  await expect(
    db.query('select private.validate_content($1::jsonb,true)', [
      JSON.stringify({ ...base, templateId: 'invalid' }),
    ]),
  ).rejects.toThrow(/Unsupported design/);
});

it('auto-quotes standard prices, retains manual custom quoting and validates customer contact', async () => {
  const r = await request('jamdani'); expect(r).toMatchObject({ state: 'quoted', amount_minor: 50000, term_days: 90, package_name: 'ক্লাসিক' });
  expect(r.quote_notes).toContain('90');
  const custom = await request('custom'); expect(custom.state).toBe('requested'); expect(custom.amount_minor).toBeNull();
  await resetQuota(); await actor(alice);
  await expect(command({ kind: 'request', templateId: 'ivory', name: 'Test', brief: 'Synthetic celebration', eventDate: '', phone: '0171234' })).rejects.toThrow(/WhatsApp/);
  const contact = await command({ kind: 'request', templateId: 'ivory', name: 'Test', brief: 'Synthetic celebration', eventDate: '', phone: '+8801700000001' }); expect(contact.customer_phone).toBe('+8801700000001');
});
it('verifies, confirms and activates atomically and replays the receipt without repeating side effects', async () => {
  const r = await order(); await actor(alice);
  const p = await command({ kind: 'submit', requestId: r.id, method: 'bKash', reference: 'AUTO-' + r.id, sender: '01700000001' }, crypto.randomUUID(), 'payment_submission_command');
  await actor(seller, 'aal2'); const key = crypto.randomUUID(); const body = { kind: 'verify', id: p.id, activate: true, reason: 'Matched actual synthetic transfer.' };
  expect((await command(body, key, 'payment_submission_command')).state).toBe('verified');
  expect((await command(body, key, 'payment_submission_command')).state).toBe('verified');
  const o = (await db.query<any>('select * from public.orders where id=$1', [r.order_id])).rows[0]; expect(o).toMatchObject({ payment_status: 'manually_verified', status: 'confirmed', revision: 3 });
  const audit = (await db.query<any>('select action from public.audit_events where order_id=$1', [r.order_id])).rows.map(row => row.action);
  for (const action of ['verify-payment', 'confirm', 'activate']) expect(audit.filter(value => value === action)).toHaveLength(1);
  await actor(alice); expect((await db.query<any>('select public.my_sales_progress() p')).rows[0].p.find((row: any) => row.requestId === r.id).access).toBe('active');
});
it('rolls back every payment and order change when activation fails, and protects admin summary with AAL2', async () => {
  const r = await order(); await actor(alice);
  const p = await command({ kind: 'submit', requestId: r.id, method: 'bKash', reference: 'ROLLBACK-' + r.id, sender: '01700000001' }, crypto.randomUUID(), 'payment_submission_command');
  await db.exec('reset role'); await db.query("update auth.users set banned_until=now()+interval '1 day' where id=$1", [alice]);
  await actor(seller, 'aal2');
  await expect(command({ kind: 'verify', id: p.id, activate: true, reason: 'Matched actual synthetic transfer.' }, crypto.randomUUID(), 'payment_submission_command')).rejects.toThrow(/verify their email/);
  expect((await db.query<any>('select payment_status,status,revision from public.orders where id=$1', [r.order_id])).rows[0]).toEqual({ payment_status: 'pending', status: 'reviewing', revision: 0 });
  expect((await db.query<any>('select state from public.payment_submissions where id=$1', [p.id])).rows[0].state).toBe('pending');
  expect((await db.query('select * from public.weddings where order_id=$1', [r.order_id])).rows).toHaveLength(0);
  const summary = (await db.query<any>('select public.admin_summary() s')).rows[0].s; expect(summary.pendingPayments).toBeGreaterThan(0);
  await actor(seller); await expect(db.query('select public.admin_summary()')).rejects.toThrow(/seller MFA/);
  await db.exec('reset role'); await db.query('update auth.users set banned_until=null where id=$1', [alice]);
});
