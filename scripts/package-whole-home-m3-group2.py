"""Package verified offline owner review; images embedded, evidence and source included."""
from pathlib import Path
import hashlib,json,re,zipfile,base64
root=Path('design-development/whole-home-m3/group2')
sha=lambda b:hashlib.sha256(b).hexdigest()
browser=json.loads((root/'BROWSER_VERIFICATION.json').read_text())
checks=json.loads((root/'LOCAL_VERIFICATION.json').read_text())
assert browser['result']=='PASS' and checks['result']=='PASS'
html=(root/'Owner-Review.html').read_bytes()
assert browser['html_sha256']==sha(html)
assert checks['html_sha256']==sha(html)
assert checks['focused_test_sha256']==sha(Path('scripts/whole-home-m3-group2.test.mjs').read_bytes())
assert checks['render_evidence_sha256']==sha((root/'RENDER_EVIDENCE.json').read_bytes())
evidence=json.loads((root/'RENDER_EVIDENCE.json').read_text())
assets=json.loads(re.search(rb'const assets=(\{.*?\});const cameras=',html,re.S).group(1))
assert len(evidence['frames'])==22
for f in evidence['frames']:
    assert sha(base64.b64decode(assets[f['frame_id']].split(',',1)[1]))==f['png_sha256']
files={p.relative_to(root).as_posix():p.read_bytes() for p in root.rglob('*') if p.is_file() and p.suffix not in ('.zip','.png') and p.name not in ('PACKAGE.json','SHA256-MANIFEST.json')}
for p in (root/'m3assets').glob('*.png'): files[p.relative_to(root).as_posix()]=p.read_bytes()
files['source/current-v55.json']=Path('render-snapshots/current.json').read_bytes()
files['source/canonical-v0.2.2.json']=Path('dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json').read_bytes()
assert sha(files['source/current-v55.json'])==checks['source_sha256']
assert sha(files['source/canonical-v0.2.2.json'])==checks['canonical_sha256']
files['source/Group1B-SITE_HOLDS.json']=Path('design-development/whole-home-m3/group1b/SITE_HOLDS.json').read_bytes()
manifest={'schema':'M3Group2PackageManifest/1','files':[{'path':k,'sha256':sha(v),'bytes':len(v)} for k,v in sorted(files.items())],'embedded_pngs':[{'id':f['frame_id'],'sha256':f['png_sha256']} for f in evidence['frames']],'raw_pngs':'Embedded in Owner-Review.html; original files and matching sidecars also retained in repository.'}
manifestBytes=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
(root/'SHA256-MANIFEST.json').write_bytes(manifestBytes)
files['SHA256-MANIFEST.json']=manifestBytes
out=root/'Type-B-M3-Group2-Owner-Review.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for name,content in sorted(files.items()):
        info=zipfile.ZipInfo(name,date_time=(2026,10,11,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16
        z.writestr(info,content,compresslevel=9)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    assert set(z.namelist())==set(files)
    for item in manifest['files']: assert sha(z.read(item['path']))==item['sha256']
record={'schema':'M3Group2Package/1','result':'PASS','zip':out.name,'sha256':sha(out.read_bytes()),'bytes':out.stat().st_size,'entries':len(files),'embedded_webgl_pngs':22,'svg_plans':17,'html_sha256':sha(html),'manifest_sha256':sha(manifestBytes),'offline':True,'owner_approved':False}
(root/'PACKAGE.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
