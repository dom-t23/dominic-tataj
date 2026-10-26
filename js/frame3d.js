// Fig. 01: the real drone (models/frame.glb, converted from the Fusion assembly) in three
// views, ASSEMBLY, EXPLODED and FRAME ONLY (DESIGN_PLAN.md 3.1, 3.2). Pinned, the page's
// scroll moves it through them; otherwise the view buttons do. It is drawn like the rest of
// the site: matte surfaces and ink lines, the lines found from a pass that renders every
// part's normals, depth and identity. A part's real material fades in when it is picked
// out, and every part's in the exploded view.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { root, sysDark, css, reducedMotion } from "./util.js";
import { loop } from "./motion.js";

var MM = 0.001, DEG = Math.PI / 180, TAU = 2 * Math.PI;
var FOV = 24;          // deg, vertical
var AUTO = 0.25;       // rad/s: the assembly turns on its own while it is in view...
var IDLE = 45000;      // ms: ...until this long passes with no scrolling or pointer input

// Parts-list rows (data-part in the page) and the Fusion part names that belong to each.
var GROUPS = [["frame", /^Body1/], ["motor", /^MOTOR/], ["prop", /^PROP/], ["battery", /^BATTERY/],
  ["fc", /^FC/], ["vtx", /^VTX/], ["camera", /^CAMERA/], ["standoff", /^STANDOFF/], ["bolt", /^BOLT/]];

// The exploded view, part by part: how far it moves in mm (out along its arm, or sideways
// with "side"; up; forward), and when it starts, as a fraction of the way into the explode.
var MOVES = [
  [/^BATTERY/, 0, 70, 0, 0],
  [/^BOLT_M2x14_VTX/, 0, 92, 0, 0.08],
  [/^VTX/, 0, 50, 0, 0.16],
  [/^STANDOFF_VTX/, 0, 34, 0, 0.24],
  [/^FC/, 0, 18, 0, 0.32],
  [/^STANDOFF_FC/, 0, 8, 0, 0.36],
  [/^BOLT_M2x14_STACK/, 0, -30, 0, 0.36],
  [/^CAMERA/, 0, 0, 30, 0.44],
  [/^BOLT_M2x10_CAMERA/, 16, 0, 30, 0.5, "side"],
  [/^PROP/, 20, 42, 0, 0.56],
  [/^MOTOR/, 20, 20, 0, 0.62],
  [/^BOLT_M2x14_MOTOR/, 20, -26, 0, 0.68]
];

// The camera in each view: turned from behind the drone (deg), and looking down (deg).
var POSES = [{ yaw: 140, pitch: 24 }, { yaw: 122, pitch: 9 }, { yaw: 0, pitch: 86 }];
// Scroll progress through the pinned figure (0 to 1) where each move between views starts
// and ends; the views hold in between. The view buttons scroll to STEP_AT.
var MOVE = [[0.16, 0.42], [0.58, 0.84]];
var STEP_AT = [0.03, 0.5, 0.97];

// Normals, part identity and ink weight, for the ink pass.
var G_VERT = [
  "varying vec3 vN;",
  "void main() {",
  "  vN = normalize(normalMatrix * normal);",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
  "}"].join("\n");
var G_FRAG = [
  "uniform float uId, uInk;",
  "varying vec3 vN;",
  "void main() { gl_FragColor = vec4(normalize(vN).xy * 0.5 + 0.5, uId, uInk); }"].join("\n");
