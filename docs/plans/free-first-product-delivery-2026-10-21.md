# Dawat — free-first design, onboarding and delivery plan

21 October 2026 · Asia/Dhaka. **Current execution plan**, requested after the audience/separation review. User budget: **BDT 0 for new hosting/services**. Preserve the working Jamdani invitation, real backend, issued identifiers and customer records. This document schedules future work; unchecked tasks are not implemented or deployed.

## 1. Outcome and constraints

Deliver one usable wedding first: the seller assigns the intended client, the client signs in and edits/publishes, sends household invitations, and sees correct replies/private wishes. Then finish the public buying journey. Four audiences have distinct navigation, layout, session and API responsibilities. One repository and versioned renderer are shared; a new deployment/database is not created for each wedding.

The existing personal preview is verified on Vercel with 228 tests, seven migrations and a fictional upload/publish/RSVP/wish/revoke rehearsal. The real pilot remains an unpublished revision0 draft. Those results are the baseline, not evidence that future host changes or new onboarding screens pass. See [hardening evidence](../build-evidence/client-pilot-hardening-2026-10-21.md).

- Spend ceiling is zero: no paid upgrade, trial that auto-converts, recharge, credit pack, purchased add-on or new domain. Free provider URLs first; the user's existing domain is optional later and its renewal is a separate existing expense.
- No provider/account/project is created by this planning change. Existing private keys stay private; new-platform secret import and account setup are handled at the actual handoff step.
- One controlled wedding pilot; no invented household capacity, uptime, unlimited usage, lifetime hosting or free-forever production guarantee.
- Prioritize a working client/guest experience over catalogue expansion. No framework rewrite merely to claim a free deployment.
- Keep publishing, order confirmation, payment verification, management activation and guest visibility as separate states.

## 2. Hosting decision and measured gates

**First compatibility candidate: Netlify Free + existing Supabase Free + current Gmail SMTP.** Netlify explicitly allows commercial projects on Free, and documents Next.js support. This makes it a candidate for the later real pilot; compatibility, remaining credits and measured capacity must still pass. Vercel Hobby remains personal/non-commercial rehearsal only. A custom domain does not change that restriction.

| Provider | Role and verified constraint | Decision |
| --- | --- | --- |
| Vercel Hobby | Personal/non-commercial only | Preserve current personal test preview; never label a paid-client service personal to bypass terms |
| Netlify Free | Current new-plan allowance300 credits/month, hard cap; published production deploy15 credits; bandwidth20 credits/GB; functions10 credits/GB-hour; requests2 credits/10k | First full Next.js compatibility spike; inspect actual account plan before using these numbers |
| Supabase Free | Pricing lists500MB database,1GB files,5GB egress plus5GB cached egress; inactivity pause after one week; two active projects | Keep local Docker for development and Dawat Staging for synthetic proof; inspect actual organization usage before creating production environment |
| Cloudflare Free | Workers100k dynamic requests/day and10ms CPU/invocation; static asset requests do not incur Worker request charges | Secondary route, particularly static storefront; current Node Sharp processor and runtime must be qualified before a full migration |
| Render Free | Idle service sleeps after15min, cold start about1min,750 runtime hours shared/workspace; provider advises against production | Node compatibility fallback for rehearsal, not primary guest-facing recommendation |

Netlify credits are shared by the team; exhaustion can pause **all its sites**, despite origin isolation. Four sites do not mean four free credit allowances. Prefer local testing and preview builds, then promote only reviewed releases. Previews avoid the production-deploy charge; they do not imply unlimited free function/traffic usage. Do not deploy all four apps on every doc/code commit or manufacture extra accounts to evade quotas.

Initial planning envelope: at most two coordinated four-site release waves/month means120 deploy credits, leaving180 for all other usage and emergency deployment. This is a budget example, not a traffic promise. Actual formula: `credits ≈ 15×publishedDeploys + 20×GBDelivered + 10×GBHours + 2×requests/10000`; meter applicable provider rounding/resources too. For example,8 published deploys +2GB delivery +0.5GB-hour +50k requests ≈175 credits. Recalculate from the actual account. Avoid metered AI/database add-ons; keep the existing Supabase backend.

Internal operating thresholds: inspect usage at50%, stop nonessential deploys/new activations at70%, and at85% stop new onboarding and review reserve for existing guests. These are our proposed actions, not an automatic provider cap or a guarantee that existing traffic cannot exhaust the remainder. No auto top-up. Measure Supabase egress separately: private photo proxies can consume both Supabase egress and frontend delivery credits.

