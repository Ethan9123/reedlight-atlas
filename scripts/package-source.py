"""Build a deterministic convenience ZIP; this is not a transcript or official Git bundle."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import hashlib
root = Path(__file__).resolve().parent.parent
out = root / 'release' / 'reedlight-source.zip'
out.parent.mkdir(exist_ok=True)
paths = [root / p for p in ['README.md', 'LICENSE', 'package.json', 'main.ts', '.gitignore']]
for folder in ['game', 'vendor', 'screenshots', 'tests', 'scripts', 'docs']:
    paths += sorted(p for p in (root / folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
entries = {p.relative_to(root).as_posix(): p.read_bytes() for p in paths}
entries['reedlight-offline.html'] = (root / 'dist/downloads/reedlight-offline.html').read_bytes()
with ZipFile(out, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for name, data in sorted(entries.items()):
        info = ZipInfo(name, date_time=(2026, 11, 18, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, data, compress_type=ZIP_DEFLATED, compresslevel=9)
print(f'{out.name}: {out.stat().st_size} bytes, sha256 {hashlib.sha256(out.read_bytes()).hexdigest()}')
