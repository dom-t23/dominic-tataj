# Accessibility review (WCAG 2.2 AA): Dom Tataj portfolio

## Method

I read `review/BRIEF.md`, `DESIGN_PLAN.md` (Phase R and §5 quality gates), `IMPROVEMENTS.md`, `README.md`, `review/baseline/NOTES.md`, all of `index.html` and `css/site.css`, and the accessibility-relevant parts of `js/` (theme, contact, motion/reveals, bench, scaling, contact-sheet, hero-drone, hero-flight, hover-rig, frame3d, acro). I tested against the running site at `http://127.0.0.1:4173/` with Playwright and Chromium (SwiftShader WebGL). All scripts and captures are in `review/scratch/accessibility/`:

- `axe.cjs`: @axe-core/playwright with the tags wcag2a, wcag2aa, wcag21a, wcag21aa and wcag22aa. It ran at desktop 1440×900 and phone (iPhone 13 preset) in light and dark (dark set with `localStorage.theme='dark'` via `addInitScript`). Each run scrolled the page top to bottom first and pressed LOAD so the replay controls exist. Raw output: `axe-results.json`, `axe-violations.txt`.
- `tab.cjs`: tabs through the whole page at 1440×900 and records each stop, its computed outline, and whether the sticky nav or anything else covers it after scrolling settles. It also takes a clipped screenshot of each focus state (`focus-light/NNN.png`, log in `focus-light/tab-log.json`).
- `tree.cjs`: ARIA snapshots (`aria-desktop.yml`, `aria-phone.yml`), the heading outline, and every phone target under 24 px.
- `count.cjs`: what the count-up key figures contain before and after scrolling.
- `contrast.cjs`: WCAG contrast for every token pair in both themes, including the warm glow, the focus ring and the film strip.
- `reflow.cjs`: 320×640 (1280 px at 400%), 320×256, 640×450 (1280×900 at 200%), and the WCAG 1.4.12 text-spacing override at 375 and 1440 px. It reports page overflow and clipped text (screenshots in `reflow/`).
- `svgtext.cjs` and `phonefigs.cjs`: rendered px size of SVG figure text on the phone, the reduced-motion state, what still moves in the hero after 15 s, and dark-theme captures.

I did not use a real screen reader; screen-reader statements come from the Chromium accessibility tree.

