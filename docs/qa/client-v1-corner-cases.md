# Client V1 — corner-case register

20 October 2026. **96 required scenarios; currently planned, not a passed test report.** Existing template evidence can support a row but cannot qualify its new server integration automatically. Record actual result, build, environment, device and evidence when executing.

P0: data exposure, privilege escalation, irreversible loss or financial integrity. P1: core workflow/correctness/accessibility; blocks pilot until resolved. P2: lower-impact polish/degradation; defer only with recorded impact and mitigation. All P0 and P1 scenarios applicable to the released slice require evidence. Product rules: [plan](../../plan.md), [architecture](../../architecture.md), [data/API](../specs/client-v1-data-api.md).

## A. Identity, grant and tenant isolation

Task coverage: CV03–CV06, CV09. Verify with two users/two weddings, direct HTTP/SQL/storage attempts and normal anonymous/authenticated roles.

| ID   | Priority | Trigger                                                  | Required behavior                                                              |
| ---- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| E001 | P0       | Customer X supplies Y's wedding/resource ID              | No row, preview, response, media or export disclosure/write                    |
| E002 | P0       | Signed-in buyer has no confirmed/active order            | Management APIs and direct database access denied                              |
| E003 | P0       | Grant revoked while dashboard tab remains open           | Next protected action denied, unsaved edits retained safely, no false save     |
| E004 | P0       | Customer tries profile/membership role escalation        | Cannot become staff, assign ownership or self-activate                         |
| E005 | P0       | Valid household/event ID from another tenant in body     | Composite references and command scope reject it                               |
| E006 | P1       | Claim opened by crawler, wrong user, expired or replayed | GET consumes nothing; verified intended-account POST binds once; safe recovery |
| E007 | P1       | Session expires during editing or account switches       | Reauthenticate safely; no cross-account local recovery or false saved state    |
| E008 | P1       | One owner has two weddings, switches with dirty form     | Explicit preserve/discard; forms/requests/counts stay bound to original scope  |

## B. Seller, order and activation

Task coverage: CV07–CV09, CV30. Verify duplicates, transaction failures and delivery retries.

| ID   | Priority | Trigger                                                 | Required behavior                                                                          |
| ---- | -------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| E009 | P0       | Two confirm/activate requests race                      | One wedding/grant/business effect; repeat returns original result                          |
| E010 | P0       | Payment proof/redirect claims paid without verification | Does not unlock paid entitlement/activation                                                |
| E011 | P0       | Callback has wrong amount/currency/order/merchant       | Reject/reconcile; no grant or fabricated paid status                                       |
| E012 | P1       | Delivery email fails after successful activation        | Activation remains; retry same scoped delivery without new workspace                       |
| E013 | P1       | Staff chooses wrong recipient/order                     | Review exact wedding/account; audited correction revokes wrong claim/access                |
| E014 | P1       | Management suspended while guest card is live           | Guest visibility unchanged unless separate explicit pause action                           |
| E015 | P1       | Refund/reversal arrives late or twice                   | Record once, reconcile entitlement separately; retain invitation/history                   |
| E016 | P1       | Approved free/test order or manual payment pilot        | Explicit audited exception/evidence; no fake provider success or unnoticed free activation |

## C. Editor and draft state

Task coverage: CV10–CV12. Verify slow/offline network and two editing tabs.

| ID   | Priority | Trigger                                                  | Required behavior                                                                    |
| ---- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| E017 | P1       | Couple leaves required fields incomplete                 | Draft saves; publish reports actionable missing fields                               |
| E018 | P1       | Older save acknowledgment arrives after newer typing     | Newer edits remain dirty; one serialized save stream; no false Saved                 |
| E019 | P1       | Two tabs save same expected revision                     | One succeeds; other gets conflict and recoverable local copy                         |
| E020 | P1       | Offline/timeout after save may have committed            | Retry same logical command; show uncertain/retry, retain text                        |
| E021 | P1       | BN/EN switch or preview while editing                    | Preserve values, event IDs, focus context and dirty state                            |
| E022 | P1       | Optional translation missing or unsupported locale sent  | Authored default fallback; only bn/en accepted; no broken guest text                 |
| E023 | P1       | Malicious HTML, blank/control-only input or huge payload | Plain-text rendering, bounded validation; preserve valid Bangla shaping              |
| E024 | P1       | Event reordered/duplicated/removed from draft            | Stable IDs survive reorder; duplicate IDs rejected; response-bearing event protected |

