// Page structure, content and theme.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

test("renders in standards mode with no errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.evaluate(() => document.compatMode)).toBe("CSS1Compat");
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("en-GB");
  expect(errors).toEqual([]);
});

test("content: order, numbering, figures and links", async ({ page }) => {
  await page.goto("/");
  const ids = (sel) => page.$$eval(sel, (es) => es.map((e) => e.id || e.getAttribute("href")));
  expect(await ids(".cards h3 a")).toEqual(["#e-04", "#e-03", "#e-02", "#e-01"]);
  expect(await ids("article.sheet")).toEqual(["e-04", "e-03", "e-02", "e-01"]);
  expect(await page.$$eval("figcaption b", (bs) => bs.map((b) => b.textContent)))
    .toEqual(["Fig. 00", "Fig. 01", "Fig. 02", "Fig. 03", "Fig. 04", "Fig. 05", "Fig. 06", "Fig. 07"]);
  expect(await page.$$eval(".nav ul a", (as) => as.map((a) => a.textContent))).toEqual(["Work", "About", "Photos", "Contact", "CV"]);
  expect(await page.$$eval("tr.pooled > *", (tds) => tds.map((t) => t.textContent))).toEqual(["Pooled", "99.83%", "97.79%", "98.58%", "97.46%"]);
  for (const href of ["https://unsplash.com/@dominic_t", "https://www.instagram.com/dt___xt/",
    "https://www.linkedin.com/in/dominic-tataj", "https://github.com/dom-t23"]) {
    expect(await page.locator(`a[href="${href}"]`).count()).toBeGreaterThan(0);
  }
  const body = await page.textContent("body");
  expect(body).not.toMatch(/(?<![\d.])(48|79)%|98\.0% gates|13 Oct|Photograph to add/);
  await expect(page.locator(".avail")).toContainText("27 June 2027");
});

test("targeting: software, autonomy and systems first; the degree stays accurate", async ({ page }) => {
  await page.goto("/");
  const meta = await page.evaluate(() => [document.title,
    document.querySelector('meta[name="description"]').content,
    document.querySelector('meta[property="og:title"]').content,
    document.querySelector('meta[property="og:description"]').content,
    document.querySelector("h1").textContent]);
  for (const m of meta) expect(m).toMatch(/software, autonomy and systems/i);
  const hero = await page.textContent(".hero");
  expect(hero).toMatch(/software, autonomy and systems roles/);
  expect(hero).toContain("MEng Mechanical Engineering");
  expect(await page.textContent("body")).not.toMatch(/Aiming for mechanical|mechanical engineering roles|mechanical engineering portfolio/i);
  await expect(page.locator(".foot-line")).toContainText("MEng Mechanical Engineering, UCL");
});

test("structured data names Dom and his targeting", async ({ page }) => {
  await page.goto("/");
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld["@type"]).toBe("ProfilePage");
  expect(ld.mainEntity.name).toBe("Dominic Tataj");
  expect(ld.mainEntity.description).toMatch(/software, autonomy and systems/);
});

test.describe("phone", () => {
  test.use(phone);
  test("fits 390 px and shows availability on the first screen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth])).toEqual([390, 390]);
    const box = await page.locator(".avail").boundingBox();
    expect(box.y + box.height).toBeLessThan(await page.evaluate(() => innerHeight));
    // no spec value wraps onto a second line (in its final state, not mid-count)
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    expect(await page.$$eval(".specs .n", (ns) => ns.filter((n) => n.getBoundingClientRect().height > 40).map((n) => n.textContent))).toEqual([]);
  });
});

test.describe("phone, figures", () => {
  test.use(phone);
  test("figure labels stay legible on a phone (R-20): at least 9 px, and no sideways page scroll", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const sizes = await page.$$eval("svg.drawing", (svgs) => svgs.filter((s) => s.getClientRects().length).flatMap((s) =>
      Array.from(s.querySelectorAll("text")).map((t) => t.getBoundingClientRect().height)));
    expect(sizes.length).toBeGreaterThan(20);
    expect(Math.min(...sizes)).toBeGreaterThan(9);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test("reflows at 320 px: nothing pushes the page sideways (verification round 1, P1-3)", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/", { waitUntil: "networkidle" });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((t) => window.scrollTo(0, t), y); await page.waitForTimeout(30); }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
});

test.describe("phone, in-page links", () => {
  test.use(phone);
  test("a project link on a fresh page lands on its project (P1-2)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.tap('.card h3 a[href="#e-01"]');
    await expect.poll(() => page.evaluate(() => Math.round(document.getElementById("e-01").getBoundingClientRect().top)), { timeout: 4000 })
      .toBeLessThan(150);
  });
});

test("the nav is the name, four links and the CV: no sheet counter", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#sheet-no, #progress, .tblock, #approve")).toHaveCount(0);
  await expect(page.locator(".nav .brand")).toHaveText("Dominic Tataj");
});
test("key figures show their real values from the first frame, with no count-up (R-10)", async ({ page }) => {
  await page.addInitScript(() => { delete window.WebGL2RenderingContext; });
  await page.goto("/", { waitUntil: "networkidle" });
  const values = () => page.$$eval("#e-03 .specs .n", (ns) => ns.map((n) => n.textContent));
  expect(await values()).toEqual(["1.5", ">300Hz", "−36%", "38g"]);
  await page.locator("#e-03 .specs").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));
  await page.waitForTimeout(300);
  expect(await values()).toEqual(["1.5", ">300Hz", "−36%", "38g"]);
  await expect(page.locator("#e-02 .specs .n").nth(1)).toHaveText("400×300mm");
});
