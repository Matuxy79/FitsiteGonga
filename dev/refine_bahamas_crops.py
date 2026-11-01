"""Aggressive crop for IG story captures: letterbox trim + header/reply bar removal."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageStat

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets" / "gongafit" / "anniversary"

# Applied after letterbox trim — removes in-frame IG chrome.
STORY_CHROME = {"left": 0.02, "top": 0.155, "right": 0.02, "bottom": 0.185}

WEDDING_CHROME = {"left": 0.05, "top": 0.03, "right": 0.05, "bottom": 0.2}


def crop_box(size: tuple[int, int], profile: dict[str, float]) -> tuple[int, int, int, int]:
    w, h = size
    left = int(w * profile["left"])
    top = int(h * profile["top"])
    right = w - int(w * profile["right"])
    bottom = h - int(h * profile["bottom"])
    return left, top, max(right, left + 1), max(bottom, top + 1)


def column_mean(img: Image.Image, x: int) -> float:
    w, h = img.size
    strip = img.crop((x, 0, x + 1, h))
    stat = ImageStat.Stat(strip)
    return sum(stat.mean) / 3


def row_mean(img: Image.Image, y: int) -> float:
    w, h = img.size
    strip = img.crop((0, y, w, y + 1))
    stat = ImageStat.Stat(strip)
    return sum(stat.mean) / 3


def trim_letterbox(img: Image.Image, edge_threshold: float = 34.0) -> Image.Image:
    rgb = img.convert("RGB")
    w, h = rgb.size

    left = 0
    while left < int(w * 0.35) and column_mean(rgb, left) < edge_threshold:
        left += 1

    right = w - 1
    while right > int(w * 0.65) and column_mean(rgb, right) < edge_threshold:
        right -= 1

    top = 0
    while top < int(h * 0.35) and row_mean(rgb, top) < edge_threshold:
        top += 1

    bottom = h - 1
    while bottom > int(h * 0.65) and row_mean(rgb, bottom) < edge_threshold:
        bottom -= 1

    if right - left < w * 0.35 or bottom - top < h * 0.35:
        return rgb
    return rgb.crop((left, top, right + 1, bottom + 1))


def to_portrait_cover(img: Image.Image, target_ratio: float = 9 / 16) -> Image.Image:
    w, h = img.size
    current = w / h
    if abs(current - target_ratio) < 0.02:
        return img
    if current > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / target_ratio)
    top = (h - new_h) // 2
    return img.crop((0, top, w, top + new_h))


def enhance_and_save(img: Image.Image, dest: Path) -> None:
    sharp = ImageEnhance.Sharpness(img).enhance(1.1)
    contrast = ImageEnhance.Contrast(sharp).enhance(1.04)
    contrast.save(dest, format="JPEG", quality=96, optimize=True, subsampling=0)


def refine_file(path: Path, chrome: dict[str, float]) -> None:
    with Image.open(path) as img:
        trimmed = trim_letterbox(img)
        cropped = trimmed.crop(crop_box(trimmed.size, chrome))
        portrait = to_portrait_cover(cropped)
        enhance_and_save(portrait, path)


def refine_folder(folder: Path, chrome: dict[str, float]) -> list[str]:
    saved: list[str] = []
    for path in sorted(folder.glob("*.jpg")):
        refine_file(path, chrome)
        saved.append(path.name)
    return saved


def main() -> None:
    result = {
        "bahamas-2026": refine_folder(PUBLIC / "bahamas-2026", STORY_CHROME),
        "wedding-2025": refine_folder(PUBLIC / "wedding-2025", WEDDING_CHROME),
        "first-anniversary-2025": refine_folder(PUBLIC / "first-anniversary-2025", WEDDING_CHROME),
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
