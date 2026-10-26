// Read-only/invalid-input checks only. Never sends an email or creates an account.
import assert from 'node:assert/strict';
const base = process.env.APP_ORIGIN ?? 'http://127.0.0.1:3100';
const pilot = process.env.DAWAT_SURFACE === 'pilot';
const request = (path, options = {}) =>
  fetch(new URL(path, base), { ...options, signal: AbortSignal.timeout(10000) });
const login = await request('/auth/login/');
const html = await login.text();
assert.equal(login.status, 200);
assert.ok(html.includes('lang="bn"'));
assert.ok(html.includes('name="email"'));
assert.match(login.headers.get('cache-control'), /no-store/);
const assets = [
  ...new Set(
    [...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)].map((m) =>
      m[1].replaceAll('&amp;', '&'),
    ),
  ),
];
assert.ok(assets.length > 0);
let bytes = 0;
await Promise.all(
  assets.map(async (path) => {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    bytes += (await response.arrayBuffer()).byteLength;
  }),
);
const id = '11111111-1111-4111-8111-111111111111';
for (const path of [
  `/api/weddings/${id}/export/?event=reception`,
  `/api/weddings/${id}/households/${id}/responses/`,
])
  assert.equal((await request(path)).status, 401);
assert.equal(
  (
    await request(`/api/weddings/${id}/visibility/`, {
      method: 'POST',
      headers: { Origin: 'https://invalid.example', 'Content-Type': 'application/json' },
      body: '{}',
    })
  ).status,
  403,
);
for (const path of ['/dashboard/', '/admin/orders/', `/weddings/${id}/guests/`]) {
  const response = await request(path, { redirect: 'manual' });
  if (pilot && path === '/admin/orders/') {
    assert.equal(response.status, 404);
    continue;
  }
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get('location'), base).searchParams.get('next'), path);
  assert.match(response.headers.get('cache-control'), /no-store/);
}
if (pilot) {
  for (const path of ['/operator/', '/studio/', '/templates/', '/order/', '/api/admin/orders/'])
    assert.equal((await request(path)).status, 404, path);
  assert.equal((await request('/health/')).status, 200);
}
if (!pilot) {
  for (const path of ['/', '/templates/', '/pricing/', '/contact/', '/policies/']) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const content = await response.text();
    assert.ok(content.includes('https://wa.me/8801606092143'), `${path}: support link`);
    assert.ok(content.includes('index, follow'), `${path}: public index metadata`);
  }
  for (const template of ['jamdani', 'ivory', 'holud', 'garden', 'midnight', 'rose']) {
    const response = await request(`/invite/?template=${template}`);
    assert.equal(response.status, 200, template);
    // The invitation hydrates from a loading cover; inspect its serialized server prop here.
    assert.ok(
      (await response.text()).replaceAll('\\', '').includes(`"templateId":"${template}"`),
      `${template}: selected design prop`,
    );
  }
  const selected = await request('/order/requests/?template=midnight', { redirect: 'manual' });
  assert.equal(selected.status, 307);
  assert.equal(
    new URL(selected.headers.get('location'), base).searchParams.get('next'),
    '/order/requests/?template=midnight',
  );
  for (const path of ['/api/sales/', '/api/admin/requests/'])
    assert.equal((await request(path)).status, 401, path);
  for (const path of ['/api/sales/', '/api/sales/payments/']) {
    const response = await request(path, {
      method: 'POST',
      headers: { Origin: 'https://invalid.example', 'Content-Type': 'application/json' },
      body: '{}',
    });
    assert.equal(response.status, 403, `${path}: origin enforcement`);
  }
}
console.log(
  JSON.stringify({
    login: 200,
    bangla: true,
    assets: assets.length,
    assetBytes: bytes,
    privateExportAndHistoryDenied: true,
    foreignOriginVisibilityDenied: true,
    anonymousProtectedRoutes: 307,
    deepReturnPathPreserved: true,
    noEmailSent: true,
    pilotStaffAndStorefrontBlocked: pilot,
    publicCollectionAndSalesGuards: !pilot,
  }),
);
