/**
 * Advisor A12: exact K12 vs A7+150 wet island family operation study.
 *
 * Source: frozen canonical v0.2.2 and K12 (unapproved) render-only overlay.
 * Tests six pulled-out dining chairs + DW loading + opposite cabinetry and
 * person path in reception separately. Writes two SAME-camera snapshot
 * candidates and a machine-readable decision audit. NEVER touches master.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {kitchenFamilyMetrics} from '../studio/analysis/kitchen-dining.mjs';
import {rectangle,relation,polygonGap} from '../studio/analysis/geometry.mjs';
import {compareOptions} from '../studio/analysis/evidence.mjs';

const root=process.cwd(),load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const domain=createApartmentDomain(root);
const source=load('design-development/k12/snapshot.json');
const model=domain.model;
const audit=load('design-development/k12/function-audit.json');
const storage=load('design-development/k12/storage-allocation.json');
assert.equal(source.canonical_sha256,model.canonical_sha256);
assert.equal(source.scene_revision,domain.revision(source.layout));
assert.equal(audit.scene_revision,source.scene_revision);
assert.equal(source.architecture_variant.render_only,true);
assert.equal(storage.not_a_family_inventory,true);
const validate=layout=>{try{return domain.validate(layout);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const fails=layout=>validate(layout).checks.filter(c=>c.status==='FAIL')
 .map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
const inherited=fails(source.layout);
assert.equal(inherited.length,2,'Never hide original kitchen-opening canonical FAILs');
const referenceRoom=model.rooms.find(r=>r.id==='RECP-01');
assert.ok(referenceRoom);
const find=(layout,id)=>{
 const o=layout.furniture.find(f=>f.id===id);
 assert.ok(o,id);return o;
};
const dir='design-development/advisor/a12';
fs.mkdirSync(dir,{recursive:true});
const scenarios=[];
const snapshots=[];
const altered=[];
for(const shift of [0,150]){
 const next=structuredClone(source);
 const island=find(next.layout,'E2-island'),sink=find(next.layout,'E2-island-sink');
 island.cy-=shift;sink.cy-=shift;
 if(shift){
  island.name='A12 conditional wet island north 150mm: drain/supply/structure TBD';
  sink.name='A12 conditional sink follows wet island 150mm: MEP TBD';
 }
 next.name='A12 family-use K12 wet island north '+shift+'mm';
 next.scene_revision=domain.revision(next.layout);
 const allOther=f=>f.filter(x=>!['E2-island','E2-island-sink'].includes(x.id));
 assert.deepEqual(allOther(next.layout.furniture),allOther(source.layout.furniture));
 assert.deepEqual(next.layout.rooms,source.layout.rooms);
 assert.deepEqual(next.layout.interior,source.layout.interior);
 assert.deepEqual(next.layout.studio,source.layout.studio);
 assert.deepEqual(next.layout.decor,source.layout.decor);
 assert.deepEqual(next.architecture_variant,source.architecture_variant);
 assert.deepEqual(fails(next.layout),inherited);
 assert.equal(island.w,1700);assert.equal(island.d,1000);
 assert.equal(sink.cy-island.cy,200,'Sink not actually following island service position');
 assert.equal(island.cx,11750);
 assert.equal(find(next.layout,'starter-35').w,2000);
 const helper={...audit,reception_room_polygon:referenceRoom.poly,source_revision:next.scene_revision};
 const states=[];
 for(const pullback of [0,350]){
  for(const radius of [180,220]){
   const z=kitchenFamilyMetrics({layout:next.layout,audit:helper,island_shift_mm:0,
     chairs_pullback_mm:pullback,dining_agent_radius_mm:radius,route_grid_mm:100});
   states.push(z);
  }
 }
 const baseline=states.find(x=>x.dining.chair_pullback_mm===350&&x.dining.hypothetical_person_radius_mm===180);
 assert.ok(baseline);
 const door=baseline.dishwasher;
 assert.equal(door.door_to_pantry_closed_face_mm,shift===0?570:720);
 assert.equal(door.standing_body_nominal_buffer_mm,shift===0?-30:120);
 assert.equal(baseline.west_cook_projected_gap_mm,1219);
 assert.equal(baseline.dining.six_seats,6);
 assert.equal(baseline.dining.closest_prep_operator_to_chair.gap_mm,510);
 const lounge=baseline.island_to_lounge_nominal_gap_mm;
 // Different from simple axis-projection used in older A7; true nearest
 // polygon gap need not move exactly by 150mm after an angled seat corner.
 states.forEach(x=>{
  assert.ok(['MODEL_ROUTE_FOUND','NO_MODEL_ROUTE','ENDPOINT_BLOCKED'].includes(x.dining.local_reception_route.status));
 });
 scenarios.push({
  shift_mm:shift,scene_revision:next.scene_revision,
  dishwasher_open_remain_mm:door.door_to_pantry_closed_face_mm,
  open_dw_plus_nominal_600mm_body_buffer_mm:door.standing_body_nominal_buffer_mm,
  dw_door_vs_oven_open_gap_mm:door.door_to_oven_open_gap_mm,
  dw_user_overlaps_pantry:door.user_overlaps_pantry,
  west_cook_projected_mm:baseline.west_cook_projected_gap_mm,
  island_to_lounge_nearest_rotated_polygons_mm:lounge,
  end_prep_to_closest_chair_gap_mm:baseline.dining.closest_prep_operator_to_chair.gap_mm,
  six_chairs_pulled_mm:350,
  modes:states.map(x=>({
   chair_pullback_mm:x.dining.chair_pullback_mm,
   assumed_person_radius_mm:x.dining.hypothetical_person_radius_mm,
   reception_only_route_status:x.dining.local_reception_route.status,
   reception_only_route_length_mm:x.dining.local_reception_route.distance_mm,
   note:'In original canonical RECP polygon only. No unapproved kitchen threshold crossing permitted.'
  }))
 });
 const viewIds=['J1-dining-kitchen','J1-living-kitchen','K10-island-working-front'];
 next.views=source.views.filter(v=>viewIds.includes(v.id));
 assert.deepEqual(next.views.map(v=>v.id),viewIds,'Matched camera set required');
 const file=path.join(dir,'a12-wet-island-'+shift+'.json');
 fs.writeFileSync(file,JSON.stringify(next,null,2)+'\n');
 snapshots.push({file,scene_revision:next.scene_revision,views:next.views.map(v=>v.id)});
 if(shift)altered.push(...['E2-island','E2-island-sink']);
}
assert.equal(scenarios[1].dishwasher_open_remain_mm-scenarios[0].dishwasher_open_remain_mm,150);
assert.ok(scenarios[1].dw_door_vs_oven_open_gap_mm>scenarios[0].dw_door_vs_oven_open_gap_mm);
const pareto=compareOptions({
 candidates:scenarios.map(s=>({
  id:'wet-island-'+s.shift_mm,
  metrics:{
   dw_aisle:{value_mm:s.dishwasher_open_remain_mm,uncertainty_mm:100},
   lounge_buffer:{value_mm:s.island_to_lounge_nearest_rotated_polygons_mm,uncertainty_mm:100}
  },
  gates:{structure:'unknown',island_plumbing:'unknown',site_survey:'unknown',
   selected_appliance_manuals:'unknown'}
 })),
 objectives:[{key:'dw_aisle',goal:'maximize'},{key:'lounge_buffer',goal:'maximize'}],
 requiredGates:['structure','island_plumbing','site_survey','selected_appliance_manuals']
});
const report={
 schema:'ApartmentA12KitchenDiningFamilySprint/1',
 source:{canonical_sha256:source.canonical_sha256,
  source_scene_revision:source.scene_revision,
  unapproved_architecture_variant:source.architecture_variant.id},
 status:'EXPLORATORY_FUNCTIONAL_REVIEW',
 changed_objects_for_150mm:['E2-island','E2-island-sink'],
 original_canonical_failures:inherited,
 validation:'SOURCE_GEOMETRY_AND_SCENE_REVISION_CHECKED; no new geometry or approval',
 functional_measures:scenarios,
 pareto,
 workflow_gates:{
  family:'Six dining chairs pulled back by 350mm, appliance loading area & sample person sensitivity considered',
  cabinet_inventory:'NOT VERIFIED: reception-facing rear island shelves still separated from dishwasher kitchen-side loading; count/movement path TBD',
  structural:'NOT APPROVED: open kitchen wall/structural developer review still open',
  services:'NOT ENGINEERED: wet sink relocation water supply, wastewater grade, electricity, LPG/gas/hood extraction coordination',
  product:'UNKNOWN: actual DW and oven door sweeps, pan and handles, table/chair product size and ergonomic bodies',
  construction:'BLOCKED_BY_STRUCTURAL_AND_MEP_HARD_GATES'
 },
 conceptual_design_result:'K12 +150mm is STILL conditional candidate for improved open-DW service gap, not a winner. More realistic six-chair use retains east-end operator/seat gap ~510mm; need field/product evidence before moving wet services.',
 render_snapshots:snapshots,
 limitations:[
  'RECP path is only within existing canonical reception polygon, not a route through the still-unapproved kitchen separator',
  'Chair pullback=350mm and walking-person radii=180/220mm are what-if sensitivities, not user anthropometric data, code or actual seat dimensions',
  'A 600mm rectangular DW standing user is a crude envelope, not a body biomechanics model',
  'All plan coordinates and source furniture are image-calibrated and not a site survey',
  'Room-level failures include two original K12 unapproved architectural conditions and remain outstanding'
 ],
 priority_next:[
  'First obtain structural/developer and on-site as-built confirmation for open kitchen wall',
  'Exact model manuals for dishwasher/oven/fridge plus kitchen electricity, waste/water drain and exhaust',
  'Reorient family daily plates/cups storage to optimize empty dishwasher unloading without displacing essential cooking tools',
  'Test household-selected six chairs when pulled out and seated with two adults using the prep end'
 ]
};
fs.writeFileSync('review-evidence/advisor-a12-functional.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({
 source:report.source,
 inherited_canonical_fails:inherited.length,
 kitchen:scenarios.map(s=>({shift_mm:s.shift_mm,open_dw_gap_mm:s.dishwasher_open_remain_mm,
  dw_standing_buffer_mm:s.open_dw_plus_nominal_600mm_body_buffer_mm,
  dw_oven_open_gap_mm:s.dw_door_vs_oven_open_gap_mm,
  lounge_exact_nearest_gap_mm:s.island_to_lounge_nearest_rotated_polygons_mm,
  end_prep_nearest_occupied_chair_mm:s.end_prep_to_closest_chair_gap_mm,
  local_routes:s.modes.map(z=>({chairs:z.chair_pullback_mm,radius:z.assumed_person_radius_mm,status:z.reception_only_route_status}))})),
 pareto:pareto.candidates.map(x=>({id:x.id,status:x.status,gates:x.unknown_gates})),
 snapshots
},null,2));
