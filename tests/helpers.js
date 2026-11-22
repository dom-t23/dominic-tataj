// Shared test helpers.
const { devices } = require("@playwright/test");

// iPhone 13 metrics in Chromium (the device preset defaults to WebKit).
const phone = (({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent }) =>
  ({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent }))(devices["iPhone 13"]);

// Collects page errors and console errors; assert with expect(errors).toEqual([]).
function trackErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

// Records the file names of replay data requests (flights/*.js).
function trackFlights(page) {
  const reqs = [];
  page.on("request", (r) => { if (r.url().includes("/flights/")) reqs.push(r.url().split("/").pop()); });
  return reqs;
}

const controlsReady = (page) =>
  page.waitForFunction(() => document.getElementById("controls").getAttribute("aria-disabled") === "false");

// Starts the replay: presses LOAD unless the replay has already pressed it itself (js/replay.js
// loads on its own when half the player is in view on a fast connection). One step in the page,
// so the two can't race.
const startReplay = (page) => page.evaluate(() => {
  const b = document.getElementById("load");
  if (!b.disabled && !b.closest(".rest").hidden) b.click();
});
module.exports = { phone, trackErrors, trackFlights, controlsReady, startReplay };
