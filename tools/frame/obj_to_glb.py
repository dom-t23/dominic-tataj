"""The v2 drone's Fusion OBJ as glTF, step 1 of 2 (see README).

Fusion exports the assembly in cm with Z up, one OBJ group per body, named Body1, Body1:1 and
so on. tools/frame/v2-parts.json gives each body its part name (FRAME, MOTOR_1, BATTERY...);
bodies that share a name become one node, and "DROP" leaves a body out (the battery's inner
block, hidden by its wrap, which only made the two surfaces flicker). The nodes sit under one
"Drone" node that turns Z up into Y up and cm into metres, as in models/frame.glb, so
js/frame3d.js reads both models the same way. Materials come from the OBJ's material names.

Usage: python3 tools/frame/obj_to_glb.py "Lowres frame 2.obj" frame-v2-raw.glb   (needs numpy)
"""
import collections
import json
import os
import struct
import sys

import numpy as np

# PBR values for Fusion's named appearances: base colour (linear), roughness, metalness
LOOKS = {
    "Carbon_Fiber_-_Twill": (0.05, 0.05, 0.055, 0.35, 0), "Polycarbonate_(Clear)": (0.75, 0.8, 0.85, 0.2, 0),
    "Coating_-_Black_Oxide": (0.03, 0.03, 0.03, 0.4, 0.8), "Silver_-_Polished": (0.9, 0.9, 0.9, 0.15, 1),
    "Brass_-_Old_-_Matte": (0.55, 0.42, 0.2, 0.6, 1), "PCB_Black": (0.02, 0.02, 0.02, 0.5, 0),
    "Plastic_-_Matte_(Black)": (0.02, 0.02, 0.02, 0.8, 0), "Aluminum_nitride_(AlN)": (0.75, 0.75, 0.72, 0.6, 0),
    "Aluminum_-_Polished": (0.9, 0.9, 0.92, 0.15, 1), "Steel_-_Satin": (0.62, 0.62, 0.62, 0.45, 1),
    "Plastic_-_Matte_(Yellow)": (0.85, 0.6, 0.04, 0.8, 0), "Plastic_-_Matte_(Red)": (0.6, 0.03, 0.03, 0.8, 0),
    "ABS_(White)": (0.85, 0.85, 0.82, 0.6, 0), "MATERIAL_NOT_DEFINED": (0.3, 0.3, 0.3, 0.7, 0),
}


def linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def material(name):
    if name.startswith("Opaque("):   # Fusion's plain colours: Opaque(r,g,b), sRGB 0-255
        rgb = [round(linear(int(x) / 255), 4) for x in name[7:].split(")")[0].split(",")]
        return {"name": name, "pbrMetallicRoughness": {"baseColorFactor": rgb + [1], "metallicFactor": 0, "roughnessFactor": 0.6}}
    r, g, b, rough, metal = LOOKS.get(name, (0.5, 0.5, 0.5, 0.6, 0))
    return {"name": name, "pbrMetallicRoughness": {"baseColorFactor": [r, g, b, 1], "metallicFactor": metal, "roughnessFactor": rough}}


def read_obj(path, names):
    """Vertices, normals, and {part name: {material: [triangle corners as (v, vn) pairs]}}."""
    V, N, parts, cur, mat = [], [], collections.OrderedDict(), None, None
    for line in open(path):
        if line.startswith("v "):
            V.append(line.split()[1:4])
        elif line.startswith("vn "):
            N.append(line.split()[1:4])
        elif line.startswith("g "):
            body = line[2:].strip()
            if body not in names:
                sys.exit("no part name for %s in v2-parts.json" % body)
            cur = parts.setdefault(names[body], collections.OrderedDict())
        elif line.startswith("usemtl"):
            mat = line.split(None, 1)[1].strip()
        elif line.startswith("f "):
            c = [(int(t.split("/")[0]) - 1, int(t.split("/")[2]) - 1 if t.count("/") == 2 and t.split("/")[2] else -1)
                 for t in line.split()[1:]]
            tris = cur.setdefault(mat, [])
            for k in range(1, len(c) - 1):
                tris.append(c[0] + c[k] + c[k + 1])
    return np.array(V, np.float32), np.array(N, np.float32), parts


