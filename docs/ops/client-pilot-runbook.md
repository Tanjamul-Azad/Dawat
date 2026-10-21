# Client pilot deployment and recovery

21 October 2026. This is an executable preparation/runbook, not evidence that a host, job, backup or restore has been provisioned. See the current implementation evidence and open readiness gates. No paid tier is chosen.

## Deploy one server-capable app

Use Node 22, HTTPS and the same canonical origin for APP_ORIGIN, user-facing links and Supabase Site URL/redirects. The database currently belongs to Dawat Staging; decide environment separation before real data. A static exporter/GitHub Pages cannot serve Auth/API/private photos.

The repository includes `web/Dockerfile`, a non-root standalone runtime with `/health/` liveness/configuration check. Build from the `web` context. Only the public Supabase URL and publishable key may be supplied as build arguments. `.dockerignore` excludes all local environment files, dependencies and previous builds. Supply media secret and guest AES ring via the host's private runtime secret settings, never build arguments, image layers, browser variables or CI output. Docker Linux standalone build, non-root runtime and health/runtime smoke were executed successfully. Final browser-image adaptation is included in the verified image; see hardening evidence.

For a Node host instead: from `web`, `npm ci`, `npm test`, `npm run build`, then `npm run preview` with the chosen port. Stop the process before replacing its `.next` directory. Use the host's process supervision/restart controls; this developer terminal is not a production supervisor.

Required private runtime configuration is listed in `web/.env.example`. APP_ORIGIN must be the exact HTTPS origin, without trailing slash. Retain every previously used guest AES key ID. Keep the shared SMTP sender at valtube101@gmail.com until the owner elects to change it. Do not send OTPs to synthetic external email addresses.

For Vercel, selected files may be up to10 MiB but browser preparation keeps transported files below3 MiB; authoritative server decode and private output processing remain. Vercel Functions have a4.5 MB request/response limit even on Pro. Hobby is for personal non-commercial testing only. Other Node hosts may also accept raw10 MiB uploads. Configure at the host: runtime duration sufficient for bounded upload/transforms, HTTPS/Secure cookies, appropriate CSP/HSTS, redacted bearer paths/cookies/bodies and real availability/error/egress alerts. `/health/` confirms process/configuration only; it does not prove database, SMTP or the customer journey.

Before client delivery, verify actual deployment: OTP/session → correct single-owner wedding → autosave/conflict/relogin → one/two events → 0/1/5 photos → publish → scoped preview/copy → second-device RSVP/wish → owner report/CSV → pause/revoke. Foreign owner must be denied on IDs, preview, media, export and history. General invitation is view-only. Previously copied localhost links must be recopied after changing canonical origin; never send localhost to a customer.

## Vercel personal preview

Project shell: `dawat-client-preview`, scope `imtanjamul-3836s-projects`, root `web`, Next.js. Owner will import private environment variables; no paid upgrade authorized. Confirm the assigned `.vercel.app` domain before setting APP_ORIGIN. Keep the current AES key IDs and values. Public Supabase URL/key are build-time values; the media secret and AES ring stay server-only. Never import `.env.qa.local` or local Docker URLs. After any env change, redeploy and run actual hosted user journeys; importing env alone does not update an existing deployment.

## Operate media cleanup

`npm run media:cleanup` uses private runtime configuration and a bounded batch of 25 eligible attempts with at least 24h delay. It retains pinned publication media. Run it from a trusted scheduled worker on the selected host, with no public cleanup HTTP endpoint. Add scheduler authentication, run/execution timeout, failure alert and a last-success record. A script existing does not mean a schedule or alert exists. Repeat batches only within a documented budget; do not overlap jobs or indiscriminately delete Storage prefixes. Review retention policy before erasing customer records.

## Recovery drill before external pilot

1. Agree recovery objectives, backup period, retention, owner and cost. Do not promise RPO1h/RTO4h until measured/funded.
2. Back up the PostgreSQL data/schema/Auth state using the platform's supported backup/export mechanism. A Storage server secret is not a database password. If a direct DB connection is required, its credential must be supplied privately on the operator's machine, never in chat, process arguments or source.
3. Independently preserve private Storage objects, **all guest AES ring versions**, media/template versions and private deployment configuration. Encrypt backups, keep access narrow and keep an independent copy. Database backup alone does not restore image bytes.
4. Restore only into a clearly identified isolated project, with external email/payment disabled and no customer DNS pointing to it. Refuse any restore target equal to production/staging source. Record backup IDs and start/finish times without secrets or raw guest links.
5. Verify count/integrity, owner X/Y isolation, retained publication, link recopy/decrypt, image decoding, named session exchange, reply history/CSV and rotation/revocation. Recopy is not rotation. Record actual data loss window and measured recovery time.
6. Exercise compatible application rollback using the prior Git artifact; do not blindly reverse database migrations that contain user data. Keep published snapshots readable. Replay background jobs only after their credentials/environment are verified.
7. Record deletion/retention requests and how restoration reapplies erasure decisions. Do not silently reintroduce erased data from backups.

## Seller and support handoff

The intended seller must verify their own email, receive an explicitly authorized audited staff grant and enroll/verify AAL2. Do not grant admin based on the SMTP address. Keep recovery contacts and an operator procedure for lost MFA; no bypass button or shared customer account.

Customer gets their own verified email membership and the HTTPS dashboard entry; management URL is not a credential. One order/wedding by default. Manual payment verification or explicit free exception precedes separate activation. Support can suspend management independently of guest publication. Reassignment is a separate reviewed identity/ownership operation, not changing a displayed email.

Before real personal-data intake, agree term, retention/deletion/export, forwarded-link privacy, support window and cancellation/refund policy. Synthetic 1/90-day test terms are not commercial promises.
