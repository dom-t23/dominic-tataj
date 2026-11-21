# Independent verification, round 1 (21 Nov 2026)

Branch `claude/design-review`, served at http://127.0.0.1:4173/. I judged only what a visitor gets: BRIEF.md §1–3, the live page, `review/after/` (screenshots, NOTES.md, metrics.json) and the site's own files. I did not open REVIEW.md, DESIGN_PLAN.md, IMPROVEMENTS.md, review/findings, review/directions, review/baseline or the git history.

## Method

- **Recruiter panel:** the 10-second test used only `after/phone-light-fold.png`. The 30-second test used `after/scroll/phone-light-00…21.png`. I also opened `og-image.png` and read the head tags.
- **Accessibility:** I ran axe-core with the tags wcag2a, wcag2aa, wcag21aa and wcag22aa in four configurations: 1440×900 light and dark, and the phone preset (iPhone 13 metrics) light and dark. Each run scrolled the whole page first. I then checked by hand: a Playwright keyboard walk of the first 40 tab stops with focus screenshots, the skip link, heading outline, landmarks, image alternatives, target sizes on phone, reflow at 320 px and 375 px, reduced motion at the first frame, contrast of every token pair, and the contrast of SVG chart text.
- **Performance:** CDP throttling at 150 ms latency, 1.6 Mbps down and CPU ×4 on the phone preset, with the cache disabled, run 3 times. I took the median of FCP and LCP. CLS was measured at load and after scrolling. JS weight counts the encoded (gzip) bytes of scripts requested before the load event. I added one unthrottled desktop run, a layout-shift attribution trace, and an in-page anchor-landing test.
- **Scripts and raw output:** `review/scratch/verifier/` (`axe.cjs`, `manual.cjs`, `reflow.cjs`, `perf.cjs`, `cls.cjs`, `anchors.cjs`, `anchors2.cjs`, `svgtext.cjs`; JSON outputs; `shots/`).

---

## A. Recruiter test

### 10-second test (phone-light-fold.png only): **PASS**

The first screen shows: the name, very large; "Software, autonomy and systems / MEng, UCL"; a facts table (Looking for: Summer 2027 internship or 2027–28 placement year; Available: from 27 June 2027; Right to work: full right to work in the UK; Based: London; Degree: second-year, graduating 2029, predicted 2:1; Email); then **Email me / LinkedIn / GitHub** buttons; then the lede ("…particularly in UK defence…").

| | Early-careers recruiter, UK defence prime | Eng. manager, UK autonomy/defence startup | Graduate recruiter, software firm |
|---|---|---|---|
| Who | "UCL MEng Mech student, 2nd year, predicted 2:1." | "Mech student moving into autonomy." | "UCL engineering student who wants software roles." |
| Roles wanted | "Software, autonomy, systems; a summer 2027 internship or a 2027–28 placement. The lede says UK defence, so that's us." | "Autonomy and systems." | "Software is listed first. Good." |
| When | "From 27 June 2027." | same | same |
| Right to work | "Full right to work in the UK. Ticked." (Would still want SC eligibility; see needs-Dom.) | ticked | ticked |
| Contact / CV | "Email shown twice, plus a button. **No CV link.**" | "Email or GitHub; I'd go to GitHub." | "Email, LinkedIn. **Where's the CV?**" |

All five screening facts except the CV are above the fold on a 375×812 phone. This is close to ideal for this audience.

### 30-second skim (scroll/phone-light-*)

- **Defence recruiter.** *Remembers:* "The drone that flies through gates by camera, no GPS, 98.6%. A 246 g drone frame under the CAA limit. A pipe-climbing robot." *Would click:* E-04 in the project list, then Email me. *Confusing:* the "Load replay" panel shows "gate 5/8, 6.65 s" on the camera while the readout below says "0.00 s, 4 / 8". *Shortlist:* **yes**, because the facts table answers the screening questions and there is a no-GPS autonomy project.
- **Autonomy startup EM.** *Remembers:* "Error-state Kalman filter, solvePnP IPPE_SQUARE, chi-squared gating, 300 seeded courses, a deterministic regression harness. He admits Claude wrote most of the code but he set the rules and the tests." *Would click:* the GitHub repo and the Fig. 01 table. *Confusing:* "Clean: runs 20 and 23 (camera only); clutter: run 26" is internal notation. *Shortlist:* **yes, for a call**; the AI-agent disclosure is honest and will become the first interview question.
- **Software grad recruiter.** *Remembers:* "Python/OpenCV drone project, the rest is CAD/FEA/Excel/MATLAB." *Would click:* GitHub. *Confusing:* the project list's Result column mixes "98.6%", "246 g", "Climbed" and "P ∝ N^0.55", which a non-engineer can't compare. *Shortlist:* **maybe**: one software project and no CV to check languages, internships or grades against a form.

