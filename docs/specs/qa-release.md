# QA scenarios and release gates

> **Client V1 update · 20 October 2026:** use [current 96-case register](../qa/client-v1-corner-cases.md) and [release checklist](../qa/client-v1-release.md) for the production slice. These older scenarios remain supporting tests; historical counts do not establish current release readiness.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

This is a verification plan, not a report that the future application passed. Research verification is documented separately. Use fictional data and sandbox providers until production readiness is established.

## Test layers

The main template is the selling point. [TE01–TE60](template-experience-quality.md) adds template/content/media/language/guest edge-case acceptance to the existing release scenarios. All are pending production qualification unless linked evidence establishes a specific result; the ten browser-sandbox domain tests do not pass this matrix. Require complete `bn`/`en` only UI and template behavior, full-scroll original composition and real target-phone evidence before a commercial quality claim.

| Layer | What to verify |
|---|---|
| Schema/unit | Content/count/date rules, quote calculation, state transitions and safe formatting |
| Database/service integration | Tenancy, transactions, event relationships, idempotency, payment verification and publishing |
| End to end | Browser journeys through draft, payment, publish, guest response and owner view |
| Visual/manual | Bangla shaping, composition, image crop, device input, motion, large text and audio behavior |
| Operational exercise | Restore, delayed provider events, failed jobs, support and expiry |

Do not create large test suites that merely mirror static copy or CSS. Focus automation on business/integrity failures and manual review on visual behavior.

## Functional scenario register

