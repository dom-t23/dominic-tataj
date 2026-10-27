// Phase G quirks: acro mode and the console note (js/acro.js, js/hello.js).
const { test, expect } = require("@playwright/test");
const { trackErrors } = require("./helpers");

test("the console says hello once, with the source and the hint", async ({ page }) => {
  const logs = [];
  page.on("console", (m) => { if (m.type() === "log") logs.push(m.text()); });
  await page.goto("/", { waitUntil: "networkidle" });
  const hello = logs.filter((l) => l.includes("GENERATIVE FPV FRAME"));
  expect(hello).toHaveLength(1);
  expect(hello[0]).toContain("https://github.com/dom-t23/dominic-tataj");
  expect(hello[0]).toContain("type fpv");
});

test("typing fpv: ACRO for 10 s, the page tilts and rights itself; not from a form field", async ({ page }) => {
  const errors = trackErrors(page);
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator(".foot-hint")).toHaveText("Type FPV anywhere for acro mode.");
  // typed into a slider, it is not a command
  await page.locator("#scrub").focus();
  await page.keyboard.type("fpv");
  await expect(page.locator(".acro-badge")).toHaveCount(0);
  await page.evaluate(() => document.activeElement.blur());
  await page.keyboard.type("xfPv");   // any case, after other keys
  await expect(page.locator(".acro-badge")).toHaveText("ACRO 10");
  await expect(page.locator("main")).toHaveClass(/\btilt\b/);
  await page.clock.runFor(3000);
  await expect(page.locator(".acro-badge")).toHaveText("ACRO 7");
  await page.clock.runFor(7500);
  await expect(page.locator(".acro-badge")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.classList.contains("acro"))).toBe(false);
  expect(errors).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("acro mode shows the badge but nothing tilts", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.type("fpv");
    await expect(page.locator(".acro-badge")).toHaveText("ACRO 10");
    await expect(page.locator("main")).not.toHaveClass(/\btilt\b/);
  });
});