// The ink pass, over the shaded render.
var INK_VERT = "varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
var INK_FRAG = [
  "uniform sampler2D tG, tD;",
  "uniform vec2 uPx;",
  "uniform vec3 uInk;",
  "uniform float uN, uF;",
  "varying vec2 vUv;",
  "vec3 nrm(vec4 g) { vec2 v = g.xy * 2.0 - 1.0; return vec3(v, sqrt(max(0.0, 1.0 - dot(v, v)))); }",
  "void main() {",
  "  vec2 ox = vec2(uPx.x, 0.0), oy = vec2(0.0, uPx.y);",
  "  vec4 c = texture2D(tG, vUv), r = texture2D(tG, vUv + ox), u = texture2D(tG, vUv + oy);",
  "  vec4 l = texture2D(tG, vUv - ox), b = texture2D(tG, vUv - oy);",
  "  float dc = texture2D(tD, vUv).x, dr = texture2D(tD, vUv + ox).x, du = texture2D(tD, vUv + oy).x;",
  "  float dl = texture2D(tD, vUv - ox).x, db = texture2D(tD, vUv - oy).x;",
  // Outlines. Window depth is linear across any flat face, so its Laplacian is zero there and
  // only real steps in depth show; it is scaled to the step relative to the distance away.
  "  float d0 = min(dc, min(min(dr, dl), min(du, db)));",
  "  float z = uN * uF / (uF - d0 * (uF - uN));",
  "  float e = smoothstep(0.004, 0.012, abs(dr + dl + du + db - 4.0 * dc) * (uF - uN) * z / (uN * uF));",
  // Creases and the joins between parts, one-sided so they come out thinner than outlines.
  "  float sr = step(0.01, c.a * r.a), su = step(0.01, c.a * u.a);",
  "  vec3 n = nrm(c);",
  "  float cr = max(sr * (1.0 - dot(n, nrm(r))), su * (1.0 - dot(n, nrm(u))));",
  "  float id = max(sr * abs(c.b - r.b), su * abs(c.b - u.b));",
  "  e = max(e, 0.85 * max(smoothstep(0.1, 0.25, cr), step(0.002, id)));",
  "  gl_FragColor = vec4(uInk, e * max(max(c.a, max(r.a, u.a)), max(l.a, b.a)));",
  "  #include <colorspace_fragment>",
  "}"].join("\n");

var track, fig, view, note, buttons, cap, rows = {};
var renderer, scene, camera, model, rt, inkMat, inkScene, inkCam, anim, raycaster = new THREE.Raycaster();
var parts = [], groups = {}, poses = [], target = new THREE.Vector3(), drawCol = new THREE.Color();
var svg, bal = {}, dims, tag, tagText;
var w = 1, h = 1, stickyTop = 0, rm = false, dirty = true;
var p = 0, u = 0, uT = 0, step = -1;
var turn = { x: 0, v: 0 }, tilt = { x: 0, v: 0 };
var drag = null, pointer = null, picking = false, lastInput = 0;
var overPart = null, overRow = null, picked = null, focus = null;

export function mount(el) {
  track = el; fig = track.querySelector(".f3"); view = fig.querySelector(".f3-view"); note = view.querySelector(".f3-load");
  buttons = Array.prototype.slice.call(fig.querySelectorAll(".f3-steps button"));
  cap = fig.querySelector(".f3-cap");
  fig.querySelectorAll(".f3-parts tbody tr").forEach(function (r) { rows[r.dataset.part] = r; });
  rm = reducedMotion();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  var canvas = renderer.domElement;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "3D model of the drone from the Fusion assembly. The view buttons and the parts list work it from the keyboard.");
  view.insertBefore(canvas, note);

  return new Promise(function (resolve, reject) {
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load("models/frame.glb", function (gltf) {
      try { build(gltf.scene); wire(canvas); resolve(); } catch (e) { reject(e); }
    }, function (x) {
      if (x.lengthComputable) note.textContent = "LOADING MODEL " + Math.round(100 * x.loaded / x.total) + "%";
    }, reject);
  }).catch(function (e) { renderer.dispose(); canvas.remove(); throw e; });
}

// ---------- the model ----------

