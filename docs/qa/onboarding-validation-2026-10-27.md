# Continuation and current verdict · 28 October 2026

**Source fixes implemented locally; final rebuilt browser/mobile retest and release pending.** The27October baseline below is historical. No commit, push, deployment or production database mutation occurred. One final release remains the owner's instruction.

## Current local implementation

Claude's incoming12buyer/admin and5family fixes were preserved. Additional independent review found and fixed:

- New quote revisions reset buyer consent; old checked consent cannot accept changed terms.
- Complete request drafts (name/date/brief/design) recover on same-page reopen and reload; failed submission retains them and successful acknowledgement clears them.
- Historical payment rejection does not show correction instructions after verification/activation.
- Expired MFA preserves the original safe admin destination. Same-route order navigation clears prior actions and ignores stale timeline responses.
- Bulk creation freezes row IDs/idempotency keys for safe retry after uncertain responses; confirmed rows are not replayed. Input cannot change mid-recovery.
- Invalid rows block the whole submission; malformed counts never silently become1;101+rows are rejected without truncation. Counts support Bangla digits,1–50people and100rows maximum.
- Bulk close/beforeunload guards protect unfinished progress. Cross-page duplicate search covers both events and ignores stale asynchronous responses; legitimate duplicate names remain allowed.

Earlier fixes retained: request reload/resume, inline mobile payment errors, no-double-payment guidance, next-actor cards, contextual OTP, exact admin order/workspace handoff, empty-filter correctness, explicit review choice, current-event defaults, save-and-add-next and simplified copy feedback.

Acceptance migration `20261027120000_accept_opens_order.sql` is local only. It atomically creates an unpaid order from the saved quote. It does not verify money, confirm an order or activate access; staff MFA/manual review/confirmation/activation remain separate. Legacy accepted requests retain conversion support.

## Root independent persisted verification

A28October explicit read-only database transaction matched the same connected request/order/wedding:

- Request4bea6b7e-a3a3-47ce-9c43-4c808a12f235 → order8b6c0e2e-5b74-4ad1-af73-a0407058181d → weddingdc3192f5-9f98-45c2-a048-be0cd4c5526a.
- Midnight Premium75000minor units,90-day test term; ordered/confirmed/manually_verified, intended buyer membership and active grant; published revision1.
- One rejected evidence and one verified correction, entirely synthetic local records.
- Exactly50families,50active named links; all50reception and17nikah. Actual creation: **2UI/48normal application API**, not50manual or bulk UI entries.
- Reception2accepted,1declined,47pending;4adults+3children. Nikah1accepted/2adults. Three wishes persisted.

Family role API evidence additionally proves50unique stable recopies, two superseded old links/sessions denied, preserved responses, excess allowance422, uninvited event422, cross-family404 and allowance-below-saved-party409. Root reviewed the saved assertions and independently checked final totals. No real funds or external messages were used. Evidence is ignored under `.artifacts/onboarding-2026-10-27/`, including `root-persistence-continued-28.json` and `families/api-evidence.json`; bearer links and credentials are not tracked.

## Verification and outstanding release checks

Automated/build results are appended after final sequential verification. Intermediate330passed predates further fixes. An overlapping test/build exhausted local memory (344/347executed, one crashed worker); **that attempt is not a pass**. QA build now uses one worker; final checks run sequentially.

Computer Use was stopped by automatic review after a native unsaved-change confirmation: it could not confidently determine the current Windows browser URL. No further UI automation or workaround was attempted. Exact action/rejection is in the family report. Consequently final rebuilt desktop/mobile, actual clipboard/guest-page walkthrough and new screenshots remain pending. API/component results do not replace those checks. Physical-device and real-provider settlement checks were not performed.

Before the single release: complete rebuilt visual/interaction checks, review final diff, apply the reviewed hosted migration in the final release, deploy once and perform non-destructive live smoke checks. Live currently remains on the earlier release.

Remaining UX beyond these fixes: canonical per-request resume URLs for accounts with several requests; owner policy for draft expiry/shared-device retention (email-scoped draft clears on successful submission, not logout); optional active-admin-copy feedback, sender-phone normalization and server-side queue search/filter expansion. Automated guest delivery remains explicitly deferred. Copy is prepared, never sent/delivered.

---

# Historical baseline follows · superseded where corrected above
# Root validation · onboarding and usability · 27 October 2026

**Status: in progress, not complete.** This report must not be read as a passed50-family rehearsal or production release. Owner requested three role agents, detailed onboarding plan, independent root validation and report before further work. Latest owner constraint: finish the whole batch, then deploy once; **no deployment or push has occurred in this audit**.

## Baseline and existing changes

Current checkout `3d9f26c` includes Claude's public/portal redesign and Bangla formatting work. Existing uncommitted `web/src/components/storefront.module.css` and `.claude/` are preserved. Local current-source optimized QA uses3102 and isolated Supabase54321/inbox54324. Live public discovery is a separate, older deployed version and is labelled accordingly. No production accounts/orders/payment records/privileges/guest content are modified.

## Team and evidence

