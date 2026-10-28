# অ্যাপ সেশন · ২৮–২৯ অক্টোবর ২০২৬ · QA নোট

Branch: `claude/app-onboarding-dcfad8`. কিছু push বা deploy হয়নি। ইমেইল (ধাপ ৪ক) মালিকের সিদ্ধান্তে বাদ।

## কী হয়েছে
- **ধাপ ১ · বাংলা লেখা:** `web/scripts/bn-copy-inventory.mjs` + `docs/qa/bn-copy-inventory.csv`; ৪.৩ শব্দকোষ অনুযায়ী লগইন, অর্ডার, আমার আয়োজন, অতিথি, অতিথির আমন্ত্রণপত্র ও অ্যাডমিনের লেখা। `glossary.test.ts` পুরোনো শব্দ ফিরলে ফেল করে (`node scripts/bn-copy-inventory.mjs --check`)।
- **ধাপ ২ · অ্যাক্সেস:** গ্রাহকের ঐচ্ছিক WhatsApp নম্বর; ক্লাসিক/প্রিমিয়ামে স্বয়ংক্রিয় দাম ও শর্ত (`catalog_prices`); পেমেন্ট যাচাইয়ের সঙ্গে এক ক্লিকে নিশ্চিত + চালু (এক ট্রানজ্যাকশন, ব্যর্থ হলে কিছুই বদলায় না); "গ্রাহককে জানান" কার্ড (`notify-customer.tsx`, নম্বর না থাকলে শেষ পেমেন্টের প্রেরকের নম্বর); অ্যাডমিন মেনুতে সংখ্যা ও ট্যাব টাইটেলে `(n)` (`/api/admin/summary/`); `?names=` থেকে ফর্মে "বর ও কনে: …"।
- **ধাপ ৩ · ব্যক্তিগত লিংক, হোস্টের নিজের WhatsApp থেকে:** অতিথির `contact_phone`; `household_deliveries`, `record_delivery`, `set_invite_settings`; রিপোর্টে `lastDelivery`, `firstOpenedAt`, পাঠানো/খুলেছেন/উত্তর সংখ্যা, "উত্তর বাকি" ফিল্টার; `guest-send.tsx` (সারির "পাঠান" মেনু, "একে একে পাঠান" সারি, `<a target=_blank>` আগে থেকে তৈরি, হোস্ট "হ্যাঁ" বললে তবেই `sent`); বাল্ক যোগে তৃতীয় ঘর; হোস্টের WhatsApp নম্বর ও অতিথির কার্ডে ঐচ্ছিক বোতাম; CSV-তে নম্বর শুধু অনুরোধে।
- **ধাপ ৩খ · সবার জন্য একটি লিংক:** `/i/[slug]/o/[token]`, `join_open_invitation` (ডিভাইস কুকি, IP-digest থ্রটল, ক্যাপ ৫০০, honeypot), হোস্ট কার্ড (কপি, WhatsApp-এ শেয়ার, নতুন লিংক), "সবার লিংক থেকে" ব্যাজ, সম্ভাব্য একই-জন ইঙ্গিত, লুকান/আবার দেখান, ভাগ করা মোট।
- ইমেইল: কিছুই বানানো হয়নি।

## যেভাবে এল
ধাপ ৩/৩খ/২-এর প্রথম খসড়া main checkout-এর uncommitted কাজ ছিল (`wip/main-checkout-2026-10-28`, `ec5965e`)। সেটা এই branch-এ merge করা হয়েছে (`6928106`)। যেখানে দুই দিকেই একই ফাইল বদলেছিল, সেখানে আগের ধাপ ১/২-এর সংস্করণ রাখা হয়েছে; স্পেক অনুযায়ী `/api/admin/summary/`, `catalog_prices`, পেমেন্ট প্রেরকের নম্বর ফলব্যাক, "বর ও কনে: …" নেওয়া হয়েছে। public-site ফাইল (`storefront*`, `catalog.ts`, `brand.ts`, `src/app/demo`, `demo-invitation.tsx`, `public/brand/*`, `next.config.ts`-এর env) বাদ দেওয়া হয়েছে।

