import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {sha256} from './kitchen-r4-candidate.mjs';
import {R5_DIR,verifyR5Experiment} from './kitchen-r5-experiments.mjs';
import {verifyR5Frame} from './kitchen-r5-render-verification.mjs';
const out=process.env.RENDER_OUT_DIR || 'renders/kitchen-r5';
const read=p=>JSON.parse(fs.readFileSync(p));
const audit=read(R5_DIR+'/GEOMETRY_AUDIT.json');
// Accept one three-option batch, or separately executed identical-camera batches.
const batchPaths=process.env.R5_BATCH_PATHS?.split(',') || [out+'/batch-manifest.json'];
const batches=batchPaths.map(p=>({file:p,dir:path.dirname(p),batch:read(p)}));
const templateSHA=sha256(fs.readFileSync('dist/capture-template.json'));
const frames=[],runs=[];
for(const {file,dir,batch} of batches){
 assert.equal(batch.status,'ALL_FRAMES_VERIFIED');assert.equal(batch.capture_template_sha256,templateSHA);
 runs.push({manifest:file,sha256:sha256(fs.readFileSync(file)),browser:batch.browser_version,started_at:batch.started_at,finished_at:batch.finished_at});
 for(const variant of batch.variants){
  const id=variant.name;assert.ok(['D0','D1','D2'].includes(id));
  const snapshotFile=R5_DIR+'/'+id+'.json',snapshot=read(snapshotFile);verifyR5Experiment(snapshot,id);
  assert.equal(variant.source_sha256,sha256(fs.readFileSync(snapshotFile)));
  assert.equal(variant.expected_views,6);
  const manifestFile=dir+'/'+id+'/manifest.json',manifest=read(manifestFile);
  assert.equal(manifest.source_sha256,variant.source_sha256);
  assert.deepEqual(manifest.cameras,snapshot.views.map(v=>({id:v.id,room_id:v.room_id,camera:v.camera})));
  for(const view of snapshot.views){
   const base=dir+'/'+id+'/'+view.id,metadataFile=base+'.json';
   const record=manifest.frames.find(f=>f.view_id===view.id);
   const verified=verifyR5Frame({snapshot,view,manifest,record,batchRecord:batch.frames.find(f=>f.variant===id&&f.view_id===view.id),metadata:read(metadataFile),png:fs.readFileSync(base+'.png')},audit);
   frames.push({...verified,variant:id,image:path.relative(out,base+'.png'),metadata:path.relative(out,metadataFile),
     metadata_file_sha256:sha256(fs.readFileSync(metadataFile)),input_snapshot:snapshotFile,input_snapshot_sha256:variant.source_sha256});
  }
 }
}
assert.equal(frames.length,18);assert.equal(new Set(frames.map(f=>f.variant+'/'+f.view_id)).size,18);
const snapshots=['D0','D1','D2'].map(id=>read(R5_DIR+'/'+id+'.json'));
for(const snapshot of snapshots.slice(1))assert.deepEqual(snapshot.views,snapshots[0].views);
for(const id of ['kitchen-work','kitchen-relationship']){
 const day=structuredClone(snapshots[0].views.find(v=>v.id===id).camera),night=structuredClone(snapshots[0].views.find(v=>v.id===id+'-evening').camera);
 delete day.viewer.night;delete day.viewer.hour;delete night.viewer.night;delete night.viewer.hour;assert.deepEqual(day,night);
}
const historical=[];
const r4=read('design-development/kitchen-finish-r4/WEBGL_EVIDENCE.json');
for(const id of ['kitchen-work','kitchen-relationship']){
 const frame=r4.frames.find(f=>f.variant==='A-P0-IVORY'&&f.view_id===id);
 const original='renders/kitchen-r4/'+frame.image,metadata='renders/kitchen-r4/'+frame.metadata;
 if(!fs.existsSync(original))continue;
 assert.equal(sha256(fs.readFileSync(original)),frame.image_sha256);
 assert.equal(sha256(fs.readFileSync(metadata)),frame.metadata_file_sha256);
 fs.mkdirSync(out+'/r4-original',{recursive:true});
 fs.copyFileSync(original,out+'/r4-original/'+id+'.png');fs.copyFileSync(metadata,out+'/r4-original/'+id+'.json');
 historical.push({...frame,image:'r4-original/'+id+'.png',metadata:'r4-original/'+id+'.json',historical_source:'UNCHANGED_R4_COMMIT_4211f1d'});
}
const result={schema:'TypeBKitchenR5WebGL/1',status:'ALL_18_FRAMES_VERIFIED',layout_revision:'scene-3b86c557',
 capture_template_sha256:templateSHA,canonical_sha256:snapshots[0].canonical_sha256,frames,historical_r4_frames:historical,runs,
 geometry_audit_sha256:sha256(fs.readFileSync(R5_DIR+'/GEOMETRY_AUDIT.json')),
 visual_review_file:R5_DIR+'/DESIGN_QA.json',owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
fs.writeFileSync(out+'/VERIFIED_MANIFEST.json',JSON.stringify(result,null,2)+'\n');
console.log(`R5 render verification PASS: 18 actual frames; all doors, source cabinet bounds, cameras, layouts, assets and WebGL contexts verified; ${historical.length} unchanged R4 reference frames.`);
