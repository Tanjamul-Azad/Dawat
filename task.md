# Execution tracker — Client V1

**Visual update · 26 October 2026:** Reference-based home, six-card collection, payment, customer/seller/auth styling and generated floral assets deployed (`3035442`).296 tests, build/typecheck, isolated end-to-end sales/guest/media journey, live smoke and CI40349255588 pass. Browser access restored; actual desktop/mobile/live customer screenshots saved. [Evidence](docs/build-evidence/visual-reference-match-2026-10-26.md). Owner may request further visual refinement; no pixel-diff or physical-device certification claimed. Payment account settled; automated guest messaging remains deferred.

**Payment closeout · 26 October2026:** Owner confirmed bKash Personal01606092143; number/reference/TrxID instructions live in commitf461015.296 tests, full local journey, live smoke and CI40326239582 pass. No payment receiving information remains missing. Admin manually checks funds before verification/activation.

**26 October storefront update:** [current evidence](docs/build-evidence/storefront-commerce-2026-10-26.md) supersedes historical pilot-only work. Public UI, six designs, sales/payment APIs and admin/customer linkage live.293 tests/35files, optimized build, full local HTTP journey, live smoke and remote CI pass. Owner completed MFA and showed genuine seller panel for valtube101@gmail.com. Remaining: confirmed receiving payment details. Automatic guest messaging deferred.

Updated: **21 October 2026**. Build order: [plan](plan.md). Acceptance: [E001–E096](docs/qa/client-v1-corner-cases.md); current [96-case audit matrix](docs/qa/client-v1-audit-matrix-2026-10-21.md). Historical prototype/task IDs: [archive](docs/archive/planning-before-client-v1-2026-10-20/INDEX.md).

## Current readiness and next work

**Latest budget/design instruction:** BDT0 for new services. [Authoritative next-batch plan](docs/plans/free-first-product-delivery-2026-10-21.md) supersedes the older first-session sequence. The implementation items below remain unchecked until evidence exists.

- [x] PLAN07 — Record four-audience design, direct-client onboarding and zero-spend hosting/release/operations constraints, with current official provider sources.
- [ ] FT01 / UX01 — Exact-app Netlify Free compatibility proof and usage budget; remove stale prototype/simulation entry confusion and review entry/overview composition.
- [ ] UX02–UX04 — Direct wedding login return, wrong-account/access states, resumable first-publish checklist and clear private-vs-guest handoff.
- [ ] SEP01–SEP03 — Client/guest boundaries, validated origins/session/route/secret isolation and issued-link compatibility.
- [ ] UI01–UI03 — Compact overview/editor/guest management, mobile hierarchy and complete pending/error/conflict/share states.
- [ ] ADM01–ADM03 — Separate operator, intended seller/MFA bootstrap, recipient review, activation and audited copyable handoff.
- [ ] FREE01 / OPS01–OPS03 — Measured quota envelope, encrypted DB/object/key restore, cleanup/alerts/manual operating checklist and physical-device proof.
- [ ] PILOT01 — Full split-host synthetic loop, cleanup, then one intended-client pilot only after acceptance.
- [ ] PUB01–PUB03 — One-template public catalogue/demo/manual order/status/support/policies after client pilot.

No new host/project/domain or runtime split is provisioned by this planning pass. Existing228-test/Vercel evidence remains the baseline, not proof of future host compatibility.

[21 October hardening and rehearsal](docs/build-evidence/client-pilot-hardening-2026-10-21.md). **228 tests / 23 files**, typecheck/build/runtime, fresh local HTTP/Auth/MFA/Storage and four hosted rollback proofs pass. Core journey/state/recovery fixes and hosted fictional five-photo/RSVP/wish/revoke rehearsal are verified. Original pilot remains revision0/unpublished. Vercel personal HTTPS preview and repeated user review pass; commercial/external handoff remains unqualified.

