# Jamdani v5.1 — edge-case audit and rendered mobile polish

19 October 2026, Asia/Dhaka. The user likes the continuous v5 digital invitation and asked for edge cases first, then the full mobile opening-to-RSVP review. This pass preserves that direction and leaves storefront work deferred.

## Defects found and corrected

| Finding | Implemented behavior | Evidence |
|---|---|---|
| Switching celebrations discarded an unsubmitted reply | Separate in-memory drafts retain attendance, counts and note per event; saving the first general reply carries remaining drafts onto the created household identity | New DOM regression plus actual browser event switching with Bengali digits |
| RSVP deadline passed while the page remained open, but the form stayed enabled | One boundary timer updates the visible closed state; visibility/pageshow refresh handles a sleeping/restored tab; entered answers remain | Deadline-boundary and sleeping-page tests |
| A form could submit against its old publication policy | Submission checks the current published snapshot and rejects an unpublished invitation or a removed existing household; latest count/scope failures retain useful localized messages | Stale-policy and removed-household regressions |
| A direct `#rsvp` URL could arrive before the client content existed | After content is ready, recognized fragments open the invitation and scroll/focus the requested chapter once | Direct-fragment regression |
| Whitespace-only private wishes silently did nothing | Localized required-name/message feedback receives focus; text survives failure; update exceptions show truthful failure | Whitespace/correction regression |
| Global label styling stacked RSVP radio, icon and text vertically | Scoped attendance labels explicitly use a horizontal flex direction | Observed and rechecked in the rendered browser |
| Fixed-height lightbox left large empty bands around landscape photographs | Natural image height, bounded by viewport maximum; dialog follows the photograph's shape | Landscape lightbox screenshot |
| Narrow opening composition put flowers behind greeting/text and skip near navigation | Responsive vine scale, subtle greeting backing, reduced cover padding and small-height skip offset | 320×740 and 390×844 screenshots |
| Cover date/address competed with garden details | Soft paper shading preserves live-text contrast while keeping the garden visible | Final opened-cover screenshot |
| Small controls/long content were vulnerable to wrapping | 44px language targets; wrapping topbar/navigation; bounded action widths, zero input min-width and inherited long-text wrapping | Source inspection plus measured rendered reflow |
| General live invitation reused the sample locale preference key | Separate `live` locale preference scope | Source correction; no change to authorization |

Drafts are deliberately temporary in-memory edits, not a new autosave feature. Concurrent response conflict resolution remains a production concern below.

## Actual browser walkthrough

Browser access was initially disabled. After the setting changed, the supported in-app browser became available; this is **actual rendered browser evidence**, superseding the earlier disabled-browser limitation for this pass.

- **390×844:** Bangla and English opening, intermediate gate reveal and completed names; skip/chapters; date ribbon; event details; Maps iframe; photo open/next/close; RSVP with Bengali counts; accepted receipt and edited decline.
- **320×740:** Bangla cover, readable names, unfolded date, countdown, form, over-allowance error, corrected retry, three-person receipt and decline edit. Document scroll width equaled client width, **305px** (the browser reserves 15px for its scrollbar); no horizontal overflow was detected.
- **740×390 landscape:** RSVP remained within the 680px invitation canvas, controls reflowed and document scroll width equaled client width, **725px**. This checks viewport layout, not physical device orientation behavior.
- **Map:** click-loaded Google Maps embed visibly rendered; hide removed it. Fictional sample venues may resolve ambiguously in Google search. Actual customer venue selection still needs owner verification.
- **Copy:** browser clipboard contained the localized sample venue and address after Copy address.
- **Calendar:** browser downloaded `F:/Downloads/nikah.ics`; inspected UTF-8 content contained localized title/location, stable event UID, `DTSTART:20261211T103000Z` and `DTEND:20261211T123000Z` for the sample 16:30 Bangladesh event. This verifies download/content, not import into every calendar app.
- **RSVP:** used only fictional names and the isolated sample workspace. Browser submission demonstrated Bengali numeral normalization, allowance error/retry, accepted receipt and decline editing. Test sample replies were reset afterwards; customer order data was not used.
- Final checked browser console had **no captured warnings/errors**.

