/**
 * A19: actual 2.18m TV wall provenance + zero-thickness FINISH comparison.
 * No bulkhead, joinery, slat buildout, drilling, TV mount or electrical point.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const baseline=JSON.parse(fs.readFileSync('design-development/advisor/a18/a18-track-lamps.json','utf8'));
const parent=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const sourceWallId='WALL-RECP-01-15';
const tv=baseline.layout.furniture.find(f=>f.id==='starter-31');
const segments=domain.model.wall_segments.filter(s=>s.rooms.includes('RECP-01'));
const wall=segments[14];
assert.ok(wall&&wall.from[0]===12497.882&&wall.to[0]===12497.882);
assert.ok(Math.abs(wall.from[1]-550.754)<.001&&Math.abs(wall.to[1]-2732.588)<.001);
const length=Math.hypot(wall.to[0]-wall.from[0],wall.to[1]-wall.from[1]);
assert.ok(length>2150&&length<2200);
assert.equal(tv.rot,90);
assert.ok(Math.abs(tv.cx-wall.from[0])<300);
assert.ok(tv.cy-tv.w/2>=wall.from[1]&&tv.cy+tv.w/2<=wall.to[1],
 'Actual TV width does not fit along wall; stop before imagining cladding');
assert.equal(baseline.canonical_sha256,parent.canonical_sha256);
assert.equal(baseline.scene_revision,domain.revision(baseline.layout));
assert.equal(parent.scene_revision,domain.revision(parent.layout));
assert.ok(baseline.layout.interior.surface_materials[sourceWallId]);
const validate=l=>{try{return domain.validate(l);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const fails=l=>validate(l).checks.filter(x=>x.status==='FAIL').map(x=>[x.kind,x.object_id??null,x.source_wall_index??null]);
const inherited=fails(parent.layout);
assert.equal(inherited.length,2);
const colors=[
 {id:'a19-pale-existing',name:'A19 baseline pale TV wall','source':'as A18 chosen calm pale scheme',color:null,material:null,
  note:'KEEP plain; non-gloss wall prevents feature-panel distraction, retains existing 2.18m wall.'},
 {id:'a19-clay-accent',name:'A19 gentle clay/greige matte TV-wall paint',
  source:'EXPLORATORY generic mineral paint; not an approved manufacturer product',
  color:'#BEB2A4',material:'paint',roughness:.96,
  note:'Low-depth warm-clay/taupe colour accent limited to exact 2.18m TV wall; less visual noise than slats.'},
 {id:'a19-soft-oak-accent',name:'A19 light natural oak-look TV-wall finish — style only',
  source:'EXPLORATORY generic wood-look: actual veneer, lamination, textured panels and fire rating NOT selected',
  color:'#BBA78E',material:'wood',roughness:.88,
  note:'Wood-colour alternative has known procedural-render grain limitations; do not imply real veneer or approved panel thickness.'}
];
const material=id=>({
 schema:'InteriorMaterial/1',id:id+'-wall',name:id+' TV wall generic material',
 category:id.includes('oak')?'wood':'paint',source_status:'GENERIC',
 base_colour:colors.find(o=>o.id===id).color,
 finish:'matte',roughness:colors.find(o=>o.id===id).roughness,metallic:0,
 notes:'A19 exploration. Exact supplier, installation detail, adhesives/volatiles/heat/fire, electrics and panel depth need professional evidence.'
});
fs.mkdirSync('design-development/advisor/a19',{recursive:true});
fs.mkdirSync('review-evidence/advisor-a19',{recursive:true});
const entries=[];
for(const sample of colors){
 const scene=structuredClone(baseline);
 if(sample.material){
  const m=material(sample.id);
  scene.layout.interior.materials.push(m);
  scene.layout.interior.surface_materials[sourceWallId]=m.id;
 }
 for(const x of Object.keys(baseline.layout.interior.surface_materials).filter(x=>x.startsWith('WALL-RECP-01')))
  if(x!==sourceWallId)assert.equal(scene.layout.interior.surface_materials[x],baseline.layout.interior.surface_materials[x]);
 assert.deepEqual(scene.layout.furniture,baseline.layout.furniture);
 assert.deepEqual(scene.layout.rooms,baseline.layout.rooms);
 assert.deepEqual(scene.layout.demolished,baseline.layout.demolished);
 assert.deepEqual(scene.layout.interior.objects,baseline.layout.interior.objects);
 assert.deepEqual(scene.layout.interior.opening_treatments,baseline.layout.interior.opening_treatments);
 assert.deepEqual(scene.layout.studio,baseline.layout.studio);
 assert.deepEqual(scene.layout.decor,baseline.layout.decor);
 assert.deepEqual(scene.architecture_variant,baseline.architecture_variant);
 assert.equal(domain.model.height_m,2.5);
 assert.deepEqual(fails(scene.layout),inherited);
 scene.name=sample.name;
 scene.scene_revision=domain.revision(scene.layout);
 assert.equal(scene.views.length,2);
 assert.deepEqual(scene.views,baseline.views);
 const file='design-development/advisor/a19/'+sample.id+'.json';
 fs.writeFileSync(file,JSON.stringify(scene,null,2)+'\n');
 entries.push({...sample,file,scene_revision:scene.scene_revision,actual_surface_id:sourceWallId});
}
const result={
 schema:'ApartmentA19TVWallFinishComparison/1',
 source:{canonical_sha256:parent.canonical_sha256,K12_revision:parent.scene_revision,
  A18_family_lighting:'a18-track-lamps',wall_surface_id:sourceWallId,
  wall_endpoints_mm:[wall.from,wall.to],
  wall_length_mm:+length.toFixed(1),
  tv_nominal_size_mm:[tv.w,tv.d],tv_centre_mm:[tv.cx,tv.cy],
  nominal_tv_face_offset_mm:+Math.abs(tv.cx-wall.from[0]).toFixed(1)},
 studies:entries,
 original_k12_failures:inherited,
 no_geometry_or_carpentry_changes:true,
 release_status:'VISUAL_FINISH_ONLY — NO CONSTRUCTION OR TV MOUNTING AUTHORIZATION',
 caveats:[
  'Wall is labelled unclassified and adjacent to the MAIN terrace; as-built structural/fire/moisture classification is UNKNOWN.',
  'TV equipment wall fixing/load, raceways, sockets, impact/air flow and installer clearance are NOT provided.',
  'No wall panel thickness, glue, acoustic performance, fire rating, heat/UV behaviour or installed price approved.',
  'Generic wood render has procedural texture artifacts; final material requires real physical sample and daytime/sidelight test.',
  'Original K12 kitchen separator has two hard FAILs; cannot approve architecture based on décor comparison.'
 ],
 recommendation:'Prefer plain or muted clay wall over full-width visual-heavy slats pending images and real room daylight. Avoid false elaborate media-wall bulkhead in a narrow 2.18m wall.'
};
fs.writeFileSync('review-evidence/advisor-a19/tv-wall-options.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({wall_id:sourceWallId,length_mm:result.source.wall_length_mm,
 tv_nominal_width_mm:tv.w,options:entries.map(e=>({id:e.id,scene:e.scene_revision})),
 original_hard_failures:inherited.length,release_status:result.release_status},null,2));