## D. Publishing and lifecycle

Task coverage: CV13–CV15. Verify failures around every commit boundary.

| ID   | Priority | Trigger                                                   | Required behavior                                                                          |
| ---- | -------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| E025 | P0       | Publication fails or worker crashes before pointer switch | Previous valid live publication stays intact                                               |
| E026 | P1       | Publish stale draft while another save/publish occurs     | Revision conflict, no silent overwritten publication                                       |
| E027 | P1       | Publish twice, unpublish/republish, retry first publish   | One term start; no hosting reset or duplicate effects                                      |
| E028 | P1       | Media not ready or template version unavailable           | Block new publication with specific issue; previous live survives                          |
| E029 | P1       | Remove event/allowance below already confirmed response   | Explicit reconciliation and impact; no silent history/count corruption                     |
| E030 | P1       | Invitation expires/pauses with stale page/cache           | Current server state governs reads/writes; humane unavailable state                        |
| E031 | P1       | Slug collision/reserved name or attempted slug change     | Conflict before commit; stable existing links, explicit redirect policy if later supported |
| E032 | P1       | OG/cache/email task fails after publication commit        | Publication stays successful; durable retry, no mixed private/public content               |

## E. Named guest links and personalization

Task coverage: CV16–CV19. Verify browser back/forward, two household links and guest session exchange.

| ID   | Priority | Trigger                                                         | Required behavior                                                                        |
| ---- | -------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| E033 | P0       | General URL or household request asks for hidden event          | No restricted detail in HTML/JSON/OG/calendar/media DTO                                  |
| E034 | P1       | Copy same personal link repeatedly                              | Same household/URL; no response reset or silent rotation                                 |
| E035 | P1       | Same display name for different households                      | Distinct IDs/links/history; review hint, no automatic merge                              |
| E036 | P0       | Link revoked/rotated after guest session exchange               | Old session's next protected operation denied; household/history retained                |
| E037 | P1       | Link for B opened after A in same browser                       | Correct scoped identity in each tab/request; no global-current-guest collision           |
| E038 | P1       | Household has no valid published events or archived scope       | Safe update-needed state; never fall through to broader invitation                       |
| E039 | P2       | Clipboard fails, native share cancelled or WhatsApp unavailable | Selectable link fallback; no false copied/sent/delivered assertion                       |
| E040 | P1       | Link forwarded or host edits name/message                       | Explain bearer scope; host correction appears for same household without guest name form |

## F. RSVP and wishes

Task coverage: CV20–CV22. Verify real cross-device writes, race/retry and deadline boundary.

| ID   | Priority | Trigger                                                               | Required behavior                                                                     |
| ---- | -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| E041 | P0       | Repeated submit/double tap/retry after timeout                        | One logical effect/current response; idempotent receipt                               |
| E042 | P1       | Same idempotency key sent with different body                         | Conflict; no replay with changed effect                                               |
| E043 | P1       | Two people edit same household response simultaneously                | Revision conflict; latest confirmed state returned for deliberate retry               |
| E044 | P1       | Fraction, negative, overflow, blank/Bangla numerals or over-allowance | Normalize supported numerals then enforce whole counts/current total                  |
| E045 | P1       | Accept zero people or decline with nonzero counts                     | Reject contradictory payload; decline persisted with zero people                      |
| E046 | P1       | Deadline reached/scope changed while form is open                     | Server now >= deadline closes write; stale policy explained without false success     |
| E047 | P0       | Guest supplies another household/event/name in request                | Server derives identity/scope; unauthorized event rejected, no partial silent success |
| E048 | P1       | Wish retry, blank message or note without attendance                  | Wish deduped/validated; couple-addressed, no name input and no attendance increment   |

## G. Counts, reporting and host corrections

Task coverage: CV23–CV25. Verify seeded states, archived scopes and concurrent guest edits.

