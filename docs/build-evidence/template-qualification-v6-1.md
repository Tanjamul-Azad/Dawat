# Jamdani v6.1 — couple-owned wording and measured mobile qualification

19 October 2026. This supersedes the v6 statement that performance had not yet been measured. **Lab qualification is recorded; the 2.5-second LCP target and physical Android/iPhone sign-off are still open.** No physical-device pass is inferred from a desktop viewport, a user-agent string, or Lighthouse's device label.

## Product corrections

- The guest invitation is signed by the two partners and their families. Removed the fictional studio signature and its outbound home-page link. Both cover and closing identify the couple as senders.
- Wishes show the couple's current localized names. The message label is “বর-কনের উদ্দেশে আপনার বার্তা” / “Your message to the couple.” RSVP's separate optional note asks about preparations for the visit. Neither form asks for the guest's name.
- Pinterest ideas and access limits are preserved in [the research record](../design/pinterest-gift-reveal-v6.md): burgundy/ivory stationery, vellum-like concealment, a wax-seal gesture, named recipient/sender, and a continuous coordinated paper composition. No new claim of viewing a complete Pinterest board or animation is made. Original art remains in use.

## Changes made from measured findings

1. The invitation gets a dedicated client entry instead of loading the storefront/order/editor entry. Existing guest domain logic and isolated sample storage are retained.
2. The large inner garden is requested only after a deliberate opening starts; inner chapters still mount only when opening finishes. Closed navigation does not request gallery photos or Google Maps. The exterior vine is discovered/preloaded from initial HTML.
3. Initial HTML draws the sealed folio while personal data initializes. Its preparation placeholder is replaced by the resolved recipient content; no fabricated recipient or actionable opening is shown before resolution. This avoids a blank loading screen and an observed placeholder movement.
4. Fraunces remains the English display face, at the used 400 weight; its unused italic preload is removed. Bengali headings retain Noto Serif Bengali: licensed static 400/500 instances replace the full 100–900 weight asset. The used 400 file falls from 191,564 to 58,684 bytes without removing Bengali shaping/glyph coverage. Source, regeneration notes and OFL license are retained. Instrument Sans/Hind Siliguri remain the UI faces.
5. Local preview now negotiates gzip for text assets, includes `Vary` and correct HEAD lengths, and retains no-store to keep iterative previews current. Production CDN cache policy is a separate requirement. The baseline was uncompressed, so the total improvement includes this server change; it is not attributed entirely to component refactoring.
6. Added an original neutral seal favicon and invitation-specific metadata. Removed the initial favicon 404.
7. Phone-preview HTTP exposed a real corner case: `crypto.randomUUID()` requires a secure context. Wishes now use cryptographic `getRandomValues()` for local IDs when randomUUID is unavailable. An integration test covers this branch. Production IDs/access remain server responsibilities. [MDN randomUUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), [MDN getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues).

## Repeatable navigation measurements

