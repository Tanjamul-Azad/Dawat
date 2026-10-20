# Product delivery plan — Client V1

Updated: **20 October 2026 · Asia/Dhaka**. This is the current scope and build order; it supersedes archived phase lists. Planned production capabilities below are not claims of completed implementation.

Implementation checkpoint: backend/auth/MFA, RLS, seller confirmation/activation/search, acknowledged autosave, publication pause/resume and [named guest links/RSVP/wishes/reports](docs/build-evidence/named-guest-delivery.md) are implemented. [Audited host corrections, private CSV and compact contextual dashboard](docs/build-evidence/client-dashboard-workflow.md) complete the latest workflow slice. Five migrations and normal-role proofs passed on hosted Dawat Staging; Gmail OTP receipt is confirmed. First hosted verified operator login, media secret, browser/device qualification and public website hosting remain. The phase descriptions remain the full target; incomplete release gates remain open in [task.md](task.md).

Media checkpoint: [private media + Bangla-first product](docs/build-evidence/media-bangla-first.md) records actual local max-five processing/Storage and hosted normal-role media proof. Bangla is the product default, English secondary. Hosted processor credentials remain pending; neither public launch nor full device/operations qualification is claimed.

## 1. Outcome and next focus

The invitation template is our product. Next build **the couple dashboard, a thin seller activation panel and their real backend together**. Finish the public sales website after this works end to end. Preserve the liked Jamdani direction; do not restart the template.

First meaningful demonstration, using two isolated fictional weddings:

> Seller confirms Order X → activates X's workspace → verified customer X edits and publishes → creates “রহমান পরিবার” with reception-only access and an allowance → copies their personal link → guest opens on another phone and replies → X sees the response. Customer Y cannot read or change X's records, even by changing IDs in requests.

A dashboard that still saves only in the same browser does not meet this milestone.

## 2. Current baseline

| Area                         | Current evidence                                                                                                             | Next work                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Jamdani template             | Local bilingual sealed digital card, events/countdown/maps/calendar, max-five-photo reel, music, named guest and response UI | Preserve and connect to authoritative published data; finish device/performance gates                |
| Public/seller/couple screens | Browser-local prototypes                                                                                                     | Verified identity, persistent multi-wedding records, real authorization and honest save/error states |
| Data                         | `useWorkspace` / localStorage fixtures                                                                                       | PostgreSQL, migrations, RLS, Storage and server services                                             |
| Sharing/RSVP                 | Local flow demonstration                                                                                                     | Server-filtered guest payload, recoverable scoped credentials, transactional replies across devices  |
| Commercial operation         | Research and requirements                                                                                                    | Real activation/support flow, staging, recovery and eventual payment integration                     |

Latest historical implementation evidence: [v6.4](docs/build-evidence/compact-music-v6-4.md), with 82 passing tests at that checkpoint. This documentation update does not rerun those tests. Both physical phones reached the LAN page; full-flow/listening qualification is pending. Older LCP 3.46s misses the 2.5s target and is not a v6.4 measurement.

## 3. Launch scope

### Included in Client V1

- One original template; existing supported content/palette controls; UI languages only `bn` and `en`.
- One order provisions one wedding. One verified primary owner per wedding initially. One account may own several separately scoped orders/workspaces.
- Seller records orders, verifies payment or an explicit approved exception, confirms, assigns the intended customer, separately activates/revokes management and performs audited support actions.
- Couple edits names/hosts/wording, events, maximum five photos, music/section options; saves incomplete drafts, previews, reviews and publishes valid content.
- Couple creates named households with per-event scope, total-person allowance and optional greeting/message; previews, recopies, shares, rotates or revokes existing links.
- Guest sees the host-supplied name, deliberately opens the card, views only permitted published information, submits/edits attendance and sends private wishes for the couple.
- Couple sees event-wise accepted/declined/pending records, adults/children totals, details, wishes, safe CSV export, refresh state and attributed manual corrections.
- Minimum operations: jobs, audit, alerts, backups and demonstrated restore, release qualification and cost visibility.

### Deferred

Full marketing redesign, extra templates, bulk import, family collaborators, auto WhatsApp sending, per-guest artwork/PDF generation, photo wishes, memory books, seating/planning, custom domains, AI generation, reliable open tracking, Maybe RSVP and elaborate analytics. Retain research; these do not block the first slice.

A basic public demo/order-contact entry may exist during a pilot. It cannot unlock management. General invitation links are **view-only**; no guest name form or anonymous RSVP in V1.

## 4. Delivery sequence

### Phase 0 — contract and UX

Deliver this plan, [architecture](architecture.md), [design](website-design.md), [data/API](docs/specs/client-v1-data-api.md), [corner cases](docs/qa/client-v1-corner-cases.md) and inspectable mobile dashboard flows.

Design first: Overview → edit section → save/draft preview → review/publish → add household → scoped preview/copy → response detail. Include seller activation, wrong-account, locked access, saving/offline/conflict and empty states. Build the functional skeleton alongside those flows; do not finish every marketing page first.

**Exit:** roles, route actions, draft/live boundaries, metrics and access states agree. Unknown business policy has an owner and blocking point in [decisions](docs/decisions.md).

### Phase 1 — real foundation and isolation

