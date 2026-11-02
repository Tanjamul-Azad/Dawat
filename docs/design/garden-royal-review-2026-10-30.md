# Garden Vows / মায়াবন — first complete design review

Local preview: http://127.0.0.1:3102/demo/?template=garden&lang=bn

Only the existing Garden template was redesigned. The other five templates, public website and dashboards remain outside this design pass. Nothing was deployed or pushed. No database migration, database reset or Docker startup was needed.

## Experience

An emerald botanical folio opens into an ivory arch invitation. A personal letter flows through a softly blended illustrated garden into the save-date and countdown scene. Framed ceremony cards, an arched photo gallery, an emerald RSVP, private wishes and the botanical closing complete the invitation. Shared ivory, sage, emerald, antique-gold and burgundy ink connect the chapters; the owner's feedback about continuous blending is included.

All names, dates, host wording, personal messages and guest limits come from the existing invitation data. The new Garden components contain presentation only; existing event filtering, response transport, validation, calendar, maps, photo viewer, music, language and motion controls are reused. Sample reset now retains the selected template.

Artwork assets, exact built-in Imagegen prompts and source inspiration: [artwork record](garden-royal-artwork-2026-10-30.md).

## Verification

- Optimized local production build: passed after the final styling change.
- TypeScript: passed.
- Full test suite: 56 files, 445 tests passed before the final reset regression was added.
- Final focused invitation regression run: 2 files, 49 tests passed, including all four new Garden tests.
- Prettier and `git diff --check`: passed.
- Browser widths: 375×812 and 390×844 mobile previews; 1280×720 desktop. No horizontal overflow; desktop event cards occupy two columns, mobile cards one column.
- Both Bangla and English were visually inspected. Cover opening, continuous garden/date transitions, event cards, photo section, RSVP, wishes and closing were reviewed.
- Browser checks: over-limit response rejected; 3 adults + 1 child accepted; receipt and edit flow; separate declined Nikah reply; sample wish confirmation; photo viewer next/close; address copy; Google Maps target; downloaded calendar contents and Bangladesh-time conversion; closing music attribution disclosure.
- New production-preview browser tab had no console errors during inspection.
- Component regressions cover closed/open chapter mounting, Bangla switch, guest-only event/date scope, no-photo fallback, remote response/wish transport and retaining Garden after resetting sample replies.

Browser submissions used fictional local sample data. Remote RSVP transport was exercised through component tests; no live customer invitation or hosted database was used for this visual pass.

Local screenshots are under `.artifacts/garden-royal/` (ignored QA artifacts). The browser preview remains the complete interactive review surface. Restart it from `F:\Projects\Wedding Card\web` with `npm run qa:preview` if the local preview process is closed.
