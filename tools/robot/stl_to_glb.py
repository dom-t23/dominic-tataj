"""The pipe climber's Fusion STL as glTF, step 1 of 3 (see README).

The STL is one mesh in mm, Z up. This splits it into its parts, drops the pipe stub
(22 x 505 mm; the page draws its own pipe), and writes a GLB in metres, Y up.

Usage: python3 tools/robot/stl_to_glb.py Pipe_Climber.stl robot-raw.glb   (needs trimesh)
"""
import sys

import numpy as np
import trimesh


def main(src, dst):
    parts = trimesh.load(src, force="mesh").split(only_watertight=False)
    scene, k = trimesh.Scene(), 0
    up = trimesh.transformations.rotation_matrix(-np.pi / 2, [1, 0, 0])   # Z up -> Y up
    for p in parts:
        if p.extents[2] > 400:   # the pipe stub
            continue
        p = p.copy()
        p.apply_scale(0.001)
        p.apply_transform(up)
        scene.add_geometry(p, node_name="part%03d" % k, geom_name="part%03d" % k)
        k += 1
    scene.export(dst)
    print("parts", k, "of", len(parts))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(*sys.argv[1:])
