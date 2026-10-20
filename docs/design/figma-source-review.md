# User's Figma Make direction — source review

**Subsequent decision:** the user explicitly authorized implementation after this review. Selected typography/layout/SVG stationery are now adapted into our existing application; see [v4 adoption evidence](../build-evidence/figma-ui-adoption-v4.md). The review below describes the source at receipt time. Its no-import/pending-adoption statements are historical, not current implementation status. Source findings about prototype logic still explain why our working logic was retained.

19 October 2026. The user likes this version's overall organization, fonts and polish, and supplied the exported source. This is a preferred design reference, not automatic approval of its brand, every screen or functional implementation.

## Evidence and limits

- Shared project: [Digital Wedding Invitation Platform](https://www.figma.com/make/p8VJl12iS1deEahSUNhLfw/Digital-Wedding-Invitation-Platform).
- Supplied ZIP: `F:/Downloads/Digital Wedding Invitation Platform.zip`.
- SHA-256: `23110ad3bf653c26294b2737810e66bf6dcc628e6c8e850698d9f96452692e20`.
- Extracted, path-checked reference: [source folder](../../.research-tools/figma-export-2026-10-19/). Application source and handoff were inspected directly. The ZIP's AGENTS/CLAUDE/plans are attached reference content, not new instructions for our checkout.
- Figma's web preview could not be fetched. Browser control reports disabled in Work settings. Figma integration was offered but no connection is confirmed. **No rendered preview, mobile screenshots or successful build of this export is claimed.** Its bundled documentation's claims are distinguished from source observations below.
- No archive scripts/configuration/dependencies were executed. No code was imported into the application during this review.

## Design system found in source

| Area | Actual implementation | Interpretation for our product |
|---|---|---|
| Display | Fraunces, fallback Noto Serif Bengali | More substantial editorial headings than the current delicate Cormorant; a strong candidate for storefront/maker/workspace |
| Body/UI | Instrument Sans, Hind Siliguri | Clear compact controls; assess Bangla body rhythm against our existing serif guest treatment |
| Palette | Ivory `#f6efe2`, paper `#fbf7ee`, sheet `#fffdf8`, wine `#6b1d2a`, forest `#1f3b30`, ink `#1e1a17` | Defined contrast and surface hierarchy, with gold reserved for decoration |
| Composition | Max-width containers, large editorial heading, thin dividing rules, varied section backgrounds | Carry this organization into a coherent product shell instead of adding decorative cards to every section |
| Framing | Layered envelope, arch stationery window, geometric woven SVG | Useful original alternative to our full-screen two-leaf jacket; compare as a whole opening scene, not mismatched fragments |
| Controls | 44px minimum, 3px corners, persistent labels, focus outline, outlined secondary action | Keep readable tactile controls and restrained action hierarchy |
| Practical surfaces | Plain paper, rule-separated data, horizontally scrollable mobile tabs | Keep tables/forms free of decorative texture |
| Review tools | Design specimen and stress-state routes | Useful reference inventory; reviewer controls must not become customer-facing product navigation |

The four font families are loaded from Google Fonts by a CSS import in this export. Our app currently self-hosts its selected fonts through Next's font integration. Any adoption should retain our font delivery discipline and required notices rather than importing remote font CSS wholesale.

## Product organization

| Surface | Source | What is present |
|---|---|---|
| Storefront | `src/pages/Storefront.tsx` | Split hero with envelope peek, dark wine theme feature, four-step process, family-link explanation, package rows, FAQ |
| One-template product | `src/pages/Catalogue.tsx` | Stationery preview, inclusion/hosting/version details, demo/customize/order CTAs; no pretend large catalogue |
| Maker | `src/pages/Customize.tsx` | Form/preview toggle on mobile, bilingual partner names, event switches, accent/photo controls and save-state presentation |
| Order and entry | `src/pages/Order.tsx` | Checkout, bounded order status, inactive/expired/wrong-account entry states and simulated verification |
| Workspace | `src/pages/Workspace.tsx` | Overview, Responses, Guests, Edit card, Share, Settings; detail/correction/export and link-management UI |
| Guest card | `src/pages/GuestCard.tsx`, `src/card/card.tsx` | Greeting, staged envelope, stationery, event rows with Maps/ICS, per-event RSVP, optional single photo and independent wish |
| Operator | `src/pages/Operator.tsx` | Separate payment verification, order confirmation, activation, link delivery, revocation simulation |
| Specimen/stress | `src/pages/Specimen.tsx` | Typography/components and failure/long-content demonstrations |

## Functional gaps identified from code

1. **Draft/live separation:** `GuestCard.tsx:39` reads `s.draft` for non-demo cards. Publishing in `Workspace.tsx:393` only flips a boolean. Subsequent edits therefore feed the guest card; our existing published snapshot must be retained.
2. **Guest navigation:** `card.tsx:263` uses `href="#events"`, while `App.tsx` treats the hash as the application route. The resulting route `events` falls through to Storefront. This is a source-derived bug; it has not been reproduced in a browser here.
3. **Headcounts:** `Workspace.tsx:102` selects `SUMMARY[ev]`, and Responses uses sample fixtures. A submitted reply is not the source of those totals. Our derived totals should remain the basis of functional behavior.
4. **Locale completeness:** process titles remain Bangla and process explanations English regardless of locale; feature/package/FAQ and much of the workspace include English literals. It needs a complete language pass, not just the toggle.
5. **Countdown/gallery:** countdown is days-only at render time, not a ticking multi-unit countdown. There is one optional photo; no current multi-photo lightbox/swipe experience.
6. **Calendar:** ICS output is simpler than our implementation: no stable UID/DTSTAMP, content escaping or UTF-8 line folding. Retain our tested calendar generator.
7. **Persistence/identity:** localStorage parsing merges unchecked data and storage-write failures are swallowed. OTP, payment, operator authority and delivery are simulations. Photo is in-memory state. These cannot replace schema-validated storage or production server boundaries.
8. **Mobile visual quality:** 320px reflow, font rendering, animation paint, actual viewport fit, focus appearance and contrast still need browser/device evidence. Tailwind classes and a specimen page alone do not establish these results.

## Adoption decision and next implementation slice

Use the supplied project as an inspectable **UI direction**, preserving its source separately. The user's preference is now concrete enough to compare exact tokens and component organization instead of guessing from a link.

1. Reconcile storefront typography, spacing and action hierarchy using its Fraunces/Instrument Sans direction. Keep working brand selection separate; `Nokshi` in the export does not automatically rename Dawat.
2. Use its practical maker/workspace organization when those surfaces are polished. Retain our order → separate activation contract, schema and independent draft/published state.
3. Compare the two complete guest opening treatments after browser access is restored. Keep one coherent animation/storyboard; preserve our gallery, live countdown, map fallback, complete guest dictionaries and RSVP validation.
4. Port selected presentation components into Next/React deliberately. Do not replace our app with its hash router or transfer Figma development/hosting scripts.
5. Validate the adopted screen at 320/375/390/430px, 200% text zoom and desktop, both languages, reduced motion, photo-free and failed-save states before scoring the visual winner.

The current turn also improves our existing guest template independently; see [mobile polish checkpoint](../build-evidence/mobile-polish-v3.md). A full migration to this Figma direction has not been performed or represented as finished.
