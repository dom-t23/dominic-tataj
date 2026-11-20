# Verification of review/findings/benchmark.md (P0/P1 only)

Checked against `index.html`, `css/site.css`, `js/hello.js`, `js/hero-flight.js`,
`tests/site.spec.js`, `IMPROVEMENTS.md`, `DESIGN_PLAN.md` (H.3, Phase R), the running page on
127.0.0.1:4173 (copy matches the repo), and the screenshots `review/baseline/laptop-light-fold.png`,
`review/baseline/phone-light-fold.png`, `review/baseline/scroll/laptop-light-13.png`.
There are no P0 findings. Five P1 findings were checked.

- **BEN-01: CORRECTED.** Locations and the main claim hold. `index.html:53-56` is the eyebrow,
  the hidden h1 (with an inline style that forces it hidden), the pills and the lede. `css/site.css:86`
  sets the eyebrow to 14 px `--muted`, `:100` sets the nav name to 19 px, and `:118` sets the lede to 20 px.
  H.3 (14 Nov, Dom's call) is at `DESIGN_PLAN.md:183`. Both fold screenshots show no visible
  positioning sentence. Correction: the lede is not "muted". It uses `--ink-2` (#485165), the
  secondary ink, not `--muted` (#6B7385). That is a small wording error, and the finding's point
  still stands. Constraint check: H.3 is not a Phase R decision, and the finding gives a reason
  for reopening it, so this is allowed. The fix is build-free. The draft sentence is marked for
  Dom's approval. "Perception and control software" is supportable from E-04 and the Fig. 00 rig.
  Note, though, that E-04 says most of its code was written by an AI agent, so Dom should check
  "building … software" against that credit line.

- **BEN-02: CORRECTED.** The copy claims are exact. `:53` has "Mechanical engineering · UCL",
  `:54` has "Dominic Tataj, mechanical engineering portfolio", `:56` has "Aiming for mechanical
  engineering roles, open to software and autonomy", and `:14` has the OG description.
  `IMPROVEMENTS.md:22-27` logs this as an open P1. The fix keeps the degree accurate and invents
  nothing. Corrections: (1) `review/baseline/phone-light-fold.png` does not show the lede
  "filling most of the phone fold". It takes about 430 of 2436 px (about 18%), below the eyebrow
  and four pills. It is the largest single block, not most of the screen. (2) The meta description
  at `:7` only states the degree ("MEng Mechanical Engineering student at UCL") and names no
  target role. It is not mechanical-first targeting. The fault there is that it leaves out the
  target roles.

- **BEN-03: CORRECTED.** The facts hold. The E-03 sheet is at `:122-138`, with "Built & tested"
  at `:124`, "printed the frame in PC/ABS" at `:184` and "measured arm deflection at maximum
  thrust" at `:185`. Its imagery is Fusion renders, the 3D model and line drawings (`images/`
  has only renders, `robot-iso-*.png`, hero line-drawing frames and `photos/01-08.jpg`). The
  eight photographs are all Sicily and Malaysia (`:563-570`, and `laptop-light-13.png` shows
  them). IMPROVEMENTS item 9 was dropped on 24 Oct at Dom's request. The fix asks for photos
  from Dom and uses no placeholder, so it meets the no-invented-facts rule. Correction: the
  evidence cites "Katz, Zeloof, Barnard and Guan", but no site called Guan is in the benchmark
  table. The etotheipiplusone.net row says that page gives only the first name and was
  confirmed by search only. Drop "Guan" (here, in pattern 2 and in BEN-10) or name the source
  in the table. The P1 holds without it, and `IMPROVEMENTS.md:10-11` already says engineers need
  "evidence of building and testing real hardware".

- **BEN-04: CONFIRMED.** `#cap-flight` at `:108` reads "Flight test from my vision-only racing
  drone (E-04)…". E-04's heading at `:225` says "A simulated racing drone…", and
  `js/hero-flight.js:1-2` shows Fig. 00 replays course 1's recorded path from that simulated
  project. The quoted OG text is exact. The replacement wording is accurate and build-free.
  `js/hello.js` doesn't say "flight test", so that part of the fix is a no-op check. The
  `hero-flight.js` header comment and the CSS comment also say "flight-test strip". They are not
  user-facing, but they could be aligned.

- **BEN-05: CONFIRMED.** The register order is E-03, E-04, E-02, E-01 (`:75-95`; the finding
  says `:76`, one line off, which doesn't matter). The sheets are at `:122`, `:219`, `:342` and
  `:463`. IMPROVEMENTS item 2 records the "by relevance" order that put the frame first. E-04
  holds the 300-course pass rates (`:302-303`). The E-03 3D section is pinned:
  `css/site.css:305` gives `height: calc(var(--f3-h) + 220vh)`. Fix check: `tests/site.spec.js:16-19`
  hard-codes both the order and the Fig. 00–07 sequence, so the fix's note about updating tests
  is correct. No hard constraint is affected.

Outside the P0/P1 scope, noticed while checking: BEN-06 (P2) proposes the E-01 outcome
"Scaling law fitted across 358 models". The page says the dataset has 358 models (`:470`,
`:474`), but the fit in Fig. 07 uses 603 models (`:491`, `:493`, `js/scaling.js:2`). As written,
that card line would misstate a number.
