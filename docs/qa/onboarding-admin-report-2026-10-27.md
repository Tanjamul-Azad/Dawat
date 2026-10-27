# Admin onboarding/usability rehearsal · 27 October 2026

Status: historical admin rehearsal completed; family handoff sent. Role: Sub-agent2, seller/admin. Root validates the final report. Baseline `3d9f26c` plus preserved working-tree styles. Plan: [connected role rehearsal](../plans/onboarding-role-rehearsal-2026-10-27.md). The baseline sections below describe behavior before the fixes. The dated follow-up section at the end records current source changes and automated retests; no deployment is claimed.

## Scope and evidence labels

Production is read-only; no production orders, payment records, roles, credentials or guest links will be changed. All writes belong to `http://127.0.0.1:3102` / isolated Supabase54321 / inbox54324. The seller is synthetic `seller-onboarding-20261027@example.test`. No actual bKash transfer or external message is sent. A local test verification means simulated evidence only, never actual settled funds.

Reports distinguish **UI observed**, **API verified**, **source inferred**, **not executed**, and **blocked**. Screenshots/check results belong under `.artifacts/onboarding-2026-10-27/admin/`; no OTPs, cookies, MFA secrets or sessions are saved there or in this report.

## Procedure and pass conditions

1. Verify synthetic seller email; prove nonstaff denial. Bootstrap the local-only seller, prove AAL1 denial, enroll and verify synthetic MFA; prove AAL2 seller access.
2. Receive the buyer's exact request and preserve its verified email/design. Quote the fixed published price,90-day hosting from first publication and explicit scope/delivery/revision/cancellation terms.
3. Wait for buyer acceptance; convert that same accepted revision. Replaying the same command must not create another order; stale revisions must fail.
4. Prove order/payment submission does not activate customer access. Inspect synthetic sender, bKash method, amount, TrxID versus DW reference and review reason. Reject/retry if a clearly mismatched test record is provided.
5. Review evidence, confirm/provision and activate as separate actions, using intended verified customer identity. Preserve audit records and record the dedicated workspace path.
6. Reopen handoff, confirm access state and intended account ownership, sign out the local seller and give the browser lease to the family host.

## Connected test identity and state matrix

Buyer created request `4bea6b7e-a3a3-47ce-9c43-4c808a12f235` (`DW-8A12F235`) through the actual UI, using `buyer-onboarding-20261027@example.test`, selected `midnight` (Premium৳750), with unknown date supported. Seller read the same customer email/name/design through the normal seller API and quoted `75000` minor units /90 days at revision1. Package/notes explicitly label the local rehearsal and state scope, revision, delivery and cancellation terms. Buyer accepted through UI; seller API converted it to order `8b6c0e2e-5b74-4ad1-af73-a0407058181d` at requestrevision3. No actual payment has been received.

Buyer submitted the intentionally mismatched synthetic TrxID `LOCALQA-REJECT-20261027`, sender `01700000001`, through UI. Seller API observed pending record `529f5d09-92f2-4d8b-a1cc-95389a243fbb` with the correct amount75000 and buyer/request association. Seller intentionally rejected it with an explicit local/no-provider-transfer/retry reason. This is a recovery test, not an assertion about an actual financial record. Before and after rejection, order remained reviewing, paymentpending, no wedding or active access.

Buyer then resubmitted `LOCALQA-20261027`, payment `f1591434-2a50-4143-8fe6-3babe5d46fd8`, through UI. Admin UI showed both final pending evidence and rejected history, with matching customer, amount, sender and TrxID. Required reason and attestation were checked; submission without attestation was blocked by native validation. Admin verified only the isolated simulated record, then confirmed/provisioned and activated through three separate UI actions. Review reason explicitly says **LOCAL QA simulated ledger; no real transfer**.

Final normal seller API returned exactly one matching order: confirmed, `manually_verified`, revision3, active access, no exception. Wedding `dc3192f5-9f98-45c2-a048-be0cd4c5526a`; intended customer remains `buyer-onboarding-20261027@example.test`. Dedicated path `/weddings/dc3192f5-9f98-45c2-a048-be0cd4c5526a/` was derived from this authorized API result, **not supplied by the admin UI**. Family agent received that exact path and the same chain in the manifest. The local seller was signed out and the fresh controlled audit tab closed; no production session was changed.

