import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {applyKitchenDoorFinishExperiment,kitchenCounterTruth} from '../kitchen-render-truth.js';
import {BASE_COMMIT,R5_DIR,createR5Experiment,verifyR5Experiment} from './kitchen-r5-experiments.mjs';
import {buildMeasuredKitchen} from './kitchen-r5-geometry.mjs';
import {CANDIDATE,sha256} from './kitchen-r4-candidate.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const same=(a,b,message)=>assert.equal(JSON.stringify(a),JSON.stringify(b),message);

test('R5 snapshots retain complete R4 layout, actual domain revision, original day cameras and isolated night settings',()=>{
 const r4=read(CANDIDATE);
 for(const id of ['D0','D1','D2']){
  const s=read(R5_DIR+'/'+id+'.json');verifyR5Experiment(s,id);same(s.layout,r4.layout);
  for(const view of s.views){
   const evening=view.id.endsWith('-evening');
   const expected=structuredClone(r4.views.find(v=>v.id===view.id.replace(/-evening$/,'')));
   if(evening){expected.id=view.id;expected.camera.viewer.night=true;expected.camera.viewer.hour=20;}
   same(view,expected,'Unexpected camera/door change');
  }
 }
});
for(const [name,mutate] of [
 ['furniture relocation',s=>s.layout.furniture[0].cx++],
 ['upper depth',s=>s.layout.interior.objects.find(o=>o.id==='KIT-A1-upper-north').depth_mm++],
 ['partition demolition',s=>s.layout.demolished.push(44)],
 ['door swing',s=>s.views[0].camera.viewer.doors[0].position+=.1],
 ['cloud approval',s=>s.render_experiment.cloud_saved=true],
 ['unrelated door finish',s=>s.render_experiment.door_ids.push('OP-ENT-01')],
 ['invented scene revision',s=>s.scene_revision='scene-r5-invented'],
])test('reject '+name,()=>{const s=createR5Experiment('D1');mutate(s);assert.throws(()=>verifyR5Experiment(s));});

test('actual r160 source meshes and architecture are unchanged; only superseded demo stack meshes disappear',async()=>{
 const layout=read(CANDIDATE).layout,source=JSON.stringify(layout);
 fs.writeFileSync('work/kitchen-r5/legacy-builders.mjs',execFileSync('git',['show',BASE_COMMIT+':studio/renderer/builders.js']));
 const b=await buildMeasuredKitchen(layout,'work/kitchen-r5/legacy-builders.mjs'),a=await buildMeasuredKitchen(layout);
 assert.equal(JSON.stringify(layout),source);
 same(a.architecture,b.architecture,'Architecture vertices or placement changed');same(a.doors,b.doors);same(a.room_footprints,b.room_footprints);
 same(a.objects.map(o=>o.id),b.objects.map(o=>o.id));same(a.geometry.uppers,b.geometry.uppers);same(a.geometry.backsplashes,b.geometry.backsplashes);same(a.geometry.hoods,b.geometry.hoods);
 const ids=a.geometry.counters.map(c=>c.source_id);
 for(const before of b.objects){const after=a.objects.find(o=>o.id===before.id);
  if(!ids.includes(before.id))same(after,before,'Source mesh changed: '+before.id);
  else{assert.equal(before.meshes.length-after.meshes.length,before.id==='starter-20'?16:8);
   const original=new Set(before.meshes.map(m=>JSON.stringify(m)));
   for(const mesh of after.meshes)assert.ok(original.has(JSON.stringify(mesh)));}
 }
 assert.equal(a.geometry.uppers.length,3);assert.ok(a.geometry.counters.every(c=>!c.generated_upper_bounds && !c.generated_backsplash_bounds));
});

test('source authority is scoped to kitchens with saved elevated cabinetry; other rooms and legacy-only scenes retain fallback',()=>{
 const layout=read(CANDIDATE).layout;
 const furniture=layout.furniture.find(f=>f.id==='starter-20');
 const rooms=[{id:'KIT-01',kind:'kitchen'},{id:'RECP-01',kind:'reception'}];
 assert.equal(kitchenCounterTruth(layout,furniture,rooms).upper_ids.length,3);
 assert.equal(kitchenCounterTruth(layout,{...furniture,room_id:'RECP-01'},rooms).upper_ids.length,0);
 assert.equal(kitchenCounterTruth({...layout,interior:{...layout.interior,objects:[]}},furniture,rooms).upper_ids.length,0);
 const shared=fs.readFileSync('kitchen-render-truth.js','utf8').replaceAll('export function ','function ');
 assert.ok(fs.readFileSync('dist/index.html','utf8').includes(shared),'Classic viewer must execute exactly the shared source rule');
});

test('door finish application preserves actual leaf vertices, bounds, hinges, swing and every unrelated door',()=>{
 for(const variant of ['D0','D1','D2']){
  const ids=['OP-RECP-KIT','OP-KIT-TERSVC','OP-ENT-01'];
  const doors=ids.map((id,i)=>{
   const pivot=new THREE.Group();pivot.position.set(i,0,2);pivot.rotation.y=-Math.PI;
   const door={id,pivot,width:.9,a0:0,a1:-Math.PI,cur:-Math.PI,open:true};
   const leaf=new THREE.Mesh(new THREE.BoxGeometry(.9,2.05,.04),new THREE.MeshStandardMaterial({color:'#8d7258'}));
   leaf.position.set(.45,1.025,0);leaf.userData.door=door;pivot.add(leaf);return door;
  });
  const before=doors.map(d=>sha256(Buffer.from(d.pivot.children[0].geometry.attributes.position.array.buffer)));
  const result=applyKitchenDoorFinishExperiment(THREE,createR5Experiment(variant).render_experiment,doors,c=>new THREE.MeshStandardMaterial({color:c}));
  assert.equal(result.geometry_changed,false);
  for(const record of result.doors)same(record.before,record.after);
  assert.equal(doors[2].pivot.children[0].material.color.getHexString(),'8d7258');
  same(before,doors.map(d=>sha256(Buffer.from(d.pivot.children[0].geometry.attributes.position.array.buffer))));
  if(variant!=='D0')assert.equal(result.doors[0].rendered_colour,variant==='D1'?'#d8d1c5':'#bca98f');
 }
});

test('all committed R4 files are preserved byte-for-byte',()=>{
 const files=execFileSync('git',['ls-tree','-r','--name-only',BASE_COMMIT,'design-development/kitchen-finish-r4'],{encoding:'utf8'}).trim().split('\n');
 for(const file of files)assert.equal(sha256(fs.readFileSync(file)),sha256(execFileSync('git',['show',BASE_COMMIT+':'+file])));
});
test('all sixteen delivered R4 PNG/metadata byte streams are preserved', {skip:!fs.existsSync('renders/kitchen-r4/batch-manifest.json')},()=>{
 const evidence=read('design-development/kitchen-finish-r4/WEBGL_EVIDENCE.json');
 for(const f of evidence.frames){
  assert.equal(sha256(fs.readFileSync('renders/kitchen-r4/'+f.image)),f.image_sha256);
  assert.equal(sha256(fs.readFileSync('renders/kitchen-r4/'+f.metadata)),f.metadata_file_sha256);
 }
});