| ID | Scenario | Expected result |
|---|---|---|
| Q01 | Browse/search/filter and use Back | Correct catalogue/filter state; no missing available themes |
| Q02 | Open every launch demo | Correct theme, labelled fictional data, no production RSVP writes |
| Q03 | Start draft then sign in | Selected content/theme preserved under verified owner |
| Q04 | Save incomplete content | Draft saves; publish review still lists missing fields |
| Q05 | Refresh/resume | Latest confirmed saved content returns |
| Q06 | Disconnect while editing | Dirty edits retained; save state truthful; safe retry |
| Q07 | Edit same draft in two tabs | Conflict shown; no silent overwrite |
| Q08 | Change theme | Content preserved; incompatible blocks reviewed |
| Q09 | Three events on distinct dates/venues | Stable order, correct details/maps/calendar |
| Q10 | Event across timezones | Display/countdown/calendar refer to correct instant |
| Q11 | Event in past/cancelled | Intentional state; no negative timer or false upcoming label |
| Q12 | Add/remove/reorder photos | Approved derivatives/order/crop correct; no-photo layout works |
| Q13 | Bad/oversized/spoofed upload | Rejected without exposing storage or crashing renderer |
| Q14 | Music blocked or missing | Content still usable; mute/play state honest |
| Q15 | Skip opening/reduced motion | Guest reaches same practical details and RSVP |
| Q16 | Long Bangla/conjunct/mixed names | No broken shaping, clipping or forced tiny text |
| Q17 | Two owners attempt cross-data/media/export access | All unauthorized reads/writes blocked |
| Q18 | Public payload inspection | No drafts, owner email, private notes/contacts, other households or order data |
| Q19 | Expired/revoked preview token | No proof/private content leaked |
| Q20 | Publish with pending media/missing required fields | Actionable error; old live version unchanged |
| Q21 | Publish twice/retry/concurrent publish | One intended active snapshot; expected-revision handling |
| Q22 | Edit draft after publication | Guest keeps prior content until republish |
| Q23 | Theme update | Old invitation remains pinned/renderable |
| Q24 | Slug collision/reserved word | Clear conflict; no route hijacking |
| Q25 | Unpublish/expire | Intentional public state; no draft fallback |
| Q26 | Open RSVP accept/decline | Counts and confirmation match event choices |
| Q27 | Negative/fractional/excess/contradictory RSVP | Server rejects; input retained for correction |
| Q28 | Double click, timeout and retry | Same idempotency key gives one logical effect |
| Q29 | Different body under same idempotency key | Conflict rather than silent overwrite |
| Q30 | Edit response using receipt | Only own response updates; revision/deadline checked |
| Q31 | Household restricted to one event | Other event absent from payload/HTML and rejected on forged submit |
| Q32 | Household over allowance | Server rejection with safe explanation |
| Q33 | Household token rotated/revoked | Old access fails; historical response preserved |
| Q34 | Open-mode same name on two devices | No false identity guarantee; entries handled per receipt/session |
| Q35 | RSVP policy closes while form open | Server rejects stale/closed operation; UI explains |
| Q36 | Archive event with responses | History retained; new answers blocked for archived event |
| Q37 | Owner dashboard totals | Latest event answer counted once; pending only for known invites |
| Q38 | Private note/HTML-like text | Escaped display; guest cannot read other notes |
| Q39 | CSV cells start with formula characters | Export neutralizes spreadsheet formula execution |
| Q40 | QR/link/WhatsApp share | Resolves correct public/household invitation; user sends manually |
| Q41 | Tampered client price/SKU/currency | Server quote authoritative; unsupported selection rejected |
| Q42 | Successful sandbox payment | Verified exact order/amount/currency grants once |
| Q43 | Browser fake success/cancel/failure | No local entitlement grant |
| Q44 | Callback before/after browser return | Status reconciles; customer does not need to pay twice |
| Q45 | Duplicate provider notification | One paid event/effect; safe acknowledgement |
| Q46 | Wrong merchant/reference/amount/currency | No grant; admin exception surfaced |
| Q47 | Provider unavailable/delayed | Pending/retry/reconciliation; no false definitive result |
| Q48 | Refund/reversal | Recorded audited transition and explicit entitlement policy |
| Q49 | Receipt job fails | Payment remains correct; job retries without recharging |
| Q50 | Admin support access/action | Scope and audit reason enforced |
| Q51 | Two households have distinct greeting/message/events | Each authorized scope gets only its overlay; generic page/OG/cache contains neither |
| Q52 | Owner edits personalized overlay concurrently/offline | Expected-revision conflict/retry; no false saved state or duplicated base snapshot |
| Q53 | Owner recopies existing guest link | Same URL returned after membership/decryption; copy never rotates or changes response totals |
| Q54 | Credential decrypt/key rotation/recovery | Tampered ciphertext/identity binding rejected; versioned key restore/re-encrypt preserves links; missing key has safe explicit recovery |
| Q55 | Long bilingual greeting/message in every theme | Readable shaped text without clipping, arbitrary HTML or baked-in name imagery |
| Q56 | Revisit/copy/preview then republish base | Stable household identity and one current answer/event; no attendance created by views |
| Q57 | Local prototype uses unconfigured providers | Fictional/device-local labels clear; no simulated auth/payment/publish success presented as production |
| Q58 | Premium visual acceptance | Original approved direction/mobile/desktop/states, Dribbble/Pinterest synthesis and asset provenance evidence; old low-fi SVGs do not pass |

Client-dashboard follow-up: verify that the delivered private management link requires the correct owner session, assisted clients can enter the dashboard directly, declines/private notes are visible only to the owner, and owner-recorded phone replies carry an audited source. Refresh failure retains labelled stale data rather than resetting headcounts to zero. Full scenarios are in [client dashboard](client-dashboard.md).

e-Nimontron-pattern follow-up: an independent text wish appears only in the right client's private list; sending a wish does not accept an invitation or change headcounts; matching display names do not merge identities. Static [desktop](../design/client-dashboard-desktop.svg)/[mobile](../design/client-dashboard-mobile.svg) mockups are structural drafts, not final visual targets or passing application tests.

Video-parity Growth checks: [video review](vendor-dashboard-video-review.md) defines G10–G12 acceptance for private photo ownership/removal without attendance changes, complete timestamped memory-book data/print layouts, and optional Maybe distinct from Pending/confirmed totals. Recorded buttons are evidence of UI presence only. Do not mark these application checks passed from the video review.

