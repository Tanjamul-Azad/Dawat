# Product requirements and traceability

> **Client V1 update · 20 October 2026:** use [current plan](../../plan.md), [tasks](../../task.md) and [96 scenarios](../qa/client-v1-corner-cases.md) for next-slice scope/traceability. Earlier growth requirements remain research/backlog; they are not all launch requirements or completed features.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

Version 3 · 19 October 2026 · Commercial product requirements; local implementation is starting, not production certified. Reference observations are in `../01-reference-audit.md` and `../reference-walkthrough.md`. See [production baseline](production-engineering.md) and [design roadmap](../design/design-roadmap.md).

## Roles

| Role | Allowed | Excluded |
|---|---|---|
| Visitor | Browse themes/demos/pricing and start a local draft | Private customer data, admin operations |
| Owner | Manage own wedding, content, orders, guest access and responses | Another owner's wedding |
| Guest, open mode | Read public published content, submit/edit own response via receipt | Guest list or another response |
| Guest, household mode | Read permitted events, respond within household allowance | Restricted events/other households |
| Admin/support | Explicit scoped operational actions with audit | Unrecorded permanent impersonation |
| Designer, Growth | Assigned brief/proof/content scope | Payment secrets or unrelated weddings |
| Collaborator, Growth | Granted wedding role | Owner-only billing/account actions unless granted |

## Launch requirements

| ID | Requirement | Acceptance / owning task group |
|---|---|---|
| R01 | Original catalogue with filters and actual demos | Every purchasable theme has correct tags/capabilities; T070–T072 |
| R02 | **Only** Bangla/English interface and content | `bn`/`en` allowlist, complete UI/errors/a11y labels, reviewed bilingual wording, no input loss on switch; T021/T074 |
| R03 | Guided structured builder | Owner can create content without editing code; T020–T027 |
| R04 | Multiple events | Each event has stable ID, time/timezone/venue and response scope; T022/T052 |
| R05 | Couple/flexible hosts | Optional relations/photos do not break layout; T021/T016 |
| R06 | Shared renderer | Demo/preview/live use same blocks and pinned theme contract; T011/T026/T044 |
| R07 | Safe drafts/resume | Incomplete drafts save; UI distinguishes dirty/saving/saved/conflict; T032/T033 |
| R08 | Owner isolation | Two-account access tests across data/media/export; T030/T031 |
| R09 | Private processed media | Approved derivatives only; five gallery photos initial limit; T034/T035 |
| R10 | Accessible opening/music | Skip, mute, reduced motion and failure fallback; T012/T013 |
| R11 | Useful guest details | Event maps/calendar, readable times and past states; T014/T015 |
| R12 | Verified commerce | Server quote, callback verification, replay-safe entitlement; T060–T065 |
| R13 | Reliable publishing | Snapshot atomicity, stable slug and draft/live separation; T040–T046 |
| R14 | Open RSVP | Server policy/count validation; receipt editing; T052–T054 |
| R15 | Personalized household invitations + RSVP | Named greeting/optional localized message, server-filtered event scope and allowance, scoped preview, random/revocable link and authorized recopy without rotation; T050/T051/T057 |
| R16 | Private client dashboard and response controls | Separate delivered management link, owner verification, accepted/declined/pending and family/adult/child totals, notes, refresh and audited corrections; T055/T056/T058/T059 |
| R17 | Share tools | Link/WhatsApp/QR all resolve to correct published surface; T057 |
| R18 | Assisted request | Scoping/intake/status/support; T067 |
| R19 | Admin operations | Template/order/customer/exception visibility, audited actions; T066 |
| R20 | Lifecycle/support | Unpublish, hosting expiry, retention, recovery and contact; T043/T076/T094–T098 |
| R21 | Six launch themes | All pass the same fixtures; T080–T086 |
| R22 | Public readiness | Functional, visual, privacy, device and operational gates; T090–T099 |
| R23 | Premium original commercial UX | TDY/Dribbble/Pinterest-informed custom art/components/layouts; mobile/desktop, Bangla, no-photo and interaction proof; P01–P06 |
| R24 | Production engineering | Strict modular code, CI, real server authorization/transactions, measured performance/load and database/object/key recovery; T007–T009/T100/T101 |
| R25 | Honest implementation stages | Functional local prototype clearly labelled; demo persistence/auth/payment are never sold as production functionality; T008/T077/T099 |

