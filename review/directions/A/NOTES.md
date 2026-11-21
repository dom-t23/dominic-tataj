# Direction A, "Flight log": prototype notes

Worktree `C:\Users\domin\dt-dir-A`, branch `proto/dir-A`. Served on 127.0.0.1:4174 for the captures.
Capture script: `review/scratch/dir-A/capture.cjs` (run from the main repo with node).

## What I built

The page reads like a test report from a flight-test engineer. Type is big and tight, numbers are set
as numbers, and there are no cards. Sections sit on the page under a heavy 2 px ink rule. The project
number and its metadata sit in a wide margin column on the left of a 12-column grid. The only raised
objects are the two interactive figures: Fig. 00 in the hero and E-04's replay.

- **Hero.** The h1 is visible and holds the name at display size ("Dominic / Tataj", Archivo
  semi-expanded 700) plus the role line from copy item 2 ("Software, autonomy and systems" / "MEng, UCL").
  Under it:
  - the lede (copy item 1);
  - availability as a typeset spec list (`<dl>`, label and value on hairline rows): looking for,
    available from, "Full right to work in the UK", based, and "Second-year, graduating 2029,
    predicted 2:1";
  - two rectangular actions: "Email me" (mailto) and "See the lead project".

  On the right is Fig. 00, the flight log (see Signature). On phones the spec list and actions move
  above the lede (CSS `order`), so name, role, availability, right to work and the email action all
  fit in the first 812 px screen. The CV button markup is left commented out (no file exists).
- **Projects contents list** under the hero. It's a hairline table with one result per project,
  newest first: E-04 "98.6% of gates, with clutter", E-03 "36% lighter, 246 g all-up", E-02 "Completed
  the climb", and E-01 "P ∝ N^0.55". E-01 is retitled "AI training-power scaling" (COPY-09).
- **E-04 comes first**, before E-03 in the markup. It has:
  - its margin metadata as a `<dl>`, sticky on desktop, collapsing to one wrapped line on phones;
  - the title from copy item 7;
  - key figures straight under the summary: 99.8% clean (camera + IMU), 98.6% with gate-coloured
    clutter (camera + IMU), 97.5% with clutter (camera only), and "None: GPS, depth sensor or map of
    the gates", with a note that the rates are pooled over 300 seeded courses;
  - the replay and pipeline strip, raised;
  - then the method, build and testing prose, and the benchmark table (now Fig. 01; figures are
    renumbered in page order).

  Before LOAD, the readout shows the poster frame's real values ("Course 1 · camera + IMU", gates,
  speed, estimate error) instead of four dashes.
- **About.** The margin column holds the h2. The main column has the approved About paragraph
  (copy item 9) set large, then two columns:
  - "Skills and experience" as hairline rows, grouped Education, Software and autonomy (first),
    Mechanical design, Leadership, Experience, Languages. Each skill links its project code, and the
    item-number column is gone.
  - "Outside engineering" with the Unsplash figures set in mono.

  The film strip runs the width of the main column underneath. On phones the skills table becomes
  one flex row per skill, so it fits without sideways scroll.
- **Other sections** are restyled on the same tokens so they aren't broken. Along the way:
  - E-03 and E-02 summaries now lead with the result (copy items 6 and 8);
  - stat labels follow COPY-10;
  - the reset button reads "Reset to team's setup";
  - the SVG labels in Fig. 03, 05 and 06 are in sentence case with correct unit symbols;
  - the Contact line follows copy item 10, and the email is a `mailto:` link;
  - meta, title and OG follow copy item 3 and COPY-01.

## Fonts

From Google Fonts via `<link>`:
- **Archivo** (variable, `wdth` 100–125, `wght` 500–800) for headings: `font-stretch` 118% at
  display sizes, 108% for smaller headings.
- **IBM Plex Sans** 400/500/600 for text.
- **IBM Plex Mono** 400/500 for every number and data value (key figures, readouts, the table,
  project codes, the email).

## Tokens

- **Colour, light:**

  | Token | Value | Role |
  |---|---|---|
  | `--bg` | `#F7F6F3` | Page |
  | `--raised` | `#FFFFFF` | Interactive figures only |
  | `--panel` | `#EEECE7` | Panel |
  | `--ink` | `#101214` | Ink |
  | `--ink-2` | `#3E444B` | Graphite |
  | `--muted` | `#5F656C` | Muted text, about 5.5:1 on the page |
  | `--rule` | ink at 14% | Hairlines |
  | `--rule-strong` | ink | Section rules |
  | `--signal` | `#FF4F00` | Data and the active state only |
  | `--signal-strong` | `#C23A00` | |
  | `--on-signal` | `#101214` | Same in both themes; the Load button is ink on orange |
  | `--link` | `#B23500` | |
  | `--truth` | `#1F5E8C` | True-path blue, now a token |
  | `--ok` | `#2B7049` | |
  | `--bad` | `#B0342A` | |

  Links are ink with a 35% underline that turns orange on hover.
