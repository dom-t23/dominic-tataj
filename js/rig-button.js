// The TRY THE CONTROLLER button. The test rig and its model (js/hover-rig.js, js/quad.js) load
// the first time it is pressed, so visitors who never open it don't download them.
import { $ } from "./util.js";

var btn = $("rig-open");
if (btn) {
  btn.hidden = false;
  btn.addEventListener("click", function () {
    btn.disabled = true;
    import("./hover-rig.js").then(function (rig) { btn.disabled = false; rig.open(); }, function () { btn.disabled = false; });
  });
}
