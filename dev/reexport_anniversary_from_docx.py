"""Re-export anniversary folders from docx originals with improved crops."""
from __future__ import annotations

import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "dev" / "anniverssary mode.docx"
PUBLIC = ROOT / "public" / "assets" / "gongafit" / "anniversary"

CROPS = {
    "story_screenshot": {"left": 0.045, "top": 0.025, "right": 0.045, "bottom": 0.195},
    "center_capture": {"left": 0.02, "top": 0.155, "right": 0.02, "bottom": 0.185},
}

FOLDER_MAP: dict[str, tuple[str, list[str]]] = {
    "wedding-2025": (
        "story_screenshot",
        [
            "image1.png",
            "image5.png",
            "image6.png",
            "image7.png",
            "image9.png",
            "image10.png",
        ],
    ),
    "first-anniversary-2025": ("story_screenshot", ["image2.png"]),
}


def crop_box(size: tuple[int, int], profile: dict[str, float]) -> tuple[int, int, int, int]:
    w, h = size
    left = int(w * profile["left"])
    top = int(h * profile["top"])
    right = w - int(w * profile["right"])
    bottom = h - int(h * profile["bottom"])
    return left, top, max(right, left + 1), max(bottom, top + 1)


def enhance_and_save(img: Image.Image, dest: Path) -> None:
    rgb = img.convert("RGB")
    sharp = ImageEnhance.Sharpness(rgb).enhance(1.08)
    contrast = ImageEnhance.Contrast(sharp).enhance(1.03)
    dest.parent.mkdir(parents=True, exist_ok=True)
    contrast.save(dest, format="JPEG", quality=96, optimize=True, subsampling=0)


def export_docx_folder(folder: str, profile_name: str, media_names: list[str]) -> list[str]:
    profile = CROPS[profile_name]
    out_dir = PUBLIC / folder
    if out_dir.exists():
        for old in out_dir.glob("*"):
            if old.is_file():
                old.unlink()
    saved: list[str] = []

    with zipfile.ZipFile(DOCX) as zf:
        for index, media_name in enumerate(media_names, start=1):
            src = f"word/media/{media_name}"
            with zf.open(src) as handle:
                with Image.open(handle) as img:
                    cropped = img.crop(crop_box(img.size, profile))
                    dest = out_dir / f"{index:02d}.jpg"
                    enhance_and_save(cropped, dest)
                    saved.append(dest.name)
    return saved


def clean_bahamas_captures() -> list[str]:
    out_dir = PUBLIC / "bahamas-2026"
    profile = CROPS["center_capture"]
    saved: list[str] = []
    for path in sorted(out_dir.glob("*.jpg")):
        with Image.open(path) as img:
            cropped = img.crop(crop_box(img.size, profile))
            enhance_and_save(cropped, path)
            saved.append(path.name)
    return saved


def main() -> None:
    result: dict[str, list[str]] = {}
    for folder, (profile, names) in FOLDER_MAP.items():
        result[folder] = export_docx_folder(folder, profile, names)
    result["bahamas-2026"] = clean_bahamas_captures()
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