## Visual/device matrix

Run every launch theme against: 320/360 px compact, tablet, desktop, large text, keyboard-only, reduced motion, no audio, slow network and missing decorative asset. Include long names, multiple hosts, no photos, five photos, one/three/many events, open/household/closed RSVP and past countdown.

When available, test actual Safari/iPhone, Chrome/Android and WhatsApp/in-app link opening. Record device/browser/date and what was checked. If only desktop emulation was available, say so in release notes; do not mark real-device checks passed.

## Performance targets

The [production baseline](production-engineering.md) is authoritative: initial compressed critical route ≤1MB, guest JS starting budget ≤200KiB; target p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 and provisional server RSVP p95 ≤700ms. Record lab/field distinction, network latency, exceptions and measured user impact. Defer gallery/audio, load only chosen theme and verify bounded paginated queries/exports. Synthetic exercise: 100k rows across 100 weddings, ramp to 100 concurrent guest sessions and separately 20 valid RSVP writes/s for 60s, recording environment/errors/p95/p99. These are acceptance targets, not measured results or an unlimited-capacity promise.

## Operational exercises

| ID | Exercise | Evidence |
|---|---|---|
| O01 | Restore a backup into an isolated environment | Published versions and response relationships intact |
| O02 | Replay delayed payment notifications | No duplicate entitlement or receipt storm |
| O03 | Fail a publish transaction/job | Prior live version safe; retry actionable |
| O04 | Orphan media cleanup | No derivative referenced by retained publication deleted |
| O05 | Hosting reminder/expiry | Correct dates, owner notices and guest state |
| O06 | Data export/delete request | Authorized, documented and auditable lifecycle |
| O07 | Roll back application/template release | Existing customer cards remain usable |
| O08 | Inspect logs/telemetry | No raw tokens, private notes, OTPs or complete payment payloads |
| O09 | Restore database + required object bytes + key/config versions | Demonstrate proposed RPO ≤1h/RTO ≤4h; original personalized links and media remain usable |
| O10 | Outbox lease timeout/retry/dead letter | Repeat work safe, bounded concurrency/backoff, actionable alert and recovery |
| O11 | Clean/prior-version migration and rollback | Constraints/RLS remain valid; application rollback preserves existing cards |

## Paid-launch checklist

Activation acceptance (production tests, not satisfied by the local simulation): no order/pending/paid-but-unconfirmed/confirmed-but-inactive/wrong-account/revoked grant must deny dashboard HTML data, APIs, storage signatures and exports. Confirmation and activation retries are idempotent and audited. Only the correct verified identity plus confirmed order and active same-wedding grant permits client access. Activation does not publish the invitation. Public customization/order DTOs expose no guest/private fields.

- [ ] All launch requirements R01–R25 implemented and mapped to evidence.
- [ ] Q01–Q58 and applicable operational exercises pass, or an explicit scope change removes the feature.
- [ ] Every offered theme fixture reviewed (one initially); original asset licences recorded.
- [ ] Actual price, package limits, hosting/retention/refund/edit policy published consistently.
- [ ] Approved production gateway and email account configured; secrets/callbacks correct.
- [ ] Sandbox/production data and credentials separated.
- [ ] Backup/restore, job reconciliation, monitoring and support ownership ready.
- [ ] Public metadata/cache rules prevent private event/token leakage.
- [ ] Real-device verification recorded with any limits disclosed.
- [ ] Unfinished Growth/Expansion features absent from purchasing UI.
- [ ] CI, measured budgets/load, key rotation and database/object/config restore evidence recorded; paid hosting is not a substitute for readiness.

## Evidence record format

For each milestone record commit/version, environment, test/scenario IDs, command or manual steps, result, screenshot where useful, limitation and follow-up. Never count a screenshot of a form as proof that its backend processed a payment or RSVP.
