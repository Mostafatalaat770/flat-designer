/**
 * Advisor D1: geometry-driven screening of a dry island, independent of render taste.
 * No architectural modification or cloud write.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const K12=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const item=id=>K12.layout.furniture.find(x=>x.id===id)||K12.layout.interior.objects.find(x=>x.id===id);
const cook=item('E2-cooking-base'),hob=item('E2-hob'),island=item('E2-island'),sink=item('E2-island-sink');
const fridge=item('E2-fridge'),oven=item('E2-oven-column'),pantry=item('E2-pantry-tall');
const model=JSON.parse(fs.readFileSync('dist/apartment-model.json','utf8'));
const serviceDoor=model.doors.find(o=>o.id==='OP-KIT-TERSVC');
assert.ok([cook,hob,island,sink,fridge,oven,pantry,serviceDoor].every(Boolean),'Missing authoritative object/opening');
assert.equal(model.canonical_sha256,K12.canonical_sha256,'Canonical mismatch');
assert.equal(K12.architecture_variant?.render_only,true,'Kitchen removal overlay cannot be mistaken for approval.');
assert.equal(cook.w,1800);
assert.equal(hob.w,600);
assert.equal(island.w,1700);
assert.equal(fridge.w,600);
assert.equal(oven.w,600);
assert.equal(pantry.width_mm,600);
assert.equal(fridge.cx,11050);
assert.equal(oven.cx,11650);
assert.equal(pantry.cx,12250);
const westModules=cook.joinery.work_modules.map(m=>m.width_mm);
assert.equal(westModules.reduce((a,b)=>a+b,0)+2*cook.joinery.end_panel_mm,1800);
const wallSink=600, wallDW=600, wallHob=600, workingWestTotal=cook.w, southTallAvailable=600*3;
const westAllServicesUsed=wallSink+wallDW+wallHob;
const southSwap={
 available_mm:southTallAvailable,
 original:[{use:'Fridge',width_mm:600},{use:'Oven column',width_mm:600},{use:'Pantry/coffee',width_mm:600}],
 dry_island_option:[{use:'Fridge',width_mm:600},{use:'Wall dishwasher',width_mm:600},{use:'Wall sink',width_mm:600}],
 displaced:['Oven column: must be relocated e.g. under hob and proven by manufacturer clearances',
   'Pantry and integrated coffee niche: lost or must be re-created elsewhere without overcrowding island prep']
};
const conclusion={
 schema:'AdvisorDryIslandScreen/1',
 status:'CONDITIONAL / NO CONSTRUCTION APPROVAL',
 snapshot:K12.scene_revision,
 canonical_sha256:K12.canonical_sha256,
 verified_conceptual_geometry:{
  west_worktop_length_mm:workingWestTotal,
  west_module_widths_mm:westModules,
  gas_hob_width_mm:hob.w,
  kitchen_service_terrace_door_nominal_width_mm:Math.round(serviceDoor.len*10)/10,
  tall_bay_total_mm:southTallAvailable,
  tall_bay_usage:southSwap,
  dry_island_full_surface_mm:[island.w,island.d]
 },
 option_D1_all_three_west_services:{
  required_mm:westAllServicesUsed,
  remaining_mm:workingWestTotal-westAllServicesUsed,
  verdict:'NOT FUNCTIONALLY VALID AS A ONE-RUN COMPOSITION: zero nominal width for side landings, independent drying or a real prep zone.',
  note:'No claim that moving the hob/gas/extraction or building a new return is impossible; only this specific 1800 mm arrangement fails a use test.'
 },
 option_D2_south_tall_wall:{
  verdict:'SPATIALLY POSSIBLE AT 600 MM BAY-COUNT LEVEL, BUT HIGH-CONCESSION/MEP-TBD',
  tradeoffs:southSwap.displaced,
  counter_effect:'Island could become dry prep and storage; the plumbing sink/dishwasher shift to the service-side wall must be proven with real drains and clear service access.',
  functional_catch:'Dishwasher opening on that wall still opposes the island/tall circulation and may recreate a restricted aisle. No exact operating envelopes or drawer layout have been checked.',
  store_catch:'A tall pantry and existing coffee niche disappear until a new detailed joinery allocation is designed.'
 },
 option_D3_k12_wet_island:{
  verdict:'KEEP AS AN HONEST CONTROL, NOT A WINNER',
  benefit:'Protects tall pantry/coffee/oven/fridge and keeps the hob on existing wall with potential short hood route.',
  limitation:'End prep blocks pass-through when occupied; dishwasher-open nominal through aisle remains 570 mm and services are unapproved.'
 },
 required_engineering_gates:[
  'Structural/developer signoff for separator removal and service penetrations',
  'Waste-water route, minimum fall, venting, cleanouts and riser access',
  'Gas hob and actual under-hob oven install feasibility if oven moves',
  'Real extraction route and make-up air',
  'Product-sized appliance door and standing/sitting envelope check',
  'Storage inventory, complete coffee station allocation and real kitchen first-fix drawings'
 ],
 verdict:'DO NOT RELEASE A DRY-ISLAND PHOTOREALISTIC CONCEPT AS A BUILDABLE DESIGN until D2 services + pantry relocation are resolved. Continue K12 functional alternatives in parallel.'
};
assert.equal(conclusion.option_D1_all_three_west_services.remaining_mm,0);
assert.equal(conclusion.verified_conceptual_geometry.kitchen_service_terrace_door_nominal_width_mm,677.9);
fs.mkdirSync('design-development/advisor/dry', {recursive:true});
fs.writeFileSync('design-development/advisor/dry/feasibility.json',JSON.stringify(conclusion,null,2)+'\n');
console.log(JSON.stringify(conclusion,null,2));
