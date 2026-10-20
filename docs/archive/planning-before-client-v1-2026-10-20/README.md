# Desi Wedding Invitation Platform — Master Handoff

**Current v6.4:** compact invitation spacing + gesture-triggered classical music, with accessible persistent pause, background cleanup and shipped attribution. Live browser top-spacing/music/gallery checks now recorded for320/390px BN and1024px EN.82tests/typecheck/export pass. [Current evidence + screenshots](docs/build-evidence/compact-music-v6-4.md). Physical-device/listening and refreshed performance gates remain open.

**Latest v6.3:** max5-photo framed slideshow, thumbnails/arrows/swipe, sage/blush chapter accents and stronger text hierarchy. Deliberate opening now unlocks scrolling immediately while its decoration finishes.77tests pass; fresh gallery visual/performance/device qualification remains open. [Current evidence](docs/build-evidence/gallery-colour-v6-3.md). Local preview: `http://127.0.0.1:3000/invite/?lang=bn`.

**Current v6.1:** couple/family signature, couple-addressed wishes, dedicated/optimized guest loading and 70 passing tests. Mobile lab Performance91/Accessibility100; LCP3.46s is still above the2.5s target. [Qualification evidence](docs/build-evidence/template-qualification-v6-1.md) distinguishes lab results from actual phones. The user has Android and iPhone; [phone preview + run sheet](docs/qa/physical-phone-v6-1.md) is ready at the computer's private `192.168.0.120:3001` address. Physical sign-off is awaiting real results. Website expansion remains deferred.

**Latest template — v6:** [sealed personal invitation audit](docs/build-evidence/personal-opening-v6.md). Guest explicitly opens the gift-like cover before any chapters/forms render; hosts supply recipient names, guests never type their own name, general links are view-only. 67 tests/typechecked export and actual 390/320px long-name/photo-free/personal RSVP checks. Preview: `http://127.0.0.1:3000/invite/?lang=bn`. Template first; storefront/multi-order implementation is deferred. [Pinterest/gift research](docs/design/pinterest-gift-reveal-v6.md) distinguishes inspected evidence from blocked pin pages. Physical devices/performance/production remain open.

Research and specification: **18–19 October 2026 · Asia/Dhaka**.

**বর্তমান priority — template আগে, website পরে:** [Continuous digital card v5](docs/build-evidence/digital-card-v5.md) এখন পুরো illustrated invitation: full-canvas folio opening, নতুন ImageGen art, date ribbon, অনুষ্ঠান/ছবি/RSVP-এর একই design language। **৪৯টি test ও typechecked build pass**; browser disabled থাকায় actual mobile/motion review বাকি। Preview: `http://127.0.0.1:4173/invite/?lang=bn` · [portable build](.artifacts/jamdani-digital-card-v5-static.zip)। নিচের v4 website update আগের checkpoint।

**সর্বশেষ local implementation — v4:** [Figma direction adoption ও ৪৩টি test-এর evidence](docs/build-evidence/figma-ui-adoption-v4.md) · [source/run guide](web/README.md) · [portable preview](.artifacts/dawat-figma-ui-v4-static.zip)। Figma-র fonts/layout, নতুন storefront, mobile maker, horizontal-tab dashboard ও woven-envelope invitation তৈরি হয়েছে, আমাদের working logic রেখে। Server 4173 চালু আছে। Browser control disabled এবং Sites project-not-found হওয়ায় visual/device QA ও hosting deployment হয়নি—নিচের hosted preview এখনও আগের v2।

**Newest priority:** template-টাই main selling point; ভাষা শুধু **বাংলা ও English**। [Full template storyboard, quality gates এবং ৬০টি edge case](docs/specs/template-experience-quality.md) · [live reference walkthrough](docs/reference-evidence/guest-preview-walkthrough/README.md)। Guest template-এর bilingual/photo features এখন local v3-তে implemented; সব acceptance case pass বা production qualification হয়েছে—এমন দাবি নয়।

**Latest brief:** Public catalogue → customized preview → order → operator confirmation → separate dashboard activation → verified client entry. [Full access contract](docs/specs/customer-access-lifecycle.md). Start with one original Jamdani composition; palettes are not separate templates.

**Finalized prompts:** [Google AI Studio](docs/prompts/google-ai-studio-build.md) · [Figma AI / Claude](docs/prompts/figma-ai-claude-design.md) · [ImageGen assets](docs/prompts/imagegen-first-template-assets.md). These include reference attribution, Dribbble/Pinterest research method, mobile-first interaction, original design and optional video/poster treatment. Compare alternatives before choosing what to build further.

