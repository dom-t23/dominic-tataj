// Review screenshots for checkpoints (npm run screens), saved to test-results/screens/.
// Not compared against baselines: fonts render slightly differently on every machine.
const { test } = require("@playwright/test");
const { phone } = require("./helpers");

const SECTIONS = [["hero", ".hero"], ["frame", "#e-03"], ["racing", "#e-04"], ["robot", "#e-02"],
  ["ai-cost", "#e-01"], ["about", "#about"], ["contact", "#contact"]];

for (const [device, opts] of [["desktop", {}], ["phone", phone]]) {
  for (const scheme of ["light", "dark"]) {
    test.describe(`${device} ${scheme}`, () => {
      test.use({ ...opts, colorScheme: scheme, contextOptions: { reducedMotion: "reduce" } });
      test(`@screens ${device} ${scheme}`, async ({ page }) => {
        await page.goto("/", { waitUntil: "networkidle" });
        for (const [name, sel] of SECTIONS) {
          await page.locator(sel).screenshot({ path: `test-results/screens/${device}-${scheme}-${name}.png` });
        }
      });
    });
  }
}
