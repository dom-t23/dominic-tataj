// The project pages (drone-racing.html and the others), the Work menu, folding sections, link previews and print.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

const PAGES = [["drone-racing", "e-04"], ["drone-frame", "e-03"], ["pipe-climber", "e-02"], ["ai-scaling", "e-01"]];

test("each project page: its own title, preview and canonical; the menu marks it; no errors", async ({ page }) => {
  const errors = trackErrors(page);
  for (const [slug, id] of PAGES) {
    await page.goto(`/${slug}.html`, { waitUntil: "networkidle" });
    await expect(page.locator(`article#${id} h1`)).toHaveCount(1);
    expect(await page.title()).toMatch(/· Dominic Tataj$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://dom-t23.github.io/dominic-tataj/${slug}.html`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `https://dom-t23.github.io/dominic-tataj/og/${slug}.png`);
    expect((await page.request.get(`/og/${slug}.png`)).status()).toBe(200);
    await expect(page.locator(`#work-menu a[aria-current="page"]`)).toHaveAttribute("href", `${slug}.html`);
    await expect(page.locator(".nav .nav-cv")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("the homepage loads none of the projects' figures", async ({ page }) => {
  const js = [];
  page.on("request", (r) => { if (/\.js(\?|$)/.test(r.url())) js.push(r.url().split("/").pop()); });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(800);
  for (const m of ["replay.js", "frame3d-boot.js", "three.module.min.js", "climber.js", "scaling.js", "bench.js", "hero-flight.js"]) expect(js).not.toContain(m);
});

test("the Work menu: opens, lists every project, closes on Escape and outside, works without the mouse", async ({ page }) => {
  await page.goto("/");
  const menu = page.locator("#work-menu");
  await page.locator("#work-menu summary").focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("open", "");
  await expect(menu.locator(".m-t")).toHaveText(["Vision-based autonomous drone racing", "Generative FPV drone frame", "Pipe-climbing robot", "AI training-power scaling analysis"]);
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  expect(await page.evaluate(() => document.activeElement.tagName)).toBe("SUMMARY");
  await page.click("#work-menu summary");
  await page.mouse.click(5, 600);
  await expect(menu).not.toHaveAttribute("open", "");
  await page.click("#work-menu summary");
  await menu.locator('a[href="pipe-climber.html"]').click();
  await expect(page).toHaveURL(/pipe-climber\.html$/);
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });
  test("the menu still opens, and every section of a write-up is there", async ({ page }) => {
    await page.goto("/drone-racing.html");
    await page.click("#work-menu summary");
    await expect(page.locator("#work-menu .menu-list a").first()).toBeVisible();
    for (const d of await page.locator("details.more").all()) await expect(d).toHaveAttribute("open", "");
  });
});

test("long sections are open on a wide screen", async ({ page }) => {
  await page.goto("/drone-racing.html", { waitUntil: "networkidle" });
  await expect(page.locator("details.more")).toHaveCount(2);
  for (const d of await page.locator("details.more").all()) await expect(d).toHaveAttribute("open", "");
});

test.describe("phone", () => {
  test.use(phone);
  test("long sections start folded and open with a tap; the nav fits", async ({ page }) => {
    await page.goto("/drone-racing.html", { waitUntil: "networkidle" });
    const testing = page.locator("details.more").filter({ hasText: "Testing" });
    await expect(testing).not.toHaveAttribute("open", "");
    await testing.locator("summary").tap();
    await expect(testing).toHaveAttribute("open", "");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test("print: no nav, buttons or menu; folded sections open; link addresses written out", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".nav")).toBeHidden();
  await expect(page.locator(".hero-stage")).toBeHidden();
  expect(await page.locator('.hero .actions a[href^="https://github.com"]').evaluate((a) => getComputedStyle(a, "::after").content)).toContain("github.com/dom-t23");
  await page.goto("/drone-racing.html", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 390, height: 664 });
  await page.evaluate(() => { document.querySelectorAll("details.more").forEach((d) => { d.open = false; }); window.dispatchEvent(new Event("beforeprint")); });
  for (const d of await page.locator("details.more").all()) await expect(d).toHaveAttribute("open", "");
});

test.describe("section links", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });
  test("each section heading's # copies its address without folding the section; On this page links them", async ({ page }) => {
    await page.goto("/drone-racing.html", { waitUntil: "networkidle" });
    await expect(page.locator(".toc a")).toHaveText(["Flight log", "Replay and pipeline", "Approach", "How it was built", "Testing", "Results by course set"]);
    for (const a of await page.locator(".toc a").all()) await expect(page.locator(await a.getAttribute("href"))).toHaveCount(1);
    await page.hover("#e04-testing");
    await page.click("#e04-testing .anchor");
    await expect(page.locator("#e04-testing .anchor")).toHaveText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/drone-racing\.html#e04-testing$/);
    expect(await page.evaluate(() => document.getElementById("e04-testing").closest("details").open)).toBe(true);
  });
});

test.describe("phone, a link into a folded section", () => {
  test.use(phone);
  test("opens that section", async ({ page }) => {
    await page.goto("/drone-racing.html#e04-testing", { waitUntil: "networkidle" });
    await expect(page.locator("details.more").filter({ hasText: "Testing" })).toHaveAttribute("open", "");
    await expect(page.locator("details.more").filter({ hasText: "How it was built" })).not.toHaveAttribute("open", "");
  });
});
