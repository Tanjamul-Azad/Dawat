# Dawat onboarding and usability rehearsal · 27 October 2026

## Objective and current baseline

Audit one connected purchase → admin review → activated host → 50-family journey as three real users, independently validate evidence, then produce a prioritized onboarding implementation plan and owner report. Current checkout `3d9f26c` includes Claude's storefront/portal redesign and deterministic Bangla date/taka fixes. Existing uncommitted storefront CSS and `.claude/` belong to the current workspace and must be preserved. Earlier [detailed scenario plan](onboarding-role-rehearsal-2026-10-26.md) is background; its baseline/date are superseded here.

## Environments and execution contract

- Live public URL: https://dawat-client-pilot.netlify.app/ — read-only discovery and responsive inspection.
- All purchase/account/order/payment/activation/guest writes: isolated app `http://127.0.0.1:3102`, local Supabase54321, inbox54324. Root builds the current working tree before testing.
- No real money transfer or production payment evidence. Local transaction evidence is clearly synthetic, not proof of receipt. No real recipients receive messages. Rehearse sharing through copy/composer only; copying is not delivery.
- Final production admin remains valtube101@gmail.com. No production roles, credentials, content or issued guest links change during this audit.
- Agents write their named report and ignored artifacts only; no application edits, commits, deployments or destructive cleanup. Root validates before deciding fixes. New UI designs, if later implemented, start with Imagegen and preserve the approved visual system.

## Team assignments

| Role | Tasks and handoff | Report |
| --- | --- | --- |
| Buyer | First visit, desktop/mobile exploration, six designs and prices, OTP/return-path, request creation, quote acceptance, bKash instructions/copy/reference, synthetic TrxID submission, pending review and resume. Hand exact request/order identity to admin. | `docs/qa/onboarding-buyer-report-2026-10-27.md` |
| Admin | Synthetic seller/MFA, intake discovery, published-price quote with explicit term/scope, accepted-order conversion, manual evidence review/rejection recovery, independent confirmation and activation, intended-email workspace handoff. | `docs/qa/onboarding-admin-report-2026-10-27.md` |
| Family host | Receive the same activated buyer's workspace, complete names/events/preview/publication, create exactly50 fictional families, allowances/event scopes/search/pagination/edit, generate50 named links, representative guest responses, rotation/revocation and sharing rehearsal. | `docs/qa/onboarding-families-report-2026-10-27.md` |
| Root | Current-source build, isolated infrastructure, common manifest/browser lease, evidence review and independent reproduction, API/persistence/authority checks, consolidated customer-first blueprint and ranked fix batches. | `docs/qa/onboarding-validation-2026-10-27.md` |

Shared manifest: `.artifacts/onboarding-2026-10-27/journey.json`. It contains synthetic identities, IDs, design, states, non-secret workspace path and browser lease only. Never store OTPs, cookies, session/MFA secrets. Guest bearer links may be kept only in ignored artifacts, never tracked reports. Every report labels UI vs API actions honestly.

## Sequential browser lease and role checkpoints

Only one agent controls the shared browser at a time. Other agents inspect source, prepare scripts/scenarios and use independent API cookie jars. Buyer discovery/request → admin quote → buyer acceptance → admin order conversion → buyer payment submission → admin verification/confirmation/activation → family host → root validation. Each handoff updates the manifest and messages the next agent/root. Owner-account sessions are preserved. Synthetic local sign-in/out is permitted.

## Detailed acceptance matrix

1. **Discovery:** first visitor can explain the digital product, six previews, Normal৳500/Premium৳750/Customized৳1500, custom discussion path, hosting term and manual verification. Desktop,390px and320px menus/cards/CTAs readable; no misleading print/gateway/automatic-message promise.
2. **Identity/context:** chosen design survives OTP/deep return. Correct email is visible; wrong-account recovery is understandable. Loading, expired-code, validation and retry preserve input and explain recovery.
3. **Request/quote:** reasonable required fields, date unknown supported, save acknowledgement, reload/resume, clear next actor. Admin sees exact buyer/design/request. Quote records exact price, term, scope/delivery/revisions/cancellation terms; buyer accepts the same revision.
4. **Payment:** bKash Personal01606092143, amount, order-specific DW reference, Send Money, real SMS TrxID and sender-number distinction are clear. Copy controls verified. Pending/rejected evidence remains understandable; invalid/duplicate/ref-as-TrxID cases preserve useful input and never imply settlement.
5. **Authority/activation:** customer cannot verify self; nonstaff/non-AAL2/cross-customer actions denied. Payment review, confirmation and activation remain deliberate separate actions. Correct verified customer receives a working dedicated dashboard path and can reopen it after sign-in. Double submits/stale requests do not create duplicate orders/grants.
6. **First-use:** one clear next action, names/event date/time/place, optional photo/wording, accurate selected-template preview, draft/save/error/published distinctions, explicit publication, visible hosting term. Private dashboard and guest URLs clearly separated.
7. **50 families:** exactly50 persisted fictional households, realistic duplicate/long Bangla names, adult/child allowances and event scopes. Record manual/UI entry count versus API seeding honestly. Search,25-row pagination, editing/reload and representative replies match persisted totals. Create50 stable named links, rotate/revoke one and prove old access denial without losing responses. State final valid/share-ready count precisely.
8. **Sharing:** copy/composer uses named guest URL and readable message. No external send; no claim of sent/delivered from copy. Report bulk-entry/import/mass-share needs separately from implemented capabilities.

## Evidence, usability scoring and final validation

Every finding records ID, phase/role, environment/viewport, initial state, reproduction, expected/observed outcome, screenshot or API assertion, severity, customer impact, confidence, remedy and retest. Label observed / source-inferred / not executed / blocked. P0 money/privacy/access/data loss; P1 blocked or misleading core onboarding; P2 substantial friction; P3 polish. Measure actual time/actions only when observed; do not invent conversion or satisfaction numbers.

Root checks one connected buyer/request/order/wedding across all reports; independently reproduces highest-impact findings; verifies counts and state/permission invariants using normal application APIs and isolated persisted data. Deliver current journey map, ideal onboarding states/copy/next actor, ranked implementation batches with acceptance criteria, capabilities versus proposals, owner-only real settlement/device checks, and a concise report for deciding further work. Audit completion is evidence, not broad launch certification.
