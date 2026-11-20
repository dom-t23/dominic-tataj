# Copy review: UX writing and content editing

**Reviewer:** copy (UX writer and content editor) · **Prefix:** COPY · **Date:** 20 Nov 2026

## Method

I read every word of `index.html` (622 lines: head metadata, hero, the four projects, figure
captions, the About table, Contact, footer) and every user-facing string that the JS writes
into the page (`js/replay.js`, `climber.js`, `pipeline.js`, `hover-rig.js`, `hero-flight.js`,
`bench.js`, `scaling.js`, `contact.js`, `theme.js`, `frame3d.js`), with `review/BRIEF.md`,
`DESIGN_PLAN.md` (Phase R, H.1 to H.3, section 5), `IMPROVEMENTS.md` and `README.md` as the
record of decisions already made. I checked facts against the data the page uses:
`flights/index.js` (which flight Fig. 00 plays and its sensing method), `tools/benchmark_table.py`
(which runs Fig. 03 comes from), `tools/scaling_data.py` and `js/scaling.js` (the E-01 model
count) and `og-image.png`. I looked at the baseline scroll sequences
(`review/baseline/scroll/phone-light-00..02, 24`, `laptop-light-00..01`) and ran two small
Playwright scripts against the served page (`review/scratch/copy/words.js`, `wc.js`): the text
visible in the first phone screen, and word counts per section. Phone screenshots of my own are
in `review/scratch/copy/`. I grepped the copy for US spellings and for dash and unit styles.

Word counts (DOM text): hero text 52, project register 31, E-03 247, **E-04 660** (prose 398
plus a 79-word note), E-02 313, E-01 165, About 225, Contact 24.