- [Execution plan](../plans/onboarding-role-rehearsal-2026-10-27.md)
- [Detailed usability blueprint](../plans/onboarding-usability-blueprint-2026-10-27.md)
- [Buyer report](onboarding-buyer-report-2026-10-27.md)
- [Admin report](onboarding-admin-report-2026-10-27.md)
- [Family-host report](onboarding-families-report-2026-10-27.md)
- [Imagegen state reference and prompt](../prompts/imagegen-onboarding-state-2026-10-27.md): appearance guidance only, not proof of an implemented screen or approved response-time promise.

One connected synthetic buyer `buyer-onboarding-20261027@example.test`, request `4bea6b7e-a3a3-47ce-9c43-4c808a12f235` (`DW-8A12F235`), Moonlit Premium৳750, accepted90-day test quote and order `8b6c0e2e-5b74-4ad1-af73-a0407058181d` are used across roles. Unknown event date was intentional. No actual bKash money or external messages are part of this test.

## Independently checked so far

1. Current-source optimized build and typecheck pass. Bounded4-worker test run: **321/321 tests passed**,0failed; JSON evidence under ignored onboarding artifacts. An earlier unbounded JSON-reporter attempt produced no report and is not used as a pass claim.
2. Existing full local HTTP/Auth/MFA/Storage regression journey passed on the current build. It is a separate fixture from the connected three-role usability run.
3. Root read-only local database query verifies exactly one connected request/order, selected `midnight`, quote75000minor units and90-day term. Before admin review, order reviewing/paymentpending; no wedding, grant or membership. Rejected first evidence and corrected pending evidence persist independently. Query does not export sessions, credentials or guest bearer URLs.
4. Buyer screenshots reviewed: request receipt/selected design and actual mobile payment detail. Source confirms `creating` initializes from `!!templateId` even with existing requests, explaining blank request form reappearance after reload. Source confirms payment error is outside the payment form, explaining poor mobile error location. These are usability failures, not bypasses of payment validation.
5. Source confirms pending/rejected payment screen retains generic pay-now introduction and can re-show Send Money instructions after rejection. Buyer observed the corresponding UI; correction-state guidance needs to prevent duplicate transfers.
6. Source confirms seller requests route to generic `/admin/orders/`, while activation notice offers only generic `/dashboard/`. SellerOrder already contains weddingId, so exact handoff can be built without granting extra permissions. Actual postactivation reproduction is pending.

## Ranked findings under review

| Priority | Issue | Evidence / required retest |
| --- | --- | --- |
| P1 | Saved request reload reopens blank creation form | Buyer UI + source confirmed; reload canonical saved request with no duplicate blank form |
| P1 | Payment error is offscreen from mobile submit form | Buyer UI + source; inline actionable error, focus/announcement and retained inputs |
| P1 | Pending/rejected payment retains pay-now framing | Buyer UI + source; review/correction panels state no duplicate transfer; actual funds still manually matched |
| P2 | Seller handoff drops exact order and dedicated workspace context | Source confirmed; admin UI reproduction in progress; copyable assigned-email-specific entry survives reload |
| P2 | MFA loses intended admin destination | Admin UI reported + source hardcoded `/admin/orders/`; retest safe internal return through OTP+MFA |
| P2 | Queue filter can retain a detail outside its result set | Admin UI reported; retest empty/different filter clears or explicitly labels out-of-filter selection |
| Pending | Firstuse and50-family efficiency, scopes, replies and sharing | Family role execution not completed; do not infer actual50-count from prepared fixtures |

## Scope of the next implementation batch

No application fixes are implemented by this audit yet. First consolidate all role reports and root reproductions. Proposed first batch is request resume, visible state-specific payment recovery, admin context/handoff and MFA return; then firstuse and50-family entry improvements. The blueprint separates near-term changes from batch-import/notification features that need their own bounded server workflow. Do not silently change quote/term/refund policy or implement automatic guest delivery.

## Remaining before final report

- Complete same-chain admin review, confirmation, activation and handoff; root verify audit states and intended membership.
- Complete family firstuse plus50families/50links; record exact UI/API split, representative replies, allowances/scope/privacy/revocation outcomes and final valid-link count.
- Root reproduce highest-impact UI findings using its own browser lease; verify persisted final totals and authority.
- Mark proposed versus implemented work explicitly, and report unexecuted physical-device/real-settlement checks honestly. One final deployment only after fixes and all required validation, if included in the completed batch.


## Final automated verification · 28 October 2026

- **347/347 tests passed across43 files**, no unhandled errors; sequential single-worker run, exit0. JSON: ignored `.artifacts/onboarding-2026-10-27/final-tests-20261028.json`.
- Optimized `npm run qa:build` passed compilation, TypeScript, page generation and route build, exit0. Isolated QA config uses one build worker to fit alongside Docker; production worker configuration is unchanged.
- New built app restarted on `http://127.0.0.1:3102`.
- Full `npm run test:local` against explicit loopback app/backend passed storefront sales/payment/activation plus the local Auth/MFA/Storage/runtime verification, exit0. This uses a separate synthetic fixture and does not add families to the connected50-family rehearsal.
- `git diff --check` passed. QA-generated `next-env.d.ts` restored after verification; user/Claude source retained.
- Final browser/mobile checks and release remain pending for the browser-policy reason above. No production completion or new screenshot claim.

