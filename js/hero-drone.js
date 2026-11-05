// The hero's drone (E-03), drawn offline in Fig. 01's style by tools/hero/. It hovers: a slow bob
// and roll, its shadow tightening as it dips, and on wide screens a slow turn of ±8° through 33
// frames 0.5° apart, cross-faded so no step shows. Scrolling on, it climbs away. The bob, roll and
// climb are transforms, so they move smoothly at any frame rate. Reduced motion keeps it still;
// phones hover without turning, and never fetch the frames.
import { reducedMotion } from "./util.js";
import { loop } from "./motion.js";

var SWAY = 8, STEP = 0.5, N = 2 * SWAY / STEP + 1;
var BOB = 6, BOB_S = 3.6, ROLL = 0.7, ROLL_S = 7.2, TURN_S = 24;   // px, s, deg, s, s
var CLIMB = 220, IDLE = 45000;                                    // px at the end of the climb, ms

var link = document.getElementById("hero-drone");
if (link && !reducedMotion()) {
  var art = link.querySelector(".hd-art"), shadow = link.querySelector(".hd-shadow");
  var canvas = link.querySelector("canvas"), ctx = canvas.getContext("2d"), frames = null;
  if (matchMedia("(min-width: 761px)").matches) {
    var imgs = [];
    for (var i = 0; i < N; i++) { var im = new Image(); im.src = "images/hero/t" + String(i).padStart(2, "0") + ".webp"; imgs.push(im); }
    Promise.all(imgs.map(function (im) { return im.decode(); })).then(function () { frames = imgs; canvas.hidden = false; }, function () { /* the still stays */ });
  }
  start();
}

function start() {
  var t = 0, amp = 1, lastInput = performance.now(), lastF = -1;
  var anim = loop(link, function (dt, now) {
    var idle = now - lastInput > IDLE;
    amp += ((idle ? 0 : 1) - amp) * (1 - Math.exp(-dt * 1.2));   // settles to rest when idle
    t += dt;
    var w = 2 * Math.PI, bob = BOB * amp * Math.sin(w * t / BOB_S), roll = ROLL * amp * Math.sin(w * t / ROLL_S + 1);
    var p = climb(), lift = CLIMB * p * p;
    art.style.transform = "translate3d(0," + (bob - lift).toFixed(2) + "px,0) rotate(" + roll.toFixed(3) + "deg)";
    // the shadow: tighter and darker as the drone dips towards it, gone as it climbs away
    var low = bob / BOB;   // -1 at the top of the bob, 1 at the bottom (down is +y)
    shadow.style.setProperty("--s", ((1 - 0.35 * p) * (1 - 0.08 * low)).toFixed(3));
    shadow.style.setProperty("--o", ((1 - p) * (0.85 + 0.15 * low)).toFixed(3));
    if (frames) {
      // the cross-fade in tenths of a step: as smooth to the eye, and a redraw only when it changes
      var f = Math.round((SWAY + SWAY * amp * Math.sin(w * t / TURN_S)) / STEP * 10) / 10;
      if (f !== lastF) { draw(f); lastF = f; }
    }
    return !(idle && amp < 1e-3);   // at rest: stop until the next scroll or pointer move
  });
  var wake = function () { lastInput = performance.now(); anim.start(); };
  addEventListener("scroll", wake, { passive: true });
  addEventListener("pointermove", wake, { passive: true });
  anim.start();
}

// 0 at the top of the page; 1 once about half of the drawing has scrolled away
function climb() {
  var r = link.getBoundingClientRect();
  return Math.max(0, Math.min(1, scrollY / ((r.bottom + scrollY) * 0.6)));
}

// sway frame f, cross-fading into the next
function draw(f) {
  f = Math.max(0, Math.min(N - 1, f));
  var a = Math.floor(f), k = f - a, b = Math.min(N - 1, a + 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.drawImage(frames[a], 0, 0);
  if (k > 0.01 && b !== a) { ctx.globalAlpha = k; ctx.drawImage(frames[b], 0, 0); ctx.globalAlpha = 1; }
  if (!link.classList.contains("live")) link.classList.add("live");   // the canvas has a frame: hide the still under it
}
