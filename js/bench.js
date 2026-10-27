// Fig. 03, the benchmark (DESIGN_PLAN.md 3.5). A data column's header charts that column as
// gates missed per set (out of 400, from a zero baseline, on one scale for every column) and
// sorts the table by it, worst set first; pressing it again, or "Course set", restores the
// course order. A set's row and its bar pick each other out. The pooled row pulses once when
// the table comes into view. The chart is laid out at its own pixel width, so its text stays
// 10 px on a phone.
import { $, reducedMotion } from "./util.js";
import { DUR } from "./motion.js";

var table = $("bench"), svg = $("bench-chart");
var NS = "http://www.w3.org/2000/svg";
var H = 176, X0 = 30, Y0 = 44, Y1 = 148, MAX = 40;   // chart height, plot area (px); gates missed

if (table && svg) {
  var head = table.tHead.rows[1].cells, groups = table.tHead.rows[0].cells;
  var rows = Array.prototype.slice.call(table.tBodies[0].rows), pooled = table.tFoot.rows[0];
  var sets = rows.map(function (r) { return r.cells[0].textContent; });
  var col = 3, sorted = false, shown = null, anim = 0, hl = -1;
  var W = 0, X1 = 0, bars, caps, title, info, ref;

  // headers become buttons
  Array.prototype.forEach.call(head, function (th, c) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = th.textContent;
    th.textContent = "";
    th.appendChild(b);
    b.addEventListener("click", function () {
      if (c === 0) sorted = false;
      else if (c === col) sorted = !sorted;
      else { col = c; sorted = true; }
      render(true);
    });
  });
  rows.forEach(function (r, i) {
    r.addEventListener("pointerenter", function () { pick(i); });
    r.addEventListener("pointerleave", function () { pick(-1); });
  });

  svg.removeAttribute("hidden");
  layout();
  if (window.ResizeObserver) new ResizeObserver(function () { if (Math.abs(svg.clientWidth - W) > 1) { layout(); render(null); } }).observe(svg);
  render(false);

  if (window.IntersectionObserver && !reducedMotion()) {
    var seen = new IntersectionObserver(function (es) {
      if (!es[es.length - 1].isIntersecting) return;
      seen.disconnect();
      pooled.classList.add("pulse");
      grow(missed(col).map(function () { return 0; }), missed(col));
    }, { threshold: 0.4 });
    seen.observe(table);
    draw(missed(col).map(function () { return 0; }));   // starts flat, grows into view
    addEventListener("beforeprint", function () { anim++; draw(missed(col)); });
  }
}

// Builds the chart's fixed parts for its current width.
function layout() {
  W = Math.max(280, Math.round(svg.clientWidth || 480));
  X1 = W - 4;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.textContent = "";
  var g = el("g", {}, svg), wide = (X1 - X0) / 6 > 66;
  [0, 10, 20, 30, 40].forEach(function (v) {
    el("line", { class: "grid", x1: X0, x2: X1, y1: y(v), y2: y(v) }, g);
    el("text", { x: X0 - 8, y: y(v) + 3, "text-anchor": "end" }, g).textContent = v;
  });
  title = el("text", { class: "title", x: 0, y: 12 }, g);
  info = el("text", { x: 0, y: 28 }, g);
  ref = el("line", { class: "ref", x1: X0, x2: X1 }, g);
  bars = []; caps = [];
  sets.forEach(function (s, i) {
    var cx = slot(i);
    bars.push(el("path", { class: "bar" }, g));
    caps.push(el("text", { x: cx, "text-anchor": "middle" }, g));
    el("text", { x: cx, y: Y1 + 16, "text-anchor": "middle" }, g).textContent = wide ? s : s.split("–")[0];
    var hit = el("rect", { class: "hit", x: cx - (X1 - X0) / 12, y: Y0, width: (X1 - X0) / 6, height: Y1 - Y0 + 20 }, g);
    hit.addEventListener("pointerenter", function () { pick(i); });
    hit.addEventListener("pointerleave", function () { pick(-1); });
  });
}

