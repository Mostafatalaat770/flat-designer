/**
 * Declarative family-use simulator — agents don't need to write one-off JS for
 * every room. Explicit actor/door geometries and source provenance are required.
 *
 * npm run build && node scripts/analyze-family-activity.mjs design-development/advisor/cases/wic-two-person.json
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle} from '../studio/analysis/geometry.mjs';
import {analyzeOccupancyTimeline} from '../studio/analysis/activity.mjs';

const root=process.cwd();
const resolveInput=(file)=>{
 assert.ok(typeof file==='string'&&file.endsWith('.json'),'Expect repository JSON case path');
 const p=path.resolve(root,file);
 assert.ok(p.startsWith(root+path.sep),'Case must be inside the repository');
 return p;
};
const file=resolveInput(process.argv[2]);
const test=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(test.schema,'ApartmentFamilyActivityCase/1');
assert.ok(test.provenance&&test.provenance.length>=20,
 'Explicit source & planning assumptions required');
const sourceFile=resolveInput(test.snapshot);
const scene=JSON.parse(fs.readFileSync(sourceFile,'utf8'));
const domain=createApartmentDomain(root);
assert.equal(scene.canonical_sha256,domain.model.canonical_sha256);
assert.equal(scene.scene_revision,domain.revision(scene.layout));
const room=domain.model.rooms.find(r=>r.id===test.room_id);
assert.ok(room,'Unknown original room ID');
const ids=test.static_furniture_ids||[];
assert.equal(new Set(ids).size,ids.length,'Static furniture IDs must be unique');
const shapes=ids.map(id=>{
 const found=scene.layout.furniture.find(f=>f.id===id);
 assert.ok(found,'Object not in source snapshot: '+id);
 assert.equal(found.room_id,room.id,'Object not in requested original room: '+id);
 return {id,polygon:rectangle(found),provenance:'K12 frozen furniture object '+id};
});
const stages=(test.frames||[]).map(f=>{
 const doors=(f.doors||[]).map(d=>{
  assert.ok(d.provenance&&d.provenance.length>10,
   'No physical door geometry may be included without identifying provenance');
  if(d.sweep){
   if(d.polygon)throw new Error('Door cannot be both polygon and sweep');
   return {id:d.id,sweep:{...d.sweep,provenance:d.provenance}};
  }
  if(d.polygon)return {id:d.id,polygon:d.polygon};
  throw new Error('Door needs explicit polygon or sweep');
 });
 const actors=(f.actors||[]).map(a=>{
  assert.ok(a.provenance&&a.provenance.length>10,
   'Actor occupancy must state hypothetical or measurement evidence');
  return a;
 });
 return {...f,doors,actors};
});
const result=analyzeOccupancyTimeline({
 room:room.poly,static_obstacles:shapes,frames:stages,
 collision_tolerance_mm:test.collision_tolerance_mm??0,
 max_motion_sample_mm:test.max_motion_sample_mm??20,
 route_grid_mm:test.route_grid_mm??50});
const target=path.resolve(root,test.output||'review-evidence/foundation/family-activity.json');
assert.ok(target.startsWith(path.resolve(root,'review-evidence')+path.sep),
 'Review output must stay in review-evidence/');
const report={
 schema:'ApartmentFamilyActivityReport/1',
 name:test.name,
 source_file:test.snapshot,
 source_case:path.relative(root,file),
 canonical_sha256:scene.canonical_sha256,
 scene_revision:scene.scene_revision,
 room_id:room.id,
 source_room_polygon:room.poly,
 provenance:test.provenance,
 static_furniture_ids:ids,
 model_result:result,
 construction_status:'NOT_VERIFIED',
 blockers:[
  'No as-built site verification of person, fixture or doorway geometry',
  'No exact selected manufacturer appliance, wardrobe or drawer swept envelope unless specifically evidenced',
  'No continuous posture/gait collision solution; only declared linear motion and explicit sampled door states',
  'K12 kitchen opening has independent unresolved canonical architecture FAILs'
 ]
};
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
console.log('FAMILY ACTIVITY '+report.name+' '+report.room_id+
 ' frames='+result.frames.length+
 ' intervals='+result.intervals.length+
 ' result='+result.status);
