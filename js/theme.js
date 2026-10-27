import { $, root, sysDark, reducedMotion } from "./util.js";

/* ---------- theme toggle ---------- */
function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : !!(sysDark && sysDark.matches); }
function syncThemeBtn() {
  var d = isDark();
  $("theme").textContent = d ? "LIGHT" : "DARK";
  $("theme").setAttribute("aria-label", d ? "Switch to light theme" : "Switch to dark theme");
}
$("theme").addEventListener("click", function () {
  var t = isDark() ? "light" : "dark", sys = sysDark && sysDark.matches ? "dark" : "light";
  function apply() {
    // Choosing the system theme clears the override, so the page follows the system again.
    if (t === sys) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", t);
    try { if (t === sys) localStorage.removeItem("theme"); else localStorage.setItem("theme", t); } catch (e) {}
    syncThemeBtn();
  }
  // Like a print coming off a light table (DESIGN_PLAN.md 2.5): the new theme spreads in a
  // circle from the button. Where view transitions aren't supported, or with reduced motion,
  // it just switches.
  if (!document.startViewTransition || reducedMotion()) { apply(); return; }
  var b = this.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
  var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(function () {
    root.animate({ clipPath: ["circle(0 at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
      { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" });
  }, function () {});
});
if (sysDark && sysDark.addEventListener) sysDark.addEventListener("change", syncThemeBtn);
syncThemeBtn(); $("theme").hidden = false;
