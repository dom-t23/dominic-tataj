// The hero's drone (rendered by tools/hero/explode.cjs from the real assembly): scrolling takes it
// apart, part by part, as Fig. 02 does in E-03. Two sets of frames: images/hero/x00..x95 for the
// dark theme and l00..l95 for the light one (the parts are filled with the page colour).
//
// The first frame is an ordinary <img> in the page, so without JS it is a still drawing. With
// reduced motion, or Save-Data, it is a still of the drone part-way apart and nothing else loads.
// Otherwise the other frames load after the page has, and a canvas takes over once they're in. On
// large screens the first screen holds (.scrub) while the drone comes apart; on smaller ones it
// comes apart as the hero scrolls away. A theme change (js/theme.js) swaps the set.
import { $, root, reducedMotion } from "./util.js";
import { loop } from "./motion.js";

var N = 96, STILL = 60, AT_ONCE = 4;   // frames, the still for reduced motion, frames loading at a time
var hero = $("hero"), stage = $("hero-stage");
var set = function () { return root.getAttribute("data-theme") === "light" ? "l" : "x"; };
var src = function (i, s) { return "images/hero/" + (s || set()) + String(i).padStart(2, "0") + ".webp"; };

if (hero && stage) {
  var img = stage.querySelector("img"), hs = stage.querySelector(".hs");
  var save = navigator.connection && navigator.connection.saveData;
  if (reducedMotion() || save) {
    img.src = src(STILL);
    addEventListener("themechange", function () { img.src = src(STILL); });
  } else {
    if (set() !== "x") img.src = src(0);   // a saved light theme: the page's <img> is the dark first frame
    scrub();
  }
}

function scrub() {
  var pin = hero.querySelector(".hero-pin");
  var wide = window.matchMedia("(min-width: 900px) and (min-height: 600px)");
  var sets = {}, canvas = null, ctx = null, shown = -1, started = false;
  var p = 0, q = 0;   // where the scroll is (0 to 1), and where the drawing is, easing after it

  function setWide() { hero.classList.toggle("scrub", wide.matches); measure(); if (anim) anim.start(); }
  (wide.addEventListener ? wide.addEventListener("change", setWide) : wide.addListener(setWide));
  setWide();

  function measure() {
    var r = hero.getBoundingClientRect();
    p = hero.classList.contains("scrub")
      ? clamp(-r.top / Math.max(1, hero.offsetHeight - pin.offsetHeight))
      : clamp(-r.top / Math.max(1, r.height * 0.8));
  }

  // runs only while the hero is on screen, and stops once the drawing has caught up
  var anim = loop(hero, function (dt) {
    measure();
    q += (p - q) * (1 - Math.exp(-dt * 9));
    if (Math.abs(p - q) < 1e-4) q = p;
    draw();
    if (q === p) return false;
  });
  function wake() { anim.start(); }
  addEventListener("scroll", wake, { passive: true });
  addEventListener("resize", wake);

  function draw() {
    // the stage leans in a little as the drone opens out
    hs.style.transform = "translate3d(0," + (-3 * q).toFixed(2) + "%,0) scale(" + (1 + 0.05 * q).toFixed(4) + ")";
    var frames = sets[set()];
    if (!ctx || !frames) return;
    var i = Math.round(q * (N - 1));
    while (i > 0 && !frames[i]) i--;   // the nearest frame that has loaded
    if (i === shown || !frames[i]) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[i], 0, 0, canvas.width, canvas.height);
    shown = i;
  }

  // a set's frames load in order, a few at a time, so the start of the scroll is ready first
  // and the round trips overlap
  function load(s) {
    if (sets[s]) return;
    var frames = sets[s] = new Array(N), i = 0;
    function next() {
      if (i >= N) return;
      var k = i++, im = new Image();
      im.decoding = "async"; im.src = src(k, s);
      (im.decode ? im.decode() : Promise.resolve()).then(function () {
        frames[k] = im;
        if (s === set()) { shown = -1; draw(); if (k === 0) stage.classList.add("live"); }
        next();
      }, next);
    }
    for (var j = 0; j < AT_ONCE; j++) next();
  }
  function start() {
    started = true;
    canvas = document.createElement("canvas");
    canvas.width = 960; canvas.height = 720;
    canvas.setAttribute("aria-hidden", "true");
    ctx = canvas.getContext("2d");
    hs.appendChild(canvas);
    load(set());
  }
  if (document.readyState === "complete") idle(start); else addEventListener("load", function () { idle(start); });

  // the other theme's set loads only if the visitor switches to it
  addEventListener("themechange", function () {
    img.src = src(0);
    if (!started) return;
    var frames = sets[set()];
    if (!frames || !frames[0]) stage.classList.remove("live");
    load(set());
    shown = -1; draw();
    if (sets[set()][0]) stage.classList.add("live");
  });

  anim.start();
}

function idle(f) { (window.requestIdleCallback || setTimeout)(f, { timeout: 1200 }); }
function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
