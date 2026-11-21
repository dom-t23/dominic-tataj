// Fig. 00, the hero's flight-test strip.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const readout = (page) => page.locator("#fv text.big");
const height = (page) => page.locator("#fv text.ink").last();   // the live height dimension
const toStrip = (page) => page.locator("#flight").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));

test("flies the course, flips into the elevation view and hovers", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await toStrip(page);
  await expect(readout(page)).toContainText("×3", { timeout: 3000 });
  await expect(readout(page)).toContainText("gate");
  await expect(readout(page)).toContainText("8/8 gates · hover", { timeout: 8000 });
  // every gate passed, and the height dimension follows the hover bob
  expect(await page.$$eval("#fv .gate", (gs) => gs.map((g) => g.getAttribute("class")))).toEqual(Array(8).fill("gate done"));
  const a = await height(page).textContent();
  expect(a).toMatch(/^1\.\d\d m$/);
  await expect.poll(() => height(page).textContent(), { timeout: 3000 }).not.toBe(a);
  expect(errors).toEqual([]);
});

test("REPLAY flies it again", async ({ page }) => {
  await page.goto("/");
  await toStrip(page);
  await expect(readout(page)).toContainText("hover", { timeout: 8000 });
  await page.click("#fv-replay");
  await expect(readout(page)).toContainText("×3");
});

test("waits until the strip is in view before taking off", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 600 });   // strip below the fold
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await expect(readout(page)).toHaveText(/^t 0\.00 s/);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("shows the finished drawing, still", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await toStrip(page);
    await expect(readout(page)).toContainText("8/8 gates · hover");
    const a = await height(page).textContent();
    await page.waitForTimeout(600);
    expect(await height(page).textContent()).toBe(a);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("stacks the views and fits the width", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await toStrip(page);
    await expect(readout(page)).toContainText("hover", { timeout: 8000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const box = await page.locator("#fv").boundingBox();
    expect(box.height).toBeGreaterThan(300);
  });
});

test("without flight data the strip stays empty and REPLAY hidden", async ({ page }) => {
  await page.route("**/flights/index.js", (r) => r.fulfill({ status: 500, body: "" }));
  await page.goto("/");
  await page.waitForTimeout(500);
  await expect(page.locator("#fv-replay")).toBeHidden();
  await expect(page.locator("#fv svg *")).toHaveCount(0);
});

test("no visible headline; the page's h1 names it for screen readers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Dominic Tataj, engineering portfolio: software, autonomy and systems");
  expect(await page.locator("h1").boundingBox()).toMatchObject({ width: 1, height: 1 });
});

test("the h1 stays hidden even when a cached, older stylesheet loads with the page", async ({ page }) => {
  // on 20 Nov 2026 the live site showed it in display type: new HTML, the old site.css from cache
  await page.route(/css\/site\.css/, (r) => r.fulfill({ contentType: "text/css", body: ".hero h1 { font-size: 62px; }" }));
  await page.goto("/");
  expect(await page.locator("h1").boundingBox()).toMatchObject({ width: 1, height: 1 });
});

test("availability: four pills, the first marked live", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-facts span")).toHaveText(["Summer internship or placement year", "From 27 June 2027", "Full right to work in the UK", "London"]);
  expect(await page.locator(".hero-facts span").first().evaluate((d) => getComputedStyle(d, "::before").animationName)).toBe("live");
});

test.describe("reduced motion, availability", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("the live dot holds still", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator(".hero-facts span").first().evaluate((d) => getComputedStyle(d, "::before").animationName)).toBe("none");
  });
});