### LinkedIn preview

- `<title>`: "Dominic Tataj · Engineering portfolio: software, autonomy and systems". Good.
- `og:title`: "Dominic Tataj, engineering portfolio: software, autonomy and systems". Good.
- `og:description`: MEng at UCL; looking for software, autonomy and systems roles (summer 2027 internship or 2027–28 placement in the UK); the three projects. Good, though it runs long and LinkedIn will truncate it after about two lines.
- `og-image.png` (1200×630, opened): name, the role line, "Looking for" and "Right to work" facts on the left; the four projects with one result each and the URL on the right. Legible at thumbnail size, on brand and not misleading. `og:image:alt` is present.

---

## B. Accessibility (WCAG 2.2 AA)

### axe-core (after a full scroll)

| Config | Violations | Needs review (incomplete) | Passes |
|---|---|---|---|
| 1440×900 light | **0** | aria-prohibited-attr (5), color-contrast (134, mostly SVG text), th-has-data-cells (1, `.bom`) | 35 |
| 1440×900 dark | **0** | aria-prohibited-attr (5), color-contrast (120), th-has-data-cells (1) | 35 |
| phone light | **0** | aria-prohibited-attr (5), color-contrast (129), th-has-data-cells (1) | 35 |
| phone dark | **0** | aria-prohibited-attr (5), color-contrast (114), th-has-data-cells (1) | 35 |

**Incomplete items, resolved by hand:**
- **aria-prohibited-attr:** `aria-label` on generic `<div class="specs">` and `<div class="player">` (no role), so screen readers ignore it. P2: add `role="group"` or drop the label.
- **color-contrast:** I computed all token pairs (table below). All text tokens pass AA in both themes. In the SVG text scan, everything at rest passes except the Fig. 04 label **"2 m climbed"**, which is drawn in `--signal` #FF4F00 on #F7F6F3: **3.05:1** for 10 px-unit text (P2; use `--signal-strong`). The other low readings were reveal animations caught mid-fade.

| Pair | Light | Dark |
|---|---|---|
| muted / page | 5.45 | 6.80 |
| muted / panel | 4.99 | 5.64 |
| muted / raised | 5.89 | 6.17 |
| ink-2 / page | 9.11 | 10.52 |
| link / page | 5.71 | 8.18 |
| signal-strong / page | 4.98 | 7.36 |
| truth / raised | 6.91 | 7.42 |
| ok / page | 5.53 | 8.66 |
| on-signal / signal (Load replay) | 5.69 | 6.01 |

### Manual checks

- **Skip link:** the first Tab shows "Skip to content" as a dark pill with a ring (`shots/skip-visible.png`). Enter moves focus into `<main id="top">`, and the next Tab lands on the hero email. Pass.
- **Keyboard path:**
  - The order is: brand, nav (Work/About/Contact/theme), facts email, Email me, LinkedIn, GitHub, E-04 link in the Fig. 00 caption, Replay, "Try the hover controller", the four project rows, the repo link, Load replay, Play, the scrubber, the Fig. 01 column-header buttons, the Fig. 02 view tabs, then the parts-list buttons. The order is logical.
  - Every stop shows a 2 px ink outline at 3 px offset (`shots/focus-06.png` email, `focus-12.png` hover controller, `focus-14.png` project row, `focus-20.png` scrubber). Pass.
- **Headings:** H1 name; H2 "Projects and results", H2 (sr-only) "Projects"; H3 for each project, with H4 Approach / How it was built / Testing / Result / Limitations; H2 About, H3 Outside engineering; H2 Contact. No skipped levels. Pass.
- **Landmarks:** nav[Main], main, header (inside main), footer. Pass.
- **Non-text content:**
  - All 10 `<img>` have specific alt text.
  - Charts are `role="img"` with data-bearing labels, and Fig. 01 has a real table.
  - The two replay canvases have `aria-label` but no `role="img"` (P2).
