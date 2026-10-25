// Which parts of the page animate in as they scroll into view.
import { reveal } from "./motion.js";

document.querySelectorAll("svg.drawing").forEach(function (el) { reveal(el, "draw"); });
document.querySelectorAll(".sheet > .tblock").forEach(function (el) { reveal(el, "fill"); });
// Key figures count up once (DESIGN_PLAN.md 2.4). Compound values such as 400×300 or
// P ∝ N^0.55 would read wrong mid-count, so they stay as they are.
document.querySelectorAll(".specs .n, .photo-stats b").forEach(function (el) {
  if (!/[×∝→]/.test(el.textContent)) reveal(el, "count");
});
