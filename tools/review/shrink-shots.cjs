// Re-encodes the design-review screenshots (review/<dir>/**/*.png) as JPEGs small enough to commit,
// using this repo's Playwright Chromium, so no image library is needed.
//   node tools/review/shrink-shots.cjs review/baseline review/baseline-jpg [maxWidth=750] [quality=72]
// Tall pages are scaled to maxWidth and split into parts of at most 12000 px (JPEG's limit is 65535).
const { chromium } = require("@playwright/test");
const fs = require("fs"), path = require("path");

const [src, dst, maxW = "750", q = "72"] = process.argv.slice(2);
if (!src || !dst) { console.error("usage: shrink-shots.cjs <srcDir> <dstDir> [maxWidth] [quality]"); process.exit(1); }
const MAX_PART = 12000;

function pngs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? pngs(p) : e.name.endsWith(".png") ? [p] : [];
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let n = 0;
  for (const file of pngs(src)) {
    const rel = path.relative(src, file).replace(/\.png$/, "");
    const out = path.join(dst, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const b64 = fs.readFileSync(file).toString("base64");
    await page.setContent(`<body style="margin:0;background:#fff"><img id=i style="display:block" src="data:image/png;base64,${b64}">`);
    const { w, h } = await page.evaluate(() => new Promise((r) => {
      const i = document.getElementById("i"), f = () => r({ w: i.naturalWidth, h: i.naturalHeight });
      i.complete ? f() : (i.onload = f);
    }));
    const scale = Math.min(1, parseInt(maxW) / w), W = Math.round(w * scale), H = Math.round(h * scale);
    await page.evaluate(([W, H]) => { const i = document.getElementById("i"); i.style.width = W + "px"; i.style.height = H + "px"; }, [W, H]);
    await page.setViewportSize({ width: W, height: Math.min(H, MAX_PART) });
    const parts = Math.ceil(H / MAX_PART);
    for (let k = 0; k < parts; k++) {
      const y = k * MAX_PART, hh = Math.min(MAX_PART, H - y);
      const name = parts > 1 ? `${out}-part${k + 1}.jpg` : `${out}.jpg`;
      await page.screenshot({ path: name, type: "jpeg", quality: parseInt(q), fullPage: true, clip: { x: 0, y, width: W, height: hh } });
      n++;
    }
  }
  await browser.close();
  console.log(`${n} JPEGs written to ${dst}`);
})();
