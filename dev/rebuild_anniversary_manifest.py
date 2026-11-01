"""Rebuild anniversary manifest from cleaned assets on disk."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets" / "gongafit" / "anniversary"


def media_slides(folder: Path, chapter: str, caption: str, id_prefix: str) -> list[dict]:
    slides: list[dict] = []
    for path in sorted(folder.iterdir()):
        if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".mp4", ".webm"}:
            continue
        rel = f"/assets/gongafit/anniversary/{folder.name}/{path.name}"
        is_video = path.suffix.lower() in {".mp4", ".webm"}
        slides.append(
            {
                "id": f"{id_prefix}-{path.stem}",
                "type": "video" if is_video else "image",
                "chapter": chapter,
                "src": rel,
                "durationMs": 15000 if is_video else 4500,
                "caption": caption,
            }
        )
    return slides


def main() -> None:
    slides: list[dict] = [
        {
            "id": "creators-intro",
            "type": "creators",
            "chapter": "bahamas",
            "durationMs": 7000,
            "caption": "Mr & Mrs Mrisho",
            "subtitle": "GongaFit creators · @mrs_mrishom & @mr_mrisho07",
            "src": "/assets/gongafit/anniversary/wedding-2025/01.jpg",
        },
        {
            "id": "bahamas-title",
            "type": "title",
            "chapter": "bahamas",
            "durationMs": 5500,
            "caption": "Bahamas mode",
        },
    ]
    slides.extend(
        media_slides(PUBLIC / "wedding-2025", "wedding", "2025 — Our wedding", "wedding")
    )
    slides.extend(
        media_slides(PUBLIC / "first-anniversary-2025", "first", "First anniversary", "first")
    )
    slides.extend(
        media_slides(
            PUBLIC / "bahamas-2026",
            "bahamas",
            "Second anniversary — Bahamas BS",
            "bahamas",
        )
    )
    slides.append(
        {
            "id": "handoff",
            "type": "handoff",
            "chapter": "handoff",
            "durationMs": 4000,
            "caption": "Welcome to GongaFit",
        }
    )

    manifest = {"version": 1, "slides": slides}
    for target in (
        PUBLIC / "manifest.json",
        ROOT / "src" / "data" / "anniversaryManifest.json",
    ):
        target.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps({"slides": len(slides), "bahamas": len(list((PUBLIC / "bahamas-2026").glob("*")))}))


if __name__ == "__main__":
    main()
