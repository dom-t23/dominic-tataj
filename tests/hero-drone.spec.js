// The hero's drone (js/hero-drone.js, frames from tools/hero/).
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const frames = (page) => { const r = []; page.on("request", (q) => { if (q.url().includes("/images/hero/")) r.push(q.url().split("/").pop()); }); return r; };
const pixels = (page) => page.locator(".hd-canvas").evaluate((c) => c.toDataURL().length + ":" + c.toDataURL().slice(-200));

const lift = (page) => page.locator(".hd-art").evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m42);

test("hovers and turns after load, then climbs away as the page scrolls", async ({ page }) => {
  const errors = trackErrors(page), got = frames(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#hero-drone")).toHaveClass(/\blive\b/, { timeout: 10000 });
  await expect(page.locator(".hd-canvas")).toBeVisible();
  expect(new Set(got).size).toBe(33);   // the still, then every turn frame once
  const a = await pixels(page);
  await expect.poll(() => pixels(page), { timeout: 5000 }).not.toBe(a);   // turning
  const y = await lift(page);
  expect(Math.abs(y)).toBeLessThanOrEqual(6.5);   // the bob
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: "instant" }));
  await expect.poll(() => lift(page)).toBeLessThan(-60);   // climbing
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => lift(page).then(Math.abs)).toBeLessThanOrEqual(6.5);   // back down
  await expect(page.locator("#hero-drone")).toHaveAttribute("href", "#e-03");
  expect(errors).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("the still drawing only, not moving", async ({ page }) => {
    const got = frames(page);
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.locator(".hd-art").evaluate((e) => getComputedStyle(e).transform)).toBe("none");
    await expect(page.locator(".hd-still")).toBeVisible();
    await expect(page.locator(".hd-canvas")).toBeHidden();
    expect(got).toEqual(["t16.webp"]);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("hovers without turning: the still drawing only, under the text", async ({ page }) => {
    const got = frames(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".hd-canvas")).toBeHidden();
    expect(got).toEqual(["t16.webp"]);
    const [text, drone] = await Promise.all([".hero-text", "#hero-drone"].map((s) => page.locator(s).boundingBox()));
    expect(drone.y).toBeGreaterThan(text.y + text.height);
    await page.locator("#hero-drone").scrollIntoViewIfNeeded();
    const t0 = await page.locator(".hd-art").evaluate((e) => getComputedStyle(e).transform);
    await expect.poll(() => page.locator(".hd-art").evaluate((e) => getComputedStyle(e).transform)).not.toBe(t0);
  });
});