**Hosting spike acceptance (FT01):** exact Next16/Node22 app builds; proxy/cookie updates and OTP return paths work; native Sharp bundles in a Node function; 8.9MB selection is prepared below3MiB and processed within actual host time/memory/body limits; private variants/revocation work; all management responses remain no-store; latency from Bangladesh and one complete guest page transfer are measured. Record cold/warm behavior, deployed function region, quota and errors. Current Vercel duration120s is not portable proof. No static export for authenticated server routes; no removal of authoritative image validation to fit a host. If this fails, report the measured blocker and evaluate one bounded alternative before changing the working app.

## 3. Four surfaces and design contract

| Surface | Visual character and hierarchy | Primary navigation / actions | Must be absent |
| --- | --- | --- | --- |
| Public storefront | Editorial Bengali invitation atelier, rich original artwork and composed whitespace | Designs → sample → package/details → order/contact; discreet “ক্লায়েন্ট প্রবেশ” | Client guest lists, real wedding directory, operator link, fake checkout or fake available themes |
| Client workspace | Calm ivory reading surface, dark ink, forest practical accents, restrained wine commit action; compact forms/rows | সারসংক্ষেপ · আমন্ত্রণ · অতিথি ও উত্তর; account/help secondary | Marketing ribbon, shopping navigation, simulation state, staff controls |
| Guest invitation | Existing full-screen Jamdani stationery, deliberate opening, mobile-readable names/events and optional photo reel | Open → event details → scoped RSVP → private wishes | Dashboard/sidebar/order/admin menu, guest identity entry, unauthorized events/host notes |
| Operator | Focused tables/details, strong independent payment/access/publication status | Orders → review/confirm → assign → activate → copy handoff; audit/support | Public menu entry, client-style fake statistics, staff self-grant |

Shared brand tokens do not impose one page composition. Scope CSS by surface to prevent inherited layout rules; separate font/display roles and only load the selected invitation art. Maintain4/8/12/16/24/32 spacing,16–20px mobile gutters,16px phone fields, normally14px helper text and44px targets. Bangla is primary, English secondary; long Bangla names wrap, essential information is never ellipsized. Desktop form column480–640px; preview only when both columns remain usable. Avoid repeated huge cards/blank vertical space. Verify320/390/768/1366px plus200% zoom.

Client navigation has **three primary destinations**, not separate Guests/Replies/Wishes screens competing in the sidebar. Replies and wishes stay within “অতিথি ও উত্তর”. Before publish, overview is a checklist; afterward it prioritizes invite/reply tasks and correctly scoped status. For the first single-wedding client, land directly in that wedding; retain “আমার আয়োজন” as the secondary list for multi-wedding accounts. Switching weddings with dirty changes requires explicit handling.

Desktop guest rows align name, allowed event/capacity, answer and actions. Mobile rows become compact family summaries with details on demand. Never display loading as zero replies; saving/failed/conflict states remain next to the affected work. One dominant action per section. Mobile sticky actions must clear the keyboard/safe area and must not stack with another navigation bar.

## 4. Client onboarding — direct handoff first

Launch does not require a new public claim-token system. Use the existing verified-owner membership and explicit manual activation, then provide a safe deep link. Introduce claim tokens later only if the actual distribution workflow needs them; never use a permanent management URL as a password.

| Step | Proposed experience / work | Required failure and exit behavior |
| --- | --- | --- |
| O01 Seller prepares | Record actual customer/wedding, package/term and manual verification or explicit complimentary/test exception | No fabricated paid status; review intended recipient before activation |
| O02 Activate and hand off | Separate activation action, clear confirmation and copyable private workspace link/instructions | Replay must not create another wedding; no automatic message sending; assignment correction requires verified audited process |
| O03 Client enters | Direct wedding URL → Bangla login → OTP → same safe destination; signed-in authorized user skips extra entry screens | Wrong account offers switch/support; no disclosure of another client's email; expired/invalid/rate-limited OTP distinct; resend timer/retry retained |
| O04 Access states | Active, waiting confirmation, waiting activation, suspended/revoked and unavailable states have useful copy | Login alone never grants editing; “Refresh access” only refreshes real state; network failure is not shown as revoked/no weddings |
| O05 Start invitation | Short checklist: names/wording → one/two events → optional photos → review/publish | Save incomplete drafts; autosave is authoritative only after ack; resume where useful without a mandatory tour |
| O06 Review and publish | Show public-vs-personal event visibility, zero/five-photo preview, actual expiry and draft/live impact | Failed publish preserves last live version; no reset of term; assigned/responded event removal stays guarded |
| O07 First household | Inline guidance for family name, greeting, allowed event and total allowance | Name supplied by host; scoped preview is read-only; guest never enters a new identity |
| O08 Share and confirm | Separate “নিজের কর্মপরিসর” from “অতিথির ব্যক্তিগত আমন্ত্রণ”; copy/share current stable invitation | Copy does not rotate/recreate; cancellation of share is not reported as sent; general link visibly view-only; never send localhost |
| O09 Return and manage | Selected-event reports, search, wishes, correction/history/export and pause controls | Per-event units/timestamp, no false unique-person totals, empty vs failed/loading distinguished; expired session retains unsaved text |

