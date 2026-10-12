/** One provisional 13-space scenario, source-ID and field based; no saved scene writes. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
export const dir='design-development/whole-home-m3/jury';
export const checkpoint='6fa75864b21e25f2a157c04122df34b1a59cd784';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const read=p=>JSON.parse(fs.readFileSync(p));
export const source=read('render-snapshots/current.json');
export const domain=createApartmentDomain(process.cwd());
export const root='design-development/whole-home-m3';
const load=(g,k)=>read(`${root}/${g}/${k}.json`);
const b1=load('group1b','B2'),b2=load('group2','B'),a2=load('group2','A'),b3=load('group3','B'),b4=load('group4','RECOMMENDED'),a5=load('group5','A'),b5=load('group5','B');
const picks=[['group1b/B2',['RECP-01','HALL-01'],b1],['group2/A',['MBR-01'],a2],['group2/B',['BR-01','BR-02','WIC-01'],b2],['group3/B',['BATH-M01','BATH-C01','WC-01'],b3],['group4/RECOMMENDED',['KIT-01'],b4],['group5/A',['TER-MAIN','TER-MBR'],a5],['group5/B',['TER-SVC'],b5]];
export function build(){
 const s=structuredClone(source),changes=[],conflicts=[],ignored=[];
 s.name='Type B · one whole-home jury study / UNAPPROVED';s.schema='ApartmentRenderSnapshot/1';
 const assignment=new Map();
 for(const [input,rooms,q]of picks){
  for(const collection of ['furniture','interior.objects']){
   const get=t=>collection==='furniture'?t.layout.furniture:t.layout.interior.objects;
   for(const proposed of get(q).filter(x=>rooms.includes(x.room_id))){
    const target=get(s),old=target.find(x=>x.id===proposed.id),base=get(source).find(x=>x.id===proposed.id);
    assert.ok(!old||old.room_id===proposed.room_id,'cross-room ID relocation');
    if(!old){target.push(structuredClone(proposed));changes.push({input,collection,id:proposed.id,room:proposed.room_id,kind:'ADD',value:proposed});continue;}
    for(const field of new Set([...Object.keys(old),...Object.keys(proposed)])){
     if(JSON.stringify(base?.[field])===JSON.stringify(proposed[field]))continue;
     const slot=`${collection}/${proposed.id}/${field}`;
     if(assignment.has(slot)&&JSON.stringify(old[field])!==JSON.stringify(proposed[field]))conflicts.push({slot,prior:assignment.get(slot),incoming:input,resolution:'EXPLICIT_ROOM_SELECTION'});
     changes.push({input,collection,id:proposed.id,room:proposed.room_id,field,before:old[field]??null,after:proposed[field]??null});
     if(field in proposed)old[field]=structuredClone(proposed[field]);else delete old[field];assignment.set(slot,input);
    }
   }
  }
  for(const rid of rooms){s.layout.rooms[rid]=structuredClone(q.layout.rooms[rid]);if(q.layout.studio.rooms[rid])s.layout.studio.rooms[rid]=structuredClone(q.layout.studio.rooms[rid]);}
  const materialMap={};
  for(const m of q.layout.interior.materials){const old=s.layout.interior.materials.find(x=>x.id===m.id);if(!old){s.layout.interior.materials.push(structuredClone(m));materialMap[m.id]=m.id;}else if(JSON.stringify(old)!==JSON.stringify(m)){const id=`jury-${input.replaceAll('/','-')}-${m.id}`;s.layout.interior.materials.push({...structuredClone(m),id});materialMap[m.id]=id;conflicts.push({slot:'material/'+m.id,input,resolution:'NAMESPACE_PROPOSED_RECORD; no shared-source material recolour',replacement:id});}else materialMap[m.id]=m.id;}
  for(const [id,m]of Object.entries(q.layout.interior.surface_materials))if(rooms.some(r=>id.includes(r)))s.layout.interior.surface_materials[id]=materialMap[m]||m;
  for(const [id,t]of Object.entries(q.layout.interior.opening_treatments)){const o=domain.model.openings.find(o=>o.id===id);if(o?.between.some(r=>rooms.includes(r)))s.layout.interior.opening_treatments[id]=structuredClone(t);}
  ignored.push({input,ignored_global:['decor themes and saved colours','demolition','views/door states','source scene identity'],scope:rooms});
 }
 // Explicit shared floor selection avoids the two different records called m3g2-wood.
 const floor=structuredClone(b1.layout.interior.materials.find(m=>m.id==='m3-wood'));floor.id='jury-shared-oak';floor.name='Shared warm oak direction / sample and site assembly HOLD';
 s.layout.interior.materials.push(floor);
 for(const rid of ['RECP-01','HALL-01','MBR-01','BR-01','BR-02','WIC-01'])s.layout.interior.surface_materials['FLOOR-'+rid]=floor.id;
 const ivory={schema:'InteriorMaterial/1',id:'jury-ivory-plaster',name:'Warm ivory matte paint direction / sample HOLD',category:'paint',source_status:'GENERIC',base_colour:'#EEEAE1',roughness:.88,metallic:0,finish:'washable matte sample pending'};s.layout.interior.materials.push(ivory);
 for(const w of domain.surfaces().filter(w=>w.type==='wall'&&['RECP-01','HALL-01'].includes(w.room_id)))s.layout.interior.surface_materials[w.id]=ivory.id;
 s.m2_profile=structuredClone(b1.m2_profile);s.m3_profile=b1.m3_profile;s.m3b_profile=b1.m3b_profile;
 s.group2_profile=structuredClone(b2.group2_profile);s.jury_private_profiles={'MBR-01':structuredClone(a2.group2_profile)};
 s.group2_joinery=structuredClone(b2.group2_joinery);s.group2_joinery.matTop_mm_by_room={'MBR-01':570,'BR-01':560,'BR-02':560};
 s.group2_soft_treatments=structuredClone(b2.group2_soft_treatments);s.group2_soft_treatments.rooms['MBR-01']=a2.group2_soft_treatments.rooms['MBR-01'];
 s.group3_profile=structuredClone(b3.group3_profile);s.group3_detail=structuredClone(b3.group3_detail);
 s.group4_profile=structuredClone(b4.group4_profile);s.group4_detail=structuredClone(b4.group4_detail);s.render_experiment=b4.render_experiment;s.kitchen_r6_study=b4.kitchen_r6_study;
 s.group5_profile=structuredClone(a5.group5_profile);s.group5_profile.rack='TOWER600';s.group5_detail=a5.group5_detail;
 s.group5_concepts=[...a5.group5_concepts.filter(c=>c.room!=='TER-SVC'),...b5.group5_concepts.filter(c=>c.room==='TER-SVC')];
 // One wood family, gentle private colour variation; no change to envelopes or mechanisms.
 s.m2_profile.wood='#A58A69';s.m2_profile.woodDark='#655744';s.group2_profile.wood='#A58A69';s.jury_private_profiles['MBR-01'].wood='#A58A69';s.group3_profile.wood='#A58A69';s.group4_profile.wood='#A58A69';s.group5_profile.wood='#A58A69';
 s.jury={schema:'WholeHomeJuryScenario/1',checkpoint,issue:72,roadmap:41,construction:19,status:'PROVISIONAL_STUDY',selection:picks.map(([input,rooms])=>({input,rooms})),door_finish:'R5 D1 only on two kitchen leaves; all other source door finishes retained and visibly critiqued',floor:'One source-sized oak visual family in dry rooms; deliberate stone wet/kitchen and exterior thresholds, assembly/levels UNKNOWN',services:'All original wet centres, walls, openings, ceiling and source scenes immutable',approvals:{owner:false,construction:false,procurement:false,cloud:false}};
 assert.deepEqual(s.layout.decor,source.layout.decor);assert.deepEqual(s.layout.demolished,source.layout.demolished);assert.equal(s.layout.modelVersion,source.layout.modelVersion);
 for(const f of source.layout.furniture)assert.equal(s.layout.furniture.filter(x=>x.id===f.id).length,1);
 for(const o of source.layout.interior.objects)assert.equal(s.layout.interior.objects.filter(x=>x.id===o.id).length,1);
 for(const f of source.layout.furniture.filter(x=>['shower','toilet','ksink','stove','washer','dishwasher','fridge'].includes(x.type))){const n=s.layout.furniture.find(x=>x.id===f.id);for(const k of ['cx','cy','w','d','rot'])assert.equal(n[k],f[k],`${f.id}/${k}`);}
 const cameraBase=structuredClone(b1.views[0].camera);cameraBase.viewport={width:1280,height:720};
 const chosen=[['entry',b1,'entry-storage'],['reception',b1,'living-to-dining'],['dining',b1,'dining-to-living'],['master',a2,'MBR-entry'],['br01',b2,'BR01-entry'],['br02',b2,'BR02-entry'],['wic',b2,'WIC-south'],['bath-master',b3,'master-wide'],['bath-family',b3,'family-shower'],['guest-wc',b3,'guest-open'],['kitchen',b4,'work'],['terrace-main',a5,'main-eye'],['terrace-master',a5,'master-eye'],['terrace-service',b5,'service-eye']];
 s.views=chosen.map(([id,q,v])=>{const view=structuredClone(q.views.find(x=>x.id===v));assert.ok(view,id);view.id=id;view.camera.viewport=cameraBase.viewport;return view;});
 const living=structuredClone(b1.views.find(v=>v.id==='seated-tv'));living.id='living-seated';living.camera.viewport=cameraBase.viewport;s.views.push(living);
 const convert=(p,h)=>[(p[0]-domain.model.width_mm/2)/1000,h/1000,(p[1]-domain.model.depth_mm/2)/1000];
 const cross=(id,rid,pos,target,h=1620)=>({id,room_id:rid,camera:{...structuredClone(cameraBase),position:convert(pos,h),target:convert(target,1100),fov:74}});
 s.views.push(cross('hall-to-public','HALL-01',[7690,5720],[10700,5400]),cross('public-to-terrace','RECP-01',[14370,3850],[14200,1100]),cross('master-to-terrace','MBR-01',[1680,6020],[1050,4480]),cross('wic-to-bath','WIC-01',[4850,7560],[6350,7650]),cross('service-to-kitchen','TER-SVC',[10200,9940],[10410,7450]));
 for(const v of s.views){v.camera.aspect=1280/720;v.camera.viewer.night=false;v.camera.viewer.hour=12;for(const d of v.camera.viewer.doors){if(d.id==='OP-KIT-TERSVC'){d.open=false;d.position=0;}if(['GLZ-MBR-TER','GLZ-RECP-TERMAIN'].includes(d.id)){d.open=true;d.position=1;}}}
 for(const id of ['reception','master','hall-to-public','public-to-terrace','wic-to-bath','kitchen']){const v=structuredClone(s.views.find(v=>v.id===id));v.id+='-night';v.camera.viewer.night=true;v.camera.viewer.hour=20;s.views.push(v);}
 // Source door opening is a state, never an architectural omission.
 const service=s.views.find(v=>v.id==='service-to-kitchen');service.camera.viewer.doors.find(d=>d.id==='OP-KIT-TERSVC').open=true;service.camera.viewer.doors.find(d=>d.id==='OP-KIT-TERSVC').position=Math.PI/2;
 s.scene_revision=domain.revision(s.layout);
 let validation;try{validation=domain.validate(s.layout)}catch(e){validation=e.validation;if(!validation)throw e;}
 assert.equal(validation.checks.filter(c=>c.status==='FAIL').length,0,JSON.stringify(validation.checks.filter(c=>c.status==='FAIL')));
 fs.mkdirSync(dir+'/frames',{recursive:true});fs.mkdirSync(dir+'/plans',{recursive:true});fs.mkdirSync('work/jury',{recursive:true});
 fs.writeFileSync(dir+'/SCENARIO.json',JSON.stringify(s,null,2)+'\n');
 const log={schema:'WholeHomeReconciliation/1',checkpoint,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),canonical_sha256:source.canonical_sha256,original_furniture:source.layout.furniture.length,original_interior:source.layout.interior.objects.length,changes,conflicting_deltas:conflicts,excluded_global_deltas:ignored,shared_choices:s.jury,domain_validation:validation.summary,failures:[]};
 fs.writeFileSync(dir+'/RECONCILIATION.json',JSON.stringify(log,null,2)+'\n');fs.copyFileSync('dist/index.html','work/jury/built-viewer.html');
 console.log(JSON.stringify({objects:s.layout.furniture.length+s.layout.interior.objects.length,field_changes:changes.length,material_conflicts:conflicts.length,views:s.views.length,validation:validation.summary}));return s;
}
if(process.argv[1]?.endsWith('jury-build.mjs'))build();
