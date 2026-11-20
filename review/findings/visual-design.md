# Visual design review (art director): Phase R, smooth layered panels

## Method

I read `review/BRIEF.md`, `DESIGN_PLAN.md` (Phase R, H.1 to H.3 and §5), `IMPROVEMENTS.md`, `README.md`, all of
`css/site.css` (706 lines) and `index.html` (622 lines). I looked at every baseline fold shot (phone, tablet, laptop,
desktop; light and dark), the full laptop scroll sequence (`review/baseline/scroll/laptop-light-00..14.png`), most of the
phone scroll sequence, and `laptop-dark-full-1.png`. On the running page I took my own clipped component screenshots at
1440x900 and 375 (iPhone 13 metrics) in both themes (`review/scratch/visual-design/<size>-<theme>-<component>.png`, made by
`shots.js`). I also measured the rendered page with `measure.js`: the font sizes, families and weights in use, the
border radii, the uppercase SVG labels, and layout boxes (parts list, prose column, BOM cell, nav height). I computed WCAG
contrast for the token pairs with `contrast.js`. I did not edit any site file.

## Scores

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| Typography | 6 | Plex Sans body and Plex Mono data are well chosen, but there are 18 rendered sizes and no scale, the hero has no display moment, and the figures still use uppercase letter-spaced mono with wrong SI units. |
| Grid and alignment | 6 | The 1240 px wrap is consistent, but the sheets indent content 56 px, the parts list overflows its own margin, the drone tag floats, and About leaves a large empty column. |
| Spacing system | 6 | Section padding uses sensible clamps, but there are no spacing tokens (gaps of 4, 8, 12, 14, 18, 22, 24, 26, 32, 40, 48, 56 px), dead zones on large screens, and doubled insets on phones. |
| Colour and contrast | 6 | The single-accent discipline is good, but white on `--signal` is 3.3:1 on small text, `--muted` on `--bg` and `--panel` is 4.3 to 4.4:1 at 12 to 14 px, and the true-path blue is hard-coded. |
| Hierarchy | 5 | Nothing in the hero is bigger than 20 px. Five equal-weight chips sit above every project title, and all four projects carry the same visual weight. |
| Component consistency | 6 | The components are carefully built, but there are 11 radius values against 3 tokens, three segmented controls, three slider styles, and capsules used for buttons, facts, tags and metadata alike. |
| Depth and elevation | 6 | The shadow tokens are well crafted, but page, sheet, figure and inset card stack four levels of bordered containers. In dark the panels nearly vanish (paper on bg is 1.08:1). |
| Imagery | 6 | The hero line drawing and Fig. 04 isometric are genuinely his and distinctive. There is still no real hardware photograph, the project cards have no imagery, and Fig. 01's material colours break the line-art language. |
| Dark theme | 6 | Token parity is real, but surfaces collapse into one mass, Fig. 02's bar becomes a near-white slab, the primary button inverts to the loudest element on screen, and the blue path drops to 3.3:1. |
| Distinctiveness and premium feel | 5 | It is tidy but reads as the 2024-era SaaS starter look. The distinctive parts are the figures, which Phase R's shell does not frame or amplify. |
| **Overall** | **6** | Clean, competent and consistent enough, but generic at the identity layer. Redesign the shell (type, hero, sheet anatomy, surface vocabulary) and keep the figures and the token plumbing. |

## Is Phase R distinctive or generic? (verdict and reasoning)

**Generic/template look: yes**

**Overall visual-design score: 6/10**

Reasoning:

1. **Every surface choice is the default of the current "modern dev site" kit.** It has an off-white `#F3F4F7` page,
   white rounded cards with layered soft shadows (`--e-1..3`, site.css:21-23), a fading dot grid and two corner glows
   (site.css:57-68), a glass sticky nav with `backdrop-filter` (site.css:93-98), a pulsing green "live" dot
   (site.css:126-130), capsule pills for everything (`border-radius: 999px` on 44 rendered elements), an eyebrow with a
   coloured dot (site.css:86-87), and Space Grotesk headings. Each choice is fine on its own. Together they are the look
   of a Tailwind UI or shadcn landing template, and of a large share of 2024–26 student portfolios. Space Grotesk in
   particular has become the default "techy" Google Font. Compare `laptop-light-fold.png` with any Vercel or shadcn
   template hero: the structure (eyebrow, pills, lede, two pill buttons, illustration on the right, four feature cards
   below) is the same.
