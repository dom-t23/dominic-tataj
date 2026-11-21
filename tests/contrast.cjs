// WCAG contrast of the design tokens' text colours on each surface they sit on.
// Reads the :root block of css/site.css; fails (exit 1) if any pair is under AA (4.5:1 for body text).
// Usage: node tests/contrast.cjs
const fs = require("fs"), path = require("path");
const css = fs.readFileSync(path.join(__dirname, "../css/site.css"), "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const tok = {};
for (const m of root.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{6})/g)) tok[m[1]] = m[2];
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const texts = ["ink", "ink-2", "muted", "signal", "link", "truth", "ok", "bad"];
const surfaces = ["bg", "raised", "panel"];
let fail = 0;
for (const s of surfaces) {
  for (const t of texts) {
    const r = ratio(tok[t], tok[s]);
    if (r < 4.5) fail++;
    console.log(`${("--" + t).padEnd(9)} on --${s.padEnd(7)} ${r.toFixed(2).padStart(6)}:1 ${r < 4.5 ? "FAIL" : "ok"}`);
  }
}
const r = ratio(tok["on-signal"], tok.signal);
console.log(`--on-signal on --signal  ${r.toFixed(2)}:1 ${r < 4.5 ? "FAIL" : "ok"}`);
if (r < 4.5) fail++;
process.exit(fail ? 1 : 0);
