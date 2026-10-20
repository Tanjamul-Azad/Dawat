# Task tracker

Updated: 19 October 2026. `[x]` means completed with evidence; `[ ]` means outstanding. **The first browser-local visual slice exists; production gates remain outstanding.** Milestones follow `plan.md`; detailed acceptance is in `docs/specs/qa-release.md`.

## First browser design slice — separate from production acceptance

- [x] B22 — Compact cover/chapter/closing spacing; isolate invitation main, verify top0/no green strip in current live build; add licensed Canon in D excerpt with gesture-only playback, accessible persistent pause/retry/credits, visibility cleanup and MP3 MIME/range support.82tests/typecheck/format/export pass. Rendered320/390px BN and1024px EN, gallery/manual next and actual audio playback/pause/resume checked. `docs/build-evidence/compact-music-v6-4.md`.

- [x] B20 — Implement max5-photo slideshow stage/thumbnails/arrows/swipe with motion/visibility/focus/manual pause safeguards; coloured chapters, highlighted facts/guest identity; immediate post-tap scrolling and stable cover frame.77tests/typecheck/export pass. `docs/build-evidence/gallery-colour-v6-3.md`.
- [ ] B21 — Render-review new gallery/palette at320/390px and desktop, then repeat relevant performance/device checks. User can see the local page; browser automation is limited to an old blocked error tab, so no fresh visual pass/screenshots are claimed.

- [x] B18 — Remove fictional invitation-provider signature, address wishes to the couple, preserve named guest flow; measure/optimize cold mobile navigation (Performance91, 544KiB BN/439KiB EN, ~190KiB scripts), capture actual desktop mobile-viewport interactions, pass70 tests/typecheck/export. Evidence: `docs/build-evidence/template-qualification-v6-1.md`. Lab LCP3.46s misses2.5s; field INP and physical sign-off are not passed.
- [ ] B19 — Complete the prepared Android Chrome + iPhone Safari physical-device run, collect device/browser details and downloaded timing reports, resolve observed issues and remaining LCP target. User confirmed both phones; private-network invitation-only preview is running and reachability has been requested. See `docs/qa/physical-phone-v6-1.md`. B12 remains open until remaining physical/content qualification is evidenced.

