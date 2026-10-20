# Figma AI / Claude — finalized mobile-first first-template design prompt

> **Scope update · 20 October 2026:** this is the earlier broad comparison brief. Next design work is [Client V1 screens](../../website-design.md): mobile couple dashboard and thin seller activation around the existing premium template; public redesign follows the working delivery flow. Preserve BN/EN, host-created names, sealed opening and immediate after-tap scrolling. Current plan/design override conflicting older phase assumptions.

Finalized 19 October 2026 with the latest confirmed-order/access and mobile-first requirements. Copy the self-contained brief below into Figma AI, Figma Make, or a Claude design workflow. Ask for editable Figma frames/components when available; an inspectable code prototype is an acceptable alternative. A design tool is not being asked to deploy a production database or verify real payments.

Use [the AI Studio build prompt](google-ai-studio-build.md) for a functional engineering variant. Both describe one product and one design contract. Read [design roadmap](../design/design-roadmap.md) and [personalization](../specs/personalized-invitations.md) when working inside this repository.

---

## Copy from here

**20October compact/music refinement:** design a precise0-inset standalone invitation, reduce excessive cover/chapter/footer whitespace while allowing long names/content to grow, and put paper backing behind date/location over busy artwork. Add an independent44px music control with paused/loading/playing/error states: in its reserved header slot near the cover, floating only after leaving the cover. No language-button overlap or layout jump on return. Classical accompaniment must start from an explicit gesture, with pause/retry, background behavior and an unobtrusive expandable attribution. Motion controls remain separate.

**Newest20October gallery/opening override:** keep the invitation sealed before a deliberate tap. After that tap, immediately allow scrolling as the short decorative reveal finishes, with a stable cover frame. Design0–5photos as one arched photo mount, numbered thumbnail strip, side arrows/swipe and full-size view;5s autoplay must pause for reduced/global motion, offscreen/background, focus/hover, manual/touch interaction and lightbox. Single/no-photo states must feel intentional. Use restrained sage/blush/wine chapter colours and contrast/background/weight to highlight dates, recipient identity and key phrases; preserve readable text during short motion.

**Guest voice and qualification:** the senders are the couple and their families; never add an invented “Invitation by Dawat” credit or a shop link to their closing. Personal wishes are addressed to the couple by their live localized names. Their guest's identity is already supplied by the personal link. Keep the attendance note about visit arrangements distinct from keepsake wishes. Show sealed loading, resolved named cover, opening and open-card states without leaking inner content or shifting the paper frame. Qualify on physical Android/iPhone as well as viewport checks; retain Bengali shaping and readable type when reducing asset cost.

### Latest product decisions — override conflicting entry/guest rules below

Prioritize the invitation product, not a storefront/dashboard redesign. Design a personal digital gift: a sealed recipient-addressed cover, an explicit opening, then one continuous crafted invitation. No inner chapters/navigation/forms may appear before opening; scrolling, hashes or reduced motion cannot bypass it. Provide an explicit quiet opening/finish control with usable focus states. Hosts supply each recipient/family name and greeting; the named guest never types their own identity for RSVP or wishes. General share links are view-only. Seller/admin provisions a separate activated customer/wedding workspace for each confirmed order; hosts customize their card and create personal guest links from their own space. Include closed/opening/open states, the couple as sender, named reply leaf, long Bangla names, a deliberate photo-free composition, one/multiple-event responses, validation/retry/receipt and mobile content reflow. Keep the liked continuous Jamdani art direction with original wine/ivory/brass composition, restrained motion and language-specific typography. Reference Pinterest gift/stationery ideas with exact links/access limits; no copied reference assets or claims that blocked video interactions were viewed. Backend tenancy/security must be marked as implementation work, not simulated by design frames.

Act as a senior product designer and design engineer for an original commercial Bangladesh-first digital wedding invitation platform. Produce a coherent high-fidelity responsive product design, reusable component/token system and interactive prototype that an engineer can build. This will serve paying real families, not a student project. Premium, festive and usable are all required. Do not stop after generating a generic homepage/dashboard concept.

