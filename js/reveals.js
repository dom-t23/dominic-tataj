// Which parts of the page animate in as they scroll into view.
import { reveal } from "./motion.js";

document.querySelectorAll("svg.drawing").forEach(function (el) { reveal(el, "draw"); });
document.querySelectorAll(".sheet > .tblock").forEach(function (el) { reveal(el, "fill"); });
