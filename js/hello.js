// A note for whoever opens the developer console (DESIGN_PLAN.md 2.8): the E-03 frame drawn
// in characters, where the source lives, and a hint at acro mode (js/acro.js).
var FRAME = String.raw`
   .--.             .--.
  ( () )           ( () )
   '--'\\         //'--'
         \\_____//
         | [===] |      E-03  GENERATIVE FPV FRAME
         |_______|      38 G · PC/ABS · 246 G ALL-UP
         //     \\
   .--.//         \\.--.
  ( () )           ( () )
   '--'             '--'
`;
console.log(
  "%c" + FRAME + "%c\nHello, engineer. This site has no build step, so Sources shows the code exactly as it is in the repo.\n" +
  "Site: https://github.com/dom-t23/dominic-tataj\nDrone stack: https://github.com/dom-t23/vision-drone-racing\n" +
  "Now type fpv anywhere on the page.",
  "font: 12px/1.25 ui-monospace, Menlo, Consolas, monospace; color: #FF4F00",
  "font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace"
);
