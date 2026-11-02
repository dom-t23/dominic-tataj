// E-02's climb, Fig. 04 (js/climber.js): the corrected Excel model and its stage.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const toView = (page) => page.locator("#climb-fig").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));
const setSlider = (page, id, v) => page.locator(id).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, v);

test("the model: the sheet's setup climbs in 58.5 s; the gear sweep, a slip and a stall", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });   // loads after the load event
  const r = await page.evaluate(async () => {
    const { simulate } = await import("/js/climber.js");
    const s = (G, D, N) => { const o = simulate(G, D, N); return { result: o.result, t: +o.t.toFixed(1), x: +o.x.toFixed(2) }; };
    return { sheet: s(150, 20, 30), sweep: [100, 125, 175, 200].map((G) => s(G, 20, 30).t), slip: s(300, 20, 5), stall: s(50, 40, 30) };
  });
  expect(r.sheet).toEqual({ result: "top", t: 58.5, x: 2 });
  expect(r.sweep).toEqual([91.9, 62.4, 59.3, 61.7]);   // 150 is the fastest of the sweep
  expect(r.slip).toEqual({ result: "slip", t: 0, x: 0 });
  expect(r.stall.result).toBe("stall");
});

test("in view it climbs at ten times real time, then gives the verdict", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#climb-fig")).toBeVisible();
  await toView(page);
  await expect(page.locator("#cl-result")).toHaveText("Climbing, at ten times real time");
  await expect(page.locator("#cl-result")).toHaveText("Climbs 2 m in 58.5 s (the sheet's setup)", { timeout: 15000 });
  await expect(page.locator("#cl-x")).toHaveText("2.00 m");
  await expect(page.locator("#cl-plot polyline.run")).toHaveCount(1);
  await expect(page.locator("#cl-plot polyline.sheet")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("a setup that slips is rejected, in the figure and on the flowchart", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await toView(page);
  await setSlider(page, "#cl-g", 300);
  await setSlider(page, "#cl-n", 5);
  await expect(page.locator("#cl-g-o")).toHaveText("300");
  await expect(page.locator("#cl-result")).toHaveText("Slips: drive 29.4 N > grip 3.5 N. Setup rejected");
  await expect(page.locator(".plate.climb")).toHaveClass(/\bslip\b/);
  await expect(page.locator("#flowchart")).toHaveClass(/\breject\b/);
  await expect(page.locator("#cl-plot polyline.run")).toHaveCount(0);
  // back to the sheet's setup: it climbs again
  await page.click("#cl-reset");
  await expect(page.locator("#flowchart")).not.toHaveClass(/\breject\b/);
  await expect(page.locator("#cl-n-o")).toHaveText("30 N");
  await expect(page.locator("#cl-result")).toHaveText("Climbing, at ten times real time");
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("shows the end of the climb, no playback", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await toView(page);
    await expect(page.locator("#cl-x")).toHaveText("2.00 m");
    await page.click("#cl-run");
    await expect(page.locator("#cl-result")).toHaveText("Climbs 2 m in 58.5 s (the sheet's setup)");
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("one column, nothing wider than the screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await toView(page);
    const w = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth, document.getElementById("climb-fig").getBoundingClientRect().right]);
    expect(w[0]).toBeLessThanOrEqual(w[1]);
    expect(w[2]).toBeLessThanOrEqual(w[1]);
  });
});
