"""Generate improved OneBreath app icons from the source artwork.

Improvements over the original `assets/OneBreath-icon.png`:
  * Drops the "BREATH HOLD" text label (launcher icons should be text-free).
  * Re-centers the stopwatch+lung symbol with proper safe-area padding so
    the artwork is not clipped by iOS/Android icon masks.
  * Refreshes the teal gradient background and aligns it with the splash
    background color for visual cohesion.
  * Emits the platform-specific files Expo expects:
      - assets/icon.png             (1024x1024, square iOS/launcher)
      - assets/adaptive-icon.png    (1024x1024, Android foreground w/ extra padding)
      - assets/splash-icon.png      (1024x1024, used by splash screen)
      - assets/favicon.png          (48x48,   web favicon)

Run with: `python scripts/generate_icons.py`
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SRC = ASSETS / "OneBreath-icon.png"

GRADIENT_TOP_LEFT = (11, 26, 46, 255)       # #0B1A2E - matches splash bg
GRADIENT_BOTTOM_RIGHT = (38, 166, 178, 255) # #26A6B2 - teal accent


def extract_symbol(src: Image.Image) -> Image.Image:
    """Isolate the white stopwatch+lung glyph as a transparent PNG.

    The source artwork is a flat PNG (no alpha on the symbol), so we build
    an alpha mask from pixel luminance: bright pixels become opaque white,
    everything else becomes transparent. We then tight-crop the result.
    """
    w, h = src.size
    # Crop a tight inner box that contains only the glyph, excluding the
    # source's rounded-corner edges (which would otherwise leak through as
    # near-white antialiased arcs) and the bottom text label.
    region = src.crop((int(w * 0.18), int(h * 0.16), int(w * 0.82), int(h * 0.66))).convert("RGB")
    px = region.load()
    glyph = Image.new("RGBA", region.size, (0, 0, 0, 0))
    gp = glyph.load()
    for y in range(region.size[1]):
        for x in range(region.size[0]):
            r, g, b = px[x, y]
            lum = (r + g + b) // 3
            chroma = max(r, g, b) - min(r, g, b)
            if lum > 220 and chroma < 35:
                gp[x, y] = (255, 255, 255, 255)
    # Smooth the binary mask: tiny blur + alpha threshold curve gives a
    # crisp anti-aliased glyph without the original mid-tone grain.
    alpha = glyph.split()[3].filter(ImageFilter.GaussianBlur(radius=1.2))
    alpha = alpha.point(lambda v: 0 if v < 90 else (255 if v > 180 else int((v - 90) * 255 / 90)))
    glyph.putalpha(alpha)
    bbox = glyph.getbbox()
    if bbox is None:
        return glyph
    return glyph.crop(bbox)


def make_gradient(size: int) -> Image.Image:
    """Create a smooth diagonal teal gradient background."""
    grad = Image.new("RGBA", (size, size), GRADIENT_TOP_LEFT)
    draw = ImageDraw.Draw(grad)
    tl = GRADIENT_TOP_LEFT
    br = GRADIENT_BOTTOM_RIGHT
    for i in range(size * 2):
        t = i / (size * 2 - 1)
        color = tuple(int(tl[c] + (br[c] - tl[c]) * t) for c in range(4))
        draw.line([(i, 0), (0, i)], fill=color)
    return grad.filter(ImageFilter.GaussianBlur(radius=max(1, int(size * 0.02))))


def rounded_mask(size: int, radius_ratio: float = 0.22) -> Image.Image:
    radius = int(size * radius_ratio)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def composite_icon(symbol: Image.Image, size: int, padding: float, rounded: bool) -> Image.Image:
    bg = make_gradient(size)
    inner = int(size * (1 - 2 * padding))
    sym = symbol.copy()
    sym.thumbnail((inner, inner), Image.LANCZOS)
    x = (size - sym.width) // 2
    y = (size - sym.height) // 2
    bg.paste(sym, (x, y), sym)
    if rounded:
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(bg, (0, 0), rounded_mask(size))
        return out
    return bg


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    symbol = extract_symbol(src)

    composite_icon(symbol, 1024, padding=0.12, rounded=True).save(ASSETS / "icon.png")

    fg_only = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    sym = symbol.copy()
    inner = int(1024 * (1 - 2 * 0.25))
    sym.thumbnail((inner, inner), Image.LANCZOS)
    fg_only.paste(sym, ((1024 - sym.width) // 2, (1024 - sym.height) // 2), sym)
    fg_only.save(ASSETS / "adaptive-icon.png")

    composite_icon(symbol, 1024, padding=0.18, rounded=False).save(ASSETS / "splash-icon.png")
    composite_icon(symbol, 48, padding=0.10, rounded=True).save(ASSETS / "favicon.png")

    # PWA / web icons (live in /public so they're served as static assets).
    public = ROOT / "public" / "icons"
    public.mkdir(parents=True, exist_ok=True)
    # Standard PWA sizes (square, no rounding -- the manifest declares purpose).
    composite_icon(symbol, 192, padding=0.12, rounded=False).save(public / "icon-192.png")
    composite_icon(symbol, 512, padding=0.12, rounded=False).save(public / "icon-512.png")
    # Maskable icon needs ~20% safe padding so OS-applied masks don't crop the glyph.
    composite_icon(symbol, 512, padding=0.22, rounded=False).save(public / "icon-maskable-512.png")
    # iOS home-screen icon (Safari "Add to Home Screen"). 180x180 is the canonical size.
    composite_icon(symbol, 180, padding=0.12, rounded=False).save(public / "apple-touch-icon.png")

    print("Generated:")
    for name in ("icon.png", "adaptive-icon.png", "splash-icon.png", "favicon.png"):
        p = ASSETS / name
        print(f"  {p}  ({p.stat().st_size} bytes)")
    for name in ("icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"):
        p = public / name
        print(f"  {p}  ({p.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
