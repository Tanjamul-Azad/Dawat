# Client V1 — data and API contracts

20 October 2026. Proposed schema/contracts, not implemented migrations. Read [architecture](../../architecture.md) first. This file overrides conflicting old open-RSVP, premature-dashboard and duplicate event-data proposals.

## 1. Entity model

UUIDs for private entity IDs, stable slugs for general URLs, UTC timestamps and IANA event timezone. Money is integer minor units + currency; never floating point. Examples use synthetic data. Internal IDs do not replace authorization.

| Entity                | Essential fields                                                                                                                            | Constraints / authority                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `profiles`            | auth user ID, display preference, UI locale                                                                                                 | No user-writable staff/access role                                                             |
| `staff_roles`         | user ID, role, active, granted by/time                                                                                                      | Only privileged audited provisioning; never public signup metadata                             |
| `orders`              | ID, customer contact reference, package snapshot, amount/currency, order/payment states, revision                                           | Immutable purchased terms/price; confirmation requires verified evidence or explicit exception |
| `payment_events`      | order ID, provider/reference, verified amount/currency/status, time                                                                         | Unique provider event/reference effect; append-only safe evidence, no card secrets             |
| `weddings`            | ID, order ID, slug, lifecycle, live version ID, publication revision, aggregate RSVP policy revision                                        | Unique order ID and slug; pointer belongs to same wedding                                      |
| `wedding_memberships` | wedding ID, user ID, primary-owner role, active                                                                                             | Unique pair; one active primary owner in V1; changes audited                                   |
| `dashboard_grants`    | wedding ID, state, activated/revoked actor/time/reason, revision                                                                            | One current grant; access still requires intended membership/identity                          |
| `access_claims`       | wedding ID, intended identity, digest, expires/consumed/revoked time                                                                        | Expiring, single-use on verified POST; never consumed by email crawler GET                     |
| `entitlements`        | wedding/order ID, purchased scope, term start/expiry, state                                                                                 | One per purchased scope; first-publication start set once; term values decided before launch   |
| `invitation_drafts`   | wedding ID, content JSON, schema version, template ID/version, revision                                                                     | One current draft; bounded shape; permits incomplete publish fields                            |
| `invitation_versions` | wedding ID, immutable content, template/schema version, publication time                                                                    | Append-only; no private contacts/RSVP/credential data                                          |
| `event_keys`          | wedding ID, event ID, active/archived metadata                                                                                              | Stable IDs, not a second mutable event content store                                           |
| `rsvp_policies`       | wedding/event ID, open/closed, deadline, revision                                                                                           | Operational; commit-time checks independent of presentation content                            |
| `households`          | wedding ID, ID, localized display name/greeting/message, private note/contact, overlay revision, aggregate response revision, archived time | Identity keyed by ID, never name; public/private fields separated                              |
| `household_events`    | wedding/household/event IDs, max total people, revision                                                                                     | Unique triple, tenant-safe foreign keys; scope only existing event IDs                         |
| `guest_links`         | wedding/household ID, digest, encrypted recoverable token, key version, state/revision                                                      | One active link per household initially; digest unique; raw token not plaintext at rest        |
| `guest_sessions`      | link/household scope, session digest, credential revision, expires                                                                          | Revocation checked after exchange; several scoped sessions per browser supported               |
| `responses`           | wedding/household/event IDs, accepted/declined, adults/children, note, revision, source, actor/time                                         | Unique household/event; declined counts0; non-negative integers; no Pending row                |
| `response_changes`    | response ID, prior/new summary, source/actor/time/reason                                                                                    | Append-only private history; not public content or unredacted logs                             |
| `wishes`              | wedding/household ID, text, created time, idempotency reference, moderation state                                                           | Independent of attendance; host-supplied author identity                                       |
| `media_assets`        | wedding ID, ID, owner, object keys, actual format/dimensions, state, bytes                                                                  | Tenant path isolation; only ready derivatives publish; provenance/consent reference            |
| `publication_media`   | wedding/version/media IDs, usage                                                                                                            | Prevent deletion while retained versions still reference media                                 |
| `idempotency_records` | tenant/actor/action/key hash, request hash, result reference, created/expiry                                                                | Unique scope/key; same key/different body conflicts; no raw credentials in result              |
| `audit_events`        | wedding/order ID, actor, action, target IDs, safe change category, reason/time                                                              | Access-controlled append-only; no raw link/OTP/wish body                                       |
| `outbox_jobs`         | kind, scope ID, dedupe key, state, lease, attempts, next attempt, safe last error                                                           | Unique business dedupe; retry/dead-letter; bounded payload                                     |

