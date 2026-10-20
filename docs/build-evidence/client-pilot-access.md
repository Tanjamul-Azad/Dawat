# Single-wedding client pilot · 20 October 2026

User requested access to the currently open account to test the client workflow before continuing the public website. One free client workspace was provisioned in Dawat Staging using an audited, idempotent operator transaction. No schema, RLS policy or staff privileges changed.

- Wedding: `e2c385fd-247e-4379-8317-6a359e2c89c3` — আমাদের বিয়ে · পরীক্ষামূলক আয়োজন.
- Owner: the verified account already signed in by the user. This is a client membership, not an admin grant.
- Confirmed free pilot with explicit payment exception; no payment receipt or paid status fabricated.
- Active dashboard grant; 90-day publication entitlement, with start/expiry unset until publication.
- Draft is empty and invitation remains unpublished. No guests, wishes or live invitation created for the user.
- Operator audit action: `operator.client_pilot.provision`.

Verification: actual normal-role hosted owner read/manage allowed; other account read/manage denied. Hosted guest and response-tools smoke proofs passed with synthetic fixtures rolled back. All 194 tests in 18 files passed. Full isolated local HTTP/Auth/Storage workflow verification passed again.

User chose to test without photos. Hosted media server key remains absent, so hosted photo processing is pending. Fresh visual/browser qualification is not claimed. The frontend currently runs at loopback port 3100; an external client needs a hosted frontend origin plus their own verified email and scoped membership. The operator's account or browser session must not be shared with clients.