Local optimized static export, Chrome 155 headless isolated audit profile, Node 22.18.0, Lighthouse 12.8.2 (compatible with this installed Node). Lighthouse 13 requires a newer Node patch. Cold runs, default mobile simulation: 412 × 823 CSS pixels, 4× CPU slowdown, simulated 150ms RTT / 1638.4Kbps throughput. These are synthetic desktop lab results, not a physical Moto G or live Bangladesh carrier measurement. [Official Lighthouse CLI](https://github.com/GoogleChrome/lighthouse/blob/main/readme.md), [throttling explanation](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md).

`performance-v6-1/summary.json` contains three runs per language; full HTML/JSON reports and intermediate measurements are retained alongside it. The navigation reports intentionally measure the closed entry, not the whole invitation after opening.

| Metric | Initial Bangla baseline | Optimized Bangla, median of 3 | Optimized English, median of 3 |
|---|---:|---:|---:|
| Performance | 75 | 91 | 91 |
| Accessibility (closed entry only) | 100 | 100 | 100 |
| Best practices | 93 | 96 | 96 |
| FCP | 1.5s | 1.36s | 1.36s |
| LCP, simulated | 10.21s | 3.46s | 3.46s |
| TBT | 20ms | 11ms | 11.5ms |
| CLS | 0 | 0.0034 | 0.0021 |
| Total cold transfer | 1,572KiB | 544KiB | 439KiB |
| Guest scripts, transferred | see original report | 190KiB | 190KiB |

Initial critical transfer ≤1MB and transferred guest JS ≤200KiB budgets pass on the sample; repeat-run scores are stable. CLS ≤0.1 passes. **LCP ≤2.5s does not pass** in this slow-mobile lab profile. TBT is not INP. No field p75 or full open-content accessibility score is claimed. No-store makes the local back/forward-cache best-practice check fail; the production cache/security/header configuration has not been audited here.

The remaining LCP work should target the actual data-aware initial render, critical heading/font scheduling and route-shared resource chain, then repeat these same cold runs. A production per-wedding renderer should resolve locale and recipient server-side before serving the correctly addressed closed cover. Do not trade away named guest correctness, readable Bengali or the explicit open gate to chase a score. Field performance will still need evidence after a real deployment.

Reproduce from `web/` (audit tool is isolated under ignored research tools, not an application dependency):

```powershell
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
node ../.research-tools/performance/node_modules/lighthouse/cli/index.js 'http://127.0.0.1:3000/invite/?lang=bn' --chrome-flags='--headless --disable-extensions' --only-categories=performance,accessibility,best-practices --output=json --output=html --output-path='../docs/build-evidence/performance-v6-1/repeat-bn' --quiet
```

## Actual interaction recording, desktop mobile viewport

The opt-in `?qa=performance` mode dynamically loads a local observer. Ordinary guest links do not download it. It records no guest names/messages or personal URL parameters and sends no telemetry. It exposes a visible JSON report and download button for use on phones. Unsupported timing APIs are listed rather than treated as zero/passing. Event durations ≥16ms are observed; `maxObservedInteractionMs` is a sample maximum, not a complete/field INP calculation. [Chrome's INP tooling distinction](https://developer.chrome.com/blog/inp-tools-2022).

At 390 × 844, DPR1, desktop Chrome155, no CPU/network throttling:

| Recorded interaction sample | English | Bangla |
|---|---:|---:|
| Opening duration | 1800ms | 1800ms |
| Opening frame p95 | 6ms | 6ms |
| Observed opening intervals >50ms | 0 | 0 |
| Largest observed interaction | 24ms | 32ms |
| Recorded long tasks | 0 | 0 |
| Observed CLS | 0.0003 | 0.0031 |

This machine's high-refresh rendering is not a claim about phone FPS. English recording covers opening → date ribbon → map disclosure/hide → photo next/close → Bengali numeral RSVP (2+1) → couple wish. Bangla recording covers opening → previously saved reply → edit/decline → couple wish. All sample images loaded. The external Google map was invoked, but external map tiles/network reliability and leaving/returning through native Maps remain phone checks.

Evidence: `performance-v6-1/interaction-en-390.json`, `interaction-bn-390.json`, and the cover/wishes/closing screenshots. Tests: **70 pass**, strict typecheck and optimized export pass. Tests include closed/no-inner-media gating, pending-personalization gating, couple/family signature, named wishes, and the HTTP randomUUID fallback, in addition to v6's existing cases.

## Physical Android and iPhone status

The user confirmed both phones are available. No ADB/iOS device or remote phone-screen control is attached to this computer. A private-network invitation-only sample server is running at `192.168.0.120:3001`; dashboard, studio and operator requests return 404. No firewall, certificates, network profile or router settings were changed. The ordinary localhost preview remains on 3000. Phone reachability and both physical-device results are awaiting the user; neither is marked passed.

Follow the concrete [phone run sheet](../qa/physical-phone-v6-1.md). The network address can change with DHCP. This is a local static sample: replies remain in each phone browser separately. It cannot demonstrate production cross-device customer data, delivery, authentication or shared RSVP persistence.
