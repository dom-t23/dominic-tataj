import { $, root, sysDark, css, reducedMotion } from "./util.js";
import { loadScript, flightIndex } from "./flights.js";

/* ---------- drone replay ---------- */
var fpv = $("fpv"), fctx = fpv.getContext("2d"), map = $("map"), mctx = map.getContext("2d");
var TRUTH = "#2C6E9C";
var OUTCOMES = { completed: "Completed", crash_gate: "Crashed", missed_gate: "Missed gate", wrong_gate: "Wrong gate", timeout: "Timed out" };
var FL = [], seeds = [], methods = [], cur = {}, flight = null, idx = 0, playing = false, t0 = 0, tStart = 0, imgs = [], bounds = null;
var cache = {}, want = null, posterMode = false;

// flights/index.js lists the flights; each flight's frames (about 1 MB) load when it is picked.
function fetchFlight(ok, fail) {
  var e = FL.filter(function (f) { return f.seed === cur.seed && f.method === cur.method; })[0];
  if (!e) { fail(); return; }
  var id = e.id; want = id;
  if (cache[id]) { ok(cache[id]); return; }
  loadScript("flights/" + id + ".js", function () {
    cache[id] = window.FLIGHT_DATA && window.FLIGHT_DATA[id];
    if (want !== id) return;   // a later pick replaced this one
    if (cache[id]) ok(cache[id]); else fail();
  }, function () { if (want === id) fail(); });
}

// Fills the flight list from the shared index the first time it is needed.
function withIndex(ok, fail) {
  flightIndex(function (ix) {
    if (!FL.length) {
      FL = ix.list;
      FL.forEach(function (f) {
        if (seeds.indexOf(f.seed) < 0) seeds.push(f.seed);
        if (!methods.some(function (m) { return m.id === f.method; })) methods.push({ id: f.method, label: f.method === "default" ? "Camera + IMU" : "Camera only" });
      });
    }
    ok();
  }, fail);
}

$("load").addEventListener("click", function () {
  var btn = this;
  btn.disabled = true; btn.textContent = "LOADING…";
  function failed() { btn.disabled = false; btn.textContent = "RETRY"; $("load-note").textContent = "The recording could not be loaded."; }
  withIndex(function () {
    if (!FL.length) { btn.textContent = "REPLAY UNAVAILABLE"; return; }
    cur = { seed: seeds[0], method: methods[0].id };
    fetchFlight(function (f) {
      posterMode = false;
      document.querySelectorAll(".pv .rest").forEach(function (el) { el.hidden = true; });
      $("controls").setAttribute("aria-disabled", "false"); $("seeds").hidden = false; $("methods").hidden = false;
      renderSeg(); load(f); play(true);
    }, failed);
  }, failed);
});

// Before LOAD, draw one recorded moment of course 1 (a camera frame and the path so far)
// from the small poster in index.js, once the player is close to the viewport.
function showPoster() {
  var P = window.FLIGHT_POSTER, e = P && FL.filter(function (f) { return f.id === P.id; })[0];
  if (!e || (flight && !posterMode)) return;
  posterMode = true;
  load(Object.assign({}, e, { frames: P.frames }), P.idx);
  $("pv-map").querySelector(".rest").hidden = true;
}
if (window.IntersectionObserver) {
  var io = new IntersectionObserver(function (es) {
    if (es.some(function (en) { return en.isIntersecting; })) { io.disconnect(); withIndex(showPoster, function () {}); }
  }, { rootMargin: "600px 0px" });
  io.observe(document.querySelector(".player"));
}

