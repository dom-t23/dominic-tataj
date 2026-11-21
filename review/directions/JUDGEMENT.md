# Judgement: design directions A, B and C

Judge: independent creative director. Date: 21 Nov 2026.

Inputs, and nothing else: `review/BRIEF.md`, `review/findings/benchmark.md`, the 12 screenshots
per direction in `review/directions/{A,B,C}/`, and `review/baseline/phone-light-fold.png` and
`laptop-light-fold.png` for reference. I did not open any markup, CSS, JS, NOTES or BRIEFS file,
so this judges only what a visitor sees. Anything I could not see is marked "not verifiable from
screenshots".

## Weighting

The brief ranks readers recruiter first (30 seconds, phone, from LinkedIn), engineer second and
photography third. It sets the bar as "a recruiter remembers it a week later and an engineer
respects it", with "professional first, delight second". So:

| Criterion | Weight | Why |
|---|---|---|
| 10-second clarity (phone fold) | 30% | Reader 1's whole job happens here |
| Credibility (UK defence/autonomy and software recruiters) | 30% | The other half of reader 1, and all of reader 2 |
| Memorability | 15% | Explicit target, but "delight second" |
| Craft (type, spacing, hierarchy, consistency, dark theme) | 15% | Supports both readers; an engineer notices sloppiness |
| Fit with his actual work | 10% | Mostly shared content across directions, so it separates them less |

## Scores (1 to 10)

| Direction | 10-s clarity | Memorability | Craft | Credibility | Fit | **Weighted total** |
|---|---|---|---|---|---|---|
| A: big name, ruled fact sheet, Fig. 00 beside it (desktop) | 8 | 7 | 8 | 8 | 8 | **7.85** |
| B: "At a glance" card, Projects-and-results table in the fold | 9 | 7 | 8 | 9 | 9 | **8.55** |
| C: editorial serif lede, full-width Fig. 00, side index | 8 | 7 | 7 | 7 | 8 | **7.40** |

Baseline for reference: the current phone fold has the availability pills but no role line, says
"mechanical engineering roles", and has no contact route beyond a "Get in touch" pill. All three
directions fix every one of those problems; the gaps between them are smaller than the gap from
the baseline.

### A
- **Clarity 8.** The phone fold answers who (name), what roles ("Software, autonomy and systems"),
  when (Summer 2027 / 2027–28 placement, from 27 June 2027), right to work and location in a clean
  two-column ruled table, then "Email me" and "See the lead project". It loses a point because
  the extended display name takes about a quarter of the fold, and no email address, LinkedIn or
  GitHub appears in the fold; "Email me" is the only contact route.
- **Memorability 7.** The wide extended grotesk name is the strongest type move of the three. On
  desktop, Fig. 00 sits beside the fact sheet as a *complete* flight: the full 8-gate path,
  an estimate-error strip and a stat row (10.88 s, 8 of 8, 5.8 m/s, 0.12 m mean error). That is
  the best "signature figure in the first screen" (BEN-07) of the three. The phone fold has no
  figure at all, though.
- **Craft 8.** Disciplined: black hairline rules, square buttons, consistent label/value
  rhythm, good dark parity. E-04 on desktop has a tidy left metadata column. The mono figures
  for E-04's key stats look slightly technical-cheap next to the sans, and the desktop fold leaves
  a dead band under the CTAs.
- **Credibility 8.** Reads like a sober spec sheet, which suits defence. E-04 is honest
  ("Solo; set the design and test rules, directed an AI coding agent"; "A simulated flight").
  About keeps Education first, before the software skills, so the software-first story is
  a little weaker than in B.
- **Fit 8.** The complete flight plot with its own-estimate error trace is exactly his work.

### B
- **Clarity 9.** The most complete phone fold. Name, then role line, then an "At a glance" box
  with Looking for (roles *and* timing), Available, Right to work, Based, Degree, **the email
  address written out**, then Email me, LinkedIn and GitHub, all above the fold. A recruiter can
  copy the address without a click. It keeps a point back because the rounded card is long, and
  the "UK defence" sentence starts only at the very bottom of the fold.
