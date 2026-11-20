# Recruiter panel review: Dom Tataj's portfolio

## Method

I read `review/BRIEF.md`, `DESIGN_PLAN.md` (Phase R, H.1 to H.3 and §5), `IMPROVEMENTS.md`, `README.md` and `review/baseline/NOTES.md`. Then I played three recruiters, one at a time, each arriving from LinkedIn on a phone. The 10-second read used only `review/baseline/phone-light-fold.png`. The 30-second skim used `review/baseline/scroll/phone-light-00.png` to `-24.png`. I also checked what LinkedIn shows before the click (`og-image.png`, the `og:` meta tags) and the laptop fold (`scroll/laptop-light-00.png`).

To verify on the running page, I wrote `review/scratch/recruiter/probe.js` (Playwright, the `phone` preset from `tests/helpers.js`, SwiftShader WebGL). It measured the fold geometry and the page length in screens, tapped the nav's Contact link, counted CV/résumé mentions and PDF links, checked whether the email is a `mailto:` link, read the E-04 replay's text before LOAD, and checked the film strip's images. Its screenshots are in `review/scratch/recruiter/`.

One correction to the baseline: `scroll/phone-light-23.png` shows frame 03 of the film strip as a broken image. On the live page that image loads (`complete: true, naturalWidth: 400`), so the broken icon came from capture timing. It is not a site bug.

## Scores

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| 10-second clarity | 6 | Name, availability date, right to work, location and a contact button are all above the fold. But the only sentence that names roles names the wrong ones ("Aiming for mechanical engineering roles"), and the fold gives no year of study, grade or CV. |
| 30-second skim | 4 | The page is 25.8 phone screens long. The six screens after the fold are almost all the mechanical frame (E-03). The autonomy project's results are buried in prose, and its stat cards show four dashes. |
| CTA and CV findability | 4 | "Get in touch" sits in the fold and the sticky nav has Contact, which lands correctly. But there is no CV anywhere (0 mentions, 0 PDF links), and the email address isn't tappable. |
| Fit for defence/autonomy recruiters | 5 | The substance is right: vision-only navigation with no GPS, an error-state Kalman filter, seeded regression testing, a sub-250 g drone. It is framed mechanical-first, uses no defence vocabulary, says nothing about clearance, and puts the autonomy project second. |
| Fit for software recruiters | 3 | There is one Python project, labelled "In development" and "with an AI agent" (the page says most of its code was written by Claude). Python and MATLAB are the only languages, each tied to one project. GitHub appears only at the very end. |
| Memorability | 6 | The drone line drawing and the real flight data are Dom's own and stick. Everything around them in the fold is a stock modern-SaaS shell, and the fold states no result to remember. |
| **Overall** | **5** | Strong evidence, wrong framing. A recruiter learns "mechanical engineer" in 10 seconds and has to dig 8 screens to find the autonomy engineer Dom wants to be read as. |

## Panel transcripts

### (a) Early-careers recruiter, UK defence prime (BAE Systems / MBDA / Leonardo / QinetiQ / Thales UK)

**10-second read (phone-light-fold.png only).**
- **Who:** "Dominic Tataj (the name in the nav), a mechanical engineering student at UCL." The fold doesn't say which year he's in.
- **Roles:** "Summer internship or placement year, aiming for mechanical engineering roles, open to software and autonomy." I'd file him under our mechanical/design engineering placement pool.
- **When:** "From 27 June 2027."
- **Right to work:** "'UK, no sponsorship', so fine for us." Nothing on security clearance eligibility (BPSS/SC), which is our first screening question for many roles.
- **Contact/CV:** "There's a 'Get in touch' button. I don't see a CV."
- **Missing for my screen:** year of study, graduation year, predicted degree class.

