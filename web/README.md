# Dawat Studio — functional Jamdani invitation template

> **Planning update · 20 October 2026:** the app below is a local/static prototype. Current production-delivery plan is [Client V1](../plan.md), with [architecture](../architecture.md), [design](../website-design.md) and [tasks](../task.md). Backend, verified auth, tenant isolation and cross-device RSVP are not implemented by localStorage. Older run/checkpoint notes remain historical; this planning update changes no app behavior.

**Latest template — v6:** explicit sealed opening before chapters/navigation/forms render, host-created recipient name on cover/reply, no guest name fields and view-only general links. Long-name/photo-free/reception-only checks and real personal RSVP were exercised at 390/320px; 67 tests and typechecked export pass. [Current audit](../docs/build-evidence/personal-opening-v6.md) · [Gift/Pinterest research](../docs/design/pinterest-gift-reveal-v6.md). Primary preview now runs on `http://127.0.0.1:3000/invite/?lang=bn`; set `DAWAT_PREVIEW_PORT=3000` before `npm run preview` to use this port (default is 4173). Template first; real-device/performance/backend gates remain open. Historical checkpoints below are superseded.

Original wedding invitation studio built in Next.js/React/TypeScript. Working brand, fictional people and venues. **This is an interactive browser sandbox, not a paid customer service or a production backend.**

**Current product focus: continuous digital card v5.1.** `/invite/?lang=bn` presents the full illustrated invitation: original garden/vine, 1.8s woven folio, date ribbon, coordinated chapters and motion controls. Browser access restored; actual 390/320px Bangla-English opening-to-RSVP checks plus landscape, map/copy/calendar download and RSVP/error/edit checks are recorded. **56 tests** and the typechecked export pass. Event drafts, live deadline and observed visual defects are fixed. [Current audit/evidence](../docs/build-evidence/edge-case-audit-v5-1.md) · [Portable build](../.artifacts/jamdani-digital-card-v5-1-static.zip). Physical phones, exhaustive content variants, performance and production backend remain open. Further website work stays deferred.

Latest local version: **Figma UI adoption v4**, explicitly requested by the user. Fraunces/Instrument Sans with Noto Serif Bengali/Hind Siliguri, rebuilt Bangla/English storefront/catalogue, mobile maker preview controls, horizontal-tab workspace and shared woven-envelope opening retain our existing domain logic. See [current evidence](../docs/build-evidence/figma-ui-adoption-v4.md) and [portable preview](../.artifacts/dawat-figma-ui-v4-static.zip).

## Run locally

Use a supported Node LTS runtime. This checkout was built with Node 22.18.0 and npm 10; the commercial baseline prefers Node 24 LTS and must be reconciled in CI before launch.

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:3000/`.

The completed first-template frontend is at `http://127.0.0.1:3000/invite/` (Bangla by default) or `/invite/?lang=en`.

To inspect the production export after building, run `npm run preview` and open `http://127.0.0.1:4173/invite/`. This local-only Node server uses built-in modules; stop it with Ctrl+C. The user requested a running preview on 19 October; the retained task server is intentionally kept available for review.

```powershell
npm run typecheck
npm test
npm run build
```

The current `next.config.ts` exports static pages into `out/` for an owner-private design preview. Production server behavior requires changing this deployment mode when the real backend is integrated; static export cannot supply server-only owner authorization or verified payment callbacks.

## Implemented preview

