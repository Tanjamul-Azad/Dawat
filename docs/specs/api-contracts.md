# API contracts

> **Client V1 update · 20 October 2026:** [current logical API contract](client-v1-data-api.md) owns the next production slice. This older broad inventory is supporting detail; no anonymous/open RSVP or pre-activation management. Endpoint names alone do not imply implemented handlers.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

Production HTTP contract under `/api/v1`. Local implementation is starting; this register does not certify an endpoint is implemented. Browser sandbox adapters must be visibly separate from production services. Client management operations require authenticated session, scoped membership, operator-confirmed order and active dashboard grant. Pre-order preview/order routes have their own narrow scope and must never reuse a management DTO. Public endpoints are deliberately narrower. Types/validation should be shared where safe, but authorization always remains server-side.

## Conventions

- Supported locale writes/manifest/content dictionary keys are only `bn`/`en`; reject unsupported values with a safe validation code. Display fallback is defined separately and never relaxes tenant/guest authorization. Guest locale changes do not create new response identities or change allowed events.

- JSON request/response; UTC ISO timestamps with explicit event timezone fields.
- Money is integer `amountMinor` and ISO `currency`.
- Lists use bounded `limit` + opaque cursor; no unbounded guest exports through list APIs.
- Mutations requiring concurrency include `expectedRevision`; return a new revision.
- Retryable create/payment/publish/RSVP operations accept `Idempotency-Key`.
- Scope idempotency records by authenticated actor/session + operation + wedding/order; same key with a different body returns conflict.
- Errors return safe codes and field paths, not stack traces or raw provider responses.
- Cookie-authenticated mutations require same-origin/CSRF protection appropriate to the framework.

