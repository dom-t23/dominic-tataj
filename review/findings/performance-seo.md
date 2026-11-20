# Performance and SEO review: Dominic Tataj portfolio (performance-seo)

## Method

I read `review/BRIEF.md`, `DESIGN_PLAN.md` (§0.3 budget, Phase R, §5 gates), `IMPROVEMENTS.md`, `README.md`,
`review/baseline/NOTES.md` and `metrics.json`, then the `<head>`, script and image markup of `index.html`,
`css/site.css` and the loaders in `js/` (`main.js`, `sheets.js`, `reveals.js`, `theme.js`, `frame3d-boot.js`,
`hero-drone.js`, `replay.js`, `motion.js`). All measurements are my own, with Playwright and Chromium against the
running site (`http://127.0.0.1:4173/`), using the same profile as `tests/perf.spec.js`: iPhone 13 metrics,
150 ms RTT, 1.6 Mbps down, CPU ×4 through CDP, cache disabled, a fresh context for each run. I ran each
measurement at least 3 times and report the median, because seven other reviewers were sharing the CPU at the
same time. Scripts and outputs are in `review/scratch/performance-seo/`:
- `measure.cjs`: FCP, LCP element, CLS sources, long tasks/TBT, request weight, plus a full-page scroll.
- `fonts.cjs`: font arrival compared with first paint.
- `trace.cjs` and `layout-args.cjs`: a Chrome trace of the main thread up to first paint.
- `nav-shift.cjs` and `sheet-shift.cjs`: reproductions of the CLS sources.
- `raf.cjs`: rAF callbacks per second at each section.
- `idle-loads.cjs`: what downloads when the visitor doesn't scroll.
- `img-encode.cjs`: WebP re-encode sizes from Chromium's canvas.
- `gzip-server.cjs`: a scratch static server on port 4199 that gzips like GitHub Pages, used to estimate production FCP. I stopped it afterwards.

I also opened `og-image.png`, `apple-touch-icon.png` and `favicon.svg`. I did not edit any site file.

## Scores

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| First-load weight | 7 | First load is lean: 18.8 KB gz of JS (budget 60 KB) and 137 KB gz in total. But a laptop that never scrolls still pulls 1.9 MB in 8 s (three.js, the model, the robot masks). |
| LCP | 7 | The LCP is a 9.4 KB WebP that arrives about 500 ms early. LCP = FCP: about 0.9 s with gzip, 1.3–1.8 s on the local uncompressed server. CSS plus the first layout gates it, not the image. |
| CLS | 5 | The median is about 0, but slow phone loads intermittently shift 0.188 (the theme button reflows the nav) and 0.541 (a project panel while scrolling). Both are far over 0.05. |
| Font loading | 5 | Three families come from render-blocking third-party CSS with no preload: 4 woff2 files (83 KB), a ~0.5 s FOUT, and no metric-matched fallbacks. |
| Images | 7 | Good: WebP hero, width/height on every `<img>`, lazy photos. But a 162 KB PNG mask is ~70% heavier than needed, and photos are JPEG only. |
| Lazy-loading and main thread | 6 | Lazy imports and on-screen-only loops are mostly right. But the replay's rAF loop runs off screen, three.js mounts unprompted on desktop (140–160 ms long tasks), and the robot masks load at `load`. |
| Metadata and SEO | 5 | The basics are present (lang, title, description, canonical). The title is weak, and the description, OG description and hidden `<h1>` still say mechanical first. theme-color is static. |
| Social cards | 3 | `og-image.png` is the pre-Phase-R drawing-set design and says nothing about target roles, availability or right to work. That matters because recruiters often arrive from a LinkedIn link. |
| Structured data | 1 | There is no JSON-LD at all: no `Person`, no `ProfilePage`. |
| **Overall** | **5** | The engineering of first paint is good. What a recruiter or Google sees before the page opens (card, snippet, structured data) is out of date or missing. |

## Measurements

