# Implementation plan

**v6.4 status:** compact spacing and licensed classical music are implemented;82tests and typechecked export pass. Supported browser access restored to a live authorized tab:320/390px BN and1024px EN views checked, current card top0/no green strip, gallery/manual next, music actual playback/pause/resume and no initial audio source confirmed. Remaining: physical Android/iPhone full-flow/listening, five-photo rendered variant and fresh performance/field qualification. [Evidence](docs/build-evidence/compact-music-v6-4.md).

**v6.3 update:** requested gallery/colour/motion changes implemented and77tests pass. Scroll is available immediately after a deliberate opening action, with an800ms decorative reveal and stable cover frame. Browser visual access to the new gallery build remains unresolved; get a genuine320/390px/mobile/desktop walkthrough before final design approval, then repeat performance and physical-device qualification. [Evidence](docs/build-evidence/gallery-colour-v6-3.md).

**v6.1 qualification update:** couple/family signature and couple-addressed wishes are implemented. Mobile lab audits are now measured: Performance91, closed-entry Accessibility100, cold transfer544KiB BN/439KiB EN, JS190KiB, CLS within budget. LCP3.46s misses the2.5s goal. 70 tests/typecheck/export pass. The next qualification action is the Android Chrome/iPhone Safari run through the prepared private-network sample and recording results, then the remaining critical-render/LCP work. See [measurements](docs/build-evidence/template-qualification-v6-1.md) and [device steps](docs/qa/physical-phone-v6-1.md). Do not substitute desktop emulation for physical sign-off.

**Latest scope, v6:** finish the invitation product first. [Sealed personal template audit](docs/build-evidence/personal-opening-v6.md) supersedes auto-open/anonymous-name flows: deliberate gift opening, host-addressed guest identity, mobile/content-edge polish. 67 tests and actual browser checks pass. Do not expand storefront or multi-order dashboard implementation until the template is approved. Seller/customer/guest tenancy stays the specified production architecture.

**Latest mobile checkpoint:** v5 is the user's liked direction. [v5.1 edge-case audit](docs/build-evidence/edge-case-audit-v5-1.md) records rendered mobile opening-to-RSVP verification, fixes and 56 passed tests. Browser access is restored. Next qualification is long-content/media fixtures and real-device/performance checks; keep the website deferred and do not restart the art direction.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](docs/specs/customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

Version 4 · **19 October 2026** · Status: **commercial plan updated; first interactive design slice implemented in `web/`; production backend and paid release pending**.

## Document authority

Use this plan for scope/order; `architecture.md` for system boundaries; `website-design.md` for visual direction; `task.md` for execution status; `docs/specs/` for detailed contracts. `memory.md` preserves context. The numbered first-pass research files remain historical inputs. When a decision changes, update its authoritative document and links instead of adding a conflicting rule elsewhere.

## Outcome

**Latest execution priority:** finish and qualify the invitation product before further website/maker/dashboard polish. The user explicitly rejected a small card followed by website sections. [v5 digital card](docs/build-evidence/digital-card-v5.md) implements one continuous illustrated invitation with preserved working logic; 49 tests/build pass, but visual motion/phone qualification and final user review remain pending. Do not resume storefront expansion merely because its v4 implementation exists.

**Figma direction implemented:** the user's subsequent explicit instruction authorized adoption. [Version 4 evidence](docs/build-evidence/figma-ui-adoption-v4.md) records the rebuilt public/storefront presentation, typography, practical maker/workspace and premium envelope guest flow, with 43 passed tests and retained working logic. Further implementation should refine this adopted direction rather than restart the earlier comparison; physical/rendered visual qualification and production backend remain open.

**New concrete design input:** the user supplied their preferred Figma Make source ZIP and likes its UI organization, fonts and polish. [Source review/adoption plan](docs/design/figma-source-review.md) is the reference for adopting its presentation direction while retaining our validated invitation logic. [Mobile polish checkpoint](docs/build-evidence/mobile-polish-v3.md) supersedes the older 33-test count with 38 passed tests; browser visual QA and production release remain open.

**Latest product priority:** the complete invitation template is the main selling point, with **Bangla and English only**. The user subsequently authorized implementing the full first template now; [local v3 handoff](docs/build-evidence/first-template-v3.md) records opening/photos/countdown/maps/RSVP and complete guest-language switching, with 33 passed tests and outstanding browser/production checks. The [quality contract](docs/specs/template-experience-quality.md) still governs the 60 release scenarios; local functionality is not final commercial qualification. The [Teatro walkthrough](docs/reference-evidence/guest-preview-walkthrough/README.md) preserves reference evidence/limits. Prior comparison plans no longer block the explicitly requested first-template build.

