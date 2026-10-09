import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync(process.argv[2]||'design-development/k10/snapshot.json','utf8'));
assert.equal(base.scene_revision,domain.revision(base.layout));
const next=structuredClone(base),item=id=>next.layout.furniture.find(f=>f.id===id);
const island=item('E2-island'),sink=item('E2-island-sink'),run=item('E2-cooking-base'),fridge=item('E2-fridge');
const pantry=next.layout.interior.objects.find(o=>o.id==='E2-pantry-tall');
assert.deepEqual([island.cx,island.cy,island.w,island.d,island.rot],[11750,6600,1700,900,0]);
next.name='K11 — daily-use kitchen / washing mode / appliance and storage allocation';
island.name='K11 oak island · waste/cutlery, sink, dishwasher · 1700 × 900 mm';
island.joinery.work_modules=[{role:'waste',width_mm:464,drawer_fronts_mm:[560,160],storage_intent:'Lower waste pullout + shallow top utensil drawer; exact mechanism TBD'},{role:'sink',width_mm:600},{role:'dishwasher',width_mm:600,clear_appliance_reservation:true}];
Object.assign(sink,{cx:11682,d:450,name:'K11 single-bowl workstation sink · washing mode · exact product TBD',workstation:{schema:'WorkstationSinkConcept/1',status:'EXPLORATORY',mode:'washing',bowl_mm:[480,350,210],bowl_z_offset_mm:10,tap_position_mm:[-195,-195],cover_storage:'Reception-side west 600 mm cabinet; stored upright',product_status:'Illustrative bowl, tap and flush removable cover. Product/cutout/rails/drainage are unselected.'}});
island.countertop_cutouts=[{schema:'CountertopCutoutConcept/1',x_mm:sink.cx-island.cx,z_mm:sink.cy-island.cy+sink.workstation.bowl_z_offset_mm,width_mm:480,depth_mm:350,status:'EXPLORATORY'}];
run.name='K11 cooking run · 582 drawers / 600 hob / 582 drawers + 18 mm end panels';
run.joinery={schema:'CounterJoineryConcept/1',status:'EXPLORATORY',end_panel_mm:18,working_depth_mm:600,rear_depth_mm:0,work_modules:[{role:'drawers',width_mm:582,drawer_fronts_mm:[320,240,160]},{role:'hob',width_mm:600,drawer_fronts_mm:[320,240,160],upper_front_service_reservation:true},{role:'drawers',width_mm:582,drawer_fronts_mm:[320,240,160]}],rear_modules:[]};
fridge.cx=11050;fridge.name='K11 integrated fridge · west tall bay · exact SKU/hinges TBD';
pantry.cx=12250;
pantry.metadata={...pantry.metadata,role:'K11 pantry with permanently open small-appliance niche; closed lower and upper dry storage retained',appliance_station:{schema:'ApplianceStationConcept/1',status:'EXPLORATORY',counter_height_mm:860,niche_top_mm:1480,appliances:[{type:'coffee-machine',dimensions_mm:[250,410,370],position_mm:[-145,45],product_status:'Generic reservation, not a selected DeLonghi model'},{type:'kettle',dimensions_mm:[160,200,260],position_mm:[155,45],product_status:'Generic reservation, not a selected product'}],services:'Power, ventilation, steam protection, tank filling and cleaning access await exact products/site review.'}};
next.scene_revision=domain.revision(next.layout);
next.notes=base.notes.filter(n=>!n.startsWith('K10 ')&&!n.startsWith('Sink outer reserve')&&!n.startsWith('Actual 1700')&&!n.startsWith('Dishwasher 650')&&!n.startsWith('This is an isolated'));
next.notes.push('K11 keeps the 1700 × 900 mm island, every cabinet envelope, all comparison cameras, living/dining furniture, the canonical architecture and the existing exploratory render-only opening overlay. Fridge and pantry exchange the west/east 600 mm tall bays; the oven stays in the centre.');
next.notes.push('Island working modules are 18 mm end panel + 464 mm waste/cutlery + 600 mm sink + 600 mm clear dishwasher bay + 18 mm end panel. Reception modules remain 600 + 600 + 464 mm at nominal 300 mm depth. Sink reserve is 550 × 450 mm; bowl is an illustrative 480 × 350 × 210 mm.');
next.notes.push('The uncovered sink leaves west/east landings 507 / 643 mm and does NOT provide a continuous 914 × 610 mm prep rectangle. An optional flush removable bowl cover enables that rectangle only in prep-covered mode, with the faucet entirely to its west. Washing and prep are sequential. Exact sink product, cutout, support rails, cover seams/cleaning and tap access are unselected.');
next.notes.push('The dishwasher now faces the pantry bay rather than the oven. With the same hypothetical 650 / 600 / 500 mm opening projections as K10, the recorded dishwasher/oven overlap becomes zero, with only 32 mm lateral separation. This is not verification of real hinges, handles, bodies or simultaneous human use. Dishwasher-open passage remains 570 mm.');
next.notes.push('Coffee machine and kettle have explicit generic reservations in the 600 mm pantry niche. This sacrifices 620 mm of full-width pantry height. The 464 mm island drawer bank becomes one shallow utensil drawer plus a waste pullout. The 1800 mm cooking run gains explicit 582 / 600 / 582 mm drawer allocation; hob ventilation/services may exclude the upper central drawer.');
next.notes.push('Dry storage is allocated to six side cooking drawers, two conditional lower hob drawers, three shallow rear island cabinets, two wall cabinets, and lower/upper pantry storage. Sink, dishwasher, cold storage, waste pullout and the coffee niche are excluded from general dry-storage counts. Capacity remains dependent on the family inventory and actual cabinet internals.');
next.notes.push('This is an isolated functional study. Structural/MEP approval for the retained opening overlay, exact equipment and site dimensions remain unresolved. No construction-ready or live-design approval is implied.');