Profile "phone" = iPhone 13 metrics in Chromium, 150 ms RTT, 1.6 Mbps, CPU ×4. "Local" = the python
http.server on :4173 (no compression, as in `npm test`). "Gzip" = the same files from my scratch gzip server, an
estimate of GitHub Pages. Medians of 3 runs unless stated. Raw data: `review/scratch/performance-seo/measure-*.json`.

| Metric | Budget (§0.3) | Phone, local | Phone, gzip | Desktop 1440×900, unthrottled |
|---|---|---|---|---|
| First contentful paint | < 1200 ms | **1412 ms** (6 runs: 1188, 1296, 1412, 1760, 1896, 2404); a quieter batch in `fonts.cjs` gave 1268 (1212–1304) | **900 ms** (868, 900, 1144) | 300 ms (268–452) |
| LCP and element | – | = FCP in every run; `img.hd-still` (`images/hero/t16.webp`, 9.4 KB, 346×261 CSS px) | = FCP, same element | = FCP, same element (569×430) |
| When the LCP image arrives vs when it paints | – | response ends ~500 ms, paints ~1.3–1.8 s | ends ~530 ms, paints ~900 ms | ends ~28 ms, paints ~300 ms |
| Render-blocking CSS done | – | Google Fonts CSS ~430 ms, `site.css` (54 KB raw) ~900 ms | Fonts CSS ~450 ms, `site.css` (12.4 KB gz) ~550 ms | – |
| First style+layout task before FCP | – | 296–527 ms (×4 CPU) | 297–345 ms (trace: UpdateLayoutTree 64–97 ms, Layout 192–220 ms on 414 objects) | 59–186 ms |
| Web fonts ready (`document.fonts.ready`) | – | 1785 ms, so the fallback face shows for **517 ms** (511–520) after FCP | – | – |
| CLS during load | < 0.05 | median 0.0000, but **0.188 in 2 of 10 throttled loads** (base and `sheet-shift.cjs` runs; 0 of 12 in the nofonts, preload and gzip runs) (`div.brand`, `ul`, `main#top`) | 0.0000 | 0.0032 (font swap in the hero pills) |
| CLS over a full scroll | < 0.05 | median 0.0051, but **0.541 in 2 of 9 runs** (base and preload; 0 of 6 nofonts/gzip, 0 of 4 targeted) (`div.sheet-meta`, `div.sheet-body` at scrollY 14400) | 0.0051 | 0.0038 |
| TBT (FCP to load + 6 s) | – | 356 ms | 304 ms | 365 ms (includes the three.js mount at ~3 s) |
| First-load requests / bytes | – | 20 / 256 KB raw, 137 KB gz | same | 20 / 271 KB raw |
| First-load JS (12 modules) | < 60 KB gz | **18.8 KB gz** (47.4 KB raw) | same | same |
| First-load fonts | – | 4 woff2, 82.6 KB, 6 faces used (Plex Sans 400/500/600, Plex Mono 400/500, Space Grotesk 600) | same | 97.6 KB |
| index.html | – | 46.2 KB raw / 12.7 KB gz, 820 elements; comments are only 0.7 KB gz; content is ~90% of it | – | – |
| Loaded in 8 s with no scrolling | – | phone: 32 requests, 534 KB (incl. robot masks 197 KB) | – | laptop and 1920×1080: **71 requests, 1.9 MB** (three.js 675 KB, GLTFLoader 112 KB, frame.glb 183 KB, robot masks 197 KB, 33 hero frames) |
| After scrolling the whole page | – | 43 requests, 1.78 MB | – | 78 requests, 2.28 MB |
| rAF callbacks/s once settled | 0 off screen | hero 61 (drone hover, on screen), e-03 10, e-04/e-02/e-01/about/contact 0; **after LOAD in the replay, then scrolled to Contact: 60/s** | – | hero 52, e-03 10, e-02 14, others 0; replay off screen **60/s** |
| Long tasks while scrolling the page | – | 9–41 tasks, longest 323–495 ms (×4) | – | 2–14, longest 264–671 ms |