The user particularly likes the organization, typography and polish of their existing Figma Make project: https://www.figma.com/make/p8VJl12iS1deEahSUNhLfw/Digital-Wedding-Invitation-Platform. If its exported source is attached, study its Fraunces/Instrument Sans and Noto Serif Bengali/Hind Siliguri pairing, ivory/wine/forest surfaces, thin rules, layered envelope/arch stationery, mobile form/preview toggle and practical workspace tabs. Refine this concrete preferred product-UI direction into one coherent system, with TDY still the primary guest-experience inspiration. Do not claim link access or a rendered review without evidence. Brand choice and the complete guest opening remain design decisions; fixed sample totals, live-reading-draft publication and simulated authentication are implementation gaps rather than behavior to preserve.

If operating in Figma, create editable named frames/components/variants/variables with Auto Layout and interaction notes. If operating in Claude without Figma access, deliver an inspectable runnable responsive prototype and structured token/component/handoff files; do not claim a Figma file exists. If operating in Figma Make, scope data/actions to explicitly labelled fictional prototype state. No real accounts, database, payment credentials, messaging or deployment is needed for this design assignment. Do not fabricate those integrations or request secrets in the design canvas.

### Highest design priority: the complete invitation template

Latest execution correction: finalize the invitation product first; broader website polish comes later. The complete phone canvas should BE the digital invitation, with continuous art, paper/edge language and typography through opening, live names/date, events, photography and response leaf. Do not put a physical-card mockup above unrelated website detail sections. Use live editable text over original art; keep essential dates/venues/actions accessible without media or decorative reveals. Our current implemented candidate is a full-canvas woven folio/garden composition with natural scroll and optional date ribbon; refine it through rendered review rather than declaring it final from code or a cover image alone.

The template is our main selling point. Put the strongest original art direction, typography, motion and mobile composition into the guest invitation from arrival to closing. The storefront should demonstrate that actual template; the dashboard supports it. One beautiful cover with generic inside cards is not an acceptable flagship. Develop one fully considered composition before making a large collection or expanding dashboard ornament.

**Language scope is exactly Bangla (`bn`) and English (`en`)**, across storefront, editor/preview, order, client/guest/admin UI, errors/status and accessibility labels. Default new Bangladesh invitations to Bangla; owners can offer either or both, with no dead switch for a disabled language. No third-language or RTL UI. Names stay live shaped text, never auto-translated or transliterated. Bilingual required wording is complete or uses an explicit owner-reviewed same-text fallback. Switching language preserves scene, scroll, form answers and event/guest identity and never replays the opening. Show long Bangla/conjunct and English specimens, including local digit inputs, without tiny shrink-to-fit text.

Observed Teatro reference: https://www.thedigitalyes.com/demo/teatro and https://template-teatro.thedigitalyes.com/?embed=1 demonstrate a tap-driven curtain video, music control, scratch-date tokens, countdown, coordinated venue/menu/dress illustrations, framed couple photograph and conditional RSVP. Its specific Maps/calendar and backend submission were not verified by that walkthrough. Learn coordinated scene rhythm; do not copy its distinctive curtain scene, art, music or photos. Our original template must include working per-event directions/calendar with text-address fallback when implemented.

Candidate original storyboard, subject to user comparison: woven-paper jacket with recipient greeting → seal releases and layered paper opens → graceful names/hosts/message → date/countdown with original textile divider → celebration programme with per-event directions/copy address/calendar → editorial framed portrait/sequence or a separately designed photo-free composition → optional useful notes → welcoming RSVP/private wish → signature/closing. Carry one coherent visual language through all ten scenes. Prepare keyframes for waiting/opening/completion/skip/asset failure/reduced motion. A short approximately 1–2 second opening is an initial target; details remain directly reachable. Use meaningful shapes, original art and typographic rhythm rather than repeated generic rounded boxes. Music is optional and guest-controlled; content never depends on a video frame or scratch gesture.

