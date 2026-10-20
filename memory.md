# Project memory — current handoff

Consolidated: **20 October 2026 · Asia/Dhaka**. Planning revision: **Client V1**. Read this first; [archived notes](docs/archive/planning-before-client-v1-2026-10-20/INDEX.md) preserve history but do not override current contracts.

## Latest request and work done

User considers the current template the product, asked what to build next, then requested detailed plan, architecture, design, memory and all necessary corner-case planning.

Recorded next focus: **couple dashboard + thin seller activation panel + real backend**, then public website. This turn changes documentation only: current root files, data/API,96 cases, release gates and decision register. No backend/dashboard implementation, deployment, paid service or template qualification performed. Next implementation: CV01 onward in [task.md](task.md).

## Confirmed product contract

- User is seller/admin; couples are customers; guests are their invitees.
- Public buyer browses catalogue/demo, limited custom preview and orders. Only seller-confirmed order + separately activated grant + verified intended customer unlocks dashboard management.
- One order → one wedding. Isolation applies to API, SQL, objects, preview/export/cache. Different URLs alone are not authorization.
- Couple controls base content and host-entered named households. One published base + household overlay, not duplicated sites/artwork per guest.
- Guest sees supplied name/greeting/events/allowance and never enters own name. General link view-only. Forwarded personal link carries bearer household access, not verified individual identity.
- Event-wise accepted/declined/pending, adults/children, private logistics notes/wishes. Pending differs from declined; wishes do not affect attendance. Cross-event attendance sums are not unique people.
- Bangla and English only; mobile priority. One excellent original Jamdani template before collection expansion.
- Main creative reference TDY; service reference e-Nimontron; user-preferred Figma typography/organization adopted. Original Pinterest/Dribbble synthesis, no copied competitor art/code. Evidence/research linked from README/design.
- Couple/families are senders; wishes addressed to couple. No “Invitation by Dawat”; Dawat is only a working brand.
- Clean efficient code, precise compact layout, expressive fonts, purposeful color hierarchy and smart restrained motion. No generic dashboard wrapper around everything.

## Actual implementation checkpoint — historical evidence

App: `F:/Projects/Wedding Card/web`.

- Next16.4.2/React19.3.1/TypeScript strict; npm lockfile, CSS modules, lucide-react, RHF/Zod, Vitest. Observed local Node22.18.0/npm10.9.3; review supported patch/runtime before deployment.
- `next.config.ts` is static export. `useWorkspace` stores localStorage fixtures. No real tenant database/auth/payment/shared RSVP exists.
- Storefront/editor/operator/dashboard are interactive prototypes; not production CV task completion.
- [v6.4 evidence](docs/build-evidence/compact-music-v6-4.md): 82 tests/typecheck/format/export passed then; actual browser 320/390px BN and 1024px EN, compact layout and main/card top 0. Screenshot green strip not reproduced; original cause not established.
- Max-five-photo reel, arched main stage, thumbnails/arrows/swipe, visible-only5s autoplay/manual pause. Two fictional sample photos shipped; integrated five-photo/device fixture remains to qualify.
- Closed cover unmounts sections/forms/nav. Deliberate tap immediately mounts and permits scroll while800ms doors finish. Preserve cover height/focus; reduced motion still deliberate. Old1.8s/wait-for-animation rules superseded.
- Music: 120s compressed/faded Canon in D, Kevin MacLeod recording, CC BY4.0, about 1.2MB. Gesture-only source/play, real pause/retry/off preference/background cleanup and credit. Provenance: `web/public/audio/`, `web/design-source/audio/`.
- [Current compact mobile screenshot](docs/build-evidence/compact-music-v6-4/open-bn-390.jpg). No new rendered UI created this planning turn.

## Remaining qualification

Both actual Android and iPhone reached LAN preview. Full-flow/listening/device report not provided. Historical v6.1 lab Performance91 / closed-entry Accessibility100 / LCP3.46s misses2.5s; not remeasured for v6.4. No field p75 INP. [Measurements](docs/build-evidence/template-qualification-v6-1.md), [phone sheet](docs/qa/physical-phone-v6-1.md), [new release gates](docs/qa/client-v1-release.md).

## Next architecture defaults

- Keep Next/npm/CSS modules while enabling server deployment; old mandatory Tailwind/pnpm/next-intl choices superseded.
- Supabase PostgreSQL/Auth/Storage, migrations/generated types, focused services, narrow transactions and separate environments.
- RLS/grants + service authorization + tenant composite foreign keys + private object policies; active membership/order/entitlement/grant required.
- Immutable published versions, expected-revision drafts, idempotency and locked commit-time policy checks.
- Digest verification + dedicated-key encrypted recovery for owner recopy; explicit rotate/revoke preserves household/history.
- One primary owner initially; bulk import/collaborators/Maybe/auto messages/extra templates deferred.
- Verified manual-order pilot may precede gateway; seller activation stays separate. Share UI does not authorize automatic messages to others.
- First proof: two tenants → seller activates X → X publishes/names guest → second-device RSVP → X sees correct event count; Y denied.

Details: [plan](plan.md), [architecture](architecture.md), [design](website-design.md), [data/API](docs/specs/client-v1-data-api.md), [96 cases](docs/qa/client-v1-corner-cases.md), [decisions](docs/decisions.md).

## Operational context

### GitHub handoff — 20 October 2026

The user subsequently authorized pushing the complete project to `https://github.com/Tanjamul-Azad/Dawat.git`, with only `Tanjamul-Azad <i.m.tanjamul@gmail.com>` as author. The repository now starts at `F:/Projects/Wedding Card`, covering app, planning, assets and research evidence. Old web-only Git metadata is preserved locally at `.artifacts/legacy-web-git-before-github`; it is not part of the new history. The initial GitHub branch is `main`, remote `origin`. Local dependencies/build outputs, environment secrets, deployment bindings and ignored research tooling are excluded; source assets, licenses and safe `.env.example` are included.

Fresh pre-push verification: 82 tests passed and TypeScript typecheck passed on 20 October 2026. This verifies the current local source, not production auth/backend or physical-device qualification.

- Preserve cumulative local changes; no commit/push/deployment requested by this planning task.
- Last retained previews: `http://127.0.0.1:3000/invite/?lang=bn`, invitation-only LAN `http://192.168.0.120:3001/invite/?lang=bn`. Not rechecked/restarted this turn; IP/process can change. LAN excludes management, supports MP3 ranges. Do not change firewall/router for QA.
- Previous browser control restored for actual local tab5; old blocked `data:` error tab must not be retried/bypassed. Use supported CUA, refresh documentation/state for new checks.
- Existing Site identity `appgprj_6ad5bd38375881919d603156d5d87b77` returned project-not-found. Hosted site remains old v2. No replacement Site or claim of current hosted deployment without successful explicit work.
- `.artifacts/jamdani-personal-template-v6-static.zip` is stale, lacks newest gallery/music. No fresh package this turn.
- Price/brand/domain/term/retention/contact verification/providers/budget/recovery/support unresolved in decision register. Competitor BDT600/unlimited quote is user-reported, not our package.
- Technical-English docs with Bangla examples; communicate Bangla/Banglish. No new agents without applicable explicit delegation authorization.

## Resume

Read current contracts, inspect actual code/config and applicable `AGENTS.md`, verify environment. Start CV01–CV04 and design CV10 using two synthetic tenants. Ask only for actual blocking dependencies. Keep task/memory/contracts synchronized; distinguish planned acceptance from real test evidence.