## টেস্ট ফল
- `npx tsc --noEmit -p .`: পাস
- `npx vitest run --maxWorkers=1`: ৫২ ফাইল, ৪২২ টেস্ট পাস (PGlite integration সহ: স্বয়ংক্রিয় দাম, দাম/মেয়াদ ক্লায়েন্ট বদলাতে না পারা, এক ক্লিক আর রোলব্যাক, delivery revision/idempotency, অতিথির payload-এ নম্বর নেই, shared link সীমা)
- `npm run qa:build`: পাস
- `npm run test:local` (`verify-local.mjs`, লোকাল Supabase, ব্যক্তিগত পোর্ট ৩১১২): পাস, সঙ্গে বিক্রি→এক ক্লিক চালু, shared-link join/honeypot/RSVP/device reuse/হোস্ট রিপোর্ট
- ব্রাউজার (৩৭৫px ও ১২৮০px, লোকাল সিন্থেটিক বিয়ে): অতিথি তালিকা ও সবার-লিংকের অতিথি পাতায় অনুভূমিক স্ক্রল নেই, সবার লিংকের পাতা `noindex`, honeypot লুকানো। ফিল্টারে কাঁচা `hidden` লেখা পেয়ে ঠিক করা হয়েছে (এখন "লুকানো")।

## হোস্টেড ডেটাবেসে মালিককে এই ক্রমে চালাতে হবে (deploy-এর আগে)
1. `20261027120000_accept_opens_order.sql` (এখনো না চালানো থাকলে)
2. `20261028090000_access_onboarding.sql`
3. `20261028100000_whatsapp_delivery.sql`
4. `20261028110000_open_invitation.sql`
5. `20261028120000_access_simplify.sql`
6. `20261028130000_guest_contact_retention.sql` — **`pg_cron` extension লাগে** (Supabase Dashboard → Database → Extensions-এ চালু না থাকলে এই migration ব্যর্থ হবে)
7. `20261028140000_household_duplicate_indexes.sql`

কোনো migration আগে চালানো ফাইল বদলে ঠিক করা হয়নি। কখনো `db reset` চালানো হয়নি।

## env / কনফিগ
- `OPEN_INVITE_IP_SALT` — সবার লিংকে IP-র hash-এর salt। হোস্টেডে একটি এলোমেলো দীর্ঘ মান বসান (কোডে লোকাল ডিফল্ট আছে; সেটা production-এ রাখবেন না)।
- `STANDARD_TERM_DAYS` — **বানানো হয়নি।** মেয়াদ এখন `catalog_prices.term_days` (৯০)। কারণ গ্রাহকের ব্রাউজার থেকে আসা মেয়াদ বিশ্বাসযোগ্য নয়। বদলাতে SQL `update public.catalog_prices set term_days = …` লাগবে। → নিচে "মালিকের সিদ্ধান্ত"।
- `SUPABASE_MEDIA_SECRET_KEY`, `GUEST_LINK_*` আগের মতোই।

## যাচাই হয়নি
- আসল ফোনে বা আসল WhatsApp-এ পাঠানো, `wa.me` খোলা ও "পাঠিয়েছেন?" প্রশ্ন (শুধু কম্পোনেন্ট টেস্টে: `guest-send.test.tsx`)।
- ব্রাউজারে "পাঠান" মেনু/সারির প্যানেল ক্লিক করে দেখা: ইন-অ্যাপ ব্রাউজারে পেজ আঁকা হচ্ছিল না, তাই সারির স্ক্রিন, অ্যাডমিন "গ্রাহককে জানান" কার্ড (MFA লাগে) ও স্ক্রিনশট নেওয়া হয়নি।
- অতিথি তালিকা পাতায় দুটি `<main>` পাওয়া গেছে (লোডিং স্কেলেটন থেকে যায়) — আগে থেকেই ছিল কি না যাচাই করা হয়নি।
- hosted-এ `pg_cron` migration; নতুন migration-গুলো hosted-এ চালানো হয়নি।
- ইংরেজি সংস্করণের সব নতুন লেখা পুরো পড়ে দেখা হয়নি।

## মালিকের সিদ্ধান্ত লাগবে
- মেয়াদ বদলানোর জন্য env (`STANDARD_TERM_DAYS`) চাই, না SQL/টেবিল যথেষ্ট? (নিরাপত্তার জন্য টেবিলই রাখা হয়েছে।)
- `packages.ts`-এর নাম এখনো কোডে লেখা (ক্লাসিক/প্রিমিয়াম/নিজের মতো); merge-এর সময় public-site-এর `catalog.ts`-এর নাম থেকে পড়ার ব্যবস্থা করতে হবে।
- `seller_command`-এর `verify-confirm-activate` kind আছে, কিন্তু পেমেন্ট যাচাইয়ের এক ক্লিক এখন `20261028120000`-এর ধারাবাহিক ধাপ ব্যবহার করে (ফল একই, এক ট্রানজ্যাকশন)। একটাই রাখতে চাইলে নতুন migration দিয়ে।