**30-second skim (scroll/phone-light-00 to 24).**
- **Remembers:** a white line drawing of a drone; four project cards; big numbers on the drone frame (1.5, >300 Hz, −36%, 38 g); "under the UK CAA's 250 g threshold"; an exploded drone with a parts list; a dense table of percentages much later.
- **Would click:** Contact in the nav, then LinkedIn.
- **Confused by:**
  - The project codes run E-03, E-04, E-02, E-01, out of order.
  - A "PLAN / ELEVATION / GROUND" diagram sits before the "Projects" heading, and its elevation half is empty.
  - The replay shows "Result –, Gates passed –, Speed –, Estimate error –" and looks broken.
  - The degree class (predicted 2:1) is on screen 21, so they never see it.
- **Shortlist:** Yes for a mechanical design placement. Maybe for a software or systems scheme, because the only software evidence is one simulated project marked "In development".
- **Net:** the site routes him into the stream Dom is moving away from.

### (b) Engineering manager, UK autonomy/defence startup (Helsing / Anduril UK / Oxa / Cambridge Aerospace-type)

**10-second read.**
- **Who:** "Mech eng student at UCL."
- **Roles:** "Wants mechanical roles. Software and autonomy is a fallback ('open to')." I hire people who have chosen autonomy, and this reads as someone who hasn't.
- **When / right to work / where:** clear (June 2027, UK, London).
- **Contact:** a "Get in touch" button.
- **CV:** none visible.
- **What would have hooked me:** "GPS-denied", "state estimation", "sensor fusion", "C++/ROS". None of these appear in the fold. "Python for computer vision" is the only hook.

**30-second skim.**
- **Path:** The register card "Vision-based autonomous drone racing" is the only thing that interests me, but it's second. Screens 02 to 08 are the frame. I reach E-04 on screen 08.
- **Remembers:** "flies through gates using only its onboard camera… no GPS, depth sensor or map". That is the line that would make me stop. The Approach list (solvePnP with IPPE_SQUARE, error-state Kalman filter, chi-squared outlier rejection) and the Testing paragraph (seeded regression harness, 300 courses, 99.8%, then 98.6% with clutter, a simulator sign bug found and fixed) are genuinely good, if I read them. A skim doesn't, because they are paragraphs.
- **Would click:** the GitHub source link. It's the most persuasive link on the page for me, but it sits at the end of E-04 (index.html:335, around screen 14) and as a button at the very end of the page.
- **Confused by:**
  - The chips "Role: Individual, with an AI agent" and "Status: In development" are the first things I read about his best project. "Most of the code was written by an AI coding agent (Claude)" raises the question every EM will ask: what can he build himself?
  - The replay's four dashes.
- **Shortlist:** Maybe, leaning yes for an intern chat. The ownership evidence (set the architecture rules, designed the test rules, found the sim bug) is there but has to be dug out, and the AI-authorship question has to be settled in interview.

### (c) Graduate recruiter, software firm

**10-second read.**
- **Who:** "A mechanical engineering student at UCL."
- **Roles:** "Mechanical roles, open to software." I'd put him in the non-CS, maybe-later pile.
- **When / right to work / where:** clear.
- **Contact:** a button. CV: none.

**30-second skim.**
- **Remembers:** drones, a 3D model, lots of charts and numbers, and holiday photos near the end.
- **Software signals found:** "Python · OpenCV" on one card; the skills table lists Python ×1 and MATLAB ×1; a GitHub button at the end.
- **Would click:** GitHub and LinkedIn, to see whether there is more code than this page shows.
- **Confused by:** Fusion, Ansys, IMechE and "Fig. 0x" read as academic jargon; the E-codes mean nothing; a page this long for four projects suggests the summary is missing.
- **Shortlist:** No, or at best maybe pending a CV. There isn't enough programming breadth on the page, and the one software project's code is mostly AI-written. Software experience beyond this project, if any, needs from Dom; the page shows none.

### Is a CTA (contact or CV) findable within 5 seconds? Is there a CV at all?

