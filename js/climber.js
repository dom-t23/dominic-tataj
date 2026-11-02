// E-02's climb, Fig. 04 (DESIGN_PLAN.md 3.6, 3.7): the pipe climber on a corrected version of
// the team's Excel model. Same equations (a DC motor's straight torque-speed line, the gear ratio,
// the drive wheel, friction from the normal force, a chain whose weight grows with height), with
// the gear ratio used consistently, a 1 ms step (10 ms explicit Euler is unstable here: the drive
// responds in about 3 ms) and the slip check enforced. A setup that slips at the start is
// rejected; one that can't lift itself and its chain stalls; three minutes is the limit.
// The robot is the team's Fusion model in isometric (images/robot-iso-*.png, from tools/robot/).
import { $, reducedMotion } from "./util.js";

// The Excel sheet's parameters: motor stall torque 10 g cm, no-load speed 10 000 rpm, device 0.6 kg,
// chain 0.155 kg/m, wheel friction 0.7. The sliders set the rest.
var P = { ts: 10 * 1e-3 * 9.81 * 1e-2, w0: 10000 * 2 * Math.PI / 60, M: 0.6, m: 0.155, mu: 0.7, g: 9.81 };
var SHEET = { G: 150, D: 20, N: 30 }, H = 2, LIMIT = 180, DT = 0.001, SPEED = 10;
// The drawing, from tools/robot/iso.cjs: its size in mm of the picture plane, and where the pipe
// axis leaves the robot's underside. In isometric a vertical mm shows as sqrt(2/3) of a mm.
var PIC = [202.6, 246.7], FOOT = [137.2, 225.8], ISO = Math.sqrt(2 / 3);

var fig = $("climb-fig"), stage = $("climb-stage"), plot = $("cl-plot"), flow = $("flowchart");
var NS = "http://www.w3.org/2000/svg";

// Fly one setup to the top, a stall, or the limit; samples every 0.1 s.
export function simulate(G, Dmm, N) {
  var R = Dmm / 2000, k = P.ts / P.w0, grip = P.mu * N, stall = G * P.ts / R;
  var out = { G: G, D: Dmm, N: N, grip: grip, stall: stall, samples: [{ t: 0, x: 0, v: 0, F: stall }] };
  if (stall > grip) { out.result = "slip"; out.t = 0; out.x = 0; return out; }
  var x = 0, v = 0, t = 0, next = 0.1;
  while (x < H && t < LIMIT) {
    var tm = Math.max(0, P.ts - k * G * v / R), F = G * tm / R, a = F / (P.M + P.m * x) - P.g;
    v = Math.max(0, v + a * DT); x += v * DT; t += DT;
    if (v === 0 && a <= 0 && t > 0.5) { out.result = "stall"; break; }
    if (t >= next - 1e-9) { out.samples.push({ t: t, x: Math.min(x, H), v: v, F: F }); next += 0.1; }
  }
  out.t = t; out.x = Math.min(x, H);
  out.result = out.result || (x >= H ? "top" : "time");
  out.samples.push({ t: t, x: out.x, v: v, F: G * Math.max(0, P.ts - k * G * v / R) / R });
  return out;
}

function recompute() {
  var s = setup();
  run = simulate(s.G, s.D, s.N);
  drawPlot();
  plate.classList.toggle("slip", run.result === "slip");
  run.text = run.result === "top" ? "Climbs 2 m in " + run.t.toFixed(1) + " s" + (sameAsSheet(s) ? " (the sheet's setup)" : ", sheet's setup " + sheet.t.toFixed(1) + " s") :
    run.result === "slip" ? "Slips: drive " + run.stall.toFixed(1) + " N > grip " + run.grip.toFixed(1) + " N. Setup rejected" :
    run.result === "stall" ? "Stalls at " + run.x.toFixed(2) + " m: too little torque for its weight and chain" :
    "Out of time at " + run.x.toFixed(2) + " m";
  if (flow) flow.classList.toggle("reject", run.result === "slip");
  say(true);
}
// the verdict, or "Climbing" while a run plays
function say(done) {
  var r = $("cl-result");
  r.classList.toggle("bad", done && run.result !== "top");
  r.textContent = done ? run.text : "Climbing, at ten times real time";
}
function sameAsSheet(s) { return s.G === SHEET.G && s.D === SHEET.D && s.N === SHEET.N; }

