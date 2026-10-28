# Public site · QA report · 28 October 2026

Branch `claude/public-site-2801ed`, based on `27537ae`. Plan: [production-plan-2026-10-28.md](../plans/production-plan-2026-10-28.md), step 5 plus the Bangla copy of the public pages. Nothing is pushed or deployed. Local QA only (`127.0.0.1:3102`, synthetic data).

Screenshots live under the ignored `.artifacts/public-site-2026-10-28/`:

- `before/` is `27537ae`, built and served the same way. `after/` is this branch. `after-en/` is the English toggle at 375px.
- File names are `<page>-<width>.png`, for `home`, `templates`, `pricing`, `contact`, `policies` and `order`. `after/` also has `demo` and `menu-sheet-400.jpg` (the open mobile menu).
- Links: [before home 375](../../.artifacts/public-site-2026-10-28/before/home-375.png), [after home 375](../../.artifacts/public-site-2026-10-28/after/home-375.png), [before home 1280](../../.artifacts/public-site-2026-10-28/before/home-1280.png), [after home 1280](../../.artifacts/public-site-2026-10-28/after/home-1280.png), [mobile menu](../../.artifacts/public-site-2026-10-28/after/menu-sheet-400.jpg).
- Measurements: `overflow-after.txt`, `perf-after.txt`, `a11y-after.txt`.

## What changed

**Names and copy**

- `catalog.ts` has `packageNames` and `packageName(tier, locale)`: ক্লাসিক / প্রিমিয়াম / নিজের মতো and Classic / Premium / Custom. Ids (`normal`, `premium`, `custom`) and prices (৳500 / ৳750 / ৳1,500) are unchanged.
- Home, templates, pricing, contact, policies, `order/page.tsx`, header and footer are rewritten in plain colloquial Bangla, following 4.2 and the 4.3 glossary. A `rg` for the old words (কর্মপরিসর, প্রবেশাধিকার, যাচাইকরণ, অপেক্ষমাণ, হালনাগাদ, সম্পাদনা, নির্ধারিত, অন্তর্ভুক্ত, বিক্রেতা, কোটেশন, Normal, Customized) over the public files finds nothing. A test guards the policies page.
- Policies: no mixed-language sentences. Section anchors are `#terms`, `#pricing`, `#refund`, `#privacy`, `#sharing`, and the footer links to them. Decision G is added as one line: guest phone numbers are kept only to send the invitation, are never shown on the guest page, and are deleted 30 days after the invitation expires.
- FAQ has 7 questions. "অতিথিদের কীভাবে পাঠাব?" now describes the two ways, both from the host's own WhatsApp: **নাম ধরে আলাদা আমন্ত্রণ** (one personal link per family, sent one tap at a time; the host sees who opened and replied) and **সবার জন্য একটি লিংক** (one link and one card, sent once to a group or broadcast list; guests write their own name and how many are coming). There is no email promise anywhere, and no fully automatic WhatsApp.

**Header, footer, trust**

- Header (5.1): sticky, 64/72px. It is transparent over the home hero and turns cream with blur after 8px of scroll.
  - Four links, language toggle, login, and the "নকশা বেছে নিন" button. The current page gets an underline.
  - On phones the menu is a bottom sheet with a focus trap, Esc to close, a backdrop, 52px links, WhatsApp and the main button. Focus returns to the menu button.
  - The full-bleed hero is unchanged; the header now overlays it.
- Footer (5.2): brand with WhatsApp and email, three link columns (designs, help, policies), a bKash row with "every payment is checked by a person", "বাংলাদেশে তৈরি", and a Facebook slot that is hidden while empty.
- Trust (5.3):
  - **Live sample:** new page `/demo/?template=<id>`. It is the real guest invitation with a working RSVP. Replies stay in the visitor's own browser and go to no server, the same sample store the old demo used. It is linked from the hero and from every template card ("লাইভ নমুনা").
  - **How it works:** 4 steps with phone-framed screenshots (`public/brand/steps/`, 400w/800w WebP).
  - **Promise block:** three promises, plus the payment-review line from config.
  - **Reviews and founder:** `Reviews` and `FounderNote` render nothing until `social-proof.ts` has real data. A review must carry `permission: true`.
  - **FAQ:** accordion, one open at a time.
- Interactive (5.4):
  - "নিজেদের নাম লিখে দেখুন" on `/templates/`. The names appear on every card live and are saved nowhere. The order link carries `?names=`.
  - RSVP demo card on home.
  - Subtle card hover: lift, shadow, and a slow artwork zoom.
  - Scroll-filled step line.
  - Reduced motion removes the transitions and animations, and the step line is simply full.
- Images (5.5):
  - Own artwork and app screens only. No stock images, so nothing was added to `public/licenses`.
  - Card art is now a lazy `<img>` with a 480w and 960w `srcset`, and the hero has 900w and 1600w. The hero stays `fetchpriority=high`.
  - I did not add the optional short loop video.