- **Contact:** yes. "Get in touch" is in the fold (top at 492 CSS px of an 812 px screen), and the sticky nav's Contact link stays visible on every screen. Tapping it lands on the Contact section (`review/scratch/recruiter/phone-after-nav-contact.png`), which is 17,143 px down the page.
- **Email:** the address is a `<span>`, not a `mailto:` link, so tapping it on a phone does nothing. "Copy email" works.
- **CV:** none. The probe found 0 mentions of CV/résumé and 0 PDF links. `IMPROVEMENTS.md` item 10 (CV buttons) was dropped on 24 Oct, but the brief now lists "how to … get my CV" as a 30-second must.

## 10-second test verdict: FAIL (narrowly)

The fold answers four of the six questions in the brief: who (name, UCL, mechanical engineering), when (27 June 2027), right to work ("UK, no sponsorship") and how to make contact ("Get in touch"). On the letter of the test, a recruiter can say who Dom is and what he wants.

What they would say he wants is "mechanical engineering roles, open to software and autonomy" (index.html:56). That is the reverse of his current targeting. A recruiter who leaves with the wrong answer about the roles has not learned what Dom wants. There is also no CV and no year of study. Fixing REC-01 alone turns this into a PASS.

## Generic/template look: yes

The fold's shell (pill chips with a live dot, two pill buttons, glass nav, dot grid, soft corner glows) is the stock 2025-26 SaaS-landing vocabulary. Only the drone line drawing, and the real data figures further down, are recognisably Dom's. This is not a call to reverse Phase R. It's a call to put one concrete result in the fold, so the memorable part isn't left to the figures (see REC-01, REC-11).

## Findings

### REC-01 The hero names the wrong target roles
- Severity: P0 (blocks the 30-second read)
- Where: hero. `.hero .eyebrow` index.html:53 ("Mechanical engineering · UCL"); `.lede` index.html:56; the hidden `<h1>` index.html:54 ("mechanical engineering portfolio"); `<meta name="description">` index.html:7; `og:description` index.html:14. Screenshot: `review/baseline/phone-light-fold.png`.
- Evidence: the only sentence in the fold that names roles says "Aiming for mechanical engineering roles, open to software and autonomy." The probe counts "mechanical" 7 times in the page text, "software" once and "defence" 0 times. `IMPROVEMENTS.md` already logs this as an open P1. From the recruiter lens it is the single biggest problem: all three personas filed Dom under mechanical.
- Why it matters: reader 1 in every segment. Defence-prime recruiters route him to the mechanical stream. Startup EMs read "open to" as not committed. Software recruiters drop him into the non-CS pile.
- Fix: keep the degree accurate and change only the targeting. All of the following is already in the repo:
  - Eyebrow: "MEng Mechanical Engineering · UCL · Year 2, graduating 2029" (index.html:510, :528).
  - Lede, for example: "I build and test autonomous systems: vision-only drone navigation with no GPS, state estimation and simulation in Python, backed by mechanical design in CAD and FEA. Looking for software, autonomy and systems roles, particularly in UK defence."
  - `<h1>`: "Dominic Tataj, engineering portfolio: software, autonomy and systems".
  - Update the meta and OG descriptions to match.
- Effort: S

### REC-02 There is no CV anywhere on the site
- Severity: P1
- Where: hero `.actions` index.html:57-60; Contact `.contact` index.html:585-594. Screenshot: `review/scratch/recruiter/phone-after-nav-contact.png`.
- Evidence: the probe found 0 mentions of CV/résumé/curriculum and 0 `.pdf` links. `IMPROVEMENTS.md` item 10 ("CV buttons for the engineering and software CVs, using versions without a phone number") was dropped on 24 Oct. I'm reopening it because the brief (§2, 20 Nov) requires that recruiters learn "how to contact me or get my CV" in 30 seconds.
- Why it matters: startup EMs forward CVs internally, and a graduate recruiter can't judge the software breadth (persona c) without one. Every persona looked for a CV and didn't find one.
- Fix: needs from Dom, a phone-number-free CV PDF (ideally a software/autonomy version). Then:
  - Add `<a class="btn" href="cv/dominic-tataj-cv.pdf" download>CV (PDF)</a>` beside "Get in touch" at index.html:59, and again in Contact at index.html:591.
  - Keep "View projects" as the primary button.
  - Until the file exists, leave the button out rather than adding a dead link.
