# Interaction and motion review: Dom Tataj portfolio

Reviewer: interaction-motion (prefix MOT). 20 Nov 2026, branch `claude/design-review`, site served from the working tree.

## Method

I read `review/BRIEF.md`, `DESIGN_PLAN.md` (Phase R and §5 quality gates), `IMPROVEMENTS.md`, `README.md`, the baseline notes and metrics, and every module that moves: `motion.js`, `reveals.js`, `hero-drone.js`, `hero-flight.js`, `hover-rig.js`, `frame3d-boot.js` / `frame3d.js`, `replay.js`, `bench.js`, `climber.js`, `scaling.js`, `cursor.js`, `contact.js`, `theme.js`, `acro.js`, `contact-sheet.js`, plus the motion rules in `css/site.css`. I went through the baseline `scroll/phone-light-*` and `scroll/laptop-light-*` sequences. I then ran Playwright probes, kept in `review/scratch/interaction-motion/`:

- `phone.js`, `phone-f3.js`, `rig.js`: iPhone 13 metrics with `hasTouch`. They use CDP touch swipes on Fig. 01 and the rig, time Fig. 00's flight, measure the pinned track, and read the count-up text before and during reveal.
- `desktop.js`, `desktop2.js`, `navjump.js`: 1440×900. They count rAF callbacks per second at each section (by wrapping `requestAnimationFrame`), and test the cursor, hover, tab order, nav jumps, the theme wipe, the copy burst, acro, the bench, the scatter, the climber and the hero drone's climb against scroll.
- `reduced.js`: `prefers-reduced-motion: reduce` on phone and laptop.
- `cost.js`, `cost2.js`: main-thread time from CDP `Performance.getMetrics`, with ×4 CPU throttling, per region.
- `aria-count.js`, `replay-kbd.js`, `acro.js`, `positions.js`: the accessibility tree before reveal, the replay's keyboard behaviour before LOAD, acro's layout effect, and section positions measured in screens.

WebGL ran in SwiftShader, so absolute frame costs are indicative, not device numbers.

## Scores

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| Purposefulness | 6 | The project figures carry real data (recorded flight, Fusion model, Excel model, Epoch dataset). The hero's always-on motion goes to a decorative drone, and the count-ups animate constraints (a safety factor, a modal limit) that mean nothing mid-count. |
| Smoothness | 7 | Transforms, cross-faded frames and critically damped springs throughout. The hero drone's hover is the costliest loop (64% main-thread busy on a ×4 phone against a 26% idle baseline). Fig. 00 rebuilds its whole path every frame, indefinitely. |
| Discoverability | 6 | Fig. 01's progress-filled view tabs and the "Drag me" label are good. The controller rig hides behind a 13 px caption link, the bench's chart-on-header-click has no cue, and the replay shows two competing primary actions. |
| Interruptibility and control | 7 | Replay, Back to the flight, Pause, scrub, view buttons and Reset all work, and the scroll-scrub is fully reversible. The greyed Play is still keyboard-operable before LOAD and gets stuck on "Pause". Fig. 00 can't be skipped to its end state. |
| Reduced-motion fallbacks | 9 | Thorough. Zero rAF callbacks at rest, final states everywhere (Fig. 00 hovering, climber at 58.5 s, scatter on log axes), Fig. 01 unpinned, real numbers, smooth scroll off, no burst, no tilt. |
| Touch behaviour | 6 | Fig. 01 is right (`pan-y`: vertical swipes scroll, horizontal drags turn the model). The open rig traps vertical scrolling over 57% of the screen, and the captions speak mouse ("point at a part"). |
| Scroll-linked effects | 4 | Fig. 01's pin costs 2.2 screens of scrolling and puts E-03's key figures 3.5 screens below its title on a phone. The hero drone climbs away so fast it leaves its own label floating in empty space. |
| Cursor and micro-interactions | 7 | The crosshair is subtle, mouse-only and hidden over controls, and the hover lifts are restrained. The fixed mm readout sits over body text bottom right, the cursor stays on over figures with their own hover, and acro's tilt makes the page scroll sideways. |
| **Overall** | **6** | Every reveal has a reduced-motion fallback and the figures are clearly Dom's own work. Scroll budget, frame-0 content and hero priorities need fixing before a 30-second phone visit fully lands. |

## Motion inventory