## Requirement details

### Catalogue and demos

Demo data is fictional, labelled and disconnected from live response submission. Template metadata lists supported blocks, locales, image needs, opening choices and minimum content schema. A disabled template may remain renderable for existing publications but cannot receive new orders. Search/filter is discovery, not an authorization boundary.

### Content and editing

Draft validation is lenient about missing information; publish validation is strict. Theme change preserves content and reports incompatibilities. Locale fallback is explicit: avoid silently publishing half-Bangla/half-English content when the owner selected bilingual output. Names are never machine-translated automatically.

### Guest counting

Counts include the respondent. Accepted attendance needs at least one attendee (adult/child rules per policy); declined attendance has zero counts. Per-event limits are server enforced. A household invited to Holud only cannot submit Nikah attendance by crafting a request. RSVP closure is checked using server time and the policy timezone.

### Response ownership

Open mode gives an opaque receipt for updates; it does not establish a real-world verified identity. Household mode uses the household scope. Do not identify guests uniquely by name or expose an enumerable response lookup. Owners see response lists; other guests do not.

### Personalization and original template production

[Personalization](personalized-invitations.md) overlays a published base with household greeting/message and access scope, rather than duplicating artwork/sites per person. Guest names are shaped text, never baked into images. One current household answer/event and stable identity survive repeat visits/republishing. A forwarded guest link grants that household's bearer access; no identity-verification claim is made.

[Template production](template-production.md) requires original composition, art/code/wording and recorded commercial rights. The first original composition shares semantic widgets and domain logic with future distinct templates; colour changes alone are not separate templates. Competitor/Pinterest/Dribbble references are inspiration, not source files to extract or licence permission. Earlier dashboard SVGs are structural drafts only.

### Editing after publication

Owner edits a draft; publishes a new snapshot intentionally. Existing guest URL remains stable. Changing event times updates event display but preserves responses against stable IDs. Archiving an event with responses excludes it from future requests while retaining historical records. Restriction changes must invalidate or re-evaluate guest payload caches.

### Hosting and commerce

Hosting duration, package price and refund policy are commercial configuration, not hardcoded competitor promises. Receipt records exactly what was purchased. Extending hosting is a new entitlement event. A failed or pending payment cannot publish paid content by manipulating the browser.

## Growth requirements retained from references

| ID | Capability | Dependencies / detailed direction |
|---|---|---|
| G01 | Save the Date | Same content engine, lighter schema; no RSVP by default; clear upgrade/matching design |
| G02 | Design proof/revisions | Brief → proof version → consolidated comments → new proof → approval |
| G03 | Import/collaborators | Duplicate review, scoped roles, allowance preservation and audit |
| G04 | Additional guest content | Story, itinerary, transport/stays, gifts, custom questions/dietary details |
| G05 | Scratch/reveal variants | Same practical information accessible by button/keyboard |
| G06 | Print/export | Dedicated static composition; browser animations are not assumed printable |
| G07 | Domains/discounts/analytics | Verified ownership/renewal, eligibility rules, bot-aware aggregate metrics |
| G08 | Wish media/guestbook | Private by default; public opt-in, moderation and removal |

Planner/3D/other occasions/gift-credit requirements are preserved in the research and operations expansion notes. They require separate release decisions, not forgotten scope.

Requirement IDs in this document and execution task IDs in `task.md` have separate namespaces. In particular, PRD Growth categories G01–G08 are not one-to-one matches for tracker Growth tasks G01–G12; use the named capability and owning specification.

## Success criteria to measure after launch

Track builder completion, preview-to-checkout conversion, verified-payment-to-publication success, RSVP completion, support incidents and median time to first published invitation. Do not invent target conversion percentages before baseline data exists. Product analytics excludes private notes, guest token values and personal dietary data.

## Unresolved launch decisions

Final brand/domain, legal/commercial policy review, actual package prices, approved gateway methods, production providers and asset licences. Record the final decision once in configuration/ADRs; do not use a competitor's current offer as the answer.
