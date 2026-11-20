# Verification of performance-seo.md (P0/P1 findings)

There are no P0 findings. I checked the three P1 findings (PERF-01, PERF-02, PERF-03) against the markup, CSS, git history,
the running page on :4173, the baseline screenshots and the reviewer's raw data. My scripts are in
`review/scratch/verify-performance-seo/` (`nav.cjs`, `delay-theme.cjs`).

- **PERF-01: CONFIRMED.**
  - `og-image.png` is 1200×630 and 60,256 B. Git last changed it on 2026-10-20 in `b364c56`, before Phase R (20 Nov).
  - I opened it. It has a serif "Dominic Tataj", an uppercase letter-spaced mono "ENGINEERING PORTFOLIO" / "PROJECTS", a square orange bullet, a graph-paper grid and square hairline boxes. The text is "MEng Mechanical Engineering, UCL" and the four projects. There is nothing on software, autonomy or systems, availability or right to work.
  - The E-02 tag drift is real: "EXCEL MODEL · FUSION CAD" on the card, "Excel · Fusion" at `index.html:88`.
  - The line references are right: `index.html:16-19` for `og:image`, its size and `og:image:alt`, and `:20` for `twitter:card`.
  - Every token the fix uses exists in `css/site.css`: `--bg #F3F4F7`, `--e-3`, `--r-l: 22px`, the warm/cool glow and Space Grotesk as `--font-display`.
  - Every asset and piece of copy the fix uses is already in the repo: `images/hero/t16.webp`, the pills at `index.html:55`, and the targeting line from IMPROVEMENTS.md. The pattern it copies, `tools/hero/render.cjs` and `render.html`, exists.
  - The fix stays build-free (dev-only tooling) and doesn't return to the drawing set.
  - Small nit: some figure labels on the live page are still uppercase mono ("PLAN", "ELEVATION"). The claim is right for eyebrows and chips.
  - P1 is defensible for reader 1, who arrives from a LinkedIn link.

- **PERF-02: CORRECTED (the evidence is right; the fix has two small errors).**
  - Confirmed: the `<title>` is "Dominic Tataj Portfolio" (23 characters) at `:6`. The meta description at `:7` and `og:description` at `:14` say "MEng Mechanical Engineering" and never mention software, autonomy or systems. `og:title` is at `:13`. The hidden h1 at `:54` says "mechanical engineering portfolio". IMPROVEMENTS.md lines 22-26 list exactly these as the open P1.
  - Correction 1: the example description is 156 characters, so it breaks the finding's own "≤ 155" limit. It needs to lose one character, for example "2027–28 placement, UK".
  - Correction 2: the proposed regression test would pass on today's markup, so it guards nothing. It asserts that the description and `og:description` don't contain "Mechanical engineering roles", but neither does now. That phrase is only in the hero lede (`index.html:56`). The test should assert something positive, for example that both descriptions and the title contain "autonomy" or "software". If the lede is meant to be covered, it should check the lede.
  - The suggested `<title>` is 57 characters, which matches "about 60". The severity is fine.

- **PERF-03: CORRECTED (wrong line number; everything else reproduced).**
  - Correction: the theme button is at `index.html:42`, not `:41`. Line 41 is the Contact link.
  - Confirmed:
    - `js/theme.js:29` sets `$("theme").hidden = false`.
    - `css/site.css:99` is `.nav .wrap { … flex-wrap: wrap; justify-content: space-between … }`.
    - The inline head script is at `index.html:21-25`.
    - `main.js` (a module, loaded at `:620`) imports `theme.js`.
    - The nav reflow I measured matches the finding exactly. At 375 px the nav is 65 px tall with the `ul` at x=174 when the button is hidden, and 77 px tall with the `ul` at x=16 (second row) when it is shown, so `main` moves down 12 px.
    - It also happens at 390 px (iPhone 12–15). At 360 px the nav is two rows anyway, and at 414 px it stays on one row.
  - I reproduced the shift itself by delaying `js/theme.js` by 1.5 s, so the button appears after first paint:
    - 390 px: CLS 0.198
    - 375 px: CLS 0.181
    - 414 px: CLS 0.001
    - The sources were `DIV.brand`, `UL`, `MAIN#top` every time.
    - With no delay there is no shift.
  - The 0.1879 entry with those sources is in `measure-base.json`. `tests/perf.spec.js:28-44` runs the CLS test without throttling, so it can't catch this.
  - The fix (an `html.js` class set in the existing inline head script, plus `html:not(.js) .theme-btn { display: none }`) is build-free and keeps the light-first default.
  - P1 is defensible. The shift is deterministic whenever the module graph runs after first paint, which is likely on real slow phone networks, and it hits the most common iPhone width.
