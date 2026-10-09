import fs from 'node:fs';
import assert from 'node:assert/strict';
import {source,model,approach} from '../circulation-v55/route-library.mjs';
import {solidObstacles,reserve,conflicts,auditPath} from '../operation-review.mjs';
import {hingeLeaf,pointInPolygon,distance} from '../../studio/analysis/geometry.mjs';
import {stageGeometry} from '../dining-operation-v55/study.mjs';
import {kitchenStages} from '../kitchen-operation-v55/study.mjs';
import {floorUnion,sampleWholeFloor,insideFloor,floorGap} from './floor.mjs';
const dir=import.meta.dirname;
const read=name=>JSON.parse(fs.readFileSync(dir+'/'+name));
export const goals=[
 {id:'private-hall',label:'الممر الخاص',room_id:'HALL-01',position:[8381.529,5507.5415]},
 {id:'living',label:'جلسة المعيشة',room_id:'RECP-01',position:[10800,3500]},
 {id:'bedroom1-bed',label:'غرفة ١ · جانب السرير',room_id:'BR-01',position:[4100,2800]},
 {id:'bedroom1-wardrobe',label:'غرفة ١ · الدولاب',room_id:'BR-01',position:[4380,3350]},
 {id:'bedroom1-desk',label:'غرفة ١ · اقتراب المكتب',room_id:'BR-01',position:[3770,4110]},
 {id:'bedroom1-storage',label:'غرفة ١ · وحدة التخزين',room_id:'BR-01',position:[3775,4140]},
 {id:'bedroom2-bed',label:'غرفة ٢ · جانب السرير',room_id:'BR-02',position:[6350,3250]},
 {id:'bedroom2-desk',label:'غرفة ٢ · اقتراب المكتب',room_id:'BR-02',position:[6020,3100]},
 {id:'master-bed',label:'الغرفة الرئيسية · جانب السرير',room_id:'MBR-01',position:[1750,8100]},
 {id:'dressing',label:'الدريسنج · اقتراب الحمام',room_id:'WIC-01',position:[5065.175,7604.6435]},
 {id:'ensuite-vanity',label:'حمام الرئيسية · الحوض',room_id:'BATH-M01',position:[5980,8000]},
 {id:'ensuite-shower',label:'حمام الرئيسية · الدش والباب مفتوح',room_id:'BATH-M01',position:[6000,6750]},
 {id:'family-WC',label:'حمام العائلة · اقتراب المرحاض',room_id:'BATH-C01',position:[7790,7440]},
 {id:'kitchen-sink',label:'المطبخ · اقتراب الحوض',room_id:'KIT-01',position:[11181,7750]},
 {id:'service-terrace',label:'تراس الخدمة · بعد العتبة',room_id:'TER-SVC',position:[10104.2195,9600]},
 {id:'guest-WC',label:'حمام الضيوف · اقتراب المرحاض',room_id:'WC-01',position:[11944.276,9701.745]},
 {id:'guest-basin',label:'حمام الضيوف · وقفة الحوض ٤٠ سم',room_id:'WC-01',position:[11968.31,9664.54]},
 {id:'master-terrace',label:'تراس الرئيسية · فتحة زجاج مفترضة',room_id:'TER-MBR',position:[1150,4000]},
 {id:'main-terrace',label:'تراس المعيشة · فتحة زجاج مفترضة',room_id:'TER-MAIN',position:[13000,2150]}
];
export function studyStages(candidate){
 const dining=stageGeometry(candidate,400,275).added;
 const specs=[
  {id:'baseline',label:'الوضع الحالي · أثاث مقفول',layout:source.layout,added:[]},
  {id:'unified',label:'المقترح الموحّد · أثاث مقفول',layout:candidate,added:[]},
  {id:'dining-six',label:'المقترح · ٦ أشخاص على السفرة وسحب ٤٠ سم',layout:candidate,added:dining,dining:true},
  {id:'dining-storage',label:'٦ على السفرة + فتح تخزين غرفة ١ · ٣٥ سم',layout:candidate,added:[...dining,
   reserve({id:'storage-open-350',kind:'reserve',cx:3775,cy:4370,w:800,d:350,rot:0})],dining:true},
  {id:'dining-desk',label:'٦ على السفرة + شخص على مكتب غرفة ١',layout:candidate,added:[...dining,
   {...reserve({id:'desk-occupant',kind:'person',cx:3120,cy:4250,w:700,d:550,rot:0}),skip_collision_ids:['starter-9']}],dining:true},
  {id:'dining-dw-loading',label:'٦ على السفرة + تفريغ غسالة الأطباق',layout:candidate,
   added:[...dining,...kitchenStages().find(s=>s.id==='dw-600-loader').added],dining:true},
  {id:'conditional-guest',label:'٦ على السفرة + باب ضيوف للخارج · مقترح مشروط',layout:candidate,added:dining,dining:true,conditional:true}
 ];
 return specs.map(s=>{
  const skip=['BATHM-WALKIN-A1',...(s.dining?['starter-35','starter-36','starter-37','starter-38','starter-39',
   'A2-dining-chair-north-centre','A2-dining-chair-south-centre','A-dining-pendant']:[])];
  let obstacles=solidObstacles(s.layout,model.rooms.map(r=>r.id),{skip});
  if(s.conditional){
   obstacles=obstacles.filter(o=>!['open-room-leaf-OP-RECP-WC','open-room-leaf-OP-ENT-01'].includes(o.id));
   for(const [id,angle] of [['OP-RECP-WC',0],['OP-ENT-01',180]]){
    const door=model.doors.find(d=>d.id===id);
    obstacles.push({id:'conditional-'+id,kind:'room-door',polygon:hingeLeaf({hinge:door.h,length_mm:door.len,angle_deg:angle})});
   }
  }
  const {layout:unused,...spec}=s;
  return {...spec,obstacles,goals:goals.map(g=>g.id==='bedroom1-storage'?{...g,
   position:s.id==='baseline'?[2675,4140]:s.id==='dining-storage'?[3775,3800]:g.position}:
   g.id==='bedroom1-desk'&&s.id==='baseline'?{...g,position:[4450,3900]}:g)};
 });
}
export function auditWholePath(route,floor,obstacles){
 if(route.status!=='MODEL_ROUTE_FOUND')return null;
 const audit=auditPath(route,{boundary:floor.outer,obstacles:[...obstacles,...floor.holes.map((polygon,i)=>({id:'floor-hole-'+i,polygon}))]});
 let minimum=Infinity,samples=0;
 for(let i=0;i<route.route_mm.length;i++){
  const a=route.route_mm[Math.max(0,i-1)],b=route.route_mm[i],n=Math.max(1,Math.ceil(distance(a,b)/5));
  for(let k=0;k<=n;k++){const p=a.map((v,j)=>v+(b[j]-v)*k/n);assert.ok(insideFloor(p,floor),'Path left canonical floor/threshold union.');
   minimum=Math.min(minimum,floorGap(p,floor)-route.radius_mm);samples++;}
 }
 return {...audit,floor_union_samples:samples,minimum_floor_body_gap_mm:minimum,
  status:audit.status==='NO_DETECTED_SAMPLED_CONFLICT'&&minimum>0?'NO_DETECTED_SAMPLED_CONFLICT':'SAMPLED_CONFLICT'};
}
export function runStudy({progress=false}={}){
 const candidate=read('snapshot.json'),composition=read('composition.json');assert.equal(candidate.scene_revision,composition.candidate_scene);
 const floor=floorUnion(),start=approach('OP-ENT-01','RECP-01'),cases=[];
 for(const s of studyStages(candidate.layout)){
  const collisions=conflicts(s.added,s.obstacles,floor.outer),routes=[];
  for(const grid_mm of [50,25])for(const r of sampleWholeFloor({floor,obstacles:[...s.obstacles,...s.added],start,goals:s.goals,grid_mm}))
   routes.push({...r,audit:auditWholePath(r,floor,[...s.obstacles,...s.added])});
  const {dining,conditional,...saved}=s;
  cases.push({...saved,conditional_architecture_overlay:!!conditional,reservations_valid:!collisions.length,reservation_conflicts:collisions,routes});
  if(progress)console.log(JSON.stringify({stage:s.id,valid:!collisions.length,routes:routes.map(r=>({id:r.id,grid:r.grid_mm,status:r.status}))}));
 }
 return {schema:'ApartmentUnifiedFurnishingCirculation/1',source_scene:source.scene_revision,candidate_scene:candidate.scene_revision,
  canonical_sha256:source.canonical_sha256,source_storage_revision:55,saved_cloud_scene:'scene-4821689',production_connected:false,
  floor,start,goals,stages:cases,assumptions:'500 mm circular traveller, four-neighbour 25/50 mm grid with half-diagonal margin; start 600 mm inside reception. Fully open fixed room leaves; terraces assume clear full-width internal glazing passages. Conditional guest leaf is an analysis overlay only. Separate fixed occupation/reserve stages do not certify moving people, posture, door operation, comfort or measured fit.'};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const r=runStudy({progress:true});if(process.argv.includes('--write'))fs.writeFileSync(dir+'/results.json',JSON.stringify(r)+'\n');
 console.log(JSON.stringify({candidate:r.candidate_scene,stages:r.stages.length,route_cases:r.stages.reduce((n,s)=>n+s.routes.length,0),
  floor_outer_vertices:r.floor.outer.length,floor_holes:r.floor.holes.length}));
}
