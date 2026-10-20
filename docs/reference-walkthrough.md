# Detailed reference walkthrough and implementation mapping

Review window: **18–19 October 2026, Asia/Dhaka**. Main sources: [The Digital Yes](https://www.thedigitalyes.com/) and [e-Nimontron](https://www.e-nimontron.com/). Local archive: [evidence guide](reference-evidence/README.md), [106-page index](reference-evidence/page-index.md).

This document freezes the useful public-product discovery. Future implementation should use the specified new-product contracts when private reference behavior was unavailable. A snapshot records visible UI; it is not proof that a backend action succeeded.

## Evidence classification

**Observed** = directly seen control/content/navigation. **Advertised** = promised in public copy. **Unknown** = not accessible or not exercised. **Proposed** = our decision. Screenshot/text files preserve public reference material and fictional preview details only; they are not our production assets.

## Coverage

| Surface | First/second-pass coverage | What remains outside the claim |
|---|---|---|
| TDY weddings | 35 listed product wrappers opened; text saved for all 35 | Every animation/embedded form not exhaustively exercised |
| TDY classic Save the Date | 16 wrappers opened; text saved for all 16; order form inspected | Payment/delivery not performed |
| TDY 3D | 27 product wrappers opened/saved; collection and example controls | No claim of manually completing all 27 scene animations |
| e-Nimontron templates | All ten live pages opened/saved | No production RSVP/wish/media submission |
| Supporting TDY pages | 18 package/process/catalogue/planner/policy/content routes saved | Not every blog post, language variant or social account |
| TDY planner | Landing, Summary, Budget, Guests, Tasks, Binder and guest subviews | Cloud sync/offline/AI/email/export delivery not verified |
| TDY portal | Login boundary verified | Paid authenticated account unavailable |
| e-Nimontron builder | Wedding form, fictional preview, mobile/desktop controls and contact step | Following checkout/payment/fulfilment not exercised |

Total page archive: **88 product/template pages + 18 supporting pages = 106**. Selected interactive states have separate PNG/AX files. Public wrapper snapshots may omit content loaded later in embedded frames; consult selected loaded-state captures and the original first-pass audit for those details.

## W01 — TDY storefront discovery

Observed: paper/editorial presentation, large headline/demo, catalogue, starting prices, saved designs, expandable collections, classic/3D tabs, process, human-design explanation, reviews, gift-card module, FAQs, demo walkthrough, newsletter, service/legal links and WhatsApp. Live catalogue count was 35 weddings / 16 classic announcements, differing from some web-readable versions.

Local: [homepage screenshot](reference-evidence/tdy-home.png), [homepage text](reference-evidence/tdy-home.ax.txt).

Our mapping: R01/R21, T070–T072; original hero/gallery/clear package and real demos. No copied social-proof counts or design names.

## W02 — TDY product/demo page

Observed in Teatro: phone-frame live invitation, full-screen control, guided feature screens, favourite, title/description/price, plan CTA, creator/section/inclusion tabs, delivery/revision accordions, designer contact and related designs. The loaded Teatro iframe exposed EN/IT choices, opening cue, countdown, venue/menu/dress/gift/transport sections and its own RSVP form.

The tutorial screen list differs by theme; it is not one universal invitation block order. Other product snapshots preserve each wrapper's description and controls.

Local: [Teatro screenshot](reference-evidence/tdy-product-teatro.png), [loaded text](reference-evidence/tdy-product-teatro.ax.txt), [full catalogue](02-template-catalogue.md).

Our mapping: R06/R10/R11, T011–T016/T026/T072. Use one renderer; do not couple a theme's artwork to its own payment/RSVP system.

## W03 — TDY plan chooser

Observed: Essential €175, Premium €575, Excellence €975; Premium initially selected in inspected flows. Controls explain customization/languages/revision levels and optional express €85. Selecting Essential changed the continue button/total before payment.

Local: [plan chooser](reference-evidence/tdy-plan-chooser.png), [text](reference-evidence/tdy-plan-chooser.ax.txt).

Our mapping: R12, T060–T064. Launch with simpler packages, server-owned price/inclusions and no default-paid-add-on ambiguity.

## W04 — TDY order summary

Observed: design/plan, change design, partner names and receipt/portal email, total, express, planner, cover bundle, optional extras, code/credit field, payment signals and policy links. The primary action is secure payment; it was not executed.

Local: [summary](reference-evidence/tdy-order-summary.png), [summary text](reference-evidence/tdy-order-summary.ax.txt), [add-ons](reference-evidence/tdy-order-addons.ax.txt), [code-entry text](reference-evidence/tdy-credit-entry.ax.txt).

Observed Essential extras: venue art €45, animated cover €55, extra event €45, guest manager €55, monogram €25, music €15, domain €65; bundle €89 and planner €39. These are dated competitor offers, not our prices. Checkout and marketing language about basic vs advanced guest management was inconsistent.

Our mapping: A04/A08, T060–T065; versioned catalogue/order snapshot and exact entitlement naming. Discounts/gift credit are Growth, not cosmetic frontend fields.

## W05 — TDY announcement ordering

Observed Candlelight: €75 details / €135 custom choice, demo/preview/full-screen, expected delivery, Premium upsell and an order dialog. Dialog fields: your name, partner name, date, optional venue, email, optional phone; then Continue to payment. It explicitly says RSVP is not included.

Local: [order dialog](reference-evidence/tdy-save-the-date-order.png), [dialog text](reference-evidence/tdy-save-the-date-order.ax.txt).

Our mapping: G01; reduced schema/package with a clear difference from the full invitation. No payment/contact information was submitted.

## W06 — TDY 3D scenes

Observed collection: 27 venue/scene themes and tap-to-open framing. Product pages offer details/custom variations. The prior loaded Arabian Palace showed €55 while collection copy showed €75; do not resolve the conflict by guessing. Parent-page snapshot does not prove every embedded scene's responsiveness/performance.

Local: [3D collection](reference-evidence/tdy-3d-collection.png), [text](reference-evidence/tdy-3d-collection.ax.txt), individual product links in [page index](reference-evidence/page-index.md).

Our mapping: X01. Original desi scene art, reusable interaction, still/reduced-motion fallback and explicit art-service scope.

## W07 — TDY portal

Observed redirect `/clients` → `/clients/login`; order code and email, a disabled access button until fields are entered, alternative password-account entry and support. No credentials supplied.

Local: [login](reference-evidence/tdy-portal-login.png), [text](reference-evidence/tdy-portal-login.ax.txt).

Advertised behind it: briefing, proofs, revisions, guest dashboard and later add-ons. Unknown implementation. Our mapping: R07/R08/R16/R19; build the explicit owner/admin model in our specs rather than mimicking an inaccessible portal.

## W08 — TDY gift credit and resume cues

Observed homepage gift choices: Save the Date €75, Essential €175, Premium €575, custom amount €50+. Public copy promises code/link/card delivery. Clicking the gift CTA during review did not establish a distinct completed checkout/form or purchase; the saved file is an entry-attempt state, despite its historical filename.

Local: [entry-attempt text](reference-evidence/tdy-gift-card-order.ax.txt). A later state displayed “Continue where you left off / Essential / Resume.” This is a visible resume cue, not proof of authenticated/cloud persistence.

Our mapping: gift issuance/redemption and persistent cart recovery are separate future contracts. Never implement gift credit as an unvalidated string or claim it is verified from this attempt.

## W09 — TDY planner overview

Observed sample app: Summary with date/couple, weather sample, next tasks, budget, guests, payments, tables and binder entries. The app explicitly says changes in the public demo are not saved. Landing advertises four collaborators, offline/cloud behavior and AI assistance; those services were not tested.

Local: [summary](reference-evidence/tdy-planner-summary.png), [text](reference-evidence/tdy-planner-summary.ax.txt).

Our mapping: X03–X05; keep planner scope outside card-maker launch. Reuse stable wedding/event/household IDs if expansion happens later.

## W10 — planner Budget/Guests/Tasks/Binder

Observed Budget tabs: Items, Payments, Contracts, Compare. Guests: grouped list/search/attendance filters, B-list, online RSVP/export/paste-list controls. Tasks: To do/All, dated groups from 12 months before through final weeks, 27-task sample. Binder: 56-section catalogue covering timelines, people, logistics, decor, catering, photos, packing and checklists.

Local: [budget](reference-evidence/tdy-planner-budget.ax.txt), [guests](reference-evidence/tdy-planner-guests.ax.txt), [tasks](reference-evidence/tdy-planner-tasks.ax.txt), [binder](reference-evidence/tdy-planner-binder.ax.txt). Matching PNGs are in the evidence guide.

Our mapping: basic guest management at launch; budget/vendors/seating/tasks/binder are Expansion with their own operational requirements.

## W11 — planner Families/Tables/Catering

Observed Families: allowances and family guest-contribution entry. Tables: unseated/list/export controls. Catering: menu and allergy/intolerance summaries, export. These subviews were selected and saved; no guest was invited, message sent or export downloaded.

Local: [families](reference-evidence/tdy-planner-families.ax.txt), [tables](reference-evidence/tdy-planner-tables.ax.txt), [catering](reference-evidence/tdy-planner-catering.ax.txt).

Our mapping: R15 basic allowance logic first; collaborative family links/import/seating/catering automation later.

## W12 — e-Nimontron storefront

Observed Bangla/English toggle, compact hero, ten template cards, occasion/style filters, live preview/order actions, process, ready-made/custom pricing and contact. Ready-made shows ৳599 launch offer vs ৳980 comparison; custom service is quote/contact based with one revision described.

Local: [homepage](reference-evidence/en-home.png), [text](reference-evidence/en-home.ax.txt).

Our mapping: local usability and clear direct path to maker; own art/pricing and consistent inclusion rules.

## W13 — e-Nimontron ordering choice

Observed Order Now dialog offers WhatsApp assistance or self-order. WhatsApp is a composed contact link; no message was sent. Self-order routes to template-specific customization.

Our mapping: DIY and assisted entry use the same underlying invitation data, with different fulfilment paths. Do not fork two unrelated products.

## W14 — e-Nimontron wedding form

Observed: partner full names/nicknames, optional parents, occasion selector, date/time/auto weekday, venue/address, five-photo input, optional RSVP deadline and personal message. The inspected wedding form represents one event at a time. No evidence of a freeform art canvas or multi-event editor was established.

Local: [form](reference-evidence/en-customizer.png), [all field text](reference-evidence/en-customizer.ax.txt).

Our mapping: R03–R05; improve with flexible hosts, multiple event cards, localized content and persistent drafts.

## W15 — e-Nimontron personalized preview

Fictional names/venue produced a named preview at `/preview`, mobile/desktop controls, URL-style label, edit/change-template and order actions. The embedded URL carried fictional content in query parameters. That does not establish how paid invitations store data.

Local: [preview](reference-evidence/en-preview.png), [text](reference-evidence/en-preview.ax.txt).

Our mapping: shared renderer and a private draft payload, opaque preview tokens, no contacts/private notes in query strings. Preview URL labels must not imply a final domain/slug reservation.

## W16 — e-Nimontron contact mode

Observed first checkout step: customer name, preferred WhatsApp/email channel, country code, relevant contact, optional notes. WhatsApp selection marks phone required/email optional. Selecting Email reverses those labels. Copy says delivery follows payment verification. No next-step submission was performed.

Local: [contact screenshot](reference-evidence/en-checkout-contact.png), [contact text](reference-evidence/en-checkout-contact.ax.txt), [email-mode text](reference-evidence/en-checkout-email.ax.txt).

Our mapping: R12/R18; separate customer contact preference from public host information and implement real verified payment status. Provider/payment methods remain unknown for this reference.

## W17 — e-Nimontron guest widgets

All ten live pages were surveyed: music, photo slideshow, map/calendar, RSVP and private wishes; optional photo-wish control. Typical RSVP asks name, attendance and 0–10 guest count. Muslim Elegance uses its own RSVP presentation. Royal Walima adds lighting-mode and origin/current-location direction controls; no geolocation granted.

Our mapping: shared widgets, clear count semantics, optional public contacts and private notes. Photo wishes/geolocation/lighting are enhancements, not required dependencies. Responses/uploads were not submitted.

## W18 — policies, services and consistency

TDY supports multiple language/currency presentation, adjacent birthday/baby-shower products, guides/blog/reviews, custom illustration, express service and lifetime-access language. Policy/service copy differs on revision counts/delivery language. The initial audit records those discrepancies; current supporting-page text is preserved in the archive.

Our mapping: one policy/versioned package source, finite explicit hosting term and actual service promises. The second pass resolved the earlier bridesmaid-page uncertainty at the public collection level, as described below; purchase/fulfilment is still unverified.

## W19 — bridesmaid proposal collection, newly confirmed

The live `/bridesmaid-proposal` page loaded a distinct collection: ten 3D proposal designs, search, Romantic & nature / Coast & islands / Party filters, starting price €55, name personalization and advertised 2–4 day link delivery. Designs listed: Pop the Question, Bouquet for You, The Dress Rail, Paris Balcony, Rose Arch, Seaside Sisters, Sweet Question, Getting Ready, Amalfi Spritz and Last Disco. Copy says promo codes/credit do not apply. No individual proposal product checkout or delivery was tested.

Local: [collection snapshot](reference-evidence/pages/www-thedigitalyes-com_bridesmaid-proposal.ax.txt). This supersedes the initial first-pass observation that the web-readable route only returned homepage content. Our mapping: optional adjacent-occasion product, not a required desi wedding launch feature.

## W20 — dedicated plan pages

Essential confirms template adaptation, factual wedding details, RSVP/dashboard/portal, two design rounds and the separate Save the Date add-on. Premium describes cover/interior redesign, venue art/media/monogram, four rounds and a matching early announcement; it also advertises applying the €75 announcement amount toward a later invitation. That credit mechanism was not exercised. Excellence describes exclusive bespoke artwork, seven rounds and no express option.

Dedicated Excellence copy uses a 7–14 day standard-turnaround statement while the main pricing matrix describes a bespoke schedule. Preserve this discrepancy rather than turning it into a promise for our service.

Local: [Essential](reference-evidence/pages/www-thedigitalyes-com_essential.ax.txt), [Premium](reference-evidence/pages/www-thedigitalyes-com_premium.ax.txt), [Excellence](reference-evidence/pages/www-thedigitalyes-com_excellence.ax.txt). Our mapping: scoped quotes, consistent timelines and itemized entitlements.

## Implementation questions already resolved here

| Future question | Read locally |
|---|---|
| What should the website look like? | [Website design](../website-design.md) + selected PNGs |
| Which screens/fields/states? | [Screen specs](specs/screen-specifications.md) |
| What is launch vs later? | [Plan](../plan.md) and [requirements](specs/product-requirements.md) |
| What data and API rules? | [Data](specs/data-model.md), [API](specs/api-contracts.md) |
| How do six themes work together? | [Template engine](specs/template-engine.md) |
| What Bangla copy/formatting? | [Content/localization](specs/localization-content.md) |
| How do we verify/recover? | [QA](specs/qa-release.md), [operations](specs/operations.md) |
| Where did a feature come from? | This walkthrough, first audit, feature matrix and page snapshots |

The pack supports building without reopening the references. New user requests, missing private information or changing external APIs may still require focused new evidence; none should be silently invented.
