# Dominic Tataj — portfolio

Engineering portfolio site, hosted with GitHub Pages: https://dom-t23.github.io/dominic-tataj/

No build step: GitHub Pages serves these files as they are.

- `index.html` — the page's markup
- `css/site.css` — all styles
- `js/` — ES modules: `main.js` is the entry point and imports `theme.js` (light/dark
  toggle), `contact.js` (copy email and its burst) and `replay.js` (drone replay);
  `util.js` holds shared helpers
- `flights/` — recorded flights for the drone-racing replay: `index.js` lists them and holds
  the still shown before LOAD, and each flight's frames (about 1 MB) load only when it is picked
- `images/` — project images
- `og-image.png`, `favicon.svg`, `apple-touch-icon.png` — link preview and icons
- `DESIGN_PLAN.md`, `IMPROVEMENTS.md` — work plans

To view it locally, serve the folder (ES modules don't load from `file://`):

    python3 -m http.server 8000    # then open http://localhost:8000

To update the replay, regenerate `flights.js` in the drone-racing repo (`python -m vdr.demo`),
then split it here:

    python3 tools/split_flights.py path/to/vision-drone-racing/docs/demo/flights.js

Drone-racing source: https://github.com/dom-t23/vision-drone-racing
