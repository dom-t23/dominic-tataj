// Performance budget (DESIGN_PLAN.md 0.3). The test server (tests/serve.cjs) gzips like GitHub
// Pages. Measured on 21 Nov 2026: first contentful paint about 0.9 s throttled (runs vary by
// ±150 ms), about 19 KB of gzipped JS requested before the load event.
const { test, expect } = require("@playwright/test");
const { phone } = require("./helpers");

test.use(phone);

test("first paint under 1.2 s on a throttled phone; under 60 KB of gzipped JS", async ({ page, context }) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/", { waitUntil: "load" });
  const fcp = await page.evaluate(() => (performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime);
  // scripts requested before the load event (what nothing on the first screen needs waits for it),
  // as sent: the test server gzips them as GitHub Pages does
  const js = await page.evaluate(() => {
    const load = performance.getEntriesByType("navigation")[0].loadEventStart;
    return performance.getEntriesByType("resource").filter((e) => /\.js(\?|$)/.test(e.name) && e.startTime < load)
      .reduce((a, e) => a + e.encodedBodySize, 0);
  });
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
