// Performance budget (DESIGN_PLAN.md 0.3). Measured on 25 Oct 2026 for reference: first
// contentful paint about 700 ms throttled (runs vary by ±150 ms), 15 KB of gzipped JS on
// first load; the flight data (10 KB) loads after the load event.
const { test, expect } = require("@playwright/test");
const zlib = require("zlib");
const { phone } = require("./helpers");

test.use(phone);

test("first paint under 1.2 s on a throttled phone; under 60 KB of gzipped JS", async ({ page, context }) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const sizes = [];
  page.on("response", async (r) => {
    if (r.request().resourceType() === "script") sizes.push(r.body().then((b) => zlib.gzipSync(b).length).catch(() => 0));
  });
  await page.goto("/", { waitUntil: "load" });
  const fcp = await page.evaluate(() => (performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime);
  const js = (await Promise.all(sizes)).reduce((a, n) => a + n, 0);
  console.log(`first contentful paint ${Math.round(fcp)} ms, first-load JS ${(js / 1024).toFixed(1)} KB gzipped`);
  expect(fcp).toBeLessThan(1200);
  expect(js).toBeLessThan(60 * 1024);
});

test("scrolling the whole page shifts layout by less than 0.05", async ({ page }) => {
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; }))
      .observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1500);
  const cls = await page.evaluate(() => window.__cls);
  console.log(`cumulative layout shift ${cls.toFixed(3)}`);
  expect(cls).toBeLessThan(0.05);
});

test("no animation loop runs once the page is still", async ({ page }) => {
  await page.addInitScript(() => {
    window.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { window.__raf++; return raf(cb); };
  });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#about").evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(2500);   // let reveals finish
  const before = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => window.__raf) - before).toBe(0);
});
