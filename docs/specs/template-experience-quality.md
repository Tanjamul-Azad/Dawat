# Template experience, quality gates and edge cases

> **Client V1 update · 20 October 2026:** preserve the current template contract in [design](../../website-design.md): deliberate opening, immediate scroll after tap, max-five-photo reel, named host-supplied guest and optional gesture music. [Current QA](../qa/client-v1-corner-cases.md) extends this register through dashboard/backend; older conflicting timings/open modes are superseded.

19 October 2026 · Latest explicit product priority: **the invitation template is the main selling point**. Supported product languages are **Bangla (`bn`) and English (`en`) only**. This document supplements the [template engine](template-engine.md), [localization contract](localization-content.md), [production budgets](production-engineering.md) and [customer access lifecycle](customer-access-lifecycle.md).

This is a design/implementation contract and risk register. It does not claim every scenario is already handled. Unknowns discovered on real devices or customer content must be added with an owner and acceptance evidence. “Best” is the target, not an untested marketing claim.

## Product priority and evidence

**Latest v6 override:** the user requires a gift-like deliberate opening. Before opening, no chapter navigation, event details, photos or response forms are rendered; a fragment, reduced motion or scroll cannot bypass it. Quiet opening is an explicit accessible action, not an automatic reveal. Hosts provide recipient names; guests never fill their own name. [v6 audit](../build-evidence/personal-opening-v6.md) records 67 passed tests and actual normal/long-name/photo-free/mobile checks. Earlier skip-to-details/auto-open wording below is superseded; mandatory facts remain available after the deliberate opening without further decorative gates.

**Latest audit, v5.1:** the user likes the v5 direction. [Edge-case/mobile evidence](../build-evidence/edge-case-audit-v5-1.md) records 56 passing tests and actual rendered 390/320px opening-to-RSVP, plus landscape, copy, map and calendar-download checks. Browser access is restored. The full matrix below remains a production qualification register; real-device, large-text, exhaustive content-variant, performance and backend gates are still open.

**Latest explicit correction (implemented candidate v5):** the whole guest experience must be the digital card. Do not place a miniature physical-card preview above separate website sections. A full-canvas folio and continuous illustrated stationery composition now replace that structure; [implementation/evidence](../build-evidence/digital-card-v5.md) records 49 passed tests, original ImageGen assets and still-pending browser/phone review. Website and dashboard polish are deferred until this product is finalized. Prior candidate descriptions below are historical context, not permission to revert to the rejected structure.

The catalogue sells a distinctive complete guest experience. Original art direction, Bangla/English typography, opening, photo/no-photo composition, scrolling rhythm and practical usability take priority over adding templates or decorating the dashboard. The storefront demonstrates the real template. The dashboard supports fulfilment and guest management without consuming the visual identity effort intended for the card.

The [Teatro walkthrough](../reference-evidence/guest-preview-walkthrough/README.md) establishes a tap-triggered curtain video, music control, scratch date, countdown, coordinated venue/dress/menu illustrations, framed portrait and conditional RSVP. Maps/calendar were not verified in that demo. These are studied principles, not source assets or a feature-parity requirement. e-Nimontron remains the local service-flow reference; its additional live-template walkthrough is outstanding due to browser access being disabled.

## First-template creative contract

Working direction: **Jamdani Ivory — a letter carried home**. This is one candidate for comparison, not a user-approved final direction. The generated portrait illustration in the current preview is an art study; quality review may refine or replace it.