| Element | Trigger | What it shows about Dom's work | Verdict |
|---|---|---|---|
| Hero drone hover: bob, roll, ±8° turn through 33 frames (`hero-drone.js`, `index.html:65-73`) | Load; runs while visible, settles after 45 s idle | That E-03's drone exists as a real CAD model (drawn in Fig. 01's style). The motion itself says nothing about it. | **Simplify**: still drawing, or bob only; it is the costliest loop |
| Hero drone climb-away (`hero-drone.js:51-55`) | Scroll, first ~450 px | Nothing | **Cut** (it orphans the tag, see MOT-06) |
| Availability "live" dot pulse (`site.css:128-131`) | Always | That Dom is available now (a status light) | Keep |
| Fig. 00 flight strip: plan path, estimate, gate balloons, flip into elevation, hover with live height (`hero-flight.js`, `index.html:97-109`) | 50% of the strip in view; Replay | Real recorded course-1 flight from E-04: the estimate tracks the truth, 8/8 gates, 1.5 m hover | **Keep and promote**; draw the result at frame 0 (MOT-03, MOT-04) |
| Hover test rig: planar quad, cascaded PD, gains, gust, failsafe crash (`hover-rig.js`, `quad.js`) | "Try the controller →" | Controls understanding: Routh–Hurwitz limit, damping, failsafe. The strongest autonomy and systems evidence on the page. | **Keep and promote** (MOT-08); fix touch (MOT-05) |
| Fig. 01 3D model: pinned scroll-scrub through Assembly → Exploded → Frame only, auto-turn, drag, part picking (`frame3d.js`, `index.html:134-166`) | Scroll while pinned; view buttons; drag; tap or hover on parts | Real Fusion assembly, parts list, measured motor spacing (96.0 / 135.8 mm) | **Keep the figure, shorten the scroll** (MOT-02) |
| Count-ups on `.specs .n` and `.photo-stats b` (`motion.js:98-119`, `reveals.js:12-14`) | 20% in view, once | Nothing. Counting a safety factor from 0.0 or a ">300 Hz" constraint from >0 misstates them. | **Cut** (MOT-01) |
| `.sheet-meta` chip stagger, the "fill" reveal (`reveals.js:9`) | In view, once | Nothing; the "Result" chip arrives last | **Demote**: drop it or make it instant (MOT-12) |
| SVG "draw" reveals: Fig. 02 mass bars, Fig. 05 flowchart, Fig. 06 bars (`motion.js:49-93`) | In view, once | Bars grow to scale from zero, which reads as a measurement | Keep |
| Bench chart grow and pooled-row pulse (`bench.js`, `site.css:503-504`) | 40% in view; header click | Gates missed per set; the pooled row is the one to compare | Keep; add a cue (MOT-08) |
| Climber run at ×10, chain and plot, flowchart dot (`climber.js`) | 50% in view; Climb; sliders | The team's Excel model, corrected: slip check, 58.5 s against the 3-minute limit | Keep |
| Scatter "un-skew": linear for 700 ms, then 1.7 s sweep to log axes and the fit (`scaling.js`) | 45% in view; Linear/Log toggle; hover names a point | Why the log transform: the data's skew, then the P ∝ N^0.55 fit | Keep |
| Replay and pipeline strip (`replay.js`, `pipeline.js`) | LOAD, Play, scrub, course and sensing toggles | What the drone sees and how each stage acts (detect, measure, fuse, fly) | Keep; fix the pre-LOAD controls (MOT-07) |
| Crosshair cursor and mm readout (`cursor.js`, `site.css:651-664`) | Mouse move | Personality only. Kept by Phase R. | Keep; tidy (MOT-11) |
| Copy-email burst (`contact.js`) | Copy email | That the copy worked (the label also says "Copied") | Keep; it's user-initiated, ≤1.7 s, with a reduced-motion fallback |
| Theme wipe, a view transition circle from the button (`theme.js`) | Toggle | None; continuity only | Keep |
| Acro mode: badge, 2° page tilt, Fig. 00 flip (`acro.js`, `site.css:666-675`) | Type "fpv" | FPV-pilot personality | Keep; fix overflow (MOT-10) |
| Contact-sheet paging and photo hover lift (`contact-sheet.js`, `site.css:695-706`) | Buttons, swipe, keys | Photography, kept secondary | Keep |
| Card lift on project register and buttons (`site.css:174-193`) | Hover | Affordance | Keep |

