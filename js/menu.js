// The Work menu in the nav (a native <details>, so it opens without JS and from the keyboard).
// With JS it also closes on Escape (focus back on "Work"), on a click outside it, when focus
// leaves it, and when a link in it is followed.
var menu = document.getElementById("work-menu");
if (menu) {
  var summary = menu.querySelector("summary");
  function close(refocus) { if (!menu.open) return; menu.open = false; if (refocus) summary.focus(); }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(menu.contains(document.activeElement)); });
  document.addEventListener("pointerdown", function (e) { if (!menu.contains(e.target)) close(false); });
  menu.addEventListener("focusout", function (e) { if (e.relatedTarget && !menu.contains(e.relatedTarget)) close(false); });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { close(false); }); });
}
