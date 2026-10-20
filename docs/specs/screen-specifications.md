# Screens, routes and interaction contracts

> **Client V1 update · 20 October 2026:** [current mobile-first design](../../website-design.md) and [current route/API contract](client-v1-data-api.md) override older screen scope here. Couple/seller production delivery comes before full public redesign. Current screen specification is a plan, not rendered high-fidelity work.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

Proposed screens for the new product. Detailed visual rules: `../../website-design.md`. Data/API rules take precedence over a visual control when security or integrity is involved.

**Current visual/build direction:** commercial premium Bengali atelier, informed by TDY plus curated Dribbble/Pinterest references. Original expressive card artwork and custom editorial components/layouts are required; a sparse dashboard or stock AI bento hero is not the design target. [P01–P06 design gates](../design/design-roadmap.md) guide a functional local prototype and the first production slice. Earlier SVGs remain structural context only. Prototype screens explicitly disclose device-local fictional state and unavailable external services; no fake customer statistics, successful payment/auth or silent no-op controls.

## Route register

| Route | Access | Purpose / primary action |
|---|---|---|
| `/` | Public | Explain and browse themes |
| `/templates` | Public | Filter/search and select demo |
| `/templates/{templateSlug}` | Public | Play demo and start draft |
| `/pricing` | Public | Inclusions, term and actual price |
| `/how-it-works` | Public | Creation/share/guest workflow |
| `/custom-design` | Public | Request scoped assistance |
| `/contact` | Public | Support routes and genuine response expectations |
| `/terms`, `/privacy`, `/refunds` | Public | Policies matching implemented behavior |
| `/login` | Public | Owner email OTP sign-in |
| `/order/{id}` | Verified order scope | Bounded order status; confirmation/activation progress; no guest records |
| `/dashboard` | Confirmed + activated + verified client | Weddings and next actions; otherwise bounded order-status entry |
| `/account` | Owner | Profile, locale, account/data controls |
| `/weddings/{id}/edit` | Owner | Guided editor |
| `/weddings/{id}/review` | Owner | Publish checklist/price/term |
| `/weddings/{id}/guests` | Owner | Basic manual households and allowances |
| `/weddings/{id}/responses` | Owner | Per-event response management/export |
| `/weddings/{id}/share` | Owner | Link/QR/share message |
| `/weddings/{id}/orders` | Owner | Purchase/receipt status |
| `/weddings/{id}/settings` | Owner | Privacy/lifecycle/slug/data controls |
| `/checkout/{orderId}` | Owner | Provider transition and pending status |
| `/checkout/{orderId}/return` | Owner | Read actual server payment state |
| `/preview/{token}` | Scoped token | Expiring read-only proof |
| `/i/{slug}` | Public or access-controlled | Published guest page |
| `/i/{slug}/g/{token}` | Household token | Exchange scope; render permitted guest content |
| `/r/{receiptToken}` | Receipt token | Edit that response only |
| `/admin/templates` | Admin | Versions, capabilities and availability |
| `/admin/orders` | Admin | Payment/fulfilment/exceptions |
| `/admin/weddings/{id}` | Scoped admin | Support inspection/actions |
| `/admin/requests` | Admin/designer scope | Assisted work |

Return-to URLs are restricted to safe same-origin application routes. An invalid ID/token never reveals another tenant's object or explains whether a private household exists.

## S01 — home

Content: hero, own invitation preview, occasion navigation, featured themes, process, guest features, local benefits, package/custom assistance, FAQ and policies/contact. Primary CTA opens catalogue or selected theme. Language switches product copy without losing safe discovery state. Hero video has a poster and clear pause if it plays.

States: media loading/failure uses poster; unavailable catalogue shows retry/help rather than false social proof. Do not show fake reviews at launch.

## S02 — catalogue

Fields: search text, occasion, style and palette; clear each/all. Results list count and active filters. Selecting card opens product. Back returns to filters/scroll where practical. No results offers reset. Loading cards preserve geometry to reduce layout shift. Disabled themes are not purchasable.

## S03 — product/demo

Show art, theme name, actual package scope/term, supported sections and demo. Actions: Open demo, Restart, Full view, Use this theme, Get assistance. Start creates a local draft or routes through sign-in while preserving selected template. A demo never writes to production RSVP/wishes endpoints.

## S04 — login

Email → request code → enter code → verified session → safe return. States: request in progress, code sent, invalid/expired code, throttled resend and connection failure. Do not expose whether another email already owns an order. OTP code belongs in secure auth flow and must not enter analytics/logs.

## S05 — owner dashboard

Cards show wedding title/date/theme, draft/live/expired state, publication status and next action. Empty: Create invitation. Pending payment: View order, not “Publish now.” Live: edit, share and responses. Archived: inspect/export or restore according to term. Multiple weddings remain clearly distinct.

## S06 — builder

| Section | Fields / controls | Required behavior |
|---|---|---|
| Theme | Theme, palette, opening, photo mode | Preserve content; explain unsupported blocks |
| People | Display/full/nickname per partner; display order | Localized strings; do not auto-truncate |
| Hosts | Repeating name/relation or wording | Optional; flexible family structure |
| Message | Invitation text, optional blessing | Length limits; shaped Bangla; escaped plain text |
| Events | Add/edit/reorder; title/type/start/end/timezone/venue/address/landmark/map | Stable IDs; validate dates and URLs |
| Media | Add/crop/reorder/remove, alt text; track/no music | Five gallery photos; processing/rejected feedback |
| Sections | Enable/reorder | Allowed block registry; accessible Move controls |
| RSVP | Mode, event availability, deadline, counts/private note | Clear adult/child semantics; server enforcement |
| Preview | Mobile/desktop/full view/restart | Same renderer; draft badge; preserve editing state |

