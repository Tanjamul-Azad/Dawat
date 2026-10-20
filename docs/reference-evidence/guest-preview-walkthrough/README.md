# Live guest-template walkthrough — 19 October 2026

Purpose: the user asked us to open an actual template, trigger its preview/opening, scroll through the photos and practical sections, and use that experience to design a more modern original invitation. This is interaction evidence, not a competitor source-code audit or permission to reuse assets.

## Sources and method

**Later v5 follow-up:** web extraction opened e-Nimontron's [Royal Scroll](https://www.e-nimontron.com/templates/royal-scroll.html) and [Royal Walima](https://www.e-nimontron.com/templates/royal-walima.html), yielding invitation/date/venue/countdown/directions text. This was content inspection only: local browser control remained disabled, so it does not complete a new animation/scratch/scroll/Maps interaction walkthrough. TDY Teatro web extraction was unavailable. The earlier screenshots/actions below remain the actual hands-on evidence.

- [The Digital Yes catalogue](https://www.thedigitalyes.com/) → View the Teatro demo → [Teatro product/preview](https://www.thedigitalyes.com/demo/teatro) → Full screen.
- The preview exposes a public iframe: [Teatro guest demo](https://template-teatro.thedigitalyes.com/?embed=1). The product's full-screen wrapper did not settle into a usable view in this run, so the same observed iframe URL was opened directly. No URL was invented or private service accessed.
- The guest demo was inspected at 390 × 844 browser viewport using tap, ordinary scrolling, screenshot observations and DOM-visible controls/media state. No source/media files were downloaded for reuse. Saved PNGs are reference-only screen evidence.
- [e-Nimontron catalogue](https://www.e-nimontron.com/) was reopened and its template preview links read. The intended next sample was Royal Scroll. A later browser attempt was blocked by **Local browser use is disabled in Work settings**. This run therefore does not establish that template's opening, map or RSVP behavior. Earlier e-Nimontron evidence remains in the parent evidence archive.

## What was actually observed

| Stage | Observation / action | Evidence / limit |
|---|---|---|
| Product preview | A phone-framed interactive iframe, named feature-tour controls and a full-screen control accompany the product explanation | Product UI observed; iframe tested directly after wrapper issue |
| Before tap | Tall red curtain artwork fills the phone scene; EN/IT controls appear near the upper right | [Closed scene](tdy-teatro-01-closed.png). These are reference languages; our product supports only Bangla/English |
| Open | Tap to continue starts a curtain reveal. A later frame shows curtains pulled aside around the couple's names and invitation wording | [Open scene](tdy-teatro-02-open.png) |
| Media behavior | Visible opening video state reported duration approximately 5.08 seconds, muted video, ending at its final frame; separate audio was playing after the tap | One observed playback state, not an audited animation implementation or universal timing |
| Persistent control | A floating speaker control remains while scrolling; clicking it paused the audio in the observed DOM media state | Audio waveform/content was not independently listened to or licensed |
| Scroll cue | The open cover includes a downward scroll cue and gives way to further sections | Natural page scrolling used; no claim every device behaves identically |
| Date interaction | Three gold scratch circles conceal day/month/year. Pointer drags across each reveal the date and replace the instruction with a completion message | [Scratch complete](tdy-teatro-06-scratch-revealed.png). An early drag occurred while the page was still settling; later settled-target drags worked |
| Countdown | Separate day/hour/minute/second cells visibly tick | The demo's countdown and printed future date were not reconciled; do not reproduce its apparent countdown value |
| Venue | Original-style venue illustration, venue name, street/city and date, followed by reception information | [Venue](tdy-teatro-03-venue.png) |
| Programme/menu | A themed line-art/ribbon menu section contains grouped courses and a table illustration | Visual and text observed; this is optional content, not a requirement to impose food-menu blocks on every wedding |
| Dress code | Matching line illustration and formal-attire wording maintain the same wine/ivory art direction | [Dress code](tdy-teatro-04-dress.png) |
| Gifts | An illustrated gift section includes example bank-detail content | Seen only; not used, copied or made our default public content |
| Transport | Departure and return details plus a note connecting transport to RSVP | Seen; transport remains separately scoped optional product work |
| Couple photograph | A portrait photograph appears inside an ornate, coordinated frame as part of the scrolling composition | [Framed photograph](tdy-teatro-05-photo.png). No carousel, image zoom or photo-upload behavior was established by this run |
| RSVP accept | Choosing Yes reveals guest count, dietary checkboxes, transport choices and a song request | Conditional fields observed; no name/contact entered and no final RSVP submitted |
| RSVP decline | Choosing No removes the accepting-guest details | Conditional behavior observed; backend delivery, duplicate handling and dashboard update not tested |
| Closing | A final thank-you section and couple signature finish the page | DOM snapshot saved in [walkthrough text](tdy-teatro-dom.txt) |
| Google Maps/calendar | Venue facts were visible, but this tested guest page yielded no anchor links and no visible clickable map/calendar control was found | **Not verified for Teatro.** The main site advertises maps/calendar generally; that is not evidence this specific demo implements them |

## Lessons for our original design

The selling experience is an entire invitation journey: opening → live name/message composition → rhythm and reveals → photography or photo-free artwork → useful event facts/actions → RSVP → closing. A refined cover followed by generic boxes would fall short of the user's stated bar.

Retain the principle of coordinated art across sections and optional delight; create our own Jamdani-inspired paper opening, typography, scene transition, frames and practical controls. Do not copy Teatro's curtains, names, photos, illustrations, music or distinctive page composition. Use native scrolling, accessible shortcuts and a complete no-photo/reduced-motion version. Our default locale pair is **বাংলা / English only**.

Implementation and acceptance: [template experience and edge cases](../../specs/template-experience-quality.md). The current prototype demonstrates a cover/opening/events/RSVP flow but does **not** yet satisfy that complete template-quality specification.

## Evidence handling

These captures may contain public demo names/photos. They stay in the local research archive, outside `web/public/` and the deployed app. Do not use them as our template thumbnail or customer portfolio. Six new PNGs and one text snapshot belong to this focused walkthrough; the older 106-route page index is a separate earlier checkpoint. Remaining reference work: e-Nimontron interactive follow-up when browser access is available and an independently observed Maps/calendar example.
