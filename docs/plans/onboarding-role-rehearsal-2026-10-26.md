# Buyer → seller → host onboarding and usability plan

Owner request: detailed onboarding/usability audit by three role agents, connected end-to-end work, and independent final validation by the root agent. Date: 26 October 2026, Asia/Dhaka. Current source baseline `b4b20b5`; published app source `3035442`.

## Purpose and scope

Find where a new Bangladeshi customer hesitates, loses context, gets stuck, or cannot recover. Follow one real application journey across three roles: browse → request → quote → agreement → transfer evidence → seller review → separate confirmation/activation → dedicated customer workspace → publish → manage 50 families → named links → representative guest replies. Fix priorities must be based on observed evidence, with no invented test success.

The live public site is inspected read only. All account/order/payment/activation/guest writes run against the isolated QA app `http://127.0.0.1:3102`, Supabase `http://127.0.0.1:54321`, local inbox54324. No actual bKash transfer, real customer order, real admin permission change, or external recipient message is part of the rehearsal. Simulated transaction evidence is explicitly marked LOCAL QA and never written to production. Automatic guest messaging remains deferred. Existing production account, data, sessions and issued links are preserved.

## Team, ownership and coordination

| Role | Responsibility | Owned report |
| --- | --- | --- |
| Buyer agent | New visitor exploration, prices/design choice, own-email login, order intake, quote agreement, payment instructions and simulated evidence submission | `docs/qa/onboarding-buyer-report-2026-10-26.md` |
| Admin agent | Synthetic seller/MFA, exact quote, accepted-order conversion, manual evidence review, separate confirmation and activation, dedicated link handoff | `docs/qa/onboarding-admin-report-2026-10-26.md` |
| Family agent | Activated customer's first run, publish, 50 fictional households, list/search/pagination, permissions, named links, representative guest replies, sharing rehearsal | `docs/qa/onboarding-families-report-2026-10-26.md` |
| Root | Infrastructure, common contract, cross-role checkpoints, independent reproduction and backend assertions, consolidated plan/report, prioritized fix backlog | `docs/qa/onboarding-validation-2026-10-26.md` |

All agents share files and browser cookies. Browser lease is sequential: **Buyer → Admin → Family → Root validation**. Other agents inspect source and prepare fixtures while waiting. Buyer may keep its UI open while admin performs local API quote/convert operations with an independent in-memory cookie jar. No agent alters app source in the audit stage. Root owns any subsequent coordinated fixes. No agent commits/pushes/deploys.

Shared ignored manifest: `.artifacts/onboarding-2026-10-26/journey.json`. It may contain runID, synthetic emails, request/order/wedding IDs, selected design, states and a non-secret dedicated customer workspaceURL. Never store OTPs, cookies, session or MFA secrets in it. Guest bearer links stay only in ignored fixture artifacts, never tracked reports. Reports contain fixture IDs and sanitized paths. Agent-specific screenshots and logs stay in their named artifact subfolders.

## Detailed journey and acceptance checkpoints

### 1. Discover and decide

1. A first-time buyer understands what is being sold, digital delivery and named family invitations without help.
2. Browse all six template previews, prices Normal৳500/Premium৳750/Customized৳1500, differences, custom WhatsApp path and manual payment timing.
3. Check home scroll/feature/FAQ/pricing/contact and menu/back behaviour on desktop and390px. Include320px, keyboard, focus, loading and reduced-motion observations where supported.
4. Design choice survives email OTP and return to order form. Existing/wrong account is apparent. No requirement to contact the developer or know internal terminology.

### 2. Request, quote and agreement

1. Create a request using only customer-facing instructions; record required fields, defaults, errors, success and next step.
2. Buyer can locate/resume the request after reload and knows who acts next. Seller sees the same ID/design/customer.
3. Seller quotes exact published price with an explicit90-day term, scope, delivery/revision/cancellation terms. Customer can read and accept the exact revision.
4. Seller creates the accepted order; customer sees payment readiness without unexplained navigation. Quote/order states are not conflated with paid/active.

### 3. Manual bKash and seller review

1. Receiving method **bKash Personal**, account **01606092143**, amount and own `DW-…` transfer reference are obvious and copyable.
2. Send Money instructions distinguish the order reference from the actual bKash SMS Transaction ID. Invalid/missing/duplicate evidence has actionable errors and preserves entered data.
3. Rehearsal submits an explicitly synthetic local TrxID/sender; never transfer money or claim settlement.
4. Pending review remains visible after reload; it does not activate access. Seller sees matching request/account/amount/sender/TrxID and records a reason.
5. Seller verification, order confirmation and customer activation remain separate, auditable actions. Nonstaff, non-AAL2 and wrong-customer attempts cannot gain authority. Stale updates/retries do not duplicate grants/orders.

### 4. Activation and first useful outcome

1. Activated buyer receives/sees a dedicated workspace link, can reopen it with the same verified email, and understands private dashboard vs public/named invitation URLs.
2. First-run path clearly asks for couple/family names, event date/time/place, optional photos/wording and preview; saves/failed saves/return states are understandable.
3. Required details are validated before publish. Preview makes selected template and recipient treatment clear; actual publication changes guest visibility only after explicit action.
4. Customer can identify draft vs live changes and hosting term. No unimplemented feature or automatic messaging is promised.

### 5. Fifty-family operation

1. Create exactly50 fictional households with IDs, names, event scopes, adult/child allowances and optional notes. Count UI vs API creation honestly.
2. Demonstrate25-row pagination, search, duplicate names, editing, multi-event totals and meaningful empty/loading/error states. Records survive reload; search/page changes do not lose edits.
3. Generate50 named links, validate intended household/event scope and copied/recopied stability. Private admin/customer URLs must not be offered as guest links.
4. Open representative family links as guests; record accept/decline/update and adult/child counts/wishes. Over-allowance and cross-household mutations are denied. Aggregates match persisted replies.
5. Revoke/rotate one link and prove old link/session denial without losing stored attendance. Report remaining share-ready count precisely.
6. Rehearse sharing without sending: correct named link and suggested wording/composer, clear manual send and status. Shared/delivered must never be claimed merely because a link was copied. Bulk entry/import/bulk sharing are evaluated as needs, not assumed implemented.

## Evidence and severity rubric

Each finding: ID, role/phase, environment, viewport, starting state, steps, expected/observed result, screenshot or API assertion, root cause confidence, customer impact, severity, proposed remedy and retest criterion. Separate **observed**, **source-inferred**, **not executed** and **blocked**. P0: money/access/privacy/data-loss failure. P1: core onboarding blocked or misleading. P2: task possible with substantial friction. P3: copy/polish. Do not turn a test limitation into a pass or a product failure without evidence.

Measure actual counts and interactions, time when observed, manual handoffs, repeated required input, context loss, dead-end screens and recovery quality. Do not invent latency/CSAT/conversion measurements. Browser screenshots prove rendered states; independent API/database checks prove persistence and authority. Neither replaces the other.

## Root validation and deliverable

Root checks the connected manifest: one buyer/request/quote/order/customer workspace across roles. Reproduce highest-impact findings independently, inspect authoritative local persisted state and cross-role totals; review screenshots, state transitions, role isolation and exact50-count claim. Run appropriate regression checks if application code changes. Compile a customer-first onboarding blueprint, ranked implementation batches, acceptance tests, dependencies, implemented capabilities vs proposed work, and remaining owner-only real payment/physical-device checks. Report to owner before broad redesign/implementation decisions. Any new UI design in the next phase starts with Imagegen and retains the approved visual system.

Audit status: **in progress**. Individual and root report conclusions are pending evidence.
