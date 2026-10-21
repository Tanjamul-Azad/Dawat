# First interactive build handoff

- [Client pilot hardening and rehearsal — 21 October](client-pilot-hardening-2026-10-21.md): 225 tests, seven migrations, hosted five-photo/RSVP/wish/revoke and fresh local end-to-end proof; Vercel personal preview in progress.

## Current readiness audit — 21 October 2026

[Full client readiness audit](client-readiness-audit-2026-10-21.md) records fresh tests, successful remote CI, four hosted rollback proofs, actual private Storage dependency roundtrip, user-verified hosted login and partial authenticated browser review. It identifies A01–A16 with acceptance criteria and links the [96-case evidence matrix](../qa/client-v1-audit-matrix-2026-10-21.md). Configured media credentials are verified; full hosted app processing, external deployment, devices/performance/recovery and confirmed editor/state defects remain. Older pending-login/key/remote-CI claims below are historical. External client handoff is not qualified yet.

Latest: [compact client dashboard workflow](client-dashboard-workflow.md) — acknowledged autosave/conflict recovery, host correction/history, private CSV, pause/resume, seller search/BDT inputs and contextual navigation. Hosted migrations/proofs and local real HTTP/Storage flow pass; fresh browser/device and deployment qualification remain.

## Private photos and Bangla-first product — 20 October 2026

[Media/Bangla checkpoint](media-bangla-first.md): 170 tests, strict typecheck/build, actual local upload/Storage/EXIF/tenant/session/publication proof and third migration + normal-role proof on Dawat Staging. Hosted processor key, Gmail App Password repair, fresh media visual/device review and release gates remain. Historical checkpoint counts below are unchanged.

## Named guest delivery and hosted database — 20 October 2026

[Named guest delivery](named-guest-delivery.md): stable encrypted links, scoped sessions, real RSVP/wishes, event reports and compact household management; 143 automated tests, local HTTP/Edge flow and hosted normal-role isolation proof. Dawat Staging migrations are applied. SMTP/customer sign-in, public app deployment and remaining release gates are explicitly pending. Historical checkpoints below retain their original test counts.

## Current backend foundation — 20 October 2026

[Client foundation implementation](client-foundation.md): real local Supabase auth/MFA, normal-role RLS isolation, seller confirmation/separate activation, persistent client editor and safe immutable general publication. 112 tests, actual local service flow and Edge responsive evidence. Remaining named replies/media/operations and launch gates are explicit. Historical template-only checkpoints follow.

## Latest template correction — version 6

[Sealed personal invitation](personal-opening-v6.md): explicit gift opening before inner chapters render; no pre-open scroll/hash/navigation bypass, no guest name forms, host-addressed recipient and sender, general links view-only. 67 tests/typechecked export plus actual 390/320px normal/long-name/photo-free/reception-only/named-RSVP checks. [Gift/Pinterest research](../design/pinterest-gift-reveal-v6.md) records sources and access limits. Primary preview now uses port **3000**. Real-device/performance/backend gates remain open; website/dashboard expansion deferred.

## Latest mobile review — version 5.1

[Edge-case audit and rendered mobile polish](edge-case-audit-v5-1.md): browser access restored, actual 390/320px Bangla-English journey, map/copy/calendar and RSVP/error/edit checks, plus 56 passing tests and a typechecked optimized export. Per-event drafts, live deadline, stale-policy rejection, direct-fragment navigation and observed visual defects are corrected. Physical-device/performance/backend qualification remains open. The older disabled-browser statements below describe their dated checkpoints.

## Latest local product — continuous digital invitation, version 5

[Digital card v5](digital-card-v5.md): the entire guest canvas is now the illustrated card, with full-canvas folio, new original art, date ribbon, coordinated event/photo/reply chapters and quiet/motion controls. **49 tests** and optimized typechecked export pass. [Portable build](../../.artifacts/jamdani-digital-card-v5-static.zip). Website expansion is deferred. Actual visual/phone QA and hosted deployment remain blocked as documented.

## Latest local website — Figma direction adopted, version 4

[Figma UI adoption evidence](figma-ui-adoption-v4.md): new fonts, rebuilt localized storefront/catalogue, mobile maker controls, horizontal-tab workspace and woven envelope opening with our working logic retained. **43 tests**, formatting, typechecked export and static HTTP checks pass. [Portable preview](../../.artifacts/dawat-figma-ui-v4-static.zip). Local server on 4173 remains available; browser visual QA and hosted update are still blocked as documented.

