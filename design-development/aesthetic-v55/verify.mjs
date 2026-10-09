import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {build} from './build.mjs';
const dir=import.meta.dirname,read=f=>JSON.parse(fs.readFileSync(dir+'/'+f));
const built=build();
for(const [name,value] of Object.entries(built))assert.deepEqual(read(name+'.json'),value,name+' differs from reproducible proposal');
const before=read('../unified-furnishing-v55/snapshot.json'),views=read('cameras.json'),files=[];
const record=file=>{const b=fs.readFileSync(dir+'/'+file);files.push({file,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});};
for(const phase of ['before','after'])for(const v of views){
 const snapshot=phase==='before'?before:built.snapshot,id=phase+'-'+v.id,m=read('evidence/'+id+'.json');
 assert.equal(m.scene_revision,snapshot.scene_revision);assert.equal(m.rendered_layout_json,JSON.stringify(snapshot.layout));
 assert.equal(m.canonical_sha256,snapshot.canonical_sha256);
 for(const k of ['position','target','fov','aspect','near','far','viewport','viewer'])assert.deepEqual(m.camera[k],v.camera[k]);
 assert.equal(m.assets.pending,0);assert.deepEqual(m.assets.fallbacks,[]);
 const png=fs.readFileSync(dir+'/evidence/'+id+'.png');assert.equal(png.readUInt32BE(16),1600);assert.equal(png.readUInt32BE(20),857);
 record('evidence/'+id+'.png');record('evidence/'+id+'.json');
}
for(const v of views){assert.notEqual(files.find(f=>f.file==='evidence/before-'+v.id+'.png').sha256,files.find(f=>f.file==='evidence/after-'+v.id+'.png').sha256);}
for(const phase of ['before','after'])assert.notEqual(files.find(f=>f.file==='evidence/'+phase+'-living.png').sha256,files.find(f=>f.file==='evidence/'+phase+'-living-night.png').sha256);
const circulation=read('circulation.json'),old=read('../unified-furnishing-v55/results.json');
assert.equal(circulation.candidate_scene,built.snapshot.scene_revision);assert.equal(circulation.source_scene,before.scene_revision);
assert.deepEqual(circulation.floor,old.floor);let queries=0,found=0;
for(const stage of circulation.stages){
 const prior=old.stages.find(s=>s.id===stage.id);assert.equal(stage.routes.length,38);queries+=stage.routes.length;
 for(const r of stage.routes){const p=prior.routes.find(p=>p.id===r.id&&p.grid_mm===r.grid_mm);assert.equal(r.status,p.status);if(r.status==='MODEL_ROUTE_FOUND'){assert.equal(r.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');assert.ok(r.audit.minimum_body_gap_mm>0);assert.ok(r.audit.minimum_floor_body_gap_mm>0);found++;}}
}
assert.equal(queries,266);assert.equal(found,240);
const qa=read('browser-qa.json');assert.equal(qa.view_count,views.length);assert.equal(qa.checks.length,views.length*6);assert.deepEqual(qa.errors,[]);assert.ok(qa.checks.every(c=>c.passed));
assert.equal(qa.review_html_sha256,crypto.createHash('sha256').update(fs.readFileSync(dir+'/review.html')).digest('hex'));
for(const file of ['build.mjs','circulation.mjs','capture.mjs','build-review.mjs','qa.mjs','verify.mjs','cameras.json','proposal.json','snapshot.json','brief.json','summary.json','circulation.json','review.html','REVIEW_AR.md','browser-qa.json','VISUAL_REVIEW_AR.md',
 'README.md','evidence/review-desktop-entry.png','evidence/review-desktop-living.png','evidence/review-mobile-bedroom1.png','evidence/review-mobile-dining.png'])record(file);
const manifest={schema:'ApartmentAestheticEvidence/1',source_scene:before.scene_revision,candidate_scene:built.snapshot.scene_revision,
 canonical_sha256:built.snapshot.canonical_sha256,views:views.length,matched_native_frames:views.length*2,
 native_template_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.resolve(dir,'../../dist/capture-template.json'))).digest('hex'),
 renderer_assets:['warm','japandi','boho'].map(name=>({file:'dist/art/'+name+'.png',sha256:crypto.createHash('sha256').update(fs.readFileSync(path.resolve(dir,'../../dist/art/'+name+'.png'))).digest('hex')})),
 browser_checks:qa.checks.length,circulation_queries:queries,found_paths:found,files};
if(process.argv.includes('--write')){
 fs.writeFileSync(dir+'/evidence-manifest.json',JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(dir+'/before-manifest.json',JSON.stringify({schema:'ApartmentAestheticBeforeEvidence/1',scene:before.scene_revision,views:views.length,files:files.filter(f=>f.file.startsWith('evidence/before-'))},null,2)+'\n');
}else assert.deepEqual(read('evidence-manifest.json'),manifest);
console.log(JSON.stringify({candidate:built.snapshot.scene_revision,frames:views.length*2,files:files.length,browser_checks:qa.checks.length,queries,found,verified:true}));
