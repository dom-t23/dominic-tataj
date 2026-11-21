# Dominic Tataj — portfolio

Engineering portfolio site, hosted with GitHub Pages: https://dom-t23.github.io/dominic-tataj/

No build step: GitHub Pages serves these files as they are (from `main`, at the root).

**Look:** "Exploded view" (redesign, Nov 2026): one dark theme, Geist and Geist Mono
(self-hosted in `fonts/`, OFL), one accent (`#3DDCFF`). Every colour, size, radius, shadow,
easing and duration is a token at the top of `css/site.css`; `node tests/contrast.cjs` checks
the text colours against WCAG AA on each surface.

- `index.html` — the homepage: hero, project cards, the write-ups, About, Contact
- `photography.html` — the photographs, full-bleed, with a lightbox (`js/lightbox.js`)
- `404.html` — GitHub Pages serves it for any missing path (`<base>` keeps its links working)
- `Dominic-Tataj-CV.pdf` — **not in the repo yet**: every CV link points at this path
- `css/site.css` — all styles
- `js/` — ES modules. `main.js` is the homepage's entry point and imports:
  - `hero.js` (the hero's drone, which comes apart as the page scrolls: frames
    `images/hero/x00–x23`, pinned on large screens, a still for reduced motion or Save-Data),
    `cards.js` (the cards' pointer spotlight), `contact.js` (copy email and its burst),
    `sheets.js` (lays every project out once after load, so links down the page land) and
    `reveals.js` (what animates in on scroll; numbers don't count up)
  - `hero-flight.js` (Fig. 00, in E-04: the simulated flight drawn as a plan
    view with its estimate-error trace and readout) and `replay.js` (the drone
    replay), which share the flight data loaded by `flights.js`; `pipeline.js` draws the
    strip under the replay (detect, measure, fuse, fly at the current frame)
  - after the load event: `bench.js` (Fig. 01's chart), `climber.js` (Fig. 04, the pipe
    climber on a corrected version of the team's Excel model), `scaling.js` (Fig. 07, with
    its points in `data/scaling.js`), `hello.js` (the console note), `cursor.js` (the crosshair cursor)
  - `rig-button.js`, which loads `hover-rig.js` (the hover test rig) and `quad.js` (its drone
    model and controller, no DOM) on first use
  - `frame3d-boot.js`, which sets up Fig. 02 and loads `frame3d.js` (the drone in 3D) and
    three.js once the figure is near

  `motion.js` is the animation toolkit (one-shot reveals and on-screen-only loops) and
  `util.js` holds shared helpers. `vendor/three/` is three.js r170 and the four addons Fig. 02
  uses, unchanged; the import map in `index.html` points the addons' `"three"` at it.
- `models/frame.glb` — the drone for Fig. 02: the Fusion assembly exported as OBJ, converted
  to glTF (metres, Y up), simplified and meshopt-compressed (47 parts, 187 KB)
- `models/pipe-climber.glb` — the pipe climber, from the team's Fusion STL (168 parts,
  simplified within 1 mm, 575 KB). The page doesn't load it: Fig. 04 draws it in
  isometric from `images/robot-iso-ink.png` and `-fill.png`, used as two CSS masks
- `flights/` — recorded flights for the drone-racing replay: `index.js` lists them and holds
  the still shown before LOAD, and each flight's frames (0.5-1.6 MB) load only when it is picked
- `images/` — project images; `images/hero/x00–x23.webp` are the hero's 24 frames (611 KB,
  drawn from `models/frame.glb` by `node tools/hero/explode.cjs`); `images/photos/` holds the
  eight photographs (600 px tall, without metadata) and `images/photos/w/` their WebP sizes
  (`node tools/photos.cjs`, which also renders the PNG icons)
- `og-image.png`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `site.webmanifest` —
  link preview and icons; the preview is rendered from `tools/og/og.html` by `node tools/og/render.cjs`
- `DESIGN_PLAN.md`, `IMPROVEMENTS.md` — work plans
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

Fig. 07's points come from the dataset in Dom's ENGF0003 coursework:

    python3 tools/scaling_data.py path/to/dataset2.csv          # writes js/data/scaling.js

The pipe climber's model and drawing come from the Fusion STL in three steps (trimesh for
the first; @gltf-transform/core, /extensions, /functions 4.x and meshoptimizer for the
second; this repo's Playwright for the third). Each reproduces the committed file exactly:

    python3 tools/robot/stl_to_glb.py Pipe_Climber.stl robot-raw.glb   # parts, metres, Y up, no pipe stub
    node tools/robot/web_glb.mjs robot-raw.glb models/pipe-climber.glb  # simplify, meshopt
    node tools/robot/iso.cjs                                            # writes images/robot-iso-*.png

The hero's frames are drawn from `models/frame.glb` with Fig. 02's shaders and explode moves
(`js/frame3d.js`), as accent lines on dark surfaces; Chromium encodes the WebP, so no Python is needed.
Arguments: width, height, frames, quality (`GLOW=0` leaves the glow to CSS, as the page does):

    GLOW=0 node tools/hero/explode.cjs 960 720 24 0.72                  # writes images/hero/x*.webp

Drone-racing source: https://github.com/dom-t23/vision-drone-racing
