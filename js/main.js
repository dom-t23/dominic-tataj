// Entry point: each module wires up its own part of the page.
import "./theme.js";
import "./contact.js";
import "./replay.js";
import "./hero-flight.js";
import "./rig-button.js";
import "./reveals.js";
import "./sheets.js";
import "./frame3d-boot.js";
// What nothing on the first screen needs (Fig. 03's chart, the small quirks) waits for the load
// event, so it doesn't compete with the first paint on a slow connection.
addEventListener("load", function () {
  ["./bench.js", "./acro.js", "./hello.js", "./cursor.js", "./clouds.js"].forEach(function (m) { import(m); });
});
