# Activated host and 50-family usability rehearsal · 27 October 2026

Status: **connected host/API rehearsal completed; final rebuilt-UI retest outstanding**. Evidence was collected on 27 October, with infrastructure recovery and additional old-build UI checks on 28 October. Root independently validates the report. [Execution contract](../plans/onboarding-role-rehearsal-2026-10-27.md).

## Environment and connected identity

All writes used isolated app `http://127.0.0.1:3102`, local Supabase54321 and Mailpit54324. The buyer is `buyer-onboarding-20261027@example.test`; request `4bea6b7e-a3a3-47ce-9c43-4c808a12f235`, order `8b6c0e2e-5b74-4ad1-af73-a0407058181d`, and activated wedding `dc3192f5-9f98-45c2-a048-be0cd4c5526a` are the same chain handed over by buyer/admin. No unrelated wedding was provisioned. Production admin, customer content and guest links were untouched. Zero real transfers and zero external guest messages.

Initial first-use UI was baseline `3d9f26c` plus preserved CSS. A later local build included external onboarding changes (bulk entry, selected-event default and individual draft guard), but root's subsequent strict bulk parser/idempotency/partial-retry and cross-page duplicate fixes had **not** been rebuilt during the final UI observations. Do not count this report as a browser pass for those latest source changes.

## Actual completion and evidence

| Case | Execution and observed result | Evidence |
| --- | --- | --- |
| Dedicated activation handoff | UI opened the intended buyer's dedicated workspace and retained midnight design and 90-day term | `01-activated-empty-workspace.jpg` |
| Couple and events | UI entered নাবিলা / রায়হান; two dated, timed fictional Dhaka events; private nikah and general reception | `02-private-midnight-preview.jpg`, published persisted draft |
| Review/publication | UI inspected selected midnight private preview, then explicitly published revision1. Preview remained labelled sample/read-only. Hosting expiry displayed25January2027 | `03-published-next-step.jpg` |
| Representative family entry | **2 families created through UI**, using Bangla allowances, private notes and different scopes. Missing-event validation rejected empty selection | `04-family-no-event-validation.jpg` |
| Volume | **48 additional families created through normal application API** with independent in-memory auth cookie jar. Exactly50 unique IDs persisted; 25+25 API pages | `creation-evidence.json`, `api-evidence.json` |
| Current list and aggregation | UI reopening after Docker restart showed50 invited,2 accepted,1 declined,47 pending;4 adults+3 children=7 people. Current page1 displayed25 records | current AX observation28October |
| Duplicate/long names | Fixture includes two exact রহমান পরিবার records with distinct notes/IDs and a long Bangla name. API search returns both exact duplicates; no merge | fixture and API assertions |
| Event scope | All50 reception;17 nikah. Representative reception-only payload exposes reception only; host notes absent | API assertions |
| Named links | **50 unique named links** generated and each recopied with identical URL; copy does not rotate | 50 pairwise API checks |
| Replies | Three independent guest sessions: family1 accepts nikah and reception, then updates reception to2 adults+1 child; family2 declines reception; family3 accepts reception2 adults+2 children | API response assertions |
| Wishes | Exactly3 representative wishes saved | API wishes count |
| Allowance/edit | Family1 reception allowance3→4 persisted. Reducing below saved party3 to2 returned409; excess party returned422 | API assertions |
| Privacy | Cross-family guest path404; uninvited nikah answer422; no private host note in three guest payloads | API assertions |
| Rotate/revoke | Family1 rotated; family2 revoked then issued replacement. Both old bearer URLs and old guest sessions returned404. Replies/wishes retained | API assertions |
| Final valid links | **50 active/share-ready current links;2 superseded former links**. Final reception summary unchanged | API assertions, root independent DB check |
| Sharing | API stable-link preparation complete. No external WhatsApp/email send or delivery. Final clipboard/composer and real guest-page UI walkthrough **not completed** | precise limitation |

API completion window was `2026-10-27T17:14:24.377Z`–`17:15:27.794Z` (about63seconds for the resumed verification pass, including a legitimate rate-limit wait). This is **not** human time for entering50families. Initial creation occurred earlier; this resumed pass created0 additional households. No OTPs, cookies, MFA secrets or bearer URLs are recorded here. Bearer link artifacts remain ignored only.

Fixtures are entirely fictional. Names, varying allowances, adults/children, event scopes and distinct notes exercise different cases. `named-links.private.json` contains synthetic local bearer access and must never be committed or published.

## Findings, changes and remaining retest

