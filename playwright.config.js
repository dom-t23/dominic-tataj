// Browser tests for the site. Run: npm test (assertions) or npm run screens (review shots).
// First time on a new machine: npm install && npx playwright install chromium
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 60000,
  fullyParallel: true,
  // three.js renders in software WebGL here, which is CPU-heavy: more workers than this made the
  // 3D-figure tests time out on a laptop (REVIEW.md, baseline NOTES)
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    // lets headless Chromium fall back to software WebGL, so Fig. 02 (three.js) renders
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
    trace: "retain-on-failure"
  },
  // npm test runs "site", then "perf" on its own: the performance budget times a throttled CPU, and
  // sharing the machine with the parallel tests made its first-paint figure flaky. npm run screens
  // runs "screens": review screenshots and metrics, not assertions.
  projects: [
    { name: "site", testIgnore: [/perf\.spec\.js/, /screens\.spec\.js/, /review-.*\.spec\.js/] },
    { name: "perf", testMatch: /perf\.spec\.js/, dependencies: ["site"], fullyParallel: false },
    { name: "screens", testMatch: [/screens\.spec\.js/, /review-.*\.spec\.js/] },
  ],
  webServer: {
    // gzips text like GitHub Pages, so the performance test sees realistic sizes (tests/serve.cjs)
    command: "node tests/serve.cjs 4173",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: true,
    stdout: "ignore",
    stderr: "ignore"
  }
});