const changedFurniture=['E2-island','E2-island-sink','E2-cooking-base','E2-fridge'];
const strip=l=>({...l,furniture:l.furniture.filter(f=>!changedFurniture.includes(f.id)),interior:{...l.interior,objects:l.interior.objects.filter(o=>o.id!=='E2-pantry-tall')}});
assert.deepEqual(strip(next.layout),strip(base.layout),'All unrelated furniture and finishes are retained');
assert.deepEqual(next.views,base.views);assert.deepEqual(next.architecture_variant,base.architecture_variant);
assert.equal(next.canonical_sha256,base.canonical_sha256);
for(const id of ['E2-island','E2-cooking-base']){const a=item(id),b=base.layout.furniture.find(f=>f.id===id);assert.deepEqual([a.cx,a.cy,a.w,a.d,a.rot],[b.cx,b.cy,b.w,b.d,b.rot]);}
assert.deepEqual([fridge.cx,pantry.cx,item('E2-oven-column').cx],[11050,12250,11650]);
for(const f of [island,run]){
  assert.equal(f.joinery.work_modules.reduce((s,m)=>s+m.width_mm,36),f.w);
  if(f.joinery.rear_modules.length)assert.equal(f.joinery.rear_modules.reduce((s,m)=>s+m.width_mm,36),f.w);
  assert.equal(f.joinery.working_depth_mm+f.joinery.rear_depth_mm,f.d);
}
const prep=structuredClone(next),prepSink=prep.layout.furniture.find(f=>f.id===sink.id);
prep.name='K11 — daily-use kitchen / prep-covered mode / sequential washing and prep';
prepSink.workstation.mode='prep-covered';prepSink.name='K11 single-bowl workstation sink · removable cover fitted · exact product TBD';
prep.scene_revision=domain.revision(prep.layout);
prep.views=next.views.filter(v=>['J1-dining-kitchen','K10-island-working-front'].includes(v.id));
assert.notEqual(prep.scene_revision,next.scene_revision);
assert.deepEqual({...prepSink,workstation:next.layout.furniture.find(f=>f.id===sink.id).workstation,name:sink.name},sink);

