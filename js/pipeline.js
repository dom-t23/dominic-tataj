// Pipeline strip (DESIGN_PLAN.md 3.3): the flight stack's four stages at the replay's current
// frame. DETECT: the colour mask and the squares fitted in it. MEASURE: PnP poses of the
// largest square, in plan in front of the camera. FUSE: the filter's 95% ellipse against the
// truth, and its uncertainty over the flight. FLY: the commands, as an FPV transmitter's
// sticks (mode 2). All recorded with the flight (tools/export_flights.py), none of it simulated
// here. replay.js calls setFlight() when a flight loads and show() each time it draws.
import { $, css } from "./util.js";

var NS = "http://www.w3.org/2000/svg";
var K95 = 2.448;                 // a 2D Gaussian's 95% ellipse, in standard deviations
var SCALES = [0.05, 0.1, 0.2, 0.5, 1, 2, 5];   // m, the FUSE plot's radius steps
var PLAN = 13;                   // px per m in MEASURE (10 m fits)
var TRAIL = 8;                   // earlier frames drawn behind each stick

var P = {}, fl = null, at = -1, masks = [], spark = null, tint = null;
["detect", "measure", "fuse", "fly"].forEach(function (k) {
  var el = $("pp-" + k);
  if (el) P[k] = { el: el, g: el.querySelector("svg, canvas"), r: el.querySelector(".pp-r") };
});