## Latest local template implementation — version 3

[Mobile polish continuation](mobile-polish-v3.md): staged paper/seal, chapter navigation, full-width mobile event information, gallery gestures and RSVP focus feedback. **38 tests pass**. The user's preferred [Figma export is now reviewed from supplied source](../design/figma-source-review.md); actual mobile/Figma visual comparison is still blocked by disabled browser control.

[First full Jamdani frontend handoff](first-template-v3.md): opening animation, complete Bangla/English guest UI, photos/lightbox/no-photo, countdown, event maps/calendar, RSVP/edit/wishes and isolated sample replies. **33 tests**, strict typecheck, formatting, optimized export and static HTTP smoke checks pass. Browser control is disabled; no new visual/device QA is claimed. Sites returns project-not-found, so this update is local and **has not replaced the hosted v2** described below.

## Current comparison upgrade — 19 October 2026

[Open the updated private preview](https://dawat-studio-invitation-atelier.bushy-lotus-1498.chatgpt.site). Deployment returned **succeeded**; the same Site and owner-only audience were preserved.

- Source: `946de0e5b6d5e50ea406774edd0db3032d57c2ff`.
- Saved version: `appgprj_6ad5bd38375881919d603156d5d87b77~appgver_d37c41358dc481919c9f8b8275a471fb`.
- Deployment: `appgdep_6ad5d71ce3e0819180330a5a9ead0801`.
- Finalized [AI Studio](../prompts/google-ai-studio-build.md), [Figma/Claude](../prompts/figma-ai-claude-design.md), [ImageGen](../prompts/imagegen-first-template-assets.md) briefs and [comparison scorecard](../design/comparison-scorecard.md) use the same latest contract. No direction is approved automatically.

### What changed

One-template catalogue; original generated portrait artwork with optimized 640/1024px WebP; live HTML names/date; stronger mobile hero; fast mobile preview dialog; public order review/request/status; separate operator confirmation, activation and revocation; dashboard locked before both steps; first activation initializes an empty preparing celebration; publication remains separate. Public design previews collect no replies/wishes and guest pages contain no host dashboard shortcut. Removed 120 obsolete global cover rules after replacing the cover with a scoped component.

### Verification and limits

- **10 domain tests passed**, strict TypeScript passed, Prettier source check passed, and final static production build passed. Real routes now also include `/order/` and `/operator/`.
- Browser UI verified: no-order, pending and confirmed-but-inactive dashboard denial; activation opens the workspace; first activation leaves invitation unpublished and guest/wish lists empty; explicit publication enables sharing.
- Browser UI created a reception-only household with allowance three and Bangla greeting. A reply for two adults plus one child produced **3 people, 1 accepted household, 0 declines, 0 pending**. Independent private wish did not change headcounts. Revoke denied dashboard access; reactivation preserved the saved invitation and responses.
- Changed a public draft name to Ayesha, saved and reviewed an order: its snapshot displayed Ayesha while the earlier published sample remained independent. Domain test verifies ordered snapshot initialization even after later draft edits.
- Read-only design preview had zero reply-submit controls and zero dashboard links, including while the local dashboard was active. Fresh public sample also had no RSVP submit or host link. Browser captured no error/warn logs in this run.
- Desktop 1440×1000 and mobile 390×844 visually inspected. Narrow 320/360px overflow checks covered home, catalogue, customizer, order and dashboard; a 2px dashboard guest-row issue at 320 prompted a stacked narrow layout correction. These are browser-emulated checks, not physical-phone certification.
- Artwork transfer: 121,930 bytes at 640px and 289,492 bytes at 1024px. The 3.1MB PNG original is kept outside public output in `web/design-source/`; no hero video was added. Final artwork/type/contrast and long-content qualification remain commercial gates.
- Everything remains fictional and device-local. Local access checks are a UX simulation, **not server authorization**. No actual identity, payment, email, shared database, secure guest token or cross-device collection is connected. Production acceptance in [customer lifecycle](../specs/customer-access-lifecycle.md) remains outstanding.

Evidence: [desktop home](home-desktop-v2.png), [mobile home](home-mobile-v2.png), [mobile template preview](template-mobile-v2.png), [mobile dashboard](dashboard-mobile-v2.png), [mobile order status](order-mobile-v2.png). Test data was reset after QA.

The sections below preserve the first build checkpoint; their SHA, seven-test count and palette presentation are historical, superseded by the current upgrade above.

19 October 2026 · Original code/art in `web/`. This is a fictional browser-local design sandbox, not a launched customer service. Production architecture and release gates remain in the canonical specs.

## Private deployed preview

[Open Dawat Studio](https://dawat-studio-invitation-atelier.bushy-lotus-1498.chatgpt.site). Sites returned deployment **succeeded**. Audience remains owner-private; no customer service was publicly launched.

- Source commit: `ca24e0689568714cbcd0df3fad4f8bea77690823`.
- Site: `appgprj_6ad5bd38375881919d603156d5d87b77`.
- Saved version: `appgprj_6ad5bd38375881919d603156d5d87b77~appgver_91ddbcde53e081918c3bceab62d4e57d`.
- Deployment: `appgdep_6ad5c47d28908191ab88cf7ef77da2c4`.
- Packaging preserved exact pushed source/build; Git Bash plus `TAR_OPTIONS=--force-local` resolved Windows archive path interpretation. No credentials were saved in project files.

## What is working

Homepage/collection, original Jamdani composition with seal opening, three-step editor with draft versus published-demo separation, personalized household creation and preview, event visibility, bounded RSVP and editing, host counts/search/filters/details, CSV download, map/calendar actions and independent text wishes. Garden/Holud are labelled palette studies on the shared layout, not complete distinct commercial templates.

## Verification performed

| Check | Evidence / result |
|---|---|
| Production static build | `npm run build` succeeds; `/`, `/templates/`, `/studio/`, `/dashboard/`, `/invite/` exported |
| Strict TypeScript | `npm run typecheck` passes, including unused locals/parameters checks |
| Domain tests | `npm test`: 7 tests pass for counts, scope/limits, replacement not double-counting, draft isolation, date display and safe CSV cells |
| Formatting | Prettier check passes; source is formatted rather than minified |
| Personalized guest | Added fictional “Demo Cousins”, party allowance 3, reception only, Bangla greeting and personal message; rendered only Reception and the right greeting/message |
| RSVP and wishes | Saved 2 adults + 1 child: dashboard rose from 14 to 17 people and 4 to 5 accepted replies; no duplicate household. An independent wish appeared without changing totals |
| Draft/live distinction | Changed first partner to Ayesha and saved; reloaded editor retained it while guest card still said Mehrin. Explicit update plus garden choice then changed guest card to Ayesha/garden |
| Mobile | 390 × 844 viewport (375px document area with scrollbar); inspected home/workspace/editor; corrected an overflowing decorative branch; final home/workspace/editor document width equals scroll width |
| Desktop | 1440 × 1000 viewport; reviewed first cover, studio and host overview; larger default viewport also reviewed |
| Production-style browser check | Inspected exported files via local static server, not only dev mode. Earlier development hot-reload text mismatch after a copy edit was not treated as a passing result; final exported page was reloaded and checked |

Sample browser data was reset after checks. No real guest names, contact data, payments, messages, uploads or reference-business mutations were used. The vendor archive was not deployed.

## Captures

- [Desktop home](home-desktop.png)
- [Mobile home](home-mobile.png)
- [Desktop studio](studio-desktop.png)
- [Mobile studio](studio-mobile.png)
- [Desktop workspace](dashboard-desktop.png)
- [Mobile workspace](dashboard-mobile.png)

These depict our implemented first design pass, not the earlier SVG wireframes or the competitor dashboard. User design review and complete accessibility/device qualification remain open.

## Important limits and next engineering work

Only browser storage is connected. Guest links do not share data across devices; owner authentication, server-enforced tokens/event privacy, shared Postgres records, RLS, verified gateway callbacks, secure media, transactional publishing/idempotency, email/jobs and real operational controls are not implemented. Client filtering in this sandbox is a UX demonstration, not production authorization.

Private wishes are only private within the intended sandbox flow, not an authenticated access-control guarantee. No generic “paid” toggle or simulated checkout is presented as real payment. No production price or unlimited-weddings/storage promise is set.

Next: review this visual direction, then implement the Supabase owner/tenant/household/publication/response slice against the existing contracts, add real service/integration tests, then verified commerce and remaining qualified themes. Keep the demo visibly separate throughout. Do not mark P01–P06 or production tasks complete solely because the preview exists.

Source/package workflow encountered Windows shim/WSL path selection issues. Native npm successfully installed/built, and Git Bash is used for packaging without changing app code to hide infrastructure errors. The Site ID must be reused across publishing retries.
