"""Draw og.png, the 1200x630 link preview every page shares.

    python tools/build_social_image.py

Needs Pillow and fontTools (with brotli) to read the site's own woff2 fonts:
    python -m pip install pillow fonttools brotli
Run it again only when the name or the hexdump line changes.
"""

import io
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'og.png'
W, H = 1200, 630

# The landing page's dark scheme.
PAPER = '#12161A'
INK = '#E6EAED'
MUTED = '#9AA5AE'
RULE = '#2C343B'
ACCENT = '#8EA2FF'

LINE = 'zainsplace // cybersecurity student. ctfs, bug bounties, cloud.'


def font(name, size, axes):
    """Load a self-hosted variable woff2 at the given axis values, in the font's axis order."""
    tt = TTFont(ROOT / 'fonts' / name)
    tt.flavor = None
    buf = io.BytesIO()
    tt.save(buf)
    buf.seek(0)
    f = ImageFont.truetype(buf, size)
    f.set_variation_by_axes([axes[a.axisTag] for a in tt['fvar'].axes])
    return f


def main():
    serif = font('newsreader-latin-opsz-normal.woff2', 150, {'wght': 500, 'opsz': 72})
    serif_small = font('newsreader-latin-opsz-normal.woff2', 44, {'wght': 400, 'opsz': 24})
    mono = font('jetbrains-mono-latin-wght-normal.woff2', 22, {'wght': 400})

    img = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(img)
    x = 80
    d.text((x - 6, 70), 'zainsplace', font=serif, fill=INK)
    d.text((x, 250), 'Cybersecurity student. Security tooling,', font=serif_small, fill=MUTED)
    d.text((x, 302), 'reviews and write-ups.', font=serif_small, fill=MUTED)

    # The first three rows of a real hexdump of the landing page's line. Like hexdump.js,
    # rows break after a space so words stay whole, and offsets are true byte positions.
    data = (LINE + '\n').encode('ascii')
    rows, start = [], 0
    while start < len(data) and len(rows) < 3:
        end = min(start + 16, len(data))
        if end < len(data):
            end = data.rfind(b' ', start, end) + 1 or end
        rows.append((start, data[start:end]))
        start = end
    ch = mono.getlength('0')
    hex_x = x + 10 * ch
    bar_x = hex_x + (16 * 3 + 1) * ch
    top = 410
    d.line((x, top - 22, W - x, top - 22), fill=RULE, width=2)
    for r, (offset, chunk) in enumerate(rows):
        y = top + r * 40
        d.text((x, y), '%08x' % offset, font=mono, fill=MUTED)
        hexes = ' '.join('%02x' % b for b in chunk[:8])
        if len(chunk) > 8:
            hexes += '  ' + ' '.join('%02x' % b for b in chunk[8:])
        d.text((hex_x, y), hexes, font=mono, fill=INK)
        d.text((bar_x, y), '|', font=mono, fill=MUTED)
        d.text((bar_x + ch, y), chunk.decode('ascii'), font=mono, fill=ACCENT)
        d.text((bar_x + (len(chunk) + 1) * ch, y), '|', font=mono, fill=MUTED)
    d.line((x, top + 3 * 40 + 6, W - x, top + 3 * 40 + 6), fill=RULE, width=2)

    img.save(OUT, optimize=True)
    print('Wrote og.png (%d bytes).' % OUT.stat().st_size)
    return 0


if __name__ == '__main__':
    sys.exit(main())
