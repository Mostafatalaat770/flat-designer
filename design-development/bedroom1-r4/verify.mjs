import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../../studio/domain/apartment.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';
import {rectangle,relation,hingeLeaf,sweepLeaf,sweepRelation,pointInPolygon} from '../../studio/analysis/geometry.mjs';

const dir=import.meta.dirname,root=path.resolve(dir,'../..');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const source=read('render-snapshots/current.json');
const proposal=read('design-development/bedroom1-r4/proposal.json');
const snapshot=read('design-development/bedroom1-r4/snapshot.json');
const domain=createApartmentDomain(root),model=domain.model;
assert.equal(source.scene_revision,'scene-9cf45a73','Rebase this study when the review source changes.');
assert.equal(source.storage_revision,55);
assert.equal(source.scene_revision,domain.revision(source.layout));
const layout=domain.applyProposal(source.layout,proposal);
assert.deepEqual(layout,snapshot.layout);
assert.equal(snapshot.scene_revision,domain.revision(layout));
assert.equal(snapshot.storage_revision,null);
assert.equal(snapshot.production_connected,false);
assert.equal(snapshot.canonical_sha256,source.canonical_sha256);
assert.deepEqual(layout.demolished,source.layout.demolished);
assert.deepEqual(layout.rooms,source.layout.rooms);
const floorIds=new Set(['starter-7','starter-8','starter-9']);
for(const f of source.layout.furniture.filter(f=>!floorIds.has(f.id)))assert.deepEqual(layout.furniture.find(x=>x.id===f.id),f,'Unrelated furniture changed: '+f.id);
for(const o of source.layout.interior.objects.filter(o=>o.id!=='V7-bedroom1-drawers'))assert.deepEqual(layout.interior.objects.find(x=>x.id===o.id),o,'Unrelated interior changed: '+o.id);
assert.deepEqual(layout.interior.surface_materials,source.layout.interior.surface_materials);
assert.deepEqual(layout.interior.opening_treatments,source.layout.interior.opening_treatments);
assert.deepEqual(layout.studio.rooms,source.layout.studio.rooms);
const validation=domain.validate(layout),beforeValidation=domain.validate(source.layout);
assert.equal(validation.summary.fail,0);
assert.ok(validation.summary.warning<=beforeValidation.summary.warning);
const room=model.rooms.find(r=>r.id==='BR-01');
const entry=model.openings.find(o=>o.id==='OP-BR01-HALL');
const door=model.doors.find(o=>o.id===entry.id);
const midpoint=entry.from.map((v,i)=>(v+entry.to[i])/2);
const tangent=entry.to.map((v,i)=>(v-entry.from[i])/entry.length_mm);
let normal=[-tangent[1],tangent[0]];
if(!pointInPolygon(midpoint.map((v,i)=>v+250*normal[i]),room.poly))normal=normal.map(v=>-v);
const start=midpoint.map((v,i)=>v+600*normal[i]);
const walls=model.wall_segments.filter(w=>w.rooms.includes(room.id)).map((w,i)=>({id:'wall-'+i,polygon:rectangle({cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI})}));
function items(l){return [...l.furniture.filter(f=>f.room_id===room.id&&f.type!=='rug'),...l.interior.objects.filter(o=>o.room_id===room.id).map(o=>domain.resolveObject(o)).filter(o=>o.bottom_mm<1800&&o.top_mm>100)];}
function occupied(l,stage={}){
 const vector=stage.closed?door.c:door.o;
 return [...items(l).filter(f=>!(stage.skip||[]).includes(f.id)).map(f=>({id:f.id,polygon:rectangle(f)})),...walls,{id:'entry-leaf',polygon:hingeLeaf({hinge:door.h,length_mm:door.len,angle_deg:Math.atan2(vector[1],vector[0])*180/Math.PI})},...(stage.extra||[]).map(f=>({id:f.id,polygon:rectangle(f)}))];
}
const collisions=[];const furniture=items(layout).filter(f=>f.type!=='artwork');
for(let i=0;i<furniture.length;i++)for(let j=i+1;j<furniture.length;j++){
 const r=relation(rectangle(furniture[i]),rectangle(furniture[j]));
 if(r.intersects_positive_area)collisions.push({a:furniture[i].id,b:furniture[j].id,...r});
}
assert.deepEqual(collisions,[]);
const swing=sweepLeaf({hinge:door.h,length_mm:door.len,closed_angle_deg:180,open_angle_deg:270,step_deg:2});
const doorChecks=furniture.map(f=>({id:f.id,...sweepRelation(swing,rectangle(f))}));
assert.ok(doorChecks.every(c=>!c.any_intersection),'Furniture obstructs inferred door sweep.');
const cases=[
 ['bed-side',[4100,2800]],['wardrobe-use',[4380,3350]],['drawers-use',[3775,4140]],
 ['desk-approach',[3770,4110]],['window-approach',[4250,2070]],
 ['seat-centre-proxy',[3020,4250],{skip:['starter-9']}]
];
const results=[];
for(const [id,goal,stage] of cases)for(const grid_mm of [50,25]){
 const obs=occupied(layout,stage),r=findPlanRoute({room:room.poly,obstacles:obs.map(o=>o.polygon),start,goal,agent_radius_mm:250,grid_mm,max_cells:60000});
 assert.equal(r.status,'MODEL_ROUTE_FOUND',id+' grid '+grid_mm);
 results.push({id,grid_mm,start,goal,obstacle_ids:obs.map(o=>o.id),...r});
}
const baseline=[];
for(const [id,goal] of [['bed-side',[4100,2800]],['wardrobe-use',[4380,3350]],['drawers-use',[2675,4140]],['window-approach',[4250,2070]]])for(const grid_mm of [50,25]){
 const r=findPlanRoute({room:room.poly,obstacles:occupied(source.layout).map(o=>o.polygon),start,goal,agent_radius_mm:250,grid_mm,max_cells:60000});
 assert.notEqual(r.status,'MODEL_ROUTE_FOUND','Baseline failure not reproduced: '+id);
 baseline.push({id,grid_mm,start,goal,...r});
}
const activities=[];
for(const stage of [
 {id:'closed-door',closed:true},
 {id:'chair-withdrawn-200',skip:['starter-9'],extra:[{id:'withdrawn-chair',cx:3220,cy:4250,w:480,d:500,rot:90}]},
 {id:'seated-user-proxy',extra:[{id:'seated-body',cx:3120,cy:4250,w:700,d:550,rot:0}]}
]){
 for(const actor of stage.extra||[])for(const f of furniture.filter(f=>f.id!=='starter-9'))assert.equal(relation(rectangle(actor),rectangle(f)).intersects_positive_area,false,'Occupation proxy collides with furniture: '+stage.id+' / '+f.id);
 for(const [id,goal] of cases.filter(c=>['bed-side','wardrobe-use','drawers-use','window-approach'].includes(c[0])))for(const grid_mm of [50,25]){
 const r=findPlanRoute({room:room.poly,obstacles:occupied(layout,stage).map(o=>o.polygon),start,goal,agent_radius_mm:250,grid_mm,max_cells:60000});
 assert.equal(r.status,'MODEL_ROUTE_FOUND',stage.id+' '+id+' grid '+grid_mm);
 activities.push({stage:stage.id,id,grid_mm,start,goal,...r});
}
}
// Full-width front opening reserve at 300 and 350 mm, with the chair in its normal position.
const openStorage=[];
for(const projection of [300,350])for(const [id,goal] of [['bed-side',[4100,2800]],['wardrobe-use',[4380,3350]],['storage-open-use',[3775,3800]],['window-approach',[4250,2070]]])for(const grid_mm of [50,25]){
 const openFront={id:'full-front-open-reserve',cx:3775,cy:4545-projection/2,w:800,d:projection,rot:0};
 for(const f of furniture.filter(f=>f.id!=='V7-bedroom1-drawers'))assert.equal(relation(rectangle(openFront),rectangle(f)).intersects_positive_area,false,'Open reserve collides: '+f.id);
 const obs=occupied(layout,{extra:[openFront]});
 const r=findPlanRoute({room:room.poly,obstacles:obs.map(o=>o.polygon),start,goal,agent_radius_mm:250,grid_mm,max_cells:60000});
 assert.equal(r.status,'MODEL_ROUTE_FOUND','Open storage '+projection+' '+id+' grid '+grid_mm);
 openStorage.push({id,assumed_projection_mm:projection,assumed_width_mm:800,grid_mm,start,goal,...r});
}
const measurements=validation.checks.filter(c=>c.room_id==='BR-01'&&['opening-obstruction','glazing-obstruction','operating-clearance'].includes(c.kind));
assert.ok(measurements.find(c=>c.object_id==='starter-7')?.measured_clearance_mm>=800);
assert.ok(measurements.find(c=>c.object_id==='V7-bedroom1-drawers')?.measured_clearance_mm>=800);
assert.equal(measurements.find(c=>c.kind==='glazing-obstruction')?.object_ids.length,0);
for(const v of snapshot.views){domain.captureCamera(layout,{room_id:v.room_id,...v.camera});domain.captureCamera(source.layout,{room_id:v.room_id,...v.camera});}
const report={schema:'Bedroom1R4Verification/1',source_scene:source.scene_revision,source_storage_revision:55,candidate_scene:snapshot.scene_revision,canonical_sha256:snapshot.canonical_sha256,summary:validation.summary,architecture_unchanged:true,unrelated_contents_unchanged:true,collisions,doorChecks,measurements,baseline,results,activities,openStorage,constraints:'Nominal fixed 2D polygons and 500 mm circular person, with a half-cell-diagonal margin. Entry starts 600 mm inside the opening. Door hinges are inferred. Seat and occupation proxies are static, not a human posture or chair motion simulation. Full-width 300 and 350 mm projections are hypothetical front-opening reserves, not selected product geometry; they are tested with the chair in its normal position. Storage is narrowed from 1000 to 800 mm and raised from 800 to 1000 mm, with equal nominal outer volume; internal capacity is not established. Wardrobe shifts 120 mm north. Desk length reduced by 100 mm. Site, skirting, chair, window sash and actual wardrobe/storage leaves remain to be measured.'};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({candidate:snapshot.scene_revision,validation:validation.summary,route_checks:results.length,activity_checks:activities.length,reproduced_baseline_failures:baseline.length,collisions:collisions.length,openStorage:openStorage.map(r=>({grid_mm:r.grid_mm,status:r.status,reason:r.reason})),measurements}));
