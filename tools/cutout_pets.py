"""Re-cut the Canva pet and egg art from the white-background originals.

Only white that is connected to the image border is treated as background
(flood fill), so white/light areas inside an animal are kept. The result is
trimmed, centred on a square canvas with padding, and saved at 256x256.

Usage: python tools/cutout_pets.py [--tol 18] [--check sheet.png]
"""
import argparse
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SDD = ROOT / ".superpowers/sdd/2026-11-18-gizmo-rehaul"
PETS = ["bear", "cat", "dog", "dragon", "eagle", "fox", "frog", "griffin", "hamster",
        "lion", "owl", "panda", "penguin", "phoenix", "rabbit", "tiger", "unicorn", "wolf"]
SOURCES = {f"pets/{p}.png": SDD / "pets-vibrant" / f"{p}.png" for p in PETS}
SOURCES.update({f"pets/{p}.png": SDD / "raw2" / f"{p}.png" for p in ("hydra", "kraken")})
SOURCES.update({f"eggs/egg-{r}.png": SDD / "raw2" / f"egg-{r}.png"
                for r in ("common", "rare", "epic", "legendary")})
OUT = ROOT / "revision/img"
SIZE, PAD = 256, 0.06  # padding as a share of the canvas on each side
SCALE = 4  # upscale before cutting so the edge stays smooth


def cut(src, tol):
    small = Image.open(src).convert("RGB")
    # find the background on the original pixels (no resampling noise)
    sw, sh = small.size
    sp = small.load()
    from collections import Counter
    border = [sp[x, y] for x in range(sw) for y in (0, sh - 1)] +              [sp[x, y] for y in range(sh) for x in (0, sw - 1)]
    ref = Counter(border).most_common(1)[0][0]
    sbg = [[False] * sw for _ in range(sh)]
    q = deque()
    for x in range(sw):
        q.extend(((x, 0), (x, sh - 1)))
    for y in range(sh):
        q.extend(((0, y), (sw - 1, y)))
    while q:
        x, y = q.popleft()
        if sbg[y][x] or max(abs(a - b) for a, b in zip(sp[x, y], ref)) > tol:
            continue
        sbg[y][x] = True
        if x > 0: q.append((x - 1, y))
        if x < sw - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < sh - 1: q.append((x, y + 1))
    im = small.resize((sw * SCALE, sh * SCALE), Image.LANCZOS)
    w, h = im.size
    px = im.load()
    dist = [[255 - min(px[x, y]) for x in range(w)] for y in range(h)]
    bg = [[sbg[y // SCALE][x // SCALE] for x in range(w)] for y in range(h)]
    out = Image.new("RGBA", (w, h))
    op = out.load()
    edge = 60  # anti-aliased fringe next to the background
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if bg[y][x]:
                op[x, y] = (r, g, b, 0)
                continue
            near_bg = any(0 <= x + dx < w and 0 <= y + dy < h and bg[y + dy][x + dx]
                          for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            d = dist[y][x]
            if near_bg and d < edge:
                a = max(d / edge, 0.05)
                # remove the white the edge pixel was blended with
                r, g, b = (max(0, min(255, round((c - (1 - a) * 255) / a))) for c in (r, g, b))
                op[x, y] = (r, g, b, round(a * 255))
            else:
                op[x, y] = (r, g, b, 255)
    box = out.split()[-1].point(lambda v: 255 if v > 8 else 0).getbbox()
    art = out.crop(box)
    inner = round(SIZE * (1 - 2 * PAD))
    k = inner / max(art.size)
    art = art.resize((max(1, round(art.width * k)), max(1, round(art.height * k))), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(art, ((SIZE - art.width) // 2, (SIZE - art.height) // 2))
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tol", type=int, default=3)
    ap.add_argument("--check")
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    results = {}
    for dest, src in SOURCES.items():
        results[dest] = cut(src, a.tol)
        if not a.dry:
            results[dest].save(OUT / dest, optimize=True)
        print("ok", dest)
    if a.check:
        cols = 8
        rows = -(-len(results) // cols)
        sheet = Image.new("RGBA", (cols * 264, rows * 264 * 2), (26, 35, 58, 255))
        for i, im in enumerate(results.values()):
            x, y = (i % cols) * 264 + 4, (i // cols) * 264 * 2 + 4
            sheet.alpha_composite(im, (x, y))
            pink = Image.new("RGBA", (256, 256), (255, 0, 200, 255))
            pink.alpha_composite(im)
            sheet.alpha_composite(pink, (x, y + 264))
        sheet.convert("RGB").save(a.check)


if __name__ == "__main__":
    main()
