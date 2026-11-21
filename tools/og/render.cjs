// Renders the link preview, og-image.png (1200 × 630), from tools/og/og.html with this repo's
// Playwright Chromium, with the self-hosted fonts and the hero drawing.
//   node tools/og/render.cjs
const { chromium } = require("@playwright/test");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.resolve(__dirname, "og.html"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.resolve(__dirname, "../../og-image.png") });
  await browser.close();
  console.log("og-image.png written");
})();
