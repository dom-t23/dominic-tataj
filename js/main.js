// Entry point for the homepage: each module wires up its own part of the page.
import "./hero.js";
import "./contact.js";
import "./replay.js";
import "./hero-flight.js";
import "./rig-button.js";
import "./reveals.js";
import "./sheets.js";
import "./frame3d-boot.js";
// What nothing on the first screen needs (Fig. 01's, 04's and 07's figures, the small extras) waits for the load
// event, so it doesn't compete with the first paint on a slow connection.
addEventListener("load", function () {
  ["./bench.js", "./climber.js", "./scaling.js", "./hello.js", "./cursor.js"].forEach(function (m) { import(m); });
});
