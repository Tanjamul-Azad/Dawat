# Host dashboard: first product-design pass — 2 November 2026

The owner asked to begin the dashboard and to use an ImageGen product mockup first, then faithfully implement it. The earlier owner stationery image and the documented vendor dashboard recording supplied the art direction. Competitor names, personal photographs and messages were not reused.

## Scope and implementation

The first screen covers the wedding identity, quick actions, event-scoped guest report and guest/reply table. The host workspace frame now uses a forest-green sidebar, warm ivory surfaces, burgundy actions and antique-gold rules. The existing overview/editor route also receives the same wedding identity banner.

- The generated UI reference is [the desktop product mockup](references/dashboard-product-mockup-2026-11-02.png).
- The original generated banner is [archived here](references/dashboard-garden-banner-source-2026-11-02.png).
- HostDashboardHeader and HostReportSummary are shared presentation components used by the real GuestHub and the local synthetic preview.
- WeddingIdentityBanner also renders in WeddingDesk overview.
- Household creation, bulk entry, WhatsApp sending, shared-link settings, event/filter requests, pagination, corrections, CSV export and private wishes remain owned by the existing production components.
- Shared-link settings open from their action tile. No API, authentication, schema, price or policy change was made.
- The mockup's unsupported email-delivery helper was replaced with truthful WhatsApp wording. No Memory Book, Maybe status or photo-wish capability was added.
- On phones the four quick actions become a two-column grid, report metrics become two columns, existing guest rows become family cards, and the support link moves below the content so it cannot obscure actions.
- Keep practical text readable rather than reproducing the mockup's smallest typography.

This is the first host dashboard design pass, not a claim that all editor, order, login, admin and public-site screens have been redesigned.

## Local review

The local-only route is /design/dashboard/. It is available only with DAWAT_LOCAL_QA=1, APP_ORIGIN=http://127.0.0.1:3102, and the loopback Supabase URL. It renders synthetic data without calling APIs or sending messages. Production workspace routes retain their authentication.

The preview supports language switching, event selection, searching, status filtering, expanding household details, private-wish viewing, an in-memory sample household form and copying the actual sample-invitation URL. Operations requiring the real account open a clearly labelled preview explanation. Sample state resets on reload.

Initial fictional reception fixture: 8 invitations = 3 accepted + 1 declined + 4 unanswered; accepted replies total 8 people = 6 adults + 2 children. These are review fixtures, never marketing statistics.

## Artwork

Built-in ImageGen was used for both images; no CLI fallback or new runtime package was needed. The generated screen is an implementation reference, not a flattened screenshot used as a functioning UI. Names, dates, controls, counts and table data are real HTML.

Public derivatives: dashboard-garden-banner-v1-1536.webp and dashboard-garden-banner-v1-768.webp in web/public/artwork/. Mobile uses a garden-focused crop with an ivory fade. The existing generated rose botanical cutout supplies the sidebar decoration. The garden scene is fictional decorative art and does not claim to show the host's actual venue.

Typography reuses the locally hosted Cormorant face for the banner and editorial headings, existing Noto Serif Bengali for Bengali headings and existing UI fonts for labels, forms and data. The Dawat lotus and wordmark remain the existing brand component.

## Verification

TypeScript passed. The complete single-worker suite passed: 58 files, 474 tests. Existing tests exercise household creation, save-and-add-another, duplicate checks, pagination, applied-filter exports, deliveries, sending and draft-navigation protection.

Browser QA includes desktop and 320/390px phones, both languages, no page-level horizontal overflow, long Bengali household names, the sample add/edit dialog, count updates and shared-link disclosure. The optimized local production build and formatting passed. Runtime HTTP checks returned 200 for the local QA preview and 404 with the QA flag disabled; the temporary guard-check server was stopped afterwards. Screenshot evidence is under the ignored `.artifacts/dashboard-design/` directory. No authenticated live-backend mutation was exercised with Docker off.

No database reset, Docker startup, deployment, publishing or external messages are part of this work.

## Exact ImageGen prompts

### Desktop UI mockup

