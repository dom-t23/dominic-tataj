// E-01's scatter, Fig. 07 (js/scaling.js, data in js/data/scaling.js).
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const title = (page) => page.locator("#scaling text.title");
const toView = (page) => page.locator("#scaling-fig").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));

test("603 models; linear axes until in view, then log axes and the fit", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });   // loads after the load event
  await expect(page.locator("#scaling circle.pt")).toHaveCount(603);
  await expect(title(page)).toHaveText("LINEAR AXES");
  await expect(page.locator("#scaling text.fit-t").first()).toHaveText("P ∝ N⁰·⁵⁵ · R² 0.44");   // fitted in the page
  await expect(page.locator("#scaling text.fit-t").nth(1)).toHaveText("GPT-5 ≈590 kW");
  await toView(page);
  await expect(title(page)).toHaveText("LOG₁₀ AXES", { timeout: 5000 });
  await expect.poll(() => page.locator("#scaling path.fit").first().getAttribute("stroke-dashoffset"), { timeout: 5000 }).toBe("0");
  // back to linear: the fit goes, the switch says so
  await page.click(".sc-axes button[data-log='0']");
  await expect(page.locator(".sc-axes button[data-log='0']")).toHaveAttribute("aria-pressed", "true");
  await expect(title(page)).toHaveText("LINEAR AXES", { timeout: 5000 });
  expect(errors).toEqual([]);
});

test("pointing at a point names the model", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await toView(page);
  await expect(title(page)).toHaveText("LOG₁₀ AXES", { timeout: 5000 });
  await page.waitForTimeout(1800);   // the sweep settles
  const at = await page.evaluate(() => {
    const c = [...document.querySelectorAll("#scaling circle.pt")].pop(), s = document.getElementById("scaling");
    const r = s.getBoundingClientRect(), vb = s.viewBox.baseVal;
    return [r.left + +c.getAttribute("cx") * r.width / vb.width, r.top + +c.getAttribute("cy") * r.height / vb.height];
  });
  await page.mouse.move(at[0], at[1]);
  await expect(page.locator("#scaling .tip")).toHaveAttribute("opacity", "1");
  await expect(page.locator("#scaling .tip text")).toHaveText(/ · \d+(\.\d)? [TBMk]? ?· \d+(\.\d)? [kMG]?W$/);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("log axes and the fit at once", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(title(page)).toHaveText("LOG₁₀ AXES");
    await expect(page.locator("#scaling path.fit").first()).toHaveAttribute("stroke-dashoffset", "0");
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("fits the width", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const b = await page.locator("#scaling").boundingBox();
    expect(b.width).toBeLessThanOrEqual(390);
    expect(b.height).toBeGreaterThan(250);
  });
});