Private schema/exposed-schema selection, policy helper ownership and SQL function grants are finalized in the migration review. No household, response, private original or claim table gets broad anonymous SELECT. Customer RLS checks current membership/grant; staff/guest commands use narrowly authorized functions. All reference combinations enforce same-wedding ownership with composite keys.

## 2. Content and versioning

`InvitationContent` holds default locale, localized couple/hosts/wording, stable-ID event definitions, primary event ID, ordered media references, template options and explicitly general-visible event IDs. Only `bn` and `en` accepted. One authored default locale required; optional translations fall back to that field's authored default without auto-translating names. UI copy is translated separately.

Draft shape validation permits incomplete fields; publish validation requires valid names, a supported template/version, at least one complete event, coherent time/venue/map data, valid primary event, ready media and no orphan references. Start with Asia/Dhaka as the simple default. Any supported alternate timezone must handle ambiguous/nonexistent wall times explicitly rather than guessing.

Revision ownership is explicit:

- `draft.revision`: editor saves and publish compare this; household replies do not dirty the draft.
- `weddings.publication_revision`: changes when the live pointer changes.
- `weddings.rsvp_policy_revision`: aggregate revision incremented by any deadline/open-state or publication eligibility change. Individual policy rows may also have revisions, but guest commands compare this aggregate.
- `households.overlay_revision`: name/greeting/scope/allowance changes. The guest echoes it as `expectedHouseholdRevision`; protected server checks still revalidate actual allowance/scope.
- `households.response_revision`: incremented once per committed household answer-set change, including host correction. Guest and host commands echo it as `expectedResponseRevision`, even when changing only one event. Individual response row revisions support history but do not replace this aggregate check.

This prevents two event forms from comparing unrelated per-event revisions as if they were one version. A reply updates the response revision without pretending base content or household naming was edited.

Proposed input bounds (implementation constants shared by UI/server): names160 Unicode code points, household message500/locale, private note1000, wish1000, max five photos, max ten events, allowance1–50/event, server page size default25/max100. These are initial engineering limits, not package promises; verify art/layout and package needs before locking them. Reject control-only/blank strings; normalize whitespace safely, preserve Bangla shaping/joiners. Plain text only; no customer HTML/CSS/scripts.

Normalize Bangla numerals for count input, then require whole integers; no floats, negative numbers, NaN, exponent text or overflow. Clear labels say allowance is total people; adults includes respondent, children separate. Always validate total at server commit.

## 3. Metric definitions

For selected active published event E and report snapshot T:

- **Invited households:** non-archived household-event scopes for E. Link revocation alone does not uninvite or erase their response.
- **Accepted / Declined:** invited households with current accepted/declined response for E.
- **Pending:** invited households without current response for E. `accepted + declined + pending = invited`.
- **Confirmed adults/children/people:** sum accepted current counts for E; people = adults + children. Allowance and page visits never enter these sums.
- **Wishes:** independent record count; they do not set response state.
- Multi-event totals are **event attendances**, not deduplicated people. Without named individual attendees the product cannot calculate unique persons across events; do not invent that metric.

