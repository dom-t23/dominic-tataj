// E-01's scatter, Fig. 06 (DESIGN_PLAN.md 3.8): training power draw against parameter count for
// the 603 models in Dom's coursework dataset that have both (js/data/scaling.js). It opens on
// linear axes, where nearly every model crowds one corner; in view, the points sweep out onto
// log10 axes and the least-squares power law draws through them, as in the coursework. A switch
// flips between the two; pointing at a point names the model. Reduced motion: log axes, no sweep.
import { $, reducedMotion } from "./util.js";

var fig = $("scaling-fig"), svg = $("scaling");
var NS = "http://www.w3.org/2000/svg";
var GPT5_N = 3.3e11;          // GPT-5's parameter count as assumed in the coursework report (not public)
var M = { l: 48, r: 10, t: 30, b: 34 };
var SWEEP = 1700, HOLD = 700; // ms: the sweep to log axes, and how long the linear view shows first

var pts, fit, W, H, X0, X1, Y0, Y1, lin, lg, els = {}, t = 1, want = 1, anim = 0, hl = -1;
var rm = reducedMotion();

if (fig && svg) import("./data/scaling.js").then(function (m) {
  pts = m.default.map(function (d) { return { name: d[0], n: d[1], p: d[2], lx: Math.log10(d[1]), ly: Math.log10(d[2]) }; });
  fit = leastSquares(pts);
  fig.hidden = false;
  t = want = rm ? 1 : 0;
  layout();
  if (window.ResizeObserver) new ResizeObserver(function () { if (Math.abs(svg.clientWidth - W) > 1) layout(); }).observe(svg);
  fig.querySelectorAll(".sc-axes button").forEach(function (b) {
    b.addEventListener("click", function () { go(+b.dataset.log); });
  });
  svg.addEventListener("pointermove", point);
  svg.addEventListener("pointerdown", point);
  svg.addEventListener("pointerleave", function () { pick(-1); });
  if (rm || !window.IntersectionObserver) { go(1); return; }
  // in view: hold on the crowded linear view a moment, then sweep out
  var io = new IntersectionObserver(function (es) {
    if (!es[es.length - 1].isIntersecting) return;
    io.disconnect();
    setTimeout(function () { if (want === 0) go(1); }, HOLD);
  }, { threshold: 0.45 });
  io.observe(svg);
  addEventListener("beforeprint", function () { go(1, true); });
}, function () {});

function leastSquares(ps) {
  var n = ps.length, mx = 0, my = 0, sxx = 0, sxy = 0, syy = 0;
  ps.forEach(function (q) { mx += q.lx / n; my += q.ly / n; });
  ps.forEach(function (q) { var a = q.lx - mx, b = q.ly - my; sxx += a * a; sxy += a * b; syy += b * b; });
  var k = sxy / sxx;
  return { k: k, c: my - k * mx, r2: sxy * sxy / (sxx * syy) };
}

// ---------- drawing ----------

