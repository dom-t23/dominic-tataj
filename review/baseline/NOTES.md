# Baseline (20 Nov 2026, `main` at 046b1e1 plus the IMPROVEMENTS.md retarget)

## Screenshots

- `<size>-<theme>-fold.png`: the first screen after load, fonts ready, page scrolled once top to
  bottom and back (so reveals have played and lazy figures have loaded).
- `<size>-<theme>-full-N.png`: the whole page, top to bottom in parts (N = 1, 2, ...), each under
  8192 device pixels: a single capture taller than that repeats the top of the page in
  software-rendered Chromium. **Capture caveats:** the capture forces
  `.sheet { content-visibility: visible }` so off-screen projects paint; the pinned Fig. 01
  (E-03's 3D drone) shows as roughly 2 to 3 screens of empty white panel, because on screen that
  height is the scroll track that turns the model while it is pinned under the nav. WebGL renders
  in software (SwiftShader).
- `scroll/<size>-light-NN.png`: what a visitor sees screen by screen when scrolling, for
  `phone` (375×812 @3x, 25 screens) and `laptop` (1440×900, 15 screens). Best for the 10 s and
  30 s tests.
- `phone-light-reduced-*.png`: phone with `prefers-reduced-motion: reduce`, captured straight
  after load with no settling scroll.
- Sizes: phone 375×812 (iPhone 13 metrics in Chromium, DPR 3, touch), tablet 768×1024,
  laptop 1440×900, desktop 1920×1080.

Regenerate: `REVIEW_OUT=baseline npx playwright test tests/review-capture.spec.js tests/review-metrics.spec.js --grep @screens`
(needs a server on 127.0.0.1:4173; on this machine `python -m http.server 4173 --bind 127.0.0.1`).

## Metrics (`metrics.json`)

Local server, no compression: "gz" is gzip of each body, an estimate of what GitHub Pages sends.

| | Phone, throttled (150 ms RTT, 1.6 Mbps, CPU ×4) | Desktop, unthrottled |
|---|---|---|
| First contentful paint | 1280 ms (budget 1200 ms; `npm test`'s run gave 1128 ms) | 256 ms |
| LCP | 1280 ms, `img.hd-still` (hero drone `images/hero/t16.webp`) | 256 ms, same element |
| CLS during load / after scrolling the page | 0.0001 / 0.010 | 0.003 / 0.004 |
| Requests before `load` | 20 | 20 |
| Bytes before `load` (raw / gz) | 256 KB / 137 KB | 271 KB / 152 KB |
|  of which HTML | 46.2 KB / 12.7 KB | same |
|  CSS (site.css + Google Fonts CSS) | 70.5 KB / 13.5 KB | 70.2 KB / 13.4 KB |
|  JS (12 modules) | 47.4 KB / 18.8 KB (budget 60 KB gz) | same |
|  fonts (4 woff2 from fonts.gstatic.com) | 82.6 KB | 97.6 KB |
|  images | 9.4 KB (hero still) | 9.4 KB |
| After scrolling the whole page | 43 requests, 1.78 MB | 77 requests, 2.27 MB (33 hero turn frames on desktop) |
| Console errors | none | none |

Largest lazy loads: three.js r170 plus addons and `models/frame.glb` (187 KB) when Fig. 01 is
near; the replay's flight index (`flights/index.js`) after load; the flight frames (0.5 to 1.6 MB)
only after LOAD.

## Tests before any change

`npm test` with the default parallelism: **73 passed, 7 failed**:
`frame3d.spec.js` (3: parts list picks, drag spring-back, reduced-motion views), `hero.spec.js`
(flies the course), `perf.spec.js` (first paint under 1.2 s), `replay.spec.js` (a flight that
fails to load), `rig.spec.js` (failsafe and crash). **All 7 pass when re-run on one worker**
(`--workers=1`): they are timing-sensitive under CPU contention on this machine (software WebGL,
throttled-CPU perf test), not regressions. The perf test is close to its limit (1128 ms of 1200).
