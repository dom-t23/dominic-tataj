// Entry point for a project page (drone-racing.html and the others). Each page has some of the
// figures, so each figure's module loads only if its figure is here.
import "./theme.js";
import "./menu.js";
import "./more.js";
import "./anchors.js";
import "./reveals.js";
import "./sheets.js";
import { $ } from "./util.js";

// what the first screen may need, now
if ($("fv")) { import("./hero-flight.js"); import("./rig-button.js"); }   // Fig. 00, E-04
if ($("fpv")) import("./replay.js");                                      // the replay and its pipeline strip, E-04
if ($("f3-track")) import("./frame3d-boot.js");                           // Fig. 02, E-03 (three.js when near)

// the rest after the load event, so it doesn't compete with the first paint
addEventListener("load", function () {
  if ($("bench")) import("./bench.js");                                   // Fig. 01, E-04
  if ($("climb-fig")) import("./climber.js");                             // Fig. 05, E-02
  if ($("scaling-fig")) import("./scaling.js");                           // Fig. 08, E-01
  import("./cursor.js");
});
