// Pipeline strip under the replay (js/pipeline.js) and the filter's ellipse on the top view.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors, controlsReady } = require("./helpers");

const panel = (page, k) => page.locator("#pp-" + k);
const said = (page, k) => panel(page, k).locator(".pp-r").textContent();
async function seek(page, i) {
  await page.locator("#scrub").evaluate((s, i) => { s.value = String(i); s.dispatchEvent(new Event("input")); }, i);
}
async function loaded(page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.click("#load"); await controlsReady(page);
  await page.click("#play");   // pause: frames are picked with the scrubber
}

test("before LOAD, the strip shows the poster's frame", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".player").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForFunction(() => document.querySelector("#pv-map .rest").hidden);
  for (const k of ["detect", "measure", "fuse", "fly"]) {
    await expect(panel(page, k)).toHaveClass(/\bon\b/);
    expect(await said(page, k)).not.toBe("–");
  }
  expect(errors).toEqual([]);
});

test("each stage reports what it did in that frame", async ({ page }) => {
  await loaded(page);
  await seek(page, 30);   // course 1, tracking gate 1 from 3 m
  await expect(panel(page, "detect")).toHaveClass(/\bon\b/);
  await expect(panel(page, "detect").locator(".pp-r")).toHaveText(/^\d+ OUTLINES?, \d+ OPENINGS?$/);
  await expect(panel(page, "measure").locator(".pp-r")).toHaveText(/^OUTLINE \d+\.\d M · /);
  await expect(panel(page, "fuse").locator(".pp-r")).toHaveText(/^FUSED · σ \d\.\d\d M · ERROR \d\.\d\d M$/);
  await expect(panel(page, "fly").locator(".pp-r")).toHaveText(/^THRUST \d\.\d\d G · RATES /);
  // the colour mask is drawn: some of the canvas is ink
  const ink = await panel(page, "detect").locator("canvas").evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 100) n++; return n;
  });
  expect(ink).toBeGreaterThan(500);
  // the sticks move with the commands
  const knob = () => panel(page, "fly").locator(".knob").first().getAttribute("cy");
  const a = await knob(); await seek(page, 120); await expect.poll(knob).not.toBe(a);
});

test("course 3 with the IMU: the filter rejects measurements as it locks onto clutter", async ({ page }) => {
  await loaded(page);
  await page.click("#seeds button:nth-child(3)"); await controlsReady(page);
  await page.click("#play");
  await seek(page, 75);
  await expect(panel(page, "fuse")).toHaveClass(/\bbad\b/);
  await expect(panel(page, "fuse").locator(".pp-r")).toHaveText(/^REJECTED \(χ² GATE\)/);
  // its uncertainty over the flight, with the rejections marked
  await expect(panel(page, "fuse").locator("path.tick-bad")).toHaveCount(1);
  expect((await panel(page, "fuse").locator("path.spark").getAttribute("d")).length).toBeGreaterThan(200);
});

test.describe("phone", () => {
  test.use(phone);
  test("two by two, within the width", async ({ page }) => {
    await loaded(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const [d, m, f] = await Promise.all(["detect", "measure", "fuse"].map((k) => panel(page, k).boundingBox()));
    expect(Math.round(d.y)).toBe(Math.round(m.y));
    expect(f.y).toBeGreaterThan(d.y + d.height - 1);
  });
});
