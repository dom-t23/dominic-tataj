// Fig. 00, the hero's flight log (direction A). The simulated flight from the drone-racing
// project (E-04, course 1, camera + IMU) draws itself as a plan view beside the name: the true
// path in blue, the drone's own estimate dashed orange, the gates turning from "next" to "passed".
// Under it, a strip chart of the estimate's error over the flight, and an HTML readout in
// tabular figures. Everything drawn is a function of one clock, so replaying, resizing and
// reduced motion (which draws the finished flight at once) share render(). The loop stops once
// the flight is over.
import { $, reducedMotion } from "./util.js";
import { loop } from "./motion.js";
import { flightIndex } from "./flights.js";

var NS = "http://www.w3.org/2000/svg";
var SPEED = 3;                    // playback speed
var LEAD = 0.4;                   // s on the clock before take-off
var ROLL = 0.9;                   // s for an acro-mode spin (js/acro.js)
var EMAX = 2;                     // m, top of the error chart

var box = $("fv"), svg = box && box.querySelector("svg.flight-svg"), replay = $("fv-replay");
var read = { t: $("fv-t"), g: $("fv-g"), v: $("fv-v"), e: $("fv-e"), tl: $("fv-t-l"), vl: $("fv-v-l"), el: $("fv-e-l") };
var F = null, L = null, clock = 0, still = reducedMotion(), anim = null, flying = false, spinAt = -1;

