import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {sha256} from './kitchen-r4-candidate.mjs';
import {R6_DIR,R6_OPTIONS,verifyR6Candidate} from './kitchen-r6-experiments.mjs';
import {verifyR6Frame} from './kitchen-r6-render-verification.mjs';
const out=process.env.RENDER_OUT_DIR||'renders/kitchen-r6',read=p=>JSON.parse(fs.readFileSync(p));
const audit=read(R6_DIR+'/GEOMETRY_DETAIL_AUDIT.json'),r5=read('design-development/kitchen-r5/GEOMETRY_AUDIT.json'),frames=[],runs=[];
for(const file of (process.env.R6_BATCH_PATHS?.split(',')||[out+'/batch-manifest.json'])){
 const b=read(file),dir=path.dirname(file);assert.equal(b.status,'ALL_FRAMES_VERIFIED');assert.equal(b.capture_template_sha256,sha256(fs.readFileSync('dist/capture-template.json')));
 runs.push({manifest:file,sha256:sha256(fs.readFileSync(file)),browser:b.browser_version,started_at:b.started_at,finished_at:b.finished_at});
 for(const v of b.variants){const id=v.name;assert.ok(R6_OPTIONS.includes(id));const source=R6_DIR+'/'+id+'.json',s=read(source);verifyR6Candidate(s,id);
  assert.equal(v.source_sha256,sha256(fs.readFileSync(source)));assert.equal(v.expected_views,4);
  const manifest=read(dir+'/'+id+'/manifest.json');assert.equal(manifest.source_sha256,v.source_sha256);assert.deepEqual(manifest.cameras,s.views.map(v=>({id:v.id,room_id:v.room_id,camera:v.camera})));
  for(const view of s.views){const base=dir+'/'+id+'/'+view.id,metadata=read(base+'.json'),png=fs.readFileSync(base+'.png');
   const result=verifyR6Frame({snapshot:s,view,manifest,metadata,png,record:manifest.frames.find(r=>r.view_id===view.id),batchRecord:b.frames.find(r=>r.variant===id&&r.view_id===view.id)},r5,audit,id);
   frames.push({...result,variant:id,image:path.relative(out,base+'.png'),metadata:path.relative(out,base+'.json'),metadata_file_sha256:sha256(fs.readFileSync(base+'.json')),input_snapshot:source,input_snapshot_sha256:v.source_sha256});
  }
 }
}
assert.equal(frames.length,20);assert.equal(new Set(frames.map(f=>f.variant+'/'+f.view_id)).size,20);
const s=read(R6_DIR+'/L0.json');
for(const id of R6_OPTIONS)assert.deepEqual(read(R6_DIR+'/'+id+'.json').views,s.views);
for(const id of ['kitchen-work','kitchen-relationship']){
 const d=structuredClone(s.views.find(v=>v.id===id).camera),n=structuredClone(s.views.find(v=>v.id===id+'-evening').camera);
 delete d.viewer.night;delete d.viewer.hour;delete n.viewer.night;delete n.viewer.hour;assert.deepEqual(d,n);
}
const historical=[];
if(fs.existsSync('renders/kitchen-r5/VERIFIED_MANIFEST.json'))for(const f of read('renders/kitchen-r5/VERIFIED_MANIFEST.json').frames){
 assert.equal(sha256(fs.readFileSync('renders/kitchen-r5/'+f.image)),f.image_sha256);assert.equal(sha256(fs.readFileSync('renders/kitchen-r5/'+f.metadata)),f.metadata_file_sha256);
 if(f.variant==='D1'&&f.view_id.startsWith('kitchen-')){
  const control=frames.find(r=>r.variant==='L0'&&r.view_id===f.view_id);assert.equal(control.image_sha256,f.image_sha256,'No-overlay L0 pixels differ from original R5 D1');
  historical.push({image:f.image,sha256:f.image_sha256,r6_l0_byte_identical:true});
 }
}
const result={schema:'KitchenR6WebGLEvidence/1',status:'ALL_20_FRAMES_VERIFIED',layout_revision:s.scene_revision,capture_template_sha256:sha256(fs.readFileSync('dist/capture-template.json')),
 canonical_sha256:s.canonical_sha256,geometry_audit_sha256:sha256(fs.readFileSync(R6_DIR+'/GEOMETRY_DETAIL_AUDIT.json')),frames,runs,preserved_r5_d1_frames:historical,owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
fs.writeFileSync(out+'/VERIFIED_MANIFEST.json',JSON.stringify(result,null,2)+'\n');
console.log('R6 render verification PASS: all 20 actual frames; source/D1 doors, 3 actual uppers, lighting/detail evidence, cameras, assets, WebGL and PNG provenance verified.');