| ID   | Priority | Trigger                                               | Required behavior                                                                       |
| ---- | -------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| E049 | P1       | No response vs explicit decline vs wish only          | Pending distinct from Declined; wishes do not set attendance                            |
| E050 | P1       | Same family accepts one event, declines another       | Correct per-event status; combined display Mixed, never global mislabel                 |
| E051 | P1       | Count summary, list and CSV refreshed during writes   | Same definitions/scope/as-of; no arbitrary browser-side total                           |
| E052 | P1       | Same people attend two events                         | Label summed values event attendances; no fabricated unique persons                     |
| E053 | P1       | Revoke link, archive household or remove event scope  | Revocation alone preserves invited/counts; archive shows explicit delta/history         |
| E054 | P1       | Host correction races guest update or passes deadline | Revision checks, attributed actor/reason; explicit authorized override if needed        |
| E055 | P1       | Search/filter changes with cursor/refresh failure     | Reset invalid cursor; retain last good data with stale/error marker, no fake zeros      |
| E056 | P0       | Export with foreign ID or spreadsheet formula/newline | Authorize full scope; neutralize formula execution, preserve valid Unicode/CSV escaping |

## H. Photos, media and cleanup

Task coverage: CV12–CV14, CV29. Verify phone uploads and lifecycle references.

| ID   | Priority | Trigger                                                        | Required behavior                                                                          |
| ---- | -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| E057 | P1       | Sixth photo or concurrent reservations exceed five             | Count reservations/ready selection consistently; explicit limit, no silent drop            |
| E058 | P0       | Spoofed MIME, malformed/decompression-heavy or oversized image | Bound bytes/dimensions/decode; reject safely, no arbitrary executable upload               |
| E059 | P1       | iPhone HEIC, EXIF rotation, poor crop, metadata/GPS            | Qualified support or conversion guidance; orientation/crop preview, strip private metadata |
| E060 | P1       | Upload interrupted/processor crashes/retry duplicates          | Recoverable upload/job state; no ready status until verified processing                    |
| E061 | P0       | Guess another wedding's object path/signature                  | Storage/auth policies deny; signed reads short-lived/scoped                                |
| E062 | P1       | Draft removes photo still used by published version            | Keep referenced asset; collect only when retention/reference rules allow                   |
| E063 | P1       | Active photo removed/reordered or image fails                  | Stable photo IDs, safe next/fallback; zero/one/five variants valid                         |
| E064 | P1       | Revoked link had already downloaded public/signed media        | No false recall promise; future protected reads denied, residual validity documented       |

## I. Sealed invitation and motion

Task coverage: CV19, CV26. Retest existing template after server integration.

| ID   | Priority | Trigger                                                            | Required behavior                                                                        |
| ---- | -------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| E065 | P1       | Closed card scrolled, fragment #rsvp, refresh/back                 | Inner sections/forms/nav absent until deliberate opening                                 |
| E066 | P1       | Open during slow art/font load                                     | Immediate native scrolling, stable cover height; no timer-induced frame jump/focus reset |
| E067 | P1       | Reduced motion, disabled animation or repeated open tap            | Explicit quiet opening, one transition; usable content without motion                    |
| E068 | P1       | Audio autoplay blocked, loading fails or preference off            | No pre-gesture source/play; accurate paused/retry state, content unaffected              |
| E069 | P1       | Music/gallery while hidden, focused, touched or manually navigated | Correct pause/cleanup; no surprising background restart                                  |
| E070 | P1       | Event past/cancelled/reordered; timezone/date changes              | Stable primary event and accurate countdown/copy; no negative countdown                  |
| E071 | P1       | No photos, five photos, natural-size lightbox, vertical swipe      | Intentional layout, all controls accessible, no vertical-scroll hijack                   |
| E072 | P1       | Map/calendar unavailable or external link malformed                | Address/copy fallback; safe scheme, correct scoped date/time/event data                  |

## J. Mobile and accessibility

Task coverage: CV10, CV19, CV26–CV27. Qualify Android Chrome and iPhone Safari, not just emulation.

