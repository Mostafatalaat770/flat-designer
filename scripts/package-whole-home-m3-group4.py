from pathlib import Path
import json,hashlib,zipfile,base64,re
p=Path('design-development/whole-home-m3/group4')
name='Type-B-M3-Group4-Kitchen-Owner-Review.zip'
sha=lambda b:hashlib.sha256(b).hexdigest()
# Verify every actual image appears unmodified inside the self-contained review.
html=(p/'Owner-Review.html').read_text();frames=json.loads((p/'RENDER_EVIDENCE.json').read_text())['frames']
for f in frames:
 b=(p/'frames'/f['png']).read_bytes();assert sha(b)==f['png_sha256'];assert base64.b64encode(b).decode() in html
included=[f for f in p.rglob('*') if f.is_file() and f.suffix in ['.html','.svg','.json','.md','.log'] and f.name not in ['PACKAGE.json'] and not f.name.startswith('MANIFEST')]
# HTML contains PNGs; metadata stays inspectable without duplicated binary images in the ZIP.
manifest=''.join(sha(f.read_bytes())+'  '+str(f.relative_to(p))+'\n' for f in sorted(included))
(p/'MANIFEST.sha256').write_text(manifest);included.append(p/'MANIFEST.sha256')
with zipfile.ZipFile(p/name,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for f in included:z.writestr('TypeB-M3-Group4/'+str(f.relative_to(p)),f.read_bytes())
with zipfile.ZipFile(p/name) as z:
 assert z.testzip() is None
 for f in included:assert z.read('TypeB-M3-Group4/'+str(f.relative_to(p)))==f.read_bytes()
result={'schema':'M3Group4Package/1','zip':name,'zip_sha256':sha((p/name).read_bytes()),'zip_bytes':(p/name).stat().st_size,'html_bytes':(p/'Owner-Review.html').stat().st_size,'archive_files':len(included),'embedded_actual_pngs':len(frames),'crc_content_hashes':'PASS','offline':True}
(p/'PACKAGE.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
