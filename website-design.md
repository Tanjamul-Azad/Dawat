# Product and dashboard design — Client V1

Updated: **20 October 2026**. Full target design contract. A compact subset of entry/overview/editor/review and seller orders/access now has [rendered local evidence](docs/build-evidence/client-foundation.md); the other screens/states below remain proposed. [Plan](plan.md) controls build order; [architecture](architecture.md) controls permissions.

## 1. Direction and references

Latest implemented UI: compact contextual sidebar/mobile tabs, one primary edit action plus direct guest access per wedding, working seller name/email search, BDT price fields, sticky draft status/actions, human-readable conflict review, correction/history dialog, CSV export with retained error state and pause/resume impact confirmation. Loading and retry boundaries are Bengali-first. Existing Jamdani invitation remains intact. These are implemented/component-tested screens; fresh browser/device render qualification is pending because browser control remains disabled. [Workflow evidence](docs/build-evidence/client-dashboard-workflow.md).

The guest invitation remains the hero product: a continuous illustrated, personal digital card. The management experience should feel like a calm Bengali wedding atelier: polished typography, precise spacing, practical forms and clear status, with the warmth of the template but less ornament around data entry.

- **Main creative reference:** [The Digital Yes](https://www.thedigitalyes.com/), preserved in [local walkthrough](docs/reference-walkthrough.md). Borrow quality of reveal, pacing and composition; never copy layouts/art/code wholesale.
- **Local service reference:** [e-Nimontron](https://www.e-nimontron.com/), [client-flow evidence](docs/specs/e-nimontron-client-flow.md), [user-supplied video review](docs/specs/vendor-dashboard-video-review.md). Dashboard mechanism informs workflow; competitor backend/authorization is unknown.
- **Figma:** user-supplied preferred export; [source review](docs/design/figma-source-review.md). Preserve the adopted font roles/organization; fixed demo totals are not production logic.
- **Pinterest/Dribbble:** [inspiration board](docs/design/inspiration-board.md), [gift/reveal study](docs/design/pinterest-gift-reveal-v6.md). Original synthesis of invitation suites, arches, framed photographs, textile borders and restrained color contrast. Some pin pages were blocked; do not claim a fresh full visual audit.

No new competitor browsing is required for this planning pass. Historical evidence is retained, with inspection limits. No invented testimonials, attendance, “popular” badges or unlimited promises.

## 2. Shared visual system

| Role               | Direction                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main paper         | Warm ivory `#F7F2E8`; clean reading surface `#FFFCF6`                                                                                                    |
| Text               | Dark ink `#222B26`; secondary `#566159`; essential small text must pass contrast                                                                         |
| Action             | Wine `#6D2432` for primary commit/publish; forest `#234D3B` for practical workspace accents                                                              |
| Secondary sections | Sage/blush used with dark text; avoid identical cream sections throughout                                                                                |
| Decorative brass   | `#8C6A35` for motif/rule, not small essential labels                                                                                                     |
| Border/error/focus | `#D9D2C5` / `#A12F36` / `#265EAC`; state always has text/icon                                                                                            |
| Type               | Adopted Fraunces display, Instrument Sans UI, Noto Serif Bengali display, Hind Siliguri UI/body                                                          |
| Rhythm             | 4/8/12/16/24/32/48 scale; mobile page gutter 16–20px; primary group gap24px                                                                              |
| Shape              | Different shapes for purpose: arch for invitation photos, woven edge for preview, calm 10–14px form panels; not a rounded-card wrapper around everything |
| Density            | Lists use aligned rows/dividers; only independent actions/metrics get panels                                                                             |

Tokens are a starting specification; test rendered contrast/shaping. Body/input text at least16px on phones; helper text normally14px. Display headings fluid, Bangla with enough line height, no tracking on Bangla letters. Never truncate household identity/essential dates; wrap them. Status/count badges may remain compact beside a wrapping name.

Minimum44px controls/targets with adequate spacing. Non-color error text, visible keyboard focus, actual labels and focus return for dialogs. Text zoom200%, browser zoom and narrow320px layouts are required variants.

## 3. Information architecture

### Couple navigation

Four primary areas: **Overview / Invitation / Guests / Replies**. Wishes are a tab within Replies; sharing lives with Guests and invitation status. Settings, account/order/access and help live in a secondary menu.

Mobile: compact header with wedding title/switcher, language and account; bottom navigation only on management screens. Sticky editor action bar replaces, rather than stacks with, bottom navigation while editing. Desktop: slim side navigation and broad content; editor may split form + preview when each remains usable. Different weddings must show distinct names and state throughout; switcher never silently changes during an edit.

### Seller navigation

Orders → order detail → activation/access. Weddings → support/detail. Operational issues queue. No large analytics dashboard before useful order controls exist. Show customer, order ID, payment, access and guest publication as independent columns/statuses.

## 4. Couple screens

### C01 — entry / claim / locked workspace

Show the intended wedding/order summary only after authorized resolution. Verified account mismatch: explain that this account lacks access, offer switch account/support without leaking the other customer's email. Expired/used claim: reissue/support action; refreshing never creates another wedding.

Pending confirmation, not activated, revoked and expired session have different helpful copy. No edit/publish/guest controls in a locked workspace, including API access. After login return only to an allowlisted in-app destination; preserve a safe pending task, not a raw token URL in analytics.

### C02 — overview

```text
Wedding name                         বাংলা/EN  Account
Live / Draft changes                 Open guest preview
Next action: Finish venue → Review and publish

[Selected event: Reception                  v]
Invited households | Accepted | Declined | Pending
Confirmed people: Adults 42 + Children 8 = 50
Updated 12:34                         Refresh

Recent replies (3–5 rows)             View all
Invitation status / next date
[Edit invitation]                     [Add guest]
```

Before publication, show a short checklist instead of zero-data analytics. After publication, the next action is named invitations/replies. Counts always name their event and unit. Allowance is capacity, not attendance. Empty responses say no replies yet; loading does not show fake zeros. Date/time/last refreshed explain staleness. Confirmed people are visually stronger than decorative metrics.

### C03 — guided invitation editor

Sections: Couple & families → Wording/languages → Events → Photos/music → Reply settings → Review. Use clear section summaries, not a long undifferentiated form.

- Mobile fields take the screen; Preview opens a full-height sheet with visible close/back. Editing state survives preview/language navigation.
- Desktop form width roughly 480–640px, live preview around 360px; collapse preview before either becomes squeezed.
- Top status: Unsaved / Saving / Saved at… / Save failed / Conflict. “Saved” means server acknowledgment of the latest edit.
- Sticky bottom: Save/Retry plus Preview/Review as appropriate; must clear keyboard and safe-area inset, and never cover errors or final fields.
- Label which language is being authored, separately from UI language. Default-language required fields must be complete to publish. Optional translation falls back to authored default text; never auto-translate proper names. Missing translation has an editor marker, not a broken guest layout.
- Long names wrap in preview; do not shrink all typography to fit unusually long content.

**Events:** rows/cards show name/date/venue and stable identity. Add/Edit/Archive; reorder changes presentation only. Saving a draft event must not invite anyone until published. Removing a live event with responses opens an impact review; no silent destructive delete. Venue/map fields show address + map preview/link fallback; no embed API key requirement for essential directions.

**Photos:** ordered thumbnail strip1–5, Add, Remove, accessible Move left/right and focal position. Show upload/processing/ready/error individually. Failed selection remains recoverable. Exceeding five explains the limit; no hidden replacement. Photos optional; a botanical no-photo layout is first-class. Mobile HEIC rejection/conversion wording must be explicit until support is qualified.

**Reply settings:** per-event deadline, open/closed and count meaning. Guest name is not an editable field for the guest. Explain that these are operational changes where applicable; any live impact requires review. No Maybe toggle in V1.

### C04 — review / publication

Show missing required fields as links to the correct editor section, processing photos, current template/version, default language and guest-visible event summary. Distinguish draft preview from currently published invitation. Clear copy: “Guests will see these changes after Publish.”

First publish explains actual hosting term/expiry once policy is chosen. Republish shows changed base facts and effect on current event scopes. One primary Publish/Update action, disabled with reason during invalid/processing state. After server success show the real stable guest URL; failed publication retains old live link and dirty draft.

### C05 — guests / add household

Mobile: search/filter then readable list rows. Desktop: bounded table. Row shows full guest/family name, event scope, allowed people, reply summary and overflow actions. Never expose raw credentials in a giant table.

Household form fields:

1. Required host-entered display name in at least the default language; optional other-language name.
2. Greeting and short message, clearly “shown to this household”.
3. Checkboxes for published events plus total-person allowance per selected event.
4. Optional private host note/contact, clearly never visible to guests.
5. Scoped preview → Save household → Create/copy personal link.

Use a friendly greeting preview: “প্রিয় রহমান পরিবার, আমাদের আনন্দের দিনে আপনাদের সাদর আমন্ত্রণ।” Guest never writes their own name. Duplicate display names trigger a review hint, not automatic merge; households are keyed by ID.

Do not silently create links for unchecked/unpublished events. Before publication, guests may be prepared as drafts but share actions remain disabled with explanation. Operational name/scope edits say they update the personal invitation immediately. Lowering allowance below a confirmed party or removing a responded event requires reconciliation.

### C06 — personal preview / sharing

Three distinct labels: **General invitation (view-only)**, **Personal invitation for {household}**, **Private dashboard (management)**. Only management surfaces can access the last category. Guest pages contain no shortcut to it.

Show exact recipient, allowed events and allowance above owner-only preview. Preview cannot submit real RSVP. Copy reports actual clipboard success; fallback is a selectable URL, not a false success toast. WhatsApp uses a user-triggered share intent; native share cancellation is neutral. App cannot prove message delivery, so “Copied/shared” is not “Delivered/Opened”.

Recopy preserves URL. Rotate and Revoke are separate destructive menu actions explaining affected household/sessions and preserved responses. Generic social preview contains no personal name or restricted venue. QR/export is later unless explicitly implemented and qualified; no decorative working-looking QR control.

### C07 — replies / wishes

Event selector → Accepted / Declined / Pending filters → count totals → list. Keep search/filter/sort on back navigation; reset cursor when query changes. Mobile row expands into detail, desktop detail panel; status accompanied by words.

Reply detail: host-supplied name, event, status, adults/children, note, revision, updated time and source Guest/Host. Manual correction asks for reason; no silent overwrite of a concurrently updated guest reply. Deadline override is a separate clearly privileged action. Wishes are addressed to the couple's names and grouped separately; a wish never counts as attendance.

CSV Export explains current event/filter scope, uses server-authorized complete results and protects spreadsheet formulas. Screen-reader live region announces confirmed save/refresh succinctly; no repeated full list narration. Error keeps last successful results with stale label, never fake zeros.

### C08 — settings / lifecycle

Show order/package term, access status, publication status, help, language, account and explicit pause/unpublish where allowed. Pausing guests states who loses access and what records remain. Wedding cancellation/expiry has humane copy and support contact; not an accidental blank card. Account changes/reassignment require re-verification/audit, not editing a name field.

## 5. Seller screens

| Screen           | Content and primary action                                                | Critical states                                                                        |
| ---------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| S01 Orders       | Search/status filters, order/customer/date, payment, confirmation, access | Empty vs failed/stale; cursor pagination; no cross-order action confusion              |
| S02 Order detail | Immutable purchased scope, payment evidence, intended owner, timeline     | Confirm distinct from Activate; insufficient verification; duplicate reference warning |
| S03 Activation   | Wedding title, intended verified recipient, entitlement, impact summary   | Inactive, active, suspended, revoked, wrong account, delivery failed/retry             |
| S04 Support      | Scoped wedding summary, safe read/support preview, explicit actions       | Audited actor/reason; no invisible impersonation; personal token never in logs         |
| S05 Issues       | Failed jobs, reconciliation, failed delivery, expiry exceptions           | Retry once safely, last attempt/reason, resolved/dead-letter visibility                |

Show a plain confirmation for revoke/refund/reassign/guest pause with exact customer/wedding and consequences. Do not use a generic “Complete” button to mean payment + confirmation + access + publication.

## 6. Guest template contract to preserve

- Closed state shows only sealed cover, intended household, couple context, language and optional controls. Inner sections/forms/nav are not mounted. Hash/scroll/refresh/reduced-motion cannot reveal them automatically.
- On deliberate open, mount content and allow scrolling **immediately** while decorative doors finish in about 800ms. No animation-completion scroll lock or second focus jump.
- Preserve cover height through transition. Reduced motion still requires deliberate open and uses immediate quiet reveal.
- Opening → personal welcome → primary date/countdown → allowed events/directions/calendar → photo reel → RSVP → private couple-addressed wish/closing. Skip optional chapters without awkward holes.
- Max five photos, main arch frame + thumbnails + side arrows/swipe; slideshow only while visible/foreground/motion-enabled and not engaged. Manual navigation pauses until explicit resume.
- Countdown stops at event time and switches to appropriate today/past copy. Missing/cancelled event never invents a timer.
- RSVP repeats invited identity; no name form. Distinct event groups, plain count meaning, decline=0, confirmed server receipt/edit action. Closed deadline offers directions and helpful reply-unavailable wording.
- Music starts only from deliberate gesture, optional low-volume classical track, actual playing/paused/error state, visible pause even when scrolled, background pause, licensed credit. Content works without sound.
- Closing signed by couple/families; no “Invitation by Dawat”. Host-to-guest greeting, private host note, guest logistics note and wish to couple have different labels.
- Invalid/revoked link shows neutral safe recovery/support; no leaked private details or automatic broader invitation fallback.

## 7. Motion and responsive rules

Workspace transitions generally160–220ms opacity/small translation; no continuous ornamental motion behind forms. Dialogs/focus/state work with zero animation. Do not animate row order while a guest is selecting a response. Save confirmation is calm inline feedback, not confetti.

Test320/360/390/430px, tablet768 and desktop1024/1440; portrait/landscape, safe areas, browser toolbar collapse and keyboard. Avoid fixed100vh assumptions; use dynamic viewport/safe-area patterns with natural scrolling. Exactly one meaningful primary action per editing state. Sticky regions reserve space and never cover response buttons.

Missing art, font delay, no IntersectionObserver, blocked autoplay, reduced motion/data, clipboard/share refusal, offline, slow response and text zoom must degrade to useful controls. Layout must remain compact without clipping important names/addresses or flattening every section into the same color.

## 8. Required design handoff

For each C/S screen: realistic BN/EN sample, narrow/desktop frames, empty/loading/error/success/conflict/denied state, field errors, keyboard behavior and primary action outcome. Inspectable high-fidelity work is still to do; this document is the specification, not a Figma deliverable.

Review against [corner-case matrix](docs/qa/client-v1-corner-cases.md); attach screenshots/device evidence before design sign-off. Older [structural dashboard wireframes](docs/specs/e-nimontron-client-flow.md) are context, not the final quality target. Public marketing detail is retained in the [archived design](docs/archive/planning-before-client-v1-2026-10-20/website-design.md) and revisited in Phase6.
