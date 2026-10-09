import fs from 'node:fs';
import {source,domain,model,approach,room} from '../circulation-v55/route-library.mjs';
import {solidObstacles,reserve,circleObstacle,conflicts,sampleRoutes,auditPath} from '../operation-review.mjs';
import {hingeLeaf,pointInPolygon,minEdgeDistance} from '../../studio/analysis/geometry.mjs';
import {planSequence,auditSequence} from '../bathroom-door-sequence/planner.mjs';
const chairIds=['starter-36','starter-37','starter-38','starter-39','A2-dining-chair-north-centre','A2-dining-chair-south-centre'];
export const diningProposal=(id)=>({schema:'ApartmentDesignProposal/2',canonical_sha256:source.canonical_sha256,
 base_scene_revision:source.scene_revision,operations:id==='end-inset-60'?chairIds.filter(id=>!id.includes('centre')).map(furniture_id=>{
  const f=source.layout.furniture.find(f=>f.id===furniture_id);return {type:'update-furniture',furniture_id,changes:{cx:f.cx+(f.cx<14670?60:-60)}};
 }):[...['starter-35',...chairIds].map(furniture_id=>({type:'update-furniture',furniture_id,
  changes:{cy:source.layout.furniture.find(f=>f.id===furniture_id).cy-150}})),
  {type:'update-object',object_id:'A-dining-pendant',changes:{cy:7500}}],
 notes:[id==='end-inset-60'?'LOCAL furnishing study: four end chairs 60 mm towards the centre; six chairs/table/pendant retained.':'LOCAL furnishing comparison: table, six chairs and pendant 150 mm north; all sizes retained.']});