**Generic/template look: no.** The motion is bespoke and data-driven: a recorded flight, the real Fusion model, the team's Excel model, a live PD controller. Only the card-lift hovers and the confetti-style copy burst are stock patterns.

## Findings

### MOT-01 Count-ups put zeros in the page until each number is scrolled to
- Severity: P1 (clearly hurts)
- Where: `.specs .n` and `.photo-stats b`. `index.html:168-173`, `352-357`, `473-478`, `514-517`; `js/motion.js:98-119` (`node.nodeValue = fmt(0)` at registration); `js/reveals.js:12-14`. Screenshot: `review/scratch/interaction-motion/phone-countup.png`.
- Evidence: Before a visitor reaches them, the DOM text is literally `0.0 | >0Hz | −0%mass | 0g | 0m | 0+ | −0%time | 0 | 0.00 | ≈0kW | 0+ | 0+`. The accessibility tree for E-03 reads "Safety factor 0.0 Modal constraint >0Hz Vs plate design −0%mass Printed frame 0g" (`aria-count.js`). Find-in-page for "390,000+" fails until About has been scrolled into view. A screen-reader user reading by virtual cursor never scrolls, so the observer never fires and they hear the zeros. The count also misstates the numbers it animates: a safety factor of 0.0 and a "> 0 Hz" modal constraint are not quantities that grow. This breaks §5's "readable at frame 0" and "every animation carries information".
- Why it matters: An engineer or hiring manager using a screen reader, find-in-page or reader mode gets wrong numbers. For everyone, the motion adds nothing that the number doesn't already say. This reopens DESIGN_PLAN 2.4, for the reasons above.
- Fix: Remove the `count` reveal (drop the `.specs .n, .photo-stats b` block in `reveals.js:12-14`), so the numbers are static and correct at frame 0. If Dom wants to keep some motion, never write to the real text node. Instead, animate an `aria-hidden` overlay copy and keep the true value in the DOM, and limit it to measured results (−36%, 38 g, −16%), never constraints (1.5, >300 Hz).
- Effort: S

### MOT-02 Fig. 01's pinned scroll-scrub costs 2.2 screens and pushes E-03's key figures 3.5 screens below its title on a phone
- Severity: P1 (clearly hurts)
- Where: `.f3-track.is-3d.pinned { height: calc(var(--f3-h) + 220vh) }` at `css/site.css:305-308`, `322`, `326`; `js/frame3d.js:41-44` (`MOVE`, `STEP_AT`); `.specs` placed after the figure at `index.html:168`. Screenshots: `review/baseline/scroll/phone-light-03.png` to `-06.png`, `review/scratch/interaction-motion/phone-fig01-pinned.png`.
- Evidence: The pinned track is 2521 px on a phone (1786 px of scroll while pinned, 2.2 screens, 12.6% of the page) and 2791 px on a laptop (1980 px pinned). On the phone the figure fills the whole screen under the nav. Measured in screens from the top on a phone: E-03 title 2.95, E-03 key figures 6.49, E-04 (the autonomy project) 8.18. On a laptop: 1.76, 5.15, 5.93. It isn't a trap: a vertical swipe on the model scrolls the page (`touch-action: pan-y`, a 300 px swipe moved 285 px), and four 400 px swipes pass the track. A horizontal drag turns the model without scrolling. Each view holds for only ~0.16 of the track, about 290 px on a phone, so most of the pinned distance is spent between views.
- Why it matters: The 30-second phone reader is a recruiter. For three screens they see one model turning while the E-03 numbers (1.5 SF, −36% mass, 38 g) and all of E-04 wait below. This is the biggest scroll tax on the page.
- Fix: (1) Cut the pinned distance to about 100vh (`+ 100vh`, with `MOVE = [[0.12, 0.38], [0.62, 0.88]]` so the holds stay readable). (2) Don't pin under 600 px wide: in `frame3d-boot.js:28` add `&& innerWidth >= 600` to the `pinned` test. The existing unpinned layout and view buttons already work (as under reduced motion). (3) Move `.specs` (`index.html:168-173`) above `#f3-track`, so E-03's key numbers come straight after its summary.
- Effort: S

