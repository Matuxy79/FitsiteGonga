"""Extract base64 JPEG from CDP Page.captureScreenshot log JSON and save as slide N."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    log_path = Path(sys.argv[1])
    idx = int(sys.argv[2])
    payload = json.loads(log_path.read_text(encoding="utf-8"))
    b64 = payload.get("data") or payload.get("result", {}).get("data")
    if not b64:
        raise SystemExit(f"No image data in {log_path}")
    proc = subprocess.run(
        [sys.executable, str(ROOT / "dev" / "save_slide_b64.py"), str(idx)],
        input=b64,
        text=True,
        capture_output=True,
        check=True,
    )
    print(proc.stdout.strip())


if __name__ == "__main__":
    main()