- Effort: S (once the PDF exists)

### REC-03 The autonomy project comes second, after 6 phone screens of the mechanical frame
- Severity: P1
- Where: register order index.html:72-94; article order `#e-03` index.html:131 before `#e-04` index.html:219. Screenshots: `scroll/phone-light-02.png` to `-08.png`.
- Evidence: on a phone, E-03 runs from screen 02 to screen 08: chips, summary, the pinned Fig. 01 (three screens of the rotating drone), key figures, method, the mass bar. E-04 starts on screen 08 of 25. Item 2 in `IMPROVEMENTS.md` ordered the projects "by relevance" when the targeting was mechanical-first. That ordering is now out of date, which is my reason for reopening it.
- Why it matters: the defence/autonomy EM (persona b) and the software recruiter (persona c) both skim past the most relevant work before they reach it.
- Fix: put E-04 first in the register and in the Work section. The hero drone can stay E-03; it is a drawing of the same drone family and sets up the work. Renumber the figures in page order, as item 2 did, and update the tests that reference figure order.
- Effort: M

### REC-04 E-04 has no key-figure cards, and its replay readout shows four dashes
- Severity: P1
- Where: E-04 `.readout` index.html:254-258 (`#r-out`, `#r-gates`, `#r-speed`, `#r-err` all "–"). There is no `.specs` block in E-04; compare E-03's at index.html:168-173 and E-02's at :353-358. Screenshots: `scroll/phone-light-09.png`, `review/scratch/recruiter/phone-e04-player.png`.
- Evidence: before LOAD the readout says "Result –, Gates passed –, Speed –, Estimate error –" (probe text dump). E-04's headline results appear only mid-paragraph: 99.8% pooled over 300 courses (index.html:302), and 98.6% with the IMU and 97.5% camera only in clutter (index.html:303). E-03 and E-02 each show four large stat cards that a skimmer remembers. E-04 shows none.
- Why it matters: skimming recruiters remember big numbers. The project that should sell Dom to autonomy and software readers is the only one whose numbers can't be seen at a skim, and the dashes look broken.
- Fix:
  - Add `<div class="specs" aria-label="Key results">` after E-04's `.sheet-title` with four cards from index.html:302-303: "Gate pass rate · 300 courses: 99.8%"; "With orange clutter: 98.6%"; "Camera only, clutter: 97.5%"; "Sensors: camera + IMU, no GPS".
  - For the readout, hide it until a flight loads (`hidden` until `replay.js` fills it), or show "Load a flight to fill these" in place of the dashes.
- Effort: S

### REC-05 The first thing recruiters read about the flagship software project is "with an AI agent · In development"
- Severity: P1
- Where: `#e-04 .sheet-meta` index.html:221; "How it was built" index.html:297-298. Screenshot: `scroll/phone-light-08.png`.
- Evidence: the chips read "Role: Individual, with an AI agent" and "Status: In development". The paragraph says "Most of the code was written by an AI coding agent (Claude)". That honesty is right and should stay, but the chip leads with it and buries what Dom owned. The same paragraph says he set the problem and the fixed design decisions (acro commands, identical gates, a strict simulator/flight-stack wall, the benchmark rules) and reviewed the results. The Testing section says he found the simulator's reversed sign convention and corrected the controller (index.html:304, `scroll/phone-light-12.png`).
- Why it matters: startup EMs and software recruiters will ask "what can he build himself?" (personas b and c). The chip invites that question without the answer next to it.
- Fix:
  - Reword the Role chip to what the page already supports, for example "Role: Sole engineer · set the architecture and test rules · code written with an AI agent".
  - Change Status to a fact with a number, for example "Status: Flying in simulation, 98.6% of gates".
  - Pull "found and fixed a simulator sign-convention bug" into a one-line callout under the summary.
  - Don't remove the disclosure.
