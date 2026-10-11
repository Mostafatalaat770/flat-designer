import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { BASE_COMMIT,R5_DIR,createR5Experiment,verifyR5Experiment } from './kitchen-r5-experiments.mjs';
import { buildMeasuredKitchen,intersectBounds } from './kitchen-r5-geometry.mjs';
import { CANDIDATE,sha256 } from './kitchen-r4-candidate.mjs';
fs.mkdirSync(R5_DIR,{recursive:true});fs.mkdirSync('work/kitchen-r5',{recursive:true});
const legacy=execFileSync('git',['show',BASE_COMMIT+':studio/renderer/builders.js']);
fs.writeFileSync('work/kitchen-r5/legacy-builders.mjs',legacy);
const layout=JSON.parse(fs.readFileSync(CANDIDATE)).layout;
const original=JSON.stringify(layout);
const before=await buildMeasuredKitchen(layout,'work/kitchen-r5/legacy-builders.mjs');
const after=await buildMeasuredKitchen(layout);
assert.equal(JSON.stringify(layout),original,'Builder mutated source layout');
const equal=(a,b,message)=>assert.equal(JSON.stringify(a),JSON.stringify(b),message);
equal(before.architecture,after.architecture,'Architecture mesh drift');
equal(before.doors,after.doors,'Door geometry drift');
equal(before.room_footprints,after.room_footprints,'Room footprint drift');
equal(before.objects.map(x=>x.id),after.objects.map(x=>x.id),'Cabinet/furniture IDs drift');
equal(before.geometry.uppers,after.geometry.uppers,'Explicit upper mesh drift');
equal(before.geometry.backsplashes,after.geometry.backsplashes,'Explicit backsplash drift');
equal(before.geometry.hoods,after.geometry.hoods,'Hood/appliance mesh drift');
const ids=after.geometry.counters.map(c=>c.source_id);
for(const o of before.objects.filter(o=>!ids.includes(o.id)))equal(after.objects.find(a=>a.id===o.id),o,'Source object mesh drift: '+o.id);
let removed=0;
for(const id of ids){
 const b=before.objects.find(o=>o.id===id),a=after.objects.find(o=>o.id===id);
 assert.equal(b.meshes.length-a.meshes.length,id==='starter-20'?16:8);
 removed+=b.meshes.length-a.meshes.length;
 const old=new Set(b.meshes.map(m=>JSON.stringify(m)));
 for(const mesh of a.meshes)assert.ok(old.has(JSON.stringify(mesh)),'Retained counter mesh changed');
}
assert.ok(after.geometry.counters.every(c=>!c.generated_upper_bounds && !c.generated_backsplash_bounds));
const overlaps=[];
for(const c of before.geometry.counters)for(const u of [...before.geometry.uppers,...before.geometry.hoods]){
 const overlap=intersectBounds(c.generated_upper_bounds,u.carcass_bounds||u.bounds);
 if(overlap)overlaps.push({counter_source_id:c.source_id,other_source_id:u.source_id,...overlap});
}
const signatures=measured=>({architecture_sha256:sha256(JSON.stringify(measured.architecture)),doors_sha256:sha256(JSON.stringify(measured.doors)),
  room_footprints_sha256:sha256(JSON.stringify(measured.room_footprints)),objects:measured.objects.map(o=>({id:o.id,mesh_count:o.meshes.length,geometry_sha256:sha256(JSON.stringify(o.meshes))}))});
const audit={schema:'TypeBKitchenR5GeometryAudit/1',status:'PASS',base_commit:BASE_COMMIT,
 source_layout_sha256:sha256(original),source_layout_changed:false,source_ids_changed:false,
 before:before.geometry,after:after.geometry,before_signatures:signatures(before),after_signatures:signatures(after),
 generated_upper_stacks_removed:4,generated_upper_top_level_meshes_removed:18,generated_backsplashes_removed:4,total_descendant_meshes_removed:removed,
 measured_aabb_overlaps:overlaps,overlap_method:'Actual Three.js axis-aligned mesh bounding boxes; intersections are geometric audit flags, not exact CSG intersections, usable storage volumes or physical clearance certifications.',
 counter_host_walls:{'starter-20':'WALL-KIT-01-01','K3-corner':'WALL-KIT-01-02','K3-sink-base':'WALL-KIT-01-02','K3-end-landing':'WALL-KIT-01-02'},
 authority:'The three explicitly saved elevated wall sideboards define the complete upper run in KIT-01. All four optional demo-generated stacks are superseded, including unsupported portions. The two source wall panels define the backsplash; generic counter skins are superseded. Base carcasses, fronts, worktops and props are retained byte-equivalent as actual mesh geometry.',
 phantom:'K3-end-landing creates a 600mm upper despite no source upper over that location; the west continuous stack also crosses the hood opening.',
 remaining_limits:['Explicit upper fronts are generic sideboard seams/handles, not approved cabinet divisions.','Legacy hood remains a source-stove proxy, not a selected product.','Source backsplash bottom is 930mm against the 860mm worktop proxy; the 70mm lower band and 30mm top gap remain source-detail HOLDs.','No source task-light object or under-cabinet fixture is added; deleted demo emissive strips were not approved fixtures.'],
 owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
fs.writeFileSync(R5_DIR+'/GEOMETRY_AUDIT.json',JSON.stringify(audit,null,2)+'\n');
fs.writeFileSync('work/kitchen-r5/BEFORE_GEOMETRY.json',JSON.stringify(before,null,2)+'\n');
fs.writeFileSync('work/kitchen-r5/AFTER_GEOMETRY.json',JSON.stringify(after,null,2)+'\n');
for(const variant of ['D0','D1','D2']){
 const snapshot=createR5Experiment(variant);verifyR5Experiment(snapshot,variant);
 fs.writeFileSync(R5_DIR+'/'+variant+'.json',JSON.stringify(snapshot,null,2)+'\n');
}
console.log('R5 candidate + actual geometry PASS: 4 phantom stacks, 4 fallback skins, 40 descendant meshes removed; every source-defined object, architecture mesh, door and footprint unchanged.');