Image re-encode estimates (Chromium canvas WebP q80, same pixel size):
- `robot-iso-ink.png`: 162,002 → 48,244 B (−70%), or 29,864 B at half resolution. It renders at 141×172 CSS px on phone and 210×255 on desktop.
- `robot-iso-fill.png`: 40,401 → 6,630 B.
- Photos 01–08: 606 KB → ~516 KB (−15%; 06.jpg barely changes).
- The frame renders (1600×1200 JPG, 177–189 KB) load only when WebGL fails, so they aren't counted.

**Main conclusion on the budget:** first-load JS and median CLS pass. FCP fails on the local uncompressed server, as
the baseline's flaky `perf.spec.js` shows. It passes by about 300 ms once text is gzipped as GitHub Pages does it.

## Findings

### PERF-01 The link-preview image is the old drawing-set design and doesn't show the new targeting
- Severity: P1
- Where: `og-image.png` (1200×630, 60 KB, last changed 2026-10-20 in `b364c56`, before Phase R); `index.html:16-19` (`og:image`, size, `og:image:alt`), `index.html:20` (`twitter:card`)
- Evidence: Compare `og-image.png` with `review/baseline/laptop-light-fold.png`. The card uses a high-contrast serif for "Dominic Tataj" (the site uses Space Grotesk). It has uppercase letter-spaced mono labels ("ENGINEERING PORTFOLIO", "PROJECTS", "FUSION · ANSYS"), which Phase R R.2 removed. It also has a square orange bullet, a graph-paper grid and square hairline boxes: the "drawing set" look Dom dropped. It has no rounded raised panels, no glow and no drone. Its content is "MEng Mechanical Engineering, UCL" plus the four project titles. Nothing says software, autonomy and systems, summer 2027 or placement 2027–28, or UK right to work. The E-02 tags ("EXCEL MODEL · FUSION CAD") have also drifted from the page ("Excel · Fusion", `index.html:88`).
- Why it matters: Recruiters (reader 1) "often [arrive] on a phone from a LinkedIn link". On LinkedIn, Slack, Teams and iMessage the card is the first thing they see, before the 30 seconds start. A card in a style Dom has dropped, with no role fit or availability, wastes the one impression that reaches people who don't click.
- Fix: Make a new 1200×630 card in the Phase R language: page background `--bg #F3F4F7` with the warm/cool glow, a raised white panel (`--e-3`, radius 22 px), "Dominic Tataj" in Space Grotesk 600, and `images/hero/t16.webp` (the hero drone) on the right. Use the availability pills already on the page: "Summer internship or placement year", "From 27 June 2027", "UK, no sponsorship", "London". Add one line of targeting from IMPROVEMENTS.md ("Software, autonomy and systems roles"). Keep the text inside the centre ~1000×520 px, because LinkedIn and WhatsApp crop the edges. Make it reproducible like the other assets: add `tools/og/render.cjs` + `render.html`, a Playwright screenshot of an HTML card that links `css/site.css` for its tokens and fonts, mirroring `tools/hero/render.cjs`. Then update `og:image:alt` (`index.html:19`) to describe the new card. Add a version query (`og-image.png?v=2026-11`) to the `og:image` URL (`index.html:16`), because LinkedIn caches cards for days. Re-scrape with LinkedIn's Post Inspector after deploying.
- Effort: M

### PERF-02 Title, meta description, OG description and the hidden `<h1>` still target mechanical roles
- Severity: P1
- Where: `index.html:6` `<title>Dominic Tataj Portfolio</title>`; `index.html:7` meta description; `index.html:13` `og:title`; `index.html:14` `og:description`; `index.html:54` hidden `<h1>` "Dominic Tataj, mechanical engineering portfolio"
- Evidence:
  - meta description: "MEng Mechanical Engineering student at UCL, looking for…"
  - `og:description`: "MEng Mechanical Engineering at UCL. Designs, simulates and builds drones and robots…"
  - Neither mentions software, autonomy or systems.
  - `IMPROVEMENTS.md` lists these as the open P1 from the 20 Nov retarget.
  - The title is 23 characters and holds only the name and "Portfolio", so it gives a search result or a browser tab nothing to rank or skim on.
