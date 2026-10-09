import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createApartmentDomain } from '../studio/domain/apartment.mjs';

const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync(process.argv[2]||'render-snapshots/current.json','utf8'));
const baselineJSON=JSON.stringify(base);
const next=structuredClone(base);
next.name='K9 — rotated island with balanced kitchen and dining clearance';
const item=id=>next.layout.furniture.find(f=>f.id===id);
Object.assign(item('E2-island'),{cx:11750,cy:6600,rot:0,name:'K9 rotated oak storage island · 1700 × 900 mm'});
Object.assign(item('E2-island-sink'),{cx:12250,cy:6750,rot:180,name:'K9 550 mm island sink · working side · plumbing TBD'});
next.scene_revision=domain.revision(next.layout);
next.views=next.views.filter(v=>['J1-dining-kitchen','J1-living-kitchen','J1-kitchen-work'].includes(v.id));
next.notes.push('K9 OWNER-REQUESTED EXPLORATION: rotate the 1700 × 900 mm island 90 degrees and translate its centre 400 mm toward the south tall units and 400 mm toward dining. Keep all architecture, ceiling, other furniture and the three original comparison cameras unchanged.');
next.notes.push('The 1620 mm gap was from the rotation-only trial to the oven/fridge fronts, not to dining. This translated alternative returns the south front gap to 1220 mm and west cooking-run edge gap to 1219 mm. Dining table edge is 1070 mm and nearest stored dining-chair edge is 1115 mm away; chair pull-out is not included in those static distances.');
next.notes.push('The sink rotates with the island and its 550 × 400 mm reserve moves to the south working side. A further 70 mm inset from the rigidly rotated position leaves 75 mm from its outer modeled edge to the east island edge. Cabinet modules, actual basin cutout, tap/trap access and service routes remain TBD.');
next.notes.push('K9 is a render-only comparison candidate. It does not activate a saved production variant, change canonical architecture, merge or deploy. The existing kitchen wall-removal study remains conditional on structural/developer approval.');

assert.equal(next.canonical_sha256,base.canonical_sha256);
assert.deepEqual(next.architecture_variant,base.architecture_variant);
const stripped=l=>({...l,furniture:l.furniture.filter(f=>!['E2-island','E2-island-sink'].includes(f.id))});
assert.deepEqual(stripped(next.layout),stripped(base.layout),'Only the island and sink may change');
for(const id of ['E2-island','E2-island-sink']) {
  const a=base.layout.furniture.find(f=>f.id===id),b=item(id);
  for(const k of ['w','d','type','room_id','variant','material_id'])assert.deepEqual(b[k],a[k]);
}
for(const v of next.views)assert.deepEqual(v,base.views.find(b=>b.id===v.id));
assert.equal(JSON.stringify(base),baselineJSON,'Base snapshot mutated');

const model=structuredClone(domain.model);
const context=vm.createContext({MODEL:model,INTERIOR_MATERIALS:JSON.parse(fs.readFileSync('interior-materials.json','utf8')),structuredClone});
for(const file of ['studio-core.js','interior-core.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const round=n=>Math.round(n*10)/10;
function report(layout) {
  try{return domain.validate(layout);}catch(error){if(error.validation)return error.validation;throw error;}
}
function analysis(snapshot) {
  const solids=context.interiorSolids(snapshot.layout,model);
  const island=solids.find(o=>o.id==='E2-island');
  const islandPoly=context.studioFootprint(island);
  const open=structuredClone(model);
  open.rooms.find(r=>r.id==='KIT-01').poly=snapshot.architecture_variant.merged_ceilings[0].poly;
  const key=s=>[s.from,s.to].map(p=>p.join(',')).sort().join('|');
  open.wall_segments=open.wall_segments.filter(s=>!snapshot.architecture_variant.remove_wall_segments.some(r=>key(r)===key(s)));
  const merged=solids.map(o=>({...o,room_id:o.room_id==='RECP-01'?'KIT-01':o.room_id}));
  const gaps={};
  for(const id of ['E2-cooking-base','E2-oven-column','E2-fridge','E2-pantry-tall','starter-32','starter-35',...snapshot.layout.furniture.filter(f=>f.type==='chair'&&f.room_id==='RECP-01').map(f=>f.id)]) {
    const o=solids.find(o=>o.id===id);
    const p=context.studioFootprint(o);
    gaps[id]=round(Math.min(...islandPoly.flatMap((a,i)=>p.map((b,j)=>context.interiorSegmentDistance(a,islandPoly[(i+1)%4],b,p[(j+1)%4])))));
  }
  const operating=merged.filter(o=>['E2-oven-column','E2-fridge','E2-pantry-tall'].includes(o.id)).map(o=>({id:o.id,mm:round(context.interiorOperatingDistance(o,merged,open))}));
  return {gaps_mm:gaps,tall_front_strip_mm:operating,report:report(snapshot.layout),island_polygon_mm:islandPoly};
}
const before=analysis(base),after=analysis(next);
assert.equal(after.gaps_mm['E2-cooking-base'],1219);
assert.equal(after.gaps_mm['E2-oven-column'],1220);
assert.equal(after.gaps_mm['starter-35'],1070);
const chairs=Object.entries(after.gaps_mm).filter(([id])=>snapshotChair(id)).map(([,d])=>d);
function snapshotChair(id){return next.layout.furniture.some(o=>o.id===id&&o.type==='chair'&&o.room_id==='RECP-01');}
assert.equal(Math.min(...chairs),1115);
assert.ok(after.gaps_mm['starter-32']>1700);
const openPoly=next.architecture_variant.merged_ceilings[0].poly;
assert.ok(after.island_polygon_mm.every(p=>context.interiorContains(p,openPoly)),'Island must remain within the existing open-plan study envelope');
for(const id of ['E2-island','E2-island-sink']) {
  const p=domain.footprint(item(id));
  if(id==='E2-island-sink')assert.ok(p.every(v=>context.interiorContains(v,after.island_polygon_mm)),'Sink footprint must stay on the island');
}
const fails=after.report.checks.filter(c=>c.status==='FAIL');
assert.ok(fails.every(c=>c.kind==='placement'&&c.object_id==='E2-island'),'No new hard canonical failures allowed');
const newWarnings=after.report.checks.filter(c=>c.status==='WARNING'&&!before.report.checks.some(b=>JSON.stringify(b)===JSON.stringify(c)));
const audit={schema:'K9IslandPositionReview/1',status:'EXPLORATORY',canonical_sha256:next.canonical_sha256,scene_revision:next.scene_revision,geometry_status:'image-calibrated concept, not construction measurements',before,after,new_or_changed_warnings:newWarnings,limitations:['Canonical wall/opening geometry remains unchanged.','Static furniture gaps do not include seated diners or chair pull-out.','The sole canonical E2-island room-placement exception depends on the existing render-only kitchen-wall-removal overlay.','Exact appliances, open doors, sink installation, plumbing and joinery remain TBD.']};
fs.mkdirSync('design-development/k9',{recursive:true});
fs.writeFileSync('design-development/k9/snapshot.json',JSON.stringify(next,null,2)+'\n');
fs.writeFileSync('design-development/k9/island-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({scene_revision:next.scene_revision,gaps_mm:after.gaps_mm,tall_front_strip_mm:after.tall_front_strip_mm,canonical_summary:after.report.summary,new_or_changed_warnings:newWarnings},null,2));