### MOT-03 The hero's motion goes to a decorative drone while the data-carrying flight strip sits below the fold
- Severity: P1 (clearly hurts)
- Where: `.hero-drone` at `index.html:65-73` (top right of the hero, animated); `#flight` (Fig. 00) at `index.html:97-109`. Screenshots: `review/scratch/interaction-motion/laptop-fold-t1.5.png`, `review/baseline/scroll/phone-light-00.png`, `phone-light-01.png`.
- Evidence: At 1440×900 the Fig. 00 strip's top is at y = 849 of 900, so only 51 px show. It takes off only once half of it is in view (`hero-flight.js:275-277`), so a visitor who doesn't scroll never sees it move. On a phone it starts 1.86 screens down, below four register cards. Meanwhile the hovering, turning and climbing CAD drawing (mechanical, E-03) holds the prime hero slot and is the only thing moving in the first screen.
- Why it matters: Since 20 Nov the targeting is software, autonomy and systems first. Fig. 00 is the only piece of autonomy evidence (a recorded flight of a vision-only drone, the estimate against the truth) above E-04, eight phone screens down. Recruiters see the decorative motion and miss the informative one. This reopens H.1, because of the retargeting.
- Fix: Swap priorities. Put a compact Fig. 00 plan view (or the whole strip) in the `.hero-drone` grid cell on wide screens, and directly under the CTAs on phones, ahead of the register. Then either drop the hero drone or reduce it to a still thumbnail inside the E-03 register card. If the drone stays, stop its motion (see MOT-06) so the flight is the hero's one moving thing.
- Effort: M

### MOT-04 Fig. 00 is half-empty at frame 0 and takes about 5 s to make its point
- Severity: P2 (polish)
- Where: `js/hero-flight.js:10-12` (`SPEED 3`, `LEAD 0.5`, `FLIP 0.8`), `162-232`. Screenshots: `review/baseline/scroll/phone-light-02.png` (empty elevation), `review/scratch/interaction-motion/phone-fig00-mid.png`.
- Evidence: Nominally the flight takes 0.5 + 10.85/3 + 0.8 ≈ 4.9 s. On the phone probe, "LANDED" came 6.2 s and "HOVER" 7.7 s after the strip entered view. Until then the elevation view, the lower half of the strip on phones, is blank apart from GROUND, and the plan view shows only the gates and part of the path. A visitor who scrolls past at normal speed (see the baseline phone sequence) sees an empty panel. On a 375 px phone the course takes about a third of the plan width: START overlaps balloon 1, and the blue truth and dashed estimate are hard to tell apart.
- Why it matters: §5 says "readable at frame 0; animations decorate, never gate content". The figure's message (the estimate tracks the truth through 8/8 gates) is gated on watching 5 s.
- Fix: Draw the full truth and estimate paths faintly at frame 0, and the hovering drone with its 1.50 m height dimension in elevation from the start. Then let the glyph trace over the faint path, drawing it solid. Let a tap on the strip skip to the end. On phones, scale the plan to the course's bounding box, with less padding.
- Effort: S

### MOT-05 On phones the open hover rig traps vertical scrolling and opens under the nav
- Severity: P2 (polish)
- Where: `.flight .rig-svg { touch-action: none }` at `css/site.css:230`; `.flight.rig .fv { height: 460px }` at `site.css:227`; `pointerdown … e.preventDefault()` at `js/hover-rig.js:330-339`; `open()` at `hover-rig.js:360-367`. Screenshots: `review/scratch/interaction-motion/phone-rig-open.png`, `phone-rig-full.png`.
- Evidence: After "Try the controller →", a 315 px vertical swipe inside the rig scrolled the page 0 px. The rig is 460 of 812 px (57% of the screen), so a visitor must find the margins or the controls to scroll on. After opening, the rig's top was at −4.7 px with a ~77 px two-row nav over it, which hides the θ / error / settling readout and the 6 s error trace.
- Why it matters: Phone visitors who try the best controls demo on the page get stuck. The readouts that make it engineering, not a toy, are hidden.
- Fix: Use `touch-action: pan-y` on `.rig-svg`. Call `preventDefault` and `setPointerCapture` only when the pointerdown hits the drone (the `held` branch). A tap still moves the setpoint, because pointerup without a move is not a pan. On `open()`, scroll the figure to just below the nav (`fig.scrollIntoView({ block: "start" })`, with `scroll-margin-top: var(--nav-h)` on `#flight`).
- Effort: S

