# Public site, client workspace, invitations and operations

21 October 2026 · Asia/Dhaka. Architecture/UX review requested by the product owner. **Recommendation, not an implemented domain/deployment split.** Existing personal Vercel preview remains unchanged.

## Finding

The four audiences can belong to one product and link to one another deliberately. A URL, hidden navigation item or different page design is not an authorization boundary. A shared code repository does not require a shared browser origin, session or deployment. Conversely, different subdomains do not remove the need for tenant checks.

Current implementation uses one Next.js deployment:

| Surface | Current routes | Actual boundary |
| --- | --- | --- |
| Public prototype | `/`, `/templates/`, `/order/`, `/invite/` sample | Fictional/demo content; public sales flow is unfinished |
| Customer | `/dashboard/`, `/weddings/:id/`, guest management | Verified user, active membership/grant and database policy |
| Operator | `/admin/orders/`, admin APIs | Active server-controlled staff role plus AAL2, also checked in database commands |
| Guest | `/i/:slug/`, named link exchange and household routes | Published scope, household credential/session, expiry and current revocation; general route is view-only |

Evidence: `web/src/proxy.ts`, `server/auth.ts`, `server/supabase.ts`, `server/guests.ts`, `server/http.ts`, foundation/guest migrations and production frame. Management cookies are HttpOnly, Secure on HTTPS, SameSite=Lax, host-only by omission of Domain, with Path=/. Guest cookies have narrower household paths, but cookie Path is not a security boundary. Staff currently uses the same Auth cookie transport as customers, with an additional role/AAL2 gate. No separately isolated operator origin/session exists yet.

The live guest route renders the card without the marketing header or management navigation. The current prototype About-preview modal still links to an operator simulation, while production `/operator/` redirects to protected `/admin/orders/`. Its browser-only simulation/auth wording is stale for the integrated product. The public “Make it yours” CTA redirects via `/studio/` to the real dashboard and can create an unexpected sign-in/locked-access journey. These are concrete UX/prototype cleanup tasks; they do not establish an authentication bypass.

All routes inherit root typography/global CSS and current noindex metadata. There is no configured application CSP in `next.config.ts`; existing nosniff/no-referrer/framing protections are useful but not equivalent. Shared-origin public script compromise could act with an authenticated visitor's privileges even when HttpOnly prevents reading the session cookie. Admin MFA does not neutralize script running in that authenticated origin.

## Recommended product map

Illustrative reserved `.example` addresses, not the user's purchased domain:

| Surface | Example | Design and navigation | Deployment responsibilities |
| --- | --- | --- | --- |
| Storefront | `www.dawat.example` | Editorial template catalogue, explicit sample, package/order/contact, discreet client sign-in | Public-safe content and narrowly scoped order intake; no management/media processor secret |
| Client workspace | `app.dawat.example` | Compact Bangla workspace; edit, preview, publish, households and responses; direct wedding deep link after login | Owner services and authorized photo preparation/processing; no operator routes |
| Guest invitation | `invite.dawat.example/i/:slug/...` | Full-screen wedding stationery; named welcome, events, photos, RSVP/wish; no shop/dashboard/admin menu | Published scoped reads and guest commands only; no owner/staff session handling or exports |
| Operations | `admin.dawat.example` | Orders, assignment, activation, audit and support; compact operational tables | Separate operator session transport, verified staff/AAL2 and audited actions; no public navigation entry |

Target: four bounded applications/deployments in one repository, shared pure contracts, locale tokens and versioned invitation renderer. Keep one multi-tenant backend per environment with wedding-scoped policies/composite constraints. A wedding is a data tenant, not a new deployment/database. A separate database for every wedding adds provisioning/migration/backup overhead without replacing correct access checks. Stronger per-tenant infrastructure can be evaluated if future contracts require it.

This target adds deployment/configuration and cross-origin preview complexity; it is not a prerequisite to the current personal rehearsal. First define modules and remove prototype ambiguity, then isolate privileged operations and guest rendering, then connect the finished storefront. Do not split by copying entire working apps or duplicating business rules. A full domain purchase per wedding, wildcard wedding subdomains and custom-domain onboarding remain optional later features.

## Security rules for the split