## Scores

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| Contrast (light) | 5 | `--muted` #6B7385 is 4.32:1 on `--bg` and 3.96:1 on segmented tracks, which fails on 40+ labels. White on `--signal` is 3.30:1. The focus ring is 2.4:1. The Fig. 00 caption link is 1.13:1 against its surrounding text. |
| Contrast (dark) | 8 | The dark tokens pass for text (muted 5.5 to 6.3:1, link 7.3:1). The failures are white on orange (project numbers, LOAD REPLAY, 3.12:1) and the unstyled caption link. |
| Keyboard and focus | 7 | All 56 tab stops are reachable in a logical order, none is covered by the sticky nav, and the rig returns focus when closed. Against that: the focus ring is too faint in light, there is no skip link, and the rig is a `role=group` that captures the arrow keys. |
| Semantics and landmarks/headings | 6 | Landmarks, labelled `<article>`s and table captions are good. But the count-up figures expose "0.0", ">0Hz" and "0+" to assistive tech, About jumps from h2 to h4, six `aria-label`s on `<p>`/`<div>` are ignored, and Fig. 03's group headers are plain cells. |
| Alternatives for non-text content | 8 | Photo alt text is specific. Fig. 02, 05, 06, 03-chart and 07 have meaningful `role=img` labels (Fig. 03's updates with the column), the pipeline strip has text readouts, and the WebGL canvas has a label. The gaps: scatter point names are hover-only, and rig events aren't announced. |
| Target size | 6 | The nine parts-list buttons are 17 to 20 px tall with too little spacing (axe 2.5.8: 6 nodes on desktop, 9 on phone). Everything else passes, by size or by spacing. |
| Reflow and zoom | 6 | At 320 CSS px the About table makes the whole page scroll sideways (359 px). Phone SVG figures render their text at 5.9 to 6.5 px. 200% zoom and text spacing are otherwise clean. |
| Motion and reduced motion | 8 | `prefers-reduced-motion` coverage is excellent: no pinning, no count-up, no burst, no tilt, no theme wipe, a still hero, and `scroll-behavior: auto`. Without it, the hero drone, the Fig. 00 hover and the availability dot move indefinitely with no pause (2.2.2). |
| **Overall** | **6.5** | The structure and intent are good: someone has clearly thought about keyboard, reduced motion and text alternatives. A short list of token-level contrast fixes plus one motion.js change would take it close to AA. |

## axe results

All violations axe found were rated **serious**; there were no critical, moderate or minor ones. Counts are after scrolling, with the replay loaded.

| Run | Rules violated | Nodes | color-contrast | target-size | label-content-name-mismatch | link-in-text-block |
|---|---|---|---|---|---|---|
| desktop light | 4 | 53 | 45 | 6 | 1 | 1 |
| desktop dark | 4 | 16 | 8 (4 transient, see below) | 6 | 1 | 1 |
| phone light | 4 | 57 | 46 | 9 | 1 | 1 |
| phone dark | 4 | 14 | 3 | 9 | 1 | 1 |

**color-contrast (1.4.3), light, by component (both sizes):**
- 4.32:1, `#6B7385` on `#F3F4F7`: `#theme` (nav "Dark" button), `.hero-text > .eyebrow`, `.section-head > .eyebrow`, `.register header > .label` ("Projects"), `.photo-stats .label` ×2, `.foot-hint`.
- 4.40:1, `#6B7385` on `#F5F6F9` (panel): `.register .r-no` ×4 (E-03/E-04/E-02/E-01, 11 px); `.sheet-meta .chip .k` (Role/Tools/Date/Status keys), 4 per project; `.specs .label` ×12 and `.specs .n small` ×4; `.climb-read .label` ×4.
- 3.95:1, `#6B7385` on `#E9EAEE`: unpressed segmented buttons `#seeds > button:nth-child(2..3)` and `#methods > button:nth-child(2)`.
- 4.28:1: `.sc-axes button[data-log="0"]` ("Linear").
- 3.29:1, white on `#FF4F00`: `.sheet-meta .pno` ×4.

**color-contrast, dark:** `.sheet-meta .pno` ×4 (white on `#FF5A14`, 3.12:1). Desktop dark also flagged `#e-01 .chip .k` and `.chip:nth-child(5)` at 2.15 to 4.41:1. Those chips were mid-way through the `fill` reveal's fade (`js/motion.js` `stagger`), so they are transient, not a token problem.

**target-size (2.5.8):** `#frame3d .f3-parts tbody button`. Desktop: 6 nodes, 80.9×19.6 px with 23.2 px safe spacing. Phone: all 9 nodes, about 35 to 78 × 17 px with 14 to 22.8 px safe spacing.

**label-content-name-mismatch (2.5.3):** `#hero-drone`. Its visible text is "E-03 · Generative frame" but its `aria-label` is "E-03, generative FPV drone frame".

**link-in-text-block (1.4.1):** `#cap-flight > a[href="#e-04"]`. The link is `#C23A00` against the caption's `#6B7385` (1.13:1; dark 1.25:1) and has no underline.

**Incomplete (needs review), all runs:**
- `aria-prohibited-attr` ×6. `aria-label` is set on elements with no role: `p.hero-facts`, `div.register`, `div.specs` ×3 and `div.player`.
- `label-content-name-mismatch` ×2: `#cs-prev` and `#cs-next` (◂ ▸ glyphs; acceptable).
- `th-has-data-cells` ×1: `.bom`.
- `color-contrast` ×150 to 176, because of gradients, pseudo-elements, overlap or images. I checked these by hand (see A11Y-02 and `contrast.cjs`). Text over the glows, the glass nav, the hero pills (`ink` on 80% paper), the dark film strip (`.fr` #E39B3A 7.8/6.1:1, `.cap` #B9B9B9 9.2/7.2:1) and the replay overlay text (#D7D9DA on the 62% scrim, ≥6.9:1) all pass, except `--muted` near the warm glow (≈3.9:1).

## Findings

### A11Y-01 Count-up key figures expose "0" values to assistive tech, and can stay at 0
- Severity: P1
- Where: `.specs .n` and `.photo-stats b` (index.html:168-173, 352-357, 473-478, 514-517); the `count` effect in `js/motion.js` (`node.nodeValue = fmt(0)` until the element intersects); `js/reveals.js:12-14`. Screenshot `review/scratch/accessibility/count-e03-after-jump.png`; tree `review/scratch/accessibility/aria-desktop.yml`.
- Evidence: On load, every count-up figure's text node holds zero. `count.cjs` printed `0.0 | >0Hz | −0%mass | 0g | 0m | … | 0+ | −0%time | 0 | … | 0.00 | ≈0kW | 0+ | 0+`. The accessibility tree, even after a scripted scroll through the whole page, read "Safety factor 0.0 Modal constraint >0Hz Vs plate design −0%mass Printed frame 0g" and "0+ views 0+ downloads". After pressing End (smooth scroll), the About stats were still "0+ views / 0+ downloads": the IntersectionObserver missed them on the way past. With reduced motion the real values are present (`1.5`).
- Why it matters: A screen-reader user, and anyone who reads the page through the tree (reader modes, some crawlers, Google's rendered snapshot), hears that the frame has a safety factor of 0 and is 0% lighter. These are the numbers the hiring-manager reader cares about most. A sighted recruiter who jumps with a nav link can also see "0+ views".
- Fix: Keep the true value in the DOM. In `EFFECTS.count`, wrap the animated digits in `<span aria-hidden="true">` and add a `.sr-only` sibling holding the original `text`. Or animate a CSS custom property or a `::after` copy and leave `nodeValue` alone. Also run any pending `count` instantly when its element is above the viewport at the observer callback, so a fast scroll past it doesn't leave zeros.
- Effort: S

### A11Y-02 `--muted` fails 4.5:1 across the light theme
- Severity: P1
- Where: `--muted: #6B7385` (css/site.css:14), used by `.label` (85), `.eyebrow` (86), `.theme-btn` (109), `.register .r-no` (192), `.sheet-meta .k` (270), `.specs .n small` (288), `.seg button` (435), `.sc-axes button` (589), `.foot-hint` (645), `.pv.map .rest` / `.pv .legend` (427-428), figcaptions (294). Screenshot `review/baseline/scroll/laptop-light-00.png` (eyebrow, "Projects" label, nav "Dark").
- Evidence: Measured contrast: 4.32:1 on `--bg`, 4.40:1 on `--panel`, 3.96:1 on the segmented-control track, and ≈3.88:1 under the warm glow peak top right, where the theme button sits. That is 45 axe nodes on desktop and 46 on phone, at 11 to 14 px regular weight. The 4.76:1 on white passes, so figcaptions and table headers on paper are fine.
- Why it matters: Recruiters reading on a phone outdoors and anyone with low vision lose the labels that give the numbers meaning ("Safety factor", "Role", "Date"), the "Mechanical engineering · UCL" eyebrow, and the theme toggle. It is the single largest AA failure by count.
- Fix: Darken the light `--muted` to `#5B6375`, which gives 5.48 on bg, 5.57 on panel, 5.01 on the seg track and 4.9 on the glow. `#5F6779` is the lightest value that clears every surface (4.63 minimum). Dark `--muted` already passes; leave it.
- Effort: S

### A11Y-03 White text on orange fails in both themes (project numbers, LOAD REPLAY, hover states)
- Severity: P1
- Where: `.sheet-meta .pno` (css/site.css:268), `.pv .rest .btn` "Load replay" (425), `.btn.primary:hover` (179), `.register a:hover .r-no` (193), `.f3-ov .bal.on text` (365), `.acro-badge` (667). Screenshot `review/scratch/accessibility/player-dark.png` (LOAD REPLAY) and `review/baseline/scroll/laptop-light-04.png` (E-03 chip).
- Evidence: White on `#FF4F00` is 3.30:1 and white on `#FF5A14` (dark) is 3.12:1. The text is 12 to 14 px at weight 500, so the AA requirement is 4.5:1. axe flags `.pno` ×4 in every run. LOAD REPLAY is hidden once a flight loads, which is why the post-load axe pass doesn't list it; the contrast maths is the same.
- Why it matters: LOAD REPLAY is the gate to the strongest software evidence on the page (E-04). The project number is the anchor of every project card.
- Fix: Keep orange as the fill and switch the text to `--ink` (`#0B0F17` on `#FF4F00` is 5.82:1; on `#FF5A14` it is 6.14:1). Or, if white text is wanted, fill with `--link` `#C23A00` (5.39:1 with white), as a new token such as `--signal-strong`. Apply the same to the hover states.
- Effort: S

### A11Y-04 Fig. 02, 05 and 06 text renders at about 6 px on a phone
- Severity: P1
- Where: `svg.drawing` with `viewBox="0 0 520 …"` and `font-size="10"/"11"` (index.html:191-209, 404-433, 439-453); `.drawing` (css/site.css:410). Screenshot `review/scratch/accessibility/phone-fig05.png`.
- Evidence: `svgtext.cjs` measured rendered text at 5.9 to 6.5 CSS px on the 375 px phone for `drawing` (Fig. 02 and 06, 20 labels) and `flowchart` (Fig. 05, 14 labels). The other figures are laid out at their own pixel width and stay at 10 to 11 px. The `aria-label`s carry the content for screen readers, but sighted phone users get unreadable labels such as "MARGIN TO LIMIT: 4 G" and "SLIP CHECK μN ≥ drive force?".
- Why it matters: The primary reader (a recruiter on a phone) sees figures they can't read without pinching, and pinching is the exact reflow cost 1.4.10 and 1.4.4 aim to avoid. The figures that carry results (Fig. 02 mass budget, Fig. 06 predicted against measured) are the ones affected.
- Fix: Give these three a phone layout. Either draw them at their pixel width as `bench.js` and `scaling.js` do, or provide a second, narrower `viewBox` (about 320 wide, labels stacked) behind `@media (max-width: 520px)`, using two inline SVGs with one hidden. A cheaper stopgap is a `min-width: 520px` inside an `overflow-x: auto` plate with `tabindex="0"`; it is worse than redrawing but keeps the text at 10 to 11 px.
- Effort: M

### A11Y-05 At 320 CSS px (400% zoom) the About table forces sideways scrolling of the whole page
- Severity: P1
- Where: `table.bom` (index.html:525-557; css/site.css:605-629, especially `.bom th:last-child, .bom td:last-child { white-space: nowrap }` at 617 and the 20 px side paddings). Screenshot `review/scratch/accessibility/reflow/w320-_bom.png`.
- Evidence: At 320×640, `document.documentElement.scrollWidth` is 359 against a `clientWidth` of 320; every `.bom` row runs to x = 358. With the 1.4.12 text-spacing override at 375 px it reaches 417. The screenshot shows the whole page shifted left, cutting off "Contact", the email and the footer. Nothing else overflows: the bench table scrolls inside its own `.tablebox`, and 640×450 (200%) is clean.
- Why it matters: This fails WCAG 1.4.10 Reflow and Dom's own gate ("no horizontal scroll on phones") for 320-wide phones and anyone using large text. The BOM is a list with numbers rather than a two-dimensional table, so the data-table exception doesn't excuse it.
- Fix: Below about 420 px, drop the project-links column's `nowrap` and let the E-0x chips wrap under the skill (`display:block` the last cell, or `grid` the row). Hide the decorative item-number column (`td:first-child`) and reduce the side padding to 12 px. Add a 320 px no-overflow assertion next to the existing phone test.
- Effort: S

### A11Y-06 Focus ring is 2.4:1 in the light theme
- Severity: P2
- Where: `:focus-visible { outline: 2px solid color-mix(in srgb, var(--signal) 70%, transparent) }` (css/site.css:72). Screenshots `review/scratch/accessibility/focus-light/005.png` (View projects), `020.png` (parts list), `031.png` (bench header).
- Evidence: Orange at 70% alpha composites to about `#FF844D`: 2.43:1 against white and 2.29:1 against `--bg`. In dark it is 3.40:1, which passes. All 56 tab stops use this ring except `.film`, which uses a solid `--signal` (3.3:1).
- Why it matters: The ring fails the 3:1 non-text contrast that 1.4.11 asks of focus indicators. Keyboard users on a bright laptop screen lose their place, especially on the pale-on-pale parts list and the bench headers.
- Fix: `outline: 2px solid var(--link)`. That is 5.39:1 on white in light and 7.34:1 in dark, and keeps the accent hue. Drop the separate `.film:focus-visible` rule.
- Effort: S

### A11Y-07 The Fig. 00 caption link can't be told apart from its sentence
- Severity: P2
- Where: `#cap-flight a[href="#e-04"]` (index.html:108); `a { text-decoration: none }` (css/site.css:69); `figcaption` colour (294).
- Evidence: axe `link-in-text-block`: 1.13:1 against the surrounding muted text (dark 1.25:1), with no underline. Some readers see the hue difference only as a slightly different grey.
- Why it matters: This is a 1.4.1 (Level A) failure. It is also the only route from the hero strip to E-04's detail.
- Fix: `figcaption a, .note a, .prose a { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px }`. Underlining inline links only keeps nav and button links clean.
- Effort: S

### A11Y-08 Hero drone link's accessible name doesn't contain its visible text
- Severity: P2
- Where: `a#hero-drone[aria-label="E-03, generative FPV drone frame"]` with visible `.hd-tag` "E-03 · Generative frame" (index.html:65-73).
- Evidence: axe `label-content-name-mismatch`, all runs. The `aria-label` also overrides the image's good alt text.
- Why it matters: A voice-control user who says "click Generative frame" gets no match (2.5.3, Level A).
- Fix: Remove the `aria-label`. The computed name becomes the img alt plus the tag text. Better, make the img `alt=""` and let the name be "E-03 · Generative frame". Or set `aria-label="E-03 · Generative frame: line drawing of the assembled drone"`.
- Effort: S

### A11Y-09 Availability pills and other labelled groups read as one run-on string
- Severity: P2
- Where: `p.hero-facts[aria-label="Availability"]` (index.html:55), `div.register[aria-label]` (75), `div.specs[aria-label]` (168, 352, 473), `div.player[aria-label]` (229); also `.sheet-meta` chips (124, 221, 344, 465).
- Evidence: axe `aria-prohibited-attr` ×6. Chrome drops `aria-label` on role-less `p`/`div`. The tree reads "Summer internship or placement year From 27 June 2027 UK, no sponsorship London" as a single paragraph with no separators or name, and the chips as "E-03 Role Design, analysis & build Tools Fusion generative · Ansys Mechanical Date Jul – Sep 2026 Status …".
- Why it matters: The availability line is the most important recruiter fact on the page. Read aloud it runs together ("…placement year from 27 June 2027 UK no sponsorship London").
- Fix: Make `.hero-facts` a `<ul aria-label="Availability">` with one `<li>` per pill (the CSS targets `span`, so move it to `li`). Make the `.specs` and chip rows `<dl>` with `<dt>`/`<dd>` pairs, which also gives them real label/value semantics. Give `.player` `role="group"` or `role="region"`, and `.register` `role="group"` or a `<nav aria-label>`.
- Effort: S

### A11Y-10 Fig. 03 (bench table): group headers and row headers aren't exposed
- Severity: P2
- Where: `table#bench` (index.html:312-328); headers become buttons in `js/bench.js:21-33`.
- Evidence: In the tree, the first header row ("Clean · run 20", "Orange clutter · run 26") is exposed as plain `cell`s, so a data cell such as 95.75% is announced only as "Camera + IMU" and not with which world. The course-set column ("0–49", "Pooled") is `td`, not row headers. The table has no caption; the figure does. The header buttons give no hint that they sort and chart, and `aria-sort` appears only once a column is sorted.
- Why it matters: The engineer reader using a screen reader can't tell the clean-world and clutter-world numbers apart, and that comparison is the point of the figure.
- Fix: Add `<colgroup>`s (1 + 2 + 2), `scope="colgroup"` on the two world headers, and `<th scope="row">` for the course-set cells and "Pooled". Add a `<caption class="sr-only">` (or `aria-labelledby` pointing at the figcaption). Set `aria-sort="none"` on sortable headers, or add `aria-describedby` with "Sorts the table and charts this column".
- Effort: S

### A11Y-11 Parts-list buttons are below the 24×24 target size
- Severity: P2
- Where: `.f3-parts button` (css/site.css:384) with `td { padding: 2px 8px }` (379); phone layout at 393-401 (10 px text, `padding: 1px 10px` rows). Screenshot `review/scratch/accessibility/phone-parts.png`.
- Evidence: axe target-size: 6 nodes on desktop (19.6 px tall, 23.2 to 23.4 px safe spacing) and 9 on phone (17 px tall, 14 to 22.8 px spacing).
- Why it matters: On a phone, tapping "Camera" or "Bolt M2" to pick the part out of the 3D model often hits the neighbouring row (2.5.8, AA).
- Fix: Make the button fill the row: `.f3-parts button { display:block; width:100%; min-height:24px; padding:4px 0 }` and reduce the `td` vertical padding to 0. On phones, give `tr` `min-height: 28px`. The extra height is about 60 px on desktop and 50 px on phone.
- Effort: S

### A11Y-12 Hero motion runs indefinitely with no pause control (2.2.2)
- Severity: P2
- Where: `js/hero-drone.js` (bob and turn; settles only after 45 s with no scroll or pointer move, and any `pointermove` restarts it); `js/hero-flight.js` (the elevation-view hover bob and rotor blur loop for as long as the strip is on screen); `.hero-facts span:first-child::before { animation: live 2.4s infinite }` (css/site.css:126-130).
- Evidence: 15 s after load, `.hd-art` was still translating (−3.95 px, then +3.2 px 0.7 s later) and the `live` CSS animation was `running`. Reduced motion stops all of it, which is excellent, but WCAG doesn't accept the OS setting as the pause mechanism for 2.2.2 (Level A).
- Why it matters: Constant motion beside the availability facts distracts readers with attention or vestibular difficulties who haven't set the OS preference. Dom's own gate says every animation must carry information, and a looping bob after the first few seconds carries none.
- Fix: Stop the loops after about 5 s. Let the hero drone and the Fig. 00 hover settle to rest (the code already has the `amp` easing to rest) after 5 s rather than 45 s, and don't restart on `pointermove` unless the pointer is over the drone. Set the live dot's animation iteration count to 3. That satisfies 2.2.2 without a visible pause button.
- Effort: S

### A11Y-13 "Copy email" result isn't announced
- Severity: P2
- Where: `#copy` (index.html:588); `js/contact.js` changes `btn.textContent` to "Copied" or "Selected, press copy".
- Evidence: There is no live region. Changing the name of the focused button is announced inconsistently (NVDA/Chrome often say nothing; VoiceOver sometimes re-reads it), and the fallback "Selected, press copy" matters most.
- Why it matters: This is the contact path. A screen-reader recruiter can't tell whether the address is on the clipboard (4.1.3).
- Fix: Add `<span class="sr-only" role="status" id="copy-status"></span>` after the button and set its text to "Email address copied" or "Email selected; press Ctrl+C to copy" alongside the button label.
- Effort: S

### A11Y-14 Heading outline skips levels; the hero has no heading structure
- Severity: P3
- Where: `<h4>Outside engineering</h4>` directly under `<h2>About</h2>` (index.html:512). The hidden `<h1>` (54) comes after the eyebrow. The register and Fig. 00 sit under the h1 with no heading.
- Evidence: The outline is H1, H2 Projects, H3 ×4 (with H4s), H2 About, **H4** Outside engineering, H2 Contact.
- Why it matters: Heading navigation (the main way screen-reader users skim) shows a gap in About. It is a minor 1.3.1 issue.
- Fix: Change "Outside engineering" to `<h3>` and keep its look with the existing `.outside h4` rule re-targeted to `.outside h3`. Optionally make the register's "Projects" label an `<h2 class="label">` or give it `aria-labelledby`. Move the eyebrow after the h1. The hidden h1's "mechanical engineering portfolio" wording is for the copy reviewer (IMPROVEMENTS.md open P1).
- Effort: S

### A11Y-15 No skip link
- Severity: P3
- Where: There is none. The first focusable element is `.nav .name` (index.html:36).
- Evidence: The nav is only 5 stops, and `<main>` exists, so 2.4.1 is technically met. The longer keyboard trap is Fig. 01: 3 view buttons plus 9 parts-list buttons (tab stops 15 to 26) between Fig. 00 and the replay.
- Why it matters: It is cheap, expected by keyboard users, and lets them reach the projects directly.
- Fix: Add `<a class="skip" href="#work">Skip to projects</a>` as the first child of `<body>`, visible on focus. Optionally add a "Skip the 3D model" link before `.f3-steps` that targets `#e-03 .specs`.
- Effort: S

### A11Y-16 Interactive figures: some information is pointer-only or silent
- Severity: P3
- Where: Fig. 07 point names (`js/scaling.js` `point()`, pointer only); Fig. 01 turning (drag only; `js/frame3d.js`); the rig `svg#rig[role=group]` (index.html:100) with arrow, G and R keys, and `#stab` (105) not live; the failsafe/IMPACT note drawn in SVG only; `.f3-steps button[aria-current="step"]` (frame3d.js:604).
- Evidence: A keyboard or screen-reader user can't learn a scatter point's model name, can't turn the model (2.5.7 needs a single-pointer alternative to the drag), and isn't told when the gains go unstable or the failsafe cuts the motors. Arrow keys on a `role=group` are taken by screen readers' browse mode. `aria-current="step"` suggests a stepper, but these buttons are toggles.
- Why it matters: These are the "engineer respects it" moments. The summary labels already carry the main facts, so this is polish.
- Fix: Give the rig `role="application"` with `aria-roledescription="hover test rig"` and make `#stab` `aria-live="polite"`, also announcing "Failsafe: motors cut" there. Use `aria-pressed` on `.f3-steps` buttons. Add ◂ ▸ "Turn" buttons, or arrow keys on the focused canvas, for Fig. 01. For Fig. 07, an arrow-key cursor over the sorted points, or a "largest five models" list in the caption.
- Effort: M

### A11Y-17 Small items
- Severity: P3
- Where and fix:
  - `html { scroll-padding-top: calc(72px + …) }` (css/site.css:51) is less than the nav's height when it wraps: 77 px at 320 and 89 px with text spacing, so anchor targets land 5 to 17 px under the glass nav. Use `var(--nav-h, 72px)`, which `frame3d-boot.js` already sets.
  - The `fpv` easter egg (`js/acro.js:12`) is a letter-only shortcut active page-wide (2.1.4). It is harmless at three letters, but ignore keys while focus is in a form control or the rig.
  - The `.climb-ctl label` wraps an `<output>` (implicit `role=status`), so each slider step is announced twice (index.html:369-371). Move the outputs out of the labels, or use `aria-live="off"` on them.
  - `.bom` group rows `th[scope=rowgroup][colspan=4]` are exposed as plain cells, and there are many empty `td`s (axe `th-has-data-cells` incomplete). This is acceptable, but a `<ul>`/`<dl>` per group would be simpler semantics than a 4-column table.
  - `#r-out` "Could not load that flight" and `#load-note` (index.html:237, 255) aren't live; add `role="status"` to `#load-note`.
  - Rig gain-slider thumbs are white with a `--rule` border on `--panel` (css/site.css:246), well under 3:1. Give them `border: 1.5px solid var(--ink-2)`.
- Effort: S
