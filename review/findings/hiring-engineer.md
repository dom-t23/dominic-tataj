# Design review: hiring engineer (autonomy / embedded / robotics software, mechanical background)

## Method

I read `review/BRIEF.md`, `DESIGN_PLAN.md` (Phase R and §5), `IMPROVEMENTS.md`, `README.md` and
`review/baseline/NOTES.md`. Then I read the four project articles in `index.html` (#e-03 L122–216,
#e-04 L219–339, #e-02 L342–460, #e-01 L463–498) closely and checked every number across the summary,
spec cards, prose, chips and captions. Where a number comes from data or code I traced it back to the
source: `flights/*.js`, `tools/benchmark_table.py`, `tools/scaling_data.py`, `js/data/scaling.js`,
`js/climber.js`, `js/quad.js`, `js/hero-flight.js`, `js/motion.js` and `js/reveals.js`. I went through
the laptop scroll sequence (`review/baseline/scroll/laptop-light-00…14.png`). On the running page at
1440×900 (Playwright, SwiftShader WebGL) I drove these figures: Fig. 00's flight and "Try the
controller" rig (gust; Kp pushed to 62, past the 42.7 limit); Fig. 01's views; the replay (Load,
Play, Course 3 with the IMU, scrubbing through the χ² rejections); a sort on Fig. 03's column header;
Fig. 04's climb (slip at N = 10 N, G = 100, a full run); and Fig. 07 (log axes, pointing at a point).
The page logged no console errors. Scripts and screenshots are in `review/scratch/hiring-engineer/`.
Two checks I wrote myself are `climb-grid.cjs` (re-runs the page's climb model on a grid and steps
the sheet's 10 ms explicit Euler) and `fit.mjs` (refits Fig. 07's 603 points and computes a 95%
prediction interval for the GPT-5 estimate).

## Scores

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| Ownership clarity | 6 | E-04 is unusually candid about the AI agent and E-02 says "I built", but what Dom personally did on E-04 is thin, and the hero's controller rig has no owner at all. |
| Quantified results | 7 | Plenty of real numbers that mostly reconcile. But E-03's "key figures" are half constraints, and the 36%, 22% and 16% claims have no stated baseline or absolute values. |
| Method, testing and limitations | 6 | E-04's regression harness and noise discussion are excellent. E-03 and E-02 state no limitations, and E-02's stated 10 ms Euler step is contradicted by the site's own code. |
| Value of the interactive figures | 7 | The replay and its pipeline strip are the best thing on the site for autonomy roles, and Fig. 04 and Fig. 07 earn their place. Fig. 00 is mislabelled as a flight test, Fig. 01's parts list is mostly empty, and the count-up shows false values. |
| Project ordering for the target roles | 4 | The mechanical project leads, and its pinned 3D track sits between the hero and E-04, so the autonomy work starts about 5 laptop screens down. |
| Technical credibility | 7 | Honest, specific and mostly consistent. It's dented by 358 vs 603 models, a simulation called a "flight test", and an "order of magnitude" claim the data doesn't support. |
| **Overall** | **6** | Strong raw material that an engineer would respect. Fix the ordering, the ownership framing and five or six cross-checks and it becomes an 8. |

## Recommended project order and lead project, with reasoning

**Order: E-04 (lead), E-03, E-02, E-01.** This is also reverse-chronological, and the numbers run
in descending order (04, 03, 02, 01), so it reads naturally. The current 03, 04, 02, 01 makes a reader
ask why the list starts at 03.

1. **E-04 Vision-based drone racing should lead.** It is the only project that is software,
   autonomy and systems work end to end: perception (colour mask, PnP with IPPE_SQUARE), state
   estimation (an error-state Kalman filter with χ² gating), guidance and control (acro body-rate
   commands), and a deterministic seeded regression harness with A/B flags. GPS-denied,
   camera-only navigation is directly relevant to UK defence autonomy. It also has the strongest
   evidence on the page: 300-course pooled benchmarks in two worlds, an honest failure case
   (Course 3) that the pipeline strip shows step by step, a simulator sign-convention bug found by
   comparing commands against logged attitude, and public source code. The hero's Fig. 00 already
   leads with it, so leading the Work section with it makes the page consistent.
   *Condition:* it can only lead if the ownership framing is fixed (ENG-02). Otherwise the first
   project a software hiring manager reads says "most of the code was written by an AI coding
   agent" without saying what Dom built himself.