function build(gltfScene) {
  scene = new THREE.Scene();
  var pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  var key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-0.4, 1, 0.5);
  scene.add(key);
  camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 2);

  // every part straight under one group, in metres with Y up, the frame's centre at the origin
  model = new THREE.Group();
  scene.add(model);
  gltfScene.updateMatrixWorld(true);
  var meshes = [];
  gltfScene.traverse(function (o) { if (o.isMesh) meshes.push(o); });
  meshes.forEach(function (m) { model.attach(m); });
  var c0 = centre(meshes.find(function (m) { return GROUPS[0][1].test(m.name); }));
  meshes.forEach(function (m) { m.position.sub(c0); });
  model.updateMatrixWorld(true);

  GROUPS.forEach(function (g, i) { groups[g[0]] = { id: g[0], n: i + 1, parts: [], mix: 0, row: rows[g[0]] }; });
  meshes.forEach(function (mesh, i) {
    var g = groups[GROUPS.find(function (x) { return x[1].test(mesh.name); })[0]];
    var c = centre(mesh), off = new THREE.Vector3();
    var mv = MOVES.find(function (x) { return x[0].test(mesh.name); });
    if (mv) {
      var out = mv[5] === "side" ? new THREE.Vector3(Math.sign(c.x), 0, 0) : new THREE.Vector3(Math.sign(c.x), 0, Math.sign(c.z)).normalize();
      off.addScaledVector(out, mv[1] * MM);
      off.y += mv[2] * MM;
      off.z -= mv[3] * MM;   // the camera faces -z
    }
    var real = mesh.material, mat = real.clone();
    mat.transparent = g.id !== "frame";   // everything but the frame fades out for FRAME ONLY
    mesh.material = mat;
    var q = {
      mesh: mesh, group: g, base: mesh.position.clone(), centre: c, off: off, t: mv ? mv[4] : 0, vis: 1,
      mat: mat, color: real.color.clone(), metal: real.metalness, rough: real.roughness,
      gmat: new THREE.ShaderMaterial({ vertexShader: G_VERT, fragmentShader: G_FRAG, uniforms: { uId: { value: (i + 1) / 255 }, uInk: { value: 1 } } })
    };
    parts.push(q);
    g.parts.push(q);
  });

  // where the camera sits in each view, fitted to what that view shows
  place(1, 0);
  var exploded = boxOf(parts);
  place(0, 0);
  var assembled = boxOf(parts), frameBox = boxOf(groups.frame.parts);
  poses = [pose(POSES[0], assembled, 0.92), pose(POSES[1], exploded, 0.8), pose(POSES[2], frameBox, 1)];
  anchors();
  dimensions();

  rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthTexture: new THREE.DepthTexture(1, 1) });
  inkMat = new THREE.ShaderMaterial({
    vertexShader: INK_VERT, fragmentShader: INK_FRAG, transparent: true, depthTest: false, depthWrite: false,
    uniforms: { tG: { value: rt.texture }, tD: { value: rt.depthTexture }, uPx: { value: new THREE.Vector2() }, uInk: { value: new THREE.Color() }, uN: { value: 0.1 }, uF: { value: 1 } }
  });
  var quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), inkMat);
  quad.frustumCulled = false;
  inkScene = new THREE.Scene();
  inkScene.add(quad);
  inkCam = new THREE.Camera();
}

function centre(o) { return new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); }
function boxOf(list) {
  var b = new THREE.Box3();
  model.updateMatrixWorld(true);
  list.forEach(function (q) { b.expandByObject(q.mesh); });
  return b;
}
function pose(P, box, k) {
  var s = box.getBoundingSphere(new THREE.Sphere());
  return { yaw: P.yaw * DEG, pitch: P.pitch * DEG, target: s.center, r: s.radius * k };
}

// Exploded by e and down to the frame by f (both 0 to 1): parts move out in turn, then on
// further and fade for FRAME ONLY.
function place(e, f) {
  var k2 = 1 + 1.6 * ease(f), fade = 1 - smooth(0.05, 0.55, f);
  parts.forEach(function (q) {
    q.mesh.position.copy(q.base).addScaledVector(q.off, ease((e - q.t * 0.6) / 0.4) * k2);
    q.vis = q.group.id === "frame" ? 1 : fade;
  });
}

// ---------- each frame ----------

