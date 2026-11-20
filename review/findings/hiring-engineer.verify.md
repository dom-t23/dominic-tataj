# Verification: hiring-engineer findings (P0/P1 only)

Checked against `index.html`, `css/site.css`, `js/*.js`, `flights/1017-default.js`,
`js/data/scaling.js`, `DESIGN_PLAN.md`, `IMPROVEMENTS.md`, the laptop scroll baseline, and the
running page (1440×900, Playwright). My scripts are in `review/scratch/verify-hiring-engineer/`
(`fit.mjs`, `climb.cjs`, `fig00.cjs`). The findings file has no P0s. P1s are ENG-01 to ENG-06.

- **ENG-01: CONFIRMED.** #e-03 is at index.html:122 and #e-04 at :219. The register is at
  :75–94, with its items at :77–93. `.f3-track.is-3d.pinned` adds 220vh (and 220svh in the
  `@supports` block) at css/site.css:305. In `laptop-light-05.png` the E-04 chips appear only at
  the bottom of the screen, and screens 02–04 are Fig. 01 pinned. Reordering does reopen
  IMPROVEMENTS item 2 ("ordered by relevance: frame, drone racing…"), but that order was set
  under the mechanical-first targeting, which was superseded on 20 Nov 2026, so the stated
  reason is valid. E-04 (Aug–Oct 2026) then E-03 (Jul–Sep 2026) is also reverse-chronological,
  as the finding says. The fix breaks no hard constraint.
- **ENG-02: CORRECTED.** The quotes and line numbers are accurate (role chip :221, "How it was
  built" :298, About Python row :541, whose only evidence link is E-04). The E-04 tools chip
  lists only Python, OpenCV and NumPy, not the About row's pandas and Matplotlib. One
  correction: the claim that "no component is named as written by him" is slightly overstated.
  L304 says that after the sign-convention diagnosis he "corrected the controller", which is a
  change he made himself. The finding should say that the controller fix is the only change
  attributed to Dom, and that it isn't clear whether he or the agent wrote that fix. The
  severity (P1, reader 2) is defensible. The fix asks Dom for the missing facts and invents
  none.
- **ENG-03: CORRECTED.** The core claim holds. The `#cap-flight` caption (:108) says "Flight
  test" while E-04 is a simulation (:225), and `#cap-rig` calls the rig "my 246 g drone", which
  is E-03's mass (`js/quad.js:6`, "the real drone's all-up mass"). Three details need
  correcting:
  (1) The readout string is built at `js/hero-flight.js:231`. Line 181 only sets the `landed`
  flag.
  (2) "LANDED" is a transient state. On the running page the readout goes from "… · GATE n/8"
  to "8/8 GATES · LANDED" and then settles on "T 10.85 S · 8/8 GATES · HOVER". The fix should
  replace both words, for example with "END OF RECORDING".
  (3) The elevation height is not invented. `z0 = last[2]` (hero-flight.js:126) is the final
  recorded altitude, about 1.50 m (the last frame of `flights/1017-default.js` is at
  t = 10.85 s, z = 1.5). Only the continued hover and the ±bob, which shows as 1.52 or 1.53 m,
  are animation. "T 10.85" is the time of the last frame, and the run's `time` field is 10.885.
  The severity and the caption fix stand, and the fix breaks no constraint.
- **ENG-04: CONFIRMED.** Lines :470 and :474 say 358. The SVG label (:491) and the caption
  (:493) say 603, and so do `js/scaling.js:2` and DESIGN_PLAN 3.8. I refit
  `js/data/scaling.js` independently and got n = 603 (all names unique), k = 0.553 and
  R² = 0.440, which match the "P ∝ N^0.55" and "R² 0.44" cards beside the "358" card. The fix
  rightly asks Dom which count is correct instead of choosing one.
- **ENG-05: CONFIRMED.** The prose at :391, the "Δt = 10 ms" label at :418 and the caption at
  :435 are accurate, and `js/climber.js:4` and DESIGN_PLAN 3.6 both say that the 10 ms
  explicit Euler is unstable and that the sheet mixes gear ratios of 100 and 150. I reproduced
  every number independently:
  - τ = 2.85 ms.
  - At 10 ms the velocity chatters 0.147, 0.049, 0.024, 0.087, 0.000 and repeats.
  - The corrected model gives 58.54 s at G = 150 and 91.89 s at G = 100.
  - Even with the sheet's mixed ratios (τ ≈ 4.3 ms), a 10 ms step is still above the stability
    limit of 2τ.
  One caveat on the proposed copy: "the corrected model still picks the same drivetrain"
  overstates the result. The optimum is a ridge in G/D (for example G 140/D 18 and G 85/D 11
  both give 58.47 s), and the sheet's G 150/D 20 is within 0.1 s of it rather than the unique
  optimum. Word it as "the sheet's setup is within 0.1 s of the corrected model's best". The
  finding already says Dom must approve the wording.
- **ENG-06: CONFIRMED.** The spec cards at :168–173 hold Safety factor 1.5 and Modal
  constraint >300 Hz, and both appear as constraints in the prose at :177. "−36% vs plate
  design" (:171, :177) names no reference frame. "Agreed to within 18%" (:185) gives no values,
  load or rig. The status chip says "Built & tested" (:124), while the requirement at :129 is
  to survive crashes, and nothing reports a flight or a crash test. No limitation appears
  anywhere in E-03. The fix leaves placeholders for Dom's data and invents nothing. P1 is
  defensible for reader 2.