const model=structuredClone(domain.model);
const context=vm.createContext({MODEL:model,INTERIOR_MATERIALS:JSON.parse(fs.readFileSync('interior-materials.json','utf8')),structuredClone});
for(const file of ['studio-core.js','interior-core.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
function report(layout){try{return domain.validate(layout);}catch(e){if(e.validation)return e.validation;throw e;}}
const before=report(base.layout),after=report(next.layout),failures=r=>r.checks.filter(c=>c.status==='FAIL');
// The native interior pantry checker is stricter than the legacy fridge checker.
// Record its real canonical wall failure: the new pantry uses exactly the old
// fridge envelope, against a wall already removed by the unchanged K4 overlay.
// Do not suppress that report or weaken production/canonical validation.
assert.deepEqual(failures(after).filter(c=>c.object_id!=='E2-pantry-tall'),failures(before));
const pantryWall=failures(after).filter(c=>c.object_id==='E2-pantry-tall');
assert.equal(pantryWall.length,1);assert.equal(pantryWall[0].kind,'object-wall');assert.equal(pantryWall[0].source_wall_index,45);
const sameSegment=(a,b)=>JSON.stringify([a.from,a.to].map(p=>p.join(',')).sort())===JSON.stringify([b.from,b.to].map(p=>p.join(',')).sort());
assert.ok(next.architecture_variant.remove_wall_segments.some(s=>sameSegment(s,model.wall_segments[45])));
assert.deepEqual(domain.footprint({...base.layout.furniture.find(f=>f.id==='E2-fridge')}),domain.footprint({cx:pantry.cx,cy:pantry.cy,w:pantry.width_mm,d:pantry.depth_mm,rot:pantry.rotation}));
assert.deepEqual(report(prep.layout),after,'Cover mode must not change architecture/circulation validation');
const bounds=p=>({x0:Math.min(...p.map(q=>q[0])),y0:Math.min(...p.map(q=>q[1])),x1:Math.max(...p.map(q=>q[0])),y1:Math.max(...p.map(q=>q[1]))});
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const ib=bounds(domain.footprint(island)),sb=bounds(domain.footprint(sink));
assert.ok(domain.footprint(sink).every(p=>context.interiorContains(p,domain.footprint(island))));
const landings={west_mm:sb.x0-ib.x0,east_mm:ib.x1-sb.x1,front_mm:ib.y1-sb.y1,rear_mm:sb.y0-ib.y0};
assert.deepEqual(landings,{west_mm:507,east_mm:643,front_mm:75,rear_mm:375});
assert.ok(landings.west_mm>=457&&landings.east_mm>=610);
const modules=[];let x=ib.x0+18;
for(const m of island.joinery.work_modules){modules.push({...m,x0:x,x1:x+m.width_mm,y0:ib.y1-600,y1:ib.y1});x+=m.width_mm;}
const sm=modules.find(m=>m.role==='sink'),dw=modules.find(m=>m.role==='dishwasher'),waste=modules.find(m=>m.role==='waste');
assert.equal(dw.width_mm,600);assert.equal(sink.cx,(sm.x0+sm.x1)/2);assert.ok(sb.x0>=sm.x0&&sb.x1<=sm.x1);
const bowl={x0:sink.cx-240,x1:sink.cx+240,y0:sink.cy+10-175,y1:sink.cy+10+175};
const prepRectangle={x0:12582-914,x1:12582,y0:7050-610,y1:7050,width_mm:914,depth_mm:610};
assert.ok(prepRectangle.x0>=ib.x0&&prepRectangle.x1<=ib.x1&&prepRectangle.y0>=ib.y0&&prepRectangle.y1<=ib.y1);
const tapEnvelope={x0:sink.cx-195-28,x1:sink.cx-195+45,y0:sink.cy-195-28,y1:sink.cy-195+145};
assert.ok(tapEnvelope.x1<prepRectangle.x0,'Tap and lever do not intrude into the cover-enabled prep rectangle');
assert.ok(bowl.x0>=sm.x0+18&&bowl.x1<=sm.x1-18&&bowl.y0>=sm.y0&&bowl.y1<=sm.y1);
const coverUpright=[480,350,16],rearInternal={west_width_mm:600-36,nominal_depth_mm:300,assumed_clear_depth_mm:300-18-18-5,assumed_clear_height_mm:720-36};
assert.ok(coverUpright[0]<=rearInternal.west_width_mm&&coverUpright[1]<=rearInternal.assumed_clear_height_mm&&coverUpright[2]<=rearInternal.assumed_clear_depth_mm);

const solids=context.interiorSolids(next.layout,model),open=structuredClone(model);
open.rooms.find(r=>r.id==='KIT-01').poly=next.architecture_variant.merged_ceilings[0].poly;
const key=s=>[s.from,s.to].map(p=>p.join(',')).sort().join('|');
open.wall_segments=open.wall_segments.filter(s=>!next.architecture_variant.remove_wall_segments.some(r=>key(r)===key(s)));
const merged=solids.map(o=>({...o,room_id:o.room_id==='RECP-01'?'KIT-01':o.room_id}));
const tall=merged.filter(o=>['E2-oven-column','E2-fridge','E2-pantry-tall'].includes(o.id));
const operating=tall.map(o=>({id:o.id,mm:context.interiorOperatingDistance(o,merged,open)}));
for(const r of operating)assert.ok(Math.abs(r.mm-1220)<.001);
const gaps={};for(const id of ['E2-cooking-base','starter-32','starter-35']){const o=solids.find(o=>o.id===id);gaps[id]=context.interiorPolygonGap(domain.footprint(island),context.studioFootprint(o));}
assert.ok(Math.abs(gaps['E2-cooking-base']-1219)<.001);assert.equal(gaps['starter-35'],1070);
const envelopes=[{id:'dishwasher',projection_mm:650,poly:rect(dw.x0,ib.y1,dw.x1,ib.y1+650)},...tall.filter(o=>o.id!=='E2-pantry-tall').map(o=>{const b=bounds(context.studioFootprint(o));return{id:o.id,projection_mm:600,poly:rect(b.x0,b.y0-600,b.x1,b.y0)};}),{id:'waste/cutlery',projection_mm:500,poly:rect(waste.x0,ib.y1,waste.x1,ib.y1+500)}];
const singleOpen=envelopes.map(e=>{
  const other=solids.filter(o=>o.id!==e.id&&(!['dishwasher','waste/cutlery'].includes(e.id)||o.id!=='E2-island'));
  const gap=other.map(o=>({id:o.id,gap:context.interiorPolygonGap(e.poly,context.studioFootprint(o)),penetration:context.interiorPenetration(e.poly,context.studioFootprint(o))}));
  const nonTangent=gap.filter(o=>o.gap>1e-6||o.penetration>1e-6);
  return{id:e.id,projection_mm:e.projection_mm,min_gap_to_closed_other_solids_mm:Math.min(...nonTangent.map(o=>o.gap)),tangent_edges_ignored:gap.filter(o=>o.gap<=1e-6&&o.penetration<=1e-6).map(o=>o.id)};
});
assert.ok(singleOpen.every(e=>e.min_gap_to_closed_other_solids_mm>0));
const simultaneous=[];for(let i=0;i<envelopes.length;i++)for(let j=i+1;j<envelopes.length;j++){const a=bounds(envelopes[i].poly),b=bounds(envelopes[j].poly),w=Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)),d=Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));if(w>0&&d>0)simultaneous.push({a:envelopes[i].id,b:envelopes[j].id,width_mm:w,depth_mm:d});}
assert.deepEqual(simultaneous,[],'These four rectangular appliance/pullout proxies must no longer overlap');
const ovenBounds=bounds(context.studioFootprint(tall.find(o=>o.id==='E2-oven-column')));
assert.equal(dw.x0-ovenBounds.x1,32);
const niche=pantry.metadata.appliance_station;
assert.equal(niche.niche_top_mm-niche.counter_height_mm,620);
for(const a of niche.appliances){const [w,d,h]=a.dimensions_mm,[ax,az]=a.position_mm;assert.ok(Math.abs(ax)+w/2<=282&&Math.abs(az)+d/2<=282&&h<=590);}

