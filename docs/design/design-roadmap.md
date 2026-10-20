# Product and visual design roadmap

19 October 2026 · User-selected commercial direction. A first interactive original design slice is now implemented in `web/`; this roadmap still governs full design qualification and commercial engineering. A working sandbox does not close every high-fidelity, accessibility or production gate.

## Product bar

Latest steering: **the template is the flagship selling point**, and the supported languages are only Bangla/English. The next design slice must prove the full guest storyboard, photography/photo-free version, refined opening/skip/reduced-motion and readable practical sections before further catalogue/dashboard polish. Follow [template quality](../specs/template-experience-quality.md) and [the live-preview walkthrough](../reference-evidence/guest-preview-walkthrough/README.md). Current art and seal-opening prototype remain comparison material, not a finished cinematic/bilingual template.

This is a paid wedding product for real families. It should feel like a celebration from discovery to receiving the card, with a capable, reassuring maker and client workspace. The Digital Yes is the main experience-quality reference; e-Nimontron informs local ordering/RSVP service mechanics. Its simple host dashboard is not the ceiling for our visual design.

The earlier [desktop](client-dashboard-desktop.svg) and [mobile](client-dashboard-mobile.svg) artifacts are **structural drafts only**. Their flat cards, placeholder brand and sparse decoration are not an approved final visual direction. Preserve useful information hierarchy; redesign visual treatment before implementation. Do not describe the new premium screens as already designed.

The user explicitly requires **Dribbble and Pinterest** inspiration. Use the [source shortlist and moodboard brief](inspiration-board.md) for storefront/editor/dashboard composition, desi stationery, paper/floral/textile art and motion references. Curate and synthesize an original direction; a list of links is not a finished moodboard.

## Four surfaces, one original brand

| Surface | Intended feeling | Specific design work |
|---|---|---|
| Storefront | Wedding stationery studio; editorial, curated, immersive | Original invitation hero, generous type, layered art, excellent live demos and honest package clarity |
| Guest invitation | Personal, ceremonial, memorable | Named welcome, responsive opening, crafted event layouts, beautiful Bangla, music on guest gesture and a thoughtful closing |
| Maker | An approachable design studio | Guided steps, contextual preview, curated choices, reliable save feedback and readable publish review |
| Client workspace | The host's polished control room | Wedding identity, event overview, strong response hierarchy, useful guest actions, nuanced states and restrained decoration |

Use a recognizable family of colors/type/spacing across product screens; theme artworks remain distinct. A festive guest page does not require confetti on payment inputs or motion behind response tables. Polish comes from typography, composition, art, continuity and responsive behavior as well as animation.

## Work order: design leads, architecture constrains early

| Gate | Deliverable | Acceptance |
|---|---|---|
| F1 — product map | DIY, assisted, open guest, personalized guest and owner-management flows | Routes, roles, paid/draft/live states and primary action per screen agree |
| F2 — system outline | Data/tenant boundaries, publication/response/payment state diagrams, guest overlay contract | No visual promise requires an undefined or unsafe backend behavior |
| F3 — art direction | One developed brand direction, typography specimens, composition and motion studies | Distinct desi identity; Bangla shaping/readability; references distilled into principles, not replicas |
| F4 — detailed screens | Mobile + desktop home, catalogue/product, first card, editor, share/personalization and client overview/detail | Original art intent, real fictional content, spacing/type and error/empty/loading states specified |
| F5 — interactive proof | First invitation opening and key create/share/respond paths, with reduced-motion variants | Practical details easy to reach; long names and mobile controls work; keyboard flow documented |
| F6 — production vertical slice | Implement the first theme through persistence, publication, personalized RSVP and dashboard | Real state, tenancy and retry checks pass; no local-state simulation presented as production |

F1/F2 happen together and stay bounded. F3–F5 focus on representative screens, not months of every conceivable screen before coding. A quick technical feasibility spike may happen during design if needed, but it does not replace the visual review. Repeat the cycle with evidence from the first implemented slice.

## First theme: Jamdani Ivory

Start with an original woven-paper invitation: layered ivory envelope, original Jamdani-inspired motifs, a deep wine or forest seal, carefully typeset names and an elegant reveal. Composition must remain convincing without couple photography. Royal Nikah and Holud Utsab provide later contrasting art directions; do not create six palette swaps of one layout.

Named guest welcome is in the opening and content header, not part of a baked-in image. The selected event scope controls what the guest actually receives. Read [personalization](../specs/personalized-invitations.md) and [template production](../specs/template-production.md).

## Motion language

- Choose one primary opening gesture per theme, roughly 1.2–2 seconds as an initial design target, with immediate Skip/read-details access.
- Use purposeful paper depth, subtle light/shadow, seal/door/floral movement and short section entrances. Decorative loops must not compete with reading or form entry.
- Buttons/fields use brief, consistent feedback, roughly 120–220ms as a starting target. Success follows actual save/payment/RSVP confirmation.
- Reduced motion gets a designed still/fade experience. Audio never begins before a permitted guest gesture. The invitation still works if media fails.
- Prefer CSS/SVG and selective Motion. Add heavy 3D or animation tooling only after a concrete original design and measured budget require it.

## Required design package before F6

Deliver editable layouts/components (design files or an inspectable browser prototype), token specification, approved type/art samples, mobile/desktop screens, interaction notes, theme asset manifest and screenshots of tested content stress cases. Choose the tool that preserves editable artifacts; a Figma account is not a build prerequisite.

Include pending payments, empty response lists, invalid/revoked links, failed saves, oversize photos, long Bangla names, decline answers and no-photo variants. Use fictional people and original/licensed art only. The existing vendor screenshots/video stay in the evidence archive.

## Next concrete work

Start P01–P06 in [task tracker](../../task.md): product journey map and system/guest-overlay decisions, then a coherent art direction and high-fidelity first card/home/client workspace. Current planning defines this work; these design tasks remain unchecked. No further competitor-wide discovery is required.
