import fs from 'node:fs';
import {source,model,approach} from '../circulation-v55/route-library.mjs';
import {solidObstacles,reserve,conflicts,sampleRoutes,auditPath} from '../operation-review.mjs';
import {hingeLeaf} from '../../studio/analysis/geometry.mjs';
import {pointInPolygon,minEdgeDistance} from '../../studio/analysis/geometry.mjs';
import {planSequence,auditSequence} from '../bathroom-door-sequence/planner.mjs';

export function kitchenInput(){
 const boundary=[[8981.529,6587.866],[12116.59,6587.866],[12582.613,6969.158],[12582.613,8960.346],
  [10739.705,8960.346],[10739.705,10231.317],[8833.249,10231.317],[8833.249,8960.346],[8981.529,8960.346]];
 return {boundary,description:'Exact canonical kitchen + service-terrace floor union, with the separating wall and opening retained.',
  start:approach('OP-RECP-KIT','KIT-01'),obstacles:solidObstacles(source.layout,['KIT-01','TER-SVC']),
  goals:[{id:'service-terrace',position:[10104.2195,9600]},
   {id:'sink-approach',position:[11181,7750]},
   {id:'fridge-approach',position:[11850,7850]}]};
}
export function kitchenStages(){
 const dw=projection=>reserve({id:'dishwasher-open-'+projection,kind:'appliance-door',cx:10581,cy:7298+projection/2,w:600,d:projection,rot:0});
 const wm=reserve({id:'laundry-open-envelope-500',kind:'appliance-door',cx:9981,cy:7548,w:600,d:500,rot:0});
 const oven=p=>reserve({id:'oven-open-'+p,kind:'appliance-door',cx:9681+p/2,cy:7895,w:600,d:p,rot:270});
 const loader=(id,cx,cy,rot=0)=>reserve({id,kind:'person',cx,cy,w:600,d:500,rot});
 const scenarios=[
  {id:'closed',label:'الأجهزة مقفولة',added:[]},
  {id:'dw-open-600',label:'غسالة الأطباق مفتوحة · 60 سم',added:[dw(600)]},
  {id:'dw-open-650',label:'غسالة الأطباق مفتوحة · 65 سم',added:[dw(650)]},
  {id:'dw-600-loader',label:'غسالة الأطباق 60 سم + شخص للتفريغ',added:[dw(600),loader('dw-loader',10581,8248)]},
  {id:'dw-650-loader',label:'غسالة الأطباق 65 سم + شخص للتفريغ',added:[dw(650),loader('dw-loader',10581,8298)]},
  {id:'laundry-open',label:'الغسالة · نطاق فتح 50 سم',added:[wm]},
  {id:'laundry-loader',label:'الغسالة مفتوحة + شخص',added:[wm,loader('laundry-loader',9981,8148)]},
  {id:'laundry-loader-offset',label:'الغسالة + وقفة مزاحة 15 سم شرقًا',added:[wm,loader('laundry-loader',10131,8148)]},
  {id:'oven-open-500',label:'فرن مفترض · فتح 50 سم',added:[oven(500)]},
  {id:'oven-open-600',label:'فرن مفترض · فتح 60 سم',added:[oven(600)]},
  {id:'oven-loader',label:'الفرن مفتوح 60 سم + شخص',added:[oven(600),loader('oven-loader',10631,7895,270)]},
  {id:'dw-oven-loader',label:'الأطباق + الفرن مفتوحان + شخص أمام الفرن',added:[dw(600),oven(600),loader('oven-loader',10631,7895,270)]}
 ];
 for(const side of ['left','right'])for(const angle of [45,90]){
  const hinge=[side==='left'?11525:12175,8195],a=side==='left'?-angle:180+angle;
  scenarios.push({id:'fridge-'+side+'-'+angle,label:'الثلاجة · مفصلة '+(side==='left'?'غرب':'شرق')+' · '+angle+'°',
   added:[{id:'fridge-leaf',kind:'appliance-door',skip_collision_ids:['starter-23'],polygon:hingeLeaf({hinge,length_mm:650,angle_deg:a})}],
   inferred_fridge_door:{hinge,length_mm:650,thickness_mm:18,angle_deg:a,hinge_side_in_plan:side,hinge_location:side==='left'?'west':'east'}});
 }
 return scenarios;
}
export function runStudy({progress=false}={}){
 const input=kitchenInput(),stages=[];
 for(const stage of kitchenStages()){
  const obs=[...input.obstacles,...stage.added],collisions=conflicts(stage.added,input.obstacles,input.boundary),routes=[];
  for(const grid_mm of [50,25])for(const r of sampleRoutes({...input,obstacles:obs,grid_mm}))
   routes.push({...r,audit:auditPath(r,{...input,obstacles:obs})});
  stages.push({...stage,reservation_conflicts:collisions,reservations_valid:collisions.length===0,routes});
  if(progress)console.log(JSON.stringify({stage:stage.id,valid:!collisions.length,
   routes:routes.map(r=>({id:r.id,grid:r.grid_mm,status:r.status,reason:r.reason}))}));
 }
 const operation_sequences=[];
 const inside=(p,r)=>pointInPolygon(p,input.boundary)&&minEdgeDistance(p,input.boundary)>=r;
 for(const side of ['left','right'])for(const grid_mm of [50,25]){
  const door={id:'inferred-fridge-leaf',hinge:[side==='left'?11525:12175,8195],length_mm:650,
   open_angle_deg:side==='left'?0:180,closed_angle_deg:side==='left'?-90:270};
  const sequence=planSequence({...input,inside,door,goal:[11850,7850],grid_mm});
  operation_sequences.push({hinge_location:side==='left'?'west':'east',...sequence,
   audit:auditSequence(sequence,{...input,inside}),
   phase_description:'Start inside kitchen with fridge closed → open to 90° and approach front; reverse to close and return.'});
 }
 return {schema:'ApartmentKitchenOperationReview/1',source_scene:source.scene_revision,
  canonical_sha256:source.canonical_sha256,saved_cloud_scene:'scene-4821689',storage_revision:55,
  input,stages,operation_sequences,architecture_changed:false,layout_changed:false,
  assumptions:'Current enclosed L kitchen. Generic opening/standing envelopes, inferred refrigerator hinges; no selected manuals, pose ergonomics or construction certification. Routes begin 600 mm inside the kitchen, but the terrace route crosses its actual threshold.'};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const r=runStudy({progress:true});
 if(process.argv.includes('--write'))fs.writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(r,null,2)+'\n');
 console.log(JSON.stringify({stages:r.stages.length,routes:r.stages.reduce((n,s)=>n+s.routes.length,0),
  source:r.source_scene,canonical:r.canonical_sha256}));
}
