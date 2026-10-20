# Client V1 — pilot and paid-release gates

20 October 2026. **Checklist only; all production gates below remain open.** Scope and priorities: [plan](../../plan.md), [96 scenarios](client-v1-corner-cases.md). Track build tasks in [task.md](../../task.md).

## 1. Evidence package per release candidate

Record exact source revision/artifact, migration range, configuration/environment, template/schema version, tested role/fixture, actual outcomes, outstanding defects and rollback version. Never include credentials, raw personal tokens, private wishes or real guest contacts in shared evidence. Screenshots use fictional names/photos or explicit consent.

Unit checks are not database-policy evidence. Emulated viewport is not physical-phone sign-off. Navigation-only Lighthouse is not full interaction qualification. Delivery queued is not email delivered. Historical 82 tests/Lighthouse91 are not current release results.

## 2. First vertical-slice acceptance

- [ ] Seller creates/confirms Order X from verified manual/provider evidence or explicit recorded exception.
- [ ] Separate activation binds intended verified customer; duplicate attempts do not provision another wedding.
- [ ] X and Y log in with different accounts; direct-ID/database/storage/export tests prove isolation.
- [ ] Couple saves an incomplete draft, resumes on another device, completes it and publishes a valid immutable version.
- [ ] Base edits remain draft-only until republished; current live card survives failed republish.
- [ ] Host creates a named reception-only household, allowance3; recopy returns same URL.
- [ ] Guest opens on another phone; closed cover gates sections, deliberate tap permits immediate scrolling.
- [ ] Guest sees only their permitted event, no name form; replies2 adults +1 child and sends a separate wish.
- [ ] Couple sees accepted3 for that event, correct source/time and the private wish; ceremony totals unaffected.
- [ ] Retry/edit/revoke/rotate works without duplicates; old credential denied after revocation, responses retained.
- [ ] General link remains view-only and excludes restricted event information.

## 3. Integrity and security

- [ ] All applicable P0/P1 cases from E001–E096 have evidence; no unresolved blocker hidden under a generic “tested” label.
- [ ] RLS/grants and Storage rules tested as normal roles, including inactive/revoked grants and foreign tenant references.
- [ ] Server-only keys, guest-token recovery encryption, auth verification and staff role/MFA boundaries reviewed.
- [ ] Personal HTML/API, previews, exports and copy endpoints verified private/no-store on the actual deployment/CDN.
- [ ] HTTPS/security headers, origin/CSRF, safe redirects, link schemes and log/telemetry redaction verified.
- [ ] Shared request limits, upload/resource quotas, payload bounds and job authentication verified.
- [ ] Immutable publication, response uniqueness, idempotency/body conflicts and concurrent policy-change transactions tested.
- [ ] Export formulas/escaping and private-field exclusions tested with adversarial synthetic data.

## 4. Device and visual qualification

Retain [physical template run sheet](physical-phone-v6-1.md), but test the new integrated build. Minimum actual devices: Android Chrome and iPhone Safari; record model/OS/browser. Also sample WhatsApp in-app browser or document unsupported behavior and Open in browser fallback.

- [ ] Closed → deliberate open → immediate scroll → dates/maps/calendar → photo reel/lightbox → RSVP/receipt/edit → wishes in BN/EN.
- [ ] Cover before-open hash/scroll, immediate after-open native scrolling, no focus/frame reset and reduced motion.
- [ ] Zero/one/five photos, long Bangla/family names, long venues, missing translations, past/cancelled event.
- [ ] Music preference-off/on, real sound, pause/resume while scrolled, background return, playback rejection.
- [ ] Dashboard/editor/household/response screens at 320/390px, landscape/tablet/desktop; text 200% and real keyboard/safe-area controls.
- [ ] Keyboard and screen-reader basic paths, form errors, modal focus, contrast, touch targets and link naming.
- [ ] Browser back/forward, reload/offline/session expiry, private storage restrictions and copied-link reopening.

Store current screenshots and device notes separately from historical v6.4. Do not infer device success from LAN reachability alone.

## 5. Performance and capacity

Targets are provisional engineering budgets; record environment, resource bytes, route state and data distribution.

- [ ] Three repeatable cold mobile lab runs per locale, exact build; report median/range and all failures.
- [ ] Critical compressed transfer ≤1MB; guest JS ≤200KiB; report deferred gallery/audio separately.
- [ ] LCP ≤2.5s, CLS ≤0.1 target; interaction traces for open/scroll/gallery/response; field INP ≤200ms once enough data exists.
- [ ] Limited field data is marked insufficient; no fabricated p75 or INP from TBT.
- [ ] Realistic data fixture (initial target100 weddings/100k response rows), indexed pagination and server summary query plans.
- [ ] Ramp100 guest sessions and separately test20 valid RSVP writes/s for60s; record correctness, errors, p95/p99 and resource/cost use. Targets are test scenarios, not customer capacity promises.
- [ ] Provisional RSVP server-processing p95 ≤700ms; separate end-to-end network latency.
- [ ] No initial audio fetch; unused gallery/theme/editor bundles excluded from closed guest critical path; timers stop offscreen/background.

If the budget is missed, record user impact and mitigation; required product performance sign-off cannot be replaced by old measurements.

## 6. Operations and recovery

- [ ] Isolated staging/production credentials, buckets, callbacks and email recipients verified.
- [ ] Deployment/migrations/rollback rehearsed; prior publication remains recoverable.
- [ ] Backup restore includes DB, objects, theme/media versions, guest-token recovery keys and required config.
- [ ] Provisional RPO1h/RTO4h actually demonstrated or explicitly revised to funded, tested objectives before launch.
- [ ] Jobs retry/dead-letter safely; alert recipients and runbooks cover failures/backlog, failed payment reconciliation, storage/egress and availability.
- [ ] Visibility/access suspension, customer reassignment, key rotation, expiry, deletion/export and support procedures rehearsed.
- [ ] Cost sheet contains actual fixed/variable quotas, egress/media/email/payment fees and support cost per order; alerts configured.

## 7. Commercial/public launch gates

Controlled manual pilot may precede automated checkout; it still needs tenant safety, real persistence, clear customer terms and critical qualification.

- [ ] Final brand/domain, selling entity/contact, package price, included limits, hosting term/start, edits, expiry, retention, support and refund policy resolved.
- [ ] Licenses/provenance for fonts/art/music documented; current Canon recording attribution survives all generated pages/packaged assets where used.
- [ ] Required operational accounts/domains/tiers approved and configured; planning creates no purchase commitment.
- [ ] Automated gateway, if enabled, passes sandbox/live readiness and server verification/replay/reconciliation before accepting automatic paid orders.
- [ ] Public pages reflect actual capabilities; no fake reviews/guest counts/unlimited claims, no unrestricted demo seller/customer routes.
- [ ] Public order → seller confirmation → access activation → verified customer → personalized guest → response shown in production-safe smoke test.
- [ ] Current release evidence and outstanding limitations reviewed; concrete go/no-go recorded by product owner.

Beta defects become a bounded backlog. More templates and expanded marketing begin after this slice has operational evidence, rather than masking core issues.
