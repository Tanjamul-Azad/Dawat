# Netlify authenticated client and guest rehearsal

21 October2026, Asia/Dhaka. Host: `https://dawat-client-pilot.netlify.app`. UI fixes published through `a243fe8`;252 tests/26 files, TypeScript and optimized production builds pass. Extends [initial deployment evidence](client-entry-netlify-preparation-2026-10-21.md). This is a synthetic hosted rehearsal, not full external-client release approval.

## Identity and test scope

Browser control recovered. The existing verified owner's genuine persisted session opened the dashboard; no substituted Auth session, staff grant, ownership reassignment or MFA bypass. Opening login with this valid session returned to the dashboard without another OTP. Customer identity and shared SMTP/support identity remain distinct.

Isolated synthetic wedding `fc74ca23-1236-4ec5-9592-779eba342bc5` was provisioned for that owner using the existing staging server credential, an explicit zero-amount test exception and a one-day term. Creation/closeout were attributed in audit records. This setup was not a rehearsal of hosted seller MFA. Original pilot `e2c385fd-247e-4379-8317-6a359e2c89c3` remained unpublished at draft/publication revision0; before/after SHA256 of selected wedding fields and complete draft matched.

## Observed hosted journey

- Saved fictional Bangla couple/family/message details and two dated/timed events in Asia/Dhaka. Only reception was selected for the general invitation; nikah stayed restricted.
- Uploaded five fictional JPEGs through the actual browser chooser and Netlify server. Added localized description/top focus, reordered and saved. Reload retained the arrangement. A sixth gallery upload was disabled at5/5.
- Native processing converted1200×800 JPEG/EXIF orientation6 to800×1200 WebP. Read-only download inspected three private variants:320×480/2,150bytes;640×960/4,778bytes;800×1200/6,354bytes. EXIF/orientation metadata absent. All five assets ready. No personal photos uploaded.
- Removed one gallery entry, saved and released its unused slot through the UI. A5,184,714-byte synthetic JPEG selection successfully passed browser preparation and hosted processing:1600×1067 ready result,1,179,438bytes across variants. Reload retained five draft photos. Earlier publication retained its original five-photo snapshot; six asset records/objects retained.
- Private preview had no reply authority. Published the invitation; general card showed only reception, five photos and the view-only personal-link instruction. Gallery/lightbox images loaded, including the800×1200 full variant.
- Created one fictional household with localized greeting/message, owner-only note and reception allowance3. Copied a canonical HTTPS personal link; exchange reached a token-free household route. Guest saw the correct family/reception, with no restricted nikah venue or owner note.
- Bangla count4 rejected. Bangla2adults+1child produced a server-confirmed receipt. Independent wish succeeded. Owner refresh showed one attending household,3people,2adults+1child and the exact wish. Nikah report stayed zero. Recopy retained the credential.
- Revoked through its confirmation dialog. The already-established guest session returned unavailable on reload. Paused publication; general-card reload also unavailable. Replies/wish retained.

Native date/time `fill()` in this browser adapter did not dispatch the same state update as keyboard editing. Keyboard changes completed the controls; subsequent save/reload/publication retained dates/times. This adapter limitation is not evidence of a customer data-loss defect.

## Defects fixed and checked again

1. Authorized draft/household previews reused buyer-order copy and the pilot-blocked `/studio/` shortcut. They now explain close/edit/publish/personal links. Public design samples retain their own behavior. Two regressions cover owner-preview modes; live preview showed correct copy and no shopping shortcut.
2. Paused sharing said to publish first. It now explains resuming existing links and retaining replies/wishes. Regression and live paused overview passed.
3. At320px the sticky save bar stacked actions and obscured excessive editing space. Mobile actions now share one row: measured96px bar and44px targets. Verified saved/disabled state.
4. At390px the account popover extended left of the viewport. It now anchors to the header with bounded height/scrolling. Rechecked320/390px: full popover and account/help links within viewport.

Actual viewport checks: editor320px; guest hub390/768/1366px, no document horizontal overflow. Three-item navigation and account/help access remained usable. Browser viewport checks do not replace physical Android/iPhone,200% zoom, touch/keyboard or assistive-technology acceptance.

The owner's badge-Off action is now visually verified: no Powered by Netlify badge on hosted workspace screenshots. No CSS concealment or paid upgrade. Ignored proof files under `.artifacts/client-handoff/`: `netlify-rsvp-report.jpg`, `netlify-editor-320-fixed.jpg`, `netlify-account-390-fixed.jpg`. They contain fictional wedding/guest data and the owner's account email. Raw guest credentials are not tracked evidence.

## Closeout and remaining gates

Synthetic wedding paused, household credential revoked, dashboard grant revoked, membership inactive. One accepted2+1 response and one wish retained with audit. Owner fixture reload was also denied after closeout. Original pilot hash matched. Real dashboard's sole-wedding entry restored after closeout. No permanent customer deletion.

Netlify confirmed Free/$0/no card. Initial inspection after three published builds showed254.5/300credits remaining. Later displayed224.1/300, accounting for five builds/75credits and0.9usage credits; the sixth already-published UI fix was still pending in that delayed billing count, so reserve another15credits. This is not a traffic/uptime promise. No paid upgrade, trial, top-up or metered add-on. Skip documentation-only deployments.

Still open: production-vs-staging decision; DB+Storage+all-AES-version backup/restore drill; measured Bangladesh cold/warm latency and complete guest transfer; deployed region/time/memory limits and near10MB input qualification; independent client/guest/operator runtime/session authority; intended hosted seller MFA/bootstrap; physical Android/iPhone and200% zoom. Current profile hides staff/storefront routes in a shared runtime, not four isolated deployments. Own-account hosted testing can continue; do not mark every launch gate complete.