1. **Routes and runtime authority:** attaching four aliases to today's complete build does not separate its APIs or secrets. Each build should contain its allowed route families and dependencies only. Fail closed on unexpected hosts. Test Vercel generated deployment URLs and aliases too, not just canonical hosts. A host router can be a transition, but does not isolate process/env compromise.
2. **Sessions:** host-only distinct customer/operator cookies, no parent-domain Domain setting, independent logout/expiry, operator MFA/recent verification as appropriate. Guest serving must neither refresh nor accept owner/admin sessions. Same-site sibling subdomains remain a CSRF consideration: validate the exact allowed mutation origin and request shape; no wildcard credentialed CORS. Session isolation does not replace database staff/tenant checks.
3. **Least privilege:** keep ordinary requests on user/guest-scoped APIs and RLS. Audit where the current media processor secret is required. The existing Supabase server key is broadly privileged; giving it to every new runtime would preserve a large backend compromise radius. Design restricted media reads/processing authority rather than claiming host separation alone solves that risk. The storefront must not receive this key or the recoverable guest-link AES ring.
4. **Content:** allow structured text and validated images, not arbitrary client HTML/JavaScript. Scope CSS and CSP by surface, keep marketing pixels/chat/session replay off private workspace and personal invitation routes. Test CSP against Next hydration, inline requirements and actual fonts/media before enforcement.
5. **Tenant data:** check wedding, event, household, media and current grant on every applicable request; anonymous/general and named guest payloads stay distinct. No customer directory or wedding discovery in the storefront. No private IDs/notes in public analytics, referrers or error reports. Noindex discourages indexing; it does not protect access.
6. **Link privacy:** a personal invitation link is a bearer credential and can be forwarded. Current named access is possession-based, not proof that the reader is the named person. Rotation/revocation and scoped allowance help; recipient OTP would be a separate optional privacy mode with added friction. A management deep link is just a destination and always requires verified login/access.
7. **Independent release:** promotion and rollback must preserve schema/renderer compatibility, media grants, published snapshots and guest AES key versions. Separate staging and real production data before commercial launch. Shared database/provider outages still affect multiple surfaces.

## Delivery and migration acceptance

- Give each customer two clearly named actions: **Open your workspace** (private, do not share) and **Share invitations** (guest links). Direct workspace login retains the intended wedding and shows a useful wrong-account state.
- General and named links remain distinct; general viewing never silently grants RSVP rights. Copied links always use the configured invitation origin, never the current request Host.
- Introduce separate validated workspace/invitation/operator/storefront origin configuration; today's single APP_ORIGIN drives both CSRF and generated URLs and cannot simply be replaced with an arbitrary subdomain list.
- Reconfigure explicit Auth redirect allowlists and safe return paths. Do not transfer sessions in query strings, weaken cookie scope or enable wildcard CORS to make navigation work.
- Preserve already issued invitation paths/identities and key versions. Test an explicit legacy-host compatibility/redirect strategy, including token-bearing paths and log redaction, before changing links; support copied invitations and QR codes.
- Owner previews should reuse the renderer using authorized data. Do not embed the privileged editor in a public guest page. If cross-origin frames are introduced, design a restricted preview bridge/frame policy; do not remove current frame protection globally.
- Test foreign tenant IDs; anonymous/customer/guest against every admin route; guest writes against owner routes; host spoofing/unknown host; expired sessions; MFA; pause/revoke/expiry; old links; cross-origin writes; cookie leakage; CSP; cached media; and mobile wrong-link recovery.
- Review each surface visually: marketing has catalogue/order CTAs; client has focused work controls; guest has only wedding interaction; operator has audit/access tools. Shared brand tokens do not force shared density, headers or typography hierarchy.

## What references actually establish

- [The Digital Yes](https://www.thedigitalyes.com/) publicly links its Client portal, describes private design review and private RSVP management, and has separate [invitation demo pages](https://www.thedigitalyes.com/demo/lace). This supports separate audience experiences with deliberate links. It does not disclose a verified database/deployment/session architecture. Portal destination could not be loaded with the research tool in this review; no private access attempted.
- [e-Nimontron](https://www.e-nimontron.com/) separates catalogue/live previews/order journey and says guests receive a private link. Earlier user-supplied dashboard video establishes visible owner UI only; its authentication and internal hosting/security remain unverified.
- [Orbix SaaS design](https://www.orbix.studio/services/saas-design) emphasizes role-specific workflows and permission/error states. Dribbble/Pinterest references guide composition and art, not evidence of production access-control architecture.

Technical basis: [MDN origins](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy), [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie), [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [sibling-domain CSRF considerations](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Vercel multi-project repositories](https://vercel.com/docs/monorepos), reviewed 21 October 2026. No production topology or DNS change is claimed by this document.