### MOT-06 The hero drone climbs away and leaves its label, glow and floor behind, and it is the costliest loop
- Severity: P2 (polish)
- Where: `js/hero-drone.js:11`, `32-33`, `51-55` (`CLIMB = 220`, `lift = CLIMB * p * p`); `.hd-tag`, `.hd-floor` and `::before` in `css/site.css:135-166`. Screenshot: `review/scratch/interaction-motion/laptop-drone-climb-300.png`.
- Evidence: Laptop drone art top by scroll position: 163 px at scrollY 0, −29 at 150, −304 at 300, −516 at 450. By 300 px of scroll the drawing has gone off the top, but the "E-03 · Generative frame" pill, the perspective floor and the orange glow stay where they were, labelling empty space. Cost on a phone with ×4 CPU and a settled page: 64% main-thread busy (38.8 rAF/s, 13.5% style and layout) at the top, against 26% with nothing animating (`cost2.js`). The image is `mix-blend-mode: multiply` and moves under a `backdrop-filter` tag, and `--s`/`--o` custom properties are set on the shadow every frame.
- Why it matters: It's a visible loose end in the first scroll every visitor makes, and battery and jank cost on mid phones for motion that carries no information.
- Fix: Remove the climb (`lift = 0`), or move `.hd-tag`, `.hd-floor` and the glow with `.hd-art`. Reduce the hover to the bob alone, and stop it after about 10 s (set `IDLE` to 10000) instead of 45 s. Animate the shadow with `transform` and `opacity` only, not custom properties.
- Effort: S

### MOT-07 Before LOAD, the replay's greyed Play and scrubber still work from the keyboard, and Play gets stuck on "Pause"
- Severity: P2 (polish)
- Where: `.controls[aria-disabled="true"] { pointer-events: none }` at `css/site.css:443`; `#play`, `#scrub` at `index.html:250-251`; `play()` at `js/replay.js:209-217`; `#load` inside the camera view at `index.html:236`. Screenshot: `review/baseline/scroll/phone-light-09.png`.
- Evidence: The controls are only visually disabled. They're tab stops 29 and 30 in the tab order. Pressing Enter on Play before LOAD changed its label to "Pause" while the clock stayed at 0.00 s and nothing visible played (`replay-kbd.js`). The poster also mixes signals: the camera overlay reads "6.65 s · 6.6 m/s · gate 5/8", while the scrubber says 0.00 s and the readouts show "–". The page has two primary actions: an orange "Load replay" inside the camera frame and a greyed "Play" below.
- Why it matters: An engineer who reaches the replay by keyboard finds a control that lies. The double action costs everyone a moment.
- Fix: Set the real `disabled` attribute on `#play` and `#scrub` until a flight loads. Better, make Play the single entry point: before LOAD, label it "Play recording" and have it run the LOAD handler. Then the camera overlay button can go.
- Effort: S

### MOT-08 The controller rig and the bench's chart-on-click are hard to discover
- Severity: P2 (polish)
- Where: `#rig-open`, a 13 px `.link-btn` at the right end of Fig. 00's caption (`index.html:108`, `css/site.css:203`); bench header buttons (`js/bench.js:22-33`), whose caption (`index.html:332`) doesn't mention them. Screenshots: `review/baseline/scroll/laptop-light-01.png`, `review/scratch/interaction-motion/laptop-bench.png`.
- Evidence: The hover rig is a live cascaded-PD model with Routh–Hurwitz stability zones and a failsafe. It's reachable only through an orange caption link on the same line as "Replay ↺", 13 px, bottom right of the strip. Nothing in the bench says that clicking a column header charts and sorts it. The only cues are a pointer cursor and an underline on the active header.
- Why it matters: For autonomy and systems roles, the rig is the most persuasive interactive on the site. Engineers who would enjoy it won't find it, and recruiters won't know it exists.
- Fix: Give the rig a real pill button (`.btn`) inside the strip, top right of the elevation panel, with a one-line hook such as "Tune the hover controller". If E-03/E-04 copy changes, say in a sentence that it is Dom's drone's controller. For the bench, add "Click a column to chart it" to the Fig. 03 caption.
- Effort: S

