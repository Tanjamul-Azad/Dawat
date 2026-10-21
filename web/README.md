Current checkpoint: [21 October hardening and rehearsal](../docs/build-evidence/client-pilot-hardening-2026-10-21.md); 225 tests/23 files, seven migrations, fresh local HTTP/Auth/Storage and hosted fictional media/guest rehearsal pass. Vercel personal preview setup is in progress, not commercial launch.
# Dawat web application

**Current readiness:** see the [21 October audit](../docs/build-evidence/client-readiness-audit-2026-10-21.md), [96-case matrix](../docs/qa/client-v1-audit-matrix-2026-10-21.md) and [execution order](../plan.md). Hosted customer OTP login and media key/private Storage dependency roundtrip now work. Full hosted application photo processing, external HTTPS hosting, staff handoff, physical-device/performance and restore qualification remain.

21 October 2026. Next.js server deployment, Supabase Auth/PostgreSQL/Storage and the original Jamdani renderer. Backend, named guest links, RSVP/wishes/reports and private photo processing are implemented. **The product defaults to Bangla; English is secondary. Commercial launch is not yet qualified.** Latest evidence: [readiness audit](../docs/build-evidence/client-readiness-audit-2026-10-21.md). Remaining delivery: [task.md](../task.md).

## Hosted staging (current configuration)

The user-created **Dawat Staging** project (`zztiestaqjbsbjuzmbqp`, Mumbai/free) has all five migrations, applied using the connected Supabase plugin. Migration history matches repository versions. Hosted normal-role guest, media and response-tools proofs passed, with synthetic rows rolled back. The app targets hosted data on local port 3100; an independent offline QA configuration uses 3102 (currently stopped along with the Docker Linux engine). The website is not publicly deployed. One audited free test order/workspace is active and unpublished; no verified staff role or paid upgrade exists.

To select this or a fresh independently migrated hosted project, from `web`:

```powershell
npm run backend:connect -- https://PROJECT_REF.supabase.co sb_publishable_PUBLIC_KEY
```

The helper preserves `.env.local.offline-backup`, writes a dedicated hosted key ring to `.env.hosted.local`, and selects `.env.local`; it retains a previously supplied media processor key. All are Git-ignored. Back up the hosted AES key ring securely and independently from the database before real invitations; losing it breaks owner recopy, while removing old key IDs breaks older encrypted credentials. Never reuse offline keys in production. **Only the isolated Storage processor needs `SUPABASE_MEDIA_SECRET_KEY`; ordinary account/guest data queries retain session RLS.** Supply that secret privately in the selected environment and `.env.hosted.local`, never chat/source/`NEXT_PUBLIC`. Rebuild/restart when switching environments; never run synthetic local signups against hosted configuration. To return offline, copy `.env.local.offline-backup` over `.env.local` and restart the app. Preserve `.env.hosted.local` for switching back.