- Develop one distinctive textile/paper visual language across the full invitation, including inside sections. Every frame should belong to the same wedding stationery family.
- Opening concept: a softly lit woven-paper jacket, recipient greeting and original monogram/seal; on tap, the seal releases and layered paper opens to the names. An original weave/line detail carries into the next section. Avoid reproducing Teatro's curtain scene.
- Make depth believable through a few carefully composed layers, natural easing and original assets. Avoid dozens of floating flowers, glitter and constantly spinning ornaments.
- Typography is the composition: graceful English display type and a deliberately selected Bangla display/body pairing, tested together. Names remain live text. Bangla is a primary language, not a tiny fallback label below the English name.
- Distinct shapes have a purpose: jacket/fold, portrait frame, open text spread, event programme, clear action row. Do not repeat the same rectangular information card for every section.
- Photos, when selected, become part of the composition with owner-controlled crop/focal point. No photos must produce an equally intentional edition using typography, weave, art and whitespace; no empty frame or stock replacement couple.
- Cultural/religious wording and motifs are chosen deliberately. The base template must work with neutral family wording. Do not assume religion, surname, family side, clothing or gender roles from a name.

## Guest storyboard — phone first

| Scene | Intended experience | Functional rule / fallback |
|---|---|---|
| 01 Arrival | Optimized portrait poster/jacket; visible বাংলা / English; named greeting if authorized | Primary text and entry action work while media loads. No third language menu |
| 02 Open | Tap opens the original paper scene; short meaningful movement, roughly 1–2 seconds as an initial design target | Always provide View details/skip. Reduced motion jumps to open state. Media stall never blocks events |
| 03 Names and welcome | Strong name hierarchy, host wording, short personal message and primary date | Flexible lines/layout for real names; no fixed clipping or silently tiny text |
| 04 Date and anticipation | Clear date and an optional countdown integrated with woven dividers | Same selected event instant as events/calendar. Past state replaces countdown; scratch is optional later and cannot conceal essential facts |
| 05 Celebration programme | Each permitted event has its own title, date/year/timezone, venue and address | One event works; multi-day/multi-venue events remain distinct. Missing optional content omits cleanly |
| 06 Find your way | Directions, Copy address, Add to calendar close to the relevant event | Correct per-event map destination, no geolocation requirement. Text address remains useful if map/embed fails |
| 07 A personal glimpse | One feature portrait or an editorial sequence of selected photographs, with matching original frames | Photo-free composition is designed separately. Keep dimensions reserved and later images deferred |
| 08 Useful details | Optional dress guidance/host-selected notes as open editorial sections | Hide absent sections and their nav targets; do not generate filler gifts/travel content |
| 09 Reply | A welcoming, legible RSVP area with the same typography/art language and excellent form clarity | Authorized events/allowances, pending/decline distinction, network feedback, server-confirmed success and private notes |
| 10 Words and closing | Independent private wish and a considered closing/signature | A wish never changes attendance. No dashboard/admin link; sharing offers guest-safe URL only |

Order of optional blocks can be refined by the selected composition. Practical details must be reachable early through a compact Details / Directions / Reply navigation with 44px touch targets. Do not obscure the invitation with a persistent bulky app toolbar. Preserve natural page scroll and avoid blank pinned sections, mandatory scratch, hover-only discovery or camera permission.

## Motion as a coherent system

Storyboard arrival, waiting, opening, completion, skip, repeat-demo, asset failure and reduced-motion states before coding. Choose short transform/opacity transitions that support the composition. Original video may be used only where measured results justify it; semantic text/actions must not depend on video frames. A generated still is not video.

Use section reveals sparingly: content begins readable if JavaScript/observation fails; animate enhancement rather than leaving all text opacity zero. Reveal once when useful. Revisiting a section or editing content must not replay the entire opening or restart music. Tab switching must not launch another timer/audio instance. Stop decorative loops offscreen/when hidden. Do not split Bangla conjuncts into animated letters; reveal the whole word/line/block.

Music starts only after a deliberate guest action and an accepted browser playback request. If rejected, show an explicit Play option; do not show a false playing state. Muted/no-track versions are complete experiences. Speaker control needs an accessible label, visible state and room above mobile browser safe areas. Current demonstration music is not a licensed production asset.

## Two-language contract

Supported application locales and template manifest locale keys are exactly `bn` and `en`. Both are left-to-right. Default new Bangladesh invitations to Bangla, with an explicit English switch. Owners may offer Bangla only, English only or both; the platform still supports only this locale pair. No Hindi/Arabic/Italian/etc. UI variants, inferred translation or extra selector entries.

