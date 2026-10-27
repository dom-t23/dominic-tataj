// Revision clouds (DESIGN_PLAN.md 2.3): hovering a project's title draws the drafting mark for
// "changed" around it, a scalloped cloud with a little irregularity, as if drawn by hand. Built
// on each hover, to fit the title's text as it is laid out then.
var NS = "http://www.w3.org/2000/svg";
var PAD = 6, SCALLOP = 13;   // px around the text; px per scallop, about

// In the register the cloud goes round the whole entry, title and line below; on a sheet,
// round the title.
document.querySelectorAll(".register a, .sheet-title h3").forEach(function (host) {
  var texts = host.matches("a") ? [host.querySelector(".r-title"), host.querySelector(".r-meta")] : [host];
  var svg = null;
  host.addEventListener("pointerenter", function (e) {
    if (e.pointerType !== "mouse") return;
    svg = svg || el("svg", { class: "rev-cloud", "aria-hidden": "true" }, host);
    svg.textContent = "";
    var r = union(texts.map(textBox)), b = host.getBoundingClientRect();
    el("path", { d: cloud(r.left - b.left - PAD, r.top - b.top - PAD, r.width + 2 * PAD, r.height + 2 * PAD, host.textContent.length), pathLength: 1 }, svg);
    host.classList.remove("rev-on"); void svg.getBoundingClientRect();
    host.classList.add("rev-on");
  });
  host.addEventListener("pointerleave", function () { host.classList.remove("rev-on"); });
});

function union(rs) {
  var l = Math.min.apply(null, rs.map(function (r) { return r.left; })), t = Math.min.apply(null, rs.map(function (r) { return r.top; }));
  var r = Math.max.apply(null, rs.map(function (x) { return x.left + x.width; })), b = Math.max.apply(null, rs.map(function (x) { return x.top + x.height; }));
  return { left: l, top: t, width: r - l, height: b - t };
}

// The box of an element's text, not of the element (a grid cell can be wider than its words).
function textBox(node) {
  var range = document.createRange(), rects = [], walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), t;
  while ((t = walk.nextNode())) {
    range.selectNodeContents(t);
    Array.prototype.forEach.call(range.getClientRects(), function (r) { if (r.width > 0) rects.push(r); });
  }
  var l = Infinity, tp = Infinity, rr = -Infinity, bb = -Infinity;
  rects.forEach(function (r) { l = Math.min(l, r.left); tp = Math.min(tp, r.top); rr = Math.max(rr, r.right); bb = Math.max(bb, r.bottom); });
  return rects.length ? { left: l, top: tp, width: rr - l, height: bb - tp } : node.getBoundingClientRect();
}

// Clockwise round the box; every arc bulges outwards. seed: something stable per title.
function cloud(x, y, w, h, seed) {
  var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  var pts = [], corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  corners.forEach(function (a, i) {
    var b = corners[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / SCALLOP));
    for (var k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  });
  var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
  for (var i = 1; i <= pts.length; i++) {
    var p = pts[i % pts.length], q = pts[i - 1], r = Math.hypot(p[0] - q[0], p[1] - q[1]) * (0.55 + 0.12 * rnd());
    d += "A" + f(r) + " " + f(r) + " 0 0 1 " + f(p[0] + (rnd() - 0.5) * 1.2) + " " + f(p[1] + (rnd() - 0.5) * 1.2);
  }
  return d;
}

function f(v) { return v.toFixed(1); }
function el(tag, attrs, parent) {
  var n = document.createElementNS(NS, tag);
  for (var a in attrs) n.setAttribute(a, attrs[a]);
  parent.appendChild(n);
  return n;
}