Deliver component/state variants for: short/long/mixed-script names; Bangla conjuncts; several/no hosts; 200% text and fallback font; single/bilingual wording and missing translation; mid-form language switch; no/one/five portrait/landscape photos; crop and failed/pending media; slow network and silent/reduced-motion version; skip/repeated tap/back-forward/background restore; small phone safe areas/orientation; keyboard/screen-reader; one/multi-day/overnight/past events; long address/missing map and unavailable Maps app; event-specific calendar; reception-only household; over-limit/fractional/Bangla-digit counts; accept/decline/closed/offline/retry/concurrent response states; independent wish; invalid/forwarded/revoked guest link; read-only preview; unconfirmed/inactive/wrong client; draft/live divergence and neutral share metadata. Label backend enforcement as a specification if unavailable; do not claim visual states prove server security.

Show a genuinely complete phone scroll sequence, motion storyboard and touch prototype in both languages, then desktop adaptation. Review template art/typography/composition, practical usability, media/performance fallbacks and production feasibility as separate evidence. The current implementation or this tool's first result is not automatically approved or “best.” Record unresolved cases and compare alternatives before selecting a direction.

### Business/access journey

The public website sells invitations: catalogue → template/demo → limited customized preview → package/order/payment → bounded own order status/support. A buyer does not get the customer dashboard, guest management, response lists, personalized-link generation, exports or publishing tools before order confirmation and operator activation.

Default paid workflow: provider verifies payment → business operator confirms order → operator activates the assigned customer's dashboard access → business sends a dedicated private entry link → customer verifies identity/session → active scoped wedding workspace. Login, order submitted, verified payment, order confirmation, dashboard activation and invitation publication are different states. A provisional wedding/customer ID or browser success animation cannot unlock management. No public “unlock dashboard” button.

Before activation show bounded order status, not an early client dashboard shell. After activation the customer may see “Preparing your invitation” before the guest card is live. A guest receives a separate invitation link and never owner/admin controls. Design unauthenticated, wrong-customer, unconfirmed, confirmed-but-inactive, active and revoked access states. Internal activation may be simulated only in a clearly labelled operator prototype, not advertised as real security.

All compared AI Studio, Figma/Claude and alternate implementations use this same brief. No first-produced version is automatically the preferred visual design.

### Product you are designing

A desi wedding invitation studio for Bangladesh and diaspora users. Main experience-quality reference The Digital Yes; e-Nimontron informs local invitation/RSVP/client-delivery behavior. Dribbble and Pinterest are required visual-inspiration sources. This is our original brand/design, not a clone.

Four surfaces:

- Public storefront: editorial stationery atelier, curated original themes, demos and clear offer.
- Activated client maker/workspace: available only after operator-confirmed order and explicit access activation; separate from the limited public customization preview.
- Guest card: intimate ceremonial invitation opening followed by readable event information and easy RSVP/private wishes.
- Protected operator/admin: understated accurate support states; design a compact operational concept only after primary flows are resolved, not a planner expansion.

One wedding base card can produce personalized guest/family links. A recipient sees their name, greeting, optional short message, permitted events and party allowance. This is an overlay, not another bespoke website or new artwork per guest. General shareable link also exists. Client management link is separate and requires owner sign-in in production. Design the distinction unmistakably.

### Reference research and originality

Study these where accessible and explain the principle learned, not copied pixels:

The Digital Yes is the **main inspiration website**. Dribbble supplies UI composition/hierarchy/editor/dashboard principles; Pinterest supplies stationery proportions, paper/envelope depth, original textile/botanical/architectural ideas. Curate an annotated source URL/creator → principle → original interpretation → target surface → rights/provenance table. Disclose unavailable pages. Pinterest is not a licence grant and a popular shot is not tested UX.

Use **ChatGPT ImageGen** where appropriate for original mobile portrait artwork, high-quality hero stills, transparent decorative layers and mood/storyboard frames. Do not use a generated image as the functioning website or bake customer names/dates/buttons into it. If generation is unavailable, provide exact asset briefs and identify the gap; do not quietly replace refined illustration with crude shapes. Original art must remain coherent across template, public site and client workspace. Do not copy competitor whole scenes, assets, code, photos, branding or wording.