// ---------- the stage: a pipe marked in metres scrolls past the robot ----------

function layout() {
  W = stage.clientWidth; Hs = stage.clientHeight;
  var rh = Math.min(Hs * 0.58, 300, (W - 150) * PIC[1] / PIC[0]);   // room for the ruler, its labels and the gauge
  pxmm = rh / PIC[1]; vmm = pxmm * ISO;
  // the drawing centred on the stage, a little left of the gauge; the pipe runs through its foot
  var cx = W / 2 - 10 + (FOOT[0] - PIC[0] / 2) * pxmm;
  robot.style.height = rh.toFixed(1) + "px"; robot.style.width = (rh * PIC[0] / PIC[1]).toFixed(1) + "px";
  robot.style.left = (cx - FOOT[0] * pxmm).toFixed(1) + "px";
  world.setAttribute("viewBox", "0 0 " + W + " " + Hs);
  world.textContent = "";
  var g = els.g = el("g", {}, world), pipeW = 22 * pxmm, len = ((H + 0.6) * 1000 + PIC[1]) * vmm;
  // the floor: a 300 mm square about the pipe, in isometric, and the pipe's round foot
  var fx = 150 * Math.SQRT2 * ISO * pxmm, fy = 150 * ISO * pxmm;
  el("path", { class: "ground", d: "M" + (cx - fx).toFixed(1) + " 0L" + cx.toFixed(1) + " " + (-fy).toFixed(1) + "L" + (cx + fx).toFixed(1) + " 0L" + cx.toFixed(1) + " " + fy.toFixed(1) + "Z" }, g);
  for (var k = 1; k < 6; k++) {   // floor grid, along both axes
    var f = k / 6 * 2 - 1;
    el("line", { class: "hatch", x1: (cx + fx * (f - 1) / 2).toFixed(1), y1: (fy * (f + 1) / 2).toFixed(1), x2: (cx + fx * (f + 1) / 2).toFixed(1), y2: (fy * (f - 1) / 2).toFixed(1) }, g);
    el("line", { class: "hatch", x1: (cx - fx * (f - 1) / 2).toFixed(1), y1: (fy * (f + 1) / 2).toFixed(1), x2: (cx - fx * (f + 1) / 2).toFixed(1), y2: (fy * (f - 1) / 2).toFixed(1) }, g);
  }
  el("ellipse", { class: "pipe", cx: cx.toFixed(1), cy: 0, rx: (pipeW / 2).toFixed(1), ry: (pipeW / 2 * Math.sin(Math.atan(1 / Math.SQRT2))).toFixed(1) }, g);
  el("rect", { class: "pipe", x: (cx - pipeW / 2).toFixed(1), y: (-len).toFixed(1), width: pipeW.toFixed(1), height: len.toFixed(1) }, g);
  // a ruler left of the robot: height climbed, read at the robot's bottom edge
  var rx = cx - FOOT[0] * pxmm - 12;
  el("line", { class: "tick", x1: rx, x2: rx, y1: 0, y2: (-(H + 0.5) * 1000 * vmm).toFixed(1) }, g);
  for (var mm = 0; mm <= (H + 0.5) * 1000; mm += 100) {
    var y = -mm * vmm, major = mm % 500 === 0;
    el("line", { class: "tick", x1: rx, x2: (rx - (major ? 12 : 6)).toFixed(1), y1: y.toFixed(1), y2: y.toFixed(1) }, g);
    if (major && mm > 0 && mm !== H * 1000) el("text", { x: (rx - 16).toFixed(1), y: (y + 3).toFixed(1), "text-anchor": "end" }, g).textContent = (mm / 1000).toFixed(1) + " M";
  }
  var top = -H * 1000 * vmm;
  el("line", { class: "top", x1: 0, x2: W, y1: top, y2: top }, g);
  el("text", { class: "top-t", x: 8, y: top - 6 }, g).textContent = "2 M CLIMBED";
  els.chain = el("line", { class: "chain", x1: cx + pipeW / 2 + 4, x2: cx + pipeW / 2 + 4 }, g);
  // the whole climb at a glance, on the right
  var gx = W - 14, gy0 = Hs - 24, gy1 = 24;
  el("line", { class: "gauge", x1: gx, x2: gx, y1: gy0, y2: gy1 }, world);
  els.gauge = el("line", { class: "gauge-on", x1: gx, x2: gx, y1: gy0, y2: gy0 }, world);
  els.gy = [gy0, gy1];
}