2. **E-03 Generative frame** comes second. It is a real, built and tested artefact (246 g, under the
   CAA 250 g threshold, FEA checked against measurement). It shows the mechanical strength the brief
   says must stay credible, and it is the physical drone a defence or robotics team would like to
   see. Moving it below E-04 also moves Fig. 01's pinned track (`.f3-track.is-3d.pinned`, which adds
   220vh, css/site.css:305) out of the path to the autonomy work.
3. **E-02 Pipe-climbing robot** is third. It shows teamwork and simulation-driven design, and the
   model is a small dynamics simulation, which is relevant to systems roles.
4. **E-01 AI-cost analysis** stays last as a summary card, as already decided (IMPROVEMENTS item 3).
   It is first-year coursework with weak relevance to the target roles.

The hero lede still says "Aiming for mechanical engineering roles, open to software and autonomy"
(index.html:56). That is already an open P1 in IMPROVEMENTS.md, and it should be fixed in the same
change as the reorder, or the page argues with itself.

## Generic/template look

**No.** The chips, stat cards and pill buttons follow a familiar SaaS pattern. But the pipeline strip,
the hover rig with its s-plane, the 3D frame with its parts list, and the climb simulator are clearly
bespoke and specific to his work. No template produces those.

## Findings

### ENG-01 The mechanical project leads and its pinned 3D track delays the autonomy work
- Severity: P1
- Where: `#work`, article order index.html:122 (#e-03) before :219 (#e-04); the register index.html:77–94; the pinned track css/site.css:305; `review/baseline/scroll/laptop-light-01.png` to `-05.png`
- Evidence: On a 1440×900 laptop, E-04's chips first appear at the bottom of scroll screen 05 (`laptop-light-05.png`). Screens 02–04 are Fig. 01 turning, exploding and showing the frame alone while pinned. A hiring manager for software, autonomy or systems roles scrolls through about 3 screens of CAD before the first line about perception or estimation.
- Why it matters: Engineers and hiring managers (reader 2) for the stated target roles. Recruiters (reader 1) who tap "View projects" also land on a mechanical project first.
- Fix: Reorder the articles and the register to E-04, E-03, E-02, E-01, and make the same change to the hero register's card order. Keep E-03 directly after E-04 so the mechanical strength comes second. Update the copy reviewer's hero lede fix at the same time (IMPROVEMENTS open P1). No figure renumbering is needed beyond the existing "renumber in page order" rule (IMPROVEMENTS item 2), so Fig. 01 to 07 will move.
- Effort: M (markup moves plus figure renumbering, `sheets.js` layout, and tests that reference figure numbers or order)

### ENG-02 E-04 doesn't show what Dom personally built, and About counts it as Python/OpenCV evidence
- Severity: P1
- Where: `#e-04` role chip index.html:221 ("Individual, with an AI agent"); "How it was built" index.html:298; About skills row index.html:541 ("Python: NumPy, pandas, OpenCV, Matplotlib", evidenced only by E-04)
- Evidence: The prose says "Most of the code was written by an AI coding agent (Claude) in scheduled overnight runs… I reviewed the results and worked through some changes with it directly." Dom's own contributions are listed as decisions (acro commands, gate rules, the sim/stack wall, benchmark rules) plus the sign-convention diagnosis (L304). No component is named as written by him. Meanwhile About uses E-04 as the only evidence for Python and OpenCV. The honesty is admirable, but as framed a software hiring manager's first question ("what code did *you* write?") has no answer, and the skills table overclaims.
- Why it matters: Engineers and hiring managers (reader 2), especially in defence, where provenance and integrity of claims are scrutinised. An interviewer who opens the GitHub repo and sees agent-authored commits will hold the About claim against him.
- Fix: Reframe E-04's ownership as what it really is, which is a strong systems-engineering story: *Dom designed the architecture constraints, the experiment process (one flagged change per night, A/B on fixed seeds, pooled acceptance) and the benchmark, then diagnosed and fixed integration bugs.* Add a short "What I did / what the agent did" two-column list under "How it was built". Needs from Dom: which modules or functions he wrote or substantially rewrote, how many agent changes he rejected, and any review he did of the estimator or controller maths. Change the role chip to something like "Solo: system design, test & review; code largely AI-written". In About, either cite a project where Dom wrote the Python himself (needs from Dom) or reword the row to "Python: reading, reviewing and testing an OpenCV/NumPy stack".
- Effort: S for markup; content needs from Dom

### ENG-03 Fig. 00 presents a simulation as a "flight test" and blends two different drones
- Severity: P1
- Where: hero caption index.html:108 (`#cap-flight`: "Flight test from my vision-only racing drone (E-04)"); readout "T 10.85 S · 8/8 GATES · LANDED" (`js/hero-flight.js:181`, `landed`); rig caption index.html:108 (`#cap-rig`: "my 246 g drone as a planar model"); screenshots `review/baseline/scroll/laptop-light-00.png`, `-01.png`, `review/scratch/hiring-engineer/fig00-rig.png`
- Evidence: The first figure on the page never says "simulated". E-04's title (L225) does, but that is 5 screens later. The recorded flight ends at gate 8 (`flights/1017-default.js`, `time` 10.885). The "LANDED" state and the elevation-view hover at 1.52 m are animation, not recorded data. "Try the controller" then turns the same figure into "my 246 g drone", which is E-03's physical drone (`js/quad.js:6`), not E-04's simulated one. A reader reasonably concludes that Dom flight-tested a 246 g vision-only racing drone.
- Why it matters: Engineers and hiring managers (reader 2). Finding out later that the "flight test" is a simulation costs more credibility than saying so up front. Defence readers in particular distinguish sim results from flight results.
- Fix: Caption: "Fig. 00 — Simulated flight from my vision-only racing drone (E-04), replayed from the recording: true path in blue, its own estimate dashed orange." Change the readout's `LANDED` to `FINISH` or `8/8 GATES · END OF RECORDING`. Rig caption: "Hover test: a planar model of my 246 g drone from E-03…" so the two drones are explicitly different.
- Effort: S

### ENG-04 E-01 says 358 models in two places and 603 in two others
- Severity: P1
- Where: summary index.html:470 ("training data for 358 AI models"); spec card index.html:474 ("Models 358"); Fig. 07 caption index.html:493 and SVG label index.html:491 ("603 models"); `js/scaling.js:2`; `tools/scaling_data.py:3–5`
- Evidence: Fig. 07 plots and fits 603 points. I refit `js/data/scaling.js` and got n = 603, k = 0.553, R² = 0.440, which matches the spec cards' P ∝ N^0.55 and R² 0.44. So the law and R² on the cards come from 603 models, while the "Models" card next to them says 358. `tools/scaling_data.py` says it "keeps the models that have both, as the coursework's MATLAB does", which suggests 603 is the coursework's own count too. The "nine domains" in the summary may relate to a different subset.
- Why it matters: Engineers (reader 2). Two numbers for the same dataset in one card is the kind of slip a detail reader catches in seconds, and it makes them doubt every other number.
- Fix: Needs from Dom: which count the coursework's fit used. If it was 603, change L470 and L474 to 603. If 358 is a filtered subset (for example models with a domain label), say so: "603 models with both parameters and power (358 of them labelled across nine domains)".
- Effort: S

### ENG-05 E-02 states a 10 ms Euler step that the site's own corrected model says is unstable
- Severity: P1
- Where: prose index.html:391 ("integrates them with explicit Euler at a 10 ms time step"); Fig. 05 index.html:418 ("Δt = 10 ms") and caption :435; Fig. 04 caption index.html:384 ("a corrected version… not the coursework's numbers"); `js/climber.js:1–6`; `review/scratch/hiring-engineer/climb-grid.cjs`
- Evidence: `js/climber.js:4` says "10 ms explicit Euler is unstable here: the drive responds in about 3 ms". I computed τ = M·R²/(G²·k) = 2.85 ms for the sheet's setup. Stepping the sheet's equations at 10 ms makes the velocity chatter (0.147, 0.049, 0.024, 0.087, 0.000 m/s, repeating) instead of settling. DESIGN_PLAN 3.6 also records that the sheet uses a gear ratio of 100 for speed against 150 for torque. In the page's corrected model those give 91.9 s against 58.5 s. The page presents the 10 ms step as the method, and Fig. 04 only says "corrected" without saying what was corrected. On the plus side, the corrected model's optimum is effectively the sheet's setup (best on my grid: G 140, D 18 mm, 58.47 s against 58.54 s), so the drivetrain choice survives the correction.
- Why it matters: Engineers and hiring managers (reader 2). Anyone who checks the step against the motor time constant sees an unstable integrator presented as method. Owning the error turns it into evidence of rigour.
- Fix: Add a "Limitations" paragraph to E-02, for example: "Looking back, the sheet's 10 ms step was too coarse for the drive's ~3 ms time constant, and it used two different gear ratios. Fig. 04 corrects both (1 ms step, one ratio); the corrected model still picks the same drivetrain." Change Fig. 04's caption to name the corrections. Leave Fig. 05 as the coursework's loop, but caption it "as in the coursework". Wording to be approved by Dom.
- Effort: S

### ENG-06 E-03's results have no baselines, absolute values or limitations, and half its "key figures" are inputs
- Severity: P1
- Where: spec cards index.html:168–173; prose index.html:179–185; status chip index.html:124 ("Built & tested"); `review/baseline/scroll/laptop-light-05.png`
- Evidence: Of the four key figures, "Safety factor 1.5" and "Modal constraint >300 Hz" are design constraints, not achieved results. "−36% vs plate design" names no plate frame or its mass. "Agreed to within 18%" gives no deflection values, load, sample count or rig. Nothing says whether the frame has flown or survived a crash, even though crash survival is the stated requirement (L129). No limitation is mentioned anywhere.
- Why it matters: Engineers and hiring managers (reader 2): "real results, evidence of testing, and honesty about limitations" is exactly what the brief says they look for.
- Fix: Needs from Dom: the plate frame used for the −36% (and its mass), the measured and predicted tip deflection at maximum thrust (for example "x mm measured vs y mm FEA"), how the load was applied, the achieved first modal frequency and minimum safety factor from Ansys, and whether it has flown or been crash-tested. Then use these spec cards: "Frame 38 g", "−36% vs <named> plate frame", "First mode <n> Hz (limit 300)", "Deflection: FEA vs test within 18%". Add one limitation line (for example "deflection checked at one load case; modal not measured") if true.
- Effort: S once Dom supplies the data

### ENG-07 E-01's "order of magnitude" claim is tighter than the page's own data supports
- Severity: P2
- Where: E-01 prose index.html:482 ("that estimate is an order of magnitude rather than a prediction"); spec card index.html:477 ("≈590 kW"); Fig. 07 `review/scratch/hiring-engineer/fig07-hover.png`; `review/scratch/hiring-engineer/fit.mjs`
- Evidence: From the 603 points, the residual standard deviation is 0.84 decades. The 95% prediction interval at N = 3.3×10¹¹ is **13 kW to 26 MW**, more than three orders of magnitude. In the same dataset, models at or above 100 B parameters include Llama 3.1-405B at 22.6 MW, Nemotron-4 340B at 8.5 MW and GPT-3 175B at 5.1 MW. Pointing at the cluster above the GPT-5 marker names a 70 B model at 7.9 MW (screenshot). The fit is dominated by small models, so it probably underestimates frontier scale.
- Why it matters: Engineers (reader 2). The hedge is good instinct, but "order of magnitude" is itself an overclaim, and an engineer pointing at the scatter sees it immediately.
- Fix: Replace the last sentence with something like: "With R² 0.44 the 95% prediction interval spans roughly 13 kW to 26 MW, and the largest models in the data already draw several MW, so the fit, dominated by small models, likely underestimates a frontier run." Optionally shade the prediction band in Fig. 07 (`js/scaling.js`).
- Effort: S (copy); M (band)

### ENG-08 E-02's 22% and 16% have no baseline, and "my CAD" conflicts with "the team's model"
- Severity: P2
- Where: spec card index.html:356 ("Measured gain −16% time"); prose index.html:396–398; Fig. 06 index.html:439–455; Fig. 04 caption index.html:384 ("Robot from the team's Fusion model"); chip index.html:344 ("Team of 6 · model & CAD")
- Evidence: "Cut predicted climb time by 22%. In real runs 16%." Cut relative to what: the first iteration, a default gearbox, the team's initial guess? There is no absolute time (predicted 58.5 s? measured?), no run count and no competition time. L398 says "I also produced the full Fusion CAD assembly", but Fig. 04 credits "the team's Fusion model". Who built and tested the physical robot isn't stated. The 6-point gap between model and measurement isn't discussed.
- Why it matters: Engineers (reader 2), who want ownership and real results. The model–reality gap is a great interview topic, but only if it is on the page.
- Fix: Needs from Dom: the baseline setup, the absolute predicted and measured times, the number of runs and the competition time or placing. Copy: "against our first drivetrain (x s), the chosen one was predicted 22% faster and measured 16% faster over n runs; the model over-predicted because …". Change Fig. 04's caption to "Robot from my Fusion model of the team's design" if that is accurate.
- Effort: S once data arrives

### ENG-09 E-04 has no limitations or sim-to-real statement, and an undefined acceptance rule
- Severity: P2
- Where: `#e-04` prose index.html:298–304; note index.html:334
- Evidence: The simulator is never named or described: its fidelity, camera model, noise, latency and dynamics aren't stated. Nothing says what wasn't tested (real hardware, lighting, motion blur, other gate colours). "Kept it only if it clearly helped" (L298) and "a change is kept only if it helps pooled over 300 courses" (L302) give no threshold. The note says single sets "move by a few points from noise alone" but doesn't quantify it.
- Why it matters: Autonomy and defence hiring managers (reader 2) want explicit validity limits. That is the difference between a demo and engineering evidence.
- Fix: Add a short "Limits" paragraph. Needs from Dom: the simulator's name and what it models, the acceptance threshold (for example "pooled gain ≥ n gates with no set regressing"), and the plan for hardware (E-03's frame?). The sign-convention bug story can stay where it is.
- Effort: S

