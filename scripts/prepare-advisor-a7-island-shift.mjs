/**
 * Advisor A7 — K12 island shift study; no canonical or production cloud edits.
 * Run npm run build && node scripts/prepare-advisor-a7-island-shift.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const source=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const audit=JSON.parse(fs.readFileSync('design-development/k12/function-audit.json','utf8'));
assert.equal(source.scene_revision,domain.revision(source.layout));
assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
const find=(l,id)=>{const x=l.furniture.find(f=>f.id===id);assert.ok(x,id);return x;};
const baseIsland=find(source.layout,'E2-island'),baseSink=find(source.layout,'E2-island-sink');
const lounge=find(source.layout,'starter-32'),table=find(source.layout,'starter-35');
assert.deepEqual([baseIsland.cx,baseIsland.cy,baseIsland.w,baseIsland.d],[11750,6550,1700,1000]);
assert.deepEqual([baseSink.cx,baseSink.cy,baseSink.w,baseSink.d],[11682,6750,550,450]);
const validate=layout=>{try{return domain.validate(layout);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const fail=v=>v.checks.filter(x=>x.status==='FAIL').map(x=>[x.kind,x.object_id??null,x.source_wall_index??null]);
const baseFails=fail(validate(source.layout));assert.equal(baseFails.length,2);
const box=f=>{const flip=Math.abs(Math.round((f.rot||0)/90))%2===1;const w=flip?f.d:f.w,d=flip?f.w:f.d;return{x0:f.cx-w/2,x1:f.cx+w/2,y0:f.cy-d/2,y1:f.cy+d/2};};
const angled=f=>{const t=(f.rot||0)*Math.PI/180;const yh=(Math.abs(f.w*Math.sin(t))+Math.abs(f.d*Math.cos(t)))/2;return{y0:f.cy-yh,y1:f.cy+yh};};
const old=box(baseIsland),cook=box(find(source.layout,'E2-cooking-base')),tall=box(find(source.layout,'E2-oven-column'));
assert.equal(tall.y0-old.y1,1220);assert.equal(old.x0-cook.x1,1219);
assert.equal(audit.appliance_opening_proxy.envelopes.find(x=>x.id==='dishwasher').projection_mm,650);
const endPerson=audit.end_operator_proxy;
const nearChair=box(find(source.layout,'starter-36'));
const outdir='design-development/advisor/a7';fs.mkdirSync(outdir,{recursive:true});
const measurements=[];
for(const shift of [0,100,150,200]){
 const next=structuredClone(source),island=find(next.layout,'E2-island'),sink=find(next.layout,'E2-island-sink');
 island.cy-=shift;sink.cy-=shift;
 if(shift){island.name='A7 K12 oak island north '+shift+' mm, services feasibility TBD';sink.name='A7 sink follows island north '+shift+' mm, services feasibility TBD';}
 next.name='A7 wet island north shift '+shift+'mm';
 next.scene_revision=domain.revision(next.layout);
 const other=next.layout.furniture.filter(o=>!['E2-island','E2-island-sink'].includes(o.id));
 const otherOld=source.layout.furniture.filter(o=>!['E2-island','E2-island-sink'].includes(o.id));
 assert.deepEqual(other,otherOld);
 assert.deepEqual(next.architecture_variant,source.architecture_variant);
 assert.deepEqual(next.layout.interior,source.layout.interior);
 assert.deepEqual(next.layout.rooms,source.layout.rooms);
 assert.deepEqual(next.layout.studio,source.layout.studio);
 assert.deepEqual(next.layout.decor,source.layout.decor);
 assert.equal(island.w,1700);assert.equal(island.d,1000);
 assert.equal(island.countertop_cutouts[0].z_mm,sink.cy-island.cy+sink.workstation.bowl_z_offset_mm);
 assert.deepEqual(fail(validate(next.layout)),baseFails);
 const ib=box(island),person={...endPerson,y0:endPerson.y0-shift,y1:endPerson.y1-shift};
 const chairDX=Math.max(0,nearChair.x0-person.x1,person.x0-nearChair.x1);
 const chairDY=Math.max(0,nearChair.y0-person.y1,person.y0-nearChair.y1);
 const nominalGap=Math.hypot(chairDX,chairDY);
 const tallGap=tall.y0-ib.y1;
 const loungeGap=ib.y0-angled(lounge).y1;
 assert.equal(tallGap,1220+shift);
 assert.equal(ib.x0-cook.x1,1219);
 assert.equal(box(table).x0-ib.x1,1070);
 assert.ok(Math.abs(nominalGap-510)<.001);
 const entry={shift_north_mm:shift,scene_revision:next.scene_revision,tall_closed_gap_mm:tallGap,
  dishwasher_open_gap_mm:tallGap-650,dw_open_plus_standing_600mm_buffer_mm:tallGap-650-600,
  west_cook_gap_mm:ib.x0-cook.x1,island_to_dining_mm:box(table).x0-ib.x1,
  end_prep_person_to_nearest_chair_mm:+nominalGap.toFixed(1),
  island_to_lounge_chair_footprint_mm:+loungeGap.toFixed(1),
  island_sink_service_relocation_mm:shift,no_new_canonical_failure:true};
 measurements.push(entry);
 if([0,150,200].includes(shift)){
  next.views=source.views.filter(v=>['J1-dining-kitchen','J1-living-kitchen','K10-island-working-front'].includes(v.id));
  assert.equal(next.views.length,3);
  fs.writeFileSync(path.join(outdir,'island-north-'+shift+'.json'),JSON.stringify(next,null,2)+'\n');
 }
}
assert.equal(measurements[0].dw_open_plus_standing_600mm_buffer_mm,-30);
assert.equal(measurements[2].dw_open_plus_standing_600mm_buffer_mm,120);
assert.equal(measurements[3].dw_open_plus_standing_600mm_buffer_mm,170);
const result={schema:'AdvisorA7WetIslandShift/1',status:'EXPLORATORY, NOT ENGINEERED OR APPROVED',
 canonical_sha256:source.canonical_sha256,parent_scene_revision:source.scene_revision,
 preserved:['original canonical geometry','unapproved K4 opening overlay','island 1700x1000 size','sink cutout relative geometry','west cooking run/gas hob','three tall cabinets','six-seat dining','lounge furniture','all finishes and comparison camera objects'],
 options:measurements,original_two_canonical_failures:baseFails,
 preliminary_decision:'150mm north is a promising geometric compromise, not yet a final layout. DW open aisle 720mm; nominal 600mm stationary proxy leaves 120mm to opposite tall cabinetry. Living armchair closed-footprint gap decreases by 150mm. End-prep-dining 510mm issue remains.',
 blockers:['Structural/developer review of open separator still required','Island water/waste fall, electrical and gas/extraction MEP unverified','Real DW hinge projection and handles not selected','Human proxy is not an accessible/safe path','Actual family lounge/circulation while cooking must be filmed or accurately modeled','Furniture/ceiling architecture cannot be altered in production without approval']};
fs.writeFileSync(path.join(outdir,'metrics.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
