// Recorded drone-racing flights, shared by the hero's flight strip and the replay player.
// flights/index.js holds the flight list and a poster (course 1's path and one camera frame);
// it is fetched once, for whoever asks first, and fetched again only after a failure.

export function loadScript(src, ok, fail) {
  var s = document.createElement("script");
  s.src = src; s.onload = ok; s.onerror = fail;
  document.body.appendChild(s);
}

var index = null, waiting = null;

// ok({ list, poster }) once the index is in; fail() if it could not be loaded.
export function flightIndex(ok, fail) {
  if (index) { ok(index); return; }
  if (waiting) { waiting.push([ok, fail]); return; }
  waiting = [[ok, fail]];
  loadScript("flights/index.js", function () {
    index = { list: window.FLIGHT_INDEX || [], poster: window.FLIGHT_POSTER || null };
    var w = waiting; waiting = null;
    w.forEach(function (cb) { cb[0](index); });
  }, function () {
    var w = waiting; waiting = null;
    w.forEach(function (cb) { cb[1](); });
  });
}
