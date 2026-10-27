"""Gate pass rates for Fig. 03, from vision-drone-racing's committed results files.

Nothing is re-run. Two worlds, each flown on the same six sets of 50 seeded courses:
  clean    the benchmark before run 25, the files vdr.demo itself ships (camera + IMU from
           run 20, camera only from run 23's re-run)
  clutter  run 25's default: orange panels and cones beside the course, re-baselined

Prints each set's rates and the pooled rate (gates passed over gates flown) per world and
method, then the table body for index.html.

Usage: python3 tools/benchmark_table.py path/to/vision-drone-racing
"""
import json
import pathlib
import sys

SETS = [0, 1000, 2000, 3000, 4000, 5000]
FILES = {
    ("clean", "imu"): lambda s: "2026-10-22_5143039_baseline.json" if s == 0 else f"2026-10-22_6b66b99_ab-unamb2-on-seed{s}.json",
    ("clean", "cam"): lambda s: "2026-10-25_75277ee_ab-camonly.json" if s == 0 else f"2026-10-25_75277ee_ab-camonly-seed{s}.json",
    ("clutter", "imu"): lambda s: "2026-10-27_11f0132_rebaseline-clutter.json" if s == 0 else f"2026-10-27_11f0132_rebaseline-clutter-seed{s}.json",
    ("clutter", "cam"): lambda s: "2026-10-27_11f0132_rebaseline-clutter-camonly.json" if s == 0 else f"2026-10-27_11f0132_rebaseline-clutter-camonly-seed{s}.json",
}
COLS = [("clean", "imu"), ("clean", "cam"), ("clutter", "imu"), ("clutter", "cam")]


def main(repo):
    res = pathlib.Path(repo) / "results"
    rows, tot = [], {c: [0, 0] for c in COLS}
    for s in SETS:
        row = [f"{s}–{s + 49}"]
        for c in COLS:
            r = json.loads((res / FILES[c](s)).read_text())
            assert r["runs"] == 50, (FILES[c](s), r["runs"])
            row.append(100 * r["pass_rate"])
            tot[c][0] += r["gates_passed"]
            tot[c][1] += r["gates_total"]
        rows.append(row)
    rows.append(["Pooled"] + [100 * tot[c][0] / tot[c][1] for c in COLS])
    print("%-10s %8s %8s %8s %8s" % ("set", "clean+imu", "clean", "clutter+imu", "clutter"))
    for r in rows:
        print("%-10s" % r[0] + "".join("%9.2f%%" % v for v in r[1:]))
    print("\npooled gates:", {"/".join(c): tot[c] for c in COLS})
    print()
    for r in rows:
        cls = ' class="pooled"' if r[0] == "Pooled" else ""
        print(f'<tr{cls}><td>{r[0]}</td>' + "".join(f"<td>{v:.1f}%</td>" for v in r[1:]) + "</tr>")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
