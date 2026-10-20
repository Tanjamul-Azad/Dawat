# Customer order and dashboard activation

> **Client V1 update · 20 October 2026:** current scope/order is [plan](../../plan.md); current state/authorization rules are [architecture](../../architecture.md) and [data/API](client-v1-data-api.md). This document is supporting detail where consistent. Management still requires seller confirmation, separate activation and verified scoped identity.

19 October 2026 · Latest explicit user requirement. This overrides any earlier implication that a buyer can enter the owner workspace before order confirmation. The old browser sandbox's unrestricted demo dashboard is not the public commercial access model.

## Four surfaces

| Surface | Who | Permitted work |
|---|---|---|
| Public storefront | Visitor / prospective buyer | Catalogue, template demo, customized preview, package/order, bounded own order status and necessary support/policies |
| Private client workspace | Confirmed customer with operator-activated access | Wedding/invitation controls, named guest links, RSVP records, wishes and permitted exports |
| Guest invitation | Invited guests | Published allowed invitation details, attendance and private wish submission |
| Operator/admin | Authorized business operator | Order/payment verification, confirmation, preparation, client assignment, access activation/delivery and support |

Public customization can use the shared renderer and a limited saved preview. It is not a customer dashboard and cannot expose guest records, personalized link generation, exports, publish controls or management APIs. Signing in to resume shopping does not grant these capabilities.

## Lifecycle

```text
Catalogue → template demo → customized preview → order review/submission
→ payment pending / provider verified
→ operator confirms order
→ operator activates the correct customer's dashboard access
→ deliver dedicated private dashboard entry link
→ verified identity + active grant → assigned wedding workspace
→ invitation prepared/published when ready → guest sharing/RSVP
```

Default paid workflow requires verified payment plus operator confirmation/activation. Payment verification alone is not customer workspace activation; browser redirects never unlock it. Any alternate payment/commercial policy requires an explicit authorized server-side/operator rule. A buyer cannot self-confirm using a public button, order number or local state.

An internal wedding/draft can exist before confirmation. Provisional ownership or a matching buyer ID is not management authorization. Enforce `verified identity + correct wedding membership + confirmed order + active dashboard grant` at the server and database/storage boundaries, including reads, exports and guest-link creation. Hiding navigation is insufficient.

After activation the private dashboard may show preparation/proof status before the invitation is live. Activation, design fulfilment, publication, hosting expiry and RSVP closure remain different states. Before activation the buyer receives only their limited order status/support, not an early customer dashboard.

## Data and operations

Keep order confirmation provenance (`confirmed_at`, `confirmed_by`, reason/status) separate from provider payment state. Add scoped `dashboard_access_grants` with wedding/order/customer, active/suspended/revoked state, activated_by/time and revision. Activation/provisioning and delivery-outbox enqueue are transactional/idempotent; retries do not create another wedding or duplicate grant. Delivery failure retries the same assignment.

The private entry URL identifies the wedding; owner verification/session and the grant authorize it. Guest links remain a separate surface. Audit operator confirmation, activation, suspension/revocation and reassignment. Use policy-based handling for cancellation/reversal; do not silently erase guest history.

## Design and current scope

One fully designed original template starts the journey. Mobile is the primary product: 390px composition first, 360/320px checks, then intentional tablet/desktop adaptations. Main inspiration is The Digital Yes; Dribbble contributes UI/composition principles, Pinterest stationery/material references, and ChatGPT ImageGen original art/mood/hero assets. No copied competitor artwork or generic stock dashboard skin.

Optional video hero or scroll-linked scene must improve the mobile experience and retain an attractive poster/static fallback. Native touch scrolling, accessible text, immediate practical details and reduced motion take priority over cursor effects. A generated still is not a generated video.

The user will compare our upgraded version with AI Studio and Figma/Claude alternatives against this same brief. No version is approved merely because it was produced first.

## Acceptance

- Anonymous, logged-in but pending, and confirmed-but-unactivated buyers cannot read client management pages/APIs/data.
- A confirmed order activated for customer A does not grant customer B access.
- Replayed confirmation/callback/activation does not duplicate records, entitlement or delivery assignment.
- An activated customer can receive a preparation-state dashboard without a falsely live guest URL.
- Guest invitation contains no client dashboard/admin links or private response list.
- Public order-status information remains scoped and does not reveal management data.
- Prototype order/activation transitions are explicitly simulated in an internal demo, never claimed as production authorization.
