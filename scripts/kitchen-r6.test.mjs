import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {R6_BASE,R6_DIR,R6_OPTIONS,createR6Candidate,verifyR6Candidate} from './kitchen-r6-experiments.mjs';
import {measureR6} from './kitchen-r6-measure.mjs';
import {sha256} from './kitchen-r4-candidate.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
test('all R6 studies preserve full source, D1 doors, cameras and false approvals',()=>{
 const r5=read('design-development/kitchen-r5/D1.json');
 for(const id of R6_OPTIONS){const s=read(R6_DIR+'/'+id+'.json');verifyR6Candidate(s,id);assert.deepEqual(s.layout,r5.layout);assert.deepEqual(s.render_experiment,r5.render_experiment);assert.deepEqual(s.views,r5.views.filter(v=>v.id.startsWith('kitchen-')));}
});
for(const [label,mutate] of [
 ['appliance relocation',s=>s.layout.furniture.find(f=>f.id==='K3-dishwasher').cy++],
 ['source upper height',s=>s.layout.interior.objects.find(o=>o.id==='KIT-A1-upper-north').height_mm++],
 ['architecture',s=>s.layout.demolished.push(44)],['door swing',s=>s.views[0].camera.viewer.doors[0].position+=.1],
 ['different camera',s=>s.views[0].camera.position[0]+=.1],['lux claim',s=>s.kitchen_r6_study.measured_lux=500],
 ['approval',s=>s.kitchen_r6_study.construction_approved=true],['unaudited fixture intensity',s=>s.kitchen_r6_study.under_intensity*=4],
 ['detail mixed into lighting comparison',s=>s.kitchen_r6_study.detail=true]
])test('reject '+label,()=>{const s=createR6Candidate('L1');mutate(s);assert.throws(()=>verifyR6Candidate(s,'L1'));});
test('real r160 overlay preserves every existing scene mesh, architecture, door and room',async()=>{
 for(const id of R6_OPTIONS){const s=createR6Candidate(id),m=await measureR6(s.layout,s.kitchen_r6_study);
  assert.deepEqual(m.original,m.after);assert.deepEqual(m.overlay.source_geometry_before,m.overlay.source_geometry_after);
  const under=m.overlay.fixtures.filter(f=>f.kind==='SHIELDED_LINEAR_PROFILE_PROXY');assert.equal(under.length,['L1','L2','L2-F1'].includes(id)?3:0);
  for(const f of under){const o=s.layout.interior.objects.find(o=>o.id===f.source_id);assert.equal(f.length_mm,o.width_mm-50);assert.equal(f.setback_from_front_mm,45);assert.ok(f.emitters.every(e=>e.target[1]<e.position[1]));}
  assert.equal(m.overlay.finishes.length,id==='L2-F1'?5:0);assert.equal(m.overlay.measured_lux,null);assert.equal(m.overlay.product_selected,false);
 }
});
test('complete front inventory has all 15 kitchen IDs, explicit source sizes and conditional apertures',()=>{
 const s=createR6Candidate('L0'),schedule=read(R6_DIR+'/FRONT_SCHEDULE.json');
 const all=[...s.layout.furniture,...s.layout.interior.objects].filter(o=>o.room_id==='KIT-01');
 assert.deepEqual(schedule.rows.map(r=>r.source_id),all.map(o=>o.id));assert.equal(schedule.rows.length,15);
 for(const r of schedule.rows){const o=all.find(o=>o.id===r.source_id);assert.equal(r.original_width_mm,o.width_mm??o.w);assert.equal(r.original_depth_mm,o.depth_mm??o.d);assert.equal(r.original_height_mm,o.height_mm??null);assert.equal(r.approval,'HOLD');}
 assert.ok(schedule.conditional_concepts.every(c=>c.status==='HOLD'));assert.match(schedule.front_direction,/307\/600\/593/);
 const checks=read(R6_DIR+'/INSTALLER_REQUIREMENTS.json');assert.equal(checks.checks.length,9);assert.ok(checks.checks.every(c=>c.status==='HOLD'&&c.site_measurements.length&&c.manufacturer_evidence.length));
});
test('source hood blocks the aimed L3 ceiling ray while L2 hood emitters reach the cooking zone',async()=>{
 const l2=createR6Candidate('L2'),l3=createR6Candidate('L3');
 const a=await measureR6(l2.layout,l2.kitchen_r6_study),b=await measureR6(l3.layout,l3.kitchen_r6_study);
 const blocked=b.central_ray_probes.find(p=>p.emitter_id==='R6-CEILING-HOB');
 assert.equal(blocked.first_source_hit,'starter-22');assert.equal(blocked.hood_blocks_central_ray,true);assert.ok(blocked.hit_elevation_mm>1550);
 const hood=a.central_ray_probes.filter(p=>p.emitter_id.startsWith('R6-HOOD'));
 assert.equal(hood.length,2);assert.ok(hood.every(p=>!p.hood_blocks_central_ray&&p.first_source_hit==='starter-22'&&p.hit_elevation_mm<1000));
});
test('R4 and R5 committed evidence preserved byte-for-byte',()=>{
 for(const dir of ['design-development/kitchen-finish-r4','design-development/kitchen-r5']){
  const files=execFileSync('git',['ls-tree','-r','--name-only',R6_BASE,dir],{encoding:'utf8'}).trim().split('\n');
  for(const f of files)assert.equal(sha256(fs.readFileSync(f)),sha256(execFileSync('git',['show',R6_BASE+':'+f])));
 }
});
test('all 18 delivered R5 PNGs and metadata retain original SHA', {skip:!fs.existsSync('renders/kitchen-r5/VERIFIED_MANIFEST.json')},()=>{
 for(const f of read('renders/kitchen-r5/VERIFIED_MANIFEST.json').frames){assert.equal(sha256(fs.readFileSync('renders/kitchen-r5/'+f.image)),f.image_sha256);assert.equal(sha256(fs.readFileSync('renders/kitchen-r5/'+f.metadata)),f.metadata_file_sha256);}
});
test('complete original R5 review/evidence package retains every manifest byte stream', {skip:!fs.existsSync('renders/kitchen-r5/MANIFEST.sha256')},()=>{
 for(const line of fs.readFileSync('renders/kitchen-r5/MANIFEST.sha256','utf8').trim().split('\n')){
  const separator=line.indexOf('  '),hash=line.slice(0,separator),file=line.slice(separator+2);
  assert.equal(sha256(fs.readFileSync('renders/kitchen-r5/'+file)),hash,'Preserved R5 evidence changed: '+file);
 }
 assert.equal(sha256(fs.readFileSync('renders/kitchen-r5/Review.html')),'bf88cacb86934d6475819dc91fa953dee23badf2b81cd7f8a914897889aa2a32');
 assert.equal(sha256(fs.readFileSync('renders/kitchen-r5/Kitchen-R5-Review.zip')),'b265c12fd5cd5423ccaae65f0504d710690a1b38d1314c6b099dbef0853828ef');
});
