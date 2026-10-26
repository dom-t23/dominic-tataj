// Fig. 00, the flight-test strip in the hero (DESIGN_PLAN.md 1.1). Course 1's recorded path
// from the drone-racing project is drawn as a plan view; a drone glyph flies it at 3× speed,
// then flips along a projection line into an elevation view and hovers there. Everything
// drawn is a function of one clock, so replaying, resizing and reduced motion share render().
import { $, reducedMotion } from "./util.js";
import { loop } from "./motion.js";
import { flightIndex } from "./flights.js";

var NS = "http://www.w3.org/2000/svg";
var SPEED = 3;                    // playback speed
var LEAD = 0.5;                   // s on the clock before take-off
var FLIP = 0.8;                   // s for the card-turn into the elevation view
var BOB = 0.04, BOB_HZ = 0.5;     // hover bob: amplitude in m, frequency in Hz

var box = $("fv"), svg = box && box.querySelector("svg.flight-svg"), replay = $("fv-replay");
var F = null, L = null, clock = 0, still = reducedMotion(), anim = null, flying = false;

function make(tag, attrs, parent) {
  var e = document.createElementNS(NS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function label(str, attrs, parent) { var t = make("text", attrs, parent); t.textContent = str; return t; }
function r1(v) { return Math.round(v * 10) / 10; }
function lerp(a, b, u) { return a + (b - a) * u; }
function show(e, on) { e.setAttribute("display", on ? "inline" : "none"); }

// A drafting tick (a short 45° slash), used to end dimension lines.
function tick(x, y, parent) { return make("line", { x1: x - 3, y1: y + 3, x2: x + 3, y2: y - 3, class: "ln" }, parent); }

function viewTag(text, v) {
  var w = text.length * 7.4 + 14;
  make("rect", { x: v.x + 10.5, y: v.y + 10.5, width: w, height: 19, class: "rule paper" }, svg);
  label(text, { x: v.x + 17.5, y: v.y + 23.5, class: "ink" }, svg);
}

function build() {
  var W = box.clientWidth, H = box.clientHeight;
  if (!W || !H) return;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.textContent = "";
  var side = W >= 700, split = side ? Math.round(W * 0.72) : Math.round(H * 0.46), kp = side ? 1 : 0.8, ke = side ? 1.45 : 1.2;
  var plan = side ? { x: 0, y: 0, w: split, h: H } : { x: 0, y: 0, w: W, h: split };
  var elev = side ? { x: split, y: 0, w: W - split, h: H } : { x: 0, y: split, w: W, h: H - split };
  make("line", side ? { x1: split + 0.5, y1: 0, x2: split + 0.5, y2: H, class: "rule" } : { x1: 0, y1: split + 0.5, x2: W, y2: split + 0.5, class: "rule" }, svg);
  viewTag("PLAN", plan); viewTag("ELEVATION", elev);

  // ---- plan view: metres to px, +y up ----
  var xs = [F.start[0]], ys = [F.start[1]];
  F.gates.forEach(function (g) { xs.push(g.c[0]); ys.push(g.c[1]); });
  F.frames.forEach(function (f) { xs.push(f.p[0]); ys.push(f.p[1]); });
  var x0 = Math.min.apply(null, xs) - 2, x1 = Math.max.apply(null, xs) + 2, y0 = Math.min.apply(null, ys) - 2, y1 = Math.max.apply(null, ys) + 2;
  var top = 44, pad = 22, foot = 26;
  var s = Math.min((plan.w - 2 * pad) / (x1 - x0), (plan.h - top - foot) / (y1 - y0));
  var cx = plan.x + plan.w / 2, cy = plan.y + top + (plan.h - top - foot) / 2, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  function P(x, y) { return [cx + (x - mx) * s, cy - (y - my) * s]; }

  // gates, each with a numbered balloon callout; gate 1 also gets its width dimensioned
  var gates = F.gates.map(function (g, i) {
    var half = F.gateLen / 2, lx = -Math.sin(g.yaw), ly = Math.cos(g.yaw);
    var a = P(g.c[0] + lx * half, g.c[1] + ly * half), b = P(g.c[0] - lx * half, g.c[1] - ly * half), c = P(g.c[0], g.c[1]);
    var line = make("line", { x1: r1(a[0]), y1: r1(a[1]), x2: r1(b[0]), y2: r1(b[1]), class: "gate" }, svg);
    var hi = Math.min(a[1], b[1]), lo = Math.max(a[1], b[1]), up = hi - 16 > plan.y + top - 10;
    var by = up ? hi - 16 : lo + 16;
    make("line", { x1: r1(c[0]), y1: r1(up ? hi - 2 : lo + 2), x2: r1(c[0]), y2: r1(up ? by + 8 : by - 8), class: "thin" }, svg);
    make("circle", { cx: r1(c[0]), cy: r1(by), r: 8, class: "thin paper" }, svg);
    label(String(i + 1), { x: r1(c[0]), y: r1(by + 3.5), "text-anchor": "middle", class: "ink" }, svg);
    if (i === 0 && Math.hypot(b[0] - a[0], b[1] - a[1]) >= 18) dimension(a, b, (F.gateLen).toFixed(2) + " m");
    return line;
  });

  // dimension line parallel to a–b, offset to the side away from the course
  function dimension(a, b, text) {
    var len = Math.hypot(b[0] - a[0], b[1] - a[1]), dx = (b[0] - a[0]) / len, dy = (b[1] - a[1]) / len;
    var nx = -dy, ny = dx;
    if (nx > 0) { nx = -nx; ny = -ny; }
    var o = 14, A = [a[0] + nx * o, a[1] + ny * o], B = [b[0] + nx * o, b[1] + ny * o];
    make("line", { x1: r1(a[0] + nx * 4), y1: r1(a[1] + ny * 4), x2: r1(A[0] + nx * 4), y2: r1(A[1] + ny * 4), class: "thin" }, svg);
    make("line", { x1: r1(b[0] + nx * 4), y1: r1(b[1] + ny * 4), x2: r1(B[0] + nx * 4), y2: r1(B[1] + ny * 4), class: "thin" }, svg);
    make("line", { x1: r1(A[0]), y1: r1(A[1]), x2: r1(B[0]), y2: r1(B[1]), class: "ln" }, svg);
    tick(A[0], A[1], svg); tick(B[0], B[1], svg);
    var low = A[1] > B[1] ? A : B;
    label(text, { x: r1(low[0]), y: r1(low[1] + 16), "text-anchor": "middle" }, svg);
  }

  // start mark
  var st = P(F.start[0], F.start[1]);
  make("circle", { cx: r1(st[0]), cy: r1(st[1]), r: 4, class: "thin" }, svg);
  make("path", { d: "M" + r1(st[0] - 7) + " " + r1(st[1]) + "h14M" + r1(st[0]) + " " + r1(st[1] - 7) + "v14", class: "thin" }, svg);
  label("START", { x: r1(st[0]), y: r1(st[1] + 19), "text-anchor": "middle" }, svg);

  // scale bar: 5 m, or 10 m when 5 m would be too short to read
  var m = 5 * s >= 36 ? 5 : 10, sx = plan.x + pad, sy = plan.y + plan.h - 14;
  make("line", { x1: sx, y1: sy, x2: r1(sx + m * s), y2: sy, class: "ln" }, svg);
  [0, 0.5, 1].forEach(function (f) { make("line", { x1: r1(sx + f * m * s), y1: sy - (f === 0.5 ? 3 : 5), x2: r1(sx + f * m * s), y2: sy, class: "ln" }, svg); });
  label("0", { x: sx, y: sy - 8, "text-anchor": "middle" }, svg);
  label(m + " m", { x: r1(sx + m * s), y: sy - 8, "text-anchor": "middle" }, svg);

  var truth = make("polyline", { class: "truth", points: "" }, svg);
  var est = make("polyline", { class: "est", points: "" }, svg);
  var readout = label("", { x: plan.x + plan.w - 12, y: plan.y + 24, "text-anchor": "end", class: "big" }, svg);

  // finish mark (a cross), shown once the drone has flipped away
  var last = F.frames[F.frames.length - 1].p, pf = P(last[0], last[1]);
  var finish = make("g", { display: "none" }, svg);
  make("path", { d: "M" + r1(pf[0] - 5) + " " + r1(pf[1] - 5) + "l10 10M" + r1(pf[0] + 5) + " " + r1(pf[1] - 5) + "l-10 10", class: "ln" }, finish);

  // ---- plan glyph: X frame, four rotors (diagonal pairs spin opposite ways), nose to +x ----
  var gp = make("g", {}, svg), arm = 9;
  make("line", { x1: -arm, y1: -arm, x2: arm, y2: arm, class: "ln" }, gp);
  make("line", { x1: -arm, y1: arm, x2: arm, y2: -arm, class: "ln" }, gp);
  var bladesP = [[arm, -arm, 1], [arm, arm, -1], [-arm, arm, 1], [-arm, -arm, -1]].map(function (r) {
    make("circle", { cx: r[0], cy: r[1], r: 5.5, class: "thin paper" }, gp);
    return { el: make("line", { x1: -4.5, y1: 0, x2: 4.5, y2: 0, class: "ln" }, gp), x: r[0], y: r[1], dir: r[2] };
  });
  make("rect", { x: -5, y: -3.5, width: 10, height: 7, class: "solid" }, gp);
  make("path", { d: "M6 -3L11 0L6 3Z", class: "accent" }, gp);

  // ---- elevation view: hatched ground, side-view drone, live height dimension ----
  var gy = elev.y + elev.h - 32;
  make("line", { x1: elev.x + 14, y1: gy, x2: elev.x + elev.w - 14, y2: gy, class: "ln" }, svg);
  for (var hx = elev.x + 20; hx <= elev.x + elev.w - 14; hx += 8) make("line", { x1: hx, y1: gy + 1, x2: hx - 6, y2: gy + 7, class: "thin" }, svg);
  label("GROUND", { x: elev.x + elev.w - 14, y: gy + 22, "text-anchor": "end" }, svg);
  var se = (gy - (elev.y + 64)) / 3, ex = elev.x + elev.w * 0.6, z0 = last[2];

  var ge = make("g", { display: "none" }, svg);
  make("rect", { x: -9, y: -10, width: 18, height: 5, class: "solid" }, ge);             // battery
  make("rect", { x: -15, y: -4.5, width: 30, height: 7, class: "ln paper" }, ge);        // body
  make("rect", { x: 14, y: -8, width: 5, height: 4, class: "accent", transform: "rotate(-20 16 -6)" }, ge);   // camera
  make("line", { x1: -15, y1: 0, x2: -22, y2: 0, class: "ln" }, ge);
  make("line", { x1: 15, y1: 0, x2: 22, y2: 0, class: "ln" }, ge);
  make("rect", { x: -26, y: -4, width: 6, height: 7, class: "solid" }, ge);              // motors
  make("rect", { x: 20, y: -4, width: 6, height: 7, class: "solid" }, ge);
  var bladesE = [-23, 23].map(function (x, i) {
    return { el: make("line", { x1: x - 12, y1: -6.5, x2: x + 12, y2: -6.5, class: "ln" }, ge), x: x, phase: i * 1.3 };
  });
  var dimX = ex - 48 * ke, dim = make("g", { display: "none" }, svg);
  var dimLine = make("line", { x1: dimX, y1: gy, x2: dimX, y2: gy, class: "ln" }, dim);
  var dimExt = make("line", { x1: dimX - 4, y1: gy, x2: ex - 18 * ke, y2: gy, class: "thin" }, dim);
  tick(dimX, gy, dim);
  var dimTick = tick(dimX, gy, dim);
  var dimText = label("", { x: dimX - 8, y: gy, "text-anchor": "end", class: "ink" }, dim);
  var proj = make("line", { x1: r1(pf[0]), y1: r1(pf[1]), x2: r1(pf[0]), y2: r1(pf[1]), class: "proj", display: "none" }, svg);

  L = { P: P, gates: gates, truth: truth, est: est, readout: readout, finish: finish, gp: gp, bladesP: bladesP,
    ge: ge, bladesE: bladesE, dim: dim, dimLine: dimLine, dimExt: dimExt, dimTick: dimTick, dimText: dimText, proj: proj,
    pf: pf, ex: ex, gy: gy, se: se, z0: z0, kp: kp, ke: ke, lastI: 0 };
}

function heading(i) {
  var fr = F.frames, a = fr[Math.max(0, i - 2)].p, b = fr[Math.min(fr.length - 1, i + 2)].p;
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}
function speed(i) {
  var fr = F.frames, a = fr[Math.max(0, i - 1)], b = fr[Math.min(fr.length - 1, i + 1)];
  if (a === b) return 0;
  return Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]) / (b.t - a.t);
}