- **Colour, dark:** `--bg #0E1012`, `--raised #181B1F`, `--panel #1F2327` (surfaces step up
  visibly), `--ink #ECEDEE`, `--muted #959BA3`, `--signal #FF5A14`, `--truth #6CB0E8`.
- **Type scale (1.25 from 17 px):** 13.5, 17, 21, 26.5, 33, 41.5, 52, 65, 81, 101 px (`--fs-0` to
  `--fs-9`). The h1 is 101 px on desktop, 81 on tablet and 60 on phones (the one off-scale step,
  chosen so "Dominic" fits 335 px). Project titles are 41.5 px on desktop, 33 on tablet and 26.5 on
  phones. Body is 17 px.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px (`--s-1` to `--s-10`); gutter 24 px.
- **Radii:** 0 for the page, 3 px for controls and buttons (`--r-1`), 6 px for raised figures (`--r-2`).
  There are no capsules anywhere.
- **Elevation:** one shadow, `--lift`, used only by `.flight` and `.player`.

## Signature moment and the information it carries

Fig. 00 draws the real simulated flight (`flights/index.js`, poster `1017-default`: course 1, camera
+ IMU) as a plan view beside the name, at 3× speed:
- **The plan.** The true path is solid blue and the drone's own estimate is dashed orange, with an
  orange ring at the current estimate. The next gate is orange and passed gates turn grey. There is
  a 5 m grid and scale bar.
- **The orientation.** The plan is turned to the course's principal axis, so the 60 m course runs
  left to right across the figure. A plan view has no "up", and the scale stays uniform.
- **The strip chart** under the plan plots the estimate's error over the flight, with ticks where
  gates were passed. It shows the estimate re-converging after each spike.
- **The readout** is HTML in tabular mono: time, gate n of 8, speed, estimate error. When the flight
  ends it settles to the result: "Completed: 8 of 8 gates", 10.89 s, mean speed 5.8 m/s and mean
  estimate error 0.12 m. All of these are computed from the recorded frames, and the loop stops.
- **Accuracy.** The caption is the corrected one: a simulated flight, camera + IMU, never
  "vision-only" or "flight test".
- **Interactions kept.** Replay, the hover rig (its caption now says "a planar model of my 246 g
  drone (E-03)", matching `js/quad.js`) and the acro-mode spin all still work.
- **Reduced motion** draws the finished flight at once.

## Deviations from the brief, and why

- **The hero drone drawing is removed** rather than moved onto E-03; E-03 was out of scope. It needs
  a static place in E-03, because `hero-drone.js` animates relative to the top of the page.
- **No elevation view in Fig. 00.** The card-turn into elevation and its "PLAN / ELEVATION" tags
  were drawing-set vocabulary. The strip chart carries more information in that space.
- **Small JS changes**, all needed to meet the brief:
  - `hero-flight.js` is rewritten as described above;
  - `reveals.js` drops count-ups;
  - `pipeline.js`, `bench.js` and `cursor.js` drop upper-casing, so units are correct ("m", "mm");
  - `replay.js` reads `--truth` and fills the readout from the poster frame;
  - `theme.js` says "Dark mode" / "Light mode".

  The theme button is no longer `hidden` before JS (R-18). All element IDs that the modules use are
  kept.
- **Wording outside the pre-approved list:**
  - E-04's role line, "Solo; set the design and test rules, directed an AI coding agent" (COPY-13);
  - the About skills rows for computer vision, state estimation and testing (COPY-15);
  - the contents-list results (COPY-09).

  Each restates facts already in `index.html`. The mean speed and mean estimate error in Fig. 00's
  final readout are computed live from the repo's flight data. They aren't typed in.
- **Captures.** The fold captures wait (up to 8 s more) until Fig. 00 reads "Completed", so the
  still shows the whole flight. Section captures scroll their section into view first, so lazy film
  photos load. Before each full-page clip they freeze `vh`-based heights (Fig. 02's pinned track) and
  turn off `content-visibility`, because Playwright's full-page capture otherwise reflows the page
  under the clip.

## Known gaps

- **Not styled for this direction:** the hover rig (still uppercase labels inside its SVG), Fig. 02
  (3D) and Fig. 04 (climber). E-03, E-02 and E-01 are only re-tokened.
- **Phone fold:** Fig. 00 starts just below the first screen. The phone hero shows the facts first;
  the flight is the first thing on scroll.
- **Readout labels:** on a 375 px phone, "Estimate error" in the replay readout wraps to two lines.
- **Console errors in one capture:** in the last desktop-dark run, the console logged negative SVG
  sizes (ellipse rx, rect width). They appeared only after the capture script froze Fig. 02's
  heights, and earlier runs of the same page logged none, so they look like a capture artefact, but
  this wasn't confirmed.
- **Tests not run or updated:** `tests/hero.spec.js` asserts the old uppercase readout and
  elevation view, and other specs assert old copy and figure numbers.
- **Unchanged content:**
  - E-04 still says "Aug–Oct 2026" next to "In development" (needs Dom);
  - E-01's 358 vs 603 models is unresolved;
  - there is no CV link.
- **Performance:** the Archivo variable font adds a request, and no metric-matched fallback or
  preload has been tuned.
