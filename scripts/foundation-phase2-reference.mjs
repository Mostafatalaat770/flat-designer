/**
 * Phase2 read-only K12 reference proving timeline collisions and gross !=
 * usable cabinet access. No real product/occupant dimensions are asserted.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,polygonGap} from '../studio/analysis/geometry.mjs';
import {analyzeOccupancyTimeline} from '../studio/analysis/activity.mjs';
import {auditCabinetAllocations} from '../studio/analysis/storage.mjs';

const domain=createApartmentDomain(process.cwd());
const source=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const original=JSON.parse(fs.readFileSync('design-development/k12/storage-allocation.json','utf8'));
assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
assert.equal(source.scene_revision,domain.revision(source.layout));
const wic=domain.model.rooms.find(x=>x.id==='WIC-01');assert.ok(wic);
const wardrobes=source.layout.furniture.filter(f=>f.room_id==='WIC-01'&&f.type==='wardrobe');
assert.equal(wardrobes.length,2);
const front=wardrobes.map(f=>({id:f.id,polygon:rectangle(f),provenance:'K12 base wardrobe concept / canonical room'}));
assert.equal(polygonGap(front[0].polygon,front[1].polygon),1335);
const actor=(id,position,radius_mm=175)=>({id,position,radius_mm,role:'ILLUSTRATIVE circular person, not verified body'});
const crossing=analyzeOccupancyTimeline({room:wic.poly,static_obstacles:front,frames:[
 {id:'opposite-endpoints',t_ms:0,actors:[
  actor('walking-to-ensuite',[4734,7200]),
  actor('reaching-across-dressing',[4480,7560])
 ]},
 {id:'finished',t_ms:1000,actors:[
  actor('walking-to-ensuite',[4734,7960]),
  actor('reaching-across-dressing',[4980,7560])
 ]}
],max_motion_sample_mm:20});
const mid=crossing.intervals[0].actor_pair_swept_motion[0];
assert.equal(crossing.frames[0].actor_pairs[0].collision,false);
assert.equal(crossing.frames[1].actor_pairs[0].collision,false);
assert.equal(mid.collision,true,'Crossing should collide during movement, unseen by static frame comparison');
const door=analyzeOccupancyTimeline({room:wic.poly,static_obstacles:front,frames:[
 {id:'hinges-closed',t_ms:0,actors:[actor('standing-at-center',[4734,7580],150)],
  doors:[
   {id:'north-wing',polygon:rectangle({cx:5046.5,cy:6915,w:625,d:18,rot:0})}
  ]},
 {id:'north-wing-opening-through-center',t_ms:800,actors:[actor('standing-at-center',[4734,7580],150)],
  doors:[{id:'north-wing',sweep:{
   hinge:[4734,6915],length_mm:625,thickness_mm:18,
   closed_angle_deg:0,open_angle_deg:90,step_deg:2,
   provenance:'Illustrative 625mm face width / NOT a selected hinge or measured pivot'
  }}]}
]});
assert.ok(door.frames[0].actor_clearances[0].clearance_mm>0);
assert.ok(door.frames[1].actor_clearances[0].clearance_mm<0);
assert.equal(door.status,'MODEL_CONFLICT');
const rear=original.allocations.find(x=>x.id==='island-rear-wide');assert.ok(rear);
assert.equal(rear.usable_width_estimate_mm,564);
assert.equal(rear.usable_depth_estimate_mm,359);
const baseBay={
 id:'K12-island-rear-wide',
 net_mm:{
  width_mm:rear.usable_width_estimate_mm,
  depth_mm:rear.usable_depth_estimate_mm,
  height_mm:260 // solely hypothetical example, K12 JSON does NOT verify internal shelf height
 },
 source_reference:'K12 storage-allocation.json estimates 564x359 mm; 260 mm shelf height illustration only'
};
const dailyPlates=[{id:'sample-280mm-dinner-plate',size_mm:{width_mm:280,depth_mm:280,height_mm:30},
 quantity:8,stackable:true}];
const assess=openingWidth=>auditCabinetAllocations({
 bays:[{...baseBay,access:{kind:openingWidth<300?'sliding':'hinged',
  clear_width_mm:openingWidth,clear_height_mm:220}}],
 inventory:dailyPlates,
 allocations:[{id:'eight-sample-plates',bay_id:baseBay.id,item_id:dailyPlates[0].id,count:8}]
});
const narrow=assess(245),wide=assess(530);
assert.equal(narrow.inspections[0].status,'NO_ITEM_FIT');
assert.equal(wide.inspections[0].status,'SINGLE_TYPE_FIT_PLAUSIBLE');
const report={
 schema:'ApartmentPhase2RealSourceDemo/1',status:'ILLUSTRATIVE_TIME_AND_STORAGE_SCENARIOS',
 canonical_sha256:source.canonical_sha256,parent_scene_revision:source.scene_revision,
 canonical_wardrobe_gap_mm:1335,
 crossing:{
  no_collision_at_initial_or_final_sample:true,
  analytically_detected_between_samples:mid,
  input_envelope:'Both moving occupant radii 175mm; straight-line velocities; not ergonomic trajectories',
  code_approved:false
 },
 hinged_leaf:{
  closed_frame_clearance_mm:door.frames[0].actor_clearances[0].clearance_mm,
  during_sweep_clearance_mm:door.frames[1].actor_clearances[0].clearance_mm,
  wing_mm:625,door_sweep_sample_count:door.frames[1].door_sweep_sample_count,
  product_hinge_selected:false
 },
 kitchen_storage:{
  source_model_estimated_width_mm:rear.usable_width_estimate_mm,
  source_model_estimated_depth_mm:rear.usable_depth_estimate_mm,
  hypothetical_shelf_height_mm:260,
  hypothetical_dinner_plate_mm:[280,280,30],
  hypothetical_reachable_slider_aperture_mm:245,
  hypothetical_hinged_aperture_mm:530,
  narrow_access_result:narrow.inspections[0].status,
  wide_access_result:wide.inspections[0].status,
  critical_caveat:'Same outer cabinet: access geometry changes practical ability to insert a plate. Values for hinge/aperture and shelf height are ILLUSTRATIVE and not K12 verified manufacturing data.'
 },
 unresolved_real_world:['actual dressing persons, walking routes, wardrobe hardware pivots and door stacks',
 'actual cabinet carcass, shelves, hinges, sliding clear opening, household plates and other mixed objects',
 'survey of finished walls and all drainage/MEP/structure approvals'],
 recommendation:'Use phase2 engine for rejecting obvious interactions but only select fabrication design after product/site/inventory verification.',
 architecture_status:'K12 render-only open separator has inherited two canonical failures, not removed or approved by this program.'
};
fs.mkdirSync('review-evidence/foundation',{recursive:true});
fs.writeFileSync('review-evidence/foundation/phase2-real-source-demo.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({schema:report.schema,
 crossing:{start_free:true,finish_free:true,mid_conflict:mid.collision,closest_clearance_mm:mid.min_clearance_mm},
 door:{closed_clear_mm:report.hinged_leaf.closed_frame_clearance_mm,sweep_clear_mm:report.hinged_leaf.during_sweep_clearance_mm},
 storage:{access245:narrow.inspections[0].status,access530:wide.inspections[0].status},
 outstanding:report.unresolved_real_world},null,2));
