// A static server for the tests, gzipping text the way GitHub Pages does, so the performance
// test measures something close to the live site. Dev only; no dependencies.
//   node tests/serve.cjs [port=4173] [root=.]
const http = require("http"), fs = require("fs"), path = require("path"), zlib = require("zlib");

const port = parseInt(process.argv[2] || "4173", 10);
const root = path.resolve(process.argv[3] || ".");
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".glb": "model/gltf-binary",
  ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".ico": "image/x-icon",
};
const GZIP = /^(text\/|application\/(json|xml)|image\/svg)/;

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, body) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); return; }
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    const headers = { "Content-Type": type, "Cache-Control": "no-cache" };
    if (GZIP.test(type) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      body = zlib.gzipSync(body); headers["Content-Encoding"] = "gzip"; headers["Vary"] = "Accept-Encoding";
    }
    headers["Content-Length"] = body.length;
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : body);
  });
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}/`));
