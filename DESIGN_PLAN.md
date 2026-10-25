# Design plan: "a living drawing set"

**Goal:** a portfolio that a recruiter remembers a week later and an engineer respects:
visually striking, quirky in small ways, but every animation carries information about
Dom's work. Professional first; delight second; never at the cost of reading speed.

**Decisions so far (24 Oct 2026)**
- Direction: amplify the existing engineering-drawing identity. The site is a drawing set
  that is *alive*: linework draws itself, dimensions measure real things, title blocks fill
  in, annotations point at what matters.
- Motion: rich but purposeful. Signature moments in the hero and in each project, small
  quirks everywhere, and a full `prefers-reduced-motion` fallback for every one of them.
- Hero: the drone flies the page (from real replay data) **and** an interactive physics toy
  (drag the drone; a real controller stabilises it).
- 3D: Dom can export Fusion models (STL/OBJ → glTF) for an interactive frame viewer.

Status key: `[ ]` to do · `[x]` done · `[-]` dropped. Work one phase at a time on a branch,
checkpoint with Dom, merge to `main`.

---

## 0. Foundations (do first; everything else depends on it)

0.1 [x] **Architecture decision:** build-free (Dom, 24 Oct 2026). Split done.
   - Recommended: stay build-free. Split `index.html` into `index.html` + `css/site.css` +
     `js/*.js` ES modules loaded with `<script type="module">`. Load three.js only on the
     frame section, from a pinned CDN (`three@0.170.x` via jsDelivr `+esm`), lazily.
   - Alternative: Vite build with GitHub Actions deploy. Only worth it if JS grows past
     ~3 modules of real complexity.
0.2 [x] **Motion system.** One small module `js/motion.js`:
   - `reveal(el, kind)` driven by a single `IntersectionObserver` (kinds: `draw` for SVG
     strokes, `fill` for title blocks, `count` for numbers, `rise` for text).
   - Shared easing tokens (`--ease`, `--ease-spring`) and durations (150 / 400 / 900 ms).
   - `reducedMotion()` check; every effect has a final-state fallback (no hidden content).
   - A frame budget: pause all rAF loops when their element is off screen or the tab is
     hidden (`visibilitychange`).
0.3 [x] **Performance budget** (checked in CI-like local script with Playwright):
   first contentful paint < 1.2 s on a throttled "Fast 3G / 4x CPU" profile; JS on first
   load < 60 KB gzipped (three.js and replay data lazy); no layout shift > 0.05; 60 fps
   scroll on a mid phone (no scroll-jank from listeners: use `IntersectionObserver` and
   CSS scroll-driven animations where supported, rAF otherwise).
0.4 [x] **Test harness in repo:** move the scratch Playwright checks into `tests/` with a
   `README` line on how to run them (`npx playwright test`), plus visual snapshots of hero,
   each project and About in light/dark, phone/desktop.

## 1. Hero: "flight test" (signature moment)

1.1 [x] **Flight-test strip (Fig. 00).** Decided with Dom (24 Oct 2026): a full-width
   drawing strip at the bottom of the hero, laid out like a two-view drawing sheet.
   - **Plan view:** the real course-1 path from `flights/index.js` (`FLIGHT_POSTER`), gates
     as thick bars with numbered balloon callouts, one gate dimensioned (1.70 m), a start
     mark and a scale bar. A top-down drone glyph (four spinning rotors, turned to its
     heading) flies the path at 3× speed (~4 s) while the true path (blue) and its own
     estimate (dashed orange) plot behind it, with a live readout: time, speed, gate.
   - **Elevation view:** at the finish the drone flips (a card-turn about its axis) along a
     dashed projection line into a side view, where it hovers above a hatched ground line
     with a live height dimension that follows the bob. Phase C's physics toy lives here.
   - Plays on every page load (only while the hero is on screen); REPLAY plays it again.
     Plan and elevation sit side by side on desktop, stacked on phones.
   - Text never waits for it. Reduced motion: the finished drawing, drone hovering still.
