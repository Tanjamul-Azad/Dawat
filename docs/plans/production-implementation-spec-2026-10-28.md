# Dawat implementation spec · 28 October 2026

**Audience:** the Sonnet sessions implementing [the production plan](production-plan-2026-10-28.md). This file is authoritative wherever it is more specific than the plan. If something here conflicts with the code, the code's existing security pattern wins: stop, note it in your QA doc and choose the safer option.

**Canonical copy:** `F:\Projects\Wedding Card\docs\plans\` in the main checkout. Your worktree copy may be older; always read this path.

---

## 0. Scope changes since the plan was first written

| Change | Effect |
| --- | --- |
| **Email is deferred.** | Do not build ধাপ ৪ক or ৪খ: no outbox, no mail adapter, no `contact_email`, no email buttons. |
| **WhatsApp is the only delivery channel.** | Messages go from the host's own WhatsApp via `wa.me` and the host taps Send. Never add unofficial WhatsApp automation (whatsapp-web.js, Baileys, browser-extension senders) or the Meta Cloud API. |
| **Two invitation paths.** | Path 1: personal named links (ধাপ ৩). Path 2: one shared link and card for everyone (ধাপ ৩খ). A wedding may use both. |
| **Package names.** | ক্লাসিক / প্রিমিয়াম / নিজের মতো (Classic / Premium / Custom). Ids and prices are unchanged. |
| **Auto-quote.** | Applies to classic and premium only. Term 90 days from first publication. Refund wording is the existing policy text; do not invent new policy. |
| **Payment-review promise.** | Only from config; hidden when empty. |

## 1. Ground rules for both sessions

### 1.1 Environment

1. In `web/`, run `npm ci`.
2. Copy `F:\Projects\Wedding Card\web\.env.qa.local` into your worktree's `web/`. It is git-ignored. Never commit it, print it or paste values into docs.
3. Read `web/AGENTS.md`. This is Next 16: before using any Next API you have not seen in this repo, read `node_modules/next/dist/docs/`.
4. Local Supabase is shared by both sessions: API `127.0.0.1:54321`, Mailpit inbox `54324`.
   - If `docker` is not on PATH, prepend `C:\Users\User\AppData\Local\Programs\DockerDesktop\resources\bin`.
   - If Docker Desktop is stopped, start `C:\Users\User\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe` and wait.
5. Preview runs on `127.0.0.1:3102` via `npm run qa:build` then `npm run qa:preview`. The port is hardcoded.
   - Port 3102 is shared with the other session. If it is busy, wait and retry rather than stopping a process you did not start.
6. Apply your new migrations locally with `npx supabase migration up --local`. Never `db reset`: the other session and the 50-family rehearsal data live in the same database.

### 1.2 Hard limits

- No `git push`, no deploy, no hosted Supabase, no account creation, no passwords typed anywhere.
- Synthetic data only: `@example.test` addresses and `01700000xxx` numbers.
- Never reformat or rewrite files outside your boundary (§1.5).

### 1.3 Checks after every step

- `npx tsc --noEmit -p .`
- `npx vitest run --maxWorkers=1` (more workers crash next to Docker)
- After any SQL or API change, run `npm run test:local`.
- After every build, run `git checkout -- next-env.d.ts`.
- Check the changed screens in a browser at 375px and 1280px. Ensure there is no horizontal scroll and no floating element covering a button.

### 1.4 Code conventions (match the code around you)

- **Writes:** security-definer RPC with `p_key uuid` idempotency, an expected-revision check, `set search_path=''`, and explicit `revoke all … from public` / `grant execute … to authenticated` (or `anon` for guest paths). Never write directly to tables from the browser.
- **API routes:** follow `src/app/api/weddings/[id]/households/route.ts`. Use the `session()` / `database()` helpers, `dbError`, `HttpError`, and parse input with zod in `src/features/production/*`.
- **Latest definitions:** an RPC may be redefined in a later migration. Before changing one, find its latest `create or replace` across `web/supabase/migrations/` and start from that.
- **SQL changes:** new SQL goes in a new migration file named `YYYYMMDDHHMMSS_name.sql`, with timestamps after `20261027120000`. Update `src/server/database.types.ts` to match.
- **Text:** every user-facing string has both Bangla and English. Use the `t(bn, en)` / `tr()` pattern already in the file.
- **Bangla edits:** some characters exist in two Unicode forms (য় vs য + ়). Anchor edits on nearby ASCII or code, then confirm with `rg` that old text is gone.

### 1.5 File boundary

| Session | Owns |
| --- | --- |
| **app** | `src/components/production/**`, `src/features/production/**` except `catalog.ts` and `brand.ts`, `src/server/**`, `src/app/api/**`, `src/app/{admin,auth,dashboard,order/requests,weddings,i}/**`, `src/components/{guest-invitation*,invitation-*,manual-payment*}`, `supabase/migrations/**`, `scripts/**` |
| **public-site** | `src/components/{storefront*,home*,experience.tsx,storefront-pages.tsx,order-journey*,stationery-art*,artwork.tsx,brand-mark.tsx,ui.tsx}`, `src/features/production/{catalog.ts,brand.ts}`, `src/app/demo/**`, `src/app/{page.tsx,pricing,templates,contact,policies,order/page.tsx}`, `public/**` |

- **Shared contract:** the public site links to `/order/requests/?template=<id>&names=<urlencoded couple names>`. The app prefills the request form from `names`.
- **Package names:** only public-site edits `catalog.ts`. The app reads names from it and never hardcodes them.

### 1.6 When blocked

- If you need a policy decision (price, refund, legal wording), keep the current behaviour and write it under "Owner decisions needed" in your QA doc.
- Never invent policy and never fabricate reviews, counts or testimonials.

### 1.7 Commits

- One commit per step on your branch. Messages are imperative and describe the user-visible change.
- End every message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

---

## 2. Glossary for new UI strings

Use these exact terms in new features; ধাপ ১ applies them to existing text.

| Concept | বাংলা | English |
| --- | --- | --- |
| Customer workspace | আমার আয়োজন | My celebration |
| Personal link | ব্যক্তিগত লিংক | Personal link |
| Shared link | সবার জন্য লিংক | Link for everyone |
| Send via WhatsApp | WhatsApp-এ পাঠান | Send on WhatsApp |
| Send queue | একে একে পাঠান | Send one by one |
| Sent / Opened / Replied | পাঠানো হয়েছে / খুলেছেন / উত্তর দিয়েছেন | Sent / Opened / Replied |
| Not sent yet | এখনো পাঠানো হয়নি | Not sent yet |
| Pending reply | উত্তর বাকি | Awaiting reply |
| Remind | মনে করিয়ে দিন | Remind |
| From the shared link | সবার লিংক থেকে | From shared link |
| Dawat team | দাওয়াত টিম | Dawat team |
| Price and terms | দাম ও শর্ত | Price and terms |

---

## 3. App session

Order: ধাপ ১ → ধাপ ৩ → ধাপ ৩খ → ধাপ ২. WhatsApp moves ahead of access because the owner prioritised it. Commit after each step.

### ধাপ ১: Bangla copy inside the app

1. **Inventory script.** Create `scripts/bn-copy-inventory.mjs`.
   - It scans `src/` for Bangla text (`/[\u0980-\u09FF]/`) in `.ts` and `.tsx` files.
   - It writes `docs/qa/bn-copy-inventory.csv` with the columns `file,line,text`.
   - Commit both the script and the CSV.
2. **Rewrite** the app files in your boundary using the plan's §৪.২ rules and §৪.৩ glossary, page by page:
   1. login and MFA
   2. order/requests (`sales-desk.tsx`)
   3. workspace (`wedding-desk.tsx`, `client-dashboard.tsx`, `frame.tsx`)
   4. guests (`guest-hub.tsx`, `guest-list.tsx`, `response-editor.tsx`, `guest-live.tsx`)
   5. guest invitation
   6. admin (`seller-orders.tsx`)
   7. server error messages (`src/features/production/client.ts`, `errorText`)
   8. the `tr()` dictionary in `copy.ts`
3. **Tests:** update tests that query by label. Assertions about behaviour must not change.
4. **Done when:**
   - `rg` finds none of these in your boundary: `কর্মপরিসর`, `প্রবেশাধিকার`, `যাচাইকরণ`, `অপেক্ষমাণ`, `হালনাগাদ`, `বিক্রেতা`.
   - No mixed-language sentences remain.
   - All checks pass.

### ধাপ ৩: Personal links via the host's own WhatsApp

**Migration `20261028100000_whatsapp_delivery.sql`:**

- `public.households`: add `contact_phone text`, with check `contact_phone is null or contact_phone ~ '^\+[1-9][0-9]{7,14}$'`.
- `public.weddings`, with the same checks where relevant:
  - `host_whatsapp text`
  - `show_host_whatsapp boolean not null default false`
  - `invite_message_bn text not null default ''` (`length <= 600`)
  - `invite_message_en text not null default ''` (`length <= 600`)
- New table `public.household_deliveries`:
  - Columns: `id uuid pk default gen_random_uuid()`, `wedding_id uuid not null`, `household_id uuid not null`, `channel text check in ('whatsapp','share','copy')`, `link_revision int not null`, `actor_id uuid not null default auth.uid()`, `created_at timestamptz default now()`.
  - Foreign key `(wedding_id, household_id)` references `households`.
  - Index on `(wedding_id, household_id, created_at desc)`.
  - RLS enabled with `select` for `private.is_member(wedding_id)` (or the current member check). No direct insert.
- `save_household`: accept an optional `contactPhone` in `p_body`. Empty string means null. Validate with the same regex.
- New RPC `public.record_delivery(p_key uuid, p_wedding_id uuid, p_household_id uuid, p_channel text, p_link_revision int)`:
  - Requires member access (`private.can_manage`).
  - Rejects with 409 when `p_link_revision` is not the current active link revision.
  - Idempotent on `p_key`.
- New RPC `public.set_invite_settings(p_key uuid, p_wedding_id uuid, p_body jsonb)`: sets `host_whatsapp`, `show_host_whatsapp` and both messages.
- `household_report`: each row additionally returns:
  - `contactPhone`
  - `lastDelivery {channel, at, linkRevision} | null`
  - `firstOpenedAt`: the minimum `guest_sessions.created_at` for the household where `link_revision` equals the current link revision, or null
  - Add a `p_delivery` filter: `all | unsent | sent_unreplied`.
- `guest_invitation` payload: add `hostWhatsapp` only when `show_host_whatsapp` is true. It must **never** include any household's `contact_phone`.
- `export_households`: add `p_include_contacts boolean default false`. Contact data appears only when it is true.

**Shared helpers in `src/features/production/`:**

- `phone.ts`: `normalizePhone(input): string | null`, which throws on invalid input.
  - Accept Bangla digits, spaces, dashes, `+88`, `88` and a leading `0`.
  - BD mobile pattern `01[3-9]XXXXXXXX` becomes `+8801…`.
  - Other `+` international numbers pass through if they are E.164.
  - Test cases: `01712345678`, `০১৭১২৩৪৫৬৭৮`, `+880 1712-345678`, `8801712345678`, `0171234` (invalid), `+44 7911 123456`.
- `whatsapp.ts`:
  - `renderInvite(template, {name, link, couple})` replaces `{নাম}`/`{name}`, `{লিংক}`/`{link}` and `{বর-কনে}`/`{couple}`.
  - If the template has no link placeholder, append the link on a new line.
  - `waUrl(phone | null, text)` returns `https://wa.me/<digits>?text=<encodeURIComponent(text)>`, or `https://wa.me/?text=…` when there is no phone.
  - Export the default templates:
    - বাংলা: `আসসালামু আলাইকুম, {নাম}।\nআমাদের বিয়েতে আপনাদের দাওয়াত। নিচের লিংকে আমন্ত্রণপত্র দেখে আসবেন কি না জানিয়ে দিন।\n— {বর-কনে}\n{লিংক}`
    - English: `Hello {name},\nYou are invited to our wedding. Open the link below to see the invitation and let us know if you can come.\n— {couple}\n{link}`

**API:**

- `PUT /api/weddings/[id]/invite-settings/` calls `set_invite_settings`.
- `POST /api/weddings/[id]/households/[hid]/deliveries/` takes `{channel, linkRevision}` with an `Idempotency-Key`, and calls `record_delivery`.
- `GET /api/weddings/[id]/households/` passes `delivery` through.
- `GET /api/weddings/[id]/export/` takes `?contacts=1`.

**UI:**

- **Household editor** (`HouseholdEditor` in `guest-hub.tsx`):
  - Field "WhatsApp নম্বর (ঐচ্ছিক)", `inputMode="tel"`.
  - Normalise on blur and show the formatted value. Show an inline error when invalid.
  - Hint: "শুধু আমন্ত্রণ পাঠাতে লাগবে। অতিথির পাতায় দেখাবে না।"
- **Bulk add** (`BulkHouseholds`): lines become `নাম, কতজন, নম্বর`. The third column is optional. Any invalid phone blocks the whole submission, the same way invalid counts do now.
- **New `guest-send.tsx`:**
  - `SendMenu(row)`: a button next to copy. Its options:
    - WhatsApp-এ পাঠান
    - অন্য অ্যাপে শেয়ার: `navigator.share` when available, otherwise hidden
    - লিংক কপি
  - `SendQueue`: the panel opened from a new toolbar button "আমন্ত্রণ পাঠান".
    - Filter: এখনো পাঠানো হয়নি (default) / উত্তর বাকি (reminder) / সবাই.
    - Message editor that saves through `invite-settings`, with a live preview for the current family.
    - Queue view showing `৩ / ১৮ · রহমান পরিবার · +8801712…`.
- **Popup-safe opening (important):** fetch the current item's personal link (existing link endpoint, `kind: 'copy'`) *as soon as the item becomes current*. Render the WhatsApp button as an `<a href={waUrl} target="_blank" rel="noopener noreferrer">` that is disabled until the URL is ready. Never call `window.open` after an `await`, because mobile browsers block it.
- **After the link is opened:** when `document.visibilityState` returns to `visible`, show "পাঠিয়েছেন?" with three buttons:
  - **হ্যাঁ, পরেরটি**: records `sent` and advances
  - **পরে পাঠাব**: skips without recording
  - **আবার খুলুন**
- **Queue persistence:** persist `{filter, ids, index}` in `localStorage` key `dawat:send-queue:<weddingId>`, wrapped in try/catch, and offer "যেখানে থেমেছিলেন সেখান থেকে" on reopen.
- **Never record `sent` on copy or open alone.** Copy may record `channel: 'copy'` only if you also show it as "কপি করা হয়েছে", not as sent.
- **Row status chip:** এখনো পাঠানো হয়নি → পাঠানো হয়েছে · WhatsApp · {date} → খুলেছেন → উত্তর দিয়েছেন.
  - After a link rotation, a delivery with an old revision shows as "নতুন লিংক পাঠানো হয়নি".
- **Summary card:** add `পাঠানো X · খুলেছেন Y · উত্তর Z`, counted over the current event.
- **Workspace settings** (in `wedding-desk.tsx`):
  - "আপনার WhatsApp নম্বর" field.
  - Toggle "অতিথির কার্ডে 'প্রশ্ন থাকলে WhatsApp করুন' দেখান".
  - One line: "বার্তা যাবে আপনার ফোনে যে WhatsApp খোলা আছে সেখান থেকে।"
- **Guest invitation:** when `hostWhatsapp` is present, show a small "প্রশ্ন থাকলে WhatsApp করুন" link (`wa.me/<digits>`) near the RSVP section.

**Tests:**

- Unit tests for `phone.ts` and `whatsapp.ts`, including encoding and a 120-character name.
- Integration tests (PGlite, follow `guests.integration.test.ts`):
  - phone check
  - `record_delivery` revision and idempotency
  - non-member denied
  - `firstOpenedAt` resets after rotation
  - guest payload never contains `contact_phone`
  - export excludes contacts by default
- Component tests:
  - menu
  - queue: prefetch, then link enabled, then confirm, then advance
  - resume
  - bulk third column

### ধাপ ৩খ: One shared link and card for everyone

**Design:** the shared link mints an ordinary household plus session for each new guest, then redirects to the existing personal guest page. RSVP, wishes, allowances, reports and CSV are reused unchanged.

**Migration `20261028110000_open_invitation.sql`:**

- `public.households`:
  - add `source text not null default 'host' check (source in ('host','open'))`
  - add `open_device_digest text`
  - unique on `(wedding_id, open_device_digest)` where not null
  - add `hidden boolean not null default false` (host-ignored duplicates or spam, excluded from totals and lists unless filtered)
- New table `private.open_invites`:

  | Column | Type / default |
  | --- | --- |
  | `wedding_id` | uuid, primary key |
  | `enabled` | boolean, default false |
  | `digest` | text, unique |
  | `ciphertext` | text |
  | `key_id` | text |
  | `revision` | int, default 1 |
  | `event_ids` | text[], not null |
  | `max_people` | int, check 1–20, default 5 |
  | `greeting_bn` | text, default 'প্রিয় অতিথি' |
  | `greeting_en` | text, default 'Dear guest' |
  | `ask_phone` | boolean, default true |
  | `cap` | int, default 500 |
  | `updated_at` | timestamptz |

  Token storage mirrors `guest_links`: the server generates the token, the database keeps only the digest and an AES-GCM ciphertext (reuse `encryptLink` with `hid` = wedding id and a distinct AAD purpose).
- **RPC `public.set_open_invite(p_key, p_wedding_id, p_body jsonb, p_digest text, p_ciphertext text, p_key_id text)`**, host only:
  - enable or disable
  - settings
  - `rotate`: a new digest, revision + 1; old link sessions keep working for already-joined guests, but the old URL can no longer mint new households
- **RPC `public.open_invite_link(p_wedding_id)`**, host only: returns ciphertext and key id so the server can rebuild the URL. Never return a raw token from SQL.
- **RPC `public.join_open_invitation(...)`**, granted to `anon`.
  - Parameters:
    - `p_slug uuid`
    - `p_open_digest text`
    - `p_device_digest text`
    - `p_ip_digest text`
    - `p_name text`
    - `p_phone text`
    - `p_session_digest text`
    - `p_link_digest text`
    - `p_link_ciphertext text`
    - `p_link_key_id text`
  - Steps:
    1. Check that the wedding is live and not expired (reuse the `resolve_general_invitation` conditions) and the open invite is enabled with a matching digest.
    2. If `p_device_digest` already maps to a household in this wedding, create a new `guest_sessions` row for it and return it. Do not create a duplicate.
    3. Otherwise apply the limits: `private.guest_throttle('open-ip:'||p_ip_digest, 10)` per hour, a device-scoped throttle of 3 per hour, and a count of non-hidden `source='open'` households below `cap`. When a limit is hit, raise PT429 or PT409 with a readable message.
    4. Validate the name (1–120 characters, no control characters) and phone (null or E.164).
    5. Insert the household (`source='open'`, `name`, `contact_phone`, `greeting` from `greeting_bn`).
    6. Insert `household_events` for each open `event_id` with `max_people` set to the open invite's `max_people`.
    7. Insert a `guest_links` row from the passed digest, ciphertext and key id, so the host can later copy this guest's personal link.
    8. Insert a `guest_sessions` row with the same expiry as `exchange_guest_link`.
  - Returns `{householdId, expiresIn}`.
- **RPC `public.hide_household(p_key, p_wedding_id, p_household_id, p_hidden boolean)`**, host only. Hidden households are excluded from `household_report` totals and lists unless `p_status='hidden'`, and also excluded from export.
- **`household_report` changes:**
  - rows include `source` and `duplicateOf` (the id of another non-hidden household in the same wedding with the same lower-case trimmed name or the same `contact_phone`, else null)
  - add filter `p_source: all | host | open`
  - totals add `openCount`

**Server and routes:**

- `src/server/open-invite.ts`: `getOpenInvite`, `setOpenInvite`, `joinOpenInvitation`.
  - Device id: an httpOnly cookie `dawat_open_device` (random 32 bytes, path `/i/<slug>/`, one-year max age). Store only its sha256 digest.
  - IP digest: `sha256(OPEN_INVITE_IP_SALT + ip)`. The ip comes from `x-nf-client-connection-ip`, else the first `x-forwarded-for`, else `'unknown'`. Never store the raw IP. Add `OPEN_INVITE_IP_SALT` to config with a local default, and document it for the owner.
  - After joining, set the existing `dawat_guest` cookie exactly as `exchangeLink` does and return the household path.
- **Guest-facing:**
  - `src/app/i/[slug]/o/[token]/page.tsx` renders the published invitation in general form with greeting `greeting_bn`.
  - If the device cookie already maps to a household, it redirects straight to that household's page.
  - Otherwise it shows a short form:
    - "আপনার নাম" (required)
    - "WhatsApp নম্বর (ঐচ্ছিক)" when `ask_phone` is on
    - a hidden honeypot field `website`, rejected when filled
    - button "আমন্ত্রণ খুলুন ও উত্তর দিন"
  - `POST /i/[slug]/o/[token]/api` takes `{name, phone, website}`, calls `joinOpenInvitation`, then redirects with 303 to `/i/<slug>/h/<hid>/`.
  - The page sets `robots: noindex`, and its OG metadata is the general invitation's, without any token.
- **Host-facing:**
  - `GET` and `PUT /api/weddings/[id]/open-invite/`.
    - `GET` returns settings and the URL (rebuilt from the ciphertext).
    - `PUT` handles settings, enable/disable and rotate.
  - `POST /api/weddings/[id]/households/[hid]/hide/`.

**Host UI** (`guest-hub.tsx` plus a new `open-invite.tsx`):

- **Card "সবার জন্য একটি লিংক"** above the list:
  - Switch "সবার জন্য লিংক থেকে উত্তর নেওয়া চালু করুন".
  - Settings: events (checkboxes), max people per answer (1–20), greeting, ask phone.
  - Buttons:
    - **লিংক কপি**
    - **WhatsApp-এ শেয়ার**: `waUrl(null, renderInvite(message, {name: greeting, link, couple}))`, so the host picks a group or Broadcast List
    - **নতুন লিংক বানান** (rotate, with a confirmation explaining old link behaviour)
  - Explanation: "এক লিংক সবার জন্য। অতিথি নিজের নাম লিখে উত্তর দেবেন। কে খুলেছেন তা জানা যাবে না, শুধু যাঁরা উত্তর দিয়েছেন তাঁরা তালিকায় আসবেন।"
- **List:**
  - "সবার লিংক থেকে" badge on rows with `source='open'`.
  - Duplicate hint "সম্ভবত একই: {name}" when `duplicateOf` is set, with a "লুকিয়ে রাখুন" action.
  - Source filter.
  - A "লুকানো" filter that shows hidden rows with "আবার দেখান".
- **Summary:** "নাম ধরে: X · সবার লিংক থেকে: Y".
- **Send queue:** never includes `source='open'` households, which have no WhatsApp to send to unless they gave a phone. The rows still show the "পাঠান" menu.

**Tests:**

- Integration:
  - disabled or wrong digest gives 404
  - expired or paused wedding is denied
  - device reuse returns the same household
  - IP, device and cap limits
  - name and phone validation
  - honeypot (route-level)
  - rotate stops new joins via the old URL while old sessions still work
  - hidden households are excluded from totals and export
  - a guest on the shared link can never read other households
  - open households work with the existing `guest_command` RSVP and allowance (`max_people`)
- Component tests: settings card, badge, duplicate hint, hide and unhide.
- E2E: add a short shared-link section to `scripts/verify-local.mjs`: enable, join, answer, then confirm the host report shows it.

### ধাপ ২: Simpler access

**Migration `20261028120000_access_simplify.sql`:**

- `public.sales_requests`: add `customer_phone text`, with the same E.164 check, nullable.
- New table `public.catalog_prices`:
  - Columns: `template_id text pk`, `package_name text`, `amount_minor bigint`, `term_days int default 90`, `auto_quote boolean`.
  - Seed it from `catalog.ts`:
    - classic templates at 50000
    - premium templates at 75000
    - `custom` at 150000 with `auto_quote=false`
  - Add a vitest contract test that reads `catalog.ts` and the migration seed and fails if they differ.
- `sales_command`, `request` kind:
  - Accept an optional `phone` (normalised server-side).
  - If the template's `catalog_prices.auto_quote` is true, set `state='quoted'` right after insert, with:
    - `package_name`, `amount_minor`, `term_days` from the table
    - `quote_notes` = standard Bangla text taken from the current policies page: "প্রথমবার প্রকাশের দিন থেকে {term} দিন চালু থাকবে। ফেরত বা বাতিলের জন্য অর্ডার নম্বরসহ যোগাযোগ করুন।"
  - Write an audit row `quote` with reason `auto standard quote`.
- `payment_submission_command`, `verify` kind: accept `"activate": true`.
  - When set, call `seller_command` `confirm` then `activate` in the same transaction, after `verify-payment`, each with `gen_random_uuid()` keys as the accept migration does.
  - If any step fails, the whole command fails and nothing changes.
- RPC `public.admin_summary()`: staff with AAL2 only. Returns `{newRequests, pendingPayments}`.

**UI and API:**

- **Request form** (`sales-desk.tsx`):
  - Field "WhatsApp নম্বর (ঐচ্ছিক, পোর্টাল চালু হলে জানাতে)".
  - Prefill the brief with `বর ও কনে: {names}` from `?names=` when the brief is empty and no draft exists.
- **Auto-quoted request:** the buyer sees the price and terms immediately, with the existing accept button. The next-step card says "নিচে দাম ও শর্ত দেখে সম্মতি দিন".
- **Seller payment review:**
  - Checkbox "যাচাইয়ের সঙ্গে সঙ্গে অর্ডার নিশ্চিত করে আয়োজনের পাতা চালু করুন", checked by default and shown only for "যাচাই".
  - On success, open the handoff card.
- **Handoff card** (`seller-orders.tsx`, persistent in the order modal when access is active):
  - "গ্রাহককে জানান" with **WhatsApp-এ জানান**: `waUrl(customer_phone ?? latest payment sender phone ?? null, text)`, where text is "আসসালামু আলাইকুম {name}, আপনার দাওয়াত আয়োজনের পাতা চালু হয়েছে। এই লিংকে যান: {url}\nলগইন করবেন এই ইমেইল দিয়ে: {email}"
  - Plus the existing copy button.
- **Admin nav:** badge counts from `GET /api/admin/summary/`, refreshed on focus and every 60 seconds; document title prefix `(n)`.
- **Script:** update `scripts/verify-local.mjs` (a standard template is now auto-quoted; the custom path is still manually quoted) and the integration tests.

### App QA doc

Write `docs/qa/app-onboarding-2026-10-28.md` covering:

- per step: what changed, test counts, screenshots taken (stored under ignored `.artifacts/app-onboarding/`)
- the exact migration list the owner must apply on hosted, in order
- new env/config (`OPEN_INVITE_IP_SALT`)
- what was not verified (real phone, real WhatsApp send)
- owner decisions needed

---

## 4. Public-site session

**Read first:** plan §৫ and the decisions section. §1 above applies.

1. **Copy.** Apply the glossary to the public pages and the header/footer.
   - Package renames in `catalog.ts`: names only.
   - **Policies** rewritten in plain Bangla without mixed sentences, keeping the meaning. Add the guest-phone deletion line: guest phone numbers are deleted 30 days after the invitation expires.
   - **FAQ "অতিথিদের কীভাবে পাঠাব?"** describes the two paths:
     1. নাম ধরে আলাদা লিংক, sent one tap each from the host's own WhatsApp, showing who opened and replied
     2. সবার জন্য একটি লিংক, sent once to a group or broadcast list, where guests type their own name
   - **No email promise**, and no "fully automatic WhatsApp" promise.
2. **Header and footer.** Plan §৫.১–৫.২.
   - Header: sticky, transparent over the hero, then solid with `backdrop-filter` blur after 24px of scroll.
     - Nav: নকশা · কীভাবে কাজ করে · দাম · প্রশ্নোত্তর.
     - Right side: language toggle, লগইন, CTA "নকশা বেছে নিন" (to `/templates/`).
   - Mobile: a bottom sheet with focus trap, Esc and backdrop to close, and 48px targets.
   - Footer: columns, bKash row, social slot hidden when empty.
3. **Trust.** Plan §৫.৩.
   - **Screenshots:** capture from the local QA app using synthetic data only, never the rehearsal buyer's real-looking email. Blur or replace any email address. Store optimised WebP in `public/brand/screens/`.
   - **Demo invitation:** a static demo route (for example `/demo/`) built from the existing template components with fixture content.
     - Its RSVP form is interactive but posts nowhere.
     - It shows a toast: "এটা নমুনা, উত্তর সংরক্ষণ হয়নি".
     - It must not hit any API.
   - **Promise block:** the payment-review line comes from `PAYMENT_REVIEW_PROMISE_BN/EN` and is hidden when empty.
   - **Review and founder components:** take data from `src/features/production/brand.ts` (empty arrays) and render nothing when empty.
4. **Interactive.** Plan §৫.৪.
   - "নিজেদের নাম লিখে দেখুন": client-only, updates card names live. The CTA becomes `/order/requests/?template=<id>&names=<encoded>`.
   - Everything respects `prefers-reduced-motion`.
5. **Images.** Plan §৫.৫. Record every licence in `public/licenses/`.
6. **Keep the full-bleed hero layout.** Only align it with the new header.
7. **Quality gate.** Plan §৫.৬ for every changed page.
8. **QA doc.** Write `docs/qa/public-site-2026-10-28.md`, covering:
   - what changed
   - screenshots under ignored `.artifacts/public-site/`
   - Lighthouse numbers
   - config to set
   - what was not verified

---

## 5. After both sessions

The owner says when to merge, in this order:

1. Merge `public-site` (no migrations).
2. Merge `app`.
3. Resolve the expected small conflicts (`catalog.ts` usage, tests).
4. Run the full checks and `npm run test:local`.
5. Apply the hosted migrations in order (owner approval).
6. Push once and smoke-test live.
