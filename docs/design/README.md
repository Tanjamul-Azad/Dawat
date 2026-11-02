# Private client dashboard mockups

Latest host implementation: [ImageGen-led dashboard product design, 2 November 2026](host-dashboard-product-design-2026-11-02.md).

Latest Midnight refinement: [navy wedding stationery and visibility fixes, 2 November 2026](midnight-wedding-refinement-2026-11-02.md).

Completed reference invitations: [four remaining cards and restored feature visibility](remaining-reference-cards-2026-11-02.md).

Latest invitation implementation: [Ivory orchid, 2 November 2026](ivory-orchid-2026-11-02.md), including the owner's reference, image prompts, local assets and validation. [Garden photo and lettering review](garden-photo-and-lettering-2026-11-02.md) remains available separately.

**Latest visual planning · 30 October 2026:** follow the [design enhancement plan](../plans/design-enhancement-plan-2026-10-30.md) and the [owner-supplied stationery reference](references/owner-stationery-direction-2026-10-30.png) for the next dashboard, invitation and public-site design pass. The notes below describe the earlier mockups.

Created 19 October 2026. These original SVG layouts use fictional wedding and guest data and remain static artifacts with no working controls. A later interactive design slice now exists separately in `web/`; production backend/auth/payment is still pending.

**Current status:** the user has since requested a more premium, celebratory visual direction inspired by The Digital Yes, Dribbble and Pinterest. These two layouts are structural drafts, not approved final UI. Follow [design roadmap](design-roadmap.md) and [inspiration brief](inspiration-board.md) for the next high-fidelity pass.

| Layout | Preview | Editable source |
|---|---|---|
| Desktop, 1440 × 980 | [PNG](client-dashboard-desktop.png) | [SVG](client-dashboard-desktop.svg) |
| Mobile, 390 × 1100 | [PNG](client-dashboard-mobile.png) | [SVG](client-dashboard-mobile.svg) |

The user confirmed that no demo/client link was supplied, then later forwarded a dashboard video. These mockups predate the recording and do not represent its actual private UI. Public ordering and guest-response observations are in the [focused flow review](../specs/e-nimontron-client-flow.md); the later [video review](../specs/vendor-dashboard-video-review.md) specifies the simple host layout and photo-wish/Memory Book/Maybe additions separately.

## Design assumptions

- Paper/ivory surfaces, forest-green navigation and restrained editorial headings. “Wedding Studio” is a placeholder brand.
- Owners see event-wise totals, responses, private wishes, invitation details, sharing and order/support controls.
- Guest invitation link and private dashboard entry are distinct. Server-side owner authorization is required.
- The example uses one selected event and 100 known invited households: 60 accepted + 15 declined + 25 without a reply. Accepted attendance totals 148 people: 132 adults + 16 children. The visible rows are a fictional subset, not the full dataset.
- Pending counts require a known invite list. An unrestricted public link cannot establish how many people have not responded.
- Desktop uses a response table; mobile uses stacked family cards. Both expose invitation/share actions and export/add-household controls.
- Bangla labels, details panels, empty/loading/error states and accessible interaction behavior are specified in the [dashboard contract](../specs/client-dashboard.md) and [website design](../../website-design.md); these two overview mockups do not depict every state.

## Validation

SVG XML parsed successfully. Both sources were rasterized locally into PNG and visually reviewed at their intended sizes. A desktop sidebar subtitle overflow was corrected before final rendering. These checks validate the static layouts, not live responsiveness, authentication or RSVP behavior.