function render(c) {
  var fr = F.frames, n = fr.length, tEnd = LEAD + F.T / SPEED;
  var tf = still ? F.T : Math.max(0, Math.min(F.T, (c - LEAD) * SPEED));
  var i = fr[L.lastI].t <= tf ? L.lastI : 0;
  while (i < n - 1 && fr[i + 1].t <= tf) i++;
  L.lastI = i;
  var j = Math.min(n - 1, i + 1), u = j > i ? (tf - fr[i].t) / (fr[j].t - fr[i].t) : 0;
  var x = lerp(fr[i].p[0], fr[j].p[0], u), y = lerp(fr[i].p[1], fr[j].p[1], u), here = L.P(x, y);

  // the true path and the drone's own estimate, plotted up to now
  var tp = [], ep = [];
  for (var q = 0; q <= i; q++) {
    var a = L.P(fr[q].p[0], fr[q].p[1]); tp.push(r1(a[0]) + "," + r1(a[1]));
    if (fr[q].e) { var b = L.P(fr[q].e[0], fr[q].e[1]); ep.push(r1(b[0]) + "," + r1(b[1])); }
  }
  tp.push(r1(here[0]) + "," + r1(here[1]));
  L.truth.setAttribute("points", tp.join(" "));
  L.est.setAttribute("points", ep.join(" "));

  var landed = still || c >= LEAD + F.T / SPEED, g = landed ? F.n : fr[i].g;
  L.gates.forEach(function (el, gi) { el.setAttribute("class", "gate" + (gi < g ? " done" : gi === g ? " next" : "")); });

  var spin = still ? 30 : c * 1400;
  L.bladesP.forEach(function (bl) { bl.el.setAttribute("transform", "translate(" + bl.x + " " + bl.y + ") rotate(" + r1((spin * bl.dir) % 360) + ")"); });

  var after = still ? Infinity : c - tEnd, kp = L.kp, ke = L.ke;
  if (after < 0) {
    var h0 = heading(i), h1 = heading(j), dh = Math.atan2(Math.sin(h1 - h0), Math.cos(h1 - h0));
    var hd = -(h0 + dh * u) * 180 / Math.PI;
    show(L.gp, true);
    L.gp.setAttribute("transform", "translate(" + r1(here[0]) + " " + r1(here[1]) + ") rotate(" + r1(hd) + ") scale(" + kp + ")");
    show(L.ge, false); show(L.proj, false); show(L.dim, false); show(L.finish, false);
    L.readout.textContent = "T " + tf.toFixed(2) + " S  ·  " + lerp(speed(i), speed(j), u).toFixed(1) + " M/S  ·  GATE " +
      Math.min(g + 1, F.n) + "/" + F.n + "  ·  ×" + SPEED;
    return;
  }
  // landed: the plan glyph turns edge-on, a projection line carries it to the elevation view,
  // where it turns face-on again and hovers
  var v = after / FLIP, bob = still ? 0 : BOB * Math.sin(2 * Math.PI * BOB_HZ * Math.max(0, after - FLIP));
  var hdEnd = -heading(n - 1) * 180 / Math.PI, ez = L.gy - (L.z0 + bob) * L.se;
  show(L.gp, v < 0.5);
  if (v < 0.5) L.gp.setAttribute("transform", "translate(" + r1(L.pf[0]) + " " + r1(L.pf[1]) + ") rotate(" + r1(hdEnd) + ") scale(" + kp + " " + r1(kp * Math.cos(v * Math.PI) * 100) / 100 + ")");
  // the projection line stops just short of the elevation glyph
  // (the glyph is about 30 px wide and 12 px tall at scale 1, so the gap depends on the angle)
  var tx = L.ex, ty = L.gy - L.z0 * L.se, dl = Math.hypot(tx - L.pf[0], ty - L.pf[1]);
  var gap = ke * (12 + 18 * Math.abs(tx - L.pf[0]) / dl), stop = Math.max(0, 1 - gap / dl);
  var pv = Math.min(1, v) * stop;
  show(L.proj, true);
  L.proj.setAttribute("x2", r1(lerp(L.pf[0], tx, pv))); L.proj.setAttribute("y2", r1(lerp(L.pf[1], ty, pv)));
  show(L.finish, true);
  show(L.ge, v >= 0.5);
  if (v >= 0.5) {
    var sy = Math.sin(Math.min(1, (v - 0.5) * 2) * Math.PI / 2);
    L.ge.setAttribute("transform", "translate(" + r1(L.ex) + " " + r1(ez) + ") scale(" + ke + " " + r1(ke * sy * 100) / 100 + ")");
    L.bladesE.forEach(function (bl) {
      var half = still ? 12 : Math.max(3, 12 * Math.abs(Math.cos(c * 26 + bl.phase)));
      bl.el.setAttribute("x1", r1(bl.x - half)); bl.el.setAttribute("x2", r1(bl.x + half));
    });
  }
  show(L.dim, v >= 1);
  if (v >= 1) {
    var yb = ez + 3 * ke;
    L.dimLine.setAttribute("y2", r1(yb)); L.dimExt.setAttribute("y1", r1(yb)); L.dimExt.setAttribute("y2", r1(yb));
    var dx = +L.dimLine.getAttribute("x1");
    L.dimTick.setAttribute("y1", r1(yb + 3)); L.dimTick.setAttribute("y2", r1(yb - 3));
    L.dimTick.setAttribute("x1", r1(dx - 3)); L.dimTick.setAttribute("x2", r1(dx + 3));
    L.dimText.setAttribute("y", r1((L.gy + yb) / 2 + 3.5));
    L.dimText.textContent = (L.z0 + bob).toFixed(2) + " m";
  }
  L.readout.textContent = "T " + F.T.toFixed(2) + " S  ·  " + F.n + "/" + F.n + " GATES  ·  " + (v >= 1 ? "HOVER" : "LANDED");
}

