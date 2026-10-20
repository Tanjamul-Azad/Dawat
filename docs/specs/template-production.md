# Creating original commercial invitation templates

**Current access/scope contract (19 October 2026):** [Customer access lifecycle](customer-access-lifecycle.md) governs this document. Public buyers get catalogue, template demo, limited customized preview and order/status. Only an operator-confirmed order plus a separately activated dashboard grant and verified scoped identity unlock client management. Start with **one original template**; collection expansion is optional later. Compare our upgraded prototype with AI Studio and Figma/Claude before choosing the direction.

19 October 2026 · Production workflow for our desi collection. Use with [template engine](template-engine.md), [asset manifest](asset-manifest.md) and [design roadmap](../design/design-roadmap.md).

## Inspiration versus copying

Latest user priority: **template quality is the main commercial differentiator**, across the whole guest journey. Only Bangla/English product locales. Before expanding art families, qualify the first composition using [the full storyboard and TE01–TE60 matrix](template-experience-quality.md). Opening, type, photo/no-photo states, practical actions and graceful failure behavior are one product; an attractive cover alone is insufficient.

We can study broad categories: envelope opening, wax seal, floral framing, paper depth, curtain reveal, editorial typography and a beautiful RSVP journey. We will create our own artwork, composition, code, wording, timing and brand identity. Do not download a competitor's HTML/CSS/JS/art/music/font files to resell a renamed template, trace their illustrations, replace their names in a screenshot, or reproduce a distinctive whole composition as a supposed original.

For context, WIPO distinguishes an underlying idea from its creative expression; computer programs and artistic works can be protected. This distinction is not blanket permission for a close imitation. [WIPO copyright overview](https://www.wipo.int/en/web/copyright/protection).

When using third-party material, obtain documented commercial rights that cover the intended online template/customer use, redistribution/embedding and derivatives where relevant. A standard stock licence may not permit resale inside editable templates. Check the actual licence rather than assuming “paid,” “royalty-free” or an internet download means unlimited reuse. Store the rights evidence with the asset record.

## One engine, genuinely distinct art directions

Every template consists of a validated manifest/version, original asset set, bounded layout components, palette/type roles and an opening sequence. Shared blocks provide content/interaction: names, hosts, events, directions, calendar, gallery, music, RSVP and private wish entry.

```text
Published wedding content + authorized household overlay
                          ↓
          Shared renderer / guest behavior adapters
                          ↓
        Theme manifest + layout slots + original art
                          ↓
          Responsive personalized invitation
```

Theme layouts can differ substantially: centered ceremonial arch, playful marigold scene, woven-paper stationery or typographic editorial story. Reuse logic and semantic blocks, not an identical arrangement recolored six times. Guest names remain real shaped HTML text; venue/maps/RSVP are functional content, not flattened images.

## Per-template workflow

| Step | Output | Gate |
|---|---|---|
| 1. Brief | Audience/ceremony, mood, no-photo/photo approach, palette and story | Fits our own brand; does not depend on a copied scene |
| 2. Composition | Mobile and desktop cover/open/body/event/RSVP/closing layouts | Long Bangla and practical details fit |
| 3. Original assets | Editable SVG/illustration/raster layers, motifs, seal and poster | Creator/source and rights recorded |
| 4. Motion storyboard | Opening states, duration, input, skip and still fallback | No information trapped behind an effect |
| 5. Manifest/layout | Versioned theme folder with bounded slots and tokens | Validates against content and renderer contract |
| 6. Shared widgets | Existing map/calendar/music/RSVP adapters integrated | No copied payment/authorization/business code |
| 7. Personalization | Named greeting/message, event scope and allowance | No per-person artwork duplication; no private leaks |
| 8. Qualification | Content fixtures, keyboard/reduced-motion, real phone and payload checks | Theme-specific acceptance evidence |
| 9. Catalogue | Fictional demo, photo-free variant, thumbnail/poster and clear capabilities | Matches actual released theme behavior |
| 10. Release | Pinned manifest/assets and version record | New updates cannot break already-paid invitations |

Original illustrations can be made by us, commissioned, or sourced with appropriate rights. AI-assisted raster art is an option for original directions, subject to review of provenance/usage terms and visual quality; no generated imagery is assumed commissioned or licensed by this planning task. Prefer code-native SVG/CSS for simple borders, geometry and motion so the invitation stays sharp and light. Use professional editable illustration sources for detailed textile/floral work rather than hundreds of improvised decorative components.

## Proposed theme folder

```text
src/invitation/themes/jamdani-ivory/
  manifest.ts         validated versioned capabilities, art roles and tokens
  layout.tsx          theme composition using shared blocks
  opening.tsx         bounded client-side motion/skip controller
  theme.css           scoped artwork/layout styling
  fixtures.ts         or references to shared stress fixtures
public/themes/jamdani-ivory/v1/
  poster.webp         lightweight first frame
  envelope.svg        original layered visual
  motifs.svg          original optimized decoration
design-source/jamdani-ivory/
  ...                 editable sources and rights records, not public customer content
```

This is a proposed structure, not application files already created. Small themes may not need every file. Keep original source/private evidence out of the deployed public directory; only approved optimized theme assets are served.

## Collection order

1. **Jamdani Ivory:** woven-paper envelope, original geometric/floral weave, restrained seal and elegant names. Build this full vertical slice first.
2. **Royal Nikah:** original architectural arch/jali and paired doors with a different composition, not the competitor's scroll art.
3. **Holud Utsab:** marigold/leaf layers, joyful event hierarchy and an original playful opening.
4. **Lal–Shada Biye:** original alpana/paper treatment with deliberate cultural wording choices.
5. **Mughal Garden:** original courtyard/floral composition with selective depth; no copied venue painting.
6. **Modern Desi:** editorial type/photo-optional composition and a calm opening that still feels considered and premium.

Build shared contracts with the first theme. Qualify that original composition for the first paid release. Later, validate that a contrasting second theme needs only presentation extensions before expanding. Every offered template must pass qualification; a one-template catalogue must be presented honestly.

## Qualification checklist

Test no photos, long Bangla names, several hosts, different dates/venues, one/three events, a restricted household, personalized welcome/message, decline/closed states, large text, disabled motion/audio, missing decorative assets and portrait/landscape photos. Reuse core integrity tests; add focused visual checks for each composition. Record asset transfer and readable mobile result, not only a polished desktop screenshot.

Never extract a template from the reference archive for production. The archive tells us what experiences customers value; our engine and original art produce the actual product.
