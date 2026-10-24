import { $, root, sysDark } from "./util.js";

/* ---------- theme toggle ---------- */
function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : !!(sysDark && sysDark.matches); }
function syncThemeBtn() {
  var d = isDark();
  $("theme").textContent = d ? "LIGHT" : "DARK";
  $("theme").setAttribute("aria-label", d ? "Switch to light theme" : "Switch to dark theme");
}
$("theme").addEventListener("click", function () {
  var t = isDark() ? "light" : "dark", sys = sysDark && sysDark.matches ? "dark" : "light";
  // Choosing the system theme clears the override, so the page follows the system again.
  if (t === sys) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", t);
  try { if (t === sys) localStorage.removeItem("theme"); else localStorage.setItem("theme", t); } catch (e) {}
  syncThemeBtn();
});
if (sysDark && sysDark.addEventListener) sysDark.addEventListener("change", syncThemeBtn);
syncThemeBtn(); $("theme").hidden = false;
