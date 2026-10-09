import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {source,domain,model} from '../circulation-v55/route-library.mjs';
import {runStudy,insideFor} from './study.mjs';
import {auditSequence} from './planner.mjs';
import {pointInPolygon} from '../../studio/analysis/geometry.mjs';
import {html as regeneratedReview} from './build-review.mjs';

assert.equal(source.scene_revision,'scene-9cf45a73','Rebase when the apartment review source changes.');
assert.equal(source.storage_revision,55);
assert.equal(source.canonical_sha256,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
assert.equal(model.canonical_sha256,source.canonical_sha256);
assert.equal(domain.revision(source.layout),source.scene_revision);
const frozen=JSON.parse(fs.readFileSync(new URL('./results.json',import.meta.url)));
const rerun=runStudy();
assert.deepEqual(rerun,frozen,'Saved paths, geometry or conclusions differ from the rerun.');
let valid=0,rejected=0;
for(const s of frozen.sequences){
 const c=frozen.data.find(c=>c.id===s.room);
 const expected=s.room==='master'&&(s.parameters.radius_mm===250||s.parameters.grid_mm===25);
 assert.equal(s.status==='SAMPLED_SEQUENCE_FOUND',expected,s.room+' '+JSON.stringify(s.parameters));
 if(!expected){rejected++;continue;}
 const first=s.states[0],last=s.states.at(-1);
 assert.equal(first.door_angle_deg,c.door.closed_angle_deg);
 assert.equal(last.door_angle_deg,c.door.closed_angle_deg);
 assert.ok(!pointInPolygon(first.position_mm,c.bathroom_polygon));
 assert.ok(insideFor(c)(last.position_mm,s.parameters.radius_mm));
 assert.equal(s.phase_evidence.opening.states.at(-1).door_angle_deg,c.door.open_angle_deg);
 assert.deepEqual(s.phase_evidence.opening.states.at(-1),s.phase_evidence.closing.states[0]);
 assert.deepEqual(auditSequence(s,{...c,inside:insideFor(c)}),s.audit);
 assert.equal(s.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
 // Exit follows the exact reversed verified trajectory; verify it independently
 // too, with the exterior endpoint predicate instead of the interior one.
 const reverse={...s,states:[...s.states].reverse()};
 const reverseAudit=auditSequence(reverse,{...c,inside:p=>!pointInPolygon(p,c.bathroom_polygon)});
 assert.equal(reverseAudit.status,'NO_DETECTED_SAMPLED_CONFLICT');
 assert.ok(Math.abs(reverseAudit.minimum_body_to_obstacle_gap_mm-s.audit.minimum_body_to_obstacle_gap_mm)<1e-8);
 for(const r of s.closed_fixture_routes)assert.equal(r.status,'MODEL_ROUTE_FOUND');
 valid++;
}
assert.equal(frozen.fixed_open.length,6);
for(const r of frozen.fixed_open)assert.equal(r.status==='MODEL_ROUTE_FOUND',r.goal_id==='basin-front-400');
for(const c of frozen.door_fixture_sweeps)assert.ok(c.fixture_checks.every(x=>!x.any_intersection));
const hashes=JSON.parse(fs.readFileSync(new URL('./evidence/sha256.json',import.meta.url)));
assert.equal(crypto.createHash('sha256').update(regeneratedReview).digest('hex'),hashes['review.html'],'Baseline renderer drifted.');
for(const [file,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256')
 .update(fs.readFileSync(new URL(file,import.meta.url))).digest('hex'),hash,'Evidence hash differs: '+file);
console.log(JSON.stringify({source:source.scene_revision,complete_sequences:valid,
 reversed_exit_sequences:valid,rejected_under_declared_model:rejected,
 fixed_open_cases:frozen.fixed_open.length,fixture_sweeps:'clear',source_and_frozen_results:'match',
 evidence_hashes:Object.keys(hashes).length},null,2));
