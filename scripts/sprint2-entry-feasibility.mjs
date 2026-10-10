/**
 * Sprint 2: source-locked, RESEARCH-ONLY arrival/dining conflict sensitivity.
 * This script does not save a cloud scene, modify architecture or overwrite Sprint 1.
 * Measurements are from exact model geometries and explicit assumed human-use envelopes.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createApartmentDomain } from "../studio/domain/apartment.mjs";
import { rectangle, relation, sweepRelation } from "../studio/analysis/geometry.mjs";
import { CHAIR_IDS } from "../studio/analysis/reception-sprint.mjs";

const root = "design-development/reception-sprint";
const out = "design-development/reception-sprint2";
fs.mkdirSync(out, {recursive:true});
const bytes=fs.readFileSync(root+"/A-P0.json");
const original=JSON.parse(bytes);
const oldAudit=JSON.parse(fs.readFileSync(root+"/audit-proposed.json"));
const domain=createApartmentDomain(process.cwd());
assert.equal(original.canonical_sha256, domain.model.canonical_sha256);
assert.equal(original.source_scene_revision, "scene-4821689");
assert.equal(original.storage_revision,55);
assert.equal(original.architecture_variant,undefined);
assert.equal(oldAudit.scene_revision,original.scene_revision);
assert.equal(original.layout.demolished.length,0);
const inputSha=createHash("sha256").update(bytes).digest("hex");
const round=(v)=>Math.round(v*10)/10;
const clone=(v)=>structuredClone(v);
const get=(s,id)=>{
 const f=s.layout.furniture.find(x=>x.id===id);
 assert.ok(f,"Missing "+id);return f;
};
const offsetPoly=(pg,y)=>pg.map(p=>[p[0],p[1]+y]);
const nearest=(poly,others)=>Math.min(...others.map(p=>relation(poly,p).gap_mm));
const cabinetUser=(x,y,w,d,rot)=>{
 const theta=rot*Math.PI/180;
 const dExpanded=d+400; // source audit assumes 200mm tilt deployment
 const proj=600;
 return rectangle({
  cx:x-Math.sin(theta)*(dExpanded/2+proj/2),
  cy:y+Math.cos(theta)*(dExpanded/2+proj/2),
  w:600,d:600,rot
 });
};
const state=oldAudit.chairStates.find(c=>c.pullback_mm===450);
assert.equal(state.chairs.length,6);
const oldShoeUser=oldAudit.entry.shoeUser;
const doorSweep=oldAudit.entry.door.sweep;
const baseBuffetOpen=oldAudit.buffet.open;
const shifts=[0,-100,-150,-200,-250,-300];
const buffetShifts=[0,-100,-200];
const experiments=[];
for(const dy of shifts){
 for(const by of buffetShifts){
  const scene=clone(original);
  get(scene,"starter-35").cy +=dy;
  for(const id of CHAIR_IDS)get(scene,id).cy+=dy;
  scene.layout.interior.objects.find(x=>x.id==="A-dining-sideboard").cy+=by;
  // Intentionally DO NOT generate render snapshots: wall art/lamp alignment, light,
  // dining-to-living perception, buffet/plant use require a separate design review.
  const chairs=state.chairs.map(c=>rectangle({...c,cy:c.cy+dy}));
  const shoeUserGap=nearest(oldShoeUser,chairs);
  const buffetGap=nearest(offsetPoly(baseBuffetOpen,by),chairs);
  // The production validator intentionally throws on a hard placement FAIL.
  // This is a feasibility matrix: preserve and report rejected candidates instead
  // of crashing and hiding their precise model failures.
  let checks;
  try { checks=domain.validate(scene.layout).checks; }
  catch(error) {
    if (!error.validation?.checks) throw error;
    checks=error.validation.checks;
  }
  const failures=checks.filter(x=>x.status==="FAIL");
  experiments.push({
    dining_shift_mm:dy,
    buffet_shift_mm:by,
    shoe_user_to_nearest_chair_mm:round(shoeUserGap),
    open_buffet_to_nearest_chair_mm:round(buffetGap),
    domain_hard_failures:failures.map(x=>({
      code:x.kind||x.code||x.id||"FAIL",
      object_id:x.object_id||null,
      measured_clearance_mm:x.measured_clearance_mm??null,
      detail:x.message||x.description||"Check failed"
    })),
    caution:"2D model minimum distance between chosen polygons, not a human bypass width or approved furniture relocation."
  });
 }
}
const floor=8800,eastFace=16035.418-90,southFace=10231.317-90;
const eastTrials=[];
for(const x of [15750,15770,15790,15800]){
 for(const y of [9200,9300,9400,9500,9600,9700,9750]){
  const footprint=rectangle({cx:x,cy:y,w:700,d:240,rot:90});
  const xs=footprint.map(p=>p[0]),ys=footprint.map(p=>p[1]);
  const inside=Math.max(...xs)<=eastFace&&Math.max(...ys)<=southFace&&Math.min(...ys)>=floor;
  if(!inside)continue;
  const user=cabinetUser(x,y,700,240,90);
  const door=sweepRelation(doorSweep,user);
  const gap=nearest(user,state.chairs.map(f=>rectangle(f)));
  eastTrials.push({
   cabinet_centre_mm:[x,y],assumed_size_mm:[700,240],rot_deg:90,
   user_vs_door_sweep:door,
   user_to_chair_mm:round(gap),
   nominal_box_inside_entry_wall_face:true,
   feasible_simultaneous_use:!door.any_intersection&&gap>=500,
  });
 }
}
const report={
 schema:"ReceptionSprint2EntrySensitivity/1",
 status:"EXPLORATORY_ANALYSIS_ONLY",
 input:{file:root+"/A-P0.json",sha256:inputSha,scene:original.scene_revision,
  canonical_sha256:original.canonical_sha256,cloud_scene:original.source_scene_revision,cloud_revision:55},
 assumptions:{
  chair_state:"+450mm all six chairs; captured 510x530mm model chair envelopes",
  shoe_user:"600x600mm nominal proxy, 200mm tilt projection",
  door:"original main door 40mm leaf, 46 discrete 2-degree samples (not continuous kinematics)",
  buffet:"500mm open-front proxy",
  shifts:"rigid dining set y shift; optional buffet y shift, without adapting art/light/plant",
  room_faces:"assumed nominal inner wall faces at 90mm from canonical model axes",
  limitations:["does not recompute routes for hypothetical shifts","not a walk-through or installed passage certificate",
   "potential further conflicts with wall art, floor lamp, terrace paths and living composition require rendering and domain/owner review",
   "no shoe inventory, real tilt hardware, finished dimensions or vendor drawings"]
 },
 originals:{
  shoe_user_to_chair_mm:oldAudit.chairStates.at(-1).shoe_user_to_nearest_chair.gap_mm,
  open_buffet_to_chair_mm:oldAudit.chairStates.at(-1).buffet_open_to_nearest_chair.gap_mm,
  entry_door_to_shoe_user_min_gap_mm:oldAudit.entry.shoe_user_sweep.min_gap_mm,
  entry_storage_upper_bound_l:oldAudit.storage.find(x=>x.id==="entry").upper_bound_litres
 },
 dining_shift_sensitivity:experiments,
 east_wall_shoe_trials:{n_tested:eastTrials.length,
  n_simultaneously_feasible:eastTrials.filter(x=>x.feasible_simultaneous_use).length,trials:eastTrials},
 verdict:{
  keep:"Option A as lead design direction; current entry layout as provisional source-safe concept only",
  revise:"Do not claim that moving the full dining set north resolves simultaneous shoe use or passage; model a real shoe mechanism and occupied human bypass before furniture freeze",
  note:"Even a 300mm northward dining shift yields only a 315mm model gap to the operating shoe user when all chairs are withdrawn 450mm; it also shifts the conflict towards buffet/living. It is not a usable passing lane.",
  site_holds:["full-scale six occupied chairs and entrance mockup",
   "6+ shoe pairs actual inventory and adult shoe sizes",
   "manufacturer hinges/tilt projection, anchor and exact installation tolerances",
   "kitchen DW/washer/fridge/oven multi-user conflicts from Sprint 1",
   "wall 44 structural/developer/gas/ventilation permission if P1 preferred"],
  next:"Develop actual alternative furniture/door operating sequences and matched visual options; do NOT silently change saved source."
 }
};
fs.writeFileSync(out+"/ENTRY_SENSITIVITY.json",JSON.stringify(report,null,2)+"\n");
// Visual report: not an architectural floor plan, and no fictitious furniture source.
const height=430,width=980,margin=70;
const bar=shifts.map((dy,i)=>{
 const row=experiments.find(r=>r.dining_shift_mm===dy&&r.buffet_shift_mm===0);
 const col=i%2?"#718071":"#9F8872";
 const w1=Math.min(650,row.shoe_user_to_nearest_chair_mm);
 const w2=Math.min(650,row.open_buffet_to_nearest_chair_mm);
 const y=88+i*53;
 return '<text x="28" y="'+(y+14)+'" font-size="16" fill="#34332e">'+dy+'mm</text>'+
 '<rect x="'+margin+'" y="'+y+'" width="'+w1+'" height="13" rx="4" fill="'+col+'"/>'+
 '<rect x="'+margin+'" y="'+(y+17)+'" width="'+w2+'" height="13" rx="4" fill="#bfc7c2"/>'+
 '<text x="'+(margin+w1+6)+'" y="'+(y+12)+'" font-size="12">'+row.shoe_user_to_nearest_chair_mm+'</text>'+
 '<text x="'+(margin+w2+6)+'" y="'+(y+29)+'" font-size="12">'+row.open_buffet_to_nearest_chair_mm+'</text>';
}).join("\n");
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'">'+
'<rect width="100%" height="100%" fill="#f7f5f1"/><text x="28" y="32" fill="#282925" font-family="sans-serif" font-size="22" font-weight="600">Dining shift sensitivity · model gaps only</text>'+
'<text x="28" y="57" fill="#5a5954" font-family="sans-serif" font-size="13">All six chairs withdrawn +450mm; buffet remains fixed; numbers are mm, not passage widths</text>'+
'<g font-family="sans-serif">'+bar+'</g><text x="28" y="416" fill="#5a5954" font-family="sans-serif" font-size="12">Brown = shoe user → chair  |  Gray = open buffet → chair  |  Pending full-size mockup</text></svg>';
fs.writeFileSync(out+"/ENTRY_SENSITIVITY.svg",svg);
console.log(JSON.stringify({sha256:inputSha,experiment_count:experiments.length,
 east_trials:eastTrials.length,east_pass:eastTrials.filter(x=>x.feasible_simultaneous_use).length,
 base:{shoe:report.originals.shoe_user_to_chair_mm,buffet:report.originals.open_buffet_to_chair_mm},
 candidate300:experiments.find(x=>x.dining_shift_mm===-300&&x.buffet_shift_mm===0)},null,2));
