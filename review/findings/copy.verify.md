# Verification of copy.md (P0 and P1 findings)

**Verifier:** independent fact-check · **Date:** 20 Nov 2026 · **Scope:** COPY-01 to COPY-07 (all P1; copy.md has no P0)

Checked against `index.html` (622 lines), `css/site.css`, `js/contact.js`, `js/hero-flight.js`,
`flights/index.js`, `js/data/scaling.js`, `tools/scaling_data.py`, `tests/*.spec.js`,
`IMPROVEMENTS.md`, `DESIGN_PLAN.md`, git history, the baseline scroll screenshots
(`review/baseline/scroll/phone-light-00, 01, 02, 24`, `laptop-light-00, 01`) and the running page
at http://127.0.0.1:4173/ (scripts in `review/scratch/verify-copy/`: `check.js`, `wc2.js`).

- **COPY-01 — CONFIRMED.** Lines 6-7, 14, 53, 54, 56 and `css/site.css:118` are all as quoted. The
  first phone screen (390×844, measured) holds exactly the name, nav, "Mechanical engineering · UCL",
  the four pills, the lede ending "Aiming for mechanical engineering roles, open to software and
  autonomy", the two buttons (plus the drone tag). "Systems" and "defence" occur nowhere in
  `index.html`. `IMPROVEMENTS.md` (20 Nov) logs the same five places as an open P1 for this review.
  Minor nuance: `<title>` and the meta/OG descriptions state the degree and omit the target rather
  than state a mechanical target; the fix keeps the degree accurate, as `IMPROVEMENTS.md` asks.
  Fix uses only facts from the brief/IMPROVEMENTS.md; build-free; keeps the h1 hidden (H.3).

- **COPY-02 — CORRECTED.** True for E-03 (summary is the brief; on a phone the result cards sit
  below the 2,624 px pinned Fig. 01 track, about 3 screens down; prose results at `:180-185`) and
  E-04 (results at `:302-303`, no stat strip). Overstated for E-02: the outcome is already the
  first line of the project, the meta chip "Result: Completed the climb" (`index.html:344`), and
  the "−16%" stat card sits directly under the summary (`:356`), not only at `:396-397`. E-01's
  result (≈590 kW, the fitted law) is likewise in the stat cards directly under its summary.
  Correction: the finding stands at P1 for E-03 and E-04; for E-02 and E-01 it is a P2 polish
  (summary could lead with the result, but the result is already one glance away). Rewrites use
  only on-page facts.

- **COPY-03 — CONFIRMED.** `.specs` exist only at `:168` (E-03), `:352` (E-02), `:473` (E-01);
  none in `#e-04`. CSS at `site.css:285-288` as stated. Word counts re-measured (DOM textContent):
  E-04 669 total, prose 398 (finding: 660/398), E-03 247, E-01 186; E-04 is still longer than
  E-03 + E-01 combined. Small nuance: E-04's results are spread over two Testing paragraphs of
  about 75 and 78 words, not one 100-word paragraph. Proposed card values (99.8%, 98.6%, 300,
  97.5%) are all on the page; build-free.

- **COPY-04 — CORRECTED.** Core claims are true: `flights/index.js:3` sets `FLIGHT_POSTER` to
  `1017-default`, labelled "Camera + IMU" in `FLIGHT_INDEX`, and `js/hero-flight.js:262` plays the
  poster, so "vision-only" (`:108`) is wrong; E-04's h3 "using only its onboard camera" (`:225`)
  conflicts with its headline numbers (99.83% / 98.58% are Camera + IMU columns, `:330`, and
  `:303` says "with the IMU"). `hero-flight.js:10` sets SPEED = 3 and the readout prints "×3".
  Corrections: (1) Fig. 00's caption is not "next to" the hero's E-03 drawing; it sits below the
  project register (about 300 px below the drawing on a laptop, a screen or more apart on a
  phone), though it is in the same hero and the rig mode does describe "my 246 g drone".
  (2) "Six recorded flights" (`:235`) is accurate (3 courses × 2 sensing modes = 6 recordings in
  `flights/index.js`) and sits directly under an h3 that already says "simulated", so that part
  is a P3 clarity nit, not part of the P1. The fixes break no hard constraint.

- **COPY-05 — CORRECTED.** The contradiction is real: summary `:470` and card `:474` say 358;
  aria-label `:491` and caption `:493` say 603; `tests/scaling.spec.js:11` asserts 603 points;
  refitting `js/data/scaling.js` gives n = 603, slope 0.553, R² 0.440, so the fit shown in the
  same stat strip as "358" is computed on 603 models. Correction: "Nothing in the repo supports
  358" is overstated. 358 and "nine domains" have been in Dom's own copy since the initial commit
  (`1eaa200`), and `tools/scaling_data.py` reads `dataset2.csv`, which hints at a second coursework
  dataset that may be the 358-model / nine-domain one. So 358 is unverified, not unsupported.
  The finding's fix (ask Dom; do not change the number on the reviewer's own authority) is the
  right one and respects "don't invent facts".

- **COPY-06 — CONFIRMED.** `#email` is a `<span>` (`:587`, tagName SPAN on the running page);
  no CV link exists; `js/contact.js:10` sets "Selected, press copy"; the contact line (`:583`)
  omits roles and right to work; `IMPROVEMENTS.md` item 10 (CV buttons) is marked dropped
  24 Oct 2026. A mailto anchor keeps `contact.js` working (it uses `textContent` and
  `selectNodeContents`); no test checks the tag. No CV placeholder is invented. Note on the fix:
  the proposed fallback "press Ctrl+C (⌘C on Mac)" doesn't suit the touch phones the finding is
  about; something like "Selected: copy it from the menu" would cover both.

- **COPY-07 — CONFIRMED.** Register (`:77-94`) and articles (`:122`, `:219`, `:342`, `:463`)
  run E-03, E-04, E-02, E-01; `tests/site.spec.js:16-17` pins that order (the finding says tests
  are touched). `IMPROVEMENTS.md` item 2 set "ordered by relevance (frame, drone racing, ...)"
  under the mechanical-first targeting that the 20 Nov entry supersedes, so it is reopened for a
  stated reason. The dates support "newest first" = E-04, E-03, E-02, E-01. On a phone the pinned
  Fig. 01 track is 2,624 px (about 3.1 screens at 844 px), so "two to three screens" is, if
  anything, slightly low. No hard constraint is broken (the hero drone can keep `href="#e-03"`,
  which `tests/hero-drone.spec.js:24` asserts).