- Editorial storefront with original ImageGen portrait artwork, SVG botanicals and a CSS envelope composition. Optimized artwork is 122KB/289KB WebP; the full original stays in `design-source/`, outside public output.
- Collection: one Jamdani Ivory template, with three curated palettes inside the customizer.
- Four-step editor: bilingual names/message; two events with bilingual titles/venues/addresses and dates/times; up to five photographs; curated palette. Photo controls support local resizing, removal, reordering, focal alignment and bilingual descriptions. Photo-free output has its own composed section.
- Public customizer: Save draft, fast mobile live-preview dialog, read-only full preview and Review your order. Public buyers cannot publish.
- `/order/`: browser-local request with contact fields, immutable ordered design snapshot and confirmation/activation timeline. No payment or message is sent.
- `/operator/`: openly labelled internal UX simulation for confirmation, separate activation and revocation. Find it through About this preview. It is not protected admin authentication.
- `/dashboard/`: locked until local confirmation and activation; first activation starts an empty preparing workspace. Publication is separate. Revoking/re-activating access preserves later client work.
- Activated editor: explicit draft versus Update demo invitation publication; the guest card does not change on draft save. Read-only design previews never collect replies/wishes, even when a demo dashboard is active.
- Host workspace: event-specific totals, pending versus declined, guest search/filters/details, scoped guest creation, personalized greeting/message, guest-event selection and CSV export.
- Guest template: layered woven-envelope/seal opening (1.45s), skip and reduced-motion paths, complete Bangla/English guest copy and explicit customer translations, preserved language-switch form state, localized live countdown, editorial celebrations and framed photo sequence with lightbox/keyboard/swipe/failure fallback, no-photo edition, per-event Google Maps links/click-loaded map/address copy and UTF-8 calendar download, RSVP/edit/decline and independent wishes, woven forest closing. No competitor artwork or photographs are used.
- Public `/invite/` is an interactive fictional sample. Its replies persist under `dawat-guest-sample-v1`, independently of customer orders/host data, and can be reset on the sample page. `?preview=design` remains read-only. `?live=1` uses the explicitly published browser-local customer invitation; personalized `?guest=...` uses that household's scope. No query parameter supplies real production authorization.
- Publishing the bilingual template checks both names, wording, event translations and photograph descriptions. Older saved drafts remain loadable; fill missing translations before publishing. No automatic name translation occurs.
- Browser storage with schema validation, save-failure feedback and a sample reset. Same-origin tabs receive storage changes.
- Responsive layouts, semantic forms/native dialog focus behavior, keyboard controls and reduced-motion styles.

## Deliberate boundaries

All data stays in the current browser. Personalized demo links do not transport a shared database to another device and do not implement real owner authentication, guest-token security, RLS, receipt ownership or multi-user concurrency. The UI says this explicitly. Use fictional data.

No payment, email, WhatsApp message, server media upload or vendor integration is executed. Selected photographs are processed on the device into the browser-local draft. Production auth/persistence, transactional publishing/RSVP, verified gateway, secure media, audited operations, delivery, localization of the rest of the product, final art qualification, CI/load/recovery and real-device checks remain outstanding. Do not sell this static build as the production service.

The [root plan](../plan.md), [production baseline](../docs/specs/production-engineering.md), [personalization contract](../docs/specs/personalized-invitations.md) and [task tracker](../task.md) govern the next implementation slices. The preview uses scoped plain CSS and CSS motion; Tailwind/Motion from the baseline are not dependencies just for their own sake. Runtime/npm and styling choices are recorded as first-slice differences, not silent changes to the commercial plan.

## Source responsibilities

`src/features/workspace/` owns typed sandbox data, validation/accounting and persistence. `src/components/` owns presentation and interaction by surface; nonmarketing surfaces are dynamically loaded. `src/app/` provides actual routes. No credentials belong in client code, source control or the browser store. `.env.example` records future integration names only; those integrations are not falsely stubbed as successful services.

Fonts are self-hosted by Next's font build pipeline: Fraunces, Instrument Sans, Noto Serif Bengali and Hind Siliguri. Upstream SIL Open Font License notices are included in `public/licenses/`, from the [Google Fonts source repository](https://github.com/google/fonts). Artwork combines original ImageGen illustration/photography with code-native SVG/CSS, including authorized adaptation of the user's Figma stationery. No competitor artwork or forwarded vendor video imagery is served. See `design-source/README.md` for provenance and derivative sizes.

## Verification

43 tests pass across domain/content, guest interactions and product regressions in a simulated JSDOM document. New coverage includes public locale/data isolation, explicit locale during storage failure, envelope peek state, unsaved maker preview with draft-only save and reply-derived dashboard totals, alongside the previous opening/RSVP/maps/gallery checks. Strict typechecking, source formatting, optimized export and six static route smoke checks pass. The prior dependency audit reported zero vulnerabilities; dependencies were not changed in this presentation pass. Vitest is 5.0.5; tests require a compatible Node runtime, including the installed 22.18.0.

Visual browser/mobile QA was unavailable because Work settings disabled local browser control. JSDOM does not verify CSS animation appearance, layout, external Google rendering, physical phones or actual canvas image decoding. The Sites connector returned `Sites project not found` for the existing project, blocking synchronization/publication. The existing hosted URL has not received this local update; its identity/configuration are preserved. Current handoff: the workspace's `docs/build-evidence/first-template-v3.md`.

Sites helper installation/build invocation hit a Windows npm shim/path issue; native `npm.cmd` performed the successful install/build. The same Site ID in `.openai/hosting.json` must be reused; do not create a second project to retry deployment.
