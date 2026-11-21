// Browser tests for the site. Run: npm test (assertions) or npm run screens (review shots).
// First time on a new machine: npm install && npx playwright install chromium
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 60000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    // lets headless Chromium fall back to software WebGL, so Fig. 01 (three.js) renders
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
    trace: "retain-on-failure"
  },
  webServer: {
    // gzips text like GitHub Pages, so the performance test sees realistic sizes (tests/serve.cjs)
    command: "node tests/serve.cjs 4173",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: true,
    stdout: "ignore",
    stderr: "ignore"
  }
});
