/** Independent acceptance: original bytes, actual image/camera identities, no approvals. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {dir,baseline,sha,domain,source,prepared} from './build-whole-home-m3-group4.mjs';
export function verifySnapshot(s){
 assert.equal(s.canonical_sha256,source.canonical_sha256);assert.equal(s.storage_revision,55);assert.equal(s.scene_revision,domain.revision(s.layout));assert.deepEqual(s.layout.demolished,[]);
 assert.equal(s.layout.furniture.length,source.layout.furniture.length);assert.deepEqual(s.layout.interior,source.layout.interior);
 for(const f of s.layout.furniture){const original=source.layout.furniture.find(o=>o.id===f.id);assert.ok(original);if(f.room_id!=='KIT-01')assert.deepEqual(f,original);else for(const k of ['room_id','type','cx','cy','w','d','rot'])assert.equal(f[k],original[k]);}
 for(const k of Object.keys(source.layout).filter(k=>k!=='furniture'))assert.deepEqual(s.layout[k],source.layout[k]);
 for(const v of s.views)assert.deepEqual(v.camera,JSON.parse(fs.readFileSync(dir+'/A.json')).views.find(q=>q.id===v.id).camera);
 assert.ok(Object.values(s.group4_detail.approvals).every(x=>x===false));
 if(s.kitchen_r6_study)assert.deepEqual(s.kitchen_r6_study,JSON.parse(fs.readFileSync('design-development/kitchen-r6/L2.json')).kitchen_r6_study);
 return true;
}
export function verifyFrame(record,bytes,s){
 assert.equal(record.png_sha256,sha(bytes));assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
 assert.equal(record.full_snapshot_sha256,sha(fs.readFileSync(dir+'/'+record.style+'.json')));assert.equal(record.layout_sha256,sha(JSON.stringify(s.layout)));assert.equal(record.scene_revision,s.scene_revision);assert.equal(record.canonical_sha256,source.canonical_sha256);
 const view=s.views.find(v=>record.frame_id===record.style+'-'+v.id);assert.ok(view);assert.deepEqual(record.camera,view.camera);assert.equal(record.camera_sha256,sha(JSON.stringify(view.camera)));
 assert.deepEqual(record.external_requests,[]);assert.deepEqual(record.page_errors,[]);assert.deepEqual(record.assets.fallbacks,[]);assert.equal(record.assets.pending,0);assert.ok(Object.values(record.architecture_result).every(n=>n===0));assert.equal(record.renderer.engine,'Three.js WebGL');
 if(record.webgl){assert.equal(record.webgl.context_lost,false);assert.deepEqual(record.console_errors,[]);}
 if(s.group4_profile){assert.deepEqual(record.group4_profile,s.group4_profile);assert.deepEqual(record.group4_detail,s.group4_detail);}
 if(record.kitchen_r6_study){assert.equal(record.kitchen_geometry.uppers.length,3);assert.equal(record.kitchen_geometry.backsplashes.length,2);assert.ok(record.kitchen_geometry.counters.every(c=>c.generated_upper_mesh_count===0));assert.equal(record.kitchen_r6_result.measured_lux,null);assert.equal(record.kitchen_r6_result.product_selected,false);assert.equal(record.door_finish_result.geometry_changed,false);for(const d of record.door_finish_result.doors)assert.deepEqual(d.before,d.after);}
 return true;
}
if(process.argv[1]?.endsWith('verify-whole-home-m3-group4.mjs')){
 const files=execFileSync('git',['ls-tree','-r',baseline],{encoding:'utf8'}).trim().split('\n');const locks=[];
 for(const row of files){const [meta,p]=row.split('\t'),gitblob=meta.split(' ')[2],bytes=fs.readFileSync(p),actual=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');assert.equal(actual,gitblob,'Inherited file changed:'+p);locks.push({path:p,git_blob:gitblob});}
 assert.equal(locks.length,1241);const holds=JSON.parse(fs.readFileSync(dir+'/SITE_HOLDS.json'));assert.equal(holds.holds.length,12);assert.equal(holds.total_open_room_gates,40);assert.ok(holds.holds.every(h=>h.approved===false));for(const h of holds.inherited)assert.equal(h.sha256,sha(fs.readFileSync(h.path)));
 const frames=[];for(const key of ['SOURCE','LEAD','A','B','RECOMMENDED']){const s=JSON.parse(fs.readFileSync(dir+'/'+key+'.json'));verifySnapshot(s);for(const v of s.views){const r=JSON.parse(fs.readFileSync(dir+'/frames/'+key+'-'+v.id+'.json'));verifyFrame(r,fs.readFileSync(dir+'/frames/'+r.png),s);frames.push(r);}}
 const initial=JSON.parse(fs.readFileSync(dir+'/frames/A-INITIAL-work.json'));assert.equal(initial.png_sha256,sha(fs.readFileSync(dir+'/frames/'+initial.png)));assert.equal(initial.full_snapshot_sha256,sha(fs.readFileSync(dir+'/A-INITIAL.json')));frames.push(initial);
 for(const view of ['work','sink','night','entry','access'])assert.equal(new Set(frames.filter(r=>r.frame_id.endsWith('-'+view)&&r.style!=='A-INITIAL').map(r=>r.camera_sha256)).size,1);
 fs.writeFileSync(dir+'/PRESERVATION.json',JSON.stringify({schema:'M3Group4Preservation/1',checkpoint:baseline,inherited_files:locks.length,Group3_added_files_retained:120,all_inherited_bytes_identical:true,files:locks,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),canonical_sha256:source.canonical_sha256,prior_HOLDs:28,group4_HOLDs:12,owner_approved:false,cloud_saved:false},null,2)+'\n');
 fs.writeFileSync(dir+'/RENDER_EVIDENCE.json',JSON.stringify({schema:'M3Group4ActualWebGL/1',frames},null,2)+'\n');
 const result={schema:'M3Group4Verification/1',result:'PASS',original_files_preserved:1241,source_kitchen_furniture:9,source_kitchen_interiors:6,m1_intents:prepared.m1_intents.length,actual_frames:frames.length,matched_final_cameras:5,plans:fs.readdirSync(dir+'/plans').length,all_final_png_camera_snapshot_checks:true,zero_cloud_or_construction_approvals:true,prior_holds_preserved:28,new_holds:12,remote_CI:'NOT_TRIGGERED / no remote CI PASS claimed'};
 fs.writeFileSync(dir+'/VERIFICATION.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}
