# Website design specification

**v6.4 compact refinement:** keep natural content growth while reducing cover padding to42px top/100px bottom, shared chapter padding to40px and event gaps to30px. Closing artwork clearance230px. Main starts at0px without storefront framing. Retain clear type/background hierarchy; date/location receive paper backing over detailed art. Music: soft Canon in D accompaniment after an explicit gesture, separate from motion, with a44px control that remains reachable on scroll and visible expandable attribution. No initial music fetch. [Rendered evidence](docs/build-evidence/compact-music-v6-4.md).

**v6.3 current direction:** one arched photo stage with numbered thumbnails, side arrows/swipe and5s visibility-aware slideshow, max5photos. Sage gallery/countdown, blush welcome/reply, restrained sand/sage event-date highlights, darker prose and highlighted guest identity distinguish the chapters. Smart motion is short, purposeful and pause/reduced-motion aware. A deliberate opening action now unlocks scrolling immediately while the decorative doors finish; do not wait to mount the inside until animation completes. [Details/evidence](docs/build-evidence/gallery-colour-v6-3.md).

**Latest copy/design contract, v6.1:** the card is an invitation from the couple and their families, never “Invitation by Dawat.” End with the localized couple names, “ও আমাদের পরিবারবর্গ / AND OUR FAMILIES,” a quiet flourish and welcome. Personal wishes identify the couple by their current localized names; the separate attendance note concerns visit arrangements. The guest never enters their own identity. Retain the researched wine/ivory/brass sealed stationery and continuous original illustration; improve measured loading without replacing the liked composition. [Implementation and qualification](docs/build-evidence/template-qualification-v6-1.md).

**Latest v6 product contract:** the sealed cover must be opened before any inner chapters/navigation/forms render. No scroll/hash/reduced-motion auto-reveal. Cover identifies the host-addressed recipient and couple as sender; inner greeting and reply retain that guest identity, with no guest-name form. [Design research](docs/design/pinterest-gift-reveal-v6.md) and [implementation/browser evidence](docs/build-evidence/personal-opening-v6.md) are current. Template first; website redesign remains deferred.

**Current template direction:** the user likes v5's continuous illustrated digital card. [v5.1 rendered mobile audit](docs/build-evidence/edge-case-audit-v5-1.md) preserves that direction, records actual opening-to-RSVP viewport checks and fixes, with 56 passing tests. Browser access is restored. Keep storefront work deferred; physical-device/content/performance qualification remains open. This supersedes earlier instructions to wait for art comparison before continuing this already-liked direction.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](docs/specs/customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

Version 3 · 19 October 2026 · All dimensions, colors and motion timings here are **new-product design targets**, not approved final visuals or measurements reverse-engineered from the references.

## 1. Creative direction

**Latest template correction takes precedence:** the guest product is a complete illustrated digital card, not a physical-card mockup plus website details. [v5](docs/build-evidence/digital-card-v5.md) uses a full-canvas woven folio, continuous warm paper/edge stitching, original generated garden/vine and coordinated names/date/events/photos/RSVP/signature chapters. Keep names and all functional facts live. Natural scroll, skip, quiet mode and a compact reader control support this composition. Public website work is deferred until the template is reviewed and qualified; Figma typography remains useful but its storefront layout does not define the guest card.

**Adopted direction (latest user authorization):** Figma's font pairing and product layout now underpin the local website. [v4 implementation](docs/build-evidence/figma-ui-adoption-v4.md) uses Fraunces/Instrument Sans/Noto Serif Bengali/Hind Siliguri, ivory/wine/forest tokens, a rule-separated storefront, plain practical maker/workspace and one coherent layered-envelope guest opening. Keep our original raster art/photos and validated guest/domain behavior. This supersedes the earlier candidate-only language below; rendered/device qualification remains outstanding, so implementation is not final visual approval or proof of superior quality.

**User-preferred UI reference now supplied:** [Figma Make source review](docs/design/figma-source-review.md) records the exported project, Fraunces/Instrument Sans with Noto Serif Bengali/Hind Siliguri, ivory/wine surfaces, rule-separated organization and maker/workspace hierarchy that the user likes. Treat this as the concrete preferred product-UI reference alongside TDY's guest-experience inspiration. Its brand, hash router, fixed totals and draft-as-live behavior are not adopted. The exported source has been inspected; a rendered mobile comparison and final coherent typography/opening choice are still pending. The current template's [mobile polish](docs/build-evidence/mobile-polish-v3.md) is implemented independently.