- **Reflow at 320 px: FAIL (P1, see E).** `scrollWidth` is 340 against a 320 viewport, so the page scrolls sideways by 20 px. Overflowing items: the facts email link (right edge 333), the "400×300 mm" stat unit (322), "N^0.55" (323); the theme button is half off the nav (`shots/r320-hero.png`). At 375 px there is no overflow.
- **Clipped content on phone (P1):** the Fig. 02 caption loses its first characters (". 02 As modelled…") and the two-column parts list loses its right edge (`after/scroll/phone-light-10.png`, `shots/phone-fig02-caption.png`).
- **Target size (phone):**
  - Under 24 px: Replay (56×20), Try the hover controller (159×20), the Fig. 01 "Course set" header (61×22), the scrubber (16 px high) and the three Fig. 04 sliders (16 px high, 28 px apart). All meet 2.5.8 through the spacing exception.
  - Inline text links are exempt.
  - The parts-list buttons are 24 px.
  - Pass, but Replay and "Try the hover controller" are tight for thumbs.
- **Reduced motion:** at about 50 ms after DOMContentLoaded with `reduce`, 0 of the text elements in main are transparent or hidden, both at the top and halfway down. The hero is complete at the first frame (`shots/reduced-frame0.png`). Without `reduce`, nothing above the fold is hidden at frame 0 either. Pass.
- **Scrollable regions:** the Fig. 05 plate and the film strip are focusable and labelled ("scrolls sideways"). At 320 px only, `.tablebox` (Fig. 01) scrolls but is not focusable (P2).

---

## C. Performance and SEO

| Measure | Result | Budget | |
|---|---|---|---|
| FCP, phone throttled (median of 3: 904 / 912 / 988 ms) | **912 ms** | 1.2 s | pass |
| LCP, phone throttled (median) | **912 ms** (the h1 name span, the same paint as FCP) | — | good |
| FCP / LCP, desktop unthrottled | 220 ms / 220 ms (`p.lede`) | — | good |
| CLS at load, phone | 0.0018 | 0.1 | pass |
| CLS after scrolling the whole page, phone | 0.0018 | 0.1 | pass |
| CLS after a realistic wheel scroll, desktop | 0.0014 | 0.1 | pass |
| CLS after instant programmatic jumps, desktop | 0.64, from one `.sheet-body` whose `content-visibility` placeholder resolved in view (an artefact of jump scrolling; the same mechanism causes the P1 anchor bug below) | — | note |
| First-load JS, phone (12 scripts before load, gzip) | **21.2 KB** | 60 KB | pass |
| First-load JS, desktop (13 scripts, includes `flights/index.js`, per metrics.json) | 28 KB gz | 60 KB | pass |
| All bytes before load, phone | 198 KB (fonts 147 KB of it; Archivo alone is 90 KB) | — | fonts dominate |
| Console errors | 0 | 0 | pass |

**Metadata and SEO:**
- `<html lang="en-GB">`.
- `<title>` and meta description are specific and role-led.
- Canonical points to the live URL.
- SVG favicon plus apple-touch-icon.
- `theme-color` is #F7F6F3 and swaps to #0E1012 for a saved dark theme before first paint.
- Full OG set with image dimensions, alt, site name and en_GB locale. `twitter:card=summary_large_image`; X falls back to the OG tags.
- JSON-LD: a `ProfilePage` whose `Person` carries jobTitle, description, alumniOf UCL, London/GB, knowsAbout and sameAs (LinkedIn, GitHub, Unsplash).
- All present and valid in form.

---

## D. Rescoring (1–10, what a visitor gets now)