- Why it matters: Recruiters see this text in Google results and as the text under the LinkedIn card. Search engines weight the `<title>` and the `<h1>` most. Today, a search for the target roles has nothing to match.
- Fix (wording to settle with the copy reviewer; keep the degree accurate):
  - `<title>`: about 60 characters, name first, e.g. "Dominic Tataj · Autonomy, software and systems · UCL MEng".
  - `og:title`: the same.
  - Meta description and `og:description`: ≤ 155 characters, targeting first, then availability and right to work. For example: "UCL MEng student seeking software, autonomy and systems roles: summer 2027 internship or 2027–28 placement in the UK. Vision-based drone autonomy, CAD, FEA." Every clause is already on the page.
  - Hidden `<h1>`: "Dominic Tataj: software, autonomy and systems engineering portfolio".
  - Add a test in `tests/` that asserts the description and `og:description` don't say "Mechanical engineering roles".
- Effort: S

### PERF-03 The theme button appears after first paint on slow phones and reflows the nav (CLS 0.188)
- Severity: P1
- Where: `index.html:41` (`<button class="theme-btn" id="theme" … hidden>`); `js/theme.js:29` (`$("theme").hidden = false`); `css/site.css:99` (`.nav .wrap { flex-wrap: wrap; justify-content: space-between }`). Screenshots: `review/scratch/performance-seo/nav-nojs-fonts.png` (before JS: one row, nav 65 px) and `nav-js-fonts.png` (after JS: two rows, nav 77 px)
- Evidence: On a 375 px phone, `Work About Contact` fits next to the name. Adding "Dark" pushes the `ul` onto a second row, so the nav grows from 65 to 77 px. The `ul` jumps 157 px left (x 174 → 16) and `main` moves down 12 px. When `main.js` runs after first paint, which happens on slow loads, this is one layout shift of **0.1879**, nearly 4× the 0.05 budget. It happened in 2 of 10 throttled loads (`measure-base.json` run 2; `sheet-shift.cjs` run 3), always with sources `div.brand`, `ul`, `main#top`. `perf.spec.js` doesn't catch it because its CLS test is unthrottled.
- Why it matters: Recruiters on a phone in the first second: the whole page jumps while they start reading the availability pills. It also breaks the §0.3 budget that the gates require.
- Fix: Decide the button's presence before first paint. Remove `hidden` from `index.html:41`, and add `document.documentElement.classList.add("js");` to the inline head script (`index.html:21-25`, which already runs before paint). Add `html:not(.js) .theme-btn { display: none; }` to `css/site.css`. Without JS the button stays hidden, and with JS it is there from frame 0. Better still, let the phone nav be two rows from the start, or keep it one row with the button, so the layout never depends on JS. Add a throttled CLS check to `tests/perf.spec.js` (see PERF-10).
- Effort: S

### PERF-04 Fonts: third-party render-blocking CSS, no preload, ~0.5 s of fallback text, no metric-matched fallbacks
- Severity: P2
- Where: `index.html:26-28` (two preconnects + the Google Fonts stylesheet with `display=swap`); `css/site.css:27-29` (font stacks with no adjusted fallback `@font-face`)
- Evidence:
  - The page requests Space Grotesk 500/600/700, Plex Mono 400/500 and Plex Sans 400/500/600. It uses 6 faces in 4 woff2 files (82.6 KB on phone, 97.6 KB on desktop). Space Grotesk 500 and 700 are requested but never used.
  - The woff2 files can only be discovered after the cross-origin CSS has loaded and layout has run.
  - Throttled phone: `document.fonts.ready` at 1785 ms vs FCP 1268 ms, so the fallback (system-ui/Segoe/Roboto) shows for a median **517 ms** and then swaps (FOUT). On desktop the swap is a measured CLS of 0.003 (hero pills).
  - In CDP emulation the Google CSS (~430 ms) finished before `site.css`, so blocking the fonts didn't move FCP (`measure-gz-nofonts-*.json`, 960 vs 900 ms, within noise). On a real 3G link, though, the separate `fonts.googleapis.com` and `fonts.gstatic.com` connections each need DNS + TCP + TLS, which emulation doesn't fully model.
  - Google Fonts also logs each visitor's IP with a third party, a GDPR point the UK/EU audience may notice.
