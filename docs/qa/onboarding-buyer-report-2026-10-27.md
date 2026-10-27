# Buyer onboarding rehearsal · 27 October 2026

Role: first-time Bangladeshi buyer. Baseline: current local source `3d9f26c` plus the owner's pre-existing uncommitted storefront CSS. No application files were edited. This report follows the [27 October execution plan](../plans/onboarding-role-rehearsal-2026-10-27.md).

The connected purchase journey reached **pending manual review after a rejected-evidence correction** through the actual customer UI. No money was transferred, no production order was created and no external message was sent. The payment evidence below is explicitly synthetic and exists only in the isolated test backend. Admin quote/conversion/rejection were performed by the admin agent through independent local APIs; they are not buyer UI actions.

## Environments and connected identity

| Item | Value |
| --- | --- |
| Current-source buyer app | `http://127.0.0.1:3102` |
| Local backend / OTP inbox | Supabase54321 / Mailpit54324 |
| Buyer | `buyer-onboarding-20261027@example.test` |
| Request | `4bea6b7e-a3a3-47ce-9c43-4c808a12f235` |
| Reference | `DW-8A12F235` |
| Selected design | `midnight` / চাঁদের আলো / Moonlit / Premium |
| Agreed quote | ৳750, 90 days from first publication; synthetic written scope, revision, delivery and cancellation terms |
| Order | `8b6c0e2e-5b74-4ad1-af73-a0407058181d` |
| Request event date | Left blank deliberately; unknown date is explicitly supported |
| First evidence | `LOCALQA-REJECT-20261027`, rejected for the correction rehearsal |
| Final evidence | `LOCALQA-20261027`, pending at buyer→admin handoff |
| Sender fixture | `01700000001`, fictional local test value |

Live discovery at `https://dawat-client-pilot.netlify.app/` was read only. It serves the preceding release, whereas the local source visibly includes Claude's updated brand and Bangla money presentation. Live design observations must not be treated as proof of current local styling. Edge was the available browser; the in-app browser was absent from the current inventory. Only agent-created audit tabs were used/closed; the unrelated Messenger call and owner sessions were not touched.

## Executed journey and evidence

Screenshots are actual JPEG browser captures under `F:/Projects/Wedding Card/.artifacts/onboarding-2026-10-27/buyer/`. They are not generated mockups. No cookies, session/MFA secrets or valid OTPs were saved.

| Step | Execution and outcome | Evidence |
| --- | --- | --- |
| 1. Discover | Read live home, explored its collection/pricing paths and a Moonlit invitation sample. Six design links were present; Premium filter returned three. Pricing showed500/750/1500 and custom WhatsApp discussion. No WhatsApp message was sent. | `live-home-desktop.jpg`, `live-collection-desktop.jpg`, `live-midnight-preview.jpg` |
| 2. Mobile discovery | Live390px pricing/collection and menu were inspected; menu revealed collection link. These snapshots are the preceding deployed release. | `live-pricing-mobile.jpg`, `live-collection-mobile.jpg` |
| 3. Current-source choice | Opened local collection, chose the third displayed design (Moonlit) and reached its order-introduction page. The selected design and ৳750 were shown. The current local choose control measured14px text and44px height at the observed921px viewport. | `local-collection-tablet921.jpg` |
| 4. Identity | Started order, reached OTP login with encoded return `/order/requests/?template=midnight`. Requested the fresh synthetic buyer's OTP. Entered an invalid six-digit code; a Bangla error appeared and email remained. Replaced it with the valid code written in Bangla digits; login succeeded. The selected Moonlit option survived. | `local-otp-entry.jpg`, `local-invalid-otp-mobile.jpg` |
| 5. Unsaved recovery | At390px entered name and brief, reloaded before submission and inspected the fields. Both values were empty. Re-entered them to continue. | `local-request-filled-mobile.jpg`; empty values observed through read-only DOM inspection |
| 6. Request | Submitted one actual local request through UI, with unknown date left blank. The UI displayed the reference, correct buyer identity/design and awaiting-quote state. | `local-request-created-mobile.jpg` |
| 7. Saved recovery | Reloaded the same selected-design URL after successful request. The blank new-request form reopened above the saved request. It was manually hidden with the same “নতুন অর্ডার” toggle. No second request was submitted. | `local-reload-reopens-new-request.jpg` |
| 8. Quote | Admin quoted the same request via API. Buyer refreshed, read price/90-day term/scope, checked consent and accepted the quoted revision through UI. Accepted state said the team must create an order before payment opens. | `local-quote-mobile.jpg`, `local-accepted-awaiting-order.jpg` |
| 9. Payment readiness | Admin converted the accepted request via API. Buyer refreshed and saw bKash Personal01606092143, ৳750, its own DW reference, Send Money steps and sender/TrxID form. | `local-payment-instructions-mobile.jpg`, accessibility snapshot |
| 10. Copy | Clicked number and reference copy controls and immediately read the resulting clipboard. Returned values were exactly01606092143 andDW-8A12F235. | Read-only clipboard assertions after the two explicit copy actions |
| 11. Invalid TrxID | Submitted the order reference in Transaction ID. Backend rejected it with actionable Bangla text. Existing inputs remained; the visual error was above the current viewport. | `local-reference-as-trxid-error.jpg`, role-alert text, source location |
| 12. Pending | Submitted the first clearly synthetic TrxID through UI. Form disappeared, pending record appeared and notice explicitly said not to pay again. No portal link was offered. | `local-first-payment-pending.jpg` |
| 13. Rejection and retry | Admin rejected the first record via API with an explicit correction/no-money reason. Buyer refreshed; rejected history/reason and a fresh correction form appeared, along with the full Send Money instructions. Submitted final synthetic TrxID through UI. | Accessibility snapshots; `local-rejection-correction-form.jpg` captures the top of the order, not the offscreen correction fields |
| 14. Resume/handoff | Reloaded after final submission. Transaction ID form count was0 and portal-link count0 while evidence remained pending. The new-request form reopened again because the selected-design query was retained. Released browser lease to admin and closed only this agent's created tabs. | `local-final-pending-resume-form-reopened.jpg`, normal DOM counts, shared manifest |

