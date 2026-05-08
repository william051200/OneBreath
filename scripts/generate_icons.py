"""Generate OneBreath PWA icons from the source artwork.

Reads scripts/source/OneBreath-icon.png (the original 2048x2048 marketing
artwork) and emits clean, text-free, properly-padded variants:

  * assets/icon.png             -- Expo dev fallback icon (1024x1024)
  * assets/favicon.png          -- web favicon (48x48)
  * public/icons/icon-192.png   -- PWA standard
  * public/icons/icon-512.png   -- PWA standard
  * public/icons/icon-maskable-512.png  -- PWA maskable (extra padding)
  * public/icons/apple-touch-icon.png   -- iOS Add-to-Home-Screen (180x180)
  * public/og-image.png         -- 1200x630 social preview card

Run with: `python scripts/generate_icons.py`
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SRC = ROOT / "scripts" / "source" / "OneBreath-icon.png"

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


def make_gradient_rect(width: int, height: int) -> Image.Image:
    """Diagonal teal gradient sized to an arbitrary rectangle."""
    grad = Image.new("RGBA", (width, height), GRADIENT_TOP_LEFT)
    draw = ImageDraw.Draw(grad)
    tl = GRADIENT_TOP_LEFT
    br = GRADIENT_BOTTOM_RIGHT
    diag = width + height
    for i in range(diag):
        t = i / max(1, diag - 1)
        color = tuple(int(tl[c] + (br[c] - tl[c]) * t) for c in range(4))
        draw.line([(i, 0), (0, i)], fill=color)
    return grad.filter(ImageFilter.GaussianBlur(radius=max(1, int(min(width, height) * 0.015))))


def load_font(size: int) -> ImageFont.FreeTypeFont:
    """Best-effort font loader: try a few common sans-serifs, then default."""
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf",  # Segoe UI Bold (Windows)
        "C:/Windows/Fonts/segoeui.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def make_og_image(symbol: Image.Image, path: Path) -> None:
    """1200x630 social preview, optimized to read well even at small sizes.

    Layout: large logo top-centre, huge bold title below, short tagline.
    No URL on the image itself (Threads/X show the domain anyway).
    A dark vignette behind the text guarantees contrast against the gradient.
    """
    width, height = 1200, 630
    bg = make_gradient_rect(width, height)

    # Soft dark vignette in the lower half so white text always pops.
    vignette = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vignette)
    for i in range(height // 2, height):
        alpha = int(120 * (i - height // 2) / (height // 2))
        vd.line([(0, i), (width, i)], fill=(11, 26, 46, alpha))
    bg = Image.alpha_composite(bg, vignette)

    # Logo, large and centred above the text.
    logo_size = 280
    sym = symbol.copy()
    sym.thumbnail((logo_size, logo_size), Image.LANCZOS)
    logo_x = (width - sym.width) // 2
    logo_y = 90
    bg.paste(sym, (logo_x, logo_y), sym)

    draw = ImageDraw.Draw(bg)
    title_font = load_font(124)
    tag_font = load_font(40)

    title = "OneBreath"
    tagline = "Train your breath. Find your calm."

    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    tag_bbox = draw.textbbox((0, 0), tagline, font=tag_font)
    title_w = title_bbox[2] - title_bbox[0]
    tag_w = tag_bbox[2] - tag_bbox[0]

    title_y = logo_y + sym.height + 40
    tag_y = title_y + (title_bbox[3] - title_bbox[1]) + 18

    draw.text(((width - title_w) // 2, title_y), title, fill=(255, 255, 255, 255), font=title_font)
    draw.text(((width - tag_w) // 2, tag_y), tagline, fill=(127, 231, 196, 255), font=tag_font)

    bg.convert("RGB").save(path, "PNG", optimize=True)


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    symbol = extract_symbol(src)

    # Expo dev/runtime fallback icon (small, kept for `expo start` UI).
    composite_icon(symbol, 1024, padding=0.12, rounded=True).save(ASSETS / "icon.png")
    composite_icon(symbol, 48, padding=0.10, rounded=True).save(ASSETS / "favicon.png")

    # PWA / web icons (live in /public so they're served as static assets).
    public = ROOT / "public" / "icons"
    public.mkdir(parents=True, exist_ok=True)
    composite_icon(symbol, 192, padding=0.12, rounded=False).save(public / "icon-192.png")
    composite_icon(symbol, 512, padding=0.12, rounded=False).save(public / "icon-512.png")
    # Maskable icon needs ~20% safe padding so OS-applied masks don't crop the glyph.
    composite_icon(symbol, 512, padding=0.22, rounded=False).save(public / "icon-maskable-512.png")
    # iOS home-screen icon (Safari "Add to Home Screen"). 180x180 is canonical.
    composite_icon(symbol, 180, padding=0.12, rounded=False).save(public / "apple-touch-icon.png")

    # Social preview card (Open Graph / Twitter Cards).
    og_path = ROOT / "public" / "og-image.png"
    make_og_image(symbol, og_path)

    print("Generated:")
    for name in ("icon.png", "favicon.png"):
        p = ASSETS / name
        print(f"  {p}  ({p.stat().st_size} bytes)")
    for name in ("icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"):
        p = public / name
        print(f"  {p}  ({p.stat().st_size} bytes)")
    print(f"  {og_path}  ({og_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