Screenshots are in [mobile-v5-polish](mobile-v5-polish/). The final views include:

- [Opening, Bangla 390](mobile-v5-polish/01-opening-bn-390-final.jpg)
- [Opened card, Bangla 390](mobile-v5-polish/02-open-bn-390-final.jpg)
- [Narrow opening](mobile-v5-polish/04-opening-bn-320.jpg)
- [Date reveal](mobile-v5-polish/06-date-bn-320.jpg)
- [Countdown](mobile-v5-polish/07-countdown-bn-320.jpg)
- [Receipt](mobile-v5-polish/08-receipt-bn-320.jpg)
- [Landscape photograph](mobile-v5-polish/09-landscape-lightbox-final.jpg)
- [RSVP controls](mobile-v5-polish/11-rsvp-controls-bn-390-final.jpg)

Earlier numbered English/narrow screenshots document intermediate checks; the explicitly `final` screenshots show the later cover shading and controls. Screenshots cannot prove frame rate. A click plus intermediate/final screenshots establishes that the opening ran, not a measured smoothness/performance result.

## Automated verification

**56 tests pass in four files**, including seven new regressions in this pass. Prettier and the optimized Next static export with TypeScript checking pass. Local preview continues on `http://127.0.0.1:4173/invite/?lang=bn` and `?lang=en`.

Portable static build: [v5.1 ZIP](../../.artifacts/jamdani-digital-card-v5-1-static.zip), **2,228,228 bytes**, 96 entries; every archive stream verified readable. Requires Node.js, with the start command included inside. Earlier v5 ZIP remains a historical artifact. HTTP HEAD of the local Bangla invitation returned 200.

SHA-256: `bf8bf9ed20cb80e5db57173a5d07bccd0cfd14dd2aefaeb152c0d8c24aa90fa5`.

Temporary viewport overrides were reset after QA. The final invitation tab is retained; six earlier reference/redundant preview tabs were closed. One old connection-error tab could not be acquired because Browser Use rejected its internal data URL; it was left untouched. The user-opened browser guide was retained.

## Remaining edge cases / qualification gates

Do not mark the entire TE01–TE60 matrix passed from this review.

1. **Physical devices:** Android/iPhone keyboards, browser bars/safe areas, pinch/200% OS text scaling, Safari, WhatsApp/Facebook browser, real touch swipe and reduced-motion preference changes. Existing DOM tests cover reduced-motion state logic; this pass did not alter the actual OS preference.
2. **Content variants:** exhaustive long Bangla/conjunct names, multiple hosts, very long notes/addresses and all one/five/no-photo combinations need rendered fixture review. Current source has flexible wrapping, photo-free and media failure fallbacks, with existing automated coverage; that is not exhaustive visual qualification.
3. **Performance:** measure mobile LCP/INP/CLS, transferred compressed route/JS budgets and animation frame timing on representative hardware/slow networks. No frame-rate claim is made here.
4. **Backend:** shared persistence, authentication, guest DTO/data isolation, revocation, server clock/deadline, idempotency, concurrency/stale-response notices, rate limits and payment/dashboard activation remain production work. Local storage and query IDs are a prototype, not production access control.
5. **Media/expiry:** production uploads, HEIC/EXIF/processing failures, asset versioning, invitation expiry/postponement and social preview privacy need the specified production implementation/tests.
6. **External apps:** actual Google Maps navigation and calendar import across supported phones remain unqualified. Download/copy/embed success does not close those checks.
7. **Publication:** the existing Sites identity remains unchanged and the prior project-not-found blocker is unresolved. This is a tested local build; it has not replaced hosted v2.

The approved direction is v5's continuous digital card. Final commercial template approval still requires the remaining qualification and user review.