| Reviewer | Dimension | Score | Why |
|---|---|---|---|
| recruiter | 10-second clarity | 9 | Name, roles, dates, right to work, location and email all sit on the first phone screen |
| recruiter | 30-second skim | 8 | The project list gives one result per project; the deep sheets are long for a recruiter but well signposted |
| recruiter | CTA and CV findability | 7 | Email/LinkedIn/GitHub in the hero and again at Contact; no CV anywhere and no "CV on request" line |
| recruiter | fit for defence/autonomy recruiters | 8 | "Particularly in UK defence", a GPS-denied vision autonomy project and right to work are explicit; clearance status absent |
| recruiter | fit for software recruiters | 7 | One substantial Python/OpenCV project; the rest is CAD/FEA/Excel/MATLAB; most E-04 code was written by an AI agent |
| recruiter | memorability | 7 | The flight-log hero and "98.6% with no GPS" stick; the type and palette are restrained rather than memorable |
| hiring-engineer | ownership clarity | 9 | Each project states its role ("Solo; set the design and test rules, directed an AI coding agent"; "Team of 6 · model and CAD") |
| hiring-engineer | quantified results | 9 | Pooled pass rates with per-set table, 246 g / 38 g / −36%, 22% predicted vs 16% measured, R² 0.44 |
| hiring-engineer | method, testing and limitations | 9 | solvePnP/ESKF/χ² gating, seeded regression harness, the simulator sign bug, Euler step-size limitation, R² caveat |
| hiring-engineer | value of the interactive figures | 8 | The replay with the pipeline strip and the climb simulator show the method; the hover controller is hidden behind a small link |
| hiring-engineer | project ordering for the target roles | 9 | Newest first, which here is autonomy, then mechanical, robot, analysis: right for the targets |
| hiring-engineer | technical credibility | 8 | Honest and specific; it is still all simulation or coursework with no hardware photos or flight data |
| visual-design | typography | 8 | Wide Archivo display with Plex Sans/Mono is clear and characterful; data in mono reads as instrumentation |
| visual-design | grid and alignment | 7 | A disciplined 12-column desktop layout; on phones Fig. 02 is clipped at both edges |
| visual-design | spacing system | 8 | Consistent rhythm; some large empty bands (above the phone 3D model, after the film strip) |
| visual-design | colour and contrast | 8 | Warm white, ink and one safety orange used for data and state; all text tokens pass AA |
| visual-design | hierarchy | 9 | Name, then facts, then actions, then results; each sheet runs headline, stats, figure, prose |
| visual-design | component consistency | 8 | Stat blocks, figure plates and captions repeat cleanly; segmented controls vary slightly between figures |
| visual-design | depth and elevation | 7 | Raised interactive panels with soft lift; otherwise flat, which suits the content |
| visual-design | imagery | 6 | Software-rendered CAD and diagrams only; no real photo of any built hardware; the film strip is good but secondary |
| visual-design | dark theme | 8 | Full parity from tokens; the figures re-tint correctly |
| visual-design | distinctiveness and premium feel | 7 | Professional and coherent "flight log" identity; not yet a signature look |
| visual-design | OVERALL | 8 | Clean, credible, recruiter-first; the phone figure clipping is the main blemish |
| interaction-motion | purposefulness | 8 | The flight replay, pipeline strip, climb simulator and scaling toggle each explain the work |
| interaction-motion | smoothness | 7 | Not verifiable on a real GPU here; SwiftShader captures show no jank or layout shift during reveals |
| interaction-motion | discoverability | 7 | Load replay is obvious; the hover controller and "Type FPV" easter egg are easy to miss; Fig. 05's sideways scroll has no visible cue |
| interaction-motion | interruptibility and control | 8 | Replay, Play, scrubber, reset buttons, and a sticky Fig. 02 that releases |
| interaction-motion | reduced-motion fallbacks | 9 | Content complete at frame 0 with `reduce`; smooth scroll turned off |
| interaction-motion | touch behaviour | 7 | Fig. 02 not pinned on phones (good); Replay and hover-controller targets are 20 px high |
| interaction-motion | scroll-linked effects | 6 | `content-visibility` placeholders make the phone project-list jump to E-01 land about 1,000 px short |
| interaction-motion | cursor and micro-interactions | 7 | Crosshair cursor, focus rings and tab underlines are tidy; nothing special |
| accessibility | contrast (light) | 8 | All tokens ≥ 4.98:1; one orange SVG label at 3.05:1 |
| accessibility | contrast (dark) | 9 | All tokens ≥ 5.05:1 |
| accessibility | keyboard and focus | 9 | Skip link, logical order, visible 2 px ring on every stop tested |
| accessibility | semantics, landmarks and headings | 8 | Clean outline and landmarks; `aria-label` on role-less divs; canvases lack `role="img"` |
| accessibility | alternatives for non-text content | 8 | Specific alt text; charts labelled with their data; Fig. 01 has a real table |
| accessibility | target size | 8 | Passes 2.5.8 (spacing exception for the 20 px text buttons and sliders) |
| accessibility | reflow and zoom | 6 | 20 px of sideways scroll at 320 px; phone Fig. 02 caption and parts list clipped |
| accessibility | motion and reduced motion | 9 | Complete fallbacks; nothing hidden at frame 0 |
| performance-seo | first-load weight | 8 | 198 KB before load, JS only 21 KB gz; fonts are 147 KB of it |
| performance-seo | LCP | 9 | 0.91 s on the throttled phone; text LCP |
| performance-seo | CLS | 9 | ≤ 0.002 in realistic use |
| performance-seo | font loading | 7 | `display=swap` plus preconnect, but four font files and a 90 KB Archivo variable file for headings |
| performance-seo | images | 8 | Lazy, sized renders and photos; no hero image cost |
| performance-seo | lazy-loading and main thread | 8 | three.js and replay data load only on demand; `content-visibility` defers the sheets (with the anchor side effect) |
| performance-seo | metadata and SEO | 9 | Complete, specific, en-GB, canonical |
| performance-seo | social cards | 9 | A purpose-built 1200×630 card with facts and results, plus alt text |
| performance-seo | structured data | 9 | ProfilePage plus Person with a useful property set |
| copy | headline and first impression | 9 | Name plus "Software, autonomy and systems · MEng, UCL" says it immediately |
| copy | role and target clarity | 9 | Role type, sector (UK defence) and form (internship or placement) are all explicit |
| copy | availability and logistics | 10 | Date, right to work, location and degree stage in a scannable table |
| copy | project titles and summaries | 8 | Plain-English headlines with numbers; "Climbed" as a headline result is weak |
| copy | scanability | 8 | Stats, H4 sections and numbered steps; a few long paragraphs in E-04 Testing |
| copy | voice and consistency | 9 | First person, concrete, candid about limits and the use of AI |
| copy | UK spelling and mechanics | 9 | UK forms throughout ("colour", "optimisation", "initialising"); en dashes and × used properly |
| copy | microcopy and CTAs | 7 | Clear buttons; no CV or "on request" line; "runs 20 and 23" jargon; the replay poster contradicts its readout |
| benchmark | memorability | 7 | Below bps.space/ciechanow.ski; on a par with good student portfolios |
| benchmark | 10-second clarity | 9 | Clearer than most of the benchmark set for a recruiter |
| benchmark | craft | 8 | Live figures, real data tables, a tested build; a couple of phone layout slips |
| benchmark | proof of work | 7 | Strong simulation evidence; the benchmarks lead with hardware photos and video, and this site has none |
| benchmark | credibility for engineering hiring | 8 | The method and limitations writing is at hiring-engineer level |
| benchmark | distinctiveness | 7 | Coherent, but the look is close to a well-made data-report template |