- https://www.thedigitalyes.com/ — emotional invitation presentation and polished curated demos.
- https://www.e-nimontron.com/ — local catalogue → customize → preview/order and guest response/client context, not our final sparse-dashboard style.
- https://dribbble.com/shots/26302401-Papelaire-Invitation-Builder — maker/tool hierarchy and contextual preview.
- https://dribbble.com/shots/18362061-Wedding-Invitation-Dashboard — wedding identity and response hierarchy.
- https://dribbble.com/shots/25792154-A-Digital-Wedding-Invitation-UX-UI-Case-Study — ceremonial experience versus practical navigation.
- https://dribbble.com/shots/26230680--Wedding-Planner-Dashboard-UI — polished workspace atmosphere only; planner features are outside scope.
- https://uk.pinterest.com/pin/75998312461219649/ — layered envelope/paper stationery relationship.
- https://uk.pinterest.com/pin/oh-blythe-design--461830136808260226/ — botanical liner, whitespace and primary text hierarchy.

If access is unavailable, say so and work from the given principles; do not claim an unseen pin was inspected. Curate a bounded explained reference set across editorial UI, maker/client workspace, desi stationery/art and opening motion. Record source/creator where known, the principle and how our own direction differs. Online screenshots/pins are study references, never automatically licensed assets. Do not extract competitor illustrations/fonts/music/code, trace distinctive full scenes or paste screenshots into production cards. Use original art and record provenance/commercial-rights requirements.

### Art direction and visual standard

Develop one original **Bengali wedding atelier** direction: warm textured ivory, carefully balanced deep wine/forest/ink accents, outstanding display typography, readable Bangla/UI text, original Jamdani-inspired geometric/floral weave, paper depth, considered whitespace and physical stationery craft. This direction is a brief to explore, not permission to flood every surface with one beige background. Show palette/type/art specimens and composition before expanding screens.

The guest invitation is a celebrated experience: opening scene, named welcome, strong names/date hierarchy, exquisite event treatments and a graceful close. The storefront should display the actual original invitation scene with editorial composition. The owner workspace should feel like the same studio, with crisp usable information and selective brand/art details. Do not use elaborate texture behind tables/forms or make decorative animation obscure the controls.

No generic AI aesthetic: no default purple gradient, copy-pasted SaaS hero, random blobs, identical rounded bento grids, stock admin kit, fake ratings/testimonials/logo wall, decorative charts, dozens of pills or meaningless floating mockups. Do not replace art direction with heavy drop shadows/glassmorphism/confetti. Custom components and layouts are expected. Reusable primitives can underpin the design without dictating its appearance.

Typography must handle English/Bangla equally well. Choose available/licensable font-role pairings, document actual Bangla fallback/shaping and avoid per-character animation or letter spacing that breaks conjuncts. Names remain live text, not baked imagery. Use line breaks/wrapping/layout intelligence rather than making long Bengali names tiny. Optional religious wording is user-selected and reviewed; no cultural/religious motif is imposed on all customers.

### First invitation and original template system

Build high-fidelity **Jamdani Ivory** first: original woven-paper envelope, layered ivory stationery, restrained seal, fine weave motif, elegant names and intentional opening/reveal. The composition must remain beautiful without couple photos. Show cover closed, opening midpoint, open intro, content/events, RSVP and closing.

Other theme concepts remain future roadmap work. This delivery focuses on one fully designed original Jamdani Ivory template and its complete public-order/activation/client/guest journey. Do not create a second-theme study or fake catalogue merely to inflate deliverables; later themes must eventually have distinct compositions, not palette swaps.

Each template uses a versioned theme manifest, original layered art, tokens, bounded layout slots and opening storyboard; shared behavior blocks render couple/hosts/events/maps/calendar/gallery/audio/RSVP/wishes. Theme design changes presentation, not its own payment/response logic. Named greetings/short message appear as shaped HTML text in opening/header; events depend on authorized household scope. Never invent arbitrary per-user CSS/canvas editing as launch scope.

