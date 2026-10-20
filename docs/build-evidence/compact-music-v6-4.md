# Jamdani v6.4 — compact spacing and classical accompaniment

20 October 2026. User supplied a screenshot showing a green strip above the invitation and requested a more precise/compact layout plus classical wedding music.

## Layout correction and observed result

The previous card used 90–150px top /150–230px bottom padding inside its cover,70px general chapter padding, long section gaps and390px closing artwork clearance. These values made useful information feel separated even when the card itself was functioning.

The updated cover uses42px top/100px lower content padding, a560–680px responsive minimum rather than an indefinitely viewport-expanded cover, and a34px outer-cover inset. Sections now use about28–40px vertical padding, smaller chapter labels/headline margins and30px event gaps. Closing artwork clearance is230px. Content remains in natural flow: long names/messages grow instead of clipping, and the explicit opening captures/reserves the frame height. The closed jacket stretches to that reserved grid row so no paper strip leaks below the sealed exterior.

The invitation's own `main` now has scoped zero margin/padding/border, flow-root isolation and its own background. **The original green strip was not reproduced in the current standalone source/DOM.** After opening the authorized live `/invite/` page in the app, both `main` and the invitation measured top=0px. There is no storefront header/footer above the card. Do not assert an identified root cause for a strip only seen in the submitted screenshot; the verified claim is that the current live build does not show it.

Rendering checks performed through the supported browser UI:

-390×844 Bangla closed/open cover: top=0, cover680px, immediate scrollable chapters on explicit opening; audio absent before interaction. Reduced overhead still leaves readable names/date and an opening/story action.
-320×740 Bangla: header60px, no overflowing buttons, document scroll width305px with a305px content viewport (scrollbar gutter). Inspected closed cover and gallery.
-1024×900 English: names/date/header, language switch and music control inspected. A music-dock overlap when returning to the header was found and fixed: the same button returns to its reserved header slot while the cover is visible and floats only after leaving it.
- Date/location now have translucent paper backing over the garden so their text remains legible against detailed artwork.
- Gallery framing, manual next, selected thumbnail and manual autoplay pause observed in the rendered mobile view. The prior v6.3 “no browser visual walkthrough” statement is superseded for these recorded views, not for untested five-image/physical-phone variants.

Screenshots are in `compact-music-v6-4/`: closed Bangla320/390, open Bangla390, gallery Bangla320/390, open English1024. A live page was available in a fresh authorized tab; the old error tab was not used as a browser-control workaround.

## Music selection and integration

Track: **Canon in D Major**, recording by **Kevin MacLeod**, original composition by Johann Pachelbel; ISRC **USUAN1100301**. Artist metadata lists double bass, violin and harp. The primary page publishes **CC BY4.0** with attribution. [Artist track page](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100301), [artist metadata](https://incompetech.com/music/royalty-free/pieces.json), [license](https://creativecommons.org/licenses/by/4.0/).

Self-hosted derivative: first120seconds,2s fade-in/4s fade-out, MP3 80kbps/44.1kHz; embedded album art omitted. **1,200,706bytes**, SHA256 `8c5fe141265a201c31168438b52d24c546fd3a8a770dc67390a1581251e6e87a`. Attribution and modifications are visible in the invitation's expandable music credits and shipped in `web/public/audio/CREDITS.txt`. Source/reproduction notes: `web/design-source/audio/README.md`. No third-party player or remote guest tracking is added.

- No music source URL is attached before a gesture; `preload=none`. Opening explicitly attempts playback synchronously inside the seal/quiet-open tap, independently of the800ms decorative opening timer. It never delays scrolling or waits for audio to load.
- Requested volume=.18, with the excerpt's own fades. Browser/OS volume policies may differ; no physical-phone listening/volume qualification is inferred.
- Always-labelled44px music button shows real loading/playing/paused state. The same control stays available after scrolling and returns to the header on returning to the cover. Manual pause is remembered per invitation scope. Motion and sound are independent controls.
- Rejected playback offers a manual play prompt; network failure leaves a retry state while the card remains usable. A delayed promise cannot restore the UI after cancellation. Backgrounding pauses without silently restarting; returning requires a new play gesture. [Browser play-promise behavior](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play).
- Local preview serves `audio/mpeg` and supports valid byte-range/suffix requests (206) and invalid-range responses (416), including the private-network phone server. Dashboard remains404 on that server.

Actual browser observation: after opening, audio readyState4, paused=false, advancing currentTime and no media error; pause switched paused=true and resume worked. After refresh the closed card again had no audio source. These confirm playback state/decoding in desktop Chrome; they are not an acoustic review on iPhone/Android or proof of identical Safari autoplay policy.

## Verification/status

**82tests in6files pass**, strict typecheck, Prettier and optimized export pass; diff whitespace checks pass. Five added music tests cover no-fetch-before-gesture, starting once, persisted manual pause, browser rejection/retry, failed media, pending cancellation, attaching after initialization and background cleanup. Existing personal-name/RSVP/opening/gallery cases remain passing.

Local retained review: `http://127.0.0.1:3000/invite/?lang=bn`. Private-network phone sample: `http://192.168.0.120:3001/invite/?lang=bn` (same network; no owner routes). Server sessions were restarted to pick up MP3 MIME/range handling. The music bytes do not belong to the pre-interaction critical-load budget; after opening they add approximately1.15MiB transfer.

Physical Android/iPhone full-flow and listening results are still pending. Earlier Lighthouse91/LCP3.46s belongs to v6.1 and has not been rerun for this layout/audio build; the2.5s LCP/field INP goals remain open. No paid/production service or shared guest backend is claimed.