1. Preserve sample mode behind an explicit development adapter; never fall through to sample data in production.
2. Enable a server-capable Next deployment; current `output: 'export'` cannot implement request-dependent auth and writes.
3. Set up isolated environments, migrations, generated types, server-only clients and sanitized configuration examples.
4. Add verified email login, safe return paths, wedding memberships and active dashboard grants. Signing in grants no automatic management rights.
5. Create order/wedding/grant records and row/storage policies before most dashboard UI.
6. Test two-account isolation, inactive grant denial, direct-ID manipulation, preview/export/object access and staff role escalation.

**Exit:** correct scoped shell persists across refresh/another browser. No production browser-only security switches. No secrets in client bundles.

### Phase 2 — thin seller workflow

Deliver manual pilot order intake, list/detail, payment status, confirmation, customer assignment and separate activation. Provision/activate/retry must be transactional or replay-safe. Record actor, time, reason and business evidence.

An expiring one-time claim requires the intended verified account; a dashboard URL is not login. GET must not consume the claim. Delivery failure can retry without a second workspace or changing links. Seller can copy a scoped entry through UI; no automatic external messages.

Manual verification records method/reference/amount and authorized evidence review. Uploaded proof alone cannot mark paid. Complimentary/test activation is an audited exception, not fabricated payment. Live gateway work is needed before automated checkout, not before a controlled manual pilot.

**Exit:** pending, wrong-account, revoked and duplicate activation cases pass. Client profile edits cannot grant staff privileges. Suspending management does not implicitly pause guest publication.

### Phase 3 — couple editor and publishing

Deliver localized guided editor/shared preview, acknowledged autosave, conflict recovery, photo processing, publish checklist and immutable publication.

- Incomplete drafts save; invalid drafts cannot publish.
- Base content edits remain private until Publish. Guest name/scope/allowance saves affect the live overlay and have explicit impact copy.
- Event IDs remain stable. Do not duplicate editable event facts in both content JSON and relational tables.
- Failed upload/publish keeps the previous live card.
- Draft/household previews are read-only and cannot submit real responses.
- First publish sets the purchased term once; retries/republish/unpublish cannot restart it. Duration/retention must be decided before selling.

**Exit:** BN/EN, long names, no photos/five photos, interrupted upload/save, two editing tabs, stale publish and refresh persistence pass.

### Phase 4 — named links and real guest replies

Deliver household form, identity/greeting, event allowances, server credentials, authenticated preview/recopy, explicit revoke/rotate, server-filtered guest resolution, responses and wishes.

- Copy never creates a second household or rotates a shared link.
- Link crawlers, preview and GET requests never count as attendance or consume claims.
- Unauthorized events are absent from HTML/JSON/metadata/calendar, not merely hidden by CSS.
- One current response per household/event; retries idempotent, edits revision-checked.
- Decline means zero people. Acceptance uses integer non-negative counts, at least one person, within current total allowance. Pending means no current response.
- Server rechecks deadline, scope, revocation and allowance at commit.
- General URL remains view-only. Browser storage restrictions must not erase server-confirmed replies.

**Exit:** a second-device reply appears for the correct couple. Concurrent submits, revoke after session exchange and event/policy changes pass; forwarded-link limitations are honest.

### Phase 5 — operations and qualified pilot

Deliver paginated/searchable households, per-event summaries, response/wish detail, audited manual corrections, safe CSV and reliable refresh.

Metrics/list/export share definitions and a consistent server snapshot. Never sum ceremony and reception attendees as “unique guests”. Per-event replies remain separate; combined rows may say Mixed, never incorrectly Declined.

Run [release gates](docs/qa/client-v1-release.md), physical-device/template checks, load/cost review and a restore drill. Start with a bounded pilot and observe support burden. Do not promise unlimited capacity, lifetime hosting or uptime without verified policy and operating capacity.

**Exit:** end-to-end slice demonstrated, P0/P1 blockers closed, term/retention/account ownership resolved and concrete beta evidence reviewed. This plan does not itself approve public launch.

### Phase 6 — public sales and automated commerce

Finalize public home, one-template product/demo, bounded customized preview, package inclusions, order/status, support and policies. Add gateway only after sandbox replay/mismatch/late settlement/refund/reconciliation cases pass.

Public buyers browse, preview and order. Management still requires seller confirmation + separate activation + verified identity. Payment success cannot bypass activation. Existing guest/customer links must survive public launch.

## 5. Working method and acceptance

- Ship vertical slices containing UI states, permission checks, persistence, domain validation and relevant evidence. UI completion alone is insufficient.
- Preserve working CSS modules/renderer; no unnecessary framework, package manager or global state migration.
- Thin handlers, focused services, explicit transaction boundaries; no generic factories, duplicated per-template business rules or artificial line limits.
- Keep last-known-good published content during recoverable draft/media/delivery failures.
- Update [tasks](task.md), [memory](memory.md) and decisions when behavior changes. Estimates follow the foundation spike, not speculative dates.

Reading order: [memory](memory.md) → this plan → [architecture](architecture.md) → [design](website-design.md) → [data/API](docs/specs/client-v1-data-api.md) → [corner cases](docs/qa/client-v1-corner-cases.md) / [release](docs/qa/client-v1-release.md) / [tasks](task.md).

Historical notes remain supporting material. Client V1 overrides conflicting old scope; original root files are in [archive](docs/archive/planning-before-client-v1-2026-10-20/INDEX.md).
