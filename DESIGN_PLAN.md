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
1.2 [x] **Hover test rig (physics toy).** Decided with Dom (26 Oct 2026): TRY THE CONTROLLER
   expands the strip into an elevation-view test rig; gains may go unstable; ground hits crash
   and reset.
   - Model (`js/quad.js`, no DOM): planar quadrotor (x, z, θ) with the real 246 g mass,
     thrust-to-weight 4, motor lag 30 ms, drag; cascaded PD: position loop → thrust vector,
     fixed attitude loop (ωn 20 rad/s, ζ 0.7) → torque.
   - Drag the drone (a spring "hand"), click or arrow keys to move the setpoint, GUST, RESET.
     Readout: tilt, error, thrust, settling time; a 6 s error trace; the s-plane with the
     closed-loop poles of the linearised model, right half-plane hatched.
   - Gain sliders (Kp log 0.5–80, Kd −2–14) show their unstable zones in red from the
     Routh–Hurwitz conditions (stable iff 0 < Kd < 28 and Kp < Kd(28 − Kd)/1.96; default
     Kp 6, Kd 3.4, limit 42.7).
   - Past the limit the saturated tilt makes a limit cycle, so an oscillation failsafe (four
     tilt reversals past 25° in 4 s) cuts the motors, as a real flight controller would; it
     tumbles, crashes with an IMPACT note and debris, and restarts.
   - Loaded on first use (`js/rig-button.js`), so first-load JS is unchanged.
1.3 [x] **Headline micro-quirk:** the word "simulate" gets a hand-drawn orange
   underline that draws itself; "build" gets a tiny dimension line under it reading the
   real frame mass (`38 g`) on hover.
1.4 [x] **Availability block gets a plotter pass:** an orange pen line sweeps along each
   title-block cell in turn on load. The text itself is readable from the first frame. No
   sound anywhere on the site (Dom, 24 Oct 2026).

## 2. Global quirks (small, everywhere, low cost)

2.1 [x] **Drafting cursor** (done in phase G, subtle as Dom chose): the pointer stays;
   four short crosshair ticks follow it and a corner readout gives its position on the
   page in mm (96 px to the inch). Mouse only; hidden over links, buttons, controls and
   the interactive figures, and for reduced motion.
2.2 [x] **Sheet-number scroll progress:** the nav shows `SHEET 3/7 E-04` (cover, four
   projects, About, Contact), the number ticking over as you scroll, with a thin orange
   progress bar under the nav.
2.3 [x] **Revision cloud on hover** (done in phase G): round each register entry (title
   and line below) and each sheet's title.
2.4 [x] **Numbers count up** with tabular figures when they enter view (spec strips and the
   Unsplash stats), once only, about 0.9 s. Compound values (400×300, P ∝ N^0.55) stay put.
2.5 [x] **Theme toggle as a light-table switch** (done in phase G): a view transition
   with the new theme clipped to a circle growing from the button; instant without view
   transitions or with reduced motion.
2.6 [x] **Copy-email burst** (done in phase G): the email prints again behind an orange
   plotter head, then 4.3's signature, then the burst.
2.7 [x] **Easter egg** (done in phase G): typing `fpv` puts the page in acro mode for
   10 s (ACRO badge with a countdown, the page tilts 2° and rights itself, the hero drone
   flips). Hinted by a small line at the foot of the page, as Dom chose, and in 2.8.
2.8 [x] **Console note** (done in phase G): the frame in characters, both repos, the hint.

## 3. Project signature moments (one per project, each conveys information)

### E-03 Generative frame — "from load case to part"
3.1 [x] **Interactive 3D frame** (done in phase D, as Fig. 01). What was built, from
   Dom's answers ("views from the real model", "scroll-driven, pinned", "drawing style,
   colour on hover", "names only for now"):
   - The real Fusion assembly (`models/frame.glb`, 47 parts, 187 KB) in three.js r170,
     vendored in `js/vendor/three`. Nothing loads until the visitor has scrolled and the
     figure is within a screen of view, so first-load JS is unchanged.
   - Drawn like the site: matte surfaces plus ink lines found from a normals, depth and
     part-identity pass (outlines thicker than creases, a line at every join between
     parts). Real materials fade in for whatever is picked out.
   - Three views, scrubbed by scroll while the figure is pinned under the nav:
     ASSEMBLY (turns slowly; drag or fling it), EXPLODED (parts move out in turn, with
     numbered balloons keyed to a parts list), FRAME ONLY (plan view, with the motor
     spacing and diagonal dimensioned from the model: 96.0 and 135.8 mm).
   - Parts list (drawing BOM): hovering or tapping a row or a part picks it out.
   - Reduced motion or a short screen: not pinned; the view buttons switch views at once.
     No WebGL 2, or the model fails to load: the two Fusion renders, as before.
   - Still to come when Dom sends them: a STRESS view (Ansys result as an image or vertex
     colours), the plate-frame baseline as a ghost for the −36% comparison, part masses.