function layout() {
  W = Math.max(280, Math.round(svg.clientWidth || 480));
  H = Math.round(Math.min(380, Math.max(260, W * 0.68)));
  X0 = M.l; X1 = W - M.r; Y0 = M.t; Y1 = H - M.b;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.textContent = "";
  var maxN = Math.max.apply(null, pts.map(function (q) { return q.n; })), maxP = Math.max.apply(null, pts.map(function (q) { return q.p; }));
  var lx0 = Math.floor(Math.min.apply(null, pts.map(function (q) { return q.lx; }))), lx1 = Math.ceil(Math.max.apply(null, pts.map(function (q) { return q.lx; })));
  var ly0 = Math.floor(Math.min.apply(null, pts.map(function (q) { return q.ly; }))), ly1 = Math.ceil(Math.max.apply(null, pts.map(function (q) { return q.ly; })));
  var sx = niceStep(maxN), sy = niceStep(maxP);
  lin = { x: function (v) { return X0 + (X1 - X0) * v / (Math.ceil(maxN / sx) * sx); }, y: function (v) { return Y1 - (Y1 - Y0) * v / (Math.ceil(maxP / sy) * sy); } };
  lg = { x: function (v) { return X0 + (X1 - X0) * (v - lx0) / (lx1 - lx0); }, y: function (v) { return Y1 - (Y1 - Y0) * (v - ly0) / (ly1 - ly0); } };

  // the two sets of gridlines and ticks, cross-faded as the axes change
  els.gLin = el("g", {}, svg); els.gLog = el("g", {}, svg);
  for (var v = 0; v <= Math.ceil(maxN / sx) * sx * 1.0001; v += sx) tickX(els.gLin, lin.x(v), v ? fmt(v, "") : "0");
  for (v = 0; v <= Math.ceil(maxP / sy) * sy * 1.0001; v += sy) tickY(els.gLin, lin.y(v), v ? fmt(v, "W") : "0");
  var stepX = lx1 - lx0 > 8 ? 2 : 1, stepY = ly1 - ly0 > 8 ? 2 : 1;
  for (var e = lx0; e <= lx1; e += stepX) tickX(els.gLog, lg.x(e), "10" + sup(e));
  for (e = ly0; e <= ly1; e += stepY) tickY(els.gLog, lg.y(e), "10" + sup(e));
  el("path", { class: "axis", d: "M" + X0 + " " + Y0 + "V" + Y1 + "H" + X1 }, svg);
  el("text", { x: X1, y: H - 4, "text-anchor": "end" }, svg).textContent = "PARAMETERS, N";
  els.title = el("text", { class: "title", x: 0, y: 12 }, svg);
  el("text", { x: 0, y: 24 }, svg).textContent = "TRAINING POWER DRAW, P (W)";

  els.pts = pts.map(function () { return el("circle", { class: "pt", r: 2.6 }, svg); });
  // the fit and the GPT-5 estimate, on log axes only
  els.gFit = el("g", { opacity: 0 }, svg);
  // the line within the plot: from where it enters at the bottom (or left) to where it leaves
  var ua = Math.max(lx0, (ly0 - fit.c) / fit.k), ub = Math.min(lx1, (ly1 - fit.c) / fit.k);
  var a = [lg.x(ua), lg.y(fit.c + fit.k * ua)], b = [lg.x(ub), lg.y(fit.c + fit.k * ub)];
  els.fit = el("path", { class: "fit", d: "M" + f1(a[0]) + " " + f1(a[1]) + "L" + f1(b[0]) + " " + f1(b[1]), pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 }, els.gFit);
  // the fit's key in the empty bottom-right corner (no model draws little power for its size)
  el("path", { class: "fit", d: "M" + f1(X1 - 150) + " " + f1(Y1 - 12) + "h16" }, els.gFit);
  el("text", { class: "fit-t", x: f1(X1 - 4), y: f1(Y1 - 8), "text-anchor": "end" }, els.gFit).textContent =
    "P ∝ N" + sup(fit.k.toFixed(2)) + " · R² " + fit.r2.toFixed(2);
  var gx = Math.log10(GPT5_N), gy = fit.c + fit.k * gx, ex = lg.x(gx), ey = lg.y(gy);
  el("path", { class: "est", d: "M" + f1(ex) + " " + f1(ey - 6) + "l6 6-6 6-6-6z" }, els.gFit);
  el("text", { x: f1(ex), y: f1(ey + 22), class: "fit-t", "text-anchor": "middle" }, els.gFit).textContent = "GPT-5 ≈" + Number((Math.pow(10, gy) / 1e3).toPrecision(2)) + " kW";

  els.ring = el("circle", { class: "ring", r: 6, opacity: 0 }, svg);
  els.tip = el("g", { class: "tip", opacity: 0 }, svg);
  el("rect", { height: 18 }, els.tip);
  els.tipText = el("text", { x: 6, y: 12.5 }, els.tip);
  draw(t);
  showFit(t === 1, true);
}

// Each point leaves in turn, smallest model first, so the corner visibly unpacks.
function draw(tt) {
  t = tt;
  var n = pts.length;
  pts.forEach(function (q, i) {
    var k = ease(Math.min(1, Math.max(0, (tt - 0.45 * i / n) / 0.55)));
    els.pts[i].setAttribute("cx", f1(lin.x(q.n) + (lg.x(q.lx) - lin.x(q.n)) * k));
    els.pts[i].setAttribute("cy", f1(lin.y(q.p) + (lg.y(q.ly) - lin.y(q.p)) * k));
  });
  els.gLin.setAttribute("opacity", (1 - tt).toFixed(3));
  els.gLog.setAttribute("opacity", tt.toFixed(3));
  els.title.textContent = tt < 0.5 ? "LINEAR AXES" : "LOG₁₀ AXES";
  if (hl >= 0) pick(hl);
}

