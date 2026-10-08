/**
 * A13 owner-first alternative: redistribute existing six seats a few cm
 * inward along the SAME 2000×950 dining table, to relieve east-island prep
 * bottleneck without moving walls/table/air fryer/kitchen services.
 *
 * Every result is a planning proxy from unchanged Type B/K12 geometry.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {kitchenFamilyMetrics} from '../studio/analysis/kitchen-dining.mjs';
import {rectangle,polygonGap} from '../studio/analysis/geometry.mjs';

const domain=createApartmentDomain(process.cwd());
const source=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const audit=JSON.parse(fs.readFileSync('design-development/k12/function-audit.json','utf8'));
assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
assert.equal(source.scene_revision,domain.revision(source.layout));
assert.equal(source.architecture_variant.render_only,true);
const validate=l=>{try{return domain.validate(l)}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const failure=l=>validate(l).checks.filter(x=>x.status==='FAIL').map(x=>[x.kind,x.object_id??null,x.source_wall_index??null]);
const originalFailures=failure(source.layout);
assert.equal(originalFailures.length,2);
const room=domain.model.rooms.find(x=>x.id==='RECP-01');
assert.ok(room);
const sides={left:['starter-36','starter-38'],right:['starter-37','starter-39']};
const six=['starter-36','A2-dining-chair-north-centre','starter-37',
 'starter-38','A2-dining-chair-south-centre','starter-39'];
const oldSourceFurniture=source.layout.furniture;
const byId=(list,id)=>{const f=list.find(x=>x.id===id);assert.ok(f,id);return f;};
const xRight=Math.max(...room.poly.map(x=>x[0]));
const results=[];
fs.mkdirSync('design-development/advisor/a13',{recursive:true});
for(const inset of [0,60,75,100]){
 const scene=structuredClone(source);
 for(const id of sides.left)byId(scene.layout.furniture,id).cx+=inset;
 for(const id of sides.right)byId(scene.layout.furniture,id).cx-=inset;
 const unchanged=arr=>arr.filter(o=>!sides.left.concat(sides.right).includes(o.id));
 assert.deepEqual(unchanged(scene.layout.furniture),unchanged(source.layout.furniture));
 assert.deepEqual(scene.layout.rooms,source.layout.rooms);
 assert.deepEqual(scene.layout.interior,source.layout.interior);
 assert.deepEqual(scene.layout.decor,source.layout.decor);
 assert.deepEqual(scene.architecture_variant,source.architecture_variant);
 const sixCurrent=six.map(id=>byId(scene.layout.furniture,id));
 assert.equal(sixCurrent.length,6);
 assert.ok(sixCurrent.every(o=>o.w===510&&o.d===530));
 assert.equal(byId(scene.layout.furniture,'starter-35').w,2000);
 const neighbourCentreDistance=700-inset;
 const neighborBoxEdgeGap=neighbourCentreDistance-510;
 assert.ok(neighborBoxEdgeGap>=90,'Do not crush pair spacing below 90mm nominal chair edge gap');
 const westmost=Math.min(...sixCurrent.map(o=>o.cx-o.w/2));
 const eastmost=Math.max(...sixCurrent.map(o=>o.cx+o.w/2));
 assert.ok(westmost>13670&&eastmost<15670,'Keep all chairs notionally within table 2000mm length footprint');
 // Test BOTH wet-island locations, using the parent scene for snapshot provenance,
 // but changing only 4 centre X positions of the existing six seats.
 const scenario=[];
 for(const shift of [0,150])for(const radius of [180,220]){
  const z=kitchenFamilyMetrics({layout:scene.layout,
   audit:{...audit,reception_room_polygon:room.poly,source_revision:source.scene_revision},
   island_shift_mm:shift,chairs_pullback_mm:350,dining_agent_radius_mm:radius,route_grid_mm:50});
  scenario.push({wet_shift_mm:shift,assumed_person_radius_mm:radius,
   estimated_end_prep_vs_nearest_chair_mm:z.dining.closest_prep_operator_to_chair.gap_mm,
   reception_route_status:z.dining.local_reception_route.status,
   furniture_only_route_status:z.dining.route_debug.with_dining_and_island_only,
   empty_control:z.dining.route_debug.no_furniture_control});
 }
 assert.ok(scenario.every(x=>x.empty_control==='MODEL_ROUTE_FOUND'));
 assert.equal(scenario[0].estimated_end_prep_vs_nearest_chair_mm,510+inset);
 scene.name='A13 six-seat table unchanged, side chairs inward '+inset+'mm';
 scene.scene_revision=domain.revision(scene.layout);
 assert.deepEqual(failure(scene.layout),originalFailures);
 scene.views=source.views.filter(x=>['J1-dining-kitchen','J1-living-kitchen','K10-island-working-front'].includes(x.id));
 assert.equal(scene.views.length,3);
 if([0,75,100].includes(inset)){
  fs.writeFileSync('design-development/advisor/a13/chairs-inward-'+inset+'.json',JSON.stringify(scene,null,2)+'\n');
 }
 results.push({
  chair_end_inset_mm:inset,scene_revision:scene.scene_revision,
  table_unchanged_2000x950:true,seats_retained:6,
  adjacent_chair_centre_spacing_mm:neighbourCentreDistance,
  adjacent_chair_shell_gap_mm:neighborBoxEdgeGap,
  end_prep_person_to_closest_seat_mm:scenario[0].estimated_end_prep_vs_nearest_chair_mm,
  eastmost_chair_to_room_east_boundary_nominal_mm:xRight-eastmost,
  experiments:scenario,
  tradeoff:'Moving end chairs inward increases end-of-island gap but compresses person/armrest seating intervals; need actual chairs, elbows, dining style and site test.'
 });
}
assert.deepEqual(results.map(x=>x.end_prep_person_to_closest_seat_mm),[510,570,585,610]);
assert.deepEqual(results.map(x=>x.adjacent_chair_shell_gap_mm),[190,130,115,90]);
// VISUAL QA: previous kitchen-centered A12 cameras were valid but did not show
// the six dining chairs. Compare combined +150 island with normal vs symmetric
// +75 chair grouping from TWO deliberately aimed dining cameras. Coordinates
// are transformed from immutable canonical Type B [x,y] mm to 3D metres.
const model=domain.model;
const world=(p,h)=>[(p[0]-model.width_mm/2)/1000,h,(p[1]-model.depth_mm/2)/1000];
const cameraDefs=[
 {id:'A13-living-to-six-seat',from:[10800,3350],aim:[14200,7950]},
 {id:'A13-six-seat-eye',from:[13250,9440],aim:[14400,7600]},
 {id:'A13-dining-to-island-end',from:[15050,9350],aim:[12900,6450]}
];
const combined=[];
for(const inset of [0,75]){
 const scene=structuredClone(source);
 for(const id of sides.left)byId(scene.layout.furniture,id).cx+=inset;
 for(const id of sides.right)byId(scene.layout.furniture,id).cx-=inset;
 byId(scene.layout.furniture,'E2-island').cy-=150;
 byId(scene.layout.furniture,'E2-island-sink').cy-=150;
 scene.name='A13 combined island north 150mm, six seats symmetric inset '+inset+'mm';
 scene.scene_revision=domain.revision(scene.layout);
 assert.deepEqual(failure(scene.layout),originalFailures,'Visual comparison cannot alter unapproved architecture set');
 scene.views=cameraDefs.map(d=>({id:d.id,room_id:'RECP-01',
  camera:domain.captureCamera(scene.layout,{
   room_id:'RECP-01',position:world(d.from,1.70),target:world(d.aim,1.35),fov:42
  })
 }));
 assert.equal(scene.views.length,3);
 const file='design-development/advisor/a13/combined-island150-seats'+inset+'.json';
 fs.writeFileSync(file,JSON.stringify(scene,null,2)+'\n');
 combined.push({inset_mm:inset,scene_revision:scene.scene_revision,file,
  camera_ids:scene.views.map(x=>x.id),
  cameras:scene.views.map(x=>x.camera)});
}
assert.deepEqual(combined[0].camera_ids,combined[1].camera_ids);
assert.deepEqual(combined[0].cameras,combined[1].cameras,
 'Two scenarios must have EXACT same three real-camera views');

const output={
 schema:'ApartmentA13SixSeatDistribution/1',
 status:'EXPLORATORY_INVISIBLE_LAYOUT_IMPROVEMENT_ONLY',
 canonical_sha256:source.canonical_sha256,parent_scene_revision:source.scene_revision,
 original_structural_failures:originalFailures,
 options:results,
 combined_dining_focused_snapshots:combined.map(({cameras,...rest})=>rest),
 visual_design_tradeoff:'Maintain 2000×950 table, original six chairs, and architectural plan. Redistribute left/right endpoint seats symmetrically: 60/75/100mm inward. Actual centre-to-centre seating shrinks 700→600mm at 100mm inset. Not proof of 3 comfortable people per side.',
 context:'A12 K12→+150mm north improves DW loading but still leaves original 510mm nominal prep/nearest dining chair pinch. A13 aims at the seating problem WITHOUT altering island wet-service location or dining table.',
 decision:'Do not choose a seating shift until real chair arms/body widths and family mockup: 75mm seat inset gives nominal 585mm prep gap/625mm centre spacing; 100mm inset gives 610mm gap but only 600mm between adjacent chair centres. Either may be preferable but six adult comfort is TBD.',
 construction_status:'NO_STRUCTURAL_OR_MEP_APPROVAL; immutable parent Type B. Shift occurs only in independent read-only study snapshots.',
 limits:['Image-calibrated room and furniture footprints, not finished measurements',
  'Chairs appear as solid boxes: occupied bodies, pullout kinematics, elbow spacing, table leg position and floor cleaning need site/product tests',
  'Modeled 180/220mm radius person and 350mm chair pullback are hypothetical sensitivity settings',
  'Reception route not a path through the still-unapproved K12 kitchen-opening wall']
};
fs.writeFileSync('review-evidence/advisor-a13-seat-options.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({schema:output.schema,source:output.parent_scene_revision,
 options:results.map(o=>({inset:o.chair_end_inset_mm,prep_gap:o.end_prep_person_to_closest_seat_mm,
  chair_side_gap:o.adjacent_chair_shell_gap_mm,
  route_modes:o.experiments.map(r=>({shift:r.wet_shift_mm,r:r.assumed_person_radius_mm,route:r.reception_route_status}))})),
 structural_fails:originalFailures.length},null,2));