2. **What is distinctive is the content, not the shell.** That means the flight-test strip (Fig. 00), the
   detect/measure/fuse/fly pipeline strip, the climbing robot, the pinned 3D frame, the line-drawn hero drone and the
   film strip. A recruiter would remember these a week later. Phase R wraps each of them in the same white card with the
   same 1 px hairline and caption bar (site.css:292-294), so they read as "embedded widgets" rather than as the work.
   The figures also still speak the old drawing-set language (uppercase letter-spaced mono, `PLAN` / `ELEVATION` tags,
   hatched ground, balloons), so the page has two visual languages that never meet.
3. **There is no typographic voice.** H.3 removed the headline, and nothing replaced its job as the page's anchor.
   The largest type above the fold is the 20 px lede (site.css:118). Premium sites (Linear, Stripe, Teenage
   Engineering, Klim's own site) get most of their "premium" from confident type at scale and strict hierarchy, not from
   shadows.
4. **It is not bad.** Execution is careful: tokens, `color-mix`, light/dark parity, reduced-motion handling, tabular
   figures and balanced headings. That is why the score is 6 and not 4. The redesign needed is of the **identity layer**
   (type pairing and scale, hero composition, the sheet anatomy, and the pill/card vocabulary), not a teardown of the
   components or the figures.

Directions that would make it distinctive while respecting Phase R's constraints (light first, no drawing set, geometric
or modern sans, crosshair cursor and film strip kept):

- **"Flight-test report" or instrument direction.** Use one technical sans with real character for headings and UI,
  plus its mono for data, set large and tight. Build-free options on Google Fonts: **Geist + Geist Mono** (Vercel, OFL,
  very clean but increasingly common), **Martian Grotesk + Martian Mono** (Evil Martians, OFL, an instrument-panel
  feel), or **Archivo** with its width axis (SemiExpanded or Expanded for headings gives an aerospace and defence
  register). Paid references for the feel to aim at: Klim's **Söhne / Söhne Mono** (Stripe), Grilli Type's
  **GT America Expanded / Mono**, Dinamo's **ABC Diatype** and **Monument Grotesk**. Keep IBM Plex Mono for data if
  preferred: it is the strongest current choice.
- **Fewer containers, more page.** Run each project as a full-bleed section on the page with a strong title and a
  numbered spec line. Make the figure the only raised object. References: **Teenage Engineering** product pages (spec
  tables as type, not cards), **Distill.pub** articles (figure and prose interplay for explorable explanations),
  **Stripe Press** (editorial hierarchy), **Linear's** changelog and method pages (type-led, few surfaces).
- **A system reference for the data figures.** **IBM Carbon's data-visualisation guidelines** (Plex is Carbon's type),
  and the **NASA Graphics Standards Manual** (1975) as the model for a consistent, sentence-case, unit-correct
  technical labelling system that is not a drawing set.

## Findings