### ENG-10 Count-up puts false values in the DOM: "Safety factor 0.0", and mid-count "0.9"
- Severity: P2
- Where: `js/reveals.js:12–13`; `js/motion.js:98–108` (`node.nodeValue = fmt(0)`); E-03 specs index.html:168–173; `review/baseline/scroll/laptop-light-05.png`
- Evidence: Straight after load, before any scroll, `#e-03 .specs` text is "Safety factor 0.0 · Modal constraint >0 Hz · Vs plate design −0% mass · Printed frame 0 g" (my Playwright read). The baseline laptop scroll captured it mid-count at "Safety factor 0.9 · >184 Hz · −22% · 23 g". A safety factor below 1 means failure, and a modal constraint of 184 Hz contradicts the prose. Screen readers, reader mode, copy-paste and anyone who jumps past the cards via the register anchors get zeros. This breaks the "readable at frame 0" gate (DESIGN_PLAN §5).
- Why it matters: Engineers (reader 2), who notice a wrong safety factor, and accessibility.
- Fix: Leave the real text in the DOM and animate a visual-only clone (`aria-hidden`) over it. Or restrict count-up to result quantities and never count constraints (safety factor, modal limit, pipe height, envelope). Simplest: exclude `.specs .n` from count-up and keep it for `.photo-stats b`.
- Effort: S

