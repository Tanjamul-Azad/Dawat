# Commerce, fulfilment and operations

> **Client V1 update · 20 October 2026:** [decision register](../decisions.md) tracks unresolved package/term/retention/budget choices; [release gates](../qa/client-v1-release.md) own qualification. Manual verified pilot may precede automatic checkout. This document creates no unlimited/lifetime policy, paid account commitment or automatic access entitlement.

Proposed operating model. This file defines product/engineering responsibilities; actual commercial policies and applicable legal wording must be finalized before accepting paid customers.

Selected commercial tooling, environments, clean-code/CI and measured budgets are owned by [production engineering](production-engineering.md). Local implementation is authorized and starting; paid deployment/accounts, merchant activation and accepting customer money are not established by a working browser prototype.

## Package catalogue

Launch with a clear DIY invitation package and assisted/custom quote. One server catalogue owns price, currency, limits, duration and inclusions. Marketing, review, checkout, receipts and admin read versioned snapshots from it. An older paid order retains the version purchased.

Required package fields: SKU/version, active state, amount/currency, event/photo/locales limits, RSVP modes, allowed templates/blocks, support scope, hosting term/start condition, edit policy, assistance/revision allowance if any and refund/cancellation-policy version.

Personalized guest/family links are launch capability under the same wedding/base theme: greeting/message, permitted events and allowance. Package language must state actual technical/hosting limits. The reported BDT 600 vendor offer and user's interpretation that unlimited may mean invitation links are not verified commercial terms for our service. Do not price or promise unlimited weddings/storage/lifetime hosting from them.

Final prices are unresolved. A finite 12-month hosting term is a working proposal. Decide whether the term starts at payment or first publication and state it explicitly; do not leave a paid draft consuming an unstated hosting period. Recommended working default for development: term begins at first publication, with a separately disclosed deadline to activate if the business adopts one.

## Payment runbook

1. Create quote and pending order on server.
2. Redirect to approved provider session.
3. Verify provider confirmation through documented process.
4. Check merchant/order reference, final status, exact amount/currency.
5. Record event once and grant entitlement once transactionally.
6. Enqueue receipt and expose actual status to owner.
7. Reconcile delayed/failed verification with durable retry.

Do not ask customers to pay again while the original attempt is unresolved. Support needs order reference, expected amount, provider reference and safe status history. A screenshot or customer-typed transaction ID may support manual investigation, but it cannot automatically mark an order paid.

Refund/reversal actions need provider evidence, a reason, audit trail and a defined entitlement consequence. Never implement a single unlogged admin “Paid” toggle as the normal payment system.

## Assisted-design service

```text
Request → scoped quote → accepted order/payment as applicable
→ materials complete → designing → proof version
→ consolidated revision round(s) → approval → publication
```

Brief fields: chosen theme/occasion, names/hosts/locales, events/venues, visual changes, photos, soundtrack preference, target date and public contact choices. State when the service clock begins. Separate missing-materials waiting time from production time.

Define a revision round as one consolidated feedback set. Distinguish factual updates from art-direction changes. Any extra charge requires an explicit itemized scope/quote before work. Version proofs and approvals so the team knows what was approved.

Launch can manage requests manually in the admin workspace; Growth adds a fuller customer proof/revision portal. Manual fulfilment still uses the same schema/renderer and auditable states.

## Daily operational views

| Queue | What it catches | Action |
|---|---|---|
| Payment pending too long | Callback/network delay | Reconcile provider status; avoid duplicate payment request |
| Verification mismatch | Wrong amount/reference/currency | No entitlement; inspect and resolve with evidence |
| Media rejected/stuck | Invalid or stalled processing | Explain safe retry or choose alternate image |
| Publish failed | Validation/transaction/asset problem | Preserve previous live card; fix specific issue |
| Awaiting materials | Assisted work blocked by brief | Request missing materials through approved product flow |
| Proof/revision due | Outstanding design work | Track assigned operator/next action |
| Dead-letter jobs | Repeated delivery/processing failure | Inspect safe logs, retry or escalate |
| Hosting approaching expiry | Upcoming customer lifecycle change | Notify according to actual policy and show export/renewal |

## Transactional jobs

Jobs are durable, retryable and idempotent. Store entity IDs and safe templates rather than entire private payloads in logs. Record attempts, last category, next retry and terminal state. A failed receipt email must not undo a valid payment or charge again.