| Checkpoint | Required state | Evidence |
| --- | --- | --- |
| Nonstaff / staff AAL1 | Seller API denied | API verified403 /403 |
| Staff AAL2 | Seller API allowed | API verified200 after local MFA |
| Quote | Requested → quoted, fixed price/term | API verified200; stale revision409, idempotent replay200 |
| Agreement | Buyer accepts exact revision | Buyer UI handoff; conversion read accepted revision2 |
| Conversion | Accepted → ordered, payment pending, access absent | API200, requestrevision3; stale409, replay200 |
| Payment submission | Pending evidence, access absent | Buyer UI + sellerAPI200; reviewing/pending/accessnull/weddingnull |
| Rejection recovery | Rejected evidence retained, resubmit possible | SellerAPI rejection200; buyer UI resubmission; adminUI sees both records |
| Review | Evidence verified independently of order confirmation | UI observed save acknowledgement/verified record; no real transfer |
| Confirmation | Order confirmed, access not yet active | UI observed `নিশ্চিত / বন্ধ`, then separate activate control |
| Activation | Intended verified customer granted access | UI observed `নিশ্চিত / চালু`; normal sellerAPI200 revision3/accessactive |
| Handoff | Same wedding opens through dedicated path | Exact API-derived path handed to family; customer opening is family agent's evidence |

## Historical baseline usability findings · before fixes

### A27-01 · Dedicated handoff is promised but not rendered · P2, high confidence

**UI observed and source corroborated.** After activation, close the modal. Success notice says `নিচের ঠিকানা কপি করুন; কোনো বার্তা পাঠানো হয়নি।`, but only renders `গ্রাহকের প্রবেশপথ: /dashboard/`. DOM inspection found zero `/weddings/` links. Reopening the order modal showed active access but no dedicated URL/copy action. Clicking the generic entry opened `/dashboard/`, which account-aware routing returned to the seller requests screen. The normal API nevertheless returned the valid weddingId; this is a missing handoff affordance, not missing activation authority. Evidence: `08-activated-no-dedicated-link-modal.jpg`, `09-activation-notice-generic-dashboard.jpg`.

Customer impact: extra manual composition and risk of copying an admin URL; uncertain completion after activating an order. Proposed remedy: persistent handoff card for the exact order, intended email, dedicated workspace URL, copy button, sign-in requirement and explicit unsent-message state. Retest with correct customer, wrong customer, expired session and reload.

### A27-02 · Review-to-activation loses the selected order context · P2, high confidence

**UI observed and source corroborated.** From the verified request, click `অর্ডার confirm ও portal activate করুন`. Destination `/admin/orders/` contains no orderId/email parameter or selected modal; intended buyer was absent from the first25 rows in this existing isolated dataset. Recovery required **four extra task actions**: fill buyer email, select email search mode, click search, click Review. This count excludes role switching/login/browser coordination. Evidence: `06-orders-context-lost.jpg`. Proposed remedy: direct order detail entry using exact linked orderId, preserving request return path and next-action guidance. Retest among25+ orders and duplicate names.

### A27-03 · MFA discards intended admin destination · P2, high confidence

**UI observed, source corroborated.** Sign in through `/auth/login/?next=%2Fadmin%2Frequests%2F`, verify email then existing synthetic authenticator. MFA succeeded but destination was `/admin/orders/`, not pending-review requests. One extra navigation action was needed to reach Requests & quotes. Evidence: `01-after-mfa-orders-context.jpg`; `Mfa` currently assigns `/admin/orders/` after verification. Remedy: carry a validated relative return path through the MFA page and complete authentication at that path. Retest direct request/order/customer paths, expired session, invalid external next and staff/nonstaff distinctions.

### A27-04 · Empty filtered queue retains an unrelated actionable detail · P2, high confidence

**UI observed, source corroborated.** With the ordered buyer selected, choose `কোটেশন` filter while no quoted requests exist. The request list had zero choices but the ordered buyer's evidence-review detail remained visible and actionable. Return to Payment review restores the one matching list entry. Evidence: `03-empty-quoted-filter-retains-unrelated-detail.jpg`; DOM assertion recorded0 requestchoices and selectedbuyer heading stillvisible. Impact: admin cannot tell whether they are acting on a member of the visible queue. No wrong-record mutation was performed or claimed. Remedy: selected request must belong to filtered results; otherwise show a clear empty state and hide detail actions. Preserve selection separately only when it remains a match. Retest filters after verify/reject/convert, empty pages and back navigation.