- Effort: S

### REC-06 A 30-second phone skim never gets past the first project's method
- Severity: P1
- Where: the whole `#work` section on phones (index.html:121-500); the per-project `Approach` / `How it was built` / `Testing` / `Result` blocks. Screenshots: `scroll/phone-light-02.png` to `-20.png`.
- Evidence: the probe measured the page at 17,591 CSS px. About starts at 21.6 screens and Contact at 25.8. Every project's full method prose is laid out on a phone (E-04's alone fills screens 10 to 14). At about one flick per second, a 30-second skim ends around E-04's Approach.
- Why it matters: reader 1 gets about 30 seconds and never reaches About (degree class, leadership) or Contact by scrolling. Reader 2 (engineers) does want the detail, so it should stay one tap away.
- Fix: on phones (`max-width: 699px`), wrap each project's method blocks in `<details class="method"><summary>Method, testing and limits</summary>…</details>`. Keep the chips, title, summary, key figures (REC-04) and one figure visible. Make it open by default on wider screens, or always open with JS off, so §5 "readable at frame 0" holds.
- Effort: M

### REC-07 The LinkedIn preview card shows the retired drawing-set identity and no targeting
- Severity: P1
- Where: `og-image.png`; index.html:13-19 (`og:title`, `og:description`, `og:image:alt`).
- Evidence: the card has a serif name, "ENGINEERING PORTFOLIO" in uppercase mono, a ruled register with E-codes on a grid, and "MEng Mechanical Engineering, UCL". That is the pre-Phase-R drawing look R.2 removed. `og:description` says "Designs, simulates and builds drones and robots… looking for… placement year" but names no roles.
- Why it matters: every persona arrives from LinkedIn, so this card is the first impression, seen before the site. It shows an old site and the old targeting.
- Fix: regenerate `og-image.png` in the Phase R style (light panel, Space Grotesk name, one drone line drawing from `images/hero/`). Use the lines "Software, autonomy and systems · MEng UCL" and "Summer 2027 or 2027–28 placement · Full UK right to work". Update `og:description` and `og:image:alt` to match REC-01.
- Effort: S

### REC-08 Year of study, graduation year and predicted 2:1 are buried 21 screens down
- Severity: P2
- Where: About prose index.html:510; skills table rows 1-2 index.html:528-529. Screenshots: `scroll/phone-light-20.png`, `-21.png`.
- Evidence: "second-year", "graduating in 2029", "predicted 2:1" and "IB 42/45" appear only in About. The fold says just "Mechanical engineering · UCL".
- Why it matters: early-careers teams at primes filter on graduation year and a 2:1 (persona a), and placement eligibility depends on year of study.
- Fix: put "Year 2 · graduating 2029 · predicted 2:1" in the hero, as part of the eyebrow (REC-01) or as a fifth `.hero-facts` pill (index.html:55).
- Effort: S

### REC-09 "UK, no sponsorship" is terse, and clearance eligibility is unstated
- Severity: P2
- Where: `.hero-facts` index.html:55. Screenshot: `review/baseline/phone-light-fold.png`.
- Evidence: the pill reads "UK, no sponsorship". The decision in `IMPROVEMENTS.md` is "The hero states full right to work in the UK". The compressed wording reads half like a location and half like a refusal. Nothing on the page addresses security vetting.
- Why it matters: defence recruiters (persona a, and many in persona b) screen on right to work and then on BPSS/SC eligibility.
- Fix:
  - Change the pill to "Full UK right to work".
  - Optionally, needs from Dom: whether he is comfortable stating clearance eligibility (for example "Eligible for UK security clearance"). Only add it if he confirms it is true.
- Effort: S

