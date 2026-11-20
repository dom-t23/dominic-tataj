# Benchmark review: Dom Tataj's portfolio against standout engineer and award-level personal sites

Reviewer: benchmark (ID prefix BEN). Date: 20 Nov 2026.

## Method

I read `review/BRIEF.md`, `DESIGN_PLAN.md` (Phase R and §5), `IMPROVEMENTS.md`, `README.md` and
`review/baseline/NOTES.md`. I looked at `review/baseline/laptop-light-fold.png`,
`review/baseline/phone-light-fold.png`, `review/baseline/scroll/laptop-light-01.png`, and all 15
laptop and the first 12 phone scroll screens. I put them on contact sheets so I could compare
them side by side: `review/scratch/benchmark/laptop-a.png`, `laptop-b.png`, `phone-a.png` and
`phone-b.png` (script: `review/scratch/benchmark/montage.cjs`). I also looked at `og-image.png`,
and I read the hero, register and project markup in `index.html` and the hero CSS in
`css/site.css`.

For the benchmark set I used web search and then WebFetch to read each site's live page, except
where the table says "search only". I judge the sites by what is on them and the patterns they
use. I did not compare visual polish pixel for pixel, because WebFetch returns text. Where I
could only confirm a site through a search result, the table says so.

## Scores

Each score is relative to the benchmark set below.

| Dimension | Score (1 to 10) | One-line justification |
|---|---|---|
| Memorability | 6 | The hover rig, exploded 3D frame and replay pipeline are as memorable as anything in the set (closest to ciechanow.ski), but they start 1 to 3 screens down. The fold looks like many other sites. |
| 10-second clarity | 5 | The availability pills beat every engineer site in the set. But there is no visible line that says who he is, and the lede says "mechanical roles first", which is the opposite of what he now wants. |
| Craft | 7 | The tokens, elevation, figure captions and light/dark parity are careful and consistent, with no rough edges. It is safe rather than authored: no type or motion moment at the fold like the award sites have. |
| Proof of work | 6 | The numbers and testing write-up are better than any student site in the set (pass rates over 300 courses, 38 g, −36%, the sign-convention bug). There is not one photo or video of real built hardware, and Katz, Zeloof and Barnard lead with exactly that. |
| Credibility for engineering hiring | 6 | The honest role chips ("Individual, with an AI agent", "Team of 6") and the limitations help. A simulated flight labelled "Flight test", no CV and mechanical-first copy all cost trust with defence and autonomy readers. |
| Distinctiveness | 6 | The figures are unique to his work. The page shell (glow, dot grid, pill chips, two pill CTAs, card grid) is the common 2024–26 landing-page pattern. |
| **Overall** | **6** | The substance is in the top tier of the student and early-career set. The first screen and the absence of real hardware are what keep it from reading as standout. |

## Benchmark set

How I confirmed each site: **F** = WebFetch of the live page this session; **S** = a web search
result with its URL.

