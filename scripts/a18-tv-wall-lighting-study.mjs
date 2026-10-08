/**
 * A18: Family-first light/TV decorative options downstream of A16/A17.
 * Architecture, K12 wet island and 2500mm net height are immutable; outputs
 * are color/fixture-purpose studies only, not a lighting or carpentry plan.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {assessLivingCameraCoverage} from '../studio/analysis/camera-coverage.mjs';
const domain=createApartmentDomain(process.cwd()),M=domain.model;
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const original=read('design-development/k12/snapshot.json');
const base=read('design-development/advisor/a16/a16-pale-stone.json');
assert.equal(original.canonical_sha256,M.canonical_sha256);
assert.equal(original.scene_revision,domain.revision(original.layout));
assert.equal(base.canonical_sha256,original.canonical_sha256);
assert.equal(base.scene_revision,domain.revision(base.layout));
assert.equal(original.architecture_variant.render_only,true);
const validate=l=>{try{return domain.validate(l);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const hardFails=l=>validate(l).checks.filter(x=>x.status==='FAIL').map(x=>({kind:x.kind,object_id:x.object_id??null,source_wall_index:x.source_wall_index??null}));
const inherited=hardFails(original.layout);
assert.equal(inherited.length,2);
assert.deepEqual(hardFails(base.layout),inherited);
const originalFurniture=original.layout.furniture.map(f=>({id:f.id,type:f.type,room_id:f.room_id,cx:f.cx,cy:f.cy,w:f.w,d:f.d,rot:f.rot}));
const originalInteriors=original.layout.interior.objects.map(o=>({id:o.id,type:o.type,room_id:o.room_id,placement:o.placement,cx:o.cx,cy:o.cy,rotation:o.rotation,
 width_mm:o.width_mm,depth_mm:o.depth_mm,height_mm:o.height_mm}));
const tv=original.layout.furniture.find(f=>f.id==='starter-31');
const stand=original.layout.furniture.find(f=>f.id==='starter-30');
assert.ok(tv&&stand&&tv.room_id==='RECP-01'&&stand.room_id==='RECP-01');
const wallPoint=(p,a,b)=>{
 const dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len2));
 const foot=[a[0]+t*dx,a[1]+t*dy];
 return {distance_mm:Math.hypot(foot[0]-p[0],foot[1]-p[1]),fraction:t,foot};
};
const walls=domain.surfaces().filter(s=>s.room_id==='RECP-01'&&s.type==='wall'&&s.length_mm>=1750);
const ranked=walls.map(s=>({wall:s,...wallPoint([tv.cx,tv.cy],s.from,s.to)}))
 .sort((a,b)=>a.distance_mm-b.distance_mm);
const found=ranked[0];
assert.ok(found,'Must find actual canonical reception wall');
assert.ok(found.distance_mm<500,'TV wall not grounded; refuse guessing a remote segment');
assert.ok(found.fraction>.15&&found.fraction<.85,'TV nearly meets a wall end; panel would overhang');
const tangent=found.wall.tangent;
const mid=[(found.wall.from[0]+found.wall.to[0])/2,(found.wall.from[1]+found.wall.to[1])/2];
const offset=(tv.cx-mid[0])*tangent[0]+(tv.cy-mid[1])*tangent[1];
const width_mm=1520;
assert.ok(Math.abs(offset)+width_mm/2<=found.wall.length_mm/2-60,'TV panel not contained on modeled wall');
const world=(p,h)=>[(p[0]-M.width_mm/2)/1000,h,(p[1]-M.depth_mm/2)/1000];
const cameraDefs=[
 {id:'A18-family-sofa-and-TV',from:[12400,5800],to:[11000,2200],fov:60,
  subjects:['starter-28','starter-29','starter-31','starter-32'],minimum:4},
 {id:'A18-focused-TV-wall',from:[10700,4150],to:[12243,1800],fov:42,
  subjects:['starter-30','starter-31'],minimum:2}
];
const themes=[
 {id:'A18-base-light',label:'Calm Contemporary original: track + local lamps',
  lighting:'track-lamps',brightness:80,temperature:3000,
  panel:null,scene_controls:['family-general','reading-independent','evening-scene-to-be-tested']},
 {id:'A18-soft-mineral',label:'Soft mineral TV surround + quiet family lamps',
  lighting:'lamps',brightness:69,temperature:3000,
  panel:{variant:'plain',material:'a16-pale-mineral',colour:'#DED5C8'},
  scene_controls:['dimmable-soft-ambient-intent','reading-lamp-local','TV-glare-check-required']},
 {id:'A18-oak-fluted',label:'Localized matte oak TV wall with layered track & lamps',
  lighting:'track-lamps',brightness:72,temperature:3000,
  panel:{variant:'fluted',material:'a16-natural-bleached-oak',colour:'#B99B74'},
  scene_controls:['ambient-track','reading-local','possible-wallwash-only-after-photometry']}
];
const neutralMaterial={
 schema:'InteriorMaterial/1',id:'a16-pale-mineral',name:'Sample warm mineral TV-wall plaster',
 category:'paint',source_status:'GENERIC',base_colour:'#DED5C8',finish:'matte',
 roughness:.92,metallic:0,
 notes:'Digital generic surface only. No plaster thickness/supplier/VOC/installation approvals.'
};
const cameraNotes=[];
const out='design-development/advisor/a18';
fs.mkdirSync(out,{recursive:true});fs.mkdirSync('review-evidence/advisor-a18',{recursive:true});
const candidateViews=cameraDefs.map(d=>({
 id:d.id,room_id:'RECP-01',
 camera:domain.captureCamera(base.layout,{
  room_id:'RECP-01',position:world(d.from,1.7),target:world(d.to,1.35),fov:d.fov
 })
}));
for(let i=0;i<candidateViews.length;i++){
 const d=cameraDefs[i],v=candidateViews[i];
 const c=assessLivingCameraCoverage({camera:v.camera,model:M,furniture:base.layout.furniture,
  ids:d.subjects,min_count:d.minimum,min_inner_margin:.09,interior_objects:base.layout.interior.objects});
 assert.equal(c.passed,true,'Camera does not frame the required family/TV furniture: '+v.id+' '+JSON.stringify(c));
 assert.equal(c.frame_blockers.length,0,'Lamp obscures TV review camera '+v.id);
 cameraNotes.push({id:v.id,purpose:i===0?'living furniture':'TV stand/panel design',source_subject_projection:c,
   important_limit:'This is NOT occlusion or surface visibility certification; verify real PNG pixels manually.'});
}
const results=[];
for(const theme of themes){
 const s=structuredClone(base);
 const room=s.layout.studio.rooms['RECP-01'];
 room.lighting=theme.lighting;
 room.brightness=theme.brightness;
 room.temperature=theme.temperature;
 let panel=null;
 if(theme.panel){
  if(!s.layout.interior.materials.some(m=>m.id===neutralMaterial.id))s.layout.interior.materials.push(structuredClone(neutralMaterial));
  panel={
   id:'A18-TV-wall-reversible-panel',type:'wall-panel',variant:theme.panel.variant,
   room_id:'RECP-01',
   placement:{mode:'wall',host_wall_id:found.wall.id,offset_mm:+offset.toFixed(1),
    inset_mm:8,elevation_mm:650},
   cx:0,cy:0,rotation:0,width_mm,depth_mm:30,height_mm:1550,
   material_references:{primary:theme.panel.material},
   colour:theme.panel.colour,status:'EXPLORATORY',
   metadata:{role:'Decorative TV backdrop ONLY: no wall demolition, chase, added socket, structural recess or actual LED fitting',
    mounting_method:'TBD, nonload-bearing and removable',
    electrical_approval:'TBD, no wallwashing light fixture installed here',
    engineering_status:'STYLE_ONLY_NO_FABRICATION',
    site_measurement:'TBD'}
  };
  const mounted=domain.resolveObject(panel);
  assert.equal(mounted.host.id,found.wall.id);
  assert.ok(mounted.top_mm<=2500,'2.5m finished ceiling must remain');
  assert.equal(mounted.room_id,'RECP-01');
  s.layout.interior.objects.push(panel);
 }
 assert.deepEqual(s.layout.rooms,original.layout.rooms);
 assert.deepEqual(s.layout.demolished,original.layout.demolished);
 assert.deepEqual(s.architecture_variant,original.architecture_variant);
 assert.deepEqual(s.layout.furniture.map(f=>({id:f.id,type:f.type,room_id:f.room_id,cx:f.cx,cy:f.cy,w:f.w,d:f.d,rot:f.rot})),originalFurniture);
 const before=s.layout.interior.objects.filter(o=>o.id!=='A18-TV-wall-reversible-panel').map(o=>({
  id:o.id,type:o.type,room_id:o.room_id,placement:o.placement,cx:o.cx,cy:o.cy,rotation:o.rotation,
  width_mm:o.width_mm,depth_mm:o.depth_mm,height_mm:o.height_mm
 }));
 assert.deepEqual(before,originalInteriors);
 assert.deepEqual(hardFails(s.layout),inherited,'TV decoration must not add/remove hard geometry FAILs');
 s.name=theme.label;
 s.scene_revision=domain.revision(s.layout);
 s.views=structuredClone(candidateViews);
 const path=out+'/'+theme.id+'.json';
 fs.writeFileSync(path,JSON.stringify(s,null,2)+'\n');
 results.push({id:theme.id,scene_revision:s.scene_revision,source_file:path,
  wall_panel:panel?{id:panel.id,variant:panel.variant,source_wall_id:panel.placement.host_wall_id,width_mm:panel.width_mm,
   depth_mm:panel.depth_mm,height_mm:panel.height_mm,elevation_mm:panel.placement.elevation_mm,
   status:'EXPLORATORY_DECOR_ONLY'}:null,
  lighting_mode:theme.lighting,renderer_brightness:theme.brightness,design_cct_kelvin:theme.temperature,
  scene_controls:theme.scene_controls,views:s.views.map(x=>x.id),construction_approved:false});
}
assert.deepEqual(results.map(x=>x.views),Array(3).fill(candidateViews.map(v=>v.id)));
const report={
 schema:'ApartmentA18LightingTvWallAlternatives/1',
 source:{canonical_sha256:original.canonical_sha256,original_scene_revision:original.scene_revision,
  finish_reference:'a16-pale-stone',unapproved_architecture:true},
 status:'SOURCE_GEOMETRY_VERIFIED_RENDER_NOT_YET_INSPECTED',
 tv_wall:found.wall.id,host_segment:{from:found.wall.from,to:found.wall.to,length_mm:found.wall.length_mm,
   tv_reference_mm:[tv.cx,tv.cy],distance_to_host_mm:+found.distance_mm.toFixed(1),
   panel_anchor_offset_mm:+offset.toFixed(1)},
 captures:cameraNotes,options:results,
 original_k12_architecture_failures:inherited,
 forbidden_inferences:[
  'No new circuits, fixture quantities, lumen/lux calculation or LED profile specified',
  'Lighting scene brightness and approximate 3000K are renderer settings, NOT engineered evening illumination',
  'Panels are illustrative and non-structural; no drilling/cable chases or installed fixed TV bracket certified',
  'TV receiver and panel appearance in a still image does not prove cables, heat or serviceability',
  'No change to original 2500mm clear ceiling nor unapproved open kitchen geometry'
 ],
 next:'Inspect actual consistent WebGL outputs and choose detail direction, then demand electrician/RCP and carpentry/shop drawing evidence before construction.'
};
fs.writeFileSync('review-evidence/advisor-a18/tv-wall-lighting-decision.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({source:report.source,wall:report.host_segment,
 scenes:results.map(({id,scene_revision,wall_panel,lighting_mode})=>({id,scene_revision,wall_panel,lighting_mode})),
 cameras:cameraNotes.map(c=>({id:c.id,inside:c.source_subject_projection.proxy_visible_count})),
 architecture_fails:inherited.length,approved:false},null,2));