### REC-10 The email address isn't tappable on a phone
- Severity: P2
- Where: `#email` index.html:587 (a `<span>`); `js/contact.js` copy handler. Screenshot: `review/scratch/recruiter/phone-after-nav-contact.png`.
- Evidence: the probe found no `a[href^="mailto:"]` on the page. Tapping the address does nothing; only "Copy email" acts.
- Why it matters: a recruiter on a phone expects to tap the address and get a pre-addressed email. Copy, switch app, paste is three steps more.
- Fix: make it `<a class="email" id="email" href="mailto:dominic_tataj@icloud.com">dominic_tataj@icloud.com</a>` and keep the Copy button. `contact.js` reads `textContent`, so it keeps working. Optionally add `?subject=Internship%20%2F%20placement` to the link.
- Effort: S

### REC-11 The project register cards give titles and tools but no outcome
- Severity: P2
- Where: `.register` index.html:70-95; CSS css/site.css:182-195. Screenshot: `scroll/phone-light-01.png`.
- Evidence: on a phone the four cards fill 578 px (almost a whole screen) and each says only a title and tools ("Fusion · Ansys", "MATLAB"). This is the one place a skimmer sees all four projects at once.
- Why it matters: recruiters shortlist on outcomes. This is the cheapest place on the page to give them one per project.
- Fix: replace or extend `.r-meta` with a one-line result taken from the page:
  - E-04: "98.6% of gates · camera + IMU · no GPS"
  - E-03: "246 g all-up, under the CAA's 250 g · −36% mass"
  - E-02: "Completed the climb at the IMechE Design Challenge"
  - E-01: "Power-law fit over 358 models"
  Keep the tools in smaller text.
- Effort: S

