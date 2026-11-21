// The hero's drone (images/hero/x00..x23, rendered by tools/hero/explode.cjs from the real
// assembly): scrolling takes it apart, part by part, as Fig. 02 does in E-03.
//
// The first frame is an ordinary <img> in the page, so without JS it is a still drawing. With
// reduced motion, or Save-Data, it is a still of the drone part-way apart and nothing loads. Otherwise the
// other frames load after the page has, and a canvas takes over once they're in. On large
// screens the first screen holds (.scrub) while the drone comes apart; on smaller ones it comes
// apart as the hero scrolls away. The copy never moves out of view or fades.
import { $, reducedMotion } from "./util.js";
import { loop } from "./motion.js";

var N = 24, STILL = 15;
var hero = $("hero"), stage = $("hero-stage");
var src = function (i) { return "images/hero/x" + String(i).padStart(2, "0") + ".webp"; };

if (hero && stage) {
  var img = stage.querySelector("img"), hs = stage.querySelector(".hs"), specs = stage.querySelector(".hero-specs");
  var save = navigator.connection && navigator.connection.saveData;
  if (reducedMotion() || save) {
    img.src = src(STILL);
  } else {
    scrub();
  }
}

function scrub() {
  var pin = hero.querySelector(".hero-pin");
  var wide = window.matchMedia("(min-width: 900px) and (min-height: 600px)");
  var frames = new Array(N), canvas = null, ctx = null, shown = -1;
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
    // the stage leans in a little as the drone opens out; the specs brighten at the end
    hs.style.transform = "translate3d(0," + (-3 * q).toFixed(2) + "%,0) scale(" + (1 + 0.05 * q).toFixed(4) + ")";
    if (specs) specs.style.setProperty("--x", smooth(0.55, 0.95, q).toFixed(3));
    if (!ctx) return;
    var want = Math.round(q * (N - 1)), i = want;
    while (i > 0 && !frames[i]) i--;   // the nearest frame that has loaded
    if (i === shown || !frames[i]) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[i], 0, 0, canvas.width, canvas.height);
    shown = i;
  }

  // the frames load once the page has, in order, so the start of the scroll is ready first
  function load() {
    canvas = document.createElement("canvas");
    canvas.width = 960; canvas.height = 720;
    canvas.setAttribute("aria-hidden", "true");
    ctx = canvas.getContext("2d");
    hs.appendChild(canvas);
    var i = 0;
    (function next() {
      if (i >= N) return;
      var k = i++, im = new Image();
      im.decoding = "async"; im.src = src(k);
      (im.decode ? im.decode() : Promise.resolve()).then(function () {
        frames[k] = im;
        shown = -1; draw();
        if (k === 0) stage.classList.add("live");
        next();
      }, next);
    })();
  }
  if (document.readyState === "complete") idle(load); else addEventListener("load", function () { idle(load); });

  anim.start();
}

function idle(f) { (window.requestIdleCallback || setTimeout)(f, { timeout: 1200 }); }
function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function smooth(a, b, v) { var t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); }
