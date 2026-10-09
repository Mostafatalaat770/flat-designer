import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateFirstFix} from './first-fix.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const original=read('design-development/advisor/cases/typeb-wholehome-firstfix.json');
const model=read('dist/apartment-model.json');
const scene=read('design-development/k12/snapshot.json');
const evalBrief=(b)=>validateFirstFix({brief:b,model,scene});
test('whole-home source-linked baseline covers all 13 rooms without approval',()=>{
 const r=evalBrief(original);
 assert.equal(r.validation.passed,true,JSON.stringify(r.validation.errors));
 assert.equal(r.source.original_rooms,13);
 assert.equal(r.source.locked_finished_ceiling_mm,2500);
 assert.equal(r.summary.service_intents,65);
 assert.ok(r.summary.kinds.lighting>=15);
 assert.ok(r.summary.kinds.hvac>=4);
 assert.ok(r.summary.conceptual_light_groups['recp-dining']);
 assert.equal(r.no_mutation,true);
 assert.match(r.release_gate,/BLOCKED/);
});
test('reject an unlisted / duplicated room or changed source geometry',()=>{
 const b=structuredClone(original);b.room_ids.push('RECP-01');
 assert.ok(evalBrief(b).validation.errors.some(e=>e.id==='coverage'));
 const c=structuredClone(original);c.canonical_sha256='untrusted-render';
 assert.ok(evalBrief(c).validation.errors.some(e=>e.id==='canonical'));
 const d=structuredClone(original);d.finished_ceiling_height_mm=2370;
 assert.ok(evalBrief(d).validation.errors.some(e=>e.id==='ceiling'));
 const e=structuredClone(original);e.reference_scene_revision='unknown-scene';
 assert.ok(evalBrief(e).validation.errors.some(e=>e.id==='scene'));
});
test('reject phantom furniture anchors or mistaken room links',()=>{
 const b=structuredClone(original);
 b.equipment_points.find(p=>p.id==='mbr-bed-left').anchor.id='invented-socket';
 assert.ok(evalBrief(b).validation.errors.some(e=>e.id==='mbr-bed-left'));
 const c=structuredClone(original);
 c.equipment_points.find(p=>p.id==='mbr-bed-right').anchor.id='starter-30'; // living room TV stand
 assert.ok(evalBrief(c).validation.errors.some(e=>e.message.includes('another room')));
});
test('no unverified breaker amperage, AC tonnage or switch XY accepted',()=>{
 const b=structuredClone(original); b.equipment_points[0].circuit_breaker_a=20;
 assert.ok(evalBrief(b).validation.errors.some(e=>e.id==='recp-general'));
 const c=structuredClone(original);
 c.equipment_points.find(p=>p.id==='br1-hvac').air_conditioner_kw=2.5;
 assert.ok(evalBrief(c).validation.errors.some(e=>e.id==='br1-hvac'));
 const d=structuredClone(original);
 d.equipment_points.find(p=>p.id==='wc-mirror').position_mm=[11500,9450,1200];
 assert.ok(evalBrief(d).validation.errors.some(e=>e.id==='wc-mirror'));
});
test('cannot remove family use layer without warning and cannot mark ready',()=>{
 const b=structuredClone(original); b.equipment_points=b.equipment_points.filter(x=>x.id!=='kit-hood');
 assert.ok(evalBrief(b).validation.errors.some(e=>e.message.includes('ventilation')));
 const c=structuredClone(original); c.project_status='READY_FOR_CONSTRUCTION';
 assert.ok(evalBrief(c).validation.errors.some(e=>e.id==='approval'));
 const d=structuredClone(original);d.equipment_points.find(p=>p.id==='svc-washer').deps=[];
 assert.ok(evalBrief(d).validation.errors.some(e=>e.id==='svc-washer'));
});
test('wet/outdoor work remains explicit in all wet-space rooms',()=>{
 const s=evalBrief(original);
 for(const room of ['BATH-M01','BATH-C01','WC-01','TER-SVC','TER-MAIN','TER-MBR'])
  assert.ok(s.validation.warnings.some(x=>original.equipment_points.some(p=>p.id===x.id&&p.room_id===room)));
 const b=structuredClone(original);
 b.equipment_points.find(p=>p.id==='main-terrace-AC').provision='ALL_APPROVED';
 assert.ok(evalBrief(b).validation.errors.some(e=>e.id==='main-terrace-AC'));
});
