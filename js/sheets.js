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
