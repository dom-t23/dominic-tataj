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

test("drafting cursor: ticks and the position on the sheet in mm, off over controls", async ({ page }) => {
  await page.goto("/");
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
    await page.goto("/");
    await expect(page.locator(".dc-read")).toHaveCount(0);
  });
});

test("hovering a project draws a revision cloud round it", async ({ page }) => {
  await page.goto("/");
  const entry = page.locator(".register li:nth-child(2) a");
  await entry.hover();
  await expect(entry).toHaveClass(/\brev-on\b/);
  const d = await entry.locator(".rev-cloud path").getAttribute("d");
  expect(d.match(/A/g).length).toBeGreaterThan(30);   // scallops all the way round
  await page.mouse.move(5, 600);
  await expect(entry).not.toHaveClass(/\brev-on\b/);
  await page.locator("#e03-h").hover();
  await expect(page.locator("#e03-h")).toHaveClass(/\brev-on\b/);
});

test("the theme switch spreads from the button in a view transition", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.evaluate(() => {
    window.__vt = 0;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (fn) => { window.__vt++; return start(fn); };
  });
  await page.click("#theme");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  expect(await page.evaluate(() => window.__vt)).toBe(1);
});

test.describe("approval box", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });
  test("copying the email prints it again, signs and dates the approval box, then the burst", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#approve-status")).toHaveText("For approval");
    await page.click("#copy");
    await expect(page.locator("#approve")).toHaveClass(/\bsigned\b/);
    await expect(page.locator("#email")).toHaveClass(/\bprint\b/);
    await expect(page.locator("#approve-status")).toHaveText("Approved");
    const today = await page.evaluate(() => new Date().toLocaleDateString("sv-SE"));   // YYYY-MM-DD
    await expect(page.locator("#approve-date")).toHaveText(today);
    await expect(page.locator("canvas.burst")).toHaveCount(1, { timeout: 3000 });
    await expect(page.locator("#email")).not.toHaveClass(/\bprint\b/);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("dominic_tataj@icloud.com");
  });
});