Locale resolution: valid explicit link selection → valid saved guest preference for this wedding → wedding default → Bangla. An unavailable/unsupported selection falls to the wedding default with usable labels; invalid API locale writes are rejected. Preference never changes tenant/guest authorization. Never let a global language preference expose or merge another guest's data.

UI dictionaries cover navigation, fields, validation, loading/offline/closed/expired/success/error messages, map/calendar actions and accessibility labels. Customer names, event wording and notes are separate content. Names are not machine-translated or transliterated. Do not reject legitimate names solely because of their script; supported UI locale does not define a person's identity.

For bilingual output, require both versions of required custom wording or an explicit owner-reviewed same-text fallback. Optional empty content is omitted; do not leave a half-translated error or empty heading. A single-language invitation should not present a dead second-language switch. Switching keeps the guest at the same scene/event and retains form input, RSVP identity and validation state; do not reload/replay the opening.

Display localized Gregorian dates and local digits through formatters while storage uses stable instants and numeric types. Parse Bengali digits in numeric fields deliberately and validate whole numbers; do not silently turn `২` into zero. Never transform phone/order IDs or guest credentials through number formatting. Locale change cannot change the event instant, attendee count or amount.

## Edge-case acceptance matrix

These scenarios are **pending production qualification** unless their own evidence explicitly says otherwise. Use automated tests for validation/state/security; manual/visual and actual phone checks for composition, shaping, playback and accessibility. Test the shipped behavior, not just a screenshot.