def primitive(V, N, F):
    """Positions, normals and indices for one material of one part. Corners that share a
    vertex and a normal share an index. Faces with no normals (mesh bodies, from an STL)
    get smooth, area-weighted ones."""
    F = np.array(F, np.int64)
    fn = np.cross(V[F[:, 2]] - V[F[:, 0]], V[F[:, 4]] - V[F[:, 0]]).astype(np.float32)
    pairs = np.stack([F[:, [0, 1]], F[:, [2, 3]], F[:, [4, 5]]], 1).reshape(-1, 2)
    smooth = None
    if (pairs[:, 1] < 0).any():
        smooth = np.zeros((len(V), 3), np.float32)
        for k in (0, 2, 4):
            np.add.at(smooth, F[:, k], fn)
        pairs[pairs[:, 1] < 0, 1] = -1   # one key per vertex
    uniq, inv = np.unique(pairs, axis=0, return_inverse=True)
    nor = N[np.maximum(uniq[:, 1], 0)] if len(N) else np.zeros((len(uniq), 3), np.float32)
    if smooth is not None:
        nor = np.where((uniq[:, 1] < 0)[:, None], smooth[uniq[:, 0]], nor)
    nor = nor / np.maximum(np.linalg.norm(nor, axis=1, keepdims=True), 1e-12)
    return V[uniq[:, 0]], nor.astype(np.float32), inv.reshape(-1).astype(np.uint32)


def main(src, dst):
    names = json.load(open(os.path.join(os.path.dirname(__file__), "v2-parts.json")))
    V, N, parts = read_obj(src, names)
    buf, views, accs, mats, mi, meshes, nodes = bytearray(), [], [], [], {}, [], []

    def add(arr, target, bounds=False):
        views.append({"buffer": 0, "byteOffset": len(buf), "byteLength": arr.nbytes, "target": target})
        buf.extend(arr.tobytes())
        buf.extend(b"\0" * (-len(buf) % 4))
        a = {"bufferView": len(views) - 1, "componentType": 5126 if arr.dtype == np.float32 else 5125,
             "count": len(arr), "type": "VEC3" if arr.ndim == 2 else "SCALAR"}
        if bounds:
            a["min"], a["max"] = arr.min(0).tolist(), arr.max(0).tolist()
        accs.append(a)
        return len(accs) - 1

    for name, by_mat in parts.items():
        if name == "DROP":
            continue
        prims = []
        for m, F in by_mat.items():
            pos, nor, idx = primitive(V, N, F)
            if m not in mi:
                mi[m] = len(mats)
                mats.append(material(m))
            prims.append({"attributes": {"POSITION": add(pos, 34962, True), "NORMAL": add(nor, 34962)},
                          "indices": add(idx, 34963), "material": mi[m]})
        meshes.append({"name": name, "primitives": prims})
        nodes.append({"name": name, "mesh": len(meshes) - 1})
    nodes.append({"name": "Drone", "rotation": [-0.7071067811865476, 0, 0, 0.7071067811865476],
                  "scale": [0.01, 0.01, 0.01], "children": list(range(len(nodes)))})
    gltf = {"asset": {"version": "2.0", "generator": "tools/frame/obj_to_glb.py"}, "scene": 0,
            "scenes": [{"nodes": [len(nodes) - 1]}], "nodes": nodes, "meshes": meshes, "materials": mats,
            "accessors": accs, "bufferViews": views, "buffers": [{"byteLength": len(buf)}]}
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    with open(dst, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, 28 + len(js) + len(buf)))
        f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
        f.write(struct.pack("<II", len(buf), 0x004E4942) + bytes(buf))
    print("parts", len(meshes), "triangles", sum(len(F) for p in parts.values() for F in p.values()))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
