"""Record the E-04 replay's flights, with what each stage of the flight stack did per frame.

Flies courses with the simulator and flight stack from a checkout of vision-drone-racing,
exactly as its benchmark does (same loop as vdr/runner.py, default world: orange clutter
beside the course since run 25). Nothing in that repo is changed: everything extra is read
from the stack after each step, and the flight never sees it. Writes flights/ through
split_flights.write().

Per kept camera frame (every 2nd, 20 Hz), on top of what `python -m vdr.demo` stores (camera
image, gate quads, true and estimated position, mode, target gate):
  mk  the detector's colour mask, 160 x 120, 1-bit PNG
  pn  PnP on the largest gate square in view, as the stack checks it: its kind (o/i), its
      corners, and each valid solution as [x, z, yaw, reprojection error]: the gate centre in
      plan in front of the camera (m), its turn from facing the camera (rad), px. Two
      solutions is the planar ambiguity of a small or distant square.
  cv  the filter's horizontal position uncertainty in the world frame: 1-sigma semi-axes (m)
      and the major axis' direction (rad)
  ev  filter events since the last kept frame: u fused a gate position, r rejected one
      (chi-squared gate), i re-initialised, h handed off to the next gate, t retargeted
  u   the command: collective thrust (m/s^2) and body rates (rad/s: roll, pitch, yaw)

Usage: python3 tools/export_flights.py path/to/vision-drone-racing [--seeds 1017 2034 0]
Needs the drone repo's requirements (numpy, opencv-python-headless, scipy). The first seed's
first flight is the hero's flight test (Fig. 00) and the replay's poster, so it should be a
completed one.
"""
import argparse
import base64
import math
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import split_flights  # noqa: E402

METHODS = {"default": ("Camera + IMU", {}), "camera_only": ("Camera only (no IMU)", {"camera_only": True})}
EVENTS = [("pos_updates", "u"), ("pos_rejects", "r"), ("reinits", "i"), ("handoffs", "h"), ("retargets", "t")]


def _r(x, n=3):
    return [round(float(v), n) for v in x]


def fly(seed, method, stride=2, quality=70):
    import cv2
    import numpy as np
    from vdr.autonomy import Autonomy, AutonomyConfig
    from vdr.autonomy.detector import GateDetector, OUTER
    from vdr.sim import SimConfig, Simulator

    label, flags = METHODS[method]
    sim_cfg, auto_cfg = SimConfig(), AutonomyConfig().override(**flags)
    sim = Simulator(sim_cfg, seed, record=True)
    info = sim.vehicle_info()
    auto = Autonomy(info, auto_cfg)
    det = GateDetector(auto_cfg, sim_cfg.image_width, sim_cfg.image_height)   # a second one, as vdr.demo
    gates = sim.course.gates
    counts = {k: 0 for k, _ in EVENTS}
    frames, n_img = [], 0

    obs = sim.reset()
    while True:
        cmd = auto.step(obs)
        if obs.image is not None:
            if n_img % stride == 0:
                frames.append(record(obs, cmd, auto, info, det, gates, sim, counts, OUTER, quality, cv2, np))
            n_img += 1
        obs = sim.step(cmd)
        if sim.done:
            break

    res = sim.result().to_dict()
    return dict(
        seed=seed, method=method, label=label, outcome=res["outcome"],
        gates_passed=res["gates_passed"], n_gates=res["n_gates"], time=res.get("time"),
        gate_outer=sim_cfg.gate_outer, gate_inner=sim_cfg.gate_inner,
        image_size=[sim_cfg.image_width, sim_cfg.image_height],
        thrust_max=round(float(info.thrust_max), 2), rate_max=_r(info.rate_max, 2), g=info.gravity,
        gates=[dict(c=_r(g.center, 2), yaw=round(float(g.yaw), 4)) for g in gates],
        start=_r(sim.course.start_position, 2),
        frames=frames,
    )


def record(obs, cmd, auto, info, det, gates, sim, counts, OUTER, quality, cv2, np):
    e, d = auto.eskf, auto.debug()
    p_true = sim.state.p
    fr = dict(t=round(obs.t, 3), p=_r(p_true, 2), e=None, m=d["mode"][0], g=int(sim.next_gate))

    if d["initialized"] and d["mode"] != "wait":
        # the estimate lives in the target gate's frame; express it through the gate it fits best
        j = min(range(len(gates)), key=lambda k: np.linalg.norm(d["p"] - gates[k].to_local(p_true)))
        R = gates[j].R
        fr["e"] = _r(R @ d["p"] + gates[j].center, 2)
        P = (R @ e.P[0:3, 0:3] @ R.T)[0:2, 0:2]
        w, v = np.linalg.eigh(P)
        fr["cv"] = [round(math.sqrt(max(w[1], 0)), 3), round(math.sqrt(max(w[0], 0)), 3),
                    round(math.atan2(v[1, 1], v[0, 1]), 3)]

    dets = det.detect(obs.image)
    fr["q"] = [dict(c=_r(x.corners.ravel(), 1), k=x.kind[0]) for x in dets]

    # PnP on the largest square with a valid solution, with the stack's own check
    up_c = info.R_bc.T @ auto._up_body()
    for x in sorted(dets, key=lambda x: -x.area):
        size = info.gate_outer_size if x.kind == OUTER else info.gate_inner_size
        sols = auto._valid_solutions(x.corners, size, up_c)
        if sols:
            fr["pn"] = dict(k=x.kind[0], c=_r(x.corners.ravel(), 1), s=[
                [round(float(s.t_co[0]), 2), round(float(s.t_co[2]), 2),
                 round(math.atan2(-float(s.R_co[0, 2]), -float(s.R_co[2, 2])), 3), round(float(s.reproj_err), 2)]
                for s in sols])
            break

    mask = auto.detector.last_mask
    if mask is not None:
        small = (cv2.resize(mask, (mask.shape[1] // 2, mask.shape[0] // 2), interpolation=cv2.INTER_AREA) > 64)
        ok, png = cv2.imencode(".png", small.astype(np.uint8) * 255, [cv2.IMWRITE_PNG_BILEVEL, 1, cv2.IMWRITE_PNG_COMPRESSION, 9])
        fr["mk"] = base64.b64encode(png.tobytes()).decode("ascii")

    ev = ""
    for key, ch in EVENTS:
        n = auto.stats.get(key, 0)
        if n > counts[key]:
            ev += ch
        counts[key] = n
    if ev:
        fr["ev"] = ev
    fr["u"] = [round(float(cmd.thrust), 2)] + _r(cmd.rates, 2)

    ok, jpg = cv2.imencode(".jpg", obs.image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    fr["img"] = base64.b64encode(jpg.tobytes()).decode("ascii")
    return fr


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("repo", help="checkout of vision-drone-racing")
    ap.add_argument("--seeds", type=int, nargs="+", default=[1017, 2034, 0])
    a = ap.parse_args()
    sys.path.insert(0, str(pathlib.Path(a.repo).resolve()))
    commit = subprocess.run(["git", "-C", a.repo, "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
    flights = []
    for seed in a.seeds:
        for m in METHODS:
            f = fly(seed, m)
            print("seed %5d  %-22s %-12s %d/%d gates  %d frames" % (seed, f["label"], f["outcome"], f["gates_passed"], f["n_gates"], len(f["frames"])))
            flights.append(f)
    split_flights.write(flights, "tools/export_flights.py from vision-drone-racing %s" % commit)


if __name__ == "__main__":
    main()
