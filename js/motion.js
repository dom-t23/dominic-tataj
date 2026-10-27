// Motion system: one-shot reveals when elements scroll into view, and animation loops that
// only run while their element is on screen and the tab is visible.
//
// Content is never hidden unless an effect will play: nothing changes for reduced motion,
// without IntersectionObserver, or for elements already on screen when they are registered
// (so nothing above the fold flashes). Printing shows everything in its final state.
import { reducedMotion } from "./util.js";

export var DUR = { quick: 150, base: 400, slow: 900 };
var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

var pending = new Map();   // element -> run()
// An element plays once a fifth of it (or 120 px of it) is in view. No shrunken root margin:
// that would leave elements at the very end of the page unable to scroll far enough.
var io = window.IntersectionObserver ? new IntersectionObserver(function (es) {
  es.forEach(function (en) {
    if (!en.isIntersecting || (en.intersectionRatio < 0.2 && en.intersectionRect.height < 120)) return;
    var run = pending.get(en.target);
    io.unobserve(en.target); pending.delete(en.target);
    if (run) run();
  });
}, { threshold: [0, 0.02, 0.05, 0.1, 0.2] }) : null;

function onScreen(el) {
  var r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight;
}

// kind: "draw" (SVG strokes draw, bars grow, labels fade), "fill" (children appear in
// turn, like a title block being filled in), "count" (the first number counts up),
// "rise" (fades up into place).
export function reveal(el, kind) {
  if (!el || !io || reducedMotion() || onScreen(el)) return;
  var fx = EFFECTS[kind];
  if (!fx) throw new Error("unknown reveal kind: " + kind);
  var run = fx(el);
  if (!run) return;
  pending.set(el, run);
  io.observe(el);
}

// Show everything before printing.
window.addEventListener("beforeprint", function () {
  pending.forEach(function (run, el) { io.unobserve(el); run(true); });
  pending.clear();
});

var EFFECTS = {
  draw: function (svg) {
    var shapes = Array.prototype.filter.call(svg.querySelectorAll("path, line, polyline, polygon, rect, circle, text"), function (s) {
      return !s.closest("defs, marker");
    });
    var steps = [];
    shapes.forEach(function (s, i) {
      var st = getComputedStyle(s), delay = Math.min(i * 35, 700) + "ms";
      if (s.tagName === "text") {
        s.style.opacity = "0";
        steps.push(function () { s.style.transition = "opacity " + DUR.base + "ms ease " + delay; s.style.opacity = ""; });
        return;
      }
      var stroked = st.stroke !== "none" && !s.getAttribute("stroke-dasharray") && s.getTotalLength;
      var filled = st.fill !== "none" && st.fill !== "transparent";
      if (stroked) {
        var len = s.getTotalLength();
        s.style.strokeDasharray = len + " " + len; s.style.strokeDashoffset = String(len);
        if (filled) s.style.fillOpacity = "0";
        steps.push(function () {
          s.style.transition = "stroke-dashoffset " + DUR.slow + "ms " + EASE + " " + delay + ", fill-opacity " + DUR.base + "ms ease " + delay;
          s.style.strokeDashoffset = "0"; s.style.fillOpacity = "";
        });
      } else if (filled && s.tagName === "rect") {
        // bars grow from their left edge
        s.style.transformBox = "fill-box"; s.style.transformOrigin = "left center"; s.style.transform = "scaleX(0)";
        steps.push(function () { s.style.transition = "transform " + DUR.slow + "ms " + EASE + " " + delay; s.style.transform = ""; });
      } else {
        s.style.opacity = "0";
        steps.push(function () { s.style.transition = "opacity " + DUR.base + "ms ease " + delay; s.style.opacity = ""; });
      }
    });
    return function (now) {
      steps.forEach(function (f) { f(); });
      if (now) shapes.forEach(clean); else setTimeout(function () { shapes.forEach(clean); }, DUR.slow + 800);
    };
    function clean(s) {
      ["transition", "strokeDasharray", "strokeDashoffset", "fillOpacity", "transform", "transformBox", "transformOrigin", "opacity"].forEach(function (p) { s.style[p] = ""; });
      tidy(s);
    }
  },

  fill: function (el) { return stagger(el, Array.prototype.slice.call(el.children), 60); },
  rise: function (el) { return stagger(el, [el], 0); },

  count: function (el) {
    var node = firstNumberNode(el);
    if (!node) return null;
    var m = node.nodeValue.match(/\d[\d,]*(?:\.\d+)?/), text = node.nodeValue;
    var target = parseFloat(m[0].replace(/,/g, "")), dec = (m[0].split(".")[1] || "").length, commas = m[0].indexOf(",") >= 0;
    function fmt(v) {
      var s = v.toFixed(dec);
      if (commas) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return text.slice(0, m.index) + s + text.slice(m.index + m[0].length);
    }
    node.nodeValue = fmt(0);
    return function (now) {
      if (now) { node.nodeValue = text; return; }
      var t0 = performance.now();
      requestAnimationFrame(function step(t) {
        var p = Math.min(1, (t - t0) / DUR.slow);
        if (p >= 1) { node.nodeValue = text; return; }
        node.nodeValue = fmt(target * (1 - Math.pow(1 - p, 3)));
        requestAnimationFrame(step);
      });
    };
  }
};

function stagger(el, items, gap) {
  items.forEach(function (c, i) {
    c.style.opacity = "0"; c.style.transform = "translateY(8px)";
    c.dataset.mDelay = String(i * gap);
  });
  return function (now) {
    items.forEach(function (c) {
      c.style.transition = now ? "" : "opacity " + DUR.base + "ms ease " + c.dataset.mDelay + "ms, transform " + DUR.base + "ms " + EASE + " " + c.dataset.mDelay + "ms";
      c.style.opacity = ""; c.style.transform = "";
      delete c.dataset.mDelay;
      if (!now) setTimeout(function () { c.style.transition = ""; tidy(c); }, DUR.base + items.length * gap + 100); else tidy(c);
    });
  };
}

// Leave the element as it was: drop the style attribute once it is empty.
function tidy(el) { if (!el.getAttribute("style")) el.removeAttribute("style"); }

function firstNumberNode(el) {
  var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
  while ((n = w.nextNode())) if (/\d/.test(n.nodeValue)) return n;
  return null;
}

// A requestAnimationFrame loop that runs only while `el` is on screen and the tab is
// visible. step(dt, now) gets seconds since the last frame (capped at 50 ms); returning
// false stops the loop. Returns { start, stop, running }.
export function loop(el, step) {
  var wanted = false, visible = !window.IntersectionObserver, running = false, raf = 0, last = 0;
  function frame(now) {
    var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));   // a frame's timestamp can precede start()
    last = now;
    if (step(dt, now) === false) { api.stop(); return; }
    raf = requestAnimationFrame(frame);
  }
  function update() {
    var go = wanted && visible && !document.hidden;
    if (go && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (!go && running) { running = false; cancelAnimationFrame(raf); }
  }
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; update(); }).observe(el);
  }
  document.addEventListener("visibilitychange", update);
  var api = {
    start: function () { wanted = true; update(); },
    stop: function () { wanted = false; update(); },
    get running() { return running; }
  };
  return api;
}
