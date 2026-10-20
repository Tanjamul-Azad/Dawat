# Reference audit

> Historical first-pass audit. The current 19 October handoff and expanded coverage are in [the master README](../README.md) and [detailed walkthrough](reference-walkthrough.md). In particular, all 27 3D wrappers, the distinct bridesmaid collection, dedicated plan pages and planner Tasks/subviews were added in the second pass. Original observations below remain dated evidence, not current scope authority.

Reviewed on **18 October 2026, Asia/Dhaka**. This is a public product/UX audit, not access to either company's private implementation.

## Evidence labels

- **Observed:** visible page, field, control, or navigation inspected directly. A visible form does not prove successful backend processing.
- **Advertised:** the service describes the capability, but its delivery was not verified through a paid account.
- **Unknown:** inaccessible, requires an order/contact/payment, or was not exercised.
- **Proposed:** our product decision; not a claim about a reference.

Browser inspection matters here: live content differed from search-readable pages. For example, The Digital Yes live homepage listed **35 wedding designs and 16 classic Save the Dates**, while web-readable versions returned smaller counts. Counts and promotional prices below are a dated snapshot.

## 1. The Digital Yes: positioning and business model

The main product is a designer-prepared wedding mini-site. Buyers select a starting design and level of design service, submit a brief, review a private proof, request revisions, and share the resulting link. It is not presented as a Canva-style editor for the buyer. [Service workflow](https://www.thedigitalyes.com/how-it-works).

### Storefront structure — observed

The homepage acts as a long sales and discovery page:

1. New-product announcement.
2. Navigation, planner entry, language/currency selector and portal entry.
3. Hero with animated/video presentation, starting price and main catalogue CTA.
4. Design showcase and social-proof counters.
5. Explanation of the purchase/design/share process.
6. Wedding-design cards, favourites and expandable collection.
7. Separate classic/3D Save the Date discovery.
8. Explanation of human design work.
9. Testimonials and product-feature walkthrough.
10. Gift-card purchase choices.
11. FAQs, demo selector and newsletter.
12. Collection, service and policy footer links, plus WhatsApp contact.

The browser view did not expose the same pricing section placement as the web-readable homepage. Treat the reusable modules and separate pricing route as reliable; do not depend on one permanent homepage order. [Homepage](https://www.thedigitalyes.com/).

### Navigation and supporting pages

| Area | Public route / entry | Role |
|---|---|---|
| Catalogue | [/designs](https://www.thedigitalyes.com/designs) | Search by name/style; invitations vs Save the Dates; saved designs |
| Wedding product | `/demo/{design}` | Demo and sales details for one design |
| Save the Date | [/digital-save-the-date](https://www.thedigitalyes.com/digital-save-the-date) | Early announcement collection and education |
| 3D collection | [/3d-pop-up-save-the-date](https://www.thedigitalyes.com/3d-pop-up-save-the-date) | Fold-open card collection |
| Pricing | [/pricing](https://www.thedigitalyes.com/pricing) | Plan comparison and upgrades |
| Process | [/how-it-works](https://www.thedigitalyes.com/how-it-works) | Brief, proof, revisions and delivery |
| Planner | [/planner](https://www.thedigitalyes.com/planner) | Separate wedding-planning product |
| Portal | [/clients](https://www.thedigitalyes.com/clients) | Redirected to `/clients/login` |
| Trust / content | `/reviews`, `/our-story`, `/blog`, invitation guides | Reviews, company story, search traffic and buyer education |
| Additional occasions | `/birthdays`, `/baby-shower` | Adjacent invitation services |
| Policies | `/terms`, `/privacy`, `/refunds`; planner footer also linked `/cookies` | Service and data policies |

The footer also linked a bridesmaid-proposal page. Its search-readable result fell back to homepage content; a distinct working service flow was not verified.

### Design/product detail page — observed

The LACE page and the other wedding product wrappers share a pattern:

- Breadcrumb, design name, concise description and starting price.
- Save/favourite control.
- Live demo inside a phone-style frame, full-screen entry and guided screens.
- The walkthrough explains opening/music, names/date, countdown, maps/calendar, timeline, dress code, accommodation, gifts, RSVP and languages.
- Purchase CTA next to reviews and a short list of service assurances.
- Information tabs for creator, sections and inclusions.
- Explanation that sections can be selected and reordered through the service.
- Delivery timeline and expandable inclusion/personalization/process/revision information.
- Designer contact, customer videos/reviews and related designs.

The phone preview is an embedded invitation. Several loaded from dedicated demo subdomains. This is an observable presentation choice, not evidence that every customer receives a separate deployment or subdomain. [LACE product example](https://www.thedigitalyes.com/demo/lace).

### Plans and paid services

| Plan | Displayed base price | Design scope | Languages | Included design rounds |
|---|---:|---|---:|---:|
| Essential | €175 | Existing collection adapted with buyer's details | 2 | 2 |
| Premium | €575 | Cover/interior/icons redesigned around the wedding | Up to 3 | 4 |
| Excellence | €975 | Bespoke design and art direction | As needed | 7 |

Standard delivery is advertised as 7–14 days after receiving materials; Essential/Premium offer express delivery for €85, described as 1–4 business days in the detailed workflow. Prices are per wedding, paid once. Premium/Excellence include video/music, Save the Date and wedding tools; details differ by tier. [Pricing](https://www.thedigitalyes.com/pricing).

Observed in the Essential order configuration:

| Optional item | Displayed price |
|---|---:|
| Venue illustration | €45 |
| Animated cover | €55 |
| Music | €15 |
| Illustration + animation + music bundle | €89 |
| Duplicate invitation for another event | €45 |
| Guest list manager with permitted companions | €55 |
| Custom monogram | €25 |
| Custom domain | €65 |
| Yes Planner add-on | €39 |

The bundle displayed a crossed-out €115 comparison. The summary also had a code/credit entry. Save the Date is advertised at €49 as an Essential add-on, versus €75 standalone. [Save the Date explanation](https://www.thedigitalyes.com/digital-save-the-date).

### Purchase flow — observed to payment boundary

```text
Choose design → choose plan → optional express
→ order summary + partner names + order email
→ optional services + code/credit
→ secure-payment button
→ [payment and post-purchase steps not executed]
```

The plan chooser initially highlighted Premium in the inspected flow. The summary allowed changing the design, showed itemized price/total, and displayed Stripe, card and wallet payment signals. Wallet availability and payment settlement were not tested.

Post-purchase briefing autosave, proof review and revisions are advertised. The service says change requests belong in the portal, while routine event-detail updates remain available until the wedding. These were not tested within an account. [How it works](https://www.thedigitalyes.com/how-it-works).

### Guest-facing invitation features

The loaded LACE embedded demo exposed:

- Names, date and venue; personalized art and typography.
- Countdown, venue illustration and directions link.
- Schedule with event times and illustrated icons.
- Dress-code information.
- Transport and pickup location.
- Accommodation recommendations and booking links.
- Gift/bank-transfer information.
- RSVP deadline, name, accept/decline, optional companion, children, dietary requirements and message.
- Couple sign-off and vendor credit.

Other wrappers describe opening envelopes, wax seals, curtains, animated illustration and music. Gallery descriptions also show paper, embroidery, stained-glass, beach and travel art directions. Opening choreography varies by design; it is not a universal fixed sequence. [LACE demo](https://www.thedigitalyes.com/demo/lace), [Teatro](https://www.thedigitalyes.com/demo/teatro), [Stained Glass](https://www.thedigitalyes.com/demo/stained-glass).

No RSVP was submitted. Companion limits, guest-specific restrictions, response storage and dashboard updates remain advertised rather than end-to-end verified. The public RSVP guide discusses confirmation collection and response management. [RSVP guide](https://www.thedigitalyes.com/blog/rsvp-digital-wedding-invitation).

### Save the Date and 3D products

Classic Save the Dates announce the date/place earlier than the full invitation. The service explicitly says standalone Save the Dates do **not** include the full invitation's RSVP/dashboard. The 16 live classic product pages used a common sales shell: embedded demo, preview/full-screen controls, favourite, €75 details version or €135 custom version, delivery information and Premium upsell. [Collection explanation](https://www.thedigitalyes.com/digital-save-the-date).

Interaction families include photo/date scratching, wax-seal or lace reveals, candle lighting, photobooth imagery and decorative motion. Product-page labels/descriptions were inspected; every reveal was not manually completed.

The 3D collection advertised 27 designs, venue illustration rising from a card, tap-to-open interaction, designer personalization and proof review. The collection displayed €75 standard / €135 custom and an approximately seven-day delivery. The loaded Arabian Palace product instead displayed **€55 standard**. Do not assume a single verified price across these surfaces. [3D collection](https://www.thedigitalyes.com/3d-pop-up-save-the-date), [Arabian Palace product](https://www.thedigitalyes.com/save-the-date/3d/dubai-palace).

### Yes Planner: separate product, broader scope

The planner landing and public sample app were inspected. Core visible areas are Summary, Budget, Guests, Tasks and Binder. Budget subviews include items, payments, contracts and supplier comparison. Guests has list, families, tables and catering tabs, status filters/search, B-list and PDF/CSV export controls. The binder presents 56 sections covering schedules, contacts, ceremony, logistics, decor, food, photos, packing and checklists. The demo explicitly states changes are not saved. [Planner](https://www.thedigitalyes.com/planner), [public demo](https://www.thedigitalyes.com/yes-planner/app.html?demo=1&lang=en).

Additional advertised capabilities: four collaborators, cloud synchronization, offline access, eight languages/twenty currencies, dated task generation, family guest allowances, seating suggestions, natural-language actions, quote/PDF reading, weekly email, venue weather and gift/thank-you tracking. Reminder messages are prepared for the owner's WhatsApp review, rather than sent automatically on the owner's behalf. The inspected landing displayed €39 launch price and €59 comparison price. Background sync, AI actions, emails, exports and offline reliability were not tested.

This is a substantial second product. It should not all become a prerequisite for launching a card maker.

### Client portal boundary

`/clients` redirected to `/clients/login`. Observed login fields: **order code** (format example `TDY-…`) and **email**, plus an alternative password-account entry and support link. No order credentials were supplied. Order status, briefing, revisions, guest dashboard and add-on purchasing behind this boundary were not directly audited.

### Other services and acquisition

- Gift credit: Save the Date, Essential, Premium or custom amount starting at €50; code/link delivery is advertised. [Homepage](https://www.thedigitalyes.com/).
- Birthday and baby-shower 3D invitation collections; both advertise €75 and 2–4 day delivery, with name/date/time/venue personalization. [Birthdays](https://www.thedigitalyes.com/birthdays), [baby showers](https://www.thedigitalyes.com/baby-shower).
- Blog/guides, newsletter, social links, reviews, related designs and WhatsApp assist discovery and conversion. [Blog](https://www.thedigitalyes.com/blog).

### Public-content inconsistencies worth learning from

1. Live and web-readable catalogue counts differed.
2. 3D collection and inspected product displayed €75 vs €55.
3. The Essential plan chooser said guest list included, while the order summary offered a €55 guest list manager. Basic RSVP collection and advanced named-guest allowances may differ, but wording was not consistently explicit.
4. Generic workflow copy says up to two languages; plan-specific pricing permits more.
5. Terms mention unlimited reasonable revisions; pricing/refund pages specify 2/4/7 rounds and €25 extra rounds. Delivery copy also switches between days and business days. [Terms](https://www.thedigitalyes.com/terms), [refund policy](https://www.thedigitalyes.com/refunds).

**Product lesson:** use one price/entitlement source, precise feature names, a clear service clock and consistent policy copy. These observations are not conclusions about which contractual terms prevail.

## 2. e-Nimontron: positioning and structure

Local, bilingual digital-invitation storefront with ready-made templates and a custom-design contact option. The homepage displayed a **৳599 introductory price**, crossed-out **৳980**, and first-50-customer messaging. Custom service includes layout/color changes, illustration/fonts and one revision; price is by discussion. [Homepage](https://www.e-nimontron.com/).

### Public structure — observed

The main page is compact: header → hero → filterable template gallery → three-step explanation → ready-made/custom pricing → contact → footer. Navigation anchors target templates, process, price and contact. There is an EN/বাংলা toggle and WhatsApp entry.

The live gallery had ten designs, including a new maroon scroll. Filters cover Muslim, watercolor, blue/gold, traditional and birthday categories. Each card has visual preview, tags, description, live-preview link and order button. See the separate catalogue inventory.

### Order-choice and self-service flow — directly inspected

```text
Template Order Now
  ├─ WhatsApp order assistance
  └─ Self order
       → /customize?template=...
       → /preview
       → contact modal, step 1 of 2
       → [checkout/payment not continued]
```

The customization form was tested with fictional couple/venue details. It produced a named preview; no real contact information, photo upload, payment or final order was submitted. [Customization entry](https://www.e-nimontron.com/customize?template=royal-scroll).

Observed wedding fields:

| Group | Fields |
|---|---|
| Couple | Full names and nicknames; optional fathers' and mothers' names |
| Event | Wedding/reception/walima/nikah/engagement/anniversary selector; date/time; auto weekday |
| Venue | Venue name and full address; text explains directions use this address |
| Photos | Up to five, portrait recommended |
| Finishing | Optional RSVP deadline and personal message |

Preview controls switch mobile/desktop, show an invitation URL-style label, and allow editing details, changing template or starting the order. The preview embeds the chosen template. The inspected iframe URL carried the fictional customization fields in query parameters; this observation does not establish how final customer URLs are stored.

Checkout step 1 asks for customer name, preferred WhatsApp/email contact, country calling code, relevant contact field and optional notes. Copy says the invitation link will be delivered after payment verification. This is evidence of the displayed process, not proof of automatic or manual payment processing. The next payment step, payment methods, paid delivery, order tracking and owner dashboard remain unknown.

### Invitation-page capabilities — all ten pages surveyed

The live pages expose a repeated guest-widget set: opening CTA, music control, photo slideshow, map/calendar controls, RSVP, private wishes and optional wish photo. RSVP normally asks name, attendance and guest count from 0–10. Muslim Elegance uses its own styled attendance buttons. No responses or wishes were submitted. [Royal Scroll](https://www.e-nimontron.com/templates/royal-scroll.html), [Muslim Elegance](https://www.e-nimontron.com/templates/muslim-elegance.html).

Template-specific differences:

- Royal Scroll: scroll-opening concept, maroon/gold artwork, letter-by-letter names and petals, plus scratch-date control.
- Royal Walima: day/evening lighting control, Arabic/English religious content, families, scratch-time reveal and directions from an entered address or optional current location.
- Muslim Elegance: curtain opening and gold-foil date/time reveal.
- Floral/traditional designs: distinct artwork and typography over the shared guest tools.
- Birthday designs: child name/age and party artwork rather than couple-centered presentation.

Geolocation was not granted. Music playback, scratching behavior and all responsive sizes were not exhaustively tested. Marketing descriptions of visual effects should be distinguished from controls observed in the page. [Royal Walima](https://www.e-nimontron.com/templates/royal-walima.html).

### Important limits

No public logged-in customer/admin dashboard was found in the inspected navigation. That does not prove one does not exist. Multi-event builder support, autosave, reusable accounts, export formats, invitation expiry, editing after purchase, custom-domain support, response export and refunds were not established. The visible wedding form represented one event at a time.

## 3. What to carry into our product

These are **proposals**, not competitor capabilities:

| Borrow the principle | Adapt it for a new desi product |
|---|---|
| Demonstrate before selling | Real playable invitation demo for each original theme |
| Make opening feel special | Desi paper, textile, flowers, lanterns and ceremony-specific motion |
| Keep practical details close | Multi-event cards, venue links, host contacts and simple RSVP |
| Offer a human fallback | Guided DIY builder plus optional design assistance |
| Show price and scope clearly | Same entitlement table in marketing, checkout and dashboard |
| Maintain a private workspace | Drafts, publishing, guests, payments and requested changes |
| Support the local audience | Bangla/English, family wording, Dhaka time and approved local checkout |

Original illustrations, assets, names, copy and implementation should be developed for the new brand. The architecture in the blueprint is our design proposal; neither reference's internal stack or database was determined.

## Coverage and unverified work

| Surface | Coverage achieved | Limit |
|---|---|---|
| TDY wedding collection | All 35 live listed product wrappers opened; complete name/route inventory | Some embedded demos loaded later; not all animations or forms exercised |
| TDY classic Save the Dates | All 16 live product wrappers opened | Not all reveal sequences exercised |
| TDY 3D | Collection inventory and Arabian Palace product/embedded control | Remaining 26 not individually exercised |
| TDY planner | Landing; public Summary, Guests, Budget and Binder views | Paid sync, offline, AI and delivery not tested; Tasks not opened separately |
| TDY portal | Login screen verified | Authenticated workflow inaccessible without an order |
| e-Nimontron | Homepage, ten live templates, self-service form, fictional preview, contact step | No final checkout/payment/order or RSVP/wish submission |
| Supporting content | Main pricing/process, legal pages, adjacent service pages and blog/guide structure | Not an audit of every blog article, language variant or social post |

This is a thorough public-surface review, not a claim that every private feature or every animation was fully tested.
