/**
 * A4 spatially controlled reception-sideboard material/width exploration.
 * Preserve the 2000 x 950 six-seat table, full K12 kitchen, sofa and all architecture.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(base.scene_revision,domain.revision(base.layout));
const find=obj=>obj.layout.interior.objects.find(x=>x.id==='A-dining-sideboard');
const origin=find(base);
assert.ok(origin);
assert.deepEqual([origin.width_mm,origin.depth_mm,origin.height_mm,origin.rotation],[2400,400,800,90]);
const cameraSpecs=[
 {id:'A4-entry-sideboard',room_id:'RECP-01',position:[5.732291,1.7,4.4843415],target:[5.60,1.2,2.30],fov:42},
 {id:'A4-living-sideboard',room_id:'RECP-01',position:[3.782291,1.7,-0.3156585],target:[5.20,1.22,2.00],fov:42}
];
const fixedViews=cameraSpecs.map(({id,room_id,position,target,fov})=>({
 id,room_id,camera:domain.captureCamera(base.layout,{room_id,position,target,fov})
}));
const combos=[
 {key:'original-walnut-2400',mm:2400,colour:'#60432E',material:'generic-walnut',label:'Control: original dark 2400 sideboard'},
 {key:'muted-oak-2000',mm:2000,colour:'#B88C5E',material:'a1-natural-oak',label:'2000 mm quiet oak sideboard'},
 {key:'muted-oak-1800',mm:1800,colour:'#B88C5E',material:'a1-natural-oak',label:'1800 mm quiet oak sideboard'}
];
const validation=layout=>{try{return domain.validate(layout);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const fail=(r)=>r.checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
const baselineValidation=validation(base.layout);
const expected=fail(baselineValidation);
assert.equal(expected.length,2);
const dst='design-development/advisor/a4';
fs.mkdirSync(dst,{recursive:true});
const report=[];
for(const c of combos){
 const snap=structuredClone(base);
 const side=find(snap);
 side.width_mm=c.mm;
 side.colour=c.colour;
 side.material_references={...side.material_references,body:c.material};
 side.metadata={...side.metadata,role:c.label+' — measured joinery and real storage inventory pending'};
 snap.name='Advisor A4 — '+c.label;
 snap.scene_revision=domain.revision(snap.layout);
 snap.views=fixedViews;
 assert.equal(snap.canonical_sha256,base.canonical_sha256);
 assert.deepEqual(snap.architecture_variant,base.architecture_variant);
 assert.deepEqual(snap.layout.furniture,base.layout.furniture);
 assert.deepEqual(snap.layout.rooms,base.layout.rooms);
 assert.deepEqual(snap.layout.studio,base.layout.studio);
 assert.deepEqual(snap.layout.decor,base.layout.decor);
 assert.deepEqual(snap.layout.interior.objects.filter(o=>o.id!=='A-dining-sideboard'),base.layout.interior.objects.filter(o=>o.id!=='A-dining-sideboard'));
 const v=validation(snap.layout);
 assert.deepEqual(fail(v),expected,'No new hard geometry failures permitted');
 fs.writeFileSync(path.join(dst,c.key+'.json'),JSON.stringify(snap,null,2)+'\n');
 report.push({name:c.key,width_mm:c.mm,depth_mm:400,height_mm:800,
   relative_gross_cabinet_width:c.mm/2400,
   gross_width_loss_percent:Math.round((1-c.mm/2400)*1000)/10,
   cabinet_material:c.material,scene_revision:snap.scene_revision,canonical_report:v.summary,
   disclaimer:'Width envelope only, NOT net storage capacity. Cabinet interiors and real use are unknown.'});
}
const out={schema:'AdvisorA4SideboardComparative/1',status:'EXPLORATORY',source_scene_revision:base.scene_revision,canonical_sha256:base.canonical_sha256,
 controlled:'All furniture including six-seat dining, island, doors, kitchen services and camera views remain unchanged; only the sideboard width and color reference/metadata change.',
 metrics:report,
 judgement_gate:'Visual weight vs family buffet storage and cleaning; do not call hallway or island circulation improved because depth and center position are unchanged.',
 inherited_construction_blockers:'K12 still reports the same two original canonical FAILs from render-only open-plan architecture.'};
fs.writeFileSync(path.join(dst,'metrics.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
