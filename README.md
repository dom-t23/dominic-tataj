# Dominic Tataj — portfolio

Engineering portfolio site, hosted with GitHub Pages: https://dom-t23.github.io/dominic-tataj/

No build step: GitHub Pages serves these files as they are.

- `index.html` — the page's markup
- `css/site.css` — all styles
- `js/` — ES modules. `main.js` is the entry point and imports:
  - `theme.js` (light/dark toggle), `contact.js` (copy email and its burst), `sheets.js`
    (the nav's sheet counter and progress) and `reveals.js` (what animates in on scroll and
    which numbers count up)
  - `hero-flight.js` (the hero's flight-test strip, Fig. 00) and `replay.js` (the drone
    replay), which share the flight data loaded by `flights.js`; `pipeline.js` draws the
    strip under the replay (detect, measure, fuse, fly at the current frame)
  - after the load event: `bench.js` (Fig. 03's chart), `climber.js` (Fig. 04, the pipe
    climber on a corrected version of the team's Excel model), `scaling.js` (Fig. 07, with
    its points in `data/scaling.js`) and small quirks, `acro.js` (type
    fpv), `hello.js` (the console note), `cursor.js` (the drafting cursor) and `clouds.js`
    (revision clouds on project titles); the theme wipe is in `theme.js` and the approval box
    in `contact.js`
  - `rig-button.js`, which loads `hover-rig.js` (the hover test rig) and `quad.js` (its drone
    model and controller, no DOM) on first use
  - `frame3d-boot.js`, which sets up Fig. 01 and loads `frame3d.js` (the drone in 3D) and
    three.js once the figure is near

  `motion.js` is the animation toolkit (one-shot reveals and on-screen-only loops) and
  `util.js` holds shared helpers. `vendor/three/` is three.js r170 and the four addons Fig. 01
  uses, unchanged; the import map in `index.html` points the addons' `"three"` at it.
- `models/frame.glb` — the drone for Fig. 01: the Fusion assembly exported as OBJ, converted
  to glTF (metres, Y up), simplified and meshopt-compressed (47 parts, 187 KB)
- `models/pipe-climber.glb` — the pipe climber, from the team's Fusion STL (168 parts,
  simplified within 1 mm, 575 KB). The page doesn't load it: Fig. 04 draws it in
  isometric from `images/robot-iso-ink.png` and `-fill.png`, used as two CSS masks
- `flights/` — recorded flights for the drone-racing replay: `index.js` lists them and holds
  the still shown before LOAD, and each flight's frames (0.5-1.6 MB) load only when it is picked
- `images/` — project images
- `og-image.png`, `favicon.svg`, `apple-touch-icon.png` — link preview and icons
- `DESIGN_PLAN.md`, `IMPROVEMENTS.md` — work plans
- `tests/`, `playwright.config.js`, `package.json` — browser tests (not part of the site)

To view it locally, serve the folder (ES modules don't load from `file://`):

    python3 -m http.server 8000    # then open http://localhost:8000

Tests (Playwright, Chromium):

    npm install && npx playwright install chromium   # first time only
    npm test            # structure, hero, rig, 3D frame, replay and its strip, benchmark, climb, scatter, quirks, contact, motion, performance
    npm run screens     # review screenshots in test-results/screens/

To re-record the replay, fly the courses from a checkout of the drone-racing repo (it needs
that repo's requirements: numpy, opencv-python-headless, scipy). This runs its simulator and
flight stack unchanged and also records each stage's output for the pipeline strip:

    python3 tools/export_flights.py path/to/vision-drone-racing    # writes flights/

Fig. 03's numbers come from that repo's committed results files:

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

Drone-racing source: https://github.com/dom-t23/vision-drone-racing
