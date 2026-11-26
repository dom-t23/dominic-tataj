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
  await expect.poll(() => frames.size, { timeout: 15000 }).toBe(96);
  const copyTop = await page.locator(".hero h1").evaluate((e) => e.getBoundingClientRect().top);
  const span = await page.evaluate(() => document.getElementById("hero").offsetHeight - document.querySelector(".hero-pin").offsetHeight);
  // 70% of the way through the pinned range the drone is fully apart (the drawing eases after the scroll)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.ceil(span * 0.7));
  await expect.poll(() => page.locator("#hero-stage .hs").evaluate((e) => e.style.transform)).toMatch(/scale\(1\.0[45]/);
  // the rest of the range holds it there: at the end it's unchanged and still pinned
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), span);
  await expect.poll(() => page.locator("#hero-stage .hs").evaluate((e) => e.style.transform)).toMatch(/scale\(1\.05/);
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
    await expect(page.locator("#hero-stage img")).toHaveAttribute("src", "images/hero/x60.webp");
    expect(frames.length).toBeLessThanOrEqual(2);   // the preloaded first frame and the still
  });
});

test.describe("without JS", () => {
  test.use({ javaScriptEnabled: false });
  test("everything a recruiter needs is there and visible", async ({ page }) => {
    await page.goto("/");
    for (const sel of [".hero h1", ".avail", ".hero .actions", "#cards", "#contact .email"]) await expect(page.locator(sel).first()).toBeVisible();
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
    expect(await c.locator("h3 a").getAttribute("href")).toMatch(/^[a-z-]+\.html$/);
  }
  await expect(page.locator(".proj-facts dd b.num")).toHaveText(["99.8%", "98.6%", "38 g", "246 g", "P ∝ N0.55"]);
  await expect(page.locator('.proj a[href="https://github.com/dom-t23/vision-drone-racing"]')).toHaveCount(1);
});

test("the CV is one click away: nav, hero, contact and footer, all to the same file", async ({ page }) => {
  for (const path of ["/", "/photography.html", "/drone-racing.html"]) {
    await page.goto(path);
    await expect(page.locator(".nav .nav-cv")).toBeVisible();
    const hrefs = await page.$$eval('a[href$=".pdf"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
    expect(hrefs).toEqual(["Dominic-Tataj-CV.pdf"]);
  }
  await page.goto("/");
  await expect(page.locator('.hero a[href="Dominic-Tataj-CV.pdf"]')).toHaveText("Download CV PDF");
  await expect(page.locator('#contact a[href="Dominic-Tataj-CV.pdf"]')).toHaveCount(1);
});

test("dark by default, whatever the device asks for; the toggle switches to light and remembers it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(20, 19, 17)");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#141311");
  await expect(page.locator("#theme")).toHaveAttribute("aria-pressed", "false");
  await page.click("#theme");
  await expect.poll(() => page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem("theme")])).toEqual(["light", "light"]);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(244, 241, 234)");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#F4F1EA");
  await expect(page.locator("#theme")).toHaveAttribute("aria-pressed", "true");
  // the hero drawing switches to its light set (parts filled with the paper colour)
  await expect(page.locator("#hero-stage img")).toHaveAttribute("src", "images/hero/l00.webp");
  // remembered, applied before first paint, on every page
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
  await page.goto("/photography.html");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(244, 241, 234)");
  await page.click("#theme");
  await expect.poll(() => page.evaluate(() => [document.documentElement.hasAttribute("data-theme"), localStorage.getItem("theme")])).toEqual([false, null]);
});

test("the name fades up on arrival, a line at a time; it is readable once done", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const anim = await page.$$eval(".hero .h1-name > span, .hero .h1-role", (es) => es.map((e) => [getComputedStyle(e).animationName, getComputedStyle(e).animationDelay]));
  expect(anim).toEqual([["name-in", "0s"], ["name-in", "0.12s"], ["name-in", "0.26s"]]);
  await page.waitForTimeout(1300);
  expect(await page.$$eval(".hero .h1-name > span", (es) => es.map((e) => getComputedStyle(e).opacity))).toEqual(["1", "1"]);
});

test.describe("reduced motion, the name", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("the name doesn't animate", async ({ page }) => {
    await page.goto("/");
    expect(await page.$$eval(".hero .h1-name > span", (es) => es.map((e) => getComputedStyle(e).animationName))).toEqual(["none", "none"]);
  });
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
  test("the first screen has the name, the CV, and the availability", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const h = await page.evaluate(() => innerHeight);
    for (const sel of [".hero h1", ".hero .btn.primary", ".avail"]) {
      const b = await page.locator(sel).boundingBox();
      expect(b.y + b.height, sel).toBeLessThan(h);
    }
    await expect(page.locator(".hero")).not.toHaveClass(/\bscrub\b/);
  });
});

test("none of the common AI-default tells: no gradient text, glows, glass, pills or uppercase eyebrow labels", async ({ page }) => {
  for (const path of ["/", "/photography.html", "/404.html", "/drone-racing.html", "/drone-frame.html", "/pipe-climber.html", "/ai-scaling.html"]) {
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
