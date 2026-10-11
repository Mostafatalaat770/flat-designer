"""Package only the new Group1B delivery and independent Group2 source preparation."""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path('design-development/whole-home-m3')
review = root / 'group1b'
folders = [review, root / 'group2-preparation']
excluded = {'Owner-Review-Package.zip', 'MANIFEST.json', 'PACKAGE.json'}
paths = sorted(p for folder in folders for p in folder.rglob('*')
               if p.is_file() and p.name not in excluded)
assert len(list((review / 'frames').glob('*.png'))) == 24
assert len(list(review.glob('*.svg'))) == 7
assert (folders[1] / 'SOURCE_BASELINE.json').exists()
assert (folders[1] / 'Source-Plan.svg').exists()
assert json.loads((review / 'BROWSER_VERIFICATION.json').read_text())['result'] == 'PASS'
entries = [{'path': p.relative_to(root).as_posix(), 'bytes': p.stat().st_size,
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]
manifest = {'schema': 'M3Group1BPackage/1',
            'archive_root': 'TypeB-M3',
            'open': 'group1b/Owner-Review.html', 'entries': entries}
(review / 'MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
paths.append(review / 'MANIFEST.json')
archive = review / 'Owner-Review-Package.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in sorted(paths):
        info = zipfile.ZipInfo('TypeB-M3/' + p.relative_to(root).as_posix(),
                               (2026, 10, 11, 12, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, p.read_bytes())
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for e in entries:
        blob = z.read('TypeB-M3/' + e['path'])
        assert len(blob) == e['bytes']
        assert hashlib.sha256(blob).hexdigest() == e['sha256']
    assert z.read('TypeB-M3/group1b/Owner-Review.html') == (review / 'Owner-Review.html').read_bytes()
    assert z.read('TypeB-M3/group2-preparation/SOURCE_BASELINE.json') == (folders[1] / 'SOURCE_BASELINE.json').read_bytes()
result = {'schema': 'M3Group1BZip/1', 'bytes': archive.stat().st_size,
          'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'entries': len(paths),
          'crc': 'PASS', 'content_hashes': 'PASS', 'offline_html_identity': 'PASS',
          'group2_source_identity': 'PASS'}
(review / 'PACKAGE.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
