# Wedding invitation product — planning hub

Updated: **20 October 2026 · Client V1**.

Current Jamdani invitation is the product foundation. **Backend/auth, wedding isolation, seller activation/search, acknowledged autosave, named guest links, RSVP/wishes, audited host corrections, private CSV, pause/resume and private photo processing are implemented. The product is Bangla-first; English is secondary.** Five migrations and normal-role proofs passed on hosted **Dawat Staging**. Actual max-five uploads, image decode/rotation/metadata stripping, protected reads, publication retention and the extended customer/guest flow passed against local Supabase/Storage. Gmail OTP receipt is confirmed. Hosted media credentials, first verified operator login, fresh browser/device qualification and public website deployment remain. See [dashboard workflow evidence](docs/build-evidence/client-dashboard-workflow.md) and [run guide](web/README.md). This is not full launch acceptance.

## Start here

| File                                              | Owns                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [memory.md](memory.md)                            | User decisions, verified state, constraints and next-session handoff                       |
| [plan.md](plan.md)                                | Scope, build order, end-to-end milestone and gates                                         |
| [architecture.md](architecture.md)                | Stack/migration, identity, tenancy, transactions, cache/media/jobs/recovery                |
| [website-design.md](website-design.md)            | Mobile couple/seller screens, template preservation, type/layout/motion/states             |
| [task.md](task.md)                                | Production implementation progress and remaining acceptance gates |
| [Data/API](docs/specs/client-v1-data-api.md)      | Entities, constraints, metrics, endpoints, revisions/idempotency/export                    |
| [Corner cases](docs/qa/client-v1-corner-cases.md) | 96 prioritized scenarios across the entire delivery flow                                   |
| [Release gates](docs/qa/client-v1-release.md)     | Device/performance/security/recovery/commercial evidence                                   |
| [Decisions](docs/decisions.md)                    | Confirmed choices, defaults, unresolved policy and blocking points                         |

Authority: plan for scope/order; architecture for system rules; design for UX; data/API for contracts; task for execution; memory for context. Update affected files together. Client V1 overrides conflicting older notes. Planned scenarios are not passed tests.

## First production milestone

Seller confirms Order X → separately activates intended verified customer → couple publishes → creates named household/event allowance → guest opens on another phone and replies → correct couple sees it. Wedding Y cannot access X's data via UI, APIs, SQL, objects or exports.

Public buyer gets no management before confirmation/activation. Guest never enters own name; general invitation is view-only. One template; Bangla/English only. No gateway, realtime service or marketing rewrite is needed merely to start proving this slice.

## Current implementation evidence

- [v6.4 compact layout/music](docs/build-evidence/compact-music-v6-4.md):82 tests at that historical checkpoint, browser screenshots; not rerun by this documentation pass.
- [v6.3 gallery/opening](docs/build-evidence/gallery-colour-v6-3.md): max-five-photo reel, color/hierarchy, immediate scroll after deliberate opening.
- [v6.1 performance](docs/build-evidence/template-qualification-v6-1.md): LCP3.46s misses2.5s; not latest-build measurement.
- [Physical phone sheet](docs/qa/physical-phone-v6-1.md): LAN reachability confirmed; complete device/listening qualification pending.
- [Named guest delivery](docs/build-evidence/named-guest-delivery.md): 143 tests; actual local OTP/MFA, two-client HTTP/Edge RSVP/wishes, responsive management UI and hosted database proofs. [Source/run guide](web/README.md) covers local/hosted configuration and SMTP handoff.

## Retained supporting material

- [Reference walkthrough](docs/reference-walkthrough.md), [page index](docs/reference-evidence/page-index.md), [feature matrix](docs/03-feature-matrix.md), [catalogue](docs/02-template-catalogue.md).
- [e-Nimontron flow](docs/specs/e-nimontron-client-flow.md), [dashboard video](docs/specs/vendor-dashboard-video-review.md): visible evidence, not competitor backend inspection.
- [Figma source review](docs/design/figma-source-review.md), [inspiration board](docs/design/inspiration-board.md), [gift study](docs/design/pinterest-gift-reveal-v6.md).
- [AI Studio prompt](docs/prompts/google-ai-studio-build.md), [Figma/Claude prompt](docs/prompts/figma-ai-claude-design.md), [artwork prompts](docs/prompts/imagegen-card-v5-assets.md). Older broad prompts are supplementary; current scope/architecture wins.
- [Previous root snapshot](docs/archive/planning-before-client-v1-2026-10-20/INDEX.md), including deferred public-site details and historical task IDs. Old “current/latest” labels are historical.

The user created the free Dawat Staging project and approved applying its migrations. No paid upgrade or external email/message was sent. Database provisioning does not mean the website has been publicly deployed or launch-qualified.