// x in m: the robot sits at a fixed height on the stage and the world moves under it
function show(s) {
  if (!s) return;
  if (run) run.cur = s;
  // near the ground the robot rises; then the pipe scrolls, with the whole drawing on the stage
  var base = Hs - 60, robotBottom = Math.max(FOOT[1] * pxmm + 14, base - Math.min(s.x * 1000 * vmm, Hs * 0.3));
  var shift = robotBottom - (-s.x * 1000 * vmm);
  els.g.setAttribute("transform", "translate(0 " + shift.toFixed(1) + ")");
  robot.style.transform = "translateY(" + (robotBottom - FOOT[1] * pxmm).toFixed(1) + "px)";
  els.chain.setAttribute("y1", (-s.x * 1000 * vmm).toFixed(1)); els.chain.setAttribute("y2", "0");
  els.gauge.setAttribute("y2", (els.gy[0] + (els.gy[1] - els.gy[0]) * s.x / H).toFixed(1));
  $("cl-t").textContent = s.t.toFixed(1) + " s";
  $("cl-x").textContent = s.x.toFixed(2) + " m";
  $("cl-v").textContent = Math.round(s.v * 1000) + " mm/s";
  $("cl-f").textContent = s.F.toFixed(1) + " / " + run.grip.toFixed(1) + " N";
  if (els.now) { els.now.setAttribute("cx", px(s.t).toFixed(1)); els.now.setAttribute("cy", py(s.x).toFixed(1)); }
}

// Plays the run at ten times real time (a slip shows at once).
function play() {
  stop();
  var id = ++anim, t0 = performance.now(), S = run.samples, end = S[S.length - 1].t;
  if (rm || run.result === "slip") { show(S[S.length - 1]); say(true); return; }
  say(false);
  requestAnimationFrame(function step(now) {
    if (id !== anim) return;
    var t = Math.min(end, (now - t0) / 1000 * SPEED), i = Math.min(S.length - 1, Math.floor(t / 0.1));
    show(S[i]);
    loopDot(now);
    if (t < end) requestAnimationFrame(step); else { loopDot(-1); say(true); }
  });
}
function stop() { anim++; loopDot(-1); if (run) say(true); }

// Fig. 05 follows a run: a dot goes round the model's loop (state → torque → force → slip check →
// acceleration → step), once every 0.4 s on screen.
var LOOP = [[86, 46], [434, 46], [434, 142], [86, 142], [86, 46]];
function loopDot(now) {
  if (!flow) return;
  if (now < 0) { if (dot) dot.setAttribute("opacity", 0); return; }
  if (!dot) {
    dot = el("circle", { class: "fc-dot", r: 4 }, flow);
    for (var i = 1; i < LOOP.length; i++) loopLen += Math.hypot(LOOP[i][0] - LOOP[i - 1][0], LOOP[i][1] - LOOP[i - 1][1]);
  }
  var d = (now / 400 % 1) * loopLen, j = 1;
  while (j < LOOP.length - 1) { var seg = Math.hypot(LOOP[j][0] - LOOP[j - 1][0], LOOP[j][1] - LOOP[j - 1][1]); if (d <= seg) break; d -= seg; j++; }
  var a = LOOP[j - 1], b = LOOP[j], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, k = Math.min(1, d / l);
  dot.setAttribute("opacity", 1);
  dot.setAttribute("cx", (a[0] + (b[0] - a[0]) * k).toFixed(1)); dot.setAttribute("cy", (a[1] + (b[1] - a[1]) * k).toFixed(1));
}

