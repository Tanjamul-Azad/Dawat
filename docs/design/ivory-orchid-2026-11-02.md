# Ivory orchid invitation — 2 November 2026

Implemented against the owner's fifth reference, preserved at `references/owner-ivory-orchid-2026-11-02.png`. This updates the existing `ivory` invitation template. It keeps its catalog ID and package tier. There are no deployment or database changes.

The owner explicitly requires the supplied styling, colors, fonts and composition to remain the design target. Retain the reference's warm ivory, muted olive, pale pink orchids, light serif names, restrained script accents and curved paper transitions in subsequent revisions. Other supplied references belong to their own distinct templates.

The composition uses light Cormorant Garamond names, script accents, real transparent orchid branches, olive controls and an imagined lakeside terrace. The sky blends into ivory; a curved paper boundary joins the scene to the personal welcome. Live dates, venues and guest wording come from the existing invitation. The scene is decorative artwork, not a claimed photograph of the venue.

The details overview, parallel ceremony columns, staggered curved photographs, orchid-framed oval RSVP introduction, underlined reply form and floral closing are specific to Ivory. Phone layouts stack the details and alternate larger photographs. The existing map, calendar, photograph viewer, RSVP allowances, editing, deadlines, transport and private wishes are retained. The new component tests cover opening/localisation, guest event scope, photograph viewing and response/wish transport.

## Assets

- `web/public/artwork/ivory-orchid-640.webp`: 640×960 transparent orchid cutout. Alpha was visually checked against the actual ivory background.
- `web/public/artwork/ivory-lake-768.webp`: 768×512 responsive scenery.
- `web/public/artwork/ivory-lake-1536.webp`: 1536×1024 scenery.
- `web/public/fonts/ivory-cormorant-latin.woff2`: locally hosted Cormorant Garamond 400, with its OFL in `web/public/licenses/cormorant-garamond-OFL.txt`. [Official source](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond).
- Existing locally hosted Pinyon Script and Galada supply script accents. Noto Serif Bengali remains the Bengali reading font.

Only the exact bundled fictional couple image is substituted with the clearer existing sample revision in Ivory and Garden. Host-uploaded photographs remain untouched.

## Exact Imagegen prompts

Built-in image generation was used. No CLI fallback. Original generated PNG files are preserved in the Codex generated-images folder; the production derivatives above are saved in the repository.

### Orchid cutout

> Use case: product-mockup. Production asset: an exquisite isolated pale blush and ivory Phalaenopsis orchid branch for an elegant luxury wedding invitation, a tall gently arching botanical spray with 5 to 7 large sculptural orchid flowers, delicate pink throats, natural translucent ivory petals, a few closed buds, slender muted olive green stems and long graceful leaves. Composition rises from the lower left and curves inward near the upper right, whole branch visible with generous transparent margin around every petal and stem. Refined botanical editorial photography with painterly softness only at edges, fine detailed petals, subdued natural colors, quiet old-world romantic beauty. Vertical portrait 1024x1536. Truly transparent background. No vase, no pot, no stand, no surface, no colored backdrop, no shadow outside the object, no frame, no text, no mockup, no phone. This cutout must blend into warm ivory paper.

### Decorative scenery

> Use case: photorealistic-natural. Production background artwork for an ivory orchid wedding invitation, landscape 1536x1024. A tranquil romantic lakeside vista seen from a classical pale limestone garden terrace, worn carved stone balustrade across the lower foreground, a beautiful leafy urn at far left, soft blue grey mountains receding around calm silver blue lake, a small ochre heritage villa and slender cypress trees far away on the right shoreline. Elegant old-world European destination-wedding editorial photography, calm hazy late afternoon natural light, very subtle warm ivory highlights, muted sage foliage, detailed stone and water, sophisticated airy atmosphere. The upper third is pale open ivory sky with almost no detail, lending itself to a seamless gradient into warm cream paper. Main scenery concentrated in lower two thirds, no people, no couple, no flowers, no text, no logos, no UI or mockup. No oversaturated sky, no deep bright blue, no artificial HDR. This is decorative imagined scenery, not documentation of a real venue.

## Verification

Browser checks cover 320px and 390px phone viewports and a 1280px desktop viewport, Bengali and English, saved RSVP receipt and editing, private wish submission and the shared photograph viewer. No horizontal overflow was observed. All 57 test files / 454 tests passed, including four new Ivory component tests. TypeScript, Prettier, diff checks and the optimized local production build passed. Sample replies were reset after testing. Preview: `http://127.0.0.1:3102/demo/?template=ivory&lang=en`. No production services were contacted.

Production-preview screenshots are saved under `.artifacts/ivory-orchid/`: `ivory-desktop-en.png`, `ivory-rsvp-desktop-en.png` and `ivory-rsvp-mobile-bn.png`.