**SMTP delivery and hosted customer session verified.** Shared sender/username is `valtube101@gmail.com`, Gmail host `smtp.gmail.com`, port 465. Corrected App Password resolved the earlier 535 failure: hosted Auth accepted a test OTP and the user confirmed receipt. Both signup and sign-in templates use Bangla-first code-only email (`supabase/templates/code.html`, `{{ .Token }}`). `AUTH_EMAIL_ENABLED=true` in selected/saved hosted configuration enables private in-app verification. The user completed OTP/session/dashboard login; intended seller account verification/bootstrap and AAL2 are separate pending actions. One Dawat SMTP sender serves all customers; clients need only a receiving email address, no separate SMTP account. Guest link sharing remains manual. Set real deployment Site URL/redirects, keep verification enabled, and qualify rate limits/retry/MFA. Never paste credentials into source/chat. [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Google App Passwords](https://support.google.com/accounts/answer/185833).

For a public deployment, use a Next.js server host, canonical HTTPS `APP_ORIGIN`, the same public Supabase URL/key and privately supplied guest key ring. Apply future migrations once through the normal release process. Configure proxy/hosting logs to redact `/i/*/g/*` bearer paths and omit request bodies/cookies; no personal-link analytics. Verify no-store/cookie/security headers and public OTP behavior in the actual deployment. Hosted seller-role provisioning and full operational/recovery gates remain pending.

## Local setup

Requirements: Node 22, npm, Docker Desktop running Linux containers. From `web`:

```powershell
npm ci
npm run backend:start
npm run backend:env
npm run dev
```

The environment helper targets only local Supabase, writes `.env.local` once with public configuration, a fresh independent guest key ring and server-only local Storage processor key, and refuses overwrites. `APP_ORIGIN` must exactly match the browser origin/port; other mutation origins are rejected. Current hosted-config app uses **http://127.0.0.1:3100** because an existing process occupies 3000; use `npm run dev -- --port 3100` with matching configuration. Port 3102 currently runs independent offline QA with ignored `.env.qa.local` and `.next-local` build directory; it does not change hosted configuration.

Local services:

- App: `/auth/login/`, `/dashboard/`, `/admin/orders/`.
- Email inbox: http://127.0.0.1:54324 (local Mailpit; no external email is sent).
- Database studio: http://127.0.0.1:54323.
- Backend status: `npm run backend:status`; stop without deleting data: `npm run backend:stop`.

Sign in with a synthetic email, read its OTP in the local inbox and verify. Provision the first local seller:

```powershell
npm run backend:seller -- seller@example.test
```

This helper targets only the fixed local Docker database, requires an already verified account and records an audit event. Open `/admin/orders/`, enroll an authenticator and verify its code. Public signup metadata cannot grant seller access. Hosted staff provisioning must use an authorized database operator; this local helper never accepts a hosted connection.

## Working delivery flow

1. Seller records the intended email, actual agreed package, integer paisa amount and explicitly agreed hosting days.
2. Seller verifies the actual payment reference/amount or records an explicit complimentary/test exception. Exception orders remain payment-pending.
3. Confirm creates one wedding, empty draft, inactive grant and entitlement transactionally. Retry keys return the original result.
4. Separately activate the matching, already verified customer. No claim token or automatic email delivery exists in this slice. The customer signs in at `/dashboard/` and refreshes access.
5. Customer edits names/wording and stable Nikah/Reception events, saves incomplete drafts, reviews a shared-renderer preview and publishes valid content. Two-second idle autosave is acknowledged and serialized; manual save remains available. Uncertain failures pause autosave; conflicts preserve local edits for deliberate review.
6. General links show **only explicitly selected events**, are view-only, and use private/no-store responses. No selected events means unavailable. Existing publication survives draft changes and management suspension.
7. Open **Guests & replies**, add a named household, select published events and separate per-event total allowances (1–50). Optional private notes stay host-only. Preview uses the shared renderer and cannot submit. The host supplies identity; guests never enter a name.
8. Copy creates/reuses the same encrypted personal link. Share it manually; the app sends no message. Explicit Replace/ Revoke warns that old links and their sessions stop working while existing replies/wishes remain.
9. Opening `/i/:slug/g/:token/` performs a POST exchange, then replaces it with `/i/:slug/h/:householdId/`. A 12-hour HttpOnly cookie is scoped to that path, so several household links work in separate tabs without a global current guest. Forwarded links carry household bearer access, not individual identity verification.
10. RSVP uses actual server acknowledgments, expected policy/overlay/answer revisions and retry keys. Per-event accept/decline/count validation and deadlines are checked inside the transaction; a stale answer is a conflict. Wishes are private, idempotent, couple-addressed and independent of attendance. The dashboard shows event-specific pending/accepted/declined, adults/children, searchable 25-row pages and private wishes; cross-event totals are not unique people. Revoked households remain in invitation counts.

The first publish starts the order's agreed term once. Republish cannot restart it. Prices, durations, retention and selling policies have **not** been chosen for the business; local verification uses synthetic terms only.

## Private photos

Use the **ছবি / Photographs** editor chapter. Select up to five JPEG/PNG/WebP photos, each up to 10 MiB and 20 million pixels. Convert HEIC/HEIF to JPEG first. Server validates actual decoding, rejects unsupported/animated/corrupt/decompression-heavy input, rotates EXIF orientation, strips EXIF/GPS/XMP and produces 480/960/1600 WebP variants without upscaling. Original input exists only in bounded memory. Top/center/bottom framing, ordering and Bangla/English descriptions reuse the original gallery/lightbox and deliberate cover opening.

Reservation and upload are separate: `POST /api/weddings/:wid/media/` with `Idempotency-Key`, then raw-image `PUT /api/weddings/:wid/media/:id/`. Five active ready/reserved slots are enforced under wedding locks; expired unfinished reservations release capacity. Durable 2-minute leases and fingerprints support the same-file retry, with four attempts maximum. A shared cap allows four in-flight bodies/processes across instances; one native decoder per Node process bounds memory. Body buffering is limited to 10 MiB/30 seconds; transforms have bounded timeouts. Ready appears only after all private objects and the database commit acknowledge. Partial/uncertain failures never delete a possibly committed image; abandoned attempt objects become eligible for delayed cleanup.

The `wedding-media` bucket is private. A restrictive policy blocks browser/anonymous direct Storage operations even if another permissive policy exists. The server supplies a secret only in the dedicated media module. Owners read `/api/weddings/:wid/media/:id/:size/`; general guests read `/i/:slug/media/:id/:size/`; named guests read `/i/:slug/h/:hid/media/:id/:size/`. Every request rechecks the current owner/guest gate or general publication and exact asset reference. Responses are private/no-store WebP; storage keys and signed URLs are not sent to guests. Link revocation blocks future scoped reads, while already downloaded images cannot be recalled.

Draft save/publish rejects foreign, unready, removed, duplicate and arbitrary external/data-URL references. Photos remain private drafts until publication. Save a draft removal before removing an unused library photo; retained immutable publications pin their assets. Initial protective quotas: 30 reservations/wedding/24h and 50 ready assets including retained history, with explicit support errors; these are engineering bounds, not a commercial unlimited promise.

`npm run media:cleanup` runs the bounded trusted cleanup script (25 eligible attempts per batch, minimum 24h delay). It removes only abandoned/superseded attempts or removed photos with no retained publication reference, then records an idempotent acknowledgement. Schedule/monitor this on the actual trusted server before launch; no recurring job has been provisioned here. Retention policy, backup/object/key restoration and load/device qualification remain release gates.

## Security boundaries (ordinary application data)

- All normal application queries use the customer's verified Supabase session and RLS. No server service-role bypass.
- Direct writes to exposed tables are denied to anonymous/authenticated roles. Narrow transaction functions enforce identity, current membership, confirmed order/eligibility, active grant and unexpired entitlement.
- Seller actions require a controlled staff row **and AAL2**, checked again in PostgreSQL.
- Same-wedding composite publication pointer; one wedding/order; actor-scoped command replay; draft revision conflicts; immutable versions; private append-only audit/payment records.
- HttpOnly, SameSite cookies, request-origin validation, bounded JSON, no-store private responses, provider OTP limits and database actor mutation limits.
- Foreign/inactive workspace reads and writes return neutral unavailable errors. Banned/deleted accounts are denied even with a previously issued JWT.
- Production builds ignore `NEXT_PUBLIC_APP_MODE=demo`. Missing configuration fails closed. `/studio/` and `/operator/` route to authenticated surfaces. `/invite/` remains a fictional read-only template sample with its original art, gallery, reveal and music.

## Verification

```powershell
npm run typecheck
npm test
npm run build
npm run test:local
```

194 Vitest checks include PostgreSQL execution through PGlite with normal roles/RLS/media publication references, real sharp decoding/metadata/limits/concurrency, retained-key rotation, response acknowledgments/failures, photo retry state, acknowledged autosave/conflict recovery, corrections/CSV/visibility and Bangla defaults; no Docker is needed for these tests. `test:local` requires the running local Supabase stack AND app configured to that stack with a local media processor key; it refuses hosted configuration, creates unique synthetic accounts/orders, exercises actual OTP/MFA, seller search, concurrent photo processing/protected delivery, household RSVP/wishes, attributed correction/history/private CSV, pause/resume without term reset, revocation, concurrent saves and suspension. Set `APP_ORIGIN` for another local port. Latest HTTP/Storage run passed on 3102; browser media/device review remains pending.

Historical optional browser QA uses `DAWAT_BROWSER_MODULE` with Edge. It is not current UI evidence and must not be used to bypass disabled browser-control settings. Current browser interaction must use the enabled approved browser tools. Never store OTPs, TOTP secrets or sessions in evidence.

Generated schema types: `npm run backend:types`. Migrations: `202610200001_foundation.sql`, `202610200002_guest_delivery.sql`, `202610200003_media.sql`, `20261020094118_host_response_tools.sql`, `20261020094619_publication_visibility.sql`. Hosted history matches these versions; do not rerun them. `supabase/tests/hosted_guest_smoke.sql`, `hosted_media_smoke.sql` and `hosted_response_tools_smoke.sql` are rollback-only normal-role proofs, passed on the intended staging database. Media SQL uses synthetic object metadata, not actual hosted image bytes. CI runs typecheck/tests/build; GitHub run 39409058239 passed for 85dddfb. Use `npm run build` then `npm run preview -- --port 3100` with matching `APP_ORIGIN` for the optimized hosted-config local preview; avoid rebuilding while that preview is serving. The old static preview is historical.

## Next slices / launch gates

Current stable previews: hosted configuration on 3100 (`npm run build`, then `npm run preview -- --port 3100`); separate offline production QA on 3102 (`npm run qa:build`, then `npm run qa:preview`, using the existing ignored `.env.qa.local`). Run `npm run test:runtime` against the preview for non-email login/assets/authorization checks. Run `node --env-file=.env.qa.local scripts/verify-local.mjs` against offline QA for real synthetic transactions/Storage. Stop a preview before rebuilding its build directory. Do not rely on a stale development handler as release evidence.

SMTP receipt and hosted customer login are confirmed. Media key is configured; actual synthetic private Storage upload/download/public-denial/cleanup passes. Full hosted app photo reservation/decode/publication/guest delivery, intended-operator staff provisioning, public deployment, reassignment/retention policy, fresh bilingual/device/accessibility/performance review, deployed abuse/log controls, full recovery drills and commercial policies remain. Claims/outbox/gateway automation is deferred for the manual pilot; qualify it before enabling. Correction/CSV, acknowledged autosave and pause/resume are implemented. Cleanup is a bounded command; scheduling/monitoring still need deployment qualification. Product copy is Bangla-first; customer-entered content is preserved.

The development-only legacy sandbox remains available with `NEXT_PUBLIC_APP_MODE=demo`; its localStorage mutations are demonstrations only. Historical template tests/evidence remain in [build evidence](../docs/build-evidence/README.md). Original artwork/font/audio licensing remains in `design-source/` and `public/licenses/` / `public/audio/CREDITS.txt`.