- [x] B01 — Implement original storefront/collection, Jamdani cover/envelope and studio/workspace layouts in `web/`; palette studies labelled honestly.
- [x] B02 — Implement browser-persisted editor draft versus explicitly updated guest demo, with named household greeting/message/event allowance and scoped preview.
- [x] B03 — Exercise reception-only personalized RSVP and independent wishes through the UI; correct people/reply totals observed without duplicate household.
- [x] B04 — Pass 7 domain tests, strict typecheck, source-format check and exported production build; inspect mobile/desktop and correct observed overflow; see build handoff.
- [x] B05 — Owner-private preview deployed successfully; URL/version/source SHA and screenshots recorded in build handoff. This is a browser sandbox, not a public paid launch.
- [x] B06 — Align prompts and canonical specs with public shopping/order versus confirmed-and-activated client access; retain one-template-first scope and comparison decision.
- [x] B07 — Upgrade our comparison prototype with original ImageGen artwork, mobile live-preview dialog, order status, operator confirm/activate/revoke simulation, locked/empty/preparing dashboard and read-only public previews.
- [x] B08 — Verify 10 domain tests, strict typecheck, format/build; exercise activation/publication/household RSVP/wish/revocation through browser UI and deploy exact source `946de0e5b6d5e50ea406774edd0db3032d57c2ff`. Evidence in build handoff; production gates remain open.
- [x] B09 — Implement the authorized full first-template frontend locally: paper opening/skip/reduced-motion, Bangla/English, countdown, photos/lightbox/no-photo, maps/calendar, RSVP/edit/wishes, bilingual studio fields/photo tools and isolated public demo responses.
- [x] B10 — Pass 33 domain/simulated-DOM tests, strict typecheck, formatting, optimized export, static HTTP smoke and dependency audit; see first-template-v3 handoff. These checks do not establish actual visual/device or production security quality.
- [ ] B11 — Restore access to the existing Site, synchronize exact local source and deploy this v3 without creating a replacement Site or changing its audience. Current connector returns project-not-found.
- [ ] B12 — Complete new-template physical-device, large-text, content-variant and performance QA. Browser access restored; rendered mobile journey completed in B16. These remaining checks are not closed by viewport emulation.
- [x] B13 — Implement source-audited mobile guest polish: staged paper/seal, chapter navigation/focus, readable full-width event layout, gallery gestures, RSVP feedback; pass 38 tests, strict typing and optimized export. Actual mobile visual walkthrough remains B12, not passed.
- [x] B14 — Implement explicitly authorized Figma presentation adoption in our Next app: four-family self-hosted typography, rebuilt public layout/Bangla-English, practical maker and horizontal-tab workspace, shared woven envelope/premium invitation closing; preserve domain logic and pass 43 tests, formatting, typechecked optimized export and static route smoke checks. Evidence: `docs/build-evidence/figma-ui-adoption-v4.md`. Visual/device qualification remains B12.
- [x] B15 — Rebuild the invitation as a continuous illustrated digital card, per the user's correction: full-canvas folio, new ImageGen garden/vine, ribbon date reveal, coordinated chapters/reply leaf, motion controls and retained host/guest semantics; 49 tests/typechecked export pass. Evidence: `docs/build-evidence/digital-card-v5.md`. This does not close B12 or final design approval.
- [x] B16 — Audit edge cases, fix per-event RSVP draft loss/deadline/stale policy/removed household/direct fragment/blank wish issues, then exercise actual 390px and 320px mobile opening-to-RSVP plus landscape, Maps/copy/calendar download, error/retry/edit. Correct observed RSVP label stacking, lightbox letterboxing and cover composition/contrast. 56 tests and typechecked export pass; evidence: `docs/build-evidence/edge-case-audit-v5-1.md`. Physical phones and production remain open.
- [x] B17 — Implement the user's corrected sealed personal template: deliberate opening before any inner chapter renders, host-addressed recipient/couple cover, no guest name forms, view-only general link, stable guest identity and minor owner editing glue. Refine delayed navigation, colours, photo-change states, single-event reply and repeated-wish handling; research Pinterest/gift references with access limits recorded. 67 tests/typechecked export and actual 390/320px normal/long-name/no-photo/reception-only/RSVP checks pass. Evidence: `docs/build-evidence/personal-opening-v6.md`. Real-device/performance/backend gates remain open; storefront/multi-order expansion deferred.

- [ ] A01 — Implement production confirmed-order/dashboard-grant lifecycle with staff-only idempotent confirmation/activation/delivery, correct-account API/RLS/storage/export enforcement, revocation and negative tests. The local gate does not satisfy this.
- [ ] P07 — Compare the implemented first-template direction with returned AI Studio/Figma/Claude results when available; user selects final art direction. The latest explicit request authorizes this first-template implementation without waiting for comparison.

## Research and handoff

- [x] D10 — Inspect the user-supplied Figma export source and preserve its preferred typography/layout direction, component inventory, functional gaps and adoption plan in `docs/design/figma-source-review.md`. No rendered Figma comparison or wholesale migration claimed.

- [x] D08 — Open actual TDY Teatro preview and inspect tap/video opening, music pause, natural scroll, scratch date, countdown, illustrations/framed photo and conditional RSVP; preserve six screenshots/text and document Maps/backend/e-Nimontron follow-up limits.
- [x] D09 — Record template as main selling point, restrict locale scope to Bangla/English only, align canonical specs/prompts and write TE01–TE60 risk/acceptance matrix. This completes specification work, not implementation/tests.
- [ ] QG01 — Select and design the full original first-template storyboard in both languages, including no-photo/long-name/skip/reduced-motion/failed-media states; compare alternatives before treating art as approved.
- [ ] QG02 — Implement complete `bn`/`en` dictionaries/content validation, locale switching preserving form/scene/identity and Bangla numeral input handling; remove third-language assumptions.
- [ ] QG03 — Build the selected opening/inside/photo/no-photo template experience with shared guest widgets; qualify TE01–TE60 as applicable on real supported phones and in-app browsers; record failures/remaining unknowns.
- [ ] QG04 — Finish the e-Nimontron interactive-template follow-up and observe an actual Maps/calendar reference when browser control is available; do not infer those actions from catalogue wording.

