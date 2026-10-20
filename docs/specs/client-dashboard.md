# Client dashboard and private delivery link

> **Client V1 update · 20 October 2026:** use [current design](../../website-design.md) for C01–C08/S01–S05 and [current data/API](client-v1-data-api.md) for metrics/actions. This earlier broad spec is supporting detail; Maybe, photo wishes, memory books and family collaborators are deferred, not V1 controls.

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

User-confirmed core requirement · **19 October 2026**. The client receives a private dashboard entry link and can see/manage who accepted, who declined, attendee counts and other invitation controls. This is part of the invitation product's paid-launch scope, not the separate full wedding-planner expansion.

The user selected the e-Nimontron-style delivery/management behavior, with a **much more premium original UI** inspired by TDY plus Dribbble/Pinterest. [Focused verification and service flow](e-nimontron-client-flow.md) separates evidence from our design. Earlier [desktop](../design/client-dashboard-desktop.svg)/[mobile](../design/client-dashboard-mobile.svg) mockups are low-fidelity structural drafts, not final visual targets or vendor screenshots. Follow [design roadmap](../design/design-roadmap.md) P01–P06 for custom composition, typography, mobile/detail states and celebratory identity.

**Video evidence update:** the user later supplied a 22.47-second vendor recording. [Detailed video review](vendor-dashboard-video-review.md) records the host overview, 45 RSVP records versus 115 guests, separate Maybe card, replies, photo wishes, wish Delete controls and Memory Book CTA. Only scrolling is demonstrated. Our search/export/edit/deadline/household controls remain proposed; they are not proven vendor capabilities. BDT 600 and “unlimited invitations” are user-relayed vendor terms with unresolved scope. Photo wishes/removal, printable memory book and optional Maybe are specified as Growth G10–G12, not silently added to launch.

## Two different links

| Link | Intended user | What it opens |
|---|---|---|
| Guest invitation | Invited guests | Published card, permitted event details and RSVP |
| Client dashboard | Paying client / verified wedding owner | Private guest/response management and invitation controls |

Guest invitation has two share modes: general published URL and a personalized household URL. The latter displays that household's greeting/message and permitted events/allowance, using one base theme rather than another card/site. Share UI distinguishes these two guest modes from private management. See [personalized invitations](personalized-invitations.md).

Example route shapes, not live URLs: `/i/{slug}` for guests and `/weddings/{id}/responses` for the client. A dashboard URL alone does not grant access. Verify owner identity through email OTP/session before showing private information. A forwarded dashboard link must not reveal guest responses to another person.

## Delivery and onboarding

1. A public buyer submits an order tied to a bounded preview and contact/account scope. Authentication alone, a provisional wedding record and payment status do not grant client workspace access.
2. Staff verify the order/payment, explicitly confirm the order, then separately activate its scoped dashboard grant. Only then deliver the dedicated client entry through the approved transactional channel. Before activation show bounded order status without the dashboard shell. Invitation publication is a later state.
3. First access verifies identity via OTP/session and rechecks the confirmed order, active dashboard grant and same-wedding membership; return to that wedding only. Expired/revoked access fails closed.
4. Show the client a short explanation: this private dashboard manages the invitation; the separate guest link is what they share.
5. Once published, display Copy guest link and View invitation alongside the dashboard tools.
6. A returning authenticated owner can open the same dashboard link without repeating onboarding. Expired sessions require verification again.

An assisted client gets the same private management workspace even when our operator prepared the card. A client must not need to learn the builder before they can see guest responses.

## Dashboard overview

Start with an event selector: All events / Holud / Nikah / Reception, using the actual configured events. When totals span several events, label event-attendance totals and unique households separately; never add the same person's attendance across events and call it unique guests.

Per-event summary cards:

- Invited households/families, when a guest list exists.
- Accepted households and total expected attendees.
- Declined households.
- No response yet.
- Adults, children and total attendees.
- Response deadline/open/closed status and last refresh time.

Example for one event: **100 invited families → 60 accepted, 15 declined, 25 pending. Accepted attendance: 132 adults + 16 children = 148 people.** Family/response counts and attendee counts are different measures.

In open RSVP mode, show received responses and accepted/declined totals. “No response yet” is unavailable without a known invite list. Do not guess attendance from page views or count someone as declining merely because they have not replied.

## Guest/response list

