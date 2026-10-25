// Nav sheet counter and scroll progress (DESIGN_PLAN.md 2.2): the page is a drawing set, and
// the nav says which sheet you are on. Work happens only on scroll and resize.
import { $ } from "./util.js";

var SHEETS = [[".hero", "COVER"], ["#e-03", "E-03"], ["#e-04", "E-04"], ["#e-02", "E-02"],
  ["#e-01", "E-01"], ["#about", "ABOUT"], ["#contact", "CONTACT"]];
var label = $("sheet-no"), num = label.querySelector("b"), name = label.querySelector("span"), bar = $("progress");
var els = SHEETS.map(function (s) { return document.querySelector(s[0]); });
var cur = 0, queued = false;

function update() {
  queued = false;
  var max = document.documentElement.scrollHeight - innerHeight, line = innerHeight * 0.4, n = 0;
  els.forEach(function (el, i) { if (el && el.getBoundingClientRect().top <= line) n = i; });
  if (max > 0 && scrollY >= max - 2) n = els.length - 1;   // the last sheet may be too short to reach the line
  bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0).toFixed(4) + ")";
  if (n === cur) return;
  cur = n;
  num.textContent = String(n + 1); name.textContent = SHEETS[n][1];
  label.classList.remove("tick"); void label.offsetWidth; label.classList.add("tick");
}
function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }

num.nextSibling.nodeValue = "/" + SHEETS.length + " ";   // the total follows SHEETS
label.hidden = false;
addEventListener("scroll", queue, { passive: true });
addEventListener("resize", queue);
update();
