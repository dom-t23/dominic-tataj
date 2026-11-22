// The project pages' link previews: og/<slug>.png (1200 × 630). Each uses a figure from its own
// page, captured from the running figure, beside the project's number, title and result.
// Needs the site served locally (any static server on the repo):
//   node tests/serve.cjs 8123 &   then   node tools/og/projects.cjs [http://127.0.0.1:8123/]
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "../.."), OUT = path.join(ROOT, "og"), BASE = process.argv[2] || "http://127.0.0.1:8123/";
const P = [
  { slug: "drone-racing", no: "E-04", title: "Vision-based autonomous drone racing", res: "<b>98.6%</b> of gates by camera, with clutter, over 300 seeded courses; no GPS or map.",
    shoot: { sel: "#flight .fv", wait: 9000 }, framed: 1 },
  { slug: "drone-frame", no: "E-03", title: "Generative FPV drone frame", res: "A <b>38 g</b> printed frame keeps the drone at <b>246 g</b>, under the CAA's 250 g; 36% lighter.",
    file: "images/hero/x15.webp" },
  { slug: "pipe-climber", no: "E-02", title: "Pipe-climbing robot, IMechE Design Challenge", res: "<b>Completed the climb.</b> The drivetrain was picked by simulation from more than 20 setups.",
    shoot: { sel: "#climb-stage", wait: 1500, click: "#cl-run", after: 3000 }, framed: 1 },
  { slug: "ai-scaling", no: "E-01", title: "AI training-power scaling analysis", res: "<b>P ∝ N<sup>0.55</sup></b> across 358 models (R² 0.44); GPT-5 at about 590 kW.",
    shoot: { sel: "#scaling-fig .plate", wait: 4000 }, framed: 1 },
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
  const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "og-"));
  for (const p of P) {
    let img;
    if (p.shoot) {
      const pg = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
      await pg.goto(BASE + p.slug + ".html", { waitUntil: "networkidle" });
      const el = pg.locator(p.shoot.sel);
      await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(p.shoot.wait);
      if (p.shoot.click) { await pg.click(p.shoot.click); await pg.waitForTimeout(p.shoot.after); }
      img = path.join(tmp, p.slug + ".png"); await el.screenshot({ path: img }); await pg.close();
    } else img = path.join(ROOT, p.file);
    const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
    const q = new URLSearchParams({ no: p.no, title: p.title, res: p.res, img: "file:///" + img.replace(/\\/g, "/"), framed: p.framed ? "1" : "" });
    await pg.goto("file:///" + path.join(__dirname, "project.html").replace(/\\/g, "/") + "?" + q, { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
    await pg.screenshot({ path: path.join(OUT, p.slug + ".png") }); await pg.close();
    console.log("og/" + p.slug + ".png");
  }
  fs.rmSync(tmp, { recursive: true }); await b.close();
})();
