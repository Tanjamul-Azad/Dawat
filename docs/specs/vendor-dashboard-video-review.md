# e-Nimontron dashboard — user-supplied video review

Reviewed **19 October 2026 · Asia/Dhaka**. This supersedes the earlier statement that no dashboard UI evidence was available. We now have a vendor-supplied recording forwarded by the user, not authenticated hands-on access.

## Evidence and provenance

- [Archived source video](../reference-evidence/vendor-dashboard-video/source.mp4): 4,447,657 bytes; 22.47 seconds; 576 × 1296; H.264 at 30 fps; no audio stream detected.
- SHA-256: `9fb7ca04c5827c60c55e07b69a7f96a5ef529ecec081e26add6384e589d0f8f4`.
- [Contact sheet 1](../reference-evidence/vendor-dashboard-video/contact-sheet-1.jpg), [sheet 2](../reference-evidence/vendor-dashboard-video/contact-sheet-2.jpg), [sheet 3](../reference-evidence/vendor-dashboard-video/contact-sheet-3.jpg). Twenty-two sampled frames cover approximately 0.5–21.5 seconds; timestamps are approximate, not frame-exact interaction logs.
- The browser address visibly begins with `e-nimontron.com/dashb…`; the full path, query parameters and access credentials are not established. Do not guess or visit a dashboard URL from the partial address.
- Recording shows a mobile host dashboard scrolling through replies and wishes, then returning to the top. No login, form submission, delete, download or management edit is demonstrated.
- Guest names, messages and personal photographs in the recording are reference evidence, not our fixture data or licensed product assets. Do not reproduce them in our product/demo or public marketing.

## Vendor offer reported by the user

The user says the vendor offered **BDT 600 for the dashboard and unlimited invitations**. This is a direct vendor quote relayed by the user, not a price verified on a public pricing page or shown in the video.

“Unlimited invitations” remains ambiguous: it may mean sharing one invitation with unlimited recipients, unlimited RSVP responses, or multiple distinct wedding cards. The recording does not resolve it. Do not describe this as unlimited weddings, unlimited photo storage or lifetime hosting. Hosting duration, customization allowance, support, payment terms and whether BDT 600 includes card design remain unverified.

Our package price is still undecided. Do not overwrite our pricing configuration with BDT 600. A reasonable proposed model is one wedding workspace/invitation with no per-share charge, separately defined hosting, media and abuse limits; this is our proposal, not proof of the vendor's terms.

## Screen-by-screen inventory

| Approx. time | Visible UI | Evidence limit |
|---|---|---|
| 0–2s | Branded header, EN/বাংলা controls, “Host dashboard”, wedding/couple title, “45 RSVPs · 15 wishes” | Language controls visible; translation behavior not exercised |
| 0–3s | “Download Memory Book” plus text describing a printable keepsake of every wish, photo and RSVP; asks user to choose “Save as PDF” in the print dialog | Button and explanation visible; no click or generated output |
| 0–3s | Four summary cards: 44 Attending, 115 Total guests, 0 Maybe, 1 Declined | Recorded values, not independently reconciled against a database |
| 3–10s | “Replies / Who’s coming”: vertical rows with status icon, respondent/family name, guest count or “Cannot attend”, and date | No visible edit, export or search interaction; chronological presentation appears newest first |
| 10–19s | “Wishes / Blessings & messages”: author, date, long text/emoji, optional photo, Delete control | Delete control is visible; confirmation, authorization and deletion behavior not tested |
| Throughout | Ivory/cream paper background, deep green cards, gold accents, serif headings, compact sans-serif labels, sticky-looking header and floating WhatsApp button | Visual pattern only; sticky behavior inferred from header remaining visible while scrolling |
| 19–22s | Scroll returns to the overview | No demonstrated route/login/session change |

## What the numbers mean

The recording displays `45 RSVPs = 44 attending + 0 maybe + 1 declined`. “115 total guests” is a different quantity from the 44 attending response records. It likely sums party sizes for accepted replies, but the exact calculation was not tested. Do not claim 44 individual attendees or 115 families.

**Maybe is not Pending.** Maybe means an explicit tentative answer; Pending means no answer from a known invitee. The video shows a Maybe card, not an unanswered-invite list. It provides no evidence that the vendor knows who has not replied.

The visible dashboard is primarily an overview of replies and wishes. It does not establish all the management controls described in our own spec. Search/filter, CSV export, adult/child split, multiple-event filtering, household allowance, RSVP corrections, invitation editing, deadlines, revocation, collaborators and audit history remain our proposed functionality unless separately evidenced.

