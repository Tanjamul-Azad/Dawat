# Decisions and unresolved policy — Client V1

20 October 2026. Planning defaults are not all user-approved commercial terms. Product owner is the user/seller; implementation owner is the developer. Update this register when resolving a choice, including why/impact and affected specifications.

## Confirmed product decisions

Latest implementation choices: autosave uses acknowledged snapshots and pauses after uncertain failure/conflict; choosing local conflict data requires deliberate save. Corrections record the original/changed answer, actor, reason and explicit closed-policy override; scope/allowance cannot be overridden. CSV is generated privately on demand across full selected filters (bounded to 10,000, no silent truncation), not saved as a permanent public file. Publication pause/resume preserves records/links/term and invalidates stale policy commands. Customer prices are entered in BDT and converted exactly to integer paisa. SMTP sender identity does not automatically authorize seller access. [Evidence](build-evidence/client-dashboard-workflow.md).

| ID  | Decision                                                                                                      | Consequence                                                      |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| D01 | Invitation template is primary product; preserve liked Jamdani direction                                      | One excellent template before collection expansion               |
| D02 | Public buyer browses/limited-preview/orders; seller confirms and separately activates                         | Login/payment alone cannot open management                       |
| D03 | Per-order wedding workspace and host-created named household links                                            | Tenant isolation mandatory; guest never enters own name          |
| D04 | Bangla and English only; mobile priority                                                                      | BN/EN states and real Android/iPhone paths required              |
| D05 | Sealed gift before deliberate opening; immediate scroll after tap                                             | No auto-open via fragment/reduced-motion or animation timer lock |
| D06 | Couple/families are the senders; wishes addressed to them                                                     | No fictional provider signature or guest identity form           |
| D07 | Maximum five photos, framed reel/manual controls, purposeful motion/music                                     | Zero/one/five variants and media fallbacks qualified             |
| D08 | Original premium design inspired by TDY, e-Nimontron service, Figma typography and Pinterest/Dribbble studies | Preserve provenance; no copying competitor assets/code           |
| D09 | 21 October: user sets BDT0 budget for new hosting/services | Free tiers/provider URLs first; no upgrade, top-up, auto-converting trial or new-domain purchase |
| D10 | User requests detailed design/onboarding/separation execution plan | [Current plan](plans/free-first-product-delivery-2026-10-21.md); three client nav destinations, four audience boundaries, staged host qualification |

## Architecture defaults for the next build

| ID  | Default                                                                         | Why / consequence                                                       |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| A01 | Couple dashboard + thin seller panel + backend before public redesign           | Proves actual product delivery first                                    |
| A02 | One repository with bounded surface apps, shared pure renderer/contracts; retain npm/CSS and tenant-secured backend | Incremental extraction after host compatibility proof; current single app remains working baseline |
| A03 | One order/one wedding; one primary verified owner at launch                     | Simpler access model; multiple workspaces per account still supported   |
| A04 | Immutable published base + live household overlay                               | No duplicated website per guest; clear publish/live-impact boundaries   |
| A05 | Named-response mode only; general link view-only                                | Accurate pending/declined and personalized welcome                      |
| A06 | Transactional commands, revisions, idempotency and scoped RLS/grants            | Prevent race corruption and cross-wedding access                        |
| A07 | Digest verification + encrypted token recovery; recopy is not rotate            | Hosts can reuse sent links without breaking them                        |
| A08 | Manual verified-order pilot before automatic gateway, if needed                 | Commercial flow can be proven without pretending checkout is integrated |
| A09 | No mandatory realtime; bounded refresh + timestamps                             | Correctness stays server-authoritative with simpler operations          |
| A10 | Private originals/restricted media; intentional general-safe caching            | Do not mix guest privacy with public CDN assumptions                    |
| A11 | Netlify Free first compatibility candidate; Vercel Hobby remains personal preview | Commercial-use allowance verified; exact app/credits/native processing still require proof, no migration claimed |

These are implementation recommendations within the existing brief, not provisioned infrastructure or paid account selections. If a later discovery changes one, update owning files before divergent code is introduced.

## Open choices and blockers

