/**
 * Master M0 visual-detail jury: does not alter canonical room, shower footprint,
 * fixed-glass dimensions/placement, mirror, shelves or real electrical wiring.
 */
import assert from "node:assert/strict";
const copy=v=>structuredClone(v);
const ids=["BATHM-WALKIN-A1","BATHM-glass-600-A1","BATHM-shampoo-shelf-A1","BATHM-shampoo-shelf-A2","BATHM-A1-mirror"];
const affected=["BATHM-glass-600-A1","BATHM-shampoo-shelf-A1","BATHM-shampoo-shelf-A2","BATHM-A1-mirror"];
const cameraIds=["bath55-master-walkin-deep-eye","bath55-master-walkin-correct-door"];
export function masterDetailJury(current,domain){
 assert.equal(current.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(current.source_scene_revision,"scene-4821689");
 assert.equal(current.storage_revision,55);
 assert.equal(current.scene_revision,domain.revision(current.layout));
 assert.deepEqual(current.layout.demolished,[]);
 assert.equal(current.architecture_variant,undefined);
 const a=copy(current),b=copy(current);
 a.name="Master M0 / existing generic screen, shelves and rectangle mirror";
 b.name="Master M2 / slim fixed clear glass, wet trays and task-lit mirror / unapproved";
 a.views=cameraIds.map(id=>{const v=current.views.find(x=>x.id===id);assert.ok(v);return copy(v)});
 b.views=copy(a.views);
 const O=state=>state.layout.interior.objects;
 const get=(objects,id)=>{const obj=objects.find(x=>x.id===id);assert.ok(obj,"Source object missing "+id);return obj;};
 const left=O(a),right=O(b);
 for(const id of ids.filter(x=>x!=="BATHM-WALKIN-A1"))get(left,id);
 const screen=get(right,"BATHM-glass-600-A1");
 assert.deepEqual([screen.width_mm,screen.height_mm,screen.depth_mm,screen.cx,screen.cy],[600,2050,18,6730,7171]);
 assert.equal(screen.variant,"solid-panel");
 screen.variant="fixed-clear-glass";
 screen.metadata={...screen.metadata,role:"M2 transparent glass clip study only: same exact width/depth/height/position; no hardware, anchor or splash certification."};
 for(const id of ["BATHM-shampoo-shelf-A1","BATHM-shampoo-shelf-A2"]){
  const o=get(right,id);
  assert.equal(o.variant,"floating");assert.deepEqual([o.width_mm,o.depth_mm,o.height_mm],[380,115,40]);
  o.variant="wet-tray";
  o.metadata={...o.metadata,role:"M2 cleanable tray with short front retention lip; full volume, substrate/structural fixing and maintenance TBD."};
 }
 const mirror=get(right,"BATHM-A1-mirror");
 assert.equal(mirror.variant,"rectangle");
 assert.deepEqual([mirror.width_mm,mirror.depth_mm,mirror.height_mm],[600,35,850]);
 mirror.variant="task-lit";
 mirror.metadata={...mirror.metadata,role:"M2 3000K non-photometric front top light visual; local wet area zones, lighting lux, circuit, RCD, IP and control need qualified Egyptian electrician."};
 b.scene_revision=domain.revision(b.layout);
 assert.notEqual(a.scene_revision,b.scene_revision);
 assert.deepEqual(a.layout.furniture,b.layout.furniture);
 assert.deepEqual(a.layout.rooms,b.layout.rooms);
 assert.deepEqual(a.layout.demolished,b.layout.demolished);
 assert.deepEqual(a.layout.studio,b.layout.studio);
 assert.deepEqual(a.layout.decor,b.layout.decor);
 assert.deepEqual(a.layout.interior.surface_materials,b.layout.interior.surface_materials);
 assert.deepEqual(a.layout.interior.materials,b.layout.interior.materials);
 assert.deepEqual(a.layout.interior.opening_treatments,b.layout.interior.opening_treatments);
 assert.deepEqual(a.views,b.views);
 const physicalShape=o=>({id:o.id,type:o.type,room_id:o.room_id,placement:o.placement,cx:o.cx,cy:o.cy,rotation:o.rotation,width_mm:o.width_mm,depth_mm:o.depth_mm,height_mm:o.height_mm});
 assert.deepEqual(left.map(physicalShape),right.map(physicalShape));
 for(const src of left)if(!affected.includes(src.id))assert.deepEqual(src,get(right,src.id),"Unrelated interior object drift: "+src.id);
 const failure=domain.validate(b.layout).checks.filter(c=>c.status==="FAIL");
 assert.deepEqual(failure,[],"Candidate must have ZERO hard model fails");
 const audit={
  schema:"MasterDetailJury/1",status:"REVERSIBLE_DESIGN_ONLY",
  canonical_sha256:current.canonical_sha256,cloud_scene:current.source_scene_revision,
  cloud_storage_revision:current.storage_revision,source_scene:a.scene_revision,candidate_scene:b.scene_revision,
  changed_interior_variants_only:{
   "BATHM-glass-600-A1":["solid-panel","fixed-clear-glass"],
   "BATHM-shampoo-shelf-A1":["floating","wet-tray"],
   "BATHM-shampoo-shelf-A2":["floating","wet-tray"],
   "BATHM-A1-mirror":["rectangle","task-lit"]
  },
  exact_unchanged_physical_geometry:true,unchanged_rooms:true,unchanged_wet_layout:true,unchanged_other_furniture:true,
  fixed_glass_mm:[600,18,2050],approximate_open_entry_mm:832,
  two_tray_sizes_mm:[[380,115,40],[380,115,40]],mirror_size_mm:[600,35,850],
  optical_lighting_temperature_k:3000,same_camera_ids:cameraIds,
  construction_holds:{
   safe_glass_and_brackets_manufacturer:false,
   verified_splash_retention_open_dressing_door:false,
   wall_shelf_waterproof_fixing_and_load:false,
   measured_shower_controls_occupant_reach:false,
   electrical_IP_protection_circuit_lux:false,
   selected_local_product_catalogues:false,
   waterproofing_drain_approved:false
  },
  verdict:"M2 is a conditional visual proposal only; independent 1:1 shower/splash, supplier and electrician approvals required. No real photometric calculation."
 };
 return {a,b,audit};
}
export function masterDetailBoardSvg(audit){
 const palette=[
 ["Fixed glass","600 × 2050 mm","Transparent, two low clips; supplier TBD","#d4e9e7"],
 ["Storage","2 × 380 × 115 mm","Removable anti-drop lip trays","#b6bfc1"],
 ["Task mirror","600 × 850 mm","3000 K optical strip; electrical TBD","#e6d6bb"],
 ["Warm wall","Existing finish","No tile changes until sample board","#e9e1d6"]];
 const out=['<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 685">','<rect width="1200" height="685" fill="#faf8f3"/>','<text x="45" y="53" font-family="Arial" font-size="30" font-weight="700" fill="#243a32">MASTER M2 / QUIET, BUILDABLE-IF-APPROVED DETAILS</text>','<text x="45" y="84" font-family="Arial" font-size="17" fill="#62736a">Same 1450 × 800 mm shower; no architectural or drain relocation</text>'];
 palette.forEach(([label,dim,notes,color],i)=>{
  const x=44+(i%2)*580,y=124+Math.floor(i/2)*226;
  out.push('<rect x="'+x+'" y="'+y+'" width="552" height="210" rx="12" fill="#fff" stroke="#d5d5cd"/>');
  out.push('<rect x="'+(x+14)+'" y="'+(y+14)+'" width="160" height="176" rx="8" fill="'+color+'"/>');
  out.push('<text x="'+(x+197)+'" y="'+(y+63)+'" font-size="21" font-weight="700" font-family="Arial" fill="#2f463a">'+label+'</text>');
  out.push('<text x="'+(x+197)+'" y="'+(y+96)+'" font-size="17" font-family="Arial" fill="#4c6657">'+dim+'</text>');
  out.push('<text x="'+(x+197)+'" y="'+(y+138)+'" font-size="14" font-family="Arial" fill="#7a786f">'+notes+'</text>');
 });
 out.push('<text x="50" y="625" font-size="19" font-family="Arial" fill="#9d5843">Not for construction: waterproof fixings, shower splash and electricity zones UNVERIFIED.</text>');
 out.push('<text x="50" y="654" font-size="14" font-family="Arial" fill="#5c7669">Source '+audit.source_scene+' / cloud v55 unchanged / actual product drawings and load tests needed</text>');
 return out.join('')+'</svg>';
}