## Our design after this evidence

Keep the original desktop/mobile overview mockups as our extended management design. Add a simple host view for clients who only want replies and memories:

```text
Brand                               বাংলা / English
Host dashboard
Wedding title             Response count · Wish count
View invitation   Copy guest link   Print memory book

[Expected people] [Accepted replies] [Declined] [No reply*]
Optional: Maybe replies, only if that response is supported
*Only available with a known guest list

Replies
Event / attendance filters / search
Name or family · answer · total people · last update
Open details → message/history/permitted owner actions

Private wishes
Author · date · message · optional private photo
Remove wish → confirmation → audited removal
```

The private host view should be useful without entering the full builder. Retain distinct guest and owner links, verified owner access and clear data freshness. Do not add a public admin button to the guest card.

Use our original visual identity and illustrations; do not recreate the vendor's logo, couple names, photos or wish text. The previously created wireframes are proposals, not this vendor recording or an exact feature-equivalent screen.

## Reference-parity additions to plan explicitly

The existing paid-launch RSVP/client workspace remains as specified in [plan](../../plan.md) and [client dashboard](client-dashboard.md). This new evidence adds the following concrete Growth targets; do not market full parity with the recorded memories experience until they pass acceptance:

### G10 — optional private photo wishes and removal

An independent wish can have one optional image. Attendance does not change when a wish is submitted, removed or hidden. A wish photo is private by default and is separate from the couple's public gallery. Public guestbook is a separate opt-in feature, not proven by this recording.

Proposed implementation: extend `private_wishes` with `photo_asset_id nullable`, `deleted_at`, and lifecycle state; preserve tenant linkage. Use the existing managed-media pipeline with server-verified MIME/size, image decoding/re-encoding, EXIF removal, private storage, scoped read URLs and cleanup of abandoned uploads. Proposed starting limit: one JPEG/PNG/WebP up to 5 MB, explicitly a product default, not a vendor limit. No public object URLs or client-supplied cross-wedding asset references.

Owner deletion uses a confirmation naming the wish, an authorized mutation and audit record. Removed content stops appearing in list/print immediately. Physical image cleanup follows retention policy. The user sees success only after server confirmation; failures preserve the visible record with retry. Do not silently delete RSVP when deleting a wish.

Proposed extension contracts: wish creation accepts a ready scoped `photo_asset_id`; owner-only `DELETE /weddings/{id}/wishes/{wishId}` soft-removes a scoped wish. Existing guest wish access never allows listing or deleting other wishes.

### G11 — private printable memory book

Owner-only `/weddings/{id}/memory-book` prepares a print-friendly snapshot of wedding title, selected event scope, summary definitions, RSVP rows and wishes/photos. Default labels specify whether all events or one event is included. Private notes/contact fields are excluded unless explicitly selected; no phone/email by default.

Start with browser print/Save as PDF, matching the visible explanation. This is distinct from invitation-image/PDF export in G07 and from a promise of server-generated PDF downloads. Show a preview and Print/Save as PDF action. Fetch all selected data, not only the visible pagination page; pin the generated snapshot timestamp so totals and list agree. Wait for images/fonts or display a clear fallback before printing. Use A4 print styles, readable Bangla, sensible breaks, image aspect ratios and hidden navigation/buttons. Block unauthorized access and avoid public caching/indexing of the printable view.

### G12 — explicit Maybe response, if enabled

Keep launch accept/decline behavior. A later configurable Maybe option requires schema/API/UI/localization changes as one feature, not a dashboard-only card. Store an explicit response status; show tentative party size separately; exclude it from confirmed expected people; keep Pending distinct. Owner/guest edits and exports must use the same rules. The reference only demonstrates the zero-valued summary card, not a tentative response submission.

## Checks before claiming equivalence

- Response-record counts and attendee headcounts have distinct labels and correct scope.
- Explicit Maybe, unanswered Pending and Declined remain separate.
- A wish/photo submission or removal never alters RSVP or attendance totals.
- Another wedding cannot read, attach, delete or print a private wish/photo.
- Memory book includes all selected records beyond the first page, handles long Bangla/emoji and missing photos, and matches its snapshot totals.
- Cancelled deletion has no effect; failed deletion retains content; successful removal disappears from future print views.
- A visible vendor button is documented as visible, not as tested backend functionality.
- No BDT 600/unlimited-weddings/lifetime-hosting claim is made about our service without an explicit commercial decision.

No competitor login or backend was accessed. No messages, payments, guest submissions or deletions were performed during this review.
