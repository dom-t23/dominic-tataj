// Fig. 00's hover test rig (DESIGN_PLAN.md 1.2), loaded on demand by js/rig-button.js, whose
// TRY THE CONTROLLER button calls open(). It turns the flight strip into
// an elevation-view test rig for the drone model in js/quad.js: drag the drone, click to move
// its setpoint, send a gust, and change the position-loop gains, including past the
// Routh–Hurwitz limit, where it goes unstable and crashes. The rig shows the tilt, error,
// thrust and settling time, an error trace, and the closed-loop poles on the s-plane.
import { $ } from "./util.js";
import { loop } from "./motion.js";
import * as Q from "./quad.js";

var NS = "http://www.w3.org/2000/svg";
var DT = 1 / 240;                  // physics step, s
var KP0 = 6, KD0 = 3.4, SP0 = { x: 0, z: 1.5 };
var HOLD_K = 40, HOLD_C = 3;       // the "hand" when dragging: a spring and damper, N/m and N s/m
var GUST_F = 1, GUST_T = 0.6;      // gust: peak force N, duration s
var RESPAWN = 1.6;                 // s on the ground after a crash
// Failsafe, as on a real flight controller: four reversals of a tilt past 25° within 4 s means
// the loop is oscillating, so the motors are cut. A big but stable move reverses only once.
var OSC_TILT = 25 * Math.PI / 180, OSC_FLIPS = 4, OSC_WINDOW = 4;
var HISTORY = 6;                   // s of error trace

var fig = $("flight"), box = $("fv"), svg = $("rig"), controls = $("rig-controls");
var kpIn = $("kp"), kdIn = $("kd"), kpOut = $("kp-out"), kdOut = $("kd-out"), stab = $("stab");

var q, sp, gains = { kp: KP0, kd: KD0 }, t = 0, acc = 0;
var held = null, gustT = -9, crashT = -1, lost = false, impact = null, puffs = [], cut = false, side = 0, flips = [];
var eventT = 0, quietT = -1, settledIn = -1, hist = [], histT = 0, touched = false;
var L = null, anim = null, poles = [];

