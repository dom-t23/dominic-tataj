// Fig. 01, the drone in 3D (DESIGN_PLAN.md 3.1, 3.2). This part decides between the model and
// the two renders, and lays the figure out. three.js and the model (js/frame3d.js) load only
// once the figure is near and the visitor has started scrolling, so first load stays light;
// if they fail to load, the renders come back.
import { $, root, reducedMotion } from "./util.js";

var track = $("f3-track");
if (track && window.WebGL2RenderingContext && window.IntersectionObserver) {
  var nav = document.querySelector(".nav"), stage = track.querySelector(".f3-stage");
  var cap = track.querySelector(".f3-cap"), renderCap = cap.textContent;
  var started = false, scrolled = false, near = false;

  track.classList.add("is-3d");
  stage.hidden = false;
  cap.textContent = stage.querySelector(".f3-steps button").dataset.cap;
  layout();
  addEventListener("resize", layout);

  addEventListener("scroll", function first() { scrolled = true; removeEventListener("scroll", first); start(); }, { passive: true });
  addEventListener("load", function () { setTimeout(function () { scrolled = true; start(); }, 2500); });
  new IntersectionObserver(function (es) { near = es[es.length - 1].isIntersecting; start(); }, { rootMargin: "100% 0px" }).observe(track);
}

// Pinned, scroll-driven views need a screen tall enough to hold the figure, and no request
// for reduced motion; otherwise the figure stays in the flow and its view buttons switch views.
function layout() {
  root.style.setProperty("--nav-h", nav.offsetHeight + "px");
  track.classList.toggle("pinned", !reducedMotion() && innerHeight >= 560);
}

function start() {
  if (started || !scrolled || !near) return;
  started = true;
  import("./frame3d.js").then(function (m) { return m.mount(track); }).catch(function (e) {
    console.warn("Fig. 01: showing the renders instead of the 3D model.", e);
    track.classList.remove("is-3d", "pinned");
    stage.hidden = true;
    cap.textContent = renderCap;
    removeEventListener("resize", layout);
  });
}
