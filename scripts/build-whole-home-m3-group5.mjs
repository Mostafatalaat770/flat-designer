/** Issue76: source-based reversible outdoor design, never a saved/construction scene. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
export const dir='design-development/whole-home-m3/group5',baseline='d5ee78da71d97cc86b965d52534456a8d4cda7a3';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const domain=createApartmentDomain(process.cwd()),source=JSON.parse(fs.readFileSync('render-snapshots/current.json'));
export const prepared=JSON.parse(fs.readFileSync('design-development/whole-home-m3/group5-preparation/SOURCE_BASELINE.json'));
export const ids=['TER-MAIN','TER-MBR','TER-SVC'];
export const F=(s,id)=>s.layout.furniture.find(f=>f.id===id);
export const profiles={A:{id:'A',name:'Two-person soft lounge / calm solo corner / horizontal drying',wood:'#AC9274',metal:'#666F62',fabric:'#DBD9CA',accent:'#879078',stone:'#D3CABB',floor:'#C8C3B7',pot:'#A49A86',table_height_mm:520,rack:'HORIZONTAL900'},B:{id:'B',name:'Compact three-person conversation / same solo corner / vertical drying',wood:'#AC9274',metal:'#666F62',fabric:'#D8D5C8',accent:'#7B866B',stone:'#D3CABB',floor:'#C8C3B7',pot:'#A49A86',table_height_mm:700,rack:'TOWER600'}};
export function candidate(key){
 const s=structuredClone(source);s.name='M3 Group5 '+key+' / source-based unapproved review';s.group5_profile=profiles[key]||null;
 const concepts=[];
 if(key!=='SOURCE'){
  const p=s.group5_profile,main=key==='A';
  Object.assign(F(s,'starter-41'),{cx:14200,cy:main?1230:1140,w:main?600:700,d:main?600:700,color:p.stone});
  Object.assign(F(s,'starter-42'),{cx:main?13285:13210,cy:main?1230:1140,w:650,d:main?700:620,rot:270,color:p.fabric});
  Object.assign(F(s,'starter-43'),{cx:main?15115:15190,cy:main?1230:1140,w:650,d:main?700:620,rot:90,color:p.fabric});
  Object.assign(F(s,'starter-44'),{cx:385,cy:3820,color:'#7F8C70'});
  if(!main)concepts.push({id:'G5-main-third',room:'TER-MAIN',kind:'seat',cx:14080,cy:2140,w:650,d:580,rot:180,h:820,seat_h:460});
  concepts.push({id:'G5-main-plant',room:'TER-MAIN',kind:'plant',cx:12880,cy:2260,w:360,d:360,rot:0,h:950,pot_h:380});
  concepts.push({id:'G5-master-seat',room:'TER-MBR',kind:'seat',cx:580,cy:4480,w:580,d:600,rot:270,h:820,seat_h:430,arm_tray:[260,200]});
  concepts.push({id:'G5-service-rack',room:'TER-SVC',kind:main?'rack-horizontal':'rack-tower',cx:main?9500:9315,cy:9800,w:main?900:600,d:main?450:500,rot:0,h:main?950:1280,folded_d:120});
  concepts.push({id:'G5-service-caddy',room:'TER-SVC',kind:'caddy',cx:9340,cy:9210,w:280,d:280,rot:0,h:1450});
 }
 s.group5_concepts=concepts.map(c=>({...c,status:'RENDER_ONLY / no product, fixing, wind or load approval'}));
 s.group5_detail={version:1,rack_state:'DEPLOYED',portable_light:'shielded table lantern / movable battery capability only; no outdoor installed XY',master_light:key==='SOURCE'?'low portable marker off after use; no facade fitting':'portable arm-tray light off after use; no facade fitting',no_new_roof:true,planting:'light removable containers; species/wet mass/sun/wind/irrigation/drain clearance unknown',approvals:{owner:false,construction:false,procurement:false,cloud:false,guard:false,structure:false,waterproofing:false,electrical:false}};
 const saved=structuredClone(source.views.find(v=>v.id==='reception-living').camera),convert=(xy,h)=>[(xy[0]-domain.model.width_mm/2)/1000,h/1000,(xy[1]-domain.model.depth_mm/2)/1000];
 const view=(id,rid,pos,target,h=1650,fov=69)=>({id,room_id:rid,camera:{...structuredClone(saved),position:convert(pos,h),target:convert(target,900),fov}});
 s.views=[view('main-eye','TER-MAIN',[15400,2260],[13900,1000]),view('main-inside','RECP-01',[14370,3850],[14200,1100]),view('master-eye','TER-MBR',[1710,4750],[540,4090],1600,72),view('service-eye','TER-SVC',[10200,9220],[9320,9850],1600,74),view('service-kitchen','TER-SVC',[10200,9940],[10410,7450],1600,70)];
 for(const [from,id]of [['main-eye','main-night'],['master-eye','master-night']]){const v=structuredClone(s.views.find(v=>v.id===from));v.id=id;v.camera.viewer.night=true;v.camera.viewer.hour=20;s.views.push(v);}
 for(const v of s.views){for(const id of ['GLZ-MBR-TER','GLZ-RECP-TERMAIN']){const d=v.camera.viewer.doors.find(d=>d.id===id);d.open=true;d.position=1;}const d=v.camera.viewer.doors.find(d=>d.id==='OP-KIT-TERSVC');d.open=true;d.position=Math.PI/2;}
 s.scene_revision=domain.revision(s.layout);assert.deepEqual(s.layout.furniture.filter(f=>!ids.includes(f.room_id)),source.layout.furniture.filter(f=>!ids.includes(f.room_id)));assert.deepEqual(s.layout.interior,source.layout.interior);
 return s;
}
if(process.argv[1]?.endsWith('build-whole-home-m3-group5.mjs')){
 fs.mkdirSync(dir+'/plans',{recursive:true});fs.mkdirSync('work/group5',{recursive:true});fs.copyFileSync('dist/index.html','work/group5/built-viewer.html');
 const design={schema:'M3Group5Design/1',checkpoint:baseline,canonical_sha256:source.canonical_sha256,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),status:'PROVISIONAL / local furniture choices only',source_terrace_ceilings:0,interior_ceiling_mm:2500,source_services_and_architecture_immutable:true,prior_open_HOLDs:40,options:[]};
 for(const key of ['SOURCE','A','B']){const s=candidate(key);fs.writeFileSync(dir+'/'+key+'.json',JSON.stringify(s,null,2)+'\n');let v;try{v=domain.validate(s.layout)}catch(e){v=e.validation;if(!v)throw e;}const fails=v.checks.filter(c=>c.status==='FAIL');assert.equal(fails.length,0,JSON.stringify(fails));design.options.push({id:key,scene:s.scene_revision,source_geometry_checks:v.summary,concepts_independently_checked:'OPERATIONS.json, not part of source interior schema'});}
 for(const key of ['A','B']){const folded=candidate(key);folded.group5_detail.rack_state='FOLDED';folded.views=folded.views.filter(v=>v.id==='service-eye');fs.writeFileSync(dir+'/'+key+'-FOLDED.json',JSON.stringify(folded,null,2)+'\n');}
 const initial=candidate('A');initial.group5_detail.version=0;initial.group5_concepts.find(c=>c.id==='G5-main-plant').h=1500;initial.views=initial.views.filter(v=>v.id==='main-eye');if(!fs.existsSync(dir+'/INITIAL.json'))fs.writeFileSync(dir+'/INITIAL.json',JSON.stringify(initial,null,2)+'\n');
 fs.writeFileSync(dir+'/DESIGN.json',JSON.stringify(design,null,2)+'\n');console.log('Three controls/proposals built; one master composition, no terrace ceiling or moved services.');
}
