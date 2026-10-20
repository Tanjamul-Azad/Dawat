# Asset production checklist

No original production artwork, logo, licensed soundtrack or font package has been created by the research task. Local reference PNGs are study evidence only and must not be used as our product artwork.

Current build direction requires an original premium Bengali atelier art system and distinct celebratory templates. [Template production](template-production.md) owns creation/release workflow; [inspiration board](../design/inspiration-board.md) records TDY/Dribbble/Pinterest references. Existing dashboard wireframes are low-fidelity structure, not reusable final product art. Any prototype artwork added during implementation still needs its own creator/source/status record before commercial launch.

## Shared assets

| ID | Asset | Format/variants | Status |
|---|---|---|---|
| A-BRAND-01 | Original logo/wordmark | Vector + small raster, light/dark | Needed |
| A-BRAND-02 | Favicon/social brand image | Required platform sizes | Needed |
| A-TYPE-01 | Licensed display/body/UI fonts | Bangla/Latin, weights/subsets | Select and verify shaping/licence |
| A-ICON-01 | Shared event/map/calendar/music/RSVP icons | Consistent SVG set, accessible labels | Needed |
| A-SOUND-01 | Small licensed soundtrack library | Streaming-friendly audio + metadata | Needed |
| A-DEMO-01 | Fictional demo content/photos or original illustrations | Clear sample rights | Needed |
| A-OG-01 | Social-share preview layout | Public-safe metadata, no restricted event leaks | Needed |

## Per-theme asset roles

For each theme ID (`jamdani-ivory`, `holud-utsab`, `royal-nikah`, `lal-shada`, `mughal-garden`, `modern-desi`) produce:

- Cover/poster that communicates the theme before animation loads.
- Original background and optional independently layered decorations.
- Opening art with reduced-motion/still variant.
- Motifs/borders and optional couple illustration/photo framing.
- Curated palette and licensed font-role pairing.
- Gallery/event/RSVP layout styling using shared blocks.
- Thumbnail/product preview and fictional content fixture.
- Photo-free and compact-screen composition.

## Asset record fields

ID, theme/version, creator/source, licence/usage rights, source-project path, optimized output paths, width/height/duration/bytes, alt/decorative role, derivative settings and approval state. Do not assume an asset found online is free to redistribute.

Record licence evidence covering commercial online customer-template use, embedding/redistribution and derivatives when applicable. Pinterest pin pages are not licence grants; trace original creators. Do not extract competitor assets, trace their distinctive whole composition or rename their code/art as ours. Original CSS/SVG motifs are suitable for light geometry/paper layers; detailed floral/textile artwork needs editable quality sources. Guest greetings/names remain real text, not individualized image assets. Asset transfer budgets and only-the-selected-theme loading follow [production engineering](production-engineering.md).

## Proposed source organization

```text
design-source/{theme}/        editable original project files, not automatically public
public/themes/{theme}/v1/    optimized non-private theme artwork
storage/weddings/...        private uploads and approved derivatives
```

These are proposed paths for future implementation. Customer uploads must not be committed to `public/` or source control. Content-hashed/versioned assets protect already-published invitations from accidental replacement.

## Qualification

Check actual image size, compression, contrast under text, decorative pointer behavior, compact rendering, no-photo mode, reduced motion and copyright/licence record. Track initial theme payload separately from deferred gallery/audio. Avoid loading six themes' art on one guest page.

## Static/3D expansion assets

Print export needs its own artwork/layout and embedded fonts. 3D requires scene/card layers, camera/lighting/interaction design and still fallback. A collection cannot be considered implemented merely because catalogue thumbnails exist.