function frame(dt, now) {
  var moving = false, i;
  u += (uT - u) * (rm ? 1 : 1 - Math.exp(-dt * 7));
  if (Math.abs(uT - u) < 1e-4) u = uT; else moving = true;
  var e = clamp(u, 0, 1), f = clamp(u - 1, 0, 1);

  // turning: the assembly turns slowly or coasts after a fling; the other views spring
  // back square, and a tilt from dragging springs back everywhere
  if (drag) moving = true;
  else {
    if (u < 0.5) {
      var auto = rm || now - lastInput > IDLE ? 0 : AUTO;
      turn.v += (auto - turn.v) * (1 - Math.exp(-dt * 1.2));
      turn.x += turn.v * dt;
      if (Math.abs(turn.v) > 1e-3) moving = true;
    } else moving = spring(turn, Math.round(turn.x / TAU) * TAU, dt) || moving;
    moving = spring(tilt, 0, dt) || moving;
  }

  place(e, f);
  aim();
  // what the mouse is over: when it moves, and when the model moves under it
  if (pointer && pointer.mouse && !drag && (picking || moving)) { overPart = pickAt(pointer.x, pointer.y); view.classList.toggle("over", !!overPart); }
  picking = false;
  focus = overPart || overRow || picked;
  if (f > 0.5 && focus !== "frame") focus = null;   // only the frame is left to pick out

  // colour: real materials in the exploded view, and for whatever is picked out
  var base = smooth(0.3, 0.9, e) * (1 - smooth(0, 0.5, f)), km = rm ? 1 : 1 - Math.exp(-dt * 10);
  for (var id in groups) {
    var g = groups[id], to = focus ? (id === focus ? 1 : 0) : base;
    g.mix += (to - g.mix) * km;
    if (Math.abs(to - g.mix) > 1e-3) moving = true; else g.mix = to;
  }
  for (i = 0; i < parts.length; i++) {
    var q = parts[i], m = q.group.mix;
    q.mat.color.lerpColors(drawCol, q.color, m);
    q.mat.metalness = q.metal * m;
    q.mat.roughness = 1 + (q.rough - 1) * m;
    q.mat.opacity = q.vis;
    q.gmat.uniforms.uInk.value = q.vis * q.vis;
  }

  draw();
  overlay(e, f);
  sync();
  if (!view.classList.contains("ready")) view.classList.add("ready");
  var go = moving || dirty;
  dirty = false;
  view.classList.toggle("still", !go);   // for the tests: nothing left to animate
  return go ? undefined : false;
}

function aim() {
  var i = Math.min(1, Math.floor(u)), t = smooth(0, 1, u - i), A = poses[i], B = poses[i + 1];
  var yaw = A.yaw + (B.yaw - A.yaw) * t, pitch = clamp(A.pitch + (B.pitch - A.pitch) * t + tilt.x, -0.3, 1.52);
  var half = Math.min(FOV / 2 * DEG, Math.atan(Math.tan(FOV / 2 * DEG) * camera.aspect));
  // on a narrow screen the turning props set the fit
  var dist = (A.r + (B.r - A.r) * t) * (camera.aspect < 1 && u < 1 ? 1.1 - 0.1 * u : 1) / Math.sin(half);
  target.lerpVectors(A.target, B.target, t);
  camera.position.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(dist).add(target);
  camera.near = Math.max(0.005, dist - 0.3);
  camera.far = dist + 0.3;
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  model.rotation.y = turn.x;
  model.updateMatrixWorld(true);
}

function draw() {
  var i, q;
  for (i = 0; i < parts.length; i++) { q = parts[i]; q.mesh.material = q.gmat; q.mesh.visible = q.vis > 0.02; }
  renderer.setRenderTarget(rt);
  renderer.render(scene, camera);
  for (i = 0; i < parts.length; i++) { q = parts[i]; q.mesh.material = q.mat; q.mesh.visible = q.vis > 0.004; }
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
  inkMat.uniforms.uN.value = camera.near;
  inkMat.uniforms.uF.value = camera.far;
  renderer.autoClear = false;
  renderer.render(inkScene, inkCam);
  renderer.autoClear = true;
}

function pickAt(x, y) {
  raycaster.setFromCamera(new THREE.Vector2(x / w * 2 - 1, 1 - y / h * 2), camera);
  var hit = raycaster.intersectObjects(parts.filter(function (q) { return q.vis > 0.5; }).map(function (q) { return q.mesh; }), false)[0];
  return hit ? parts.find(function (q) { return q.mesh === hit.object; }).group.id : null;
}

// ---------- overlay: balloons, dimensions, the name of the part picked out ----------

