# Template engine, motion and asset contract

The invitation template is the principal selling point. Start with one finished original composition and a shared engine; future themes must not duplicate business logic. Qualify the full experience against [template quality and edge cases](template-experience-quality.md), not just its cover.

## Responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| Content schema | People, wording, events, media refs, block order | Payment state, arbitrary executable markup |
| Theme manifest | Supported blocks, palette, fonts, asset roles, opening options | Guest authorization or response storage |
| Block renderer | Public content layout and semantics | Reading private management rows |
| Opening controller | Tap/skip/reduced-motion and completion state | Whether guest may access an event |
| Guest adapters | Maps/calendar/music/gallery/RSVP behavior | Theme-specific copies of business rules |
| Commerce/publishing | Entitlements and immutable versions | Decorative CSS decisions |

## Manifest v1

```text
id, slug, version, title, category, tags
contentSchemaRange
supportedLocales: nonempty subset of [bn, en], no other keys
supportedBlocks + blockConfigSchemas
palettes[]: id, tokenValues
fontRoles: display, body, ui
assetSet: cover, poster, background, foregroundLayers, motifs, icons
openings[]: id, reducedMotionVariant, requiredAssets
capabilities: photoFree, maxGalleryItems, music, countdown, events, rsvp
previewFixtureId
availability: draft | active | retired
```

All manifest values are validated. Asset references come from our controlled manifest/storage, not arbitrary URLs injected into CSS. Retired themes stay renderable for existing pinned publications. Version updates need fixture/visual checks before becoming active.

## Renderer interface

Inputs: validated published/draft content, pinned theme version, locale, display mode and authorized guest policy DTO. Modes are `demo`, `preview`, `proof` and `live`. Business actions in demo/preview/proof use no-op/simulated adapters; production RSVP requires a live server-authorized scope regardless of frontend mode.

Output: semantic document with essential text in HTML, an event list, optional blocks and a guest action layer. Renderers must not fetch private owner context themselves. A theme can override presentation through bounded component slots, not replace authorization.

## Block registry

| Block | Required content | Empty/failure behavior |
|---|---|---|
| `opening` | Opening choice/poster | Skip to content if assets fail |
| `couple` | Partner display names | Publish error if missing |
| `hosts` | Host list or wording | Omit cleanly |
| `message` | Localized wording | Default starter only when owner selected it |
| `countdown` | Valid selected published event | Past/thank-you state; no negative values |
| `events` | At least one active event | Publish error if absent |
| `gallery` | Approved derivatives | Omit for no-photo mode; keep layout coherent |
| `dressCode` | Optional localized text | Omit when empty |
| `contacts` | Owner-selected public contact | Omit; never infer from account email |
| `faq` | Optional question/answer pairs | Omit empty entries |
| `rsvp` | Current authorized policy and event scope | Closed/unavailable state when appropriate |
| `closing` | Optional message | Theme-safe neutral closing |
| Growth: `story`, `transport`, `stays`, `gifts` | Typed content | Omit empty, validate links and public fields |

Every block needs a stable instance ID and type. Allowed repeatability/order is declared; e.g. events is one list block containing several events. Do not render duplicate functional RSVP forms because a section was duplicated.

## Opening state machine

```text
poster_ready → waiting_for_gesture → opening → content_visible
      └──────────────── skip / reduced motion ────────────┘
asset_failure ───────────────────────────────→ content_visible
```

Opening is a local presentation state, not a persisted order or RSVP state. Restart is explicit in demos. Editing one field does not remount the full animation. Keep decoration pointer-transparent so it cannot intercept form taps.

### Planned opening families

First release: one original opening appropriate to the chosen template, with skip, failed-media and reduced-motion paths. Paper folds, flower strings, paired doors and calm slide/fade are candidate families, not four promised templates. Growth: optional scratch/candle/expanded layering. Expansion: real 3D pop-up scenes; CSS transforms alone are not a 3D studio.

Reference patterns retained: envelope/wax seal, theatre/velvet curtains, paper sculpture, floral/embroidery framing, photo/date scratch, tap-to-light and fold-open scene. These are interaction categories, not permission to reuse specific assets.

## Shared guest widgets

- Music: guest gesture, playable state, mute and no-track option; catch rejection.
- Gallery: optimized sources, alt text, next/previous/dots; pause/limit automatic motion.
- Countdown: one source timestamp/timezone; stop/reset timer correctly after content change.
- Directions: validated URL or generated maps search from approved venue/address; no required geolocation.
- Calendar: event-specific start/end, timezone, localized summary and safe escaping.
- RSVP: event policy/scope from server; accessible fields; shared submit/edit/retry logic.
- Private note: plain text and private storage; public guestbook is separate Growth scope.

## Locale and art rules

Support only `bn`/`en` product locales. Render Bangla as shaped text, preserving conjuncts/punctuation; do not split names into code units for animation. Decorative assets surround live text rather than replace it. Blessing wording is optional, reviewed and within the supported languages; no third-language pack is implied. Switching must not replay the opening, lose input or alter guest authorization.

## Theme content stress fixtures

Each theme must render: two short names; very long Bangla names; absent parents; six hosts; one event; three events on different days; ten-event technical-cap fixture; no photos; five portrait/landscape photos; no music; translated strings longer than English; closed RSVP; household restricted to one event; past countdown; missing decorative asset; reduced motion.

The ten-event fixture validates layout capacity, not the final paid package allowance. Use entitlement limits to determine customer availability.

## Asset pipeline

Original source → licence/provenance record → optimized derivative → manifest version → fixture preview → accessibility/performance check → release. Use predictable asset roles, descriptive filenames and content hashes/versioned paths. Do not overwrite a file used by existing publications with incompatible artwork.

Keep originals/project source organized by theme, but only serve needed optimized derivatives. Prefer image dimensions appropriate to actual device usage; lazy-load gallery and soundtrack. Large layered scenes need an explicit payload budget and still fallback.

## Static export, Growth

Generate a separate static composition from content: cover/card artwork, key event details and optional QR. Disable interactive widgets and animation. PDF/PNG export requires correct Bangla fonts and a render job, not a screenshot of a moving page. RSVP stays on the linked guest page unless explicitly included as a link/QR.

## Validation before activating a theme

Manifest/schema compatibility, no missing asset roles, no private fields, functional block accessibility, shared-widget integration, all stress fixtures, original licensed assets, compact/desktop visual review, reduced-motion/audio-failure behavior and measured initial payload. Activation records the exact tested version.