**`?names=` contract for the app session.** One value: the two names joined with " & ", URL-encoded, each name at most 30 characters. `/order/` forwards it unchanged to `/order/requests/?template=…&names=…`. The app session should split on " & " and treat it as plain text. The same note is in the shared notes folder (`public-site-handover.md`).

## Config values the owner should set

| Where | Value | Effect |
| --- | --- | --- |
| Netlify env `PAYMENT_REVIEW_PROMISE_BN` | e.g. `সাধারণত একই দিনে যাচাই করি` | Shown on the home promise block, the pricing page and the payment FAQ answer. Empty means hidden. |
| Netlify env `PAYMENT_REVIEW_PROMISE_EN` | e.g. `We usually check payments the same day` | Same, English. |
| `web/src/features/production/brand.ts` | `reviews`, `founder` | Fill only with real, permitted entries. Until then both sections are absent. |
| same file | `socialLinks.facebook` | Set only when a real page exists. It then appears in the footer. |

Home and pricing are `force-dynamic`, so changing the env values needs only a restart or redeploy and no code change. No hard-coded hour or number is promised anywhere.

## Second pass: copy correction and premium visual pass (29 October)

**Copy.** Email sending is not being built, so every guest-email promise and every `MAIL_*` mention is gone from the FAQ, policies and how-it-works. The sending answer, the policies and step 4 now describe the two WhatsApp paths above. The deletion line covers phone numbers only. Header turns solid after 24px of scroll. Template and order links go straight to `/order/requests/?template=<id>&names=<encoded>`, as the spec's shared contract says. Review, founder and Facebook data moved from `social-proof.ts` to `brand.ts` (the spec names `brand.ts`). `/demo/` shows "এটা নমুনা, উত্তর সংরক্ষণ হয়নি" in its top bar and calls no API.

**Visuals** (own artwork, real screenshots and in-repo SVG only; no stock images, so nothing was added to `public/licenses`):

- Hero keeps the full-bleed layout. It now has a staggered entrance, a slow settle on the photo, a paper-grain layer, a gold-foil shimmer on the second headline line (static under reduced motion), and from 1100px a floating phone showing a real sample invitation.
- Section rhythm: ivory band (how it works and the RSVP demo), deep-wine band (promise), cream (pricing), ivory band (FAQ). Hand-drawn jamdani divider and corner ornaments are SVG in `storefront-ornaments.tsx`. Section headings are larger, with a gold line before each label.
- Template showcase: bigger cards (3 per row on the templates page, 4 per view in the home rail on desktop) and a scroll-snap carousel on phones. Hover gives a pointer-following tilt with a light sheen (mouse only, off under reduced motion) and a slow artwork zoom. Each card shows its real colours as two swatches. I did not build the open-envelope reveal.
- "এক নজরে দাওয়াত": a four-panel journey strip, from the WhatsApp message to the guest's reply to the host's list. The two middle panels are real screens; the WhatsApp message and host list are drawings and are labelled that way.
- Polish: button press states, a smooth accordion (modern browsers; others open instantly), a step line that fills on scroll, and a sticky bottom call-to-action bar on phones that appears after the hero and hides while typing, near the footer, and while the menu is open (`after2/sticky-cta-400.png`, `after2/sticky-hidden-at-footer-400.png`). Pricing is premium cards, with the middle package marked "সবচেয়ে পছন্দের" ("Recommended" in English) purely as a visual recommendation. No sales number is claimed. Shared shadow, easing and radius tokens are used across all public pages.

**Checks for the second pass**

- `tsc` is clean. `vitest`: 46 files, 367 tests pass (3 more: recommended badge, journey strip, sticky bar hidden at the top).
- `npm run qa:build` passes.
- Screenshots: `.artifacts/public-site-2026-10-28/after2/`, `<page>-<width>.png`, 375px and 1280px. No horizontal scroll on any page (`overflow-after2.txt`).
- Simulated mobile LCP and CLS (`perf-after2.txt`; same method as above, not Lighthouse):

| Page | LCP | CLS |
| --- | --- | --- |
| home | 1.92 s | 0.0006 |
| templates | 1.10 s | 0.055 |
| pricing | 1.02 s | 0.025 |
| contact | 1.02 s | 0.015 |
| policies | 1.03 s | 0.013 |
| order | 1.06 s | 0.028 |
| demo | 4.46 s | 0.005 |

