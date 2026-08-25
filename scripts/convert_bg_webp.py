#!/usr/bin/env python3
"""Convert background JPGs to WebP q80."""
import sys
from pathlib import Path
from PIL import Image


def convert(src: Path, out: Path, quality: int = 80) -> None:
    im = Image.open(src)
    if im.mode in ("RGBA", "P"):
        im = im.convert("RGB")
    im.save(out, "WEBP", quality=quality, method=6)
    print(f"{src.name} -> {out.name} ({out.stat().st_size / 1024:.1f} KB)")


def main() -> None:
    img_dir = Path(__file__).parent.parent / "public" / "images"
    if not img_dir.exists():
        print(f"Images dir not found: {img_dir}")
        sys.exit(1)

    for jpg in sorted(img_dir.glob("*.jpg")):
        webp = jpg.with_suffix(".webp")
        convert(jpg, webp)
        jpg.unlink()
        print(f"  removed {jpg.name}")


if __name__ == "__main__":
    main()
