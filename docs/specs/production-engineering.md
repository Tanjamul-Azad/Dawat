# Commercial production engineering baseline

> **Client V1 update · 20 October 2026:** [current architecture](../../architecture.md) supersedes older compulsory Node/pnpm/Tailwind/next-intl choices below. Preserve existing Next/npm/CSS modules unless evidence warrants change. A local prototype exists; production auth/database/shared data do not. Budgets/recovery values below are proposed targets, not measured guarantees.

19 October 2026 · Selected implementation direction for this product. **No application or production-readiness result exists yet.** These are design/acceptance requirements, not a capacity guarantee. Competitor implementations are unknown.

## Chosen stack

| Layer | Decision | Boundary |
|---|---|---|
| Runtime/tooling | Node.js 24 LTS, TypeScript strict, pnpm lockfile | Pin supported patched versions at project setup; record runtime in CI and hosting |
| Web | Next.js App Router + React, one modular application | Server-render public content; small client islands for editing, motion and RSVP |
| Styles/UI | Tailwind CSS 4 + CSS theme tokens; selected Radix/shadcn primitives | Own visual design; primitives are behavior foundations, not a stock visual skin |
| Forms/validation | React Hook Form + Zod | Shared structural schemas, authoritative server rules, explicit draft/publish differences |
| Languages | next-intl + Intl formatting | UI dictionaries separate from authored Bangla/English content |
| Motion | CSS/SVG + selectively loaded Motion for React | No animation framework in every route; no mandatory WebGL at launch |
| Backend | Next.js server-only feature services and thin route handlers | No extra API server/microservices until measured need |
| Database | Supabase managed PostgreSQL, SQL migrations, generated database types | Foreign keys/constraints/RLS plus service authorization; no second ORM initially |
| Auth | Supabase Auth email OTP/session | Verified owners; guests use scoped invitation/receipt credentials |
| Objects/media | Supabase Storage + bounded Sharp processing | Private originals; approved derivatives; signed private reads; explicit object backup |
| Commerce | SSLCOMMERZ adapter, subject to merchant eligibility | Sandbox before approved live methods; verified server confirmation |
| Email | Resend adapter for transactional delivery | Domain verification/delivery setup required; provider can change without domain-code rewrite |
| Jobs | PostgreSQL transactional outbox + bounded scheduled processor | Atomic enqueue, leases, retry/backoff and dead-letter handling |
| Hosting | Vercel Pro for web/cron, Supabase Pro for managed backend | Paid commercial deployment target; no accounts/purchases created by planning |
| Diagnostics | Sentry errors + structured redacted logs + Web Vitals | Scrub URLs/tokens/PII; session replay off by default |
| Verification | Vitest, Testing Library where useful, Playwright, local PostgreSQL/Supabase integration | Test business/security behavior and real customer journeys |

