"""Generate the browser-tab favicon from the game's own "crab" alien sprite,
so the tab icon matches the little aliens already used elsewhere on the site
(the SELECT STAGE menu header). Pure black background, white pixels, 1-bit —
same palette as the rest of the site.

Each size is rasterized directly (rects, not resized from a smaller bitmap),
so every pixel stays crisp with no blur, at any size.

    python tools/make_favicon.py

Writes favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180x180)
to the project root. Requires Pillow.
"""
import io
import struct
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

# space-invaders-hero.js ART.crab, frame 0 — 11x8
CRAB = [
    '..#.....#..',
    '...#...#...',
    '..#######..',
    '.##.###.##.',
    '###########',
    '#.#######.#',
    '#.#.....#.#',
    '...##.##...',
]
GW, GH = len(CRAB[0]), len(CRAB)


def render(size, block):
    """Draw the grid at `block` px/pixel, centered in a `size`x`size` canvas."""
    img = Image.new('RGB', (size, size), '#000')
    content_w, content_h = GW * block, GH * block
    ox, oy = (size - content_w) // 2, (size - content_h) // 2
    px = img.load()
    for y, row in enumerate(CRAB):
        for x, ch in enumerate(row):
            if ch != '#':
                continue
            for dy in range(block):
                for dx in range(block):
                    px[ox + x * block + dx, oy + y * block + dy] = (255, 255, 255)
    return img


def write_ico(path, images):
    """Pack already-rendered images into an .ico, each as its own embedded PNG
    (supported since Vista). Image.save(..., sizes=[...]) instead resizes a
    single base image per entry, which would blur these crisp renders — so
    the container is built by hand."""
    entries, data = [], io.BytesIO()
    for img in images:
        w, h = img.size
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        png = buf.getvalue()
        entries.append((w if w < 256 else 0, h if h < 256 else 0, len(png), data.tell()))
        data.write(png)
    header = struct.pack('<HHH', 0, 1, len(images))
    offset0 = 6 + 16 * len(images)
    dir_entries = b''.join(
        struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, size, offset0 + off)
        for w, h, size, off in entries
    )
    Path(path).write_bytes(header + dir_entries + data.getvalue())


def main():
    # .ico: pick a block size per resolution so the sprite reads clearly at that size
    ico_sizes = {16: 1, 32: 2, 48: 4}
    frames = [render(size, block) for size, block in ico_sizes.items()]
    write_ico(ROOT / 'favicon.ico', frames)

    render(180, 14).save(ROOT / 'apple-touch-icon.png')

    svg_rects = '\n    '.join(
        f'<rect x="{x}" y="{y}" width="1" height="1"/>'
        for y, row in enumerate(CRAB)
        for x, ch in enumerate(row)
        if ch == '#'
    )
    margin_x, margin_y = 2, 2
    vb = f'-{margin_x} -{margin_y} {GW + 2 * margin_x} {GH + 2 * margin_y}'
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" shape-rendering="crispEdges">
  <rect x="-{margin_x}" y="-{margin_y}" width="{GW + 2 * margin_x}" height="{GH + 2 * margin_y}" fill="#000"/>
  <g fill="#fff">
    {svg_rects}
  </g>
</svg>
'''
    (ROOT / 'favicon.svg').write_text(svg, encoding='utf-8')
    print('wrote favicon.svg, favicon.ico, apple-touch-icon.png')


if __name__ == '__main__':
    main()
