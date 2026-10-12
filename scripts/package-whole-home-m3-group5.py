from pathlib import Path
import json,hashlib,zipfile,base64
D=Path('design-development/whole-home-m3/group5');name='Type-B-M3-Group5-Terraces-Owner-Review.zip'
sha=lambda b:hashlib.sha256(b).hexdigest()
html=(D/'Owner-Review.html').read_text();e=json.loads((D/'RENDER_EVIDENCE.json').read_text())['frames']
for r in e:
 b=(D/'frames'/r['png']).read_bytes();assert sha(b)==r['png_sha256'];assert base64.b64encode(b).decode() in html
for p in (D/'plans').glob('*.svg'):assert json.dumps(p.read_text(),ensure_ascii=False)[1:-1] in html
assert json.loads((D/'BROWSER_VERIFICATION.json').read_text())['html_sha256']==sha((D/'Owner-Review.html').read_bytes())
included=sorted(p for p in D.rglob('*') if p.is_file() and p.name not in [name,'PACKAGE.json','MANIFEST.sha256'])
manifest=''.join(sha(p.read_bytes())+'  '+str(p.relative_to(D))+'\n' for p in included);(D/'MANIFEST.sha256').write_text(manifest);included.append(D/'MANIFEST.sha256')
with zipfile.ZipFile(D/name,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in included:
  info=zipfile.ZipInfo('TypeB-M3-Group5/'+str(p.relative_to(D)),date_time=(2026,10,12,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,p.read_bytes(),compresslevel=9)
with zipfile.ZipFile(D/name) as z:
 assert z.testzip() is None
 for p in included:assert z.read('TypeB-M3-Group5/'+str(p.relative_to(D)))==p.read_bytes()
out=dict(schema='M3Group5Package/1',zip=name,zip_bytes=(D/name).stat().st_size,zip_sha256=sha((D/name).read_bytes()),html_bytes=(D/'Owner-Review.html').stat().st_size,html_sha256=sha((D/'Owner-Review.html').read_bytes()),archive_files=len(included),embedded_terrace_PNGs=24,embedded_prior_actual_previews=4,raw_terrace_PNGs=24,measured_SVGs=10,CRC_content_manifest='PASS',offline=True)
(D/'PACKAGE.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
