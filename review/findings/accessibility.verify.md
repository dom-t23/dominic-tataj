# Fact-check: accessibility.md (P0/P1 findings)

There are no P0 findings. All five P1 findings (A11Y-01 to A11Y-05) were checked against `index.html`, `css/site.css`, `js/motion.js`, `js/reveals.js` and the running page at `http://127.0.0.1:4173/`. The scripts are in `review/scratch/verify-accessibility/` (`contrast.cjs`, `verify.cjs`, `spacing.cjs`).

- **A11Y-01: CONFIRMED.** `EFFECTS.count` (js/motion.js:98-119) sets `node.nodeValue = fmt(0)` when the effect is registered, and puts the real value back only when the IntersectionObserver fires. At 1440×900 straight after load, the figures read `0.0 | >0Hz | −0%mass | 0g | 0m | … | 0+ | −0%time | 0 | 0.00 | ≈0kW | 0+ | 0+`. The ARIA snapshot of `#e-03 .specs` reads "Safety factor 0.0 Modal constraint >0Hz Vs plate design −0%mass Printed frame 0g".
  - On a fresh load followed by End, the About stats stayed at "0+ | 0+" (`.photo-stats` ends up above the viewport, at top −365).
  - Even after a scripted step-scroll to the bottom, the E-02 figures still read `0m | 0+ | −0%time`, which is stronger evidence for "can stay at 0" than the review gives.
  - With reduced motion every real value is present.
  - The line references are correct (index.html:168-173, 352-357, 473-478, 514-517; reveals.js:12-14).
  - The fix (an sr-only true value, plus running pending counts instantly) is build-free and keeps the effect. P1 is defensible: these are the headline results.
- **A11Y-02: CORRECTED (minor).**
  - Confirmed: every CSS line reference (14, 85, 86, 109, 192, 270, 288, 294, 427-428, 435, 589, 645) and every ratio. #6B7385 is 4.32:1 on #F3F4F7, 4.40:1 on #F5F6F9, 3.96:1 on the #E9EAEE track and 4.76:1 on white. The proposed #5B6375 gives 5.48 / 5.57 / 5.01, and #5F6779 gives ≥4.66 on the tracks. Lighter values such as #636B7D fail the track (4.39 to 4.45), so the "lightest passing value" claim holds. Dark --muted passes (5.46 to 6.30).
  - Correction: the "45 axe nodes on desktop and 46 on phone" figure is the whole color-contrast count. It includes the four `.pno` white-on-orange nodes that belong to A11Y-03, so --muted accounts for 41 nodes on desktop and 42 on phone. The severity and fix are unaffected.
- **A11Y-03: CORRECTED (the fix as written breaks dark).**
  - Confirmed: every CSS line reference (179, 193, 268, 365, 425, 667). White on #FF4F00 is 3.30:1 and white on #FF5A14 is 3.12:1. #0B0F17 is 5.82:1 on #FF4F00 and 6.14:1 on #FF5A14. White on #C23A00 is 5.39:1.
  - Text-size correction: the affected text is 11 to 14 px, not 12 to 14 px. `.f3-ov text` and `.acro-badge` are 11 px.
  - Fix correction: "switch the text to `--ink`" fails in dark, because dark `--ink` is #ECEEF2, and that is 2.69:1 on #FF5A14. Use a fixed dark colour in both themes (for example, a new `--on-signal: #0B0F17` token that is the same in light and dark). The `--signal-strong` alternative also needs a dark value that keeps white text at ≥4.5:1, because dark `--link` #FF8048 does not.
- **A11Y-04: CORRECTED (the facts hold, the WCAG framing does not).**
  - Confirmed: the three `svg.drawing` figures (Fig. 02, 05, 06) use `viewBox` width 520 with `font-size` 10/11. On the iPhone 13 preset the plate is 306 px wide, so the text renders at 5.88 to 6.47 CSS px. All other figure SVGs render at 10 px. The line references are correct.
  - Correction: that preset is 390 px wide, not 375. At 375 px the text would be about 5.6 to 6.2 px.
  - Correction: this is not a WCAG 1.4.4 or 1.4.10 failure.
    - WCAG sets no minimum text size.
    - SVG text grows with browser zoom and pinch zoom, which meets 1.4.4.
    - A figure that scales to fit is what 1.4.10 asks for.
  - P1 is still defensible, but on the brief's own ground: the primary reader is a recruiter on a phone, and Fig. 02 and Fig. 06 carry results. It is not an AA conformance failure, and the review shouldn't cite it as one.
  - The fixes respect the constraints. The `overflow-x: auto` stopgap scrolls inside its own container, as the bench `.tablebox` already does, so the page itself still doesn't scroll sideways.
- **A11Y-05: CONFIRMED.** At 320×640, `scrollWidth` is 359 against a `clientWidth` of 320, and every `.bom` row ends at x = 358. The overflowing elements are the `.bom` table and its rows; `.hd-floor` extends past the edge but is clipped and does not add to `scrollWidth`. With the 1.4.12 text-spacing override at 375 px, `scrollWidth` is 417. At 375 px without the override there is no overflow.
  - The cause is as described: `white-space: nowrap` on the last column (css/site.css:617) and 20 px side paddings (608, 617). index.html:525-557 is correct.
  - It is a genuine 1.4.10 failure at 320 CSS px, so P1 is defensible.
  - The fix is build-free. The item-number column it would hide has only an sr-only "Number" header, so no content is lost.