Example error:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "messageKey": "errors.reviewRequiredFields",
    "fieldErrors": {"events.event_demo.venue.bn": "required"},
    "requestId": "req_example"
  }
}
```

## Endpoint register

| Method/path | Access | Result / important rule |
|---|---|---|
| `GET /templates` | Public | Active metadata/filter results; no private objects |
| `GET /templates/{slug}` | Public | Manifest-safe demo data, supported features and package entry |
| `POST /previews` | Bounded preview scope | Limited validated customer preview; no private management entitlement |
| `POST /weddings` | Staff / activated client | Create authorized draft; provisional order preparation never grants client access |
| `GET /weddings/{id}` | Owner | Private workspace summary |
| `GET /weddings/{id}/draft` | Owner | Current draft and revision |
| `PATCH /weddings/{id}/draft` | Owner | Validate draft content; expected revision |
| `POST /weddings/{id}/uploads` | Owner | Scoped reservation/signed destination |
| `POST /weddings/{id}/uploads/{mediaId}/finalize` | Owner | Verify object and enqueue processing |
| `GET /weddings/{id}/media/{mediaId}` | Owner | Processing status/safe derivatives |
| `POST /weddings/{id}/preview-links` | Owner | Expiring read-only token |
| `POST /previews/{id}/quotes` | Verified preview/order scope | Server-computed package/term/add-on snapshot |
| `POST /orders` | Verified preview/order scope | Quote-bound order; no client-supplied price authority |
| `POST /orders/{id}/payment-sessions` | Verified order scope | Gateway redirect/session for allowed pending order |
| `GET /orders/{id}` | Verified order scope | Bounded own payment/fulfilment/access status; no guest records or private dashboard DTO |
| `POST /admin/orders/{id}/confirm` | Staff | Verify amount/currency/evidence; audited, idempotent confirmation |
| `POST /admin/orders/{id}/dashboard-grants` | Staff | Require confirmed order; activate scoped grant, audit and enqueue dedicated entry delivery |
| `DELETE /admin/dashboard-grants/{id}` | Staff | Revoke grant; invalidate management/storage/export access and record reason |
| `POST /payments/{provider}/notify` | Provider adapter | Verify documented provider confirmation, replay-safe |
| `POST /weddings/{id}/publish` | Owner | Immutable version + active pointer, paid entitlement if required |
| `POST /weddings/{id}/unpublish` | Owner | Hide guest surface without data deletion |
| `PATCH /weddings/{id}/rsvp-policy` | Owner | New policy revision; validate scope/deadline |
| `POST /weddings/{id}/households` | Owner | Manual household, localized greeting/message and per-event scope/allowances |
| `PATCH /weddings/{id}/households/{hid}` | Owner | Same-wedding overlay update with expected revision; no silent history deletion |
| `GET /weddings/{id}/households/{hid}/preview` | Owner | Read-only scoped preview DTO; no production RSVP or credential analytics |
| `POST /weddings/{id}/households/{hid}/links` | Owner | New random revocable token; hash for verification plus authenticated encrypted recovery; explicit rotation if replacing existing link |
| `POST /weddings/{id}/guest-links/{linkId}/copy` | Owner | Reauthorize/decrypt existing link, no-store result and safe audit; never rotate on copy |
| `DELETE /weddings/{id}/guest-links/{linkId}` | Owner | Revoke future access; retain history |
| `POST /guest-sessions` | Token exchange | Scope bearer token to invitation/household; no owner rights |
| `GET /invitations/{slug}` | Public/scoped guest | Published allowlisted payload; restricted events filtered |
| `POST /invitations/{slug}/responses` | Guest scope | Event-wise RSVP and private note |
| `POST /invitations/{slug}/wishes` | Guest scope | Independent private text wish; rate-limited/idempotent, never creates an accepted RSVP |
| `GET /weddings/{id}/wishes` | Owner | Paginated private text messages; no public list |
| `GET /response-receipts/{token}` | Receipt scope | Only that response summary and permitted edit form |
| `PATCH /response-receipts/{token}` | Receipt scope | Same validations/deadline/concurrency as creation |
| `GET /weddings/{id}/responses` | Owner | Paginated private list/filter/totals |
| `POST /weddings/{id}/responses` | Owner | Record a phone/in-person reply; validate guest/event/counts and label owner-entered source |
| `PATCH /weddings/{id}/responses/{responseSetId}` | Owner | Audited correction with reason/expected revision; never silently impersonate a guest |
| `POST /weddings/{id}/response-exports` | Owner | Authorized safe CSV download/job |
| `POST /design-requests` | Public/owner flow | Validated assistance request; abuse controls |
| `GET /admin/orders` | Admin | Scoped operational data with audit |
| `POST /admin/orders/{id}/actions` | Admin | Enumerated allowed action + reason; never arbitrary state rewrite |

The `notify` path is illustrative. Final gateway HTTP method, verification fields and acknowledgement format must follow its current official integration contract.

## Create/update draft

```json
{
  "expectedRevision": 3,
  "content": {
    "schemaVersion": 1,
    "templateId": "jamdani-ivory",
    "templateVersion": 1,
    "defaultLocale": "bn",
    "enabledLocales": ["bn", "en"],
    "events": []
  }
}
```

Example is shortened; actual schema is in the data-model spec. Accept incomplete but structurally safe drafts. Return `revision`, `savedAt`, content and nonblocking readiness warnings. `409 REVISION_CONFLICT` preserves the server version and provides a recovery path; do not silently choose last-writer-wins.

## Upload contract

Reservation input: filename for display only, declared MIME and byte size. Server generates object key and limits. Output: `mediaId`, scoped upload URL/fields and expiry. Client cannot choose another wedding's storage prefix. Finalize validates ownership and actual object metadata; processing result is `ready` or `rejected` with a safe reason. Published DTO contains approved derivative URLs only.

## Quote/order contract

Input: wedding, package SKU/version and supported add-on IDs. Server derives price, currency, hosting term and limits. Output contains itemized snapshot and quote expiry. Creating order from expired/mismatched quote returns `409 QUOTE_EXPIRED` with refresh path. A new payment attempt does not create a new paid entitlement for the same order.

`GET /orders/{id}` returns separate `paymentState`, `fulfilmentState`, `entitlementState` and `nextAction`. Never return provider credentials or a browser-supplied fake success field.

## Publish contract

```json
{
  "expectedDraftRevision": 8,
  "requestedSlug": "mehrin-arib-example",
  "expectedPolicyRevision": 2
}
```

Output: `publicationId`, `publicationRevision`, stable `guestUrl`, `publishedAt`, `expiresAt`. Field errors point back into the editor. Slug conflict, missing entitlement, pending media and invalid content have distinct codes. Retry under the same valid idempotency scope returns the same publication result.

## Public invitation DTO

Allowlist: display/theme manifest version, approved decorative/media derivatives, localized public content, permitted published event details, countdown target, public contact choices and minimal RSVP policy/allowance state.

After household scope resolves, add safe `guestContext` containing only this household's display name, localized greeting/message, current overlay revision and permitted event allowances. Generic URL/OG payload contains none. Personalized HTML/API responses are private/no-store; public versioned artwork may remain cacheable. Do not provide public guest-name lookup.

Exclude: owner identity/email, private contacts, draft/proof content, orders/prices paid, storage originals, guest list, response/private-note records, other household names, token hashes and admin metadata. Private-event details must also be absent from HTML/social metadata and shared cache responses.

## Household/token exchange

Guest entry carries a high-entropy token. Exchange verifies hash, invitation, expiry/revocation and household state; establishes a short-lived secure scoped session where possible. Strip token from subsequent visible navigation and suppress referrer/analytics leakage. Recheck source revocation on protected reads/writes. If cookies are unavailable, use an explicitly designed token transport without public caching; do not silently broaden access.

Owner copy is an independent authorized operation: verify membership, wedding/link match and nonrevoked link, decrypt authenticated ciphertext using its dedicated key version, return only the intended existing guest URL under `Cache-Control: no-store`, and audit actor/target without credential material. Never fall back to silently generating a different token on decryption error. Report safe unavailable/recovery state; offer an explicit explained rotation when appropriate. Hash-only recovery guidance is superseded by ADR A15. Neither copy nor preview creates a response/household or changes attendance.

Household mutation fields: `displayName`, optional `greetingByLocale`, optional `messageByLocale` (proposed max 500 Unicode characters per locale), `eventAccess[]` with published/stable event ID and allowance, and `expectedRevision` for edits. Validate locale keys/plain text and same-wedding event relationships. Base venue/time changes still require draft/republish. Return saved overlay/revision; failed saves retain entered values without claiming success.

## RSVP contract

```json
{
  "policyRevision": 2,
  "displayName": "Example Family",
  "answers": [
    {"eventId": "event_holud", "attendance": "accepted", "adults": 2, "children": 1},
    {"eventId": "event_nikah", "attendance": "declined", "adults": 0, "children": 0}
  ],
  "privateNote": "We look forward to celebrating."
}
```

Use the active household/anonymous guest scope from the server, not a trusted `householdId` in the body. Reject unknown/unpublished/unauthorized event IDs, duplicate event entries, negative/fractional/excess counts and attendance/count contradictions. Server time determines closure. Distinguish untouched events from explicit declines.

Output: confirmed event summary, response revision and secure edit receipt. Raw receipt/token material is returned only to the submitting scope; store hashes and keep any idempotency response cache private, short-lived and protected. It must not become a publicly retrievable response endpoint.

Updates include `expectedResponseRevision`. Owner corrections use owner-only endpoints/audit, not someone else's guest receipt. A response saved under an older publication still refers to stable event IDs; archive/permission changes are checked before accepting edits.

## Error map

| HTTP | Safe code examples | UI behavior |
|---|---|---|
| 400/422 | `VALIDATION_FAILED`, `INVALID_COUNTS`, `UNSUPPORTED_BLOCK` | Field/path errors; retain user input |
| 401 | `SESSION_REQUIRED`, `SESSION_EXPIRED` | Sign-in/recover safely |
| 403/404 | `ACCESS_UNAVAILABLE` | Generic private-resource response; no enumeration details |
| 409 | `REVISION_CONFLICT`, `SLUG_UNAVAILABLE`, `QUOTE_EXPIRED`, `POLICY_CHANGED`, `IDEMPOTENCY_CONFLICT` | Review/refresh, not blind duplicate submit |
| 410 | `LINK_EXPIRED`, `INVITATION_EXPIRED` where safe | Intentional expiry state |
| 413 | `UPLOAD_TOO_LARGE` | Explain limit and smaller-image path |
| 429 | `RATE_LIMITED` | Retry-after without repeated hammering |
| 502/503 | `PROVIDER_PENDING`, `TEMPORARILY_UNAVAILABLE` | Pending/retry and reference; no false failure/success |

Use a consistent privacy response policy for invalid/revoked tokens. Do not reveal resource existence merely to preserve an exact status distinction.

## Required contract tests

Two-owner isolation, expected-revision conflict, unsafe media/link rejection, snapshot-only public payload, household event filtering, token revocation, RSVP retry/update/decline/count rules, quote tampering, provider replay/mismatch/delay, atomic publish failure and private export authorization. These map to `qa-release.md`.