### A27-05 · Shared payment block speaks to seller as if paying · P3, observed

Admin request details retained heading `পেমেন্টের নির্দেশনা` and text telling “your order” to pay manually while the seller is actually reviewing a customer transfer. The default decision is already Verify, though reason+attestation prevent an accidental empty submission. Evidence: `02-pending-evidence-review.jpg`, `04-review-requires-evidence-attestation.jpg`. Remedy: seller-specific review heading and customer/amount/sender/TrxID checklist; require explicit decision selection instead of defaulting success. Retest verified/rejected/pending states with screen-reader and mobile.

## Historical proposed admin onboarding plan · current status below

| Priority | Change | Completion criterion |
| --- | --- | --- |
| First | Preserve exact request/order context through auth, MFA and review | Direct request opens after login; verified request opens its exact order, no search needed |
| First | Persistent activation/handoff card | Shows intended verified email, exact dedicated workspace URL, copy success/fallback, unsent state; remains after refresh |
| First | Filter/selection invariant | Empty filter has empty state and no unrelated mutation controls; selected detail always belongs to visible filter |
| Next | Role-specific next-step summary | New→Quote, Evidence→Review, Verified→Confirm, Confirmed→Activate, Active→Handoff shown clearly. The baseline Accepted→Create order step is superseded by atomic order creation on quote acceptance in the current migration. |
| Next | Structured quote and payment checklist | Fixed published price; term starts first publish; scope/delivery/revisions/cancellation visible without hidden assumptions; provider match criteria explicit |
| Next | Status recovery and audit context | Reject reason reaches buyer with retry, review confirmation names amount/customer, separate active/paid states, stale retry prompts refresh |
| Later | Queue-volume tools | Server-side request search/status filtering, pending counts, sensible sort and pagination; current25-slice limitation must be measured before implementation |

## Evidence and measured actions

All screenshot files are under `F:/Projects/Wedding Card/.artifacts/onboarding-2026-10-27/admin/`.01–09 cover MFA landing, pending evidence, empty filter, required attestation, verified result, lost order context, confirmed-but-closed access, active modal and generic handoff notice. Browser observations used the current-source local app, not production. Some earlier screenshots were captured at1440px; initial default viewport was921×880. A restart recovered a fresh Edge attachment and default viewport; no physical-phone or complete responsive admin certification is claimed.

Task action measurement: review→orders context loss required4 extra actions; MFA destination loss required1 extra navigation. No wall-clock task time, satisfaction or conversion score was inferred from interrupted tool sessions.

## Execution notes

- Prepared an isolated helper at `.artifacts/onboarding-2026-10-27/admin/admin-control.mjs`. Authentication material remains in its process memory only.
- Current-source app was unavailable at initial preflight while root prepared the build; inbox54324 was reachable. Root then confirmed QA ready; execution used only the isolated app. No hosted backend substituted for the local rehearsal.
- Buyer held browser while quote/convert/rejection operations used a separate in-memory HTTP session. These transitions are not counted as UI usability passes. Final verify/confirm/activate were actual UI. Role sign-outs for shared-browser coordination are excluded from product friction measurements.
- Premature activation before confirmation on orderrevision0 was denied409 (`PT409`). No wedding or access grant was created by the failed command.

## Historical baseline limitations and verdict

Admin successfully completed the connected isolated workflow with authority/state boundaries intact in the checks executed. The current user experience still requires context recovery and API assistance to provide the specifically requested dedicated handoff URL. Root should independently validate the final order/wedding/customer association and retest A27-01–04 after fixes. Family agent owns actual customer opening/first-run/50-family evidence. Nonstaff/AAL1, stale quote/convert, idempotent quote/convert and premature activate were API checked; customer self-verification/cross-customer access checks are root/family evidence, not invented admin passes. No real provider ledger, actual funds, external delivery, production mutation or launch certification is included.

## Independent follow-up code review · 28 October 2026

