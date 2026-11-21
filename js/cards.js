// Project cards: a soft light follows the pointer across the card it is over (site.css .card::before).
// Mouse and pen only; nothing changes for touch or the keyboard.
if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", Math.round(e.clientX - r.left) + "px");
      c.style.setProperty("--my", Math.round(e.clientY - r.top) + "px");
    });
  });
}
