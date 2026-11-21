// Design-review screenshots (design review, Nov 2026). Run: npm run screens -- review-capture
// Saves full-page and above-the-fold shots at four sizes, light and dark, plus a phone run with
// reduced motion, to review/<REVIEW_OUT>/ (default "baseline"; "after" for the re-audit).
// In the "screens" project (playwright.config.js), so npm test skips it.
const { test } = require("@playwright/test");
const { phone } = require("./helpers");

const OUT = `review/${process.env.REVIEW_OUT || "baseline"}`;
const SIZES = [
  ["phone", { ...phone, viewport: { width: 375, height: 812 } }],
  ["tablet", { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 }],
  ["laptop", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  ["desktop", { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }],
];

// ANGLE's software renderer, as in frame3d.spec.js, so Fig. 02 renders whole
test.use({ launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });
test.setTimeout(180000);

// Scroll the whole page once so every reveal plays, every lazy image loads and Fig. 02 starts;
// then wait for fonts, images and the figures that draw themselves once near.
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => Math.round(innerHeight * 0.6));
  for (let y = 0; y < height + step; y += step) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(120);
  }
  await page.locator(".f3-view.ready").waitFor({ timeout: 30000 }).catch(() => {});
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);   // count-ups and draws finish (about 0.9 s)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(1200);   // the hero strip has a moment to fly
}

// A full-page capture paints beyond the viewport, where the browser skips sheets that use
// content-visibility: auto; lay them all out for the capture only. The pinned Fig. 02 still
// shows as tall white space: on screen that height is scroll that turns the model.
const PAINT_ALL = ".sheet { content-visibility: visible !important; }";

// The whole page, in parts: one capture taller than about 8192 device pixels repeats the top of
// the page in software-rendered Chromium, so each part stays under that.
async function fullPage(page, base) {
  const [w, h, dpr] = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollHeight, devicePixelRatio]);
  const step = Math.floor(8000 / dpr);
  for (let y = 0, k = 1; y < h; y += step, k++) {
    await page.screenshot({ path: `${base}-${k}.png`, fullPage: true, clip: { x: 0, y, width: w, height: Math.min(step, h - y) } });
  }
}

async function capture(page, name, sequence) {
  await page.goto("/", { waitUntil: "networkidle" });
  await settle(page);
  await page.screenshot({ path: `${OUT}/${name}-fold.png` });
  const tag = await page.addStyleTag({ content: PAINT_ALL });
  await page.waitForTimeout(300);
  await fullPage(page, `${OUT}/${name}-full`);
  await tag.evaluate((t) => t.remove());
  if (!sequence) return;
  // what a visitor sees screen by screen, scrolling down the page
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => innerHeight);
  for (let i = 0, y = 0; y < height; i++, y += vh) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${OUT}/scroll/${name}-${String(i).padStart(2, "0")}.png` });
  }
}

for (const [size, opts] of SIZES) {
  for (const theme of ["light", "dark"]) {
    test.describe(`${size} ${theme}`, () => {
      test.use(opts);
      test(`@screens review ${size} ${theme}`, async ({ page }) => {
        if (theme === "dark") await page.addInitScript(() => localStorage.setItem("theme", "dark"));
        await capture(page, `${size}-${theme}`, theme === "light" && (size === "phone" || size === "laptop"));
      });
    });
  }
}

test.describe("phone reduced motion", () => {
  test.use({ ...SIZES[0][1], contextOptions: { reducedMotion: "reduce" } });
  test("@screens review phone light reduced-motion", async ({ page }) => {
    // reduced motion: everything must be there from the first frame, so no settling scroll
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${OUT}/phone-light-reduced-fold.png` });
    await page.addStyleTag({ content: PAINT_ALL });
    await fullPage(page, `${OUT}/phone-light-reduced-full`);
  });
});
