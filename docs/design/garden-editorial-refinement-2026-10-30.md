# Garden editorial refinement — 30 October 2026

The owner supplied three additional reference screenshots and [this Pinterest pin](https://www.pinterest.com/pin/845199055108162474/). The pin could not be fetched directly; the attached screenshots were inspected and preserved in `docs/design/references/` as `owner-garden-editorial-2026-10-30.png`, `owner-envelope-collage-2026-10-30.png` and `owner-paper-silk-2026-10-30.png`.

The composition now uses a physical envelope and gold seal, a photo-led opening, irregular paper edges, a tilted date keepsake, silk across the date/events boundary, loose-paper ceremony cards and a photographic collage. Flower cutouts overlap the stationery. Garden retains its emerald/ivory palette with burgundy ink and antique-gold details. Reference text, gift policies and fictional relationship timelines were not used as invitation content.

Live names, dates, photos and host wording are supplied by the existing invitation. The photo hero falls back to the illustrated garden if no image is provided or loading fails. Long couple names remain visible below the envelope, with initials inside the small stationery insert. Collage buttons use the existing shared accessible modal, next/previous controls and swipe handling. Other templates retain the reel layout.

## Generated assets

Built-in Imagegen, transparent backgrounds; no CLI fallback. Production assets are new WebP siblings in `F:/Projects/Wedding Card/web/public/artwork/`:

| Asset | Variants | Approximate sizes |
| --- | --- | --- |
| garden-editorial-envelope | 480×480, 960×960 | 27, 115 KiB |
| garden-editorial-blooms | 480×320, 960×640 | 59, 167 KiB |
| garden-editorial-silk | 640×427, 1200×800 | 28, 70 KiB |

`garden-paper-edge.svg` is a small native SVG mask with a displaced paper edge. It supplies a reusable graphic boundary; the envelope, flower and silk illustrations are generated bitmap assets. The previous royal artwork is preserved.

## Exact prompts

Verification after refinement: all 56 test files / 448 tests passed; the optimized local production build, TypeScript, Prettier and diff checks passed. Browser review covered 375×812 and 390×844 phone viewports and 1280×900 desktop, with no horizontal overflow or failed image assets. Both collage images opened through the shared modal; sample RSVP submission and edit receipt worked. The six Garden component tests include photo failure fallback and collage/modal navigation. No deployment or database changes were made.

### Envelope

Use case: product-mockup. Asset: a single isolated luxurious open wedding envelope and blank invitation on a genuinely transparent background, square 1024x1024. Premium editorial wedding stationery photographed from directly overhead, an open deep emerald green handmade-paper envelope with delicate antique-gold fine lines and an ivory cotton paper invitation protruding from its top. The envelope is slightly rotated 7 degrees counterclockwise. The thick ivory card occupies the upper half, totally blank with a subtle thin gold outline and softly scalloped arched top corners. Emerald envelope flaps fold across the lower half, front panel plain emerald, tactile layered paper edges with realistic fine shadows between layers. The inside envelope lining is restrained dark green and gold botanical print. Single stationery object centered in canvas with generous transparent margins; entire object visible, extremely refined royal aesthetic, elegant warm diffuse light, natural shadows on the object itself, sharp detailed materials. No table or fabric or backdrop. No text, no names, no numbers, no letters, no typography, no monogram, no seal, no ribbons, no flowers, no hands, no UI. Real transparent background, no colored glow, no cast shadow outside the object. This is a real production cutout asset, not a phone mockup.

### Flower cutout

Use case: product-mockup. Asset: a photographic flower arrangement cutout for luxurious wedding web stationery, landscape 1536x1024, genuinely transparent background. An exquisite airy asymmetrical floral cluster that flows horizontally from lower left to upper right. Lush soft ivory hydrangea florets, white gardenias and small jasmine blossoms, beautifully shaped deep emerald leaves and a few small deep burgundy garden roses as restrained accents. Botanical wedding editorial still-life photography with real velvety petals and fine stems. The large main floral mass at the lower left, delicate leafy spray reaching upper right, the entire arrangement visible with clear transparent padding on all sides. Fine natural silhouette, beautifully irregular edges for overlapping different web sections. Cream ivory rather than bright blue white, muted fancy jewel green, subtle burgundy. No vase, no pot, no hands, no table, no scene, no cloth, no ribbon, no text, no frame or arch. No colored halo, no gradient backdrop, no background or outside shadows. All empty space truly transparent. Very high quality, realistic natural flowers, no painting or illustration.

### Emerald silk

Use case: product-mockup. Asset: an isolated flowing emerald silk drape, ultra-wide landscape 1536x1024, genuinely transparent background. A sumptuous deep dark emerald green silk fabric swag flowing across the whole width like a broad soft wave. Layered elegant folds dip in the middle and rise towards the left and right corners, slight natural asymmetry. Rich fluid realistic satin texture, warm soft highlights on ridges and deep forest green in folds, sophisticated luxurious wedding editorial photography. One continuous fabric object, generous transparent space around it, entire edges visible. The cloth band should occupy the middle third of the canvas, flowing horizontally with a gently curved silhouette, airy lower edges, no knots or bows. No background, no floor, no table, no people, no flowers, no text, no gold patterns or border, no props. Clean transparent silhouette with no colored glow, no external shadow. It will visually bridge sections of an emerald and ivory wedding invitation.