**Overall per reviewer:** recruiter 8 · hiring-engineer 8.5 · visual-design 8 · interaction-motion 7.5 · accessibility 8 · performance-seo 8.5 · copy 8.5 · benchmark 7.5.

---

## E. Open issues

**P0 (broken, or blocks the 30-second read): none.**

### P1 (clearly hurts)

**P1-1. Fig. 02 is clipped on phones.**
- **Where:** E-03, Fig. 02 (`#f3-track`) on viewports under 600 px. The cause is `css/site.css` lines 510–512, `.f3-track.is-3d { margin-inline: -20px }`: the figure bleeds into the gutter, but `.sheet { content-visibility: auto }` (line 307) clips paint to the sheet box.
- **Evidence:**
  - The caption renders as ". 02 As modelled in Fusion…": "Fig" is cut off, and the second line starts "ı it;".
  - The parts list's right column loses its quantities and units ("×2", "246" without "g", "›").
  - Measured caption box: left 0, right 390 on a 390 viewport.
  - Seen in `after/scroll/phone-light-10.png`, `scratch/verifier/shots/phone-fig02-caption.png` and `reflow-320-e03.png`.
- **Fix:** drop the phone bleed (remove `margin-inline: -20px` and restore the inline border). Alternatively, keep the bleed and give `.f3 figcaption` and `.f3-parts` `padding-inline: 20px` while moving `content-visibility` off the element that clips. Check the parts-list grid at 320 px afterwards, or fall back to one column under about 360 px.

**P1-2. Project-list jump to E-01 lands about 1,000 px short on phones.**
- **Where:** the "Projects and results" list rows (`.results a[href="#e-01"]`) on a fresh page load on a phone.
- **Evidence:**
  - Over two fresh runs, tapping E-01 leaves `#e-01` at top = 1079 px, and the visitor sees E-02's "Result / Limitations" (`shots/anchor-phone-e-01.png`). A second tap lands correctly (72 px).
  - Desktop is fine.
  - Cause: `.sheet { content-visibility: auto; contain-intrinsic-size: auto 1400px }`. Phone sheets are several thousand pixels tall, so the smooth-scroll target is computed from too-short placeholders.
  - The project list is the recruiter's main way in, so this mis-routes the 30-second reader.
