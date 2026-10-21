# Client pilot, production separation and recovery closeout

21 October 2026, Asia/Dhaka. Current customer scope: the owner's existing verified account, one wedding, free Netlify/Supabase, local-only backup. No external guest messages were sent.

## Release and boundaries

Live app source `08138d0`; recovery/environment implementation began in `2e2323d`. 262 tests across28 files pass, TypeScript and optimized normal/recovery builds pass, and GitHub CI passed the live source. The final wording change explains that republishing does not extend the original term.

Supabase `zztiestaqjbsbjuzmbqp` was backed up and promoted from Dawat Staging to **Dawat Production**. No unrelated project was changed. Auth Site URL is the exact Netlify origin; no redirect allowlist or wildcard is configured. Ordinary development uses local `dawat-local`; restore uses distinct `dawat-recovery`. Build and request guards reject the production project with development/preview context, wrong origin or an unrestricted app surface. Netlify's media secret/AES ring and production marker are scoped to Production only. Previews remain private. Pilot profile denies staff/storefront routes; it is a shared client/guest runtime, not four independently privileged apps.

With the owner's specific action-time approval, Vercel `dawat-client-preview` was permanently deleted, including its deployments/environment variables. Its former canonical URL now returns404. No paid tier, card, trial, top-up or domain purchase was selected.

## Final hosted user loop

The genuine saved owner session opened the dashboard without another OTP. Reopened only the previously closed synthetic fixture `fc74ca23-1236-4ec5-9592-779eba342bc5`, with attributed audit records and its existing one-day test exception. The original pilot `e2c385fd-247e-4379-8317-6a359e2c89c3` was never edited or published.

- Updated the reception venue, saved to the real backend and observed it on the published guest card. Restricted nikah and the host-only household note were absent from guest DOM.
- At5/5, upload was disabled. Removed one draft photo, saved and released its unused slot while keeping previously published media. Selected a fictional8,988,534-byte JPEG through the real chooser. Browser preparation and native Netlify processing produced a ready1600×1143 asset,928,106bytes across variants. Added a Bangla description, saved and published five photos. The fifth image loaded at640×457 in the guest gallery.
- Created a fictional named family with reception-only access and allowance3. Issued a canonical personal link, exchanged it for a token-free household route, opened the personalized Jamdani cover and submitted Bangla2 adults+1child. The guest received the server-confirmed3-person receipt. An independent wish persisted.
- Owner refresh showed two attending families/6people/4adults+2children, correctly combining the previous fixture reply with this new reply. Private wishes showed both exact messages. Recopy returned the same bearer credential.
- Revoked the new credential; the already-established guest session became unavailable. Paused publication; the general view also became unavailable after the server acknowledged the action. Replies and wishes remained. Grant revoked and membership made inactive after acceptance; test setup is closed.
- The original pilot's selected wedding fields and full draft still hash to `510b70e530c51ac89cdb2d2dcd373a0ad73950af9fead1cc93d2c274af813183`: unpublished, draft/publication revision0. Dashboard returns directly to that sole active wedding.

Guest390px layout had no horizontal overflow, and the receipt/change-response action remained readable above the navigation. Previous320/390/768/1366px editor/account/guest checks remain applicable. Screenshot evidence in ignored `.artifacts/client-handoff/`: `final-live-rsvp-report.png`, `final-live-wishes.png`, `final-guest-mobile-receipt.png`, `production-auth-origin.png`, `vercel-retired.png`. These contain the owner email and fictional wedding/family data; no raw bearer is tracked.

Anonymous production smoke passed: Bangla login/assets200, private export/history401, foreign-origin mutation403, protected client deep links307 with safe return paths, staff/storefront/API404, health200 and private no-store. Final login's nine static assets totaled512,955 decoded bytes in the observed run. No email was sent by this smoke. A scan of60 local production browser files found no media secret or AES key value.

