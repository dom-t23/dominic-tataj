# Still to do (as of 21 Nov 2026)

The design review is in PR #2 (`claude/design-review`). The PR is **open and not merged**;
merging deploys the live site. Full detail is in `REVIEW.md` ("Needed from Dom", "Known issues
and backlog").

## Before merging PR #2

- [ ] Review the PR: https://github.com/dom-t23/dominic-tataj/pull/2
- [ ] Decide on `review/`. Merging publishes about 12 MB of review screenshots and
      `REVIEW.md` on GitHub Pages. Delete `review/` first if you'd rather keep them off the site.
- [ ] Optional: delete the local prototype branches `proto/dir-A`, `proto/dir-B` and `proto/dir-C`.
      They were never pushed.

## Content only Dom can supply

- [ ] **CV PDF** with no phone number, ideally a software and autonomy version. Save it as
      `Dominic-Tataj-CV.pdf` and uncomment the button in `index.html` (around line 111).
- [ ] **Hardware photos**: the printed frame (ideally on a scale), the assembled drone, the
      deflection test, and the robot on the pipe (R-22).
- [ ] **E-01**: whether the coursework's fit used 358 or 603 models, and how the two counts
      relate. The page currently says 358 in the coursework and 603 refitted for Fig. 07 (R-14).
- [ ] **E-03**:
  - [ ] the plate frame the −36% is measured against, and its mass;
  - [ ] measured and predicted tip deflection;
  - [ ] the first mode and minimum safety factor from Ansys;
  - [ ] whether it has flown (R-16);
  - [ ] part masses for Fig. 01's parts list (R-27).
- [ ] **E-04**:
  - [ ] which parts of the flight stack you wrote or rewrote yourself, and how many agent
        changes you rejected (R-06);
  - [ ] the simulator's name, the acceptance rule, and any hardware plan (R-36);
  - [ ] whether it is still in development, so the date can read "Aug 2026 – present".
- [ ] **E-02**: the baseline drivetrain, absolute predicted and measured times, and the number
      of runs (R-36).
- [ ] **Artefacts to link**: the E-01 report, the E-02 model, an E-03 Ansys image (R-38).
- [ ] Optional: whether to state UK security-clearance eligibility. Add it only if it's true.

## After merging

- [ ] Verify the site in Google Search Console and request re-indexing (PERF-12).
- [ ] Check the LinkedIn link preview picks up the new `og-image.png`, using LinkedIn's Post
      Inspector.

## Polish backlog (P2, not blocking)

- [ ] Fonts went from 81 to 147 KB. A self-hosted, subset Archivo would be about 25 KB
      instead of 90 KB.
- [ ] Instant programmatic scroll jumps can still shift layout slightly, from
      `content-visibility: auto`. This doesn't happen with normal scrolling.
- [ ] Fig. 01's column-header buttons need world-specific `aria-label`s.
- [ ] Bigger touch targets for the caption buttons (20 px) and gain sliders (16 px) on phones.
- [ ] The open hover rig still captures vertical touch scrolls (MOT-05).
- [ ] P3 items: see "P3 backlog" in `REVIEW.md`.
