// The hero's drone (js/hero-drone.js, frames from tools/hero/).
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const frames = (page) => { const r = []; page.on("request", (q) => { if (q.url().includes("/images/hero/")) r.push(q.url().split("/").pop()); }); return r; };
const pixels = (page) => page.locator(".hd-canvas").evaluate((c) => c.toDataURL().length + ":" + c.toDataURL().slice(-200));

test("sways after load, then comes apart as the page scrolls", async ({ page }) => {
  const errors = trackErrors(page), got = frames(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#hero-drone")).toHaveClass(/\blive\b/, { timeout: 10000 });
  await expect(page.locator(".hd-canvas")).toBeVisible();
  expect(new Set(got).size).toBe(49);   // the still, then every frame once
  const a = await pixels(page);
  await expect.poll(() => pixels(page), { timeout: 5000 }).not.toBe(a);   // swaying
  await page.evaluate(() => window.scrollTo({ top: 220, behavior: "instant" }));
  await page.waitForTimeout(1500);
  const b = await pixels(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(800);
  expect(await pixels(page)).not.toBe(b);   // back together
  await expect(page.locator("#hero-drone")).toHaveAttribute("href", "#e-03");
  expect(errors).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("the still drawing only", async ({ page }) => {
    const got = frames(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".hd-still")).toBeVisible();
    await expect(page.locator(".hd-canvas")).toBeHidden();
    expect(got).toEqual(["t16.webp"]);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("the still drawing only, under the text", async ({ page }) => {
    const got = frames(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".hd-canvas")).toBeHidden();
    expect(got).toEqual(["t16.webp"]);
    const [text, drone] = await Promise.all([".hero-text", "#hero-drone"].map((s) => page.locator(s).boundingBox()));
    expect(drone.y).toBeGreaterThan(text.y + text.height);
  });
});