| ID | Case | Required outcome |
|---|---|---|
| TE01 | Very short names / one-letter name | Deliberate balanced type; no placeholder expansion |
| TE02 | Long Bangla names, conjuncts and vowel marks | Correct shaping, breathable line height, intentional wraps; no crop through marks |
| TE03 | Two long names or different-script names | Layout variant grows/reflows before modest bounded size adjustment; no unreadable shrink-to-fit |
| TE04 | Blank names or whitespace-only custom text | Draft remains editable; review/publish points to missing required content |
| TE05 | Quotes, ampersands, punctuation, HTML-like names/notes | Display as safe text, never execute markup or turn names into IDs |
| TE06 | Parents absent, several hosts, alternative relations | Optional labels disappear correctly; flexible host composition |
| TE07 | 200% text/OS scaling or delayed/missing font | Facts/actions remain usable without overlap; font failure does not hide names |
| TE08 | Unsupported locale in URL, storage, manifest or API | Safe display fallback; server/manifest write validation rejects unsupported keys |
| TE09 | Single-language invitation | Only active language/control shown; no dead option |
| TE10 | Missing bilingual required content | Owner review/explicit fallback before publication; no invented translation |
| TE11 | Switch language mid-scroll / mid-RSVP | Maintain position, selected event, entered answers and stable identity |
| TE12 | Bangla numeral inputs, pasted mixed digits | Explicit normalization then whole-number/range validation; no NaN/zero substitution |
| TE13 | Opening repeatedly tapped | One state transition/media instance; no duplicated controls or navigation |
| TE14 | Skip before/during video or paper motion | Immediate same authorized content; abandoned animation cannot cover the page later |
| TE15 | Motion disabled at start or changed while open | Stable open/quiet state; no hidden scenes or mandatory animation |
| TE16 | Slow/offline media or unsupported codec | Attractive poster and View details; core content independent of media completion |
| TE17 | Background app / screen lock / back-forward restore | No sudden replay/audio burst; resume content sensibly and refresh policy when needed |
| TE18 | Audio blocked, no track, corrupt audio or mute | Truthful control state, no error loop; all facts/RSVP still work |
| TE19 | Mobile browser toolbar, safe area, landscape and orientation change | No clipped open/mute/submit controls; stable scroll and reframed art |
| TE20 | Keyboard/screen reader use | Labelled open/skip/music/actions; focus order and no trap; decorative art ignored |
| TE21 | Unsupported animation/observer APIs or script failure | Essential visible text/navigation; native map/calendar links remain where possible; form failure explained truthfully |
| TE22 | Optional scratch/date reveal added later | Keyboard/tap Reveal alternative and skip; essential event date never gated behind scratching |
| TE23 | No photos | Fully designed photo-free composition; no broken image, empty frame or invented couple |
| TE24 | One photo vs five, portrait vs landscape | Intentional sequence, focal crop and preserved dimensions; no stretched faces |
| TE25 | Image fails, removed or processing pending | Chosen art/text fallback; no unpublished/private original leaked |
| TE26 | Large image, EXIF rotation, HEIC/corrupt upload | Processing/type/size feedback; approved derivatives only; preserve user work on rejection |
| TE27 | Late image/font load | Reserved aspect ratios, no large content jump or submit button moving under a tap |
| TE28 | Long caption/alt text or missing caption | Legible optional text; meaningfully described relevant photos, decorative frames ignored |
| TE29 | One event, different dates/venues, reordered events | Stable event IDs and matching date/map/calendar/RSVP; no hardcoded second event |
| TE30 | Past date / date reaches zero | Never negative countdown; correct now/past/thank-you state without changing RSVP policy silently |
| TE31 | Browser timezone/date wrong or guest abroad | Explicit event timezone; server-derived time offset when available; countdown does not claim guaranteed clock accuracy offline |
| TE32 | Overnight event, leap date, end before start | Validate real date/end; calendar preserves timezone and duration; no invalid-date crash |
| TE33 | Missing/long venue, landmark or translated address | Display readable full facts; missing optional map does not suppress address |
| TE34 | Maps blocked, app absent, link fails or embed unavailable | Open browser-safe validated map URL when possible, Copy address + text fallback; no required GPS |
| TE35 | Malformed / script / untrusted map URL | Reject unsafe destination; no arbitrary embed/script; encode approved place/coordinates safely |
| TE36 | Calendar import unsupported or duplicate action | Correct event-scoped ICS/native route with stable UID and current published facts; explain download; no duplicate backend records |
| TE37 | Event renamed/moved after sharing | Current published snapshot/policy coherent; do not mix cached old location with fresh RSVP event IDs |
| TE38 | Household invited only to reception | Unauthorized event absent from guest DTO, HTML, calendar, navigation and map links |
| TE39 | Unknown/expired/revoked/forwarded guest link | Appropriate safe unavailable state; forwarding scope disclosed; no guest list/management leak |
| TE40 | Plus-one zero, max allowance, fractional/negative/over-limit counts | Server validates whole adult/child totals; coherent per-event accepted/declined rules |
| TE41 | Accept → decline → accept | Decline stores zero; UI resets/reuses counts deliberately; current response counted once |
| TE42 | Household only children / no attending adult | Explicit product policy and useful validation; do not accidentally require an adult through misleading labels |
| TE43 | RSVP closed or changes while form open | Revalidate policy on submit; retain answers and explain closure/new limits; no false success |
| TE44 | Double submit / timeout after server commit / retry | Scoped idempotency; confirmed receipt matches actual saved state; no duplicate household |
| TE45 | Offline, 429, expired session or server error | Keep input, explain retry/reverification appropriately; no infinite spinner or fabricated confirmation |
| TE46 | Response edited in another tab/device | Revision handling and stale-state notice; never count response history as new guests |
| TE47 | Independent private wish without attending | Wish saved in the right private wedding scope; zero attendance side effect |
| TE48 | Guest message contains unsafe links/oversized content | Bounded plain text, safe rendering and rate limits; no public private-message list |
| TE49 | Public demo/proof/customized preview reaches RSVP | Read-only/simulation clearly separated from live storage; no real guest response side effect |
| TE50 | Guest requests dashboard/other household/export directly | Server denies private data; locale/theme/query changes cannot elevate permissions |
| TE51 | Pending / confirmed-but-not-activated / revoked client | Bounded own order status; no management API/media/export access |
| TE52 | Draft changes while existing invitation is live | Published theme/content version stable until explicit atomic publish; preview never silently overwrites live |
| TE53 | Package/hosting expires, cancelled/postponed celebration | Honest scoped state, retention/export/support policy; no false date/countdown or silent deletion |
| TE54 | 320/360/390px, tablet/desktop, long translated controls | No horizontal page overflow; practical labels remain readable and touchable |
| TE55 | Older target Android, Safari, WhatsApp/Facebook in-app browser | Test actual supported devices/browser contexts; inline playback, downloads and copy have fallbacks |
| TE56 | Reduced data / slow connection / low memory | Critical poster/text first, responsive art, deferred gallery/audio, limited layers and no eager frame sequence |
| TE57 | Browser storage unavailable/corrupt | Essential viewing still works; local preview storage failures explained without overwriting recoverable content |
| TE58 | Share/link preview crawler visits a personalized URL | Neutral metadata; no household name, secret token, private response or restricted event leaked to social previews |
| TE59 | Theme retired or assets updated | Existing immutable version still renders; new art never overwrites a pinned publication incompatibly |
| TE60 | New template or feature compared only by screenshot | Require complete phone journey and measured behavior; no approved-quality claim from a still alone |

