# অ্যাপ সেশন · ২৮ অক্টোবর ২০২৬ · অবস্থা (অসমাপ্ত)

Branch: `claude/app-onboarding-dcfad8`. কিছু push বা deploy হয়নি।

## হয়েছে
- **ধাপ ১ (commit e6eabe7):** `web/scripts/bn-copy-inventory.mjs` + `docs/qa/bn-copy-inventory.csv`; ৪.৩ শব্দকোষ অনুযায়ী লগইন, অর্ডার, আমার আয়োজন, অতিথি, অ্যাডমিনের লেখা; প্যাকেজের নাম (`packages.ts`); `glossary.test.ts` পুরোনো শব্দ ফিরলে ফেল করে।
- **ধাপ ২ (commit হয়েছে, নিচের সীমাবদ্ধতা দেখুন):** migration `20261028090000_access_onboarding.sql` (`sales_requests.customer_phone`, ক্লাসিক/প্রিমিয়ামে স্বয়ংক্রিয় দাম ও শর্ত, `verify-confirm-activate` এক ট্রানজ্যাকশনে); WhatsApp নম্বর ফর্ম ও normalise; "গ্রাহককে জানান" কার্ড (`notify-customer.tsx`); অ্যাডমিন সংখ্যা চিহ্ন ও ট্যাব টাইটেল; `?names=` prefill; `STANDARD_TERM_DAYS` (ডিফল্ট ৯০, সর্বোচ্চ ৩৬৫)।

## টেস্ট
- `npx tsc --noEmit -p .` পাস; `npx vitest run --maxWorkers=1` পাস (৩৯০+ টেস্ট, PGlite integration সহ: রোলব্যাক, idempotent পুনরাবৃত্তি, MFA)।
- `npm run qa:build` পাস।

## মালিককে hosted-এ চালাতে হবে (deploy-এর আগে)
- `20261028090000_access_onboarding.sql` (এর আগে `20261027120000` না থাকলে সেটাও)।
- env: `STANDARD_TERM_DAYS` (ঐচ্ছিক, ডিফল্ট ৯০)।

## যাচাই হয়নি / বাকি
- `npm run test:local` (verify-local.mjs আপডেট হয়েছে, কিন্তু চালানো যায়নি: Docker Desktop বারবার বন্ধ হয়ে যাচ্ছিল)।
- ব্রাউজারে ৩৭৫px/১২৮০px স্ক্রিনশট চেক হয়নি।
- **ধাপ ৩ (অতিথিকে পাঠানো) আর ধাপ ৪ক (ইমেইল, `docs/ops/email-setup-bn.md`) শুরুই হয়নি।** ব্যবহার-সীমা শেষ হয়ে গেছে।
- সীমাবদ্ধতা: `termDays` ক্লায়েন্ট থেকে আসে, DB শুধু ১–৩৬৫ বাঁধে (দাম DB-তেই ঠিক করা)। প্যাকেজের নাম catalog-এর `prices.normal/premium/custom` থেকে পড়ে; পাবলিক সেশন ওই কী বদলালে `packages.ts` ভাঙবে (tsc ধরবে)।
