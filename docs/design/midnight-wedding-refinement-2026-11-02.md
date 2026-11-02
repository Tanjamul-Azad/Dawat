# Midnight wedding refinement — 2 November 2026

This supersedes the boarding-pass styling in the earlier four-template review. The owner requested a more celebratory wedding invitation and reported unreadable content. Only Midnight presentation changes in this pass; other template layouts, prices, APIs, guest scope and response logic stay in place.

## Design

- Navy, warm ivory and antique gold, using the existing local Pinyon Script, Cormorant and Galada fonts.
- A static, full-quality couple photograph fades into navy above large calligraphic names. Faces remain clear of the lettering. Existing uploaded photo crop positions and full-resolution fallback continue to work.
- Blue and ivory botanical corners cross the navy-to-paper boundary. Reuses the previously generated transparent flowers; no new generated image or dependency was needed.
- Clear date, celebration, venue and address replace small ticket-table labels. The date keeps the real invited event and Bengali day digits do not split on narrow phones.
- Welcome, calendar, events, gallery, response, wishes and closing use the same palette and typography, with ivory chapters between navy sections. Gallery photographs retain their original colour.
- The section navigation follows the cover in the page and sticks near the top, instead of floating across the bottom of the invitation. All four links, including Map, remain.

## Visibility fixes

Old event-specific backgrounds painted dark blue behind dark date text. Midnight dates now use an explicit navy-on-ivory treatment. Map fallback notes, music controls and wish buttons also receive readable colours. Decorative event outlines reset the old translation so their borders remain inside each card.

The closed Midnight cover intentionally includes the decorative photograph. Opening still controls access to the remaining invitation sections and forms. The existing component assertion now permits the new photograph in Midnight only.

## Verification

- Full suite: 58 test files, 474 tests passed, one worker. TypeScript, formatting and the isolated local optimized production build passed.
- Browser review: 320px and 390px phone viewports (305px and 375px content with scrollbar), English and Bengali; 1280px desktop.
- Calendar reveal and real selected day; directly visible map/calendar/copy controls; embedded-map toggle and directions URL; gallery viewer next/close; sample RSVP of two adults plus one child; private wish save. Disposable sample replies reset after checking.
- No horizontal page overflow, broken rendered images or console errors in the reviewed preview. No Docker, database reset or deployment.
- Template thumbnail regenerated from the actual browser-rendered cover.

Local preview: http://127.0.0.1:3102/demo/?template=midnight&lang=en

Local QA captures and test report live in the ignored `.artifacts/reference-cards/` directory and `.artifacts/midnight-wedding-tests.json`.