- [x] D01 — Preserve first-pass audit, catalogue, feature comparison and blueprint.
- [x] D02 — Revisit public storefront, customization, preview, checkout configuration and portal boundary.
- [x] D03 — Save 88 public product/template page text snapshots and selected screen evidence.
- [x] D04 — Inspect public planner Summary, Budget, Guests, Tasks, Binder, Families, Tables and Catering views.
- [x] D05 — Finish and validate all detailed handoff documents, cross-links and snapshot index; 23 Markdown files, 106 indexed routes, 22 selected screenshots and 100 unique task IDs checked.
- [x] D06 — Review/archive user-supplied 22.47s vendor dashboard video, sample 22 frames, distinguish recorded controls from untested actions, and document BDT 600/unlimited-invitation quote and ambiguity; see video-review spec.
- [x] D07 — Update commercial premium/design/personalization/production contracts and detailed reusable AI Studio and Figma AI/Claude prompts; local links/code fences in 35 Markdown files and task/scenario ID uniqueness verified. This completes planning artifacts only, not high-fidelity/app/production gates.

## M−1 — premium design and product/system gates

- [ ] P01 — Map DIY/assisted/general/personalized guest and owner journeys, routes, primary actions and lifecycle states; align with design F1.
- [ ] P02 — Validate bounded system, data/tenant/transaction and household-overlay contracts, including A15 owner recopy without rotation; align with design F2.
- [ ] P03 — Curate Dribbble/Pinterest/TDY references into an explained moodboard and original Bengali atelier direction; typography/Bangla/motifs/rights and palette/motion studies; align with F3.
- [ ] P04 — Create inspectable high-fidelity mobile/desktop home, catalogue/product, first invitation, editor, personalization/share and client overview/detail with original composition; low-fidelity SVGs do not qualify; align with F4.
- [ ] P05 — Prove opening/skip/reduced-motion and create/share/respond interactions with long Bangla, no-photo and failure states; identify browser-local simulation clearly; align with F5.
- [ ] P06 — Review design/component/token/asset handoff and first-slice scope; confirm tested screenshots, accessibility states, backend dependency boundaries and implementation acceptance before expanding to the full build; align with F6 engineering entry.

## M0 — foundation

- [x] T001 — Initialize TypeScript/Next/React project in `web/`, lock dependencies and record actual Node22/npm10 setup/commands. Commercial runtime/tooling reconciliation remains in CI/release tasks; this does not complete production backend.
- [ ] T002 — Configure secrets separation, example environment file and ignored local artifacts; no credentials committed.
- [ ] T003 — Implement shared content schema and fictional bilingual three-event fixture; valid/invalid fixtures behave correctly.
- [ ] T004 — Implement design tokens, typography roles, responsive shell and accessible UI primitives.
- [ ] T005 — Create template manifest/type contract and schema/version compatibility rules.
- [ ] T006 — Add database migrations and tenant policy baseline from the data-model spec.
- [ ] T007 — Establish reproducible CI: lockfile install, format/lint/typecheck, focused checks, production build and critical browser journeys; validate clean/prior migrations.
- [ ] T008 — Separate local/staging/production adapters and synthetic fixtures; no browser sandbox success may imply live auth/persistence/payment.
- [ ] T009 — Establish server-only feature boundaries, explicit DTOs, shared schema and durable outbox contracts without speculative abstraction layers.

## M1 — one theme and renderer

- [ ] T010 — Produce original first-theme art and asset/licence records.
- [ ] T011 — Render opening, couple/hosts, events, countdown, gallery and RSVP placeholders from fixture data.
- [ ] T012 — Implement skip-enabled opening and reduced-motion fallback.
- [ ] T013 — Implement music consent/gesture, mute and playback-failure handling.
- [ ] T014 — Implement timezone-aware countdown and past/cancelled-event display.
- [ ] T015 — Implement per-event map and calendar actions.
- [ ] T016 — Verify long Bangla words/conjuncts, no-photo layout and compact/desktop sizes.

## M2 — builder

- [ ] T020 — Implement section navigation and draft save-status model.
- [ ] T021 — Implement couple/hosts/wording fields and locale editing.
- [ ] T022 — Implement multiple event create/edit/reorder with stable IDs.
- [ ] T023 — Implement photo select/crop/order/remove UI against a media interface.
- [ ] T024 — Implement curated palette/music/section ordering and compatibility checks.
- [ ] T025 — Implement open/household RSVP settings and explicit total-count labels.
- [ ] T026 — Use the same renderer for mobile/desktop/full-view preview; preserve edits when switching.
- [ ] T027 — Implement publish-readiness review and field-targeted errors.