Screenshots are named for what was captured: `local-collection-tablet921.jpg` is not a390px screenshot. The rejected full-page capture timed out and was not used as evidence. No human completion-time, conversion-rate or satisfaction score is invented: rehearsal time includes audit pauses, invalid inputs and cross-agent coordination.

## Confirmed findings

### B01 · P1 · Reload reopens order creation after a saved purchase request

**Observed, high confidence.** Start at `/order/requests/?template=midnight`, save a request and reload. The saved record exists, but a blank “প্রথম ধাপ / আয়োজনের কথা জানান” form is the first primary content again. It recurred after pending payment. Source: `SalesDesk` initializes `creating` from `!!templateId || !initial.requests.length` and the selected-design query remains after a save. The button that hides this new form is still labeled “নতুন অর্ডার”.

**Impact:** a returning novice can think the earlier submission failed and create an additional request. The backend did not duplicate anything in this rehearsal; the risk is an avoidable second manual submission.

**Remedy:** after request creation, replace the URL with a request-specific canonical route or selected-request parameter; creation should be an explicit action, not inferred merely from a leftover design query. Reopen the saved state with one next action. Label a visible form's toggle “বন্ধ করুন/ফিরে যান”.

**Retest:** create once, reload/back/return through login at requested, quoted, accepted and pending states; same reference must open, new-request form must stay closed and persisted request count must remain one.

### B02 · P1 · Payment validation error is offscreen at the moment of failure

**Observed plus source confirmation, high confidence.** At390px fill sender and put `DW-8A12F235` into Transaction ID, then submit from the bottom of the long payment panel. The API correctly returns “সফল বিকাশ লেনদেনের Transaction ID দিন। অর্ডারের reference এই ঘরে দেবেন না।” Inputs remain available, but the screenshot at that instant shows the submit form with no visible error. `SalesDesk` renders the shared `error` near its main introduction rather than next to the failing field, and does not focus/scroll an error summary into view.

**Impact:** a sighted mobile buyer may repeatedly submit, assume the system is unresponsive or contact support. The role alert helps assistive technology, but does not solve the visible offscreen error.

**Remedy:** field-level error under Transaction ID, `aria-invalid`/`aria-describedby`, focus the invalid field or linked error summary, and retain both entered values. Request/quote/payment forms should share this recovery behavior.

**Retest:** invalid reference, missing/malformed sender and network/API failure from the submit viewport produce visible, announced and actionable errors without losing values; correct and resubmit successfully once.

### B03 · P1 · Pending/rejected payment screens retain pay-now wording

**Observed plus source confirmation, high confidence.** The first pending screenshot shows heading “পেমেন্টের নির্দেশনা” and instruction to make a manual payment immediately above a notice saying the transaction was received and not to pay again. After rejection, the entire Send Money number/reference/three-step block returns before the rejected record and its correction reason. The reason in this rehearsal explicitly said to correct details and not send money.

**Impact:** status is technically correct, but the most sensitive onboarding state contains competing instructions. A typo in evidence must not nudge someone toward sending the amount twice.

**Remedy:** separate **ready to pay**, **review pending**, **details need correction**, **verified awaiting activation** and **active** panels. Pending/correction headers must lead with “পুনরায় টাকা পাঠাবেন না”. Show the rejected record/reason and correction form first; payment instructions should be a secondary expandable reference. Do not assume a rejected TrxID proves the actual funds never arrived.

**Retest:** pending hides pay-now prompt; rejected evidence shows correction instructions first and retains prior record; resubmission produces one pending record; verified state provides a next actor and active state provides the dedicated portal.

### B04 · P2 · No recovery for an unsent request draft

**Observed, high confidence.** Filled name and meaningful brief vanished after reload before submission. The selected design survived. No warning or saved-draft indication was observed.

