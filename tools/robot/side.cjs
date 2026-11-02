// The pipe climber's side elevation, step 3 of 3 (see README): renders tools/robot/side.html
// in headless Chromium with software WebGL and writes images/robot-side-ink.png and -fill.png.
// Usage: node tools/robot/side.cjs   (serves the repo itself on port 8811)
const { chromium } = require("playwright");
const fs = require("fs"), http = require("http"), path = require("path");
const ROOT = path.join(__dirname, "../..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".glb": "model/gltf-binary" };
const srv = http.createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(s);
}).listen(8811, "127.0.0.1");
(async () => {
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  p.on("pageerror", (e) => console.log("ERR", e.message));
  await p.goto("http://127.0.0.1:8811/tools/robot/side.html?pxmm=5");
  await p.waitForFunction(() => /^(ok|error)/.test(document.title), null, { timeout: 180000 });
  console.log(await p.title());
  for (const k of ["ink", "fill"]) {
    const d = await p.evaluate((k) => window["__" + k], k);
    fs.writeFileSync(path.join(ROOT, `images/robot-side-${k}.png`), Buffer.from(d.split(",")[1], "base64"));
  }
  await b.close(); srv.close();
})();