Next.js server component guidance supports keeping most rendering server-side; server endpoints still authorize each operation. [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist). Node 24 is an LTS line at this review date; use supported LTS at setup rather than an unmaintained runtime. [Node release schedule](https://nodejs.org/en/about/previous-releases).

UI token, locale and motion capabilities are supported by their official guides: [Tailwind theme variables](https://tailwindcss.com/docs/theme), [next-intl App Router](https://next-intl.dev/docs/getting-started/app-router), [Motion reduced motion](https://motion.dev/docs/react-use-reduced-motion). These are tools selected for our design, not promises that a library makes a product polished automatically.

## Deployment and cost decisions

Local development → isolated staging/sandbox → production, with separate credentials, database and buckets. Preview deployments must never read production private data or trigger live payments/email. Use synthetic fixtures. Choose a nearby supported region for app/server/database together, with Singapore an initial candidate; measure Bangladesh mobile latency before committing.

Vercel describes Hobby as non-commercial; plan a commercial-compatible tier. [Vercel pricing/plan terms](https://vercel.com/pricing). Supabase production guidance calls for appropriate RLS and operational setup; a paid tier alone does not establish security. [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod).

Before paid launch record actual monthly fixed costs, usage unit costs, upload/egress growth, backups, monitoring/email, gateway fees and support/art cost per order. Add budget alerts and request/media abuse limits. Do not promise “unlimited storage,” lifetime service or BDT 600 pricing from the competitor quote. Final accounts, costs and billing activation require an explicit operational decision; planning creates no financial commitment.

## Clean code and efficient boundaries

- Organize by feature; each feature owns schemas, UI, service behavior and relevant tests. Shared invitation blocks/theme contracts are reused across themes.
- Thin request handler → parse/authorize → focused domain service → typed database/provider calls. Server rendering calls services directly, not our own HTTP endpoints.
- Use Supabase's generated types and explicit public/private DTOs. SQL functions implement transaction-sized operations; default security-invoker with RLS. Any privileged function must have fixed search path, validated scope and restricted execute grants. Payment/job service credentials stay server-only and never bypass service checks implicitly.
- Prefer ordinary functions and composition. Do not build a generic repository/service/interface factory for every table or abstract a one-off function merely to add layers. Introduce adapters for external payment/email/storage boundaries that actually vary.
- One validation contract per domain; no copied per-theme RSVP/payment logic. Separate server-only modules so secret-bearing SDKs cannot enter browser bundles.
- No arbitrary file-length target. Split a file when responsibilities diverge, not to manufacture tiny files. Avoid minified source, clever one-liners and giant components mixing forms, payments, authorization and art.
- Comments explain non-obvious policy/tradeoffs. Delete unused branches, duplicate helpers and placeholder production controls. No blanket `any`, ignored TypeScript errors or disabled lint checks to silence real failures.
- Use server/query state for saved domain data; local form state for unsaved edits. Avoid a global state library until a real cross-screen client state requirement exists.
- Keep dependency count purposeful and patched. No Kubernetes, microservices, separate GraphQL layer, Redis or 3D engine by default. Add infrastructure only with evidence of a concrete requirement/bottleneck.

## Security/integrity at first slice

Tenant isolation spans database, storage, exports, preview, personalized payload and every management mutation. Browser-supplied wedding IDs/price/status never establish authority. Treat publication, RSVP, payment and job processing as transactional/replay-safe operations; preserve the existing contracts.

Protect cookie-authenticated writes against cross-origin abuse. Set appropriate secure cookie flags, transport/security headers and tested CSP compatible with approved assets. Allowlist redirect/link schemes and sanitize any externally sourced SVG before considering it an asset; customer text remains plain text. Secrets use environment separation and rotation. Operators protect provider accounts with MFA.

Use shared rate limits for OTP, public submission, link exchange, uploads and checkout creation; in-memory counters alone do not work across server instances. Start with provider/WAF controls plus targeted atomic database-backed limits where needed. Return actionable safe errors. Bound request/page sizes and database query work; reconcile limits with customer-facing policies.

## Transactions, background work and delivery

Payment, publishing and RSVP commit authoritative state and outbox events together. A scheduled server-only processor atomically claims leased jobs, performs bounded work and marks completion. Expired leases can retry; handlers tolerate repeat execution. Use bounded batch/concurrency, backoff/jitter, maximum attempts, dead-letter visibility and backlog alerts.

Protect scheduled endpoints with host scheduler credentials; public callers cannot run arbitrary jobs. Keep each invocation below configured runtime/memory limits and resume remaining jobs next run. Slow/large media eventually needs a dedicated worker, not a long unawaited promise after sending a response. Do not introduce two queue systems for the same jobs. Supabase Queues is an option to evaluate later, not a second launch dependency.

Verify gateway notifications with the provider's current server validation process and reconcile delayed events; never unlock on redirect alone. [SSLCOMMERZ integration](https://developer.sslcommerz.com/doc/v4/index.html). Transactional email is an adapter with retries, not part of the database commit. [Resend Next.js guide](https://resend.com/docs/send-with-nextjs).

## Performance and initial capacity targets

| Target | Proposed check, not measured result |
|---|---|
| Guest experience | Aim for p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on target mobile traffic; use repeatable lab checks before field data exists |
| Initial invitation transfer | Starting budget ≤1 MB compressed critical route payload, including loaded fonts/poster and JS/CSS/HTML; deferred gallery/audio measured separately |
| Client JavaScript | Starting budget ≤200 KiB compressed for guest route; investigate and record exceptions with measured user impact |
| Assets | Only chosen theme loads; dimensions set; responsive derivatives; fonts licensed/optimized without breaking Bangla; gallery/audio deferred |
| RSVP API | Provisional p95 ≤700ms server processing under selected load, excluding client network; report full network latency separately |
| Lists | Cursor pagination, indexed wedding/event filters and bounded exports; no browser loading all responses to compute official totals |
| Load exercise | Synthetic 100k response rows across 100 weddings; ramp to 100 concurrent guest sessions; separate 20 RSVP writes/s for 60s stress exercise with unique valid scopes |

Core Web Vitals thresholds/field measurement come from [web.dev](https://web.dev/articles/vitals). Payload, API and load-test values above are our starting engineering budgets. Record environment, data distribution, errors and p95/p99; adjust capacity or product constraints based on results. A test target is not an “unlimited” customer promise.

## Recovery, observability and release

Proposed internal launch recovery objectives: **RPO ≤1 hour, RTO ≤4 hours**, covering database plus required objects/configuration. Select PITR or a verified backup cadence that meets the target, budget it and demonstrate restore. Daily backup alone does not meet a one-hour RPO. Do not publish an SLA before operational evidence exists.

Supabase database backups do not include actual Storage objects. Back up required media independently with an inventory/restore procedure, retention, encryption and restricted access. [Supabase backup scope](https://supabase.com/docs/guides/platform/backups). A media derivative can be regenerated only if its required original is recoverable; immutable theme art also needs preserved source/versioned assets.

Track publication/payment/RSVP failures, job backlog/dead letters, email failures, storage/egress and availability with an actionable owner/runbook. Redact token paths/query strings, OTPs, wish bodies and customer contact data from logs and telemetry. Staging recovery drills use access-controlled copies and appropriate data handling.

CI gates: reproducible lockfile install → formatting/lint/typecheck → focused unit/integration checks → production build → critical Playwright journeys. Integration tests include two-account/RLS/storage checks, payment replay/mismatch and concurrent RSVP/publish behavior. Validate migrations against clean and prior-version databases. Do not deploy DB-breaking migrations that make a code rollback impossible; use expand/migrate/contract where needed.

Paid release also requires supported live accounts, actual policies, tested restore, runbooks, licensed assets, real-device review and cost visibility. A good-looking demo, passing unit tests or a paid hosting plan alone cannot satisfy the release gate.
