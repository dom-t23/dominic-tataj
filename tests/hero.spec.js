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
  await expect(readout(page)).toContainText("GATE");
  await expect(readout(page)).toContainText("8/8 GATES · HOVER", { timeout: 8000 });
  // every gate passed, and the height dimension follows the hover bob
  expect(await page.$$eval("#fv .gate", (gs) => gs.map((g) => g.getAttribute("class")))).toEqual(Array(8).fill("gate done"));
  const a = await height(page).textContent();
  await page.waitForTimeout(700);
  const b = await height(page).textContent();
  expect(a).toMatch(/^1\.\d\d m$/);
  expect(a).not.toBe(b);
  expect(errors).toEqual([]);
});

test("REPLAY flies it again", async ({ page }) => {
  await page.goto("/");
  await toStrip(page);
  await expect(readout(page)).toContainText("HOVER", { timeout: 8000 });
  await page.click("#fv-replay");
  await expect(readout(page)).toContainText("×3");
});

test("waits until the strip is in view before taking off", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 600 });   // strip below the fold
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await expect(readout(page)).toHaveText(/^T 0\.00 S/);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("shows the finished drawing, still", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await toStrip(page);
    await expect(readout(page)).toContainText("8/8 GATES · HOVER");
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
    await expect(readout(page)).toContainText("HOVER", { timeout: 8000 });
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

test("headline: reads as plain text; the underline draws itself; build shows its mass on hover", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero h1")).toHaveText("I design, simulate and build drones and robots");
  const offset = () => page.locator(".hl-sim .scribble path").evaluate((p) => parseFloat(getComputedStyle(p).strokeDashoffset));
  await expect.poll(offset, { timeout: 4000 }).toBe(0);
  const dim = () => page.locator(".hl-build").evaluate((e) => getComputedStyle(e, "::after").opacity);
  expect(await dim()).toBe("0");
  await page.hover(".hl-build");
  await expect.poll(dim).toBe("1");
});

test("availability cells get a plotter pass that leaves them as they were", async ({ page }) => {
  await page.goto("/");
  const pen = () => page.$$eval(".hero-facts > div", (ds) => ds.map((d) => getComputedStyle(d, "::after").opacity));
  await expect.poll(pen, { timeout: 4000 }).toEqual(["0", "0", "0", "0"]);
});

test.describe("reduced motion, headline", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("underline is drawn at once and there is no plotter pass", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator(".hl-sim .scribble path").evaluate((p) => parseFloat(getComputedStyle(p).strokeDashoffset))).toBe(0);
    expect(await page.$$eval(".hero-facts > div", (ds) => ds.map((d) => getComputedStyle(d, "::after").display))).toEqual(Array(4).fill("none"));
  });
});