function make(tag, attrs, parent) {
  var e = document.createElementNS(NS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function label(str, attrs, parent) { var t = make("text", attrs, parent); t.textContent = str; return t; }
function r1(v) { return Math.round(v * 10) / 10; }
function lerp(a, b, u) { return a + (b - a) * u; }
function set(el, text) { if (el && el.textContent !== text) el.textContent = text; }
function err(f) { return f.e ? Math.hypot(f.e[0] - f.p[0], f.e[1] - f.p[1], f.e[2] - f.p[2]) : null; }

// The plan is turned so the course runs left to right along its long axis (a plan view has no
// "up"; the scale bar keeps it honest).
function axis(frames) {
  var n = frames.length, mx = 0, my = 0, sxx = 0, syy = 0, sxy = 0;
  frames.forEach(function (f) { mx += f.p[0] / n; my += f.p[1] / n; });
  frames.forEach(function (f) { var dx = f.p[0] - mx, dy = f.p[1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; });
  var a = 0.5 * Math.atan2(2 * sxy, sxx - syy), c = Math.cos(a), s = Math.sin(a);
  var p0 = frames[0].p, p1 = frames[n - 1].p;
  if ((p1[0] - p0[0]) * c + (p1[1] - p0[1]) * s < 0) a += Math.PI;
  return a;
}

function build() {
  var W = box.clientWidth, H = box.clientHeight;
  if (!W || !H) return;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.textContent = "";
  var narrow = W < 520, pad = narrow ? 14 : 20, chartH = narrow ? 64 : 80, top = narrow ? 58 : 46;
  var a = F.angle, ca = Math.cos(a), sa = Math.sin(a);
  function rot(x, y) { return [x * ca + y * sa, -x * sa + y * ca]; }

  // ---- plan: metres to px, turned; +v up ----
  var us = [], vs = [];
  function add(x, y) { var q = rot(x, y); us.push(q[0]); vs.push(q[1]); }
  add(F.start[0], F.start[1]);
  F.gates.forEach(function (g) { add(g.c[0], g.c[1]); });
  F.frames.forEach(function (f) { add(f.p[0], f.p[1]); if (f.e) add(f.e[0], f.e[1]); });
  var u0 = Math.min.apply(null, us) - 1.5, u1 = Math.max.apply(null, us) + 1.5, v0 = Math.min.apply(null, vs) - 2.5, v1 = Math.max.apply(null, vs) + 2.5;
  var plan = { x: pad, y: top, w: W - 2 * pad, h: H - top - chartH - 40 };
  var s = Math.min(plan.w / (u1 - u0), plan.h / (v1 - v0));
  var cx = plan.x + plan.w / 2, cy = plan.y + plan.h / 2, mu = (u0 + u1) / 2, mv = (v0 + v1) / 2;
  function P(x, y) { var q = rot(x, y); return [cx + (q[0] - mu) * s, cy - (q[1] - mv) * s]; }

  // a 5 m grid under the plan, so distances read at a glance
  var grid = make("g", { class: "grid" }, svg), gm = 5;
  var ul = mu - (plan.w / 2) / s, ur = mu + (plan.w / 2) / s, vb = mv - (plan.h / 2) / s, vt = mv + (plan.h / 2) / s;
  for (var gu = Math.ceil(ul / gm) * gm; gu <= ur; gu += gm) { var X = cx + (gu - mu) * s; make("line", { x1: r1(X), y1: plan.y, x2: r1(X), y2: plan.y + plan.h, class: "rule" }, grid); }
  for (var gv = Math.ceil(vb / gm) * gm; gv <= vt; gv += gm) { var Y = cy - (gv - mv) * s; make("line", { x1: plan.x, y1: r1(Y), x2: plan.x + plan.w, y2: r1(Y), class: "rule" }, grid); }

  // gates, numbered
  var gates = F.gates.map(function (g, i) {
    var half = F.gateLen / 2, lx = -Math.sin(g.yaw), ly = Math.cos(g.yaw);
    var p = P(g.c[0] + lx * half, g.c[1] + ly * half), q = P(g.c[0] - lx * half, g.c[1] - ly * half), c = P(g.c[0], g.c[1]);
    var line = make("line", { x1: r1(p[0]), y1: r1(p[1]), x2: r1(q[0]), y2: r1(q[1]), class: "gate" }, svg);
    // the number sits off the gate's upper end
    var hiEnd = p[1] < q[1] ? p : q, dx = hiEnd[0] - c[0], dy = hiEnd[1] - c[1], dl = Math.hypot(dx, dy) || 1;
    label(String(i + 1), { x: r1(hiEnd[0] + dx / dl * 10), y: r1(hiEnd[1] + dy / dl * 10 + 4), "text-anchor": "middle", class: "num" }, svg);
    return line;
  });

  // start mark
  var st = P(F.start[0], F.start[1]);
  make("circle", { cx: r1(st[0]), cy: r1(st[1]), r: 3.5, class: "start" }, svg);
  label("Start", { x: r1(st[0]), y: r1(st[1] + 18), "text-anchor": "middle", class: "lab" }, svg);

  // scale bar, under the plan
  var sx = plan.x, sy = plan.y + plan.h + 14;
  make("line", { x1: sx, y1: sy, x2: r1(sx + 5 * s), y2: sy, class: "ln" }, svg);
  make("line", { x1: sx + 0.5, y1: sy - 4, x2: sx + 0.5, y2: sy, class: "ln" }, svg);
  make("line", { x1: r1(sx + 5 * s) - 0.5, y1: sy - 4, x2: r1(sx + 5 * s) - 0.5, y2: sy, class: "ln" }, svg);
  label("5 m", { x: r1(sx + 5 * s + 7), y: sy + 4, class: "num" }, svg);

  // the whole course, faint, from the first frame (readable at frame 0; design review MOT-04)
  make("polyline", { class: "ghost", points: F.frames.map(function (f) { var a = P(f.p[0], f.p[1]); return r1(a[0]) + "," + r1(a[1]); }).join(" ") }, svg);
  var truth = make("polyline", { class: "truth", points: "" }, svg);
  var est = make("polyline", { class: "est", points: "" }, svg);
  var ering = make("circle", { r: 5.5, class: "est-ring" }, svg);
  var me = make("g", {}, svg);
  make("circle", { cx: 0, cy: 0, r: 4.5, class: "me" }, me);
  make("path", { d: "M5 -3.4L11.5 0L5 3.4Z", class: "me" }, me);

  // status, top left; legend, top right (on narrow figures, the legend sits under the status)
  var status = label("", { x: pad, y: 24, class: "status" }, svg);
  var lg = make("g", { class: "legend" }, svg), lx0 = W - pad, ly = narrow ? 44 : 24;
  var t2 = label("Estimate", { x: lx0, y: ly, "text-anchor": "end", class: "lab" }, lg);
  var w2 = t2.getComputedTextLength ? t2.getComputedTextLength() : 52;
  make("line", { x1: r1(lx0 - w2 - 24), y1: ly - 4, x2: r1(lx0 - w2 - 6), y2: ly - 4, class: "est" }, lg);
  var t1 = label("True path", { x: r1(lx0 - w2 - 36), y: ly, "text-anchor": "end", class: "lab" }, lg);
  var w1 = t1.getComputedTextLength ? t1.getComputedTextLength() : 56;
  make("line", { x1: r1(lx0 - w2 - 36 - w1 - 24), y1: ly - 4, x2: r1(lx0 - w2 - 36 - w1 - 6), y2: ly - 4, class: "truth" }, lg);

  // ---- strip chart: the estimate's error over the flight, gate passes ticked on its axis ----
  var ch = { x: pad, y: H - chartH, w: W - 2 * pad, h: chartH - 22 };
  make("line", { x1: 0, y1: ch.y - 14.5, x2: W, y2: ch.y - 14.5, class: "rule" }, svg);
  label("Estimate error", { x: ch.x, y: ch.y + 2, class: "lab" }, svg);
  var base = ch.y + ch.h;
  function CX(t) { return ch.x + (t / F.T) * ch.w; }
  function CY(e) { return base - Math.min(e, EMAX) / EMAX * (ch.h - 4); }
  make("line", { x1: ch.x + 96, y1: r1(CY(1)) + 0.5, x2: ch.x + ch.w, y2: r1(CY(1)) + 0.5, class: "rule" }, svg);
  label("1 m", { x: ch.x + ch.w, y: r1(CY(1)) - 3, "text-anchor": "end", class: "num" }, svg);
  make("line", { x1: ch.x, y1: base + 0.5, x2: ch.x + ch.w, y2: base + 0.5, class: "axis" }, svg);
  var prevG = 0;
  F.frames.forEach(function (f) {
    if (f.g > prevG) {
      var x = r1(CX(f.t)) + 0.5;
      make("line", { x1: x, y1: base, x2: x, y2: base + 5, class: "axis" }, svg);
      prevG = f.g;
    }
  });
  label("0 s", { x: ch.x, y: base + 16, class: "num" }, svg);
  label(F.T.toFixed(1) + " s", { x: ch.x + ch.w, y: base + 16, "text-anchor": "end", class: "num" }, svg);
  label("ticks mark gates passed", { x: ch.x + ch.w / 2, y: base + 16, "text-anchor": "middle", class: "lab faint" }, svg);
  var area = make("path", { class: "err-area", d: "" }, svg);
  var trace = make("polyline", { class: "err-line", points: "" }, svg);
  var cursor = make("line", { x1: 0, y1: ch.y + 6, x2: 0, y2: base, class: "cursor" }, svg);

  L = { P: P, gates: gates, truth: truth, est: est, ering: ering, me: me, status: status,
    CX: CX, CY: CY, base: base, area: area, trace: trace, cursor: cursor, lastI: 0 };
}

function heading(i) {
  var fr = F.frames, n = fr.length, pa = fr[Math.max(0, i - 2)].p, pb = fr[Math.min(n - 1, i + 2)].p;
  var a = L.P(pa[0], pa[1]), b = L.P(pb[0], pb[1]);
  return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
}
function speed(i) {
  var fr = F.frames, a = fr[Math.max(0, i - 1)], b = fr[Math.min(fr.length - 1, i + 1)];
  if (a === b) return 0;
  return Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]) / (b.t - a.t);
}

function render(c) {
  if (!L) return false;
  var fr = F.frames, n = fr.length, tEnd = LEAD + F.T / SPEED;
  var done = still || c >= tEnd;
  var tf = done ? F.T : Math.max(0, Math.min(F.T, (c - LEAD) * SPEED));
  var i = fr[L.lastI].t <= tf ? L.lastI : 0;
  while (i < n - 1 && fr[i + 1].t <= tf) i++;
  L.lastI = i;
  var j = Math.min(n - 1, i + 1), u = j > i ? (tf - fr[i].t) / (fr[j].t - fr[i].t) : 0;
  var here = L.P(lerp(fr[i].p[0], fr[j].p[0], u), lerp(fr[i].p[1], fr[j].p[1], u));

  // the true path and the drone's own estimate, plotted up to now; the error trace with them
  var tp = [], ep = [], cp = [], lastE = null;
  for (var q = 0; q <= i; q++) {
    var a = L.P(fr[q].p[0], fr[q].p[1]); tp.push(r1(a[0]) + "," + r1(a[1]));
    if (fr[q].e) { var b = L.P(fr[q].e[0], fr[q].e[1]); ep.push(r1(b[0]) + "," + r1(b[1])); lastE = b; }
    var e = err(fr[q]); if (e !== null) cp.push([r1(L.CX(fr[q].t)), r1(L.CY(e))]);
  }
  tp.push(r1(here[0]) + "," + r1(here[1]));
  L.truth.setAttribute("points", tp.join(" "));
  L.est.setAttribute("points", ep.join(" "));
  L.trace.setAttribute("points", cp.map(function (p) { return p.join(","); }).join(" "));
  L.area.setAttribute("d", cp.length ? "M" + cp[0][0] + "," + L.base + "L" + cp.map(function (p) { return p.join(","); }).join("L") + "L" + cp[cp.length - 1][0] + "," + L.base + "Z" : "");
  var cxn = r1(L.CX(tf)) + 0.5;
  L.cursor.setAttribute("x1", cxn); L.cursor.setAttribute("x2", cxn);
  L.cursor.setAttribute("display", done ? "none" : "inline");

  var g = done ? F.n : fr[i].g;
  L.gates.forEach(function (el, gi) { el.setAttribute("class", "gate" + (gi < g ? " done" : gi === g ? " next" : "")); });

  // the drone: a heading mark on the true path; the estimate's ring beside it
  var spin = spinning(c) * 360;
  L.me.setAttribute("transform", "translate(" + r1(here[0]) + " " + r1(here[1]) + ") rotate(" + r1(heading(i) + spin) + ")");
  if (lastE && !done) { L.ering.setAttribute("cx", r1(lastE[0])); L.ering.setAttribute("cy", r1(lastE[1])); L.ering.setAttribute("display", "inline"); }
  else L.ering.setAttribute("display", "none");

  if (!done) {
    var e1 = err(fr[i]);
    set(L.status, c < LEAD ? "Ready, played at " + SPEED + "× speed" : "Flying, played at " + SPEED + "× speed");
    set(read.vl, "Speed"); set(read.el, "Estimate error");
    set(read.t, tf.toFixed(2) + " s");
    set(read.g, Math.min(g + 1, F.n) + " of " + F.n);
    set(read.v, lerp(speed(i), speed(j), u).toFixed(1) + " m/s");
    set(read.e, e1 === null ? "–" : e1.toFixed(2) + " m");
  } else {
    set(L.status, "Completed: " + F.n + " of " + F.n + " gates");
    set(read.vl, "Mean speed"); set(read.el, "Mean estimate error");
    set(read.t, F.time.toFixed(2) + " s");
    set(read.g, F.n + " of " + F.n);
    set(read.v, F.meanV.toFixed(1) + " m/s");
    set(read.e, F.meanE.toFixed(2) + " m");
  }
  return !done || spinning(c) > 0;
}

// How far through an acro-mode spin the drone mark is at clock c (0 when not spinning).
function spinning(c) {
  if (spinAt < 0 || c < spinAt || c > spinAt + ROLL) return 0;
  var k = (c - spinAt) / ROLL;
  return k * k * (3 - 2 * k);
}
// Acro mode (js/acro.js): the drone mark spins once, if the log is drawn and not still.
export function flip() {
  if (!L || still || !anim) return false;
  spinAt = clock;
  flying = true; anim.start();
  return true;
}

function play() {
  clock = 0; L.lastI = 0; still = false; spinAt = -1;
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
    var fr = P.frames, T = fr[fr.length - 1].t, len = 0, es = [];
    for (var k = 1; k < fr.length; k++) len += Math.hypot(fr[k].p[0] - fr[k - 1].p[0], fr[k].p[1] - fr[k - 1].p[1], fr[k].p[2] - fr[k - 1].p[2]);
    fr.forEach(function (f) { var v = err(f); if (v !== null) es.push(v); });
    F = { gates: e.gates, gateLen: e.gate_outer, start: e.start, n: e.n_gates, frames: fr, T: T, time: e.time || T,
      meanV: len / T, meanE: es.reduce(function (a, b) { return a + b; }, 0) / (es.length || 1), angle: axis(fr) };
    box.classList.add("ready");
    build(); render(clock);
    replay.hidden = false;
    anim = loop(box, function (dt) { clock += dt; return render(clock); });
    replay.addEventListener("click", play);
    // The hover test rig (js/hover-rig.js) takes over the figure; pause underneath it.
    $("flight").addEventListener("rig", function (ev) { if (ev.detail) anim.stop(); else if (flying) anim.start(); });
    if (window.ResizeObserver) new ResizeObserver(function () { build(); if (L) render(clock); }).observe(box);
    // Take off once at least half the figure is in view, so the flight is seen from the start.
    if (still) return;
    if (!window.IntersectionObserver) { start(); return; }
    var io = new IntersectionObserver(function (es2) {
      if (es2[es2.length - 1].intersectionRatio >= 0.5) { io.disconnect(); start(); }
    }, { threshold: [0, 0.5, 1] });
    io.observe(box);
  }, function () {});
});