function showFit(on, now) {
  els.gFit.setAttribute("opacity", on ? 1 : 0);
  els.fit.style.transition = now || rm ? "none" : "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)";
  els.fit.setAttribute("stroke-dashoffset", on ? 0 : 1);
}

// to: 0 linear, 1 log
function go(to, now) {
  want = to;
  fig.querySelectorAll(".sc-axes button").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.log === to)); });
  if (to === 0) showFit(false, true);
  var from = t, t0 = performance.now(), id = ++anim, dur = SWEEP * Math.abs(to - from);
  if (now || rm || !dur) { draw(to); if (to === 1) showFit(true, true); return; }
  requestAnimationFrame(function step(ts) {
    if (id !== anim) return;
    var k = Math.min(1, (ts - t0) / dur);
    draw(from + (to - from) * k);
    if (k < 1) requestAnimationFrame(step); else if (to === 1) showFit(true);
  });
}

// ---------- pointing at a model ----------

function point(e) {
  var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
  var best = -1, bd = 14 * 14;
  els.pts.forEach(function (c, i) {
    var dx = +c.getAttribute("cx") - x, dy = +c.getAttribute("cy") - y, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = i; }
  });
  pick(best);
}

function pick(i) {
  hl = i;
  els.ring.setAttribute("opacity", i < 0 ? 0 : 1);
  els.tip.setAttribute("opacity", i < 0 ? 0 : 1);
  if (i < 0) return;
  var c = els.pts[i], cx = +c.getAttribute("cx"), cy = +c.getAttribute("cy"), q = pts[i];
  els.ring.setAttribute("cx", cx); els.ring.setAttribute("cy", cy);
  els.tipText.textContent = (q.name.length > 34 ? q.name.slice(0, 33) + "…" : q.name).toUpperCase() + " · " + fmt(q.n, "") + " · " + fmt(q.p, "W");
  var w = els.tipText.getComputedTextLength() + 12;
  els.tip.firstChild.setAttribute("width", f1(w));
  var tx = Math.min(Math.max(cx - w / 2, 0), W - w), ty = cy - 30 < 0 ? cy + 12 : cy - 30;
  els.tip.setAttribute("transform", "translate(" + f1(tx) + " " + f1(ty) + ")");
}

// ---------- helpers ----------

function niceStep(max) {
  var raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}
// 1.8e12 -> "1.8 T"; with unit "W": 2.1e7 -> "21 MW"
function fmt(v, unit) {
  var steps = unit ? [[1e9, " GW"], [1e6, " MW"], [1e3, " kW"], [1, " W"]] : [[1e12, " T"], [1e9, " B"], [1e6, " M"], [1e3, " k"], [1, ""]];
  for (var i = 0; i < steps.length; i++) if (v >= steps[i][0] || i === steps.length - 1) return Number((v / steps[i][0]).toPrecision(2)) + steps[i][1];
}
function sup(s) { return String(s).replace(/[-0-9.]/g, function (c) { return "⁻⁰¹²³⁴⁵⁶⁷⁸⁹·"["-0123456789.".indexOf(c)]; }); }
function tickX(g, x, label) {
  el("line", { class: "grid", x1: f1(x), x2: f1(x), y1: Y0, y2: Y1 }, g);
  el("text", { x: f1(x), y: Y1 + 14, "text-anchor": "middle" }, g).textContent = label;
}
function tickY(g, y, label) {
  el("line", { class: "grid", x1: X0, x2: X1, y1: f1(y), y2: f1(y) }, g);
  el("text", { x: X0 - 6, y: f1(y + 3), "text-anchor": "end" }, g).textContent = label;
}
function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(2 - 2 * k, 3) / 2; }
function f1(v) { return (+v).toFixed(1); }
function el(tag, attrs, parent) {
  var n = document.createElementNS(NS, tag);
  for (var a in attrs) n.setAttribute(a, attrs[a]);
  parent.appendChild(n);
  return n;
}
