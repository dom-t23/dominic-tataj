// Which parts of the page animate in as they scroll into view.
import { reveal } from "./motion.js";

// Set up just after the first paint: everything here starts below the fold, and measuring it
// any earlier would hold up that paint on a slow phone.
requestAnimationFrame(function () {
  setTimeout(function () {
    // only the drawings on show: Fig. 03 and 06 have a phone version, and the hidden one is left drawn
    document.querySelectorAll("svg.drawing").forEach(function (el) { if (el.getClientRects().length) reveal(el, "draw"); });
    // (project metadata no longer fills in: it carried no information and was unreadable mid-fade; MOT-12)
    // Key figures no longer count up (design review R-10): a number caught mid-count, or at 0 before
    // it is reached, is a false value, so they show the real one from the first frame.
  });
});