**Upgraded comparison version তৈরি হয়েছে:** [source/run guide](web/README.md), [কী কাজ করছে ও পরীক্ষার ফল](docs/build-evidence/README.md)। Storefront → customized preview → order → operator confirmation/activation → client dashboard → publish → personalized guest/RSVP এখন browser sandbox-এ চেষ্টা করা যায়। Original ImageGen art যুক্ত হয়েছে। Production database/auth/payment এখনও pending।

**[Private interactive preview খুলুন](https://dawat-studio-invitation-atelier.bushy-lotus-1498.chatgpt.site)** · Owner-private design review; live paid customer service নয়।

নতুন evidence: user-এর দেওয়া dashboard video বিশ্লেষণ ও archive করা হয়েছে। [ভিডিওর features, ৬০০ টাকার quote, unlimited invitation-এর সীমা এবং design additions](docs/specs/vendor-dashboard-video-review.md)। এটি recorded UI evidence; login/delete/print হাতে পরীক্ষা করা হয়নি।

মূল inspiration **The Digital Yes**; স্থানীয় reference **e-Nimontron**। **Dribbble ও Pinterest থেকে inspiration নিয়ে original premium, celebratory UI/UX** তৈরি হবে—generic AI layout নয়। এটি বাজারে যাওয়ার commercial product; clean code, efficient shared engine এবং production readiness বাধ্যতামূলক। Detailed specs/reference archive প্রস্তুত; user-এর নির্দেশে `web/`-এ Next.js/React local visual implementation শুরু হয়েছে, original SVG art/CSS motion দিয়ে। বর্তমান browser sandbox fictional/device-local; Supabase, owner auth, gateway এবং production readiness এখনও pending। Owner-private preview public production service নয়। Actual verification source handoff/task tracker-এ দেখতে হবে।

## মূল পাঁচটি ফাইল

| File | কী আছে |
|---|---|
| [website-design.md](website-design.md) | Website কেমন হবে: colors, typography, spacing, mobile layouts, editor/dashboard, guest card, animation এবং প্রথম original template |
| [task.md](task.md) | ID-সহ milestone/task checklist, dependencies, acceptance ও launch backlog |
| [memory.md](memory.md) | User intent, known facts, current state, working decisions, unknowns এবং পরের session-এর resume নির্দেশনা |
| [architecture.md](architecture.md) | System boundaries, proposed stack/folders, data authority, publishing/payment/RSVP flow, cache/jobs এবং architecture decisions |
| [plan.md](plan.md) | Prototype → beta → paid launch → Growth/Expansion scope, build order ও release gates |

**পরের ধাপ:** memory → plan → P01–P06 design/system gates → একটি theme দিয়ে functional local prototype → verified production vertical slice। System outline ও UX flow একসঙ্গে, তারপর original art direction/high-fidelity screens ও motion proof; পুরো catalogue আগে বানানো নয়।

## নতুন commercial design/build brief

| File | বিষয় |
|---|---|
| [Design roadmap](docs/design/design-roadmap.md) | Flow/system → original direction → premium mobile/desktop → interactive proof → first production slice |
| [Dribbble/Pinterest inspiration](docs/design/inspiration-board.md) | Source shortlist, creator/provenance এবং original synthesis; completed moodboard নয় |
| [Production engineering](docs/specs/production-engineering.md) | Selected stack, modular clean code, CI, environments, measured budgets/load, recovery |
| [Personalized invitations](docs/specs/personalized-invitations.md) | এক base card, guest greeting/message, event scope, allowance, recoverable secure link |
| [Original template production](docs/specs/template-production.md) | প্রতিটি template-এর art/layout/motion/manifest/licence/qualification workflow |
| [Google AI Studio build prompt](docs/prompts/google-ai-studio-build.md) | Self-contained detailed functional build brief; prototype ও production boundaries |
| [Figma AI/Claude design prompt](docs/prompts/figma-ai-claude-design.md) | একই product-এর premium editable design system/screens/prototype brief |

আগের dashboard SVG/PNG **low-fidelity structure**, final premium design নয়। Brand/domain/final pricing/merchant/production accounts/assets এখনও সিদ্ধান্ত ও যাচাই বাকি।

## বিস্তারিত implementation specs

| File | বিষয় |
|---|---|
| [Product requirements](docs/specs/product-requirements.md) | Roles, requirement IDs, acceptance ও task mapping |
| [Screen specifications](docs/specs/screen-specifications.md) | Routes, form fields, button outcomes, loading/empty/error/conflict states |
| [Client dashboard](docs/specs/client-dashboard.md) | Private dashboard link, কে আসবেন/আসবেন না/উত্তর দেননি, মোট লোকসংখ্যা, private messages ও client controls |
| [e-Nimontron-style flow](docs/specs/e-nimontron-client-flow.md) | Public-flow evidence, client delivery এবং পুরোনো [desktop](docs/design/client-dashboard-desktop.svg)/[mobile](docs/design/client-dashboard-mobile.svg) structural drafts; final visual bar আলাদা |
| [Data model](docs/specs/data-model.md) | Tables, fields, relationships, constraints, versions, responses, orders ও retention |
| [API contracts](docs/specs/api-contracts.md) | Endpoints, payloads, authorization, retries, errors, payment/publish/RSVP rules |
| [Template engine](docs/specs/template-engine.md) | Shared renderer, manifests, block registry, openings, widgets ও theme qualification |
| [Localization/content](docs/specs/localization-content.md) | Bangla/English labels, invitation wording, date/count formatting ও service/error copy |
| [Asset production](docs/specs/asset-manifest.md) | Original logo/art/fonts/music, per-theme assets, provenance ও optimization |
| [QA/release](docs/specs/qa-release.md) | ৫৮টি functional scenario, visual/device matrix, performance/load/recovery ও launch checklist |
| [Operations](docs/specs/operations.md) | Packages, payment reconciliation, assisted fulfilment, jobs, hosting, support, backup ও future services |

## Reference আবার না খুলে কাজ করার জন্য

- **[Detailed walkthrough](docs/reference-walkthrough.md):** screen-by-screen observations এবং আমাদের requirement/task-এ তার mapping।
- **[Local evidence guide](docs/reference-evidence/README.md):** selected screenshot ও saved screen text।
- **[106-page index](docs/reference-evidence/page-index.md):** প্রতিটি reference URL-এর স্থানীয় text snapshot।
- **[Template catalogue](docs/02-template-catalogue.md):** theme নাম, art direction এবং design inventory।
- **[Feature matrix](docs/03-feature-matrix.md):** দুই reference-এর feature comparison।

Archive-এ আছে **৩৫টি wedding product, ১৬টি classic Save the Date, ২৭টি 3D product, ১০টি e-Nimontron template এবং ১৮টি supporting page**। Selected builder, preview, checkout, portal ও planner state-এর screenshot-ও সংরক্ষিত।

সব embedded animation, paid dashboard বা payment delivery পরীক্ষা করা হয়নি। যেখানে তথ্য অজানা, সেটি স্পষ্ট করা হয়েছে এবং আমাদের product-এর আচরণ আলাদা spec-এ নির্ধারিত। এই নোটগুলো build-এর জন্য ব্যবহার করো; reference-এ দেখা যায়নি এমন backend আচরণ অনুমান করে প্রতিযোগীর feature হিসেবে লিখো না। Current payment/framework API যাচাই প্রয়োজন হতে পারে; সেটি নতুন competitor-discovery round নয়।

## প্রস্তাবিত product direction

**Original desi themes + সহজ guided builder + optional designer assistance।**

চারটি surface: storefront, owner builder/dashboard, guest invitation এবং admin। একটি shared content schema/renderer ব্যবহার করবে। Multiple events, Bangla/English, private drafts, preview, verified payment, stable publish/share, map/calendar এবং event-wise RSVP মূল flow।

**Personalized guest/family invitation launch scope:** একই design/base wedding থেকে recipient-এর নাম, greeting/ছোট message, কোন event-এ আমন্ত্রণ এবং কতজন আসতে পারবে দেখাবে। প্রতিবার artwork/site বানাতে হবে না। General link-ও থাকবে। Household link forward হলে সেই household-এর access যায়; link copy করলে আগের URL বদলাবে না।

Launch theme concepts: **Jamdani Ivory, Holud Utsab, Royal Nikah, Lal–Shada Biye, Mughal Garden, Modern Desi**। এগুলো original working concepts; brand, final assets ও commercial price এখনও নির্ধারিত হয়নি।

প্রথমে একটি theme দিয়ে পুরো flow:

**Choose → Customize → Save → Preview → Verified payment → Publish → Share → RSVP → Owner dashboard**

এটি নির্ভরযোগ্য হলে একই engine-এ বাকি theme যোগ করো।

## Document authority এবং পুরোনো নোট

বর্তমান scope/order: plan.md; system contract: architecture.md; design: website-design.md; execution status: task.md; বিস্তারিত behavior: docs/specs/। সিদ্ধান্ত বদলালে সংশ্লিষ্ট authoritative file এবং memory আপডেট করতে হবে।

প্রথম research pass সংরক্ষিত: [audit](docs/01-reference-audit.md), [catalogue](docs/02-template-catalogue.md), [matrix](docs/03-feature-matrix.md), [first blueprint](docs/04-product-blueprint.md), [first backlog](docs/05-development-backlog.md)। এগুলোর পুরোনো phase-label বর্তমান plan-কে override করবে না।

Research task কোনো real payment/order/RSVP/wish/email/WhatsApp message বা personal photo upload submit করেনি। Reference screenshots/artwork নতুন product-এর assets হিসেবে ব্যবহার করা যাবে না।
