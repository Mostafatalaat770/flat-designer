/**
 * Bathroom visual jury. Clones CURRENT v55 GitHub working snapshot.
 * Treat every finish as an exploratory showroom mockup, not a product order.
 * No plumbing, architecture, fixtures, lighting circuits or ceiling changes.
 */
import assert from "node:assert/strict";
const clone=x=>structuredClone(x);
const BATH_ROOMS=["BATH-M01","BATH-C01","WC-01"];
const CAMERA_IDS=["bath55-master-walkin-deep-eye","bath55-family-entry","guest-wc"];
const material=(id,name,colour,size,notes)=>({
 schema:"InteriorMaterial/1",id,name,category:"stone",
 source_status:"GENERIC",base_colour:colour,finish:"matte",
 roughness:.82,metallic:0,texture_scale_mm:{width:size[0],height:size[1]},
 notes:"Design visualization ONLY; no verified product or wet-grip certificate. "+notes
});
const FINISHES=[
 material("B3-wall-soft-shell","Soft shell warm ivory porcelain","#EEE8DF",[1200,600],"Smooth easy-clean wall concept; tile orientation/cuts unverified."),
 material("B3-accent-clay-stone","Muted limestone / clay stone shower accent","#C8B9A7",[1200,600],"Single shower-end accent, not all-room feature tiling."),
 material("B3-floor-dune-grip","Muted dune floor porcelain","#D7CEC2",[600,600],"Matte proxy appearance is NOT physical wet slip rating."),
 material("B3-wc-deep-taupe","Guest WC warm mineral taupe feature","#BDAA96",[600,600],"Restrained vanity-wall depth; no fabricated brass product.")
];
const roomSurfaceKeys = {
 "BATH-M01":{
  accent:"WALL-BATH-M01-02",
  walls:["WALL-BATH-M01-01","WALL-BATH-M01-02","WALL-BATH-M01-03","WALL-BATH-M01-04","WALL-BATH-M01-05"],
  floor:"FLOOR-BATH-M01"
 },
 "BATH-C01":{
  accent:"WALL-BATH-C01-07",
  walls:["WALL-BATH-C01-01","WALL-BATH-C01-02","WALL-BATH-C01-03","WALL-BATH-C01-04","WALL-BATH-C01-05","WALL-BATH-C01-06","WALL-BATH-C01-07"],
  floor:"FLOOR-BATH-C01"
 },
 "WC-01":{accent:"WALL-WC-01-02",walls:["WALL-WC-01-02"],floor:"FLOOR-WC-01"}
};
const summarize=(scene)=>({
 scene:scene.scene_revision,
 bathFurnishings:scene.layout.furniture.filter(x=>BATH_ROOMS.includes(x.room_id)).map(x=>({id:x.id,type:x.type,room:x.room_id,dim:[x.w,x.d],color:x.color||null,variant:x.variant})),
 glassShelves:scene.layout.interior.objects.filter(x=>BATH_ROOMS.includes(x.room_id)).map(x=>({id:x.id,room:x.room_id,width_mm:x.width_mm,depth_mm:x.depth_mm,height_mm:x.height_mm,placement:x.placement,colour:x.colour}))
});
export function makeBathroomFinishStudy(current,domain){
 assert.equal(current.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(current.source_scene_revision,"scene-4821689");
 assert.equal(current.storage_revision,55);
 assert.equal(current.scene_revision,domain.revision(current.layout));
 assert.deepEqual(current.layout.demolished,[]);
 assert.equal(current.architecture_variant,undefined);
 const ids=new Set(current.views.map(x=>x.id));
 for(const id of CAMERA_IDS)assert.ok(ids.has(id),"Missing actual v55 camera "+id);
 const a=clone(current);
 const b=clone(current);
 a.name="Bathrooms / A2 calm ivory v55 baseline / comparison only";
 b.name="Bathrooms / B3 refined warm stone / finish-only reversible mockup";
 a.views=CAMERA_IDS.map(id=>clone(current.views.find(x=>x.id===id)));
 b.views=clone(a.views);
 b.layout.interior.materials.push(...clone(FINISHES));
 const ms=b.layout.interior.surface_materials,original=current.layout.interior.surface_materials;
 for(const [rid,surfaces] of Object.entries(roomSurfaceKeys)){
  const floor=surfaces.floor;
  assert.ok(original[floor],"Missing source floor "+floor);
  ms[floor]="B3-floor-dune-grip";
  for(const wall of surfaces.walls){
   assert.ok(original[wall],"Missing source wall "+wall);
   ms[wall]=rid==="WC-01"?"B3-wc-deep-taupe":wall===surfaces.accent?"B3-accent-clay-stone":"B3-wall-soft-shell";
  }
 }
 // Color-only cabinet-face tuning, no change to physical usable storage.
 const recolor={
  "R1-ensuite-vanity":"#B5A18C","starter-18":"#B5A18C",
  "BATHC-wall-towel-cabinet-A2":"#EEE8DF",
  "starter-26":"#60432E" // inherited guest walnut deliberately stays walnut
 };
 for(const f of b.layout.furniture)if(recolor[f.id])f.color=recolor[f.id];
 const familyDry=b.layout.interior.objects.find(o=>o.id==="BATHC-wall-towel-cabinet-A2");
 assert.ok(familyDry);
 familyDry.colour="#EEE8DF";
 b.scene_revision=domain.revision(b.layout);
 assert.notEqual(b.scene_revision,a.scene_revision);
 assert.deepEqual(a.layout,current.layout);
 assert.deepEqual(a.views,b.views);
 assert.deepEqual(a.layout.furniture.map(x=>({...x,color:undefined})),b.layout.furniture.map(x=>({...x,color:undefined})));
 const noColors=scene=>scene.layout.interior.objects.map(o=>({...o,colour:undefined}));
 assert.deepEqual(noColors(a),noColors(b));
 assert.deepEqual(a.layout.rooms,b.layout.rooms);
 assert.deepEqual(a.layout.demolished,b.layout.demolished);
 assert.deepEqual(a.layout.decor,b.layout.decor);
 assert.deepEqual(a.layout.studio,b.layout.studio);
 const unchangedSurfaces=Object.keys(original).filter(id=>!Object.values(roomSurfaceKeys).some(x=>x.floor===id||x.walls.includes(id)));
 for(const id of unchangedSurfaces)assert.equal(ms[id],original[id],"Non-bath surface changed "+id);
 const errors=domain.validate(b.layout).checks.filter(c=>c.status==="FAIL");
 assert.deepEqual(errors,[],"B3 must validate full unchanged architectural geometry");
 const master=b.layout.furniture.find(f=>f.id==="BATHM-WALKIN-A1");
 const family=b.layout.furniture.find(f=>f.id==="starter-16");
 const doorM=domain.model.openings.find(o=>o.id==="OP-WIC-BATHM");
 const doorF=domain.model.openings.find(o=>o.id==="OP-HALL-BATHC");
 assert.deepEqual([master.w,master.d,master.variant],[1450,800,"walk-in"]);
 assert.deepEqual([family.w,family.d,family.variant],[900,900,"style"]);
 assert.ok(doorM&&doorF);
 const audit={
  schema:"TypeBBathroomFinishJury/1",status:"FINISH_ONLY_STUDY_NOT_FOR_EXECUTION",
  canonical_sha256:domain.model.canonical_sha256,
  cloud_saved_scene:"scene-4821689",cloud_storage_revision:55,
  source_git_scene:a.scene_revision,finish_candidate_scene:b.scene_revision,
  camera_ids:CAMERA_IDS,
  same_cameras:true,fully_unchanged_canonical_architecture:true,
  changed_openings:0,changed_wet_service_locations:0,changed_shower_dimensions:0,
  bathroom_dimensions:{
   master:{room_id:"BATH-M01",wet_footprint_mm:[master.w,master.d],model_door_nominal_mm:+doorM.length_mm.toFixed(1)},
   family:{room_id:"BATH-C01",wet_footprint_mm:[family.w,family.d],model_door_nominal_mm:+doorF.length_mm.toFixed(1)}
  },
  known_holds:[
   {id:"MASTER-800",status:"HOLD",why:"800mm master wet depth is an exploratory layout, must test splash, safe occupied standing/entry, door arc and real low-threshold feasibility."},
   {id:"FAMILY-DOOR",status:"HOLD",why:"657mm nominal hall door not verified as finished effective opening. Existing 20mm narrow-path proxy is NOT measured clear width."},
   {id:"FAMILY-TRAY",status:"HOLD",why:"Original 900x900 family shower still renders a high/dark prefab base/cage; not an accepted low-profile installation detail."},
   {id:"MASTER-WATER",status:"HOLD",why:"Drain, waterproofing system, slope, threshold and trap access have no as-built/engineer approval."},
   {id:"FAMILY-CHOICE",status:"DESIGN_ALTERNATIVE",why:"Older K4 brief assumed a bathtub; current saved family model uses a 900x900 shower. Preserve current shower; bathtub only if owner explicitly reconsiders future child/soaking needs."},
   {id:"GUEST-SINK",status:"HOLD",why:"350x180 nominal basin may splash; requires selected basin/tap, handwashing trial and easy-clean maintenance clearance."},
   {id:"MATERIALS",status:"HOLD",why:"Procedural hex colors cannot certify real porcelain samples, wet slip, grout joints, lighting CRI or product availability."}
  ],
  design_direction:{
   A:"Existing ivory/greige v55 baseline",
   B:"Soft shell ivory wet walls + one clay-stone shower accent per full bathroom, consistent dune-grip floor, guest WC taupe accent and walnut sink. Brushed nickel common hardware.",
   preferred_prior_to_real_images:"NO_SELECTION; images, actual material samples, wet technical gates first",
   lighting:"Layered warm 3000K general + mirror/task and suitable certified damp/wet-zone units; no speculative ceiling drop",
   special_detail:"Master: sleek singular clear fixed glass with two surface shelves; family: simplified low-track enclosure if waterproofing and tested door flow allow; guest: quiet one-wall accent not ornate decor."
  },
  render_limitations:["Three.js materials and fixtures are visual surrogates, not product photographs","Lighting is not photometric or local electrical approval","Finish-only source leaves known family high-tray black-framed shower unchanged intentionally"],
  provenance:summarize(b)
 };
 return {a,b,audit};
}
export function finishPaletteSvg(audit){
 assert.equal(audit.schema,"TypeBBathroomFinishJury/1");
 const source=[
 ["Wall · soft shell","#EEE8DF","1200 × 600 conceptual porcelain"],
 ["Shower accent · muted stone","#C8B9A7","One wet wall per bath"],
 ["Floor · dune grip visual","#D7CEC2","Certified slip-rated SKU TBD"],
 ["Vanity · pale muted oak","#B5A18C","Moisture-grade joinery TBD"],
 ["Guest taupe feature","#BDAA96","One controlled accent surface"],
 ["Hardware · brushed nickel","#B9BDC0","Corrosion-resistant SKU TBD"]
 ];
 const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;","&lt;").replaceAll(">","&gt;");
 let t='<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1270 710" role="img" aria-label="Coordinated warm-stone bathroom palette under feasibility hold">';
 t+='<rect width="1270" height="710" fill="#FAF8F4"/><text x="48" y="61" font-family="Arial" font-size="30" font-weight="700" fill="#273C33">TYPE B / BATHROOM MATERIAL DIRECTION</text>';
 t+='<text x="48" y="92" font-family="Arial" font-size="17" fill="#64736B">B3 Refined Warm Stone  •  all reversible finishes  •  identical verified apartment layout</text>';
 for(let i=0;i<source.length;i++){
  const [name,col,details]=source[i],x=45+(i%3)*410,y=140+Math.floor(i/3)*228;
  t+='<rect x="'+x+'" y="'+y+'" width="382" height="190" rx="10" fill="#FFFFFF" stroke="#DDD8CE"/>';
  t+='<rect x="'+(x+13)+'" y="'+(y+13)+'" width="356" height="100" rx="6" fill="'+col+'"/>';
  t+='<text x="'+(x+18)+'" y="'+(y+143)+'" font-family="Arial" font-size="17" font-weight="700" fill="#263C32">'+esc(name)+'</text>';
  t+='<text x="'+(x+18)+'" y="'+(y+168)+'" font-family="Arial" font-size="14" fill="#697770">'+esc(details)+'</text>';
 }
 t+='<text x="52" y="632" font-family="Arial" font-size="18" font-weight="700" fill="#4C6657">Luxury by consistency: three related textures + controlled metals, not excess decoration.</text>';
 t+='<text x="52" y="663" font-family="Arial" font-size="16" fill="#A25646">No suppliers, wet-slip test, drainage, toilet/door clearance, membrane or lighting circuit are approved.</text>';
 t+='<text x="52" y="688" font-family="Arial" font-size="13" fill="#78867C">Cloud v55 unchanged · source '+audit.source_git_scene+' · compare real WebGL captures before any finish vote.</text></svg>';
 return t;
}
