/**
 * Sprint 4: unchanged Type B kitchen — door/appliance/operator operating envelopes.
 * This is a sensitivity experiment, never manufacturer kinematics or approved design.
 * Produces only supplementary JSON/SVG in reception-sprint4, never a new live scene.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {rectangle,relation,sweepRelation} from "../studio/analysis/geometry.mjs";

const root="design-development/reception-sprint";
const dest="design-development/reception-sprint4";
fs.mkdirSync(dest,{recursive:true});
const raw=fs.readFileSync(root+"/A-P0.json");
const scene=JSON.parse(raw);
const audit=JSON.parse(fs.readFileSync(root+"/audit-proposed.json","utf8"));
const domain=createApartmentDomain(process.cwd());
const round=n=>Math.round(n*10)/10;
const approx=(actual,expected,epsilon=.11)=>assert.ok(Math.abs(actual-expected)<=epsilon,actual+" != "+expected);
assert.equal(scene.source_scene_revision,"scene-4821689");
assert.equal(scene.storage_revision,55);
assert.equal(scene.scene_revision,"scene-9e86635b");
assert.equal(scene.scene_revision,domain.revision(scene.layout));
assert.equal(scene.canonical_sha256,domain.model.canonical_sha256);
assert.equal(scene.canonical_sha256,"734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658");
assert.deepEqual(scene.layout.demolished,[]);
assert.equal(audit.scene_revision,scene.scene_revision);
const sha=createHash("sha256").update(raw).digest("hex");
const get=id=>{
 const f=scene.layout.furniture.find(f=>f.id===id);
 assert.ok(f,"Missing frozen furniture: "+id);return structuredClone(f);
};
const doors={};
for(const door of audit.appliances.doors){
 doors[door.id]=door;
 assert.equal(door.sweep.length,46);
}
const entryKitchenDoor=doors["OP-RECP-KIT"];
const serviceDoor=doors["OP-KIT-TERSVC"];
assert.ok(entryKitchenDoor&&serviceDoor);
const appliances={
 DW:get("K3-dishwasher"),
 washer:get("K3-laundry-niche"),
 fridge:get("starter-23"),
 oven_generic:{...get("starter-20"),w:600},
 oven_under_hob:{...get("starter-20"),w:600,cy:get("starter-22").cy},
};
assert.deepEqual([appliances.oven_generic.cx,appliances.oven_generic.cy,
 appliances.oven_under_hob.cx,appliances.oven_under_hob.cy],
 [9381,8038,9381,7895]);
const southNominalFace=8960.346-90;
const front=(f,projection_mm,width=f.w)=>{
 const a=f.rot*Math.PI/180;
 return rectangle({
  cx:f.cx-Math.sin(a)*(f.d/2+projection_mm/2),
  cy:f.cy+Math.cos(a)*(f.d/2+projection_mm/2),
  w:width,d:projection_mm,rot:f.rot
 });
};
const occupied=(f,doorProjection_mm,bodyWidth_mm=600,bodyDepth_mm=600)=>
 front({...f,d:f.d+2*doorProjection_mm},bodyDepth_mm,bodyWidth_mm);
const footprint=f=>rectangle(f);
const mx=poly=>Math.max(...poly.map(x=>x[1]));
const rel=(a,b)=>{
 const r=relation(a,b);
 return {gap_mm:round(r.gap_mm),
  overlap_area_mm2:round(r.overlap_area_mm2??0),
  positive_overlap:r.intersects_positive_area,
  touches:r.touches};
};
const hinge=(s,p)=>{const r=sweepRelation(s.sweep,p);return {
  min_gap_mm:round(r.min_gap_mm),any_intersection:r.any_intersection,
  positive_overlap_samples:r.positive_overlap_samples,
  samples:r.samples
};};
const profiles=[
 {id:"compact-assumption",p:{dw:500,washer:400,fridge:500,oven:400}},
 {id:"original-audit",p:{dw:600,washer:500,fridge:650,oven:500}},
 {id:"larger-assumption",p:{dw:700,washer:600,fridge:800,oven:600}},
];
function simulate(profile,bodyWidth,bodyDepth,ovenPos,topology){
 const oven=appliances[ovenPos];
 const dwDoor=front(appliances.DW,profile.p.dw),
  dwUser=occupied(appliances.DW,profile.p.dw,bodyWidth,bodyDepth);
 const washerDoor=front(appliances.washer,profile.p.washer),
  washerUser=occupied(appliances.washer,profile.p.washer,bodyWidth,bodyDepth);
 const fridgeDoor=front(appliances.fridge,profile.p.fridge),
  fridgeUser=occupied(appliances.fridge,profile.p.fridge,bodyWidth,bodyDepth);
 const ovenDoor=front(oven,profile.p.oven),
  ovenUser=occupied(oven,profile.p.oven,bodyWidth,bodyDepth);
 const kitchenDoorPresent=topology==="P0";
 const pairBodies={DW:dwUser,washer:washerUser,fridge:fridgeUser,oven:ovenUser};
 const pairwise=[];
 const keys=Object.keys(pairBodies);
 for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
  const a=keys[i],b=keys[j];
  const gap=rel(pairBodies[a],pairBodies[b]);
  pairwise.push({a,b,...gap,
   simultaneous_operator_screen:gap.positive_overlap?"PHYSICAL_PROXY_OVERLAP":
    gap.gap_mm<200?"LESS_THAN_200MM_POLYGON_GAP":"NO_POLYGON_OVERLAP_IN_MODEL"});
 }
 const fridgeSweep=kitchenDoorPresent?hinge(entryKitchenDoor,fridgeDoor):null;
 const fridgeUserSweep=kitchenDoorPresent?hinge(entryKitchenDoor,fridgeUser):null;
 return {
  id:[profile.id,bodyWidth,bodyDepth,ovenPos,topology].join("_"),
  assumption_id:profile.id,
  projection_mm:profile.p,
  nominal_user_mm:[bodyWidth,bodyDepth],
  oven_position:ovenPos,
  kitchen_topology:topology,
  source_kitchen_door_present:kitchenDoorPresent,
  DW:{open_panel_to_south_nominal_face_mm:round(southNominalFace-mx(dwDoor)),
      standing_user_to_south_nominal_face_mm:round(southNominalFace-mx(dwUser)),
      standing_user_service_door:hinge(serviceDoor,dwUser)},
  fridge:{open_panel_kitchen_door:fridgeSweep,standing_user_kitchen_door:fridgeUserSweep,
       note:"Refrigerator front is modeled as a rectangular assumed door projection, NOT its actual hinged sweep, handedness, handle or ventilation clearance."},
  washer:{open_panel_service_door:hinge(serviceDoor,washerDoor),
          standing_user_service_door:hinge(serviceDoor,washerUser)},
  oven:{open_panel_service_door:hinge(serviceDoor,ovenDoor),
        standing_user_service_door:hinge(serviceDoor,ovenUser)},
  operator_pairs:pairwise
 };
}
const samples=[];
for(const profile of profiles)
 for(const width of [500,600,700])
  for(const depth of [500,600,700])
   for(const oven of ["oven_generic","oven_under_hob"])
    for(const topology of ["P0","P1-CONDITIONAL"])
     samples.push(simulate(profile,width,depth,oven,topology));
assert.equal(samples.length,108);
const baseline=samples.find(s=>s.assumption_id==="original-audit"&&s.nominal_user_mm[0]===600&&s.nominal_user_mm[1]===600&&s.oven_position==="oven_generic"&&s.kitchen_topology==="P0");
const underHob=samples.find(s=>s.assumption_id==="original-audit"&&s.nominal_user_mm[0]===600&&s.nominal_user_mm[1]===600&&s.oven_position==="oven_under_hob"&&s.kitchen_topology==="P0");
const P1=samples.find(s=>s.assumption_id==="original-audit"&&s.nominal_user_mm[0]===600&&s.nominal_user_mm[1]===600&&s.oven_position==="oven_under_hob"&&s.kitchen_topology==="P1-CONDITIONAL");
assert.ok(baseline&&underHob&&P1);
approx(baseline.DW.open_panel_to_south_nominal_face_mm,972.3);
approx(baseline.DW.standing_user_to_south_nominal_face_mm,372.3);
assert.equal(baseline.oven.open_panel_service_door.positive_overlap_samples,13);
assert.equal(baseline.washer.standing_user_service_door.positive_overlap_samples,18);
assert.equal(baseline.fridge.open_panel_kitchen_door.any_intersection,true);
assert.equal(baseline.fridge.standing_user_kitchen_door.any_intersection,true);
approx(baseline.operator_pairs.find(x=>x.a==="washer"&&x.b==="oven").overlap_area_mm2,54000);
assert.equal(underHob.oven.open_panel_service_door.any_intersection,false);
assert.equal(P1.fridge.open_panel_kitchen_door,null);
assert.equal(P1.washer.standing_user_service_door.any_intersection,true);
const metrics={
 baseline:{
  dishwasher_behind_user_mm:baseline.DW.standing_user_to_south_nominal_face_mm,
  dishwasher_door_to_wall_mm:baseline.DW.open_panel_to_south_nominal_face_mm,
  fridge_kitchen_leaf_overlaps:baseline.fridge.open_panel_kitchen_door.positive_overlap_samples,
  fridge_user_kitchen_leaf_overlaps:baseline.fridge.standing_user_kitchen_door.positive_overlap_samples,
  washer_user_service_leaf_overlaps:baseline.washer.standing_user_service_door.positive_overlap_samples,
  oven_generic_service_leaf_overlaps:baseline.oven.open_panel_service_door.positive_overlap_samples,
  oven_washer_users_overlap_mm2:baseline.operator_pairs.find(x=>x.a==="washer"&&x.b==="oven").overlap_area_mm2
 },
 under_hob_nominal:{
  shifted_north_mm:143,
  oven_service_leaf_min_gap_mm:underHob.oven.open_panel_service_door.min_gap_mm,
  oven_service_leaf_overlaps:underHob.oven.open_panel_service_door.positive_overlap_samples,
  oven_washer_user_overlap_mm2:underHob.operator_pairs.find(x=>x.a==="washer"&&x.b==="oven").overlap_area_mm2,
  fridge_leaf_unchanged:underHob.fridge.open_panel_kitchen_door.any_intersection,
  washer_leaf_unchanged:underHob.washer.standing_user_service_door.any_intersection
 },
 P1_under_hob_nominal:{
  fridge_kitchen_leaf_removed_in_render_only_overlay:P1.fridge.open_panel_kitchen_door===null,
  washer_user_service_leaf_still_overlaps:P1.washer.standing_user_service_door.any_intersection,
  oven_occupants_vs_washer_still_overlap:P1.operator_pairs.find(x=>x.a==="washer"&&x.b==="oven").positive_overlap
 },
 assumptions:{
  source_wall_face_mm:southNominalFace,
  user:"Hypothetical plan rectangle, 500/600/700 mm wide by 500/600/700 mm deep; manufacturer kinematics and real person motion not simulated",
  opening_profiles:profiles,
  door_sampling:"Original canonical 46 leaf polygons at two-degree samples, not continuous handles/hinges",
  refrigerator:"Planar 500/650/800mm rectangular projection sensitivity, not an actual hinged appliance door",
  oven:"An assumed under-hob centre y=7895 vs generic counter centre y=8038, not an installed oven or revised hob",
  topology:"P1 hypothetical render-only overlay removes internal kitchen leaf/wall44; never approved demolition or revalidated escape/MEP",
  operator_metric:"Positive overlap = same sampled space occupied; 0mm could be touching rather than overlapping. 200mm is merely a warning threshold, not code.",
  not_measured:["finished wall thickness and field dimensions","appliance exact SKUs","fridge hinge side","fully open dishwasher baskets/racks","washing machine handling angle","service door handle and swing stop","ventilation/gas","hood duct/makeup air","heat and electric isolation","under counter oven manufacturers manual"]
 },
 verdict:{
  DO_NOW:"Preserve P0 source; work through appliance selection/manuals and full-size operating mockups before issuing joinery.",
  UNDER_HOB:"Promising *positioning* study of oven within source counter, not an appliance relocation or 2-person comfort fix.",
  P1:"Door conflict would disappear only in proposed P1 overlay; structural/services/odor/closure checks still block release.",
  NOT_SOLVED:"Dishwasher unloading bypass and washer/service door operating conflicts; oven/washer users still occupy overlapping rectangles.",
  operational_staging:"Use one-person-at-a-time at congested appliance/service doorway until a real product + family workflow test. Do not assume legal/safe egress from this operational suggestion."
 }
};
const report={
 schema:"TypeBKitchenOperatingEnvelope/1",status:"EXPLORATORY_MODEL_ONLY",
 source:{path:root+"/A-P0.json",sha256:sha,scene:scene.scene_revision,cloud_source:scene.source_scene_revision,storage_revision:55,canonical_sha256:scene.canonical_sha256},
 original_metrics:metrics,
 cases:samples
};
fs.writeFileSync(dest+"/KITCHEN_OPERATING_ENVELOPES.json",JSON.stringify(report,null,2)+"\n");

const colors={bg:"#f6f4f0",ink:"#333731",wall:"#636e67",appliance:"#bdc8c1",opening:"#dfc6a3",user:"#bd6661",doors:"#b78f49",stove:"#647c7e",washer:"#aaadb5",dw:"#9eb5b0"};
const xMin=8850,yMax=9300,scale=.135;
const panel=(dx,ovenKey,heading,note)=>{
 const xy=p=>[(p[0]-xMin)*scale+dx,(yMax-p[1])*scale+127];
 const poly=(p,fill,stroke,width=1,opacity=1)=>{
  const pts=p.map(k=>xy(k).map(n=>round(n)).join(",")).join(" ");
  return '<polygon points="'+pts+'" fill="'+fill+'" fill-opacity="'+opacity+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
 };
 const os=appliances[ovenKey];
 const src=Object.values(appliances).filter(f=>f.id);
 let body='<text x="'+dx+'" y="49" font-size="24" font-weight="650" fill="'+colors.ink+'">'+heading+'</text>'+
 '<text x="'+dx+'" y="75" font-size="13" fill="'+colors.ink+'">'+note+'</text>';
 const kit=domain.model.rooms.find(r=>r.id==="KIT-01");
 body+=poly(kit.poly,"#eeeee8",colors.wall,2,1);
 for(const f of scene.layout.furniture.filter(f=>f.room_id==="KIT-01"&&f.type!=="ksink"&&f.type!=="stove"))
  body+=poly(footprint(f),colors.appliance,colors.wall,.85,.8);
 for(const el of serviceDoor.sweep.filter((_,i)=>i%8===0))
  body+=poly(el,"none",colors.doors,.9,1);
 for(const el of entryKitchenDoor.sweep.filter((_,i)=>i%8===0))
  body+=poly(el,"none","#7c91a2",.9,1);
 for(const [name,obj,projection] of [["DW",appliances.DW,600],["Washer",appliances.washer,500],["Fridge",appliances.fridge,650],["Oven",os,500]]){
  body+=poly(front(obj,projection),"#e8c398",colors.doors,1,.42);
  body+=poly(occupied(obj,projection,600,600),colors.user,"#95413c",1,.32);
  const p=xy([obj.cx,obj.cy]);
  body+='<text x="'+round(p[0])+'" y="'+round(p[1])+'" font-size="11" text-anchor="middle" fill="#202823">'+name+'</text>';
 }
 const serviceHinge=xy(serviceDoor.hinge),kitHinge=xy(entryKitchenDoor.hinge);
 body+='<circle cx="'+round(serviceHinge[0])+'" cy="'+round(serviceHinge[1])+'" r="4" fill="'+colors.doors+'"/>'+
 '<circle cx="'+round(kitHinge[0])+'" cy="'+round(kitHinge[1])+'" r="4" fill="#7c91a2"/>';
 return body;
};
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1430" height="610" viewBox="0 0 1430 610">'+
 '<rect width="100%" height="100%" fill="'+colors.bg+'"/>'+
 '<g font-family="Arial,Helvetica,sans-serif">'+
 panel(85,"oven_generic","P0 · existing generic oven proxy","Counter centre y=8038 mm · oven/service-door overlap")+
 panel(770,"oven_under_hob","P0 · assumed oven below hob","Oven centre y=7895 mm · other users unchanged")+
 '<rect x="85" y="555" width="20" height="12" fill="'+colors.appliance+'"/><text x="112" y="567" font-size="13">Original kitchen units</text>'+
 '<rect x="315" y="555" width="20" height="12" fill="'+colors.opening+'"/><text x="342" y="567" font-size="13">Assumed open panel</text>'+
 '<rect x="560" y="555" width="20" height="12" fill="'+colors.user+'"/><text x="587" y="567" font-size="13">600×600mm user</text>'+
 '<path d="M800 561 L827 561" stroke="'+colors.doors+'" stroke-width="3"/><text x="833" y="567" font-size="13">Service door samples</text>'+
 '<text x="85" y="593" font-size="12" fill="'+colors.ink+'">Source-locked nominal plan coordinates. Not scaled site survey, manufacturer opening model, or construction approval.</text>'+
 '</g></svg>';
fs.writeFileSync(dest+"/KITCHEN_OPERATION_PLAN.svg",svg);
console.log(JSON.stringify({status:report.status,source_sha:sha,cases:samples.length,metrics,artifacts:[dest+"/KITCHEN_OPERATING_ENVELOPES.json",dest+"/KITCHEN_OPERATION_PLAN.svg"]},null,2));
