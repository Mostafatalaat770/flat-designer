/**
 * Advisor A18: family-living visual choices, downstream of frozen Type B K12.
 * Change ONLY conceptual RECP lighting controls and optionally wall-hosted,
 * removable TV-backdrop panel. No architectural, service or furniture changes.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {assessLivingCameraCoverage} from '../studio/analysis/camera-coverage.mjs';
import {relation,rectangle} from '../studio/analysis/geometry.mjs';
const domain=createApartmentDomain(process.cwd());
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const k12=read('design-development/k12/snapshot.json');
const pale=read('design-development/advisor/a17/a16-pale-stone.json');
assert.equal(k12.canonical_sha256,domain.model.canonical_sha256);
assert.equal(k12.scene_revision,domain.revision(k12.layout));
assert.equal(pale.scene_revision,domain.revision(pale.layout));
assert.equal(pale.canonical_sha256,k12.canonical_sha256);
assert.equal(pale.architecture_variant.render_only,true);
const validate=l=>{try{return domain.validate(l);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const hardFailures=l=>validate(l).checks.filter(c=>c.status==='FAIL').map(c=>({
 kind:c.kind,id:c.object_id??null,wall:c.source_wall_index??null
}));
const parentFails=hardFailures(pale.layout);
assert.equal(parentFails.length,2,'The two unresolved K12 architecture failures must remain');
const geometrySignature=l=>({
 room:l.rooms,demolished:l.demolished,
 furniture:l.furniture.map(({id,type,room_id,cx,cy,w,d,rot})=>({id,type,room_id,cx,cy,w,d,rot})),
 nonTVDecor:l.interior.objects.filter(o=>o.id!=='A18-tv-backdrop').map(o=>({
  id:o.id,type:o.type,room_id:o.room_id,placement:o.placement,
  cx:o.cx,cy:o.cy,rotation:o.rotation,width_mm:o.width_mm,depth_mm:o.depth_mm,height_mm:o.height_mm
 })),
 ceiling:l.studio.rooms['RECP-01'].ceiling,
 kitchenCeiling:l.studio.rooms['KIT-01'].ceiling,
 kitchenRoom:l.studio.rooms['KIT-01']
});
const sourceGeom=geometrySignature(pale.layout);
const srcTV=pale.layout.furniture.find(x=>x.id==='starter-31');
assert.ok(srcTV&&srcTV.room_id==='RECP-01');
const host=domain.surfaces().filter(s=>
 s.type==='wall'&&s.room_id==='RECP-01'&&
 Math.abs(s.from[0]-12497.882)<.1&&Math.abs(s.to[0]-12497.882)<.1&&
 Math.min(s.from[1],s.to[1])<1000&&Math.max(s.from[1],s.to[1])>2600
);
assert.equal(host.length,1,'TV must have a unique verified host solid wall, not a glazing opening or removed K12 segment');
const backdrop={
 id:'A18-tv-backdrop',type:'wall-panel',variant:'plain',room_id:'RECP-01',
 placement:{mode:'wall',host_wall_id:host[0].id,
  offset_mm:(srcTV.cx-(host[0].from[0]+host[0].to[0])/2)*host[0].tangent[0]+(srcTV.cy-(host[0].from[1]+host[0].to[1])/2)*host[0].tangent[1],
  inset_mm:8,elevation_mm:470},
 cx:srcTV.cx,cy:srcTV.cy,rotation:90,
 width_mm:1540,depth_mm:22,height_mm:1450,
 material_references:{primary:'a16-natural-bleached-oak'},
 colour:'#C9B49A',status:'EXPLORATORY',
 metadata:{role:'Removable, low-contrast TV backing concept only; TV wiring and actual console installation positions must be reviewed on site.'}
};
const panel=domain.resolveObject(backdrop);
assert.equal(panel.room_id,'RECP-01');
assert.ok(panel.top_mm<2500);
assert.ok(panel.cx>srcTV.cx,'TV panel must be between TV and host wall in plan');
const tvPlan=rectangle(srcTV),panelPlan=rectangle({cx:panel.cx,cy:panel.cy,w:panel.w,d:panel.d,rot:panel.rot});
const tvDistance=relation(tvPlan,panelPlan);
assert.equal(tvDistance.intersects_positive_area,false,'TV panel must not occupy displayed TV bounding prism in plan');
const stand=pale.layout.furniture.find(x=>x.id==='starter-30');
const standDistance=relation(rectangle(stand),panelPlan);
assert.equal(standDistance.intersects_positive_area,false,'Do not cover existing fixed floor furniture');
const cases=[
 {id:'a18-calm-reference',name:'A16 calm contemporary source look',lighting:'track-lamps',brightness:80,kelvin:3000,panel:false},
 {id:'a18-soft-light',name:'Family sofa-focused warm, diffuse light preview',lighting:'lamps',brightness:70,kelvin:2700,panel:false},
 {id:'a18-soft-panel',name:'Warm family light with slim removable oak TV backdrop',lighting:'lamps',brightness:70,kelvin:2700,panel:true}
];
fs.mkdirSync('design-development/advisor/a18',{recursive:true});
fs.mkdirSync('review-evidence/advisor-a18',{recursive:true});
const results=[];
for(const config of cases){
 const candidate=structuredClone(pale);
 candidate.name=config.name;
 candidate.layout.studio.rooms['RECP-01']={
  ...candidate.layout.studio.rooms['RECP-01'],
  lighting:config.lighting,temperature:config.kelvin,brightness:config.brightness
 };
 if(config.panel)candidate.layout.interior.objects.push(structuredClone(backdrop));
 assert.deepEqual(geometrySignature(candidate.layout),sourceGeom);
 assert.deepEqual(candidate.architecture_variant,pale.architecture_variant);
 assert.equal(candidate.canonical_sha256,pale.canonical_sha256);
 const newFailures=hardFailures(candidate.layout);
 assert.deepEqual(newFailures,parentFails,'A18 changes must not cause or mask hard checks');
 candidate.scene_revision=domain.revision(candidate.layout);
 candidate.views=structuredClone(pale.views);
 assert.equal(candidate.views.length,2);
 const cover=candidate.views.map(v=>assessLivingCameraCoverage({
  camera:v.camera,model:domain.model,furniture:candidate.layout.furniture,
  ids:['starter-28','starter-29','starter-31','starter-32'],min_count:4,
  min_inner_margin:.15,interior_objects:candidate.layout.interior.objects
 }));
 assert.ok(cover.every(z=>z.passed && z.proxy_visible_count===4 && z.frame_blockers.length===0),
  'Corrected A17 lounge camera framing lost after change');
 const output='design-development/advisor/a18/'+config.id+'.json';
 fs.writeFileSync(output,JSON.stringify(candidate,null,2)+'\n');
 results.push({
  id:config.id,name:config.name,scene_revision:candidate.scene_revision,
  file:output,panel_enabled:config.panel,
  light_scene:{renderer_mode:config.lighting,cct_kelvin:config.kelvin,brightness_proxy:config.brightness,
   important:'Visual ONLY, not 2700K measured output, real night exposure or independent switched circuitry'},
  structural_hard_failures:newFailures.length,camera_ids:candidate.views.map(v=>v.id),
  visible_centres:cover.map(v=>v.proxy_visible_count)
 });
}
assert.deepEqual(results.map(v=>v.camera_ids),[results[0].camera_ids,results[0].camera_ids,results[0].camera_ids]);
const report={
 schema:'ApartmentA18FamilyLivingFinishLighting/1',
 status:'EXPLORATORY_RENDER_ONLY_NO_FIRST_FIX_APPROVAL',
 canonical_sha256:pale.canonical_sha256,
 parent_scene_revision:pale.scene_revision,
 original_k12_unapproved_failures:parentFails,
 wall_host_id:host[0].id,
 tv_panel_2d_clearance_to_tv_mm:tvDistance.gap_mm,
 tv_panel_2d_clearance_to_stand_mm:standDistance.gap_mm,
 tv_panel_elevation_mm:backdrop.placement.elevation_mm,
 tv_panel_top_mm:panel.top_mm,
 variants:results,
 explicit_visual_restrictions:[
  'This never changes architecture, lighting hardware placement, real sockets, circuit design, AC, RCP, ceiling height or furniture.',
  'The renderer light mode and brightness are aesthetic proxies, NOT controlled night/day photometry or lux or fixture wattage.',
  'A wall-hosted backdrop with 22mm depth is a decorative removable concept, NOT a builder/carpenter wiring approval. TV outlet/wall mount, viewing heat, existing external wall and access must be measured.',
  'The source scene K12 open-kitchen separator has TWO ORIGINAL FAILS. Never promote to approved architectural design.',
  'Actual wood floor/honed porcelain/fabric samples, paint reflectance and electrical safety must be confirmed separately.'
 ],
 decision_rule:'Compare A18 3 matching-view real WebGL images first; keep only visually useful interventions that preserve family circulation and maintainability.'
};
fs.writeFileSync('review-evidence/advisor-a18/lighting-tv-panel-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({source:report.parent_scene_revision,
 host:report.wall_host_id,TV_panel_gap_mm:report.tv_panel_2d_clearance_to_tv_mm,
 stand_panel_gap_mm:report.tv_panel_2d_clearance_to_stand_mm,
 unresolved_canonical_failures:parentFails.length,variants:results},null,2));
