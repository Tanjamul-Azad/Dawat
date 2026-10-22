// Synthetic development verification; refuses non-loopback services.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import sharp from 'sharp';
const origin = process.env.APP_ORIGIN ?? 'http://127.0.0.1:3100';
const recovery = process.env.DAWAT_RECOVERY_QA === '1';
const expectedApi = recovery ? 'http://127.0.0.1:55321' : 'http://127.0.0.1:54321';
const inboxOrigin = recovery ? 'http://127.0.0.1:55324' : 'http://127.0.0.1:54324';
const container = recovery ? 'supabase_db_dawat-recovery' : 'supabase_db_dawat-local';
if (recovery && origin !== 'http://127.0.0.1:3104') throw new Error('Recovery origin mismatch.');
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) throw new Error('Local verification only.');
const activeConfig = readFileSync('.env.local', 'utf8');
const databaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? activeConfig.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1]?.trim();
if (databaseUrl !== expectedApi)
  throw new Error(
    'Local verification requires the local database configuration. Restore the offline environment and restart the app first.',
  );
const run = Date.now().toString(36);
const artifactDir = recovery ? '../.artifacts/recovery-sandbox/e2e' : '../.artifacts/client-foundation';
mkdirSync(artifactDir, { recursive: true });
function client() {
  const cookies = new Map();
  return {
    cookies,
    async request(path, options = {}) {
      const r = await fetch(`${origin}${path}`, {
        method: options.method ?? 'GET',
        redirect: 'manual',
        headers: {
          Origin: origin,
          Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
          ...(options.body !== undefined
            ? { 'Content-Type': options.contentType ?? 'application/json' }
            : {}),
          ...(options.key ? { 'Idempotency-Key': options.key } : {}),
        },
        ...(options.body !== undefined
          ? { body: options.contentType ? options.body : JSON.stringify(options.body) }
          : {}),
      });
      for (const c of r.headers.getSetCookie()) {
        const [pair] = c.split(';');
        const i = pair.indexOf('=');
        cookies.set(pair.slice(0, i), pair.slice(i + 1));
      }
      const raw = await r.text();
      let json;
      try {
        json = JSON.parse(raw);
      } catch {}
      return { status: r.status, headers: r.headers, json, raw };
    },
  };
}
async function login(email) {
  const c = client();
  const sent = await c.request('/api/auth/login/', { method: 'POST', body: { email } });
  assert.equal(sent.status, 200, `OTP send failed: ${sent.raw}`);
  let code;
  for (let i = 0; i < 30; i++) {
    const inbox = await fetch(`${inboxOrigin}/api/v1/messages`).then((r) => r.json());
    const message = inbox.messages.find((m) => m.To?.some((t) => t.Address === email));
    if (message) {
      const full = await fetch(`${inboxOrigin}/api/v1/message/${message.ID}`).then((r) => r.json());
      code = (full.Text + ' ' + full.HTML).match(/\b\d{6}\b/)?.[0];
      if (code) break;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(code, 'Local inbox did not receive an OTP.');
  const verified = await c.request('/api/auth/verify/', { method: 'POST', body: { email, token: code } });
  assert.equal(verified.status, 200, `OTP verification failed: ${verified.raw}`);
  const returning = await c.request('/auth/login/?next=%2Fdashboard%2F');
  assert.equal(returning.status, 307, 'An existing verified session must not request another OTP.');
  assert.equal(returning.headers.get('location'), '/dashboard/');
  return c;
}
function totp(secret) {
  // RFC 6238 SHA-1, 30-second time step, 6 digits. Only synthetic enrollment.
  return import('node:crypto').then(({ createHmac }) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (const char of secret.toUpperCase().replace(/=+$/, ''))
      bits += alphabet.indexOf(char).toString(2).padStart(5, '0');
    const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
    const h = createHmac('sha1', key).update(counter).digest();
    const offset = h[19] & 15;
    return ((h.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
  });
}
const sellerEmail = `seller-${run}@example.test`;
const seller = await login(sellerEmail);
const alice = await login(`alice-${run}@example.test`);
const bob = await login(`bob-${run}@example.test`);
assert.equal((await alice.request('/api/admin/orders/')).status, 403);
execFileSync(
  process.execPath,
  ['scripts/bootstrap-local-seller.mjs', sellerEmail, ...(recovery ? ['--recovery'] : [])],
  {
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
assert.equal((await seller.request('/api/admin/orders/')).status, 403, 'Seller access must require MFA.');
// Enrollment API intentionally returns QR only; recover synthetic secret from local Auth API using the session cookie.
const enrollment = await seller.request('/api/auth/mfa-enroll/', { method: 'POST', body: {} });
assert.equal(enrollment.status, 200, enrollment.raw);
const qr = enrollment.json.data.qrCode;
const decoded = qr.startsWith('data:') ? decodeURIComponent(qr.slice(qr.indexOf(',') + 1)) : qr;
// QR SVG contains no plaintext secret. Read the synthetic factor secret from the local DB for automation only.
const secret = execFileSync(
  'docker',
  [
    'exec',
    container,
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-Atc',
    `select secret from auth.mfa_factors where id='${enrollment.json.data.factorId}'`,
  ],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
).trim();
void decoded;
const mfa = await seller.request('/api/auth/mfa-verify/', {
  method: 'POST',
  body: { factorId: enrollment.json.data.factorId, code: await totp(secret) },
});
assert.equal(mfa.status, 200, mfa.raw);
async function command(body, key = crypto.randomUUID()) {
  const r = await seller.request('/api/admin/orders/', { method: 'POST', body, key });
  assert.equal(r.status, 200, r.raw);
  return r.json.data;
}
async function provision(name, email) {
  const createKey = crypto.randomUUID();
  const b = { kind: 'create', email, name, packageName: 'Synthetic local QA', amountMinor: 0, termDays: 90 };
  const order = await command(b, createKey);
  assert.deepEqual(await command(b, createKey), order);
  const confirmed = await command({
    kind: 'confirm',
    orderId: order.orderId,
    expectedRevision: 0,
    exception: 'approved',
    reason: 'Synthetic complimentary local verification',
  });
  await command({
    kind: 'activate',
    orderId: order.orderId,
    expectedRevision: 1,
    reason: 'Synthetic intended customer verification',
  });
  return confirmed;
}
const x = await provision('Mehrin & Arib', `alice-${run}@example.test`);
const y = await provision('Nadia & Fahim', `bob-${run}@example.test`);
const searched = await seller.request(
  `/api/admin/orders/?field=email&search=${encodeURIComponent(`alice-${run}@example.test`)}`,
);
assert.equal(searched.status, 200, searched.raw);
assert.equal(searched.json.data.orders.length, 1);
assert.equal(searched.json.data.orders[0].weddingId, x.weddingId);
assert.equal(
  (await seller.request('/api/admin/orders/?field=name&search=%25')).json.data.orders.length,
  0,
  'Search percent must be literal, not wildcard.',
);
assert.equal((await alice.request(`/api/weddings/${y.weddingId}/`)).status, 404);
assert.equal((await bob.request(`/api/weddings/${x.weddingId}/`)).status, 404);
const content = {
  partnerOne: 'Mehrin',
  partnerTwo: 'Arib',
  partnerOneBn: 'মেহরিন',
  partnerTwoBn: 'আরিব',
  hosts: 'Together with our families',
  hostsBn: 'দুই পরিবারের ভালোবাসায়',
  message: 'আমাদের আনন্দের দিনে আপনাদের সাদর আমন্ত্রণ।',
  messageEn: 'Join us in celebrating our new beginning.',
  theme: 'jamdani',
  photos: [],
  generalEventIds: ['reception'],
  events: [
    {
      id: 'nikah',
      title: 'The Nikah',
      titleBn: 'আকদ',
      date: '2026-12-11',
      time: '16:30',
      venue: 'RESTRICTED VENUE',
      address: 'Private address',
    },
    {
      id: 'reception',
      title: 'The Reception',
      titleBn: 'বিবাহোত্তর সংবর্ধনা',
      date: '2026-12-12',
      time: '19:00',
      venue: 'The Garden Pavilion',
      venueBn: 'দ্য গার্ডেন প্যাভিলিয়ন',
      address: 'Gulshan, Dhaka',
      addressBn: 'গুলশান, ঢাকা',
    },
  ],
};
const mediaRoot = `/api/weddings/${x.weddingId}/media`;
const reservePhoto = () => alice.request(`${mediaRoot}/`, { method: 'POST', key: crypto.randomUUID() });
const badPhoto = await reservePhoto();
assert.equal(badPhoto.status, 200, badPhoto.raw);
const invalidPhoto = await alice.request(`${mediaRoot}/${badPhoto.json.data.id}/`, {
  method: 'PUT',
  contentType: 'image/jpeg',
  body: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"></svg>'),
});
assert.equal(invalidPhoto.status, 422, invalidPhoto.raw);
assert.equal(
  (await alice.request(`${mediaRoot}/${badPhoto.json.data.id}/`, { method: 'DELETE' })).status,
  200,
);
const reservations = await Promise.all(Array.from({ length: 5 }, reservePhoto));
for (const r of reservations) assert.equal(r.status, 200, r.raw);
assert.equal((await reservePhoto()).status, 409, 'Concurrent reservations must enforce five slots.');
const image = await sharp({ create: { width: 800, height: 1200, channels: 3, background: '#b18470' } })
  .jpeg()
  .withMetadata({ orientation: 6 })
  .toBuffer();
for (const [i, r] of reservations.entries()) {
  const asset = r.json.data;
  assert.equal(
    (
      await bob.request(`${mediaRoot}/${asset.id}/`, {
        method: 'PUT',
        contentType: 'image/jpeg',
        body: image,
      })
    ).status,
    404,
  );
  const uploaded = await alice.request(`${mediaRoot}/${asset.id}/`, {
    method: 'PUT',
    contentType: 'image/jpeg',
    body: image,
  });
  assert.equal(uploaded.status, 200, uploaded.raw);
  content.photos.push({
    id: asset.id,
    src: `/media/${asset.id}/960/`,
    alt: `আমাদের ছবি ${i + 1}`,
    position: i === 0 ? 'top' : 'center',
  });
  const readyAgain = await alice.request(`${mediaRoot}/${asset.id}/`, {
    method: 'PUT',
    contentType: 'image/jpeg',
    body: image,
  });
  assert.equal(readyAgain.status, 200, readyAgain.raw);
}
const firstPhoto = content.photos[0].id;
const ownerImage = await fetch(`${origin}${mediaRoot}/${firstPhoto}/480/`, {
  headers: { Cookie: [...alice.cookies].map(([k, v]) => `${k}=${v}`).join('; ') },
});
assert.equal(ownerImage.status, 200);
assert.match(ownerImage.headers.get('cache-control'), /no-store/);
const processed = await sharp(Buffer.from(await ownerImage.arrayBuffer())).metadata();
assert.equal(processed.format, 'webp');
assert.equal(processed.width, 480);
assert.equal(processed.height, 320);
assert.equal(processed.exif, undefined);
assert.equal((await bob.request(`${mediaRoot}/${firstPhoto}/480/`)).status, 404);
assert.equal((await client().request(`${mediaRoot}/${firstPhoto}/480/`)).status, 404);
const library = (await alice.request(`${mediaRoot}/`)).json.data;
assert.equal(library.filter((a) => a.state === 'ready').length, 5);
const saved = await alice.request(`/api/weddings/${x.weddingId}/draft/`, {
  method: 'PATCH',
  body: { expectedRevision: 0, content },
});
assert.equal(saved.status, 200, saved.raw);
const stale = await alice.request(`/api/weddings/${x.weddingId}/draft/`, {
  method: 'PATCH',
  body: { expectedRevision: 0, content },
});
assert.equal(stale.status, 409);
const races = await Promise.all(
  ['one', 'two'].map((label) =>
    bob.request(`/api/weddings/${y.weddingId}/draft/`, {
      method: 'PATCH',
      body: {
        expectedRevision: 0,
        content: {
          ...content,
          photos: [],
          partnerOne: 'Nadia',
          partnerTwo: 'Fahim',
          messageEn: label,
          generalEventIds: [],
        },
      },
    }),
  ),
);
assert.deepEqual(
  races.map((r) => r.status).sort(),
  [200, 409],
  'Concurrent saves must have exactly one winner.',
);
const published = await alice.request(`/api/weddings/${x.weddingId}/publish/`, {
  method: 'POST',
  body: { expectedRevision: 1 },
  key: crypto.randomUUID(),
});
assert.equal(published.status, 200, published.raw);
const detail = (await alice.request(`/api/weddings/${x.weddingId}/`)).json.data;
const guestWorkspace = await alice.request(`/weddings/${x.weddingId}/guests/`);
assert.equal(guestWorkspace.status, 200);
assert.ok(
  guestWorkspace.raw.includes('আপনজনেই আয়োজন পূর্ণ'),
  'Joined live-version read must render the guest workspace, not a streamed error.',
);
const publicPath = `/i/${detail.wedding.slug}/`;
const publicPage = await client().request(publicPath);
assert.equal(publicPage.status, 200);
assert.ok(!publicPage.raw.includes('RESTRICTED VENUE'), 'Restricted event leaked into HTML/RSC.');
assert.match(publicPage.headers.get('cache-control'), /no-store/);
const generalPhotoPath = `/i/${detail.wedding.slug}/media/${firstPhoto}/960/`;
assert.equal((await client().request(generalPhotoPath)).status, 200);
assert.equal((await client().request(`/i/${detail.wedding.slug}/media/${firstPhoto}/999/`)).status, 404);
const rawObject = await fetch(
  `${databaseUrl}/storage/v1/object/public/wedding-media/${x.weddingId}/${firstPhoto}/960.webp`,
);
assert.notEqual(rawObject.status, 200, 'Private storage must not expose public objects.');
const csrf = await fetch(`${origin}/api/weddings/${x.weddingId}/draft/`, {
  method: 'PATCH',
  headers: { Origin: 'https://evil.test', 'Content-Type': 'application/json' },
  body: '{}',
});
assert.equal(csrf.status, 403);
const hid = crypto.randomUUID();
const namedInput = {
  name: 'Rahman Family',
  nameBn: 'রহমান পরিবার',
  greeting: 'প্রিয় রহমান পরিবার',
  greetingEn: 'Dear Rahman Family',
  message: '',
  messageEn: 'A place is waiting for you.',
  privateNote: 'HOST_PRIVATE_NEVER_GUEST',
  events: [{ eventId: 'reception', maxPeople: 5 }],
};
const householdSaved = await alice.request(`/api/weddings/${x.weddingId}/households/`, {
  method: 'POST',
  body: { id: hid, expectedRevision: 0, household: namedInput },
  key: crypto.randomUUID(),
});
assert.equal(householdSaved.status, 200, householdSaved.raw);
const linkPath = `/api/weddings/${x.weddingId}/households/${hid}/link/`;
const copied = await alice.request(linkPath, {
  method: 'POST',
  body: { kind: 'copy', expectedRevision: 0 },
  key: crypto.randomUUID(),
});
assert.equal(copied.status, 200, copied.raw);
const personalUrl = copied.json.data.url;
const copiedAgain = await alice.request(linkPath, {
  method: 'POST',
  body: { kind: 'copy', expectedRevision: 1 },
  key: crypto.randomUUID(),
});
assert.ok(copiedAgain.json.data.url === personalUrl, 'Recopy must preserve the credential.');
for (const path of [
  `/api/weddings/${x.weddingId}/households/`,
  `/api/weddings/${x.weddingId}/households/${hid}/preview/`,
  `/api/weddings/${x.weddingId}/wishes/`,
])
  assert.equal((await bob.request(path)).status, 404);
const guest = client();
const token = new URL(personalUrl).pathname.split('/').filter(Boolean).at(-1);
const exchange = await guest.request('/api/guest/exchange/', {
  method: 'POST',
  body: { slug: detail.wedding.slug, token },
});
assert.equal(exchange.status, 200, exchange.raw);
const guestApi = exchange.json.data.path + 'api/';
const invite = (await guest.request(guestApi)).json.data;
const guestPhotoPath = exchange.json.data.path + `media/${firstPhoto}/960/`;
assert.equal((await guest.request(guestPhotoPath)).status, 200);
assert.equal((await client().request(guestPhotoPath)).status, 404);
assert.deepEqual(
  invite.content.events.map((e) => e.id),
  ['reception'],
);
assert.ok(!JSON.stringify(invite).includes('HOST_PRIVATE_NEVER_GUEST'));
assert.ok(!JSON.stringify(invite).includes('RESTRICTED VENUE'));
const answer = {
  kind: 'response',
  expectedPolicyRevision: invite.policyRevision,
  expectedHouseholdRevision: invite.householdRevision,
  expectedResponseRevision: invite.responseRevision,
  answers: [{ eventId: 'reception', attendance: 'accepted', adults: 2, children: 1, note: 'See you there.' }],
};
const rsvpKey = crypto.randomUUID();
const firstReply = await guest.request(guestApi, { method: 'POST', body: answer, key: rsvpKey });
assert.equal(firstReply.status, 200, firstReply.raw);
const replayReply = await guest.request(guestApi, { method: 'POST', body: answer, key: rsvpKey });
assert.deepEqual(replayReply.json.data, firstReply.json.data);
assert.equal(
  (await guest.request(guestApi, { method: 'POST', body: answer, key: crypto.randomUUID() })).status,
  409,
);
const wishKey = crypto.randomUUID();
const wish = { kind: 'wish', body: 'তোমাদের নতুন জীবনের জন্য অনেক শুভকামনা।' };
assert.equal((await guest.request(guestApi, { method: 'POST', body: wish, key: wishKey })).status, 200);
assert.equal((await guest.request(guestApi, { method: 'POST', body: wish, key: wishKey })).status, 200);
const ownerReport = (await alice.request(`/api/weddings/${x.weddingId}/households/?event=reception`)).json
  .data;
assert.equal(ownerReport.summary.accepted, 1);
assert.equal(ownerReport.summary.adults, 2);
assert.equal(ownerReport.summary.children, 1);
assert.equal((await alice.request(`/api/weddings/${x.weddingId}/wishes/`)).json.data.rows.length, 1);
const correctionPath = `/api/weddings/${x.weddingId}/households/${hid}/responses/`;
const currentHousehold = ownerReport.rows.find((row) => row.id === hid);
assert.ok(currentHousehold);
const correction = {
  expectedResponseRevision: currentHousehold.responseRevision,
  expectedHouseholdRevision: currentHousehold.revision,
  expectedPolicyRevision: ownerReport.policyRevision,
  answer: {
    eventId: 'reception',
    attendance: 'accepted',
    adults: 2,
    children: 1,
    note: 'Confirmed by phone',
  },
  reason: 'Synthetic family confirmed their reply by phone',
  overrideClosed: false,
};
const correctionKey = crypto.randomUUID();
const corrected = await alice.request(correctionPath, {
  method: 'POST',
  body: correction,
  key: correctionKey,
});
assert.equal(corrected.status, 200, corrected.raw);
assert.deepEqual(
  (await alice.request(correctionPath, { method: 'POST', body: correction, key: correctionKey })).json.data,
  corrected.json.data,
);
assert.equal((await bob.request(correctionPath)).status, 404);
assert.equal(
  (await bob.request(correctionPath, { method: 'POST', body: correction, key: crypto.randomUUID() })).status,
  404,
);
const history = await alice.request(correctionPath);
assert.equal(history.status, 200, history.raw);
assert.equal(history.json.data.rows[0].source, 'host');
assert.equal(history.json.data.rows[0].previous.adults, 2);
const exportPath = `/api/weddings/${x.weddingId}/export/?event=reception`;
const exported = await alice.request(exportPath);
assert.equal(exported.status, 200, exported.raw);
assert.match(exported.headers.get('content-type'), /text\/csv/);
assert.match(exported.headers.get('content-disposition'), /attachment/);
assert.match(exported.headers.get('cache-control'), /private, no-store/);
assert.match(exported.raw, /আয়োজকের সংশোধন/);
assert.ok(!exported.raw.includes('PRIVATE HOST NOTE'));
assert.equal((await bob.request(exportPath)).status, 404);
assert.equal((await client().request(exportPath)).status, 401);
const hid2 = crypto.randomUUID();
const secondHousehold = await alice.request(`/api/weddings/${x.weddingId}/households/`, {
  method: 'POST',
  body: {
    id: hid2,
    expectedRevision: 0,
    household: {
      ...namedInput,
      name: 'Nabila Family',
      nameBn: 'নাবিলা পরিবার',
      events: [{ eventId: 'nikah', maxPeople: 2 }],
    },
  },
  key: crypto.randomUUID(),
});
assert.equal(secondHousehold.status, 200, secondHousehold.raw);
const personalUrl2 = (
  await alice.request(`/api/weddings/${x.weddingId}/households/${hid2}/link/`, {
    method: 'POST',
    body: { kind: 'copy', expectedRevision: 0 },
    key: crypto.randomUUID(),
  })
).json.data.url;
const visibilityPath = `/api/weddings/${x.weddingId}/visibility/`;
const visibilityDetail = (await alice.request(`/api/weddings/${x.weddingId}/`)).json.data;
const pauseBody = { live: false, expectedPublicationRevision: visibilityDetail.wedding.publication_revision };
assert.equal(
  (await bob.request(visibilityPath, { method: 'POST', body: pauseBody, key: crypto.randomUUID() })).status,
  404,
);
const pauseKey = crypto.randomUUID();
const paused = await alice.request(visibilityPath, { method: 'POST', body: pauseBody, key: pauseKey });
assert.equal(paused.status, 200, paused.raw);
assert.deepEqual(
  (await alice.request(visibilityPath, { method: 'POST', body: pauseBody, key: pauseKey })).json.data,
  paused.json.data,
);
assert.equal((await guest.request(guestApi)).status, 404);
assert.equal((await guest.request(guestPhotoPath)).status, 404);
assert.equal((await client().request(publicPath)).status, 404);
const resumed = await alice.request(visibilityPath, {
  method: 'POST',
  body: { live: true, expectedPublicationRevision: paused.json.data.publicationRevision },
  key: crypto.randomUUID(),
});
assert.equal(resumed.status, 200, resumed.raw);
assert.equal((await guest.request(guestApi)).status, 200);
assert.equal(
  (await alice.request(`/api/weddings/${x.weddingId}/`)).json.data.expiresAt,
  visibilityDetail.expiresAt,
);
if (process.env.DAWAT_BROWSER_MODULE) {
  const { chromium } = createRequire(import.meta.url)(process.env.DAWAT_BROWSER_MODULE);
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies(
    [...alice.cookies]
      .filter(([, v]) => v)
      .map(([name, value]) => ({ name, value, url: origin, httpOnly: true, sameSite: 'Lax' })),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${origin}/weddings/${x.weddingId}/`);
  await page.getByRole('heading', { name: 'Mehrin & Arib', exact: true, level: 1 }).waitFor();
  await page.screenshot({ path: `${artifactDir}/wedding-desktop.png`, fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `Overflow at ${width}px`);
    await page.screenshot({ path: `${artifactDir}/wedding-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Names & wording' }).click();
  await page.screenshot({ path: `${artifactDir}/editor-desktop.png`, fullPage: true });
  const field = page.getByLabel('First partner · original');
  await field.fill('Mehrin QA');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Draft saved' }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Names & wording' }).click();
  assert.equal(await field.inputValue(), 'Mehrin QA');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  assert.equal(await page.getByRole('button', { name: /Send.*reply/ }).count(), 0);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.goto(`${origin}/weddings/${x.weddingId}/guests/`);
  await page.getByRole('heading', { name: 'People make the celebration.' }).waitFor();
  await page.screenshot({ path: `${artifactDir}/guest-hub-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 900 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: `${artifactDir}/guest-hub-390.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await context.clearCookies();
  await page.goto(`${origin}${publicPath}`);
  await page.getByRole('button', { name: /^(Open your invitation|আমন্ত্রণ খুলুন)$/ }).click();
  assert.equal(await page.getByText('RESTRICTED VENUE').count(), 0);
  assert.equal(errors.length, 0, errors.join('\n'));
  await page.screenshot({ path: `${artifactDir}/general-invitation.png`, fullPage: true });
  await context.clearCookies();
  await context.addCookies(
    [...seller.cookies]
      .filter(([, v]) => v)
      .map(([name, value]) => ({ name, value, url: origin, httpOnly: true, sameSite: 'Lax' })),
  );
  await page.goto(`${origin}/admin/orders/`);
  await page.getByRole('heading', { name: 'Every order, a clear next step.' }).waitFor();
  await page.screenshot({ path: `${artifactDir}/seller-desktop.png`, fullPage: true });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const guestPage = await guestContext.newPage();
  guestPage.on('pageerror', (e) => errors.push(e.message));
  await guestPage.goto(personalUrl + '?lang=en');
  await guestPage.waitForURL(/\/h\/[0-9a-f-]+\//);
  assert.ok(!guestPage.url().includes(token));
  assert.equal(await guestPage.getByRole('button', { name: 'Send our reply' }).count(), 0);
  await guestPage.getByRole('button', { name: 'Open your invitation', exact: true }).click();
  await guestPage.getByRole('button', { name: 'Edit your reply', exact: true }).click();
  await guestPage.getByLabel('Adults, including you').fill('৩');
  await guestPage.getByLabel('Children', { exact: true }).fill('1');
  await guestPage.getByRole('button', { name: 'Send our reply', exact: true }).click();
  await guestPage.getByText('Your reply is confirmed on the server.').waitFor();
  const wishField = guestPage.getByLabel('Your message to the couple');
  await wishField.fill('Warm wishes from another phone.');
  await guestPage.getByRole('button', { name: 'Send a little love', exact: true }).click();
  await guestPage.getByText('Thank you for being part of our story.').waitFor();
  await guestPage.screenshot({ path: `${artifactDir}/personal-reply-390.png`, fullPage: true });
  const otherTab = await guestContext.newPage();
  await otherTab.goto(personalUrl2 + '?lang=en');
  await otherTab.waitForURL(/\/h\/[0-9a-f-]+\//);
  await otherTab.getByText('Nabila Family', { exact: true }).first().waitFor();
  await guestPage.reload();
  await guestPage.getByText('Rahman Family', { exact: true }).first().waitFor();
  assert.ok(!(await guestPage.content()).includes('Nabila Family'));
  const anotherDevice = await browser.newContext();
  const secondPage = await anotherDevice.newPage();
  await secondPage.goto(personalUrl + '?lang=en');
  await secondPage.waitForURL(/\/h\/[0-9a-f-]+\//);
  await secondPage.getByRole('button', { name: 'Open your invitation', exact: true }).click();
  await secondPage.getByText('Your reply is confirmed on the server.').waitFor();
  assert.equal(errors.length, 0, errors.join('\n'));
  await guestContext.close();
  await anotherDevice.close();
  await browser.close();
}
const replaced = await alice.request(linkPath, {
  method: 'POST',
  body: { kind: 'rotate', expectedRevision: 1 },
  key: crypto.randomUUID(),
});
assert.equal(replaced.status, 200, replaced.raw);
assert.equal(
  (await guest.request(guestApi)).status,
  404,
  'Rotated link must invalidate prior scoped sessions.',
);
assert.equal(
  (await guest.request(guestPhotoPath)).status,
  404,
  'Revoked session must lose protected photo access.',
);
const revoked = await alice.request(linkPath, {
  method: 'POST',
  body: { kind: 'revoke', expectedRevision: 2 },
  key: crypto.randomUUID(),
});
assert.equal(revoked.status, 200, revoked.raw);
assert.equal(
  (
    await guest.request('/api/guest/exchange/', {
      method: 'POST',
      body: { slug: detail.wedding.slug, token },
    })
  ).status,
  404,
);
const finalReport = (await alice.request(`/api/weddings/${x.weddingId}/households/?event=reception`)).json
  .data;
assert.equal(finalReport.summary.accepted, 1, 'Revocation must retain saved attendance.');
assert.equal(
  (await alice.request(`${mediaRoot}/${firstPhoto}/`, { method: 'DELETE' })).status,
  409,
  'Save draft removal before library removal.',
);
const savedWithoutFirst = await alice.request(`/api/weddings/${x.weddingId}/draft/`, {
  method: 'PATCH',
  body: { expectedRevision: 1, content: { ...content, photos: content.photos.slice(1) } },
});
assert.equal(savedWithoutFirst.status, 200, savedWithoutFirst.raw);
assert.equal((await alice.request(`${mediaRoot}/${firstPhoto}/`, { method: 'DELETE' })).status, 200);
assert.equal(
  (await client().request(generalPhotoPath)).status,
  200,
  'Published photo survives draft/library removal.',
);
await command({
  kind: 'suspend',
  orderId: x.orderId,
  expectedRevision: 2,
  reason: 'Synthetic suspension isolation verification',
});
assert.equal((await alice.request(`/api/weddings/${x.weddingId}/`)).status, 404);
assert.equal((await client().request(publicPath)).status, 200, 'Suspension must not unpublish guests.');
// Restore the synthetic workspace for manual review.
await command({
  kind: 'activate',
  orderId: x.orderId,
  expectedRevision: 3,
  reason: 'Restore synthetic account after verification',
});
writeFileSync(
  `${artifactDir}/result.json`,
  JSON.stringify(
    {
      origin,
      verifiedAt: new Date().toISOString(),
      sellerEmail,
      aliceEmail: `alice-${run}@example.test`,
      bobEmail: `bob-${run}@example.test`,
      weddingX: x.weddingId,
      weddingY: y.weddingId,
      publicPath,
      checks: [
        'email OTP',
        'existing verified session skips OTP form',
        'seller MFA',
        'authorized seller search and literal wildcard escaping',
        'transactional confirmation',
        'separate activation',
        'duplicate retry',
        'cross-wedding denial',
        'draft conflict',
        'concurrent draft saves',
        'publish',
        'filtered HTML/RSC',
        'no-store',
        'CSRF',
        'suspend without unpublish',
        'named household links and stable recopy',
        'real private RSVP/wish persistence',
        'audited host correction, replay and cross-tenant denial',
        'private CSV export and history attribution',
        'pause/resume gates guest content and media without extending hosting term',
        'scoped guest cookies and second-device receipt',
        'rotate/revoke invalidates prior guest sessions',
        'real max-five concurrent reservations and private Storage',
        'actual image decode/EXIF rotation/metadata stripping/WebP variants',
        'cross-wedding upload/photo denial and revoked guest photo denial',
        'published media retained after draft/library removal',
      ],
      browser: Boolean(process.env.DAWAT_BROWSER_MODULE),
    },
    null,
    2,
  ),
);
console.log(
  'Local verification passed. Synthetic account IDs, checks and optional screenshots saved under .artifacts/client-foundation. No OTPs or sessions were saved.',
);