const storage={schema:'KitchenStorageAllocation/1',status:'EXPLORATORY',not_a_family_inventory:true,assumptions:'18 mm panel allowance; actual fittings, shelves, bins and hob clearances unselected. Nominal cabinet widths are not usable storage widths.',allocations:[
 {id:'cooking-side-drawers',nominal_mm:[582,600,720],quantity:2,proposed_compartments:6,intent:['Deep: pots/lids','Middle: everyday pans/containers','Shallow: tools/spices'],usable_width_estimate_mm:520,usable_depth_estimate_mm:440,estimate_basis:'36 mm sides + 26 mm runner allowance, 440 mm conservative drawer box depth'},
 {id:'hob-lower-drawers',nominal_mm:[600,600,560],quantity:1,proposed_compartments:2,conditional:true,intent:['Two lower deep drawers only; upper 160 mm frontage reserved for hob/services'],usable_width_estimate_mm:538,usable_depth_estimate_mm:440},
 {id:'island-cutlery',nominal_mm:[464,600,160],quantity:1,proposed_compartments:1,intent:['Cutlery and frequently used small tools'],usable_width_estimate_mm:402,usable_depth_estimate_mm:440},
 {id:'island-waste',nominal_mm:[464,600,560],quantity:1,proposed_compartments:0,general_dry_storage:false,intent:['Two small removable bins front/back; exact volumes/mechanism TBD'],bin_reservation_each_mm:[240,180,300],bin_quantity:2},
 {id:'island-sink',nominal_mm:[600,600,720],quantity:1,proposed_compartments:0,general_dry_storage:false,intent:['Bowl/trap/services, small cleaning kit only; no dry-food claim']},
 {id:'island-rear-wide',nominal_mm:[600,300,720],quantity:2,proposed_compartments:4,usable_width_estimate_mm:564,usable_depth_estimate_mm:259,intent:['Mugs/glasses/small dishes; store removable sink cover upright in west unit'],plate_diameter_limit_note:'Do not assume standard 280 mm dinner plates fit the 259 mm depth allowance'},
 {id:'island-rear-narrow',nominal_mm:[464,300,720],quantity:1,proposed_compartments:2,usable_width_estimate_mm:428,usable_depth_estimate_mm:259,intent:['Tea/coffee supplies or small serving items']},
 {id:'wall-cabinets',nominal_mm:[600,330,700],quantity:2,proposed_compartments:4,usable_width_estimate_mm:564,usable_depth_estimate_mm:289,intent:['Everyday cups/small bowls; shelf spacing and plate fit need inventory check']},
 {id:'pantry-lower',nominal_mm:[600,600,740],quantity:1,proposed_compartments:2,usable_width_estimate_mm:564,usable_depth_estimate_mm:564,intent:['Heavy dry groceries; adjustable shelf around 450 mm floor height']},
 {id:'pantry-upper',nominal_mm:[600,600,720],quantity:1,proposed_compartments:2,usable_width_estimate_mm:564,usable_depth_estimate_mm:564,intent:['Light reserve groceries/occasional items; reaching high shelves may require a step']},
 {id:'coffee-niche',nominal_mm:[600,600,620],quantity:1,proposed_compartments:0,general_dry_storage:false,intent:['Coffee machine + kettle; preparation/steam/cleaning space'],clear_width_mm:564},
 {id:'oven-column',nominal_mm:[600,600,2200],quantity:1,proposed_compartments:0,unassigned_storage:true,intent:['Oven and appliance/services zone; surrounding storage not counted until real SKU is fixed']}
 ],tradeoffs:[{change:'Pantry middle becomes coffee niche',gross_dry_storage_envelope_removed_mm:[600,600,620],gross_envelope_litres:223.2,note:'Gross bounding-box comparison, NOT lost usable capacity; excludes carcass, air gaps and shelves.'},{change:'Island 464 mm drawer bank becomes waste + one shallow drawer',deep_general_drawers_removed:2,shallow_utility_drawer_retained:1},{change:'Cooking run drawer allocation becomes explicit',note:'Uses the existing 1800 × 600 mm footprint. Does not claim new exterior storage volume; hob lower drawers conditional.'}],excluded_from_dry_storage:['Fridge','Dishwasher','Sink/plumbing','Waste pullout','Coffee niche','Unverified oven-column spare space'],conclusion:'Organized compact storage, not proven generous storage. A family stocktake and selected hardware are required to validate quantities. Large dinner plates should use full-depth lower drawers rather than the shallow rear cabinets.'};
