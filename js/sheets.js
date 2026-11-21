// Sheets skip layout while off screen (content-visibility: auto in site.css), which speeds up the
// first paint. Once the page has loaded, lay each one out once, so the browser remembers its real
// height: a link down the page then lands on its sheet, not short of it.
addEventListener("load", function () {
  var sheets = document.querySelectorAll(".sheet");
  sheets.forEach(function (s) { s.style.contentVisibility = "visible"; });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { sheets.forEach(function (s) { s.style.contentVisibility = ""; if (!s.getAttribute("style")) s.removeAttribute("style"); }); });
  });
});
// On a phone a sheet's real height can still differ from the remembered one (figures size
// themselves after load), so a link down the page could land short of its target (design review,
// verification round 1). Before the first in-page jump, lay every sheet out for good.
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  document.querySelectorAll(".sheet").forEach(function (s) { s.style.contentVisibility = "visible"; });
}, true);
