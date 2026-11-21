// What animates in as it scrolls into view (js/motion.js): only the engineering drawings, which draw
// themselves. Nothing on the first screen, nothing for reduced motion or without JS, each once.
import { reveal } from "./motion.js";

// Set up just after the first paint: everything here starts below the fold, and measuring it
// any earlier would hold up that paint on a slow phone.
requestAnimationFrame(function () {
  setTimeout(function () {
    // No generic fade-ins for text or sections: the one orchestrated moment is the hero's drone.
    // only the drawings on show: Fig. 03 and 06 have a phone version, and the hidden one is left drawn
    document.querySelectorAll("svg.drawing").forEach(function (el) { if (el.getClientRects().length) reveal(el, "draw"); });
    // Key figures don't count up (design review R-10): a number caught mid-count is a false value.
  });
});
