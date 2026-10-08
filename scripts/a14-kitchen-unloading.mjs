/**
 * A14 family-first kitchen storage decisions after A12/A13:
 * exact cabinet source estimates, with unambiguously hypothetical sample
 * utensils and manufactured apertures. No real family inventory yet.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {evaluateDishWorkflow} from '../studio/analysis/dishwasher-storage.mjs';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const domain=createApartmentDomain(process.cwd()),s=read('design-development/k12/snapshot.json'),
 source=read('design-development/k12/storage-allocation.json'),
 audit=read('design-development/k12/function-audit.json');
assert.equal(s.canonical_sha256,domain.model.canonical_sha256);
assert.equal(s.scene_revision,domain.revision(s.layout));
assert.equal(source.schema,'KitchenStorageAllocation/2');
assert.equal(source.not_a_family_inventory,true);
assert.equal(audit.scene_revision,s.scene_revision);
assert.equal(s.architecture_variant.render_only,true);
let v;try{v=domain.validate(s.layout)}catch(e){if(e.validation)v=JSON.parse(JSON.stringify(e.validation));else throw e;}
const inherited=v.checks.filter(c=>c.status==='FAIL').map(c=>({kind:c.kind,object_id:c.object_id??null,source_wall_index:c.source_wall_index??null}));
assert.equal(inherited.length,2);
const a=id=>{const x=source.allocations.find(c=>c.id===id);assert.ok(x,id);return x;};
const rear=a('island-rear-wide'),side=a('cooking-side-drawers'),
 upper=a('wall-cabinets'),cutlery=a('island-cutlery');
assert.deepEqual([rear.usable_width_estimate_mm,rear.usable_depth_estimate_mm],[564,359]);
assert.deepEqual([side.usable_width_estimate_mm,side.usable_depth_estimate_mm],[520,440]);
assert.deepEqual([upper.usable_width_estimate_mm,upper.usable_depth_estimate_mm],[564,289]);
assert.deepEqual([cutlery.usable_width_estimate_mm,cutlery.usable_depth_estimate_mm],[402,440]);
const sample=[
 {id:'six-example-dinner-plates',quantity:6,stackable:true,
 size_mm:{width_mm:280,depth_mm:280,height_mm:22},
 provenance:'illustrative plate Ø280mm and 22mm height per plate, NOT the family plate inventory or verified SKU'}
];
const reserve=(id,net,kind,w,h,sourceLine)=>({
 id,net_mm:net,
 source_reference:sourceLine+'; all heights and access apertures are hypothetical trial dimensions, not cabinet shop drawings',
 access:{kind,clear_width_mm:w,clear_height_mm:h}
});
const options=[
 {
  id:'A-original-rear-island',title:'Six sample everyday dinner plates in reception-facing island rear 600mm bay',
  storage_group:'reception_presentation_side',
  bay:reserve('rear-wide',{width_mm:rear.usable_width_estimate_mm,depth_mm:rear.usable_depth_estimate_mm,height_mm:300},
   'hinged',500,260,'K12 storage-allocation.json island-rear-wide (564×359 source ESTIMATES)'),
  allocations:[{id:'plates-a',bay_id:'rear-wide',item_id:sample[0].id,count:6}],
  displaced_functions:['serving platters and table linen in same rear cabinet may require a different rear cabinet'],
  unknowns:['Exact rear-cabinet hinge clear opening and useful shelf height',
   'Six families place setting inventory, mugs, bowls and dishwasher unloading through kitchen/reception passage']
 },
 {
  id:'B-worktop-drawer',title:'Six sample everyday plates in one kitchen-side cooking base drawer',
  storage_group:'kitchen_work_side',
  bay:reserve('cooking-drawer',{width_mm:side.usable_width_estimate_mm,depth_mm:side.usable_depth_estimate_mm,height_mm:170},
   'drawer',480,140,'K12 storage-allocation.json cooking-side-drawers (520×440 source ESTIMATES)'),
  allocations:[{id:'plates-b',bay_id:'cooking-drawer',item_id:sample[0].id,count:6}],
  displaced_functions:['One cooking drawer originally reserved for pots/pans/lids or spices must be rehomed',
   'Actual drawer runner height and load capacity required for 6 plate stacks'],
  unknowns:['Depth/height/load/runners and exact drawer clear aperture',
   'New home for displaced cookware; opening drawer while standing at dishwasher',
   'Six family plate/bowl diameters and weights, full family pot inventory']
 },
 {
  id:'C-upper-west',title:'Six sample plates in estimated shallow overhead west-kitchen cupboard',
  storage_group:'upper_work_side',
  bay:reserve('upper-west',{width_mm:upper.usable_width_estimate_mm,depth_mm:upper.usable_depth_estimate_mm,height_mm:220},
   'hinged',510,190,'K12 storage-allocation.json wall-cabinets (564×289 source ESTIMATES)'),
  allocations:[{id:'plates-c',bay_id:'upper-west',item_id:sample[0].id,count:6}],
  displaced_functions:['Cups/bowls removed from wall cupboard; heavier plates relocated over countertop'],
  unknowns:['Only 9mm plan depth headroom for 280mm plate before hinges/door, actual hinge intrusion unverified',
   'Overhead lifting with wet/heavy stacks and actual family reach, shelf strength and safety',
   'Actual wall/cupboard dimensions after plastering']
 },
 {
  id:'D-shallow-waste-side-cutlery',title:'Six 280mm sample plates in narrow shallow 464mm island drawer',
  storage_group:'kitchen_work_side',
  bay:reserve('shallow-cutlery',{width_mm:cutlery.usable_width_estimate_mm,depth_mm:cutlery.usable_depth_estimate_mm,height_mm:110},
   'drawer',365,90,'K12 storage-allocation.json island-cutlery nominal shallow 160mm HIGH (402×440 source ESTIMATES)'),
  allocations:[{id:'plates-d',bay_id:'shallow-cutlery',item_id:sample[0].id,count:6}],
  displaced_functions:['Everyday cutlery and utility utensils originally in one shallow drawer must move'],
  unknowns:['110mm internal height is an illustrative sensitivity: actual drawer internal height may be smaller or larger',
   'Cutlery relocation and tray organization, load and actual plate stack height']
 }
];
const result=evaluateDishWorkflow({options,sample_inventory:sample,
 production_source:'Type B v0.2.2 / K12 '+s.scene_revision+
  ' / kitchen storage-allocation.json KitchenStorageAllocation/2 (NOT family household inventory)'});
assert.equal(result.options.length,4);
assert.equal(result.options[0].workflow.dry_plate_unloading_from_kitchen_side_requires_walk_around_island,true);
assert.equal(result.options[1].workflow.direct_same_side_worktop_access,true);
assert.equal(result.options[2].workflow.overhead_plates_while_unloading,true);
assert.equal(result.options[3].fit[0].status,'EXCEEDS_SINGLE_TYPE_UPPER_BOUND');
assert.ok(result.options.slice(0,3).every(x=>x.fit[0].status==='SINGLE_TYPE_FIT_PLAUSIBLE'));
const report={
 schema:'ApartmentA14KitchenUnloadingAudit/1',
 state:'PRELIMINARY / NOT BUILT, NOT ACTUAL INVENTORY',
 canonical_sha256:s.canonical_sha256,k12_scene_revision:s.scene_revision,
 storage_schema:source.schema,
 original_kitchen_structure_failures:inherited,
 assumed_product_data_not_source_truth:{
  six_dinner_plates_mm:[280,280,22],
  rear_usable_height_mm:300,cooking_drawer_height_mm:170,
  upper_cupboard_height_mm:220,shallow_utility_drawer_height_mm:110,
  warning:'Illustrative test values; no user measurements or manufacturer SKU. Cabinet width/depth are image-calibrated estimates, not shop drawings.'
 },
 options:result.options,
 compare_activity:{
  baseline_rear_island:'Daily plates presentation-side means crossing to the far face from DW kitchen-side position; extra unload workflow and route unmeasured.',
  source_worktop_drawer:'Closer workflow side for daily plates, but displaces a pot/pan or spice drawer. Must count displaced items; can be worse for cooking even if unloading improves.',
  shallow_upper:'Same general kitchen side but potential poor lifting and 9mm nominal depth surplus. Never certify without hinges/door.',
  shallow_cutlery:'Reject under 110mm illustrative internal height for six sample 22mm-thick stacked plates; actual SKU could reverse the conclusion.',
  kitchen_reroute:'Neither K12 nor +150 island changes which face rear island doors are on: relocation alone DOES NOT resolve unloading topology.',
  real_route_mm:null
 },
 provisional_choice:'Study a dedicated kitchen-facing dinnerware drawer ONLY if a full pots/pans/cutlery inventory and real drawer hardware proves there is adequate remaining cooking storage. Keep rear island cabinetry for serving or occasional items. Otherwise retain current rear storage pending a better cabinet elevation.',
 requests_before_cabinet_design:[
  'Photograph/count 6/8/12 person family dinner plates, soup/salad bowls, mugs, glasses, containers and serving trays, measure diameters/stack heights',
  'Count pots, pans, lids, boards, spices, cutlery, cleaning products and appliances with actual dimensions',
  'Cabinet elevations and internal manufactured widths/depths/heights, exact hinges and runners/load',
  'Dishwasher SKU door/projection and plate loading tray geometry, working side of actual cabinet doors',
  'Six-place unloading trial with users: doors open and full table set',
  'Developer/structural and wet island plumbing gate before using open-plan assumptions as construction layout'
 ],
 hard_approvals:{
  original_kitchen_separator: 'UNAPPROVED TWO HISTORICAL FAILS',
  plumbing_drain_slope:'UNKNOWN',
  carpenter_shop_drawings:'NOT PROVIDED',
  actual_family_inventory:'NOT PROVIDED',
  construction_ready:false
 }
};
fs.mkdirSync('review-evidence/advisor-a14',{recursive:true});
fs.writeFileSync('review-evidence/advisor-a14/kitchen-unloading-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({
 schema:report.schema,
 source:report.k12_scene_revision,
 candidates:report.options.map(o=>({id:o.id,access_side:o.access_side,first_fit:o.fit[0].status,
  changes_face:o.workflow.dry_plate_unloading_from_kitchen_side_requires_walk_around_island,
  displaced_storage:o.displaced_functions.length,unknowns:o.unknowns.length,verdict:o.verdict})),
 inherited_canonical_failures:inherited.length,
 construction_ready:false
},null,2));