Save-state machine: clean → dirty → saving → saved; failed → retry; stale revision → conflict recovery. Field edits do not trigger a full opening animation. A navigation-away warning applies only to genuinely unsaved changes. Browser-local draft claims use “Saved on this device,” never “Saved to account.”

## S07 — review/publish

Checklist links to missing names, translations, event time/venue, unresolved media or unsupported theme blocks. Show slug availability, privacy/RSVP policy, package scope, actual total and hosting term. Actions depend on state: Save draft, Continue to checkout, Publish, Republish.

Publish confirmation specifies the version becoming live. Successful publication returns stable URL and Share action. Failure retains the previous publication. Repeated publish submission must not create conflicting active versions.

## S08 — checkout/order return

Order summary: package, add-ons if released, amount/currency, term, customer receipt email and policy acknowledgement. The provider handles payment details. Returning shows Pending/Verified paid/Failed/Cancelled from the server. Pending uses bounded status polling and support/reference information; closing the browser does not lose a later valid payment.

No success animation should unlock publishing locally. Duplicate callback, wrong amount and delayed verification are visible operational states, not generic “something happened.”

## S09 — share

Show only the live guest URL; draft offers Preview instead. Copy-link toast confirms clipboard success or shows manual selection fallback. WhatsApp share opens a composed user-reviewed message. QR encodes the intended public or household link. A household QR is private access material and labelled accordingly. No bulk sending in launch.

Use three clear destinations: **General invitation**, **Personalized guest invitations**, **Private client dashboard**. General sharing is a single public-safe link. Personalized opens guest/family selection, scoped preview, copy/share and event/allowance summary. Private management explains sign-in and is never inserted into the guest share message. Copying a household URL reuses the existing credential through owner-authorized recovery; rotation has a separate warning/action and never occurs from Copy. Show clipboard errors truthfully. In local prototype, all links/data are marked demo and cannot masquerade as production secure guest links.

## S10 — guest invitation

Resolve state before revealing content. Live permitted page offers language and opening/skip; practical event cards remain reachable. The household greeting uses configured name, not the token. Public page never lists private guest responses.

Named welcome and optional personal message appear as live HTML text in opening/header, with long Bangla wrapping and no-name fallback. Authorized household view contains only permitted events and its allowance. Avoid guest names/restricted venues in social metadata. Forwarded household link retains household scope; display the intended recipient without claiming verified human identity.

Invalid/revoked link: generic explanation and host contact only if safely configured. Unpublished: unavailable. Expired: archive/thank-you state according to policy. Optional public metadata must not expose restricted dates/venues through social previews.

## S11 — RSVP and response editing

Each permitted event: attendance, adults including respondent, children and optional private note. Open mode asks display name. Household mode shows household/allowance and permits only configured events. Display closure deadline clearly.

Submit: validate → retain form while sending → server confirmation → per-event summary and secure edit receipt. Retry reuses idempotency key. Edit receipt only reads/changes its own response. Deadline/revocation is rechecked on edits. If policy changed, explain the change and preserve safe form values for review.

## S12 — household management

Manual name, optional private contact, localized greeting (fallback “Dear {name}”), optional short message per locale, permitted events and per-event allowances. Label host message “Shown on this invitation,” distinct from private guest notes. Show event/allowance summary and **Preview this guest's invitation** before Create/copy link. Save uses expected revision with saving/retry/conflict states. Base event facts link back to draft/republish rather than editing a second copy here.

No bulk messages. Revoking a token ends future access but does not erase attendance history. Rotate explicitly generates a new token and invalidates the old one. Copy reuses the original through authorized encrypted recovery (ADR A15). Explain forwarded links grant household access. Missing key/recovery failure offers safe retry/support or explicit rotation, never silent link replacement. Filter lists have bounded pagination; opening/copying never changes attendance.

## S13 — responses

This is the user-confirmed **client dashboard** reached from a private management link. It is separate from the guest invitation link and available to DIY and assisted clients only after staff order confirmation, separate dashboard activation and owner verification. Use [the complete client-dashboard specification](client-dashboard.md) for layout, delivery, counting and controls.

Per-event accepted/declined/pending, adults/children, last update and private notes. Pending exists only against invited households/events. Open-mode entries are “received responses,” not confirmed unique people. Filters/search/export operate only on owner scope. Owner corrections should be audited and distinguishable from guest submissions.

## S14 — settings/data

Locale/default timezone, selected public contacts, slug/change policy, RSVP closure, unpublish/archive and data export/delete request. Explain effects before destructive actions. Deleting account/content is distinct from closing RSVP or hiding the card. Existing financial records may follow retention rules while invitation personal data is removed.

## S15 — assistance and admin

Assisted request fields: theme/occasion, requested scope, target date, contact channel and short brief. Avoid requiring photos until an authorized upload flow exists. Admin tracks awaiting materials, designing, proof, revisions, approved and published separately from payment.

Template admin tracks draft/active/retired and version compatibility. Order admin shows verified provider reference, expected/received amount and safe failure category. Support actions need reason and audit. A proof viewer uses a scoped expiring token, not the owner's login session.

## Accessibility and feedback shared across screens

Dialogs trap focus and restore it on close; errors associate with fields; submitting controls prevent duplicates but allow recovery; labels persist above inputs; status text is announced appropriately. Never communicate error/payment/attendance status using color alone. Avoid horizontal tables on phones where stacked rows are clearer.

## Growth screens

Save the Date uses a reduced content schema and explicit no-RSVP package; proof/revision screens group comments into rounds; import previews duplicates before write; collaborators have invitation/role controls; domains show ownership/verification/expiry states; static export shows processing/ready/failure and uses its own layout.