| Site | URL | Type | Memorable because | Pattern to adapt (adapt, don't copy) |
|---|---|---|---|---|
| Henry Buron | https://henryburon.github.io (F) | Early-career robotics software engineer (Northwestern MS Robotics; Swarmbotics AI, prev. NASA JPL) | The first screen is the role line ("Robotics Software Engineer · Phoenix, AZ"), the name, then one sentence: "I build software for robots that work in the real world." Selected work comes before "More projects", each with a 1–2 line description and tags. | **A visible positioning sentence** under the name that names the kind of work, and project cards with a sentence of what it does, not just a tool list. |
| Ben Katz, *BuildIts in Progress* | https://build-its-inprogress.blogspot.com (F, the "Hello there, Mini Cheetah" post) | Robotics hardware engineer (MIT Mini Cheetah actuators and controllers), senior | Photos and video of the real robot (backflips), with collaborators credited by name ("Jared wrote pretty much all the software") and links to thesis, paper and news. | **Real hardware on screen plus explicit credit lines.** Dom already does the credit part well; the hardware photos are missing. |
| Sam Zeloof | https://sam.zeloof.xyz (F) | Hardware / semiconductor maker, started as a student (home-made ICs Z1, Z2) | A home chip fab, shown as process imagery: die photos, curve-tracer screenshots, a step-by-step fab flow, lab equipment. Four "Featured projects" pinned at the top. | **Process evidence as images**: the test rig, the measurement, the failure, not only the finished render. |
| Joe Barnard, BPS.space | https://bps.space (F) | Aerospace / avionics (thrust-vectored, propulsively landed model rockets; sells flight computers) | Video of real flights is the hero; the headline is a single claim ("Thrust vectoring at model scale"). | **One plain-English claim as the hero headline**, backed by footage of the thing working. |
| Charles (MIT EV and combat-robot builder), etotheipiplusone.net | https://www.etotheipiplusone.net (S: its About page; the page gives only the first name) | Robotics and EV hardware, started in high school, now an "online engineering notebook" | Years of dated build reports. The archive itself is the evidence of persistence. | **A dated "latest" line on in-progress work** (E-04 is "In development") so the site shows momentum. |
| Bartosz Ciechanowski | https://ciechanow.ski (F) | Software engineer who writes interactive engineering explainers (mechanical watch, gears, GPS, Moon) | You learn by dragging: sliders, 3D views you can rotate, plots that follow your input, and coloured words in the text that match parts of the figure. | **Figure-text colour keys and "try this" prompts.** Dom's figures are already of this kind; lift the best one higher and key its caption colours to the plot. |
| Rauno Freiberg | https://rauno.me (F) | Design engineer who codes (Vercel; prev. The Browser Company) | A sparse page: one line of who he is, tiles for craft work, a short manifesto, copy-email with a "Copied" state. Small details are the brand. | **Restraint plus one signature micro-interaction.** Dom's copy-email burst fits here; keep the quirks few and sharp. |
| Kevin Zakka | https://kzakka.com (F) | Robotics researcher (Berkeley PhD; MuJoCo Menagerie, mink) | One-line bio ("I'm a final-year PhD student at UC Berkeley, advised by Pieter Abbeel"), then open-source software as links. | **Every project links to an artefact** (repo, report, paper). |
| Bruno Simon (craft) | https://bruno-simon.com (F; Awwwards Site of the Day 11 Nov 2019 per awwwards.com/sites/brunos-portfolio, S) | Award-level personal portfolio, creative developer | The whole portfolio is a drivable three.js world. The interaction is the identity. | **The signature interaction is the first thing you meet.** Adapted for reading speed, this means Fig. 00 belongs in the first screen, not the whole site as a toy. |
| Dennis Snellenberg (craft) | https://dennissnellenberg.com (F; Awwwards SOTD 4 Apr 2022 per awwwards.com/sites/dennis-snellenberg, S) | Award-level personal portfolio, freelance designer/developer | A large headline, a portrait, the location, then four recent works with role and year. Big type does the hierarchy. | **Type as the hero anchor**: one large display line at the fold, so the page has a focal point other than pills. |
| Lynn Fisher (craft) | https://lynnandtonic.com (S: Adobe XD interview and web.dev community highlight) | Award-level personal site, redesigned from a blank stylesheet every year | The site itself is the portfolio piece, with a public case study for each refresh. | **A short public "how this site was built" note** linking the repo. For an engineer, this proves the custom WebGL/controller work is his own. |

Not used: Jared Berry's quadrotor page (jarmibe7.github.io, F) is a solid student write-up, but
it has no measured results, no video and no individual contribution stated. It shows the floor
for student sites, and Dom is already well above it.

## Patterns Dom's site should adopt, ranked

1. **A visible one-sentence positioning line at the fold**, as Buron, Barnard, Zakka and
   Snellenberg all have. Right now the only visible identity is the nav name and the eyebrow
   "Mechanical engineering · UCL". See BEN-01 and BEN-02.
2. **Real hardware on screen** (Katz, Zeloof, Barnard, Guan). Every engineer in the set who
   builds things shows the thing. Dom's site shows renders and line drawings only. See BEN-03.
3. **Signature figure inside the first screen** (Bruno Simon, Ciechanowski, adapted). Fig. 00
   is Dom's strongest "this person is different" moment, and on a laptop it starts at y≈850 of
   900. See BEN-07.
4. **Outcome lines on the project list** (Buron). Replace the tool-only meta with a result the
   repo already contains. See BEN-06.
5. **Lead with the work that matches the target** (Buron's "Selected work" ordering). See BEN-05.
6. **Artefact links per project** (Zakka, Katz): repo, report, video. See BEN-08.
7. **Precise claims** (Barnard separates simulation from flight). See BEN-04.
8. **Momentum signal on in-progress work** (Guan, Zeloof). See BEN-10.
9. **The site as a piece of work** (Lynn Fisher's case studies). A one-line "how this site is
   built" with the repo link. See BEN-11.

## Generic/template look

**Partly yes, at the fold only.** The first screen is a soft-glow, dot-grid background with
availability pills, a muted lede, a dark pill "View projects" plus a ghost pill "Get in touch",
and a 4-card grid. That is the common landing-page shell, and the drone line drawing doesn't
override it on its own. No site in the set opens like this: the engineers open on the real
artefact or a plain claim, and the award sites open on one strong authored move. Below the fold,
the figures (hover rig with Routh–Hurwitz zones, exploded 3D frame, replay pipeline strip) are
not template at all, and they are the most distinctive thing in the student and early-career part
of the set.

## Findings

### BEN-01 No visible line says who Dom is or what he builds
- Severity: P1
- Where: hero, `index.html:53-56` (`.eyebrow`, the visually hidden `h1`, `.lede`); `css/site.css:86,118`. Screenshots `review/baseline/laptop-light-fold.png`, `review/baseline/phone-light-fold.png`.
- Evidence: The h1 is hidden (`index.html:54`, decision H.3 of 14 Nov). The visible identity at the fold is the nav name (19 px, `css/site.css:100`), the 14 px muted eyebrow "Mechanical engineering · UCL", and a 20 px muted lede that starts "I work across CAD, generative design and FEA…". Every benchmark site with a 10-second job puts a name plus one plain sentence first: Buron's "I build software for robots that work in the real world", Barnard's "Thrust vectoring at model scale", Zakka's one-line bio, Snellenberg's display headline.
- Why it matters: Recruiters (reader 1) get about 30 seconds from a LinkedIn link. Without a claim sentence they have to piece the identity together from pills and a skills list.
- Fix: I'm reopening H.3 only partly, because every site in the set does this. Keep a big decorative headline out. Make the first line of the hero a visible sentence styled larger than the lede (for example Space Grotesk 28–34 px, `--ink`), and make it the real `h1`. Draft from repo facts, for Dom to approve: "Dominic Tataj. MEng Mechanical Engineering student at UCL, building perception and control software for drones and the hardware they fly on." Then trim the lede to the supporting skills list.
- Effort: S

### BEN-02 Hero, h1 and meta copy still target mechanical roles first
- Severity: P1
- Where: `index.html:7`, `:14`, `:53`, `:54`, `:56`. Screenshot `review/baseline/phone-light-fold.png` (the lede fills most of the phone fold).
- Evidence: The lede says "Aiming for mechanical engineering roles, open to software and autonomy". The eyebrow is "Mechanical engineering · UCL". The hidden h1 is "Dominic Tataj, mechanical engineering portfolio". `IMPROVEMENTS.md` already logs this as an open P1. In the benchmark set the role line is the target role (Buron: "Robotics Software Engineer").
- Why it matters: A defence or autonomy recruiter reads "mechanical roles" and files him in the wrong pile.
- Fix: Keep the degree accurate but make the role line the target, for example eyebrow "Software, autonomy and systems · MEng Mechanical Engineering, UCL". Change the lede to "Aiming for software, autonomy and systems roles, with mechanical design as a strength". Update the h1, meta description and og:description to match.
- Effort: S

### BEN-03 Not one photo or video of hardware Dom built; the only real photos are holiday shots
- Severity: P1
- Where: E-03 sheet `index.html:122-138` (chip "Status: Built & tested" at `:124`, renders at `:137-138`); About film strip `index.html:563-570`. Screenshots `review/baseline/scroll/laptop-light-02.png` to `-05.png`, `review/baseline/scroll/laptop-light-13.png`.
- Evidence: E-03 says "Built & tested", "I printed the frame in PC/ABS" and "I measured arm deflection at maximum thrust". It shows Fusion renders, the 3D model and line drawings only. The eight real photographs on the site are Sicily and Malaysia. Katz, Zeloof, Barnard and Guan all lead with the physical object and test footage.
- Why it matters: Engineers (reader 2) want evidence of building and testing, and a photo of a printed frame on a scale or a deflection rig is the fastest proof there is. Recruiters at hardware and defence firms look for the same thing. The decision to drop `IMPROVEMENTS.md` item 9 (24 Oct) predates the brief's emphasis on "evidence of testing". I'm reopening it for that reason.
- Fix: **Needs from Dom**: 2–4 photos, for example the printed frame (ideally on a scale reading 38 g), the assembled drone, the arm-deflection test setup, and the robot on the pipe at the IMechE event. Then add an inset "On the bench" photo row to E-03 after the stat cards and one photo to E-02, and optionally cross-fade the hero line drawing to the real drone on hover or tap. Leave it out until the photos exist; don't use a placeholder.
- Effort: M

### BEN-04 Fig. 00 calls a simulated flight a "Flight test"
- Severity: P1
- Where: `index.html:108` (`#cap-flight`), compared with `index.html:225` ("A simulated racing drone…"). Screenshot `review/baseline/scroll/laptop-light-01.png`.
- Evidence: The caption reads "Flight test from my vision-only racing drone (E-04)". E-04's own heading says the drone is simulated, and `og:description` says "Designs, simulates and builds drones". The benchmark aerospace site keeps flight claims literal.
- Why it matters: An autonomy or defence engineer reads "flight test" as real flight. Finding out two screens later that it is simulated costs trust that the rest of the page (the honest AI-agent credit, the limitations) works to earn.
- Fix: Change it to "Simulated flight of my vision-only racing drone (E-04): true path in blue, its own estimate dashed orange." Check the hero's `aria-label`s and the `hello.js` console note for the same wording.
- Effort: S

### BEN-05 Project order still leads with the mechanical project
- Severity: P1
- Where: register `index.html:76-95`; sheets `index.html:122` (E-03), `:219` (E-04), `:342`, `:463`. Screenshots `review/baseline/laptop-light-fold.png` and `review/baseline/scroll/phone-light-01.png`.
- Evidence: The order is E-03 frame, E-04 vision autonomy, E-02, E-01, which was set "by relevance" (IMPROVEMENTS item 2) when mechanical came first. Since 20 Nov the target is software, autonomy and systems. Buron puts the most role-relevant work first.
- Why it matters: Recruiters scan the first card. An engineer reading in order meets the strongest software and testing story (E-04's harness, 300-course pass rates) second, after a long pinned 3D section.
- Fix: Put E-04 first in the register and the sheets, and keep E-03 second as "mechanical design as a strength". The hero drone can stay as E-03's art, since it ties to E-04's drone. Figures are numbered in page order, so renumber the Fig. labels and update the tests that use them. If that is too costly now, at least reorder the register cards.
- Effort: M

### BEN-06 Project cards list tools, not results
- Severity: P2
- Where: `.register .r-meta`, `index.html:80-94`; `css/site.css:195`. Screenshot `review/baseline/laptop-light-fold.png`.
- Evidence: The card meta is "Fusion · Ansys", "Python · OpenCV", "Excel · Fusion", "MATLAB". The register is the only project content inside the first screen on both laptop and phone. Buron's list gives a sentence per project.
- Why it matters: Recruiters stop at the fold, and a result is what makes someone remember a project.
- Fix: Replace or extend `r-meta` with one result already on the page, for example E-03 "38 g frame, 246 g all-up, 36% lighter than a plate frame"; E-04 "98.6% of gates passed over 300 cluttered courses"; E-02 "Completed the climb, IMechE Design Challenge"; E-01 "Scaling law fitted across 358 models". Move the tools into a quieter second line or drop them.
- Effort: S

### BEN-07 The signature figure starts at the bottom edge of the laptop fold
- Severity: P2
- Where: `index.html:97-110` (`figure.flight`), after the register at `:76`; `css/site.css:182`. Screenshots `review/baseline/laptop-light-fold.png` (only the Fig. 00 header strip shows at y≈850), `review/baseline/scroll/phone-light-01.png`.
- Evidence: The award references (Bruno Simon) and Ciechanowski put the interaction where you land. Dom's most distinctive moments (the flight replay and "Try the controller") sit below a generic card row.
- Why it matters: Memorability is about one moment a recruiter can describe a week later, and right now that moment is below the fold.
- Fix: On wide screens, put `figure.flight` directly under the hero text and drone, and move the register under it, or into a slimmer single row. Keep text first on phones. All of this is a CSS grid reorder (`order` on `.register`/`.flight`), with no new motion. That keeps the §5 gates, because text is still readable at frame 0.
- Effort: M

### BEN-08 Only one project links to an artefact
- Severity: P2
- Where: E-04 source link `index.html:335`; there are none in E-03, E-02 or E-01.
- Evidence: Zakka and Katz link each piece of work to its repo, paper or thesis. Dom's only artefact link is E-04's GitHub repo.
- Why it matters: Hiring managers want to check things for themselves. A report or a model file shows he owns the work.
- Fix: **Needs from Dom**: anything he can share, for example the E-01 report PDF, the E-02 Excel model (minus team-private data), or an E-03 Ansys summary image. Add one "Source:" note per sheet, using the same `.note` pattern as `:335`.
- Effort: S once the content exists

### BEN-09 The link preview is from the retired drawing-set identity and carries no role or availability
- Severity: P2
- Where: `og-image.png`; `index.html:13-19`.
- Evidence: The OG image uses a serif display name, uppercase mono labels and a drafting grid. Phase R removed uppercase mono labels and moved headings to Space Grotesk. It shows the same tool-only project list and none of the target role, availability or right to work. Recruiters arrive "from a LinkedIn link", so this card is their actual first impression.
- Why it matters: Reader 1's first touch is off-brand and says "Mechanical Engineering" only.
- Fix: Regenerate the OG image in Phase R tokens, with the name, the BEN-01 positioning line, "Summer 2027 or placement year · UK, no sponsorship", and the hero drone drawing (`images/hero/t16.webp`). Update `og:description` to match BEN-02.
- Effort: S

### BEN-10 The in-progress project has no sign of momentum
- Severity: P3
- Where: E-04 chips `index.html:221` ("Status: In development").
- Evidence: The notebook-style sites in the set (Guan, Zeloof, Katz) show dated progress. E-04 says "In development" but gives no last-update date or next step.
- Why it matters: For an autonomy hiring manager, "what are you working on now" is a natural interview opener.
- Fix: Add a one-line "Latest (Mon YYYY): …" note under E-04's summary. **Needs from Dom**: the latest milestone and its date.
- Effort: S

### BEN-11 The site itself is unclaimed engineering work
- Severity: P3
- Where: footer (`review/baseline/scroll/laptop-light-14.png`).
- Evidence: The vendored three.js viewer, the planar quadrotor model with a Routh–Hurwitz stability map, and the Playwright test harness are serious engineering in their own right, and the page doesn't mention them. Lynn Fisher publishes a case study of her own site.
- Why it matters: For software-role readers, a hand-built, tested, performance-budgeted static site is direct evidence of the skills they are hiring for.
- Fix: Add one footer line: "Built by hand: vanilla JS modules, three.js, a Playwright test suite. Source on GitHub ↗", linking the repo, with an optional short "How this site works" note later.
- Effort: S
