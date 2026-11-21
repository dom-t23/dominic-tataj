// The hero: the visible name and role, the screening facts, and Fig. 00, the flight log
// (js/hero-flight.js): the simulated flight from E-04 drawn as a plan view, with its error trace.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const status = (page) => page.locator("#fv text").filter({ hasText: /Ready|Flying|Completed/ });
const toStrip = (page) => page.locator("#flight").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));

test("flies the recorded course and settles on the flight's own numbers", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await toStrip(page);
  await expect(status(page)).toContainText("Flying, played at 3× speed", { timeout: 4000 });
  await expect(page.locator("#fv-g")).toHaveText(/^[1-8] of 8$/);
  await expect(status(page)).toHaveText("Completed: 8 of 8 gates", { timeout: 8000 });
  await expect(page.locator("#fv-g")).toHaveText("8 of 8");
  await expect(page.locator("#fv-v-l")).toHaveText("Mean speed");
  await expect(page.locator("#fv-e")).toHaveText(/^0\.\d\d m$/);
  expect(await page.$$eval("#fv .gate", (gs) => gs.map((g) => g.getAttribute("class")))).toEqual(Array(8).fill("gate done"));
  expect(errors).toEqual([]);
});

test("the whole course is there, faint, from the first frame (MOT-04)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 300 });   // the figure below the fold: not flying yet
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await expect(page.locator("#fv-t")).toHaveText("0.00 s");
  await expect(status(page)).toContainText("Ready");
  expect(await page.locator("#fv .ghost").evaluate((p) => p.getAttribute("points").split(" ").length)).toBeGreaterThan(50);
});

test("REPLAY flies it again", async ({ page }) => {
  await page.goto("/");
  await toStrip(page);
  await expect(status(page)).toHaveText("Completed: 8 of 8 gates", { timeout: 8000 });
  await page.click("#fv-replay");
  await expect(status(page)).toContainText(/Ready|Flying/);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("shows the finished flight at once, still", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(status(page)).toHaveText("Completed: 8 of 8 gates");
    const a = await page.locator("#fv polyline.truth").getAttribute("points");
    await page.waitForTimeout(600);
    expect(await page.locator("#fv polyline.truth").getAttribute("points")).toBe(a);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("fits the width and flies", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await toStrip(page);
    await expect(status(page)).toHaveText("Completed: 8 of 8 gates", { timeout: 8000 });
  });
});

test("without flight data the strip stays empty and REPLAY hidden", async ({ page }) => {
  await page.route("**/flights/index.js", (r) => r.fulfill({ status: 500, body: "" }));
  await page.goto("/");
  await page.waitForTimeout(500);
  await expect(page.locator("#fv-replay")).toBeHidden();
  await expect(page.locator("#fv svg *")).toHaveCount(0);
});

test("a visible h1 names Dom and his target roles (R-02; H.3 reopened for a role line)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Dominic Tataj Software, autonomy and systems · MEng, UCL");
  expect((await page.locator("h1 .h1-name").boundingBox()).height).toBeGreaterThan(50);
});

test("the screening facts: roles and timing, availability, right to work, base, degree, email", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".facts dt")).toHaveText(["Looking for", "Available", "Right to work", "Based", "Degree", "Email"]);
  await expect(page.locator(".facts")).toContainText("From 27 June 2027");
  await expect(page.locator(".facts")).toContainText("Full right to work in the UK");
  await expect(page.locator(".facts a")).toHaveAttribute("href", "mailto:dominic_tataj@icloud.com");
  await expect(page.locator(".hero .actions a")).toHaveText(["Email me", "LinkedIn ↗", "GitHub ↗"]);
});
