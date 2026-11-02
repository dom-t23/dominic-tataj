// The pipe climber's Fusion STL as glTF, step 2 of 3 (see README): weld, simplify within
// 1 mm, meshopt-compress. Writes models/pipe-climber.glb.
// Usage: node tools/robot/web_glb.mjs robot-raw.glb models/pipe-climber.glb
//   (needs @gltf-transform/core, /extensions and /functions 4.x, and meshoptimizer)
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { simplify, weld, meshopt, prune, dedup } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

const [src, dst] = process.argv.slice(2);
await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(src);
const tris = () => doc.getRoot().listMeshes().reduce((a, m) => a + m.listPrimitives().reduce((b, p) => b + p.getIndices().getCount() / 3, 0), 0);
const before = tris();
await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0, error: 0.001 }), prune());
console.log("triangles", before, "->", tris());
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: "high" }));
await io.write(dst, doc);