The invitation **template is our main selling point**. Qualify the entire phone experience, not just the cover. Use [template storyboard/quality/edge cases](docs/specs/template-experience-quality.md) and [observed live-preview notes](docs/reference-evidence/guest-preview-walkthrough/README.md). Only বাংলা / English are supported. Both need complete readable states, not a decorative Bangla subtitle beneath an otherwise English product. No current prototype or tool output is automatically approved as the best direction.

Mobile is primary: compose at 390 px, verify 360 and 320 px plus desktop. Public customization is a bounded preview, distinct from the activated client studio. Show order review/status, then dedicated dashboard entry after operator confirmation and separate activation. Guest cards have no host management shortcut.

First comparison direction: original portrait ImageGen artwork with editable HTML names/date, crafted stationery scene, expressive serif/Bangla type, an arch-framed single-template feature and a practical order timeline. Keep palette variations inside the customizer.

Hero video or scroll media is optional. Establish a strong poster first; respect reduced motion/data preferences, avoid autoplay sound, support touch without hover or precision scrolling, and defer noncritical media. Current implementation uses optimized artwork and CSS envelope motion, with no hero video.

**A premium Bengali invitation atelier with a polished, practical maker behind it.** The user explicitly wants a celebratory market-ready experience at the quality level of The Digital Yes or better, with Dribbble/Pinterest inspiration. The storefront should feel like crafted wedding stationery: confident typography, original textile/floral detail, expressive composition and purposeful depth/motion. Maker/dashboard screens need the same quality of visual care while keeping actions understandable to a family member without design experience. Simplicity of operation does not mean a sparse or generic visual finish.

Read the [design sequence and quality bar](docs/design/design-roadmap.md) and [Dribbble/Pinterest shortlist](docs/design/inspiration-board.md). Current colors/type/dimensions are starting hypotheses to refine in the moodboard/high-fidelity pass. Existing dashboard SVG/PNG mockups establish information hierarchy only and must not be used as the final visual target.

Reference principle: The Digital Yes demonstrates a beautiful guest experience before asking a buyer to commit. Local principle: e-Nimontron makes choosing a template and entering details easy. Our own identity comes from Bangla typography, desi ceremonies, Jamdani/alpana/jali/marigold art and appropriate family wording.

Local visual evidence: [TDY product](docs/reference-evidence/tdy-product-teatro.png), [e-Nimontron preview](docs/reference-evidence/en-preview.png), [TDY homepage](docs/reference-evidence/tdy-home.png). These are study references, not production assets.

## 2. Design tokens

| Token | Proposed value | Use |
|---|---|---|
| `paper` | `#F7F2E8` | Main marketing background |
| `surface` | `#FFFCF6` | Cards, dialogs and forms |
| `ink` | `#222B26` | Body/headings |
| `mutedInk` | `#566159` | Secondary text; verify contrast |
| `wine` | `#6D2432` | Primary marketing action |
| `forest` | `#234D3B` | Maker/positive action accent |
| `brass` | `#8C6A35` | Decorative rule/icon; not default small body text |
| `border` | `#D9D2C5` | Form/card boundaries |
| `error` | `#A12F36` | Error text/icon plus explanation |
| `focus` | `#265EAC` | Visible keyboard focus |
| spacing | 4, 8, 12, 16, 24, 32, 48, 64, 96 px | Consistent rhythm |
| control height | Minimum 44 px, standard 48 px | Touch targets |
| field radius | 8 px | Inputs |
| card radius | 14–18 px | Marketing/workspace panels |
| modal radius | 20 px | Main dialogs |
| page width | 1200 px marketing, 1440 px workspace | Centered content |
| gutters | 20 px mobile, 32 px tablet, 48 px large | Page edges |

Use colors as CSS variables. Theme palettes are separate from the app UI palette. Verify actual text contrast rather than assuming a decorative palette is accessible.

### Typography

