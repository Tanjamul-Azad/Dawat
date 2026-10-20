# Data model and integrity rules

> **Client V1 update · 20 October 2026:** [current entity/API contract](client-v1-data-api.md) and [architecture](../../architecture.md) override conflicts here. General links are view-only; V1 responses always use host-created households. Stable event IDs reference versioned content, not a second editable event-data store. This is a proposal, not implemented SQL.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

Proposed PostgreSQL model. This is a schema specification, not a migration already applied. Use UUID identifiers, `timestamptz` for instants, IANA timezone strings and integer minor units for money. Treat references to a wedding as tenant scope.

## Conventions

Locale keys are restricted to `bn` and `en`, including profile/default/enabled locales and localized invitation/household fields. Enabled locales are nonempty and contain the default. Validate the allowlist server-side and with applicable DB constraints. Names remain Unicode data and are never translated as a side effect of locale selection. See [localization](localization-content.md).

- `created_at`/`updated_at` are server-generated.
- Every wedding-owned record has `wedding_id` even if reachable through another FK, so authorization and indexes are explicit.
- Composite foreign keys enforce that related household/event/response records belong to the same wedding.
- Immutable historical records are appended, not silently rewritten.
- JSON content is versioned and schema-validated by the server; database constraints still protect core relationships.
- Names are display values, never identity keys.

## Core entities

| Table | Important columns | Constraints / indexes |
|---|---|---|
| `profiles` | `user_id`, display name, locale | PK maps to managed auth identity; no credentials here |
| `weddings` | id, owner_id, slug, title, lifecycle, timezone, draft_version_id, live_version_id, publication_revision, expires_at | Unique normalized slug; pointer versions must belong to wedding; owner/date indexes |
| `wedding_members` | wedding_id, user_id, role, state | Unique wedding/user; owner invariant; launch owner/admin paths only |
| `templates` | id, slug, title, tags, category, availability, current_version_id | Unique slug; active/retired separate from renderability |
| `template_versions` | id, template_id, version, schema_range, manifest, asset_set_id | Unique template/version; immutable once used in publication |
| `invitation_versions` | id, wedding_id, kind, revision, schema_version, template_version_id, content, created_by | Unique wedding/revision; published rows immutable; expected revision on draft updates |
| `event_keys` | id, wedding_id, state, archived_at | Unique wedding/id; stable identity only, no duplicate editable venue/time fields |
| `rsvp_policies` | wedding_id, revision, mode, closes_at, open_count_limit, note_enabled, state | One current policy pointer or unique wedding/revision; revisions immutable |
| `media_objects` | id, wedding_id, uploader_id, original_key, MIME, bytes, status, checksum, derivatives | Owner/wedding index; nonnegative size; processing status checked |
| `version_media` | version_id, media_id, role, sort_order | Enforce same wedding; reference count for cleanup |

Editable event title/time/venue are authoritative inside the current draft `content.events`. A publish snapshot freezes them. `event_keys` only preserves stable relational identity for access/responses. Do not also maintain editable event times in a second table without an explicit synchronization contract.

## Guests and responses

| Table | Important columns | Constraints / indexes |
|---|---|---|
| `households` | id, wedding_id, display_name, private_contact, greeting_by_locale, message_by_locale, personalization_revision, state | Localized plain text; proposed message limit 500 Unicode characters/locale; expected-revision writes; private contact excluded from guest DTO |
| `household_event_access` | wedding_id, household_id, event_key_id, max_total, allow_children | Unique household/event; all FKs same wedding; nonnegative allowance |
| `guest_tokens` | id, wedding_id, household_id, token_hash, token_ciphertext, encryption_key_version, expires_at, revoked_at | Unique hash verifies random high-entropy bearer token; authenticated encryption for owner-authorized recopy, no plaintext at rest; dedicated versioned server key; ciphertext bound to token/wedding identity |
| `guest_sessions` | id/hash, wedding_id, scope, household_id, expiry, token_id | Short lifetime; revoked source token invalidates protected access |
| `response_sets` | id, wedding_id, mode, household_id or anonymous_session_id, display_name, receipt_hash, revision | One active set per household; anonymous sets scoped by receipt/session, not name |
| `event_responses` | id, wedding_id, response_set_id, event_key_id, attendance, adults, children, submitted_publication_id, policy_revision | Unique response_set/event; counts are nonnegative integers; decline means zero |
| `private_notes` | id, wedding_id, response_set_id, body, updated_by | Owner/submitting-scope only; plain text and bounded length |
| `private_wishes` | id, wedding_id, author_scope_id, response_set_id nullable, display_name, body, created_at | Independent text wishes; optional scoped response link, never inferred from matching name; no effect on attendance totals |
| `response_audit` | response_set_id, actor_type, prior/new revision, action/time | Corrections distinguished from guest submissions |