// gains on the sliders: Kp on a log scale 0.5 to 80, Kd linear -2 to 14
function kpOf(u) { return 0.5 * Math.pow(160, u); }
function uOfKp(k) { return Math.log(k / 0.5) / Math.log(160); }
function kdOf(u) { return -2 + 16 * u; }
function uOfKd(k) { return (k + 2) / 16; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function r1(v) { return Math.round(v * 10) / 10; }
function pct(u) { return (clamp(u, 0, 1) * 100).toFixed(1) + "%"; }

function make(tag, attrs, parent) {
  var e = document.createElementNS(NS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function label(str, attrs, parent) { var e = make("text", attrs, parent); e.textContent = str; return e; }
function show(e, on) { e.setAttribute("display", on ? "inline" : "none"); }
function tick(x, y, parent) { return make("line", { x1: x - 3, y1: y + 3, x2: x + 3, y2: y - 3, class: "ln" }, parent); }

// ---------------------------------------------------------------- simulation

function restart() {
  sp = { x: SP0.x, z: SP0.z };
  q = Q.landed(sp.x);            // it takes off from the ground: a step response to start with
  t = 0; acc = 0; held = null; gustT = -9; crashT = -1; lost = false; impact = null; puffs = []; cut = false; side = 0; flips = [];
  hist = []; histT = 0; mark();
}
function mark() { eventT = t; quietT = -1; settledIn = -1; }

function substep() {
  t += DT;
  var f = { x: (Math.random() - 0.5) * 0.04, z: (Math.random() - 0.5) * 0.02 };   // light turbulence
  if (held) { f.x += HOLD_K * (held.x - q.x) - HOLD_C * q.vx; f.z += HOLD_K * (held.z - q.z) - HOLD_C * q.vz; }
  var g = t - gustT;
  if (g >= 0 && g < GUST_T) f.x += GUST_F * Math.sin(Math.PI * g / GUST_T);
  Q.step(q, DT, sp, gains, crashT < 0 && !cut, f);
  var hit = Q.contact(q, DT);
  if (crashT < 0 && !cut && !held && Math.abs(q.th) > OSC_TILT && (q.th > 0 ? 1 : -1) !== side) {
    side = q.th > 0 ? 1 : -1; flips.push(t);
    flips = flips.filter(function (f0) { return t - f0 < OSC_WINDOW; });
    if (flips.length >= OSC_FLIPS) cut = true;
  }
  if (crashT < 0) {
    if (hit || (cut && q.z <= Q.HALF_H + 1e-6)) crash(hit || Math.hypot(q.vx, q.vz), false);
    else if (!isFinite(q.x + q.z + q.th) || q.x < L.xmin - 0.6 || q.x > L.xmax + 0.6 || q.z > L.zmax + 0.8) crash(0, true);
  } else {
    if (!lost && q.z <= Q.HALF_H + 1e-6) q.th += ((q.th < 0 ? -1 : 1) * Math.PI / 2 - q.th) * Math.min(1, DT * 12);   // tips onto its side
    if (t - crashT > RESPAWN) respawn();
  }
  // settled: within 3 cm, slower than 5 cm/s and level to 2°, for 0.3 s
  var quiet = crashT < 0 && !cut && !held && t - gustT > GUST_T &&
    Math.hypot(sp.x - q.x, sp.z - q.z) < 0.03 && Math.hypot(q.vx, q.vz) < 0.05 && Math.abs(q.th) < 0.035;
  if (!quiet) { quietT = -1; settledIn = -1; }
  else if (quietT < 0) quietT = t;
  else if (settledIn < 0 && t - quietT > 0.3) settledIn = Math.max(0, quietT - eventT);
}

function crash(speed, out) {
  crashT = t; lost = out; held = null; settledIn = -1;
  q.th = Math.atan2(Math.sin(q.th), Math.cos(q.th));   // after a tumble, the nearest side to lie on
  impact = { x: q.x, speed: speed };
  if (!out) for (var i = 0; i < 12; i++) {
    var a = Math.PI * (0.1 + 0.8 * Math.random());
    puffs.push({ x: q.x, z: 0.02, vx: Math.cos(a) * (0.6 + Math.random()), vz: Math.sin(a) * (0.6 + Math.random()), t: t });
  }
}
function respawn() {
  q = Q.landed(lost ? sp.x : clamp(q.x, L.xmin + 0.4, L.xmax - 0.4));
  crashT = -1; lost = false; cut = false; side = 0; flips = []; mark();
}

function advance(dt) {
  acc = Math.min(acc + dt, 0.1);
  while (acc >= DT) { substep(); acc -= DT; }
  if (t - histT >= 1 / 30) {
    histT = t;
    hist.push([t, sp.x - q.x, sp.z - q.z]);
    while (hist.length && hist[0][0] < t - HISTORY) hist.shift();
  }
  puffs = puffs.filter(function (p) { return t - p.t < 0.9; });
}

// ---------------------------------------------------------------- gains and poles

function setGains(kp, kd, fromSliders) {
  gains.kp = kp; gains.kd = kd;
  if (!fromSliders) { kpIn.value = String(Math.round(uOfKp(kp) * 1000)); kdIn.value = String(Math.round(uOfKd(kd) * 1000)); }
  kpOut.textContent = kp.toFixed(kp < 10 ? 1 : 0); kdOut.textContent = kd.toFixed(1);
  // red zones on the tracks: Kp above its Routh limit, Kd outside its stable span
  var lim = Q.kpLimit(kd), span = Q.kdRange(kp);
  kpIn.style.setProperty("--a", "0%");
  kpIn.style.setProperty("--b", lim > 0.5 ? pct(uOfKp(lim)) : "0%");
  kdIn.style.setProperty("--a", span ? pct(uOfKd(span[0])) : "100%");
  kdIn.style.setProperty("--b", span ? pct(uOfKd(span[1])) : "100%");
  poles = Q.poles(kp, kd);
  var dom = poles.reduce(function (a, p) { return p[0] > a[0] ? p : a; });
  var unstable = dom[0] > 0;
  stab.className = "stab" + (unstable ? " bad" : "");
  stab.textContent = unstable ? "UNSTABLE: RAISE Kd OR LOWER Kp" :
    "STABLE · ζ " + (-dom[0] / Math.hypot(dom[0], dom[1])).toFixed(2) + " · Kp LIMIT " + lim.toFixed(1);
  if (L) drawPoles();
}

// ---------------------------------------------------------------- drawing

function build() {
  var W = box.clientWidth, H = box.clientHeight;
  if (!W || !H) return;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.textContent = "";
  var wide = W >= 700, top = wide ? 74 : 118, gy = H - 40, se = (gy - top) / 3, cx = wide ? W * 0.4 : W / 2, k = wide ? 1.6 : 1.25;
  L = { W: W, H: H, wide: wide, gy: gy, se: se, cx: cx, k: k,
    xmin: (14 - cx) / se, xmax: (W - 14 - cx) / se, zmax: (gy - 20) / se };

  // frame: tag, ground with hatching
  make("rect", { x: 10.5, y: 10.5, width: 168, height: 19, class: "rule paper" }, svg);
  label("ELEVATION · HOVER TEST", { x: 17.5, y: 23.5, class: "ink" }, svg);
  make("line", { x1: 14, y1: gy, x2: W - 14, y2: gy, class: "ln" }, svg);
  for (var hx = 20; hx <= W - 14; hx += 8) make("line", { x1: hx, y1: gy + 1, x2: hx - 6, y2: gy + 7, class: "thin" }, svg);
  label("GROUND", { x: W - 14, y: gy + 22, "text-anchor": "end" }, svg);
  L.readout = label("", { x: 12, y: wide ? 52 : 50, class: "big" }, svg);

  // error trace (last 6 s) and, on wide screens, the s-plane
  var cw = wide ? 230 : W - 24, ch = wide ? 64 : 44, chx = wide ? W - 12 - 104 - 12 - cw : 12, chy = wide ? 12 : 62;
  make("rect", { x: chx + 0.5, y: chy + 0.5, width: cw, height: ch, class: "rule paper" }, svg);
  make("line", { x1: chx, y1: chy + 10 + ch / 2 + 0.5, x2: chx + cw, y2: chy + 10 + ch / 2 + 0.5, class: "rule" }, svg);
  label("ERROR · LAST 6 S", { x: chx + 6, y: chy + 12 }, svg);
  label("x", { x: chx + cw - 22, y: chy + 12, class: "ink" }, svg);
  make("line", { x1: chx + cw - 36, y1: chy + 8.5, x2: chx + cw - 26, y2: chy + 8.5, class: "truth" }, svg);
  label("z", { x: chx + cw - 6, y: chy + 12, class: "ink", "text-anchor": "end" }, svg);
  make("line", { x1: chx + cw - 18, y1: chy + 8.5, x2: chx + cw - 10, y2: chy + 8.5, class: "ln" }, svg);
  L.ex = make("polyline", { class: "truth", points: "" }, svg);
  L.ez = make("polyline", { class: "ln", points: "" }, svg);
  L.chart = { x: chx, y: chy, w: cw, h: ch };

  if (wide) {
    var px = W - 12 - 104, py = 12, pw = 104, ph = 64, ox = px + pw * 0.75;   // imaginary axis at 3/4
    make("rect", { x: px + 0.5, y: py + 0.5, width: pw, height: ph, class: "rule paper" }, svg);
    var clip = make("clipPath", { id: "rhp" }, make("defs", {}, svg));
    make("rect", { x: ox, y: py, width: px + pw - ox, height: ph }, clip);
    var hatch = make("g", { "clip-path": "url(#rhp)" }, svg);   // right half-plane hatched: poles there grow
    for (var h = -ph; h < px + pw - ox; h += 6) make("line", { x1: ox + h, y1: py + ph, x2: ox + h + ph, y2: py, class: "hatch" }, hatch);
    make("line", { x1: ox + 0.5, y1: py, x2: ox + 0.5, y2: py + ph, class: "thin" }, svg);
    make("line", { x1: px, y1: py + ph / 2 + 0.5, x2: px + pw, y2: py + ph / 2 + 0.5, class: "thin" }, svg);
    label("s-PLANE", { x: px + 6, y: py + 12 }, svg);
    L.splane = { ox: ox, oy: py + ph / 2, sx: (ox - px - 4) / 30, sy: (ph / 2 - 4) / 25, g: make("g", { class: "poles" }, svg) };
  } else L.splane = null;

  // setpoint, error line, height dimension
  L.sp = make("g", {}, svg);
  make("circle", { cx: 0, cy: 0, r: 7, class: "proj" }, L.sp);
  make("path", { d: "M-13 0h26M0 -13v26", class: "thin" }, L.sp);
  label("SETPOINT", { x: 14, y: 22 }, L.sp);
  L.err = make("line", { class: "proj" }, svg);
  L.dim = make("g", {}, svg);
  L.dimLine = make("line", { class: "ln" }, L.dim);
  L.dimExt = make("line", { class: "thin" }, L.dim);
  L.dimT0 = tick(0, 0, L.dim); L.dimT1 = tick(0, 0, L.dim);
  L.dimText = label("", { "text-anchor": "end", class: "ink" }, L.dim);

  // gust arrows, crash annotation, debris
  L.gust = make("g", { display: "none" }, svg);
  L.gustArrows = [0.35, 0.55, 0.75].map(function (f) {
    return make("path", { d: "M0 0h-46M-8 -5L0 0L-8 5", class: "thrust", transform: "translate(0 " + r1(top + (gy - top) * f) + ")" }, L.gust);
  });
  L.note = make("g", { display: "none" }, svg);
  L.noteLine = make("path", { class: "thin" }, L.note);
  L.noteText = label("", { class: "sig note" }, L.note);
  L.puffs = make("g", {}, svg);

  // the drone: side view as in the flight strip, with a thrust arrow along its body axis
  L.drone = make("g", {}, svg);
  L.thrust = make("path", { class: "thrust" }, L.drone);
  make("rect", { x: -9, y: -10, width: 18, height: 5, class: "solid" }, L.drone);
  make("rect", { x: -15, y: -4.5, width: 30, height: 7, class: "ln paper" }, L.drone);
  make("rect", { x: 14, y: -8, width: 5, height: 4, class: "accent", transform: "rotate(-20 16 -6)" }, L.drone);
  make("line", { x1: -15, y1: 0, x2: -22, y2: 0, class: "ln" }, L.drone);
  make("line", { x1: 15, y1: 0, x2: 22, y2: 0, class: "ln" }, L.drone);
  make("rect", { x: -26, y: -4, width: 6, height: 7, class: "solid" }, L.drone);
  make("rect", { x: 20, y: -4, width: 6, height: 7, class: "solid" }, L.drone);
  L.blades = [-23, 23].map(function (x, i) { return { el: make("line", { y1: -6.5, y2: -6.5, class: "ln" }, L.drone), x: x, ph: i * 1.3 }; });
  L.hint = label("DRAG ME", { "text-anchor": "middle", class: "sig" }, svg);
  drawPoles();
}

function X(x) { return L.cx + x * L.se; }
function Z(z) { return L.gy - z * L.se; }

function drawPoles() {
  if (!L.splane) return;
  var s = L.splane;
  s.g.textContent = "";
  poles.forEach(function (p) {
    var x = s.ox + clamp(p[0], -29, 9) * s.sx, y = s.oy - clamp(p[1], -24, 24) * s.sy;
    make("path", { d: "M" + r1(x - 3.5) + " " + r1(y - 3.5) + "l7 7m0 -7l-7 7", class: p[0] > 0 ? "thrust" : "ln" }, s.g);
  });
}

function draw() {
  var k = L.k, dx = X(q.x), dz = Z(q.z);
  // drone: tilt, thrust arrow, rotors spinning with thrust
  var lying = crashT >= 0 && !lost, show_ = !(crashT >= 0 && lost);
  show(L.drone, show_);
  // on the ground the glyph rests on whatever it is lying on: its gear (4 px below centre) or,
  // tipped over, the end of an arm (26 px out), so the centre rises as it rolls onto its side
  var restY = L.gy - k * (4 + 22 * Math.abs(Math.sin(q.th)));
  L.drone.setAttribute("transform", "translate(" + r1(dx) + " " + r1(lying ? restY : Math.min(dz, restY)) + ") rotate(" + r1(q.th * 180 / Math.PI) + ") scale(" + k + ")");
  var tl = 44 * q.T / Q.T_MAX;
  L.thrust.setAttribute("d", tl > 1 ? "M0 -11v" + r1(-tl) + "M-3 " + r1(-7 - tl) + "L0 " + r1(-11 - tl) + "L3 " + r1(-7 - tl) : "");
  var spin = 20 + 60 * q.T / Q.T_MAX;
  L.blades.forEach(function (b) {
    var half = q.T > 0.05 ? Math.max(3, 12 * Math.abs(Math.cos(t * spin + b.ph))) : 12;
    b.el.setAttribute("x1", r1(b.x - half)); b.el.setAttribute("x2", r1(b.x + half));
  });

  // setpoint and the error line to it
  L.sp.setAttribute("transform", "translate(" + r1(X(sp.x)) + " " + r1(Z(sp.z)) + ")");
  show(L.err, show_ && crashT < 0);
  L.err.setAttribute("x1", r1(dx)); L.err.setAttribute("y1", r1(dz)); L.err.setAttribute("x2", r1(X(sp.x))); L.err.setAttribute("y2", r1(Z(sp.z)));

  // height dimension
  var up = crashT < 0 && q.z > Q.HALF_H + 0.05;
  show(L.dim, up);
  if (up) {
    var dimX = dx - 48 * k, yb = dz + 3 * k;
    L.dimLine.setAttribute("x1", r1(dimX)); L.dimLine.setAttribute("x2", r1(dimX)); L.dimLine.setAttribute("y1", r1(L.gy)); L.dimLine.setAttribute("y2", r1(yb));
    L.dimExt.setAttribute("x1", r1(dimX - 4)); L.dimExt.setAttribute("x2", r1(dx - 18 * k)); L.dimExt.setAttribute("y1", r1(yb)); L.dimExt.setAttribute("y2", r1(yb));
    [[L.dimT0, L.gy], [L.dimT1, yb]].forEach(function (p) {
      p[0].setAttribute("x1", r1(dimX - 3)); p[0].setAttribute("x2", r1(dimX + 3)); p[0].setAttribute("y1", r1(p[1] + 3)); p[0].setAttribute("y2", r1(p[1] - 3));
    });
    L.dimText.setAttribute("x", r1(dimX - 7)); L.dimText.setAttribute("y", r1((L.gy + yb) / 2 + 3.5));
    L.dimText.textContent = (q.z - Q.HALF_H).toFixed(2) + " m";
  }

  // gust arrows sweep across while it blows
  var g = t - gustT;
  show(L.gust, g >= 0 && g < GUST_T);
  if (g >= 0 && g < GUST_T) L.gustArrows.forEach(function (a, i) {
    var x = 40 + (L.W - 60) * ((g / GUST_T + i * 0.27) % 1);
    a.setAttribute("transform", "translate(" + r1(x) + " " + a.getAttribute("transform").split(" ")[1]);
  });

  // crash or lost note, and debris
  show(L.note, crashT >= 0);
  if (crashT >= 0) {
    if (lost) {
      L.noteLine.setAttribute("d", "");
      L.noteText.setAttribute("x", r1(L.W / 2)); L.noteText.setAttribute("y", r1(L.gy - 12)); L.noteText.setAttribute("text-anchor", "middle");
      L.noteText.textContent = "LOST: FLEW OUT OF THE FRAME";
    } else {
      var ix = X(impact.x), right = ix < L.W - 180;
      L.noteLine.setAttribute("d", "M" + r1(ix) + " " + r1(L.gy - 6) + "l" + (right ? 24 : -24) + " -30h" + (right ? 12 : -12));
      L.noteText.setAttribute("x", r1(ix + (right ? 40 : -40))); L.noteText.setAttribute("y", r1(L.gy - 32)); L.noteText.setAttribute("text-anchor", right ? "start" : "end");
      L.noteText.textContent = "IMPACT " + impact.speed.toFixed(1) + " M/S";
    }
  }
  L.puffs.textContent = "";
  puffs.forEach(function (p, i) {
    var a = t - p.t, x = p.x + p.vx * a, z = p.z + p.vz * a - 4.9 * a * a;
    if (z < 0) return;
    make("rect", { x: r1(X(x) - 2.5), y: r1(Z(z) - 2.5), width: 5, height: 5, class: i % 3 ? "solid" : "accent", opacity: (1 - a / 0.9).toFixed(2) }, L.puffs);
  });

  // a hint until the first interaction
  show(L.hint, !touched && show_);
  L.hint.setAttribute("x", r1(dx)); L.hint.setAttribute("y", r1(dz + 30 * k));

  // error trace
  var c = L.chart, ex = [], ez = [], mid = c.y + 10 + c.h / 2, amp = c.h / 2 - 14;   // ±1 m, below the title row
  hist.forEach(function (h) {
    var x = c.x + c.w * (1 - (t - h[0]) / HISTORY);
    ex.push(r1(x) + "," + r1(mid - clamp(h[1], -1, 1) * amp));
    ez.push(r1(x) + "," + r1(mid - clamp(h[2], -1, 1) * amp));
  });
  L.ex.setAttribute("points", ex.join(" ")); L.ez.setAttribute("points", ez.join(" "));

  // readout, and a state for anything that wants to know (tests, assistive tech via the controls)
  var state = crashT >= 0 ? "crashed" : cut ? "failsafe" : held ? "held" : settledIn >= 0 ? "settled" : "settling";
  var status = crashT >= 0 ? (lost ? "LOST" : "CRASHED") + " · RESTART IN " + Math.max(0, RESPAWN - (t - crashT)).toFixed(1) + " S" :
    cut ? "FAILSAFE: OSCILLATING, MOTORS CUT" : held ? "HELD" : settledIn >= 0 ? "SETTLED IN " + settledIn.toFixed(1) + " S" : "SETTLING " + (t - eventT).toFixed(1) + " S";
  var parts = ["θ " + (Math.atan2(Math.sin(q.th), Math.cos(q.th)) * 180 / Math.PI).toFixed(1) + "°", "ERROR " + Math.hypot(sp.x - q.x, sp.z - q.z).toFixed(2) + " M",
    "THRUST " + Math.round(100 * q.T / Q.T_MAX) + "%", status];
  L.readout.textContent = L.wide ? parts.join("  ·  ") : parts.slice(0, 2).join("  ·  ") + "  ·  " + status;
  svg.dataset.state = state;
  svg.dataset.sp = sp.x.toFixed(2) + "," + sp.z.toFixed(2);
}

// ---------------------------------------------------------------- input

function world(e) {
  var r = svg.getBoundingClientRect();
  var px = (e.clientX - r.left) * L.W / r.width, py = (e.clientY - r.top) * L.H / r.height;
  return { x: (px - L.cx) / L.se, z: (L.gy - py) / L.se, px: px, py: py };
}
function moveSetpoint(x, z) {
  sp.x = clamp(x, L.xmin + 0.4, L.xmax - 0.4); sp.z = clamp(z, 0.3, Math.min(2.8, L.zmax - 0.2));
  mark();
}
function gust() { gustT = t; touched = true; mark(); }

svg.addEventListener("pointerdown", function (e) {
  if (!L || !fig.classList.contains("rig")) return;
  var p = world(e);
  touched = true;
  if (crashT < 0 && Math.hypot(p.px - X(q.x), p.py - Z(q.z)) < 34 * L.k) {
    held = { x: p.x, z: Math.max(0, p.z) };
    svg.setPointerCapture(e.pointerId);
  } else moveSetpoint(p.x, p.z);
  e.preventDefault();
});
svg.addEventListener("pointermove", function (e) { if (held) { var p = world(e); held = { x: p.x, z: Math.max(0, p.z) }; } });
function release() { if (held) { held = null; mark(); } }
svg.addEventListener("pointerup", release);
svg.addEventListener("pointercancel", release);
svg.addEventListener("keydown", function (e) {
  var d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] }[e.key];
  if (d) { touched = true; moveSetpoint(sp.x + d[0], sp.z + d[1]); e.preventDefault(); }
  else if (e.key === "g" || e.key === "G") gust();
  else if (e.key === "r" || e.key === "R") reset();
});

function onSlider() { touched = true; setGains(kpOf(+kpIn.value / 1000), kdOf(+kdIn.value / 1000), true); }
kpIn.addEventListener("input", onSlider);
kdIn.addEventListener("input", onSlider);
$("gust").addEventListener("click", gust);
function reset() { setGains(KP0, KD0, false); restart(); }
$("rig-reset").addEventListener("click", reset);

// ---------------------------------------------------------------- open and close

export function open() {
  fig.classList.add("rig");
  controls.hidden = false; $("cap-flight").hidden = true; $("cap-rig").hidden = false;
  svg.setAttribute("tabindex", "0");
  fig.dispatchEvent(new CustomEvent("rig", { detail: true }));
  build(); restart(); draw();
  anim.start();
  svg.focus({ preventScroll: true });
}
function close() {
  anim.stop();
  fig.classList.remove("rig");
  controls.hidden = true; $("cap-flight").hidden = false; $("cap-rig").hidden = true;
  svg.setAttribute("tabindex", "-1");
  fig.dispatchEvent(new CustomEvent("rig", { detail: false }));
  $("rig-open").focus({ preventScroll: true });
}

if (fig && svg) {
  setGains(KP0, KD0, false);
  anim = loop(box, function (dt) { advance(dt); draw(); });
  $("rig-close").addEventListener("click", close);
  if (window.ResizeObserver) new ResizeObserver(function () {
    if (fig.classList.contains("rig")) { build(); draw(); }
  }).observe(box);
}