- Why it matters: Recruiters see the headings and pills redraw in a different face about half a second after they appear. Engineers who open DevTools see a third-party render-blocking request on a site that advertises a performance budget.
- Fix (build-free):
  - Self-host the latin subsets in `fonts/`: Space Grotesk variable (~22 KB), IBM Plex Sans variable (~40 KB) and Plex Mono 400/500 (~10 KB each). Declare them with `@font-face` at the top of `css/site.css` with `font-display: swap`, which removes `index.html:26-28`.
  - `<link rel="preload" as="font" type="font/woff2" crossorigin>` only the two faces above the fold (Plex Sans and Space Grotesk).
  - Add fallback faces with `size-adjust` / `ascent-override` (e.g. `@font-face { font-family: "Plex Sans Fallback"; src: local("Arial"); size-adjust: …; }`) so the swap doesn't reflow.
  - Drop Space Grotesk 500/700 from the request if staying on Google.
  - Consider replacing Plex Mono with `ui-monospace` for the 11–13 px labels. It saves 2 requests and 20 KB, but it's a Phase R type choice, so it's Dom's call.
- Effort: M

### PERF-05 An intermittent 0.54 layout shift in a project panel while scrolling on a throttled phone
- Severity: P2
- Where: `css/site.css:265` (`.sheet { content-visibility: auto; contain-intrinsic-size: auto 1400px; }`); `js/sheets.js:4-10` (lays every sheet out once after `load`); the shift was at scrollY 14400 on a 375 px phone, inside `#e-01` (sections from `sheet-shift.cjs`: e-03 is 4381 px tall, e-04 4588, e-02 2178, e-01 1352)
- Evidence: In 2 of 9 throttled full-page scrolls (`measure-base-phone-throttled.json` run 1, `measure-preload-phone-throttled.json` run 0), one shift of **0.5409** had sources `div.sheet-meta` and `div.sheet-body`. It didn't reproduce in 4 targeted runs, so it is timing-dependent. The real sheet heights (1352–4588 px) are far from the 1400 px placeholder. When a sheet is rendered for the first time while it is near the viewport (e.g. before `sheets.js` has run on a slow load, or when a figure script such as `scaling.js` changes the sheet while it is skipped), its height snaps. The cause is plausible, not proven.
- Why it matters: Engineers who scroll the detail on a phone, if they hit it. It is 10× the CLS budget when it happens.
- Fix: Give each sheet a placeholder near its real height (`#e-03 { contain-intrinsic-size: auto 4400px }` etc., or per breakpoint), or drop `content-visibility` from the short `#e-01`. Make `tests/perf.spec.js`'s scroll CLS test run throttled and 3 times, failing on the max rather than a single run.
- Effort: S

### PERF-06 The replay's animation loop keeps running at 60 fps off screen
- Severity: P2
- Where: `js/replay.js:200-215` (`tick` / `play` call `requestAnimationFrame` directly instead of `loop()` from `js/motion.js:149`)
- Evidence: `raf.cjs`: LOAD a flight in E-04, then scroll to Contact. Callbacks stay at **60/s** on phone and desktop. Every other section settles to 0/s. The loop redraws the FPV canvas, the map and the pipeline strip (`draw()`, `js/replay.js:187`) until the flight ends, whether or not anyone can see it.
- Why it matters: The §5 gate says "rAF loops pause off screen". On a phone it costs battery and scroll smoothness while the visitor reads About. Engineers checking the gate would find it broken.
- Fix: Drive playback with `loop(document.getElementById("e-04") /* or the player */, step)` from `js/motion.js`, which already pauses on IntersectionObserver and `visibilitychange`. Keep `t0`/`tStart` so playback resumes in place. Extend the existing "no animation loop runs once the page is still" test to start a replay and then scroll away.
- Effort: S

