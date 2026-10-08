/**
 * A18 — compare three apartment-faithful lounge fixture *intents* on the
 * preferred A16 pale-stone direction, using A17 proven camera coverage.
 * NO actual lighting photometry/electrical RCP/fixture SKU or drywall cuts.
 *
 * npm run build &&
 * node scripts/a16-prepare-finish-directions.mjs &&
 * node scripts/a17-build-living-focused-views.mjs &&
 * node scripts/a18-build-living-lighting-scenes.mjs
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {assessLivingCameraCoverage} from '../studio/analysis/camera-coverage.mjs';
const domain=createApartmentDomain(process.cwd());
const original=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const base=JSON.parse(fs.readFileSync('design-development/advisor/a17/a16-pale-stone.json','utf8'));
assert.equal(original.canonical_sha256,domain.model.canonical_sha256);
assert.equal(original.scene_revision,domain.revision(original.layout));
assert.equal(base.scene_revision,domain.revision(base.layout));
assert.deepEqual(original.architecture_variant,base.architecture_variant);
assert.equal(base.layout.studio.rooms['RECP-01'].ceiling,'plain');
const validate=l=>{try{return domain.validate(l);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const failure=l=>validate(l).checks.filter(x=>x.status==='FAIL').map(x=>[x.kind,x.object_id??null,x.source_wall_index??null]);
const originalFailures=failure(original.layout);
assert.equal(originalFailures.length,2);
assert.deepEqual(failure(base.layout),originalFailures);
assert.equal(domain.model.height_m,2.5);
const safeFurniture=list=>list.map(f=>({id:f.id,room_id:f.room_id,cx:f.cx,cy:f.cy,w:f.w,d:f.d,rot:f.rot,type:f.type}));
const physicalInteriors=list=>list.map(o=>({id:o.id,type:o.type,room_id:o.room_id,
 placement:o.placement,cx:o.cx,cy:o.cy,rotation:o.rotation,width_mm:o.width_mm,
 depth_mm:o.depth_mm,height_mm:o.height_mm}));
const sceneViews=structuredClone(base.views);
assert.equal(sceneViews.length,2);
const modes=[
 {id:'a18-track-lamps',
  name:'A18 01 — flexible tracks with reading lamps',
  lighting:'track-lamps',temperature:3000,brightness:80,
  pros:['Ceiling-directed general/task pool','Wall/near-sofa reading accent','Lighting groups and different mood possible in *principle*'],
  cons:['Many visible spots can feel too busy','Actual wall-lamp locations, shadows and cable routing unknown']},
 {id:'a18-soft-lamps',
  name:'A18 02 — soft lamps and wall sconces, no ceiling track in lounge',
  lighting:'lamps',temperature:2700,brightness:66,
  pros:['Soft residential mood, less visible black track hardware','Local reading light closer to seated family'],
  cons:['May leave cleaning/task areas too dim without independent general layer','Real available sockets and wall mounting unverified']},
 {id:'a18-clean-track',
  name:'A18 03 — ceiling tracks only (independent wall lamp held as future option)',
  lighting:'track',temperature:3000,brightness:73,
  pros:['Simple clean ceiling-line concept, adjustable directional lighting'],
  cons:['Potential glare/strong spotlighting','No modeled independent low-level evening reading light']}
];
fs.mkdirSync('design-development/advisor/a18',{recursive:true});
fs.mkdirSync('review-evidence/advisor-a18',{recursive:true});
const proof=[];
for(const m of modes){
 const scene=structuredClone(base);
 const room=scene.layout.studio.rooms['RECP-01'];
 const kitchen=JSON.stringify(scene.layout.studio.rooms['KIT-01']);
 const before=structuredClone(scene.layout);
 scene.name=m.name;
 room.lighting=m.lighting;room.temperature=m.temperature;room.brightness=m.brightness;
 scene.scene_revision=domain.revision(scene.layout);
 scene.views=structuredClone(sceneViews);
 assert.equal(JSON.stringify(scene.layout.studio.rooms['KIT-01']),kitchen);
 assert.deepEqual(scene.layout.furniture,base.layout.furniture);
 assert.deepEqual(scene.layout.interior,base.layout.interior);
 assert.deepEqual(scene.layout.decor,base.layout.decor);
 assert.deepEqual(scene.layout.rooms,base.layout.rooms);
 assert.deepEqual(scene.architecture_variant,base.architecture_variant);
 assert.deepEqual(physicalInteriors(scene.layout.interior.objects),physicalInteriors(base.layout.interior.objects));
 assert.deepEqual(safeFurniture(scene.layout.furniture),safeFurniture(base.layout.furniture));
 assert.deepEqual(
  {...scene.layout,studio:before.studio},
  before,
  'RECP studio light scene may be the only changed property group');
 assert.deepEqual(failure(scene.layout),originalFailures);
 for(const view of scene.views){
  const coverage=assessLivingCameraCoverage({camera:view.camera,model:domain.model,
   furniture:scene.layout.furniture,interior_objects:scene.layout.interior.objects,
   ids:['starter-28','starter-29','starter-31','starter-32'],
   min_count:4,min_inner_margin:.15});
  assert.equal(coverage.passed,true,'A18 invalid camera '+view.id);
  assert.equal(coverage.frame_blockers.length,0,'A18 lamp occlusion not accepted');
 }
 const file='design-development/advisor/a18/'+m.id+'.json';
 fs.writeFileSync(file,JSON.stringify(scene,null,2)+'\n');
 proof.push({...m,file,scene_revision:scene.scene_revision,canonical_sha256:scene.canonical_sha256,
  cameras:scene.views.map(v=>({id:v.id,camera:v.camera}))});
}
for(const p of proof)assert.deepEqual(p.cameras,proof[0].cameras);
const audit={
 schema:'ApartmentA18LivingLightingAlternatives/1',
 source:{canonical_sha256:original.canonical_sha256,
  original_k12_revision:original.scene_revision,
  parent_palette:'A16 pale stone / Calm Contemporary, original A17 living-camera corrections',
  finished_clear_ceiling_mm:2500},
 status:'THREE_CONCEPTUAL_ROOM_LIGHTING_OPTIONS_NO_ELECTRICAL_APPROVAL',
 unchanged:['canonical architecture','original two K12 kitchen FAILs','original room geometry',
  'all furniture XY/dimensions','all decorative object positions','kitchen lighting and appliances',
  '2500mm plain ceiling','all existing glazing and door openings'],
 three_scenarios:proof.map(({cameras,...p})=>p),
 inherited_k12_failures:originalFailures,
 feasibility_gates:[
  'No photometric lux, uniformity, UGR or beam angles certified. No manufacturer light fixture SKU.',
  'The renderer compares its own fixtures with studio scene brightness; not a true night/day solar study.',
  'Any floor lamp proposed by studio must be checked for trip/clearance, plugs, wall power and maintenance.',
  'No actual ceiling track/wall lamp mounting or electrician circuits until site first-fix and ceiling/RCP.',
  'Existing 2 K12 structural hard FAILs remain; concept is visual only. No architecture/ceiling alterations.',
  'All controls must preserve local/manual use and separately reachable cleaning/general scenes.'
 ],
 provisional_design_judgment:'Keep independently dimmable general light and a local task/reading layer as combined design intent, but first inspect actual same-camera WebGL images. Avoid declaring a fixed fixture configuration from this test.'
};
fs.writeFileSync('review-evidence/advisor-a18/lighting-options.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({schema:audit.schema,
 choices:proof.map(p=>({id:p.id,mode:p.lighting,cct:p.temperature,brightness:p.brightness,
  cameras:p.cameras.map(v=>v.id),scene:p.scene_revision})),
 original_failures:originalFailures.length,status:audit.status},null,2));
