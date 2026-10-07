import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync(process.argv[2]||'design-development/k9/snapshot.json','utf8'));
assert.equal(base.scene_revision,domain.revision(base.layout));
const next=structuredClone(base);
next.name='K10 — balanced island with centred sink and usable cabinet reservations';
const item=id=>next.layout.furniture.find(f=>f.id===id);
const island=item('E2-island'),sink=item('E2-island-sink');
assert.deepEqual([island.cx,island.cy,island.w,island.d,island.rot],[11750,6600,1700,900,0]);
island.name='K10 oak island · dishwasher, sink, drawers · 1700 × 900 mm';
island.joinery={schema:'CounterJoineryConcept/1',status:'EXPLORATORY',end_panel_mm:18,working_depth_mm:600,rear_depth_mm:300,work_modules:[{role:'dishwasher',width_mm:600,clear_appliance_reservation:true},{role:'sink',width_mm:600},{role:'drawers',width_mm:464}],rear_modules:[{role:'storage',width_mm:600},{role:'storage',width_mm:600},{role:'storage',width_mm:464}]};
Object.assign(sink,{cx:11800,rot:0,name:'K10 550 mm centred island sink · tap north / work face south · TBD'});
next.scene_revision=domain.revision(next.layout);
next.notes=next.notes.filter(n=>!n.startsWith('The sink rotates with the island'));
next.notes.push('K10 retains the approved K9 island position, rotation and 1700 × 900 mm footprint. Only its internal cabinet concept and the sink position change; all other furniture, finishes, architecture overlays and comparison cameras are unchanged.');
next.notes.push('Sink outer reserve is 550 × 400 mm at (11800,6750), leaving 625 mm west and 525 mm east landing widths. Both landings improve the former 75 mm east-end margin. The west clear surface is 625 × 900 mm; this is a compact prep compromise and does not provide the NKBA published 914 × 610 mm continuous preparation rectangle alongside an uncovered sink.');
next.notes.push('Actual 1700 mm joinery allocation is 18 mm end panel + 600 mm clear dishwasher reservation + 600 mm sink cabinet + 464 mm drawer cabinet + 18 mm end panel. The 600 / 600 / 500 shorthand is nominal; the remaining 500 mm includes 36 mm end panels. Depth is allocated 600 mm working side + 300 mm shallow reception-side storage. Internal panels, tap/trap access and storage usable depth are not fabrication-approved.');
next.notes.push('Dishwasher 650 mm, oven 600 mm, fridge 600 mm and drawer 500 mm open-door envelopes are explicit hypothetical planning proxies, not exact manufacturer geometry. A dishwasher opened alone leaves 570 mm to the opposing closed tall fronts. Dishwasher and oven proxies overlap by 168 × 30 mm if simultaneously open; do not treat the arrangement as certified for simultaneous use.');
next.notes.push('This is an isolated, render-only functional refinement. Structural approval for the existing kitchen-opening study, exact appliances, service routes and site dimensions remain unresolved. It does not deploy, activate, merge or save a live design.');
assert.deepEqual(next.architecture_variant,base.architecture_variant);
assert.deepEqual(next.views,base.views);
const supplementalCamera=domain.captureCamera(next.layout,{room_id:'KIT-01',position:[(11750-modelWidth())/1000,1.7,(7930-modelDepth())/1000],target:[(11750-modelWidth())/1000,.72,(6900-modelDepth())/1000],fov:42});
function modelWidth(){return domain.model.width_mm/2;}
function modelDepth(){return domain.model.depth_mm/2;}
next.views.push({id:'K10-island-working-front',room_id:'KIT-01',camera:supplementalCamera});
next.notes.push('The original three comparison cameras are preserved exactly. One supplemental Natural42 standing view at 1.70 m is added from the south work aisle to show the complete island, working fronts and sink orientation. It is not a before/after comparison camera.');
assert.equal(next.canonical_sha256,base.canonical_sha256);
const stripped=l=>({...l,furniture:l.furniture.filter(f=>!['E2-island','E2-island-sink'].includes(f.id))});
assert.deepEqual(stripped(next.layout),stripped(base.layout));
const originalIsland=base.layout.furniture.find(f=>f.id===island.id);
assert.deepEqual({...island,name:originalIsland.name,joinery:undefined},{...originalIsland,joinery:undefined});
const originalSink=base.layout.furniture.find(f=>f.id===sink.id);
assert.deepEqual({...sink,cx:originalSink.cx,rot:originalSink.rot,name:originalSink.name},originalSink);
assert.equal(island.joinery.work_modules.reduce((s,m)=>s+m.width_mm,36),island.w);
assert.equal(island.joinery.rear_modules.reduce((s,m)=>s+m.width_mm,36),island.w);
assert.equal(island.joinery.working_depth_mm+island.joinery.rear_depth_mm,island.d);

