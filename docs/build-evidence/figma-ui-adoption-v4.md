# Figma presentation adopted into Dawat — local version 4

19 October 2026 · The user explicitly authorized implementing the supplied Figma fonts, layout and overall UI direction while preserving our working logic and prioritizing the mobile invitation.

## Implemented

- **Typography:** self-hosted Fraunces (normal/italic), Instrument Sans, Noto Serif Bengali and Hind Siliguri via Next's font pipeline. Upstream OFL notices are in `web/public/licenses/`. Display/UI roles, Bangla shaping/spacing and the heavier display font's sizes were reconciled across surfaces.
- **Storefront:** rebuilt with a layered envelope peek, editorial two-column hero that stacks on phones, wine template feature, four-step order/activation journey, personalized-family explanation, functional FAQ and crafted closing. One real composition remains; palette variations are not sold as extra templates. Public home/catalogue and their key navigation now switch Bangla/English, with optional browser language preference and explicit query priority.
- **Maker:** plain paper form, readable labels and 16px inputs, horizontally scrollable editing steps, mobile Edit details/Preview invitation control, arch-framed desktop cover stage and preserved native preview dialog. Unsaved input remains in the form after preview; saving still does not publish.
- **Workspace:** wedding identity and horizontal tabs replace the sidebar-first layout at all widths. Flat practical surfaces, rule-separated metrics, restrained forest accent, readable controls and the existing responsive response list. Tab IDs/data actions remain our existing implementation.
- **Invitation:** the user's woven SVG envelope/pocket/flap idea is adapted into a shared CSS-module component. Seal release and paper lift reveal the original editable invitation in the existing 1.45s controller. Clear skip, keyboard focus, repeat-tap protection and reduced-motion bypass remain. Fraunces/Noto names, original photographic gallery, live countdown, maps/calendar, RSVP/edit and independent wishes continue; a woven forest closing completes the composition.
- **Cleanup:** removed 285 obsolete global presentation rules, the unused collection CSS module and old two-leaf opening rules. No Tailwind, router or animation runtime was added. The supplied Figma Vite configuration, fixed totals, simulated OTP and draft-as-live implementation were not imported.

Source-adapted artwork: `web/src/components/stationery-art.tsx` and its CSS module. New public composition: `home.tsx`/`home.module.css`. Product presentation: `src/app/product-ui.css`; invitation remains in scoped Jamdani components. Source reference and provenance: [Figma review](../design/figma-source-review.md).

## Logic retained and verified

The workspace domain/persistence implementation was not replaced. Order confirmation and separate dashboard activation remain independent. Draft/published snapshots, allowed guest events, response-derived per-event totals, schema-validated local saves, sample/customer separation, read-only previews, RSVP bounds/deadlines and calendar generation remain.

**43 tests passed in four files.** Five added product interaction regressions cover public locale/link switching without customer-data mutation, explicit locale under storage failure, harmless envelope peeking, unsaved maker preview plus draft-only save, and concrete reply-derived dashboard totals after tab/event changes. The earlier 38 opening/guest/domain tests remain green.

Strict TypeScript (including the final build), source formatting and optimized static export passed. `/`, `/templates/`, `/studio/`, `/order/`, `/dashboard/` and `/invite/` returned HTTP 200 with `no-store`. Served CSS contains the new font families and palette. These HTTP checks do not prove rendered layout or authorization; dashboard access is still the existing frontend demonstration.

## Review and artifact

- Storefront: `http://127.0.0.1:4173/?lang=en`
- Invitation: `http://127.0.0.1:4173/invite/?lang=en`
- Bangla: use `?lang=bn` or the language controls. Public language and guest preferences are separate; explicit guest links retain their scope and locale.
- Preview server intentionally remains available per the user's running-preview request. Refresh an existing tab to fetch the rebuilt assets.
- [Portable static preview](../../.artifacts/dawat-figma-ui-v4-static.zip): **1,705,790 bytes**; extract and run `node scripts/preview.mjs`. SHA-256: `97521b515ec2334a042fc99e07703992840d96dabbb7f3d1a4f70c55f51d5ae8`.

## Remaining limits

Local browser control again returned **disabled in Work settings**. No new rendered mobile/desktop screenshots, real phone walkthrough, text-zoom/paint/contrast/performance result or visual superiority claim is made. The source implements responsive layout, but these remain device/browser qualification tasks. There are 20 built WOFF2 assets across supported families/subsets; actual critical transfer and font-loading behavior must be measured, not inferred from the total artifact.

Sites lookup and fresh source credential requests again returned project-not-found. The original Site identity/audience were retained; changes are local, not deployed over the old hosted v2. Source remains in the existing checkout. No replacement Site was created.

The public home/catalogue and guest flow have localized primary copy; the wider maker/workspace/operator copy is still mainly English. Production auth, shared database, payment, delivery, tenant enforcement and commercial qualification remain unimplemented. The presentation upgrade does not change those boundaries.
