import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeOccupancyTimeline,closestApproachLinear} from './activity.mjs';
import {estimateCabinetNet,auditCabinetAllocations} from './storage.mjs';
const box=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const room=box(0,0,3000,3000);
const actor=(id,x,y,radius_mm=200)=>({id,position:[x,y],radius_mm});
test('analytical moving-actor collision is detected BETWEEN frames even when endpoints are free',()=>{
 const result=analyzeOccupancyTimeline({room,frames:[
  {id:'start',t_ms:0,actors:[actor('cook',500,1500),actor('child',1500,500)]},
  {id:'finish',t_ms:1000,actors:[actor('cook',2500,1500),actor('child',1500,2500)]}
 ]});
 assert.equal(result.frames[0].actor_pairs[0].collision,false);
 assert.equal(result.frames[1].actor_pairs[0].collision,false);
 assert.equal(result.intervals[0].actor_pair_swept_motion[0].collision,true);
 assert.equal(result.intervals[0].actor_pair_swept_motion[0].closest_at_ms,500);
 assert.equal(result.status,'MODEL_CONFLICT');
});
test('analytical no-conflict case does not fabricate a collision',()=>{
 const data=analyzeOccupancyTimeline({room,frames:[
  {id:'start',t_ms:0,actors:[actor('a',500,500),actor('b',2500,500)]},
  {id:'end',t_ms:1000,actors:[actor('a',500,2500),actor('b',2500,2500)]}
 ]});
 assert.equal(data.intervals[0].actor_pair_swept_motion[0].collision,false);
 assert.equal(data.status,'NO_DETECTED_MODEL_CONFLICT');
});
test('door sweep reserves potential 90-degree opening and detects stationary person hit',()=>{
 const data=analyzeOccupancyTimeline({room,frames:[{id:'opening',t_ms:0,
  actors:[actor('standing',900,500,100)],
  doors:[{id:'door-1',sweep:{hinge:[500,500],length_mm:500,thickness_mm:20,
    closed_angle_deg:0,open_angle_deg:90,step_deg:2,provenance:'EXPLORATORY hypothetical swing'}}]
 }]});
 assert.ok(data.frames[0].door_sweep_sample_count>40);
 assert.ok(data.frames[0].actor_clearances[0].clearance_mm<=0);
 assert.equal(data.status,'MODEL_CONFLICT');
});
test('other stationary people become obstacles in a route query',()=>{
 const clear=analyzeOccupancyTimeline({room,frames:[{id:'open',t_ms:0,actors:[actor('walk',500,500,120)],
  routes:[{actor_id:'walk',goal:[2500,500]}]}],route_grid_mm:50});
 assert.equal(clear.frames[0].routes[0].status,'MODEL_ROUTE_FOUND');
 const occupied=analyzeOccupancyTimeline({room,frames:[{id:'occupied',t_ms:0,
  actors:[actor('walk',500,500,120),actor('blocker',1500,1500,1380)],
  routes:[{actor_id:'walk',goal:[2500,500]}]}],route_grid_mm:50});
 assert.notEqual(occupied.frames[0].routes[0].status,'MODEL_ROUTE_FOUND');
});
test('time ordering and actor geometry must be explicit',()=>{
 assert.throws(()=>analyzeOccupancyTimeline({room,frames:[
  {id:'a',t_ms:0,actors:[actor('x',500,500)]},
  {id:'b',t_ms:0,actors:[actor('x',600,600)]}
 ]}),/increasing times/);
 assert.throws(()=>analyzeOccupancyTimeline({room,frames:[
  {id:'a',t_ms:0,actors:[actor('x',500,500)]},
  {id:'b',t_ms:1,actors:[actor('x',600,600,100)]}
 ]}),/cannot jump/);
});
test('room or furniture solid encroachment is surfaced even for one actor',()=>{
 const data=analyzeOccupancyTimeline({room,
  static_obstacles:[{id:'dresser',furniture:{cx:1500,cy:1500,w:500,d:500,rot:30}}],
  frames:[{id:'occupy',t_ms:0,actors:[actor('person',1550,1550)]}]});
 assert.ok(data.frames[0].actor_clearances[0].clearance_mm<0);
 assert.equal(data.status,'MODEL_CONFLICT');
});
test('net cabinet estimator deducts named board/tape/hardware reserves from exterior sizes',()=>{
 const value=estimateCabinetNet({
  outer_mm:{width_mm:600,depth_mm:400,height_mm:800},
  side_mm:18,back_mm:12,top_mm:18,bottom_mm:18,toe_kick_mm:100,
  reserved_depth_mm:25,source_reference:'Illustrative cabinet carcass, not shop drawing'});
 assert.deepEqual(value.net_mm,{width_mm:564,depth_mm:363,height_mm:664});
 assert.equal(value.verified,false);
 assert.throws(()=>estimateCabinetNet({outer_mm:{width_mm:100,depth_mm:100,height_mm:100},
  side_mm:60,back_mm:10,top_mm:10,bottom_mm:10,source_reference:'example'}),/>0/);
});
const plate={id:'plate-280',size_mm:{width_mm:280,depth_mm:280,height_mm:30},quantity:8,stackable:true};
const tray={id:'tray-420',size_mm:{width_mm:420,depth_mm:320,height_mm:35},quantity:1};
const bay=(kind,width)=>({id:'rear',net_mm:{width_mm:564,depth_mm:359,height_mm:260},
 source_reference:'K12 island-rear-wide depth+width model estimate; height and opening deliberately ASSUMED',
 access:{kind,clear_width_mm:width,clear_height_mm:220}});
