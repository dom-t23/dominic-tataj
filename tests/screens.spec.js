// Review screenshots for checkpoints (npm run screens), saved to test-results/screens/.
// Not compared against baselines: fonts render slightly differently on every machine.
const { test } = require("@playwright/test");
const { phone } = require("./helpers");

const SECTIONS = [["hero", ".hero"], ["frame", "#e-03"], ["racing", "#e-04"], ["robot", "#e-02"],
  ["ai-cost", "#e-01"], ["about", "#about"], ["contact", "#contact"]];
const VIEWS = ["assembly", "exploded", "frame-only"];   // Fig. 01

// ANGLE's software renderer, as in frame3d.spec.js, so Fig. 01 renders whole
test.use({ launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

for (const [device, opts] of [["desktop", {}], ["phone", phone]]) {
  for (const scheme of ["light", "dark"]) {
    test.describe(`${device} ${scheme}`, () => {
      test.use({ ...opts, colorScheme: scheme, contextOptions: { reducedMotion: "reduce" } });
      test(`@screens ${device} ${scheme}`, async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" });
        await page.evaluate(() => window.scrollBy(0, 1));
        await page.locator("#frame3d").scrollIntoViewIfNeeded();
        await page.locator(".f3-view.ready").waitFor({ timeout: 30000 });
        for (const [name, sel] of SECTIONS) {
          await page.locator(sel).screenshot({ path: `test-results/screens/${device}-${scheme}-${name}.png` });
        }
        // reduced motion: the view buttons switch views at once
        for (const [i, view] of VIEWS.entries()) {
          await page.click(`.f3-steps button:nth-child(${i + 1})`);
          await page.locator(".f3-view.still").waitFor();
          await page.locator("#frame3d").screenshot({ path: `test-results/screens/${device}-${scheme}-fig01-${view}.png` });
        }
      });
    });
  }
}
