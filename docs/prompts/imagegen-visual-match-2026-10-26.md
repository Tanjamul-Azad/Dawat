# Dawat visual reference assets · 26 October 2026

Mode: built-in Imagegen. The design boards are reference mockups, not website screenshots. Optimized WebP assets are in `web/public/brand/`; original PNG copies are in `web/design-source/`. No image-generation API key or external paid library was used.

## Reference boards

- Home: `docs/design/dawat-storefront-direction.png`
- Collection, checkout, seller: `docs/design/dawat-commerce-design-board.png`
- Payment: `docs/design/dawat-bkash-payment-direction.png`
- Customer/editor/auth: `docs/design/dawat-portal-direction.png`

## Earlier asset prompt specifications (retained summaries)

These are the retained specifications from the preceding design session, not verbatim exports of its tool calls.

| Asset | Prompt specification |
| --- | --- |
| storefront-hero-match | Landscape warm ivory paper with empty left area; diagonal Bengali burgundy/gold invitation and envelope, brass bowl and jasmine on the right, matching the home reference composition. |
| botanical-gold-match | Transparent fine antique-gold jasmine branch for upper-right/lower-left paper corners, matching the payment reference. |
| template-jamdani-match | Deep burgundy portrait invitation, delicate gold floral arch and border, blank middle for HTML wording. |
| template-ivory-match | Ivory portrait stationery, charcoal botanical and pavilion line art, blank middle for HTML wording. |
| template-holud-match | Terracotta portrait stationery, fine gold marigold/floral border, blank middle for HTML wording. |
| feature-rsvp | Refined RSVP paper card on brass and burgundy textiles, matching the home feature photo. |
| feature-weave | Close-up cream/gold Bengali woven textile for the special-package banner. |
| portal direction | Compact customer overview/editor/mobile guest list/OTP login board using the commerce palette and floral stationery style; functionality shown is a visual reference only. |

## Login arch · final verbatim prompt

Create a production website background illustration matching the LEFT LOGIN PANEL in the attached Dawat portal UI design board. Use the board only as style/composition reference; output artwork only, no UI, no phone, no text or logos. Portrait 2:3. Warm ivory handmade paper with light grain, an ornate sandstone Mughal arch rising along the left edge/top-left, softly painted blush pink flowers and muted sage foliage climbing the left pillar, a calm water garden with distant Bengali/Mughal palace pavilion at the bottom, pale mist and warm light. Reserve the top-right/central 60% as creamy open space for real HTML headings. Refined wedding stationery watercolor, graceful fine details, same muted cream, peach, dusty rose and antique gold palette as the attached login panel. No dark border, no green full border, no photographic scene. Flat artwork filling canvas.

Reference: `docs/design/dawat-portal-direction.png`. Saved original: `web/design-source/login-arch-match.png`; implementation: `web/public/brand/login-arch-match.webp`. Generated original left in the Codex generated-images folder.

The lotus and paper grain are deterministic repo SVG assets; Lucide provides interface icons. Motion 14.6.0 handles card interactions with the user's reduced-motion preference respected.
