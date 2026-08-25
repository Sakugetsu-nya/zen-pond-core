#!/usr/bin/env python3
"""Generate PWA icons from the source PNG.

- favicon.png             : circular (tab favicon only), transparent corners
- icon-192.png / icon-512.png : square full image (used for PWA install / home screen)
- icon-maskable-512.png   : square with content in safe zone (adaptive mask)
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw


def open_rgba(src: Path) -> Image.Image:
    return Image.open(src).convert("RGBA")


def make_circular(src: Path, size: int) -> Image.Image:
    img = open_rgba(src).resize((size, size), Image.LANCZOS)
    square = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
    return Image.composite(img, square, mask)


def make_square(src: Path, size: int) -> Image.Image:
    return open_rgba(src).resize((size, size), Image.LANCZOS)


def make_maskable(src: Path, size: int) -> Image.Image:
    img = open_rgba(src)
    safe = int(size * 0.8)
    img = img.resize((safe, safe), Image.LANCZOS)
    square = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset = (size - safe) // 2
    square.paste(img, (offset, offset), img)
    return square


def main() -> None:
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} <source.png> <out_dir>")
        sys.exit(1)
    src = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)

    make_circular(src, 512).save(out_dir / "favicon.png")
    make_square(src, 192).save(out_dir / "icon-192.png")
    make_square(src, 512).save(out_dir / "icon-512.png")
    make_maskable(src, 512).save(out_dir / "icon-maskable-512.png")

    print(f"Icons written to {out_dir}")


if __name__ == "__main__":
    main()
