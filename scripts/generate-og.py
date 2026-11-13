#!/usr/bin/env python3
"""Generate public/og.png (1200x630) for HDL Forge — branded Open Graph card.

Reproducible: run `python3 scripts/generate-og.py` after changing copy or
palette. Fonts are variable-weight TTFs (Inter, JetBrains Mono); pass their
paths on disk or they are looked up next to this script.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
CANVAS = (10, 14, 20)          # #0a0e14
CANVAS_SUBTLE = (15, 21, 30)   # #0f151e
BORDER = (35, 43, 54)          # #232b36
FG = (231, 237, 243)           # #e7edf3
FG_MUTED = (154, 164, 178)     # #9aa4b2
FG_SUBTLE = (119, 129, 143)    # #77818f
ACCENT = (96, 165, 250)        # #60a5fa
ACCENT_STRONG = (37, 99, 235)  # #2563eb
SUCCESS = (63, 185, 80)        # #3fb950

FONT_DIR = Path(__file__).resolve().parent / "fonts"
INTER = Path(sys.argv[1]) if len(sys.argv) > 1 else FONT_DIR / "Inter.ttf"
MONO = Path(sys.argv[2]) if len(sys.argv) > 2 else FONT_DIR / "JBMono.ttf"


def font(path: Path, size: int, weight: int | None = None) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(path), size)
    if weight is not None:
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
    return f


def main() -> None:
    img = Image.new("RGB", (W, H), CANVAS)
    d = ImageDraw.Draw(img)

    # Subtle 40px grid
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=(14, 19, 27), width=1)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=(14, 19, 27), width=1)

    # Top accent hairline
    d.rectangle([0, 0, W, 4], fill=ACCENT_STRONG)

    # ---- Left column -------------------------------------------------------
    x0, y0 = 72, 88

    # Badge chip
    badge_font = font(MONO, 22, 500)
    badge_text = "HDL FORGE"
    bb = d.textbbox((0, 0), badge_text, font=badge_font)
    bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    d.rounded_rectangle(
        [x0, y0, x0 + bw + 36, y0 + bh + 22],
        radius=8,
        fill=CANVAS_SUBTLE,
        outline=BORDER,
        width=2,
    )
    d.text((x0 + 18, y0 + 8), badge_text, font=badge_font, fill=ACCENT)
    y0 += bh + 22 + 34

    # Headline
    head_font = font(INTER, 68, 600)
    d.text((x0, y0), "Learn Verilog", font=head_font, fill=FG)
    y0 += 84
    d.text((x0, y0), "in the browser.", font=head_font, fill=FG)
    y0 += 96

    # Supporting line
    sub_font = font(INTER, 27, 400)
    for line in [
        "15 chapters · instant in-browser simulation",
        "CS50-style problem sets · verified certificate",
    ]:
        d.text((x0, y0), line, font=sub_font, fill=FG_MUTED)
        y0 += 42

    # Domain chip
    y0 += 26
    dom_font = font(MONO, 24, 500)
    dom_text = "hdlforge.dev"
    dbb = d.textbbox((0, 0), dom_text, font=dom_font)
    dw, dh = dbb[2] - dbb[0], dbb[3] - dbb[1]
    d.rounded_rectangle(
        [x0, y0, x0 + dw + 40, y0 + dh + 24],
        radius=10,
        fill=CANVAS_SUBTLE,
        outline=(47, 58, 73),
        width=2,
    )
    d.text((x0 + 20, y0 + 10), dom_text, font=dom_font, fill=FG)

    # ---- Right: code + waveform card ---------------------------------------
    cx0, cy0, cx1, cy1 = 620, 96, 1128, 534
    d.rounded_rectangle(
        [cx0, cy0, cx1, cy1],
        radius=16,
        fill=CANVAS_SUBTLE,
        outline=BORDER,
        width=2,
    )
    # Card title bar
    d.rounded_rectangle([cx0, cy0, cx1, cy0 + 44], radius=16, fill=(12, 17, 24))
    d.rectangle([cx0, cy0 + 28, cx1, cy0 + 44], fill=(12, 17, 24))
    d.text((cx0 + 22, cy0 + 11), "top.sv", font=font(MONO, 20, 500), fill=FG_SUBTLE)
    for i, c in enumerate([(63, 185, 80), (210, 153, 34), (248, 81, 73)]):
        d.ellipse(
            [cx1 - 30 - i * 26, cy0 + 16, cx1 - 16 - i * 26, cy0 + 30],
            fill=c,
        )

    code_font = font(MONO, 21, 400)
    snippet = [
        [("module ", FG_MUTED), ("top", FG), (" (", FG_MUTED)],
        [("  input wire ", FG_MUTED), ("[3:0]", ACCENT), (" a, b,", FG)],
        [("  output wire ", FG_MUTED), ("[3:0]", ACCENT), (" y", FG)],
        [(");", FG_MUTED)],
        [("assign ", ACCENT_STRONG), ("y = a & b;", FG)],
        [("endmodule", FG_MUTED)],
    ]
    ty = cy0 + 66
    for line in snippet:
        tx = cx0 + 24
        for text, color in line:
            d.text((tx, ty), text, font=code_font, fill=color)
            tx += d.textlength(text, font=code_font)
        ty += 32

    # Waveform traces under the code
    wy = ty + 18
    d.line([(cx0 + 24, wy), (cx1 - 24, wy)], fill=BORDER, width=1)
    # clk: proper square wave
    clk_y = wy + 26
    low, high = clk_y + 22, clk_y
    half = 40
    px = cx0 + 24
    d.line([(cx0 + 24, low), (cx1 - 24, low)], fill=(20, 28, 38), width=2)
    py = low
    while px < cx1 - 24:
        # rising edge
        d.line([(px, py), (px, high)], fill=SUCCESS, width=3)
        px2 = min(px + half, cx1 - 24)
        d.line([(px, high), (px2, high)], fill=SUCCESS, width=3)
        px = px2
        py = high
        if px >= cx1 - 24:
            break
        # falling edge
        d.line([(px, py), (px, low)], fill=SUCCESS, width=3)
        px2 = min(px + half, cx1 - 24)
        d.line([(px, low), (px2, low)], fill=SUCCESS, width=3)
        px = px2
        py = low
    # bus signal: blocky transitions
    bus_y = clk_y + 58
    bx = cx0 + 24
    widths = [70, 96, 64, 110, 88, 96]
    vals = ["1010", "1100", "0001", "1001", "0110", "1011"]
    for wseg, val in zip(widths, vals):
        d.rectangle([bx, bus_y, bx + wseg, bus_y + 26], outline=ACCENT, width=2)
        d.text((bx + 8, bus_y + 1), val, font=font(MONO, 17, 400), fill=ACCENT)
        bx += wseg
        if bx > cx1 - 70:
            break

    img.save("public/og.png", "PNG", optimize=True)
    print(f"wrote public/og.png ({W}x{H})")


if __name__ == "__main__":
    main()
