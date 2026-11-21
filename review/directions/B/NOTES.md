# Direction B, "Brief": prototype notes

Worktree `C:\Users\domin\dt-dir-B`, branch `proto/dir-B`. Served on 127.0.0.1:4174 for the captures.
Capture script: `review/scratch/dir-B/capture.cjs` (run with node from the main repo). Hover-state
shots of the signature are in `review/scratch/dir-B/hover-{light,dark}-{e03,e02,e01}.png`.

## Starting point

The worktree branched at `113ce5f`, before the S.1–S.8 content batches. I checked out
`index.html`, `css/site.css` and `js/` from `claude/design-review` HEAD (`eb7cb93`) first. That
brings in the copy every direction shares, already in the repo: the S.1 targeting copy, E-04 first,
figures renumbered in page order, honest Fig. 00 and rig captions, no count-ups, sentence-case
figure labels, the `mailto:` email and the skip link. The direction's work was then done on top of
it. So the diff against `113ce5f` also includes those batches, and they aren't part of the identity
being judged.

## What I built

The page is a one-page brief for a screening recruiter. It looks like a confident engineering
organisation's dossier: paper-white panels on a cool page, deep navy ink, hairlines, small radii and
one orange accent.

### Hero

On desktop the hero is two stacks in a 7:5 split:
- **Left:** who Dom is, then the results index.
- **Right:** the brief, then the exhibit.

At 1440 × 900 the first screen holds the name, the role line, the sentence, all six brief facts,
the Email action and all four project results. Fig. 00 is drawing itself beside them.

- **h1 (conflict 1).** It is visible and reads "Dominic Tataj" at display size (Geist 600, 84 px,
  −0.045 em). Under it, inside the same h1, is the role line "Software, autonomy and systems · MEng,
  UCL" (copy item 2). The approved sentence (copy item 1) follows.
- **The brief panel ("At a glance").** It is a `<dl>` with the label on the left and the value on
  the right, on hairline rows:
  - Looking for: Software, autonomy and systems roles, with a second line "Summer 2027 internship or
    2027–28 placement year";
  - Available: From 27 June 2027;
  - Right to work: Full right to work in the UK;
  - Based: London;
  - Degree: MEng Mechanical Engineering, UCL, with a second line "Second-year, graduating 2029,
    predicted 2:1";
  - Email, as a `mailto:` link.

  Below the list are the actions: Email me (primary), LinkedIn ↗ and GitHub ↗. The CV button is left
  in the markup, commented out (conflict 6).
- **Phones.** The two stacks open into one column with `display: contents` and `order`, in this
  sequence: name and role, brief, sentence, results, exhibit. The first 812 px screen answers every
  screening question and shows the Email me button.

### The results index (signature)

The index is a real `<table>` with the columns Project, What it shows, Result and Tools. There is
one hard number per project:

| Project | Result |
|---|---|
| E-04 | 98.6% of gates with clutter, camera + IMU, over 300 courses |
| E-03 | 246 g all-up, under the CAA's 250 g; frame 36% lighter |
| E-02 | Climbed the 2 m pipe in competition; 16% faster in real runs |
| E-01 | P ∝ N^0.55, R² 0.44; GPT-5 at about 590 kW |

Each whole row is the project's link (a stretched link from the project-name cell). On phones each
row becomes a block: code and name, then the number with its context, then "what it shows", then the
tools.

### E-04 (first project)

