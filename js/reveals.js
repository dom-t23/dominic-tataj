// Which parts of the page animate in as they scroll into view.
import { reveal } from "./motion.js";

// Set up just after the first paint: everything here starts below the fold, and measuring it
// any earlier would hold up that paint on a slow phone.
requestAnimationFrame(function () {
  setTimeout(function () {
    document.querySelectorAll("svg.drawing").forEach(function (el) { reveal(el, "draw"); });
    document.querySelectorAll(".sheet-meta").forEach(function (el) { reveal(el, "fill"); });
    // Key figures no longer count up (REVIEW.md R-10): a number caught mid-count, or at 0 before
    // it is reached, is a false value, so they show the real one from the first frame.
  });
});