Per-template design handoff: mobile/desktop composition, art layers/source IDs, optimized asset roles/dimensions, type/palette tokens, motion timing/skip/reduced-motion storyboard, no-photo/long-name fixture, supported blocks and empty/failure states. Production needs documented commercial rights and pinned versions; existing paid cards cannot silently change when artwork is updated.

### Product flows to map before screens

1. Visitor → catalogue → real first-theme demo → public customized preview → review/order/payment → bounded pending/order status.
2. Operator verifies/confirms order → activates assigned client's access → delivers dedicated entry link → verified client enters preparation/live workspace; no early dashboard access.
3. Activated client → guest/family → greeting/message → event/allowance → scoped preview → create/copy guest link → user-initiated share when invitation is ready/published.
4. Guest → general or named invitation → opening/skip → permitted event details → accept/decline/counts → confirmation → own response edit.
5. Owner → event responses → accepted/declined/pending/counts → detail/private notes → audited correction/phone reply → refreshed total/export.

Map public buyer, activated client, guest and operator boundaries. Keep draft, live, payment, order confirmation, dashboard grant, assistance fulfilment, hosting expiry and RSVP closure separate. Successful animation is not payment/save/RSVP proof. Mark prototype transitions simulated. Start with one fully considered template; no fake multi-template inventory. Extra themes, bulk messaging, planner, 3D, photo wishes/Memory Book, Maybe, domains, per-person artwork/PDF and imports/collaborators are later scope.

### Required high-fidelity screen set

**Mobile is the main product, not a secondary layout:** compose 390px first, validate 360/320px, then adapt tablet/1440px desktop intentionally. Most customers/guests use phones. Design invitation crop/name wraps, one-hand touch actions, form/preview switch, order summary and readable response rows first. Use 44px+ targets/readable labels, no squeezed desktop sidebars/tables, clipped CTA, horizontal form overflow, hover-only or mouse-dependent actions.

Vary framing deliberately: portrait stationery, layered envelopes, arches/curves where appropriate, full-width art, editorial/open sections and useful compact lists. Do not turn everything into the same square/rounded panel. Conventional inputs can remain rectangular; purposeful hierarchy matters more than novelty. Choose expressive licensed display typography plus excellent Bangla/Latin body/UI type, not generic framework fonts on every surface. Keep names live/shaped, never in a generated bitmap.

### Optional video hero / touch-scroll concept

Explore a strong lightweight still/layered-art hero versus an optional short original/licensed video. Recommend based on mobile crop, clarity and cost, not novelty. Video needs mobile/desktop framing, attractive poster-first loading, reserved ratio, semantic title/CTA independent of playback, muted/pause control and failed-playback/reduced-motion/data-saving fallback where detectable. Do not block shopping on media download or autoplay audio.

If a scroll-linked video/paper scene adds value, storyboard it for ordinary vertical touch and desktop scrolling, with essential text outside media and a static/linear fallback. No scroll hijacking, mouse-wheel dependency, forced speed, long pinned dead zones, hundreds of eager frames or heavy always-on parallax. Cursor effects are optional desktop enhancements only. ImageGen supplies still art/storyboard frames; actual video requires a supported animation/video workflow and rights/source assets. Never label an image a working movie.

### Screen details

**A. Storefront home:** original invitation hero with focused editorial headline/CTA, real first-theme preview, curated theme discovery, concise process, guests/personalization benefits, transparent package/assistance space and FAQ/footer. No fake customer metrics or final pricing. Use an obvious working brand label that can later be replaced.

**B. Catalogue/product:** one genuine available design, art/capabilities/term, photo-free example, real demo/restart/customize/order. Include search/filters when actual inventory warrants them, not as decoration on one item. No fake purchasable designs or dead controls. Preserve context on return.

**C. Public customization / private maker:** mobile form/preview toggle first; desktop contextual form/preview. Public preview includes supported names/hosts/message/events/photos/style and Order, without guest/response/publish controls. Activated client maker adds RSVP settings and permitted edits/republish. Share components/renderer while separating capabilities/navigation. Preserve form data and actual save/failure states, long Bangla and explicit locale fallback. Opening must not restart with each keystroke.