## Scores

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| Headline and first impression | 4 | No headline (Dom's call, H.3), so the first words a recruiter reads are the eyebrow "Mechanical engineering · UCL", which states the old targeting. |
| Role and target clarity | 3 | Five places still say mechanical-first (eyebrow, lede, hidden h1, meta, OG); the words "systems" and "defence" appear nowhere; software is "open to". |
| Availability and logistics | 6 | Dates, internship or placement, London and right to work are all above the fold on a phone; "UK, no sponsorship" is ambiguous, there is no CV, and the email can't be tapped. |
| Project titles and summaries | 5 | Accurate and plain, but each summary states the brief rather than the result, and E-04's title claims "only its onboard camera" when its results use the IMU. |
| Scanability | 5 | Key-figure cards work for three projects, but the most relevant project (E-04) has none and is the longest by far (660 words); register cards show tools, not results. |
| Voice and consistency | 7 | A specific, numerate, candid first-person voice, but with fact clashes (358 vs 603 models, "run 20/26", "training-cost" vs "training power"). |
| UK spelling and mechanics | 7 | UK spelling is clean throughout; units printed in capitals in the SVG figures ("250 G", "4 G", "M/S") and inconsistent "vs."/"Vs" and range dashes. |
| Microcopy and CTAs | 5 | "View projects" and "Get in touch" are clear, but Contact has no CV and no mailto link, and some labels are unclear ("The sheet's setup", "Dark", "Selected, press copy"). |
| **Overall** | **5** | The writing is honest and good at sentence level, but the page doesn't yet say the thing the 20 Nov targeting needs it to say, and it leads with briefs instead of results. |

## The weakest ten lines, rewritten

Every rewrite uses only facts already in `index.html` or the repo. Where a fact is uncertain I
say so.

1. **Hero lede**, `index.html:56`
   - Now: "I work across CAD, generative design and FEA, dynamic modelling, and Python for computer vision. Aiming for mechanical engineering roles, open to software and autonomy."
   - Rewrite: "Second-year MEng Mechanical Engineering student at UCL. I'm looking for software, autonomy and systems roles, particularly in UK defence, with mechanical design (CAD, generative design and FEA) as a supporting strength."
   - Why: it is the known P1 from `IMPROVEMENTS.md`. The current line is a tool list followed by the old targeting, and nothing in the hero says he is a student. The rewrite gives degree, year, target roles and sector in the order a recruiter checks them. ("Particularly in UK defence" is from the brief. Dom may prefer to leave the sector out if he also wants software firms to feel addressed; the rest stands either way.)

2. **Hero eyebrow**, `index.html:53` (the first line of type in the hero; see `review/baseline/scroll/phone-light-00.png`)
   - Now: "Mechanical engineering · UCL"
   - Rewrite: "Software, autonomy and systems · MEng, UCL"
   - Why: with no headline, this 14 px line is the de facto headline. It currently reads as his field and target. The degree stays accurate in the lede, the footer and About.

3. **Meta description and title**, `index.html:6-7`
   - Now: `<title>Dominic Tataj Portfolio</title>` and "Engineering portfolio of Dominic Tataj, MEng Mechanical Engineering student at UCL, looking for a summer 2027 internship or a 2027–28 placement year in the UK."
   - Rewrite: `<title>Dominic Tataj · Engineering portfolio: software, autonomy and systems</title>` and "Dominic Tataj, second-year MEng Mechanical Engineering student at UCL, looking for software, autonomy and systems roles: a summer 2027 internship or a 2027–28 placement year in the UK."
   - Why: this is the text Google and the browser tab show. The title is missing punctuation and says nothing about the role.

4. **Right-to-work pill**, `index.html:55`
   - Now: "UK, no sponsorship"
   - Rewrite: "Full right to work in the UK"
   - Why: "no sponsorship" can be read two ways ("doesn't need it" or "can't get it"), and recruiters screen on this one fact. `IMPROVEMENTS.md` decided "The hero states full right to work in the UK"; the pill should say exactly that. It fits a 375 px pill.

5. **Fig. 00 caption**, `index.html:108` (`#cap-flight`)
   - Now: "Flight test from my vision-only racing drone (E-04): true path in blue, its own estimate dashed orange."
   - Rewrite: "A simulated flight of my vision-based racing drone (E-04), camera + IMU, played at 3× speed: true path in blue, the drone's own estimate dashed orange."
   - Why: the strip plays `FLIGHT_POSTER` = `1017-default` (`flights/index.js:3`), which is the **Camera + IMU** flight, so "vision-only" is wrong. "Flight test" next to a drawing of the real E-03 drone suggests a physical flight; E-04 is a simulation. The "×3" in the readout is explained nowhere. An engineer who spots any of these stops trusting the numbers.

6. **E-03 summary**, `index.html:129`
   - Now: "The frame needed to survive crashes and avoid resonance with the motors, while keeping the complete drone under the UK CAA's 250 g threshold."
   - Rewrite: "A 38 g printed frame, 36% lighter than a comparable plate frame, that keeps the complete drone at 246 g, under the UK CAA's 250 g threshold. Arm deflection measured at maximum thrust agreed with Ansys to within 18%."
   - Why: the current line is the brief. The result (lighter, under the limit, tested against FEA) is three screens further down, after the pinned Fig. 01.

7. **E-04 title**, `index.html:225`
   - Now: "A simulated racing drone that flies through gates using only its onboard camera"
   - Rewrite: "A simulated racing drone that flies through gates by camera, with no GPS or map"
   - Why: "only its onboard camera" contradicts the page's own headline numbers, which are "Camera + IMU" (Fig. 03, the Testing paragraph at `index.html:303`). The rewrite keeps the hook (no GPS, no map) and stays true for both sensing modes.

8. **E-02 summary**, `index.html:349`
   - Now: "The robot had to climb a 2 m pipe while dragging a chain whose load grows as it climbs, inside a 400 × 300 mm envelope, on a £50 budget, within 3 minutes."
   - Rewrite: "The robot completed the climb at the IMechE Design Challenge. I built the team's Excel model of the drivetrain and used it to pick the setup from more than 20 simulated: it cut predicted climb time by 22%, and real runs measured 16%. The brief: a 2 m pipe, dragging a chain, inside 400 × 300 mm, on £50, within 3 minutes."
   - Why: the outcome ("completed the climb") and Dom's own part (the model) are at `index.html:391-397`. They belong in the first two lines; the constraints can follow.

9. **About, first paragraph**, `index.html:510`
   - Now: "I'm a second-year MEng Mechanical Engineering student at UCL, graduating in 2029. Most of my project work uses CAD and FEA, dynamic modelling, and Python for computer vision and data analysis."
   - Rewrite: "I'm a second-year MEng Mechanical Engineering student at UCL, graduating in 2029. I'm heading towards software, autonomy and systems: my most recent project is a racing drone's flight stack in simulation, from gate detection to an error-state Kalman filter and guidance. Mechanical design is my other strength: CAD, generative design and FEA on a drone frame I printed and tested."
   - Why: About is where a hiring manager checks the story behind the targeting. The current line repeats the hero's tool list, mechanical first. (The wording "flight stack", not "I wrote", keeps E-04's AI-agent disclosure honest.)