The customer handoff contains wedding title, private workspace action, invitation-sharing instructions, support and order reference where authorized. Mark “এই কর্মপরিসরের লিংক অতিথিদের পাঠাবেন না”. Opening the workspace URL still requires login/access. Shared product SMTP is one sender (`valtube101@gmail.com`), not a mail account per client. Account identity remains the client's verified email; changing support branding must not reassign an owner.

## 5. Guest, operator and future public flows

**Guest:** personal bearer link → current credential validation → token-free household route → sealed named cover → deliberate opening → permitted events/photos → attend/decline with allowance → server receipt → independent private wish. Check repeated taps, Bangla digits, children/adults, scope/deadline changes, cookies blocked, interrupted response, expired/rotated/revoked link and existing sessions after revocation. General invitation has no RSVP authority. A forwarded personal link remains possession-based; label this privacy model honestly. Never leak private note, other recipients, private responses or restricted venue through HTML/metadata/calendar/image payloads.

**Operator:** explicit sign-in → staff check → MFA → actual orders → review recipient/payment/term → confirm/provision → separate activate → copy handoff → audit. Keep no-privilege and MFA-needed states distinct. SMTP email is not a staff grant. Hosted bootstrap requires the intended verified identity and an attributed grant; MFA secret/OTP setup is a user handoff. No client credentials are shared with the seller.

**Future buyer:** catalogue → one actually available Jamdani product → explicitly fictional demo → clear package/hosting/edit/privacy terms → order/contact → truthful pending review → seller confirmation/activation → private workspace. “নিজের মতো সাজান” must not unexpectedly drop a new buyer into an unactivated editor. Use “নমুনা দেখুন” and “অর্ডার/যোগাযোগ” distinctly. Pending order status needs scoped authentication. Automatic payment gateway, payment-proof uploads, multiple templates, bulk messaging and guest OTP remain later work; no inert payment button posing as a working checkout.

## 6. Separation implementation

Build logical boundaries first; isolate runtimes in incremental extractions after FT01. Proposed repository shape is `apps/{client,invitation,admin,storefront}` plus shared contracts/locale tokens/pure renderer packages. This is a target, not a folder move already done. Keep npm and the lockfile; avoid an incidental UI/state-management rewrite. The pilot work order is client+guest, then operator, then public storefront; all four are release targets, not four redundant copies of the current full build.

- Each target includes its own allowed page/API routes. Marketing gets no media secret/AES ring; invitation does not handle owner/admin session transport; client build has no admin endpoints. Separate host-only cookies for client and operator, independent logout and MFA policy; no parent-domain cookie or wildcard credentialed CORS. Default-deny unknown hosts/roles and test generated deploy URLs too.
- Replace overloaded APP_ORIGIN with explicit validated surface origins and per-surface mutation-origin checks. Generate guest links from configured invitation origin. Keep redirects/return paths allowlisted; never pass sessions in query strings. A host alias alone is not a route/runtime boundary.
- Audit the current broad Supabase media key. It is server-only today, but a split must not copy it to every runtime. Design restricted media-serving/processing authority before declaring a smaller backend compromise radius. Retain wedding constraints/RLS on direct API calls.
- Keep publication, event, household and media identifiers unchanged. Retain every guest AES key version. Qualify old-host path/redirect compatibility and referrer/log redaction before cutover. New origins require a new login session; existing localhost/Vercel cookies do not migrate automatically.
- Separate layout/CSS/CSP, private no-store, noindex and log policy. No marketing pixels/session replay on personal cards/workspaces. Preserve frame protection; a cross-origin owner preview needs a deliberately restricted bridge, not a global frame-policy removal.
- Local Supabase remains the development/test backend. Existing Staging is synthetic. Before real client data, inspect the account's available free-project slot and establish a distinct production environment or explicitly retire synthetic staging with backup/clean migration; do not silently mix environments or alter unrelated projects to free slots.

## 7. Ordered work batches