## M3 — owner identity, persistence and media

- [ ] T030 — Implement owner email OTP/session and safe return-to-draft navigation.
- [ ] T031 — Enforce ownership/membership in services and database policies; two-account tests pass.
- [ ] T032 — Persist/resume incomplete drafts; show dirty/saving/saved/retry accurately.
- [ ] T033 — Enforce expected-revision writes and conflict recovery.
- [ ] T034 — Implement authorized upload reservation/finalization and object isolation.
- [ ] T035 — Process images into approved derivatives; reject invalid/oversized media safely.
- [ ] T036 — Add durable jobs/outbox for media and transactional delivery.

## M4 — publishing and lifecycle

- [ ] T040 — Implement atomic immutable publication and live pointer switch.
- [ ] T041 — Reserve unique slug and exclude admin/API/route words.
- [ ] T042 — Return allowlisted guest DTO; exclude drafts and private management data.
- [ ] T043 — Implement unpublish/archive/expiry states and cache isolation.
- [ ] T044 — Pin theme/media versions; keep existing live card during failed republish.
- [ ] T045 — Preserve stable event IDs and archive events with responses deliberately.
- [ ] T046 — Create safe social-share metadata/preview image and invalidate on publication.

## M5 — guests and RSVP

- [ ] T050 — Add household name/localized greeting/message, expected-revision saves, per-event scope/allowance and random token generation/revocation; hash verification plus authenticated encrypted recovery under versioned dedicated key; authorized recopy must preserve the existing URL.
- [ ] T051 — Implement server-filtered household guest view and access-session behavior.
- [ ] T052 — Validate published event, deadline, policy revision, integer counts and decline semantics.
- [ ] T053 — Implement RSVP idempotency and secure response-receipt editing.
- [ ] T054 — Store response notes and independent private text wishes outside public content; apply scope/length/escaping/rate limits; a wish must never change attendance totals.
- [ ] T055 — Build owner response list, filters and per-event/adult/child totals.
- [ ] T056 — Provide formula-safe authorized CSV export.
- [ ] T057 — Implement general/personalized link, scoped preview, owner-authorized recopy without rotation, user-initiated WhatsApp share and downloadable QR; keep dashboard link separate.
- [ ] T058 — Verify anonymous visitors and unrelated accounts cannot read response data.
- [ ] T059 — Deliver the private client dashboard entry link with owner verification; show accepted/declined/pending, family/adult/child totals, messages, refresh state and audited owner-entered replies per client-dashboard spec.

## M6 — commerce and admin

- [ ] T060 — Implement authoritative package catalogue and immutable quote/order snapshots.
- [ ] T061 — Create sandbox provider adapter and pending order/session flow.
- [ ] T062 — Verify provider confirmation against merchant/reference/amount/currency/status.
- [ ] T063 — Make payment processing replay-safe; grant entitlement once.
- [ ] T064 — Implement pending/paid/failed/cancelled/reversed receipt/status views.
- [ ] T065 — Reconcile delayed payments and provide recoverable admin exceptions.
- [ ] T066 — Build admin template/order/customer/request views with audited access.
- [ ] T067 — Implement assisted-design request intake and explicit fulfilment statuses.
- [ ] T068 — Implement receipt delivery retries without repeating payment effects.

## M7 — storefront and product content

- [ ] T070 — Implement homepage per website-design specification using original assets.
- [ ] T071 — Implement searchable/filterable catalogue, URL filter state and empty results.
- [ ] T072 — Implement each theme's demo/product page with correct capabilities and inclusions.
- [ ] T073 — Implement pricing/process/custom-help/contact pages.
- [ ] T074 — Implement Bangla/English product dictionaries, validation and formatting.
- [ ] T075 — Implement client delivery/dashboard behavior with the **new premium design**, using old wireframes only as structural context; distinguish general/personalized/management links, private wishes, settings, order status and useful next actions.
- [ ] T076 — Publish actual hosting/privacy/refund/edit policy copy consistent with service behavior.
- [ ] T077 — Complete first-time user flow from discovery to owner-visible guest response.