### PERF-07 The pipe-climber masks (202 KB of PNG) download at load on every device
- Severity: P2
- Where: `css/site.css:557-558` (`.rb-fill`, `.rb-ink` `mask-image: url(../images/robot-iso-*.png)`); `index.html:364`; `js/sheets.js:4-10`
- Evidence: Because `sheets.js` sets every `.sheet` to `content-visibility: visible` at `load`, the masks for Fig. 04 (E-02, about 11,000 px down on a phone) are fetched for every visitor, even one who never scrolls (`idle-loads.cjs`: phone 534 KB of which 197 KB are these two PNGs). `robot-iso-ink.png` is 1013×1233 and 162 KB, but it renders at 141×172 (phone) and 210×255 (desktop) CSS px. As WebP at the same size it is 48 KB, and 30 KB at half size. `robot-iso-fill.png`: 40 KB → 6.6 KB.
- Why it matters: Recruiters on mobile data pay for ~200 KB they'll never see. It is the third-largest asset on the phone, after three.js and the model.
- Fix: Re-encode both masks as WebP or AVIF with alpha, at about 600 px wide (enough for 255 CSS px at 2×), in `tools/robot/iso.cjs` so it stays reproducible. Set the mask URL only when Fig. 04 is near, e.g. `.climb-robot.near .rb-ink { mask-image: … }` with the class added by the IntersectionObserver that `js/climber.js` already uses.
- Effort: S

### PERF-08 On laptops, three.js and the 3D model load and mount without any scrolling, causing 140–160 ms long tasks
- Severity: P2
- Where: `js/frame3d-boot.js:20` (`addEventListener("load", … setTimeout(… scrolled = true; start(); }, 2500))`) with the `rootMargin: "100% 0px"` observer on `#f3-track`
- Evidence: At 1440×900 and at 1920×1080, `#f3-track` sits at y 1795, within one screen of the fold, so 2.5 s after `load` the page fetches `three.module.min.js` (675 KB raw / 172 KB gz), GLTFLoader (112 KB), BufferGeometryUtils, the meshopt decoder and `models/frame.glb` (183 KB). In total that is 71 requests and 1.9 MB in the first 8 s with no input (`idle-loads.cjs`). Desktop long tasks at 3.0–3.3 s are 141–162 ms, unthrottled (`measure-base.json` desktop runs). The file's own header says the model loads "once the figure is near **and the visitor has started scrolling**". The timer contradicts it.
- Why it matters: Recruiters reading the hero on a laptop get a main-thread stall just when they start to scroll or click "View projects". It doesn't affect FCP or LCP.
- Fix: Drop the 2.5 s timer and start on the first scroll or pointer interaction plus nearness, or use `requestIdleCallback(start, { timeout: 8000 })` so parsing yields to input. If a warm start is wanted, `<link rel="modulepreload">` the three.js files on idle (download only, no parse or mount).
- Effort: S

### PERF-09 There is no structured data: no JSON-LD `Person` / `ProfilePage`
- Severity: P2
- Where: `index.html` `<head>` (lines 3-29); grep for `ld+json` finds nothing
- Evidence: Search engines get no machine-readable name, university, location, profiles or skills. Google supports `ProfilePage` with a `Person` `mainEntity` for personal profile pages, and it feeds the knowledge panel and "About this result".
- Why it matters: Recruiters who Google "Dominic Tataj" should get this page, connected to his LinkedIn and GitHub, as one entity.
- Fix: Add a `<script type="application/ld+json">` to the head. It uses only facts already on the page:
  ```json
  {"@context":"https://schema.org","@type":"ProfilePage","dateModified":"2026-11-20",
   "mainEntity":{"@type":"Person","name":"Dominic Tataj","url":"https://dom-t23.github.io/dominic-tataj/",
    "image":"https://dom-t23.github.io/dominic-tataj/og-image.png",
    "affiliation":{"@type":"CollegeOrUniversity","name":"University College London (UCL)"},
    "homeLocation":{"@type":"Place","name":"London"},
    "knowsAbout":["Computer vision","Python","OpenCV","Generative design","Finite element analysis","Ansys","Fusion","MATLAB","Dynamic modelling"],
    "sameAs":["https://www.linkedin.com/in/dominic-tataj","https://github.com/dom-t23","https://unsplash.com/@dominic_t"]}}
  ```
  Add `jobTitle` only if Dom wants a phrase like "MEng Mechanical Engineering student" (needs from Dom). Add a photo `image` only if Dom supplies a headshot (needs from Dom). Check the markup with Google's Rich Results Test.