| Order | Work | Status / completion gate |
| --- | --- | --- |
| 1 | A01/A02 — one-event setup + required meaningful text | Implemented, regression verified; migration six rejects invisible-only text. |
| 2 | A11/A12 — publish-first guest state + published sharing scope | Implemented, UI regressions and published/draft scope verified. |
| 3 | A06/A13/A14 — Bangla hierarchy, consistent locale, account/expiry recovery, preview guidance | Implemented core copy/hierarchy/locale/account/relogin; full device and wrong-account rehearsal remains. |
| 4 | A03/A05 — hosted media rehearsal + intended seller MFA handoff | Hosted five-photo pipeline and guest media verified. No hosted active staff yet. |
| 5 | A04/A09 — external HTTPS runtime/origins + deployment protections | Personal Vercel preview live: OTP/session, Mumbai runtime, upload, publish and guest/revoke verified. Commercial hosting, deeper log/abuse and release gates remain. |
| 6 | A07/A08/A16 — backup/restore, keys/objects, cleanup/alerts, retention/support | Open. Recovery and policy decisions must have evidence, not only documentation. |
| 7 | A10/A15 — phones/accessibility/performance/query/load | Open/partial narrow-browser review. No phone/Lighthouse/load pass claimed. |
| 8 | CV34/CV35 — public sales, then selected gateway | Deferred until client pilot gate closes; no fake working checkout. |

Claims, automatic activation delivery and gateway/outbox work remain conditional on enabling those features; manual verified activation and manual link sharing are the current pilot path. Keep current owner access distinct from a future client's own verified identity.

## Completed in this planning pass

- [x] DOC01 — Write phased delivery plan and measurable first vertical slice.
- [x] DOC02 — Specify architecture, access/tenancy, transactions, media/cache and recovery.
- [x] DOC03 — Specify mobile couple/seller screens and guest-template preservation.
- [x] DOC04 — Specify data/API/metrics and 96 prioritized corner cases.
- [x] DOC05 — Record release/device/performance/recovery gates and open decisions.
- [x] DOC06 — Consolidate memory/index, archive prior notes and validate documentation.

These mean documents exist and are checked, not implementation or device qualification. Current template baseline is v6.4 with 82 tests at that historical checkpoint.

## Production implementation backlog

Foundation implementation started on 20 October 2026. [Evidence](docs/build-evidence/client-foundation.md) and [run guide](web/README.md). Dependencies are execution gates; partial implementation is not full launch acceptance.

| Progress | Task IDs | Current boundary |
| --- | --- | --- |
| Implemented foundation, remaining qualification | CV01–CV05 | Server runtime/demo boundary, CI, seven migrations/generated types, normal-role RLS and local OTP/MFA. Hosted migrations/proofs pass; Gmail SMTP receipt confirmed. Hosted client login verified; intended seller bootstrap/AAL2 and frontend deployment remain. |
| Implemented workflow slice, remaining qualification | CV06–CV11 | Verified direct owner activation, seller orders/audit/search, payment verification/explicit exception, confirm/provision, suspend/revoke, compact contextual desktop/mobile shell, acknowledged autosave preserving concurrent typing, deliberate conflict recovery and paused retry after failure. Claims/delivery automation and fresh screen/device variants remain. |
| Implemented media slice, remaining deployed/device qualification | CV12–CV15 | Max five locked slots, actual bounded decode/rotation/metadata stripping/responsive private WebP, scoped proxies, retained publication references, positioning/order/captions and bounded orphan cleanup. Local real Storage and hosted normal-role SQL proof pass; Hosted app five-photo processing/rotation/private guest reads verified; phone review, deployed jobs and lifecycle controls remain. |
| Implemented slice, remaining release qualification | CV16–CV21, CV23–CV24 | Named household CRUD/scope/allowances and read-only preview, recoverable stable links/rotate/revoke, 12-hour scoped sessions, preserved Jamdani, transactional RSVP/edit/wishes, event summaries/search/25-row pagination, foreground refresh/backoff and retained failed edits/results. Current 228 tests and hosted normal-role rollback proof; historical local multi-session HTTP/Edge evidence. Key recovery drills, deployed log review and full device/UX matrix remain. |
| Implemented host operations slice | CV22, CV25, CV15 | Attributed correction history/reason, stale-revision protection, explicit closed-deadline override without allowance bypass; private full-filter CSV with formula neutralization, audit and no persistent public object; pause/resume gates guest content/media without resetting term or replies. Local HTTP/Storage and hosted rollback proof pass. |
| Implemented localization slice, remaining full copy/device qualification | CV10, CV26 | Bangla-first product shell/auth/customer/seller/guest management and email templates; English secondary, locale status/date/number copy, Bengali OTP/count digits, visible BDT amounts. Existing template preserved; fresh screen/device/long-text variants remain to qualify. |
| Not implemented / not qualified | CV27–CV36 | Claims/outbox automation, deployed operations/recovery/capacity/commercial/public deployment and remaining release gates. Remote CI succeeded for 85dddfb; external release qualification remains open. |

