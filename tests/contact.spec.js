// Copy email and its burst.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("copies the email and bursts without blocking the page", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await page.click("#copy");
  await expect(page.locator("#copy")).toHaveText("COPIED");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("dominic_tataj@icloud.com");
  await expect(page.locator("canvas.burst")).toHaveCount(1);
  expect(await page.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2).className)).not.toBe("burst");
  await page.click("#copy");   // a second click joins the running burst
  await expect(page.locator("canvas.burst")).toHaveCount(1);
  await expect(page.locator("canvas.burst")).toHaveCount(0, { timeout: 5000 });
  expect(errors).toEqual([]);
});

test.describe("phone", () => {
  test.use(phone);
  test("burst does not cause sideways scroll", async ({ page }) => {
    await page.goto("/");
    await page.click("#copy");
    await expect(page.locator("canvas.burst")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("copies without a burst", async ({ page }) => {
    await page.goto("/");
    await page.click("#copy");
    await expect(page.locator("#copy")).toHaveText("COPIED");
    await page.waitForTimeout(200);
    await expect(page.locator("canvas.burst")).toHaveCount(0);
  });
});