function seg(el, items, key) {
  el.innerHTML = "";
  items.forEach(function (it) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = it.label;
    b.setAttribute("aria-pressed", String(cur[key] === it.id));
    b.addEventListener("click", function () {
      var prev = cur[key];
      cur[key] = it.id; renderSeg(); stop();
      $("controls").setAttribute("aria-disabled", "true");
      fetchFlight(function (f) {
        $("controls").setAttribute("aria-disabled", "false"); load(f); play(true);
      }, function () {
        cur[key] = prev; renderSeg();
        $("controls").setAttribute("aria-disabled", "false"); $("r-out").textContent = "Could not load that flight";
      });
    });
    el.appendChild(b);
  });
}
function renderSeg() {
  seg($("seeds"), seeds.map(function (s, i) { return { id: s, label: "Course " + (i + 1) }; }), "seed");
  seg($("methods"), methods, "method");
}

// at: frame to show first (the poster's frame; 0 for a full flight).
function load(f, at) {
  flight = f;
  stop(); idx = at || 0;
  imgs = flight.frames.map(function (fr) { if (!fr.img) return null; var im = new Image(); im.src = "data:image/jpeg;base64," + fr.img; return im; });
  var xs = [flight.start[0]], ys = [flight.start[1]];
  flight.gates.forEach(function (g) { xs.push(g.c[0]); ys.push(g.c[1]); });
  flight.frames.forEach(function (fr) { xs.push(fr.p[0]); ys.push(fr.p[1]); });
  bounds = { x0: Math.min.apply(null, xs) - 3, x1: Math.max.apply(null, xs) + 3, y0: Math.min.apply(null, ys) - 3, y1: Math.max.apply(null, ys) + 3 };
  if (imgs[idx]) imgs[idx].onload = draw;
  draw();
  if (posterMode) return;
  $("scrub").max = String(flight.frames.length - 1);
  var ok = flight.outcome === "completed";
  $("r-out").innerHTML = '<span class="pill ' + (ok ? "ok" : "bad") + '">' + (OUTCOMES[flight.outcome] || flight.outcome.replace(/_/g, " ")) + "</span>" +
    (ok && flight.time ? " " + flight.time.toFixed(2) + " s" : "");
}

function toMap(x, y) {
  var w = map.width, h = map.height, pad = 28;
  var s = Math.min((w - 2 * pad) / (bounds.x1 - bounds.x0), (h - 2 * pad) / (bounds.y1 - bounds.y0));
  var cx = (bounds.x0 + bounds.x1) / 2, cy = (bounds.y0 + bounds.y1) / 2;
  return [w / 2 + (x - cx) * s, h / 2 - (y - cy) * s];
}

function drawMap() {
  var c = mctx, fr = flight.frames, g = fr[idx].g;
  c.clearRect(0, 0, map.width, map.height);
  flight.gates.forEach(function (gt, k) {
    var half = flight.gate_outer / 2, ly = Math.cos(gt.yaw), lx = -Math.sin(gt.yaw);
    var p = toMap(gt.c[0] + lx * half, gt.c[1] + ly * half), q = toMap(gt.c[0] - lx * half, gt.c[1] - ly * half);
    c.strokeStyle = k < g ? css("--muted") : css("--signal"); c.lineWidth = k === g ? 6 : 3; c.lineCap = "butt";
    c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
    var m = toMap(gt.c[0], gt.c[1]);
    c.fillStyle = css("--muted"); c.font = "13px " + css("--font-data"); c.fillText(String(k + 1), m[0] + 8, m[1] - 8);
  });
  function path(key, color, dash) {
    c.strokeStyle = color; c.lineWidth = 2; c.setLineDash(dash); c.beginPath();
    var started = false;
    for (var i = 0; i <= idx; i++) {
      var v = fr[i][key]; if (!v) { started = false; continue; }
      var pt = toMap(v[0], v[1]);
      if (!started) { c.moveTo(pt[0], pt[1]); started = true; } else c.lineTo(pt[0], pt[1]);
    }
    c.stroke(); c.setLineDash([]);
  }
  path("p", TRUTH, []);
  path("e", css("--signal"), [5, 4]);
  var now = toMap(fr[idx].p[0], fr[idx].p[1]);
  c.fillStyle = TRUTH; c.beginPath(); c.arc(now[0], now[1], 5, 0, 2 * Math.PI); c.fill();
  if (fr[idx].e) { var en = toMap(fr[idx].e[0], fr[idx].e[1]); c.strokeStyle = css("--signal"); c.lineWidth = 2; c.beginPath(); c.arc(en[0], en[1], 7, 0, 2 * Math.PI); c.stroke(); }
}