**D. Personalization/guests:** guest/family list with add/search/pagination; edit dialog/panel with name, optional private contact, localized greeting override, optional short plain-text message (500 Unicode characters/locale proposed limit), event selection and maximum people per event. Label host message as visible on the guest invitation. A preview shows just that family's greeting/events/allowance, labelled preview with no real submission. Copy existing URL is distinct from explicit replace/revoke. Provide forwarded-link explanation without an intimidating wall of text.

**E. Share:** three clearly named areas General invitation / Personalized guest invitations / Private client dashboard. Correct copy success/failure/manual fallback, user-reviewed WhatsApp composition, QR if supported, live-only guest link and draft preview alternative. Never accidentally share management URL. Copy preserves old guest URL; replacement warning says prior URL stops working while response history stays.

**F. Guest invitation:** cover/opening, named/unnamed welcome, couple/hosts, invitation wording, one/three-event layout with full dates/year/timezone/venue, map/calendar, countdown/past state, photo/no-photo gallery, optional music gesture/mute, per-event RSVP/private note, independent text wish and closing. Media failure/reduced motion still produces a complete invitation. Public metadata must be generic and not include household name/restricted venue.

**G. Client overview/responses, after confirmation/activation:** verify identity/grant first; show preparing/live/expired wedding state, View/Share only when ready, event selector, refresh, accepted/declined/pending household numbers versus adults/children people. Include useful list/detail/private notes and permitted correction/export/guest/policy controls with readable mobile rows. Unconfirmed or inactive buyers get order status/access-not-active, never private counts or management shell. No decorative analytics or planner tasks.

For fictional Reception data, one coherent example is 100 invited households, 60 accepted/15 declined/25 pending, 132 adults +16 children =148 expected attendees. Mark sample data. Do not call responses “people”; don't add event attendance across Holud/Nikah/Reception and label unique guests. General/open link cannot know who never replied; Pending unavailable unless there is a known invited guest list. Maybe and Pending are different; Maybe not launch scope. Empty response UI has no invented statistics.

**H. Order/access/settings:** public order review/contact/package/payment/status, awaiting operator confirmation, confirmed-but-inactive and private-link delivery; separate internal operator verify/confirm/activate states. Public checkout cannot self-activate a dashboard. Active client settings handle permitted lifecycle changes only after authorization. Simulations are labelled. Include OTP/session/denied/expired flows and safe return, not a fake password/security system.

### States and system contract reflected in UX

Save: clean → dirty → saving → saved; failure → retry; concurrent edit → review conflict, never silent overwrite. Device-local prototype says “Saved on this device.” Real saved status needs confirmed server response.

RSVP: untouched differs from decline. Accept needs adults+children ≥1 and fits event allowance; decline is zero. Adults includes respondent. Each allowed event answered separately. Preserve values on network/policy error; confirm only after actual save. One current answer/event/household, not every submit click. Receipt editing and deadline. Wish submission changes no attendance, and matching names do not merge identities. Private notes only owner/submitting scope, never a public guest list.

Link lifecycle: original household URL can be recopied through authorized server recovery, not silent rotation. Explicit revoke/replace invalidates previous bearer access but preserves responses. Forwarding a household URL grants that household's scope; no claim of verified person identity. Production stores hash plus authenticated encrypted token under dedicated versioned server key; no need to expose cryptography to customers. Missing recovery/decryption has safe support/retry or explicit replacement, not unexplained link change.

Privacy: client auth/session + confirmed order + active operator-controlled grant required for dashboard even with known URL, matching buyer ID or membership. Gate all management API/data/storage/export operations too. Guest only receives allowed published events/greeting/allowance server-side; generic metadata excludes personal/restricted details. Public customized preview is a bounded shopping surface. Draft/live share a renderer but publication is explicit/pinned. Design cannot prove backend guarantees.

### Components, tokens and handoff

Use a small purposeful token system: semantic surface/text/border/accent/status colors, display/body/UI type roles with Bangla variants, responsive type scales, spacing/layout grid, radius hierarchy, paper depth/shadow, focus and motion. Show when each surface/component uses them. Avoid arbitrary one-off styling in every frame.