1.2 [ ] **Physics toy (opt-in, "PLAY WITH ME" tag next to the parked drone).** Drag the
   drone or flick it; a real cascaded controller brings it back to hover:
   - 2D planar quadrotor model (x, y, θ), thrust + torque inputs, gravity, drag.
   - Outer PD loop on position → attitude setpoint; inner PD on attitude → torque.
   - Live mini readout in drawing style: `Kp 4.0 · Kd 2.2 · θ 12.4° · settling 0.8 s`,
     with two small sliders to change gains (make it unstable on purpose = fun quirk).
   - Wind gust button (orange arrow annotation) to show disturbance rejection.
   - Mobile: touch drag; desktop: drag or arrow keys. Keyboard accessible, with a
     visually hidden description.
   - Shows Dom understands dynamics and control, not just that he can embed an animation.
1.3 [ ] **Headline micro-quirk:** the word "simulate" gets a hand-drawn orange
   underline that draws itself; "build" gets a tiny dimension line under it reading the
   real frame mass (`38 g`) on hover.
1.4 [ ] **Availability block gets a plotter pass:** an orange pen line sweeps along each
   title-block cell in turn on load. The text itself is readable from the first frame. No
   sound anywhere on the site (Dom, 24 Oct 2026).

## 2. Global quirks (small, everywhere, low cost)

2.1 [ ] **Drafting cursor** (desktop, pointer: fine only): a thin crosshair with live
   coordinates in the corner (`x 412.0  y 1188.5 mm`) where the page is treated as a
   1:1 drawing sheet. Hidden over text inputs and for reduced motion.
2.2 [ ] **Sheet-number scroll progress:** the nav shows `SHEET 2 OF 6` updating as you
   scroll through sections, with a thin orange progress bar under the nav.
2.3 [ ] **Revision cloud on hover:** project titles get a hand-drawn "revision cloud"
   outline (the drafting mark for "changed") that draws around them on hover.
2.4 [ ] **Numbers count up** with tabular figures when they enter view (99.5%, −36%,
   38 g, 246 g), once only, 600 ms.
2.5 [ ] **Theme toggle as a light-table switch:** switching dark/light animates a
   blueprint-style "inverse print" wipe across the page (clip-path circle from the
   button).
2.6 [ ] **Copy-email burst** (exists) — keep; add the email "printing" out of a plotter
   line when copied.
2.7 [ ] **Konami-style easter egg:** typing `fpv` anywhere switches the page into
   "acro mode" for 10 s (the hero drone does a flip, page tilts 2° and rights itself).
   Hidden, harmless, memorable.
2.8 [ ] **Console note** for engineers who open DevTools: a small ASCII drawing of the
   frame and a link to the source repo.

## 3. Project signature moments (one per project, each conveys information)

### E-03 Generative frame — "from load case to part"
3.1 [ ] **Interactive 3D frame** (three.js, lazy-loaded when section is near):
   - Dom exports the frame as glTF/GLB (≤ 1.5 MB, Draco-compressed) and, if possible,
     the plate-frame baseline for comparison.
   - Orbit (drag), auto-rotate slowly when idle, matte material with drawing-style
     edge lines (EdgesGeometry) so it matches the site.
   - **Scroll-scrubbed story** (sticky panel, 4 steps, each with one caption):
     1. Design space block + the 8 load-case arrows appear (thrust, arm impact, battery).
     2. Generative "growth": cross-fade from design space to topology (or a recorded
        sequence of Fusion iterations as images if Dom has them).
     3. **FEA overlay:** stress colour map texture (export from Ansys as image or vertex
        colours) with a legend; hover an arm to read max stress and safety factor.
     4. Mass comparison: ghosted plate frame vs generative frame, with the −36% dimension
        line and the 38 g / 246 g / 250 g budget bar from Fig. 03.
   - Fallback (no WebGL / reduced motion): the two existing renders + a static stress
     plot image.
3.2 [ ] **Exploded view on click:** motors, battery, stack slide out along axes with
   leader-line labels (part name, mass in g). Sum of masses animates to 246 g.

### E-04 Drone racing — "see what the drone sees"
3.3 [ ] **Pipeline strip under the replay:** four linked mini-panels (Detect → Measure →
   Fuse → Fly) that light up in sync with the replay clock, showing that frame's
   intermediate result: threshold mask, corner fit, filter covariance ellipse, command
   arrows. Needs extra fields from `vdr.demo` (mask thumbnail, covariance); otherwise
   derive the ellipse from estimate error.
