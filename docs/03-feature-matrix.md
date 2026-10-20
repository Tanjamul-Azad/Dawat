# Feature matrix and scope

> First-pass comparison. For current release allocation use [plan.md](../plan.md): basic manually managed household-token RSVP is included before paid launch; import/collaborators are Growth. Additional second-pass evidence is in [the walkthrough](reference-walkthrough.md).

**D = directly observed UI/flow; A = advertised, not verified end-to-end; U = unknown.**

An entry such as `D: RSVP form` means the form was seen, not that a response reached a database. `U` is not a claim of absence. Reference evidence is detailed and linked in [the audit](01-reference-audit.md) and [catalogue](02-template-catalogue.md).

Our scope: **MVP** = before public paid launch; **P2** = after the first reliable release; **Later** = optional expansion. Rows for new features are proposals, not promises to implement everything immediately.

## Storefront, services and commerce

| Feature | The Digital Yes | e-Nimontron | Our scope / decision |
|---|---|---|---|
| Marketing homepage | D | D | MVP: original brand and real invitation preview |
| Template gallery | D | D | MVP: occasion/style filters |
| Name/style search | D | U | MVP: simple catalogue search |
| Favourite designs | D | U | P2; browser-local shortlist is sufficient initially |
| Detailed product page | D | Gallery + live template | MVP: dedicated demo, inclusions and CTA |
| Live invitation demos | D | D | MVP: every sellable theme has a functioning demo |
| Full-screen demo | D | Direct template page | MVP: direct mobile guest-view preview |
| Guided feature tour | D | U | P2 |
| Bangla/English storefront | Other language choices; Bangla U | D | MVP: Bangla + English |
| Multiple storefront currencies | D | BDT displayed | Later: BDT first |
| Self-service personalization | No automatic buyer editor advertised | D: form → preview | MVP: guided structured builder |
| Ready-made service | A | A | MVP: template customization |
| Designer-assisted service | A | A | MVP: request/quote workflow; manual fulfilment acceptable |
| Bespoke illustration | A | A | P2: separately quoted, explicit scope |
| Save the Date product | D/A | Tags / designs; standalone service distinction U | P2: light announcement type |
| 3D pop-up product | D/A | Scroll/other visual motion; true 3D product class U | Later: after simple opening is reliable |
| Multi-tier packages | D | Ready-made + custom | MVP: one clear DIY package + custom quote |
| Itemized add-ons | D | U | P2; no surprise charges |
| Coupons / credit | D: entry | U | P2: server-validated rules |
| Gift cards | D/A | U | Later |
| Express service | A | U | P2 only with operational capacity |
| Prepayment preview | D: demos, own details collected later | D: fictional personalized preview | MVP: personalized private preview |
| Payment UX | D: Stripe signals; not paid | Contact step; next step U | MVP: approved payment provider in sandbox then production |
| Payment verification | U beyond checkout | A: link after verification | MVP: authoritative server verification |
| Upgrade plan | A | U | P2: preserve paid entitlements |
| Clear legal / refund pages | D | Not found in inspected nav | MVP: policies matching actual service |
| Reviews / testimonials | D, claims not independently validated | U | P2: real permissioned customer evidence |
| Blog / guides | D | U | P2: Bangla wording and sharing guides |
| Newsletter | D | U | Later; separate opt-in |
| WhatsApp support | D: link | D: link + order option | MVP: user-initiated support |

## Builder, owner workspace and service operations

