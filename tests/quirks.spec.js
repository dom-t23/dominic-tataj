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
  await page.goto("/", { waitUntil: "networkidle" });   // the quirks load after the load event
  await expect(page.locator(".foot-hint")).toHaveText("Type FPV anywhere for acro mode.");
  // typed into a slider, it is not a command
  await page.locator("#scrub").focus();
  await page.keyboard.type("fpv");
  await expect(page.locator(".acro-badge")).toHaveCount(0);
  await page.evaluate(() => {
    document.activeElement.blur();
    // the tilt is a 1.8 s animation, which can be over before a busy test polls the class
    window.__gust = 0;
    document.querySelector("main").addEventListener("animationstart", (e) => { if (e.animationName === "gust") window.__gust++; });
  });
  await page.keyboard.type("xfPv");   // any case, after other keys
  await expect(page.locator(".acro-badge")).toHaveText("ACRO 10");
  await expect.poll(() => page.evaluate(() => window.__gust)).toBe(1);
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
    await page.goto("/", { waitUntil: "networkidle" });   // the quirks load after the load event
    await page.keyboard.type("fpv");
    await expect(page.locator(".acro-badge")).toHaveText("ACRO 10");
    await expect(page.locator("main")).not.toHaveClass(/\btilt\b/);
  });
});

test("drafting cursor: ticks and the position on the sheet in mm, off over controls", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });   // the quirks load after the load event
  await page.mouse.move(400, 500); await page.mouse.move(420, 520, { steps: 3 });
  await expect(page.locator("html")).toHaveClass(/\bdc-on\b/);
  // 96 px to the inch: x 420 px is 111.1 mm
  await expect(page.locator(".dc-read")).toHaveText(/^X 111\.1 {2}Y \d+\.\d MM$/);
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

test("hovering a project card lifts it and lights its number", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const card = page.locator(".register li:nth-child(2) a");
  await card.hover();
  await expect.poll(() => card.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m42)).toBeLessThan(-3);
  await expect.poll(() => card.locator(".r-no").evaluate((e) => getComputedStyle(e).color)).toBe("rgb(255, 255, 255)");
  await page.mouse.move(5, 600);
  await expect.poll(() => card.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m42)).toBe(0);
});

test("the theme switch spreads from the button in a view transition", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });   // the quirks load after the load event
  await page.evaluate(() => {
    window.__vt = 0;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (fn) => { window.__vt++; return start(fn); };
  });
  await page.click("#theme");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  expect(await page.evaluate(() => window.__vt)).toBe(1);
});

test("About lists skills and experience; each skill counts and links the projects that used it", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });   // the quirks load after the load event
  await expect(page.locator(".bom tbody tr:not(.grp)")).toHaveCount(13);
  await expect(page.locator(".bom .grp th")).toHaveText(["Education", "Software and autonomy", "Mechanical design", "Experience", "Leadership", "Languages"]);
  const fusion = page.locator(".bom tr.skill").filter({ hasText: "Fusion" });
  await expect(fusion.locator("td").nth(2)).toHaveText("2");
  expect(await fusion.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual(["#e-03", "#e-02"]);
  // every linked project exists, and each skill's count matches its links
  for (const row of await page.locator(".bom tr.skill").all()) {
    const links = await row.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(await row.locator("td").nth(2).textContent()).toBe(String(links.length));
    for (const h of links) await expect(page.locator(h)).toHaveCount(1);
  }
  await fusion.locator("a").first().hover();
  await expect.poll(() => fusion.locator("a").first().evaluate((a) => getComputedStyle(a, "::after").opacity)).toBe("1");
  expect(await fusion.locator("a").first().evaluate((a) => getComputedStyle(a, "::after").content)).toBe('"Generative FPV drone frame"');
});