const model=structuredClone(domain.model);
const context=vm.createContext({MODEL:model,INTERIOR_MATERIALS:JSON.parse(fs.readFileSync('interior-materials.json','utf8')),structuredClone});
for(const file of ['studio-core.js','interior-core.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
function report(layout){try{return domain.validate(layout);}catch(e){if(e.validation)return e.validation;throw e;}}
const beforeReport=report(base.layout),afterReport=report(next.layout);
assert.deepEqual(afterReport,beforeReport,'The sink/joinery refinement must not change canonical collision or circulation results');
assert.ok(afterReport.checks.filter(c=>c.status==='FAIL').every(c=>c.kind==='placement'&&c.object_id==='E2-island'));
const islandPoly=domain.footprint(island),sinkPoly=domain.footprint(sink);
assert.ok(sinkPoly.every(p=>context.interiorContains(p,islandPoly)));
const bounds=p=>({x0:Math.min(...p.map(q=>q[0])),y0:Math.min(...p.map(q=>q[1])),x1:Math.max(...p.map(q=>q[0])),y1:Math.max(...p.map(q=>q[1]))});
const ib=bounds(islandPoly),sb=bounds(sinkPoly);
const landings={west_mm:sb.x0-ib.x0,east_mm:ib.x1-sb.x1,front_mm:ib.y1-sb.y1,rear_mm:sb.y0-ib.y0};
assert.deepEqual(landings,{west_mm:625,east_mm:525,front_mm:100,rear_mm:400});
assert.ok(landings.west_mm>=610&&landings.east_mm>=457);
const solids=context.interiorSolids(next.layout,model);
const open=structuredClone(model);
open.rooms.find(r=>r.id==='KIT-01').poly=next.architecture_variant.merged_ceilings[0].poly;
const key=s=>[s.from,s.to].map(p=>p.join(',')).sort().join('|');
open.wall_segments=open.wall_segments.filter(s=>!next.architecture_variant.remove_wall_segments.some(r=>key(r)===key(s)));
const merged=solids.map(o=>({...o,room_id:o.room_id==='RECP-01'?'KIT-01':o.room_id}));
const tall=merged.filter(o=>['E2-oven-column','E2-fridge','E2-pantry-tall'].includes(o.id));
const operating=tall.map(o=>({id:o.id,mm:context.interiorOperatingDistance(o,merged,open)}));
for(const r of operating)assert.ok(Math.abs(r.mm-1220)<.001);
const clearances={};
for(const id of ['E2-cooking-base','starter-32','starter-35']){const o=solids.find(o=>o.id===id);clearances[id]=context.interiorPolygonGap(islandPoly,context.studioFootprint(o));}
assert.ok(Math.abs(clearances['E2-cooking-base']-1219)<.001);
assert.equal(clearances['starter-35'],1070);
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const modules=[];let x=ib.x0+18;
for(const m of island.joinery.work_modules){modules.push({...m,x0:x,x1:x+m.width_mm,y0:ib.y1-600,y1:ib.y1});x+=m.width_mm;}
const dishwasher=modules.find(m=>m.role==='dishwasher');
assert.equal(dishwasher.x1-dishwasher.x0,600);
const sinkModule=modules.find(m=>m.role==='sink');
assert.ok(sink.cx>sinkModule.x0&&sink.cx<sinkModule.x1);
// Use outer 550 mm reserve for landings; actual cutout and bowl are not invented.
const envelopes=[{id:'dishwasher',assumed_projection_mm:650,poly:rect(dishwasher.x0,ib.y1,dishwasher.x1,ib.y1+650)},...tall.filter(o=>o.id!=='E2-pantry-tall').map(o=>{const b=bounds(context.studioFootprint(o));return{id:o.id,assumed_projection_mm:600,poly:rect(b.x0,b.y0-600,b.x1,b.y0)};}),{id:'drawers',assumed_projection_mm:500,poly:rect(modules[2].x0,ib.y1,modules[2].x1,ib.y1+500)}];
const singleOpen=envelopes.map(e=>{
  const other=solids.filter(o=>o.id!==e.id&&(!['dishwasher','drawers'].includes(e.id)||o.id!=='E2-island'));
  const gaps=other.map(o=>({id:o.id,gap:context.interiorPolygonGap(e.poly,context.studioFootprint(o)),penetration:context.interiorPenetration(e.poly,context.studioFootprint(o))}));
  const nonTangent=gaps.filter(o=>o.gap>1e-6||o.penetration>1e-6);
  return {id:e.id,assumed_projection_mm:e.assumed_projection_mm,min_gap_to_closed_other_solids_mm:Math.min(...nonTangent.map(o=>o.gap)),tangent_side_edges_ignored:gaps.filter(o=>o.gap<=1e-6&&o.penetration<=1e-6).map(o=>o.id)};
});
assert.ok(singleOpen.every(e=>e.min_gap_to_closed_other_solids_mm>0),'A single open appliance proxy must not collide with closed furniture');
const simultaneous=[];
for(let i=0;i<envelopes.length;i++)for(let j=i+1;j<envelopes.length;j++){const a=bounds(envelopes[i].poly),b=bounds(envelopes[j].poly),w=Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)),d=Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));if(w>0&&d>0)simultaneous.push({a:envelopes[i].id,b:envelopes[j].id,overlap_width_mm:w,overlap_depth_mm:d,area_mm2:w*d});}
// The finished 18 mm west end panel shifts the actual DW reservation east.
assert.deepEqual(simultaneous.map(e=>[e.a,e.b]),[['dishwasher','E2-oven-column']]);
const audit={schema:'K10IslandFunctionReview/1',status:'EXPLORATORY',canonical_sha256:next.canonical_sha256,scene_revision:next.scene_revision,baseline_scene_revision:base.scene_revision,geometry_status:'image-calibrated concept, not site or construction measurements',canonical_summary:afterReport.summary,canonical_retained_failures:afterReport.checks.filter(c=>c.status==='FAIL'),canonical_report_unchanged:true,island_bounds_mm:ib,sink_outer_reserve_bounds_mm:sb,sink_landings_mm:landings,working_modules_mm:modules,rear_storage_nominal_depth_mm:300,prep:{west_clear_surface_mm:[625,900],working_side_clear_rectangle_mm:[610,610],published_reference_rectangle_mm:[914,610],continuous_reference_met:false,required_island_length_with_550_sink_914_prep_457_landing_mm:1921,decision:'Retain the accepted 1700 mm footprint; disclose the compact prep compromise rather than extending the island into dining.'},tall_front_clearances_mm:operating,unchanged_static_gaps_mm:clearances,appliance_opening_proxy:{envelopes,single_open:singleOpen,simultaneous_overlaps:simultaneous,dishwasher_open_remaining_to_closed_tall_front_mm:570,assumption:'Hypothetical rectangular open-door envelopes; exact doors, hinges, bodies and reach are unverified. Zero-area tangent side edges are recorded separately. One door open at a time is not a simultaneous-use certification.'},reference:{publisher:'NKBA',url:'https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf',guidelines:[11,12,13],status:'Published planning reference, not local code or claim of latest-edition compliance'},limitations:['The retained canonical E2-island room-placement exception depends on the unchanged render-only open-kitchen study.','The 550 × 400 mm sink is an outer placeholder, not an exact cutout or selected product.','The 600 mm dishwasher is a clear lateral reservation; filler tolerances, height, ventilation and rear services await a real SKU.','The drawer cabinet is 464 mm before joinery/reveal allowances; 500 mm shorthand includes the two 18 mm island end panels.','Shallow rear storage is a nominal 300 mm allocation; internal usable depth depends on back panels and sink/trap/services.','Prep frontage is limited; no 914 × 610 mm uninterrupted rectangle beside the open sink is claimed.','A conservative dishwasher/oven simultaneous-open proxy overlaps; manufacturer door geometry may change this result.','No live activation, merge, deployment or construction approval.']};
fs.mkdirSync('design-development/k10',{recursive:true});
fs.writeFileSync('design-development/k10/snapshot.json',JSON.stringify(next,null,2)+'\n');
fs.writeFileSync('design-development/k10/function-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({scene_revision:next.scene_revision,landings,modules,tall_front_clearances_mm:operating,canonical_summary:afterReport.summary,singleOpen,simultaneous,prep_reference_met:false},null,2));
