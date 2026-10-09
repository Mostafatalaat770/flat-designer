import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {runComparisons} from './comparisons.mjs';
import {insideFor} from './study.mjs';
import {auditSequence} from './planner.mjs';
import {model,room,source} from '../circulation-v55/route-library.mjs';
import {pointInPolygon} from '../../studio/analysis/geometry.mjs';

assert.equal(source.scene_revision,'scene-9cf45a73');assert.equal(source.storage_revision,55);
assert.equal(source.canonical_sha256,model.canonical_sha256);
const saved=JSON.parse(fs.readFileSync(new URL('./comparisons.json',import.meta.url))),rerun=runComparisons();
assert.deepEqual(rerun,saved);
const original=model.doors.find(d=>d.id===saved.input.opening);
for(const v of saved.variants){
 assert.equal(v.door.length_mm,original.len);
 assert.equal(v.door.hinge[0],original.h[0]);
 assert.equal(Math.abs(v.door.closed_angle_deg-v.door.open_angle_deg),90,'Use the short physical quarter turn.');
 assert.ok([original.h[1],original.h[1]+original.len].includes(v.door.hinge[1]));
}
// Verify the larger analysis window never invents floor outside the two source
// room polygons. The grid origin phase stays aligned after the 800 mm expansion.
const union=[room('WC-01').poly,room('RECP-01').poly],boundary=saved.input.boundary;
for(let y=8160.346+12.5;y<10231.317;y+=25)for(let x=10739.705+12.5;x<16035.418;x+=25)
 if(pointInPolygon([x,y],boundary))assert.ok(union.some(poly=>pointInPolygon([x,y],poly)),'Invented analysis floor');
let found=0;
for(const s of saved.sequences){
 const expected=s.variant==='north-hinge-outward'&&(s.parameters.radius_mm===250||s.parameters.grid_mm===25);
 assert.equal(s.status==='SAMPLED_SEQUENCE_FOUND',expected,s.variant+' '+JSON.stringify(s.parameters));
 if(!expected)continue;
 const c={...saved.input,door:s.door},inside=insideFor(c);
 assert.equal(s.states[0].door_angle_deg,c.door.closed_angle_deg);
 assert.equal(s.states.at(-1).door_angle_deg,c.door.closed_angle_deg);
 assert.deepEqual(s.phase_evidence.opening.states.at(-1),s.phase_evidence.closing.states[0]);
 assert.equal(s.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
 assert.deepEqual(auditSequence(s,{...c,inside}),s.audit);
 const reverse=auditSequence({...s,states:[...s.states].reverse()},{...c,inside:p=>!pointInPolygon(p,c.bathroom_polygon)});
 assert.equal(reverse.status,'NO_DETECTED_SAMPLED_CONFLICT');
 assert.equal(s.toilet_approach.status,'MODEL_ROUTE_FOUND');found++;
}
for(const check of saved.fixture_sweeps)assert.ok(check.fixtures.every(f=>!f.any_intersection));
for(const r of saved.reception_crossing){
 const blocked=r.id==='blocked-chair-trial'||r.id==='near-sweep-endpoint'&&r.door_angle_deg===45;
 assert.equal(r.status,blocked?'ENDPOINT_BLOCKED':'MODEL_ROUTE_FOUND',r.id+' '+r.door_angle_deg+' '+r.grid_mm);
}
const hashes=JSON.parse(fs.readFileSync(new URL('./evidence/comparisons-sha256.json',import.meta.url)));
for(const [file,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256')
 .update(fs.readFileSync(new URL(file,import.meta.url))).digest('hex'),hash,'Comparison evidence differs: '+file);
const browser=JSON.parse(fs.readFileSync(new URL('./evidence/comparisons-browser-check.json',import.meta.url)));
for(const view of browser.views)for(const capture of view.capture_states){
 const sequence=saved.sequences.find(s=>s.variant===capture.variant&&s.parameters.radius_mm===250&&s.parameters.grid_mm===25);
 assert.deepEqual(capture.position_mm,sequence.phase_evidence.opening.states.at(-1).position_mm);
 assert.equal(capture.door_angle_deg,sequence.door.open_angle_deg);
}
console.log(JSON.stringify({variants:saved.variants.length,full_cycle_cases:saved.sequences.length,
 complete_sequences:found,reversed_exit_sequences:found,existing_opening_mm:original.len,
 reception_routes:saved.reception_crossing.filter(r=>r.status==='MODEL_ROUTE_FOUND').length,
 blocked_endpoint_cases:saved.reception_crossing.filter(r=>r.status==='ENDPOINT_BLOCKED').length,
 fixed_furniture_sweeps:'clear',floor_union:'matches canonical rooms',evidence_hashes:Object.keys(hashes).length},null,2));
