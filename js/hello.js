// A note for whoever opens the developer console (DESIGN_PLAN.md 2.8): the E-03 frame drawn
// in characters, and where the source lives.
var FRAME = String.raw`
   .--.             .--.
  ( () )           ( () )
   '--'\\         //'--'
         \\_____//
         | [===] |      E-03  GENERATIVE FPV FRAME
         |_______|      38 g · PC/ABS · 246 g all-up
         //     \\
   .--.//         \\.--.
  ( () )           ( () )
   '--'             '--'
`;
console.log(
  "%c" + FRAME + "%c\nHello, engineer. This site has no build step, so Sources shows the code exactly as it is in the repo.\n" +
  "Site: https://github.com/dom-t23/dominic-tataj\nDrone stack: https://github.com/dom-t23/vision-drone-racing",
  "font: 12px/1.25 ui-monospace, Menlo, Consolas, monospace; color: #3DDCFF",
  "font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace"
);