Launch stores household-level adult/child totals. Individual named companions, dietary details and custom questions are Growth extensions. Avoid designing acceptance tests that require those fields before they are in scope.

### Household overlay and recoverable credentials

The base snapshot owns wedding/theme/event facts. Household localized greeting/message, event access and allowance are operational overlays, evaluated after authorization; save with `expectedRevision` and audit, not one invitation-version copy per recipient. Restrict locale keys/field lengths and reject HTML/script/theme overrides. Generic guest DTOs contain no overlay. Personalized responses are private/no-store and restricted events are filtered server-side.

**ADR A15 supersedes earlier hash-only token storage.** Hash verification remains authoritative for guest access; encrypted ciphertext supports a separate owner-only copy operation. Use authenticated encryption, a unique nonce for each encryption, identity-bound associated data and a dedicated key version in managed secret storage. Encryption keys must not live alongside DB dumps. Recovery/rotation preserves the original raw link where possible; an explicit credential rotation is a separate audited operation that invalidates previous shares, not a side effect of Copy. No token hash, ciphertext, raw URL or key enters public DTOs/logs. See [personalized invitations](personalized-invitations.md) and [operations](operations.md).

### Counting rules

For each event: `total = adults + children`. Accepted must have `total >= 1` and fit the policy/household allowance. Declined must have both zero. No answer is different from declined. Owner dashboards aggregate the latest valid event response once, not every submission audit row.

Pending in household mode = invited household/event pairs with no current answer. Open mode has no complete invitation list, so it cannot show a reliable pending count. Editing a name does not create a new identity. Revoking a link blocks access without deleting historical responses.

## Commerce and fulfilment

| Table | Important columns | Constraints / indexes |
|---|---|---|
| `packages` / `package_versions` | SKU/version, amount_minor, currency, limits, hosting_term, inclusions, active | Immutable sold version; current active pointer |
| `quotes` | id, owner_id, wedding_id, package_version_id, item_snapshot, amount_minor, currency, expires_at | Server-computed; cannot trust client total |
| `orders` | id, owner_id, wedding_id, quote_snapshot, payment_state, fulfilment_state, confirmed_at, confirmed_by | Unique merchant reference; separate state columns |
| `dashboard_access_grants` | id, order_id, wedding_id, user_id, state, activated_by/at, revoked_at/reason | Confirmed-order prerequisite; same-tenant FK; idempotent activation; revocation affects API/RLS/storage/export access |
| `payment_attempts` | id, order_id, provider, provider_session_ref, state | Multiple attempts allowed; payment completion once |
| `payment_events` | provider, provider_event_id/transaction_id, order_id, verified_amount, currency, kind, processed_at | Unique provider/event; if no event ID, derive a key including transaction and verified event kind/version so a later reversal is distinct; reject mismatches |
| `entitlements` | id, wedding_id, order_id, kind, limits_snapshot, valid_from, valid_until, state | Unique grant source; no double grant on callback replay |
| `design_requests` | id, wedding_id, order_id, requested_scope, materials_state, assignee, fulfilment_state | Access by owner/assigned role; quote acceptance explicit |
| `proofs` / `revision_rounds`, Growth | request_id, version_id, round_no, comments, approved_at | Immutable proof/version link; rounds are grouped feedback, not every small edit |

Store provider verification evidence only in a restricted, redacted form needed for reconciliation. Do not log full customer/payment payloads by default. Refund/reversal is recorded as an event and state transition with operator/provider provenance.

With the working first-publication hosting policy, payment creates a ready-to-activate entitlement. First publication atomically sets activation/expiry under the entitlement lock; repeat publication does not restart the term. Renewal adds a separately verified extension. Final commercial rules must match checkout copy.

Client dashboard access is independent of payment entitlements and hosting-term activation. Payment verification does not activate the dashboard. Staff confirmation and an active user/wedding grant are mandatory; account membership alone never authorizes management. Apply the same predicate in API authorization, RLS, private media signing and export jobs.

