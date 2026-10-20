# Physical phone run sheet — v6.1

**v6.4 follow-up,20October:** latest build also needs physical listening/music checks. Before opening, no sound/download should start. Open deliberately; confirm soft playback or a truthful manual-play prompt in Chrome/Safari. Pause/resume from the header and after scrolling, return to the top and check it does not cover language buttons, background/return without unexpected audio restart. Check byte-range playback on the private-network sample; recording credit is available in closing. The compact/current browser checks are in [v6.4 evidence](../build-evidence/compact-music-v6-4.md). Physical completion is still not recorded.

19 October 2026. User has both Android and iPhone. **Not yet executed on either physical phone.** A desktop viewport or synthetic mobile user-agent is not sufficient evidence.

## Open this build

Keep this computer awake. Connect the phones to the same router/Wi‑Fi as the computer (computer Ethernet on that router is fine).

- Bangla + timing capture: http://192.168.0.120:3001/invite/?lang=bn&qa=performance
- English + timing capture: http://192.168.0.120:3001/invite/?lang=en&qa=performance
- Normal presentation without QA controls: http://192.168.0.120:3001/invite/?lang=bn

Use Chrome on Android and Safari on iPhone. The server is bound only to this computer's private interface. It serves the invitation and static assets; owner routes return 404. It is not a public deployment. If it does not load, first report the exact browser error and whether both devices are affected. Do not disable the firewall, bypass a security warning or install a certificate to force it open. Network isolation/firewall may require a separate approved connection method.

## Execute on each phone

1. Use a new private/incognito tab for a fresh sample. Record phone model, OS version, browser version, orientation and Wi‑Fi. Do not use real guest information in the sample.
2. On the closed cover, swipe down and open the same URL with `#rsvp` appended. Only the named exterior should be readable. No events, photos, reply form or bottom chapter nav should be visible. The seal must be deliberately activated.
3. Tap the seal once, then try rapid repeated taps on another fresh load. Watch the whole opening: no white flash, cut-off text or doubled action. With the device's Reduce Motion/Remove Animations enabled, a deliberate open should reveal immediately. Restore the user's original motion preference afterwards.
4. Scroll naturally through names, welcome, date ribbon, countdown, both events and photos. Expand/fold the ribbon; rotate landscape and return. Check long text does not clip and horizontal scrolling is absent. Increase browser text size temporarily; restore it afterwards.
5. Open/close a map; use directions to leave for Maps and return. Calendar may open a native calendar/import UI: inspect the fictional sample details without adding an event to a personal calendar. On HTTP, address-copy may offer the visible-address fallback; this is expected, not a data-loss failure. Production is HTTPS.
6. Open a photograph, go next/previous, close it; confirm scrolling resumes and the reader controls remain usable. Try the phone Back gesture while a dialog is open and record the behavior.
7. The reply is already addressed to Sabbir & Family. No name field should exist. Submit accepted with `২` adults and `১` child, confirm receipt says ৩ people. Edit to decline, confirm no people counted. Change the event and return: replies/drafts should remain scoped. Try one over-allowance count and ensure a useful error appears without losing the answer.
8. Open the keyboard in the optional visit note and in “বর-কনের উদ্দেশে আপনার বার্তা.” Check no auto-zoom/covered submit button or obstructing bottom nav. Send a fictional wish; it must identify the couple, not ask for guest identity. Reload, reopen and verify the sample reply remains. Private browsing may discard it when the private session closes.
9. Background the browser for 20 seconds, return and check countdown recovers, no auto-open occurs on a fresh closed load, and the open card remains usable. Test a photo load/network failure with the existing readable fallback. Do not treat a LAN page reached over Wi‑Fi as a real 4G/carrier cold-load test.
10. Expand **Performance QA → Capture performance report → Download report**. Save one JSON per phone and return both with model/browser versions and any failed step. If an API is unsupported (especially event timing), the report will show missing data; record that instead of claiming a pass. The overlay can be omitted with the normal URL for screenshots.

## Evidence ledger

| Device | Model / OS / browser | Reachable | Opening / motion | Photos / Maps / calendar | Keyboard / RSVP / wish | JSON | Status |
|---|---|---|---|---|---|---|---|
| Physical Android | awaiting user | pending | pending | pending | pending | pending | **unqualified** |
| Physical iPhone | awaiting user | pending | pending | pending | pending | pending | **unqualified** |

Separate release blockers: slow-mobile lab LCP currently 3.46s against a 2.5s goal; production HTTPS/cache policy, field INP/p75, customer backend/auth/tenancy and shared cross-device replies are not certified by these local samples. Full lab findings: [qualification report](../build-evidence/template-qualification-v6-1.md).

To restart the narrowly scoped phone server from `web/`, using this computer's current private address:

```powershell
$env:DAWAT_PREVIEW_HOST='192.168.0.120'
$env:DAWAT_PREVIEW_PORT='3001'
npm run preview
```

Stop that server with Ctrl+C when the phone session is finished. Keep ordinary local review separate on `127.0.0.1:3000`.