Archive/scope removal changes current report membership only through explicit impact confirmation; retained confirmations are shown in historical/archive reporting, with the delta disclosed. Do not silently drop a confirmed household to make totals look smaller. Host correction history/source remains available. Same-event summary/list/export use the same scope and consistent snapshot or carry a clear as-of revision/time.

## 4. API conventions

Logical contracts below; exact handler folders are implementation detail. JSON is bounded; validation errors identify fields without leaking other tenants. Mutations use session/credential authentication, origin/CSRF defenses for cookies and rate limits backed across server instances. Never authorize from body `userId` or client state.

Errors: `{ code, messageKey, fieldErrors?, requestId, currentRevision? }`. No private record dump in error. Responses: `{ data, revision?, asOf? }`. Use `400` malformed, `401` unauthenticated, `403` known scoped denial, neutral `404` for inaccessible foreign resources, `409` revision/idempotency conflict, `410` only where revealing expiry is safe, `422` invalid domain input, `429` with Retry-After, `503` retryable dependency failure. Deliberate business-error codes determine UX, not parsing English message text.

Command `Idempotency-Key` generated once per logical attempt and retained on retry; body includes `expectedRevision` for updates. On changed form content generate a new logical command key. Provisional dedupe retention72h; permanent uniqueness/response revisions still prevent double effects after it expires. High-value financial events retain durable provider uniqueness independently.

### Staff / access

| Endpoint                                    | Actor                  | Contract                                                                                 |
| ------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `POST /api/admin/orders`                    | Staff                  | Create manual order with authoritative package snapshot; key prevents duplicate creation |
| `POST /api/admin/orders/:id/verify-payment` | Staff                  | Method/reference/amount/evidence decision; not a client proof boolean                    |
| `POST /api/admin/orders/:id/confirm`        | Staff                  | Expected revision, verified eligibility or explicit exception; provision once            |
| `POST /api/admin/weddings/:wid/activate`    | Staff                  | Intended verified customer/claim, expected revision, reason; queue delivery              |
| `POST /api/admin/weddings/:wid/access`      | Staff                  | Explicit suspend/revoke/reactivate action; guest visibility separate                     |
| `POST /api/access/claims/:token/accept`     | Intended verified user | Atomic claim/membership binding, no side effect on GET                                   |
| `POST /api/admin/deliveries/:id/retry`      | Staff                  | Retry existing delivery; no new wedding/grant                                            |

### Couple management

| Endpoint                                         | Contract                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `GET /api/weddings`                              | Accessible workspaces only, paginated; no all-orders customer lookup              |
| `GET /api/weddings/:wid/overview?eventId=...`    | Authorized status/count summary with as-of marker                                 |
| `GET/PATCH /api/weddings/:wid/draft`             | Fetch/save content, expected revision; no client-controlled publish/payment flags |
| `POST /api/weddings/:wid/uploads`                | Scoped reservation with count/size budget; expires                                |
| `POST /api/weddings/:wid/uploads/:id/finalize`   | Verify actual object and enqueue bounded processing                               |
| `POST /api/weddings/:wid/publish`                | Expected draft revision, idempotency; immutable version/pointer transaction       |
| `POST /api/weddings/:wid/visibility`             | Explicit pause/resume; impact and audit; no destructive delete                    |
| `GET/POST /api/weddings/:wid/households`         | Cursor/search/event/status filters or bounded named creation                      |
| `PATCH /api/weddings/:wid/households/:hid`       | Expected revision; named overlay/live impact; validate allowances/scope           |
| `GET /api/weddings/:wid/households/:hid/preview` | Safe scoped read-only DTO, no credential disclosure needed                        |
| `POST /api/weddings/:wid/households/:hid/link`   | Idempotent create/get active link; no accidental rotation                         |
| `POST /api/weddings/:wid/links/:lid/copy`        | Authorized decrypt/recopy; private/no-store, log IDs only                         |
| `POST /api/weddings/:wid/links/:lid/rotate`      | Explicit revision + acknowledgment; preserve household/responses                  |
| `POST /api/weddings/:wid/links/:lid/revoke`      | Explicit action; invalidate subsequent guest session operations                   |
| `GET /api/weddings/:wid/responses`               | Cursor, event/status/search, stable sort; private DTO                             |
| `POST /api/weddings/:wid/responses/:rid/correct` | Expected revision, reason/source; deadline override separate permission           |
| `GET /api/weddings/:wid/wishes`                  | Authorized paginated private text wishes                                          |
| `POST /api/weddings/:wid/exports`                | Explicit filter scope; safe bounded CSV or async private expiring artifact        |

