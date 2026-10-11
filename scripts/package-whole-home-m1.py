"""One deterministic, self-contained owner-review archive; never edits source scenes."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root = Path('design-development/whole-home-m1')
archive = root / 'Owner-Review-Package.zip'
excluded = {'Owner-Review-Package.zip', 'DELIVERY_SHA256.json', 'PACKAGE_SHA256.txt'}
files = sorted(p for p in root.rglob('*') if p.is_file() and p.name not in excluded)
required = {'Owner-Review.html', 'A15_DISPOSITION.csv', 'A15_DISPOSITION.json',
            'FIRST_FIX_ISSUES.csv', 'FIRST_FIX_ISSUES.json', 'COORDINATION.json',
            '01-Power-Controls.svg', '02-Lighting-RCP.svg', '03-HVAC-Services.svg',
            '04-Floors-Thresholds.svg', 'SOURCE_LOCK.json', 'README.md',
            'VALIDATION.md', 'BROWSER_VALIDATION.json', 'VISUAL_REVIEW.md'}
assert required.issubset({p.name for p in files})
sha = lambda b: hashlib.sha256(b).hexdigest()
manifest = {str(p.relative_to(root)): sha(p.read_bytes()) for p in files}
(root / 'DELIVERY_SHA256.json').write_text(json.dumps(manifest, indent=2) + '\n')
files.append(root / 'DELIVERY_SHA256.json')
with ZipFile(archive, 'w', compression=ZIP_DEFLATED, compresslevel=9) as zipped:
    for p in sorted(files):
        info = ZipInfo('TypeB-M1/' + str(p.relative_to(root)), (2026, 10, 11, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        zipped.writestr(info, p.read_bytes())
with ZipFile(archive) as zipped:
    assert zipped.testzip() is None
    for name, digest in manifest.items():
        assert sha(zipped.read('TypeB-M1/' + name)) == digest
    html = zipped.read('TypeB-M1/Owner-Review.html').decode('utf-8')
    assert 'script src=' not in html and '<img' not in html and '<iframe' not in html
    report = json.loads(zipped.read('TypeB-M1/BROWSER_VALIDATION.json'))
    assert report['html_sha256'] == sha(html.encode('utf-8'))
    assert report['checked_views'] == 130 and report['network_requests'] == []
    assert report['visual_review_status'] == 'PASS_AGENT_VISUAL_INSPECTION'
(root / 'PACKAGE_SHA256.txt').write_text(sha(archive.read_bytes()) + '  Owner-Review-Package.zip\n')
print(json.dumps({'result': 'PASS', 'archive': str(archive), 'files': len(files),
                  'bytes': archive.stat().st_size, 'sha256': sha(archive.read_bytes())}))