A new branded desi wedding invitation platform with a public catalogue, guided builder, saved drafts, preview, verified payment, stable publishing, guest RSVP, owner management and admin support. The product should work for several events on separate dates and in Bangla/English. A browser link is the primary deliverable; static image/PDF export is an expansion.

The user explicitly sets a **commercial, premium, celebratory** product bar with clean, efficient, maintainable code. Main experience inspiration remains The Digital Yes, with **Dribbble and Pinterest** now required for visual research. e-Nimontron's sparse dashboard is functional evidence, not our final UI target. The earlier SVG/PNG dashboard mockups are layout drafts, not approved visual design. Start with [design roadmap](docs/design/design-roadmap.md) and [inspiration brief](docs/design/inspiration-board.md).

**Personalized guest/family links are confirmed launch scope:** one published wedding/theme plus named greeting, optional short message, permitted events and allowance per guest household. Keep a general shareable link too. This is not a separately built website per recipient. See [personalization contract](docs/specs/personalized-invitations.md).

Selected stack: Next.js/React/TypeScript, Tailwind, React Hook Form/Zod, next-intl, selective Motion, Supabase Postgres/Auth/Storage, SSLCOMMERZ adapter, Resend, and commercial Vercel/Supabase deployment with durable jobs and meaningful CI. [Production baseline](docs/specs/production-engineering.md) defines the exact boundaries, clean-code rules, measured budgets, recovery and release gates. No paid account or app has been created.

User-confirmed core feature: deliver a **private client dashboard entry link**, separate from the guest invitation link. The client sees accepted/declined/pending responses, family and adult/child headcounts, private messages and guest/invitation controls. This belongs to paid launch even for assisted-service clients. Access requires verified owner identity. Full behavior: [client dashboard](docs/specs/client-dashboard.md).

The user explicitly wants the e-Nimontron-style service pattern. Public ordering/guest controls were rechecked, and a later user-supplied recording now shows the host dashboard UI. [Video findings](docs/specs/vendor-dashboard-video-review.md) distinguish recorded controls from untested behavior and the user-relayed BDT 600/unlimited-invitation offer. Use [the focused flow](docs/specs/e-nimontron-client-flow.md) and [original dashboard mockup](docs/design/client-dashboard-desktop.svg) for our version; authentication and actual delete/print behavior were not tested.

## Release definitions

| Release | What it proves | Required boundary |
|---|---|---|
| Prototype | Art/content/editor can produce a good invitation | One theme, sample/local content, shared renderer and preview; no claim of paid service |
| Private beta | Real owners can safely create, publish and collect responses | Auth, database, media, versioned publication, open + household RSVP, owner/admin tools; sandbox payments |
| Paid launch | A supported customer service works end to end | Production-verified checkout, published policies, finite hosting term, one fully qualified original theme, recovery/support and launch QA |
| Growth | Broader personalization and convenience | Save the Dates, proofs/revisions, import/collaborators, exports, custom domains and enhanced blocks |
| Expansion | Adjacent product lines | 3D studio, other occasions, planner tools, gift cards, advanced automation |

Household RSVP resolution: basic manual household creation, token links and server-enforced per-event allowances belong to beta/launch. Spreadsheet import, family collaboration and bulk workflows are Growth. This resolves ambiguous phase labels in the first-pass notes.

## Milestone sequence

**Begin with M−1 design foundation:** product flows and a bounded system outline together → Dribbble/Pinterest moodboard and original art direction → high-fidelity representative mobile/desktop screens → interactive first-card proof. Then implement M0–M6 as one production-shaped vertical slice before expanding the template collection. Design and engineering refine each other; do not wait for a complete catalogue of static mockups or scaffold the whole product before establishing its visual identity.

| Milestone | Deliverable | Depends on | Exit evidence |
|---|---|---|---|
| M−1 | Premium product/UX/system foundation | Current specs | P01–P06: coherent flow, original high-fidelity direction, mobile/desktop and motion/failure states; existing low-fidelity mockups do not satisfy this |
| M0 | Repository foundation, schema, design tokens, fictional fixture | These specs | Typed content fixture validates; routes and folders documented |
| M1 | One original invitation theme and renderer | M0 | Mobile/desktop/no-photo/long-Bangla previews |
| M2 | Guided builder and save-state UI | M1 | Content edits survive resume; preview uses same renderer |
| M3 | Owner auth, tenancy, media and version storage | M0–M2 | Two-account isolation and upload checks |
| M4 | Atomic publish/unpublish and stable URLs | M3 | Draft/live separation; expiry and invalid-link states |
| M5 | RSVP policies, household links, receipt editing and dashboard | M4 | Per-event totals, retry safety and access checks |
| M6 | Package catalogue, sandbox gateway, orders/admin | M3–M5 | Success/failure/delay/replay/mismatch scenarios |
| M7 | Storefront, content/localization, share tools and assisted requests | M1 + M4–M6 | A first-time user completes the whole flow |
| M8 | Optional collection expansion after first-template validation | Stable M1 contracts and selected direction | Each additional theme passes its own QA matrix |
| M9 | Production readiness and paid launch | M0–M7; M8 optional | Release checklist and real operational owner; one fully qualified theme is sufficient |
| M10 | Growth scope chosen from demand | Stable launch | Each feature separately specified, built and verified |

