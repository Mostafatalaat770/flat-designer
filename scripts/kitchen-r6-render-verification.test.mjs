import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyR6Frame} from './kitchen-r6-render-verification.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),dir='renders/kitchen-r6';
function fixture(){
 const snapshot=read('design-development/kitchen-r6/L2.json'),view=snapshot.views.find(v=>v.id==='kitchen-work-evening'),manifest=read(dir+'/L2/manifest.json');
 const record=manifest.frames.find(f=>f.view_id===view.id);
 return {snapshot,view,manifest,record,batchRecord:structuredClone(record),metadata:read(dir+'/L2/'+view.id+'.json'),png:fs.readFileSync(dir+'/L2/'+view.id+'.png')};
}
const r5=read('design-development/kitchen-r5/GEOMETRY_AUDIT.json'),audit=read('design-development/kitchen-r6/GEOMETRY_DETAIL_AUDIT.json');
test('real captured L2 frame passes exact source/camera/light checks',()=>verifyR6Frame(fixture(),r5,audit,'L2'));
for(const [label,mutate] of [
 ['phantom fixture',f=>f.metadata.kitchen_r6_result.fixtures[0].source_id='K3-end-landing'],
 ['moved fixture',f=>f.metadata.kitchen_r6_result.fixtures[0].emitters[0].position[0]+=.1],
 ['hidden source alteration',f=>f.metadata.kitchen_r6_result.source_geometry_after.uppers[0].dimensions_mm[0]++],
 ['measured lux claim',f=>f.metadata.kitchen_r6_result.measured_lux=500],
 ['finish mixed into L2',f=>f.metadata.kitchen_r6_result.finishes.push({id:'NEW'})],
 ['wrong camera',f=>f.metadata.camera.position[0]++],
 ['missing frame record',f=>f.batchRecord=null],
 ['corrupt PNG',f=>f.png[100]^=1],
 ['lost GPU context',f=>{f.record.webgl.context_lost=true;f.batchRecord.webgl.context_lost=true;}]
])test('reject '+label,()=>{const f=fixture();mutate(f);assert.throws(()=>verifyR6Frame(f,r5,audit,'L2'));});
