// Drafting cursor (DESIGN_PLAN.md 2.1), for a mouse on a desktop only. The pointer stays as it
// is; four short crosshair ticks follow it, and a corner readout gives its position on the page
// as on a 1:1 drawing sheet (96 px to the inch, so 1 px = 0.2646 mm). Hidden over controls and
// the interactive figures, which have cursors of their own, and with reduced motion.
import { reducedMotion } from "./util.js";

var MM = 25.4 / 96;
var SKIP = "a, button, input, select, textarea, canvas, .rig-svg, .f3-view, .bench-chart";
var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (fine && !reducedMotion()) {
  var ticks = document.createElement("div"), read = document.createElement("div");
  ticks.className = "dc-ticks"; read.className = "dc-read";
  ticks.setAttribute("aria-hidden", "true"); read.setAttribute("aria-hidden", "true");
  document.body.append(ticks, read);
  var x = 0, y = 0, on = false, queued = false;

  var update = function () {
    queued = false;
    ticks.style.transform = "translate(" + x + "px, " + y + "px)";
    read.textContent = "X " + ((x + scrollX) * MM).toFixed(1) + "  Y " + ((y + scrollY) * MM).toFixed(1) + " MM";
  };
  var queue = function () { if (!queued) { queued = true; requestAnimationFrame(update); } };
  var show = function (v) { if (v !== on) { on = v; document.documentElement.classList.toggle("dc-on", v); } };

  addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") { show(false); return; }
    x = e.clientX; y = e.clientY;
    show(!(e.target.closest && e.target.closest(SKIP)));
    queue();
  }, { passive: true });
  addEventListener("scroll", function () { if (on) queue(); }, { passive: true });
  document.documentElement.addEventListener("pointerleave", function () { show(false); });
  addEventListener("blur", function () { show(false); });
}
