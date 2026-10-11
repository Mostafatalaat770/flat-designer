"""One portable owner review, deterministic entry metadata, no circular hashes."""
from pathlib import Path
import hashlib, json, zipfile

root = Path('design-development/whole-home-m2')
paths = sorted(p for p in root.rglob('*') if p.is_file() and p.name not in {'Owner-Review-Package.zip', 'PACKAGE.json', 'MANIFEST.json'})
entries = [{'path': str(p.relative_to(root)), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]
(root / 'MANIFEST.json').write_text(json.dumps({'schema': 'M2OfflineManifest/1', 'entries': entries}, indent=2) + '\n')
paths.append(root / 'MANIFEST.json')
out = root / 'Owner-Review-Package.zip'
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(paths):
        info = zipfile.ZipInfo(str(path.relative_to(root)), (2026, 10, 11, 12, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, path.read_bytes())
with zipfile.ZipFile(out) as archive:
    assert archive.testzip() is None
    for entry in entries:
        assert hashlib.sha256(archive.read(entry['path'])).hexdigest() == entry['sha256']
    assert archive.read('Owner-Review.html') == (root / 'Owner-Review.html').read_bytes()
result = {'schema': 'M2OfflinePackage/1', 'filename': out.name, 'bytes': out.stat().st_size, 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(), 'entries': len(paths), 'crc': 'PASS', 'entry_hashes': 'PASS', 'standalone_html_identity': 'PASS'}
(root / 'PACKAGE.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
