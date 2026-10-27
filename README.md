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
  - `bench.js` (Fig. 03: the benchmark table's columns chart and sort)
  - `rig-button.js`, which loads `hover-rig.js` (the hover test rig) and `quad.js` (its drone
    model and controller, no DOM) on first use
  - `frame3d-boot.js`, which sets up Fig. 01 and loads `frame3d.js` (the drone in 3D) and
    three.js once the figure is near

  `motion.js` is the animation toolkit (one-shot reveals and on-screen-only loops) and
  `util.js` holds shared helpers. `vendor/three/` is three.js r170 and the four addons Fig. 01
  uses, unchanged; the import map in `index.html` points the addons' `"three"` at it.
- `models/frame.glb` — the drone for Fig. 01: the Fusion assembly exported as OBJ, converted
  to glTF (metres, Y up), simplified and meshopt-compressed (47 parts, 187 KB)
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
    npm test            # structure, hero, rig, 3D frame, replay and its strip, benchmark, contact, motion, performance
    npm run screens     # review screenshots in test-results/screens/

To re-record the replay, fly the courses from a checkout of the drone-racing repo (it needs
that repo's requirements: numpy, opencv-python-headless, scipy). This runs its simulator and
flight stack unchanged and also records each stage's output for the pipeline strip:

    python3 tools/export_flights.py path/to/vision-drone-racing    # writes flights/

Fig. 03's numbers come from that repo's committed results files:

    python3 tools/benchmark_table.py path/to/vision-drone-racing   # prints the table rows

(`tools/split_flights.py` still splits a `flights.js` from `python -m vdr.demo`, without the
pipeline fields.)

Drone-racing source: https://github.com/dom-t23/vision-drone-racing