| ID   | Deliverable                                                                   | Depends on                        | Completion evidence                                                                            |
| ---- | ----------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| CV01 | Prototype inventory, demo/production adapter boundary, server migration spike | Current docs                      | Inventory, server spike, no implicit demo fallback, version/runtime review                     |
| CV02 | Environment/CI/config foundation                                              | CV01                              | Isolated synthetic staging, sanitized env examples, reproducible checks/build/no-secret checks |
| CV03 | SQL migrations/generated types, stable event/tenant schema                    | CV01                              | Clean/prior-version migrations, composite references/uniqueness                                |
| CV04 | RLS/grants/private storage policies, controlled staff roles                   | CV03                              | E001–E005/E061, normal-role two-account tests                                                  |
| CV05 | Verified customer auth, staff MFA, safe sessions/redirects                    | CV02, CV04                        | Login/logout/expiry/wrong-account/direct-call tests                                            |
| CV06 | Membership/grant/claim gate                                                   | CV05                              | Intended verified owner, single-use POST, crawler-safe GET, revocation                         |
| CV07 | Seller order list/detail/manual intake                                        | CV03, CV05                        | Independent states, authoritative price/term snapshot, pagination                              |
| CV08 | Payment evidence, confirmation, one-time provisioning                         | CV07                              | Verified manual/exception paths, duplicate/race/rollback tests                                 |
| CV09 | Activation/suspension/revocation/delivery                                     | CV06, CV08, CV29                  | Intended recipient, audit/retry; guest visibility independent                                  |
| CV10 | Inspectable mobile/desktop dashboard design and shell                         | CV01                              | C01–C08/S01–S05 variants, BN/EN, focus/error/locked states; docs alone insufficient            |
| CV11 | Persistent guided editor and acknowledged autosave                            | CV05, CV06, CV10                  | E017–E024, dirty/saved/conflict/offline/refresh and shared preview                             |
| CV12 | Max-five-photo upload/process/order/crop                                      | CV04, CV11, CV29                  | E057–E064, actual decode/metadata cleanup, phone format/retry behavior                         |
| CV13 | Draft/publish validation and pinned template/event review                     | CV11, CV12                        | Incomplete drafts accepted, invalid publish blocked, coherent media/events/locales             |
| CV14 | Immutable publication transaction and safe DTOs                               | CV08, CV09, CV13                  | E025–E028/E032, previous live survives failure, private fields excluded                        |
| CV15 | Term/visibility/expiry/archive and live-impact policy                         | CV14; O03/O04/O10                 | E029–E031, term starts once, no silent history/count loss                                      |
| CV16 | Named households/allowances/scope/personal preview                            | CV11, CV14                        | E033/E035/E038/E040, host identity, response conflict reconciliation                           |
| CV17 | Guest credential/create/recopy/rotate/revoke                                  | CV16                              | E034/E036, same URL on copy, retained household/history                                        |
| CV18 | Encrypted recovery/scoped sessions/cache/log safety                           | CV17                              | Multiple-link tabs, revocation-after-exchange and key recovery; no token leakage               |
| CV19 | Existing Jamdani connected to filtered live data                              | CV14, CV18                        | E033/E037/E065–E072, restricted event exclusion, no guest name form, preserved sample          |
| CV20 | Transactional RSVP/edit/idempotency/deadline                                  | CV18, CV19                        | E041–E047, second-device persistence, races and authoritative receipts                         |
| CV21 | Private couple-addressed wishes                                               | CV18, CV19                        | E048, no identity field, deduped plain text, no count effects                                  |
| CV22 | Audited manual host corrections/explicit override                             | CV20                              | E054, reason/source/revision checks, no silent overwrite                                       |
| CV23 | Server summaries/lists/status/search/pagination                               | CV16, CV20, CV21                  | E049–E053, exact event metrics, no false unique-person sum                                     |
| CV24 | Refresh/stale/error/filter/history state                                      | CV23, CV10                        | E055, timestamps, bounded polling/backoff, no false zeros                                      |
| CV25 | Authorized safe CSV/private exports                                           | CV23                              | E056/E084, complete intended scope, formula/Unicode safety, expiring artifacts                 |
| CV26 | Integrated template/mobile/accessibility regression                           | CV19–CV25                         | E065–E080, screenshots, long names/zero-one-five-photo/200% text                               |
| CV27 | Physical Android/iPhone full flow and listening                               | CV26                              | Device/OS/browser reports; actual keyboard/history/music, not reachability                     |
| CV28 | Fresh lab/interaction/query/load qualification                                | CV20, CV23, CV26                  | E093/E094, exact-build results; old Lighthouse91 not reused                                    |
| CV29 | Outbox/worker/retry/dead letters/alerts                                       | CV02, CV03                        | E060/E089/E090, durable bounded processing/delivery                                            |
| CV30 | Commerce/reconciliation contract for pilot mode                               | CV08, CV29                        | E010/E011/E015/E016, no proof/redirect-only grant or repeat entitlement                        |
| CV31 | Deployed security/abuse/privacy review                                        | CV04–CV25                         | E081–E088, actual cache/header/log checks and shared limits                                    |
| CV32 | Rollback/backup/object/key restore/runbooks/cost                              | CV15, CV18, CV29                  | E091/E092/E095/E096, demonstrated funded recovery and scoped restored data                     |
| CV33 | Bounded pilot evidence/go-no-go                                               | CV26–CV32; applicable O decisions | All release gates/P0/P1 resolved; concrete evidence reviewed                                   |
| CV34 | Public sales/one-template order/status/policies                               | CV33                              | Honest public journey, no premature management, real package terms                             |
| CV35 | Automated gateway if selected                                                 | CV30, CV34; O06                   | Verified callbacks/replay/reconciliation/refunds; seller activation separate                   |
| CV36 | Expansion evaluated from pilot needs                                          | CV33                              | Evidence-based backlog; more templates not automatic next task                                 |

## Historical foundation sequence — already started, do not restart

The following records the initial foundation sequence. The FT01/UX01 and subsequent batches at the top of this file are the next work.

1. Inspect actual code and applicable `AGENTS.md`; preserve cumulative local work.
2. Start CV01–CV04: adapter boundary, server configuration, migrations and negative authorization tests. Sketch CV10 entry/overview/editor/add-guest flows alongside this work; this does not assume extra agents.
3. Use two synthetic orders/weddings/accounts immediately. A dashboard wired only to global localStorage is not done.
4. Ask only for the credential/business choice blocking a dependent step; continue independent synthetic work.

Check tasks only with evidence. Record actual command/device outcomes and limits. Update plan/owning contract/memory together when scope changes. Legacy screenshots/tests are supporting evidence, not completion of production CV tasks.
