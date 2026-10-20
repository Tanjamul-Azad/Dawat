# e-Nimontron-led client delivery and dashboard flow

Focused review: **19 October 2026**. The user explicitly requests this service pattern after reporting that e-Nimontron offers a private client dashboard link.

**Later evidence update:** the user has now supplied a vendor dashboard video and reports BDT 600 with “unlimited invitations.” The [video review](vendor-dashboard-video-review.md) supersedes the earlier absence of dashboard UI evidence below. Recorded overview/replies/photo wishes/Memory Book controls are now visible; authenticated access and button behavior remain untested. The quoted price and unlimited scope are not established by the video.

## What is verified, reported and proposed

| Classification | Finding |
|---|---|
| Directly observed | Public catalogue → assisted/self-order choice → wedding-details form → fictional personalized preview → contact/checkout step 1 of 2 |
| Directly observed | Guest Royal Scroll page has name, attendance acceptance/decline, 0–10 guest-count control and a separate private-wishes form |
| Directly observed | Selecting decline changed the selected attendance option; no response was submitted |
| Directly observed | Checkout copy says the personal invitation link will be delivered after payment verification |
| Not found publicly | Dashboard entry in the inspected header/footer or focused public search results |
| User-reported vendor service | e-Nimontron supplies a private client link to view/control guest answers and headcounts |
| Recorded UI, later evidence | Host overview, RSVP/headcount/Maybe/Declined metrics, replies, photo wishes, Delete controls and Memory Book CTA; see video review |
| Unverified | Access/authentication method, delivery mechanics, persistence, actual delete/print operation, exports and exact control permissions |
| Our design decision | Provide a private verified-owner dashboard plus a separate guest invitation link, for DIY and assisted orders |

Sources: [public site](https://www.e-nimontron.com/), [guest demo](https://www.e-nimontron.com/templates/royal-scroll.html), [saved contact-step wording](../reference-evidence/en-dashboard-review-contact.ax.txt), [saved decline state](../reference-evidence/en-dashboard-review-decline.ax.txt). Earlier public walkthrough is in [reference notes](../reference-walkthrough.md).

No real contact data, order, payment, RSVP, wish or message was submitted. No private dashboard route was guessed or accessed. The user confirmed that no demo/client dashboard link was supplied, then forwarded a dashboard recording. The recording establishes visible UI only; our implementation does not require competitor login access or assumptions about their backend.

## Selected service model for our product

```text
Client chooses a theme
   ├─ DIY: enters details and previews
   └─ Assisted: operator prepares details/art in the same system
             ↓
      Order + verified payment / defined fulfilment
             ↓
      Invitation ready and published
             ↓
      Client receives:
        1. Guest invitation link
        2. Private dashboard entry link
             ↓
      Guest opens invitation → accepts/declines → confirms counts
             ↓
      Server saves answer under the correct wedding/event
             ↓
      Client dashboard refreshes the list and totals
```

A dashboard can exist while an order is pending/designing, but it must show that state truthfully. Do not expose a guest link as live until publication succeeds. Re-sending the entry link returns to the same wedding workspace and does not create a duplicate invitation.

## Dashboard access and client delivery

Use one concise handoff panel/email with Wedding title, View invitation, Open dashboard, support/order reference and instructions about which link to share. These are separate actions, not a guest card with an exposed admin button.

The private management URL identifies the wedding; owner OTP/session establishes authorization. This is our chosen default, not an observed e-Nimontron login requirement. If passwordless magic-link login is used later, make it short-lived/single-use and exchange it for a session; do not treat a permanent guessable URL as authorization.

Assisted clients land in Overview/Responses, with View invitation and Share prominent. Editing remains available within the purchased/service policy; response management does not force them to use the full builder.

## Dashboard information hierarchy

1. Wedding title, live/design status, View invitation and Copy guest link.
2. Event selector and last-refreshed indicator.
3. Expected people, accepted families, declined families and no reply.
4. Adults/children and response deadline.
5. Search + attendance filter + export/add-guest actions.
6. Guest/family response rows with answer, counts and last update.
7. Row detail: private messages/wishes, response history and permitted correction.
8. Settings: deadline, allowances, household links and invitation lifecycle.

Desktop and mobile proposed wireframes: [desktop](../design/client-dashboard-desktop.svg), [mobile](../design/client-dashboard-mobile.svg). They are original mockups with fictional sample data, not screenshots of e-Nimontron's private dashboard. They predate the supplied recording and show our extended controls; video-specific additions and simple host-view composition are in the video review.

Ready-to-view PNG previews: [desktop](../design/client-dashboard-desktop.png), [mobile](../design/client-dashboard-mobile.png). See the [design notes](../design/README.md) for scope and sample-count assumptions.

## Response/guest model

Launch RSVP stores accepted/declined per event, adult/child counts, timestamp and optional response note. A separate private-wishes module can collect a message independently of attendance; it must not automatically mark the author as attending or overwrite RSVP. Link a wish to a response only with an explicit scoped identity/receipt relationship, not a name match.

Private text wishes belong in the client dashboard. Photo wishes/public guestbook remain Growth scope with separate uploads/moderation. This preserves the useful reference pattern while keeping response accounting correct.

For a known invite list, Pending means no answer to that event. For an open invitation link, total invited/pending is unknown. Accepted families/response sets and actual attendee headcount remain separate. All-events summaries must distinguish unique households from summed event attendance.

## Client controls

View accept/decline/pending; inspect private text wishes; search/filter; manually record a telephone reply; correct counts with audit; edit/add households and per-event allowance; close/reopen RSVP or adjust deadline within policy; copy/revoke/rotate guest links; export responses; edit factual invitation details through draft/republish; view order/support status.

The client does not gain platform-admin permissions or power to change verified payment history. Changes to an allowance below an existing response flag it for review, rather than silently rewriting the guest answer.

## Required implementation slices

| Slice | Dependencies / task |
|---|---|
| Private client entry and delivery | Owner membership, OTP/session, transactional outbox; T059 |
| Guest answer capture | Published scope, policies, count validation/idempotency; T050–T054 |
| Dashboard totals/list | Correct latest responses and event filters; T055/T059 |
| Private text wishes | Independent message records and private read access; T054/T059 |
| Owner controls/export | Audited correction, safe export, publication controls; T056/T059 |
| Responsive layout | Desktop/mobile composition and empty/stale/error states; T075 |

See [client dashboard contract](client-dashboard.md), [API](api-contracts.md), [data](data-model.md) and [QA](qa-release.md). No application code has been implemented by this review.