### MOT-09 Fig. 00 never idles, and the replay keeps animating off screen
- Severity: P3 (nice to have)
- Where: `js/hero-flight.js:162-179`, `267` (`loop(box, …)` with no idle stop); `js/replay.js:200-214` (a raw `requestAnimationFrame(tick)`, not `loop()`).
- Evidence: After landing, every frame rebuilds the 219-point truth polyline string and the estimate polyline, and the hover bob runs for as long as the strip is on screen (53 rAF/s, 7.5% script on a ×4 phone). The hero drone stops after 45 s idle; this loop doesn't. The replay's tick isn't the shared `loop()`, so it keeps drawing the camera, map and four pipeline panels after the player scrolls away, until the flight ends (up to ~11 s). That's a minor breach of §5's "rAF loops pause off screen".
- Why it matters: Battery and smoothness on phones; consistency with Dom's own gate.
- Fix: In `render()`, skip the polyline rebuild once `landed` (set the full points once). Give the strip the same idle rule as `hero-drone.js` (stop the bob after N s with no input). Drive the replay with `loop(document.querySelector(".player"), …)`.
- Effort: S

### MOT-10 Acro mode's tilt makes the page scroll sideways
- Severity: P3 (nice to have)
- Where: `main.tilt { animation: gust 1.8s }` at `css/site.css:668-675`; `js/acro.js:41-44`. Screenshot: `review/scratch/interaction-motion/laptop-acro-midtilt.png`.
- Evidence: Mid-tilt at 1440 px wide, `document.documentElement.scrollWidth` goes from 1440 to 1682. Rotating the whole 13,000 px `<main>` by 2° swings its far corners outside the viewport, so browsers with classic scrollbars show a horizontal scrollbar for 1.8 s, and the layout jumps.
- Why it matters: It's a small blemish, and it contradicts the "no horizontal scroll" gate.
- Fix: Add `html.acro { overflow-x: clip; }` (the class is already set for the 10 s), or `body { overflow-x: clip }`.
- Effort: S

### MOT-11 The cursor's mm readout covers body text and stays on over figures that have their own hover
- Severity: P3 (nice to have)
- Where: `js/cursor.js:8` (`SKIP`); `.dc-read` at `css/site.css:659-663`. Screenshots: `review/scratch/interaction-motion/laptop-bench.png` (readout over the note text bottom right), `laptop-scaling-hover.png`.
- Evidence: The fixed readout ("X 185.2 Y 1743.3 MM") sits bottom right over paragraph text on narrow-margin layouts. Over Fig. 07's scatter, the crosshair ticks and readout show alongside the scatter's own point tooltip, because `.scaling` isn't in `SKIP` (only `canvas, .rig-svg, .f3-view, .bench-chart` are).
- Why it matters: Two cursors over a data plot read as one data cursor, and it isn't one. Text under the readout is partly obscured.
- Fix: Add `.scaling, .climb-stage, .climb-plot, .pipe, .player` to `SKIP`. Hide `.dc-read` while the pointer is within about 200 px of the bottom-right corner, or give it `inset: auto 16px 16px auto` with a smaller footprint. The crosshair stays, per Phase R.
- Effort: S

### MOT-12 Mouse-only wording on touch, and the project result chip fades in last
- Severity: P3 (nice to have)
- Where: Fig. 01 captions in `data-cap` at `index.html:142-143` ("Drag to turn it; point at a part to name it", "Point at a part, or a row of the parts list"); `.sheet-meta` "fill" reveal at `js/reveals.js:9`. Screenshot: `review/scratch/interaction-motion/phone-countup.png` (the "Result: Completed the climb" chip still pale).
- Evidence: On touch, tapping is what picks a part (`frame3d.js:526-527`), but the caption says "point at". The chip stagger (60 ms each) fades the chips in left to right, so the outcome chip, which is the one a recruiter wants, arrives last and is pale in a scroll screenshot.
- Why it matters: Phone readers get instructions written for a mouse, and the result is the last thing to appear.
- Fix: Use "tap" wording under `(hover: none)`. In `frame3d-boot.js`, swap the `data-cap` text when `matchMedia("(hover: none)")` matches. Drop the `.sheet-meta` fill reveal, or make it a single 150 ms fade.
- Effort: S

### MOT-13 The rig's gain sliders barely move with arrow keys
- Severity: P3 (nice to have)
- Where: `#kp`, `#kd` (`min 0 max 1000 step 1`) at `index.html:103-104`.
- Evidence: 60 ArrowRight presses took Kp from 6.0 to 8.2. Reaching the 42.7 stability limit, which is the point of the toy, takes about 330 presses (PageUp helps, but few people know it).
- Why it matters: The keyboard path through the most technical toy is technically there but impractical.
- Fix: Use `step="10"` (a 1% log step), or handle ArrowLeft/Right on the inputs to move about 2.5% of the range per press.
- Effort: S
