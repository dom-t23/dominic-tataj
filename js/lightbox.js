// The photography page's viewer: a native <dialog> over the gallery. Each photo is a link to the
// full image, so without JS it still opens. With JS: click opens the viewer; the arrow keys,
// the buttons or a sideways swipe step through; Esc, the close button or a click on the
// backdrop closes it, and focus goes back to the photo it came from.
import { reducedMotion } from "./util.js";

var links = Array.prototype.slice.call(document.querySelectorAll("#gallery a"));
if (links.length && window.HTMLDialogElement) {
  var dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Photograph viewer");
  dlg.innerHTML =
    '<div class="lb-stage"><img alt=""></div>' +
    '<div class="lb-bar"><span class="lb-cap" aria-live="polite"></span><span class="lb-n"></span></div>' +
    '<button class="lb-btn lb-close" type="button" aria-label="Close">✕</button>' +
    '<button class="lb-btn lb-prev" type="button" aria-label="Previous photograph">←</button>' +
    '<button class="lb-btn lb-next" type="button" aria-label="Next photograph">→</button>';
  document.body.appendChild(dlg);
  var img = dlg.querySelector("img"), cap = dlg.querySelector(".lb-cap"), num = dlg.querySelector(".lb-n"), at = 0, from = null;

  function show(i) {
    at = (i + links.length) % links.length;
    var a = links[at], pic = a.querySelector("img"), webp = a.querySelector("source");
    // the largest WebP in the srcset, else the JPEG the link points to
    var best = webp ? webp.getAttribute("srcset").split(",").pop().trim().split(" ")[0] : a.getAttribute("href");
    img.src = best; img.alt = pic.alt;
    if (!reducedMotion()) { img.style.animation = "none"; void img.offsetWidth; img.style.animation = ""; }
    var c = a.parentNode.querySelector(".cap");   // the caption under the photo: its number, then the place
    cap.textContent = c ? c.querySelector("b").textContent + " · " + c.lastChild.textContent : "";
    num.textContent = (at + 1) + " / " + links.length;
    // load the neighbours, so stepping is instant
    [at - 1, at + 1].forEach(function (k) { var l = links[(k + links.length) % links.length].querySelector("source"); if (l) new Image().src = l.getAttribute("srcset").split(",").pop().trim().split(" ")[0]; });
  }
  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;   // a new tab still works
      e.preventDefault(); from = a; show(i); dlg.showModal(); dlg.querySelector(".lb-close").focus();
    });
  });
  dlg.querySelector(".lb-close").addEventListener("click", function () { dlg.close(); });
  dlg.querySelector(".lb-prev").addEventListener("click", function () { show(at - 1); });
  dlg.querySelector(".lb-next").addEventListener("click", function () { show(at + 1); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(at - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(at + 1); }
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("lb-stage")) dlg.close(); });
  dlg.addEventListener("close", function () { if (from) from.focus(); });
  // a sideways swipe steps through
  var x0 = null;
  dlg.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") x0 = e.clientX; });
  dlg.addEventListener("pointerup", function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
  });
}
