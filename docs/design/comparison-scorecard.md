# Compare the three first-template directions

19 October 2026. The user will compare this implementation with Google AI Studio and Figma AI/Claude before choosing the direction. No design is approved merely because it was generated or deployed.

**Latest explicit selection:** the user authorized implementing the supplied Figma fonts/layout/overall UI direction while retaining our working logic. [v4 adoption](../build-evidence/figma-ui-adoption-v4.md) is complete locally with 43 passed tests. The earlier comparison remains useful for quality review, but does not block implementing the chosen direction. Visual/device scores remain unfilled until rendered evidence is available.

The user has now supplied a Figma Make project and its source ZIP, and explicitly likes its initial UI organization, fonts and polish. [Source review](figma-source-review.md) records the exact reference, preferred design traits, component inventory and implementation gaps. This is source-level evidence and a preferred candidate; visual scores remain unfilled until rendered comparison. Our current [mobile polish checkpoint](../build-evidence/mobile-polish-v3.md) has 38 passed tests without completed real-browser mobile QA.

Use the same fictional couple, Jamdani template brief, two events, content and viewports in each tool. Copy the finalized prompts in `../prompts/`. Record screenshots, inspectable source/design files and exact limitations; do not compare a static image's polished appearance with a working prototype's unimplemented backend as though they were equivalent deliverables.

## Required gates

- The template is the principal selling point. Compare the full mobile guest journey in Bangla and English only, including photo/no-photo and reduced-motion/failure variants. A polished dashboard or cover alone cannot win. Use [TE01–TE60](../specs/template-experience-quality.md); critical privacy/data/functional failures disqualify a result regardless of beauty score.

- Public catalogue/customized preview/order are distinct from the client dashboard.
- Confirmed order plus separate operator activation plus verified scoped identity is the production contract. A prototype may simulate this only with explicit labels; an unprotected UI toggle is not real security.
- One original composition is presented honestly, with real editable names/date and working mobile framing. Recolours are not a fabricated catalogue.
- TDY is the main creative-quality reference; e-Nimontron informs local service behavior. Dribbble/Pinterest inspire studied principles with attributable sources; assets and distinctive layouts are not copied.
- No claims of real payment, email, shared database, production readiness or passed tenant isolation without evidence.

## Score after using each result

Score each category from 1–5 and multiply by its weight / 5. Leave the three candidate scores blank until actual comparison.

| Category | Weight | Our preview | AI Studio | Figma / Claude |
|---|---:|---|---|---|
| Complete template identity: original art, typography, framing and full-scroll composition | 35 | Pending user review | Pending result | Pending result |
| Mobile guest experience: opening/skip, photos/no-photo, event actions, RSVP and accessible motion | 30 | Pending user review | Pending result | Pending result |
| Bangla/English-only completeness, shaping, long content and switching without lost state | 10 | Pending user review | Pending result | Pending result |
| Correct shopping → order → activation → client journey | 15 | Pending user review | Pending result | Pending result |
| Performance/failure discipline, maintainable components and practical handoff | 10 | Pending user review | Pending result | Pending result |
| Total | 100 | — | — | — |

## Same inspection sequence

1. Browse home and the one-template feature on a phone-width viewport. Does it look like a distinctive wedding product and make the next action clear?
2. Change names to Bangla and a longer Latin name; change venue/date. Open the live preview without losing edits. Check 320px overflow and real text shaping.
3. Review/request an order. Before confirmation and after confirmation-but-before-activation, opening a dashboard URL must not show private management data.
4. Use the labelled operator simulation, if provided, to activate. A new dashboard should show preparation/empty states. Publishing is a separate action.
5. Create one reception-only family invitation with a three-person allowance. Confirm two adults and one child, then leave an independent private wish. Inspect correct counts and absence of host navigation on the guest card.
6. Try keyboard use, reduced-motion behavior, mobile menu and invalid/saving states. Verify image/video fallback rather than awarding points for an animation that blocks content.
7. Record the strongest ideas from each. The chosen direction may combine original art, layout and interaction ideas while retaining one coherent design system; do not patch three inconsistent interfaces together.

## Current implementation boundary

The local v3 implementation contains the full first-template frontend: original paper opening, bilingual guest UI, optimized ImageGen photographs, photo/no-photo/lightbox, countdown, per-event maps/calendar, RSVP/edit/wishes and isolated sample responses. There is no hero video. Order/activation remain local simulations; real identity/payment/email/cross-device data are unconnected. [Current evidence](../build-evidence/first-template-v3.md) records 33 tests plus build checks, blocked browser/visual QA and blocked hosting deployment. The old hosted v2 is not this new implementation. Final visual selection and commercial qualification remain open; latest user authorization allowed implementing this template before comparison results arrive.