3.4 [ ] **Covariance ellipse on the top view** (shrinking as gates are seen) — a cheap,
   very "engineer" visual.
3.5 [ ] **Benchmark table that sorts and sparks:** hovering a course set highlights its
   bar in a small histogram of pass rates; pooled row pulses once on entry.

### E-02 Pipe-climbing robot — "the model, running"
3.6 [ ] **Live mini-simulation of the Excel model** in JS: pick gear ratio / wheel
   radius / normal force with three steppers; a side-view robot climbs a 2 m pipe with
   the chain load growing, against the 3-minute clock. Slip → wheels spin with a red
   "SLIP" annotation and the setup is rejected, exactly like the Fig. 05 flowchart.
   The chosen drivetrain is preset; shows the 22% predicted improvement vs baseline.
3.7 [ ] **Flowchart (Fig. 05) animates** its loop arrow once per 10 ms "step" while the
   mini-sim runs (ties the diagram to the sim).

### E-01 AI-cost analysis — "the fit, not just the number"
3.8 [ ] **Log-scale scatter that un-skews:** points start on linear axes (clumped,
   skewed), then animate to log₁₀ axes and the power-law line draws through them, R²
   label appears. Uses a small anonymised sample of the dataset (Dom to supply CSV) or
   a faithful synthetic sample clearly labelled "illustrative".

## 4. About & contact

4.1 [ ] **About as a parts list / BOM:** education, skills, experience as BOM rows with
   item numbers and "qty"; hovering a skill highlights which projects used it (draws
   leader lines up to project register entries).
4.2 [ ] **Photography strip** (optional, if Dom supplies 3–6 photos): a horizontal
   "contact sheet" with film-frame numbers, lazy-loaded, captions in drawing style.
4.3 [ ] **Contact as the drawing's approval box:** "APPROVED BY: ____" signature line;
   clicking COPY EMAIL "signs" it with an animated pen stroke, then the burst.

## 5. Quality gates for every feature

- Information first: each animation must answer "what does this show about Dom's work?"
- Readable at frame 0; animations decorate, never gate content.
- Reduced motion: final state, no movement. Keyboard: every interactive toy operable.
- Light and dark theme parity (all colours from tokens).
- Phone: features degrade to tap-to-play or static; no horizontal scroll.
- Performance budget (0.3) passes; rAF loops pause off screen.
- Playwright tests updated, screenshots reviewed at a checkpoint before merging.

## 6. Suggested order (each phase ≈ one session)

| Phase | Items | Why first |
|---|---|---|
| A | 0.1–0.4 | Foundations: split files, motion system, tests. |
| B | 1.1, 1.3, 1.4, 2.2, 2.4 | Hero signature + cheap global polish: biggest first impression. |
| C | 1.2 | Physics toy: the memorable interactive moment. |
| D | 3.1, 3.2 | 3D frame story (needs Dom's glTF + stress image). |
| E | 3.6, 3.7 | Robot mini-sim. |
| F | 3.3–3.5 | Replay pipeline strip (may need drone-repo export changes). |
| G | 2.1, 2.3, 2.5–2.8, 3.8, 4.1–4.3 | Remaining quirks and polish. |

## 7. Needed from Dom

- [ ] Frame model as GLB/glTF (or STL/OBJ; I'll convert), plus plate-frame baseline if any.
- [ ] Ansys stress/deflection result as an image (top view) or per-vertex export.
- [ ] Optional: images of generative iterations from Fusion.
- [ ] Optional: robot CAD export (for a later 3D/2.5D side view) and the Excel model's
  key parameters (motor torque curve, gear ratios tried, μ, masses) for the mini-sim.
- [ ] Optional: AI-cost CSV (or permission to use an illustrative sample).
- [ ] Optional: 3–6 photographs for the contact-sheet strip.

## 8. Open design questions (ask before the relevant phase)

- Build-free vs Vite (0.1).
- ~~Opt-in sound~~ — decided: no sound.
- Easter egg trigger word and whether to hint at it (2.7).
- How playful the physics toy may get (allow "unstable" gains, or clamp to stable?).