var NS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent) {
  var n = document.createElementNS(NS, tag);
  for (var a in attrs) n.setAttribute(a, attrs[a]);
  if (parent) parent.appendChild(n);
  return n;
}

// Each group's balloon points at one of its parts: the one nearest the camera in the
// exploded view (for the frame, a point on its nearest arm).
function anchors() {
  var cam = new THREE.Vector3(Math.sin(poses[1].yaw), Math.sin(poses[1].pitch), Math.cos(poses[1].yaw)).multiplyScalar(0.5);
  place(1, 0);
  for (var id in groups) {
    var g = groups[id], best = Infinity;
    g.parts.forEach(function (q) {
      var d = q.centre.clone().add(q.off).distanceTo(cam);
      if (d < best) { best = d; g.anchor = q; }
    });
  }
  place(0, 0);
  var arm = new THREE.Vector3(Math.sign(cam.x), 0, Math.sign(cam.z)).multiplyScalar(26 * MM);
  raycaster.set(arm.clone().setY(0.2), new THREE.Vector3(0, -1, 0));
  var hit = raycaster.intersectObject(groups.frame.parts[0].mesh, false)[0];
  groups.frame.point = hit ? hit.point.clone() : arm;
}
function anchorAt(g) {
  if (g.point) return model.localToWorld(g.point.clone());
  var q = g.anchor;
  return model.localToWorld(q.centre.clone().add(q.mesh.position).sub(q.base));
}

// The frame's dimensions: motor mounting centres from the model, measured as built.
function dimensions() {
  var ms = groups.motor.parts, y = Math.min.apply(null, ms.map(function (q) { return new THREE.Box3().setFromObject(q.mesh).min.y; }));
  function at(sx, sz) { var q = ms.find(function (m) { return Math.sign(m.centre.x) === sx && Math.sign(m.centre.z) === sz; }); return new THREE.Vector3(q.centre.x, y, q.centre.z); }
  dims = { fl: at(-1, -1), fr: at(1, -1), rl: at(-1, 1), rr: at(1, 1) };
  dims.side = dims.rl.distanceTo(dims.rr) / MM;
  dims.diag = dims.fl.distanceTo(dims.rr) / MM;
}

function makeOverlay() {
  svg = el("svg", { class: "f3-ov", "aria-hidden": "true" });
  view.appendChild(svg);
  for (var id in groups) {
    var b = el("g", { class: "bal", opacity: 0 }, svg);
    bal[id] = { g: b, ldr: el("line", { class: "ldr" }, b), dot: el("circle", { class: "dot", r: 2 }, b), c: el("circle", { r: 10 }, b), t: el("text", { "text-anchor": "middle", dy: "0.36em" }, b) };
    bal[id].t.textContent = groups[id].n;
  }
  var d = dims.g = el("g", { opacity: 0 }, svg);
  dims.marks = [0, 1, 2, 3].map(function () { return el("path", { class: "ext" }, d); });
  dims.ext = [0, 1].map(function () { return el("line", { class: "ext" }, d); });
  dims.lines = [0, 1].map(function () { return el("line", { class: "dim" }, d); });
  dims.arrows = [0, 1, 2, 3].map(function () { return el("path", { class: "arrow" }, d); });
  dims.pads = [0, 1].map(function () { return el("rect", { class: "pad" }, d); });
  dims.texts = [dims.side, dims.diag].map(function (v) { var t = el("text", { class: "dim-t", "text-anchor": "middle", dy: "0.36em" }, d); t.textContent = v.toFixed(1); return t; });
  tag = el("g", { class: "tag", opacity: 0 }, svg);
  el("rect", { height: 20 }, tag);
  tagText = el("text", { x: 7, y: 10, dy: "0.36em" }, tag);
}

var V = new THREE.Vector3();
function px(v) { V.copy(v).project(camera); return [(V.x + 1) / 2 * w, (1 - V.y) / 2 * h]; }

