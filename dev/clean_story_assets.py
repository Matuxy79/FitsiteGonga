"""Crop Instagram story chrome (headers, reply/repost bars) from anniversary assets."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets" / "gongafit" / "anniversary"

# Fractions tuned for IG story UI + our center-frame captures.
CROPS = {
    "story_screenshot": {"left": 0.07, "top": 0.04, "right": 0.07, "bottom": 0.17},
    "center_capture": {"left": 0.03, "top": 0.12, "right": 0.03, "bottom": 0.14},
}


def crop_box(size: tuple[int, int], profile: dict[str, float]) -> tuple[int, int, int, int]:
    w, h = size
    left = int(w * profile["left"])
    top = int(h * profile["top"])
    right = w - int(w * profile["right"])
    bottom = h - int(h * profile["bottom"])
    return left, top, max(right, left + 1), max(bottom, top + 1)


def clean_file(path: Path, profile_name: str, out_path: Path | None = None) -> Path:
    profile = CROPS[profile_name]
    out = out_path or path
    with Image.open(path) as img:
        rgb = img.convert("RGB")
        cropped = rgb.crop(crop_box(rgb.size, profile))
        target = out.with_suffix(".jpg")
        cropped.save(target, format="JPEG", quality=92, optimize=True)
        if out.suffix.lower() != ".jpg" and out.exists() and out != target:
            out.unlink(missing_ok=True)
        if path != target and path.exists() and path.suffix.lower() != ".jpg":
            path.unlink(missing_ok=True)
        return target


def clean_folder(folder: Path, profile_name: str) -> list[str]:
    saved: list[str] = []
    for path in sorted(folder.glob("*")):
        if path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        target = clean_file(path, profile_name)
        saved.append(target.name)
    return saved


def main() -> None:
    wedding = clean_folder(PUBLIC / "wedding-2025", "story_screenshot")
    first = clean_folder(PUBLIC / "first-anniversary-2025", "story_screenshot")
    bahamas = clean_folder(PUBLIC / "bahamas-2026", "center_capture")
    print(
        json.dumps(
            {
                "wedding": wedding,
                "first_anniversary": first,
                "bahamas": bahamas,
            }
        )
    )


if __name__ == "__main__":
    main()
