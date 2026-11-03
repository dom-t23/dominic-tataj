// The hero's drone frames (see README): renders tools/hero/render.html in headless Chromium with
// software WebGL, then saves each frame as lossless WebP in images/hero/ (needs Python with Pillow).
// Usage: node tools/hero/render.cjs   (serves the repo itself on port 8812)
const { chromium } = require("playwright");
const fs = require("fs"), http = require("http"), path = require("path"), os = require("os"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "../.."), OUT = path.join(ROOT, "images/hero");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".glb": "model/gltf-binary" };
const srv = http.createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(s);
}).listen(8812, "127.0.0.1");
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  p.on("pageerror", (e) => console.log("ERR", e.message));
  await p.goto("http://127.0.0.1:8812/tools/hero/render.html");
  await p.waitForFunction(() => /^(ok|error)/.test(document.title), null, { timeout: 600000 });
  console.log(await p.title());
  const frames = await p.evaluate(() => window.__frames);
  await b.close(); srv.close();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hero-"));
  for (const [k, d] of Object.entries(frames)) fs.writeFileSync(path.join(tmp, k + ".png"), Buffer.from(d.split(",")[1], "base64"));
  fs.mkdirSync(OUT, { recursive: true });
  execFileSync("python3", ["-c", `
import sys, glob, os
from PIL import Image
for f in sorted(glob.glob(os.path.join(sys.argv[1], "*.png"))):
    Image.open(f).save(os.path.join(sys.argv[2], os.path.basename(f)[:-4] + ".webp"), lossless=True, method=6)
`, tmp, OUT], { stdio: "inherit" });
  fs.rmSync(tmp, { recursive: true });
  const sizes = fs.readdirSync(OUT).map((f) => fs.statSync(path.join(OUT, f)).size);
  console.log(sizes.length, "frames,", (sizes.reduce((a, n) => a + n, 0) / 1024).toFixed(0), "KB in all");
})();