### ENG-11 Fig. 01's parts list has a Mass column that is blank for 8 of 9 rows
- Severity: P2
- Where: index.html:147–161 (`.f3-parts`); `review/baseline/scroll/laptop-light-02.png`, `-04.png`
- Evidence: Only "Frame, PC/ABS 38 g" and "All-up 246 g" have masses. Motor, prop, battery, FC, VTX, camera, standoffs and bolts are empty, which reads as unfinished work in the most polished figure on the page. DESIGN_PLAN §7 lists part masses as still needed from Dom.
- Why it matters: Engineers (reader 2), for whom a mass budget is the obvious question about a 246 g drone.
- Fix: Needs from Dom: part masses. Until then, drop the Mass header and show the 38 g and 246 g in the caption, or fill the cells with "–" and a footnote "masses to come".
- Effort: S

### ENG-12 The hover rig suggests Dom designed the controller, but no project backs it
- Severity: P2
- Where: `#cap-rig` index.html:108; `js/quad.js`, `js/hover-rig.js`; `review/scratch/hiring-engineer/fig00-rig.png`, `fig00-rig-unstable.png`
- Evidence: The rig works and is impressive (Routh–Hurwitz limit Kp 42.7 at Kd 3.4, s-plane poles, failsafe; at Kp 62 it shows "UNSTABLE: RAISE Kd OR LOWER Kp"). The caption says "my 246 g drone… held by a cascaded PD controller", but no project describes Dom designing a controller for that drone. E-04's controller is in simulation and largely AI-written (L298). An interviewer will ask "tell me about your PD tuning".
- Why it matters: Engineers and hiring managers for controls and autonomy roles (reader 2). It's a strong asset if owned, and a trap if not.
- Fix: If Dom can defend it, say so ("a planar model I use to explain the cascade…") and link it to a project. If not, caption it as an explainer: "An interactive planar model of my 246 g drone (built for this site): …".
- Effort: S