| Feature | The Digital Yes | e-Nimontron | Our scope / decision |
|---|---|---|---|
| Account / portal | D: order code + email gate | Public account entry U | MVP: owner login and private wedding workspace |
| Couple names / nicknames | A / name fields D at purchase | D | MVP |
| Parent/family names | Template/service dependent | D: optional parent fields | MVP: flexible hosts/relations |
| Briefing autosave | A | U | MVP: draft save + clear status |
| Multiple events in one wedding | Custom sections; separate-event add-on A | One-event form D | MVP: nikah/holud/biye/walima/reception as configurable events |
| Theme/color choice | Designer service A | Custom service A; self-service color control U | MVP: curated safe palettes |
| Freeform drag-and-drop canvas | Not presented as buyer editor | U | Later, if needed; not a launch dependency |
| Section enable/order | A: designer arranges | U | MVP: reorder structured sections with accessible controls |
| Image uploads | A | D: five-photo input | MVP: private upload, crop, remove and limits |
| Music configuration | A / paid options D | Music included A; selection UI U | MVP: licensed small track library + mute |
| Mobile / desktop preview | D: framed/full screen | D: preview controls | MVP: one renderer, two preview widths |
| Reusable draft / resume | A: portal briefing | U | MVP: authenticated drafts |
| Publish/unpublish | Public customer controls U | U | MVP |
| Edit after publication | A: detail updates | U | MVP: republish changes without changing link |
| Version rollback | U | U | P2; keep published snapshot from launch |
| Share link / QR | Link A; QR suggested in copy | Link A; generated QR U | MVP: copy/WhatsApp link and QR |
| Custom URL / domain | Domain add-on D | Preview slug-style label D; custom domain U | MVP: stable slug; custom domain Later |
| Guest/RSVP dashboard | A; planner demo D | U | MVP: event-wise totals and response list |
| CSV export | D: planner export control | U | MVP: sanitized guest response export |
| Analytics | Planner summaries D; invitation analytics U | U | P2: aggregate views; describe measurement limits |
| Revision requests / proofs | A | A: one custom revision | P2: design-service queue and comments |
| Admin order fulfilment | Private U | Private U | MVP: real admin dashboard |
| Admin template publishing | Private U | Private U | MVP: template metadata + version controls |
| Collaborating family members | A: planner up to four | U | P2: invite and restrict roles |

## Guest-facing invitation

| Feature | The Digital Yes | e-Nimontron | Our scope / decision |
|---|---|---|---|
| Browser link, no guest install | D/A | D | MVP |
| Envelope / curtain / seal opening | D/A by design | D/A by design | MVP: one simple original opening per theme |
| Photo-free invitation | Design-dependent | Some illustration-led layouts | MVP: fully supported |
| Names, families and wording | D/A | D | MVP: Bangla and English content |
| Religious text / blessings | Custom service A | D: Muslim demos | MVP: optional, owner-reviewed |
| Countdown | D | D | MVP: timezone-correct, expired-event state |
| Scratch reveal | A / tour | D: controls | P2: always provide an accessible reveal button |
| Music toggle | A / demo-dependent | D | MVP: start following guest action |
| Photo slideshow | Custom content A | D | MVP: compressed gallery |
| Event timeline | D | Single-event emphasis | MVP: multi-event schedule |
| Venue / directions | D | D | MVP: per-event directions and landmark |
| Current-location directions | U | D: Royal Walima control | Later: maps link is sufficient initially |
| Add to calendar | A / tour | D: control | MVP: per-event calendar file/link |
| Dress code | D | U | MVP: optional section |
| Transport / accommodation | D | U | P2, unless needed by a launch customer |
| Gifts / registry information | D | U | P2: optional informational section |
| RSVP attendance | D | D | MVP: event-wise accept/decline |
| Companion / family allowance | D form + advanced manager A | D: 0–10 guest-count field | MVP: explicit household allowance; server enforced |
| Children count | D: LACE form | Separate child count U | MVP: adults/children with clear total |
| Dietary information | D: LACE; planner | U | P2: optional, privately stored |
| Private note / wishes | D: RSVP note | D: separate private-wish form | MVP: private text note |
| Wish with photo | U | D: optional control | Later: requires upload/moderation controls |
| Guest-selectable languages | A; per-plan | Storefront D; guest translation U | MVP: complete Bangla/English guest content |
| Personalized guest greeting | Advanced manager A | U | P2: secure household links |
| Event-specific guest access | U | U | P2: server-filtered restricted events |
| RSVP editing | U | U | MVP: secure edit receipt/token |
| Public guestbook | U | Copy explicitly says wishes private | Later: opt-in moderation; private default |
| Print/download card | Not core; QR print suggested | U | P2: separate static print layout |
| Reduced-motion experience | U | U | MVP requirement for our themes |

## Planner expansion — keep outside the first card-maker release

The Digital Yes planner landing/demo includes or advertises budget/payments/contracts, vendors/comparison, guest families, tables, catering, task dates, PDF/CSV exports and a 56-section binder. It also advertises offline sync, collaboration, natural-language actions, quote reading, weather, weekly summaries and gift tracking. e-Nimontron equivalents were not established.

For our product, retain only invitation-related guest management in MVP. Treat budget planning, seating, vendor management and AI planning as a **separate later roadmap**, with independent cost and user research.

## Minimum launch boundary

Paid public launch needs storefront, functioning builder, saved drafts, secure payment verification, stable publishing, shareable guest page, working RSVP, private owner dashboard, admin support and a way to recover from failures. A gallery of beautiful static demos alone does not meet this boundary.
