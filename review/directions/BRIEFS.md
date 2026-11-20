# Phase 3: three direction briefs

All three keep the hard constraints in `review/BRIEF.md` §3: build-free; light first (dark
only through the toggle); no drawing-set identity (no revision clouds, title blocks, sheet
numbers, uppercase tracked mono labels); crosshair cursor and film-strip photos kept; no sound;
every animation carries information; content readable at frame 0; full reduced-motion fallbacks;
light/dark parity from tokens; keyboard operable; no horizontal scroll on phones; the §0.3
performance budget. All three fix the content problems the same way, so only the identity is
being compared: a visible name-and-role h1 (`REVIEW.md` conflict 1), the S.1 targeting copy,
E-04 leading, key figures under each summary, honest captions, no count-ups.

Each prototype covers the **hero, E-04 (the lead project) and About**, with real content from
`index.html` and no lorem ipsum. Fonts come from Google Fonts or are self-hosted woff2 (no
build step and no npm dependency in the shipped site).

---

## A. "Flight log": instrument-grade type, the recorded flight as the hero

- **Concept.** The page reads like a well-set test report from a flight-test engineer: big,
  tight type; numbers set as numbers; one real artefact per screen. There are no cards. Sections
  sit straight on the page, divided by hairlines, and the only raised object is an interactive
  figure. It answers R-03 by taking away the SaaS vocabulary (glows, dot grid, pills, glass,
  shadows on everything).
- **Type.** Headings in **Archivo** at a semi-expanded width (`font-stretch` 112–125%, weight
  600–700), which gives an aerospace and defence register without being a display gimmick. Body
  in **IBM Plex Sans**. Numbers and data in **IBM Plex Mono**, in sentence case with correct
  units. A strict scale (about 1.25), with a large h1.
- **Palette.** Warm white page `#F7F6F3`, ink `#101214`, a graphite secondary. One signal
  colour, safety orange `#FF4F00` for data and the active state only, with `--on-signal` text.
  The true-path blue becomes a token. Dark: deep graphite `#0E1012`, with surfaces that step up
  visibly in lightness.
- **Layout.** A 12-column grid with a wide left margin column holding the section numbers
  (E-04, E-03…) and metadata, in the manner of a technical report. Hero: the name and role at
  display size on the left, with availability as a two-column spec list (label/value, hairline
  rows) and CTAs; on the right, Fig. 00's plan view of the real recorded flight drawing itself
  (from `flights/index.js`) with a live readout. The hero drone drawing moves to the E-03 card.
- **Signature moment.** The real recorded flight draws its path beside your name in the first
  second, with the estimate (dashed) tracking the truth (solid) and a readout in tabular mono.
  The data is the identity.

## B. "Brief": a dossier for a screening recruiter, defence-clear

- **Concept.** Optimised for reader 1. The first screen is a one-page brief: who, what roles,
  when, right to work, the three results that matter, and contact and CV. The project index is
  a results table that a recruiter can scan in ten seconds. It answers R-02 and R-23 head on, and
  it looks like a confident engineering organisation rather than a startup landing page.
- **Type.** **Geist** for headings and UI (a neutral modern grotesk, Vercel, OFL) with **Geist
  Mono** for data. One superfamily: a calm and precise register. Tight tracking on display
  sizes, generous leading on body.
- **Palette.** Paper white `#FFFFFF` on a cool page `#F4F5F7`, deep navy ink `#0D1B2A`,
  steel-grey secondaries. The orange stays as the only accent for data and status, used
  sparingly. Dark mode is a "night" theme: navy-black `#0A0F16` with crisp hairlines.
- **Layout.** Hero split into a statement column (h1 name, role line, one sentence) and a
  "brief" panel: a definition list (Role sought / Available / Right to work / Based / Degree /
  Contact) with CV and email actions. Under it, the project index as a table with columns
  Project, What it shows, Result, Tools. Each project section opens with a "Key results" row of
  big numbers, then the figure, then method. Rectangular geometry with small radii (4–8 px), no
  capsules except for actions.
- **Signature moment.** The results index: the four projects as rows, each with one hard number
  (98.6% of gates, 246 g all-up, completed the climb, P ∝ N^0.55). Hovering or focusing a row
  shows a small preview of its figure. The recruiter's ten-second scan *is* the design.

## C. "Field notes": editorial and explorable, figures first

- **Concept.** In the tradition of Distill and of explorable explanations. Each project is a
  short essay where the figure is the hero and words in the prose are colour-keyed to the
  figure's lines (truth blue, estimate orange). It is for reader 2, and memorable for everyone,
  because the interactives are the most distinctive thing Dom has. It answers R-03 by making the
  figures, not containers, carry the page.
- **Type.** Headings in **Instrument Sans** (a modern grotesk with character, OFL), semibold,
  large. Body in **Source Serif 4** at a comfortable 18–19 px for long reading (headings stay
  sans, as the brief requires). Data in **JetBrains Mono** or IBM Plex Mono.
- **Palette.** Off-white paper `#FBFAF7`, ink `#16181B`, with a muted secondary. Data colours:
  orange for the estimate and the active state, blue for truth, used as a key between text and
  figure. Dark: warm charcoal `#141311`.
- **Layout.** A narrow text column (about 64 ch) with figures breaking out wider than the text,
  up to full bleed. A sticky in-page index on desktop (E-04, E-03, E-02, E-01, About) shows where
  you are. Hero: a large h1 name and role line, a short standfirst, then straight into Fig. 00 at
  full width as the opening illustration. No panels at all; figures have one hairline frame and
  a caption set like a journal's.
- **Signature moment.** Colour-keyed prose: in E-04's summary, the words "true path" and "its
  own estimate" are set in the figure's blue and orange, and hovering or focusing them highlights
  that line in the replay and the pipeline strip. Reading and seeing become one act.
