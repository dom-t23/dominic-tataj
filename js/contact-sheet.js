// About's contact sheet (DESIGN_PLAN.md 4.2): the strip scrolls sideways on its own (touch, trackpad,
// shift + wheel, arrow keys once focused); these buttons page it for a mouse.
import { $, reducedMotion } from "./util.js";

var film = document.querySelector(".film"), prev = $("cs-prev"), next = $("cs-next");
if (film && prev && next) {
  var frames = Array.prototype.slice.call(film.querySelectorAll("li")), pad = 18;
  var go = function (x) { film.scrollTo({ left: x, behavior: reducedMotion() ? "auto" : "smooth" }); };
  // a page at a time: the first frame cut off at the edge becomes the first one shown
  next.addEventListener("click", function () {
    var end = film.scrollLeft + film.clientWidth, f = frames.find(function (li) { return li.offsetLeft + li.offsetWidth > end + 1; });
    go(f ? f.offsetLeft - pad : film.scrollWidth);
  });
  prev.addEventListener("click", function () {
    var at = film.scrollLeft, from = at - film.clientWidth;
    var f = frames.find(function (li) { return li.offsetLeft - pad >= from - 1 && li.offsetLeft - pad < at - 1; });
    go(f ? f.offsetLeft - pad : 0);
  });
  var ends = function () {
    prev.disabled = film.scrollLeft < 2;
    next.disabled = film.scrollLeft + film.clientWidth > film.scrollWidth - 2;
  };
  film.addEventListener("scroll", ends, { passive: true });
  window.addEventListener("resize", ends);
  ends();
  prev.parentNode.hidden = false;
}
