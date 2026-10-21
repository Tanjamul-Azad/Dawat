# Direct client entry and Netlify preparation

21 October 2026, Asia/Dhaka. Implementation/local evidence, not a completed Netlify release. Extends the [free-first plan](../plans/free-first-product-delivery-2026-10-21.md).

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

Netlify team `tanjamul-azad` showed Free,300/300 credits and no card. Repo `Tanjamul-Azad/Dawat`, main; available name `dawat-client-pilot`; base `web`; build `npm run build`; publish `.next`. Deployment has **not** run. Native Sharp, cold start, consumption and HTTPS end-to-end proof remain open.

Owner chose to paste config personally from ignored `web/.env.netlify.pilot.local`, then test their existing verified account. Do not import `.env.qa.local`, print values, create another customer or transfer the wedding to the SMTP sender. Use the existing media secret and every current AES version; no rotation. Follow the [runbook](../ops/client-pilot-runbook.md#netlify-client-pilot-preparation).

After import/deploy: confirm domain and pilot exposure; assets/denials; own-account OTP and separate synthetic upload/publish/guest/report/revoke loop. Qualify host processing/limits and remaining credits. Finish production environment, backup/restore and physical-phone gates before external-client handoff. The original unpublished revision0 pilot and closed hosted QA fixture remain protected. Public catalogue work stays later.