export function diningInput(){
 // Reception clipped at a line aligned with its existing 25/50 mm grid origin.
 const boundary=[[8981.529,4950.754],[16035.418,4950.754],[16035.418,10231.317],
  [12603.796,10231.317],[12603.796,6969.158],[12116.59,6587.866],[8981.529,6587.866]];
 return {boundary,description:'Exact reception floor south of y=4950.754 mm. Northern edge is a review crop, not an architectural wall.',
  start:approach('OP-ENT-01','RECP-01'),
  obstacles:solidObstacles(source.layout,['RECP-01'],{skip:[...chairIds,'starter-35','A-dining-pendant']}),
  goals:[{id:'living',position:[9581.529,5507.5415]},
   {id:'kitchen-approach',position:approach('OP-RECP-KIT','RECP-01')},
   {id:'guest-approach',position:approach('OP-RECP-WC','RECP-01')},
   {id:'serve-NE',position:[15370,6015]},
   {id:'serve-NE-diagonal',position:[15220,6015]}]};
}
export function stageGeometry(layout,pull,bodyRadius){
 const table=layout.furniture.find(f=>f.id==='starter-35'),chairs=layout.furniture.filter(f=>chairIds.includes(f.id))
  .map(f=>({...f,cy:f.cy+(f.cy<table.cy?-pull:pull)}));
 const added=[reserve({...table,kind:'fixture'})];
 for(const f of chairs){const c=reserve({...f,kind:'chair'});if(!pull)c.skip_collision_ids=['starter-35'];added.push(c);}
 if(bodyRadius)for(const f of chairs){const body=circleObstacle('seated-'+f.id,[f.cx,f.cy],bodyRadius);body.skip_collision_ids=[f.id];added.push(body);}
 return {added,chairs,table};
}
export function runStudy({progress=false}={}){
 const input=diningInput(),proposals=['end-inset-60','table-north-150'].map(id=>({id,proposal:diningProposal(id)}));
 const candidates=proposals.map(c=>{const layout=domain.applyProposal(source.layout,c.proposal);return {...c,layout,
  scene_revision:domain.revision(layout),validation:domain.validate(layout).summary};});
 const specifications=[
  {id:'closed',variant:'baseline',pull:0,radius:0,label:'الوضع الحالي · كراسي مقفولة'},
  {id:'pull-300',variant:'baseline',pull:300,radius:0,label:'الوضع الحالي · سحب 30 سم'},
  ...[350,400,500].map(pull=>({id:'baseline-'+pull,variant:'baseline',pull,radius:275,label:'الوضع الحالي · سحب '+pull/10+' سم + 6 أشخاص'})),
  ...['end-inset-60','table-north-150'].flatMap(variant=>[350,400,500].map(pull=>({id:variant+'-'+pull,variant,pull,radius:275,
   label:(variant==='end-inset-60'?'الكراسي الطرفية 6 سم للداخل':'السفرة 15 سم شمالًا')+' · سحب '+pull/10+' سم + 6 أشخاص'}))),
  {id:'end-inset-60-600-wide',variant:'end-inset-60',pull:600,radius:300,label:'الكراسي الطرفية للداخل · سحب 60 سم + جسم 60 سم'}
 ];
 const stages=[];
 for(const spec of specifications){
  const layout=spec.variant==='baseline'?source.layout:candidates.find(c=>c.id===spec.variant).layout;
  const geometry=stageGeometry(layout,spec.pull,spec.radius),obs=[...input.obstacles,...geometry.added];
  const northEast=geometry.chairs.find(f=>f.id==='starter-37'),goals=input.goals.map(g=>g.id.startsWith('serve-NE')?{...g,
   position:[northEast.cx-(g.id.endsWith('diagonal')?150:0),northEast.cy-(spec.radius||275)-250-60]}:g);
  const collision=conflicts(geometry.added,input.obstacles,input.boundary),routes=[];
  for(const grid_mm of [50,25])for(const r of sampleRoutes({...input,goals,obstacles:obs,grid_mm}))routes.push({...r,audit:auditPath(r,{...input,obstacles:obs})});
  stages.push({id:spec.id,label:spec.label,variant:spec.variant,pull_mm:spec.pull,seated_radius_mm:spec.radius,
   ...geometry,reservation_conflicts:collision,reservations_valid:!collision.length,routes});
  if(progress)console.log(JSON.stringify({stage:spec.id,valid:!collision.length,conflicts:collision.map(c=>[c.a,c.b]),
   routes:routes.map(r=>({id:r.id,grid:r.grid_mm,status:r.status}))}));
 }
 // Access one temporarily empty seat with the other five occupants present.
 // A rectangular subset of reception keeps the transfer review local and exact.
 const accessBoundary=[[12603.796,5500],[16035.418,5500],[16035.418,10231.317],[12603.796,10231.317]],seat_access=[];
 for(const variant of ['baseline','end-inset-60','table-north-150']){
  const s=stages.find(s=>s.variant===variant&&s.pull_mm===400);
  if(!s.reservations_valid)continue;
  for(const entry_door_state of ['open','closed'])for(const chair of s.chairs){
   const entry=model.doors.find(d=>d.id==='OP-ENT-01'),vector=entry_door_state==='closed'?entry.c:entry.o;
   const obs=[...input.obstacles.filter(o=>o.id!=='open-room-leaf-OP-ENT-01'),
    {id:'entry-leaf-'+entry_door_state,polygon:hingeLeaf({hinge:entry.h,length_mm:entry.len,angle_deg:Math.atan2(vector[1],vector[0])*180/Math.PI})},
    ...s.added.filter(o=>![chair.id,'seated-'+chair.id].includes(o.id))];
   const r=sampleRoutes({boundary:accessBoundary,obstacles:obs,start:input.start,goals:[{id:chair.id,position:[chair.cx,chair.cy]}],grid_mm:25})[0];
   seat_access.push({variant,entry_door_state,chair_id:chair.id,pull_mm:400,grid_mm:25,other_seated_people:5,
    ...r,audit:auditPath(r,{boundary:accessBoundary,obstacles:obs})});
  }
 }
 const entry=model.doors.find(d=>d.id==='OP-ENT-01'),guest=model.doors.find(d=>d.id==='OP-RECP-WC');
 const combined_door_overlays=[],entry_close_sequences=[];
 for(const variant of ['end-inset-60','table-north-150']){
  const dining=stages.find(s=>s.id===variant+'-400');
  for(const guest_angle_deg of [90,45,0]){
   const obs=[...input.obstacles.filter(o=>!['open-room-leaf-OP-ENT-01','open-room-leaf-OP-RECP-WC'].includes(o.id)),
    {id:'closed-entry-leaf',polygon:hingeLeaf({hinge:entry.h,length_mm:entry.len,angle_deg:180})},
    {id:'conditional-outward-guest-leaf',polygon:hingeLeaf({hinge:guest.h,length_mm:guest.len,angle_deg:guest_angle_deg})},...dining.added];
   const routes=[];
   for(const grid_mm of [50,25])for(const r of sampleRoutes({...input,
    goals:input.goals.map(g=>g.id.startsWith('serve-NE')?{...g,position:dining.routes.find(r=>r.id===g.id).goal}:g),
    obstacles:obs,grid_mm}))routes.push({...r,audit:auditPath(r,{...input,obstacles:obs})});
   combined_door_overlays.push({variant,dining_stage:dining.id,entry_door:'closed',guest_angle_deg,obstacles:obs,routes});
  }
  for(const grid_mm of [50,25]){
   const obs=[...input.obstacles.filter(o=>o.id!=='open-room-leaf-OP-ENT-01'),...dining.added],inside=(p,r)=>pointInPolygon(p,input.boundary)&&minEdgeDistance(p,input.boundary)>=r;
   const sequence=planSequence({...input,obstacles:obs,inside,goal:input.start,grid_mm,
    door:{id:entry.id,hinge:entry.h,length_mm:entry.len,open_angle_deg:270,closed_angle_deg:180}});
   entry_close_sequences.push({variant,...sequence,audit:auditSequence(sequence,{...input,obstacles:obs,inside})});
  }
 }
 return {schema:'ApartmentDiningOperationReview/1',source_scene:source.scene_revision,canonical_sha256:source.canonical_sha256,
  saved_cloud_scene:'scene-4821689',storage_revision:55,input,candidates,stages,seat_access,seat_access_boundary:accessBoundary,
  combined_door_overlays,entry_close_sequences,
  source_layout_changed:false,architecture_changed:false,
  assumptions:'Six current 510×530 mm chairs and 2000×950 mm table; pull-back and 550/600 mm seated disks are nominal occupied envelopes. A route is not comfort, posture, tray or accessibility certification.'};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const r=runStudy({progress:true});
 if(process.argv.includes('--write'))fs.writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(r,null,2)+'\n');
 console.log(JSON.stringify({stages:r.stages.length,seat_access:r.seat_access.map(r=>({variant:r.variant,id:r.chair_id,status:r.status})),
  candidates:r.candidates.map(c=>({id:c.id,scene:c.scene_revision,validation:c.validation}))}));
}
