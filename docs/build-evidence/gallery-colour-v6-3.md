# Jamdani v6.3 — photo reel, colour chapters and immediate opening

20 October 2026. Latest user decisions supersede the earlier requirement to wait for the entire opening animation before mounting inner chapters. **Before a deliberate tap the card remains sealed; after that tap scrolling is immediately available while decorative doors finish.**

## Product changes

- One large arched photo mount replaces the separate alternating photograph stack. Up to five photographs remain supported by the existing editor and schema. A numbered thumbnail strip, previous/next controls, horizontal swipe and arrow keys select a photograph. The full-size dialog remains available, with its existing independent navigation and failure fallback.
- The sample retains two original fictional images; five-photo capacity is exercised with test fixtures rather than shipping duplicate photos as new sample content. Customer-supplied photos retain their selected framing. The stage keeps a fixed 4:5 shape; the full-size view preserves the image's natural proportions.
- Autoplay advances every five seconds only while at least 25% of the gallery is visible, the document is foreground, motion is allowed and the guest is not interacting. It pauses on hover, focus, manual arrow/thumbnail selection, touch or dialog opening. Manual selection stays paused until explicitly resumed. A single photo has no redundant playback/arrows/thumbnail controls. Missing observers favor manual controls; missing/reduced motion and the invitation-wide pause disable autoplay. Failed photos get a composed fallback. Selection uses stable photo IDs across reorder/removal.
- Sage and blush chapter washes distinguish countdown, gallery, reply and wishes from warm paper. The gallery uses a forest-coloured heading/controls. Event dates have contrasting sand/sage backgrounds and stronger text; guest identity has a tinted inset and wine border. Invitation prose is darker/larger; key heading phrases receive a restrained blush highlight and form labels gain weight. No new images or dependencies were added for the palette.
- Photo changes use a short 550ms settle (opacity/scale); thumbnails move 3px when selected. Existing reduced-motion controls suppress this. Section reveals were shortened to 320ms, with readable starting opacity, rather than delaying reading behind a long fade.

## Opening/scroll correction carried forward

The user reported a wait followed by a frame change before scrolling. Previously, chapters mounted after a 1800ms timer. Now the deliberate seal action makes the inside available immediately; decorative doors finish in about800ms without gating scroll. The cover reserves its natural inner/outer grid size and records its height on opening, avoiding a height change at timer completion. Focus transfers once on entry and does not jump back when decoration completes. The story CTA no longer has an opening-only position override. Quiet/reduced motion still requires explicit opening and then reveals immediately. No pre-tap inner chapters or forms are mounted.

Earlier CUA observation during the opening correction measured the same819.47px cover height before/after and successful natural scrolling. That observation predates this gallery/colour build and is not a visual approval of the new gallery.

## Pinterest research, scope and interpretation

Searches on20October: `site:pinterest.com digital wedding invitation photo gallery slideshow e invitation editorial` and a photo-collage/burgundy/sage image query. Indexed reference titles were available, including [photo wedding invitation/postcards](https://in.pinterest.com/benisonb/wedding-invitation-postcard-with-photo/), [digital e-invitations](https://in.pinterest.com/aditiparmar07/e-invite/) and [digital wedding invitations](https://id.pinterest.com/yungcultrweb/digital-invitation-wedding/). The board opened for inspection returned403; the image query returned no usable results. Do not claim a visual walkthrough of these boards or that they demonstrate this slideshow behavior.

The resulting arched photo mount, small numbered contact sheet and coordinated chapter palette are our own design interpretation, supported by the earlier [stationery research](../design/pinterest-gift-reveal-v6.md). No Pinterest/competitor assets, code or photos were copied.

## Verification and current limits

-77 tests pass across5files, including five-image autoplay/wraparound, no offscreen advance, manual pause/resume, focus/hover, document visibility, global quiet mode, one-photo controls, stable reorder/removal, swipe vs vertical scroll, lightbox and source failure recovery. Existing personal-name, scoped RSVP and opening-gate tests remain passing.
- Strict TypeScript, formatting, optimized export and diff whitespace checks pass.
- Local preview serves the new export on `http://127.0.0.1:3000/invite/?lang=bn`. User confirmed the page is visible.
- Current browser tool could not acquire the old error tab: its URL had become a blocked data-URL error document. The user opened the working page, but it was not present as a controllable invitation tab in the tool inventory. No alternative browser/control path was used to bypass the restriction. **This gallery build has not received a completed rendered mobile/desktop visual walkthrough or new screenshots.**
- Previous physical Android/iPhone reachability was confirmed by the user; no complete flow report/device timing files have been received. Previous Lighthouse91/100 and3.46s LCP belong to v6.1 and have not been remeasured for this gallery build. The LCP and physical-device release gates remain open.

Next visual check: 320/390px gallery framing and five-thumbnail touch targets, portrait/landscape crop, normal/reduced autoplay, labelled controls in both languages, photo dialog/focus return, and the new tinted RSVP identity panel. Do not substitute older screenshots for this build's evidence.