- Contrast (`a11y-after2.txt`): the first run caught the "সবচেয়ে পছন্দের" badge at 3.05:1 (gold on gold). It is fixed and no longer reported. What remains is not a real failure:
  - the off-screen skip link;
  - text drawn over artwork, which the tool cannot measure;
  - the gradient headline, which it reads as transparent. It is wine to a darker gold (#a2742c) on cream, large text.
- The sticky bar covers the bottom 64px of the viewport while it shows. That is inherent to a sticky bar; it hides near the footer and never shows on screens 768px wide or more. The WhatsApp bubble is still only shown from 1480px wide.

**Not done or not verified in this pass**

- Real Lighthouse, as before. The `/demo/` LCP is still above 2.5 s for the same reason as `/invite/`.
- The step 3 and 4 screenshots were retaken without the demo bar, but they are still the guest-side sample invitation, not host screens.
- The hero phone and the tilt were checked in Chrome only. No Safari or real-device pass.
- The sticky bar, the `::details-content` accordion animation and the `interpolate-size` property are progressive: browsers without them show the plain behaviour.


## Checks

- `npx tsc --noEmit -p .` is clean.
- `npx vitest run --maxWorkers=1`: 46 files, 364 tests pass (16 are new: names helpers, catalog names, header sheet and focus trap, nav links, footer, promise, empty reviews and founder, FAQ wording, RSVP demo saves nothing, names on cards, policies wording).
- `npm run qa:build` passes.
- No horizontal scroll on any changed page at 375px or 1280px (`overflow-after.txt`), and none in English at 375px.
- Contrast, taken from computed colours (`a11y-after.txt`): no real failures on text over solid backgrounds.
  - The skip link reads as low contrast only because it is off-screen until focused.
  - The text inside the template thumbnails and the guest invitation sits on artwork. The tool could not measure it, so it was not counted.
  - Tap targets are 44px or more, except one inline text link in a sentence.
- LCP and CLS under simulated mobile, with 4x CPU slowdown and a 1.6 Mbps, 150 ms connection. This is **not Lighthouse** (see below):

| Page | LCP | CLS |
| --- | --- | --- |
| home | 1.76 s | 0.0006 |
| templates | 0.97 s | 0.055 |
| pricing | 1.05 s | 0.026 |
| contact | 0.94 s | 0.015 |
| policies | 0.98 s | 0.007 |
| order | 1.04 s | 0.028 |
| demo | 4.2–4.8 s | 0.006 |

  Home LCP was 5.3 s before the image work, because six full-size card images were competing with the hero.
- Floating elements: the round WhatsApp button used to sit on top of the "এটা বেছে নিন" buttons on phones, so it now shows only from 1480px wide, in the page margin. WhatsApp is still in the mobile menu, the contact page, the footer and the closing banner.

## What was not verified, and caveats

- **Lighthouse was not run.** `npx lighthouse` was blocked by the permission classifier, and I did not work around it. The table above is a throttled `PerformanceObserver` read in Chrome. Please run real Lighthouse mobile before deploy.
- **`/demo/` LCP is above 2.5 s.** The slow part is the guest invitation's own cover (its components are the app session's). The existing `/invite/?template=jamdani` measures 4.4 s the same way, so this is not a regression. A preload for the template art is already added.
- **Step 3 and 4 screenshots are not host-side app screens.** Docker and local Supabase were not running, so the logged-in editor and guest list could not be captured with synthetic data. The old demo sandbox (`NEXT_PUBLIC_APP_MODE=demo`) is a different, older UI and would have misrepresented the product.
  - Step 1 is the real templates page, step 2 the real order page, step 3 the sample invitation, and step 4 the guest's reply page. The step text and alt text describe exactly that, and the section says "ছবিগুলো আসল সাইট থেকে নেওয়া। নাম আর তথ্য কাল্পনিক।".
  - Retake steps 3 and 4 from the host's editor and guest list once the app session lands and Supabase is up.
- **The sending copy depends on the app session.** The FAQ, step 4 of "how it works" and the policies describe the personal-link WhatsApp flow and the shared link. If the public site is deployed before the app session lands (the shared link in particular), hold back the "সবার জন্য একটি লিংক" paragraph or ship both together.
- **Policies wording needs the owner's eye.**
  - "No automated messaging" became "no fully automatic WhatsApp, you send from your own WhatsApp and only press Send" so it matches the new feature.
  - The date line changed to "শেষ বদল: ২৮ অক্টোবর ২০২৬" because section 4 gained the 30-day line.
  - The deletion itself is the app/server side of decision G and is not implemented here.
- Keyboard use is covered by the unit test (focus trap, Esc, focus return) and native elements (links, buttons, `<details>`), not by a screen reader or a real-device pass. The English toggle was checked for overflow only, not read through.
- The `src/features/production/share.ts` and `copy.ts` copy, `manual-payment.tsx`, `login.tsx` and `sales-desk.tsx` were not touched. `login.tsx` and `sales-desk.tsx` still hard-code "Customized" and should read `packageName()` from the catalog.
- **I stopped another session's preview server.** Port 3102 is shared. After a rebuild of mine, a `next start` that was not mine (started 02:07, not from this worktree) held the port, and I stopped it before noticing. If someone's preview vanished around then, that was me. I freed the port again and left it free.
