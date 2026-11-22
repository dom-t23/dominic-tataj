// Renders tools/hero/explode.html in headless Chromium (software WebGL) and writes the hero's
// frames to images/hero/x00.webp ... (WebP with alpha, encoded by Chromium; no Python needed).
// Usage: [OUT=folder] [PREFIX=x] [GLOW=0] [INK=hex] [FILL=hex] [FRAME=hex] node tools/hero/explode.cjs [width] [height] [frames] [quality]
// (hex without #; serves the repo on port 8813)
const { chromium } = require("playwright");
const fs = require("fs"), http = require("http"), path = require("path");
const ROOT = path.join(__dirname, "../.."), OUT = process.env.OUT || path.join(ROOT, "images/hero");   // OUT: somewhere else, to look first
const [W = 1280, H = 960, N = 36, QL = 0.8] = process.argv.slice(2).map(Number);
const PREFIX = process.env.PREFIX || "x";   // x: the dark theme's frames, l: the light theme's
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".glb": "model/gltf-binary" };
const srv = http.createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(s);
}).listen(8813, "127.0.0.1");
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: 400, height: 300 } });
  p.on("pageerror", (e) => console.log("ERR", e.message));
  await p.goto(`http://127.0.0.1:8813/tools/hero/explode.html?w=${W}&h=${H}&n=${N}&q=${QL}&glow=${process.env.GLOW ?? "1"}&ink=${process.env.INK || "3DDCFF"}&fill=${process.env.FILL || "0D0E11"}&frame=${process.env.FRAME || ""}`);
  await p.waitForFunction(() => /^(ok|error)/.test(document.title), null, { timeout: 900000 });
  console.log(await p.title());
  const frames = await p.evaluate(() => window.__frames);
  await b.close(); srv.close();
  if (!frames) process.exit(1);
  fs.mkdirSync(OUT, { recursive: true });
  fs.readdirSync(OUT).filter((f) => new RegExp("^" + PREFIX + "\\d\\d\\.webp$").test(f)).forEach((f) => fs.unlinkSync(path.join(OUT, f)));
  let total = 0;
  for (const [k, d] of Object.entries(frames)) {
    const buf = Buffer.from(d.split(",")[1], "base64"); total += buf.length;
    fs.writeFileSync(path.join(OUT, k.replace(/^x/, PREFIX) + ".webp"), buf);
  }
  console.log(Object.keys(frames).length, "frames,", (total / 1024).toFixed(0), "KB in all");
})();