This section reviews the shared, uncommitted onboarding fixes after the baseline rehearsal above. It does not replace the historical UI observations or claim that the new code has been deployed. Family retained the browser lease; this follow-up used source review, isolated component/server-page tests and PGlite migration tests only. Root then authorized two small application fixes in `seller-orders.tsx` and `auth/mfa/page.tsx`, preserving the existing changes.

### Admin selection and handoff

The request action now includes the exact `order` query parameter (`sales-desk.tsx`, order-confirmation link). The orders page validates its UUID and independently fetches that order (`app/admin/orders/page.tsx:8–13`); `server/weddings.ts:80–83` still requires staff MFA before applying the exact ID restriction. Wedding/grant lookups are restricted to those selected order IDs. An order outside the first25 can therefore be opened without searching by customer name. Active-order detail now derives a dedicated `/weddings/{weddingId}/` path from the authorized order and provides copy; activation also renders the intended email, specific URL and explicit unsent-message notice. The persisted active detail covers reopening after refresh. These address the baseline source causes of A27-01/02; browser retest remains separate.

Review found a residual same-route navigation problem: the initial focus effect ran only on mount, so another linked order could leave the old action and order selected. The follow-up changes the effect to react to the focused order ID, clear previous action/create/retry/handoff state, and invalidate any old timeline when focus is removed. Component tests cover navigating A→B during an open confirmation form, a late timeline result from A, clearing the query selection, and copying the persisted active customer's exact path. This is automated component evidence, not a browser reproduction.

### Authentication return path

The shared fixes carry validated admin paths through MFA. Review found an expired-session corner case: the MFA page called `pageSession('/auth/mfa/')`, which sent fresh sign-in back to MFA without the original admin destination. The follow-up passes the validated admin destination to `pageSession`; fresh sign-in returns there and that route requires MFA again if necessary. Three server-page tests exercise an exact order path, requests path and rejected external destination. No nested MFA query or broader return-path allowlist was introduced.

### Filter and payment review

`sales-desk.tsx:139–147` derives its detail from the filtered result, so an empty queue cannot retain the previous actionable request in this implementation. Role-specific payment review copy and an explicit required empty decision are present (`sales-desk.tsx:795–800`). Existing sales-desk tests covering filter selection and the exact order link pass. These address A27-04/05 at source/component level; a fresh responsive/browser retest is still needed.

### Migration authority and regression assessment

`20261027120000_accept_opens_order.sql` retains verified identity, staff/AAL2 checks for quote/legacy conversion, owner-only acceptance, request row locks, expected revision, per-actor idempotency receipts, strict retry-body comparison and bounded intake. Acceptance creates an unpaid/reviewing order using the stored customer email/name/quote amount/term/template, records audit events and atomically marks the request ordered. It does not create a wedding, payment settlement or dashboard grant. Confirmation and activation remain staff operations. The legacy conversion branch remains for previously accepted requests. No authority regression was found in these reviewed paths.

Existing isolated migration tests passed for anonymous/unverified denial, customer row isolation/direct-write denial, staff AAL2, price enforcement, seller-on-behalf acceptance denial, stale revision, one unpaid order, absent wedding before confirmation, and separate payment/confirm/activate. Additional useful coverage before release: replay the *accept* command with its original idempotency key; submit concurrently under different keys and assert exactly one order; attach forged email/amount fields to acceptance and assert only stored quote values are used. These are recommended regression cases, not executed passes in this review.

### Remaining low-severity usability issue and verification

**P3, source-observed:** active-order modal copy (`seller-orders.tsx`, dedicated-link copy handler) records `copied` but the modal's button label stays “Copy link”; clipboard failure only clears that flag. A successful copy has no visible feedback inside the modal, and failure has no explicit recovery instruction. The URL remains visible for manual selection. Add local success/failure status with a manual-copy fallback and test a rejected clipboard promise.

Verification: `vitest run` on seller-orders, MFA page, navigation, sales-desk and sales integration tests: **5 files /24 tests passed**. Initial `npm run typecheck`: **passed**. A repeat during concurrent team edits reported a widened `PaymentSubmission.state` fixture in `sales-desk.test.tsx`; this unrelated test issue was sent to root rather than edited across ownership. Root owns final whole-tree verification. No hosted data, real money, credentials, production session, deployment or browser state was changed during this follow-up. The original connected request/order/wedding identity and baseline evidence remain preserved.
