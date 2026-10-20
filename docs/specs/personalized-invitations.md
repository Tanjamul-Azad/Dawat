# Personalized guest invitations

> **Client V1 update · 20 October 2026:** [current architecture](../../architecture.md) and [data/API](client-v1-data-api.md) own the production implementation. Preserve named households and recopy-without-rotation; general links are view-only. Inner content mounts immediately after deliberate open while decoration finishes, not after an animation timer.

**Latest explicit decision — v6:** the host supplies every guest/household name and generates their personal link. The guest sees that name on the sealed cover and reply leaf and is never asked to enter their own identity. General share links are view-only; a personal link is required to reply. The local sample follows the same named-guest model. This overrides earlier general/open-response options below. Opening is deliberate before inner content is rendered; see [v6 evidence](../build-evidence/personal-opening-v6.md).

19 October 2026 · User accepted this product direction. **Core paid-launch scope**, extending the existing household token model. Bulk import and distinct per-guest artwork remain later capabilities.

## What the customer receives

One wedding, one selected theme and one published base invitation. Each guest/household can receive a unique link that displays a named greeting, an optional short host message, permitted events and party allowance. This is not a newly built website or a separately paid card for every recipient.

Example with fictional data:

> প্রিয় রহমান পরিবার,
> আমাদের আনন্দের দিনে আপনাদের সাদর আমন্ত্রণ।
> রিসেপশনে আপনাদের জন্য আমন্ত্রিত সদস্য: সর্বোচ্চ ৪ জন।

The client can also share a view-only general invitation URL. Named links resolve to a host-created household record and support pending/accepted/declined tracking without self-entered guest names.

## Client flow

Guests → Add guest/family → display name → greeting/message (optional) → permitted events and per-event allowance → Preview this invitation → Create link → copy or user-initiated WhatsApp share.

The guest preview uses owner-authorized household context without exposing the raw guest credential to analytics. It is visibly a preview and cannot submit production RSVP. The client can correct personalization and rotate/revoke a link without duplicating the wedding or losing response history.

## Overlay fields and sources

| Field | Source | Rule |
|---|---|---|
| Wedding/theme/events/venue | Published immutable base | Existing draft/live separation applies |
| Display name | Household record | Required; plain text; never identity key |
| Greeting by locale | Optional household override | Fallback to localized “Dear {name}”; do not translate names |
| Short message by locale | Optional household override | Plain text, max 500 Unicode characters per locale as proposed default |
| Permitted event IDs | Household-event access | Server-filtered; hidden events absent from payload/metadata |
| Maximum people | Household-event allowance | Server enforced; separate for each event |
| Attendance/actual people | Current response records | Not inferred from opening the link or allowance |

Add `greeting_by_locale`, `message_by_locale`, `personalization_revision` to `households`. No arbitrary HTML, CSS, theme asset URL, custom script or price override in this overlay. Existing manual household fields remain valid with empty overrides.

Household personalization is operational data, evaluated at authorized read time; it is not copied into every base publication. An explicit owner save updates it with expected revision and audit. Published event facts still change only through draft/republish. This boundary must be explained in the editor.

## Link resolution and access

Reuse `/i/{slug}/g/{token}` and the existing high-entropy token/hash/scoped-session approach. Each household has distinct scope; each click does not create a new household or RSVP. Resolve invitation → validate token/session → load permitted overlay → filter published events → render shared theme with safe guest context.

The guest DTO contains only that household's safe greeting/message/allowance and permitted published details, never private contact, other households, token hashes or owner credentials. Use private/no-store responses for personalized HTML/data; shared decorative assets can be cached by version. Keep public social metadata generic and free of guest names/restricted venues. Private guest pages are noindex and token-bearing URLs are excluded from logs/analytics/referrers.

**Forwarding:** the link grants household bearer access; a person receiving a forwarded link can respond as that household. A unique URL is not proof of real-world identity. Guest OTP verification could be a later feature; do not pretend it exists now. One current household response per event, with receipt editing and revision checks, prevents extra responses being counted on every repeated visit.

Revocation checks apply after session exchange too. Rotation must preserve the household and its responses, while invalidating old credential scope. Clients need to recopy an existing invitation without breaking earlier shares. Store the token hash for verification and authenticated-encrypted token ciphertext solely for authorized recopy, never plaintext. Use a dedicated versioned application key in managed secret storage, separate from database dumps and auth secrets; bind ciphertext to token/wedding identity. Owner-only copy decrypts on the server, returns no-store data and records an audit event without the URL. Do not silently rotate on copy. This updates the earlier hash-only proposal; architecture decision A15 owns the change. Key rotation/backup must preserve existing-link recovery or deliberately offer an explicit, explained rotation fallback.

## UX requirements

- The share screen clearly distinguishes General invitation, Personalized guest invitations and Private client dashboard.
- Every theme supports named text/no-name fallback without clipping long Bangla or creating new bitmap artwork per person.
- Show a scoped preview and correct share-message text before copying; never auto-send messages.
- “Pending” means an invited household has no response for that event. “Opened” is not attendance; launch does not promise reliable open tracking.
- Personal messages are visible to anyone holding that household link, so mark them “shown on this invitation,” distinct from private guest-to-host notes.
- Per-guest colors/layouts/photos, individually rendered PDF cards and spreadsheets/automation are later scope. Do not duplicate six theme engines to support greetings.

## Contracts and acceptance

Household create/update accepts the bounded localized overlay and `expectedRevision` for updates. Add owner-only `GET /weddings/{id}/households/{hid}/preview` returning a scoped preview DTO and `POST /weddings/{id}/guest-links/{linkId}/copy` returning the authorized existing guest URL without rotation. Guest token reads extend the existing published DTO with safe `guestContext`. No public name-based personalized-link lookup.

Verify: two households never see each other's message/events; generic URL contains neither; restricted event cannot be submitted by crafting a request; long Bangla wraps in all themes; visiting twice never increases response counts; correction and revocation affect the intended household; a failed overlay save does not claim success; base republish retains household identity; token paths and names never leak into social previews/public cache.

Commercial wording: “personalized links for your guest list” or “share your invitation freely,” with explicit actual package/hosting limits. The user thinks the vendor's unlimited offer likely refers to invitation links; it remains unconfirmed and is not our final package policy.