**Impact:** mobile tab eviction, back navigation or interruption can force retyping. This is friction rather than loss of an already-saved order.

**Remedy:** a scoped, short-lived local draft for the minimal request fields, or a clear unsaved-change guard; distinguish locally remembered input from a server-submitted request. Do not store session/OTP/payment credentials alongside it.

**Retest:** background/reload/return restores the exact input only for the correct draft/account; successful submit clears the unsent draft; starting another request is explicit.

### B05 · P2 · Buyer waits through a second seller handoff after accepting the quote

**Observed, high confidence.** Quote acceptance does not open payment. It displays “টিম অর্ডার তৈরি করলে পেমেন্টের ধাপ এখানে খুলবে।” The admin must convert the accepted request separately. The UI tells the next actor here, but supplies no response expectation or status-notification mechanism.

**Impact:** a motivated buyer may leave after accepting rather than complete payment. Actual seller response time was not measured; admin agents acted promptly for the test.

**Remedy:** consider idempotent pending-order creation as part of quote acceptance, while preserving manual verification and deliberate access activation. If conversion stays manual, explain why, show expected next contact/status and a saveable return link. Publish only a response expectation the owner can operate.

**Retest:** acceptance results in a deterministic next state; retry cannot create duplicate orders; buyer can resume without knowing internal request/order distinctions.

### B06 · P2 · Request waiting state has weak acknowledgement and next-step guidance

**Observed plus source inference, medium-high confidence.** Success text is the generic “সফলভাবে সংরক্ষিত হয়েছে।” The requested state gives a status badge and cancellation control, but no dedicated next-action card explaining review, expected response, how to return or whether the customer should now wait. Code polls every20seconds and on focus; that does not itself deliver an email/notification to a closed tab.

**Remedy:** state-specific receipt: request reference, chosen design/price, “এখন আমাদের টিম কোটেশন দেবে”, return link, support action and a realistic response expectation. Treat active-page polling separately from future notification delivery.

**Retest:** first-time buyer can explain current state, next actor and next useful action without support; closing/reopening the page returns to that receipt.

### B07 · P3 · OTP page loses visible purchase context

**Observed, high confidence.** Return URL and post-login selected design work, but the OTP page says only “বিয়ের কর্মপরিসরে” and does not visibly show selected Moonlit/৳750 or the reason this email will own the order. Ownership copy appears on the following screen.

**Remedy:** contextual heading “ইমেইল যাচাই করে চাঁদের আলো অর্ডার শুরু করুন”, small selected-design/price summary and clear ownership note, without exposing a private order to an unauthenticated visitor.

**Retest:** same design/price context is visible before and after OTP and survives invalid code/resend/back/locale switch.

## Positive behavior to retain

- Clear digital-invitation sample label and inability to submit guest replies on design samples.
- Published three-tier prices and manual-payment-before-activation explanation; no fictional gateway.
- Correct design survives OTP, including valid Bangla-digit OTP input and unknown event date.
- Quote has price, term and written scope before explicit buyer acceptance.
- Number/reference copy actions work; actual Transaction ID is distinguished from request reference and the wrong value is rejected in Bangla.
- Submitted evidence does not self-verify or activate the portal. Pending prevents immediate resubmission and says not to pay again. Rejected history is retained when corrected evidence is submitted.

## Not executed / limits

- No real bKash app, actual transfer, real SMS/settlement, production review/activation or external WhatsApp/email send. These cannot be claimed as passed.
- The buyer did not impersonate production admin or alter owner sessions/roles. Admin/family report owns later activation and50-family behavior.
- No current-source320px, physical-device, keyboard/screen-reader or full reduced-motion certification in this buyer run. Live390px inspection is not a physical phone test.
- Six collection choices were inspected as rendered options, but only Moonlit's live opened sample was interactively explored in this run. Other five full invitation behaviors are not claimed as individually executed.
- OTP expiry/resend cooldown, offline browser recovery and wrong-account switching were source-reviewed or discussed, not fully exercised. The invalid-code path was actually exercised.
- Sender phone validation is weak in source (`type=tel`, UI minLength11, API generic string minLength5); malformed/Bangla-digit/foreign-number submissions were **not executed**. Root should decide and validate the desired Bangladesh number normalization rule before implementing it.
- Full-page rejected capture failed; no screenshot from that failed call supports a visual pass. Root should independently reproduce B01–B03 and inspect the current source.

## Buyer handoff and next implementation order

Admin owns the browser after final pending submission. Same-chain manifest has buyer/request/order identity; family host must use that activated buyer's dedicated workspace. Unknown request date means this fixture cannot prove event-date carryover, but it can prove the selected Moonlit template and90-day term carryover.

Recommended order for root: **B01 resume correctness → B02 visible form recovery → B03 state-specific payment safety → B05 reduced acceptance handoff → B04/B06 draft/receipt recovery → B07 contextual identity**. Each fix needs a narrow regression test plus an actual mobile re-run; preserve approved visual styling and database permission boundaries. No agent deployment or application edit was performed.
