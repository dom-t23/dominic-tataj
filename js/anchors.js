// Section links on a project page. Each section heading with an id gets a small "#" after it:
// a plain link to the section, which, with JS, copies the section's address instead and says so.
// A link to a section that a phone has folded away (details.more) opens it first.
var live = document.createElement("span");
live.className = "sr-only"; live.setAttribute("role", "status");
document.body.appendChild(live);

document.querySelectorAll(".sheet h2[id]").forEach(function (h) {
  var a = document.createElement("a");
  a.className = "anchor"; a.href = "#" + h.id; a.textContent = "#";
  a.setAttribute("aria-label", "Copy a link to this section: " + h.textContent);
  h.appendChild(a);
  a.addEventListener("click", function (e) {
    e.preventDefault();   // also keeps a heading inside a <summary> from folding its section
    var url = location.href.split("#")[0] + "#" + h.id;
    history.replaceState(null, "", "#" + h.id);
    function said(msg) {
      live.textContent = msg;
      a.textContent = msg === "Link copied" ? "Copied" : "#";
      a.classList.add("done");
      setTimeout(function () { a.textContent = "#"; a.classList.remove("done"); }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { said("Link copied"); }, function () { said("Address in the address bar"); });
    else said("Address in the address bar");
  });
});

// open a folded section when the address points into it (on load, and from the On this page list)
function reveal() {
  var t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  var d = t && t.closest("details");
  if (d && !d.open) { d.open = true; t.scrollIntoView(); }
}
addEventListener("hashchange", reveal);
reveal();