## M8 — optional collection expansion after the first-template release

T080 qualifies the first theme. T081–T086 apply only as additional themes enter the offered catalogue; they do not block a one-template launch.

- [ ] T080 — Qualify Jamdani Ivory against theme fixtures.
- [ ] T081 — Qualify Holud Utsab against theme fixtures.
- [ ] T082 — Qualify Royal Nikah against theme fixtures.
- [ ] T083 — Qualify Lal–Shada Biye against theme fixtures.
- [ ] T084 — Qualify Mughal Garden against theme fixtures.
- [ ] T085 — Qualify Modern Desi against theme fixtures.
- [ ] T086 — Produce each theme's thumbnail/poster/demo, photo-free and reduced-motion variants.

## M9 — launch gates

- [ ] T090 — Pass authorization, publishing, RSVP and payment integration checks.
- [ ] T091 — Pass compact/tablet/desktop, large text, keyboard and reduced-motion review.
- [ ] T092 — Record actual iOS/Android/in-app browser verification and outstanding limits.
- [ ] T093 — Measure initial payload/performance and tune large media/effects.
- [ ] T094 — Run backup restore and failed-payment/publish recovery exercises.
- [ ] T095 — Finalize brand/domain, prices, term/retention and asset licences.
- [ ] T096 — Configure approved production merchant/email/storage/hosting accounts.
- [ ] T097 — Verify production callbacks, secrets, environment separation and monitoring.
- [ ] T098 — Verify support, export/deletion, expiry/reminder and incident procedures.
- [ ] T099 — Record release version and launch evidence; expose only completed features.
- [ ] T100 — Measure commercial baseline budgets: guest transfer/JS, Web Vitals, API p95, pagination and synthetic load; record actual environment/results rather than promise unlimited capacity.
- [ ] T101 — Demonstrate database plus object/key/config recovery against proposed RPO ≤1h/RTO ≤4h; budget backup/PITR and test rotation/recovery of encrypted guest links.

Task IDs are execution IDs. Growth requirement IDs in the PRD are a separate namespace; the PRD G08 category is not tracker task G08.

## Growth backlog — specification retained; implementation unstarted

- [ ] G01 — Lightweight Save the Date product with explicit no-RSVP default.
- [ ] G02 — Designer brief/proof/consolidated revisions/approval portal.
- [ ] G03 — Guest import with preview, duplicate review and safe rollback.
- [ ] G04 — Family collaborators with role/access boundaries.
- [ ] G05 — Additional guest questions, dietary fields, travel/stays/story/gift blocks.
- [ ] G06 — Scratch reveal with keyboard/low-motion alternative.
- [ ] G07 — Static print/PNG/PDF layouts and export jobs.
- [ ] G08 — Aggregate analytics, favourites, coupons and custom-domain lifecycle.
- [ ] G09 — Version rollback UI with response/event compatibility review.
- [ ] G10 — Optional private photo wishes with scoped media, consent, private read access and confirmed/audited removal per video-review spec; public guestbook is a separate opt-in extension.
- [ ] G11 — Owner-only printable memory book of selected RSVP/wishes/photos, complete paginated data and timestamped totals; browser Print/Save as PDF, A4/Bangla and isolation checks per video-review spec.
- [ ] G12 — If enabled, implement explicit Maybe across schema/API/guest/dashboard/export; tentative counts never inflate confirmed people and remain distinct from Pending.

## Expansion backlog — separate product decisions

- [ ] X01 — Original 3D pop-up scene collection and custom scene service.
- [ ] X02 — Birthday, aqiqah and other occasion schemas/collections.
- [ ] X03 — Planner budget/payments/contracts/vendors/comparison.
- [ ] X04 — Seating/catering/task plan/binder/collaboration product.
- [ ] X05 — AI quote reading, weather/digests and gift/thank-you tracking.
- [ ] X06 — Gift credit/redeem/refund rules and product-specific promotions.
- [ ] X07 — Optional bridesmaid/proposal and similar adjacent-occasion products, with their own schemas and service scope.

## Updating this tracker

When completing a task, retain its ID, check it only after acceptance, and record the relevant implementation/verification in the current change log or handoff. If scope changes, update `plan.md`, the owning spec and `memory.md`. Do not mark a competitor's observed feature as something our application has implemented.
