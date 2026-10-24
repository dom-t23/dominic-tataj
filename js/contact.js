import { $, root, reducedMotion } from "./util.js";

/* ---------- copy email ---------- */
$("copy").addEventListener("click", function () {
  var btn = this, text = $("email").textContent.trim();
  function selectIt() {
    var r = document.createRange(); r.selectNodeContents($("email"));
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    btn.textContent = "SELECTED — PRESS COPY";
  }
  try {
    navigator.clipboard.writeText(text).then(function () { btn.textContent = "COPIED"; burst(btn); }, selectIt);
  } catch (e) { selectIt(); }
  setTimeout(function () { btn.textContent = "COPY EMAIL"; }, 2400);
});

/* ---------- copy burst ---------- */
// Squares, outlines and drafting crosses fly from the button to the screen edges, behind square rings.
var DRAG = 3, GRAV = 380, bctx = null, parts = [], rings = [], bLast = 0;
function burst(el) {
  if (reducedMotion()) return;
  var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, W = innerWidth, H = innerHeight;
  var far = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
  var st = getComputedStyle(root), sig = st.getPropertyValue("--signal").trim(), ink = st.getPropertyValue("--ink").trim();
  if (!bctx) {
    var cv = document.createElement("canvas"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.className = "burst"; cv.setAttribute("aria-hidden", "true");
    cv.width = W * dpr; cv.height = H * dpr;
    document.body.appendChild(cv);
    bctx = cv.getContext("2d"); bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bLast = performance.now(); requestAnimationFrame(bTick);
  }
  rings.push({ x: x, y: y, far: far, t: 0, life: 0.75, color: sig, lw: 2 }, { x: x, y: y, far: far, t: -0.1, life: 0.9, color: ink, lw: 1 });
  var n = Math.round(Math.min(220, Math.max(90, W * H / 8000)));
  for (var i = 0; i < n; i++) {
    // With drag k, a particle launched at k * d coasts to a stop about d away.
    var a = Math.random() * 2 * Math.PI, d = far * (0.2 + Math.random() * 0.9), k = Math.random();
    parts.push({
      x: x, y: y, vx: Math.cos(a) * d * DRAG, vy: Math.sin(a) * d * DRAG - 120 * Math.random(),
      rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 16, t: 0, life: 1 + Math.random() * 0.7,
      kind: k < 0.75 ? "sq" : k < 0.9 ? "ol" : "x", color: k < 0.55 || (k >= 0.75 && k < 0.9) ? sig : ink,
      size: k < 0.75 ? 4 + Math.random() * 6 : 8 + Math.random() * 8
    });
  }
}
function bTick(now) {
  var dt = Math.min(0.05, (now - bLast) / 1000), c = bctx, f = Math.exp(-DRAG * dt);
  bLast = now;
  c.clearRect(0, 0, innerWidth, innerHeight);
  rings = rings.filter(function (g) {
    g.t += dt;
    if (g.t < 0) return true;
    var p = g.t / g.life, s = g.far * (1 - Math.pow(1 - p, 3));
    if (p >= 1) return false;
    c.globalAlpha = 1 - p; c.strokeStyle = g.color; c.lineWidth = g.lw;
    c.strokeRect(g.x - s, g.y - s, 2 * s, 2 * s);
    return true;
  });
  parts = parts.filter(function (q) {
    q.t += dt;
    var p = q.t / q.life, h = q.size / 2;
    if (p >= 1) return false;
    q.vx *= f; q.vy = q.vy * f + GRAV * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.spin * dt * (1 - p);
    c.globalAlpha = 1 - p * p;
    c.save(); c.translate(q.x, q.y); c.rotate(q.rot);
    if (q.kind === "sq") { c.fillStyle = q.color; c.fillRect(-h, -h, q.size, q.size); }
    else {
      c.strokeStyle = q.color; c.lineWidth = 1.5;
      if (q.kind === "ol") c.strokeRect(-h, -h, q.size, q.size);
      else { c.beginPath(); c.moveTo(-h, 0); c.lineTo(h, 0); c.moveTo(0, -h); c.lineTo(0, h); c.stroke(); }
    }
    c.restore();
    return true;
  });
  c.globalAlpha = 1;
  if (parts.length || rings.length) requestAnimationFrame(bTick);
  else { c.canvas.remove(); bctx = null; }
}
