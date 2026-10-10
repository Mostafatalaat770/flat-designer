/**
 * Type B Sprint 5: manufacturer-derived device dimensions, source-locked.
 * The geometry is an explicit 2D box proxy, NOT a true hinge arc or certified
 * manufacturer installation. NEVER alters any source snapshot or architecture.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,relation,sweepRelation} from '../studio/analysis/geometry.mjs';
const root='design-development/reception-sprint';
const out='design-development/reception-sprint5';
fs.mkdirSync(out,{recursive:true});
const raw=fs.readFileSync(root+'/A-P0.json');
const scene=JSON.parse(raw);
const audit=JSON.parse(fs.readFileSync(root+'/audit-proposed.json','utf8'));
const domain=createApartmentDomain(process.cwd());
assert.equal(scene.scene_revision,'scene-9e86635b');
assert.equal(scene.source_scene_revision,'scene-4821689');
assert.equal(scene.storage_revision,55);
assert.equal(scene.canonical_sha256,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
assert.equal(domain.model.canonical_sha256,scene.canonical_sha256);
assert.equal(domain.revision(scene.layout),scene.scene_revision);
assert.deepEqual(scene.layout.demolished,[]);
assert.equal(audit.scene_revision,scene.scene_revision);
const sha=createHash('sha256').update(raw).digest('hex');
const pick=id=>{const f=scene.layout.furniture.find(f=>f.id===id);assert.ok(f,id);return structuredClone(f)};
const model={washer:pick('K3-laundry-niche'),DW:pick('K3-dishwasher'),fridge:pick('starter-23'),
 oven:{...pick('starter-20'),w:600,cy:pick('starter-22').cy}};
const doors=Object.fromEntries(audit.appliances.doors.map(x=>[x.id,x]));
assert.equal(doors['OP-KIT-TERSVC'].sweep.length,46);
assert.equal(doors['OP-RECP-KIT'].sweep.length,46);
const products=[
 {id:'LG-EG-F4Y2TYG6X',role:'washer',region:'Egypt',url:'https://www.lg.com/eg_en/washer-dryers/front-loading-washing-machines/f4y2tyg6x/',
   installation:'freestanding-front-load',w:600,h:850,d:550,closed_back_to_door:590,open_total_depth:1030,chosen:false},
 {id:'LG-EG-GBF339SVAM',role:'fridge',region:'Egypt',url:'https://www.lg.com/eg_en/refrigerators/bottom-freezer/gbf339svam/',
   installation:'freestanding-bottom-freezer',w:595,h:1860,d:650,closed_back_to_door:650,open_total_depth:1149,chosen:false},
 {id:'LG-EG-DFC811FL',role:'DW',region:'Egypt',url:'https://www.lg.com/eg_en/dishwashers/dfc811fl/',
   installation:'FREESTANDING-NOT-INTEGRATED',w:600,h:845,d:596,closed_back_to_door:null,open_total_depth:null,power_w:[1750,2100],chosen:false},
 {id:'BOSCH-IQ-HBF011BV1T',role:'oven',region:'Iraq (NOT Egypt market verified)',url:'https://www.bosch-home.com/iq/ar/mkt-product/cooking-and-baking/cookers-an-dovens/builtin-oven/HBF011BV1T',
   installation:'built-in benchmark; under-gas-hob compatibility UNKNOWN',w:594,h:595,d:548,
   cutout:{min_width:560,max_width:568,min_depth:550,min_height:575,max_height:597},power_w:2850,chosen:false}
];
const specs=Object.fromEntries(products.map(x=>[x.role,x]));
assert.equal(specs.washer.open_total_depth-specs.washer.closed_back_to_door,440);
assert.equal(specs.fridge.open_total_depth-specs.fridge.d,499);
const margins={
 washer_nominal_width_mm:model.washer.w-specs.washer.w,
 washer_nominal_closed_depth_mm:model.washer.d-specs.washer.closed_back_to_door,
 dishwasher_nominal_width_mm:model.DW.w-specs.DW.w,
 dishwasher_nominal_depth_mm:model.DW.d-specs.DW.d,
 fridge_nominal_width_mm:model.fridge.w-specs.fridge.w,
 fridge_nominal_depth_mm:model.fridge.d-specs.fridge.d,
 oven_nominal_reserved_width_mm:600-specs.oven.w,
 washer_open_extra_mm:specs.washer.open_total_depth-specs.washer.closed_back_to_door,
 fridge_open_extra_mm:specs.fridge.open_total_depth-specs.fridge.d
};
assert.deepEqual([margins.washer_nominal_width_mm,margins.dishwasher_nominal_width_mm,margins.fridge_nominal_width_mm,margins.washer_nominal_closed_depth_mm],[0,0,55,20]);
const put=(role,depth)=>({...model[role],w:specs[role].w,d:depth??specs[role].d});
const washer=put('washer',specs.washer.closed_back_to_door),DW=put('DW'),fridge=put('fridge'),oven=put('oven');
const front=(f,projection,w=f.w)=>{const a=f.rot*Math.PI/180;return rectangle({
 cx:f.cx-Math.sin(a)*(f.d/2+projection/2),cy:f.cy+Math.cos(a)*(f.d/2+projection/2),
 w,d:projection,rot:f.rot});};
const adult=(f,projection,w,d)=>front({...f,d:f.d+2*projection},d,w);
const hit=(door,poly)=>{const z=sweepRelation(door.sweep,poly);return {samples:z.samples,positive_overlap_samples:z.positive_overlap_samples,intersects:z.any_intersection,min_gap_mm:z.min_gap_mm}};
const pair=(a,b)=>{const z=relation(a,b);return {gap_mm:z.gap_mm,overlap_area_mm2:z.overlap_area_mm2,intersects_positive_area:z.intersects_positive_area}};
const cases=[];
for(const bodyW of [500,600,700])for(const bodyD of [500,600,700])
for(const dwOpen of [500,600])for(const ovenOpen of [450,550]){
 const w=adult(washer,margins.washer_open_extra_mm,bodyW,bodyD);
 const f=adult(fridge,margins.fridge_open_extra_mm,bodyW,bodyD);
 const d=adult(DW,dwOpen,bodyW,bodyD);
 const o=adult(oven,ovenOpen,bodyW,bodyD);
 const svc=doors['OP-KIT-TERSVC'],kit=doors['OP-RECP-KIT'];
 cases.push({user_mm:[bodyW,bodyD],assumed_unknown_open_mm:{DW:dwOpen,oven:ovenOpen},
 washer_service_door:hit(svc,w),
 fridge_kitchen_door_bbox:hit(kit,front(fridge,margins.fridge_open_extra_mm)),
 fridge_user_kitchen_door:hit(kit,f),
 oven_service_door:hit(svc,front(oven,ovenOpen)),
 dishwasher_user_south_face_mm:Math.round((8960.346-90-Math.max(...d.map(k=>k[1])))*10)/10,
 person_pair:{washer_oven:pair(w,o),oven_DW:pair(o,d),washer_DW:pair(w,d),fridge_DW:pair(f,d)}});
}
assert.equal(cases.length,36);
const nominal=cases.find(q=>q.user_mm[0]===600&&q.user_mm[1]===600&&q.assumed_unknown_open_mm.DW===600&&q.assumed_unknown_open_mm.oven===550);
assert.ok(nominal);
const count=(key)=>cases.filter(q=>q.person_pair[key].intersects_positive_area).length;
const report={schema:'TypeBSprint5ManufacturerDimensionStudy/1',
 status:'REFERENCE_ONLY_DO_NOT_PROCURE',
 source:{path:root+'/A-P0.json',sha256:sha,scene_revision:scene.scene_revision,cloud_source:scene.source_scene_revision,storage_revision:55,canonical_sha256:scene.canonical_sha256},
 manufacturer_references:products,source_box_screen_not_installed_clearance:margins,
 model_limitations:['Appliances not selected/purchased; manufacturer region differs for oven','Original furniture model boxes are not measured clear installation apertures','LG DW is FREESTANDING while source expects integrated matching cabinet front','Door open total depths are 1D extents only, never true hinge/sweep polygons','DW/oven opening projections remain assumed, not manufacturer dimensions','All device centres and building geometry kept source-locked; re-centered oven follows former under-hob study','Model adult polygons and 46 discrete door-leaf samples are not safe-escape or accessible-width certificates'],
 test_cases:cases,
 counts:{cases:cases.length,washer_service_hit:cases.filter(x=>x.washer_service_door.intersects).length,fridge_P0_bbox_hit:cases.filter(x=>x.fridge_kitchen_door_bbox.intersects).length,
 oven_service_hit:cases.filter(x=>x.oven_service_door.intersects).length,
 operator_pairs:{washer_oven:count('washer_oven'),oven_DW:count('oven_DW'),washer_DW:count('washer_DW'),fridge_DW:count('fridge_DW')}},
 nominal_case:nominal,
 release_gates:[
 {id:'SURVEY',status:'HOLD',required:'Finished free recess dimensions, door hinges and handles, kitchen worktop underside / elevations'},
 {id:'DISHWASHER',status:'HOLD',required:'Identify a compatible genuinely fully-integrated dishwasher and original plinth/front mechanisms; source candidate is freestanding'},
 {id:'WASHER',status:'HOLD',required:'Actual installed rear space, hoses, vibration isolation and service door with LG 1030mm total open depth'},
 {id:'FRIDGE',status:'HOLD',required:'Manufacturer hinge hand/arc/clear opening, top-side-rear ventilation, drawers and door within P0 kitchen leaf'},
 {id:'OVEN',status:'HOLD',required:'Egypt-sold oven and compatible gas hob official under-hob install diagram, cooling/heat shield/cable/cabinet cutout'},
 {id:'MEP',status:'HOLD',required:'Site-qualified engineer plumbing drains/vents/extract outside/heat/sockets/isolators/local electrical code'},
 {id:'P1_WALL',status:'HOLD',required:'Developer and structural engineer approval, live service survey, extraction/odour strategy before opening wall44'}]
};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/MANUFACTURER_FIT.json',JSON.stringify(report,null,2)+'\n');
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="480" viewBox="0 0 1260 480"><rect width="100%" height="100%" fill="#f6f4f0"/><g font-family="Arial" fill="#273027"><text x="40" y="56" font-size="27" font-weight="bold">Type B kitchen: REAL exterior dimensions ≠ usable installation</text><text x="40" y="88" font-size="16">Pinned A/P0 scene-9e86635b; all original walls &amp; original appliance centres retained</text><text x="40" y="143" font-size="20">Vendor example</text><text x="650" y="143" font-size="20">Nominal remaining box width</text><text x="40" y="194" font-size="18">LG Egypt washer F4Y2TYG6X, 600mm W</text><text x="680" y="194" font-size="23" font-weight="bold">0mm — check actual recess</text><text x="40" y="243" font-size="18">LG Egypt freestanding DW DFC811FL, 600mm W</text><text x="680" y="243" font-size="23" font-weight="bold">0mm — wrong integration type</text><text x="40" y="292" font-size="18">LG Egypt fridge GBF339SVAM, 595mm W</text><text x="680" y="292" font-size="23" font-weight="bold">55mm — not verified ventilation</text><text x="40" y="348" font-size="17">LG washer total depth OPEN = 1030mm, fridge OPEN = 1149mm (not hinge arcs)</text><text x="40" y="389" font-size="17">Bosch built-in oven: 594mm body / min cutout width 560mm; Egypt availability unverified</text><text x="40" y="449" font-size="14">All figures are reference screens. No appliances approved, no joinery order, no P1 wall removal.</text></g></svg>';
fs.writeFileSync(out+'/FIT_AT_A_GLANCE.svg',svg);
console.log(JSON.stringify({sha,counts:report.counts,margins,nominal:{DW_behind_body_mm:nominal.dishwasher_user_south_face_mm,washer_service:nominal.washer_service_door.intersects,fridge_P0:nominal.fridge_kitchen_door_bbox.intersects}},null,2));