const audit={schema:'K11KitchenFunctionReview/1',status:'EXPLORATORY',canonical_sha256:next.canonical_sha256,baseline_scene_revision:base.scene_revision,washing_scene_revision:next.scene_revision,prep_scene_revision:prep.scene_revision,canonical_summary:after.summary,canonical_reported_failures:failures(after),canonical_failure_count_increases_from_1_to_2:true,additional_reported_failure_basis:'Native pantry checker reports wall 45; pantry exactly reuses old fridge footprint. Wall 45 was already removed by the unchanged render-only overlay. No canonical guard has been weakened.',island_bounds_mm:ib,sink_outer_reserve_bounds_mm:sb,sink_landings_mm:landings,working_modules_mm:modules,bowl_bounds_mm:bowl,tap_plan_envelope_mm:tapEnvelope,prep:{published_reference_mm:[914,610],washing_mode_reference_met:false,prep_covered_mode_reference_met_at_concept_level:true,cover_enabled_rectangle_mm:prepRectangle,cover_nominal_mm:coverUpright,cover_storage:rearInternal,condition:'Only with fitted removable flush cover. Sink unavailable for washing at that time; actual seams/rails/product fit unverified.'},tall_front_clearances_mm:operating,unchanged_static_gaps_mm:gaps,appliance_opening_proxy:{envelopes,single_open:singleOpen,simultaneous_overlaps:simultaneous,dishwasher_oven_lateral_separation_mm:32,dishwasher_open_remaining_to_closed_tall_front_mm:570,assumption:'Same hypothetical rectangular 650/600/500 mm projections as K10. Pantry/cupboard hinge sweeps, bodies and actual door geometry are unverified. Zero overlap of these proxies does not mean a person can pass between simultaneous open doors.'},appliance_station:niche,storage,reference:{publisher:'NKBA',url:'https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf',guidelines:[11,12,13],status:'Published planning reference, not local code or a claim of current-edition compliance'},limitations:['Two canonical failures remain disclosed: island cross-room placement and pantry against canonical wall 45, both dependent on the unchanged exploratory open-kitchen overlay.','32 mm separation is nominal and requires real door/handle tolerances.','570 mm dishwasher-open gap is restricted; passage and user bodies are not certified.','Uncovered sink still lacks the 914 × 610 mm continuous prep reference.','Cover is a hypothetical flush insert; purchase/fabrication measurements are unverified.','Coffee niche sacrifices some pantry space; actual user appliance dimensions are required.','No household stocktake was supplied; cabinet quantities do not prove sufficient capacity.','Structural approval, extraction, gas/electrical/water/drainage routes and site measurements remain unresolved.']};
fs.mkdirSync('design-development/k11',{recursive:true});fs.mkdirSync('render-snapshots',{recursive:true});
for(const [file,value] of [['snapshot.json',next],['prep-mode.json',prep],['function-audit.json',audit],['storage-allocation.json',storage]])fs.writeFileSync('design-development/k11/'+file,JSON.stringify(value,null,2)+'\n');
fs.writeFileSync('render-snapshots/current.json',JSON.stringify(next,null,2)+'\n');
console.log(JSON.stringify({washing_scene_revision:next.scene_revision,prep_scene_revision:prep.scene_revision,sink_landings_mm:landings,canonical_summary:after.summary,simultaneous_proxy_overlaps:simultaneous,prep_available_only_when_covered:true,snapshot_sha256:crypto.createHash('sha256').update(fs.readFileSync('design-development/k11/snapshot.json')).digest('hex')},null,2));