- Effort: S

### PERF-10 The performance test measures an uncompressed server and misses slow-load CLS, so the FCP gate is flaky and the real regressions get through
- Severity: P2
- Where: `tests/perf.spec.js:11-26` (FCP against python http.server, one run), `tests/perf.spec.js:28-44` (CLS unthrottled); `playwright.config.js` webServer
- Evidence: The baseline `npm test` failed "first paint under 1.2 s" under contention (NOTES.md: 1128 of 1200 ms when it passes). My local median is 1412 ms, but the same files gzipped (as GitHub Pages serves them) give a median of **900 ms**. The CLS test never throttles, so PERF-03 (0.188) and PERF-05 (0.541) pass it.
- Why it matters: For engineers and for Dom: a gate that fails at random gets ignored, and one that misses the real shifts gives false comfort.
- Fix: Serve the tests with gzip using a ~20-line `node:http` + `zlib` static server under `tests/` (dev-only, no new dependency; `review/scratch/performance-seo/gzip-server.cjs` is a working sketch), as the `webServer` command. Take the median FCP of 3 runs, and run the CLS test under the same throttle as the FCP test, asserting the max across 3 loads.
- Effort: S

### PERF-11 theme-color doesn't follow the dark theme
- Severity: P3
- Where: `index.html:11` (`<meta name="theme-color" content="#F3F4F7">`); `index.html:21-25` (inline theme script); `js/theme.js:13-17` (`apply()`)
- Evidence: There is only one static value, the light `--bg`. With dark chosen (`--bg #090B0F`), Android Chrome's address bar and Safari's tab bar stay light grey over a near-black page. A `media="(prefers-color-scheme: dark)"` pair would be wrong here, because Phase R deliberately ignores the device setting.
- Why it matters: For visitors who choose dark: a visible seam at the top of the phone screen. It is polish.
- Fix: Give the meta an `id`. Set `content="#090B0F"` in the inline head script when the saved theme is dark, and update it in `theme.js` `apply()`.
- Effort: S

### PERF-12 Sharing and indexing metadata gaps: og:site_name, og:locale, Search Console
- Severity: P3
- Where: `index.html:12-20`
- Evidence: There is no `og:site_name`, no `og:locale` (the page is `lang="en-GB"`) and no `twitter:title`/`twitter:description` (Twitter/X falls back to OG, which is fine). There is no `robots.txt` or `sitemap.xml`. For a GitHub Pages project site, `robots.txt` would have to live at `dom-t23.github.io/robots.txt` (the user-site repo), so it can't come from this repo. A sitemap for one page adds little. There is no Search Console verification.
- Why it matters: Small gains in how cards are labelled and in indexing speed after the retarget.
- Fix: Add `<meta property="og:site_name" content="Dominic Tataj">` and `<meta property="og:locale" content="en_GB">`. Needs from Dom: verify the URL-prefix property `https://dom-t23.github.io/dominic-tataj/` in Google Search Console (an HTML-tag token in the head), then request indexing after the PERF-02 change so the new snippet shows sooner.
- Effort: S