Every couple endpoint applies the complete management gate, including previews, upload reservation, copy and export. Read-only access after suspension is not assumed; any such policy must be explicit.

### Guest

| Endpoint / operation               | Contract                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Resolve `/i/:slug`                 | Only general-safe live DTO, view-only; no household lookup                                                            |
| Resolve `/i/:slug/g/:token`        | Validate bearer/session and current scope, private/no-store; no attendance effect                                     |
| `GET /api/guest/:scope/invitation` | Exact guest session scope; filtered live version + safe name/allowance + policy/response revisions                    |
| `POST /api/guest/:scope/responses` | Event answers, aggregate policy/response revisions and household overlay revision, idempotency; server-bound identity |
| `GET /api/guest/:scope/response`   | Only own current answers/receipt; no guest list                                                                       |
| `POST /api/guest/:scope/wishes`    | Plain text + idempotency; host-defined author; independent of RSVP                                                    |

`:scope` is an opaque session-bound identifier, not authorization by itself. A response request resembles:

```json
{
  "expectedResponseRevision": 0,
  "expectedPolicyRevision": 4,
  "expectedHouseholdRevision": 2,
  "answers": [
    {
      "eventId": "reception-stable-id",
      "status": "accepted",
      "adults": 2,
      "children": 1
    }
  ],
  "note": "We plan to arrive before dinner."
}
```

Server rejects unknown/uninvited/duplicate event IDs, stale state, invalid counts and identity/status fields outside the contract. Guest notes are private; localized identity is never accepted from that request body. An unauthorized supplied event does not get silently dropped while claiming full success.

## 5. Query/index and export requirements

Indexes: membership(user,wedding), order(reference/status/time), households(wedding,stable cursor), household_events(wedding,event,household), responses(wedding,event,status,updated,id), credential digest unique, outbox(state,next attempt), media(wedding,state). Query plans validated on realistic multi-wedding fixtures before claiming scale.

Cursor pagination uses deterministic tie-break ID and whitelisted sorts. Search resets cursor and has a bounded query length. No full response downloads merely to compute totals in JavaScript. Summary and results include filters/as-of; changing event resets incompatible filters.

CSV handles quotes/newlines/Unicode and neutralizes formula-leading values (`=`, `+`, `-`, `@`, including dangerous leading whitespace/control forms) without trusting input. Export is scoped, auditable and private, includes timezone/status/source, and labels archived records clearly. Expiring download URLs are not permanent public assets. Revoke/new permission checks apply when issuing a download.

## 6. Consistency / retention checkpoints

- No cascading deletion of a live event/household erases responses; archive and explicit retention jobs instead.
- Scope/allowance edits that contradict a confirmed response require reconciliation and visible metric deltas.
- Idempotency, concurrency and current eligibility are enforced inside commands, not a check-then-write race across endpoints.
- Provider callback, claim, publication, RSVP and job duplicates have business uniqueness independent of UI button disabling.
- Retention/deletion deadlines and deletion rights must be decided before live intake. Erasure includes relevant object backups/retention policy, private exports and recovery artifacts; legal/payment record retention follows separately verified policy.
- Raw guest links are not included in ordinary CSV, audit or support logs. Key recovery is tested separately from database restore.

Scenarios and evidence mapping: [corner cases](../qa/client-v1-corner-cases.md). Current implementation status: [task tracker](../../task.md).
