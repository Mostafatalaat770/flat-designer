/**
 * Exact source-locked kitchen material experiment. NO scene write.
 * No source dimensions, openings or decorations may be changed by this script.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sourcePath='design-development/reception-sprint/A-P0.json';
const raw=fs.readFileSync(sourcePath),s=JSON.parse(raw);
const patch=JSON.parse(fs.readFileSync('design-development/release-r1/KITCHEN_FINISH_R4_PATCH.json'));
const sha=createHash('sha256').update(raw).digest('hex');
assert.equal(patch.source.sha256,sha);
assert.equal(s.canonical_sha256,patch.source.canonical_sha256);
assert.equal(s.scene_revision,patch.source.scene);
assert.equal(s.source_scene_revision,patch.source.cloud_scene);
assert.equal(s.storage_revision,patch.source.storage_revision);
assert.deepEqual(s.layout.demolished,[]);
assert.equal(patch.status,'RENDER_CANDIDATE_ONLY_NOT_APPLIED');
assert.equal(patch.changes.length,4);
const materials=Object.fromEntries(s.layout.interior.materials.map(x=>[x.id,x]));
assert.equal(materials['kitchen-soft-ivory'].base_colour,'#E8E2D7');
assert.equal(materials['kitchen-soft-ivory'].source_status,'GENERIC');
assert.equal(materials['kitchen-muted-light-oak'].base_colour,'#BCA98F');
assert.equal(s.layout.interior.surface_materials['FLOOR-KIT-01'],'S1-stone');
const refs=Object.fromEntries(s.layout.interior.objects.map(x=>[x.id,x]));
for(const id of patch.preserved.ivory_uppers)
 assert.equal(refs[id].material_references.primary,'kitchen-soft-ivory',id);
const furniture=Object.fromEntries(s.layout.furniture.map(f=>[f.id,f]));
assert.equal(furniture['K3-end-landing'].color,'#BCA98F');
assert.equal(furniture['starter-23'].material_id,'kitchen-soft-ivory');
const geometryFields=['id','type','room_id','cx','cy','w','d','rot','variant'];
const changesById=new Map(patch.changes.map(x=>[x.id,x]));
assert.equal(changesById.size,4);
const allowedIds=['starter-20','K3-corner','K3-sink-base','K3-dishwasher'];
assert.deepEqual([...changesById.keys()],allowedIds);
const candidate=structuredClone(s);
assert.equal(s.layout.decor.active,'warm');
assert.equal(patch.saved_theme_colour_changes.length,4);
assert.deepEqual(patch.saved_theme_colour_changes.map(x=>x.id),allowedIds);
for(const item of patch.saved_theme_colour_changes){
 assert.equal(item.theme,'warm');
 assert.equal(item.expected,'#BCA98F');
 assert.equal(item.set,'#E8E2D7');
 assert.equal(s.layout.decor.saved.warm.colours[item.id],item.expected,item.id+': saved warm');
}

for(const m of patch.changes){
 const f=candidate.layout.furniture.find(x=>x.id===m.id);
 assert.ok(f, m.id);
 for(const [key,value] of Object.entries(m.expected))
  assert.equal(f[key],value, m.id+':'+key);
 for(const key of Object.keys(m.set))assert.ok(['color','material_id'].includes(key));
 Object.assign(f,m.set);
 if(m.id==='K3-dishwasher'){
  assert.equal(f.type,'dishwasher');
  assert.equal(f.variant,'integrated');
  assert.equal(f.material_id,'kitchen-soft-ivory');
 }else{
  assert.equal(f.type,'counter');
  assert.equal(f.variant,'style');
  assert.equal(f.color,'#E8E2D7');
  assert.equal(f.material_id,undefined);
 }
}
for(const m of patch.saved_theme_colour_changes)
 candidate.layout.decor.saved.warm.colours[m.id]=m.set;
const expectedDecor=structuredClone(s.layout.decor);
for(const m of patch.saved_theme_colour_changes)
 expectedDecor.saved.warm.colours[m.id]=m.set;
assert.deepEqual(candidate.layout.decor,expectedDecor,'Only intended four warm saved colors may change');
for(let i=0;i<s.layout.furniture.length;i++){
 const before=s.layout.furniture[i],after=candidate.layout.furniture[i];
 for(const key of geometryFields)assert.deepEqual(after[key],before[key],before.id+': geometry '+key);
 const allowed=changesById.get(before.id)?.set??{};
 for(const key of new Set([...Object.keys(before),...Object.keys(after)]))
  if(!Object.prototype.hasOwnProperty.call(allowed,key))
   assert.deepEqual(after[key],before[key],before.id+': forbidden field '+key);
}
for(const field of ['interior','rooms','demolished','studio','hidden_segments','doors'])
 assert.deepEqual(candidate.layout[field],s.layout[field],field);
const registry=JSON.parse(fs.readFileSync('design-development/decision-registry.json'));
assert.ok(Object.values(registry.approval_flags).every(v=>v===false));
assert.ok(Object.values(patch.release).every(v=>v===false));
// Confirm expected production rendering mechanics on the actual included builder.
const builder=fs.readFileSync('studio/renderer/builders.js','utf8');
assert.match(builder,/case "counter": \{[\s\S]{0,200}mat\(c, \{ roughness: 0\.45 \}\)/);
assert.match(builder,/f\.type === "dishwasher"[\s\S]{0,220}f\.material_id\s*\?\s*interiorPbr\(f\.material_id,f\.color/);
// Output a patch-only audit; do not write a false old-scene-revision snapshot.
const dir='review-evidence/owner-release-r1';
fs.mkdirSync(dir,{recursive:true});
const audit={schema:'TypeBKitchenFinishPatchAuditR4/1',
 source_sha256:sha,changed_ids:allowedIds,allowed_changed_fields:['color','material_id'],
 geometry_drift:0,interior_surfaces_drift:0,arch_door_recolored:false,
 warm_saved_colors_aligned:true, other_decor_drift:0,
 source_unchanged:true,after_webgl_rendered:false,approval:false};
fs.writeFileSync(dir+'/KITCHEN_FINISH_R4_AUDIT.json',JSON.stringify(audit,null,2)+'\n');
console.log('Kitchen finish R4 source-safe: 4 reversible finish-only assignments, no geometry edits');