function overlay(e, f) {
  // balloons: out from the middle of the drawing, nudged apart
  var ab = smooth(0.6, 1, e) * (1 - smooth(0, 0.3, f)), ids = Object.keys(groups), i, j;
  if (ab > 0.01) {
    var mid = px(model.localToWorld(new THREE.Vector3())), pts = ids.map(function (id) {
      var a = px(anchorAt(groups[id])), dx = a[0] - mid[0], dy = a[1] - mid[1], l = Math.hypot(dx, dy) || 1;
      return { id: id, a: a, b: [a[0] + dx / l * 34, a[1] + dy / l * 34] };
    });
    for (var it = 0; it < 12; it++) {
      for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) {
        var P = pts[i].b, Q = pts[j].b, ddx = Q[0] - P[0], ddy = Q[1] - P[1], dd = Math.hypot(ddx, ddy) || 1;
        if (dd < 26) { var s = (26 - dd) / 2 / dd; P[0] -= ddx * s; P[1] -= ddy * s; Q[0] += ddx * s; Q[1] += ddy * s; }
      }
      pts.forEach(function (o) { o.b[0] = clamp(o.b[0], 14, w - 14); o.b[1] = clamp(o.b[1], 14, h - 14); });
    }
    pts.forEach(function (o) {
      var B = bal[o.id], dx = o.b[0] - o.a[0], dy = o.b[1] - o.a[1], l = Math.hypot(dx, dy) || 1;
      line(B.ldr, o.a, [o.b[0] - dx / l * 10, o.b[1] - dy / l * 10]);
      B.dot.setAttribute("cx", o.a[0].toFixed(1)); B.dot.setAttribute("cy", o.a[1].toFixed(1));
      B.c.setAttribute("cx", o.b[0].toFixed(1)); B.c.setAttribute("cy", o.b[1].toFixed(1));
      B.t.setAttribute("x", o.b[0].toFixed(1)); B.t.setAttribute("y", o.b[1].toFixed(1));
      B.at = o.b;
    });
  }
  ids.forEach(function (id) { bal[id].g.setAttribute("opacity", ab.toFixed(3)); bal[id].g.classList.toggle("on", id === focus); });

  // dimensions, drawn out from their middles
  var ad = smooth(0.6, 1, f);
  dims.g.setAttribute("opacity", ad.toFixed(3));
  if (ad > 0.01) {
    var off = new THREE.Vector3(0, 0, 26 * MM), ext = new THREE.Vector3(0, 0, 8 * MM), ext2 = new THREE.Vector3(0, 0, 30 * MM);
    var W = function (v) { return px(model.localToWorld(v.clone())); };
    [dims.fl, dims.fr, dims.rl, dims.rr].forEach(function (c, k) {
      var o = W(c);
      dims.marks[k].setAttribute("d", "M" + (o[0] - 6).toFixed(1) + " " + o[1].toFixed(1) + "h12M" + o[0].toFixed(1) + " " + (o[1] - 6).toFixed(1) + "v12");
    });
    line(dims.ext[0], W(dims.rl.clone().add(ext)), W(dims.rl.clone().add(ext2)));
    line(dims.ext[1], W(dims.rr.clone().add(ext)), W(dims.rr.clone().add(ext2)));
    dim(0, W(dims.rl.clone().add(off)), W(dims.rr.clone().add(off)), ad);
    dim(1, W(dims.fl), W(dims.rr), ad);
  }

  // the name of whatever is picked out, by the pointer or its balloon
  tag.setAttribute("opacity", focus ? 1 : 0);
  if (focus) {
    var row = groups[focus].row, qty = +row.cells[2].textContent;
    var label = row.querySelector("button").textContent.toUpperCase() + (qty > 1 ? " ×" + qty : "");
    if (tagText.textContent !== label) { tagText.textContent = label; tag.firstChild.setAttribute("width", (tagText.getComputedTextLength() + 14).toFixed(1)); }
    var at = focus === overPart && pointer ? [pointer.x + 14, pointer.y - 30] : ab > 0.5 ? [bal[focus].at[0] + 16, bal[focus].at[1] - 10] : px(anchorAt(groups[focus]));
    var tw = +tag.firstChild.getAttribute("width");
    tag.setAttribute("transform", "translate(" + clamp(at[0], 4, w - tw - 4).toFixed(1) + " " + clamp(at[1], 4, h - 24).toFixed(1) + ")");
  }
}

