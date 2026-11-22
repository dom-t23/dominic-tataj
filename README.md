# Dominic Tataj — portfolio

Engineering portfolio site, hosted with GitHub Pages: https://dom-t23.github.io/dominic-tataj/

No build step: GitHub Pages serves these files as they are (from `main`, at the root).

**Look:** dark by default with a light mode (the nav's toggle, `js/theme.js`, saved per visitor), warm and typeset (Nov 2026): Source Serif 4 for headings, IBM Plex Sans for text and
IBM Plex Mono for numbers (self-hosted in `fonts/`, OFL); warm graphite with one accent, the orange of the
simulator's gates, marking what is Dom's and what can be pressed. It deliberately avoids the common
"AI-generated" defaults (gradient text, glows, glass, pills, eyebrow labels, card grids, fade-in-everything);
`tests/redesign.spec.js` fails if they creep back. Every value is a token at the top of `css/site.css`;
`node tests/contrast.cjs` checks the text colours against WCAG AA on each surface.

- `index.html` — the homepage: hero, the project index, About, Contact
- `drone-racing.html`, `drone-frame.html`, `pipe-climber.html`, `ai-scaling.html` — a page per project (E-04 to E-01),
  each with its own link preview in `og/` (`node tools/og/projects.cjs`, from the running figures). They were
  split out of `index.html` by `tools/split_projects.py` (a one-off, kept as the record); edit them directly.
  Old links to `#e-04` and the like redirect to the pages. Every page has the Work menu (`js/menu.js`).
- `photography.html` — the photographs, full-bleed, with a lightbox (`js/lightbox.js`)
- `404.html` — GitHub Pages serves it for any missing path (`<base>` keeps its links working)
- `Dominic-Tataj-CV.pdf` — **not in the repo yet**: every CV link points at this path
- `css/site.css` — all styles, including a print stylesheet (the homepage prints as a summary)
- `js/` — ES modules. `main.js` is the homepage's entry point (theme, menu, hero, contact); `project.js` is a
  project page's, and loads each figure's module only where that figure is (`more.js` folds long sections on
  phones). Between them they use:
  - `theme.js` (the light/dark toggle; the saved theme is applied by an inline script before first paint),
    `hero.js` (the hero's drone, which comes apart as the page scrolls: frames
    `images/hero/x00–x95`, and `l00–l95` in light mode, pinned on large screens, a still for reduced motion or Save-Data),
    `contact.js` (copy email and its burst),
    `sheets.js` (lays every project out once after load, so links down the page land) and
    `reveals.js` (what animates in on scroll; numbers don't count up)
  - `hero-flight.js` (Fig. 00, in E-04: the simulated flight drawn as a plan
    view with its estimate-error trace and readout) and `replay.js` (the drone
    replay), which share the flight data loaded by `flights.js`; `pipeline.js` draws the
    strip under the replay (detect, measure, fuse, fly at the current frame)
  - after the load event: `bench.js` (Fig. 01's chart), `climber.js` (Fig. 05, the pipe
    climber on a corrected version of the team's Excel model), `scaling.js` (Fig. 08, with
    its points in `data/scaling.js`), `hello.js` (the console note), `cursor.js` (the crosshair cursor)
  - `rig-button.js`, which loads `hover-rig.js` (the hover test rig) and `quad.js` (its drone
    model and controller, no DOM) on first use
  - `frame3d-boot.js`, which sets up Fig. 02 and loads `frame3d.js` (the drone in 3D, V2 first, V1 on its button) and
    three.js once the figure is near

  `motion.js` is the animation toolkit (one-shot reveals and on-screen-only loops) and
  `util.js` holds shared helpers. `vendor/three/` is three.js r170 and the four addons Fig. 02
  uses, unchanged; the import map in `index.html` points the addons' `"three"` at it.
- `models/frame-v2.glb` — the V2 drone for Fig. 02 and the hero: the Fusion assembly exported as OBJ, its bodies
  named by `tools/frame/v2-parts.json`, simplified to 0.25 mm and meshopt-compressed (29 parts, 220 KB)
- `models/frame.glb` — the V1 drone for Fig. 02: the Fusion assembly exported as OBJ, converted
  to glTF (metres, Y up), simplified and meshopt-compressed (47 parts, 187 KB)
- `models/pipe-climber.glb` — kept locally, not in the repo (git ignores it): the pipe climber from the team's
  Fusion STL (168 parts, 575 KB), which `tools/robot/` turns into `images/robot-iso-ink.png` and `-fill.png`,
  the two CSS masks Fig. 05 draws it with
- `flights/` — recorded flights for the drone-racing replay: `index.js` lists them and holds
  the still shown before LOAD, and each flight's frames (0.5-1.6 MB) load only when it is picked
- `images/` — project images; `images/hero/x00–x95.webp` are the hero's 96 frames (2.7 MB, loaded after the page, four at a time,
  drawn from `models/frame-v2.glb` by `node tools/hero/explode.cjs`); `images/photos/` holds the
  eight photographs (600 px tall, without metadata) and `images/photos/w/` their WebP sizes
  (`node tools/photos.cjs`, which also renders the PNG icons)
- `og-image.png`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `site.webmanifest` —
  link preview and icons; the preview is rendered from `tools/og/og.html` by `node tools/og/render.cjs`
- Planning notes (`DESIGN_PLAN.md`, `IMPROVEMENTS.md`, `TODO.md`, `REVIEW.md`) are kept locally and ignored by git,
  so they aren't published with the site
- `tests/`, `playwright.config.js`, `package.json` — browser tests (not part of the site); `tests/serve.cjs` is the
  tests' static server (gzip, no dependencies), and `tests/review-*.spec.js` capture the design
  review's screenshots and metrics into `review/` (kept out of the repo)

To view it locally, serve the folder (ES modules don't load from `file://`):

    node tests/serve.cjs 8000      # then open http://localhost:8000 (gzips like GitHub Pages)
    python3 -m http.server 8000    # also fine

Tests (Playwright, Chromium):

    npm install && npx playwright install chromium   # first time only
    npm test            # structure, hero and its flight log, rig, 3D frame, replay and its strip, benchmark, climb, scatter, photos, quirks, contact, motion; then performance, on its own
    npm run screens     # review screenshots in test-results/screens/, and the design review's captures (into `review/`, not committed)

`npm test` runs on two workers: Fig. 02 renders three.js in software WebGL, which is CPU-heavy.

To re-record the replay, fly the courses from a checkout of the drone-racing repo (it needs
that repo's requirements: numpy, opencv-python-headless, scipy). This runs its simulator and
flight stack unchanged and also records each stage's output for the pipeline strip:

    python3 tools/export_flights.py path/to/vision-drone-racing    # writes flights/

Fig. 01's numbers come from that repo's committed results files:

    python3 tools/benchmark_table.py path/to/vision-drone-racing   # prints the table rows

(`tools/split_flights.py` still splits a `flights.js` from `python -m vdr.demo`, without the
pipeline fields.)

Fig. 08's points come from the dataset in Dom's ENGF0003 coursework:

    python3 tools/scaling_data.py path/to/dataset2.csv          # writes js/data/scaling.js

The pipe climber's model and drawing come from the Fusion STL in three steps (trimesh for
the first; @gltf-transform/core, /extensions, /functions 4.x and meshoptimizer for the
second; this repo's Playwright for the third). Each reproduces the committed file exactly:

    python3 tools/robot/stl_to_glb.py Pipe_Climber.stl robot-raw.glb   # parts, metres, Y up, no pipe stub
    node tools/robot/web_glb.mjs robot-raw.glb models/pipe-climber.glb  # simplify, meshopt
    node tools/robot/iso.cjs                                            # writes images/robot-iso-*.png

The hero's frames are drawn from `models/frame-v2.glb` with Fig. 02's shaders and explode moves
(`js/frame3d.js`), in neutral ink with the frame redrawn in the accent; Chromium encodes the WebP, so no
Python is needed. Arguments: width, height, frames, quality; colours as hex without `#`:

    GLOW=0 INK=A89F93 FILL=141311 FRAME=FF6A2B node tools/hero/explode.cjs 960 720 96 0.72             # dark: x*.webp
    PREFIX=l GLOW=0 INK=6E675C FILL=F4F1EA FRAME=C2410C node tools/hero/explode.cjs 960 720 96 0.72    # light: l*.webp

`OUT=folder` writes the frames somewhere else first, to look at them before they replace the committed ones.

The V2 drone's model comes from Fusion's OBJ export of the assembly in two steps (numpy for the
first; the same @gltf-transform packages and meshoptimizer as the pipe climber for the second). A new
export needs every `Body…` group named in `tools/frame/v2-parts.json`; the first step stops on any it can't name:

    python3 tools/frame/obj_to_glb.py "Lowres frame 2.obj" frame-v2-raw.glb   # part names, metres, Y up
    node tools/frame/web_glb.mjs frame-v2-raw.glb models/frame-v2.glb           # weld, simplify to 0.25 mm, meshopt

Drone-racing source: https://github.com/dom-t23/vision-drone-racing