Components/variants include header/navigation/language, editorial theme tile, original invitation stage/envelope, event card, name/greeting block, map/calendar actions, media controls, tabs/step navigation, labelled inputs/select/date/event row, photo uploader, save indicator, inline error/status, dialog/drawer, button/link/loading/disabled, guest list/response row/mobile card, attendance/count summary, filter/search/pagination, clipboard/share feedback, toast/empty/error/retry and confirmation. Reuse semantic controls, not identical visual layout everywhere. Layout with content length constraints, variable text, no-photo and empty states.

Include component states default/hover/focus/pressed/loading/disabled/error/success where meaningful. Dialogs trap/restore focus, forms have persistent labels/helper/error links, status updates are screen-reader friendly and not color-only. Aim at WCAG-aligned contrast/keyboard structure and generous touch targets. Show long Bangla names/conjuncts and 200% text/mobile reflow, not only short English headings.

Motion: storyboard original opening with roughly 1.2–2 seconds initial target, immediate Skip/read details, reduced-motion still/fade alternative and poster before assets. Micro feedback about 120–220ms. No autoplay audio, scroll hijacking or endless decorative loops competing with RSVP. Layout keeps useful content available if art fails. Prefer CSS/SVG/selective Motion, no heavy 3D requirement.

Architecture handoff targets Next.js App Router/React/TypeScript strict, Tailwind 4/CSS tokens, accessible behavior primitives, RHF/Zod/next-intl and shared versioned renderer/theme manifests. Production backend is Supabase/Postgres/Auth/Storage, verified SSLCOMMERZ/Resend adapters and durable jobs. Figma does not implement these services. Document action input/output/loading/error/auth/persistence dependencies for the engineer; don't fabricate backend screens as tested behavior. Keep controls clean and compact, no unnecessary abstractions or thousands of duplicate components.

Initial engineering constraints for design: selected theme only, target critical guest transfer ≤1MB and JS ≤200KiB, defer gallery/audio, reserve image dimensions, optimize licensed fonts and avoid huge looping video/WebGL for primary access. Real mobile Web Vitals/device evidence required later; design prototype is not a production certification.

### Content fixtures

Fictional couple Mehrin and Arib / মেহরিন ও আরিব; household Rahman Family / রহমান পরিবার. Fictional Dhaka venues marked sample, future dates with explicit year and Asia/Dhaka interpretation. Three distinct event dates/venues. Original working copy: “দাওয়াত হোক আপনাদের গল্পের মতো।” / “An invitation that feels like your celebration.”; “থিম দেখুন”; “আমন্ত্রণ খুলুন”; “সরাসরি বিস্তারিত দেখুন”; “প্রিয় রহমান পরিবার,”. Do not copy reference customer/review names/photos.

Stress fixtures: no photo/music, long Bangla host/couple/household names, mixed-language names, one/three events, long venue/address, restricted household, allowance one/five, accepted/declined/no reply, RSVP closed/policy changed, invalid/revoked/expired invitation, dirty/offline/conflict save, empty response list, stale refresh, pending payment and missing decoration. Each should remain legible and intentional.

### Deliverable and acceptance

Deliver in this order: concise user journey/system-state map; curated reference principles with originality notes; developed palette/type/art direction; named mobile/desktop frames and reusable components/tokens; first-theme opening and key create/personalize/share/respond/client-result interactive paths; engineering handoff with data/privacy/state dependencies; screenshots/stress-state review and remaining decisions.

Evaluate the result: does it look like a distinct desi wedding product rather than generic SaaS? Is the card itself memorable and functional? Do maker and host workspace carry the same polished brand? Can a Bangla-speaking family use it on a phone? Can engineers identify what is live/local/simulated and build secure functionality without guessing? Does every visible action have a clear destination/state? Are first-theme art and motion original with editable sources?

Do not declare production readiness, real payment processing, real tenant security, live message delivery or all six qualified templates from a visual prototype. Provide exact artifacts and known limitations. The first delivery should be a coherent premium first-theme product design with actual inspectable interactions, not a collage of unrelated inspiration shots.

## End of copyable prompt