function play() {
  clock = 0; L.lastI = 0; still = false;
  render(0);
  start();
}
function start() { flying = true; anim.start(); }

// Fetch the flight data after the page has loaded, so it never competes with first paint.
function afterLoad(fn) {
  if (document.readyState === "complete") fn(); else window.addEventListener("load", fn, { once: true });
}

if (box) afterLoad(function () {
  flightIndex(function (ix) {
    var P = ix.poster, e = P && ix.list.filter(function (f) { return f.id === P.id; })[0];
    if (!e) return;
    F = { gates: e.gates, gateLen: e.gate_outer, start: e.start, n: e.n_gates, frames: P.frames, T: P.frames[P.frames.length - 1].t };
    build(); render(clock);
    replay.hidden = false;
    anim = loop(box, function (dt) { clock += dt; render(clock); });
    replay.addEventListener("click", play);
    // The hover test rig (js/hover-rig.js) takes over the strip; pause underneath it.
    $("flight").addEventListener("rig", function (e) { if (e.detail) anim.stop(); else if (flying) anim.start(); });
    if (window.ResizeObserver) new ResizeObserver(function () { build(); if (L) render(clock); }).observe(box);
    // Take off once at least half the strip is in view, so the flight is seen from the start.
    if (still) return;
    if (!window.IntersectionObserver) { start(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es[es.length - 1].intersectionRatio >= 0.5) { io.disconnect(); start(); }
    }, { threshold: [0, 0.5, 1] });
    io.observe(box);
  }, function () {});
});
