# Jamdani mobile polish checkpoint

19 October 2026. Continuation of the [full first template](first-template-v3.md). The user asked for opening-to-RSVP mobile inspection and premium polish, then provided a preferred [Figma direction and source ZIP](../design/figma-source-review.md).

## Implemented in our existing template

- Staggered paper-leaf release, seal lift, softer paper shadows, one-time section arrival and quieter receipt ink animation. No motion dependency. Opening stays within the existing 1.45s controller, repeated taps cannot cancel its timer, and reduced motion keeps content directly usable.
- Sticky chapter navigation with current-section underline, observer-based tracking and matching anchor offsets. Short landscape viewports use non-sticky navigation. Navigating to photos or RSVP during opening now opens at that chosen chapter. Focus lands on the card after seal opening, or on the selected section after skip.
- Full-width mobile event information with a compact inline date row, more readable actions/captions/cover details, 44px locale controls and a flexible four-column countdown. Long day counts have a compact numeral treatment.
- Wider locally styled photo dialog, darker backdrop, keyboard previous/next and horizontal touch swipe. Vertical gestures and pinch zoom remain available; buttons are retained. Photo-frame hover lift applies only to hover-capable devices without reduced motion.
- More tactile paper form/attendance choices and a distinct receipt. RSVP errors and saved receipt receive focus after their DOM is committed; a regression test exposed and fixed an initial focus-before-commit race.
- Progressive enhancement: section content is never hidden while waiting for an observer. Missing IntersectionObserver does not block content. Observers disconnect on cleanup; reduced-motion rules suppress decorative transitions/animations.

## Verification

- **38 tests passed in three files.** Five new interaction tests cover repeated seal taps/focus, direct chapter navigation, observer reveal/current chapter/cleanup, photo arrow/swipe/vertical-gesture handling, and RSVP error/receipt focus. Existing reply editing, scope, storage-failure and language-preservation tests remain green.
- Strict TypeScript and optimized Next export pass. Scoped CSS/TSX formatting was checked. The export is served by the retained local server at `http://127.0.0.1:4173/invite/` with `Cache-Control: no-store`; refresh the existing preview to use the new assets.
- This is **source and simulated-DOM verification**, not a completed visual mobile walkthrough. Browser inventory again returned `Local browser use is disabled in Work settings`. No screenshots, physical-device result, measured frame rate or CWV claim was fabricated.
- Existing Sites lookup still returns project-not-found. The original Site identity and audience were preserved; no replacement Site or hosted update was created.

## Remaining evidence

The user's Figma ZIP is now reviewed at source level. It has not been rendered or merged into our application. See the separate review for its actual fonts/layout, adoption plan and functional gaps.

Still run the actual opening-to-RSVP journey on narrow phones and iOS/Android/in-app browsers: first-fold fit, shaped Bangla and long text, sticky-anchor visibility, gesture scroll/zoom, photo loading, actual maps/calendar/clipboard behavior, keyboard and screen-reader focus, reduced-motion changes and save failures. These remain open quality gates rather than inferred passes.
