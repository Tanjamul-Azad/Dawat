# Customer portal redesign · 27 October 2026

Second pass after the storefront rebuild (`claude/nifty-almeida-ba6bdb`, 6bcd9df). It brings the signed-in screens under the same design rules: dashboard, invitation editor (overview, names, events, photos, review), guests & replies, order & payment, and sign-in. API contracts, auth, data flow and copy are unchanged. This branch sits on top of the storefront branch.

## What changed

- **`production/workspace.module.css`** was 2,076 lines in two layered copies, with `!important` overrides for the lockup tagline. It is now one mobile-first sheet of 1,774 lines on the storefront tokens (colour, radius and shadow). Breakpoints are 480, 600, 768, 1024 and 1200px.
  - **Buttons.** Primary, secondary and quiet buttons are all 44px+. Steps and tabs are 44px.
  - **Text.** Body text is 15px, labels are 14px (`globals.css` sets every `label` to 12px, so the portal now overrides it), and nothing in the UI is below 12px. Bangla eyebrows are 14px.
  - **Icons.** Lucide icons use a stroke of 1.75.
  - **Phone and tablet navigation.** Below 1024px the nav is a three-tab bar: My weddings / My orders / Help, or Overview / Edit / Guests inside a wedding. Before, it was a strip that scrolled sideways and cut off "Help".
  - **Laptop and up.** From 1024px the workspace is framed, with a sticky sidebar.
  - **Save bar and payment paper** take their layout from the width of their own column (container queries), so they stay tidy beside the preview or request list at 1024px.
- **`production/sales-desk.module.css`** (order & payment) was rebuilt on the same tokens. On phones, the payment notes were 10–11px and the badges 10px. All its text is now 13px+.
- **`workspace-loading.tsx`** used to show a bare "দাওয়াত" text mark. It now shows the shared `BrandLockup`, the same as every other screen.
- **Lockup tagline.** Below 480px, the topbar drops the tagline and keeps the lotus and "Dawat.". At 320–479px the tagline, account button and sign-out button cannot fit on one line. Before, the tagline was shrunk to 5.3px to make it fit.

## Audit method

The method is the same as `brand-consistency-2026-10-26.md`, run in the built-in browser against the local dev server and loopback Supabase, using synthetic `example.test` accounts:

- one published wedding with 12 households and 4 replies;
- one Normal/Jamdani order waiting for a bKash payment.

For every visible element, the audit counts:

- text under 12px (under 13px when the text is Bangla);
- interactive targets under 44px in either dimension (a checkbox counts as its label; an inline link inside a sentence is skipped);
- horizontal overflow of the page.

It excludes two things: the invitation artwork miniature (`designPreview`) and the shared lockup tagline. The tagline is the same 10px Latin / 12px Bangla as on the storefront.

## Numbers

Before is commit 4060fa6, measured in Bangla. Each cell is tiny text / small targets. Overflow was 0 everywhere, before and after.

| Screen | 320 | 390 | 768 | 1024 | 1440 |
|---|---|---|---|---|---|
| Dashboard | — | 14 / 7 | — | — | 8 / 3 |
| Wedding overview | 38 / 16 | 38 / 16 | 22 / 13 | 22 / 13 | 23 / 14 |
| Names & wording | — | 24 / 7 | — | — | 15 / 11 |
| Celebrations | — | 36 / 7 | — | — | 14 / 11 |
| Guests & replies | 40 / 20 | 40 / 20 | 35 / 19 | 35 / 31 | 36 / 32 |
| Order & payment | — | 37 / 14 | — | — | 25 / 5 |

English before, at 390: dashboard 5 / 9, order 20 / 19.

Some cells have no "before" figure. The first runs measured the streaming loading skeleton (the hidden browser pane does not swap in streamed content until it paints), so those readings were thrown away. Photos and review have no "before" figures for the same reason.

**After: 0 / 0 / 0** for all 80 measurements: 8 views (dashboard, overview, names, events, photos, review, guests, order) at 320, 390, 768, 1024 and 1440, in Bangla and English. Each measurement first checked that the real `#workspace-main h1` was visible. Sign-in, measured signed out, is also 0 / 0 / 0 at all five widths in both languages.

## Checks

- `npm run typecheck` passes.
- `npx vitest run` passes: 296 tests in 36 files.
- Screenshots are in the ignored folder `.artifacts/portal-redesign-2026-10-27/`:
  - 390 Bangla: dashboard, editor events, guests, order, payment form, login.
  - 390 English: editor names.
  - 1024 Bangla: dashboard, overview, order, login.
  - 1024 English: guests.
  - 1440: order payment (Bangla), login (English).

## Not covered / follow-ups

- **Seller desks.** `seller-orders.tsx` and `/admin/requests` share these classes and pick up the new styles, but seller MFA screens were not walked through.
- **Hydration warning on the wedding overview (pre-existing).** Node and the browser spell the Bangla month differently ("জানুয়ারী" on the server, "জানুয়ারি" in Chrome) in `Intl.DateTimeFormat('bn-BD')`, which triggers a React hydration warning. It needs a shared formatter, which is outside a styling pass.
- **Price on the order screen (pre-existing).** The order screen's quote summary shows "৫০০.০৳"; the storefront `taka()` helper writes "৳৫০০".
- **Device testing.** There was no test on a physical device. Nothing was pushed or deployed.
