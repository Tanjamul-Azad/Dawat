# First full Jamdani guest-template frontend

19 October 2026 · Local implementation checkpoint. The user explicitly authorized implementing the first complete template: opening, photographs, countdown, maps, RSVP, Bangla/English and mobile-first premium design. The visual comparison exercise no longer blocks this requested implementation; final design/production qualification remains open.

## Implemented

- Original woven-paper jacket, monogram/seal release and two paper leaves opening to the live invitation. The controller has closed/opening/open states, 1.45s completion, immediate skip, reduced-motion bypass and cleanup. Natural scrolling and a compact section navigation reach practical details without waiting.
- Complete **Bangla/English guest template** dictionaries, localized names/hosts/message/event fields, dates/times/counts and accessibility/action/error labels. Explicit or scoped preferred locale resolves to Bangla by default. Switching does not remount the form/opening or change guest identity. Customer names are never translated automatically. The wider storefront/editor/admin are not yet completely localized.
- Live countdown from actual permitted event instants in Asia/Dhaka; invalid date/time handling, no negative countdown, next upcoming permitted event and past state; interval pauses while the document is hidden and resumes on visibility.
- Coordinated inside composition: names/welcome, countdown, editorial celebration programme, portrait/landscape photo treatment, RSVP, private wishes and closing. Original generated couple/detail photos are labelled fictional; no competitor media was reused.
- Photo lightbox, next/previous, failed-image fallback and designed no-photo section. The studio accepts up to five JPEG/PNG/WebP/AVIF files, resizes locally, allows removal/reorder/focal alignment and descriptions in both languages. HEIC/unsupported/oversized inputs report errors; there is no production upload/storage pipeline.
- Event-specific Google Maps links; click-loaded map iframe; Copy address with selectable text on clipboard failure; localized ICS download with timezone-correct start, a two-hour calendar duration, escaped values and UTF-8-safe line folding. Map points refer to fictional demo venues; no exact real venue identity is asserted.
- Functional RSVP accepted/declined, adults/children in Bangla or English digits, party allowance, event scope, edit receipt, deadline revalidation and truthful save-error feedback. Independent text wishes do not alter headcounts. These persist only in browser storage.
- Public demo answers are isolated in `dawat-guest-sample-v1`. Customer draft/order/host state uses `dawat-studio-sandbox-v1`. Read-only customized preview remains read-only; general published customer links use `?live=1`; household links use `?guest=...`. These are demo routing/data boundaries, not authentication or secure cross-device guest tokens.
- Bilingual publication check for names/wording/event content/photo descriptions. Optional new fields keep older saved workspaces parseable; missing translations must be completed before publication.
- Removed 137 obsolete guest styling rules when replacing the old guest layout with scoped components. Added no animation runtime library or paid map dependency. Test-only JSDOM/Testing Library and patched Vitest are development dependencies.

## Paths and use

Source: `web/`. From that directory:

```powershell
npm run dev
# http://127.0.0.1:3000/invite/
# http://127.0.0.1:3000/invite/?lang=en
```

For the built export:

```powershell
npm run preview
# http://127.0.0.1:4173/invite/
```

Use Ctrl+C to stop either server. The task's temporary verification server was stopped. The static export is in `web/out/`; an HTML file should be served over HTTP rather than opened directly as a file URL.

Portable artifact: [static preview package](../../.artifacts/jamdani-template-v3-static.zip), 1,518,998 bytes. Extract, run `node scripts/preview.mjs`, then open the printed invitation URL. It includes only the built export, local server script and instructions; source is in the workspace. SHA-256: `79f8f71d48f4393f5f14f3bc6bce4e11390bf3d08262725246395c3c37027414`.

## Verification actually performed

| Check | Result |
|---|---|
| Automated tests | **33 passed in three files**: ten original workspace-domain, thirteen new invitation/content-domain and ten simulated-DOM interaction tests |
| Strict TypeScript | Passed, including unused locals/parameters |
| Source formatting | Prettier passed for source/scripts/test configuration |
| Optimized export | `npm run build` passed; eight application/error routes exported |
| HTTP smoke check | Local built `/invite/` returned 200 HTML and generated WebP returned 200 with `image/webp`; no browser rendering inferred from these responses |
| Dependency audit | Zero reported vulnerabilities at this checkpoint; Vitest 5.0.5 resolves advisories detected in the earlier test runner |
| Image assets | Original files copied into `web/design-source/`; served derivatives are 183,788 and 109,536 bytes, in addition to the earlier cover art |

Interaction tests verify opening completion without replay on locale change, skip cancelling animation state, reduced-motion bypass, Bangla digit input preserved through English switch, response update/decline, wish independence, customer/sample separation, read-only previews, reception-only links, quota failure without false success, lazy map creation/removal and lightbox navigation/failure fallback. JSDOM is a simulated DOM: it does not render the CSS or contact Google.

## External blockers and remaining qualification

**Browser control:** `Local browser use is disabled in Work settings`. The requested cleanup of earlier task-created browser tabs could not be performed through the disabled interface. No browser process was killed and no setting was changed to bypass it. This update has no new browser screenshots or completed visual/real-device review. Prior v2 screenshots do not show this implementation.

**Publication:** both Sites lookup and fresh credential requests for existing project `appgprj_6ad5bd38375881919d603156d5d87b77` returned `SitesConnectorError: Sites project not found`. Source-helper opening then failed because no credential was returned. The same checkout was retained and edited locally; no new Site was created, no access policy changed, no push/deployment succeeded. `.openai/hosting.json` still identifies the original project. The old hosted URL therefore remains the previous version.

Physical phones/in-app browsers, text zoom, actual shaping/line breaks, animation paint/focus appearance, photo decoding/compression/canvas paths, external Maps rendering, clipboard/download behavior and real performance budgets still need browser/device evidence. No CWV/payload target is marked passed from source inspection. [TE01–TE60](../specs/template-experience-quality.md) remains the release matrix; these 33 tests are not all 60 qualification scenarios.

Real identity, tenant enforcement, verified payment, server storage/upload, shared RSVP database, transactional publication and delivery remain production work. The template frontend is functional local prototype code; it must not be represented as a paid-service release or verified best-in-market design.
