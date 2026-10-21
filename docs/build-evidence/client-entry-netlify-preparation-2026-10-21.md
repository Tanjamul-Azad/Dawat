# Direct client entry and Netlify preparation

21 October 2026, Asia/Dhaka. Implementation and initial live Netlify evidence. This is not full external-client qualification. Extends the [free-first plan](../plans/free-first-product-delivery-2026-10-21.md).

## Implemented and checked

- A verified owner with exactly one active, unexpired wedding enters it directly. The explicit `dashboard/?all=1` list supports account review and multiple weddings. Zero/inactive/revoked/suspended/expired weddings do not auto-enter.
- Allowlisted editor-section URLs survive login return. Unknown queries and external destinations fall back to the dashboard. Wrong-account/unavailable pages offer account switching and support without revealing another owner's email.
- Three contextual destinations: overview, invitation editing, guests/replies. In-desk navigation retains dirty text. Mobile shows all three without a horizontal navigation strip; account/help and the complete wedding list remain in the account menu.
- Overview has actionable preparation steps, then prioritizes inviting guests after publication. Bangla names appear in the Bangla heading when provided. Private workspace and personal invitation purposes are explicit; the workspace URL is collapsed until requested, and the general invitation is labeled view-only. URLs use configured canonical origin, never incoming Host. Clipboard failure supports manual selection; copy never claims a message was sent.
- `DAWAT_SURFACE=pilot` redirects root to dashboard and denies storefront/order/template/studio and staff/MFA routes before auth refresh. Default `all` preserves prior rehearsal/local operator behavior. This is route exposure control in the shared client/guest runtime, **not** four isolated builds, independent cookies or minimal runtime authority.
- `web/netlify.toml` prepares Node22, Next build and `.next` output. Base directory is `web` in Netlify. Private environment data remains excluded from Git.

## Verification

244 tests across25 files, TypeScript, optimized local-QA build and normal hosted-configuration build passed.60 generated public static files were scanned against the actual media server secret and all AES key-ring values: zero matches. The latest pre-UI isolated HTTP/Auth/MFA/Storage rehearsal also passed; this batch adds no schema changes.

Actual `pilot` runtime: root307 to dashboard; storefront/studio/template/order, admin page/API and MFA page/API404; anonymous dashboard307 to login; Bangla login200; existing fictional general invitation200. Responses private/no-store. This checks actual Next routing rather than only a helper.

Fresh local synthetic browser journey: OTP → sole-wedding entry → edit → overview/editor navigation retaining dirty text → draft save → publish → reception-only household allowance3 → personal link → token-free named route → original Jamdani card → reject Bangla count4 → accept2adults+1child → independent private wish → owner report6people across2households → exact wish visible → revoke → existing guest session unavailable. Replies/wishes remained. Final mobile navigation/account-menu changes were rebuilt and visually rechecked. Screenshots in ignored `.artifacts/client-handoff/` contain only fictional data. This session did not repeat every physical-device, zoom or width gate.

Local fixture: `6f00dd33-c942-4867-82bd-78758679ec2c`; new household credential revoked. No real pilot content, ownership or publication changed.

## Hosting state and next acceptance

Netlify team `tanjamul-azad` showed Free,300/300 credits and no card before deployment. Repo `Tanjamul-Azad/Dawat`, main; project `dawat-client-pilot`; base `web`; build `npm run build`; publish `.next`. Owner pasted the9-variable file. Values were checked for exact match without printing credentials. The two private keys were marked Secret before initial deploy; their nonproduction contexts were then cleared, with both entries verified as1value/1context (Production), local access empty. Public config stays ordinary config; the boolean email flag and public key-version identifier are not credentials. No paid upgrade or top-up.

First deploy `6ad8b26f09418b24f4f4397f` published source `a1d97c5`, but runtime was Not set and `.next` was uploaded without working server routes. This was caught through actual dashboard/health404 checks. Enabled the official Next.js runtime in project Build settings, made deploy logs private, selected Node22 and rebuilt without cache. Corrected deploy `6ad8b3dac4442ee91a4ae519` logged Next.js Runtime v5.16.3 and serves the canonical [client dashboard](https://dawat-client-pilot.netlify.app/dashboard/). No framework downgrade or static-export workaround.

Owner explicitly approved opening Production visitor access while retaining Private previews. The saved UI showed Production Public / Deploy Preview Private. Application OTP/membership/guest authority remain separate from the provider's visitor gate.

Live anonymous smoke passed: health200 with redacted `status:ok`; root307/dashboard; Bangla login200; all9 referenced public JS/CSS assets200 (736,769 uncompressed fetched bytes, not a whole invitation transfer measurement); no media/AES secret in those assets; anonymous wedding/export/history/media APIs401; admin/storefront/studio/order/operator/MFA404; foreign-Origin visibility mutation403; invalid email422 without sending mail. Source-bundle/server-manifest/env paths and unknown invitation404. Private responses no-store. First sequential health/login samples around4seconds are observations, not a qualified cold-start benchmark. Evidence in ignored `.artifacts/client-handoff/netlify-live-smoke.json`.

Browser control subsequently reported disabled, including after the owner supplied a screenshot showing the switch on. Live authenticated UI/photo processing, current provider credits/region and complete hosted journey remain unverified on this host. Do not equate health with database access, SMTP delivery or native Sharp processing. No real pilot edits or new access grants occurred.

Owner chose to paste config personally from ignored `web/.env.netlify.pilot.local`, then test their existing verified account. Do not import `.env.qa.local`, print values, create another customer or transfer the wedding to the SMTP sender. Use the existing media secret and every current AES version; no rotation. Follow the [runbook](../ops/client-pilot-runbook.md#netlify-client-pilot-preparation).

After import/deploy: confirm domain and pilot exposure; assets/denials; own-account OTP and separate synthetic upload/publish/guest/report/revoke loop. Qualify host processing/limits and remaining credits. Finish production environment, backup/restore and physical-phone gates before external-client handoff. The original unpublished revision0 pilot and closed hosted QA fixture remain protected. Public catalogue work stays later.

## Returning-client login follow-up

The owner reported that repeated verification appeared necessary. Code review found `/auth/login/` always rendered the OTP form, even for a still-valid verified session. It now checks the provider-verified identity and redirects to an allowlisted intended destination. Only401 renders sign-in; Auth outages retain their error/retry behavior. This does not extend sessions, bypass verification, change account ownership or relax seller MFA. Private persistent cookies and refresh remain existing behavior; no fixed login lifetime is promised.

249tests/26files and TypeScript pass, including5new regressions for returning identity, external-redirect denial, missing session, outage distinction and missing configuration. Fresh isolated local HTTP/Auth/MFA/Storage verification passed after rebuilding: real OTP verification followed by login-page307/dashboard, transactional onboarding/activation, cross-owner denial, concurrent saves, actual max-five image decode/orientation/metadata stripping/private variants, publish retention, guest exchange/replies/wishes/history/export and rotation/revocation. Latest disposable local wedding `da2db0a6-5c92-41fb-846f-4dbe4a45761f`. This follow-up did not touch hosted customer records.

Official [Netlify badge documentation](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/) confirms the per-project badge can be disabled on Free without redeployment: Project configuration → General → Powered by Netlify badge → Off → Save. No CSS concealment, paid upgrade or security-policy workaround added. The requested badge removal is **not completed**: browser connection still reports disabled, even after reinitialization and the owner's Off/On action. Native hosted photo processing, actual returning-client UI and complete Netlify authenticated rehearsal remain open. No synthetic Auth session is substituted for the owner's login.