| Column/detail | Meaning |
|---|---|
| Guest / family name | Named household or open-response display name |
| Event | Event this answer applies to |
| Attendance | Accepted / Declined / Pending |
| Adults | Includes the respondent; zero for decline |
| Children | Separate from adults |
| Total | Adults + children |
| Allowance | Maximum allowed for a named household/event |
| Last response/update | When the latest answer was recorded |
| Message | Private note for the hosts, if supplied |
| Source | Guest submission or owner-entered/corrected answer |

Filters: event, accepted, declined, pending and name search. Open a row for the full response and update history. The client must be able to read decline answers/messages as clearly as acceptance answers.

## Client controls at launch

| Control | Expected behavior |
|---|---|
| Add/edit household | Name, optional private contact, localized greeting/message, permitted events/allowances; expected-revision save |
| Preview household invitation | Read-only scoped view with recipient welcome/message and allowed events; no production RSVP writes |
| Copy household invitation | Correct existing scoped guest URL through authorized encrypted recovery; never rotate on copy or use dashboard URL |
| Revoke/rotate guest link | Future access blocked; response history retained |
| Record a phone/in-person reply | Owner can enter accept/decline/counts on behalf of guest, labelled with source |
| Correct a response | Reason/history and actor recorded; counts validated like guest submission |
| Adjust allowance | Server-enforced; existing over-limit answer flagged for review rather than silently changed |
| Change RSVP deadline / close responses | Immediate authoritative policy update; already-open forms rechecked |
| Edit event details | Draft changes and explicit republish; stable event/response identity |
| Share/view invitation | Stable live guest URL and QR |
| Export guest responses | Authorized formula-safe CSV with per-event counts |
| Read private notes | Only authorized wedding owner/support scope |
| Read private text wishes | Separate message list; a wish does not imply attendance or change RSVP totals |
| Unpublish/archive | Clear effect; no accidental response deletion |

Reminders can initially be user-initiated composed WhatsApp messages reviewed and sent by the client. Bulk/automatic messaging is separate future scope. No messages were sent by this planning task.

## Refresh behavior

Responses persist immediately on successful server submission. The dashboard provides Refresh and updates counts from the authoritative response set. Proposed launch behavior: refresh on focus and modest polling while visible (for example 30 seconds), with a visible last-update time. A realtime subscription is an optional implementation choice, not a reason to duplicate the response logic.

If refresh fails, retain the last confirmed data, label it stale and show Retry. Do not reset counts to zero. Cancel background refresh when hidden/unmounted. Recompute/refresh after owner changes and response edits. Prevent late responses from an older event filter from replacing the currently selected event's data.

## Dashboard layout

```text
Wedding title / live state / View invitation / Share
Event selector                 Last updated / Refresh
[Expected attendees] [Accepted families] [Declined] [Pending]
[Adults] [Children] [RSVP deadline / open status]
Search name        Attendance filter        Export / Add guest
Guest/family | Event | Answer | Adults | Children | Total | Updated
Click row → private message, allowance, history, owner correction
```

Mobile uses stacked response cards with prominent attendance and count labels. Declines and pending states are not hidden behind a secondary analytics screen.

## Acceptance scenarios

- A verified client opens the delivered dashboard link and sees only their wedding.
- An unauthenticated or unrelated user opening the same URL cannot read private data.
- Guest accepts Holud and declines Reception; the client sees both answers under the right event.
- A known household has not answered; it appears Pending, never Declined.
- Guest edits attendance; totals update once, with no duplicate entry.
- Owner records a telephone reply; the response is labelled owner-entered and audited.
- A declined reply's private note is visible to the client, not other guests.
- Adults/children/total and household counts remain distinct and consistent.
- Open RSVP does not display an invented pending count.
- Failed refresh preserves the last known list/counts and displays stale-state feedback.

Related contracts: [screens](screen-specifications.md), [data model](data-model.md), [API](api-contracts.md), [QA](qa-release.md). Core implementation tasks: T050–T059 and T075.

Additional personalized-link acceptance: recopy returns the same valid URL, explicit rotation invalidates only that credential and preserves responses, failed overlay save stays unsaved, one household never sees another's message/events, and guest name/restricted venue never reaches generic metadata/cache. ADR A15's hash plus authenticated encryption replaces hash-only recovery. A device-local functional prototype must carry fictional/demo labels and cannot imply production owner security or online persistence.