10. **Contact line**, `index.html:583`
    - Now: "Available from 27 June 2027 for a summer internship or a placement year in the UK."
    - Rewrite: "Looking for a summer 2027 internship or a 2027–28 placement year in software, autonomy or systems, from 27 June 2027. Full right to work in the UK; based in London."
    - Why: someone who jumps straight to Contact from the nav should get the whole answer in one line (role, dates, right to work, location). The rewrite uses only the hero's facts.

## Generic/template look

**No.** The voice is specific and checkable: numbers with units, named methods (IPPE_SQUARE, chi-squared gating, explicit Euler at 10 ms), and limitations stated plainly ("a demonstration, not the coursework's numbers", "an order of magnitude rather than a prediction", "Most of the code was written by an AI coding agent"). The only template-sounding lines are the hero lede ("I work across...") and the stock "Selected work / Projects" and "View projects / Get in touch" pairs, which are fine as UI labels.

## Findings

### COPY-01 Targeting copy still says mechanical-first in five places
- Severity: P1 (clearly hurts)
- Where: hero eyebrow `.hero-text .eyebrow` `index.html:53`; hidden h1 `index.html:54`; lede `.hero .lede` `index.html:56` (styled at `css/site.css:118`); `<title>` and meta description `index.html:6-7`; `og:description` `index.html:14`. Screenshots: `review/baseline/scroll/phone-light-00.png`, `review/baseline/scroll/laptop-light-00.png`.
- Evidence: the first phone screen (measured with `review/scratch/copy/words.js`) contains exactly: the name, nav, "Mechanical engineering · UCL", four pills, the lede ending "Aiming for mechanical engineering roles, open to software and autonomy", and two buttons. "Systems" and "defence" appear nowhere on the page. The hidden h1 reads "Dominic Tataj, mechanical engineering portfolio". The OG description (the LinkedIn preview text) reads "MEng Mechanical Engineering at UCL. Designs, simulates and builds drones and robots."
- Why it matters: recruiters at UK defence and autonomy firms and at software firms (reader 1) decide on role fit in the first screen. Right now the page tells them he wants a different job.
- Fix: eyebrow, lede, title and meta as in weakest-ten items 1 to 3. Hidden h1: "Dominic Tataj, engineering portfolio: software, autonomy and systems". `og:description`: "MEng Mechanical Engineering at UCL. Looking for software, autonomy and systems roles: a summer 2027 internship or a 2027–28 placement year in the UK. Projects: vision-based autonomous drone racing, a generatively designed drone frame, a pipe-climbing robot." Keep "MEng Mechanical Engineering, UCL" exactly as it is in the footer (`index.html:602`) and About (`index.html:510, 530`).
- Effort: S