| ID   | Priority | Trigger                                                         | Required behavior                                                                    |
| ---- | -------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| E073 | P1       | 320px, long Bangla names/address, translated labels             | No horizontal spill/clipped essential text; wrapping and useful compact layout       |
| E074 | P1       | Keyboard, safe area, rotating phone, shrinking toolbar          | Sticky controls reserve space; fields/errors/submit remain reachable                 |
| E075 | P1       | 200% text/zoom, delayed fonts, Bangla conjuncts                 | Shaping/readability and document order preserved; no fixed-height clipping           |
| E076 | P1       | Keyboard/screen reader opens preview/dialog then closes         | Label/role, focus trap/return, Escape and coherent announcements                     |
| E077 | P1       | Locale switch after RSVP input/photo focus/opening              | Preserve identity, unsaved reply and scene state; no accidental form remount         |
| E078 | P1       | Android back/iOS history/BFCache returns stale receipt/deadline | Restore safely and refresh eligibility; do not replay stale writes/open locked state |
| E079 | P1       | Private browsing/storage blocked/low-memory reload              | Safe server persistence; no crash or false local-save/guest-reply loss               |
| E080 | P2       | Slow device/reduced data/unsupported decorative feature         | Useful still fallback; purposeful motion/color hierarchy remains legible             |

## K. Security, abuse and private content

Task coverage: CV04–CV06, CV18–CV25, CV29. Verify headers, logs, policies and direct requests.

| ID   | Priority | Trigger                                                       | Required behavior                                                                                              |
| ---- | -------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| E081 | P0       | Cross-site cookie mutation / unsafe redirect                  | Origin/CSRF defenses and return-URL allowlist; no open redirect                                                |
| E082 | P0       | Server key/OTP/raw token leaks to client/log/telemetry        | Server-only boundaries; scrub token paths and sensitive provider errors                                        |
| E083 | P0       | CDN/cache reuses household A payload for B                    | Private/no-store personalized routes; test actual deployed cache behavior                                      |
| E084 | P0       | Export/preview signed URL guessed/reused after privilege loss | Scoped issuing authorization, short expiry; no permanent public private artifact                               |
| E085 | P1       | OTP/token/RSVP/upload abuse across instances                  | Shared limits/quotas/backoff and safe actionable errors; no process-local-only limiter                         |
| E086 | P1       | Guest text becomes HTML/CSV/OG/support preview                | Escape per output context; private wish/contact excluded from public/social payload                            |
| E087 | P1       | Search engine/social crawler opens personal link              | Generic non-personal metadata, noindex/referrer protections; no attendance/claim side effects                  |
| E088 | P1       | Customer deletion/export request and retained backups         | Identity verified, scoped action, documented retention/restore-erasure policy; no silent cross-tenant deletion |

## L. Jobs, performance and recovery

Task coverage: CV28–CV33. Verify staging fault injection and documented operational drills.

| ID   | Priority | Trigger                                                            | Required behavior                                                                  |
| ---- | -------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| E089 | P1       | Worker dies after external effect before acknowledgment            | Lease expires; retry dedupes side effect, dead-letter/backlog visible              |
| E090 | P1       | Email/storage/provider unavailable for hours                       | Bounded retries/backoff; preserve committed state and useful support status        |
| E091 | P0       | Database restore without objects/guest key/config                  | Full recovery drill includes all; link recopy and private-media reads still scoped |
| E092 | P1       | Rolling deployment or migration partially fails                    | Compatible schema/code rollback; no public draft/demo fallback                     |
| E093 | P1       | Thousands of households / concentrated RSVP burst                  | Indexed paginated reads, consistent counters and recorded p95/error/load results   |
| E094 | P1       | Latest build exceeds payload/LCP or opening responsiveness budgets | Measure actual build, fix/regression review; old Lighthouse score not reused       |
| E095 | P1       | Preview deployment accidentally uses production integrations       | Environment isolation prevents private-data reads/live email/payment effects       |
| E096 | P1       | Hosting term, costs, support/deletion policy not decided           | Block paid launch claims/intake until explicit package/operations decisions        |

## Recording results

For each applicable ID: `build/commit`, role/fixture, browser/device/version, steps, expected vs observed, Pass/Fail/Blocked, evidence path and issue/owner. Automated tests cover policy/math/race integrity; rendered checks cover layout/interaction; physical phones cover actual keyboard/audio/history. None substitutes for the other. Keep existing v6 evidence historical and link it only where still applicable.