3.2 [x] **Exploded view** (done in phase D, as the EXPLODED view of 3.1). Labels carry
   names only for now; masses (and a sum counting to 246 g) need Dom's part masses.

### E-04 Drone racing — "see what the drone sees"
3.3 [x] **Pipeline strip under the replay** (done in phase F). Four panels follow the
   replay's clock, all from the recording: DETECT (the colour mask with the fitted squares),
   MEASURE (every valid PnP pose of the largest square, in plan, so an ambiguous sighting
   shows two), FUSE (the filter's 95% ellipse against the truth, and its uncertainty over the
   flight with handoffs and rejections marked), FLY (the commands as mode-2 sticks). A stage
   that acted gets an orange rule; a chi-squared rejection or re-initialisation, a red one.
   The extra fields come from `tools/export_flights.py`, which runs vision-drone-racing from a
   checkout without changing it (Dom's choice). The replay now flies run 25's clutter world.
3.4 [x] **Covariance ellipse on the top view** (done in phase F): the same 95% ellipse,
   around the estimate.
3.5 [x] **Benchmark table that sorts and sparks** (done in phase F): Fig. 03 shows the clean
   benchmark (run 20) beside the orange-clutter one (run 25), as Dom chose. A column header
   charts that column as gates missed per set (zero baseline, one scale) and sorts by it; a
   set's row and bar pick each other out; the pooled row pulses once in view.

### E-02 Pipe-climbing robot — "the model, running"
3.6 [ ] **Live mini-simulation of the Excel model** in JS: pick gear ratio / wheel
   radius / normal force with three steppers; a side-view robot climbs a 2 m pipe with
   the chain load growing, against the 3-minute clock. Slip → wheels spin with a red
   "SLIP" annotation and the setup is rejected, exactly like the Fig. 04 flowchart.
   The chosen drivetrain is preset; shows the 22% predicted improvement vs baseline.
3.7 [ ] **Flowchart (Fig. 04) animates** its loop arrow once per 10 ms "step" while the
   mini-sim runs (ties the diagram to the sim).

### E-01 AI-cost analysis — "the fit, not just the number"
3.8 [ ] **Log-scale scatter that un-skews:** points start on linear axes (clumped,
   skewed), then animate to log₁₀ axes and the power-law line draws through them, R²
   label appears. Uses a small anonymised sample of the dataset (Dom to supply CSV) or
   a faithful synthetic sample clearly labelled "illustrative".

## 4. About & contact

4.1 [x] **About as a parts list / BOM** (done in phase G): grouped rows with item
   numbers; each skill has a qty (projects that used it) and links to them, which show
   the project's title on hover. No leader lines: the register is a page away.
4.2 [ ] **Photography strip** (optional, if Dom supplies 3–6 photos): a horizontal
   "contact sheet" with film-frame numbers, lazy-loaded, captions in drawing style.
4.3 [x] **Contact as the drawing's approval box** (done in phase G): drawn by, status,
   approved by and date; COPY EMAIL signs it with a pen stroke (a generic scribble: the
   visitor approves), sets Approved and today's date, then the burst.

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
| D | 3.1, 3.2 | 3D frame story. Done; a STRESS view waits on the Ansys image. |
| E | 3.6, 3.7 | Robot mini-sim. |
| F | 3.3–3.5 | Replay pipeline strip. Done, with an exporter here and the clutter world. |
| G | 2.1, 2.3, 2.5–2.8, 3.8, 4.1–4.3 | Done except 3.8 (Dom's MATLAB coursework and data) and 4.2 (Dom's photos). |

## 7. Needed from Dom

- [x] Frame model (received as OBJ, 26 Oct 2026; converted to `models/frame.glb`).
- [ ] Plate-frame baseline model, if any (a ghost in Fig. 01 for the −36% comparison).
- [ ] Part masses (motor, prop, battery, stack, camera...) for the parts list and balloons.
- [ ] Ansys stress/deflection result as an image (top view) or per-vertex export.
- [ ] Optional: images of generative iterations from Fusion.
- [ ] Optional: robot CAD export (for a later 3D/2.5D side view) and the Excel model's
  key parameters (motor torque curve, gear ratios tried, μ, masses) for the mini-sim.
- [ ] Optional: AI-cost CSV (or permission to use an illustrative sample).
- [ ] Optional: 3–6 photographs for the contact-sheet strip.

## 8. Open design questions (ask before the relevant phase)

- Build-free vs Vite (0.1).
- ~~Opt-in sound~~ — decided: no sound.
- ~~Easter egg trigger word and whether to hint at it~~ — decided: `fpv`, hinted at the foot of the page.
- ~~How playful the physics toy may get~~ — decided: unstable gains allowed, with a failsafe.
