// Drone replay: poster, lazy loading, switching, failures and reduced motion.
const { test, expect } = require("@playwright/test");
const { phone, trackErrors, trackFlights, controlsReady } = require("./helpers");

const toPlayer = (page) => page.locator(".player").evaluate((e) => e.scrollIntoView({ behavior: "instant", block: "center" }));

test("poster reuses the index; LOAD fetches one flight; switching uses a cache", async ({ page }) => {
  const errors = trackErrors(page), reqs = trackFlights(page);
  await page.goto("/drone-racing.html", { waitUntil: "networkidle" });
  expect(reqs).toEqual(["index.js"]);   // fetched at load for the hero's flight strip
  await toPlayer(page);
  await page.waitForFunction(() => document.querySelector("#pv-map .rest").hidden);
  expect(reqs).toEqual(["index.js"]);
  // the camera canvas shows a real frame; readouts wait for LOAD
  const lit = await page.evaluate(() => {
    const c = document.getElementById("fpv"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height - 40).data;
    let n = 0; for (let i = 0; i < d.length; i += 4 * 97) if (d[i] + d[i + 1] + d[i + 2] > 120) n++; return n;
  });
  expect(lit).toBeGreaterThan(200);
  await expect(page.locator("#readout")).toBeHidden();   // no dashes before LOAD (R-05)

  await page.click("#load");
  await controlsReady(page);
  expect(reqs).toEqual(["index.js", "1017-default.js"]);
  await expect(page.locator("#r-out")).toContainText("Completed");
  await expect(page.locator("#play")).toHaveText("Pause");

  // course 3 in the clutter world: with the IMU it takes a distractor for the gate
  await page.click("#seeds button:nth-child(3)"); await controlsReady(page);
  await expect(page.locator("#r-out")).toHaveText("Missed gate");
  await page.click("#methods button:nth-child(2)"); await controlsReady(page);
  await expect(page.locator("#r-out")).toContainText("Completed");
  await page.click("#seeds button:nth-child(1)"); await controlsReady(page);
  await page.click("#methods button:nth-child(1)"); await controlsReady(page);
  expect(reqs).toEqual(["index.js", "1017-default.js", "0-default.js", "0-camera_only.js", "1017-camera_only.js"]);

  await page.locator("#scrub").evaluate((s) => { s.value = "100"; s.dispatchEvent(new Event("input")); });
  await expect(page.locator("#clock")).not.toHaveText("0.00 s");
  expect(errors).toEqual([]);
});

test("map and camera panels are the same height side by side", async ({ page }) => {
  await page.goto("/drone-racing.html");
  const [a, b] = await Promise.all(["#pv-fpv", "#pv-map"].map((s) => page.locator(s).boundingBox()));
  expect(Math.round(a.height)).toBe(Math.round(b.height));
});

test("a flight that fails to load reverts the pick", async ({ page }) => {
  await page.route("**/flights/2034-default.js", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/drone-racing.html");
  await page.click("#load"); await controlsReady(page);
  await page.click("#seeds button:nth-child(2)");
  await expect(page.locator("#r-out")).toHaveText("Could not load that flight");
  expect(await page.$$eval("#seeds button", (bs) => bs.map((b) => b.getAttribute("aria-pressed")))).toEqual(["true", "false", "false"]);
});

test("a missing index shows RETRY", async ({ page }) => {
  await page.route("**/flights/index.js", (r) => r.fulfill({ status: 500, body: "" }));
  await page.goto("/drone-racing.html");
  await page.click("#load");
  await expect(page.locator("#load")).toHaveText("Retry");
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("no autoplay, but PLAY plays", async ({ page }) => {
    await page.goto("/drone-racing.html");
    await page.click("#load"); await controlsReady(page);
    await expect(page.locator("#play")).toHaveText("Play");
    await page.click("#play");
    await expect(page.locator("#clock")).not.toHaveText("0.00 s");
  });
});

test.describe("phone", () => {
  test.use(phone);
  test("replay fits and status colours pass contrast", async ({ page }) => {
    await page.goto("/drone-racing.html");
    await page.click("#load"); await controlsReady(page);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector(".pill")).color)).toBe("rgb(134, 201, 154)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test("playback holds while the player is off screen and resumes where it stopped (PERF-06)", async ({ page }) => {
  await page.addInitScript(() => {
    window.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { window.__raf++; return raf(cb); };
  });
  await page.goto("/drone-racing.html", { waitUntil: "networkidle" });
  await toPlayer(page);
  await page.click("#load");
  await controlsReady(page);
  await expect(page.locator("#play")).toHaveText("Pause");
  await page.locator(".foot").evaluate((e) => e.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(2500);   // let other reveals settle
  const before = await page.evaluate(() => window.__raf), at = await page.inputValue("#scrub");
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => window.__raf) - before).toBe(0);
  expect(await page.inputValue("#scrub")).toBe(at);
  await toPlayer(page);
  await expect.poll(() => page.inputValue("#scrub")).not.toBe(at);
});
