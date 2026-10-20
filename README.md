# Dominic Tataj — portfolio

Engineering portfolio site, hosted with GitHub Pages: https://dom-t23.github.io/dominic-tataj/

- `index.html` — the whole site (HTML, CSS and JS in one file)
- `flights/` — recorded flights for the drone-racing replay: `index.js` lists them, and each
  flight's frames (about 1 MB) load only when it is picked
- `og-image.png`, `favicon.svg`, `apple-touch-icon.png` — link preview and icons

To update the replay, regenerate `flights.js` in the drone-racing repo (`python -m vdr.demo`),
then split it here:

    python3 tools/split_flights.py path/to/vision-drone-racing/docs/demo/flights.js

Drone-racing source: https://github.com/dom-t23/vision-drone-racing
