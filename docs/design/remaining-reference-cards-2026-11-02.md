# Four remaining reference invitations — 2 November 2026

The owner's supplied styling, colors, fonts and compositions remain the design targets. Existing template IDs, prices, package tiers and guest-facing capabilities are retained. No database migrations, resets, deployment or publishing were performed.

| Owner reference | Existing template ID | Implemented composition |
| --- | --- | --- |
| 1, burgundy floral stationery | `rose` | Cream formal letter, wine calligraphy, floral corners, overlapping large day/month typography, burgundy ceremony chapter and cream reply area. |
| 2, dusty-blue floral stationery | `jamdani` | Floral cover followed by the couple photograph, blue wax monogram, uppercase light serif names, ruled date, round shortcuts and blue/ivory sections. |
| 3, royal envelope and paper folio | `holud` | Embossed burgundy envelope with gold heart seal, framed photograph, overlapping cream notes, four stamped navigation tiles and ornate reply stationery. |
| 4, navy boarding pass | `midnight` | Perforated cream ticket, globe and plane motifs, real event metadata, postal mark, monochrome photographs, real month calendar and ticket-shaped reply form. |

Garden and Ivory remain available. Cover photographs still reveal only after deliberate opening. New cards use the existing opening/motion preferences, reader controls and music. English lettering uses the existing local Cormorant Garamond and Pinyon Script fonts; Bengali uses Noto Serif Bengali and Galada. All names, messages, dates, venues and guest allowances remain live data. No relationship timeline, dress code, gift policy, flight booking information, reviews or attendance figures were invented from the reference advertisements.

## Feature parity and map visibility

Google Maps directions, add-to-calendar, copy-address and show/hide embedded map controls are directly visible under each event. A direct Map link is included in the persistent four-column navigation, including while viewing RSVP. Ivory's venue overview also links directly to its map.

The existing shared photo reel retains autoplay/pause, previous/next, thumbnails, swipe/keyboard navigation and its accessible full-size viewer. Garden and Ivory keep their bespoke photograph layouts and now also expose the original slideshow through a labelled disclosure. Date reveal stays interactive across language changes. Guest counts, validation, deadlines, saving, edit receipt, private wishes, view-only modes and household event scope use the original implementations.

Only the bundled fictional couple photograph is upgraded to the existing clearer sample asset. Host photographs and configured crop positions are retained; full-size sources have a fallback to the normal source. The ticket theme applies monochrome styling during display.

## Preview isolation

Local sample workspaces are stored separately by template (`dawat-guest-sample-v1-{templateId}`). This fixes one preview changing another open tab's design. A matching legacy sample is copied forward without deleting its old key. Live invitation storage, API contracts, authorization and database records are unchanged. The demo component remounts when its selected template changes.

## Artwork and catalog previews

Built-in Imagegen was used, with genuine transparency visually checked. No CLI fallback or additional packages were used.

- `web/public/artwork/reference-blue-640.webp`: 640×427 blue floral cutout.
- `web/public/artwork/reference-rose-640.webp`: 640×427 burgundy floral cutout.
- `web/public/artwork/reference-royal-envelope-960.webp`: 960×640 embossed envelope cutout.
- `web/public/brand/template-{rose,jamdani,holud,midnight}-reference.webp`: actual browser-rendered cover thumbnails, 360×540.
- `.artifacts/reference-cards/`: native cover, desktop, mobile reply and map-control screenshots, plus alpha-check previews.

Original PNGs remain in the Codex generated-images folder. Native CSS supplies paper edges, perforations, borders, gradients and calendars; existing Lucide icons supply the globe, plane and navigation symbols. Template picker artwork and palette metadata now match the new cards. Package IDs and prices were not changed.

## Exact Imagegen prompts

### Dusty-blue flowers

> Use case: product-mockup. A real transparent-background botanical corner cutout for a fine dusty-blue and ivory wedding invitation. An asymmetrical sweeping L-shaped corner arrangement: luxurious powder blue roses, ivory garden roses, small white anemones, muted sage eucalyptus and blue-grey leaves. Watercolor botanical illustration with soft paper-like petal detail, delicate graceful sprigs, refined romantic wedding stationery, desaturated French blue, cream, blue-grey and sage, generous negative transparent space toward lower right. Flowers clustered upper left and sprigs curve outward along top and left edges, all flowers and tips visible with transparent padding. Landscape 1536x1024. No background, no paper rectangle, no frame, no text, no vase, no shadow or colored glow outside the flowers. True alpha transparency.

### Burgundy flowers

> Use case: product-mockup. A real transparent-background floral corner cutout for a burgundy and warm cream digital wedding invitation. Rich deep wine burgundy roses, soft blush garden roses, cream ivory roses, tiny burgundy berries and fine dusty sage and olive foliage. Refined delicate botanical wedding stationery illustration with realistic detailed petals and gentle watercolor edges. Asymmetrical L-shaped diagonal composition concentrated at upper left, flowers and leaves flowing across the top and down the left, open transparent negative space toward lower right, full arrangement visible with generous transparent margin. Landscape 1536x1024. Sophisticated old-world romantic elegance. No vase, no surface, no text, no mockup, no frame, no ribbon, no shadow or background haze. Truly transparent background.

### Royal envelope

> Use case: product-mockup. A single luxurious closed deep burgundy wedding envelope as an isolated production cutout, front view almost straight on, slight natural perspective, landscape 1536x1024. Thick dark wine handmade paper with delicate embossed botanical relief on the triangular flap and along the lower envelope, beautifully tactile restrained leather-like paper grain, subtle warm highlights, gently lifted paper edges. An exquisite small spray of cream and burgundy roses with dark leaves tucked across the left edge of the envelope. The envelope is sealed at the central point of its flap with a plain round antique-gold wax seal, unlettered and without symbols. Antique romantic royal wedding aesthetic, deep oxblood and warm muted gold. Entire envelope and all flowers fully visible with ample transparent padding, natural object shadows on the object only. Real alpha transparency. No hands, no background, no surface, no text, no letters, no monograms, no phone, no screen, no border or mockup.

## Verification

Component tests cover all four layouts: opening, localization, date reveal, calendar download, map toggle, allowed-event scope, full photo viewing, RSVP save/edit, private wishes, missing photographs, long names, leap-year dates, host photo crop/fallback and preview isolation. Existing functional tests continue to exercise the shared invitation behavior. Browser review covered 320px and 390px phone viewports and 1280px desktop, Bengali and English, with no horizontally clipped reply fields or navigation links. The inline Google map rendered successfully. Bengali guest counts saved successfully in the ticket sample and were reset afterwards.

All 58 test files / 474 tests passed. The optimized production build, TypeScript, Prettier and diff checks passed. All four production previews opened successfully with their own template, both event-map controls and a working reply form; no missing rendered images or browser console errors were observed. Actual rendered cover thumbnails were refreshed in the catalog. All work is local on port 3102; no deployment was performed.
