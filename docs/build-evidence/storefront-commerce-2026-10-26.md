# Dawat storefront and manual sales · 26 October 2026

## Implemented and verified

- Imagegen-first public storefront, collection, pricing, contact and policies; six working animated previews, Bangla/English, mobile two-column collection and horizontal home collection.
- Normal BDT500, Premium BDT750, Customized BDT1500. Custom discussion/floating support: WhatsApp `8801606092143`.
- Verified-email request → seller quote with explicit duration/service/payment terms → customer acceptance → unpaid order → transaction evidence → seller verification/rejection → separate confirmation and portal activation.
- Idempotent receipts, stale-revision checks, owner RLS, staff AAL2; no customer-set price, self-verification or self-activation. Design follows sign-in/order into the purchased portal.
- Sales state refreshes every20 seconds while visible and on focus. Network failures preserve last confirmed state; ambiguous retries preserve the mutation key.
- Hosted migrations `20261026054154` and `20261026054200` applied; matching local migrations applied without reset. Generated types reflect hosted schema.
- Final administrator `valtube101@gmail.com`: user explicitly corrected selection, verified email/active role confirmed. `i.m.tanjamul@gmail.com` staff role deactivated; customer ownership unaffected. Audited reassignment; SMTP sender stays valtube.
-293 tests/35 files and optimized Next build pass. Full synthetic HTTP/Auth/MFA/Storage/guest verification passes, including request, agreement, payment review, activation, selected template, retry and cross-user denial.
- Browser inspected390px home/collection, premium opening and opened design. No document overflow; dark-design date/location/navigation contrast fixed. Hardware-device testing is not implied.

## Handoff and deployment checkpoint

- Commit `6c4e7fb4f39347d9ee5c4af969d0f4cf7efbc86a` pushed and public website live at https://dawat-client-pilot.netlify.app/. Root200 with new storefront content proves all-surface runtime. Main URL retained to preserve guest links. GitHub verification40324105565 succeeded.
- Live read-only smoke passes: public home/templates/pricing/contact/policies200, support link/index metadata, all six serialized preview design props, selected-template login return path, unauthenticated sales/admin denial, foreign-origin write denial, private export/history denial and nine login assets405329 bytes. No email or live account created by smoke.
- Local browser use subsequently reported disabled despite enabled switches in owner screenshots. Netlify UI/deploy ID and a fresh live visual capture could not be inspected by agent. This did not prevent direct live HTTP verification; no browser restrictions bypassed.
- Owner privately completed authenticator setup and verification, replied done and supplied a screenshot of the genuine `valtube101@gmail.com` seller panel with orders loaded. Hosted authenticated admin read is therefore owner-observed. No MFA bypass. Old retained QA/pilot records visible there are historical fixtures, not fabricated customer sales.
- Receiving payment number/method awaits owner. Quotes must supply explicit payment instructions; customer can confirm via WhatsApp. Support number is not assumed to be a receiving account.
- Automatic WhatsApp/email guest delivery explicitly deferred.

Remaining business configuration: confirmed receiving payment account. Actual provider funds must always be checked by the seller before verification. No real payment transaction was performed as part of QA.
