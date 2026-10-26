# Visual reference implementation · 26 October 2026

Published source: `303544230394bb2c3aa962a4f32d592cbbc28686` (includes `3988bdd`). Existing Netlify URL: https://dawat-client-pilot.netlify.app/. GitHub verification run `40349255588`: **success**. Actual live public pages serve the new artwork and composition.

## Implementation

- Home stationery hero, warm paper, burgundy controls, Bengali serif headings, feature photos, compact steps and woven package banner follow the home board.
- Six-card collection follows the commerce board's order and portrait artwork, with lotus wordmark and working preview/order links. Filtering returns three Normal or three Premium designs. Custom orders open the configured WhatsApp discussion.
- Payment follows the desktop/mobile board: floral corners, amount badge, bKash Personal **01606092143**, working copy controls, request-specific `DW-…` reference, numbered instructions, sender and actual transaction ID fields, manual-verification notice. Ordered quotes expand on demand. No gateway added.
- Shared customer/seller/auth surfaces use the paper/type/colour system. Login uses a generated floral arch; form measures about **397px** at a 1440px viewport after replacing percentage padding with a grid. Customer setup cards reflect actual state. Preview artwork follows selected template and draft names.
- **Motion14.6.0**, pinned, provides card gestures/layout transitions with reduced-motion support. Lucide retained. Lotus/paper SVGs are deterministic source assets.
- Original Imagegen PNGs and optimized WebPs are in the repository. [Prompt/asset record](../prompts/imagegen-visual-match-2026-10-26.md) distinguishes the retained verbatim prompt from earlier summarized specifications.

## Verification

- **296 tests / 36 files**, typecheck and optimized production QA build passed.
- Full isolated local HTTP/Auth/MFA/Storage journey passed: quote, acceptance, transaction evidence, seller verification, confirmation, activation, selected-template draft, cross-tenant denial, guest links/RSVP/wishes, private media processing and revoke rules.
- Browser inspected desktop home/collection/customer overview/editor/guest list/login, 390px home/collection/payment and 320px contact. Checked narrow layouts do not overflow horizontally. Published collection filtering and mobile menu work. Payment copy returns `01606092143`.
- Live smoke passed: login200, Bangla, protected route redirects/deep returns, public collection/sales guards, foreign-origin denial and private export/history denial. No email/payment sent by live smoke.
- Genuine live customer overview loaded through the user's existing session, observed without saving, publishing, changing access or logging that account out. No console warning/error entries in the inspected live session.

## Actual screenshots

Local ignored folder `.artifacts/visual-match-2026-10-26/` contains JPEG browser captures, not generated mockups:

- `live-home-desktop.jpg`
- `live-collection-desktop.jpg`
- `live-collection-mobile.jpg`
- `live-customer-overview-desktop.jpg`
- `local-login-desktop.jpg`
- `local-customer-overview-desktop.jpg`
- `local-customer-editor-desktop.jpg`
- `local-guest-management-desktop.jpg`

Generated boards are composition references. No automated pixel-diff or physical-device pass is claimed. Working text/order states remain data-driven. Admin identity, MFA, database/API contracts and issued guest links are preserved. Automatic guest messaging remains deferred by the owner.
