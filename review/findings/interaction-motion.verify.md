# Verification: interaction-motion findings (P0/P1 only)

Independent fact-check, 20 Nov 2026. I checked the markup, `css/site.css`, `js/*.js`, `DESIGN_PLAN.md` and the running page at http://127.0.0.1:4173/. The probes are in `review/scratch/verify-interaction-motion/` (`v.js`, `v2.js`). They use a phone at 375×812 with touch, a laptop at 1440×900, and the phone again with `prefers-reduced-motion: reduce`.

The review has no P0 findings. MOT-01, MOT-02 and MOT-03 are P1. MOT-04 to MOT-13 are P2/P3 and were not checked.

- **MOT-01: CORRECTED (minor; the finding and P1 stand).**
  - **What checks out**
    - Lines: `index.html:168-173`, `352-357`, `473-478` and `514-517`, `js/motion.js:98-119` (`node.nodeValue = fmt(0)` at registration) and `js/reveals.js:12-14` are all correct.
    - Text before scrolling: on both phone and laptop it is exactly `0.0 | >0Hz | −0%mass | 0g | 0m | 0+ | −0%time | 0 | 0.00 | ≈0kW | 0+ | 0+`. The two compound values the regex skips (`400×300mm`, `P ∝ N0.55`) are left unchanged.
    - Accessibility tree: the aria snapshot of E-03's specs reads "Safety factor 0.0 Modal constraint >0Hz Vs plate design −0%mass Printed frame 0g".
    - Find-in-page: `document.body.innerText.includes("390,000+")` is false until About has been scrolled to.
    - Reduced motion: every value is correct at frame 0.
    - Normal scrolling: every value resolves to the real figure.
  - **Correction:** the claim that a screen-reader user "never scrolls, so the observer never fires" is too strong. VoiceOver on iOS, and NVDA in Chromium browse mode, usually scroll the element into view as the cursor moves. The observer then fires, but only after the text has been announced. So the user still hears "0.0" / ">0 Hz" first, or a value mid-count. The harm is the same; reword how it happens.
  - **Fix:** it respects the hard constraints. `tests/motion.spec.js` calls `reveal(el, "count")` directly, so removing the call in `reveals.js` doesn't break it. The fix reopens DESIGN_PLAN 2.4, and the finding says so.

- **MOT-02: CONFIRMED.**
  - **Lines:** `site.css:305` (`+ 220vh`), `308` (the `svh` twin), `322` and `326` (the phone `--f3-h`), `frame3d.js` `MOVE`/`STEP_AT` and `frame3d-boot.js:28` (the `pinned` toggle) are all correct. `MOVE` is on line 44, inside the cited 41-44.
  - **Measured on the phone**
    - Track 2521 px, figure 735 px, so 1786 px of scroll while pinned. That is 12.6% of the 20,004 px page.
    - E-03 title at 2.95 screens, E-03 specs at 6.49 (3.54 screens below the title), E-04 at 8.18.
  - **Measured on the laptop**
    - Track 2791 px, so 1980 px pinned.
    - E-03 title at 1.76 screens, specs at 5.15, E-04 at 5.93.
  - **Other checks**
    - Each hold is 0.16 of the track (0 to 0.16, 0.42 to 0.58, 0.84 to 1), about 286 px on the phone.
    - The figure (735 px) plus the nav fills the 812 px screen.
    - `.f3-view` has `touch-action: pan-y` (`site.css:348`).
  - **Fix:** it respects the hard constraints. Unpinning under 600 px reuses the existing unpinned path: under reduced motion the track is 633 px and the specs sit at 4.16 screens. The fix needs both the `vh` and the `svh` rules changed (305 and 308).
  - **Note:** the finding doesn't say that "scroll-driven, pinned" was Dom's own answer in DESIGN_PLAN 3.1. The fix keeps pinning on wider screens and only shortens it, and figure placement is an open decision, so this isn't a refutation. The write-up should still acknowledge it.

- **MOT-03: CORRECTED (minor; the finding and P1 stand).**
  - **What checks out**
    - Locations: `.hero-drone` at `index.html:65-73`, `#flight` at `97-109` and the half-in-view take-off at `hero-flight.js:275-277` are all correct.
    - Laptop: the Fig. 00 top is at y = 848 of 900, which rounds to the claimed 849, so about 52 px show. With no scroll, its clock stays at "T 0.00 S" after 3.5 s, while `.hd-art`'s transform keeps changing.
    - Phone: `#flight` is at 1.86 screens, after the four-card register, and E-04 is at 8.18 screens.
    - Phase R: the hero composition is listed as Open in BRIEF §3, so dropping or demoting the hero drone breaks no hard constraint. It does reopen H.1 and R.4 (the glow and floor), and the finding says it reopens H.1 for a reason (the retargeting).
  - **Correction:** "the only thing moving in the first screen" is not quite true. The availability pill's live dot also pulses forever (`site.css:128-131`, `animation: live 2.4s ease-in-out infinite`), and the review's own inventory lists it. The drone is the only large, or decorative, moving element.

## Summary

- Checked: 3 (MOT-01, MOT-02, MOT-03; there are no P0 findings).
- Confirmed: MOT-02.
- Corrected: MOT-01 (how the screen-reader harm happens), MOT-03 (the live dot also moves).
- Refuted: none.