function drawFpv() {
  var c = fctx, fr = flight.frames[idx], im = imgs[idx], W = fpv.width, H = fpv.height, s = W / flight.image_size[0];
  c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
  if (im && im.complete && im.naturalWidth) c.drawImage(im, 0, 0, W, H);
  fr.q.forEach(function (q) {
    c.strokeStyle = q.k === "o" ? "#4CF08F" : "#FFE14D"; c.lineWidth = 2; c.setLineDash(q.k === "o" ? [] : [6, 4]);
    c.beginPath();
    for (var i = 0; i < 4; i++) { var x = q.c[2 * i] * s, y = q.c[2 * i + 1] * s; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }
    c.closePath(); c.stroke(); c.setLineDash([]);
  });
  c.font = "500 16px " + css("--font-data"); c.textBaseline = "bottom";
  c.fillStyle = "rgba(0,0,0,.55)"; c.fillRect(0, H - 30, W, 30);
  c.fillStyle = "#F1F4F2";
  c.fillText([fr.t.toFixed(2) + " s", speedAt(idx).toFixed(1) + " m/s", "gate " + Math.min(fr.g + 1, flight.n_gates) + "/" + flight.n_gates].join("    "), 12, H - 7);
}

function speedAt(i) {
  var fr = flight.frames, a = Math.max(0, i - 1), b = Math.min(fr.length - 1, i + 1);
  if (a === b) return 0;
  var dx = fr[b].p[0] - fr[a].p[0], dy = fr[b].p[1] - fr[a].p[1], dz = fr[b].p[2] - fr[a].p[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz) / (fr[b].t - fr[a].t);
}

function draw() {
  if (!flight) return;
  drawFpv(); drawMap();
  if (posterMode) return;   // the readouts and scrubber wait for LOAD
  var fr = flight.frames[idx];
  $("scrub").value = String(idx);
  $("clock").textContent = fr.t.toFixed(2) + " s";
  $("r-gates").textContent = Math.min(fr.g, flight.n_gates) + " / " + flight.n_gates;
  $("r-speed").textContent = speedAt(idx).toFixed(1) + " m/s";
  if (fr.e) { var dx = fr.e[0] - fr.p[0], dy = fr.e[1] - fr.p[1], dz = fr.e[2] - fr.p[2]; $("r-err").textContent = Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2) + " m"; }
  else $("r-err").textContent = "–";
}

function tick(now) {
  if (!playing) return;
  var fr = flight.frames, t = tStart + (now - t0) / 1000;
  while (idx < fr.length - 1 && fr[idx + 1].t <= t) idx++;
  draw();
  if (idx >= fr.length - 1) { stop(); return; }
  requestAnimationFrame(tick);
}
// auto: started by loading a flight rather than the PLAY button, so it respects reduced motion.
function play(auto) {
  if (!flight) return;
  if (auto && reducedMotion()) return;
  if (idx >= flight.frames.length - 1) idx = 0;
  playing = true; $("play").textContent = "PAUSE"; t0 = performance.now(); tStart = flight.frames[idx].t;
  requestAnimationFrame(tick);
}
function stop() { playing = false; $("play").textContent = "PLAY"; }
$("play").addEventListener("click", function () { if (playing) stop(); else play(false); });
$("scrub").addEventListener("input", function () {
  if (!flight) return;
  idx = parseInt(this.value, 10) || 0;
  if (playing) { t0 = performance.now(); tStart = flight.frames[idx].t; }
  draw();
});

var redraw = function () { if (flight) draw(); };
if (sysDark && sysDark.addEventListener) sysDark.addEventListener("change", redraw);
new MutationObserver(redraw).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