Suggested jobs: media processing, payment reconciliation, payment receipt, publication ready notice, assistance/proof notice, hosting reminder, expired preview cleanup, orphan-media cleanup and configured retention deletion. Weekly marketing/planner digests are Expansion, not implicit launch subscriptions.

## Hosting lifecycle

Drafts are private. Publication starts the configured hosting entitlement clock. Unpublish hides the invitation while preserving its term/state. Expiry shows an intentional unavailable/archive/thank-you page based on product policy. Renewal extends entitlement through a verified order; it does not create a second wedding/lose responses.

Provide owner export and clear reminders before expiry. Custom domain, if later supported, needs verified ownership, certificate/routing checks, renewal/expiry status and unmapping on termination. A custom-domain sale must disclose recurring external costs where relevant.

## Data lifecycle

Before launch select and publish retention periods for incomplete drafts, unused uploads, original photos, optimized live derivatives, responses/private notes, account data and financial/audit records. Define export/delete and support escalation. Exact periods are unresolved; development configuration must not be presented as a legal policy.

Deletion workflow: authorize request → explain scope/impact → revoke links/access as appropriate → stage deletion → remove personal invitation/media/response data at configured time → retain only justified records according to actual policy → audit completion. Backups have a documented expiry and restore-handling process.

## Monitoring and incident response

Monitor provider-verification failures, pending orders, publish success/failure, RSVP error rate, upload rejection/processing lag and job backlog. Use aggregate metrics and request/entity IDs; exclude token URLs, OTPs, private messages and sensitive customer content.

Incident steps: identify affected wedding/order IDs → preserve correct financial/publication state → stop unsafe mutation path if necessary → diagnose using scoped data → restore/replay safely → communicate accurate status through authorized service channels → record cause and prevention. No routine support action should expose other weddings to the requester.

## Backup and release runbook

Back up the database **and actual required Storage objects**, not just object references. Proposed internal launch objectives are RPO ≤1h/RTO ≤4h across data/media/configuration; select/budget PITR or verified cadence and demonstrate restore. Daily DB backup alone does not satisfy the one-hour objective. Keep immutable theme versions and required originals recoverable. Release compatible migrations with expand/migrate/contract when needed, preserve rollback compatibility and do not delete paid-card art. Keep flags for unfinished packages/provider adapters.

CI must pass reproducible install, format/lint/typecheck, focused integration/security checks, production build and critical browser journeys. Record clean/prior-version migration results, target-device/performance results and synthetic load parameters before paid launch. The baseline's targets are proposed tests, not observed capacity or a public SLA.

### Guest credential keys and recovery

ADR A15 stores a verification hash plus authenticated-encrypted guest token, using a dedicated versioned application key in managed secret storage. Restrict decryption to owner-authorized copy and preserve link identity; log actor/link ID only. Keys stay separate from database backups and auth secrets. Back up required versions through controlled secret recovery; document who can restore them. Rotate encryption by authenticated decrypt/re-encrypt with fresh nonce and key version, without changing the raw guest URL. Verify new decrypts before retiring a key version. Credential revoke/replace is a different audited product action.

Test DB/object/key restore together in isolation. Missing old key must produce safe recovery error and explicit replacement/support path, not silently rotate customer links. A key compromise incident assesses affected ciphertext/links and can require explicit scoped credential replacement; preserve response history. Never email raw guest links as a routine operational report or send them to analytics.

Release record: code version, schema/template versions, environment, QA evidence, operator, rollout/rollback steps and known limitations.

## Growth/Expansion service rules to preserve

| Service | Rules to specify before implementation |
|---|---|
| Save the Date | Lighter product, no-RSVP default, matching full invitation, version/custom pricing |
| 3D/custom scene | Scene scope, artwork revisions, mobile fallback, payload and delivery |
| Gift credit | Purchaser/recipient, issuance/redemption, expiry, eligible products, refunds and fraud/replay handling |
| Coupons | Eligibility, stacking, expiry, product exclusions and server validation |
| Print exports | Format/layout/font support, processing, download expiry and revision policy |
| Public guestbook/photo wishes | Consent, moderation, takedown, storage and abuse limits |
| Planner | Budget/payments/contracts, vendor comparison, guests/tables/catering, tasks/binder and collaborators |
| Planner automation/AI | User-reviewed actions, source reliability, privacy, offline/sync conflicts and measurable limits |
| Messaging | User-initiated share first; automation requires explicit product consent, provider constraints and opt-out behavior |

These are preserved requirements categories from reference research plus our operating decisions, not claims that their private implementation was inspected.