function el(tag, attrs, parent) {
  var n = document.createElementNS(NS, tag);
  for (var a in attrs) n.setAttribute(a, attrs[a]);
  if (parent) parent.appendChild(n);
  return n;
}
function f1(v) { return v.toFixed(1); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

// ---------- fixed parts of each drawing ----------

var M = {}, F = {}, Y = {};
if (P.measure) {
  var s = P.measure.g;
  [2, 4, 6, 8, 10].forEach(function (r) {   // range arcs, 60° either side of straight ahead
    var a = 60 * Math.PI / 180, x0 = 100 - r * PLAN * Math.sin(a), y0 = 142 - r * PLAN * Math.cos(a), b = Math.PI / 4;
    el("path", { class: "grid", d: "M" + f1(x0) + " " + f1(y0) + "A" + r * PLAN + " " + r * PLAN + " 0 0 1 " + f1(200 - x0) + " " + f1(y0) }, s);
    if (r < 10) el("text", { x: f1(100 + r * PLAN * Math.sin(b) + 3), y: f1(142 - r * PLAN * Math.cos(b) + 3) }, s).textContent = r + " M";
  });
  el("path", { class: "ink", d: "M95 147h10l-5 -7z", style: "fill: var(--ink); stroke-width: 1" }, s);   // the camera
  M.sols = el("g", {}, s);
}
if (P.fuse) {
  var u = P.fuse.g;
  el("path", { class: "grid", d: "M100 4v100M48 54h104" }, u);
  F.ring = el("circle", { class: "grid", cx: 100, cy: 54, r: 46 }, u);
  F.scale = el("text", { x: 150, y: 14 }, u);
  F.ell = el("ellipse", { class: "sig-fill", cx: 100, cy: 54 }, u);
  F.truth = el("circle", { class: "truth", r: 3.2 }, u);
  el("path", { class: "sig", d: "M96 54h8M100 50v8", style: "stroke-width: 1.5" }, u);   // the estimate
  el("path", { class: "grid", d: "M4 146h192" }, u);
  F.spark = el("path", { class: "spark" }, u);
  F.ticks = el("g", {}, u);
  F.cursor = el("line", { class: "cursor", y1: 112, y2: 146 }, u);
  el("text", { x: 4, y: 120 }, u).textContent = "σ";
}
if (P.fly) {
  var y = P.fly.g;
  [[14, "THROTTLE · YAW"], [114, "PITCH · ROLL"]].forEach(function (b, i) {
    var x = b[0];
    el("rect", { class: "grid", x: x, y: 10, width: 72, height: 72 }, y);
    el("path", { class: "grid", d: "M" + (x + 36) + " 10v72M" + x + " 46h72" }, y);
    el("text", { x: x, y: 98 }, y).textContent = b[1];
    var st = { trail: el("polyline", { class: "trail" }, y), shaft: el("line", { class: "ink", x1: x + 36, y1: 46, style: "stroke-width: 1.5" }, y), knob: el("circle", { class: "knob", r: 5.5 }, y), x: x };
    Y[i ? "right" : "left"] = st;
  });
  Y.hover = el("path", { class: "sig", d: "" }, y);   // hover thrust on the throttle axis
}

// ---------- per flight ----------

export function setFlight(f) {
  fl = f; at = -1;
  masks = f.frames.map(function (fr, i) {
    if (!fr.mk) return null;
    var im = new Image();
    im.onload = function () { if (i === at) detect(fl.frames[i], i); };
    im.src = "data:image/png;base64," + fr.mk;
    return im;
  });
  // FUSE: the filter's larger 1-sigma axis over the whole flight, on a log scale, and its events
  spark = null;
  if (P.fuse) {
    var fr = f.frames, t0 = fr[0].t, t1 = fr[fr.length - 1].t, d = "", pen = false, ticks = "", bad = "";
    var X = function (t) { return 4 + 192 * (t - t0) / Math.max(t1 - t0, 1e-6); };
    var Yl = function (v) { return 144 - 30 * clamp((Math.log10(v) + 2) / 2.3, 0, 1); };   // 0.01 m to 2 m
    fr.forEach(function (x) {
      if (!x.cv) { pen = false; return; }
      d += (pen ? "L" : "M") + f1(X(x.t)) + " " + f1(Yl(x.cv[0]));
      pen = true;
      if (x.ev && /h/.test(x.ev)) ticks += "M" + f1(X(x.t)) + " 112v4";
      if (x.ev && /[ri]/.test(x.ev)) bad += "M" + f1(X(x.t)) + " " + (/i/.test(x.ev) ? "112v34" : "140v6");
    });
    F.spark.setAttribute("d", d);
    F.ticks.innerHTML = "";
    if (ticks) el("path", { class: "tick", d: ticks }, F.ticks);
    if (bad) el("path", { class: "tick-bad", d: bad }, F.ticks);
    spark = X;
  }
}

// ---------- per frame ----------

export function show(f, i) {
  if (f !== fl) setFlight(f);
  at = i;
  var fr = f.frames[i];
  detect(fr, i);
  measure(fr);
  fuse(fr);
  fly(fr, i);
}

function light(p, on, bad) { p.el.classList.toggle("on", !!on && !bad); p.el.classList.toggle("bad", !!bad); }
// Readouts in capitals, as the rest of the page's data, but σ and χ stay lower case.
function say(p, text, bad) { p.r.textContent = text.toUpperCase().replace(/Σ/g, "σ").replace(/Χ/g, "χ"); p.r.classList.toggle("bad", !!bad); }

function detect(fr, i) {
  var p = P.detect;
  if (!p || !fr.q) return;
  var c = p.g, x = c.getContext("2d"), W = c.width, H = c.height, k = W / fl.image_size[0];
  x.clearRect(0, 0, W, H);
  var im = masks[i];
  if (im && im.complete && im.naturalWidth) {
    // the mask in ink: copy it through a small canvas, keeping only the "on" pixels
    tint = tint || document.createElement("canvas");
    tint.width = im.naturalWidth; tint.height = im.naturalHeight;
    var tx = tint.getContext("2d");
    tx.drawImage(im, 0, 0);
    var data = tx.getImageData(0, 0, tint.width, tint.height), d = data.data, ink = rgb(css("--ink"));
    for (var j = 0; j < d.length; j += 4) {
      var on = d[j] > 127;
      d[j] = ink[0]; d[j + 1] = ink[1]; d[j + 2] = ink[2]; d[j + 3] = on ? 200 : 0;
    }
    tx.putImageData(data, 0, 0);
    x.imageSmoothingEnabled = false;
    x.drawImage(tint, 0, 0, W, H);
  }
  var outl = 0, open = 0;
  x.lineWidth = 2.5; x.strokeStyle = css("--signal");
  fr.q.forEach(function (q) {
    if (q.k === "o") outl++; else open++;
    x.setLineDash(q.k === "o" ? [] : [5, 4]);
    x.beginPath();
    for (var n = 0; n < 4; n++) x[n ? "lineTo" : "moveTo"](q.c[2 * n] * k, q.c[2 * n + 1] * k);
    x.closePath(); x.stroke();
  });
  x.setLineDash([]);
  light(p, fr.q.length);
  say(p, fr.q.length ? plural(outl, "outline") + ", " + plural(open, "opening") : "No square in the mask");
}

function measure(fr) {
  var p = P.measure;
  if (!p) return;
  M.sols.innerHTML = "";
  var pn = fr.pn;
  light(p, pn);
  if (!pn) { say(p, fr.m === "w" ? "Waiting for a gate" : "No square gives a valid pose"); return; }
  var size = (pn.k === "o" ? fl.gate_outer : fl.gate_inner) / 2 * PLAN;
  pn.s.slice().reverse().forEach(function (s, j) {   // the best solution last, on top
    var best = j === pn.s.length - 1, cx = 100 + s[0] * PLAN, cy = 142 - Math.min(s[1], 10.5) * PLAN;
    var ux = Math.cos(s[2]), uy = Math.sin(s[2]), nx = Math.sin(s[2]) * 8, ny = -Math.cos(s[2]) * 8;
    el("path", {
      class: best ? "ink" : "alt",
      d: "M" + f1(cx - ux * size) + " " + f1(cy - uy * size) + "L" + f1(cx + ux * size) + " " + f1(cy + uy * size) +
        "M" + f1(cx) + " " + f1(cy) + "l" + f1(nx) + " " + f1(ny)
    }, M.sols);
  });
  var b = pn.s[0], what = pn.k === "o" ? "Outline" : "Opening";
  say(p, what + " " + Math.hypot(b[0], b[1]).toFixed(1) + " m · " +
    (pn.s.length > 1 ? pn.s.length + " solutions, ambiguous" : "1 solution, " + b[3].toFixed(1) + " px"));
}

function fuse(fr) {
  var p = P.fuse;
  if (!p) return;
  var ev = fr.ev || "";
  if (!fr.cv || !fr.e) {
    F.ell.setAttribute("rx", 0); F.ell.setAttribute("ry", 0); F.truth.setAttribute("r", 0);
    F.cursor.setAttribute("x1", -10); F.cursor.setAttribute("x2", -10);
    light(p, false);
    say(p, "Not started: hovering until it sees a gate");
    return;
  }
  var ex = fr.p[0] - fr.e[0], ey = fr.p[1] - fr.e[1], err = Math.hypot(ex, ey), need = Math.max(K95 * fr.cv[0], err);
  var R = SCALES.filter(function (v) { return v >= need; })[0] || SCALES[SCALES.length - 1], k = 46 / R;
  F.scale.textContent = (R < 1 ? R.toFixed(2) : R.toFixed(0)) + " M";
  F.ell.setAttribute("rx", f1(K95 * fr.cv[0] * k)); F.ell.setAttribute("ry", f1(K95 * fr.cv[1] * k));
  F.ell.setAttribute("transform", "rotate(" + f1(-fr.cv[2] * 180 / Math.PI) + " 100 54)");
  F.truth.setAttribute("r", 3.2);
  F.truth.setAttribute("cx", f1(100 + clamp(ex * k, -50, 50))); F.truth.setAttribute("cy", f1(54 - clamp(ey * k, -50, 50)));
  if (spark) { var cx = f1(spark(fr.t)); F.cursor.setAttribute("x1", cx); F.cursor.setAttribute("x2", cx); }
  var bad = /[ri]/.test(ev);
  light(p, /u/.test(ev), bad);
  say(p, (/i/.test(ev) ? "Re-initialised" : /r/.test(ev) ? "Rejected (χ² gate)" : /u/.test(ev) ? "Fused" : "Predicting") +
    " · σ " + fr.cv[0].toFixed(2) + " m · error " + err.toFixed(2) + " m", bad);
}

function fly(fr, i) {
  var p = P.fly;
  if (!p || !fr.u) return;
  var g = fl.g || 9.81, tmax = fl.thrust_max, rm = fl.rate_max;
  // mode 2: left stick throttle (up) and yaw (FLU: +r yaws left); right stick pitch (+q noses
  // down, stick forward) and roll (+p banks right)
  function sticks(u) {
    return {
      left: [-u[3] / rm[2], (u[0] / tmax) * 2 - 1],
      right: [u[1] / rm[0], u[2] / rm[1]]
    };
  }
  var now = sticks(fr.u), back = [];
  for (var j = Math.max(0, i - TRAIL); j <= i; j++) if (fl.frames[j].u) back.push(sticks(fl.frames[j].u));
  ["left", "right"].forEach(function (side) {
    var st = Y[side], cx = st.x + 36, pos = function (v) { return [cx + clamp(v[0], -1, 1) * 36, 46 - clamp(v[1], -1, 1) * 36]; };
    var q = pos(now[side]);
    st.knob.setAttribute("cx", f1(q[0])); st.knob.setAttribute("cy", f1(q[1]));
    st.shaft.setAttribute("x2", f1(q[0])); st.shaft.setAttribute("y2", f1(q[1]));
    st.trail.setAttribute("points", back.map(function (b) { return pos(b[side]).map(f1).join(","); }).join(" "));
  });
  Y.hover.setAttribute("d", "M8 " + f1(46 - ((g / tmax) * 2 - 1) * 36) + "h10");
  light(p, fr.m !== "w");
  say(p, "Thrust " + (fr.u[0] / g).toFixed(2) + " g · rates " + fr.u.slice(1).map(function (v) { return v.toFixed(1); }).join(" ") + " rad/s");
}

function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
function rgb(hex) {
  var h = hex.replace("#", "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
