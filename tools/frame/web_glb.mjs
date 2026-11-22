// The v2 drone as glTF, step 2 of 2 (see README): weld, simplify every part to about the same
// error in millimetres (not relative to its own size, so a bolt-sized part keeps no more detail
// than the frame), meshopt-compress. Writes models/frame-v2.glb.
// Usage: node tools/frame/web_glb.mjs frame-v2-raw.glb models/frame-v2.glb [tolerance in mm, default 0.25]
//   (needs @gltf-transform/core, /extensions and /functions 4.x, and meshoptimizer)
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { simplifyPrimitive, weld, meshopt, prune, dedup } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

const [src, dst, tol = "0.25"] = process.argv.slice(2);
await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(src);
const tris = (m) => m.listPrimitives().reduce((b, p) => b + p.getIndices().getCount() / 3, 0);
await doc.transform(dedup(), weld());
let before = 0, after = 0;
for (const m of doc.getRoot().listMeshes()) {
  before += tris(m);
  for (const p of m.listPrimitives()) {
    const a = p.getAttribute("POSITION"), lo = a.getMin([]), hi = a.getMax([]);
    const size = 10 * Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);   // cm -> mm
    simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio: 0, error: Math.min(0.05, +tol / size) });
  }
  after += tris(m);
}
await doc.transform(prune());
console.log("triangles", before, "->", after);
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: "high" }));
await io.write(dst, doc);
