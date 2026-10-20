# Execution tracker — Client V1

Updated: **20 October 2026**. Build order: [plan](plan.md). Acceptance: [E001–E096](docs/qa/client-v1-corner-cases.md). Historical prototype/task IDs: [archive](docs/archive/planning-before-client-v1-2026-10-20/INDEX.md).

## Completed in this planning pass

- [x] DOC01 — Write phased delivery plan and measurable first vertical slice.
- [x] DOC02 — Specify architecture, access/tenancy, transactions, media/cache and recovery.
- [x] DOC03 — Specify mobile couple/seller screens and guest-template preservation.
- [x] DOC04 — Specify data/API/metrics and 96 prioritized corner cases.
- [x] DOC05 — Record release/device/performance/recovery gates and open decisions.
- [x] DOC06 — Consolidate memory/index, archive prior notes and validate documentation.

These mean documents exist and are checked, not implementation or device qualification. Current template baseline is v6.4 with 82 tests at that historical checkpoint.

## Production implementation backlog

All CV tasks are **not started for the production slice**. Prototype code can be reused but does not satisfy server acceptance automatically. Dependencies are execution gates; compatible design work can proceed alongside backend work.

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

## First implementation session

1. Inspect actual code and applicable `AGENTS.md`; preserve cumulative local work.
2. Start CV01–CV04: adapter boundary, server configuration, migrations and negative authorization tests. Sketch CV10 entry/overview/editor/add-guest flows alongside this work; this does not assume extra agents.
3. Use two synthetic orders/weddings/accounts immediately. A dashboard wired only to global localStorage is not done.
4. Ask only for the credential/business choice blocking a dependent step; continue independent synthetic work.

Check tasks only with evidence. Record actual command/device outcomes and limits. Update plan/owning contract/memory together when scope changes. Legacy screenshots/tests are supporting evidence, not completion of production CV tasks.