### VIS-01 The hero has no typographic anchor
- Severity: P1
- Where: hero, `.hero-text` (index.html:52-61); `.hero .lede` (site.css:118); `.eyebrow` (site.css:86). Screenshots: `review/baseline/laptop-light-fold.png`, `review/baseline/phone-light-fold.png`, `review/scratch/visual-design/laptop-light-hero.png`
- Evidence: Above the fold, the largest text is the 20 px lede ("I work across CAD..."), set in `--ink-2` grey. The name appears only in the 19 px nav. The four availability pills (13 px, white capsules with shadow) are the most visually prominent objects in the text column, so the eye goes to "Summer internship or placement year" before it knows whose page this is. At 1920 (`desktop-light-fold.png`) the text block floats in about 160 px of empty space above the eyebrow. That comes from `padding-block: clamp(48px, 8vw, 96px)` (site.css:114) plus `align-self: center` (site.css:115).
- Why it matters: Recruiters (reader 1) have 30 seconds on a phone, and the page has no "who and what" moment. It is also the main reason the fold reads as a template: without a display line the composition is just pills, paragraph and buttons. This reopens H.3 ("no visible headline", Dom's call on 14 Nov). The reason is that H.3 removed the headline sentence but nothing took over its hierarchy job.
- Fix: Keep "no slogan" if Dom wants, but give the hero a display element. Set the name and target in the display face at `clamp(40px, 6vw, 76px)`, `letter-spacing: -0.03em`, `line-height: 0.98`, as a visible h1 (for example "Dominic Tataj" over a second line naming the target roles; the role wording needs to come from Dom or the copy review). Then demote the pills to a compact spec line (see VIS-09). Reduce the hero's top padding to `clamp(32px, 5vw, 64px)` and drop `align-self: center` on `.hero-text` above 1200 px so the block sits under the nav, not in the middle of empty space.
- Effort: S (CSS and markup), plus a copy decision from Dom

### VIS-02 The shell's surface vocabulary is the generic SaaS starter kit
- Severity: P1
- Where: tokens and global shell, site.css:5-35 (tokens), 57-68 (glows and dot grid), 93-98 (glass nav), 120-130 (live-dot pills), 260 (`.sheet`), 286 (`.specs > div`), 292 (`figure`). Screenshots: `review/baseline/scroll/laptop-light-00.png` to `-05.png`, `review/baseline/desktop-light-fold.png`
- Evidence: See the verdict above. The page is an off-white background, white rounded cards, soft layered shadows, dot grid, corner glows, glass nav, a live dot, capsules for every fact, and Space Grotesk. The measured page uses capsule radius 999 px on 44 elements and 14 px on 28. The only brand-specific element in the shell is the orange.
- Why it matters: The goal in the brief and `DESIGN_PLAN.md` is "a recruiter remembers the site a week later". The shell is forgettable. The figures are memorable, but they sit inside it.
- Fix: Redesign at the identity layer and keep the component internals. (1) Choose a heading face with more character, or use one superfamily throughout (options under the verdict: Geist/Geist Mono, Martian Grotesk/Mono, Archivo SemiExpanded with Plex Mono). (2) Remove the corner glows and the drone's orange halo (site.css:59-63, 136-140). One quiet background is enough. (3) Drop the per-project white sheet panel and run projects on the page with a hairline divider and a large project number in the display face. Keep raised surfaces only for interactive figures. (4) Replace capsules for facts and metadata with typeset spec lines (VIS-09). (5) Make the figures the hero of each project by giving them full sheet width and a stronger caption style (`Fig. 01` set in mono with the signal colour), rather than a 13 px grey caption bar.
- Effort: L

### VIS-03 Small text fails AA: white on orange, and `--muted` on the page and inset surfaces
- Severity: P1
- Where: `--signal`, `--muted` (site.css:14-15). White text on `--signal`: `.sheet-meta .pno` (268), `.register a:hover .r-no` (193), `.btn.primary:hover` (179), `.pv .rest .btn` (425), `.acro-badge` (667), `.f3-ov .bal.on text` (365). `--muted` on `--bg` or `--panel`: `.label` (85), `.eyebrow` (86), `.theme-btn` (109), `.sheet-meta .k` (270), the `.specs` labels, `.r-no` (192), `.climb-read` labels. Screenshots: `review/scratch/visual-design/laptop-light-e03meta.png`, `laptop-light-player.png`
- Evidence: Computed ratios: white on `#FF4F00` is **3.30:1** (light) and white on `#FF5A14` is **3.12:1** (dark). These are used for 12 px mono "E-03" and the 14 px "Load replay" button. `#6B7385` on `#F3F4F7` is **4.32:1** and on `#F5F6F9` is **4.40:1**, used at 12 to 14 px for the eyebrow, the "Projects" label, the "Dark" toggle and every stat-card label. All of these are under the 4.5:1 that WCAG AA requires for small text.
- Why it matters: For all readers, and on a phone in daylight these labels are the first to wash out. It also breaks the §5 quality gates and the parity claim.
- Fix: Add `--signal-ink: #D63F00` (white on it is 4.59:1) and use it as the fill wherever white text sits on orange. Keep `#FF4F00` for strokes, data marks and non-text fills. Darken light `--muted` to `#5E6677` (5.24:1 on `--bg`, 5.33:1 on `--panel`). In dark, use `#E24A0A` or darker under white text, or use `--ink` text on `--signal`.
- Effort: S

### VIS-04 Figures still use the drawing set's uppercase letter-spaced mono, and the uppercasing corrupts SI units
- Severity: P1
- Where: index.html:197-208 (Fig. 02: "CAA LIMIT 250 G", "FRAME 38 G", "MARGIN TO LIMIT: 4 G"), 408-432 (Fig. 05), 442-447 (Fig. 06); js/hero-flight.js:48, 125, 194 ("T 3.10 S · 6.9 M/S"), 231; js/pipeline.js:116 (`toUpperCase()`); js/bench.js:96; js/frame3d.js:436; js/scaling.js:154; letter-spacing at site.css:217, 360, 411, 428, 469, 471, 513, 544, 575, 592. Screenshots: `review/baseline/scroll/laptop-light-05.png`, `-07.png`, `-09.png`, `-10.png`, `review/baseline/scroll/phone-light-10.png`
- Evidence: Measured: 37 distinct uppercase SVG labels, all 10 to 11 px IBM Plex Mono with 0.06 to 0.08 em tracking. Phase R.2 says "uppercase mono labels (normal case now)" were removed, but only the HTML labels changed. In the figures, uppercasing turns grams into "G" (giga, or g-force), seconds into "S" (siemens), "m/s" into "M/S" and "mm/s" into "MM/S". On the phone (`phone-light-10.png`) the pipeline readouts wrap to three lines of tracked capitals: "THRUST 0.90 G · RATES 1.3 1.4 0.4 RAD/S".
- Why it matters: To engineers and hiring managers (reader 2), "38 G" and "6.9 M/S" are unit errors on a page whose argument is rigour. Visually, it is the drawing-set identity Dom asked to drop, and it clashes with the sentence-case shell around it.
- Fix: Sentence case with correct units everywhere: "CAA limit 250 g", "Frame 38 g", "t 3.10 s · 6.9 m/s · gate 2/8". Remove the `.toUpperCase()` calls listed above (keep the Greek-letter handling in pipeline.js only if still needed). Reduce `letter-spacing` to 0 to 0.02em for mono at 10 to 11 px. Set axis titles in Plex Sans 11 px `--ink-2` and keep mono for numbers only (the convention in IBM Carbon's chart guidelines). Keep `PLAN` / `ELEVATION` as sentence-case tags styled like `.pv .tag` (site.css:422) so all figures share one tag component.
- Effort: M

### VIS-05 Phones: nested insets, stacked stat cards and five chip rows push the content down
- Severity: P1
- Where: `.wrap` (site.css:75-79) plus `.sheet-body` / `.sheet-meta` padding `clamp(24px, 5vw, 56px)` (267, 272); `.specs` `minmax(min(100%, 160px), 1fr)` (285); `.sheet-meta` chips (267-270). Screenshots: `review/baseline/scroll/phone-light-06.png`, `-08.png`, `-14.png`, `review/scratch/visual-design/phone-light-e03specs.png`
- Evidence: Measured at 390 px wide: the prose column is 308 px (x 41 to 349), so 21% of the width is margin. Each stat card is 308x90 px, and because 308 px cannot fit two 160 px columns plus the gap, the four key figures stack into about 400 px of vertical space (phone-light-06). The chips wrap to five rows, about 190 css px, before E-02's title (phone-light-14). Body text at 17 px in a 308 px column gives about 32 characters per line (phone-light-10).
- Why it matters: Recruiters (reader 1) on a phone see one fact per screen. The key numbers are what should be scannable in 30 seconds.
- Fix: Under 520 px, set `.sheet-meta` and `.sheet-body` horizontal padding to 16 px (or drop the sheet panel, as in VIS-02). Use `.specs { grid-template-columns: repeat(2, minmax(0, 1fr)); }` with 12 px padding and a 24 px `.n`. Collapse chips into one or two lines of plain metadata ("E-03 · Design, analysis & build · Jul–Sep 2026 · Built & tested") in 13 px `--ink-2`, with only the project number as a filled chip.
- Effort: M

### VIS-06 Dark theme: surfaces merge, the mass bar turns into a slab, and the primary button shouts
- Severity: P2
- Where: dark tokens (site.css:36-47); `.btn.primary` (178); Fig. 02 bar `fill="var(--ink)" opacity="0.82"` (index.html:195) and Fig. 06 (index.html:443); true-path blue `#2C6E9C` hard-coded (site.css:211, 477; index.html:244). Screenshots: `review/baseline/laptop-dark-full-1.png`, `review/scratch/visual-design/laptop-dark-fig02.png`, `laptop-dark-contact.png`, `review/baseline/laptop-dark-fold.png`
- Evidence: `--paper #12151B` on `--bg #090B0F` is **1.08:1**, and `--panel` on `--paper` is 1.07:1. Panels are separated only by an 8% white hairline and a 5% top highlight, so the downsampled full page reads as one black field. In Fig. 02 the "all-up" bar becomes a pale `#ECEEF2` slab that outweighs the orange frame segment it should support. "View projects" and "Copy email" become light-grey pills, the brightest objects on the screen. The true-path blue `#2C6E9C` on dark paper is **3.32:1**, and it has no dark token.
- Why it matters: The dark theme is opt-in, but §5 requires parity. Engineers who toggle dark get a flatter, less legible page.
- Fix: Raise the dark surfaces to `--paper: #14181F`, `--panel: #1B2029`, `--rule: rgba(255,255,255,.10)`, `--hi: inset 0 1px 0 rgba(255,255,255,.07)`, in the style of Linear's dark UI, where each elevation step is a visibly lighter surface. Add `--bar: var(--ink-2)` (light `#485165`, dark `#6B7385`) for neutral data bars and use it in index.html:195 and 443. Add `--truth` (light `#2C6E9C`, dark `#5AA2D6`). In dark, make `.btn.primary` `--signal-ink` with white text, or `--paper` with an `--ink` border, rather than an inverted light pill.
- Effort: S

### VIS-07 Card-in-card-in-card: four levels of bordered containers
- Severity: P2
- Where: `.sheet` (site.css:260), `figure` (292), `.player` (414), `.specs > div` (286), `.climb-read > div` (572), `.f3-parts` (391). Screenshots: `review/baseline/scroll/laptop-light-09.png`, `review/scratch/visual-design/laptop-light-climb.png`
- Evidence: In Fig. 04 the reading order is page, then the E-02 sheet (border, `--e-2`), then the figure (border, `--e-1`), then the side panel, then four `.climb-read` cards (border, `--panel`). That is four nested hairline rectangles with three radii. The same happens with the stat cards under each sheet.
- Why it matters: Nested containers are the clearest template tell. They also eat width on phones (VIS-05) and blur hierarchy, because everything is "a card".
- Fix: Allow at most two levels: page and raised object. Inside a sheet, figures lose their shadow (`box-shadow: none`) and keep only the hairline. Inset stat cards become borderless `--panel` tiles or plain typeset numbers divided by hairlines. `.climb-read` becomes a definition row, not cards. If VIS-02's "no sheet panels" route is taken, figures keep `--e-1` and nothing else is raised.
- Effort: M

### VIS-08 No type scale: 18 rendered sizes and hand-set values in about 40 rules
- Severity: P2
- Where: font declarations at site.css:54, 85, 86, 100, 105, 118, 123, 159, 172, 192, 194, 195, 203, 255, 274, 275, 279, 287, 288, 294, 434, 446, 462, 466, 469, 485, 533, 563, 573, 606, 611, 613, 614, 635, 643, 645, 702 and others
- Evidence: Measured at 1440: text renders at 10, 10.83, 11, 12, 13, 14, 15, 16, 17, 19, 20, 22, 24, 25, 30, 34, 40 and 50 px. The 19 / 20 / 22 / 24 / 25 cluster has no clear jumps (summary 19, lede 20, h4 22, email 24, photo stats 22). There are no `--fs-*` tokens. Only colour, radius and motion are tokenised.
- Why it matters: Rhythm and hierarchy (VIS-01) depend on a few clearly separated steps. With 18 sizes the eye cannot tell the levels apart.
- Fix: Add tokens on a roughly 1.25 ratio and map every rule to them: `--fs-xs 12px` (captions, labels; replace 10, 10.83 and 11 in HTML), `--fs-s 14px`, `--fs-m 17px` (body), `--fs-l 21px` (lede, summary, h4), `--fs-xl 28px` (stat numbers), `--fs-2xl clamp(32px, 3.6vw, 44px)` (project titles), `--fs-3xl clamp(44px, 6vw, 76px)` (hero, section heads). Leave SVG text at 11 px minimum.
- Effort: M

### VIS-09 Component drift: capsules for everything, 11 radii, three segmented controls, three slider styles
- Severity: P2
- Where: radii at site.css:192 (6px), 268 (8px), 329 (12px), 331 (9px), 432 (11px), 435 (8px), 468 (8px), 525 (8px), 588 (11px), 589 (8px), 620 (6px), 626 (8px), 695 (3px). Segmented controls: `.f3-steps` (329-337), `.seg` (432-439), `.sc-axes` (588-590). Sliders: custom `.rig-controls input[type=range]` (243-247), native `accent-color` in `.controls` (441) and `.climb-ctl` (564). Capsules: `.hero-facts span` (121), `.chip` (269), `.btn` (171), `.nav ul a` (105), `.hd-tag` (159), `.pv .tag` (422), `.pill` (447), `.climb-tag` (560), `.dc-read` (660). Screenshots: `review/scratch/visual-design/laptop-light-player.png`, `laptop-light-climb.png`, `review/baseline/scroll/laptop-light-02.png`
- Evidence: Measured radii in use: 3, 6, 8, 9, 10, 11, 12, 14, 22 px, 50% and 999 px, against tokens of 10/14/22. The three segmented controls use different track radii (12 / 11 / 11), button radii (9 / 8 / 8) and sizes (13 / 12 / 12 px). Fig. 03's replay scrubber is a native grey Chromium slider with an orange thumb, while the rig has custom round thumbs. Facts (availability), metadata (chips), tags and actions (buttons) are all the same white capsule, so nothing signals "this is clickable".
- Why it matters: Inconsistency reads as unfinished to anyone with a design eye. Capsules that look like buttons but are not clickable mislead every reader.
- Fix: One `.seg` component used by all three. One custom range style (the rig's) applied to the replay and climber sliders. Map every radius to `--r-xs: 6px` (tags, inner tiles), `--r-s`, `--r-m`, `--r-l`, and use inner radius = outer radius − padding for nested shapes (for example `.seg` at 11 px with 3 px padding gives 8 px buttons). Reserve capsules for actions. Render facts and metadata as text: availability as a two-column spec list (label in `--muted`, value in `--ink`, hairline rows), in the manner of Teenage Engineering spec sheets.
- Effort: M

### VIS-10 Fig. 01's parts list overflows its margin, and its caption sits outside its panel
- Severity: P2
- Where: `.f3-parts` `width: 100%` (site.css:376) plus `margin: 0 16px 16px 0` (316); border on the table (391) with `caption` outside it (377). Screenshots: `review/baseline/scroll/laptop-light-02.png`, `-03.png`, `-04.png`
- Evidence: Measured at 1440: `.f3-parts` right edge = 1258 = `.f3-stage` right edge. The 16 px right margin is lost because `width: 100%` plus the margin overflows the 300 px grid column, so the panel touches the figure's border ("38 g" sits on the edge). "Parts list" floats above the bordered box on the dot grid, detached from its table.
- Why it matters: For engineers (reader 2) this is the centrepiece figure, and a visibly mis-fitted panel undercuts "premium".
- Fix: `.f3-parts { width: auto; justify-self: stretch; }` inside the grid, or `width: calc(100% - 16px)`. Move the border, radius and shadow to a wrapper `div`, or style the caption as the panel's header (`caption { background: color-mix(in srgb, var(--paper) 88%, transparent); border: 1px solid var(--rule); border-bottom: 0; border-radius: var(--r-m) var(--r-m) 0 0; }`) and remove the table's top radius.
- Effort: S

### VIS-11 About's skills table collapses to a 134 px column on phones
- Severity: P2
- Where: `.bom` (site.css:605-629); index.html:525-557. Screenshots: `review/baseline/scroll/phone-light-21.png`, `-23.png`, `review/scratch/visual-design/phone-light-bom.png`
- Evidence: Measured at 390: the skill cell is 134 px wide (x 63 to 197). "MEng Mechanical Engineering, UCL" wraps over four lines and "German and Spanish (intermediate), Mandarin (beginner)" over five, while the qty and links columns hold empty cells for education, experience and languages.
- Why it matters: Education and experience are what a recruiter looks for in About, and here they are the hardest text on the page to read.
- Fix: Under 600 px, `display: block` the rows: number and skill on one line, the project links as a row of tags under the skill, and hide the qty column (the tag count already says it). On desktop, consider spanning About's two columns. At 1440 the left column ends about 600 px above the end of the table and leaves a large empty area (`review/baseline/scroll/laptop-light-12.png`, `-13.png`). Fill it by making the left column `position: sticky`, or by placing the contact sheet beside the table.
- Effort: S

### VIS-12 Project cards are text-only feature cards with no outcome and no image
- Severity: P2
- Where: `.register` (index.html:75-95; site.css:182-195). Screenshots: `review/baseline/laptop-light-fold.png`, `review/scratch/visual-design/phone-light-register.png`
- Evidence: Each card holds a number tag, a title and a tools line ("MATLAB", "Excel · Fusion"). On the phone they are four 140 px white boxes (about 560 px). They duplicate the section's own "Projects" heading two screens later, and they show neither result nor image.
- Why it matters: These cards are the recruiter's index. A result and a picture are what make a card memorable. The tools line is the least distinctive fact about each project.
- Fix: Add one result line in mono, using figures already on the page: E-03 "246 g all-up · −36% mass"; E-04 "98.6% gates, 300 courses"; E-02 "Completed the climb · −16% time"; E-01 "358 models · P ∝ N^0.55". Add a 64 to 80 px thumbnail from existing assets (`images/hero/t16.webp`, the replay still from `flights/index.js`, `images/robot-iso-ink.png`, a static scatter). On phones, render the cards as a compact list (thumbnail, title, result) at about 72 px per row.
- Effort: M

### VIS-13 The phone nav takes two rows (77 px) and the theme toggle reads as a fourth link
- Severity: P2
- Where: `.nav .wrap` `flex-wrap: wrap` (site.css:99); `.theme-btn` (104-110); index.html:33-45. Screenshot: `review/baseline/phone-light-fold.png`
- Evidence: Measured nav height on the phone is 77 px, 9.5% of an 812 px viewport, and it is sticky. The links wrap under the name and are indented by their own 10 px padding, so "Work" does not align with "Dominic Tataj". "Dark" / "Light" is plain text styled like a link.
- Why it matters: That is permanent viewport loss on the device recruiters use, plus a small alignment flaw directly under the name.
- Fix: Below 520 px keep one row: name at 17 px, links at 13 px with 6 px padding, and the theme toggle as a 32 px icon button (sun/moon SVG, `aria-label`). Pull the first link back with a negative left margin equal to its padding, or align the link text rather than the link box.
- Effort: S

### VIS-14 Vertical rhythm: dead zones and a doubled section label
- Severity: P2
- Where: hero padding (site.css:114), `.section` padding `clamp(64px, 9vw, 112px)` (253), `.sheet + .sheet` 56 px (261), `.contact-sheet` 64 px (685). Screenshots: `review/baseline/scroll/laptop-light-01.png`, `-14.png`, `review/baseline/desktop-light-fold.png`
- Evidence: Between Fig. 00's bottom edge and the "Selected work" eyebrow there are about 190 px of empty page at 1440 (hero bottom padding 72 plus section padding 112). The project list is introduced twice: the "Projects" label over the cards, then "Selected work / Projects" two screens later. Above the contact heading there are about 180 px of empty page (laptop-light-14). Spacing values are hand-set (gaps of 26, 14, 48, 56, 40, 64 px) with no token set.
- Why it matters: The page is very long on phones (25 screens). Every empty band costs scroll time, and uneven gaps weaken the sense of system.
- Fix: Add a spacing scale (`--s-1 4`, `--s-2 8`, `--s-3 12`, `--s-4 16`, `--s-5 24`, `--s-6 32`, `--s-7 48`, `--s-8 64`, `--s-9 96`) and use it everywhere. Cap section padding at 96 px and at 48 px on phones. Rename the register label to something that is not "Projects", or drop the "Selected work" eyebrow so the section head carries the label.
- Effort: S

### VIS-15 Count-up stat numbers can be read, and captured, at false values
- Severity: P2
- Where: `.specs .n` count-up from js/reveals.js; index.html:168-173. Screenshot: `review/baseline/scroll/laptop-light-05.png`
- Evidence: Mid-scroll capture shows "Safety factor 0.9", "Modal constraint >184 Hz", "Vs plate design −22% mass" and "Printed frame 23 g", none of which are true values (they should read 1.5, >300, −36%, 38).
- Why it matters: Engineers (reader 2) who glance mid-animation read wrong numbers, and a screenshot shared internally could carry them. It also conflicts with "content is readable at frame 0".
- Fix: Do not animate the value. Reveal the true number with an opacity or translate rise, or animate a small bar or underline that carries the magnitude. If the count stays, keep it under 400 ms and start it only when the card is fully in view.
- Effort: S

### VIS-16 The hero drone's tag floats detached under the column's left edge
- Severity: P3
- Where: `.hd-tag` `left: 0; bottom: 2%` (site.css:158-162). Screenshots: `review/baseline/laptop-light-fold.png`, `review/baseline/desktop-light-fold.png`, `review/baseline/tablet-light-fold.png`
- Evidence: At 1440 and 1920 the "E-03 · Generative frame" pill sits at the left edge of the drone column, about 30 to 60 px left of the drawing and below its shadow. At 768 it sits alone at the bottom-left of a full-width drone.
- Why it matters: This is polish. A caption should sit with its object.
- Fix: `left: 50%; transform: translateX(-50%)` under the shadow, or set it as a figure caption line ("Fig. — E-03 frame, from the Fusion model →") aligned with the drawing's left edge.
- Effort: S

### VIS-17 Imagery languages do not meet: line art, real-material colours and photos
- Severity: P3
- Where: hero frames (`images/hero/*.webp`), Fig. 01 exploded colours (js/frame3d.js:248-257, the GLB's own materials), Fig. 04 masks (site.css:557-558), film strip (685-706). Screenshots: `review/baseline/scroll/laptop-light-03.png`, `review/baseline/laptop-light-fold.png`
- Evidence: The hero and Fig. 04 are monochrome line drawings in the same hand. In Fig. 01's assembled and exploded views the parts take their Fusion materials: a pastel yellow battery, blue VTX, green FC and grey motors. This is the one saturated palette on the page outside orange and the photos. There is no real photograph of the built frame or the robot (IMPROVEMENTS.md item 9 was dropped).
- Why it matters: A coherent image language is a large part of "premium". A real photo of the 246 g drone would do more for credibility with reader 2 than any styling change.
- Fix: Draw Fig. 01 in the line-art style, with a greyscale ramp for depth, and colour only the picked part in `--signal` (the code already lerps between draw colour and real colour, so set the real colour to a neutral). Needs from Dom: one well-lit photograph each of the printed frame and the robot, if they exist. These would sit as the first frame of each project, with the CAD figure second.
- Effort: S (Fig. 01); photos need Dom

### VIS-18 Small typesetting glitches in the stats and Fig. 07
- Severity: P3
- Where: `.specs .n` with `<sup>` (index.html:475; site.css:287); Fig. 07 axis title (js/scaling.js). Screenshot: `review/baseline/scroll/laptop-light-11.png`
- Evidence: In "P ∝ N^0.55" the unstyled `sup` raises the line box, so this card's number sits lower than its neighbours. In Fig. 07 the y-axis title ("TRAINING POWER DRAW, P (W)") overlaps the 10⁸ tick label.
- Why it matters: This is polish that engineers notice.
- Fix: `.specs sup { font-size: 0.55em; line-height: 0; vertical-align: 0.8em; }`. Move the axis title above the plot area by an extra 12 px, or rotate it along the axis.
- Effort: S

### VIS-19 The film strip's sprocket holes read as heavy white squares
- Severity: P3
- Where: `.film ol` background (site.css:688-693). Screenshot: `review/baseline/scroll/laptop-light-13.png`
- Evidence: Sprocket holes are 9x10 px sharp squares at 22 px pitch in `--paper`. Against the `#161616` base they are a high-contrast checker that competes with the photographs. Real 35 mm perforations are rounded rectangles and much smaller relative to the frame.
- Why it matters: The film strip is a kept element (Phase R). It should be the most refined object on the page, not the busiest.
- Fix: Smaller holes (6x8 px) with 1.5 px corner radius (a `radial-gradient` or an SVG mask in place of the linear gradients), at about 85% `--paper`, and frame numbers in `--muted`-orange at 0.04em tracking.
- Effort: S
