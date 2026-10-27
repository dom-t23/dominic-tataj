// Fig. 03, the benchmark table and its chart (js/bench.js).
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const firstCol = (page) => page.$$eval("#bench tbody tr td:first-child", (t) => t.map((x) => x.textContent));
const header = (page, n) => page.locator(`#bench thead tr:nth-child(2) th:nth-child(${n})`);
const COURSE_ORDER = ["0–49", "1000–1049", "2000–2049", "3000–3049", "4000–4049", "5000–5049"];

test("a column header charts its column and sorts the table by it; Course set restores the order", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.locator("#bench-chart")).toBeVisible();
  await expect(header(page, 4)).toHaveClass(/sel/);   // clutter, camera + IMU to start
  await expect(page.locator("#bench-chart")).toHaveAttribute("aria-label", /orange clutter, camera \+ imu: 0–49 17, 1000–1049 8, 2000–2049 0, 3000–3049 8, 4000–4049 13, 5000–5049 8/);
  expect(await firstCol(page)).toEqual(COURSE_ORDER);

  await header(page, 5).locator("button").click();     // clutter, camera only: worst set first
  await expect(header(page, 5)).toHaveAttribute("aria-sort", "ascending");
  expect((await firstCol(page))[0]).toBe("3000–3049");
  await expect(page.locator("#bench-chart")).toHaveAttribute("aria-label", /camera only: .*3000–3049 33/);
  await expect(page.locator("#bench tfoot tr td").last()).toHaveClass(/sel/);

  await header(page, 5).locator("button").click();     // again: course order, same column
  expect(await firstCol(page)).toEqual(COURSE_ORDER);
  await header(page, 2).locator("button").click();
  await header(page, 1).locator("button").click();
  expect(await firstCol(page)).toEqual(COURSE_ORDER);
  await expect(header(page, 2)).toHaveClass(/sel/);
  expect(errors).toEqual([]);
});

test("a set's row and its bar pick each other out; the pooled row pulses once in view", async ({ page }) => {
  await page.goto("/");
  await page.locator(".bench-fig").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));
  await expect(page.locator("#bench tr.pooled")).toHaveClass(/pulse/);
  await page.locator("#bench tbody tr").nth(3).hover();
  await expect(page.locator("#bench-chart path.bar.hl")).toHaveCount(1);
  await expect(page.locator("#bench-chart text").filter({ hasText: "3000–3049: 8 MISSED, 98.00% PASSED" })).toHaveCount(1);
  await page.locator("#bench-chart rect.hit").nth(0).hover();
  await expect(page.locator("#bench tbody tr").nth(0)).toHaveClass(/\bhl\b/);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("bars are drawn at once, and nothing pulses", async ({ page }) => {
    await page.goto("/");
    const heights = await page.$$eval("#bench-chart path.bar", (ps) => ps.map((p) => p.getAttribute("d")));
    expect(heights.filter((d) => d).length).toBe(5);   // one set missed no gates
    await page.locator(".bench-fig").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForTimeout(300);
    await expect(page.locator("#bench tr.pooled")).not.toHaveClass(/pulse/);
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("the table fits without scrolling sideways", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const box = await page.locator(".tablebox").evaluate((e) => [e.scrollWidth, e.clientWidth]);
    expect(box[0]).toBeLessThanOrEqual(box[1]);
  });
});