- **Fix:** under 600 px, set realistic placeholders per sheet (for example `#e-04 { contain-intrinsic-size: auto 9000px }`, roughly 6000–8000 px for the others, measured). Or, on in-page link clicks, set `content-visibility: visible` on sheets before the target, then scroll. Or re-scroll once on `scrollend` if the target's top is not within about 100 px of the scroll padding.

**P1-3. Reflow fails at 320 px (WCAG 1.4.10; brief: "no horizontal scroll on phones").**
- **Where:** hero facts email (`.facts-email`), the nav (theme button pushed half off), E-02's "400×300 mm" stat, and E-01's "P ∝ N^0.55" stat.
- **Evidence:** at 320×700, `document.documentElement.scrollWidth` is 340, `overflow-x` is visible and the page scrolls sideways (`shots/r320-hero.png`). At 375 px it is clean.
- **Fix:**
  - Give `.facts-email` `overflow-wrap: anywhere` (as `.email` already has), or stack the facts' `dt` above the `dd` below about 360 px.
  - Under 360 px, tighten the nav gaps or reduce the brand to "D. Tataj".
  - Let the stat values scale with `font-size: clamp(…, 9vw, …)` or wrap the unit onto its own line.

### P2 (worth fixing, not blocking)

- Fig. 05 (E-02 flow diagram) needs sideways scrolling on phones, and the drive-force/slip-check step is off-screen with no visible cue (the aria-label says it scrolls). Add a visible "scroll →" edge fade or a stacked narrow version (`shots/r375-flowchart.png`).
- The E-04 replay poster shows "6.65 s · gate 5/8" with the drone at gate 5, while the readout reads "0.00 s, Gates passed 4 / 8" (`scroll/phone-light-04.png`). Blank the readout until loaded, or match it to the poster frame.
- The "2 m climbed" label in Fig. 04 uses `--signal` text at 3.05:1 (light). Use `--signal-strong`.
- `aria-label` on role-less divs (`.specs`, `.player`): add `role="group"`. Replay canvases: add `role="img"`.
- At 320 px the Fig. 01 `.tablebox` scrolls but is not focusable: add `tabindex="0"` and a label.
- Copy: "Clean: runs 20 and 23 (camera only); clutter: run 26." is internal notation; drop it or explain it. The project list's "Climbed" result is weak next to numbers; consider "2 m climb, −16% time".
- Until a CV exists, add one line by the hero actions: "CV on request: email me".
- Phone Fig. 02 leaves about 200 px of empty space above the model.
- Replay and "Try the hover controller" are 20 px tall. They pass via spacing but are small for thumbs: pad them to 32–44 px.
- Fonts are 147 KB of the 198 KB first load. Consider self-hosting a subset of Archivo for the name and headings.

### Needs Dom (content, not build defects)

1. **A CV PDF**, so the hero and Contact can carry "CV (PDF)". Every recruiter persona asked for it. The markup already has a commented placeholder.
2. **Photos of built hardware:** the printed E-03 frame on a scale and in flight, and the E-02 robot on the pipe. All imagery today is renders.
3. **Video or footage** of the E-02 climb at the challenge, and the E-03 deflection test setup.
4. **Measured E-03 data** behind "within 18%": the measured vs FEA deflection values and the load used.
5. **Security-clearance eligibility statement** (for example "eligible for SC"), if true, for defence primes. Only Dom can confirm it.
6. **Any non-coursework software evidence**, such as other repos, an internship, or a competition, to strengthen the software-recruiter read.

## Verdict

10-second test **PASS** for all three personas; the 30-second read is strong (shortlist: yes, yes, maybe). axe reports **0 violations** in four configurations. Performance is well inside budget: FCP and LCP 0.91 s throttled, JS 21 KB gz, CLS ≤ 0.002. **No P0.** Three P1s remain, all phone layout or navigation mechanics: Fig. 02 clipping, the project-list anchor landing short on phones, and 320 px reflow. The biggest gaps against the benchmark set are content only Dom can supply: a CV and hardware photos.
