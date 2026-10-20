# Development backlog and release gates

> Historical first-pass backlog. Track current implementation in [task.md](../task.md) using the milestones in [plan.md](../plan.md).

This is an ordered implementation plan, not an estimate that the full business can be completed in a fixed number of days. Dependency order matters more than calendar promises. All items below are proposed work; none are marked as implemented by this research task.

## Stage 0 — product and art foundation

| ID | Deliverable | Acceptance |
|---|---|---|
| F01 | Brand direction and original theme brief | Name/palette/type direction agreed; original asset ownership documented |
| F02 | One invitation schema | Covers two partners/hosts, two locales and several events without theme-specific field hacks |
| F03 | First original theme | Cover, event cards, gallery and RSVP look coherent with long Bangla names |
| F04 | Package/hosting rules | One source for price, limits, term, edit/revision policy and inclusions |

Start with **Jamdani Ivory** or **Royal Nikah** as a proposed first theme. Complete the real flow before multiplying designs.

## Stage 1 — one vertical slice, using local/sample data first

| ID | Deliverable | Acceptance |
|---|---|---|
| V01 | Shared invitation renderer | Same content produces the same guest view in preview and published mode |
| V02 | Guided builder | Couple/hosts, multiple events, venue, locale and wording edit correctly |
| V03 | Opening/music/countdown | Guest can skip opening; music can fail safely; countdown respects timezone |
| V04 | Photos | Add/crop/reorder/remove; no-photo layout is complete |
| V05 | Mobile/desktop preview | Test widths, long content and missing optional blocks |
| V06 | Static invitation fallback | Core details remain readable if nonessential effects fail |

Gate: create a useful invitation through the UI without hand-editing source for each customer. This is a prototype gate, not paid-launch readiness.

## Stage 2 — persistence, identity and public invitation

| ID | Deliverable | Acceptance |
|---|---|---|
| P01 | Owner sign-in and wedding ownership | Account A cannot read/write Account B's draft, media or responses |
| P02 | Draft autosave | Refresh/resume restores content; failures show retry state |
| P03 | Private media pipeline | Originals remain private; only approved derivatives publish |
| P04 | Versioned publishing | Publish validates and switches snapshots atomically; edits stay in draft |
| P05 | Stable guest URL | Reload/share resolves the right published version; slug collisions handled |
| P06 | Unpublish/archive/expiry | Guest sees an intentional state; response records are preserved according to policy |

Gate: two separate owners can create and publish separate invitations without cross-account access.

## Stage 3 — RSVP and customer management

| ID | Deliverable | Acceptance |
|---|---|---|
| R01 | Event-wise RSVP | Accept one event and decline another; totals stay correct |
| R02 | Counts and allowance | Adult/child counts validated; excess/negative/fractional headcount rejected |
| R03 | Duplicate handling | Double submit/retry does not double count; secure edit replaces prior answer |
| R04 | Private note | Plain text, length limit, owner-only visibility |
| R05 | Response dashboard | Search/filter and per-event totals; pending only when a guest list exists |
| R06 | CSV export | Correct fields, owner authorization, escaped CSV and formula-safe cells |
| R07 | Share tools | Copy URL, user-initiated WhatsApp share and scannable QR |

Gate: an invited household can respond on a separate browser/device and its owner sees the result. No unrelated owner or anonymous visitor can read the response list.

## Stage 4 — storefront, checkout and administration

| ID | Deliverable | Acceptance |
|---|---|---|
| C01 | Homepage/gallery/product pages | Every advertised theme has a working demo and accurate supported features |
| C02 | Bangla/English copy | All required UI and validation messages available; locale survives navigation |
| C03 | Server order/price calculation | Client cannot change total, currency or entitlement |
| C04 | Gateway sandbox | Success, failure, cancellation and delayed callback exercised |
| C05 | Verified entitlement | Provider-verified payment unlocks once; replay and mismatched amount rejected |
| C06 | Owner receipts/status | Paid/pending/failed states accurate and recoverable |
| C07 | Admin console | Authorized operator can locate order, inspect failures and handle assistance |
| C08 | Policy/contact pages | Price, hosting term, revision/refund and data promises match implemented behavior |
| C09 | Assisted-request path | Clear request, owner, scope and support method; no fake instant-delivery promise |

Gate: a sandbox buyer completes template → builder → preview → checkout → verified payment → publish → share → guest response → private owner view. A failed-payment buyer cannot bypass publishing limits.

## Stage 5 — public launch preparation

| ID | Deliverable | Acceptance |
|---|---|---|
| L01 | Six original themes | Each runs on the same content model; no duplicate app implementation |
| L02 | Responsive/content QA | 320/360 px, desktop, large text, long Bangla names, mixed scripts and no photos |
| L03 | Device/browser checks | Record which actual devices/in-app browsers were checked and which remain unverified |
| L04 | Performance | Initial payload measured, photos/audio lazy-loaded, slow network remains usable |
| L05 | Accessibility | Keyboard/labels/errors, skip opening, mute and reduced-motion behavior |
| L06 | Operational recovery | Backup/restore, failed publishing, pending payments and support playbook |
| L07 | Merchant production setup | Approved account, correct callback endpoints/secrets and sandbox isolation |
| L08 | Owner data tools | Export, retention/expiry notices and deletion/support process work |

Launch only the features actually completed. Keep unavailable designs/add-ons out of checkout.

## After launch — P2

Add features based on real customer demand and support evidence:

- Save the Date type; matching announcement/full invitation design.
- Secure personalized household links and event-specific access.
- Guest import with duplicate review; family member collaboration.
- Scratch reveal with an accessible alternative.
- Design proof/revision workflow and approvals.
- Print/PNG/PDF output with a dedicated static layout.
- Additional palettes, story timeline, transport/stays, dietary fields and optional gift information.
- Aggregate analytics with clear bot/preview limitations.
- Domain add-on, coupons and version rollback.

## Later, separate business expansion

3D scene studio, birthday/aqiqah/anniversary products, public moderated guestbook, wedding budget/vendor planner, seating automation, AI quote-reading and gift-credit marketplace. These do not block the wedding-card-maker launch.

## Suggested first working demo brief

Create one original Bangla/English invitation for fictional partners with **Holud, Nikah and Reception** on different dates/venues. Include optional parents/hosts, five photos, one licensed or silent soundtrack, a skip-enabled opening, per-event maps/calendar, adult/child RSVP and a private note. Prove persistence, payment verification and owner access before treating it as a complete service.

## Meaningful verification suite

Use automated tests for behavior with real failure consequences: tenant authorization, RSVP counts/idempotency, server pricing, payment verification/replays, stable publishing and draft/published separation. Use visual/manual checks for theme composition, Bangla shaping, imagery and device behavior. Avoid a large set of tests that only restate CSS or static marketing copy.
