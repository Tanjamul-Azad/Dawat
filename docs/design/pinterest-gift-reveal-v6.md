# Gift-like personal invitation — v6 research and design decisions

19 October 2026. Requested specifically by the user: search Pinterest for digital gift/card ideas, refine the invitation product first, and make every recipient feel individually welcomed.

## Research actually performed

Searches included `site:pinterest.com digital gift card invitation envelope wax seal burgundy ivory wedding`, `interactive wedding invitation animation`, and digital envelope/gift-card image searches. Pinterest pin pages and the direct Pinterest image tested returned 403; do not describe this as a complete logged-in board/video walkthrough. Search-indexed pin titles/previews were available. Additional publicly accessible creator/product pages supplied concrete structure and visuals. No competitor art, screenshots, video, fonts or code was added to the application.

| Reference | Evidence / usable principle | Applied decision |
|---|---|---|
| [Pinterest: burgundy and ivory invitation suite](https://www.pinterest.com/pin/354658539424211972/) | Indexed stationery reference; complete pin fetch blocked | Restrained wine exterior, warm ivory interior and small brass accents; retain our original art |
| [Pinterest: vellum sleeve and Bordeaux seal](https://in.pinterest.com/pin/473018767128489274/) | Indexed material/layering reference; complete pin fetch blocked | A sealed outer layer should conceal the inner experience until deliberate opening |
| [Pinterest: vintage floral interactive invitation](https://br.pinterest.com/pin/296322850499040958/) | Indexed interactive invitation reference; complete pin fetch blocked | Study a coordinated invitation sequence rather than isolated dashboard-style cards |
| [Bellagi: boho interactive envelope invitation](https://www.bellagiconvites.com.br/convite-de-casamento-boho-interativo-animado-com-envelope) | Public creator description documents envelope → reveal → names/photos → event facts → response sequence and photo-free alternative | Use an intentional gift-opening sequence before native scrolling; keep facts interactive/live rather than shipping a video-only invitation |
| [Mi.lang.ka: digital gift card](https://milangkacollective.com/products/mi-lang-ka-collective-digital-gift-card) | Public gift presentation and personalized-message concept | Outside identifies recipient/sender; inside feels addressed to them; avoid making the recipient register their own name |

These are design interpretations, not claims that the references enforce the same access or RSVP behavior. Main experience inspiration remains The Digital Yes; e-Nimontron remains service/RSVP evidence. This search refresh does not replace the earlier hands-on reference record.

## Composition corrections

v6.1 refinement: the invitation's closing belongs to the couple and their families, with no fictional provider credit or home-page jump. A separate wish dedication carries their live localized names. Keep practical attendance notes about visit arrangements distinct from keepsake messages to the couple. Performance changes preserve this original visual composition; [measured evidence](../build-evidence/template-qualification-v6-1.md) records what is and is not qualified.

- **Outside:** one sealed full-canvas folio. Recipient first, short invitation wording, one seal action, an accessible no-animation opening, and the couple as sender. Remove duplicate name/greeting lines and pre-open navigation/website content.
- **Opening:** normal reveal lasts about 1.8 seconds. During opening, inner chapters remain unmounted. A finish-opening action remains clickable; reduced motion still requires a deliberate open and then reveals immediately.
- **Inside:** one warm-paper invitation with the original garden, live names, personalized greeting, event programme, photos or an intentional botanical photo-free chapter, and a named reply leaf. Navigation appears after moving beyond the opening cover, avoiding obstruction of that first view.
- **Reply:** show who the invitation is for as designed text. Do not replace welcome with an editable identity field. One allowed event is displayed directly; multiple allowed events use a selector. Attendance options must clearly communicate yes/no in both languages.
- **Consistency:** shared theme variables now also inform the folio, seal and date ribbon. Original generated art is retained. Long names grow/wrap rather than being clipped; headings/controls retain their language-specific typography.

## Product boundary

Seller/admin operates the public website. Each confirmed order gets its own activated customer/wedding workspace. Hosts configure their template and create named household links. This pass concentrates on the template frontend; production multi-wedding data isolation, secure dashboard/guest sessions and delivery remain the specified backend work.
