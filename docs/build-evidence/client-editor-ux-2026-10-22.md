# Client editor and household report — 22 October 2026

This release addresses repetitive draft-saving feedback, unclear wording fields, slow workspace transitions, broken-looking Bengali metric glyphs and household-list hierarchy. Existing customer text, invitations, household links, replies and storage are preserved; no hosted schema changes.

- Quiet debounced autosave retains exact snapshot acknowledgements, conflict recovery and deliberate retry after uncertain failures. Departure waits for pending saves and flushes newer typing; a failed save keeps the editor open. No save-success banner/timestamp on every keystroke.
- Ready Bangla invitation wording is editable on demand. Names, date/time and location remain customer inputs. Saved custom wording is preserved. Opening an editor alone does not write a draft.
- Workspace links use Next client navigation. Duplicate auth verification is removed within the same verified request. Guest reporting no longer loads the entire draft/editor entitlement bundle. The report RPC still enforces management access even for empty results; no cross-request private cache or privileged-key read is introduced.
- Heavy invitation previews load on demand. Background guest refresh keeps controls enabled and uses submitted filters, not incomplete search typing.
- Household table separates family/scope, response status, confirmed/allowed people, link state and actions. On mobile it becomes labelled cards. Selected-event reporting and cursor pagination remain server-authoritative. Local Bengali numeral font replaces the problematic metric glyph rendering.

Validation before deployment: **267 tests / 29 files** passed, including five added regression cases covering default/custom text, household status/filter refresh, departure during an in-flight save and failed-save departure. Optimized local QA build and complete synthetic local backend verification passed (OTP, isolation, save/publish, guest link/RSVP/wishes, max-five private photo processing, revocation and retained publication media). Local desktop, 390px and 320px browser checks caught and corrected a narrow mobile table caption; no horizontal document overflow observed. These are browser viewport checks, not claims of physical iPhone/Android testing.

Deployment and subsequent live read-only screenshots/results are retained in ignored `.artifacts/client-handoff/`. No original pilot content is rewritten for verification.
