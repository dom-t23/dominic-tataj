// Design-review metrics (REVIEW.md), written to review/<REVIEW_OUT>/metrics.json.
// Run: npm run screens -- review-metrics. In the "screens" project, so npm test skips it.
// The local server doesn't compress, so "bytes" is what crossed the wire here and "gzip" is an
// estimate of what GitHub Pages would send.
const { test } = require("@playwright/test");
const fs = require("fs");
const zlib = require("zlib");
const { phone } = require("./helpers");

const OUT = `review/${process.env.REVIEW_OUT || "baseline"}`;
const PROFILES = [
  ["phone-throttled", { ...phone, viewport: { width: 375, height: 812 } }, true],
  ["desktop", { viewport: { width: 1440, height: 900 } }, false],
];
const results = {};

test.describe.configure({ mode: "serial" });
test.setTimeout(120000);

function kind(r) {
  const t = r.request().resourceType(), u = r.url();
  if (t === "document") return "html";
  if (t === "stylesheet") return "css";
  if (t === "script") return "js";
  if (t === "image" || /\.(png|jpe?g|webp|svg|avif|gif)(\?|$)/.test(u)) return "images";
  if (t === "font") return "fonts";
  return "other";
}

for (const [name, opts, throttled] of PROFILES) {
  test.describe(name, () => {
    test.use(opts);
    test(`@screens review metrics ${name}`, async ({ page, context }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      if (throttled) {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      }
      await page.addInitScript(() => {
        window.__lcp = null; window.__cls = 0;
        new PerformanceObserver((l) => l.getEntries().forEach((e) => {
          window.__lcp = { t: e.startTime, size: e.size, el: e.element ? (e.element.tagName.toLowerCase() + (e.element.id ? "#" + e.element.id : "") + (e.element.className && typeof e.element.className === "string" ? "." + e.element.className.trim().split(/\s+/).join(".") : "")) : null, url: e.url || null };
        })).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; }))
          .observe({ type: "layout-shift", buffered: true });
      });
      let loaded = false;
      const reqs = [];
      page.on("response", (r) => {
        const phaseLoad = !loaded;
        reqs.push(r.body().then((b) => ({ url: r.url().replace(/^https?:\/\/127\.0\.0\.1:4173\//, ""), kind: kind(r), bytes: b.length, gzip: zlib.gzipSync(b).length, beforeLoad: phaseLoad }))
          .catch(() => ({ url: r.url(), kind: kind(r), bytes: 0, gzip: 0, beforeLoad: phaseLoad })));
      });
      await page.goto("/", { waitUntil: "load" });
      loaded = true;
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      const perf = await page.evaluate(() => ({
        fcp: (performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime,
        lcp: window.__lcp, clsLoad: window.__cls,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        load: performance.timing.loadEventEnd - performance.timing.navigationStart,
      }));
      // CLS over a scroll through the whole page, unthrottled time steps
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 500) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await page.waitForTimeout(80);
      }
      await page.waitForTimeout(1500);
      perf.clsAfterScroll = await page.evaluate(() => window.__cls);
      const all = await Promise.all(reqs);
      const sum = (list) => {
        const by = {};
        for (const r of list) {
          by[r.kind] = by[r.kind] || { count: 0, bytes: 0, gzip: 0 };
          by[r.kind].count++; by[r.kind].bytes += r.bytes; by[r.kind].gzip += r.gzip;
        }
        return { requests: list.length, bytes: list.reduce((a, r) => a + r.bytes, 0), gzip: list.reduce((a, r) => a + r.gzip, 0), byKind: by };
      };
      results[name] = {
        perf,
        firstLoad: sum(all.filter((r) => r.beforeLoad)),
        afterScroll: sum(all),
        files: all.filter((r) => r.beforeLoad).sort((a, b) => b.bytes - a.bytes).map((r) => `${r.kind} ${r.url} ${r.bytes} (${r.gzip} gz)`),
        errors,
      };
      fs.mkdirSync(OUT, { recursive: true });
      fs.writeFileSync(`${OUT}/metrics.json`, JSON.stringify(results, null, 2));
    });
  });
}
