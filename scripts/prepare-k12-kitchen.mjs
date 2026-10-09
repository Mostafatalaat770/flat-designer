import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

// Furniture-only study. Canonical architecture and the earlier opening overlay
// remain byte/structure locked; their real validation failures stay disclosed.
const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync(process.argv[2]||'design-development/k11/snapshot.json','utf8'));
const priorAudit=JSON.parse(fs.readFileSync('design-development/k11/function-audit.json','utf8'));
const storage=JSON.parse(fs.readFileSync('design-development/k11/storage-allocation.json','utf8'));
assert.equal(base.scene_revision,domain.revision(base.layout));
const next=structuredClone(base),item=id=>next.layout.furniture.find(f=>f.id===id);
const island=item('E2-island'),sink=item('E2-island-sink');
assert.deepEqual([island.cx,island.cy,island.w,island.d,island.rot],[11750,6600,1700,900,0]);
Object.assign(island,{cy:6550,d:1000,name:'K12 oak island · permanent end prep / deeper rear storage · 1700 × 1000 mm'});
island.joinery.rear_depth_mm=400;
island.countertop_cutouts[0].z_mm=sink.cy-island.cy+sink.workstation.bowl_z_offset_mm;
next.name='K12 — permanent end preparation / open sink / deeper reception storage';
next.scene_revision=domain.revision(next.layout);
// Preserve the four frozen K10/K11 comparison cameras, not a later detail camera.
assert.deepEqual(next.views,base.views);
assert.equal(sink.workstation.mode,'washing');
assert.deepEqual({...next.layout,furniture:next.layout.furniture.filter(f=>f.id!==island.id)},
  {...base.layout,furniture:base.layout.furniture.filter(f=>f.id!==island.id)});
assert.deepEqual(next.architecture_variant,base.architecture_variant);
assert.equal(next.canonical_sha256,base.canonical_sha256);
for(const modules of [island.joinery.work_modules,island.joinery.rear_modules])
  assert.equal(modules.reduce((n,m)=>n+m.width_mm,36),island.w);
assert.equal(island.joinery.working_depth_mm+island.joinery.rear_depth_mm,island.d);

