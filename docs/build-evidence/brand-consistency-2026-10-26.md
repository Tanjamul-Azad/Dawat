# Brand and Bangla copy consistency · 26 October 2026

Follow-up to a product review that found three different logos and English copy in Bangla mode on the live pilot (https://dawat-client-pilot.netlify.app).

## Changes

- **One lockup.** `BrandLockup` in `web/src/components/brand-mark.tsx` is the lotus, the Latin "Dawat." wordmark and a tagline in the reader's language ("বাঙালি ডিজিটাল আমন্ত্রণ" in bn, "DIGITAL BENGALI INVITATIONS" in en). The storefront header, login, MFA and workspace topbar all use it. The home-only CSS that hid the lotus and lowercased the wordmark is gone, as is the `dawat.` → `দাওয়াত` translation. The footer wordmark reads "Dawat." as well.
- **Bangla eyebrows.** Collection, contact, policies, order intro, FAQ and the closing call to action now go through `t(bn, en)`.
- **Payment off the home page.** The home page shows one line ("bKash payment by hand after order confirmation") linking to `/pricing/#payment`. The full bKash block remains on `/pricing/`, `/contact/` and the order payment step.
- **Mixed labels.** Tier names (Normal / Premium / Customized) and bKash app terms (bKash Personal, Send Money, Transaction ID) stay as they are. In Bangla mode, prices use Bangla digits through the shared `taka()` helper (`৳৫০০`, `Normal · ৳৫০০`). "বিকাশ personal নম্বর", "Reference-এ", "artwork", "custom design", "customer portal", "hosting", "activation" and "payment" are now in Bangla.

## Not changed

- The hero artwork `web/public/brand/storefront-hero-match.webp` (source `design-source/storefront-hero-match.png`) has **"কলকাতা"** and **"১২ অগ্রহায়ণ ১৪৩১"** baked into the image. Changing them to Dhaka means regenerating or retouching the artwork. That needs an owner decision and was not done here.
- The page `<title>` metadata still uses "দাওয়াত" on some routes, and the policies body still mixes English terms (quote, refund, cookies). The browser-only prototype `order-journey.tsx` (not on `/order`) is English only.

## Verification

- `npm run typecheck` passed, and `vitest run` passed: **296 tests / 36 files**. The manual-payment test was updated for the new Bangla labels.
- Local dev server, Bangla mode. Each of `/`, `/templates/`, `/pricing/`, `/contact/`, `/policies/` and `/order/?template=jamdani` has exactly one header lockup (lotus + "Dawat." + Bangla tagline) and no English eyebrow. `/auth/login/` shows the same lockup; it was rendered with a placeholder loopback backend and no real keys. In English mode the lockup and eyebrows switch to English. At 390px there is no horizontal overflow on home or pricing.
- Screenshots (ignored folder `.artifacts/brand-consistency-2026-10-26/`): desktop home, home payment line, templates (bn + en), order, login; 390px home, home payment line, templates, order, login and pricing payment block.
- Not deployed or pushed.
