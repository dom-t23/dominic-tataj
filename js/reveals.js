// Which parts of the page animate in as they scroll into view (js/motion.js). Nothing on the
// first screen does, nothing is hidden for reduced motion or without JS, and each effect plays once.
import { reveal } from "./motion.js";

// Set up just after the first paint: everything here starts below the fold, and measuring it
// any earlier would hold up that paint on a slow phone.
requestAnimationFrame(function () {
  setTimeout(function () {
    // section heads lift in, eyebrow first; the cards follow one after another, so the eye
    // reads them in order, newest first
    document.querySelectorAll(".section-head").forEach(function (el) { reveal(el, "lift"); });
    reveal(document.getElementById("cards"), "lift");
    // in each write-up, the key figures arrive as a row
    document.querySelectorAll(".sheet .specs").forEach(function (el) { reveal(el, "fill"); });
    reveal(document.querySelector(".photo-teaser"), "rise");
    // only the drawings on show: Fig. 03 and 06 have a phone version, and the hidden one is left drawn
    document.querySelectorAll("svg.drawing").forEach(function (el) { if (el.getClientRects().length) reveal(el, "draw"); });
    // Key figures don't count up (design review R-10): a number caught mid-count is a false value.
  });
});