Use three roles: expressive display serif, readable Bangla/Latin text, restrained UI label. Select licensed font files during asset production; test actual Bangla shaping before committing. Store roles as variables, not template-specific scattered family names.

| Role | Desktop target | Mobile target |
|---|---:|---:|
| Marketing hero | 56–64 px Latin / 44–52 px Bangla | 36–42 / 32–38 px |
| Section heading | 36–44 px | 28–32 px |
| Product title | 48–64 px | 36–44 px |
| Body | 16–18 px | 16–18 px |
| Helper / caption | 13–14 px | 13–14 px |
| Field label / button | 14–16 px | 14–16 px |
| Guest names | Fluid by theme, bounded wrap | Never shrink below readable size merely to fit |

Bangla body line-height: about 1.65–1.8 as a starting target. Latin body: 1.5–1.65. Avoid letter spacing on Bangla words, forced uppercase in localized content and decorative thin text for essential times/addresses.

## 3. Responsive layout

Working breakpoints: compact below 640 px; medium 640–1023; large 1024+. Adjust from real content, not device labels alone.

| Component | Large | Medium | Compact |
|---|---|---|---|
| Header | Logo, nav, language, account, CTA | Short nav / menu | Logo, language, menu |
| Hero | Text + invitation preview, roughly 52/48 | Stacked or balanced split | Text then actual preview |
| Template grid | Three columns | Two columns | One column; no tiny cards |
| Product | Demo left, details/CTA right | Balanced two columns if usable | Demo then sticky purchase/start summary |
| Builder | Section rail + form + preview | Form + optional preview | Form steps; preview as full-screen sheet |
| Dashboard | Sidebar + content | Compact navigation | Bottom/top section navigation, stacked cards |
| Guest invitation | Centered designed reading column | Same content order | Full-width artwork with readable inner padding |

Test 320 px, 360 px, 768 px and a large desktop. A phone frame demonstrates shape; it does not substitute for a real phone test.

## 4. Storefront page design

### Header

Height target 76 px desktop / 64 px compact. Keep logo left, simple navigation centrally/alongside it, and language/account/Start right. Proposed nav: Templates, How it works, Pricing, Custom design. Save the Dates appears only when its product is released.

Sticky header may use a quiet paper fill after scroll. Do not let announcement bars/header/sticky CTA consume most of a small screen. Mobile menu uses a normal accessible drawer with Escape, focus return and clear close.

### Homepage wireframe

```text
┌──────────────────────────────────────────────────────────────┐
│ Brand   Templates  How it works  Pricing   বাংলা/EN  Start    │
├──────────────────────────────────────────────────────────────┤
│ Eyebrow / own brand promise      │ Original invitation       │
│ Large Bangla/English headline    │ opening + names preview   │
│ Short practical explanation     │                           │
│ Browse themes   Try the maker   │                           │
├──────────────────────────────────────────────────────────────┤
│ Choose your occasion: Holud / Nikah / Biye / Reception       │
│ Featured original theme cards: preview, tags, price, demo    │
│ Choose → Add details → Preview & share                       │
│ What guests receive: events, maps, calendar, RSVP            │
│ Bangla/family/multiple-events benefits                       │
│ Clear package + assisted design                             │
│ Real reviews when available / FAQ / support                  │
│ Footer: service, account, policies, contact                  │
└──────────────────────────────────────────────────────────────┘
```

Hero copy starter: **“দাওয়াত হোক আপনাদের গল্পের মতো।”** Supporting line explains the product plainly: choose a theme, add event details, share one link. These are draft copy, not approved brand claims.

One primary CTA per section. A video may enhance the hero but needs a still poster and no audio autoplay. Decorative motion should not move the main CTA or content while someone reads.

### Gallery

Search + occasion + style + color filters. Display active filters and Reset. Filter state belongs in safe query parameters so Back preserves discovery. Empty state suggests clearing filters; it should not pretend no templates exist at all.

Cards: fixed artwork ratio, readable title, two short tags, actual starting price or “Custom quote,” Demo and Use this theme. Add favourite control in Growth. Do not make the entire card, favourite and CTA overlap in hit areas. Keyboard focus must be obvious.

### Product page

