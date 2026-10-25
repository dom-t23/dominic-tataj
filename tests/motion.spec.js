// Motion system: reveals, loops, reduced motion and print.
const { test, expect } = require("@playwright/test");

// elements waiting for a reveal (the nav's progress bar legitimately sits at scaleX(0))
const prepared = (page) => page.evaluate(() =>
  document.querySelectorAll('[style*="opacity: 0"], [style*="scaleX(0)"]:not(#progress), [style*="stroke-dashoffset"]').length);
const jump = (page, sel) => page.locator(sel).first().evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));

test("first screen is never hidden; figures draw and title blocks fill when reached", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  expect(await page.evaluate(() => [...document.querySelectorAll(".hero *")].filter((e) => e.style.opacity === "0").length)).toBe(0);
  expect(await prepared(page)).toBeGreaterThan(20);
  await jump(page, "#e-03 > .tblock");
  await jump(page, "#e-03 svg.drawing");
  await expect.poll(() => page.locator("#e-03 svg.drawing *[style]").count(), { timeout: 8000 }).toBe(0);
  expect(await page.locator("#e-03 > .tblock > div").evaluateAll((ds) => ds.every((d) => getComputedStyle(d).opacity === "1"))).toBe(true);
});

test("count keeps the original formatting", async ({ page }) => {
  await page.goto("/");
  const seen = await page.evaluate(async () => {
    const m = await import("/js/motion.js");
    const el = document.createElement("div");
    el.innerHTML = "<b>390,000+</b> and <span>−36.5%</span>"; el.style.marginTop = "3000px";
    document.querySelector(".foot").appendChild(el);
    m.reveal(el, "count");
    const start = el.textContent;
    el.scrollIntoView({ behavior: "instant" });
    await new Promise((r) => setTimeout(r, 1500));
    return [start, el.textContent];
  });
  expect(seen).toEqual(["0+ and −36.5%", "390,000+ and −36.5%"]);
});

test("loop runs only while its element is on screen", async ({ page }) => {
  await page.goto("/");
  const [on, off] = await page.evaluate(async () => {
    const m = await import("/js/motion.js"), wait = (t) => new Promise((r) => setTimeout(r, t));
    let n = 0; const l = m.loop(document.querySelector(".hero h1"), () => { n++; });
    l.start(); await wait(300);
    const on = n;
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }); await wait(200);
    const a = n; await wait(300);
    l.stop();
    return [on, n - a];
  });
  expect(on).toBeGreaterThan(5);
  expect(off).toBe(0);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("nothing is hidden or prepared", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await prepared(page)).toBe(0);
  });
});

test("printing shows everything", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  expect(await prepared(page)).toBe(0);
});
