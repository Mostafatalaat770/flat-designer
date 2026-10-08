/**
 * A17 — repair A16 camera coverage: the original "living" view aimed at
 * kitchen and failed to evidence lounge upholstery, table or TV.
 * Two camera positions deliberately target the real, unchanged RECP lounge.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {assessLivingCameraCoverage} from '../studio/analysis/camera-coverage.mjs';
const domain=createApartmentDomain(process.cwd());
const original=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(original.scene_revision,domain.revision(original.layout));
assert.equal(original.canonical_sha256,domain.model.canonical_sha256);
const validate=l=>{try{return domain.validate(l)}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const failures=l=>validate(l).checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
const originalFailures=failures(original.layout);assert.equal(originalFailures.length,2);
const geom=(x)=>({id:x.id,type:x.type,room_id:x.room_id,cx:x.cx,cy:x.cy,w:x.w,d:x.d,rot:x.rot});
const sourcePositions=original.layout.furniture.map(geom);
const sourceObjects=original.layout.interior.objects.map(x=>({id:x.id,type:x.type,room_id:x.room_id,
 placement:x.placement,cx:x.cx,cy:x.cy,rotation:x.rotation,width_mm:x.width_mm,depth_mm:x.depth_mm,height_mm:x.height_mm}));
const world=(p,h)=>[(p[0]-domain.model.width_mm/2)/1000,h,(p[1]-domain.model.depth_mm/2)/1000];
const defs=[
 {id:'A17-lounge-sofa-tv',position_mm:[12400,5800],aim_mm:[11000,2200],
  purpose:'Whole family seating: sofa, coffee, armchair and TV all in view'},
 {id:'A17-lounge-second-eye',position_mm:[13600,5500],aim_mm:[11000,2500],
  purpose:'Second non-overlapping eye within lounge, cross-check finishes and seating scale'}
];
const subjects=['starter-28','starter-29','starter-31','starter-32'];
const files=['a16-current','a16-pale-stone','a16-olive-oak'];
fs.mkdirSync('design-development/advisor/a17',{recursive:true});
fs.mkdirSync('review-evidence/advisor-a17',{recursive:true});
const evidence=[];
for(const slug of files){
 const sourceFile='design-development/advisor/a16/'+slug+'.json';
 const scene=JSON.parse(fs.readFileSync(sourceFile,'utf8'));
 assert.equal(scene.scene_revision,domain.revision(scene.layout),'No stale/mismatched source scene');
 assert.equal(scene.canonical_sha256,original.canonical_sha256);
 assert.deepEqual(scene.layout.rooms,original.layout.rooms);
 assert.deepEqual(scene.layout.demolished,original.layout.demolished);
 assert.deepEqual(scene.layout.furniture.map(geom),sourcePositions,'Do not move furniture in visual palette review');
 assert.deepEqual(scene.layout.interior.objects.map(x=>({id:x.id,type:x.type,room_id:x.room_id,
  placement:x.placement,cx:x.cx,cy:x.cy,rotation:x.rotation,width_mm:x.width_mm,depth_mm:x.depth_mm,
  height_mm:x.height_mm})),sourceObjects,'No hidden decorative joinery move');
 assert.deepEqual(scene.architecture_variant,original.architecture_variant);
 assert.deepEqual(failures(scene.layout),originalFailures);
 scene.views=defs.map(d=>({
  id:d.id,
  room_id:'RECP-01',
  camera:domain.captureCamera(scene.layout,{
   room_id:'RECP-01',position:world(d.position_mm,1.7),target:world(d.aim_mm,1.15),fov:60
  })
 }));
 const coverage=scene.views.map(v=>{
  const check=assessLivingCameraCoverage({
   camera:v.camera,model:domain.model,furniture:scene.layout.furniture,ids:subjects,
   min_count:4,min_inner_margin:.15,interior_objects:scene.layout.interior.objects
  });
  assert.equal(check.passed,true,'Reject camera that crops living essentials: '+v.id);
  assert.equal(check.proxy_visible_count,4);
  assert.equal(check.frame_blockers.length,0,'No reading lamp should mask centre of lounge');
  return {view_id:v.id,purpose:defs.find(d=>d.id===v.id).purpose,...check};
 });
 const file='design-development/advisor/a17/'+slug+'.json';
 fs.writeFileSync(file,JSON.stringify(scene,null,2)+'\n');
 evidence.push({id:slug,source_file:sourceFile,snapshot:file,scene_revision:scene.scene_revision,
  source_camera_coverage:coverage,views:scene.views.map(v=>({id:v.id,camera:v.camera}))});
}
for(const entry of evidence){
 assert.deepEqual(entry.views,evidence[0].views,'Every finish direction MUST use identical tested camera objects');
}
const output={
 schema:'ApartmentA17FocusedLivingComparison/1',
 state:'SOURCE_VERIFIED_CAMERA_FRAME_PROXY_PASS; AWAIT_ACTUAL_IMAGE_QA',
 canonical_sha256:original.canonical_sha256,source_revision:original.scene_revision,
 room:'RECP-01',furniture_subject_ids:subjects,
 baseline_directions:evidence,
 initial_camera_issue:'A16-family-living camera aims at island/kitchen, not complete family sitting area; avoids claiming visibility as living assessment',
 geometry_guarantee:'Only camera views changed from A16 snapshots; NO furniture, room, doors, K12 architectural overlay, kitchen services or ceiling geometry changed.',
 original_k12_failures:originalFailures,
 render_and_material_limits:[
  'Frustum test only projects nominal centres; objects may still be visually hidden by occlusions/cropping and must be manually inspected.',
  'The A16 warm wood floor currently has an exaggerated procedural texture. Do not infer that actual oak, parquet or wood-effect tiles look like this render.',
  'Generic materials are COLOR/STYLE ONLY, without proof of Egypt suppliers, cleanability, sound, slip ratings, VOC or cost.',
  'K12 kitchen-opening overlay remains 2 architectural FAILs; A16 reception/kitchen floor continuity is never approved as construction.'
 ],
 future_design_gate:'Select visual direction only after verified real rendering and review of actual sofa/armchair/TV visibility. Site/source remain unapproved.'
};
fs.writeFileSync('review-evidence/advisor-a17/subject-visibility.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({schema:output.schema,source:output.source_revision,
 views:evidence[0].source_camera_coverage.map(v=>({id:v.view_id,visible:v.proxy_visible_count,
  coords:v.subjects.map(s=>[s.id,s.ndc_x,s.ndc_y,s.inside_safe_frame])})),
 variants:evidence.map(x=>({id:x.id,rev:x.scene_revision})),
 unresolved_k12_hard_failures:originalFailures.length,
 construction_approved:false},null,2));
