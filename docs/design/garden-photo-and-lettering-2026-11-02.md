# Garden photo and lettering refinement — 2 November 2026

The Garden invitation now opens immediately, including on devices that allow animation. The hero photograph has no animation, transition or transform. The page entrance movement is also disabled for Garden. Faces and embroidery remain unobscured; the emerald gradient builds below the faces and becomes opaque behind the live names and date.

The bundled fictional couple photograph is replaced in Garden's hero, collage and photo viewer. This is a presentation-only substitution for the exact bundled sample path. Host-uploaded photographs, saved invitation data and the other templates are unchanged.

## Image delivery

- `web/public/artwork/garden-couple-v2-1024.webp`: native 1024×1536, lossless, 1,784,564 bytes. The hero always requests this full-quality version.
- `web/public/artwork/garden-couple-v2-640.webp`: 640×960, WebP quality 94, 224,038 bytes. Used as a responsive collage variant.
- `.artifacts/garden-royal/garden-couple-v2-master.png`: unmodified generated PNG master.

The generator returned 1024×1536 despite the requested larger output. No interpolated upscale is presented as additional photographic detail.

## Typography and layout

English display lettering uses locally hosted Pinyon Script, with Georgia for readable body copy. Bengali display lettering uses locally hosted Galada, with the existing Noto Serif Bengali body font. Both new fonts have SIL OFL licenses in `web/public/licenses/`. Font hints are limited to the Garden folio.

Sources: [Pinyon Script](https://github.com/google/fonts/tree/main/ofl/pinyonscript), [Galada](https://github.com/google/fonts/tree/main/ofl/galada).

Ceremonies are laid out as printed invitation text directly on emerald, with large script titles, dates and venues. Map links remain prominent; calendar, address copy and embedded-map controls sit in an accessible native disclosure. RSVP uses the emerald page with underlined fields and plain radio choices. Guest-count inputs align even when a label wraps. The existing response transport, permissions, guest limits, editing and wish submission remain in use.

## Exact Imagegen prompt

Built-in image generation tool in edit mode; input: `web/public/artwork/jamdani-couple-v1.webp`. No CLI fallback.

> Use case: photorealistic-natural. Edit target: the supplied fictional Bengali wedding couple portrait. Create a genuinely higher-detail, crisp premium wedding editorial version of this exact photograph for a royal emerald-and-ivory wedding invitation. Preserve the same two fictional adults' identities, faces, affectionate expressions, body positions, hands, ivory embroidered sherwani, ivory and burgundy Bengali sari, jasmine in her hair, jewelry, arched heritage courtyard and warm natural daylight. Preserve vertical composition and framing, no new props or people. Improve photographic clarity and authentic fine detail, especially both faces, eyes, hair, sari weave, embroidery and jasmine petals. Natural lifelike skin, no waxy skin, no artificial HDR, no oversharpening halos, no illustration. Both faces in sharp focus, natural softer distant courtyard. Keep highlights ivory and neutral, no muddy yellow veil or green color cast. Output a very high resolution portrait, ideally 2048x3072 or highest available native resolution, suitable for a mobile retina hero. No text, no typography, no gradients or page graphics baked into the photograph.

Validation: 56 test files / 450 tests passed; TypeScript, Prettier, diff checks and the optimized local production build passed. Browser review covered 320×812 and 390×844 phone sizes and 1280×900 desktop. The hero delivered the full 1024×1536 asset with animation and transform both `none`; no horizontal overflow or browser console errors were observed. Desktop framing was adjusted upward to retain both subjects' heads. The production preview runs on loopback port 3102. No deployment or database changes.
