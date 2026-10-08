/**
 * A5 kitchen use test. Truth: K12 exact furniture and recorded generic appliance
 * door projections. Do not claim ergonomic, accessibility, structural or MEP approval.
 * Run: npm run build && node scripts/advisor-a5-kitchen-scenarios.mjs
 * Side effect: writes review-evidence/advisor-a5/results.json ONLY.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

const root=process.cwd();
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const domain=createApartmentDomain(root);
const source=load('design-development/k12/snapshot.json');
const audit=load('design-development/k12/function-audit.json');
const storage=load('design-development/k12/storage-allocation.json');
assert.equal(source.scene_revision,domain.revision(source.layout));
assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
assert.equal(audit.canonical_sha256,source.canonical_sha256);
assert.equal(audit.canonical_summary.fail,2);
assert.equal(source.architecture_variant?.render_only,true);
const near=(a,b,t=.01)=>Math.abs(a-b)<=t;
const item=id=>{
 const found=source.layout.furniture.find(o=>o.id===id);
 assert.ok(found,'Missing '+id);
 return found;
};
const footprint=f=>{
 const flipped=Math.abs(Math.round((f.rot||0)/90))%2===1;
 const w=flipped?f.d:f.w,d=flipped?f.w:f.d;
 return {x0:f.cx-w/2,x1:f.cx+w/2,y0:f.cy-d/2,y1:f.cy+d/2};
};
const dims=o=>({w:o.x1-o.x0,h:o.y1-o.y0});
const fromPoly=p=>({x0:Math.min(...p.map(x=>x[0])),x1:Math.max(...p.map(x=>x[0])),y0:Math.min(...p.map(x=>x[1])),y1:Math.max(...p.map(x=>x[1]))});
const relation=(a,b)=>{
 const dx=Math.max(0,b.x0-a.x1,a.x0-b.x1);
 const dy=Math.max(0,b.y0-a.y1,a.y0-b.y1);
 const overlapW=Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0));
 const overlapH=Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 return {gap_mm:Math.round(Math.hypot(dx,dy)*10)/10,positive_overlap_area_mm2:Math.round(overlapW*overlapH),horizontal_gap_mm:Math.round(dx*10)/10,vertical_gap_mm:Math.round(dy*10)/10};
};
const fmt=n=>Math.round(n*10)/10;
const island=footprint(item('E2-island')),cook=footprint(item('E2-cooking-base'));
const table=footprint(item('starter-35')),tall=footprint(item('E2-oven-column'));
const chairs=['starter-36','starter-37','starter-38','starter-39','A2-dining-chair-north-centre','A2-dining-chair-south-centre'].map(id=>({id,box:footprint(item(id))}));
const c=audit.appliance_opening_proxy;
const doors=Object.fromEntries(c.envelopes.map(x=>[x.id,fromPoly(x.poly)]));
assert.ok(doors['dishwasher']&&doors['E2-oven-column']&&doors['E2-fridge']&&doors['waste/cutlery']);
const sinkW={x0:11382,x1:11982,y0:island.y1,y1:island.y1+600};
const hobW={x0:cook.x1,x1:cook.x1+600,y0:item('E2-hob').cy-300,y1:item('E2-hob').cy+300};
const endW=audit.end_operator_proxy;
const dwDoor=doors.dishwasher,ovDoor=doors['E2-oven-column'];
const dwUser600={x0:dwDoor.x0,x1:dwDoor.x1,y0:dwDoor.y1,y1:dwDoor.y1+600};
const dwUser550={...dwUser600,y1:dwDoor.y1+550};
const fridgeUser={x0:doors['E2-fridge'].x0,x1:doors['E2-fridge'].x1,y0:7070,y1:7670};
const nearestChair=chairs.map(x=>({id:x.id,...relation(endW,x.box)})).sort((a,b)=>a.gap_mm-b.gap_mm);
const actualCookGap=island.x0-cook.x1;
const actualTallGap=tall.y0-island.y1;
assert.ok(near(actualCookGap,1219)&&near(actualTallGap,1220));
assert.equal(audit.prep.permanent_end_rectangle_mm.width_along_east_front_mm,914);
assert.equal(audit.prep.permanent_end_rectangle_mm.depth_from_east_front_mm,610);
assert.equal(dwDoor.y1-island.y1,650);
assert.equal(ovDoor.y0-dwDoor.y1,-30);
assert.equal(doors['E2-oven-column'].x0-dwDoor.x1,-1232,'Expected these rectangles to be offset left, not an aligned vertical seam.');
const dwToOven=relation(dwDoor,ovDoor);
assert.ok(near(dwToOven.gap_mm,32),'K12 door 32mm lateral gap is changed; review geometry!');
const sinkToOven=relation(sinkW,ovDoor);
assert.ok(near(sinkToOven.gap_mm,20),'Sink user/oven near-contact changed');
const dwUserTall=relation(dwUser600,{x0:dwUser600.x0,x1:dwUser600.x1,y0:tall.y0,y1:tall.y0+600});
assert.ok(dwUserTall.positive_overlap_area_mm2>0,'Expected 600mm DW user hits opposite tall footprint');
const dwUserCompactTall=relation(dwUser550,{x0:dwUser550.x0,x1:dwUser550.x1,y0:tall.y0,y1:tall.y0+600});
assert.ok(near(dwUserCompactTall.gap_mm,20));
assert.ok(near(table.x0-endW.x1,465));
assert.ok(near(nearestChair[0].gap_mm,510));
const fridgeVsWasteUser=relation(fridgeUser,doors['waste/cutlery']);
assert.ok(fridgeVsWasteUser.positive_overlap_area_mm2>0);
const hobVsSink=relation(hobW,sinkW);
assert.ok(hobVsSink.positive_overlap_area_mm2===0);

const studies=[
 {
  id:'S01-cook-and-wash',
  description:'One family member uses wall hob; another washes at island sink.',
  occupied:['hob-standing 600x600','sink-standing 600x600'],
  computed:{between_body_proxies_mm:hobVsSink.gap_mm},
  result:hobVsSink.positive_overlap_area_mm2?'GEOMETRY_CONFLICT':'NO_RECTANGLE_OVERLAP',
  caution:'Passing the simplified rectangle test cannot establish safe movement, handles, hot pans or 2-cook workflow.'
 },
 {
  id:'S02-dishwasher-loading',
  description:'Integrated dishwasher door fully open, user loading or unloading in front.',
  occupied:['DW-open rectangle 600x650','standing user at rear 600x600 / sensitivity 600x550'],
  computed:{dw_door_projection_mm:650,unoccupied_open_gap_to_tall_mm:actualTallGap-650,
   body_600_penetration_into_tall_mm:dwUser600.y1-tall.y0,
   body_550_remnant_to_tall_mm:tall.y0-dwUser550.y1},
  result:'RESTRICTED',
  caution:'An assumed 600mm-depth body cannot stand entirely behind fully open DW door without intruding into 600mm tall cabinetry. A 550mm body has only a nominal 20mm buffer. Open-door body posture/product hinges not modeled.'
 },
 {
  id:'S03-dishwasher-and-oven',
  description:'Dishwasher and oven simultaneously open.',
  occupied:['DW-open 600x650','oven-open 600x600'],
  computed:{door_to_door_gap_mm:dwToOven.gap_mm,positive_overlap_area_mm2:dwToOven.positive_overlap_area_mm2},
  result:dwToOven.gap_mm<100?'NEAR_CONTACT':'NO_NEAR_CONTACT',
  caution:'32mm projected lateral separation does NOT certify handles, hinge arcs, elbows, cleaning access or two humans; selected products needed.'
 },
 {
  id:'S04-sink-and-oven',
  description:'Person washing at sink while oven open on tall wall.',
  occupied:['sink person 600x600','oven-open 600x600'],
  computed:{clear_between_proxies_mm:sinkToOven.gap_mm},
  result:sinkToOven.gap_mm<100?'NEAR_CONTACT':'NO_NEAR_CONTACT',
  caution:'20mm is a highly sensitive conceptual buffer, not a usable circulation corridor.'
 },
 {
  id:'S05-end-prep-and-family-dining',
  description:'One person prepares at eastern island short end while six seats remain at dining.',
  occupied:['end prep person 600x600',...chairs.map(x=>x.id)],
  computed:{user_to_table_horizontal_mm:table.x0-endW.x1,nearest_dining_chair_gap_mm:nearestChair[0].gap_mm,nearest_chair_id:nearestChair[0].id},
  result:nearestChair[0].gap_mm<600?'RESTRICTED':'CAUTION',
  caution:'A nearest chair-footprint gap of 510mm cannot prove passage for a body, tray or child; a chair being occupied or pulled-out makes this less predictable.'
 },
 {
  id:'S06-fridge-with-bins',
  description:'One family member opens the fridge while another uses pull-out waste / cutlery.',
  occupied:['fridge approach user 600x600','waste pullout 464x500'],
  computed:{reserved_proxy_overlap_mm2:fridgeVsWasteUser.positive_overlap_area_mm2},
  result:fridgeVsWasteUser.positive_overlap_area_mm2?'GEOMETRY_CONFLICT':'NO_RECTANGLE_OVERLAP',
  caution:'Fridge person location is a hypothesis and real handle/hinge positions are unselected. Retest with actual appliance CAD.'
 }
];
const findStorage=id=>{
 const o=storage.allocations.find(x=>x.id===id);assert.ok(o,id);return o;
};
const rear=findStorage('island-rear-wide');
const cookDrawers=findStorage('cooking-side-drawers');
const pantry=findStorage('pantry-lower');
const guestExamples=[
 {item:'Dinner plate flat',example_mm:[280,280],orientation:'flat shelf',available_mm:[rear.usable_width_estimate_mm,rear.usable_depth_estimate_mm],fit:'GEOMETRIC_EXAMPLE_ONLY'},
 {item:'Wide saucepan with handles',example_mm:[520,440],orientation:'drawer top-down',available_mm:[cookDrawers.usable_width_estimate_mm,cookDrawers.usable_depth_estimate_mm],fit:'NO_TOLERANCE; real pot could be bigger'},
 {item:'Dry-food bin or bag',example_mm:[300,380],orientation:'pantry footprint',available_mm:[pantry.usable_width_estimate_mm,pantry.usable_depth_estimate_mm],fit:'GEOMETRIC_EXAMPLE_ONLY'},
];
assert.equal(rear.usable_depth_estimate_mm,359);
assert.equal(cookDrawers.usable_width_estimate_mm,520);
const unresolvedInventory=[
 'Largest frying pan including handle, wok and pressure cooker outer dimensions',
 'Actual daily plate diameters, serving platters and quantity',
 'Reusable water bottles, tall glasses and mug inventory',
 'Rice/flour/oil reserve needs and preferred pantry depth',
 'Coffee-machine EXACT model, steam/bean filling access and kettle',
 'Trash sorting bin sizes, cleaning chemicals and service access',
 'Height/age/mobility of cooks; one or two daily cooks',
 'Actual fridge/oven/dishwasher door drawings, hinges and manufacturer setbacks'
];
const result={
 schema:'AdvisorA5KitchenHumanUseAudit/1',
 status:'EXPLORATORY_AND_NOT_FOR_FABRICATION',
 source:{scene_revision:source.scene_revision,canonical_sha256:source.canonical_sha256,
  canonical_summary:audit.canonical_summary,architecture_overlay_is_render_only:true},
 geometry:{units:'mm',island_bounds:island,west_cook_aisle_closed_mm:fmt(actualCookGap),
  tall_aisle_closed_mm:fmt(actualTallGap),
  free_tall_aisle_with_dishwasher_open_mm:fmt(actualTallGap-650),
  nominal_body_depth_mm:600,door_models:'K12 rectangular planning proxies, NOT actual manufacturer door kinematics'},
 scenarios:studies,
 storage_examples_are_not_household_inventory:guestExamples,
 missing_real_household_inventory:unresolvedInventory,
 interpretation:[
  'Closed-aisle dimensions appear broadly workable; most problems are dynamic opening/occupancy interactions.',
  'Highest concern: loading an open DW and the nearby oven/tall unit, plus island end prep adjacent to six-seat family dining.',
  'Changing only dining-table size is a weak remedy; previous A2 reviewed variants were rejected.',
  'Do not rearrange water/waste on a whim: island drainage and opening approvals remain hard engineering gates.',
  'Next concepts should explicitly re-plan appliance frontage and human access before further finish or island growth.'
 ],
 disposition:'REVISE K12 FUNCTIONAL DETAIL — keep as baseline, not construction-ready; propose appliance swing/standing alternatives with exact-product constraints.',
 explicit_limitations:[
  'Rectangular body envelopes model location, not an ergonomic posture or certified accessible clear path.',
  'All measurements come from approximate source-image-calibrated model until as-built survey.',
  'No gas/extractor/drain/authority validation, exact product mechanics, cost or installation clearances.',
  'Do not treat no-overlap / test PASS as real-world safety approval.'
 ]
};
const dir='review-evidence/advisor-a5';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2)+'\n');
console.log('A5 K12 human-use scenario audit');
console.log('SCENARIO RESULTS '+studies.map(x=>x.id+':'+x.result).join('; '));
console.log(JSON.stringify({
 geometry:result.geometry,nearestChair,fridgeVsWasteUser,sinkToOven,dwToOven,storageIllustrative:guestExamples
},null,2));