Photo upload/processing, calendar and other capabilities must exist before advertising them as included. Optional Growth scratch, travel, custom RSVP questions, public galleries or real 3D are not made launch requirements solely because Teatro displays them.

## Template quality gate

One finished template is worth more than a catalogue of underdeveloped recolours. Before offering it for sale, record:

1. Original art source/provenance, coherent full-scroll design and approved mobile/desktop storyboards in both languages. No competitor photo, music, frame or illustration in our shipped assets.
2. Inspectable normal/long-name/photo/no-photo/reduced-motion/failed-media states, including real Bangla content and a legible RSVP section. Named greetings remain readable on the cover.
3. Opening/skip, directions/address/calendar, RSVP/edit/retry/closed, wishes and client activation behavior with actual evidence appropriate to the release. No hidden mandatory action to read event details.
4. Real Android/iPhone and in-app-browser checks for the supported device policy. Browser viewport emulation alone does not close this gate.
5. The existing engineering budgets: critical route target ≤1MB compressed, guest JS target ≤200KiB compressed, and measured mobile LCP/INP/CLS. These are proposed budgets until measurement; media exceptions need evidence and an attractive fallback.
6. No unresolved critical usability, privacy, authorization or data-integrity defect. Art polish never excuses an incorrect venue, broken Bangla, hidden required date, lost reply or wrong guest scope.
7. Compare with AI Studio/Figma/Claude using [the scorecard](../design/comparison-scorecard.md), retain strongest original ideas, then obtain the user's direction selection. Do not declare that the current art study is automatically best.

## Current implementation gaps and next sequence

Latest user instruction authorized implementing the first complete template now. The **local v3 frontend** has paper-jacket/seal opening/skip/reduced-motion, complete Bangla/English guest dictionaries/switching, explicit bilingual customer fields, countdown, framed photos/lightbox/no-photo/failure, event maps/address/calendar, RSVP/edit/decline/private wishes and isolated sample storage. Studio photo selection/resizing/reorder/framing and bilingual publication validation are implemented. [Actual checks and limits](../build-evidence/first-template-v3.md): 33 tests/typecheck/build pass; browser rendering, physical phones, image-decoding and external-map behavior remain unverified because browser control is disabled. Publication is blocked by Sites project-not-found; the hosted v2 is unchanged. Wider product localization, all multi-event fixtures, real media/backend/security and the full TE matrix remain outstanding. No current screenshot proves the new animation/layout quality.

Next: visually review/refine the implemented full-template direction on actual target phones → compare other tool results when available → run the remaining matrix → connect backend/access/payment → qualify the same theme for sale. User authorization to build the first template supersedes the earlier instruction to wait for comparison results before implementation. Do not expand dashboard decoration/catalogue while this template needs qualification.