// ---------- height against time ----------

var PW = 0, PH = 150, L = 34, R = 8, T = 10, B = 22;
function px(t) { return L + (PW - L - R) * t / LIMIT; }
function py(x) { return PH - B - (PH - B - T) * x / H; }
function drawPlot() {
  PW = Math.max(260, Math.round(plot.clientWidth || 360));
  plot.setAttribute("viewBox", "0 0 " + PW + " " + PH);
  plot.textContent = "";
  for (var x = 0; x <= H; x += 0.5) {
    el("line", { class: "grid", x1: L, x2: PW - R, y1: py(x), y2: py(x) }, plot);
    el("text", { x: L - 6, y: py(x) + 3, "text-anchor": "end" }, plot).textContent = x.toFixed(1);
  }
  for (var t = 0; t <= LIMIT; t += 30) el("text", { x: px(t), y: PH - 6, "text-anchor": "middle" }, plot).textContent = t + (t === LIMIT ? " S" : "");
  el("line", { class: "limit", x1: px(LIMIT), x2: px(LIMIT), y1: T, y2: PH - B }, plot);
  el("path", { class: "axis", d: "M" + L + " " + T + "V" + (PH - B) + "H" + (PW - R) }, plot);
  el("text", { x: L + 4, y: T + 8 }, plot).textContent = "HEIGHT, M";
  var line = function (r, cls) { return el("polyline", { class: cls, points: r.samples.map(function (s) { return px(s.t).toFixed(1) + "," + py(s.x).toFixed(1); }).join(" ") }, plot); };
  line(sheet, "sheet");
  if (run.result !== "slip") line(run, "run");
  els.now = el("circle", { class: "now", r: 3.5 }, plot);
}

function el(tag, attrs, parent) {
  var n = document.createElementNS(NS, tag);
  for (var a in attrs) n.setAttribute(a, attrs[a]);
  parent.appendChild(n);
  return n;
}

// after every var above is assigned
if (fig) {
  var world = stage.querySelector(".climb-world"), robot = stage.querySelector(".climb-robot"), plate = fig.querySelector(".climb");
  var inputs = { G: $("cl-g"), D: $("cl-d"), N: $("cl-n") }, run = null, sheet = simulate(SHEET.G, SHEET.D, SHEET.N);
  var anim = 0, W = 0, Hs = 0, pxmm = 0, vmm = 0, els = {}, rm = reducedMotion(), dot = null, loopLen = 0;
  fig.hidden = false;

  var setup = function () { return { G: +inputs.G.value, D: +inputs.D.value, N: +inputs.N.value }; };
  var label = function () {
    $("cl-g-o").textContent = inputs.G.value; $("cl-d-o").textContent = inputs.D.value + " mm"; $("cl-n-o").textContent = inputs.N.value + " N";
  };
  Object.keys(inputs).forEach(function (k) {
    inputs[k].addEventListener("input", function () { label(); stop(); recompute(); show(run.samples[run.samples.length - 1]); });
  });
  $("cl-run").addEventListener("click", function () { recompute(); play(); });
  $("cl-reset").addEventListener("click", function () {
    inputs.G.value = SHEET.G; inputs.D.value = SHEET.D; inputs.N.value = SHEET.N; label(); stop(); recompute(); play();
  });

  layout(); recompute(); show(run.samples[0]);
  if (window.ResizeObserver) new ResizeObserver(function () { if (Math.abs(stage.clientWidth - W) > 1 || Math.abs(stage.clientHeight - Hs) > 1) { layout(); show(run.cur || run.samples[0]); } }).observe(stage);
  if (rm || !window.IntersectionObserver) show(run.samples[run.samples.length - 1]);
  else {
    var io = new IntersectionObserver(function (es) {
      if (es[es.length - 1].isIntersecting) { io.disconnect(); play(); }
    }, { threshold: 0.5 });
    io.observe(stage);
  }
}