```text
Breadcrumb
┌─────────────────────────┬────────────────────────────────────┐
│ Live invitation preview │ Theme name + occasion tags         │
│ Mobile / full view      │ Short design description           │
│ Demo badge              │ Price + exact inclusions/term      │
│                         │ [Use this theme] [Get help]        │
│                         │ Supported content / personalization│
└─────────────────────────┴────────────────────────────────────┘
Included sections → how it works → FAQ → related original themes
```

Preview is interactive and clearly a demo. A Demo label and disabled production submission prevent accidental guest responses. Do not replay the opening whenever the buyer changes a marketing tab. Provide Restart preview deliberately.

### Pricing and custom service

Launch: one clear DIY package and an assisted/custom quote option. Show number of events/photos, languages, RSVP scope, hosting term, support and edit limits. If add-ons exist, list what they change. Never describe “guest list included” and separately charge for it without distinguishing basic collection from named-household controls.

Custom-design page: scope examples, briefing requirements, turnaround start condition, revision definition and Request design assistance. A submitted request shows its reference/status; it does not promise the custom design is already purchased or delivered.

## 5. Builder design

Large-screen working layout:

```text
Top: Brand / wedding title / Saving… or Saved / Preview / Review
┌──────────────┬───────────────────────────┬───────────────────┐
│ Theme        │ Current section fields    │ Live preview      │
│ Couple/hosts │ Clear labels/helpers      │ Mobile/Desktop    │
│ Events       │ Add/remove/reorder        │ Current draft     │
│ Photos/music │ Inline errors             │ Restart opening   │
│ Sections     │ Back / Next               │                   │
│ RSVP         │                           │                   │
│ Review       │                           │                   │
└──────────────┴───────────────────────────┴───────────────────┘
```

Left rail target 208–224 px; form should remain at least 400 px wide when the three-column view is used. Preview target roughly 360 px. Below the useful width, collapse the preview rather than squeezing inputs.

Field groups have simple headings and helper text. Optional labels are explicit. Required values are checked on step navigation and again at publish. Draft saving accepts incomplete content; publication does not.

Events are reorderable cards with clear date/title summaries and Edit/Remove actions. Removal with recorded responses becomes Archive or a migration flow; never silently destroy responses. Theme changes preserve content and warn about unsupported blocks before applying.

Preview mode label says **Draft preview**, not a made-up permanent URL. Unavailable slug has a precise conflict message. Small save-state control exposes retry, not a permanent optimistic “Saved” label.

## 6. Guest invitation design

### Content order

Opening → language/music controls → partners/hosts/message → main date/countdown → multi-event cards → gallery → optional practical blocks → RSVP → confirmation/closing.

Event details are readable without sound. Each event card shows full localized date, time with timezone context where needed, venue, landmark, directions and calendar. Do not encode all essential text inside background images.

### Opening choreography targets

| Part | Starting timing target | Rules |
|---|---:|---|
| Cover ready | Immediate useful poster | Loading decoration does not blank the page |
| Tap feedback | 100–180 ms | Clear pressed state |
| Main opening | 800–1400 ms | Max total introductory wait about 2 seconds |
| Name/word reveal | 300–500 ms | Animate shaped words/lines |
| Section entry | 180–300 ms | Small opacity/translate, not continuous movement |
| Decorative particles | Limited simultaneous elements | Stop offscreen; disable with reduced motion |

All are design targets to measure and tune. Provide skip/reduced-motion behavior and retain keyboard access. Scratch reveals in Growth need a Reveal button and must not obscure required information indefinitely.

### RSVP form

Show invited household when token mode is used; show one attendance group per allowed event. Counts must clearly include the respondent: **“মোট প্রাপ্তবয়স্ক (আপনিসহ)”**. Children count is separate. Declining sets counts to zero. State the deadline and whether it has passed.

After success, replace the submit area with a clear confirmed summary and an edit-response link/receipt action. On network error retain the user's form values and reuse the request idempotency key when retrying. Never show success before server confirmation.

## 7. Original theme briefs

