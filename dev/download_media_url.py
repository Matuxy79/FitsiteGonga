"""Download Instagram CDN media URLs (requires valid signed URL from logged-in session)."""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        dest.write_bytes(resp.read())


def main() -> None:
    url = sys.argv[1]
    dest = Path(sys.argv[2])
    download(url, dest)
    print(json.dumps({"saved": str(dest), "bytes": dest.stat().st_size}))


if __name__ == "__main__":
    main()
