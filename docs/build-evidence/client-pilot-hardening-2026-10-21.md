# Client pilot hardening and user rehearsal

21 October 2026, Asia/Dhaka. Supersedes the open implementation findings in the [initial audit](client-readiness-audit-2026-10-21.md), while preserving that dated baseline. Launch qualification is still separate from implementation.

## Changes verified

- One or two stable events, including reception only; removing the last event or an event with replies is blocked. Re-adding a locally removed event restores its fields. Saved draft event choices cannot misrepresent the pinned public sharing scope.
- Required names, event titles and venues need actual letters/numbers without control characters. Forward migration `20261020204524_client_readiness_fixes.sql` delegates existing media validation and rejects invisible-only publication text. Applied once locally and to Dawat Staging; source filenames match six-entry hosted history. No applied migration rewritten.
- Unpublished guest management has an explicit publish-first state and direct editor action. Compact Bangla primary fields, optional translations, accessible photo ordering, visible mobile account disclosure and consistent guest error/receipt locale retain the Jamdani renderer.
- Expired editing sessions retain local text and offer sign-in in a separate tab, then refresh/conflict review. Provider outages return a service failure instead of pretending credentials are invalid. Draft and guest-response acknowledgements are validated before dropping retry state. OTP resend respects a countdown and server retry headers.
- JSON/upload streams and upstream requests have bounded waits. Private processed image responses stay below 3 MiB. Selected photos retain the advertised 10 MiB/20 MP limit; large browser inputs are dimension-checked, oriented, resized and encoded below 3 MiB before the authoritative server decode/metadata stripping/private Storage pipeline. No direct public Storage writes introduced.
- Non-root Node 22 standalone Docker image, env exclusions and a configuration/liveness-only `/health/` endpoint. Health does not certify Database, SMTP or a user journey.

## Evidence

- **224 tests / 23 files**, TypeScript check and optimized Next.js build pass. New regressions cover one-event flows, invalid publication text, published scope, unpublished state, acknowledgement failures, stalled streams, auth outage distinctions, health redaction and bounded image preparation.
- Current runtime smoke: Bangla login and static assets load; anonymous management/export/history denied; foreign-origin mutation denied; safe deep return path preserved. No email sent by smoke.
- All three hosted rollback proofs rerun after migration six: guest/isolation/RSVP/wishes, max-five/private media/pinning/revocation, and corrections/export/pause/expiry. Synthetic proof rows roll back.
- Fresh isolated local HTTP/Auth/MFA/Storage verification passes after migration six. Covers two-owner isolation, concurrent saves/reservations, real media decode/orientation, publication retention, stable link recopy, sessions, RSVP/wishes, corrections/history/export and suspend/pause/revoke. It uses loopback Supabase and Mailpit, never hosted customer credentials.
- Browser uploaded an **8,865,459-byte** JPEG, 2600×2400 with EXIF orientation6, through the real local editor. Fifth photo reached `ready` and autosaved; server result1477×1600, combined three responsive variants1,695,076 bytes. This proves actual browser preparation and processing; no Vercel-edge payload measurement is claimed yet.
- Actual hosted browser rehearsal used a separate fictional one-day wedding with five photos: orientation applied (400×600), metadata stripped, private guest images loaded, named allowance3, Bangla-digit RSVP2+1 and private wish persisted, owner totals3/replies1/wishes1, revoked link became unavailable. Rehearsal then paused, grant revoked and membership disabled; private records retained for audit. Original pilot `e2c385fd-247e-4379-8317-6a359e2c89c3` remains revision0/unpublished/no photos.
- Final Docker Linux standalone image build and non-root runtime/health smoke pass, including browser-size adaptation. Image manifest list `sha256:b936c855c74eb3326171c200e7e600bcc876f8171dd9c19d07a06b18d8eff7eb`; runtime user `node`, private env supplied only at runtime, temporary env file removed and test container stopped. Initial probe preceded readiness; smoke rerun after health200 passed.
- Responsive DOM widths320/390/768/1366 showed no horizontal document overflow in the publish-first screen. This is browser emulation, not physical-phone qualification.

## Repeated user review after fixes

The fresh local browser journey was repeated after rebuilding. At390px, edit → change section → autosave → reception-only → restore event → review → publish succeeded. A saved response protected its event from removal. Missing household scope produced a Bangla error before a write; selected reception with allowance3 created one household. Stable personal link exchanged to a token-free household route. Four-person Bangla-digit RSVP was rejected;2adults+1child and private wish saved and appeared in owner reports (two existing households, six total people). All five private thumbnails, the gallery image and full-size lightbox image loaded. Restricted venue and owner note were absent from guest DOM. Revoking that link made the already-open guest session unavailable while replies/wishes remained.

Review found and corrected: transient Auth outage incorrectly triggering sign-in redirection; inherited column direction stacking checkbox labels; unnecessarily expanded optional English household fields and generic-English household validation. Targeted regressions plus the final224-test suite pass. No new actionable defect in the repeated bounded journey; physical-device and external deployed qualification remain separate.

Vercel runtime is pinned to Node22 and a single Mumbai `bom1` function region near the database. Media handler duration120s, browser request150s; server waits remain individually bounded. Only actual deployment can qualify platform-specific payload/cookie/log behavior.

## External preview and remaining gates

User selected **Vercel, personal testing preview only**. Existing account is Hobby; do not use it for paid client service or silently purchase a plan. Import recognizes `web` and Next.js. Private env import, actual deployment, canonical HTTPS origin and hosted runtime checks are pending until separately recorded below. `.dev` DNS untouched.

Still open: intended seller verified identity/audited staff/AAL2, actual HTTPS user-loop/security/log review, real Android/iPhone/accessibility/performance/load, scheduled bounded cleanup/alerts, DB+Storage+all AES-key restore drill, privacy/retention/support/commercial decisions. Public sales/gateway remains deferred. No blanket “production ready” claim.