test('large nominal cabinet volume DOES NOT ensure plate can pass half-open slider aperture',()=>{
 const res=auditCabinetAllocations({bays:[bay('sliding',245)],inventory:[plate],
  allocations:[{id:'daily-plates',bay_id:'rear',item_id:plate.id,count:8}]});
 assert.equal(res.verdict,'REVISE_OR_REJECT');
 assert.equal(res.inspections[0].status,'NO_ITEM_FIT');
});
test('larger hinged clear opening makes same assumed dinner plate geometrically plausible, not approved',()=>{
 const res=auditCabinetAllocations({bays:[bay('hinged',530)],inventory:[plate],
  allocations:[{id:'daily-plates',bay_id:'rear',item_id:plate.id,count:8}]});
 assert.equal(res.inspections[0].status,'SINGLE_TYPE_FIT_PLAUSIBLE');
 assert.equal(res.verdict,'PLAUSIBLE_BUT_NOT_PROVEN');
});
test('unknown aperture and mixed item groups remain unresolved, not auto-certified',()=>{
 const unknown=bay('hinged',530);delete unknown.access;
 const z=auditCabinetAllocations({bays:[unknown],inventory:[plate],
  allocations:[{id:'plates',bay_id:'rear',item_id:'plate-280',count:8}]});
 assert.equal(z.inspections[0].status,'ACCESS_UNVERIFIED');
 assert.ok(z.unresolved.includes('plates'));
 const mixed=auditCabinetAllocations({bays:[bay('hinged',530)],inventory:[plate,tray],allocations:[
  {id:'plates',bay_id:'rear',item_id:'plate-280',count:8},
  {id:'tray',bay_id:'rear',item_id:'tray-420',count:1}
 ]});
 assert.ok(mixed.unresolved.includes('rear:mixed-packing'));
});
test('overallocated inventory or impossible quantity is explicitly reported',()=>{
 const res=auditCabinetAllocations({bays:[bay('hinged',530)],inventory:[{...plate,quantity:900}],
  allocations:[{id:'plates',bay_id:'rear',item_id:plate.id,count:900}]});
 assert.equal(res.verdict,'REVISE_OR_REJECT');
 assert.equal(res.inspections[0].status,'EXCEEDS_SINGLE_TYPE_UPPER_BOUND');
});
