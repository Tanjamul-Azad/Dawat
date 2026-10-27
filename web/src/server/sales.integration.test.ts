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

async function submitPayment(requestId: string, reference = 'TEST-ONECLICK-' + requestId) {
  await actor(alice);
  return command(
    { kind: 'submit', requestId, method: 'bKash', reference, sender: '01700000000' },
    crypto.randomUUID(),
    'payment_submission_command',
  );
}
async function auditActions(orderId: string) {
  await db.exec('reset role');
  return (
    await db.query<{ action: string }>('select action from public.audit_events where order_id=$1', [orderId])
  ).rows.map((row) => row.action);
}
const requestBody = (templateId: string, extra: Record<string, unknown> = {}) => ({
  kind: 'request',
  templateId,
  name: 'Test customer',
  brief: 'A fictional wedding for automated verification.',
  eventDate: '',
  ...extra,
});

it('quotes the fixed-price packages at once from the published price, and keeps custom manual', async () => {
  await resetQuota();
  await actor(alice);
  const classic = await command(requestBody('ivory', { termDays: 90, packageName: 'ক্লাসিক · শুভ্র' }));
  expect(classic).toMatchObject({
    state: 'quoted',
    amount_minor: 50000,
    term_days: 90,
    package_name: 'ক্লাসিক · শুভ্র',
    revision: 0,
  });
  expect(classic.quote_notes).toMatch(/90 দিন/);
  expect(classic.quote_notes).toMatch(/Refunds are not automatic/);
  const premium = await command(requestBody('rose', { termDays: 45 }));
  expect(premium).toMatchObject({ state: 'quoted', amount_minor: 75000, term_days: 45 });
  expect(premium.package_name).toBe('প্রিমিয়াম');
  const custom = await command(requestBody('custom'));
  expect(custom).toMatchObject({ state: 'requested', amount_minor: null, package_name: null });
  await db.exec('reset role');
  const quotes = await db.query<{ n: number }>(
    "select count(*)::int n from public.audit_events where action='sales.auto-quote'",
  );
  expect(quotes.rows[0].n).toBeGreaterThanOrEqual(2);
});

it('does not let the caller choose the price, an over-long term or an invalid number', async () => {
  await resetQuota();
  await actor(alice);
  const tampered = await command(
    requestBody('holud', { amountMinor: 1, notes: 'Free forever, full refund.' }),
  );
  expect(tampered.amount_minor).toBe(50000);
  expect(tampered.quote_notes).not.toMatch(/Free forever/);
  await expect(command(requestBody('holud', { termDays: 366 }))).rejects.toThrow(/hosting term/);
  await expect(command(requestBody('holud', { termDays: 0 }))).rejects.toThrow(/hosting term/);
  await expect(command(requestBody('holud', { phone: '01712345678' }))).rejects.toThrow(/WhatsApp/);
  await expect(command(requestBody('custom', { phone: 'call me' }))).rejects.toThrow(/WhatsApp/);
});

it('keeps an optional WhatsApp number on the request, visible to its owner and staff only', async () => {
  await resetQuota();
  await actor(alice);
  const withPhone = await command(requestBody('custom', { phone: '+8801712345678' }));
  expect(withPhone.customer_phone).toBe('+8801712345678');
  const without = await command(requestBody('custom', { phone: '' }));
  expect(without.customer_phone).toBeNull();
  await actor(bob);
  expect(
    (await db.query('select * from public.sales_requests where id=$1', [withPhone.id])).rows,
  ).toHaveLength(0);
  await actor(seller, 'aal2');
  expect(
    (await db.query<any>('select customer_phone from public.sales_requests where id=$1', [withPhone.id]))
      .rows[0].customer_phone,
  ).toBe('+8801712345678');
});

it('lets the customer accept an automatic quote straight away', async () => {
  await resetQuota();
  await actor(alice);
  const r = await command(requestBody('ivory'));
  const accepted = await command({ kind: 'accept', id: r.id, expectedRevision: r.revision });
  expect(accepted.state).toBe('ordered');
  await actor(seller, 'aal2');
  expect(
    (
      await db.query<any>('select amount_minor,term_days,payment_status from public.orders where id=$1', [
        accepted.order_id,
      ])
    ).rows[0],
  ).toEqual({ amount_minor: 50000, term_days: 90, payment_status: 'pending' });
});

