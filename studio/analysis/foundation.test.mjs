import test from 'node:test';
import assert from 'node:assert/strict';
import {rectangle,pointInPolygon,relation,overlapAreaConvex,polygonGap,
 hingeLeaf,sweepLeaf,sweepRelation} from './geometry.mjs';
import {findPlanRoute,checkActivityStages} from './route.mjs';
import {dimension,difference,compareAgainstRequirement,compareOptions} from './evidence.mjs';
const box=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const close=(a,b,t=1e-5)=>assert.ok(Math.abs(a-b)<=t,String(a)+' not approximately '+String(b));
test('rotation-aware solids: overlapping AABB is NOT actual collision for 45-degree furniture',()=>{
 const a=rectangle({cx:0,cy:0,w:100,d:100,rot:45});
 const b=rectangle({cx:100,cy:100,w:100,d:100,rot:45});
 assert.ok(Math.max(...a.map(p=>p[0]))>Math.min(...b.map(p=>p[0]))); // old AABB false positive
 assert.equal(relation(a,b).touches,false);
 assert.ok(relation(a,b).gap_mm>0);
 close(relation(a,a).overlap_area_mm2,10000);
});
test('rotated rectangle distances obey rotational geometry',()=>{
 const a=rectangle({cx:0,cy:0,w:200,d:80,rot:90});
 const b=box(50,-200,100,-150);
 close(polygonGap(a,b),Math.hypot(10,50));
});
test('non-convex room polygon support; never fake overlap AREA for concave polygons',()=>{
 const L=[[0,0],[10,0],[10,2],[2,2],[2,10],[0,10]];
 assert.equal(pointInPolygon([1,9],L),true);
 assert.equal(pointInPolygon([8,8],L),false);
 assert.equal(pointInPolygon([2,5],L),true);
 assert.throws(()=>overlapAreaConvex(L,box(0,0,3,3)),/convex/);
});
test('touching is zero-width passage, not positive area',()=>{
 const a=box(0,0,100,100),b=box(100,0,150,100);
 const r=relation(a,b);
 assert.equal(r.touches,true);assert.equal(r.gap_mm,0);
 assert.equal(r.intersects_positive_area,false);
});
test('opposing wardrobe doors: 625mm leaves leave 85mm, 312.5mm leaves leave 710mm',()=>{
 const a=hingeLeaf({hinge:[0,0],length_mm:625,angle_deg:90});
 const b=hingeLeaf({hinge:[0,1335],length_mm:625,angle_deg:-90});
 close(polygonGap(a,b),85);
 const c=hingeLeaf({hinge:[0,0],length_mm:312.5,angle_deg:90});
 const d=hingeLeaf({hinge:[0,1335],length_mm:312.5,angle_deg:-90});
 close(polygonGap(c,d),710);
 const sweep=sweepLeaf({hinge:[0,0],length_mm:625,closed_angle_deg:0,open_angle_deg:90});
 assert.equal(sweep.length,46);
 assert.equal(sweepRelation(sweep,box(380,380,430,430)).any_intersection,true);
});
test('generic circle occupancy route finds a valid detour but refuses a gap too narrow for the assumed body',()=>{
 const room=box(0,0,3000,3000),start=[500,500],goal=[2500,500];
 const withGap=findPlanRoute({room,obstacles:[box(1400,0,1600,2600)],start,goal,agent_radius_mm:120,grid_mm:50});
 assert.equal(withGap.status,'MODEL_ROUTE_FOUND');
 assert.ok(withGap.distance_mm>2000);
 const noGap=findPlanRoute({room,obstacles:[box(1400,0,1600,2850)],start,goal,agent_radius_mm:120,grid_mm:50});
 assert.equal(noGap.status,'NO_MODEL_ROUTE');
});
test('nominal door/occupancy stages are independent and identify when path is blocked',()=>{
 const room=box(0,0,3000,3000);
 const stages=checkActivityStages({room,grid_mm:50,agent_radius_mm:120,
  stages:[
   {id:'closed',start:[500,500],goal:[2500,500],obstacles:[]},
   {id:'open-leaf',start:[500,500],goal:[2500,500],obstacles:[{id:'door-open',polygon:box(1400,0,1600,2850)}]}
  ]});
 assert.equal(stages[0].status,'MODEL_ROUTE_FOUND');
 assert.equal(stages[1].status,'NO_MODEL_ROUTE');
 assert.deepEqual(stages[1].source_ids,['door-open']);
});
test('source evidence forces uncertain calibrated dimensions to declare error bounds',()=>{
 assert.throws(()=>dimension({value_mm:1000,uncertainty_mm:0,source:'image_calibrated',reference:'plan'}),/may not claim zero/);
 assert.throws(()=>dimension({value_mm:1000,uncertainty_mm:3,source:'site_measured',reference:'site'}),/verification name/);
 const a=dimension({value_mm:720,uncertainty_mm:40,source:'image_calibrated',reference:'TypeB v0.2.2 image-calibrated'});
 const b=dimension({value_mm:700,uncertainty_mm:0,source:'manufacturer_drawing',reference:'sample manual'});
 const x=difference(a,b);
 assert.equal(x.verdict,'UNCERTAIN_OVERLAP');
 const check=compareAgainstRequirement(a,700,{purpose:'assumed dry-route clearance',authority:'owner planning proxy'});
 assert.equal(check.result,'UNCERTAIN_AT_THRESHOLD');
});
test('multiple objectives produce transparent trade-offs instead of a magic scalar rating',()=>{
 const input=[
  {id:'K12',metrics:{dw:{value_mm:570,uncertainty_mm:20},lounge:{value_mm:1658,uncertainty_mm:20}},gates:{structure:'unknown',drain:'passed'}},
  {id:'A7+150',metrics:{dw:{value_mm:720,uncertainty_mm:20},lounge:{value_mm:1508,uncertainty_mm:20}},gates:{structure:'unknown',drain:'unknown'}},
  {id:'WORSE',metrics:{dw:{value_mm:500,uncertainty_mm:20},lounge:{value_mm:1400,uncertainty_mm:20}},gates:{structure:'unknown',drain:'unknown'}},
  {id:'UNBUILDABLE',metrics:{dw:{value_mm:800,uncertainty_mm:20},lounge:{value_mm:1800,uncertainty_mm:20}},gates:{structure:'failed',drain:'unknown'}}
 ];
 const result=compareOptions({candidates:input,objectives:[{key:'dw',goal:'maximize'},{key:'lounge',goal:'maximize'}],requiredGates:['structure','drain']});
 assert.equal(result.candidates.find(x=>x.id==='K12').status,'PROVISIONAL_PARETO');
 assert.equal(result.candidates.find(x=>x.id==='A7+150').status,'PROVISIONAL_PARETO');
 assert.equal(result.candidates.find(x=>x.id==='WORSE').status,'NOMINALLY_DOMINATED');
 assert.equal(result.candidates.find(x=>x.id==='UNBUILDABLE').status,'BLOCKED_HARD_GATE');
});