Build a vertical slice rather than completing every marketing page before persistence and publishing. Production provider setup can be prepared while development continues; no fake payment success should stand in for it.

## First vertical slice fixture

Fictional partners: **মেহরিন / Mehrin** and **আরিব / Arib**. Events: Holud, Nikah and Reception on different dates; at least two venues. Include optional hosts, one photo-free run and one five-photo run, Bangla/English wording, Asia/Dhaka times, map/calendar, open and household RSVP, adult/child counts and a private note.

Use reserved/example email data and sandbox payments. Add two fictional households with distinct greetings/messages/allowances and event visibility; verify their previews and RSVP never cross. No real people's contact information is required for local development. Implement through verified sandbox checkout, persistence, publication and owner-visible responses; test fixtures must not become a public entitlement bypass.

## Core customer journeys

Buyer: catalogue → template demo → limited customized preview → order/quote → verified payment → operator confirmation → separate dashboard activation → verified client entry → prepare/publish → guest sharing and responses. A redirect success never grants management access.

Assisted: request/brief → quote/order → verified payment → operator confirmation → separate activation and dedicated client entry → proof/approval → publish. Staff may prepare internally before client activation.

Guest: general or personalized link → authorized named welcome/language/opening → permitted events/details → accept/decline per event → confirmation + secure edit receipt.

Admin: locate order/wedding → inspect actual state → resolve upload/payment/publish/design issue → record action → notify through the product's approved delivery path.

Detailed routes/states are in [screen specifications](docs/specs/screen-specifications.md).

## Scope allocation

The first-template scope includes one original composition with future catalogue expansion, two locales, multiple events, curated palettes, five photos, soundtrack/no soundtrack, basic section ordering, accounts/drafts, preview, checkout, publishing, maps/calendar, link/QR, RSVP, owner exports and admin support.

Launch also includes manual personalized household invitations, safe owner preview/recopy/rotation and a premium visual system across storefront/card/maker/dashboard. Spreadsheet imports, per-guest bespoke artworks and individually generated card PDFs remain later scope. Build original theme layouts/assets with a shared renderer per [template production](docs/specs/template-production.md); do not extract/copy competitor templates.

Growth includes Save the Dates, custom questions/dietary fields, travel/stays/story/gifts blocks, moderated wishes with photos, print/export layouts, revision portal, imports/collaboration, aggregate analytics, coupons, domains and rollback UI. Keep these in the architecture without exposing unfinished controls.

New video-backed reference-parity targets: G10 private photo wishes and audited removal; G11 owner-only printable memory book using browser Print/Save as PDF; G12 configurable explicit Maybe with separate tentative totals if enabled. Full behavior and checks are in the [video review](docs/specs/vendor-dashboard-video-review.md). These are distinct from invitation-image export and from the core launch accept/decline dashboard. Do not advertise full parity with the recorded memories experience before G10/G11 pass. The vendor quote is competitive evidence, not our selected price or a promise of unlimited weddings/storage/hosting.

Expansion includes 3D scene products, birthdays/aqiqah/anniversaries, planner/budget/vendors/seating/AI, gift-credit products and automatic messaging. The reference-feature matrix preserves them; a wedding card maker does not require the entire planner to launch.

## Commercial and external dependencies

Before paid launch, resolve brand/domain, real package price, hosting/retention term, approved merchant account, email delivery and asset licences. Settle these in explicit configuration/decision records. Use sandbox adapters during development so external onboarding does not block the prototype.

No fixed completion date is asserted. Estimate milestone effort after inspecting the selected framework setup and building the first renderer; illustration work and merchant onboarding have separate schedules.

## Acceptance policy

Every milestone must produce a reviewable artifact and its stated checks. Mark tasks `[x]` only for completed work, not a plan or a successful tool invocation. A paid launch requires both functional and operational checks in [QA/release](docs/specs/qa-release.md).

## How to use the local reference archive

Start with [reference walkthrough](docs/reference-walkthrough.md). Use its local screenshots and page snapshots when a visual/detail question arises. The [template catalogue](docs/02-template-catalogue.md) provides the design inventory. Do not infer backend functionality from screenshots; where private behavior was unavailable, implement the explicit new-product contract instead.
