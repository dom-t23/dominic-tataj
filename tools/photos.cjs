// Responsive WebP versions of the photographs in images/photos/ (the JPEGs stay as the fallback):
// images/photos/w/NN-400.webp and NN-600.webp, by height, encoded in headless Chromium.
// Also writes favicon-32.png from favicon.svg. Usage: node tools/photos.cjs
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), IN = path.join(ROOT, "images/photos"), OUT = path.join(IN, "w");
const HEIGHTS = [400, 600], Q = 0.8;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  fs.mkdirSync(OUT, { recursive: true });
  const out = [];
  for (const f of fs.readdirSync(IN).filter((f) => /^\d\d\.jpg$/.test(f)).sort()) {
    const data = "data:image/jpeg;base64," + fs.readFileSync(path.join(IN, f)).toString("base64");
    const res = await p.evaluate(async ({ data, HEIGHTS, Q }) => {
      const im = new Image(); im.src = data; await im.decode();
      return HEIGHTS.filter((h) => h <= im.naturalHeight).map((h) => {
        const w = Math.round(im.naturalWidth * h / im.naturalHeight), c = document.createElement("canvas");
        c.width = w; c.height = h; const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, 0, 0, w, h);
        return { h, w, d: c.toDataURL("image/webp", Q) };
      });
    }, { data, HEIGHTS, Q });
    for (const r of res) {
      const name = f.replace(".jpg", "") + "-" + r.h + ".webp";
      fs.writeFileSync(path.join(OUT, name), Buffer.from(r.d.split(",")[1], "base64"));
      out.push(name + " " + r.w + "x" + r.h);
    }
  }
  // favicon-32.png (transparent corners) and apple-touch-icon.png (180 px, square and opaque, as iOS wants)
  const svg = "data:image/svg+xml;base64," + fs.readFileSync(path.join(ROOT, "favicon.svg")).toString("base64");
  for (const [name, s, bg, pad] of [["favicon-32.png", 32, "transparent", 0], ["apple-touch-icon.png", 180, "#0A0A0B", 18]]) {
    await p.setViewportSize({ width: s, height: s });
    await p.setContent(`<body style="margin:0;background:${bg}"><img style="width:${s - 2 * pad}px;height:${s - 2 * pad}px;margin:${pad}px;display:block" src="${svg}"></body>`);
    await p.screenshot({ path: path.join(ROOT, name), omitBackground: bg === "transparent", clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
  console.log(out.join("\n"));
})();