function line(n, a, b) {
  n.setAttribute("x1", a[0].toFixed(1)); n.setAttribute("y1", a[1].toFixed(1));
  n.setAttribute("x2", b[0].toFixed(1)); n.setAttribute("y2", b[1].toFixed(1));
}
// A dimension line from a to b with arrowheads and its value on a pad in the middle,
// grown from the middle by k.
function dim(i, a, b, k) {
  var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
  var A = [m[0] - ux * l / 2 * k, m[1] - uy * l / 2 * k], B = [m[0] + ux * l / 2 * k, m[1] + uy * l / 2 * k];
  line(dims.lines[i], A, B);
  dims.arrows[2 * i].setAttribute("d", arrow(A, -ux, -uy));
  dims.arrows[2 * i + 1].setAttribute("d", arrow(B, ux, uy));
  var t = dims.texts[i], tw = (t.w = t.w || t.getComputedTextLength()) + 10;
  t.setAttribute("x", m[0].toFixed(1)); t.setAttribute("y", m[1].toFixed(1));
  var pad = dims.pads[i];
  pad.setAttribute("x", (m[0] - tw / 2).toFixed(1)); pad.setAttribute("y", (m[1] - 9).toFixed(1));
  pad.setAttribute("width", tw.toFixed(1)); pad.setAttribute("height", 18);
}
function arrow(p, ux, uy) {
  var bx = p[0] - ux * 8, by = p[1] - uy * 8;
  return "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + "L" + (bx - uy * 2.6).toFixed(1) + " " + (by + ux * 2.6).toFixed(1) +
    "L" + (bx + uy * 2.6).toFixed(1) + " " + (by - ux * 2.6).toFixed(1) + "Z";
}

// ---------- the page around it ----------

function wire(canvas) {
  makeOverlay();
  theme();
  anim = loop(view, frame);
  new ResizeObserver(resize).observe(view);
  addEventListener("scroll", onScroll, { passive: true });
  if (sysDark && sysDark.addEventListener) sysDark.addEventListener("change", theme);
  new MutationObserver(theme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  buttons.forEach(function (b, i) {
    b.addEventListener("click", function () {
      lastInput = performance.now();
      if (track.classList.contains("pinned")) {
        var r = track.getBoundingClientRect(), span = r.height - fig.offsetHeight;
        window.scrollTo({ top: scrollY + r.top - stickyTop + STEP_AT[i] * span, behavior: "smooth" });
      } else { uT = i; wake(); }
    });
  });

  Object.keys(rows).forEach(function (id) {
    var row = rows[id], b = row.querySelector("button");
    row.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") { overRow = id; wake(); } });
    row.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") { overRow = null; wake(); } });
    b.addEventListener("focus", function () { overRow = id; wake(); });
    b.addEventListener("blur", function () { overRow = null; wake(); });
    b.addEventListener("click", function () { picked = picked === id ? null : id; wake(); });
  });

  canvas.addEventListener("pointerdown", function (ev) {
    if (ev.button !== 0) return;
    var r = canvas.getBoundingClientRect();
    pointer = { x: ev.clientX - r.left, y: ev.clientY - r.top, mouse: ev.pointerType === "mouse" };
    drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, t: performance.now(), moved: false, mouse: ev.pointerType === "mouse" };
    if (drag.mouse) canvas.setPointerCapture(ev.pointerId);
    lastInput = performance.now();
  });
  canvas.addEventListener("pointermove", function (ev) {
    var r = canvas.getBoundingClientRect(), now = performance.now();
    pointer = { x: ev.clientX - r.left, y: ev.clientY - r.top, mouse: ev.pointerType === "mouse" };
    if (drag && drag.id === ev.pointerId) {
      var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 5) {
        drag.moved = true;
        view.classList.add("dragging");
        if (!drag.mouse) canvas.setPointerCapture(ev.pointerId);
      }
      if (drag.moved) {
        turn.x += dx * 0.01;
        turn.v = 0.6 * turn.v + 0.4 * dx * 0.01 / (Math.max(8, now - drag.t) / 1000);
        if (drag.mouse) tilt.x = clamp(tilt.x + dy * 0.005, -0.6, 0.9);
        drag.x = ev.clientX; drag.y = ev.clientY; drag.t = now;
      }
    } else if (ev.pointerType === "mouse") picking = true;
    lastInput = now;
    wake();
  });
  function end(ev) {
    if (!drag || drag.id !== ev.pointerId) return;
    if (!drag.moved && ev.type === "pointerup") { var id = pickAt(pointer.x, pointer.y); picked = id === picked ? null : id; }
    if (performance.now() - drag.t > 80) turn.v = 0;   // held still before letting go: no fling
    drag = null;
    view.classList.remove("dragging");
    wake();
  }
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", function (ev) {
    if (ev.pointerType !== "mouse" || drag) return;
    overPart = null; pointer = null; view.classList.remove("over"); wake();
  });

  resize();
}