### ENG-13 Fig. 03's "run 20 / run 26" headers are internal jargon, and each column mixes commits
- Severity: P3
- Where: index.html:314; `tools/benchmark_table.py:3–7, 19–23`; `review/scratch/hiring-engineer/fig03-sorted.png`
- Evidence: Run numbers mean nothing to a reader. Per the tool, "Clean · run 20" camera-only comes from run 23's re-run, and each column joins a baseline file for set 0–49 with A/B "on" files from a different commit for the other sets. DESIGN_PLAN 3.3 and 3.5 say run 25, while the page and tool say 26. The pass rate counts gates over 400 per set, so a crash at gate 2 costs 7 "missed" gates. Courses completed out of 50 isn't shown, and that is the more intuitive measure.
- Why it matters: Engineers (reader 2) who open the repo and try to reproduce the table.
- Fix: Headers "Clean world" and "Orange clutter". Add one line to the note: "each column's set 0–49 is the baseline run; the other sets are the change's A/B runs". Optionally add a "courses completed /300" row (from the results JSONs). Correct DESIGN_PLAN's run number when Dom next edits it.
- Effort: S

### ENG-14 The replay readout mixes the final result with live values
- Severity: P3
- Where: `.readout` index.html:254–259; `review/scratch/hiring-engineer/replay-c1-playing.png`
- Evidence: Mid-flight on Course 1 the row reads "Result: Completed 10.88 s · Gates passed 1 / 8 · Speed 7.2 m/s". The first cell is the end state and the others are the current frame.
- Why it matters: Engineers (reader 2) reading the replay as data.
- Fix: Label the cells "Outcome (whole flight)" and "Now: gates / speed / error", or show the outcome only once the clock reaches the end.
- Effort: S

### ENG-15 Small cross-section inconsistencies
- Severity: P3
- Where: E-04 chips index.html:221 (Date "Aug – Oct 2026" with Status "In development"); E-04 tools chip "Python · OpenCV · NumPy" vs About L541 "NumPy, pandas, OpenCV, Matplotlib"; register L91 "AI training-cost analysis" vs title L469 "How AI training power scales"; E-02 uses "Context/Result" chips where the others use "Status".
- Evidence: As listed. Each is minor, but together they read as loose editing on the section where detail readers spend the most time.
- Why it matters: Engineers (reader 2).
- Fix: Date "Aug 2026 – present" if still in development. Align the tool lists. Rename the register entry to "AI training-power scaling analysis". Give every project a Status chip.
- Effort: S
