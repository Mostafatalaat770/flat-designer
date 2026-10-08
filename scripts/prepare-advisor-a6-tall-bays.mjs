/**
 * A6 — Swap oven and fridge bays while leaving K12 island, gas hob, pantry,
 * dining and canonical architecture unchanged. Compare door+human conflicts.
 * Deliberately CONDITIONAL exploratory furniture layout.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const source=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const audit=JSON.parse(fs.readFileSync('design-development/k12/function-audit.json','utf8'));
const find=(layout,id)=>{const x=layout.furniture.find(f=>f.id===id);assert.ok(x,id);return x;};
assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
assert.equal(source.scene_revision,domain.revision(source.layout));
const oven=find(source.layout,'E2-oven-column');
const fridge=find(source.layout,'E2-fridge');
assert.deepEqual([oven.cx,fridge.cx,oven.cy,fridge.cy],[11650,11050,8570,8570]);
const dw=audit.appliance_opening_proxy.envelopes.find(x=>x.id==='dishwasher').poly;
const waste=audit.appliance_opening_proxy.envelopes.find(x=>x.id==='waste/cutlery').poly;
const fromPoly=p=>({x0:Math.min(...p.map(q=>q[0])),y0:Math.min(...p.map(q=>q[1])),x1:Math.max(...p.map(q=>q[0])),y1:Math.max(...p.map(q=>q[1]))});
const door=(f)=>({x0:f.cx-300,x1:f.cx+300,y0:f.cy-900,y1:f.cy-300});
const actor=(f)=>({x0:f.cx-300,x1:f.cx+300,y0:7070,y1:7670});
const cookingOperator={x0:9681,x1:10281,y0:7474,y1:8074};
const islandSinkOperator={x0:11382,x1:11982,y0:7050,y1:7650};
const gap=(a,b)=>{
 const dx=Math.max(0,a.x0-b.x1,b.x0-a.x1);
 const dy=Math.max(0,a.y0-b.y1,b.y0-a.y1);
 const ox=Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0));
 const oy=Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 return {clear_mm:Math.round(Math.hypot(dx,dy)*10)/10,overlap_area_mm2:Math.round(ox*oy)};
};
const doorDW=fromPoly(dw),wasteDoor=fromPoly(waste);
const caseMetrics=(label,fridgeO,ovenO)=>({
 label,
 dw_oven:gap(doorDW,door(ovenO)),
 dw_fridge:gap(doorDW,door(fridgeO)),
 oven_open_vs_hob_cook:gap(door(ovenO),cookingOperator),
 oven_open_vs_sink_cook:gap(door(ovenO),islandSinkOperator),
 fridge_access_vs_waste_pullout:gap(actor(fridgeO),wasteDoor),
 fridge_access_vs_sink_cook:gap(actor(fridgeO),islandSinkOperator),
 island_to_tall_closed_aisle_mm:1220,
 aisle_with_dw_open_mm:570
});
const control=caseMetrics('K12 current fridge west / oven center',fridge,oven);
const next=structuredClone(source);
const nfr=find(next.layout,'E2-fridge'),nov=find(next.layout,'E2-oven-column');
const originalOther=source.layout.furniture.filter(f=>!['E2-fridge','E2-oven-column'].includes(f.id));
nov.cx=11050;nov.name='A6 oven column in west tall bay — feasibility only';
nfr.cx=11650;nfr.name='A6 integrated fridge in centre tall bay — feasibility only';
assert.deepEqual(next.layout.furniture.filter(f=>!['E2-fridge','E2-oven-column'].includes(f.id)),originalOther);
assert.deepEqual(next.layout.interior,source.layout.interior,'Pantry niche and other joinery unchanged');
assert.deepEqual(next.layout.rooms,source.layout.rooms);
assert.deepEqual(next.layout.decor,source.layout.decor);
assert.deepEqual(next.layout.studio,source.layout.studio);
assert.deepEqual(next.architecture_variant,source.architecture_variant);
next.name='A6 — stove-side oven / sink-side fridge, K12 island frozen';
next.scene_revision=domain.revision(next.layout);
const validation=layout=>{try{return domain.validate(layout);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const validationFor=r=>r.checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
const originalFailures=validationFor(validation(source.layout)),newFailures=validationFor(validation(next.layout));
assert.deepEqual(newFailures,originalFailures,'A6 may not introduce or hide canonical failures.');
assert.equal(newFailures.length,2);
const swapped=caseMetrics('A6 oven west / fridge center',nfr,nov);
assert.equal(control.dw_oven.clear_mm,32);
assert.equal(control.dw_fridge.clear_mm,632);
assert.equal(swapped.dw_oven.clear_mm,632);
assert.equal(swapped.dw_fridge.clear_mm,32);
assert.equal(control.oven_open_vs_hob_cook.clear_mm,1069);
assert.equal(swapped.oven_open_vs_hob_cook.clear_mm,469);
assert.equal(control.aisle_with_dw_open_mm,swapped.aisle_with_dw_open_mm);
const views=source.views.filter(v=>['J1-living-kitchen','J1-kitchen-work','K10-island-working-front'].includes(v.id));
assert.equal(views.length,3);
next.views=views;
const ref=structuredClone(source);ref.views=views;ref.name='A6 side-by-side K12 reference';
const results={
 schema:'AdvisorA6KitchenBayComparative/1',status:'EXPLORATORY_AND_NOT_FOR_FABRICATION',
 canonical_sha256:source.canonical_sha256,source_scene_revision:source.scene_revision,alternative_scene_revision:next.scene_revision,
 unchanged:['canonical structure/ceilings/walls','render-only kitchen opening','1700x1000 sink island and dishwasher','cooking gas hob and vent line','1800 mm cooking bank','coffee/pantry niche','full family 2000x950 dining and six chairs','all camera fields'],
 comparatives:[control,swapped],
 conclusion:'SWAP DOES NOT SOLVE THE PROBLEM: moving oven left gives 632mm from dishwasher door, but moves the fridge door to just 32mm from dishwasher and oven to only 469mm from cooking operator. Retains 570mm dishwasher-open corridor. Reject auto-promotion; manufacturer/product-specific and human tests would be needed for any value claim.',
 clear_measurement_limitations:['All appliance doors are K12 nominal 600x600 proxies, not real hinge geometries.',
 'Cook/fridge/sink users are 600mm planning rectangles. Persons can rotate/lean; close gaps are concern flags, not safety certification.',
 'Moving appliances entails electrical/thermal ventilation changes and real SKU/cabinet shop drawings.',
 'Same two canonical violations from the inherited render-only open-plan overlay remain unapproved.']
};
const dir='design-development/advisor/a6';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'k12-control.json'),JSON.stringify(ref,null,2)+'\n');
fs.writeFileSync(path.join(dir,'oven-fridge-swap.json'),JSON.stringify(next,null,2)+'\n');
fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
