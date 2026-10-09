import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {runStudy} from './study.mjs';
import {source,model,room} from '../circulation-v55/route-library.mjs';
import {pointInPolygon} from '../../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';
import {auditSequence} from '../bathroom-door-sequence/planner.mjs';
const saved=JSON.parse(fs.readFileSync(new URL('./results.json',import.meta.url)));
assert.equal(source.scene_revision,'scene-9cf45a73');assert.equal(source.storage_revision,55);
assert.equal(source.canonical_sha256,model.canonical_sha256);assert.deepEqual(runStudy(),saved);
const union=[room('KIT-01').poly,room('TER-SVC').poly];
for(let y=6587.866+12.5;y<10231.317;y+=25)for(let x=8833.249+12.5;x<12582.613;x+=25)
 if(pointInPolygon([x,y],saved.input.boundary))assert.ok(union.some(poly=>pointInPolygon([x,y],poly)),'Invented union floor');
let independent=0;
for(const s of saved.stages){
 assert.equal(s.reservations_valid,!['laundry-loader','dw-oven-loader'].includes(s.id));
 for(const r of s.routes)if(r.status==='MODEL_ROUTE_FOUND')assert.equal(r.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
 if(['closed','dw-open-600','dw-600-loader','laundry-loader-offset','oven-loader','fridge-left-90','fridge-right-90'].includes(s.id))
  for(const r of s.routes.filter(r=>r.id==='service-terrace')){
   const check=findPlanRoute({room:saved.input.boundary,obstacles:[...saved.input.obstacles,...s.added].map(o=>o.polygon),
    start:r.start,goal:r.goal,grid_mm:r.grid_mm,agent_radius_mm:250,max_cells:60000});
   assert.equal(check.status,r.status,s.id+' '+r.grid_mm);independent++;
  }
}
for(const id of ['dw-600-loader','dw-650-loader','laundry-loader-offset'])
 assert.ok(saved.stages.find(s=>s.id===id).routes.filter(r=>r.id==='service-terrace').every(r=>r.status==='NO_MODEL_ROUTE'));
for(const s of saved.operation_sequences){
 assert.equal(s.status==='SAMPLED_SEQUENCE_FOUND',s.hinge_location==='east');
 if(s.status==='SAMPLED_SEQUENCE_FOUND'){
  assert.equal(s.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
  const reversed=auditSequence({...s,states:[...s.states].reverse()},{...saved.input,inside:()=>true});
  assert.equal(reversed.status,'NO_DETECTED_SAMPLED_CONFLICT');
 }
}
if(!process.argv.includes('--geometry-only')){
 const hashes=JSON.parse(fs.readFileSync(new URL('./evidence/sha256.json',import.meta.url)));
 for(const [file,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(file,import.meta.url))).digest('hex'),hash,file);
}
console.log(JSON.stringify({stages:saved.stages.length,route_cases:saved.stages.reduce((n,s)=>n+s.routes.length,0),
 independent_repository_routes:independent,fridge_operation_cases:saved.operation_sequences.length,
 east_hinge_open_close_sequences:2,canonical_floor_union:'verified',frozen_source_results:'match'},null,2));
