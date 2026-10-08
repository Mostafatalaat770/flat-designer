/**
 * A16: two reversible ROOM-EXACT finish directions, on verified K12 Type B.
 * NO rooms, openings, wall, furniture placement/dims, ceiling height or wet
 * services may change. Rendering is a style experiment, not construction.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

const domain=createApartmentDomain(process.cwd());
const source=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
assert.equal(source.scene_revision,domain.revision(source.layout));
assert.equal(source.architecture_variant.render_only,true);
const v=l=>{try{return domain.validate(l);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const bad=l=>v(l).checks.filter(c=>c.status==='FAIL')
  .map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
const inherited=bad(source.layout);
assert.equal(inherited.length,2,'The two unapproved K12 architecture failures must be disclosed.');

const style={
  'a16-pale-stone':{
    name:'Soft stone & pale oak / calm contemporary',
    wall:'#EEE8DF',kitchen_wall:'#F1ECE5',
    floor:{id:'a16-soft-honed-porcelain',label:'Cream honed porcelain-look',type:'stone',
      colour:'#DFD8CD',finish:'honed',roughness:.67},
    kitchen_floor:true,wood:{id:'a16-natural-bleached-oak',label:'Pale golden oak',type:'wood',
      colour:'#B99B74',finish:'matte',roughness:.76},
    body:'#EBE6DC',quartz:'#E7E0D5',chairs:'#C2B6A8',sofa:'#DED4C5',
    armchair:'#828A78',table:'#DDD6CB',rug:'#C6BDB0',
    buffet:'#B69D7D',entry:'#B99B74',floorlamp:'#B6A47E',
    curtain:'#DDD7CC',lighting:'track-lamps',kelvin:3000,brightness:80,
    intent:'Calm contemporary: continuous cream stone across reception/kitchen, paler oak cabinetry/sideboard, upholstered sand chairs and restrained brass. Cleaner/easier floor, but hard surface acoustic treatment and actual slip/grout cost TBD.'
  },
  'a16-olive-oak':{
    name:'Oak & soft olive / quiet Japandi',
    wall:'#E5DED3',kitchen_wall:'#EEE9E1',
    floor:{id:'a16-low-sheen-oak',label:'Warm medium oak reference',type:'wood',
      colour:'#BEA781',finish:'matte',roughness:.77},
    kitchen_floor:false,wood:{id:'a16-muted-oak',label:'Muted smoke oak',type:'wood',
      colour:'#A98863',finish:'matte',roughness:.78},
    body:'#E9E2D7',quartz:'#DED6C9',chairs:'#B2ADA1',sofa:'#D8D0C2',
    armchair:'#748374',table:'#D9D2C3',rug:'#C3B4A1',
    buffet:'#A1886C',entry:'#B69E7D',floorlamp:'#B6A47E',
    curtain:'#D7D0C4',lighting:'track-lamps',kelvin:3000,brightness:76,
    intent:'Soft Japandi: warm oak reception floor contrasting kitchen porcelain, muted olive chair, low-contrast earthy walls, softened oak sideboard. Comfort/noise feel benefits need physical materials and cleaning proof; oak next to wet terrace and kitchen transition TBD.'
  }
};
const palette=(id,base)=>{
 const add=(label,type,colour,finish,roughness)=>({
  schema:'InteriorMaterial/1',id:label.id,name:label.label,category:type,
  source_status:'GENERIC',base_colour:colour,finish,roughness,metallic:0,
  notes:'A16 generic visual concept only, NOT selected supplier/material SKU.'
 });
 return [
  add(base.floor,base.floor.type,base.floor.colour,base.floor.finish,base.floor.roughness),
  add(base.wood,base.wood.type,base.wood.colour,base.wood.finish,base.wood.roughness),
  add({id:id+'-wall',label:'A16 tinted mineral matte wall'},'paint',base.wall,'mineral-matte',.95),
  add({id:id+'-kitchen-wall',label:'A16 soft kitchen paint'},'paint',base.kitchen_wall,'matte',.94),
  add({id:id+'-kitchen-front',label:'A16 kitchen satin-matte'},'paint',base.body,'satin-matte',.83)
 ];
};
function assignMaterial(obj,slot,id,colour){
 obj.material_references[slot]=id;
 obj.colour=colour;
}
const roomAllowed=new Set(['RECP-01','KIT-01']);
const allowedFurnitureIds=new Set([
 'starter-27','starter-28','starter-29','starter-30','starter-32',
 'starter-35','starter-36','starter-37','starter-38','starter-39',
 'A2-dining-chair-north-centre','A2-dining-chair-south-centre','starter-40',
 'S1-living-side-table','E2-cooking-base','E2-oven-column',
 'E2-fridge','E2-island'
]);
const geometryFurniture=(f)=>({id:f.id,room_id:f.room_id,type:f.type,cx:f.cx,cy:f.cy,w:f.w,d:f.d,rot:f.rot});
const interiorGeom=o=>({id:o.id,type:o.type,room_id:o.room_id,placement:o.placement,
 cx:o.cx,cy:o.cy,rotation:o.rotation,width_mm:o.width_mm,depth_mm:o.depth_mm,height_mm:o.height_mm});
const sourceRoom=source.layout.furniture.map(geometryFurniture);
const sourceObjects=source.layout.interior.objects.map(interiorGeom);
const prevSurf=structuredClone(source.layout.interior.surface_materials);
const out='design-development/advisor/a16';
fs.mkdirSync(out,{recursive:true});
const world=(p,h)=>[(p[0]-domain.model.width_mm/2)/1000,h,(p[1]-domain.model.depth_mm/2)/1000];
const diningCamera=domain.captureCamera(source.layout,{room_id:'RECP-01',
  position:world([13250,9440],1.7),target:world([14400,7600],1.25),fov:42});
const cameraTemplate=[
 {id:'A16-family-living',room_id:'RECP-01',camera:source.views.find(v=>v.id==='J1-living-kitchen').camera},
 {id:'A16-six-seat-dining',room_id:'RECP-01',camera:diningCamera}
];
assert.ok(cameraTemplate.every(v=>v.camera));
const snaps=[],summary=[];
for(const [tag,definition] of [['a16-current',null],...Object.entries(style)]){
 const copy=structuredClone(source);
 const room=copy.layout.studio.rooms;
 if(definition){
   copy.layout.interior.materials.push(...palette(tag,definition));
   const pal=copy.layout.decor.saved.warm.colours;
   const set=(id,col,material)=>{
    const f=copy.layout.furniture.find(x=>x.id===id);
    assert.ok(f&&allowedFurnitureIds.has(id),'Not allowed to alter extra furniture '+id);
    f.color=col;pal[id]=col;
    if(material)f.material_id=material;
   };
   room['RECP-01']={...room['RECP-01'],wall:definition.wall,
     brightness:definition.brightness,temperature:definition.kelvin,lighting:definition.lighting};
   room['KIT-01']={...room['KIT-01'],wall:definition.kitchen_wall,
     brightness:Math.min(90,definition.brightness+5),temperature:definition.kelvin};
   copy.layout.interior.surface_materials['FLOOR-RECP-01']=definition.floor.id;
   if(definition.kitchen_floor)copy.layout.interior.surface_materials['FLOOR-KIT-01']=definition.floor.id;
   const originalWallIds=Object.keys(prevSurf).filter(x=>x.startsWith('WALL-RECP-01'));
   for(const wid of originalWallIds)copy.layout.interior.surface_materials[wid]=tag+'-wall';
   for(const wid of originalWallIds){
     if(copy.layout.interior.surface_materials[wid]!==tag+'-wall')throw Error('Wall finish missing');
   }
   const colors={
     'starter-27':definition.rug,'starter-28':definition.sofa,
     'starter-29':definition.table,'starter-30':definition.wood.colour,
     'starter-32':definition.armchair,'starter-35':definition.table,
     'starter-36':definition.chairs,'starter-37':definition.chairs,
     'starter-38':definition.chairs,'starter-39':definition.chairs,
     'A2-dining-chair-north-centre':definition.chairs,
     'A2-dining-chair-south-centre':definition.chairs,'starter-40':definition.entry,
     'S1-living-side-table':definition.wood.colour,
     'E2-cooking-base':definition.body,'E2-oven-column':definition.body,
     'E2-fridge':definition.body,'E2-island':definition.wood.colour
   };
   for(const [id,col] of Object.entries(colors)){
    let mat=null;
    if(['starter-30','starter-40','E2-island'].includes(id))mat=definition.wood.id;
    if(['E2-cooking-base','E2-fridge','E2-oven-column'].includes(id))mat=tag+'-kitchen-front';
    set(id,col,mat);
   }
   const interior=copy.layout.interior.objects;
   const obj=id=>{const z=interior.find(o=>o.id===id);assert.ok(z,id);return z;};
   assignMaterial(obj('A-dining-sideboard'),'body',definition.wood.id,definition.buffet);
   assignMaterial(obj('A2-living-plant'),'pot',definition.wood.id,definition.wood.colour);
   for(const id of ['E2-upper-north','E2-upper-south','E2-pantry-tall'])
    assignMaterial(obj(id),'primary',tag+'-kitchen-front',definition.body);
   const glass=copy.layout.interior.opening_treatments;
   for(const id of ['GLZ-RECP-N','GLZ-RECP-TERMAIN']){
     assert.ok(glass[id]);
     glass[id].colour=definition.curtain;
   }
   copy.layout.decor.saved.warm.rooms['RECP-01']=definition.floor.type==='stone'?'tile800':'lightoak';
   copy.layout.decor.saved.warm.rooms['KIT-01']='tile800';
 }
 assert.deepEqual(copy.layout.rooms,source.layout.rooms);
 assert.deepEqual(copy.layout.demolished,source.layout.demolished);
 assert.deepEqual(copy.architecture_variant,source.architecture_variant);
 assert.deepEqual(copy.layout.furniture.map(geometryFurniture),sourceRoom);
 assert.deepEqual(copy.layout.interior.objects.map(interiorGeom),sourceObjects);
 assert.deepEqual(copy.layout.interior.opening_treatments['GLZ-RECP-N'].openness,
  source.layout.interior.opening_treatments['GLZ-RECP-N'].openness);
 assert.equal(copy.layout.studio.rooms['RECP-01'].ceiling,'plain');
 assert.equal(copy.layout.studio.rooms['KIT-01'].ceiling,'plain');
 assert.deepEqual(bad(copy.layout),inherited,'A16 material/colour edits cannot fix/hide or create geometry failure');
 copy.name=definition?definition.name:'K12 original look — comparison baseline';
 copy.scene_revision=domain.revision(copy.layout);
 copy.views=structuredClone(cameraTemplate);
 const dest=out+'/'+tag+'.json';
 fs.writeFileSync(dest,JSON.stringify(copy,null,2)+'\n');
 snaps.push(dest);
 summary.push({tag,scene_revision:copy.scene_revision,source:source.scene_revision,
   only_finishes_changed:true,floor_reception:copy.layout.interior.surface_materials['FLOOR-RECP-01']||'decor warm baseline',
   floor_kitchen:copy.layout.interior.surface_materials['FLOOR-KIT-01'],
   wall_reception:copy.layout.studio.rooms['RECP-01'].wall,
   cabinetry:copy.layout.interior.objects.find(o=>o.id==='A-dining-sideboard').colour,
   finishes_note:definition?.intent||'Original K12 baseline rendering, no design change',
   camera_ids:copy.views.map(x=>x.id)});
}
assert.deepEqual(summary.map(z=>z.camera_ids),Array(3).fill(cameraTemplate.map(x=>x.id)));
const result={
 schema:'ApartmentA16FinishesReview/1',
 source:{canonical_sha256:source.canonical_sha256,scene_revision:source.scene_revision},
 variants:summary,
 original_unresolved_architecture_failures:inherited,
 direction:'Two alternate material & ambience palettes, not two new layouts. Geometry is untouched.',
 evaluation_notes:[
  'Palettes are conceptual HEX/reference finishes; not exact texture, real SKU, slip coefficient, chemical/VOC, finish reflectance or installed budget.',
  'Existing geometric K12 kitchen-open study has two unapproved canonical FAILs. Neither option authorises it.',
  'Light scene brightness/temperature is renderer intent, not actual lux, driver switching or fixture electrical plan.',
  'Review which scheme feels calmer/family-first in actual light. Site wet/floor thresholds, acoustic comfort and supplier samples before final selection.'
 ],
 next_steps:['Review same-camera WebGL images from all three snapshots and source/scene asset provenance',
  'Select favorite palette as DESIGN DIRECTION only',
  'After as-built and owner preferences, trial finish sample boards in actual daylight',
  'Qualified lighting/MEP & supplier specification for 2500mm finished ceiling; pricing in Egyptian market later'],
 no_site_or_master_changes:true
};
fs.mkdirSync('review-evidence/advisor-a16',{recursive:true});
fs.writeFileSync('review-evidence/advisor-a16/finish-variants.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({source:result.source,variant_scene_revisions:summary,
  original_failures:inherited.length,snapshots:snaps},null,2));
