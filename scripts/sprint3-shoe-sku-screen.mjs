/**
 * Sprint 3 — source-locked supplier-dimension sensitivity (NOT procurement approval).
 * Product dimensions/capacity sourced from IKEA Egypt, retrieved 2026-10-10.
 * Hinge opening projection and user envelopes are assumptions, not product drawings.
 * No canonical walls, source snapshots, geometry or Site storage are modified.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {rectangle, relation, sweepRelation} from "../studio/analysis/geometry.mjs";
import {CHAIR_IDS} from "../studio/analysis/reception-sprint.mjs";

const root="design-development/reception-sprint";
const dest="design-development/reception-sprint3";
fs.mkdirSync(dest,{recursive:true});
const bytes=fs.readFileSync(root+"/A-P0.json");
const snapshot=JSON.parse(bytes);
const audit=JSON.parse(fs.readFileSync(root+"/audit-proposed.json","utf8"));
const domain=createApartmentDomain(process.cwd());
assert.equal(snapshot.canonical_sha256,domain.model.canonical_sha256);
assert.equal(snapshot.source_scene_revision,"scene-4821689");
assert.equal(snapshot.scene_revision,"scene-9e86635b");
assert.equal(audit.scene_revision,snapshot.scene_revision);
assert.equal(snapshot.storage_revision,55);
assert.deepEqual(snapshot.layout.demolished,[]);
const sourceSha=createHash("sha256").update(bytes).digest("hex");
const round=v=>Math.round(v*10)/10;
const shoes=snapshot.layout.furniture.find(f=>f.id==="starter-40");
const table=snapshot.layout.furniture.find(f=>f.id==="starter-35");
assert.ok(shoes&&table);
assert.deepEqual([shoes.w,shoes.d,shoes.cx,shoes.cy,shoes.rot],[700,240,15560,10000,180]);
const chairPull=450;
const chairs=CHAIR_IDS.map(id=>{
 const chair=snapshot.layout.furniture.find(f=>f.id===id);
 assert.ok(chair,"missing chair "+id);
 return rectangle({...chair,cy:chair.cy+(chair.cy<table.cy?-chairPull:chairPull)});
});
assert.equal(chairs.length,6);
const door=audit.entry.door.sweep;
assert.equal(door.length,46);
const eastInnerFace=16035.418-90;
const southInnerFace=10231.317-90;
const products=[
 {id:"CURRENT_CUSTOM",name:"Sprint 1 custom placeholder",width_mm:700,depth_mm:240,height_mm:1000,
  nominal_pairs:6,pairs_evidence:"UNVERIFIED_GOAL",url:null,
  caveat:"Not a manufacturable SKU; three-tier/200mm swing invented in original design."},
 {id:"TRONES_2",name:"IKEA Egypt TRONES 2-module pack, stacked",width_mm:520,depth_mm:180,height_mm:780,
  nominal_pairs:4,pairs_evidence:"MANUFACTURER_APPROX_2_PACK",url:"https://www.ikea.com/eg/en/p/trones-shoe-cabinet-storage-white-00397307/",
  caveat:"Approx four pairs per TWO-module pack; requires wall fixing. Opening geometry unknown."},
 {id:"TRONES_3",name:"IKEA Egypt TRONES 3 units stacked (not an IKEA pack)",width_mm:520,depth_mm:180,height_mm:1170,
  nominal_pairs:6,pairs_evidence:"EXTRAPOLATION_NOT_MANUFACTURER_RATING",url:"https://www.ikea.com/eg/en/p/trones-shoe-cabinet-storage-white-00397307/",
  caveat:"Three stacked units extrapolate capacity; may conflict with saved mirror/upper height, wall fixing and access."},
 {id:"BISSA_2",name:"IKEA Egypt BISSA 2-compartment",width_mm:490,depth_mm:280,height_mm:930,
  nominal_pairs:8,pairs_evidence:"MANUFACTURER_APPROX",url:"https://www.ikea.com/eg/en/p/bissa-shoe-cabinet-with-2-compartments-white-70530256/",
  caveat:"Full-size door-opening and handle projection unavailable; this is only bounding-box screening."}
];
function frontZone(f,depth,width=f.w){
 const a=f.rot*Math.PI/180;
 return rectangle({cx:f.cx-Math.sin(a)*(f.d/2+depth/2),
 cy:f.cy+Math.cos(a)*(f.d/2+depth/2),w:width,d:depth,rot:f.rot});
}
function operatingUser(f,opening,bodyWidth){
 // Copy existing audit approximation: open-front projection changes standing distance.
 // This tests conservative forward-facing operation, NOT real tilt-door kinematics.
 return frontZone({...f,d:f.d+2*opening},600,bodyWidth);
}
function gapToChairs(poly){
 return Math.min(...chairs.map(p=>relation(poly,p).gap_mm));
}
function validationFor(f){
 const scene=structuredClone(snapshot);
 const target=scene.layout.furniture.find(o=>o.id==="starter-40");
 Object.assign(target,{cx:f.cx,cy:f.cy,w:f.w,d:f.d,rot:f.rot});
 try{return domain.validate(scene.layout).checks.filter(x=>x.status==="FAIL").map(x=>({kind:x.kind,object_id:x.object_id??null,message:x.message??""}));}
 catch(e){if(!e.validation?.checks)throw e;
 return e.validation.checks.filter(x=>x.status==="FAIL").map(x=>({kind:x.kind,object_id:x.object_id??null,message:x.message??""}));}
}
const positions=[[15560,10000],...[15480,15520,15560,15600].flatMap(x=>[9900,9940,9980,10020].map(y=>[x,y]))];
const uniquePositions=[...new Map(positions.map(p=>[p.join(":"),p])).values()];
const rows=[];
const openProjections=[100,200,300,400]; // sensitivity only; vendor drawings MUST replace
const bodyWidths=[500,600]; // sensitivity only, 600 matches Sprint 1 assumption
for(const product of products){
 for(const [cx,cy] of uniquePositions){
  const f={cx,cy,w:product.width_mm,d:product.depth_mm,rot:180};
  const fp=rectangle(f);
  const pts=fp.map(([x,y])=>({x,y}));
  const inside=pts.every(p=>p.x<=eastInnerFace&&p.y<=southInnerFace);
  const failures=validationFor(f);
  for(const projection of openProjections){
   const panel=frontZone(f,projection),panelDoor=sweepRelation(door,panel);
   for(const bodyWidth of bodyWidths){
    const user=operatingUser(f,projection,bodyWidth);
    const userDoor=sweepRelation(door,user);
    const gap=gapToChairs(user);
    const assumedPass=inside&&!failures.length&&!panelDoor.any_intersection&&!userDoor.any_intersection&&gap>=500;
    rows.push({
     product_id:product.id,at_mm:[cx,cy],opening_projection_mm:projection,body_width_mm:bodyWidth,
     footprint_inside_nominal_east_south_faces:inside,
     layout_hard_failures:failures,
     door_intersects_open_panel:panelDoor.any_intersection,
     door_intersects_operating_user:userDoor.any_intersection,
     main_door_user_sampled_gap_mm:round(userDoor.min_gap_mm),
     occupied_shoe_user_to_six_chairs_mm:round(gap),
     hypothetical_500mm_screen_pass:assumedPass,
     caveat:"Passing this screen is not verified entry/bypass, emergency egress, real hinge, stock or build approval."
    });
   }
  }
 }
}
const current=rows.find(r=>r.product_id==="CURRENT_CUSTOM"&&r.at_mm[0]===15560&&r.at_mm[1]===10000&&r.opening_projection_mm===200&&r.body_width_mm===600);
assert.ok(current);
assert.equal(current.occupied_shoe_user_to_six_chairs_mm,15,"Regress against Sprint 1 entry conflict");
const productSummaries=products.map(p=>{
 const candidates=rows.filter(r=>r.product_id===p.id);
 const atSource=candidates.filter(r=>r.at_mm[0]===15560&&r.at_mm[1]===10000&&r.body_width_mm===600);
 const source200=atSource.find(r=>r.opening_projection_mm===200);
 const feasible=candidates.filter(r=>r.hypothetical_500mm_screen_pass);
 return {...p,
  trials:candidates.length,
  hypothesis_pass_count:feasible.length,
  original_position_open200_body600:source200,
  best_model_screen:feasible.slice(0,4).map(q=>({at_mm:q.at_mm,opening_projection_mm:q.opening_projection_mm,body_width_mm:q.body_width_mm,chair_gap_mm:q.occupied_shoe_user_to_six_chairs_mm})),
 };
});
const report={
 schema:"TypeBSupplierShoeEvidence/1",status:"EXPLORATORY_MODEL_ONLY",
 source:{file:root+"/A-P0.json",sha256:sourceSha,scene:snapshot.scene_revision,
 cloud_scene:snapshot.source_scene_revision,storage_revision:55,canonical_sha256:snapshot.canonical_sha256},
 product_sources_retrieved:"2026-10-10",
 assumptions:{installed_sizes:"Product page outside dimensions, 3-stack TRONES height extrapolated",opener_projections_mm:openProjections,
  person_widths_mm:bodyWidths,person_depth_mm:600,chairs:"All six original chairs at +450mm pullback",
  door:"Existing 46-point 2deg sampled main door leaf",gap_screen_mm:500,
  why_not_certified:["IKEA sites do NOT publish the actual open-bin projection in these sources",
   "an assumed person rectangle cannot prove safe access, safe doorway passage or usable chair withdrawal",
   "source coordinates/image scaling are not measured finished wall faces",
   "entry mirror clashes / vertical fitting are not simulated by 2D rectangle code",
   "actual pair counts depend on household shoe size and configuration",
   "no verified current shoe-stock, wall anchor/substrate or fire egress compliance"]},
 products:productSummaries,
 baseline_source_proxy:{shoe_user_to_six_chairs_mm:current.occupied_shoe_user_to_six_chairs_mm,
  door_panel_intersects:current.door_intersects_open_panel,door_user_intersects:current.door_intersects_operating_user},
 all_trials:rows,
 next_action:"Physically mock up 520x180 TRONES two-module configuration vs the 490x280 BISSA; trial with real doors/shoes and six chairs. If no 500mm bypass can be demonstrated, accept one-person-at-a-time entry shoe use and provide verified reserve shoe storage outside reception; do not claim 6+ pairs in an unverified custom unit."
};
fs.writeFileSync(dest+"/SKU_SCREEN.json",JSON.stringify(report,null,2)+"\n");
const tableRows=productSummaries.map(s=>{
 const r=s.original_position_open200_body600;
 return '<tr><td>'+s.id+'</td><td>'+s.width_mm+'×'+s.depth_mm+'×'+s.height_mm+'</td><td>'+s.nominal_pairs+'</td><td>'+r.occupied_shoe_user_to_six_chairs_mm+'</td><td>'+(r.door_intersects_operating_user?"YES":"no")+'</td><td>'+s.hypothesis_pass_count+'/'+s.trials+'</td></tr>';
}).join("");
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1150" height="410" viewBox="0 0 1150 410">'+
'<rect width="100%" height="100%" fill="#f7f5f1"/><text x="32" y="50" font-size="24" font-family="Arial" fill="#282925">Entry shoe cabinets · real SKU dimensions / assumed openings</text>'+
'<text x="32" y="80" font-size="15" font-family="Arial" fill="#605c54">Same coordinates as Sprint 1. Open projection 200mm, 600mm user; six chairs +450mm (all model gaps).</text>'+
'<foreignObject x="32" y="105" width="1080" height="245"><div xmlns="http://www.w3.org/1999/xhtml" style="font:15px Arial;color:#232323"><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#e3ddd1"><th>Candidate</th><th>Width×depth×height mm</th><th>Pair estimate</th><th>Chair gap mm</th><th>Door/user hit</th><th>Screen passes</th></tr></thead><tbody>'+tableRows+'</tbody></table></div></foreignObject>'+
'<text x="32" y="380" font-size="13" font-family="Arial" fill="#605c54">NOT a supplier installation drawing; screen passes are parametric hints, not physical sign-off.</text></svg>';
fs.writeFileSync(dest+"/SKU_SCREEN.svg",svg);
console.log(JSON.stringify({source:sourceSha,products:productSummaries.map(p=>({id:p.id,nominal_pairs:p.nominal_pairs,pass:p.hypothesis_pass_count,base_200_chair_gap:p.original_position_open200_body600.occupied_shoe_user_to_six_chairs_mm,base_200_door_user:p.original_position_open200_body600.door_intersects_operating_user})),trials:rows.length}));
