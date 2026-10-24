// Drone replay: poster, lazy loading, switching, failures and reduced motion.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors, trackFlights, controlsReady } = require("./helpers");

const toPlayer = (page) => page.locator(".player").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));

test("poster loads near the player; LOAD fetches one flight; switching uses a cache", async ({ page }) => {
  const errors = trackErrors(page), reqs = trackFlights(page);
  await page.goto("/", { waitUntil: "networkidle" });
  expect(reqs).toEqual([]);
  await toPlayer(page);
  await page.waitForFunction(() => document.querySelector("#pv-map .rest").hidden);
  expect(reqs).toEqual(["index.js"]);
  // the camera canvas shows a real frame; readouts wait for LOAD
  const lit = await page.evaluate(() => {
    const c = document.getElementById("fpv"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height - 40).data;
    let n = 0; for (let i = 0; i < d.length; i += 4 * 97) if (d[i] + d[i + 1] + d[i + 2] > 120) n++; return n;
  });
  expect(lit).toBeGreaterThan(200);
  await expect(page.locator("#r-out")).toHaveText("–");

  await page.click("#load");
  await controlsReady(page);
  expect(reqs).toEqual(["index.js", "0-default.js"]);
  await expect(page.locator("#r-out")).toContainText("Completed");
  await expect(page.locator("#play")).toHaveText("PAUSE");

  await page.click("#seeds button:nth-child(3)"); await controlsReady(page);
  await page.click("#methods button:nth-child(2)"); await controlsReady(page);
  await expect(page.locator("#r-out")).toHaveText("Missed gate");
  await page.click("#seeds button:nth-child(1)"); await controlsReady(page);
  await page.click("#methods button:nth-child(1)"); await controlsReady(page);
  expect(reqs).toEqual(["index.js", "0-default.js", "2034-default.js", "2034-camera_only.js", "0-camera_only.js"]);

  await page.locator("#scrub").evaluate((s) => { s.value = "100"; s.dispatchEvent(new Event("input")); });
  await expect(page.locator("#clock")).not.toHaveText("0.00 s");
  expect(errors).toEqual([]);
});

test("map and camera panels are the same height side by side", async ({ page }) => {
  await page.goto("/");
  const [a, b] = await Promise.all(["#pv-fpv", "#pv-map"].map((s) => page.locator(s).boundingBox()));
  expect(Math.round(a.height)).toBe(Math.round(b.height));
});

test("a flight that fails to load reverts the pick", async ({ page }) => {
  await page.route("**/flights/1017-default.js", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await page.click("#load"); await controlsReady(page);
  await page.click("#seeds button:nth-child(2)");
  await expect(page.locator("#r-out")).toHaveText("Could not load that flight");
  expect(await page.$$eval("#seeds button", (bs) => bs.map((b) => b.getAttribute("aria-pressed")))).toEqual(["true", "false", "false"]);
});

test("a missing index shows RETRY", async ({ page }) => {
  await page.route("**/flights/index.js", (r) => r.fulfill({ status: 500, body: "" }));
  await page.goto("/");
  await page.click("#load");
  await expect(page.locator("#load")).toHaveText("RETRY");
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("no autoplay, but PLAY plays", async ({ page }) => {
    await page.goto("/");
    await page.click("#load"); await controlsReady(page);
    await expect(page.locator("#play")).toHaveText("PLAY");
    await page.click("#play");
    await expect(page.locator("#clock")).not.toHaveText("0.00 s");
  });
});

test.describe("phone, dark", () => {
  test.use({ ...phone, colorScheme: "dark" });
  test("replay fits and status colours pass contrast", async ({ page }) => {
    await page.goto("/");
    await page.click("#load"); await controlsReady(page);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector(".pill")).color)).toBe("rgb(76, 185, 122)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});