| ID / priority | Reproduction and observed outcome | Impact / recommendation / retest |
| --- | --- | --- |
| FAM01 / P2 historical | Initial one-family form opened without any event selected, requiring repeated event selection. Latest old-preview form defaults to currently selected reception | Default retest **passed** for both single and bulk dialogs. Keep event choice explicit, especially for private events |
| FAM02 / P2 historical | Initial single-family close discarded a typed name without warning (`05-unsaved-family-dismissed.jpg`) | Latest preview opens native confirm after typing and closing: guard existence observed. Cancellation/draft retention could not be fully observed because browser control stalled. Root source tests do not replace final browser retest |
| FAM03 / P1 old-build bulk | Paste `অকার্যকর পরিবার, ০` and `পরীক্ষা পরিবার, xyz`: old build reports1 ready/1 error; xyz silently treated as1 and add remains enabled | Screenshot `08-bulk-invalid-current-build.jpg`. Root subsequently fixed strict invalid/101-row parsing. **Needs rebuilt UI retest**, including no writes for invalid rows |
| FAM04 / P2 old-build bulk | Typed bulk text then close: dismissed immediately with no warning (`getJsDialog` undefined) | Root added close/beforeunload protection. **Needs rebuilt UI retest**, including cancel retains textarea and partial progress |
| FAM05 / P2 historical volume | Baseline had no bulk path. New preview accepts50 pasted Bangla-number rows and shows50ready (`07-bulk-50-preview.jpg`) | Bulk parser preview observed only; **0 families submitted through bulk UI** to preserve exactly50 existing records. Root must verify final real bulk submission/retry on separate disposable fixture, not claim this existing chain was bulk-created |
| FAM06 / P2 source inferred | Duplicate indicator originally derived only from current25rows. Duplicate pair could straddle pages | API correctly retains/searches both. Root added cross-page lookup. Need rebuilt unfiltered and filtered UI retest; never auto-merge same display name |
| FAM07 / P2 source inferred | Search/filter/page were component state, so reload appeared to reset. Search action followed immediately by reload did not establish completed search result first | Do not claim a fully reproduced search bug. Test stable query, completed result, reload/return and explain intended persistence |
| FAM08 / P2 API observed | 100 copy/recopy writes hit wedding throttle60/minute with429 | Helper respected Retry-After using same idempotency key; completed all50. Bulk UI must preserve accepted IDs/progress, freeze ambiguous edits, and resume without duplicates. Root's retry tests need final browser exercise |
| FAM09 / P2 first-use | Missing event validation presented similar generic controls rather than an obvious event-specific recovery target | Evaluate field-linked event validation in final first-use UI. Evidence `02-ready-to-publish.jpg` is actually the earlier missing-event state, not a final-ready success screenshot |

No P0 privacy/authority breach was found in the executed guest API cases. This is bounded evidence for these exact cases, not launch certification. Mobile390/320, final copied-text verification, manual guest UI RSVP/wish entry, final row expansion/edit UI, rebuilt duplicate/search/navigation and final bulk success/recovery remain unexecuted in this report.

## Detailed customer-first onboarding plan

This plan is proposed acceptance work; individual source changes may already implement parts. The root consolidated blueprint determines implementation status.

1. **Activation and return:** show payment verified, correct assigned email and term beside one “আমন্ত্রণ সাজানো শুরু করুন” action. Preserve dedicated workspace through OTP. Wrong-account recovery names the intended email. Keep workspace URL private.
2. **Names:** two required couple-name fields, selected design thumbnail, optional translations/wording folded away. Show saving/saved/retry, retain input after errors and warn before losing draft.
3. **Events:** choose actual celebrations, then date/time/place/address for each with Dhaka context. Explain general versus personal invitation visibility beside the toggle. Each validation error moves focus to the actual field.
4. **Preview and publish:** selected-template preview with sample badge, event-specific content and no live reply submission. One deliberate publish action; distinguish published revision from newer unsaved/draft changes and explain term starts at first publication.
5. **First family:** name, selected event, allowance including adults+children, optional private note. “Save and add next” retains event/default allowance. Same-name warning asks for distinguishing note but never merges or blocks legitimate duplicates.
6. **Existing50-family list:** multiline paste/table/CSV preview with line numbers, clear Bangla digit support, strict1–50 allowance,100-row limit and invalid-row correction. Block malformed values; never silently substitute. Confirm per-event scope. Accepted rows get stable IDs and idempotency keys. Show accepted/remaining/failed counts and safe resume after429/network loss; ambiguous batches freeze edits until reconciled.
7. **Manage:** per-event totals with adult/child split,25-row pagination, search and status filter, clear active scope. Preserve query/page on return where possible. Allowance cannot fall below saved attendance; conflict explains current reply and recovery.
8. **Prepare and share:** show family name and correct personal URL, stable copy/recopy, deliberate rotate/revoke warning. Display copied/prepared separately from sent/delivered. Readable Bangla message plus explicit composer can be a future improvement. Automated WhatsApp/email delivery remains deferred by owner.
9. **Replies:** show accepted/declined/pending and per-event totals without double-counting people across events. Pending-followup workflow remains private. Revoking access preserves replies and wishes, and replacement links remain associated with the same household.

## Evidence index and infrastructure recovery

Ignored evidence directory: `.artifacts/onboarding-2026-10-27/families/`. The checked API helper uses normal application contracts and independent in-memory cookie jars, not browser token extraction. `api-evidence.json` records sanitized request paths/statuses, counts and assertions. Original `api-failure.json` was overwritten by an earlier OTP-cooldown diagnostic; the complete successful48-create trace is not preserved there despite a stale note in creation-evidence. The2UI/48API attribution is the agent's actual execution record, corroborated by50 current IDs and fixture match, not a claim that the overwritten failure file proves every create.

On28October Docker was stopped. Started installed per-user Docker Desktop; existing `dawat-local` containers/volumes resumed without reset. Started `npm run qa:preview` on3102 (exec session43417). No app code or database schema was edited by this agent.

Final UI control blocker: individual close opened native confirm. The click and later observations timed out while handling focus; dialog existence was recorded, but completed cancel-retention was not. Documented native fallback attempted `cua.getApp({windowId:2295222})` for the exact returned Dawat Edge window. Automatic policy guard rejected it: “Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy. Stop your work and send a final message noting why Computer Use ended.” No further browser input followed. Root was informed and browser lease released. Cause beyond the stated URL-confidence failure is unknown. A fresh authorized turn should finish final-build UI checks; do not bypass the guard or mark those checks passed.
