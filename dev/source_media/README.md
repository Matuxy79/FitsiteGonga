This folder holds stable working sources for anniversary media. The Bahamas files are restored from the repository revision before the aggressive crop pass; they are better than the current processed copies, but are still social-media-sized captures rather than camera originals. Replace them with original photo exports when available.

For clean originals, keep numbered `.jpg` files in `bahamas-2026`, `wedding-2025`, or `first-anniversary-2025`. The wedding and first-anniversary folders override the DOCX fallback; source files are copied as-is. The Bahamas script removes only the known capture borders from the currently preserved 476×578 captures.

Run `python dev/refine_bahamas_crops.py` or `python dev/reexport_anniversary_from_docx.py` to regenerate the public images. Both commands read only from this folder or the source DOCX and never crop generated files in place.
