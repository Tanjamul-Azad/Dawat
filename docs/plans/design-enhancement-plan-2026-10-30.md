# Dawat design enhancement plan · 30 October 2026

Status: proposed art direction and implementation sequence. This document does not approve final screens or start application changes.

## 1. Outcome and reference

Make the public website, host dashboard and invitations feel like one beautifully crafted Bengali wedding stationery brand. The owner supplied [this reference](../design/references/owner-stationery-direction-2026-10-30.png) and asked to plan a visual upgrade across those surfaces.

Working direction: **Bengal botanical stationery** — warm ivory paper, forest green, burgundy, quiet antique gold, illustrated greenery and flowers, editorial typography and convincing paper depth.

The image is a visual reference, not a screenshot of a functioning product. Its tiny labels, counts and implied controls are not product requirements. Device frames, envelopes, flowers and fabric describe a photographic composition; the application itself still needs usable full-size screens.

What to carry forward:

- Dark green navigation with restrained botanical detail near its bottom.
- A pale, spacious workspace with a memorable wedding identity panel.
- Fine rules, inset frames and soft paper layers rather than a grid of identical generic cards.
- Burgundy names and primary actions, muted gold ornament and restrained green status accents.
- A personal invitation with a graceful arch or border, floral corners and substantial breathing room around the names.
- Coordinated artwork across the dashboard, invitation and public presentation.

## 2. Current repository baseline

Reviewed the current checkout and its existing design/QA documents. Earlier work has been integrated since the previous chat work; do not assume an old uncommitted implementation still needs replaying.

| Already available | What the upgrade should improve |
| --- | --- |
| Cream/wine tokens in `storefront.module.css` and `production/workspace.module.css` | Add a shared forest-green brand accent and reduce drift between the two token sets |
| Fraunces, Instrument Sans, Hind Siliguri and local Noto Serif Bengali in `app/layout.tsx` | Refine sizes, widths, line heights and emphasis before considering any new font |
| `storefront-chrome`, `storefront-how`, `storefront-trust`, `storefront-ornaments` | Improve composition and reuse existing components rather than rebuild their behavior |
| Original artwork and responsive WebP assets under `public/brand/` | Audit suitability; create only the missing matching illustration assets |
| Live invitation templates selected by `data-template` in `jamdani.module.css` | Prove one coherent botanical template treatment without flattening all six designs into one |
| Existing guest, link, payment and admin workflows | Preserve their behavior while improving visual hierarchy and states |

The [earlier roadmap](../design/design-roadmap.md) remains useful background. Its old prototype/backend status is historical. This plan is the current proposal for visual enhancement; the production implementation spec remains authoritative for functionality and security.

QA notes from 28–29 October contain unresolved browser/real-phone checks and screenshot caveats. They are historical evidence, not proof that the current checkout has been freshly verified. Capture a new baseline before styling work.

## 3. One visual family, different amounts of decoration

| Surface | Composition | Decoration level |
| --- | --- | --- |
| Public website | Keep the full-bleed hero. Pair generous editorial text with real card compositions; coherent catalogue, pricing and trust sections | Strong at hero and section transitions; quiet around prices and forms |
| Host overview | Forest-green sidebar on desktop; cream canvas; illustrated wedding header; next action, meaningful totals and invitation preview | Botanical header and one sidebar accent; clean working area |
| Guests and replies | Compact toolbar and clearly grouped filters; readable table on desktop and family cards on phones | Small dividers and badges; no floral backgrounds behind names or counts |
| Invitation editor | Familiar guided steps; clearly bounded editing area; coordinated live preview | Fine frames and paper surfaces; decoration stays outside inputs |
| Guest invitation | Intimate stationery cover, live couple names, floral border, well-composed events and a calm RSVP section | Richest treatment at cover and closing; practical details remain readable |
| Orders, payment, login and admin | Same typography, surfaces, buttons and state language | Restrained; evidence, errors and pending actions remain prominent |

The application chrome follows the Dawat brand. A selected invitation theme may influence a small wedding header/preview accent, but must not change navigation, semantic status colors or form behavior throughout the dashboard.

## 4. Initial design rules to prove in the first screens

These are proposed starting values, not colors sampled from the image or accessibility-qualified combinations.