const context=vm.createContext({MODEL:structuredClone(domain.model),INTERIOR_MATERIALS:JSON.parse(fs.readFileSync('interior-materials.json','utf8')),structuredClone});
for(const file of ['studio-core.js','interior-core.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
function report(layout){try{return domain.validate(layout);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}}
const before=report(base.layout),after=report(next.layout),failures=r=>r.checks.filter(c=>c.status==='FAIL');
const failureKinds=r=>failures(r).map(c=>[c.kind,c.object_id,c.source_wall_index??null,c.message]);
assert.deepEqual(failureKinds(after),failureKinds(before),'No new canonical failure type or suppressed existing failure');
assert.deepEqual(failures(after).filter(c=>c.object_id!=='E2-island'),failures(before).filter(c=>c.object_id!=='E2-island'));
assert.deepEqual(failures(after).map(c=>[c.kind,c.object_id,c.source_wall_index??null]),
  [['placement','E2-island',null],['object-wall','E2-pantry-tall',45]]);
const model=structuredClone(domain.model),open=structuredClone(model);
open.rooms.find(r=>r.id==='KIT-01').poly=next.architecture_variant.merged_ceilings[0].poly;
const key=s=>[s.from,s.to].map(p=>p.join(',')).sort().join('|');
open.wall_segments=open.wall_segments.filter(s=>!next.architecture_variant.remove_wall_segments.some(r=>key(r)===key(s)));
assert.ok(next.architecture_variant.remove_wall_segments.some(s=>key(s)===key(model.wall_segments[45])));
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const bounds=p=>({x0:Math.min(...p.map(q=>q[0])),y0:Math.min(...p.map(q=>q[1])),x1:Math.max(...p.map(q=>q[0])),y1:Math.max(...p.map(q=>q[1]))});
const ib=bounds(domain.footprint(island)),oldBounds=bounds(domain.footprint(base.layout.furniture.find(f=>f.id===island.id)));
const sb=bounds(domain.footprint(sink));
assert.deepEqual(ib,{x0:10900,y0:6050,x1:12600,y1:7050});
assert.equal(ib.y1,oldBounds.y1,'Keep working frontage and appliance openings fixed');
assert.equal(ib.x0,oldBounds.x0);assert.equal(ib.x1,oldBounds.x1);
assert.ok(domain.footprint(island).every(p=>context.interiorContains(p,open.rooms.find(r=>r.id==='KIT-01').poly)));
const landings={west_mm:sb.x0-ib.x0,east_mm:ib.x1-sb.x1,front_mm:ib.y1-sb.y1,rear_mm:sb.y0-ib.y0};
assert.deepEqual(landings,{west_mm:507,east_mm:643,front_mm:75,rear_mm:475});
const bowl=priorAudit.bowl_bounds_mm,tap=priorAudit.tap_plan_envelope_mm;
const prep={x0:11985,y0:6100,x1:12595,y1:7014,width_along_east_front_mm:914,depth_from_east_front_mm:610,working_side:'east short end; operator faces west',sink_mode:'washing'};
const pp=rect(prep.x0,prep.y0,prep.x1,prep.y1);
assert.ok(pp.every(p=>context.interiorContains(p,domain.footprint(island))));
const overlaps=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
assert.equal(overlaps(prep,sb),0);assert.equal(overlaps(prep,bowl),0);assert.equal(overlaps(prep,tap),0);
assert.equal(prep.x0-sb.x1,28,'End prep is immediately beside the sink reserve, with 28 mm stone between');
const solids=context.interiorSolids(next.layout,model);
const merged=solids.map(o=>({...o,room_id:o.room_id==='RECP-01'?'KIT-01':o.room_id}));
const tall=merged.filter(o=>['E2-oven-column','E2-fridge','E2-pantry-tall'].includes(o.id));
const operating=tall.map(o=>({id:o.id,mm:context.interiorOperatingDistance(o,merged,open)}));
for(const r of operating)assert.ok(Math.abs(r.mm-1220)<.001);
const gaps={};for(const id of ['E2-cooking-base','starter-32','starter-35'])
  gaps[id]=context.interiorPolygonGap(domain.footprint(island),context.studioFootprint(solids.find(o=>o.id===id)));
assert.ok(Math.abs(gaps['E2-cooking-base']-1219)<.001);assert.equal(gaps['starter-35'],1070);
assert.ok(Math.abs(gaps['starter-32']-(priorAudit.unchanged_static_gaps_mm['starter-32']-100))<.001);
// Retained 5 mm slab lip extends along x only, as actually built in Studio.
const topLip=5,endOperator={x0:12605,y0:6257,x1:13205,y1:6857,width_mm:600,depth_mm:600,assumption:'Illustrative stationary body reservation; not anthropometric/accessible certification'};
const operatorPoly=rect(endOperator.x0,endOperator.y0,endOperator.x1,endOperator.y1);
const operatorGaps=solids.filter(o=>o.id!==island.id&&o.id!==sink.id).map(o=>({id:o.id,gap_mm:context.interiorPolygonGap(operatorPoly,context.studioFootprint(o)),penetration_mm:context.interiorPenetration(operatorPoly,context.studioFootprint(o))}));
assert.ok(operatorGaps.every(o=>o.penetration_mm<=1e-6),'Standing at the end does not overlap another closed object');
const table=bounds(domain.footprint(item('starter-35')));
assert.equal(table.x0-endOperator.x1,465,'Passage behind an end-prep user remains restricted');
const envelopes=structuredClone(priorAudit.appliance_opening_proxy.envelopes);
for(const e of envelopes){assert.ok(!context.interiorPenetration(e.poly,operatorPoly));}
const moduleRects=structuredClone(priorAudit.working_modules_mm);
assert.equal(moduleRects.find(m=>m.role==='dishwasher').y1,ib.y1);
assert.deepEqual(moduleRects.map(m=>[m.x0,m.x1,m.y0,m.y1]),priorAudit.working_modules_mm.map(m=>[m.x0,m.x1,m.y0,m.y1]));
// Storage figures remain an estimate; no household inventory is invented.
for(const a of storage.allocations.filter(a=>a.id.startsWith('island-rear-'))){
  a.nominal_mm[1]=400;a.usable_depth_estimate_mm=359;
  a.intent=a.id==='island-rear-wide'?['Everyday plates, bowls and mugs; west unit also stores removable cover upright']:['Tea/coffee supplies and serving items'];
  a.plate_diameter_limit_note='A flat 280 mm diameter test circle fits the 359 mm depth estimate; selected hinges, shelf spacing, actual plates and cover divider still need checking.';
}
storage.schema='KitchenStorageAllocation/2';
storage.tradeoffs.push({change:'Rear island cabinets deepen from 300 to 400 mm while work bays stay 600 mm',extra_floor_and_countertop_area_m2:.17,estimated_clear_depth_before_mm:259,estimated_clear_depth_after_mm:359,note:'39% deeper clear shelf estimate for these three cabinets only; not a 39% increase in total kitchen storage. Living-chair footprint gap loses 100 mm.'});
storage.conclusion='Deeper rear cabinets now geometrically accommodate a 280 mm plate circle, and end preparation stays available with the sink open. Compact storage still needs the family inventory, shelf/divider and hardware check; overall sufficiency is unproven.';
const audit={schema:'K12KitchenFunctionReview/1',status:'EXPLORATORY',canonical_sha256:next.canonical_sha256,baseline_scene_revision:base.scene_revision,scene_revision:next.scene_revision,canonical_summary:after.summary,canonical_reported_failures:failures(after),no_new_canonical_failures:true,island_bounds_mm:ib,previous_island_bounds_mm:oldBounds,sink_outer_reserve_bounds_mm:sb,sink_landings_mm:landings,bowl_bounds_mm:bowl,tap_plan_envelope_mm:tap,working_modules_mm:moduleRects,prep:{published_reference_mm:[914,610],permanent_end_rectangle_mm:prep,open_sink_and_end_prep_do_not_overlap:true,normal_south_working_front_914_mm_available:false,reference_interpretation:'The rectangle is 914 mm wide and 610 mm deep when approached from the east end. Geometric concept comparison only, not a claim that the standard south working-front prep requirement or all NKBA guidance is met.',requires_sink_cover:false},clearances_mm:gaps,tall_front_clearances_mm:operating,rendered_slab_lip_mm:topLip,rendered_cooking_gap_mm:gaps['E2-cooking-base']-topLip,rendered_dining_gap_mm:gaps['starter-35']-topLip,end_operator_proxy:endOperator,end_operator_gaps_mm:operatorGaps,end_operator_remaining_to_table_edge_mm:465,appliance_opening_proxy:priorAudit.appliance_opening_proxy,storage,alternatives:[{island_mm:[1700,900],end_prep_reference_fits:false,note:'Only 900 mm along the end frontage, less than 914 mm; covered prep is sequential.'},{island_mm:[2000,900],end_prep_reference_fits:true,note:'943 mm prep beside the open sink at the south face, but dining gap falls from 1070 to 770 mm. Rejected.'},{island_mm:[1700,1000],end_prep_reference_fits:true,note:'Selected: add 100 mm north only, keep south/front, length, sink, dining and all appliances fixed. End prep narrows passage during use.'}],reference:{publisher:'NKBA',url:'https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf',guidelines:[6,7,11,12],status:'Published planning reference with 2015 code references; not local-code or full-compliance certification'},limitations:['End prep requires standing between the island and dining table; the 465 mm remaining to table edge is restricted during use.','The normal south working face still has only 643 mm beside the sink; moving to the east end is part of the workflow.','Living-chair footprint gap reduces by 100 mm; bodies, chair movement and circulation are not certified.','The existing dishwasher-open 570 mm gap and nominal oven/DW 32 mm edge separation remain restricted and need exact appliances.','Rear storage estimates use unselected panels, shelves, hinges and dividers. A 280 mm plate circle is a geometric sample, not the household inventory.','Both unchanged canonical failures depend on the earlier render-only opening overlay. Structural/MEP approval and site dimensions remain unresolved.']};
next.notes=[
 'K12 changes only the island depth, centre, rear storage depth and compensating cutout offset. Island south frontage, length/direction, sink/world cutout, work modules, appliances, dining/living furniture, finishes and architecture overlay stay fixed.',
 'Island is 1700 × 1000 mm, extended 100 mm toward living. Rear cabinets are 400 mm nominal, with 359 mm estimated clear shelf depth instead of 259 mm. The three cabinet widths remain 600 / 600 / 464 mm.',
 'Permanent 914 × 610 mm end-prep rectangle is approached from the east short end facing west. Sink remains open. It does not mean a 914 mm prep frontage exists on the south working face. Exact worktop, edges and ergonomic use remain concept-stage.',
 'Nominal cooking/tall-front/dining gaps remain 1219 / 1220 / 1070 mm; Studio slab lip reduces horizontal cooking/dining gaps by 5 mm. Living-chair footprint gap reduces by 100 mm.',
 'A 600 × 600 mm illustrative end-user reservation leaves only 465 mm to the dining table edge. Through-traffic is restricted while prepping at this end; real people/chair positions are unverified.',
 'K11 appliance-door proxy limitations, coffee/storage tradeoffs, unselected products and two canonical architecture failures remain disclosed. No structural/MEP, joinery, procurement or live-design approval is implied.'
];
const detail=structuredClone(next);
detail.name='K12 — permanent end prep / supplementary standing view';
detail.views=[structuredClone(base.views.find(v=>v.id==='K10-island-working-front'))];
detail.views[0].id='K12-end-prep';
detail.views[0].label='East end prep; standing 1.70 m / Natural42';
Object.assign(detail.views[0].camera,{position:[5.322291,1.7,1.4413415],target:[3.932291,.86,1.4413415],fov:42});
const reference=structuredClone(base);
reference.name='K11 — frozen open-sink comparison / same primary camera';
reference.views=reference.views.filter(v=>v.id==='J1-dining-kitchen');
fs.mkdirSync('design-development/k12',{recursive:true});fs.mkdirSync('render-snapshots',{recursive:true});
for(const [file,value] of [['snapshot.json',next],['end-prep-view.json',detail],['k11-comparison.json',reference],['function-audit.json',audit],['storage-allocation.json',storage]])
 fs.writeFileSync('design-development/k12/'+file,JSON.stringify(value,null,2)+'\n');
fs.writeFileSync('render-snapshots/current.json',JSON.stringify(next,null,2)+'\n');
console.log(JSON.stringify({scene_revision:next.scene_revision,canonical_summary:after.summary,prep_rectangle_mm:prep,clearances_mm:gaps,end_user_remaining_mm:465,snapshot_sha256:crypto.createHash('sha256').update(fs.readFileSync('design-development/k12/snapshot.json')).digest('hex')},null,2));
