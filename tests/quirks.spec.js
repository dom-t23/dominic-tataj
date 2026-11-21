// Small extras: the console note (js/hello.js) and the crosshair cursor (js/cursor.js).
const { test, expect } = require("@playwright/test");
const { trackErrors } = require("./helpers");

test("the console says hello once, with the source", async ({ page }) => {
  const logs = [];
  page.on("console", (m) => { if (m.type() === "log") logs.push(m.text()); });
  await page.goto("/", { waitUntil: "networkidle" });
  const hello = logs.filter((l) => l.includes("GENERATIVE FPV FRAME"));
  expect(hello).toHaveLength(1);
  expect(hello[0]).toContain("https://github.com/dom-t23/dominic-tataj");
  expect(hello[0]).not.toContain("fpv");
});

test("drafting cursor: ticks and the position on the sheet in mm, off over controls", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });   // the quirks load after the load event
  await page.mouse.move(400, 500); await page.mouse.move(420, 520, { steps: 3 });
  await expect(page.locator("html")).toHaveClass(/\bdc-on\b/);
  // 96 px to the inch: x 420 px is 111.1 mm
  await expect(page.locator(".dc-read")).toHaveText(/^X 111\.1 {2}Y \d+\.\d mm$/);
  await page.hover(".btn.primary");
  await expect(page.locator("html")).not.toHaveClass(/\bdc-on\b/);
});

test.describe("phone", () => {
  test.use(require("./helpers").phone);
  test("no drafting cursor on a touch screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });   // the quirks load after the load event
    await expect(page.locator(".dc-read")).toHaveCount(0);
  });
});

test("About lists skills and experience, software first; each skill links the projects that used it", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".bom tbody tr:not(.grp)")).toHaveCount(13);
  await expect(page.locator(".bom .grp th")).toHaveText(["Software and autonomy", "Mechanical design", "Education", "Leadership", "Experience", "Languages"]);
  const fusion = page.locator(".bom tr.skill").filter({ hasText: "Fusion" });
  expect(await fusion.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual(["#e-03", "#e-02"]);
  for (const row of await page.locator(".bom tr.skill").all()) {
    const links = await row.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(links.length).toBeGreaterThan(0);
    for (const h of links) await expect(page.locator(h)).toHaveCount(1);
  }
});