| Role | Starting value | Use |
| --- | --- | --- |
| Paper | `#F8F3E9` | Main background |
| Raised paper | `#FFFCF6` | Forms, panels and dialogs |
| Forest | `#193D32` | Navigation and selected brand areas |
| Burgundy | `#741126` | Main actions, selected headings, couple names |
| Antique gold | `#A8864E` | Ornament and decorative lines, not small body text |
| Ink | `#302B25` | Body copy and data |
| Muted ink | `#655C50` | Supporting labels, subject to contrast checks |
| Paper edge | `#DFD2BC` | Rules, borders and dividers |

- Keep the current fonts initially. Use serif for wedding identity and headings, the existing UI fonts for forms and tables. Verify Bangla conjuncts, vowel marks and punctuation at actual size.
- Body copy: approximately 16px; practical supporting text: 14px or larger. Do not shrink dashboard text to imitate the reference image.
- Use an 8px spacing rhythm with deliberate larger gaps between sections. Favor consistent panel padding over more nested cards.
- Distinguish invitation frames, content panels and action cards by composition. Use a small number of radii and shadows, without a new shadow or outline for each widget.
- Texture must be subtle and local. Put solid paper surfaces beneath fields, data and longer text. No full-screen texture filters or heavy blend effects.
- Artwork must not contain functional text. Names, dates, labels, prices and counts remain real HTML.
- Decoration is non-interactive, marked decorative for accessibility and cannot intercept input.
- Preserve keyboard focus rings, semantic status labels and contrast. Do not use color alone to convey a state.
- Motion supports opening, navigation and feedback. Avoid looping motion beside forms or tables; preserve reduced-motion and existing audio-consent behavior.

## 5. First review package — three representative designs

Create **six high-fidelity views: three screens at 375px and 1280px**. Reuse the same fictional wedding across all three so their visual relationship is obvious.

1. **Host overview:** desktop navigation, wedding identity artwork, one clear next action, useful overview numbers and a real invitation preview. The mobile design must reorganize these elements, not scale down the desktop composition.
2. **Botanical invitation:** cover and opened content including at least one event and RSVP. Use Garden as the first design candidate; confirm its existing artwork and layout fit before changing theme-specific styling. Also show a long-name and no-photo variant.
3. **Public homepage:** retain the full-bleed hero composition and current navigation behavior. Show the hero, a real template card and the beginning of the next section, with the same material and type language as the other views.

Also include a compact specimen showing a field/error, primary and secondary buttons, a guest row/family card, pending/opened/replied badges, and an empty state. This catches visual-system gaps without designing every page up front.

Review criteria:

- Do all three feel as carefully composed as the reference at normal viewing size?
- Is the botanical artwork convincing, with consistent detail and palette?
- Can a host immediately find the next task and understand the counts?
- Are Bangla and English both comfortable to read?
- Does the layout still work with long names and no photographs?

The next review should show actual designed screens. A palette sheet, generated laptop mockup or another planning document alone does not finish this package.

## 6. Implementation sequence after the direction is settled

### Pass 0 — establish the baseline

Capture the current home, templates, host overview, editor, guest list and invitation at both widths. Note the current branch/commit and any existing failures. Keep synthetic data only. Preserve current routes, copy contracts and workflows. Docker is unnecessary for static design work; use local Supabase for authenticated behavior checks when needed, without resetting its data or stopping another session's server.

### Pass 1 — prove the design in the six views

Build an isolated local design preview using the existing stack and shared fixture content. Reuse production presentation components where practical, without live API writes. Document any necessary visual-only variants. No new route should enter public navigation until it is ready.

Produce the initial design package in §5 and compare it side by side with the owner reference. Confirm the dashboard, invitation and homepage treatment together before propagating it to every screen.

### Pass 2 — establish the shared primitives

Use one small CSS token source, provisionally `web/src/styles/brand-tokens.css`, imported once from `app/layout.tsx`. Retain existing local variable names or add explicit aliases to limit changes. Keep template-specific tokens scoped to the invitation.

Extend existing buttons, panels, fields and ornaments where possible. Add a component only when a repeated, concrete visual pattern needs one. Do not introduce a new UI framework, theme engine, global state layer or application-wide component rewrite.

Deliver an artwork manifest listing source, rights/provenance, dimensions, mobile crop, file size and intended placement. Use original or appropriately licensed artwork. If image generation is used later, generate decorative artwork only; build functional screens with code.

### Pass 3 — host overview, guests and editor

Implement the overview first, then guest management/send queue/shared-link settings, then editor and dashboard list. Verify long guest names, duplicate hints, hidden rows, phone errors, loading, empty and failed-save states. Existing send confirmation and popup-safe prepared links must keep working.