| Order / IDs | Scope and concrete deliverable | Acceptance before advancing |
| --- | --- | --- |
| 1 · FT01 / UX01 | Netlify exact-app deployment spike plan/config; route inventory; fix prototype CTA/modal wording and simulation exposure; screenshot-backed compact entry/overview design | Host capability/usage evidence plus clear buyer/client entry; no runtime/secret weakening; baseline228 regressions retained |
| 2 · UX02–UX04 | Direct wedding landing, safe OTP return/wrong-account/access states, optional short onboarding and first-publish checklist | Fresh client follows handoff without knowing route names; denied user sees useful next action without data leakage; refresh/resume works |
| 3 · SEP01–SEP03 | Extract client and guest boundaries, explicit origins, session isolation, minimal authority and legacy link compatibility | No owner/admin APIs/session on invitation origin; foreign-tenant/media/export/history denials; old invitation/QR/link still works as designed |
| 4 · UI01–UI03 | Focused overview/editor/mobile guest hub; published-vs-draft summaries, upload/recovery states and two-link sharing | Actual desktop/mobile user loop, long Bangla names, one/two events,0/1/5 photos, interrupted edit/upload, last-live preserved |
| 5 · ADM01–ADM03 | Separate operator surface, intended seller bootstrap/MFA, recipient review/activation and copyable handoff | Customer/guest denied every staff action; duplicate activation replay-safe; audited correct recipient; no email automatically sent |
| 6 · FREE01 / OPS01–OPS03 | Meter actual pilot transfer/compute; encrypted DB+object+AES backup/restore; bounded cleanup/usage/availability checklist | Recovery drill and remaining quota for forecasted guest window; retention/support/term choices explicit; one physical Android/iPhone user journey |
| 7 · PILOT01 | Rehearse synthetic roles after split, then one client pilot only after gates pass | Edit→publish→named link→second-device RSVP/wish→owner report→revoke/pause; no P0/P1 access/data-loss defect; disclose free-service outage risk |
| 8 · PUB01–PUB03 | Finish one-theme storefront, manual order/status/support and policy UX | Honest available product and state labels; public SEO only for intended pages; client/guest links and live publication unaffected |

FT01 is a small bounded compatibility spike, not a provider migration before every design task. If it fails, continue provider-independent UI/onboarding and security work. Keep an explicit blocker/evidence item rather than pretend launch is ready. Add focused tests for each changed boundary; do not reset the existing audit or mark all corner cases covered by the test count.

## 8. Review loop and stop conditions

For each batch: inspect current logic → implement a bounded slice → relevant tests/typecheck/build → use it as the actual role in browser → record an actionable defect → fix/retest the affected journey. End a loop when the journey and regression checks pass; reopen only on a new issue. Keep synthetic fixtures isolated, revoke/pause their access afterward, retain audit evidence and leave the real pilot unchanged until an intended edit.

| Check | Required scenario |
| --- | --- |
| Identity/access | Logged out, intended owner, other owner, stale/revoked grant, ordinary customer vs admin, MFA insufficient, guessed IDs/host aliases |
| State consistency | Slow/offline/503 vs auth expiry, stale saves, two tabs, uncertain ack, stale publish, assigned event removed, deadline/scope race |
| Media/privacy | Oversize/corrupt/wrong-type/HEIC, orientation, max-five race, processing failure, private variants, removal vs pinned publication, revoke while gallery open |
| Interaction/layout |320px, long names,200% zoom, keyboard/focus, mobile keyboard/sticky bar, back/refresh/deep link, language switch, reduced motion/audio controls |
| Guest/report |0/over-limit/Bangla counts, decline, retry/edit, independent wish, no-reply/loading/error, per-event totals, correction history/CSV scope |
| Host/recovery | Native dependency/runtime limits, HTTPS/cookies/cache/log redaction, quota exhausted, provider paused, compatible rollback, DB+files+keys restore |

Free hosting does not remove database/privacy/recovery requirements. Minimize expense through scope, compression, bounded queries, explicit refresh and release discipline—not weaker authorization, public buckets, dropped validation, forced auto-delete, periodic fake-traffic keep-alives or usage-limit evasion. If remaining capacity cannot cover an actual wedding's expected window, do not activate another wedding or promise continuous access. Preserve export/offline event information as an agreed fallback; it cannot replace live RSVP availability. No paid fallback is assumed without a later budget change.

## 9. Sources checked for this decision

Verified21 October2026; inspect actual account plan and recheck at deployment. Newer current pricing takes precedence over historical announcement quota numbers.

- [Vercel Hobby terms](https://vercel.com/docs/plans/hobby).
- [Netlify commercial-use statement](https://www.netlify.com/blog/introducing-netlify-free-plan/), [current pricing](https://www.netlify.com/pricing/), [credit rules](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/), [team-wide pause behavior](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/), [Next.js runtime/adapter and limitations](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).
- [Supabase pricing](https://supabase.com/pricing). Existing Gmail SMTP delivery is verified project evidence, not an unlimited-volume promise.
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [current Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). The guide currently recommends beta vinext and links other deployment paths; do not blindly add an older adapter or replace Next based on stale assumptions.
- [Render free-service limits](https://render.com/docs/free).

Related: [surface/security review](../design/surface-separation-review-2026-10-21.md), [96-case audit](../qa/client-v1-audit-matrix-2026-10-21.md), [design contract](../../website-design.md), [deployment/recovery runbook](../ops/client-pilot-runbook.md).
