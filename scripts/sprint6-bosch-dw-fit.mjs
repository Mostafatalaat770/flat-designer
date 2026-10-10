/**
 * Source-locked Type B kitchen actual Bosch integrated-dishwasher dimensions.
 * 1D total-open depth -> 2D forward bounding rectangle is an ASSUMPTION,
 * never the complete manufacturer-hinge/rack installation model.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {rectangle,sweepRelation,relation} from "../studio/analysis/geometry.mjs";
const out="design-development/reception-sprint6";
fs.mkdirSync(out,{recursive:true});
const source="design-development/reception-sprint/A-P0.json";
const sourceBytes=fs.readFileSync(source),s=JSON.parse(sourceBytes);
const prev=JSON.parse(fs.readFileSync("design-development/reception-sprint/audit-proposed.json"));
const d=createApartmentDomain(process.cwd());
const canonical="734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658";
assert.equal(s.canonical_sha256,canonical);
assert.equal(d.model.canonical_sha256,canonical);
assert.equal(s.scene_revision,"scene-9e86635b");
assert.equal(d.revision(s.layout),s.scene_revision);
assert.equal(s.source_scene_revision,"scene-4821689");
assert.equal(s.storage_revision,55);
assert.deepEqual(s.layout.demolished,[]);
assert.equal(prev.scene_revision,s.scene_revision);
const sha=createHash("sha256").update(sourceBytes).digest("hex");
const n=s.layout.furniture.find(f=>f.id==="K3-dishwasher");
const door=prev.appliances.doors.find(f=>f.id==="OP-KIT-TERSVC");
assert.ok(n&&door);
assert.deepEqual([n.cx,n.cy,n.w,n.d,n.rot],[10581,6993,600,610,0]);
assert.equal(door.sweep.length,46);
const models=[
 {model:"SMV26DX00T",series:2,integrated:true,body_mm:[598,550,815],min_installed_niche_mm:[600,550,815],max_niche_height_mm:875,open_depth_90_mm:1150,egypt_price_egp:35999,place_settings:13,noise_dba:48,
  egypt:"https://www.bosch-home.com/eg/en/product/SMV26DX00T",spec:"https://media3.bsh-group.com/Documents/specsheet/ru-XB/SMV26DX00T.pdf",support:"https://www.bosch-home.co.uk/supportdetail/product/SMV26DX00T/49"},
 {model:"SMV4IMX62T",series:6,integrated:true,body_mm:[598,550,815],min_installed_niche_mm:[600,550,815],max_niche_height_mm:875,open_depth_90_mm:1150,egypt_price_egp:39999,place_settings:14,noise_dba:46,
  egypt:"https://www.bosch-home.com/eg/en/product/SMV4IMX62T",spec:"https://media3.bsh-group.com/Documents/specsheet/fr-MA/SMV4IMX62T.pdf",support:"https://www.bosch-home.co.uk/supportdetail/product/SMV4IMX62T/01"}
];
const align=[
 {id:"front-face",cy:n.cy+n.d/2-550/2,note:"Source front y=7298 retained"},
 {id:"original-centre",cy:n.cy,note:"Old object centre retained (just a sizing convention)"},
 {id:"rear-face",cy:n.cy-n.d/2+550/2,note:"Source back y=6688 retained"}
];
assert.deepEqual(align.map(a=>a.cy),[7023,6993,6963]);
const south=8960.346-90;
const poly=(f)=>rectangle(f);
const opened=(f,projection,width=f.w)=>{
 const a=f.rot*Math.PI/180;
 return rectangle({cx:f.cx-Math.sin(a)*(f.d/2+projection/2),cy:f.cy+Math.cos(a)*(f.d/2+projection/2),w:width,d:projection,rot:f.rot});
};
const user=(f,p,w,dep)=>opened({...f,d:f.d+2*p},dep,w);
const maxY=p=>Math.max(...p.map(x=>x[1]));
const r=v=>Math.round(v*10)/10;
const cases=[];
for(const m of models)for(const anchor of align)
 for(const bodyWidth of [500,600])for(const bodyDepth of [450,500,600,700]){
  const f={...n,cy:anchor.cy,w:m.body_mm[0],d:m.body_mm[1]};
  const doorProjection=m.open_depth_90_mm-m.body_mm[1];
  const doorPoly=opened(f,doorProjection);
  const userPoly=user(f,doorProjection,bodyWidth,bodyDepth);
  const ud=sweepRelation(door.sweep,userPoly);
  const dw=sweepRelation(door.sweep,doorPoly);
  cases.push({model:m.model,alignment:anchor.id,user_mm:[bodyWidth,bodyDepth],
   actual_body_mm:m.body_mm,assumed_forward_projection_mm:doorProjection,
   assumed_closed_front_y_mm:r(f.cy+f.d/2),
   assumed_fully_open_front_y_mm:r(maxY(doorPoly)),
   open_to_nominal_south_wall_mm:r(south-maxY(doorPoly)),
   occupied_to_nominal_south_wall_mm:r(south-maxY(userPoly)),
   service_door_user_sample_intersections:ud.positive_overlap_samples,
   service_door_open_bbox_sample_intersections:dw.positive_overlap_samples,
   service_door_user_min_gap_mm:r(ud.min_gap_mm),
   notes:"One-dimensional manufacturer 90deg depth bound, straight opening rectangle, not actual hinged door, rack, or site clearance"});
 }
assert.equal(cases.length,48);
const baseline=cases.find(x=>x.model==="SMV26DX00T"&&x.alignment==="front-face"&&x.user_mm[0]===600&&x.user_mm[1]===600);
assert.ok(baseline);
assert.equal(baseline.open_to_nominal_south_wall_mm,972.3);
assert.equal(baseline.occupied_to_nominal_south_wall_mm,372.3);
const at=a=>cases.find(x=>x.model==="SMV26DX00T"&&x.alignment===a&&x.user_mm[0]===600&&x.user_mm[1]===600).occupied_to_nominal_south_wall_mm;
assert.equal(at("original-centre"),402.3);
assert.equal(at("rear-face"),432.3);
const report={
 schema:"TypeBTrueIntegratedDWFit/1",status:"MODEL_EVIDENCE_ONLY_NOT_CONSTRUCTION_APPROVAL",
 source:{path:source,sha256:sha,scene_revision:s.scene_revision,cloud_source:s.source_scene_revision,storage_revision:55,canonical_sha256:canonical,
  nominal_outer_dw_mm:[n.w,n.d],original_front_y_mm:7298,original_rear_y_mm:6688},
 model_references:models,
 manufacturer_vs_source:{
  product_body_width_mm:598,min_real_installed_clear_niche_width_mm:600,model_nominal_box_width_mm:n.w,
  arithmetic_product_to_box_mm:2,actual_installed_clear_width_mm:null,actual_installed_clear_height_mm:null,
  risk:"A nominal 600mm EXTERIOR cabinet could have less than 600mm clear between its two side panels. A genuinely unobstructed 600mm slot between adjacent units might work. Measure first.",
  actual_eg_installer_drawing_verified:false,
  total_90deg_open_depth_mm:1150,actual_2d_hinge_kinematics_verified:false,
  actual_lower_basket_projection_verified:false
 },
 assumptions:{south_wall_nominal_inner_face_mm:south,
  alignments:align,person_widths_mm:[500,600],person_depths_mm:[450,500,600,700],
  source_layout_modified:false,source_door_sampling_count:46,
  not_a_code_compliant_clearance_or_site_survey:true},
 cases,nominal_front_align:baseline,
 comparison:{same_installation_geometry:true,series6_improves_operating_clearance:false,price_difference_egp:4000},
 holds:[
  {id:"SURVEY_APERTURE",state:"HOLD",detail:"Finished clear width >=600mm at three heights, height 815–875mm and depth >=550mm; cabinet sides/squareness/plinth/actual floor level"},
  {id:"MODEL_SPECIFIC_MANUAL",state:"HOLD",detail:"Egypt ENR suffix, exact installation template, furniture front weight, toe-kick and steam shield"},
  {id:"DOOR_AND_LOWER_RACK",state:"HOLD",detail:"Actual open-door angular mesh and extended lower rack plus operator and serving lane tested in 1:1 mockup"},
  {id:"SERVICE",state:"HOLD",detail:"Inlet/drain/power accessibility and approved local electrical/water services"},
  {id:"STRUCTURAL",state:"HOLD",detail:"P0 stays original; P1 wall44 still conditional render-only, no demolition approval"}
 ]
};
fs.writeFileSync(out+"/INTEGRATED_DW_INSTALLATION_SCREEN.json",JSON.stringify(report,null,2)+"\n");
const svgRows=align.map((a,i)=>{
 const current=cases.find(x=>x.model==="SMV26DX00T"&&x.alignment===a.id&&x.user_mm[0]===600&&x.user_mm[1]===600);
 const y=180+i*90;
 return '<text x="35" y="'+y+'" font-size="20">'+a.id+'</text>'+
 '<rect x="355" y="'+(y-21)+'" width="'+(r(current.open_to_nominal_south_wall_mm)/2)+'" height="20" fill="#a9c5bd"/>'+
 '<text x="370" y="'+(y-27)+'" font-size="15">Door gap '+current.open_to_nominal_south_wall_mm+' mm</text>'+
 '<rect x="355" y="'+(y+11)+'" width="'+(r(current.occupied_to_nominal_south_wall_mm)/2)+'" height="20" fill="#d7a38b"/>'+
 '<text x="370" y="'+(y+50)+'" font-size="15">Adult/wall model gap '+current.occupied_to_nominal_south_wall_mm+' mm</text>';
}).join("");
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="540" viewBox="0 0 1100 540"><rect width="100%" height="100%" fill="#f6f4f0"/><g font-family="Arial" fill="#26332c">'+
'<text x="35" y="52" font-size="27" font-weight="bold">Bosch Egypt fully integrated DW · identical geometry for both models</text>'+
'<text x="35" y="88" font-size="17">Body 598×550×815 | Niche min W600 | Depth OPEN 1150 mm | Operator 600×600</text>'+
'<text x="35" y="125" font-size="15">Unchanged P0 walls + three hypothetical appliance anchoring conventions</text>'+
 svgRows+
'<text x="35" y="492" font-size="14">Green = gap after opened-door forward bound. Terracotta = after assumed adult. All are model polygons, not finished site widths.</text>'+
'<text x="35" y="518" font-size="14">No manufacturer hinge/rack dynamics, no built-in cutout signed off, no approved kitchen door change.</text></g></svg>';
fs.writeFileSync(out+"/DW_SOURCE_ALIGNMENT_COMPARISON.svg",svg);
console.log(JSON.stringify({samples:cases.length,manufacturer_count:models.length,nominal_occupied_mm:baseline.occupied_to_nominal_south_wall_mm,other_positions:[at("original-centre"),at("rear-face")],sha},null,2));