function wake() { dirty = true; view.classList.remove("still"); anim.start(); }

function resize() {
  w = view.clientWidth; h = view.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  var pr = renderer.getPixelRatio(), s = Math.max(1, Math.floor(pr * 0.75));
  rt.setSize(Math.round(w * pr), Math.round(h * pr));
  inkMat.uniforms.uPx.value.set(s / (w * pr), s / (h * pr));
  camera.aspect = w / h;
  stickyTop = parseFloat(getComputedStyle(fig).top) || 0;
  onScroll();
  wake();
}

function onScroll() {
  if (!track.classList.contains("pinned")) return;
  var r = track.getBoundingClientRect(), span = r.height - fig.offsetHeight;
  p = span > 0 ? clamp((stickyTop - r.top) / span, 0, 1) : 0;
  uT = p <= MOVE[0][0] ? 0 : p < MOVE[0][1] ? (p - MOVE[0][0]) / (MOVE[0][1] - MOVE[0][0]) :
    p <= MOVE[1][0] ? 1 : p < MOVE[1][1] ? 1 + (p - MOVE[1][0]) / (MOVE[1][1] - MOVE[1][0]) : 2;
  lastInput = performance.now();
  wake();
}

// View buttons, caption and parts list follow the view being moved to.
function sync() {
  var pinned = track.classList.contains("pinned"), s = uT < 0.5 ? 0 : uT < 1.5 ? 1 : 2;
  var ends = [0, (MOVE[0][0] + MOVE[0][1]) / 2, (MOVE[1][0] + MOVE[1][1]) / 2, 1];
  buttons.forEach(function (b, i) {
    var fill = pinned ? clamp((p - ends[i]) / (ends[i + 1] - ends[i]), 0, 1) : i === s ? 1 : 0;
    b.style.setProperty("--f", fill.toFixed(3));
  });
  for (var id in groups) {
    var row = groups[id].row;
    row.classList.toggle("on", id === focus);
    row.classList.toggle("off", s === 2 && id !== "frame");
    row.querySelector("button").setAttribute("aria-pressed", String(id === picked));
  }
  fig.dataset.focus = focus || "";
  if (s === step) return;
  step = s;
  fig.dataset.step = String(s);
  buttons.forEach(function (b, i) { if (i === s) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
  cap.textContent = buttons[s].dataset.cap;
}

function theme() {
  var paper = new THREE.Color(css("--paper")), ink = new THREE.Color(css("--ink"));
  var dark = paper.r + paper.g + paper.b < 1.5;
  drawCol.copy(paper).lerp(ink, dark ? 0.2 : 0);
  inkMat.uniforms.uInk.value.copy(ink);
  if (anim) wake();
}

// ---------- helpers ----------

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function ease(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(2 - 2 * t, 3) / 2; }
// A critically damped spring towards goal; false once it has settled there.
function spring(s, goal, dt) {
  if (rm) { s.x = goal; s.v = 0; return false; }
  var k = 9;
  s.v += (-k * k * (s.x - goal) - 2 * k * s.v) * dt;
  s.x += s.v * dt;
  if (Math.abs(s.x - goal) < 1e-4 && Math.abs(s.v) < 1e-3) { s.x = goal; s.v = 0; return false; }
  return true;
}
