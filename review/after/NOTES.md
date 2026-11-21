# After (21 Nov 2026, branch `claude/design-review`)

## Screenshots

Same set and capture method as `review/baseline/` (see its NOTES.md): `<size>-<theme>-fold.png`,
`<size>-<theme>-full-N.png` (the whole page in parts under 8192 device pixels), `scroll/` (screen
by screen: phone 375×812, **22 screens**, was 25; laptop 1440×900, 15 screens) and the reduced-motion
phone run. In the full-page parts the pinned Fig. 02 (pinned only on screens 600 px or wider) shows
as about 1.5 screens of empty panel: on screen that height is the scroll that turns the model.

Regenerate: `REVIEW_OUT=after npx playwright test tests/review-capture.spec.js tests/review-metrics.spec.js --grep @screens`
(Playwright starts `node tests/serve.cjs 4173` if nothing is serving 127.0.0.1:4173).

## Metrics (`metrics.json`), before and after

Measured with `tests/review-metrics.spec.js`; the after run is against `tests/serve.cjs`, which
gzips like GitHub Pages (the baseline ran uncompressed, so "gzip est." is the comparable row).
Phone: 375×812, 150 ms RTT, 1.6 Mbps, CPU ×4. Throttled first paint over three serial runs:
948, 1000 and 908 ms (median 948; the verifier measured a median of 912). One run is shown.

| Metric | Phone throttled, before | Phone throttled, after | Desktop, before | Desktop, after |
|---|---|---|---|---|
| First contentful paint (ms) | 1280 | 948 | 256 | 236 |
| LCP (ms) | 1280 | 948 | 256 | 236 |
| LCP element | `img.hd-still` | `p.lede` | `img.hd-still` | `p.lede` |
| CLS, load / after full scroll | 0.0001 / 0.0100 | 0.0012 / 0.0012 | 0.0032 / 0.0038 | 0.0013 / 0.0013 |
| Requests before load | 20 | 19 | 20 | 19 |
| Bytes before load, gzip est. (KB) | 134 | 194 | 148 | 146 |
| html (count / KB gz) | 1 / 12 | 1 / 14 | 1 / 12 | 1 / 14 |
| css (count / KB gz) | 2 / 13 | 2 / 14 | 2 / 13 | 2 / 14 |
| js (count / KB gz) | 12 / 18 | 12 / 19 | 12 / 18 | 12 / 19 |
| images (count / KB gz) | 1 / 9 | 0 | 1 / 9 | 0 |
| fonts (count / KB gz) | 4 / 81 | 4 / 147 | 4 / 95 | 4 / 98 |
| Console errors | 0 | 0 | 0 | 0 |

The hero no longer loads an image (the drone drawing is gone; its 33 turn frames no longer load on
desktop either), so the largest paint is the lede text. Fonts grew: Archivo's variable file is
90 KB and Google serves it whole for any range (self-hosting a subset instance is in the backlog).
