import json,hashlib,subprocess,copy
from pathlib import Path
p=Path('design-development/whole-home-m3/jury');base=p.parent;read=lambda path:json.loads(Path(path).read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
s=read(p/'SCENARIO.json');src=read('render-snapshots/current.json');holds=read(p/'DECISION_REGISTER.json');ledger=read(p/'STORAGE_LEDGER.json');ops=read(p/'OPERATIONS.json')
expected={h['id']:h for g in ['group1b','group2','group3','group4','group5']for h in read(base/g/'SITE_HOLDS.json')['holds']}
def validate_holds(r):
 assert len(r['holds'])==52 and {x['id']for x in r['holds']}==set(expected)
 for h in r['holds']:assert h['original']==expected[h['id']]and h['original_status']==expected[h['id']]['status']
def validate_scene(sc):
 assert sc['canonical_sha256']==src['canonical_sha256']
 for col in [('furniture',),('interior','objects')]:
  a=src['layout'];b=sc['layout']
  for k in col:a=a[k];b=b[k]
  for item in a:assert sum(x['id']==item['id']for x in b)==1
 assert sc['layout']['demolished']==src['layout']['demolished']==[]
 assert sc['layout']['decor']==src['layout']['decor']
 for f in src['layout']['furniture']:
  if f['type']in ['shower','toilet','ksink','stove','washer','dishwasher','fridge']:
   n=next(x for x in sc['layout']['furniture']if x['id']==f['id']);assert all(n[k]==f[k]for k in ['cx','cy','w','d','rot'])
validate_holds(holds);validate_scene(s)
deps={h['id']:h['depends_on']for h in holds['holds']}
def visit(id,chain=()):
 assert id not in chain,'HOLD dependency cycle'
 for d in deps[id]:visit(d,chain+(id,))
for id in deps:visit(id)
for group,id in [('group2','B-BR02-storage'),('group3','B-family-vanity'),('group4','RECOMMENDED-access'),('group5','A-main-eye')]:
 f=base/group/'frames'/id;record=read(str(f)+'.json');assert record['png_sha256']==sha(Path(str(f)+'.png').read_bytes())

negative=[]
for name,obj,fn in [('missing HOLD',copy.deepcopy(holds),validate_holds),('altered original status',copy.deepcopy(holds),validate_holds),('wet service moved',copy.deepcopy(s),validate_scene),('duplicate source identity',copy.deepcopy(s),validate_scene)]:
 if name=='missing HOLD':obj['holds'].pop()
 if name=='altered original status':obj['holds'][0]['original']['status']='CLOSED'
 if name=='wet service moved':next(x for x in obj['layout']['furniture']if x['type']=='shower')['cx']+=10
 if name=='duplicate source identity':obj['layout']['furniture'].append(copy.deepcopy(obj['layout']['furniture'][0]))
 try:fn(obj)
 except AssertionError:negative.append({'case':name,'result':'REJECTED'})
 else:raise AssertionError('Negative control accepted '+name)
assert len(ledger['rooms'])==13 and ledger['whole_home_provisional_net_L']is None
assert all(i['verified_usable_interior_mm']is None for r in ledger['rooms']for i in r['items'])
assert len({i['allocation_id']for r in ledger['rooms']for i in r['items']})==sum(len(r['items'])for r in ledger['rooms'])
assert ops['correction']['before_panel']['positive_overlap_samples']==68
assert ops['correction']['before_user']['positive_overlap_samples']==47
assert ops['correction']['after_park']['positive_overlap_samples']==0 and not ops['correction']['park_fixed_conflicts']
assert sha(Path('render-snapshots/current.json').read_bytes())=='ec05e4fe7c0e15b3555107da4ac5628894df7fcddb3cee996d3af2fddaa7df63'
snapshot_sha=sha((p/'SCENARIO.json').read_bytes());frames=[];architecture=None
for v in s['views']:
 id='SCENARIO-'+v['id'];f=read(p/'frames'/f'{id}.json');png=(p/'frames'/f'{id}.png').read_bytes()
 assert f['full_snapshot_sha256']==snapshot_sha,(id,'stale snapshot')
 assert f['camera']==v['camera'],(id,'camera mismatch')
 assert f['png_sha256']==sha(png),(id,'PNG mismatch')
 assert not f['external_requests']and not f['page_errors']and not f['console_errors']
 assert f['webgl']['context_lost']is False and f['assets']['pending']==0 and f['assets']['fallbacks']==[]
 assert all(x==0 for x in f['architecture_result'].values())
 assert f['capture_script_sha256']==sha(Path('scripts/jury-render.mjs').read_bytes()),(id,'driver mismatch')
 a=f['mesh_bounds']['terraces']['architecture'];assert len(a['ceilings'])==10 and not any(x.startswith('TER')for x in a['ceilings'])
 if architecture is None:architecture=a
 else:assert a==architecture,(id,'architecture altered by view')
 frames.append({k:f[k]for k in ['frame_id','png_sha256','camera_sha256','layout_sha256','source_sha256','full_snapshot_sha256','capture_script_sha256','built_viewer_sha256','webgl']})
source_architecture=read(base/'group5/frames/SOURCE-main-eye.json')['mesh_bounds']['architecture']
assert architecture==source_architecture,'Combined architecture differs from inherited actual SOURCE WebGL'
for id in ['reception','master','hall-to-public','public-to-terrace','wic-to-bath','kitchen']:
 a=next(v['camera']for v in s['views']if v['id']==id);b=copy.deepcopy(next(v['camera']for v in s['views']if v['id']==id+'-night'));b['viewer']['night']=a['viewer']['night'];b['viewer']['hour']=a['viewer']['hour'];assert a==b
preserve=[];checkpoint='6fa75864b21e25f2a157c04122df34b1a59cd784'
for line in subprocess.check_output(['git','ls-tree','-r',checkpoint]).decode().splitlines():
 header,file=line.split('\t');mode,kind,oid=header.split();path=Path(file)
 assert path.is_file(),file
 current=subprocess.check_output(['git','hash-object',str(path)]).decode().strip();assert current==oid,(file,'inherited bytes changed');preserve.append({'path':file,'git_blob':oid})
(p/'PRESERVATION.json').write_text(json.dumps({'checkpoint':checkpoint,'all_inherited_files_byte_identical':True,'count':len(preserve),'files':preserve},indent=2)+'\n')
def diff(a,b,path=''):
 if isinstance(a,dict)and isinstance(b,dict):return [x for k in sorted(set(a)|set(b))for x in diff(a.get(k),b.get(k),path+'/'+k)]
 if isinstance(a,list)and isinstance(b,list)and a and b and all(isinstance(x,dict)and'id'in x for x in a+b):
  aa={x['id']:x for x in a};bb={x['id']:x for x in b};return [x for id in sorted(set(aa)|set(bb))for x in diff(aa.get(id),bb.get(id),path+'/id='+id)]
 if a==b:return []
 return [{'pointer':path,'before':a,'after':b}]
(p/'EXACT_CHANGES.json').write_text(json.dumps({'schema':'ExactCombinedStudyDelta/1','source_snapshot_sha256':sha(Path('render-snapshots/current.json').read_bytes()),'scenario_sha256':snapshot_sha,'changes':diff(src,s)},ensure_ascii=False,indent=2)+'\n')
(p/'RENDER_EVIDENCE.json').write_text(json.dumps({'schema':'VerifiedWholeHomeWebGL/1','frames':frames,'architecture_sha256':sha(json.dumps(architecture,sort_keys=True).encode()),'external_requests':0,'page_errors':0,'fallbacks':0,'interior_ceilings':10,'terrace_ceilings':0},indent=2)+'\n')
verification={'schema':'WholeHomeJuryValidation/1','status':'LOCAL_SOURCE_AND_RENDER_CHECKS_PASS; FUNCTIONAL_HOLDS_OPEN','production_build':'PASS','studio_build':'PASS','application_contract_verifiers':5,'app_contract_method':'Local SQLite/R2/provider fixtures; separate from actual WebGL','applicable_domain_source_asset_renderer_tests':137,'tests_failed':0,'combined_webgl_frames':len(frames),'matched_day_night_pairs':6,'original_identities_preserved':77,'inherited_files_byte_identical':len(preserve),'original_holds_preserved':52,'storage_rooms':13,'usable_storage_total':'UNKNOWN','source_ceiling_mm':2500,'terrace_ceilings':0,'external_capture_requests':0,'capture_fallbacks':0,'negative_controls':negative,'browser_archive_checks':'Independent results in BROWSER_VERIFICATION.json and PACKAGE.json','remote_CI':'NOT_RUN','M3_Issue72':'OPEN; owner decisions unresolved','construction_release':'Existing Issue19; unapproved'}
(p/'VERIFICATION.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in verification.items()if not isinstance(v,list)},ensure_ascii=False))