function render(animate) {
  var mine = missed(col);
  rows.slice().sort(function (a, b) {
    return (sorted ? value(a, col) - value(b, col) : 0) || rows.indexOf(a) - rows.indexOf(b);
  }).forEach(function (r) { table.tBodies[0].appendChild(r); });
  Array.prototype.forEach.call(head, function (th, c) {
    th.classList.toggle("sel", c === col);
    if (c === col && sorted) th.setAttribute("aria-sort", "ascending"); else th.removeAttribute("aria-sort");
  });
  rows.concat([pooled]).forEach(function (r) {
    Array.prototype.forEach.call(r.cells, function (td, c) { td.classList.toggle("sel", c === col); });
  });
  title.textContent = (groupOf(col) + " · " + head[col].textContent).toUpperCase();
  var avg = pooledMissed();
  ref.setAttribute("y1", y(avg)); ref.setAttribute("y2", y(avg));
  pick(hl);
  svg.setAttribute("aria-label", "Gates missed of 400 per set, " + groupOf(col).toLowerCase() + ", " + head[col].textContent.toLowerCase() + ": " +
    mine.map(function (m, i) { return sets[i] + " " + m; }).join(", "));
  if (animate === null) draw(shown);   // re-laid out: keep the heights showing
  else if (animate && shown && !reducedMotion()) grow(shown, mine);
  else draw(mine);
}

function grow(from, to) {
  var t0 = performance.now(), id = ++anim;
  requestAnimationFrame(function step(now) {
    if (id !== anim) return;
    var t = Math.min(1, (now - t0) / DUR.base), e = 1 - Math.pow(1 - t, 3);
    draw(from.map(function (f, i) { return f + (to[i] - f) * e; }), to);
    if (t < 1) requestAnimationFrame(step);
  });
}

// v: bar heights now; labels: what the caps read (the final values while growing)
function draw(v, labels) {
  shown = v;
  v.forEach(function (m, i) {
    var cx = slot(i), top = y(m), r = Math.min(4, Y1 - top);
    bars[i].setAttribute("d", m <= 0 ? "" : "M" + (cx - 12) + " " + Y1 + "V" + (top + r) + "q0 " + -r + " " + r + " " + -r +
      "H" + (cx + 12 - r) + "q" + r + " 0 " + r + " " + r + "V" + Y1 + "Z");
    caps[i].setAttribute("y", top - 5);
    caps[i].textContent = Math.round((labels || v)[i]);
  });
}

// The second line of the chart's header: the picked set's figures, else what the bars and the
// line are.
function pick(i) {
  hl = i;
  rows.forEach(function (r, j) { r.classList.toggle("hl", j === i); });
  if (!bars) return;
  bars.forEach(function (b, j) { b.classList.toggle("hl", j === i); });
  info.textContent = i < 0 ? "GATES MISSED OF 400 · LINE = POOLED, " + pooledMissed().toFixed(1) :
    sets[i] + ": " + missed(col)[i] + " MISSED, " + value(rows[i], col).toFixed(2) + "% PASSED";
}

function missed(c) { return rows.map(function (r) { return Math.round(400 * (1 - value(r, c) / 100)); }); }
function pooledMissed() { return 400 * (1 - value(pooled, col) / 100); }
function value(r, c) { return parseFloat(r.cells[c].textContent); }
function groupOf(c) { return groups[c <= 2 ? 1 : 2].textContent.split(" · ")[0]; }
function slot(i) { return X0 + (X1 - X0) * (i + 0.5) / 6; }
function y(v) { return Y1 - (Y1 - Y0) * Math.min(v, MAX) / MAX; }
function el(tag, attrs, parent) {
  var n = document.createElementNS(NS, tag);
  for (var a in attrs) n.setAttribute(a, attrs[a]);
  parent.appendChild(n);
  return n;
}