### Pass 4 — invitation and catalogue continuity

Finish the first botanical theme from cover through events, RSVP and closing. Align its actual preview with its catalogue thumbnail. Test named and shared-link guests, translated content and no-photo layouts. Extend the common quality improvements to other templates while preserving their distinct identities and purchased template IDs.

### Pass 5 — public website and service screens

Apply the approved homepage treatment to templates, pricing, FAQ, contact and policies. Finish login, order/payment and admin consistency. Reuse truthful app screenshots, with synthetic information. Keep empty social-proof components hidden. No new prices, refund promises, reviews or customer counts.

### Pass 6 — qualify the completed surfaces

Run focused component checks, typecheck, the existing suite with one worker, build and local HTTP verification where behavior could be affected. Complete keyboard, touch, reduced-motion, contrast and performance checks. Record actual findings and unresolved limitations in the QA report. No deploy is included.

## 7. Code ownership and change boundaries

Work sequentially unless another session is explicitly coordinated. These are change groups, not an instruction to start agents.

| Group | Current files to inspect/change |
| --- | --- |
| Shared foundation | `web/src/app/layout.tsx`, `globals.css`, `product-ui.css`, proposed `web/src/styles/brand-tokens.css`, `components/brand-mark.tsx` |
| Host application | `components/production/frame.tsx`, `workspace.module.css`, `client-dashboard.tsx`, `wedding-desk.tsx`, `guest-hub.tsx`, `guest-list.tsx`, `guest-send.tsx`, `open-invite.tsx` |
| Invitation | `components/guest-invitation.tsx`, `jamdani.module.css`, `invitation-sections.tsx`, `invitation-response.tsx`, `stationery-art.tsx` and its CSS |
| Public site | `components/storefront.tsx`, `storefront-chrome.tsx`, `storefront-pages.tsx`, `storefront-how.tsx`, `storefront-trust.tsx`, `storefront-ornaments.tsx`, their existing CSS/motion files |
| Service screens | Existing production login, sales desk, seller orders and customer notification components and their styles |
| Artwork | `web/public/brand/` and `web/public/licenses/` |

No database migrations, authentication changes, API redesign or new functionality are required for this visual project. If a design needs a new capability, record it separately rather than quietly expanding the styling scope. Read `web/AGENTS.md` and applicable framework documentation before implementation.

## 8. Definition of done

- A coherent visual language across public site, application and invitations, visible in real browser screenshots.
- No unintended page-level horizontal scrolling at 375px, 390px, 768px and 1280px. Any deliberate data-table overflow remains contained and understandable.
- Long Bangla names and 120-character family names wrap without colliding with actions; real URLs and email addresses do not break layout.
- At least 44px practical touch targets; 48px for prominent mobile actions and menu items.
- WCAG AA contrast for text and controls, including focus and error states. Artwork never substitutes for labels.
- Light and rich invitation themes stay readable; RSVP, editing and payment controls remain accessible.
- Mobile menu focus, dialog focus return, local draft preservation, actual save receipts, link preparation and delivery confirmation pass regression checks.
- All visible invitation names/dates/prices remain live content. No critical text baked into artwork.
- No new runtime package unless a specific requirement proves it necessary. Prefer existing CSS, SVG and Motion.
- New decorative images use suitable WebP/AVIF variants and lazy loading where appropriate. Preload only the measured critical asset.
- Measure mobile LCP and CLS before/after; target LCP ≤2.5s and CLS ≤0.1. Record the tool and conditions; do not label an estimate as Lighthouse. Existing demo performance issues must be documented rather than hidden.
- Screenshots and reports contain only synthetic data; public screenshots do not expose session links or private contact information.
- QA report: `docs/qa/design-enhancement-2026-10-30.md`; screenshot evidence under ignored `.artifacts/design-enhancement/`. These are future deliverables, not completed checks.

## 9. Decisions and scope

No additional policy, price or backend decision is needed to start the design package. Proceed with the reference-led direction above as the initial proposal. Its visual review should settle the balance of forest green/burgundy, artwork richness and invitation composition using concrete screens.

Preserve the existing Dawat name and logo. Show the owner a small refinement separately if it becomes useful. New branding, a full template catalogue replacement, 3D rendering, heavy animation tooling and deploy are outside this plan.

If source artwork or permission to reuse any reference asset is unavailable, create original decoration with the same overall mood. Do not lift the complete reference composition, tiny dashboard interface or logos as product assets.
