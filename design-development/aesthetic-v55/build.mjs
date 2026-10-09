import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../../studio/domain/apartment.mjs';
const dir=import.meta.dirname,domain=createApartmentDomain(path.resolve(dir,'../..'));
const read=f=>JSON.parse(fs.readFileSync(dir+'/'+f));
export function build(){
 const base=read('../unified-furnishing-v55/snapshot.json');
 assert.equal(base.scene_revision,'scene-c9c055c1');
 const operations=[];
 const material=(id,name,category,colour,extra={})=>operations.push({type:'upsert-material',material:{
  schema:'InteriorMaterial/1',id,name,category,source_status:'GENERIC',base_colour:colour,
  finish:'matte',roughness:category==='metal'?.48:.86,metallic:category==='metal'?.72:0,
  notes:'Generic warm contemporary design intent. No selected manufacturer or product.',...extra}});
 material('a1-wall-plaster','Warm chalk ivory plaster','paint','#F1EDE5');
 material('a1-natural-oak','Quiet desaturated natural oak','wood','#B5A38B');
 material('kitchen-muted-light-oak','Shared quiet oak joinery','wood','#B5A38B');
 material('kitchen-soft-ivory','Warm ivory matte joinery','paint','#F1EDE5');
 material('a2-curtain-linen','Pale natural linen curtains','fabric','#E7E0D4');
 material('aesthetic-natural-linen','Natural linen upholstery','fabric','#E7E0D4');
 material('aesthetic-sand-rug','Sand woven rug','fabric','#D6CABB');
 material('aesthetic-olive','Quiet olive upholstery','fabric','#818773');
 material('aesthetic-bronze','Matte brushed bronze','metal','#74624E');
 material('aesthetic-taupe','Soft warm taupe plaster','paint','#D4CBC0');
 material('aesthetic-sage','Pale sage plaster','paint','#DDE1D4');
 for(const [id,name,colour,albedo_texture] of [
  ['art-br1-soft-olive','Quiet landscape artwork concept','#A6AA92','./art/japandi.png'],
  ['art-br2-taupe-line','Warm abstract artwork concept','#B7A99A','./art/warm.png'],
  ['art-master-warm-earth','Quiet earth landscape artwork concept','#CDB9A1','./art/japandi.png']
 ])material(id,name,'artwork',colour,{albedo_texture,texture_scale_mm:{width:1000,height:1000},notes:'Existing generated concept artwork; used as a visual placeholder, not selected art or a licensed product.'});
 const opt=(room_id,key,value)=>operations.push({type:'room-option',room_id,key,value});
 for(const r of ['RECP-01','HALL-01','WIC-01','KIT-01','WC-01','BR-01','BR-02','MBR-01'])opt(r,'wall','#F1EDE5');
 for(const r of ['BR-01','BR-02','MBR-01'])opt(r,'temperature',3000);
 opt('RECP-01','brightness',80);opt('MBR-01','brightness',74);
 for(const r of ['RECP-01','HALL-01'])operations.push({type:'set-room-surface-material',room_id:r,surface:'floor',material_id:'a1-limestone-honed'});
 operations.push({type:'set-room-surface-material',room_id:'KIT-01',surface:'ceiling',material_id:'a2-ceiling-softwhite'});
 for(const [host_wall_id,material_id] of [
  ['WALL-RECP-01-09','aesthetic-taupe'],['WALL-MBR-01-01','aesthetic-taupe'],
  ['WALL-BR-01-02','aesthetic-sage'],['WALL-BR-02-06','aesthetic-taupe']
 ])operations.push({type:'set-wall-surface-material',host_wall_id,material_id});
 const furniture=(id,material_id,changes={})=>operations.push({type:'update-furniture',furniture_id:id,changes:{material_id,...changes}});
 for(const id of ['starter-2','starter-3','starter-6','starter-8','starter-11','starter-18','starter-20','starter-30','starter-35','starter-40','S1-living-side-table','K3-corner','K3-dishwasher','K3-sink-base','K3-end-landing','R1-ensuite-vanity'])furniture(id,'a1-natural-oak');
 for(const id of ['starter-4','starter-5','starter-7','starter-13'])furniture(id,'kitchen-soft-ivory');
 for(const id of ['starter-1','starter-28','starter-36','starter-37','starter-38','starter-39','A2-dining-chair-north-centre','A2-dining-chair-south-centre'])furniture(id,'aesthetic-natural-linen');
 furniture('starter-10','aesthetic-natural-linen',{variant:'upholstered'});
 for(const id of ['starter-9','starter-32'])furniture(id,'aesthetic-olive');
 furniture('starter-12','aesthetic-natural-linen');
 for(const id of ['starter-27','V5-master-rug'])furniture(id,'aesthetic-sand-rug');
 const object=(object_id,changes)=>operations.push({type:'update-object',object_id,changes});
 for(const id of ['A-dining-sideboard','V7-master-drawers','V7-bedroom1-drawers'])object(id,{material_references:{body:'a1-natural-oak'},colour:'#B5A38B'});
 object('V5-master-bench',{material_references:{primary:'aesthetic-natural-linen',accent:'a1-natural-oak'},colour:'#E7E0D4'});
 for(const id of ['S1-reading-lamp','V5-sideboard-lamp'])object(id,{material_references:{primary:'aesthetic-natural-linen',accent:'aesthetic-bronze'},colour:'#E7E0D4'});
 for(const id of ['A1-entry-mirror','WC-A1-mirror'])object(id,{material_references:{frame:'aesthetic-bronze'},colour:'#74624E'});
 object('V5-hall-mirror',{material_references:{frame:'a1-natural-oak'},colour:'#B5A38B'});
 object('A-dining-pendant',{variant:'linear',width_mm:1100,depth_mm:100,height_mm:120,
  placement:{mode:'ceiling',drop_mm:700},material_references:{metal:'aesthetic-bronze'},colour:'#74624E',
  metadata:{role:'Slim longitudinal pendant centred on the unchanged 2000 x 950 dining table',temperature_k:3000}});
 object('BR1-A1-art',{width_mm:400,height_mm:600,placement:{mode:'wall',host_wall_id:'WALL-BR-01-04',offset_mm:788.218,elevation_mm:1150,inset_mm:10},
  material_references:{art:'art-br1-soft-olive',frame:'a1-natural-oak'},metadata:{role:'Portrait artwork centred on the R4 storage at x3775; remains within the solid host segment'}});
 object('MBR-A1-art',{material_references:{art:'art-master-warm-earth',frame:'a1-natural-oak'}});
 object('BR2-A1-art',{variant:'framed',material_references:{art:'art-br2-taupe-line',frame:'a1-natural-oak'}});
 const art=(id,wall,offset,w,h,bottom,material,role)=>operations.push({type:'add-object',object:{id,type:'artwork',variant:'framed',room_id:'RECP-01',
  placement:{mode:'wall',host_wall_id:wall,offset_mm:offset,elevation_mm:bottom,inset_mm:10},rotation:0,width_mm:w,depth_mm:30,height_mm:h,
  material_references:{art:material,frame:'a1-natural-oak'},colour:'#E7E0D4',status:'EXPLORATORY',metadata:{role}}});
 art('AEST-living-art','WALL-RECP-01-03',-791.5675,1500,700,1150,'reference-art-warm','One landscape artwork centred on the sofa; replaces automatic room artwork');
 art('AEST-buffet-art','WALL-RECP-01-18',-1731.9525,1100,750,1100,'art-br1-soft-olive','Artwork centred above the 2000 mm buffet; replaces unanchored automatic dining art');
 assert.ok(operations.length<=100);
 const proposal={schema:'ApartmentDesignProposal/2',canonical_sha256:base.canonical_sha256,base_scene_revision:base.scene_revision,operations,
  notes:['LOCAL warm contemporary aesthetic candidate. Standard appliance envelopes, furniture plan geometry, enclosed kitchen and fixed architecture retained. Guest outward leaf remains a separate conditional study.']};
 const layout=domain.applyProposal(base.layout,proposal),validation=domain.validate(layout);
 assert.equal(validation.summary.fail,0);
 for(const f of layout.furniture){const old=base.layout.furniture.find(o=>o.id===f.id);for(const k of ['id','type','room_id','cx','cy','w','d','rot'])assert.deepEqual(f[k],old[k],f.id+' geometry '+k);}
 assert.deepEqual(layout.rooms,base.layout.rooms);assert.deepEqual(layout.demolished,base.layout.demolished);
 assert.deepEqual(layout.interior.opening_treatments,base.layout.interior.opening_treatments);
 const scene_revision=domain.revision(layout),snapshot={...base,name:'Warm contemporary apartment aesthetic candidate',scene_revision,source_scene_revision:base.scene_revision,storage_revision:null,production_connected:false,layout};
 const brief=domain.designBrief(layout);brief.review_provenance={source_scene:base.scene_revision,source_storage_revision:55,production_connected:false,owner_direction:'Generic standard appliances; apartment beauty, cohesion and movement are the priority.'};
 assert.deepEqual(domain.importBrief(brief),layout);
 const summary={schema:'ApartmentAestheticValidation/1',source_scene:base.scene_revision,candidate_scene:scene_revision,canonical_sha256:base.canonical_sha256,
  operation_count:operations.length,validation:validation.summary,architecture_unchanged:true,all_furniture_plan_geometry_unchanged:true,
  opening_treatments_unchanged:true,standard_appliance_envelopes_unchanged:true,production_connected:false,
  palette:[{name:'عاجي',colour:'#F1EDE5'},{name:'بلوط هادي',colour:'#B5A38B'},{name:'كتان طبيعي',colour:'#E7E0D4'},{name:'زيتوني',colour:'#818773'},{name:'تاوب',colour:'#D4CBC0'},{name:'برونز مطفي',colour:'#74624E'}]};
 return {proposal,snapshot,brief,summary};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const outputs=build();for(const [name,value] of Object.entries(outputs)){if(process.argv.includes('--write'))fs.writeFileSync(dir+'/'+name+'.json',JSON.stringify(value,null,2)+'\n');else assert.deepEqual(read(name+'.json'),value);}
 console.log(JSON.stringify(outputs.summary,null,2));
}
