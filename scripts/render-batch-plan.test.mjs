import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBatchPlan} from './render-batch-plan.mjs';
const camera={
 position:[1,1.7,3],target:[1,1.1,0],fov:42,
 viewport:{width:1200,height:800},aspect:1.5,near:.1,far:100
};
const base=()=>({
 canonical_sha256:'a'.repeat(64),scene_revision:'scene-abcd1234',layout:{furniture:[]},
 views:[{id:'front-view',room_id:'BR-02',camera:structuredClone(camera)}]
});
const input=(filename,content=base())=>({file:filename,snapshot:content});
test('plans distinct canonical-matched exact-camera scenes in one global frame list',()=>{
 const a=base(),b=base();b.scene_revision='scene-abcdef12';
 const plan=makeBatchPlan([input('a.json',a),input('b.json',b)]);
 assert.deepEqual(plan.variants.map(v=>v.key),['a','b']);
 assert.equal(plan.jobs.length,2);
 assert.equal(plan.canonical_sha256,'a'.repeat(64));
});
test('rejects a single canonical architecture mismatch',()=>{
 const alt=base();alt.canonical_sha256='b'.repeat(64);
 assert.throws(()=>makeBatchPlan([input('a.json'),input('b.json',alt)]),/Canonical architecture differs/);
});
test('rejects camera movement or FOV alteration even if ID matches',()=>{
 const alt=base();alt.views[0].camera.position[0]=4;
 assert.throws(()=>makeBatchPlan([input('a.json'),input('b.json',alt)]),/Comparison cameras differ/);
});
test('rejects duplicate output directory basename to prevent image overwrite',()=>{
 assert.throws(()=>makeBatchPlan([input('/a/control.json'),input('/b/control.json')]),/Duplicate variant output name/);
});
test('rejects duplicate view IDs',()=>{
 const alt=base();alt.views.push(structuredClone(alt.views[0]));
 assert.throws(()=>makeBatchPlan([input('a.json',alt),input('b.json',alt)]),/Duplicate camera IDs/);
});
test('rejects invalid/out-of-bounds filename or zero viewport',()=>{
 assert.throws(()=>makeBatchPlan([input('a?.json'),input('b.json')]),/Unsafe variant output name/);
 const alt=base();alt.views[0].camera.viewport.width=0;
 assert.throws(()=>makeBatchPlan([input('a.json',alt),input('b.json',alt)]),/Invalid image viewport/);
});
test('rejects missing inputs instead of rendering a misleading single-scene comparison',()=>{
 assert.throws(()=>makeBatchPlan([input('a.json')]),/at least two snapshots/);
});