| Theme | Composition | Opening | Distinct assets | Avoid |
|---|---|---|---|---|
| Jamdani Ivory | Ivory paper, geometric woven border, deep ink names | Envelope/fold | Woven floral corners, monogram seal | Dense texture under body text |
| Holud Utsab | Yellow/orange/green, joyful event cards | Marigold strings part | Garlands, leaf forms, festive stage detail | Continuous confetti over controls |
| Royal Nikah | Emerald/ivory/brass, arch framing | Paired doors | Original arch/jali/lantern shapes | Mandatory religious copy/photo |
| Lal–Shada Biye | Vermilion/white, alpana and restrained green | Folded paper | Original alpana, floral/paan accents | Mixing every religious symbol automatically |
| Mughal Garden | Rose/sage/sandstone courtyard scene | Garden gate/layered paper | Jali borders, florals, courtyard silhouettes | Replica of a competitor's villa/art |
| Modern Desi | Warm neutral/deep ink; typography and couple photo optional | Calm slide/fade | Minimal frame and original line motifs | Making every theme visually ornate |

Each theme must support the exact same core fields and response mechanics. Decoration may differ; data/business rules do not.

## 8. Owner and admin workspace design

Client-dashboard direction is now explicitly based on the user's requested e-Nimontron-style service handoff. Use the original [desktop wireframe](docs/design/client-dashboard-desktop.svg) and [mobile wireframe](docs/design/client-dashboard-mobile.svg), with the [focused flow notes](docs/specs/e-nimontron-client-flow.md). The management workspace uses the paper/forest palette, separate invitation/dashboard actions, per-event metrics and a visible accepted/declined/pending response list. These mockups are our design proposal and predate the later vendor video; the [video review](docs/specs/vendor-dashboard-video-review.md) now records the visible reference UI without authenticated interaction.

Owner navigation: Overview, Edit invitation, Guests, Responses, Share, Orders, Settings. Overview cards show live/draft state, event dates and next action. RSVP cards show per-event counts; do not call every page visit a guest.

Include Private wishes as a separate tab/view or response-detail panel. A message received without an attendance reply remains a wish, not an accepted guest. Assisted clients enter Overview/Responses directly; builder navigation is optional for response management.

Add a named-invitation workflow: guest/family name, localized greeting/short message, event scope and allowance → scoped preview → create/copy link. Each theme renders the name as shaped text over its original composition; no duplicated website/image is generated per guest. The share screen clearly distinguishes general guest link, personalized links and private dashboard. [Full personalization behavior](docs/specs/personalized-invitations.md).

For the simple host view, show wedding title and RSVP/wish totals first, then summary cards, Replies and Private wishes. Photo-wish cards (G10) use author/date, readable message, optional full-width image and a confirmed Remove action. Place Print memory book (G11) near the title, with a private print preview before invoking the browser dialog. Maybe is an optional explicit response (G12), never a replacement label for Pending. These additions require their feature acceptance; do not render working-looking production controls before implementation.

Admin uses restrained tables and explicit filters for pending payment, awaiting materials, in design, proof and delivery failures. Payment status and design status are separate columns. Price adjustments, refunds, account access and publishing have precise audit/context screens rather than a single ambiguous “Complete” button.

## 9. Common UI states

| Component | Required states |
|---|---|
| Page/list | Loading, populated, empty, error, retry |
| Button | Default, hover/focus, pressed, disabled-with-reason, submitting |
| Field | Empty, valid, invalid, optional, read-only |
| Draft | Dirty, saving, saved, offline/failed, conflict |
| Upload | Selected, uploading, processing, ready, rejected, retry |
| Preview | Loading poster, ready, unsupported-media fallback |
| Checkout | Quote loading, quote ready, pending, failed, paid, verification delay |
| Guest link | Live, unlisted, access required, revoked, unpublished, expired |
| RSVP | Open, submitting, confirmed, editable, closed, stale-policy retry |

## 10. Design handoff and review

Every screen needs sample content, state variants and keyboard/mobile behavior. Use `docs/specs/screen-specifications.md` for page contracts and `docs/specs/localization-content.md` for copy/formatting. Review themes with long Bangla names, missing parents/photos, three events, declined RSVP, expired countdown, broken audio and large text.

Artwork, soundtrack and font licences remain production tasks. Local reference screenshots are retained only as study evidence; do not serve them in the new site's gallery.
