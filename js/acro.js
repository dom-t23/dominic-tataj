// Acro mode (DESIGN_PLAN.md 2.7). Type "fpv" anywhere outside a text field and the page flies
// in acro mode for 10 s, as if a pilot flicked the mode switch: the nav reads ACRO with a
// countdown, the page tilts 2° and rights itself like a drone catching a gust, and the hero's
// drone flips. With reduced motion only the badge shows. Hinted at the foot of the page and
// in the console note (js/hello.js).
import { reducedMotion } from "./util.js";
import { flip } from "./hero-flight.js";

var WORD = "fpv", SECONDS = 10;
var typed = "", left = 0, timer = 0, badge = null, main = document.querySelector("main");

addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;
  var t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
  if (typed === WORD) { typed = ""; acro(); }
});

export function acro() {
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "acro-badge";
    badge.setAttribute("role", "status");
    document.querySelector(".nav .brand").appendChild(badge);
  }
  left = SECONDS;
  badge.hidden = false;
  badge.textContent = "ACRO " + left;
  document.documentElement.classList.add("acro");
  clearInterval(timer);
  timer = setInterval(function () {
    left--;
    if (left > 0) { badge.textContent = "ACRO " + left; return; }
    clearInterval(timer);
    badge.hidden = true;
    document.documentElement.classList.remove("acro");
  }, 1000);
  if (reducedMotion() || !main) return;
  // tilt about the middle of the screen, and start the wobble over if it is already going
  main.style.transformOrigin = "50% " + Math.round(scrollY + innerHeight / 2 - main.offsetTop) + "px";
  main.classList.remove("tilt");
  void main.offsetWidth;
  main.classList.add("tilt");
  flip();
}

if (main) main.addEventListener("animationend", function (e) {
  if (e.target === main) { main.classList.remove("tilt"); main.style.transformOrigin = ""; }
});