### REC-12 Fig. 00 sits before "Projects" on a phone, with an empty elevation half and drawing-style labels
- Severity: P2
- Where: `figure#flight` index.html:97-111; CSS css/site.css:200. Screenshots: `review/scratch/recruiter/phone-fig00.png`, `scroll/phone-light-01.png`, `-02.png`.
- Evidence: at 375 px the 469 px figure squeezes the plan view into the top third. The ELEVATION panel is mostly an empty dot grid above a hatched "GROUND" line. The boxed uppercase mono labels (PLAN, ELEVATION, GROUND, "T 2.56 S · 5.5 M/S · GATE 2/8 · ×3") are the drawing-sheet idiom that R.2 moved away from. It comes before the "Projects" heading with no context, so personas a and c read it as noise.
- Why it matters: it spends one of a recruiter's first three screens on a figure they can't parse. The brief allows demoting a figure that hurts the 30-second read.
- Fix: below 700 px, either move Fig. 00 into E-04 (it is E-04's flight) or show only the plan view at about 240 px tall. Either way, add a one-line plain caption first ("A real recorded flight from E-04: the drone's own estimate, dashed, against the truth, solid").
- Effort: M

### REC-13 The autonomy and defence vocabulary recruiters scan for is missing, though the content supports it
- Severity: P2
- Where: E-04 title and summary index.html:225-226; register title index.html:83; About prose index.html:510.
- Evidence: the page says "no GPS, depth sensor or map" (index.html:226), "error-state Kalman filter" (index.html:292) and "Camera + IMU" (index.html:315). It never uses the terms recruiters and ATS-style keyword scans look for: "GPS-denied", "state estimation", "sensor fusion", "autonomy". "Defence" appears 0 times.
- Why it matters: personas a and b skim for these exact words.
- Fix: use them where they are true. For example, change the E-04 title to "Vision-only navigation for a racing drone: no GPS, no map". Add "state estimation and sensor fusion (camera + IMU)" to the summary, the register card and About's first sentence.
- Effort: S

### REC-14 The skills table squeezes the skill column to one word per line on phones
- Severity: P2
- Where: `table.bom` index.html:524-561; CSS css/site.css:605-617. Screenshots: `scroll/phone-light-21.png`, `-22.png`.
- Evidence: at 375 px, "MEng / Mechanical / Engineering, / UCL" and "Python: / NumPy, / pandas, / OpenCV, / Matplotlib" wrap one word per line, because the count and project-chip columns hold about 45% of the width even in rows where they are empty.
- Why it matters: this table is where a recruiter would check education and skills, and on a phone it reads as a ragged list three screens long.
- Fix: in `@media (max-width: 520px)`, set `.bom tr` to `display: grid; grid-template-columns: 3ch 1fr`. Put the project chips (`td:last-child`) on a second line under the skill name, and hide the count column (`td:nth-child(3)`), whose value equals the number of chips.
- Effort: S

### REC-15 Key-figure cards stack one per row on phones, so four numbers fill a screen
- Severity: P2
- Where: `.specs` css/site.css:285. Screenshots: `scroll/phone-light-06.png`, `-14.png`, `-18.png`.
- Evidence: `minmax(min(100%, 160px), 1fr)` gives one column inside the sheet's padding at 375 px. Each card is about 90 CSS px tall, so a set of four takes most of a screen.
- Why it matters: the numbers are the most skimmable content on the page. In a 2×2 grid a recruiter takes in all four at a glance.
- Fix: change to `minmax(min(100%, 130px), 1fr)`, or set `grid-template-columns: repeat(2, minmax(0, 1fr))` under 520 px. Check that "400×300 mm" and "≈590 kW" still fit at 30 px (or drop `.n` to 26 px on phones).
- Effort: S

### REC-16 Project codes appear out of order (E-03, E-04, E-02, E-01)
- Severity: P3
- Where: `.r-no` index.html:74-91; `.pno` chips index.html:134, :221, etc.
- Evidence: the codes are chronological, but the projects are ordered by relevance, so the page opens on "E-03". R.3 kept project numbers as chips, which is fine for cross-references in the skills table.
- Why it matters: personas a and c both asked what happened to E-01 and E-02. It's minor, but it is friction in the first two screens.
- Fix: in the register, drop `.r-no` or render it muted after the title. Or, if REC-03 reorders the projects, renumber in page order and update the skills-table links.
- Effort: S

### REC-17 The leadership hook (NASA Space Center University, 3rd of 20) is buried at table row 10
- Severity: P3
- Where: index.html:551. Screenshot: `scroll/phone-light-23.png` (top).
- Evidence: "Led a 4-person team designing a Mars habitat; 3rd of 20 teams" is the only leadership item on the page, and it is the last row before Languages.
- Why it matters: aerospace and defence early-careers recruiters (persona a) score leadership and teamwork explicitly.
- Fix: add one clause to About's first paragraph (index.html:510), or place it as the first row of the table under Education.
- Effort: S

### REC-18 The phone nav wraps to two rows, and "Dark" reads like a destination
- Severity: P3
- Where: `.nav .wrap` css/site.css:99; `.nav ul` :103; :110. Screenshot: any `scroll/phone-light-*.png`.
- Evidence: at 375 px the brand and the links wrap onto two rows. The sticky bar is about 77 CSS px tall, roughly 9.5% of every screen. "Dark" sits in line with Work / About / Contact.
- Why it matters: it costs a little reading space on every screen, and "Dark" is a moment's confusion for a non-technical recruiter.
- Fix: keep one row under 520 px. Shrink the brand to 16 px, and make the theme toggle an icon button with `aria-label="Dark theme"` and the visible text hidden.
- Effort: S

### REC-19 E-01 states two different model counts (358 and 603)
- Severity: P3
- Where: E-01 summary and key figure index.html:470, :474 ("358 AI models"); Fig. 07 caption and aria-label index.html:491, :493 ("603 models").
- Evidence: the same project gives 358 in the summary and stat card and 603 in the figure caption, with no explanation.
- Why it matters: a careful reader (reader 2, or a recruiter who glances at both) sees an inconsistency in the one project that is about data analysis.
- Fix: needs from Dom, which number applies where. If the fit used 358 of the 603 plotted models (for example after filtering), say so in the caption ("603 models plotted; the fit uses the 358 with …"). Otherwise correct one of them.
- Effort: S
