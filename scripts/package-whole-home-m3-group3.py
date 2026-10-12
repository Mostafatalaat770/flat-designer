"""Single offline owner ZIP, with embedded-image identity, CRC and content checks."""
import base64,hashlib,json,pathlib,re,zipfile
root=pathlib.Path('design-development/whole-home-m3/group3')
digest=lambda b:hashlib.sha256(b).hexdigest()
html=(root/'Owner-Review.html').read_text()
match=re.search(r'const IMAGES=(\{.*?\}),PLANS=',html,re.S)
images=json.loads(match.group(1));evidence=json.loads((root/'RENDER_EVIDENCE.json').read_text())
assert len(images)==len(evidence['frames'])==27
for f in evidence['frames']:
 raw=base64.b64decode(images[f['frame_id']].split(',',1)[1]);assert digest(raw)==f['png_sha256'];assert raw==(root/'frames'/f['png']).read_bytes()
files=[p for p in root.iterdir() if p.is_file() and p.suffix in ['.html','.json','.md'] and p.name not in ['PACKAGE.json','SHA256-MANIFEST.json']]
files+=list((root/'plans').glob('*.svg'))+list((root/'verification').glob('*.log'))
archive=root/'Type-B-M3-Group3-Bathrooms-Owner-Review.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files):z.write(p,p.relative_to(root))
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert z.read('Owner-Review.html')==(root/'Owner-Review.html').read_bytes()
 for p in files:assert z.read(str(p.relative_to(root)))==p.read_bytes()
manifest={str(p.relative_to(root)):digest(p.read_bytes()) for p in sorted(root.rglob('*')) if p.is_file() and p.name not in ['SHA256-MANIFEST.json','PACKAGE.json']}
(root/'SHA256-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
package={'schema':'M3Group3OfflinePackage/1','zip':archive.name,'bytes':archive.stat().st_size,'sha256':digest(archive.read_bytes()),'crc':'PASS','html_sha256':digest((root/'Owner-Review.html').read_bytes()),'embedded_pngs':27,'measured_svg_plans':14,'files':len(files),'png_identity':'All27 embedded PNG bytes match individually recorded actual canvases','frames_in_zip':'Embedded once in HTML. Individual PNGs and source texture swatches remain in repository; no duplicated27-frame binary set.','status':'LOCAL_REVIEW_ONLY / all physical and owner approvals false'}
(root/'PACKAGE.json').write_text(json.dumps(package,indent=2)+'\n')
print(json.dumps(package,indent=2))
