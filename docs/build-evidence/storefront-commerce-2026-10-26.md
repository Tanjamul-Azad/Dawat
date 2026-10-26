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

- Netlify `DAWAT_SURFACE` changed from pilot to all and Save clicked; last observed UI saving. Persisted value/newest deployment must be verified before claiming publication. Retain project URL to preserve guest links.
- Local browser use subsequently disabled in Work settings, blocking Netlify UI verification. No Netlify API credential available locally. Git push/build remain available via GitHub.
- Owner must privately enroll/verify authenticator at `/auth/mfa/`. No verified factor at latest database check; no MFA bypass.
- Receiving payment number/method awaits owner. Quotes must supply explicit payment instructions; customer can confirm via WhatsApp. Support number is not assumed to be a receiving account.
- Automatic WhatsApp/email guest delivery explicitly deferred.

This checkpoint does not claim unresolved publication, receiving-account configuration or owner MFA completion.
