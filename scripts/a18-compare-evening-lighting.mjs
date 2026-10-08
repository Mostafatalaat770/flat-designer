/**
 * A18 — 3 real night-lighting treatments for the same pale-stone A16
 * family-living design, source K12. No fabricated light positions, circuit
 * ratings, ceiling drops, TV wall millwork, or installation approvals.
 *
 * All snapshots have exactly identical true-camera positions/targets/viewport
 * and NIGHT=true. Only room lighting renderer controls change.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {assessLivingCameraCoverage} from '../studio/analysis/camera-coverage.mjs';
const domain=createApartmentDomain(process.cwd());
const original=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const base=JSON.parse(fs.readFileSync('design-development/advisor/a17/a16-pale-stone.json','utf8'));
assert.equal(original.canonical_sha256,domain.model.canonical_sha256);
assert.equal(base.canonical_sha256,domain.model.canonical_sha256);
assert.equal(original.scene_revision,domain.revision(original.layout));
assert.equal(base.scene_revision,domain.revision(base.layout));
const validate=l=>{try{return domain.validate(l);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const failures=l=>validate(l).checks.filter(x=>x.status==='FAIL').map(x=>[x.kind,x.object_id??null,x.source_wall_index??null]);
const inherited=failures(original.layout);
assert.equal(inherited.length,2,'The kitchen opening remains not approved.');
const physical=f=>({id:f.id,type:f.type,room:f.room_id,cx:f.cx,cy:f.cy,w:f.w,d:f.d,rot:f.rot});
const objGeom=o=>({id:o.id,type:o.type,room:o.room_id,mode:o.placement,
 cx:o.cx,cy:o.cy,w:o.width_mm,d:o.depth_mm,h:o.height_mm,rot:o.rotation});
const freezeF=original.layout.furniture.map(physical);
const freezeO=original.layout.interior.objects.map(objGeom);
const candidate=[
 {tag:'a18-night-track-current',title:'Night reference — A16 track + lamps',
  lighting:'track-lamps',temperature:3000,brightness:80,
  expected:'Night renderer baseline: track/lamps all active; may feel busy or overly bright.'},
 {tag:'a18-night-warm-lamps',title:'Warm low-glare lamps only',lighting:'lamps',
  temperature:2700,brightness:46,
  expected:'Reduce visible overhead sources: favor soft pockets around the lounge; verify task ability and glare with actual photometry.'},
 {tag:'a18-night-warm-track',title:'Warm track + lamps reduced brightness',
  lighting:'track-lamps',temperature:2700,brightness:52,
  expected:'Keep adjustable directional track option plus warm lamps, softer level; future switching groups require electrician.'}
];
const checkCam=(scene)=>scene.views.map(v=>{
 const x=assessLivingCameraCoverage({camera:v.camera,model:domain.model,
  furniture:scene.layout.furniture,interior_objects:scene.layout.interior.objects,
  ids:['starter-28','starter-29','starter-31','starter-32'],min_count:4,min_inner_margin:.15});
 assert.equal(x.passed,true,'Subject not visible in preflight '+v.id);
 assert.equal(x.frame_blockers.length,0,'Occluding standing lamp is a camera failure');
 return {id:v.id,visible:x.proxy_visible_count,blockers:x.frame_blockers};
});
const out='design-development/advisor/a18';
fs.mkdirSync(out,{recursive:true});
fs.mkdirSync('review-evidence/advisor-a18',{recursive:true});
const evidence=[];
for(const c of candidate){
 const scene=structuredClone(base);
 assert.equal(scene.layout.studio.rooms['RECP-01'].ceiling,'plain');
 scene.layout.studio.rooms['RECP-01']={
  ...scene.layout.studio.rooms['RECP-01'],
  lighting:c.lighting,temperature:c.temperature,brightness:c.brightness
 };
 for(const v of scene.views){
   // Only lighting/daytime viewing state changes; geometry/camera optics and
   // positions remain identical across variants, validated below.
   v.camera.viewer.night=true;
   v.camera.viewer.hour=20;
 }
 scene.name=c.title;
 scene.scene_revision=domain.revision(scene.layout);
 assert.deepEqual(scene.layout.furniture.map(physical),freezeF);
 assert.deepEqual(scene.layout.interior.objects.map(objGeom),freezeO);
 assert.deepEqual(scene.layout.rooms,original.layout.rooms);
 assert.deepEqual(scene.layout.interior.opening_treatments,base.layout.interior.opening_treatments);
 assert.deepEqual(scene.architecture_variant,original.architecture_variant);
 assert.deepEqual(failures(scene.layout),inherited);
 assert.equal(scene.layout.studio.rooms['RECP-01'].ceiling,'plain');
 assert.equal(domain.model.height_m,2.5);
 const visible=checkCam(scene);
 const file=out+'/'+c.tag+'.json';
 fs.writeFileSync(file,JSON.stringify(scene,null,2)+'\n');
 evidence.push({...c,file,scene_revision:scene.scene_revision,camera_ids:scene.views.map(v=>v.id),
  camera_signatures:scene.views.map(v=>v.camera),coverage:visible});
}
const reference=evidence[0].camera_signatures;
for(const e of evidence)assert.deepEqual(e.camera_signatures,reference,
 'All comparison cameras (including evening mode) must be EXACTLY the same');
const report={
 schema:'ApartmentA18LivingEveningLighting/1',
 canonical_sha256:original.canonical_sha256,
 source_scene_revision:original.scene_revision,
 base_palette:'A16 Calm Contemporary pale stone and lighter oak, decorative only',
 camera_source:'A17 corrected source-verified lounge views, evening at nominal 20:00',
 canonical_kitchen_structural_failures_unwaived:inherited,
 schemes:evidence.map(({camera_signatures,...e})=>e),
 status:'GEOMETRY_AND_CAMERA_PREFLIGHT_ONLY; AWAIT_WEBGL_AND_HUMAN_REVIEW',
 independent_electrical_group_certified:false,
 site_electrical_specified:false,
 limits:[
  'Studio lighting room preset is a visual intent, not distinct installed switched circuits; room-wide renderer brightness is not measured lux.',
  'The night setting is a renderer lighting simulation, not physically measured nighttime light distribution.',
  'All existing fixtures are retained; no new fixtures, TV cladding, new ceiling cavities, hidden ducts or downlights are built.',
  'Temperature 2700/3000K are exploratory scene controls; actual sockets, glare, CRI, lighting directions, drivers and switch locations TBD.',
  'The original K12 kitchen/open-partition architectural FAILs remain unresolved. Engineering release blocked.'
 ],
 designer_followup:[
  'Inspect matched-camera evening images, not just passing JSON and capture manifest.',
  'Select a direction for family sitting/movies vs safe reading and cleaning; compare manual switching of task vs ambient lights.',
  'Test no glare on real TV and a nighttime route from entry to rooms once actual electrical RCP is measured.',
  'TV wall reversible paint and surface details only after source-anchored wall/clearance check.'
 ],
 no_master_or_saved_studio_write:true
};
fs.writeFileSync('review-evidence/advisor-a18/lighting-scene-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({source:report.source_scene_revision,
 night_schemes:evidence.map(z=>({id:z.tag,rev:z.scene_revision,lighting:z.lighting,
 temperature:z.temperature,brightness:z.brightness,views:z.coverage})),
 inherited_arch_failures:inherited.length,
 release:'NOT_APPROVED'},null,2));
