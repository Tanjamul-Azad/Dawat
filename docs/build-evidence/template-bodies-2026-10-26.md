# Template body palettes · 26 October 2026

Problem: the six designs (`web/src/features/production/catalog.ts`) differed only on the cover. After opening, every design fell back to the ivory Jamdani body, most visibly `midnight` (navy/gold cover, then ivory/mint body with pink Jamdani borders).

## Change

`web/src/components/jamdani.module.css` only. Renderer structure, content model and assets are unchanged; no new artwork was generated.

- Every hard-coded body colour is now `var(--token, <original literal>)`. Jamdani sets none of the tokens, so it renders from the original literals.
- `.page[data-template='…']` sets a full body palette per design: paper, grain, side frame pattern, desktop surround, hairlines, section tints, event cards and date chips, date medallion, photo frame and reel buttons, chapter-nav pill, music dock, form fields, buttons, highlight, petals and dialog backdrop.
- Ornaments and closings reuse existing art. Ivory, Garden and Rose press their own cover border into the section margins (`darken` blend, faded mask). Holud and Midnight use `botanical-gold-match.webp`. Every non-Jamdani closing shows the bottom of its own cover art, so the invitation ends the way it opened.
- Midnight has a dark body (`#0c1d31`) with ivory text, gold accents, gold buttons with navy text, and `color-scheme: dark` for native controls. The sealed cover keeps its original navy seal.
- The RSVP legend previously inherited a global grey (`#756953`). It now follows each design's `--faded`, while Jamdani keeps the same value.
- Token name `--hairline`, not `--line`, avoids the global `:root --line`.

## Verification

- **Jamdani unchanged:** full-page pixel diff of `/invite/?template=jamdani` against the pre-change CSS (clock frozen) shows **0 changed pixels** at 390px and 1280px. A re-shoot of the original produced the same zero noise.
- **Contrast:** automated DOM audit of all body text (cover excluded; translucent layers composited; closing text measured against the page colour where its fade starts), bn and en, including the sample-guest RSVP/wish form (demo mode with template switched): **0 AA failures**. Lowest ratios: Jamdani 4.54, Ivory 4.87, Holud 4.67, Garden 5.02, Rose 4.75, Midnight 6.9.
- Reduced motion: captures ran with `prefers-reduced-motion: reduce`. The quiet open path and motion rules are unchanged.
- `npm run typecheck` passed; `npm test`: **296 tests / 36 files** passed.
- Limits: local dev server and headless Chromium only. No physical device pass. The contrast audit ignores gradient backgrounds (it uses the underlying solid colours) and image areas.

## Screenshots

Local ignored folder `.artifacts/template-bodies-2026-10-26/` (main checkout) has actual captures: `<template>-390.jpg` (full page sliced into columns), `<template>-desktop.jpg` (1280px, centre column) and `<template>-rsvp-390.jpg`.

## Follow-up (not in this change)

The owner wants per-design layouts and placements later, not just colours (Pinterest references shared 26 October; the built-in browser could not open Pinterest). Launch scope is a few designs that work perfectly from cover to closing.