1. **Header bar.** One hairline row: the project code in an orange block, then Role ("Solo: set the
   design and test rules, directed an AI coding agent"), Tools, Date and Status.
2. **Title and summary** (from the S-batches; copy item 7 and COPY-02).
3. **Key results**, straight under the summary. Four big numbers sit between a 2 px ink rule and a
   hairline, with the note "Pooled over 300 seeded courses: six sets of 50 random 8-gate courses":
   - 99.8%: gates passed in a clean world, camera + IMU;
   - 98.6%: with gate-coloured clutter beside the course, camera + IMU;
   - 97.5%: with clutter, camera only ("No IMU: motion predicted from its own commands");
   - None: GPS, depth sensor or map of the gates ("It finds each gate in its own camera image").

   This is a 2 × 2 grid on phones.
4. **The replay and pipeline strip.** Unchanged in function, restyled on the tokens.
5. **Method.** Approach, How it was built and Testing, then Fig. 01 (the bench table) and its notes.

### About

- **Statement.** "About" sits in a narrow left column and the approved paragraph (copy item 9) is set
  large on the right.
- **Ledger.** The record is two columns of hairline rows under a 2 px ink rule:
  - left: Software and autonomy first, then Mechanical design;
  - right: Education, Leadership, Experience, Languages.

  Each skill carries small code tags linking its projects. The tags have aria-labels with the project
  name. The item-number column of the old skills table is gone.
- **Outside engineering.** It is deliberately smaller: a sentence, two figures (390,000+ views,
  5,000+ downloads) and the Unsplash and Instagram links.
- **Film strip.** The contact sheet runs full width underneath, unchanged in behaviour.

### Other sections

E-03, E-02, E-01, Contact and the footer pick up the tokens:
- the sheets' facts become the same header bar;
- `.specs` become the same between-the-rules number row, smaller;
- buttons, tags and segmented controls are rectangular.

They weren't otherwise reworked.

## Fonts

**Geist** (400, 500, 600, 700) for headings, UI and body, and **Geist Mono** (400, 500) for code
tags, data, tools and the email. Both come from Google Fonts via `<link>`, replacing Space Grotesk
and IBM Plex. Tight tracking is used on display sizes: −0.045 em on the h1, −0.03 em on h3 and key
numbers. Body text is 16 px with 1.6 leading.

## Tokens

### Colour roles

| Role | Light | Dark ("night") |
|---|---|---|
| `--bg` page | `#F4F5F7` | `#0A0F16` |
| `--paper` panel | `#FFFFFF` | `#101823` |
| `--panel` inset | `#F7F8FA` | `#142030` |
| `--sunk` header band, tag | `#ECEEF2` | `#1A2638` |
| `--rule` hairline | `#E1E4E9` | `#1E2A3A` |
| `--rule-2` strong hairline | `#C6CCD5` | `#2C3B50` |
| `--ink` | `#0D1B2A` (navy) | `#E8EDF3` |
| `--ink-2` steel | `#364354` | `#B5BFCC` |
| `--muted` | `#586474` (5.4:1 on page) | `#8E99A8` (about 6:1) |
| `--signal` accent | `#FF4F00` | `#FF5A14` |
| `--on-signal` | `#0D1B2A` (both) | `#0D1B2A` |
| `--signal-strong` under white text | `#C23A00` | `#C23A00` |
| `--link` | `#B23400` (6:1 on paper) | `#FF8A50` |
| `--truth` | `#2C6E9C` | `#6FAAD9` |

`--truth` is now a token: `replay.js` reads it, and so do the legend, Fig. 00 and the pipeline strip.

### Type scale

The scale steps by 1.25 from 16 px: 12 (labels), 13 (captions), 14, 16 (body), 20, 25, 31, 39 and
49, with display `clamp(46px, 6.2vw, 84px)`. Key numbers use `clamp(36px, 4.2vw, 56px)`; index
numbers use `clamp(25px, 2.2vw, 31px)`.

### Spacing, radii and elevation

- **Spacing:** 4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Radii:** 4 px (tags, small controls), 6 px (fields, segmented controls), 8 px (panels and
  figures). Capsules (`999px`) are used only for actions, meaning buttons.
- **Elevation:** hairlines do the work. Panels get no shadow, or a 1 px rule-shadow; `--e-2` and
  `--e-3` are kept only for floating things. The glows, the dot grid and the glass are gone (R-03).

## Signature moment, and how it carries information

The results index is the recruiter's ten-second scan: four rows, newest first, with one hard number
each.

- **The exhibit.** Beside the index, under the brief, the exhibit plays Fig. 00 by default: the real
  recorded simulated flight drawing its true path against the drone's own estimate, with a live
  readout. That is E-04's figure, so the E-04 row is marked as the one on show: an orange bar, and its
  code tag lit in orange.
- **Hover and focus.** Pointing at a row, or tabbing to its link, lays that project's figure over the
  exhibit, and the bar and lit tag move to that row (`js/brief-index.js`):
  - E-03 shows the line drawing of the drone from its Fusion model, captioned "47 parts, 246 g
    all-up, on a 38 g generated frame";
  - E-02 shows the robot's isometric drawing from the team's Fusion model;
  - E-01 shows the scatter from Fig. 07's own data on log₁₀ axes, with the least-squares line. It
    computes P ∝ N^0.55 over 603 models, matching Fig. 07.

  Leaving the table returns the exhibit to Fig. 00.
- **What the motion tells the reader.** It always tells them which project the picture belongs to,
  and every picture is real evidence.
- **Readable without it.** The table is the content at frame 0, and works without JS. Images load the
  first time the table is approached. With reduced motion the swap is instant. Below 1000 px, and on
  touch, the overlays are off and the rows link straight to the projects. The hint text changes to
  "Tap a project to read it".

## Deviations from the brief, and why

- **No CV action.** No file exists (conflict 6). The button is commented out, ready.
- **The exhibit is a deviation of placement.** The brief puts the index "under" the hero. I put the
  index beside the brief, and the exhibit under the brief, so the whole brief fits one laptop screen.
  It also gives Fig. 00 (conflict 4's one moving thing that carries information) a home next to the
  result it illustrates. The decorative hero drone is removed.
- **Fig. 00's layout.** It switches to plan-beside-elevation by aspect ratio (`W ≥ 440 and W ≥ 1.35 H`)
  instead of `W ≥ 700`, so it reads side by side in the 490 px exhibit. In stacked mode (phones) the
  plan gets 60% of the height, not 46%.
- **E-02's index number is the word "Climbed".** It isn't a number: the brief names "completed the
  climb" as the hard result, and the only E-02 percentages (22% and 16%) have no stated baseline
  (R-36). So the 16% sits in the context line, not as the headline.
- **Primary button in dark.** It inverts to near-white. I kept this as the single loudest action
  (Email me). If R-24 is read strictly, it could become `--signal-strong` instead.
- **JS changes:**
  - `js/brief-index.js` is new;
  - `main.js` imports it and no longer loads `hero-drone.js`;
  - `hero-flight.js` changes the layout threshold and split;
  - `replay.js` reads `--truth` instead of the hard-coded blue;
  - `theme.js` sets the new `theme-color` values.

  All element IDs used by the modules are kept.

## Known gaps

- **Tests.** The Playwright suite wasn't updated or run against this prototype. These tests will
  likely break: the hero register, `.hero-facts`, the hidden h1 and the `.bom` table.
- **The capture drives layout.** It forces `.sheet { content-visibility: visible }` and a static nav
  for the section captures, so measured offsets are stable. Without that, sheets settled late and the
  About crop landed on E-01.
- **Fig. 02 (E-03's 3D model) and the pinned scrub.** They render blank under SwiftShader in
  full-page captures. This was not investigated, as the section is out of scope.
- **Phone length.** About fits in 2.5 screens only after compacting the phone ledger (15 px items).
  E-04 is still about six phone screens long, because of the replay and the method.
- **Sheets other than E-04.** They have only token-level styling. E-03's specs still show the
  constraint figures R-16 flags.
- **The cursor readout.** It still prints "X … Y … MM" in caps from `js/cursor.js`, which wasn't
  changed.
- **Performance.** Not measured. The page now loads two Geist families instead of three families,
  and the exhibit images (a 9 KB webp and a 162 KB PNG) load only on approach to the table.
