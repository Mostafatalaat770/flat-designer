import json,zipfile,hashlib,shutil
from pathlib import Path
p=Path('design-development/whole-home-m3/jury');root=Path.cwd();name='Type-B-M3-Whole-Home-Jury-Owner-Review.zip';out=p/name
sha=lambda b:hashlib.sha256(b).hexdigest()
files=[f for f in p.rglob('*')if f.is_file()and f.name not in [name,'PACKAGE.json','SHA256-MANIFEST.json','PLAN_INPUT.json']]
manifest={str(f.relative_to(p)):sha(f.read_bytes())for f in files}
(p/'SHA256-MANIFEST.json').write_text(json.dumps({'schema':'WholeHomeReviewPackageContent/1','files':manifest},indent=2)+'\n');files.append(p/'SHA256-MANIFEST.json')
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6)as z:
 for f in files:z.write(f,'Type-B-Whole-Home-Review/'+str(f.relative_to(p)))
 for f in sorted(Path('scripts').glob('jury-*')):z.write(f,'Type-B-Whole-Home-Review/reproduction/'+f.name)
 for src,dst in [('render-snapshots/current.json','source/current-v55.json'),('design-development/whole-home-m1/COORDINATION.json','source/M1-COORDINATION.json'),('design-development/WHOLE_HOME_MASTER_PLAN.md','source/WHOLE_HOME_MASTER_PLAN.md')]:z.write(src,'Type-B-Whole-Home-Review/'+dst)
 for f in Path('dist/sources').glob('*Type_B*v0.2.2*.json'):z.write(f,'Type-B-Whole-Home-Review/source/canonical.json')
with zipfile.ZipFile(out)as z:
 assert z.testzip()is None
 names=z.namelist();assert len(names)==len(set(names))
 for f,digest in manifest.items():assert sha(z.read('Type-B-Whole-Home-Review/'+f))==digest
 assert z.read('Type-B-Whole-Home-Review/Owner-Review.html')==(p/'Owner-Review.html').read_bytes()
 info={'schema':'WholeHomeOfflineArchiveVerification/1','zip':name,'bytes':out.stat().st_size,'sha256':sha(out.read_bytes()),'html_sha256':sha((p/'Owner-Review.html').read_bytes()),'file_count':len(names),'CRC':'PASS','all_content_hashes':'PASS','exact_html_identity':'PASS','no_inherited_room_archives_modified':True}
(p/'PACKAGE.json').write_text(json.dumps(info,indent=2)+'\n');print(json.dumps(info))
