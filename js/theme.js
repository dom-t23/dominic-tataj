// Light and dark. Dark is the default; the button switches, and the choice is saved. The saved
// theme is applied before first paint by the inline script in each page's <head>.
// Figures that draw with the theme's colours listen for "themechange" (or watch data-theme).
import { root, reducedMotion } from "./util.js";

var btn = document.getElementById("theme");
var meta = document.querySelector('meta[name="theme-color"]');
var COLOUR = { dark: "#141311", light: "#F4F1EA" };

function current() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
function sync() {
  var light = current() === "light";
  if (btn) {
    btn.setAttribute("aria-pressed", String(light));
    btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    btn.querySelector(".tl").textContent = light ? "Dark" : "Light";
  }
  if (meta) meta.content = COLOUR[current()];
}
function apply(theme) {
  if (theme === "light") root.setAttribute("data-theme", "light"); else root.removeAttribute("data-theme");
  try { if (theme === "light") localStorage.setItem("theme", "light"); else localStorage.removeItem("theme"); } catch (e) {}
  sync();
  dispatchEvent(new Event("themechange"));
}

if (btn) {
  btn.hidden = false;
  btn.addEventListener("click", function () {
    var next = current() === "light" ? "dark" : "light";
    // a short cross-fade where view transitions exist; otherwise, or with reduced motion, it just switches
    if (document.startViewTransition && !reducedMotion()) document.startViewTransition(function () { apply(next); });
    else apply(next);
  });
}
sync();