## Operations

| Table | Purpose | Integrity |
|---|---|---|
| `idempotency_records` | Request scope/key, request fingerprint, status and short-lived secure response cache | Unique scope/key; same key with different request gets conflict |
| `outbox_jobs` | Transactional delivery/processing/reconciliation tasks | Durable state, attempts, next-run time; idempotent handler |
| `audit_events` | Actor/tenant/target/action/reason/time | Append-only operational trail; no raw tokens/private note bodies |
| `preview_tokens` | Expiring read-only draft/proof scope | Hash at rest; revocable; no management rights |
| `domain_mappings`, Growth | Customer domain, verification, certificate/expiry state | Unique domain and confirmed owner before mapping |
| `aggregate_events`, Growth | Minimal invitation metrics | Exclude tokens, private fields and identifiable payloads |

## Content schema v1

```text
schemaVersion
templateId + templateVersion
defaultLocale + enabledLocales
couple.partners[]: id, displayNames[locale], fullNames?, nicknames?
hosts[]: id, names[locale], relation?, wording?
message[locale], blessing?[locale]
events[]: id, type, title[locale], startsAt, endsAt?, timezone,
          venue[locale], address[locale], landmark?[locale], mapUrl?,
          dressCode?[locale], notes?[locale], state
countdownEventId?
gallery[]: mediaId, derivativeId, alt[locale], crop, sort
soundtrack: trackId | null
theme: approvedPaletteId, openingId, photoMode
sections[]: blockId, type, enabled, config
publicContacts[]: approved label/value/type
closing[locale]
```

`events[].id` must exist in `event_keys` for that wedding. Template manifests decide which blocks/configs are valid. Internal provider/order fields never enter this content schema. RSVP policy and allowances are operational records, not untrusted guest-editable theme JSON.

### Starting validation targets

Proposed configurable technical defaults: partner/host names up to 120 Unicode characters; event titles up to 120; venue names 200; address 500; message 2000; private note 1000; gallery five photos; maximum ten events as an upper technical cap. Package limits may be lower and must be applied from purchased entitlements. Tune with real content and preserve Unicode shaping; these are not competitor limits.

URLs use allowed schemes and destination validation; no arbitrary script/data URLs in user links. Event end cannot precede start. Published bilingual content requires valid required strings or owner-confirmed explicit fallback rules.

## Lifecycle values

| Domain | States |
|---|---|
| Wedding access | draft, published, unpublished, archived, expired |
| Template availability | draft, active, retired |
| Media | reserved, uploaded, processing, ready, rejected, deletion_pending |
| Payment | initiated, pending, paid, failed, cancelled, reversed/refunded |
| Fulfilment | not_required, awaiting_materials, designing, proof, revisions, approved, published |
| Job | queued, running, retry_wait, succeeded, dead_letter |
| RSVP policy | open, closed |

States require legal transitions in service code. Do not overload `completed` across payment, design, publication and event attendance.

## Transactions and indexes

Atomic boundaries: draft revision + new event-key registration; publication + live pointer + outbox; verified event + paid state + entitlement + receipt job; response-set update + event answers + private note + revision. Use unique indexes for callback/idempotency protection rather than best-effort “check then insert.”

Indexes: owner weddings by updated time; wedding versions/revisions; household/event access; response sets by wedding/update time; event answers by wedding/event/attendance; orders by owner/state and merchant reference; jobs by state/next-attempt; token hashes unique. Add actual query indexes after measuring, not speculative indexes on every JSON property.

## Retention and deletion

Unpublish is reversible and does not delete data. Hosting expiry controls presentation, not automatic financial-record deletion. Account/wedding deletion has a staged process: verify scope, export opportunity per policy, revoke access, remove invitation personal data/media after configured delay, preserve only necessary financial/audit records under the actual retention policy. Remove unused uploads only after reference checks across retained versions. Draft/RSVP/media retention periods remain a commercial/policy decision before launch.

## Migration and fixtures

Version every schema migration and seed only fictional development data. A template/content schema upgrade needs a migration that can read older publications; do not rewrite old paid invitations casually. Fixtures must cover Bangla/English, multiple hosts/events, no photos, long names, token household access, declined/edited responses and pending/duplicate payment events.