### PERF-13 Favicon set: SVG plus one 180 px PNG, still the drawing-set square
- Severity: P3
- Where: `index.html:9-10`; `favicon.svg` (125 B, an orange `#FF4F00` square on a 32 grid); `apple-touch-icon.png` (180×180, 525 B, the same square on white)
- Evidence: The sizes are correct for iOS (180×180). There is no PNG or ICO fallback for browsers or tools that don't take SVG favicons. Neither icon has a monogram. The square mark predates Phase R (last changed 2026-10-20), and Phase R's own mark is the round live dot used in the eyebrow and the availability pill.
- Why it matters: For recruiters with many tabs open: a plain orange square is hard to recognise as "Dom's site". It is minor.
- Fix: Optionally redraw the mark in the Phase R language (e.g. a rounded square or a dot with "DT" in Space Grotesk; Dom's choice). Export `favicon.svg`, a 48×48 PNG (Google Search wants a multiple of 48 px) and the 180×180 `apple-touch-icon.png`, and add `<link rel="icon" href="favicon-48.png" sizes="48x48" type="image/png">` as a fallback.
- Effort: S

### PERF-14 Photos are JPEG only, with no modern format
- Severity: P3
- Where: `index.html:563-570` (`.film img`, all `loading="lazy"` with width/height: good); `css/site.css:695,705` (rendered 230 px tall on desktop, 170 px on phone)
- Evidence: 600 px-tall JPEGs, 31–169 KB each, 606 KB in total. WebP q80 from Chromium gives ~516 KB (−15%). `06.jpg` (169 KB) barely shrinks, so it may be over-sharpened or noisy. The 600 px height is right for 170 px at 3× and 230 px at 2×. Lazy-loading works: a phone that scrolls to About fetches only 01–03.
- Why it matters: A small saving on mobile data. Photography is secondary, so this is low priority.
- Fix: Wrap each image in a `<picture>` with an AVIF/WebP `<source>` (exported with the same tool as the hero frames) and keep the JPEG fallback. Re-export 06 at a lower quality.
- Effort: S

### PERF-15 The desktop hero turn makes 33 separate image requests
- Severity: P3
- Where: `js/hero-drone.js:17-21` (33 `new Image()` for `images/hero/t00…t32.webp`, ~9.5 KB each, on screens ≥ 761 px)
- Evidence: 33 requests and ~314 KB after `load` on desktop (`measure-base.json` desktop lazy list). They are cheap one by one, but they crowd the connection while Fig. 00's flight data and the after-load modules are loading.
- Why it matters: It is minor. On a slow laptop connection it delays `flights/index.js` and the lazy modules.
- Fix: Render the 33 frames into one WebP sprite sheet in `tools/hero/render.cjs` and draw sub-rectangles in `draw()`. Or start the frame fetch in `requestIdleCallback` after the flight index has arrived.
- Effort: M

### PERF-16 Main thread just after first paint: the reveal setup is one 226 ms (×4) task
- Severity: P3
- Where: `js/reveals.js:6-15` (one `setTimeout` that calls `reveal()` on every `svg.drawing`, `.sheet-meta` and counter); `js/motion.js` `draw` effect (`getComputedStyle` + `getTotalLength` per shape) and `onScreen()` (`getBoundingClientRect`)
- Evidence: In the trace (`trace.cjs`, throttled phone), `FunctionCall js/reveals.js:7` takes 226 ms at 1566 ms, right after FCP. The TBT median is ~300–360 ms on the throttled phone.
- Why it matters: For recruiters tapping "View projects" in the first two seconds on a mid-range phone, input is delayed. It is small.
- Fix: Register reveals per section from one coarse IntersectionObserver (set up a section's shapes when it comes within ~1 screen), or split the loop with `requestIdleCallback`/`scheduler.yield()` between elements.
- Effort: S

### PERF-17 Heading outline: About jumps from h2 to h4, and the only h1 is hidden
- Severity: P3
- Where: `index.html:506` (`<h2>About</h2>`) → `index.html:512` (`<h4>Outside engineering</h4>`); `index.html:54` (visually hidden h1)
- Evidence: The outline is h1 (hidden), then h2 Projects with h3 for each project and h4 sub-heads, then h2 About → h4, then h2 Contact. The hidden h1 was a deliberate decision (commits `a473124`, `36007c6`), and I don't reopen it. Search engines read it, so its text matters (PERF-02).
- Why it matters: This is a minor outline and semantics issue for search and assistive tech.
- Fix: Make "Outside engineering" an `h3` (restyle via the class if its size must stay). Retarget the h1 text as in PERF-02.
- Effort: S
