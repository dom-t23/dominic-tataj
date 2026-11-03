// The hero's drone (E-03), drawn offline in Fig. 01's style by tools/hero/: 33 frames of it
// swaying ±24° in 1.5° steps (t00..t32) and 16 of it coming apart (x00..x15). While the page is
// still it sways; scrolling on settles it and takes it apart, the way Fig. 01 does below.
// Neighbouring sway frames are cross-faded, so the steps don't show (explode frames are not:
// their parts move too far between frames, and would show twice). It loads after the load event,
// on wide screens without reduced motion; otherwise the still frame (t16) stays.
import { reducedMotion } from "./util.js";
import { loop } from "./motion.js";

var SWAY = 24, STEP = 1.5, PERIOD = 16, NX = 16, IDLE = 45000;
var link = document.getElementById("hero-drone");
if (link && !reducedMotion() && matchMedia("(min-width: 761px)").matches) {
  var canvas = link.querySelector("canvas"), ctx = canvas.getContext("2d");
  var name = function (p, i) { return "images/hero/" + p + String(i).padStart(2, "0") + ".webp"; };
  var srcs = [], i;
  for (i = 0; i <= 2 * SWAY / STEP; i++) srcs.push(name("t", i));
  for (i = 0; i < NX; i++) srcs.push(name("x", i));
  var imgs = srcs.map(function (s) { var im = new Image(); im.src = s; return im; });
  Promise.all(imgs.map(function (im) { return im.decode(); })).then(start, function () { /* the still stays */ });
}

function start() {
  var T = imgs.slice(0, 33), X = [T[16]].concat(imgs.slice(33));
  var phase = 0, amp = 0, lastInput = performance.now(), shown = "";
  var anim = loop(link, function (dt, now) {
    var p = progress(), still = p < 0.005, idle = now - lastInput > IDLE;
    // sway while the page is still; settle to the middle frame to come apart, or when idle
    amp += ((still && !idle ? 1 : 0) - amp) * (1 - Math.exp(-dt * (still ? 1.5 : 6)));
    if (amp > 1e-3) phase += dt / PERIOD;
    var key;
    if (p > 0.005 && amp < 0.05) key = draw(X, Math.round(p * NX));
    else key = draw(T, (SWAY + SWAY * amp * Math.sin(phase * 2 * Math.PI)) / STEP);
    if (!shown) link.classList.add("live");   // the canvas has a frame: hide the still under it
    shown = key;
    // nothing left to move: stop until the next scroll or pointer move
    return !(idle && amp < 1e-3);
  });
  var wake = function () { lastInput = performance.now(); anim.start(); };
  addEventListener("scroll", wake, { passive: true });
  addEventListener("pointermove", wake, { passive: true });
  canvas.hidden = false;
  anim.start();
}

// 0 at the top of the page; 1 by the time about half of the drawing has scrolled away
function progress() {
  var r = link.getBoundingClientRect(), bottom = r.bottom + scrollY;
  return Math.max(0, Math.min(1, scrollY / (bottom * 0.45)));
}

// frame f of a run, cross-fading into the next; returns which frames were drawn
function draw(run, f) {
  f = Math.max(0, Math.min(run.length - 1, f));
  var a = Math.floor(f), k = f - a, b = Math.min(run.length - 1, a + 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.drawImage(run[a], 0, 0);
  if (k > 0.02 && b !== a) { ctx.globalAlpha = k; ctx.drawImage(run[b], 0, 0); ctx.globalAlpha = 1; }
  return a + ":" + k.toFixed(2);
}
