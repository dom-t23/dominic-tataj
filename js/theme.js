import { $, root, reducedMotion } from "./util.js";

/* ---------- theme toggle ---------- */
// Light first: the page is light unless the visitor chooses dark here, whatever their device's
// setting. The choice is saved; choosing light again clears it.
function isDark() { return root.getAttribute("data-theme") === "dark"; }
function syncThemeBtn() {
  var d = isDark();
  $("theme").textContent = d ? "Light mode" : "Dark mode";
  $("theme").setAttribute("aria-label", d ? "Switch to light theme" : "Switch to dark theme");
}
$("theme").addEventListener("click", function () {
  var dark = !isDark();
  function apply() {
    if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    try { if (dark) localStorage.setItem("theme", "dark"); else localStorage.removeItem("theme"); } catch (e) {}
    syncThemeBtn();
    var tc = $("theme-color"); if (tc) tc.content = dark ? "#0E1012" : "#F7F6F3";
  }
  // The new theme spreads in a circle from the button. Where view transitions aren't supported,
  // or with reduced motion, it just switches.
  if (!document.startViewTransition || reducedMotion()) { apply(); return; }
  var b = this.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
  var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(function () {
    root.animate({ clipPath: ["circle(0 at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
      { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" });
  }, function () {});
});
syncThemeBtn();
