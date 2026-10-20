# Jamdani v5 — the whole experience is the digital card

19 October 2026. Latest user correction: finalize the invitation product first; website work comes later. A card image followed by website-style details is not the desired product. This implementation concentrates on the guest renderer; storefront, maker, dashboard, domain model and persistence were not redesigned in this pass.

## Implemented experience

The full phone canvas is now one illustrated invitation. There is no nested miniature card, separate storefront brand header, alternating website-panel backgrounds or dashboard-style event list inside the invitation. A continuous warm paper ground, woven edge stitching, coordinated floral art and typography carry through the whole journey. Desktop presents the same 680px-wide card canvas rather than expanding it into a marketing layout.

1. **Opening:** full-canvas wine woven folio panels, gold linework, original jasmine vines and a wax-seal action. A 1.8s native CSS gate reveal exposes the live names within the garden artwork. Skip works before/during opening; repeat taps, focus handoff, quiet mode and OS motion changes are handled.
2. **Names/welcome:** editable names and reviewed host wording are live text, not part of the image. Household greeting is additional rather than replacing the hosts. The invitation letter and personal message continue on the same paper with botanical edges.
3. **Date:** a native keyboard/touch date-ribbon interaction unfolds a day medallion. This is optional delight: the actual date is also readable on the cover and in a persistent `time` element. Reveal/refold and entered RSVP survive a language switch. The live countdown remains event-scoped and timezone-correct.
4. **Celebrations:** centered letterpress event chapters and ornamental rules replace the previous practical-list styling. Authorized event title/date/time/venue/address remain live, with existing Maps, click-loaded embed, copy fallback and calendar actions.
5. **Photographs:** one continuous framed photo chapter, arched portrait/landscape sequence and neutral photo captions. Existing lightbox, arrow buttons/keys, horizontal swipe, vertical-scroll handling, failure fallback and photo-free edition remain.
6. **Reply leaf:** RSVP appears as a printed response leaf in the same illustrated invitation, with real 16px form controls and existing validation/edit/receipt behavior. Private wishes remain independent of attendance. A compact floating chapter control provides shortcuts and hides while inputs are focused on browsers supporting `:has`.
7. **Closing:** the original garden returns as the illustrated signature/closing scene. The brand is a small footer credit rather than the invitation's main heading.

Native scrolling remains. Decorative petal motion, ink arrivals, ribbon movement and opening use CSS; no scroll hijack, WebGL, heavy motion runtime, paid integration or video was added. A visible pause/resume control suppresses decoration and can safely finish a running opening. Device reduced motion takes precedence; missing motion APIs open a quiet readable card. No music/track licensing is implied.

## Original artwork

Built-in ImageGen produced a new 1024×1536 Bengali garden background and matching transparent botanical vine. Both were inspected as tool images and copied into `web/design-source/`. Resized WebP assets are in `web/public/artwork/`:

- Garden 640px: **123,356 bytes**.
- Garden 1024px: **287,490 bytes**.
- Vine 480px with alpha: **109,006 bytes**; source alpha range verified 0–254.

Exact prompts, mode, saved source paths and integration: [ImageGen v5 assets](../prompts/imagegen-card-v5-assets.md). No competitor assets were shipped. Prior fictional sample photographs are retained; customer images remain optional.

## Verification performed

- **49 tests pass in four files.** New tests cover date-ribbon/locale/input independence, pause during opening without replay, OS reduced-motion change, failed painted-cover fallback, missing motion APIs and host wording coexisting with household greeting. The earlier product/domain/RSVP/storage/scope tests still pass.
- Strict typing, formatting and optimized static export pass. Scoped class references and CSS parsing were checked. `/invite/?lang=bn` returns HTTP 200 with no-store; the three new WebP assets return 200/image-webp.
- No new application dependency or production domain/persistence replacement. General/sample/design/household routing and read-only-preview restrictions are retained.
- [Portable static build](../../.artifacts/jamdani-digital-card-v5-static.zip): **2,227,530 bytes**, 96 entries, all archive streams readable. SHA-256: `f457efd1785efbf7e0d9e38ea7b015fbdaf044a3aeb6a7ebef294dde504496f7`. Extract and run `node scripts/preview.mjs`.

## Review URL and remaining gates

Local preview remains running as requested:

- Bangla: `http://127.0.0.1:4173/invite/?lang=bn`
- English: `http://127.0.0.1:4173/invite/?lang=en`

**Actual visual/motion/mobile QA is still pending.** Browser inventory again reports `Local browser use is disabled in Work settings`. Source/DOM checks do not prove the animation's paint smoothness, crop, first-fold fit, shaped text at every size, 200% zoom, phone keyboard behavior, real swipe handling, external Maps or performance budgets. No screenshots or final-design approval are claimed. Enable browser access for the next rendered refinement; physical-phone qualification remains necessary before sale.

Reference refresh: e-Nimontron's [Royal Scroll](https://www.e-nimontron.com/templates/royal-scroll.html) and [Royal Walima](https://www.e-nimontron.com/templates/royal-walima.html) yielded public text/content, including coordinated invitation/date/venue structures; current animation behavior was not observed. TDY Teatro could not be fetched through web extraction, and browser control was disabled. The earlier [hands-on Teatro evidence](../reference-evidence/guest-preview-walkthrough/README.md) remains the actual interaction record. This card is an original composition, not a replica of those pages.

The existing Sites project still returns project-not-found for lookup and source credentials. Its identity/audience were retained; this is a local update, not a new hosted deployment. Backend/auth/payment/shared RSVP production work remains separate. Do not call the template final or market-qualified until rendered user review and the remaining quality matrix pass.
