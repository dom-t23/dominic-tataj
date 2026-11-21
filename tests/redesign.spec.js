// The redesign: hero scrub and its fallbacks, the project index, CV links, one dark theme, 404, and no AI-default tells.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors } = require("./helpers");

test("the hero's drone comes apart as the page scrolls; the first screen holds on a large screen", async ({ page }) => {
  const errors = trackErrors(page);
  const frames = new Set();
  page.on("request", (r) => { const m = r.url().match(/images\/hero\/(x\d\d)\.webp/); if (m) frames.add(m[1]); });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".hero")).toHaveClass(/\bscrub\b/);
  await expect(page.locator("#hero-stage")).toHaveClass(/\blive\b/);
  await expect.poll(() => frames.size, { timeout: 15000 }).toBe(24);
  const copyTop = await page.locator(".hero h1").evaluate((e) => e.getBoundingClientRect().top);
  // to the end of the pinned range: the drawing eases after the scroll, then the specs are at full strength
  const span = await page.evaluate(() => document.getElementById("hero").offsetHeight - document.querySelector(".hero-pin").offsetHeight);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), span);
  // the drawing has moved on to the last frame (scaled up a little as it opens out)
  await expect.poll(() => page.locator("#hero-stage .hs").evaluate((e) => e.style.transform)).toMatch(/scale\(1\.0[45]/);
  // pinned: the name hasn't moved
  expect(Math.abs(await page.locator(".hero h1").evaluate((e) => e.getBoundingClientRect().top) - copyTop)).toBeLessThan(2);
  expect(errors).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("a still of the drone part-way apart; no pin, no frame sequence", async ({ page }) => {
    const frames = [];
    page.on("request", (r) => { if (/images\/hero\/x\d\d\.webp/.test(r.url())) frames.push(r.url()); });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator(".hero")).not.toHaveClass(/\bscrub\b/);
    await expect(page.locator("#hero-stage img")).toHaveAttribute("src", "images/hero/x15.webp");
    expect(frames.length).toBeLessThanOrEqual(2);   // the preloaded first frame and the still
  });
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });
  test("everything a recruiter needs is there and visible", async ({ page }) => {
    await page.goto("/");
    for (const sel of [".hero h1", ".avail", ".hero .actions", ".brief", "#cards", "#e-04 .summary", "#contact .email"]) await expect(page.locator(sel).first()).toBeVisible();
    expect(await page.locator("#hero-stage img").evaluate((i) => i.complete && i.naturalWidth)).toBe(960);
    expect(await page.locator(".proj").first().evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  });
});

test("the project index: problem, role, tools and outcome for each; each links its write-up", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator(".proj");
  await expect(cards).toHaveCount(4);
  for (const c of await cards.all()) {
    await expect(c.locator(".proj-facts dt")).toHaveText(["Problem", "Role", "Tools", "Outcome"]);
    const href = await c.locator("h3 a").getAttribute("href");
    await expect(page.locator(href)).toHaveCount(1);
  }
  await expect(page.locator(".proj-facts dd b.num")).toHaveText(["99.8%", "98.6%", "38 g", "246 g", "P ∝ N0.55"]);
  await expect(page.locator('.proj a[href="https://github.com/dom-t23/vision-drone-racing"]')).toHaveCount(1);
});

test("the CV is one click away: nav, hero, contact and footer, all to the same file", async ({ page }) => {
  for (const path of ["/", "/photography.html"]) {
    await page.goto(path);
    await expect(page.locator(".nav .nav-cv")).toBeVisible();
    const hrefs = await page.$$eval('a[href$=".pdf"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    expect(hrefs).toEqual(["Dominic-Tataj-CV.pdf"]);
  }
  await page.goto("/");
  await expect(page.locator('.hero a[href="Dominic-Tataj-CV.pdf"]')).toHaveText("Download CV PDF");
  await expect(page.locator('#contact a[href="Dominic-Tataj-CV.pdf"]')).toHaveCount(1);
});

test("one dark theme, whatever the device asks for", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(20, 19, 17)");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#141311");
  await expect(page.locator("#theme")).toHaveCount(0);
});

test("social tags and icons", async ({ page }) => {
  await page.goto("/");
  for (const [sel, re] of [['meta[property="og:image"]', /og-image\.png$/], ['meta[name="twitter:card"]', /summary_large_image/],
    ['meta[name="twitter:image"]', /og-image\.png$/], ['link[rel="icon"][type="image/png"]', /favicon-32\.png/], ['link[rel="manifest"]', /site\.webmanifest/]]) {
    expect(await page.locator(sel).evaluate((e) => e.content || e.getAttribute("href"))).toMatch(re);
  }
  for (const f of ["/og-image.png", "/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png", "/site.webmanifest", "/404.html"]) {
    expect((await page.request.get(f)).status()).toBe(200);
  }
});

test("the 404 page links home and to the work", async ({ page }) => {
  await page.goto("/404.html");
  await expect(page.locator("h1")).toHaveText("Off course.");
  await expect(page.locator("base")).toHaveAttribute("href", "/dominic-tataj/");
  await expect(page.locator(".nf .actions a").first()).toHaveAttribute("href", "./");
});

test.describe("phone", () => {
  test.use(phone);
  test("the first screen has the name, the CV, the availability and three results", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const h = await page.evaluate(() => innerHeight);
    for (const sel of [".hero h1", ".hero .btn.primary", ".avail", ".brief li:nth-child(2)"]) {
      const b = await page.locator(sel).boundingBox();
      expect(b.y + b.height, sel).toBeLessThan(h);
    }
    await expect(page.locator(".hero")).not.toHaveClass(/\bscrub\b/);
  });
});

test("none of the common AI-default tells: no gradient text, glows, glass, pills or uppercase eyebrow labels", async ({ page }) => {
  for (const path of ["/", "/photography.html", "/404.html"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    const found = await page.evaluate(() => {
      const out = [];
      for (const e of document.querySelectorAll("body *")) {
        const s = getComputedStyle(e), tag = e.tagName + "." + e.className;
        if (s.backgroundClip === "text" || s.webkitBackgroundClip === "text") out.push("gradient text " + tag);
        if (s.backdropFilter && s.backdropFilter !== "none") out.push("glass " + tag);
        if (s.textShadow !== "none") out.push("text glow " + tag);
        if (/drop-shadow/.test(s.filter)) out.push("glow " + tag);
        if (parseFloat(s.borderTopLeftRadius) > 20 && e.getBoundingClientRect().height < 80) out.push("pill " + tag);
        if (s.textTransform === "uppercase" && parseFloat(s.letterSpacing) > 0.5) out.push("eyebrow " + tag);
      }
      return out;
    });
    expect(found, path).toEqual([]);
  }
});