it('verifies, confirms and activates in one click with every audit event kept, and replays safely', async () => {
  const r = await order();
  const p = await submitPayment(r.id);
  await actor(seller, 'aal2');
  const key = crypto.randomUUID();
  const body = { kind: 'verify', id: p.id, reason: 'Matched actual provider ledger.', activate: true };
  const verified = await command(body, key, 'payment_submission_command');
  expect(verified.state).toBe('verified');
  const o = (await db.query<any>('select * from public.orders where id=$1', [r.order_id])).rows[0];
  expect(o).toMatchObject({ status: 'confirmed', payment_status: 'manually_verified' });
  const grant = await db.query<any>(
    'select g.state from public.dashboard_grants g join public.weddings w on w.id=g.wedding_id where w.order_id=$1',
    [o.id],
  );
  expect(grant.rows[0].state).toBe('active');
  const actions = await auditActions(o.id);
  for (const action of [
    'verify-payment',
    'confirm',
    'activate',
    'verify-confirm-activate',
    'payment_submission.verify',
  ])
    expect(actions).toContain(action);
  await actor(seller, 'aal2');
  expect((await command(body, key, 'payment_submission_command')).id).toBe(p.id);
  expect((await auditActions(o.id)).filter((a) => a === 'verify-payment')).toHaveLength(1);
  await actor(alice);
  const progress = (await db.query<any>('select public.my_sales_progress() p')).rows[0].p.find(
    (x: any) => x.requestId === r.id,
  );
  expect(progress.access).toBe('active');
});

it('changes nothing when any step of the one-click fails, and still verifies alone when asked', async () => {
  const r = await order();
  const p = await submitPayment(r.id, 'TEST-ROLLBACK-' + r.id);
  await db.exec('reset role');
  await db.exec(`update auth.users set email_confirmed_at=null where id='${alice}'`);
  await actor(seller, 'aal2');
  await expect(
    command(
      { kind: 'verify', id: p.id, reason: 'Matched actual provider ledger.', activate: true },
      crypto.randomUUID(),
      'payment_submission_command',
    ),
  ).rejects.toThrow(/verify their email/);
  await db.exec('reset role');
  expect(
    (await db.query<any>('select state from public.payment_submissions where id=$1', [p.id])).rows[0].state,
  ).toBe('pending');
  expect(
    (await db.query<any>('select status,payment_status from public.orders where id=$1', [r.order_id]))
      .rows[0],
  ).toEqual({ status: 'reviewing', payment_status: 'pending' });
  expect(await auditActions(r.order_id)).not.toContain('verify-payment');
  expect(
    (await db.query('select * from public.payment_events where order_id=$1', [r.order_id])).rows,
  ).toHaveLength(0);
  await db.exec(`update auth.users set email_confirmed_at=now() where id='${alice}'`);
  await actor(seller, 'aal2');
  const alone = await command(
    { kind: 'verify', id: p.id, reason: 'Matched actual provider ledger.' },
    crypto.randomUUID(),
    'payment_submission_command',
  );
  expect(alone.state).toBe('verified');
  expect(
    (await db.query<any>('select status,payment_status from public.orders where id=$1', [r.order_id]))
      .rows[0],
  ).toEqual({ status: 'reviewing', payment_status: 'manually_verified' });
});

it('keeps the combined seller command behind verified seller MFA', async () => {
  const r = await order();
  await actor(seller, 'aal2');
  const o = (await db.query<any>('select * from public.orders where id=$1', [r.order_id])).rows[0];
  const body = {
    kind: 'verify-confirm-activate',
    orderId: o.id,
    expectedRevision: o.revision,
    method: 'bKash',
    reference: 'TEST-DIRECT-' + o.id,
    amountMinor: o.amount_minor,
    reason: 'Matched actual provider ledger.',
  };
  await actor(alice);
  await expect(command(body, crypto.randomUUID(), 'seller_command')).rejects.toThrow(/seller MFA/);
  await actor(seller, 'aal1');
  await expect(command(body, crypto.randomUUID(), 'seller_command')).rejects.toThrow(/seller MFA/);
  await actor(seller, 'aal2');
  await expect(
    command({ ...body, expectedRevision: o.revision + 5 }, crypto.randomUUID(), 'seller_command'),
  ).rejects.toThrow(/changed/);
  await expect(command({ ...body, amountMinor: 1 }, crypto.randomUUID(), 'seller_command')).rejects.toThrow(
    /match the order/,
  );
  const done = await command(body, crypto.randomUUID(), 'seller_command');
  expect(done.weddingId).toBeTruthy();
});