Use case: ui-mockup.
Asset type: a polished high-fidelity desktop product dashboard design, straight-on actual web UI, 1536x1024 landscape, no device frame, no browser chrome, no perspective, no photographic desk.
Primary request: Design the private host dashboard for "dawat.", a premium Bengali wedding invitation product. Use the supplied visual reference as the art direction: botanical wedding stationery translated into a genuinely usable app. Rich forest-green sidebar, warm ivory canvas, burgundy primary actions, fine antique-gold details, cream paper panels, crisp dark readable text. Beautiful bespoke product design, warm, editorial and luxurious, with careful alignment and space. Not a generic SaaS dashboard.
Reference image: the supplied dawat laptop-and-phone illustration is for palette and botanical wedding mood only. Do not reproduce devices or its tiny illegible UI. Actual screen should have large readable type.
Composition: Left full-height sidebar 220px wide with cream "dawat." serif wordmark at top and small "YOUR WEDDING SPACE". Navigation with fine line icons: "Overview", "Edit invitation", selected "Guests & replies", "My weddings", "Help & contact". A restrained original hand-painted garden floral sprig at the bottom.
Main content right: thin top bar with "A little organisation. More celebration." at left, "English / বাংলা" and a small account circle at right. Below a heading "Your celebration" and quiet supporting sentence. A wide shallow illustrated wedding identity banner with a hand-painted Bengali garden pavilion and leafy garden softly fading into cream at the left edge, burgundy elegant serif title "Mehrin & Arib" at center, "12 December 2026 · Dhaka" underneath, and muted burgundy and ivory floral corner at far right. No large couple photo. Banner should look like beautiful stationery, not a flat rectangular stock image.
Next a refined action strip of four equal clickable tiles with small line icons, short labels and tiny helper text: "Add household", "Send invitations", "Shared invitation link", "Edit invitation".
Next the event selector "The Reception" beside a small green "Replies open" badge. Four summary cells: "Invited households" 8, "Accepted" 3, "Declined" 1, "Awaiting reply" 4. Mix forest-green and warm ivory elegantly, large readable serif numbers and practical sans-serif labels, no charts. A clear slim note "8 confirmed people · 6 adults + 2 children". These are fictional sample values, never customer metrics.
Lower main panel: elegant "Guests & replies" heading, tabs "Invitations & replies" and "Private wishes", search field, "Export CSV" button. A readable table with columns "Household", "Reply", "People", "Invitation" and 3 sample rows: "Sabbir & Family" Accepted 3 Viewed; "Nabila & Omar" Accepted 2 Sent; "Farhana & Family" Awaiting reply — Not sent. Use softly tinted semantic status pills, thin cream-gold rules, natural row heights. Keep all data highly legible.
Typography: restrained Cormorant-like serif for wedding names and page/section headings; clean elegant practical sans-serif for buttons, labels, navigation, table content. No script fonts in forms or data. Realistic 14-16px minimum supporting text at desktop viewing size, body about16px. Rich design comes from composition, fine paper surfaces, carefully placed botanical painting and colors, not from excessive decoration.
Avoid: floating laptop mockups, wedding invitation card posing as the dashboard, glassmorphism, gradients on every tile, big rounded generic metric cards, bright neon, purple, blue, charts, fake notification counts, fake reviews, payment/price promises, memory-book/Maybe features, irrelevant features, flowers behind table rows, illegible small type, excessive shadows. Every row and action must fit the available space without crowding. The result should be a convincing premium web product screenshot that can be faithfully implemented in HTML/CSS.

### Banner artwork, extracted/reconstructed from the mockup

Use case: precise-object-edit.
Input image: the attached generated Dawat host-dashboard UI mockup, used as an art reference and extraction target.
Create a standalone production decorative banner artwork from the illustrated wedding-identity banner in that UI. Remove EVERY UI element and all text, numbers, symbols, separators, buttons and interface frames. Reconstruct the background behind removed names.
Preserve the same exquisite traditional botanical gouache/watercolor painting: on the left 36 percent an ivory Bengali garden pavilion with graceful arches and a small domed green roof among leafy trees, palm fronds, burgundy/white flowers and a still water garden; softly fade the edges into warm ivory. The central 45 percent is quiet warm ivory paper with very subtle natural painted texture and ample clean space for HTML names. In the upper-right 19 percent an elegant original corner arrangement of burgundy and ivory flowers with fine olive green branches, flowing lightly along the top and right edge. The text-safe central area must remain unpainted and readable. Rich forest green, burgundy, cream and muted antique gold; refined luxury Bengali wedding stationery. Flat straight-on illustration, not photographic. Landscape banner aspect ratio 3:1, high resolution. Scene fills the rectangular canvas edge to edge, no devices or outer margin.
Do not paint text or any Latin/Bengali letters anywhere. No logos, no people, no UI, no mockup, no frames, no border, no watermark. The garden is decorative fictional art, not a claimed photograph of a real venue. Match the supplied generated banner's painting quality and palette closely.

