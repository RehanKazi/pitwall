"""Convert a circuit GeoJSON LineString into a single-stroke SVG.
usage: geo2svg.py in.geojson out.svg [angle_deg|auto] [stroke]"""
import json, math, sys

W, H, PAD = 300, 210, 12

src, out = sys.argv[1], sys.argv[2]
angle_arg = sys.argv[3] if len(sys.argv) > 3 else "auto"
stroke = float(sys.argv[4]) if len(sys.argv) > 4 else 3.2

d = json.load(open(src))
feat = d["features"][0] if "features" in d else d
coords = feat["geometry"]["coordinates"]

# Equirectangular projection in metres around the circuit's mean latitude; y up = north.
lat0 = sum(c[1] for c in coords) / len(coords)
k = math.cos(math.radians(lat0))
pts = [(c[0] * k * 111320, c[1] * 111320) for c in coords]

def fit(angle):
    a = math.radians(angle)
    ca, sa = math.cos(a), math.sin(a)
    rp = [(x * ca - y * sa, x * sa + y * ca) for x, y in pts]
    xs, ys = [p[0] for p in rp], [p[1] for p in rp]
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    s = min((W - 2 * PAD) / w, (H - 2 * PAD) / h)
    return s, rp, min(xs), max(ys), w, h

if angle_arg == "auto":
    angle = max(range(0, 360), key=lambda a: fit(a)[0])
else:
    angle = float(angle_arg)

s, rp, minx, maxy, w, h = fit(angle)
ox = (W - w * s) / 2
oy = (H - h * s) / 2
svg_pts = [((x - minx) * s + ox, (maxy - y) * s + oy) for x, y in rp]
closed = coords[0] == coords[-1] or math.dist(svg_pts[0], svg_pts[-1]) < 3
path = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in svg_pts) + (" Z" if closed else "")

open(out, "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none">'
    f'<path d="{path}" stroke="#fff" stroke-width="{stroke}" '
    f'stroke-linejoin="round" stroke-linecap="round"/></svg>\n'
)
print(f"{src.split('/')[-1]} angle={angle} closed={closed}")
