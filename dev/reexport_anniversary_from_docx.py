"""Regenerate anniversary media from stable sources without re-cropping outputs."""
from __future__ import annotations

import json
import shutil
import zipfile
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "dev" / "anniverssary mode.docx"
SOURCE_MEDIA = ROOT / "dev" / "source_media"
PUBLIC = ROOT / "public" / "assets" / "gongafit" / "anniversary"

CROPS = {
    "story_screenshot": {"left": 0.045, "top": 0.025, "right": 0.045, "bottom": 0.195},
}

BAHAMAS_SOURCE = ROOT / "dev" / "source_media" / "bahamas-2026"
BAHAMAS_TRIMS: dict[str, tuple[float, float, float, float]] = {
    # These two captures have gray letterbox panels above and below the photo.
    "04.jpg": (0, 120 / 578, 1, 489 / 578),
    "07.jpg": (0, 120 / 578, 1, 489 / 578),
    # This capture has narrow gray gutters at both sides.
    "05.jpg": (15 / 476, 0, 461 / 476, 1),
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


def export_user_sources(folder: str) -> list[str] | None:
    source_dir = SOURCE_MEDIA / folder
    sources = sorted(source_dir.glob("*.jpg")) if source_dir.exists() else []
    if not sources:
        return None

    out_dir = PUBLIC / folder
    out_dir.mkdir(parents=True, exist_ok=True)
    for path in sources:
        shutil.copy2(path, out_dir / path.name)
    return [path.name for path in sources]


def export_docx_folder(folder: str, profile_name: str, media_names: list[str]) -> list[str]:
    user_sources = export_user_sources(folder)
    if user_sources is not None:
        return user_sources

    profile = CROPS[profile_name]
    out_dir = PUBLIC / folder
    out_dir.mkdir(parents=True, exist_ok=True)
    expected_names = {f"{index:02d}.jpg" for index in range(1, len(media_names) + 1)}
    for old in out_dir.glob("*.jpg"):
        if old.name not in expected_names and old.stat().st_size == 0:
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


def export_bahamas_sources() -> list[str]:
    out_dir = PUBLIC / "bahamas-2026"
    out_dir.mkdir(parents=True, exist_ok=True)
    if not BAHAMAS_SOURCE.exists():
        raise FileNotFoundError(
            f"Stable Bahamas sources not found at {BAHAMAS_SOURCE}. "
            "Restore source media there before regenerating assets."
        )

    saved: list[str] = []
    for path in sorted(BAHAMAS_SOURCE.glob("*.jpg")):
        dest = out_dir / path.name
        crop = BAHAMAS_TRIMS.get(path.name)
        with Image.open(path) as source:
            source_size = source.size
        if crop is None or source_size != (476, 578):
            shutil.copy2(path, dest)
            saved.append(dest.name)
            continue

        with Image.open(path) as img:
            width, height = img.size
            box = (
                int(width * crop[0]),
                int(height * crop[1]),
                int(width * crop[2]),
                int(height * crop[3]),
            )
            cropped = img.crop(box)
            dest.parent.mkdir(parents=True, exist_ok=True)
            cropped.convert("RGB").save(
                dest,
                format="JPEG",
                quality=98,
                optimize=True,
                subsampling=0,
            )
        saved.append(dest.name)
    return saved


def main() -> None:
    result: dict[str, list[str]] = {}
    for folder, (profile, names) in FOLDER_MAP.items():
        result[folder] = export_docx_folder(folder, profile, names)
    result["bahamas-2026"] = export_bahamas_sources()
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
