from pathlib import Path
import json, hashlib, zipfile
root=Path('design-development/whole-home-m3/group1')
paths=sorted(p for p in root.rglob('*') if p.is_file() and p.name not in {'Owner-Review-Package.zip','MANIFEST.json','PACKAGE.json'})
entries=[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]
(root/'MANIFEST.json').write_text(json.dumps({'schema':'M3Group1Package/1','entries':entries},indent=2)+'\n')
paths.append(root/'MANIFEST.json');out=root/'Owner-Review-Package.zip'
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(paths):
  info=zipfile.ZipInfo('TypeB-M3-Group1/'+str(p.relative_to(root)),(2026,10,11,12,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,p.read_bytes())
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for e in entries:assert hashlib.sha256(z.read('TypeB-M3-Group1/'+e['path'])).hexdigest()==e['sha256']
 assert z.read('TypeB-M3-Group1/Owner-Review.html')==(root/'Owner-Review.html').read_bytes()
result={'schema':'M3Group1Zip/1','bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'entries':len(paths),'crc':'PASS','content_hashes':'PASS','offline_html_identity':'PASS'}
(root/'PACKAGE.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