| ID  | Decision needed                                              | Working approach                                                                  | Must resolve before / owner                                                                 |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| O01 | Final brand/domain/selling identity                          | Dawat remains a working project label only                                        | Public content/domain setup; product owner                                                  |
| O02 | Price, included events/households/storage/support/edit scope | No inherited BDT600 or unlimited/lifetime promise                                 | Real quote/order acceptance; product owner                                                  |
| O03 | Hosting duration/start/expiry behavior                       | Proposed start at first publication, set once; no reset on republish              | Entitlement implementation and selling; product owner + developer                           |
| O04 | Draft/response/wish/media retention, deletion/export terms   | Explicit periods and archive/erasure rules, not indefinite retention by accident  | Live personal-data intake and cleanup jobs; product owner, verified policy advice if needed |
| O05 | Customer verification/recovery contact                       | Email OTP/session default; SMS/phone OTP not assumed                              | Auth delivery/account recovery; product owner confirms contact practicality                 |
| O06 | Merchant/provider and manual verification evidence           | Manual verified pilot possible; gateway chosen after eligibility/cost review      | Automated checkout/live merchant operation; product owner                                   |
| O07 | Actual free-host compatibility, region, quota and production environment | Budget fixed at0; Netlify Free first candidate, measure Bangladesh latency and actual account usage | Host acceptance/cutover; no paid fallback authorized |
| O08 | Backup/recovery cost/objectives                              | Earlier RPO1h/RTO4h were proposals; revise to an achievable zero-spend schedule and demonstrate DB/object/key restore | Real client intake; explicit support/recovery agreement, no unfunded recovery promise |
| O09 | Support response window and cancellation/refund flow         | Human seller handles initial pilot through published support channel              | Paid launch/public policy; product owner                                                    |
| O10 | Privacy level of general invitation/photos/event details     | General-visible events explicitly selected; personal response data always private | Publication defaults/real content intake; product owner + developer                         |
| O11 | Exact input/upload/package limits                            | Proposed bounds in data/API; qualify phone formats and resource use               | Schema/publish/upload UI and package promises; developer + product owner                    |
| O12 | Safe owner reassignment/additional family editor demand      | Primary owner only V1; audited re-verification, no password sharing               | Reassignment workflow; product owner; collaboration later                                   |

These do not block writing plans, synthetic development, UX or local integration fixtures. A pending commercial answer never counts as approval to invent a price, buy a service or publish customer policies. Ask only when the specific dependent implementation/release needs it; continue independent work.

## Changes since prior plans

- **21 October audit checkpoint supersedes older configuration blockers:** hosted customer OTP/session works; media key is privately set and Storage byte roundtrip/private denial verified. First seller bootstrap/AAL2, full hosted app processing, HTTPS frontend, recovery/operations and qualification are still pending. User wants one-client wedding pilot before public website expansion. Manual verified activation/sharing remains accepted; do not require claims/outbox/gateway automation for every pilot. Do not invent commercial limits from the test order's 90 days. See [readiness audit](build-evidence/client-readiness-audit-2026-10-21.md), [plan](../plan.md) and scenario matrix for current delivery order.

- Latest 20 October: user explicitly requires **all product surfaces Bangla-first**, English secondary; preserve entered names/content. SMTP sender changed to `valtube101@gmail.com` for now. Gmail SMTP saved but actual send fails with confirmed 535 BadCredentials; user is creating a proper App Password privately. Shared app-level SMTP serves all customers; no per-customer sender setup. Named guest sharing remains manual. Media migration now applied in Dawat Staging through Supabase plugin, with normal-role rollback proof. Original photos are decoded only in bounded memory and discarded; only sanitized private WebP derivatives persist. A separate server-only Storage processor credential is required, while ordinary data access retains user-session RLS. Full deployment/retention/recovery qualification remains open.

- 20 October guest delivery: user asked to move online, created free **Dawat Staging** in Mumbai and explicitly approved both prepared migrations. Hosted normal-role rollback proof passed and all 17 public tables have RLS. App configuration now targets this staging database; frontend remains local. No SMTP provider yet, explicitly deferred by user: sign-in stays disabled (`AUTH_EMAIL_ENABLED=false`) until SMTP + code templates + real delivery are qualified. No service-role key, paid upgrade or external mail used. Offline and hosted guest-token encryption keys are separate; maintain both backups. Sessions expire after 12 hours and use per-household cookie paths. Remaining recovery/log/device/operations gates still apply.

- Earlier 20 October foundation: user authorized local setup. Docker/Supabase remain available locally. Seller activates an already verified intended email directly; claims/delivery remain later. Explicit acknowledged save ships before autosave. Synthetic order terms are required input; this does not resolve commercial duration/retention policy. Production media remains unavailable; the later guest delivery checkpoint supersedes the earlier guest-reply limitation.

- Build priority moves from template-only refinement to production delivery around the liked template; remaining template qualification continues as a parallel workstream, not a complete visual restart.
- Old Node/pnpm/Tailwind/next-intl preferences are not compulsory migrations. Preserve working choices unless evidence justifies change.
- Older open/anonymous RSVP proposal is superseded; general invitations are view-only.
- Original root documents archived; current [README](../README.md) points at the authoritative set. Old test counts and blocked-browser notes stay historical evidence.

- 21 October2026: Vercel selected for personal testing preview only on existing Hobby account; no paid upgrade/domain change. User will privately import existing backend keys, preserving AES versions. Large selected photos retain10 MiB input support via bounded browser preparation below3 MiB transport; server processing/private isolation remain authoritative.
