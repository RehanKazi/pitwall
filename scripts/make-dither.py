"""Generate the dithered background glow (public/dither-glow.png).

Ordered (8x8 Bayer) dithering of two soft radial glows into three tones,
written as a small RGBA PNG with only the standard library. The page shows
it scaled up with `image-rendering: pixelated` so each dither dot is crisp.
usage: python3 scripts/make-dither.py
"""
import math, struct, zlib

W, H = 480, 300  # dither "pixels"; displayed at 4x

def bayer(n):
    m = [[0]]
    while len(m) < n:
        s = len(m)
        m = [[4 * m[y % s][x % s] + [0, 2, 3, 1][(y // s) * 2 + (x // s)] for x in range(2 * s)] for y in range(2 * s)]
    return [[(v + 0.5) / (n * n) for v in row] for row in m]

B = bayer(8)
# Tones over the navy page background: (r, g, b, a)
TONES = [
    (0, 0, 0, 0),           # transparent — page navy shows through
    (29, 52, 120, 120),     # dim blue
    (56, 92, 190, 150),     # brighter blue
]

def glow(x, y, cx, cy, rx, ry, power):
    d = math.hypot((x - cx) / rx, (y - cy) / ry)
    return max(0.0, 1.0 - d) ** power

def write_png(path, width, height, rows):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)) \
        + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b"")
    open(path, "wb").write(png)
    print(f"wrote {path} ({width}x{height}, {len(png)} bytes)")


# ---- Background glow ----
rows = []
for y in range(H):
    row = bytearray([0])  # PNG filter: none
    for x in range(W):
        i = max(
            glow(x, y, W * 0.82, -H * 0.05, W * 0.75, H * 0.95, 1.6),        # top-right
            0.55 * glow(x, y, W * 0.05, H * 1.05, W * 0.55, H * 0.75, 1.8),  # bottom-left
        )
        v = i * (len(TONES) - 1)
        base = int(v)
        level = min(len(TONES) - 1, base + (1 if (v - base) > B[y % 8][x % 8] else 0))
        row += bytes(TONES[level])
    rows.append(bytes(row))

write_png("public/dither-glow.png", W, H, rows)

