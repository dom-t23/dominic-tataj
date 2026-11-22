// The longer sections of a write-up (<details class="more">) are open in the page as written, so
// without JS, on a wide screen and in print everything is there. On a phone they start folded,
// leaving the summary, the key figures and the approach on show; a tap opens each one.
if (window.matchMedia && window.matchMedia("(max-width: 699px)").matches) {
  document.querySelectorAll("details.more[open]").forEach(function (d) { d.open = false; });
}
// printing shows them all
addEventListener("beforeprint", function () { document.querySelectorAll("details.more").forEach(function (d) { d.open = true; }); });