Three anonymous general-card requests from this workstation returned200, with response headers observed at2212/657/1166ms. These are observed request timings, not forced cold-start or p95 measurements. CDP measured33 completed requests/2,354,935 encoded bytes for an uncached general-card reload, open without animation with music enabled, and viewing the fifth gallery image; no event truncation. This does not include every optional full-resolution lightbox view. Cache override was reset afterward.

## Backup and restore evidence

Final backup `2026-10-21T17-00-12-238Z-fcca1578`: certificate-verified exported PostgreSQL snapshot,55 tables,39 private objects/3,875,910bytes,44 authenticated encrypted entries, complete AES ring/deployment configuration/migrations. Snapshot creation took29,652ms and authenticated every on-disk entry before marking complete. Files live under the owner's local Documents backup directory; key is separately ACL-restricted in the owner's `.dawat` directory.

Restored into an empty disposable local target, never the hosted source. Restore took2382ms, matched55 table counts/checksums and all39 downloaded object SHA256 values, and decrypted4 retained guest credentials for digest comparison. The restored app passed the complete HTTP journey: local-inbox OTP, seller MFA/manual activation, duplicate/concurrent command handling, two-owner isolation, private media/max-five/invalid-input checks, publication, scoped guest sessions, RSVP/wishes, corrections/history/CSV, pause/resume and rotation/revocation. No real external SMTP was used. It passed again after Docker network tightening.

A localhost URL alone did not prove Docker isolation: Docker Desktop initially published recovery ports on wildcard addresses. Added a dedicated bridge and a Windows-only scoped Docker CLI adapter that injects explicit127.0.0.1 mappings before creation. Verified both Docker published bindings and the Windows listener are loopback-only. Startup and restore refuse wildcard bindings; a failed startup stops only this recovery project and retains its volumes. Subprocess completion now waits for stream closure; regressions cover full dump output, killed subprocesses, ciphertext tamper/wrong keys, unsafe target, missing/substituted entries and wildcard ports.

Windows task **Dawat Local Encrypted Backup**, daily19:00, current-user Interactive/Limited, missed-start recovery, IgnoreNew overlap policy,15-minute cap: an actual scheduled run completed with `LastTaskResult=0`. No plaintext password is stored in task arguments. [Recovery instructions](../ops/local-recovery.md) explain status/lock repair and scope. Local-only is the owner's explicit choice: PC signed-in/Docker running are required; no offsite copy or guaranteed recovery point is claimed.

## Budget and scope limits

Netlify still showed Free/$0/no card,208.8/300credits remaining with six accounted production deploys. Two later published releases were not yet included in that delayed count, so reserve30credits: at most178.8 before subsequent usage. Stop routine publications now; documentation/operational-only commits skip Netlify. Guest capacity depends on actual images, views/revisits and shared provider quotas, not an invented unlimited guarantee. No paid fallback is enabled.

Supabase advisor findings were reviewed: intentional private default-deny tables and narrowly guarded guest/customer security-definer RPCs remain. Password-leak detection is not enabled for this OTP-only Free pilot. Current hosted project has no active staff, MFA factors or Vault secrets. The backup refuses MFA/Vault state until a platform-root-key recovery procedure exists. Hosted SMTP credential/project settings require private re-entry for a new-project disaster; DB export alone cannot recreate provider-managed signing keys.

The current own-account pilot is ready for the owner to enter real invitation details and send personal links. This evidence does not claim a human guest study, physical Android/iPhone/actual200%zoom qualification, unlimited traffic/availability, hosted operator onboarding, four-runtime extraction or completed public commerce. Those remain subsequent scope; a different customer's email must be assigned explicitly before handoff.

Latest additional encrypted snapshot: `2026-10-21T17-16-27-875Z-9b225656`, same55tables/39objects/3,875,910bytes,28,603ms, all44entries authenticated on disk. It uses the identical installed PostgreSQL17.11 image through a digest-pinned, port-free ephemeral runner, removing the dependency on a running development database. The fully restored/HTTP-qualified snapshot remains the17:00archive above; no newer archive is falsely labelled a separate completed restore drill. All262tests pass after this operational change.
