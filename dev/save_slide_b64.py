"""Save CDP Page.captureScreenshot base64 data to bahamas-2026 folder."""
import base64
import hashlib
import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "assets" / "gongafit" / "anniversary" / "bahamas-2026"


def main() -> None:
    idx = int(sys.argv[1])
    b64 = sys.stdin.read().strip()
    OUT.mkdir(parents=True, exist_ok=True)
    data = base64.b64decode(b64)
    digest = hashlib.sha256(data).hexdigest()[:12]
    path = OUT / f"{idx:02d}.jpg"
    path.write_bytes(data)
    print(json.dumps({"idx": idx, "hash": digest, "bytes": len(data), "path": str(path)}))


if __name__ == "__main__":
    main()
