// Entry point for the homepage: the hero, the menu and the contact band. The projects' figures
// live on their own pages (js/project.js).
import "./theme.js";
import "./menu.js";
import "./hero.js";
import "./contact.js";
// small extras wait for the load event, so they don't compete with the first paint
addEventListener("load", function () {
  ["./hello.js", "./cursor.js"].forEach(function (m) { import(m); });
});