- **Memorability 7.** On desktop the "Projects and results" table in the first screen is the
  thing a recruiter will repeat a week later: "98.6% of gates", "246 g, under the CAA's 250 g",
  "Climbed", "P ∝ N^0.55". The look itself (rounded card, pill buttons, navy dark theme) is the
  closest of the three to the generic 2024–26 shell the benchmark warned about.
- **Craft 8.** Clean, consistent and well spaced, with strong dark parity and good stat
  hierarchy (big number, bold label, quiet qualifier, e.g. "No IMU: motion predicted from its own
  commands"). The E-04 page is boxed in a card with an orange "E-04" tab and a ruled
  Role/Tools/Date/Status header strip; see the constraint check.
- **Credibility 9.** It does what the benchmark asked: outcome lines on the project list
  (BEN-06), E-04 first (BEN-05), a summary that leads with the result, and precise claims
  ("Six recorded flights in simulation", "Top view · from the recording"). In About, the
  software skills are rewritten as capability rather than tool lists ("Autonomy architecture:
  detection, pose, filtering and guidance as separate stages", "Test design: seeded regression
  benchmarks, flagged A/B changes, pooled acceptance"), with Education after them and
  photography last. That is the strongest software and autonomy signal of the three.
- **Fit 9.** It shows breadth in one glance (vision autonomy, generative frame, dynamic model,
  scaling law), with mechanical clearly placed second.

### C
- **Clarity 8.** It has everything (role line, a compact fact grid with Available and Based side
  by side, Email me, LinkedIn, GitHub, and the start of Fig. 00), but the six-line serif lede
  sits *between* the role line and the facts. On a phone that pushes availability and right to
  work down to mid-fold. It is the slowest of the three to scan.
- **Memorability 7.** It has the most authored feel: tight-tracked grotesk name, serif reading
  text, and caption words colour-keyed to the plot ("true path in blue", "the drone's own
  estimate dashed orange") in the Ciechanowski manner the benchmark ranked well. But Fig. 00 at
  the fold is mostly empty at capture time: a short path stub top-left, gates trailing away, an
  empty Elevation panel. That is a weak hero moment and puts the "readable at frame 0" gate at
  risk.
- **Craft 7.** The type pairing is good and the dark theme (warm black) is handsome. Against
  that: Fig. 00 labels collide on the phone ("Start" overprints gate 1's circle); on desktop
  About the film strip runs off the right edge of the viewport, out of the content column; and
  numbering the skills 1–13 adds noise and no information.
- **Credibility 7.** The content is as strong as B's (same result-led E-04 summary and the same
  capability-style skills). The editorial serif reads more "essay" than "engineering", which
  matters a little for defence primes. The real problem: **on phone About, "Outside
  engineering", the Unsplash stats and the film strip come *before* Skills and experience.** That
  directly contradicts brief §2 (photography "must never compete with the engineering work").
- **Fit 8.** The colour-keyed prose-to-figure links and the sticky desktop project index
  (E-04 … E-01, About, Contact) suit a figure-heavy engineering write-up well.

## Winner

**B, with grafts from A and C.** Wording: "B + A's complete Fig. 00 and flat rules + C's
colour-keyed captions and project index".

B wins on the two criteria that carry 60% of the weight. It is the only phone fold where a
recruiter gets the target role, timing, right to work, location, the written-out email address
and LinkedIn/GitHub without scrolling. It is also the only desktop fold that puts a result for
every project in the first screen. Its weakness is that it looks more template than authored,
and A and C each have a better answer to that than B does.

## Hybrid spec (exact)

Keep from **B** (the base):
1. The phone and desktop hero content and order: name → role line ("Software, autonomy and
   systems · MEng, UCL") → fact block with Looking for (roles + timing), Available, Right to
   work, Based, Degree, Email (address written out) → Email me / LinkedIn / GitHub → lede.
2. The desktop "Projects and results" table (Project / What it shows / Result / Tools), E-04
   first, with the big result figure per row.
3. E-04's result-led summary, the four key-result cells each with a bold label and a quiet
   qualifier line, and "Six recorded flights in simulation" / "Top view · from the recording"
   wording.
4. B's About: software-first capability rows, then Mechanical design, Education, Leadership,
   Experience, Languages; "Outside engineering" and the film strip last.

Take from **A**:
5. The **visual treatment of the fact block and buttons**: drop B's rounded "At a glance" card
   and pill buttons. Use A's flat layout instead: a heavy top rule, hairline row dividers, no
   box, square-cornered primary and secondary buttons. B's content stays in it. This removes
   the most "template" part of B (benchmark: "pill chips, two pill CTAs, card grid").
6. **A's Fig. 00 composition**: the complete 8-gate flight path drawn in full, with the
   estimate-error strip beneath it and the four-cell stat row (Time, Gate, Mean speed, Mean
   estimate error). It should replace B's in-progress Plan/Elevation view, so the figure is
   complete and readable at frame 0 and the empty Elevation panel goes. On desktop it stays in
   B's right column under the fact block. On phones, place it after the hero text (text first).
7. Also from A: E-04's **unboxed** page with a left metadata column (Role, Tools, Date, Status,
   Code) in place of B's carded E-04 with its ruled Role/Tools/Date/Status header strip (see the
   constraint check).

Take from **C**:
8. **Colour-keyed caption words** that match the plot strokes ("true path in blue", "the
   drone's own estimate dashed orange") in the Fig. 00 caption and the E-04 replay caption.
9. The **sticky project index** in the left gutter on wide screens (E-04 … E-01, About,
   Contact), in place of A's metadata column only *after* the metadata has scrolled away. If
   both don't fit, keep A's metadata column and drop the index.
10. The short **"Replay" explainer caption** under E-04's replay strip ("Left, the onboard
    camera…; right, the top view…; below, what each stage of the flight stack did in this
    frame").

Leave out from C: the serif lede before the facts, the numbered skills list, photography
before skills on phone, and the film strip bleeding past the content column.

Optionally from A: the extended display face for the name only, if it fits the phone at B's
size without pushing the fact block below about 40% of the fold.

## Hard-constraint check on the winner (BRIEF §3), from screenshots

| Constraint | Status in B as shown | Note |
|---|---|---|
| Light theme first, dark only via toggle | Pass | Light screenshots are the default; a "Dark"/"Light" text toggle is in the nav. |
| No drawing-set identity (no revision clouds, title blocks, sheet numbers) | **At risk** | E-04's header is a ruled strip of labelled cells (orange "E-04" block, Role / Tools / Date / Status) across the top of a bordered sheet. That reads as a **title block**. The hybrid replaces it with A's unboxed left metadata column (item 7). The figure labels "Plan" and "Elevation" are drafting terms too, but the baseline already has them, and item 6 removes Elevation anyway. |
| Keep crosshair cursor | Not verifiable from screenshots | Check in the browser. |
| Keep film-strip photos | Pass | Present in About, last section. |
| No sound | Not verifiable from screenshots | Nothing suggests audio. |
| Don't invent facts | **Verify** | New or reworded claims in B to check against the repo's data files: "Full right to work in the UK" (baseline says "UK, no sponsorship"); "predicted 2:1"; "dominic_tataj@icloud.com"; "246 g all-up, under the CAA's 250 g; frame 36% lighter"; "measured arm deflection within 18% of Ansys"; "Climbed the 2 m pipe in competition; 16% faster in real runs"; "picked the drivetrain from more than 20 simulated"; "R² 0.44; GPT-5 at about 590 kW"; "P ∝ N^0.55". Any claim not in the repo must become a marked placeholder. |
| CV link (brief §2 asks "how to contact me or get my CV") | Missing in all three | Not a §3 breach, but list it under **Needed from Dom**: a CV PDF, then add "CV (PDF)" beside Email me. |
| Content readable at frame 0; every animation informative | **At risk in B, fixed by graft** | B's Fig. 00 was captured mid-replay with an empty Elevation panel. A's complete-path figure (item 6) is readable at frame 0. |
| No horizontal scroll on phones | Not verifiable from screenshots | B's 4-column Projects-and-results table was not captured at phone width; confirm it reflows to stacked rows. |
| Build-free, no deps, reduced motion, keyboard, performance budget, rAF pausing, tests pass | Not verifiable from screenshots | Check with `npm test` and the §5 gates. |
| Keep a geometric or modern sans for headings (open, but bounded) | Pass | B uses a modern grotesk throughout. |
