// Shared helpers for the page's modules.
export var $ = function (id) { return document.getElementById(id); };
export var root = document.documentElement;
export var sysDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
export var css = function (n) { return getComputedStyle(root).getPropertyValue(n).trim(); };
export function reducedMotion() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