### COPY-02 Project summaries state the brief, not the result
- Severity: P1 (clearly hurts)
- Where: `.sheet-title .summary` at `index.html:129` (E-03), `226` (E-04), `349` (E-02), `470` (E-01). Screenshot: `review/baseline/scroll/laptop-light-01.png` (E-03's summary).
- Evidence: E-03's summary is the requirement ("needed to survive crashes..."); the result (−36% mass, 246 g, FEA within 18%) only appears in the stat cards below the pinned 3D figure and in the prose at `:180-185`. E-04's summary describes the method; its headline numbers (99.8% clean, 98.6% with clutter, 300 courses) are in the third prose paragraph at `:302-303`. E-02's summary lists constraints; "completed the climb" and "−16%" are at `:396-397`.
- Why it matters: a 30-second reader reads the title and the summary, then scrolls. Each summary is the only sentence of the project they will read, and at the moment it gives them the brief rather than what Dom achieved.
- Fix: lead each summary with the outcome, then the method in one clause. E-03 and E-02: weakest-ten items 6 and 8. E-04: "Pooled over 300 seeded courses, it passes 99.8% of gates in a clean world and 98.6% with gate-coloured clutter beside the course (camera + IMU). It finds each gate in its camera image, estimates its own position relative to the gate and flies through." E-01: "A power law fitted to [model count, see COPY-05] AI models, P ∝ N^0.55 with R² 0.44, puts GPT-5's training power draw at about 590 kW: an order-of-magnitude estimate, since model size explains under half the variation."
- Effort: S

### COPY-03 E-04, the project most relevant to the new targeting, has no key-figures strip
- Severity: P1 (clearly hurts)
- Where: `#e-04`, between `.sheet-title` (`index.html:224-227`) and `.player` (`:229`); compare `.specs` in E-03 (`:168`), E-02 (`:352`) and E-01 (`:473`), styled at `css/site.css:285-288`. Screenshot: `review/scratch/copy/phone-e04-head.png`.
- Evidence: the other three projects each show four stat cards. E-04 shows none, and it is 660 words long: more than E-03 and E-01 together (247 + 165). Its results sit inside a table and a 100-word paragraph.
- Why it matters: for an autonomy or software recruiter this is the project that proves fit. The strip is the page's established "read this if nothing else" device, and the most important project doesn't have one.
- Fix: add `<div class="specs" aria-label="Key figures">` with four cards using existing numbers: "Gate pass rate, clean world · 99.8%"; "With orange clutter · 98.6%"; "Courses per benchmark · 300"; "Positioning · camera + IMU, no GPS" (or "Camera only, clutter · 97.5%"). Then trim the Testing paragraph, since its first two sentences repeat the strip.
- Effort: S

### COPY-04 "Vision-only", "only its onboard camera" and "flight test" overstate what the hero and E-04 show
- Severity: P1 (clearly hurts)
- Where: Fig. 00 caption `index.html:108`; E-04 h3 `index.html:225`; replay rest text `index.html:235` ("Six recorded flights"). Screenshots: `review/baseline/scroll/phone-light-02.png`, `review/scratch/copy/phone-e04-head.png`.
- Evidence: `flights/index.js:3` sets `FLIGHT_POSTER` to `"1017-default"`, the "Camera + IMU" flight, yet the caption says "vision-only". E-04's title says "using only its onboard camera", but its pooled results (99.83%, 98.58%) are the Camera + IMU columns. "Flight test" and "recorded flights" are captioned next to the hero's drawing of the real E-03 drone, while E-04 runs in a simulator.
- Why it matters: an engineer (reader 2) will check this, and E-04 is otherwise a model of candour (the AI-agent paragraph, the failure on course 3). One loose claim in the hero undermines that.
- Fix: Fig. 00 caption as in weakest-ten item 5; E-04 h3 as in item 7; rest text "Six simulated flights · 8 gates · about 6 m/s".
- Effort: S

### COPY-05 E-01 says 358 models; its own figure plots 603
- Severity: P1 (clearly hurts)
- Where: E-01 summary `index.html:470` ("358 AI models across nine domains"), spec card `:474` ("Models 358"); Fig. 07 caption `:493` and aria-label `:491` ("603 models"). Screenshot: `review/scratch/copy/phone-e01-prose.png`.
- Evidence: `tools/scaling_data.py` keeps "the models that have both [parameters and power draw], as the coursework's MATLAB does", which gives the 603 points in `js/data/scaling.js` (`tests/scaling.spec.js:11` asserts 603), and the page's fit (P ∝ N^0.55, R² 0.44) is computed on those 603. Nothing in the repo supports 358, and "nine domains" isn't checkable either.
- Why it matters: a stat card and its figure disagree by 245 models. An engineer will notice, and the R² is then unclear too.
- Fix: needs from Dom: which count the coursework's fit used. If it was 603, change `:470` and `:474` to 603 and drop "across nine domains" unless he confirms it. If 358 was a different subset, say which in one clause ("358 models with full domain labels; 603 with both parameters and power").
- Effort: S

### COPY-06 Contact: no CV, the email can't be tapped, and the line repeats only half the hero
- Severity: P1 (clearly hurts)
- Where: `#contact` `index.html:579-596`: `<span class="email" id="email">` `:587`, "Copy email" `:588`, section line `:583`. Screenshot: `review/baseline/scroll/phone-light-24.png`.
- Evidence: the email is a `<span>`, so on a phone tapping it does nothing; the only action is "Copy email", and its fallback says "Selected, press copy" (`js/contact.js:10`). There is no CV link anywhere. The contact line leaves out the target roles and right to work.
- Why it matters: the brief's 30-second list ends with "how to contact me or get my CV". A recruiter on a phone from LinkedIn expects to tap the email and open a CV.
- Fix: make the address `<a class="email" id="email" href="mailto:dominic_tataj@icloud.com">` and keep "Copy email" beside it (`contact.js` reads `textContent`, which still works). Rewrite the line as in weakest-ten item 10. CV: needs from Dom. `IMPROVEMENTS.md` item 10 (CV buttons) was dropped on 24 Oct at Dom's request, but the 20 Nov brief asks for the CV, so Dom should decide. Until then, add no placeholder link. If he agrees, add the plain line "CV on request: email me". Fallback microcopy: "Selected: press Ctrl+C (⌘C on Mac)".
- Effort: S (link, copy); CV needs from Dom

### COPY-07 Project order still follows the mechanical-first targeting
- Severity: P1 (clearly hurts)
- Where: register `.register ol` `index.html:77-94`; article order `#e-03` `:122`, `#e-04` `:219`, `#e-02` `:342`, `#e-01` `:463`. Screenshot: `review/baseline/scroll/phone-light-01.png`.
- Evidence: the first project card and the first project section are "Generative FPV drone frame · Fusion · Ansys". The order came from `IMPROVEMENTS.md` item 2 (20 Oct, "ordered by relevance"), which was decided under the mechanical-first targeting that 20 Nov superseded. I'm reopening it for that reason.
- Why it matters: for software, autonomy and systems recruiters the most relevant work (E-04) is second, under a pinned 3D section that takes two to three screens of scrolling.
- Fix: order E-04, E-03, E-02, E-01 in both the register and the articles. The numbers then also run in sequence (the E-numbers are chronological: E-01 Oct 2025 to E-04 Aug–Oct 2026, so the page would read newest first, which fixes today's 03, 04, 02, 01). Renumber the figures in page order, as item 2 did before. The hero drone can stay E-03; its tag already links to it. This touches tests and the hero layout, so check with the layout reviewers.
- Effort: M

### COPY-08 Consider a visible role line in the hero (this partly reverses H.3)
- Severity: P2 (polish)
- Where: hero `.hero-text` `index.html:52-60`; the hidden h1 `:54`. Screenshot: `review/baseline/scroll/laptop-light-00.png`.
- Evidence: on a laptop the first screen has no text above 20 px except the 15 px nav name. The largest object is the drone drawing, and the eye lands on a 14 px eyebrow. Dom removed the slogan headline "I design, simulate and build drones and robots" on 14 Nov (DESIGN_PLAN H.3).
- Why it matters: a recruiter remembers one line a week later, and at the moment there isn't one.
- Fix: this explicitly recommends a different kind of headline: a plain role line, not a slogan. Make the h1 visible with the text "Software, autonomy and systems for drones and robots", set the eyebrow to "MEng Mechanical Engineering · UCL" and keep the lede from weakest-ten item 1, minus its first sentence. If Dom prefers no headline, COPY-01's eyebrow and lede still carry the role, and this finding can be dropped.
- Effort: S

### COPY-09 Register cards show tools, not results, and one title doesn't match its project
- Severity: P2 (polish)
- Where: `.register` `index.html:78-93` (`.r-title`, `.r-meta`, styled at `css/site.css:194-195`); About links `data-title` at `:542`. Screenshot: `review/baseline/scroll/phone-light-01.png`.
- Evidence: each card is a title plus tools ("Fusion · Ansys", "MATLAB"). "AI training-cost analysis" names the wrong quantity: the project analyses training **power** (`:469`, Fig. 07), not cost.
- Why it matters: the register is the hero's only project summary and the last thing on the first phone screens. One number per card would turn it into a 10-second CV.
- Fix: put one result in `.r-meta` before the tools. E-04 "98.6% of gates, with clutter · Python · OpenCV"; E-03 "36% lighter, 246 g all-up · Fusion · Ansys"; E-02 "Completed the climb · Excel · Fusion"; E-01 "P ∝ N^0.55 across [count] models · MATLAB". Retitle E-01 "AI training-power scaling" in the register, the About `data-title` and the OG image.
- Effort: S

### COPY-10 Stat-card labels are unclear or point the wrong way
- Severity: P2 (polish)
- Where: `.specs` labels `index.html:169-171` (E-03) and `:355-356` (E-02).
- Evidence: "Measured gain −16% time" (a negative "gain"); "Vs plate design −36% mass" (starts with "Vs", unit after the number); "Modal constraint >300 Hz" (a constraint, not a result); "Setups simulated 20+".
- Why it matters: stat cards are read in a glance, so the label has to make sense on its own.
- Fix: "Measured climb time −16%"; "Mass vs plate frame −36%"; "First mode, required >300 Hz" (or "Modal frequency floor"); "Setups simulated 20+" is fine. Optionally add E-02 "Predicted climb time −22%" in place of "Envelope", which repeats the summary.
- Effort: S

### COPY-11 Units in capitals in the SVG figures change their meaning
- Severity: P2 (polish)
- Where: Fig. 02 `index.html:197-208` ("CAA LIMIT 250 G", "FRAME 38 G", "ALL-UP 246 G", axis "G", "MARGIN TO LIMIT: 4 G"); Fig. 00 readouts `js/hero-flight.js:194, 231` ("T 10.85 S · 6.4 M/S"); `js/climber.js:88, 92` ("1.0 M", "2 M CLIMBED"); `js/pipeline.js:38, 188` ("5 M"); `js/hover-rig.js:283` ("IMPACT 1.2 M/S"); and every pipeline readout, which `js/pipeline.js:116` upper-cases, including "Thrust 1.02 g" (g as gravity) into "THRUST 1.02 G". Screenshot: `review/scratch/copy/phone-e04-head.png` (Fig. 02).
- Evidence: SI symbols are case-sensitive: G is giga or gauss, M is mega, S is siemens. Phase R R.2 already moved labels to normal case; these SVG and JS strings were left behind.
- Why it matters: engineers notice wrong unit symbols, and on a mass budget "4 G" is the number that matters.
- Fix: write labels in sentence case with correct symbols ("CAA limit 250 g", "Margin to limit: 4 g", "t 10.85 s · 6.4 m/s", "2 m climbed"). In `pipeline.js:116`, stop calling `toUpperCase()` (or upper-case only the words, not the units).
- Effort: S to M

### COPY-12 Fig. 03 header uses internal run numbers, and one is wrong
- Severity: P2 (polish)
- Where: `table.bench thead tr.world` `index.html:314`: "Clean · run 20" / "Orange clutter · run 26".
- Evidence: `tools/benchmark_table.py:4-6` says the clean camera-only column comes from "run 23's re-run", not run 20. Run numbers mean nothing to a reader and appear nowhere else on the page. (`DESIGN_PLAN.md` 3.5 says run 25 for the clutter world; the tool says 26. The page matches the tool.)
- Why it matters: one jargon label, and one inaccurate, in the table an engineer will study most closely.
- Fix: "Clean world" / "With orange clutter". If Dom wants provenance, put it in the note at `:334` ("Clean: runs 20 and 23; clutter: run 26").
- Effort: S

### COPY-13 E-04's role, date and status chips undersell and contradict each other
- Severity: P2 (polish)
- Where: `#e-04 .sheet-meta` `index.html:221`.
- Evidence: "Role: Individual, with an AI agent" is the first thing a software recruiter reads about the project, and it leads with the agent rather than Dom's part. "Date: Aug – Oct 2026" next to "Status: In development" reads as abandoned.
- Why it matters: it frames the strongest autonomy project as something an AI did. The "How it was built" paragraph (`:298`) shows Dom set the problem, the fixed design decisions and the benchmark rules, then reviewed the results.
- Fix: "Role: Solo; set the design and test rules, directed an AI coding agent". Keep the disclosure; it's honest and topical. Date: needs from Dom: "Aug 2026 – present" if work continues, otherwise status "Paused" or "Complete".
- Effort: S

### COPY-14 Fig. 04 button "The sheet's setup" and "sheet" as jargon
- Severity: P2 (polish)
- Where: `#cl-reset` `index.html:372`; climb plot aria-label `:381`; `js/climber.js:44` ("(the sheet's setup)", ", sheet's setup 58.5 s").
- Evidence: "sheet" here means the team's Excel spreadsheet, a leftover from the drawing-set vocabulary ("sheet" was also the old word for a project). As a button label it doesn't say what clicking does.
- Why it matters: it is the reset control of an interactive figure, so people who don't know what it does won't press it.
- Fix: button "Reset to team's setup"; result text "(the team's setup)" / ", team's setup 58.5 s"; aria-label "...against the team's setup and the 3-minute limit".
- Effort: S

### COPY-15 About table: software comes after mechanical, and E-04's skills are missing
- Severity: P2 (polish)
- Where: `table.bom` `index.html:525-557`; groups Engineering `:534`, Programming `:540`.
- Evidence: the order is Education, Engineering (Fusion, Ansys, Excel), Programming (Python, MATLAB). The methods E-04 actually rests on (computer vision with OpenCV solvePnP, an error-state Kalman filter, a deterministic regression harness) don't appear as skills; Python's row lists pandas and Matplotlib, which no project shows.
- Why it matters: hiring managers use this table to match a job spec, and under the new targeting the software and autonomy rows should come first and be specific.
- Fix: rename "Programming" to "Software and autonomy" and move it above Engineering. Add rows that link to E-04: "Computer vision: OpenCV, PnP pose estimation"; "State estimation: error-state Kalman filter"; "Testing: seeded regression benchmarks, A/B flags". Keep Python and MATLAB, and rename "Engineering" to "Mechanical design". About prose as in weakest-ten item 9.
- Effort: S

### COPY-16 The LinkedIn preview image states neither the target roles nor availability
- Severity: P2 (polish)
- Where: `og-image.png` (1200×630); `og:image:alt` `index.html:19`.
- Evidence: the image reads "Engineering portfolio / Dominic Tataj / MEng Mechanical Engineering, UCL" and lists the four projects with the "AI training-cost analysis" title. It has no roles or dates, and it is still in the drawing-set style (serif name, uppercase mono) that Phase R dropped.
- Why it matters: reader 1 arrives from LinkedIn, so this card is the very first impression, before any click.
- Fix: regenerate it with "Software, autonomy and systems · Summer 2027 internship or 2027–28 placement · Full right to work in the UK" under the name, projects in the new order (COPY-07) with one result each (COPY-09). Alt: "Dominic Tataj, engineering portfolio: software, autonomy and systems; four projects". (Leave styling to the visual reviewer.)
- Effort: M

### COPY-17 Inconsistent "vs", ranges and ampersands
- Severity: P3 (nice to have)
- Where: "vs." at `index.html:211, 455`, "Vs" at `:171`; ranges "Jul – Sep 2026", "2025 – 2029" (spaced en dash) against "0–49", "2027–28" (closed); "&" in chips (`:124, 344, 465`) against "and" in prose.
- Evidence: listed above.
- Why it matters: small, but the site's register is careful and precise, and these slips stand out against it.
- Fix: UK house style: "vs" without a full stop; closed en dash for all number ranges ("Jul–Sep 2026", "2025–2029"); "&" only in chips.
- Effort: S

### COPY-18 Theme button reads as a fourth nav section
- Severity: P3 (nice to have)
- Where: `#theme` `index.html:42`, text set in `js/theme.js:9`. Screenshot: `review/baseline/scroll/phone-light-00.png`.
- Evidence: the nav reads "Work About Contact Dark" in the same style, and on a phone it is the fourth word in the row.
- Why it matters: it can be read as a section called "Dark".
- Fix: "Dark mode" / "Light mode" (the aria-label already says "Switch to dark theme").
- Effort: S

### COPY-19 Small labels that don't say what they do
- Severity: P3 (nice to have)
- Where: `#rig-open` `index.html:108` "Try the controller →"; `#rig-close` "Back to the flight"; `.hd-tag` `:72` "E-03 · Generative frame".
- Evidence: "the controller" has no antecedent in the caption that is showing; the drone tag doesn't show it is a link until hover (`css/site.css:165`).
- Why it matters: these are the hero's two interactions.
- Fix: "Try the hover controller →"; tag "E-03 · Generative frame →" always shown.
- Effort: S

### COPY-20 The green "live" dot implies available now
- Severity: P3 (nice to have)
- Where: `.hero-facts span:first-child::before` `css/site.css:126`, on "Summer internship or placement year" `index.html:55`.
- Evidence: a pulsing green dot is the common "online / available now" sign, but availability starts on 27 June 2027.
- Why it matters: a small mixed signal on the availability line.
- Fix: keep the dot and prefix the pill with "Open to:" ("Open to: summer 2027 internship or 2027–28 placement"), so the dot reads as "open to offers".
- Effort: S
